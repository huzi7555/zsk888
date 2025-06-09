import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// 图片保存配置
const IMAGE_SAVE_DIR = './public/images/feishu';
const IMAGE_URL_PREFIX = '/images/feishu';

// 支持的图片格式
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

// 生成唯一的文件名
function generateUniqueFileName(originalUrl: string, contentType: string): string {
  const hash = crypto.createHash('md5').update(originalUrl + Date.now()).digest('hex');
  const extension = getFileExtension(contentType);
  return `${hash}${extension}`;
}

// 根据Content-Type获取文件扩展名
function getFileExtension(contentType: string): string {
  const typeMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png', 
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
  };
  return typeMap[contentType] || '.jpg';
}

// 确保目录存在
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`📁 创建目录: ${dirPath}`);
  }
}

// 下载并保存图片到本地
export async function downloadAndSaveImage(
  imageUrl: string, 
  documentId: string,
  token?: string
): Promise<string | null> {
  try {
    console.log(`📥 开始下载图片: ${imageUrl}`);

    // 确保保存目录存在
    await ensureDirectoryExists(IMAGE_SAVE_DIR);

    // 构建请求头
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    // 下载图片
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`❌ 图片下载失败: ${response.status} ${response.statusText}`);
      return null;
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';

    // 验证是否为支持的图片格式
    if (!SUPPORTED_IMAGE_TYPES.includes(contentType)) {
      console.warn(`⚠️ 不支持的图片格式: ${contentType}`);
      return null;
    }

    // 生成文件名
    const fileName = generateUniqueFileName(imageUrl, contentType);
    const filePath = path.join(IMAGE_SAVE_DIR, fileName);

    // 保存文件
    await fs.writeFile(filePath, Buffer.from(imageBuffer));

    const localUrl = `${IMAGE_URL_PREFIX}/${fileName}`;
    const fileSize = imageBuffer.byteLength;

    console.log(`✅ 图片保存成功: ${localUrl} (${fileSize} 字节)`);

    return localUrl;

  } catch (error) {
    console.error('❌ 图片下载保存失败:', error);
    return null;
  }
}

// 生成代理图片URL
export function generateProxyImageUrl(originalUrl: string, token?: string): string {
  const baseUrl = '/api/proxy-image';
  const params = new URLSearchParams({ url: originalUrl });
  
  if (token) {
    params.append('token', token);
  }

  return `${baseUrl}?${params.toString()}`;
}

// 批量下载图片
export async function batchDownloadImages(
  imageUrls: string[],
  documentId: string,
  token?: string
): Promise<Array<{ originalUrl: string; localUrl: string | null; proxyUrl: string }>> {
  const results = [];

  for (const imageUrl of imageUrls) {
    try {
      // 尝试下载并保存
      const localUrl = await downloadAndSaveImage(imageUrl, documentId, token);
      
      // 生成代理URL作为备用
      const proxyUrl = generateProxyImageUrl(imageUrl, token);

      results.push({
        originalUrl: imageUrl,
        localUrl,
        proxyUrl,
      });

      console.log(`🖼️ 图片处理完成: ${imageUrl} -> 本地:${localUrl ? '✅' : '❌'} 代理:✅`);

      // 添加延迟避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ 处理图片失败: ${imageUrl}`, error);
      
      // 即使下载失败，也提供代理URL
      const proxyUrl = generateProxyImageUrl(imageUrl, token);
      results.push({
        originalUrl: imageUrl,
        localUrl: null,
        proxyUrl,
      });
    }
  }

  return results;
}

// 清理过期图片文件（可选）
export async function cleanOldImages(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  try {
    const files = await fs.readdir(IMAGE_SAVE_DIR);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(IMAGE_SAVE_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log(`🗑️ 清理过期图片: ${file}`);
      }
    }
  } catch (error) {
    console.error('❌ 清理图片失败:', error);
  }
} 