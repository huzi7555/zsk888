import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { request as rawRequest } from "undici";
import { unzipSync, strFromU8 } from 'fflate';
import { downloadAndSaveImage, generateProxyImageUrl } from '../../utils/imageHandler';
import fs from 'fs/promises';

// 标记这个路由为动态，禁用静态生成
export const dynamic = 'force-dynamic';

// 飞书API配置
const FEISHU_CONFIG = {
  app_id: process.env.FEISHU_APP_ID || "",
  app_secret: process.env.FEISHU_APP_SECRET || "",
  base_url: "https://open.feishu.cn/open-apis",
};

// 文档类型枚举
type DocKind = 'docx' | 'docs';

// 定义飞书API返回的数据类型
interface FeishuBlock {
  block_id?: string;
  block_type?: number;
  parent_id?: string;
  children?: FeishuBlock[];
  text?: {
    elements?: Array<{
      text_run?: {
        content?: string;
        text_element_style?: {
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          strike?: boolean;
          link?: {
            url?: string;
          };
        };
      };
    }>;
  };
  heading1?: {
    elements?: Array<{
      text_run?: {
        content?: string;
        text_element_style?: {
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          strike?: boolean;
          link?: {
            url?: string;
          };
        };
      };
    }>;
  };
  heading2?: {
    elements?: Array<{
      text_run?: {
        content?: string;
        text_element_style?: {
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          strike?: boolean;
          link?: {
            url?: string;
          };
        };
      };
    }>;
  };
  heading3?: {
    elements?: Array<{
      text_run?: {
        content?: string;
        text_element_style?: {
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          strike?: boolean;
          link?: {
            url?: string;
          };
        };
      };
    }>;
  };
  heading4?: {
    elements?: Array<{
      text_run?: {
        content?: string;
        text_element_style?: {
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          strike?: boolean;
          link?: {
            url?: string;
          };
        };
      };
    }>;
  };
  heading5?: {
    elements?: Array<{
      text_run?: {
        content?: string;
        text_element_style?: {
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          strike?: boolean;
          link?: {
            url?: string;
          };
        };
      };
    }>;
  };
  heading6?: {
    elements?: Array<{
      text_run?: {
        content?: string;
        text_element_style?: {
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          strike?: boolean;
          link?: {
            url?: string;
          };
        };
      };
    }>;
  };
  bullet?: {
    elements?: Array<{
      text_run?: {
        content?: string;
        text_element_style?: {
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          strike?: boolean;
          link?: {
            url?: string;
          };
        };
      };
    }>;
  };
  ordered?: {
    elements?: Array<{
      text_run?: {
        content?: string;
        text_element_style?: {
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          strike?: boolean;
          link?: {
            url?: string;
          };
        };
      };
    }>;
  };
  code?: {
    language?: string;
    elements?: Array<{
      text_run?: {
        content?: string;
        text_element_style?: {
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          strike?: boolean;
          link?: {
            url?: string;
          };
        };
      };
    }>;
  };
  callout?: {
    emoji_id?: string;
    background_color?: number;
    border_color?: number;
    elements?: Array<{
      text_run?: {
        content?: string;
        text_element_style?: {
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          strike?: boolean;
          link?: {
            url?: string;
          };
        };
      };
    }>;
  };
  toggle?: {
    elements?: Array<{
      text_run?: {
        content?: string;
        text_element_style?: {
          bold?: boolean;
          italic?: boolean;
          underline?: boolean;
          strike?: boolean;
          link?: {
            url?: string;
          };
        };
      };
    }>;
    rich_text?: Array<{
      content?: string;
      style?: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strike?: boolean;
        link?: {
          url?: string;
        };
      };
    }>;
  };
  grid_column?: {
    width_ratio?: number;
  };
  table_cell?: {
    elements?: Array<{
      text_run?: {
        content?: string;
      };
    }>;
  };
  image?: {
    token?: string;
    file_token?: string;
    src?: string;
    width?: number;
    height?: number;
  };
  file?: {
    token?: string;
    file_token?: string;
    name?: string;
    size?: number;
  };
}

interface TmpDownloadUrl {
  file_token: string;
  tmp_download_url: string;
}

// 获取飞书访问凭证
async function getFeishuAccessToken(): Promise<string> {
  try {
    const response = await fetch(
      `${FEISHU_CONFIG.base_url}/auth/v3/tenant_access_token/internal`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          app_id: FEISHU_CONFIG.app_id,
          app_secret: FEISHU_CONFIG.app_secret,
        }),
      },
    );
    
    const data = await response.json();
    
    console.log("🔑 Token响应:", JSON.stringify(data, null, 2));
    
    if (!data.tenant_access_token) {
      throw new Error(`获取飞书Token失败: ${data.msg}`);
    }
    
    return `Bearer ${data.tenant_access_token}`;
  } catch (error) {
    console.error("获取Token时出错:", error);
    throw error;
  }
}

// 解析飞书链接
function parseFeishuLink(url: string): { kind: string; token: string } | null {
  try {
    // 提取文档ID
    let docId: string | null = null;
    let docType: string = "";
    
    // 检查是否为飞书/Lark URL
    if (!url.includes("feishu.cn") && !url.includes("larksuite.com")) {
      console.log("❌ 非飞书链接");
      return null;
    }
    
    // 解析URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    console.log("📄 提取的文档路径:", pathname);
    
    // 根据路径格式确定文档类型和ID
    if (pathname.includes("/docs/")) {
      // 老版本文档格式 docs
      docType = "docs";
      
      // 提取文档ID
      const match = pathname.match(/\/docs\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        docId = match[1];
      }
    } else if (pathname.includes("/docx/")) {
      // 新版本文档格式 docx
      docType = "docx";
      
      // 提取文档ID
      const match = pathname.match(/\/docx\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        docId = match[1];
      }
    } else if (pathname.includes("/wiki/")) {
      // 知识库文档
      docType = "wiki";
      
      // 提取文档ID
      const match = pathname.match(/\/wiki\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        docId = match[1];
      }
    } else if (pathname.includes("/minutes/")) {
      // 会议纪要文档
      docType = "minutes";
      
      // 提取文档ID
      const match = pathname.match(/\/minutes\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        docId = match[1];
      }
    } else if (pathname.includes("/sheet/")) {
      // 表格文档
      docType = "sheet";
      
      // 提取文档ID
      const match = pathname.match(/\/sheet\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        docId = match[1];
      }
    } else if (pathname.includes("/bitable/")) {
      // 多维表格文档
      docType = "bitable";
      
      // 提取文档ID
      const match = pathname.match(/\/bitable\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        docId = match[1];
      }
    } else if (pathname.includes("/file/")) {
      // 文件格式
      docType = "file";
      
      // 提取文件ID
      const match = pathname.match(/\/file\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        docId = match[1];
      }
    }
    
    if (!docId) {
      console.log("❌ 未找到文档ID");
      return null;
    }
    
    console.log(`✅ 文档类型: ${docType}, ID: ${docId}`);
    return { kind: docType, token: docId };
  } catch (error) {
    console.error("解析链接失败:", error);
    return null;
  }
}

// 批量获取临时下载URL
async function batchGetTmpUrls(
  tokens: string[],
  accessToken: string,
): Promise<TmpDownloadUrl[]> {
  console.log(`🔗 开始批量获取临时URL，tokens: ${JSON.stringify(tokens)}`);
  console.log(`🔑 使用访问令牌: ${accessToken.substring(0, 20)}...`);
  
  try {
    const res = await fetch(
      "https://open.feishu.cn/open-apis/drive/v1/medias/batch_get_tmp_download_url",
      {
        method: "POST",
        headers: {
          Authorization: accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_tokens: tokens }),
      },
    );

    console.log(`📊 API响应状态: ${res.status} ${res.statusText}`);
    
    // 先检查HTTP状态码
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ HTTP错误 ${res.status}: ${errorText}`);
      throw new Error(`HTTP ${res.status}: ${res.statusText} - ${errorText}`);
    }
    
    // 尝试解析JSON响应
    let json;
    try {
      json = await res.json();
    } catch (parseError) {
      const responseText = await res.text();
      console.error(`❌ JSON解析失败:`, parseError);
      console.error(`❌ 响应内容:`, responseText);
      throw new Error(`无法解析API响应: ${responseText.substring(0, 100)}...`);
    }
    
    console.log(`📦 批量获取临时URL响应: ${JSON.stringify(json, null, 2)}`);

    if (json.code !== 0) {
      console.error(`❌ 飞书API错误: ${json.code} - ${json.msg}`);
      
      // 如果是权限问题，提供更详细的错误信息
      if (json.code === 11304 || json.msg?.includes('permission')) {
        throw new Error(`飞书API权限不足: ${json.msg}。请确保应用已获得 'drive:drive:readonly' 权限`);
      }
      
      throw new Error(`飞书错误 ${json.code}: ${json.msg || "未知错误"}`);
    }

    const tmpDownloadUrls = json.data?.tmp_download_urls || [];
    console.log(`✅ 成功获取 ${tmpDownloadUrls.length} 个临时下载URL`);
    
    return tmpDownloadUrls;
    
  } catch (error) {
    console.error(`❌ 批量获取临时URL失败:`, error);
    throw error;
  }
}

// 处理图片URL（已废弃，保留作为备用）
async function downloadImageAsBase64(url: string): Promise<string | null> {
  try {
    console.log(`📥 开始下载图片: ${url}`);
    
    const response = await fetch(url); // 注意：下载时不要再添加Authorization头

    console.log(`📊 图片下载响应状态: ${response.status} ${response.statusText}`);
    console.log(`📊 图片响应头:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error("❌ 下载图片失败:", response.status, response.statusText);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";
    const bufferSize = buffer.byteLength;
    
    console.log(`📊 图片信息: 类型=${contentType}, 大小=${bufferSize}字节`);
    
    if (bufferSize === 0) {
      console.error("❌ 图片文件为空");
      return null;
    }
    
    const base64 = Buffer.from(buffer).toString("base64");
    const base64Length = base64.length;
    
    console.log(`✅ 图片转base64成功: ${base64Length}字符`);
    
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("❌ 下载图片时出错:", error);
    console.error("❌ 错误详情:", error instanceof Error ? error.message : '未知错误');
    return null;
  }
}

// 自动检测文本中的URL并转换为链接
function autoLinkUrls(text: string): string {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
  return text.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
  );
}

// 处理文本块
function processTextBlock(block: FeishuBlock): string {
  let html = "";
  for (const element of block.text?.elements || []) {
    let content = element.text_run?.content || "";

    // 处理格式
    if (element.text_run?.text_element_style) {
      const style = element.text_run.text_element_style;
      if (style.bold) content = `<strong>${content}</strong>`;
      if (style.italic) content = `<em>${content}</em>`;
      if (style.underline) content = `<u>${content}</u>`;
      if (style.strike) content = `<del>${content}</del>`;
      if (style.link?.url)
        content = `<a href="${style.link.url}" target="_blank">${content}</a>`;
    }

    html += content;
  }

  // 自动识别URL
  html = autoLinkUrls(html);

  return `<p>${html}</p>\n`;
}

// 处理标题块
function processHeadingBlock(block: FeishuBlock): string {
  const level =
    parseInt(String(block.block_type).replace("heading", ""), 10) || 1;
  const headingTag = `h${Math.min(level, 6)}`;

  let html = "";
  for (const element of block.heading1?.elements || []) {
    let content = element.text_run?.content || "";

    // 处理格式
    if (element.text_run?.text_element_style) {
      const style = element.text_run.text_element_style;
      if (style.bold) content = `<strong>${content}</strong>`;
      if (style.italic) content = `<em>${content}</em>`;
      if (style.underline) content = `<u>${content}</u>`;
      if (style.strike) content = `<del>${content}</del>`;
      if (style.link?.url)
        content = `<a href="${style.link.url}" target="_blank">${content}</a>`;
    }

    html += content;
  }

  return `<${headingTag}>${html}</${headingTag}>\n`;
}

// 处理列表块
function processListBlock(block: FeishuBlock, isBulleted: boolean): string {
  const listType = isBulleted ? "ul" : "ol";
  let html = `<${listType}>`;

  for (const element of block[isBulleted ? "bullet" : "ordered"]?.elements ||
    []) {
    let content = element.text_run?.content || "";

    // 处理格式
    if (element.text_run?.text_element_style) {
      const style = element.text_run.text_element_style;
      if (style.bold) content = `<strong>${content}</strong>`;
      if (style.italic) content = `<em>${content}</em>`;
      if (style.underline) content = `<u>${content}</u>`;
      if (style.strike) content = `<del>${content}</del>`;
      if (style.link?.url)
        content = `<a href="${style.link.url}" target="_blank">${content}</a>`;
    }

    html += `<li>${content}</li>`;
  }

  html += `</${listType}>\n`;
  return html;
}

// 处理标注块(callout)内容
function processCalloutBlock(block: FeishuBlock): string {
  try {
    const calloutEmoji = block.callout?.emoji_id || "💡";
    const backgroundColor = block.callout?.background_color ? `#f0f7ff` : `#f0f7ff`; // 默认使用浅蓝色背景
    
    let html = `<div class="callout" style="padding: 15px; margin: 10px 0; border-left: 4px solid #3370ff; background-color: ${backgroundColor};">\n`;
    
    // 提取callout中的文本内容
    let calloutText = "";
    if (block.callout?.elements && block.callout.elements.length > 0) {
      for (const element of block.callout.elements) {
        if (element.text_run) {
          let content = element.text_run.content || "";
          
          // 处理格式
          if (element.text_run.text_element_style) {
            const style = element.text_run.text_element_style;
            if (style.bold) content = `<strong>${content}</strong>`;
            if (style.italic) content = `<em>${content}</em>`;
            if (style.underline) content = `<u>${content}</u>`;
            if (style.strike) content = `<del>${content}</del>`;
            if (style.link?.url)
              content = `<a href="${style.link.url}" target="_blank">${content}</a>`;
          }
          
          calloutText += content;
        }
      }
    }
    
    if (calloutText) {
      html += `<p>${calloutEmoji} ${calloutText}</p>\n`;
    } else if (block.children && block.children.length > 0) {
      html += `<p>${calloutEmoji} <strong>标注：</strong> [标注内容]</p>\n`;
    } else {
      html += `<p>${calloutEmoji} <strong>标注：</strong> [空标注]</p>\n`;
    }
    
    html += `</div>\n`;
    return html;
  } catch (error) {
    console.error("处理标注块时出错:", error);
    return `<p>[标注块 - 处理错误]</p>\n`;
  }
}

// 检查块是否包含图片内容
function hasImageContent(block: FeishuBlock): boolean {
  const blockAny = block as any;
  
  // 检查标准图片字段
  if (block.image?.token || block.image?.file_token || 
      block.file?.token || block.file?.file_token) {
    return true;
  }
  
  // 检查各种可能的嵌套字段
  const possibleFields = ['image', 'file', 'media', 'attachment', 'content', 'element'];
  for (const field of possibleFields) {
    if (blockAny[field] && typeof blockAny[field] === 'object') {
      const fieldObj = blockAny[field];
      const possibleTokenFields = ['token', 'file_token', 'image_token', 'media_token'];
      
      for (const tokenField of possibleTokenFields) {
        if (fieldObj[tokenField] && typeof fieldObj[tokenField] === 'string') {
          return true;
        }
      }
    }
  }
  
     // 检查图片URL（包括base64和HTTP URLs）
   const possibleSrcFields = ['src', 'url', 'data', 'image_url', 'tmp_url'];
   for (const field of possibleSrcFields) {
     if (typeof blockAny[field] === 'string') {
       const value = blockAny[field];
       if (value.startsWith('data:image/') || value.startsWith('http')) {
         return true;
       }
     }
     
     // 检查嵌套对象中的URL字段
     if (blockAny.image && typeof blockAny.image[field] === 'string') {
       const value = blockAny.image[field];
       if (value.startsWith('data:image/') || value.startsWith('http')) {
         return true;
       }
     }
   }
  
  // 检查文件类型是否为图片
  if (blockAny.file?.name && typeof blockAny.file.name === 'string') {
    const fileName = blockAny.file.name.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    if (imageExtensions.some(ext => fileName.endsWith(ext))) {
      return true;
    }
  }
  
  // 检查是否有图片相关的类型标识
  if (blockAny.type && typeof blockAny.type === 'string') {
    const type = blockAny.type.toLowerCase();
    if (type.includes('image') || type.includes('picture') || type.includes('photo')) {
      return true;
    }
  }
  
  return false;
}

// 处理图片块 - 新版本使用图片下载和代理机制
async function processImageBlock(block: FeishuBlock, token: string, documentId?: string): Promise<string> {
  try {
    console.log(`🖼️ 图片块详细信息:`, JSON.stringify(block, null, 2));
    
    // 提取图片token或URL
    let imageToken = null;
    let directImageUrl = null;
    const blockAny = block as any;
    
    // 优先检查标准字段
    if (block.image?.token) {
      imageToken = block.image.token;
      console.log(`✅ 从 block.image.token 获取到图片token: ${imageToken}`);
    } else if (block.image?.file_token) {
      imageToken = block.image.file_token;
      console.log(`✅ 从 block.image.file_token 获取到图片token: ${imageToken}`);
    } else if (block.file?.token) {
      imageToken = block.file.token;
      console.log(`✅ 从 block.file.token 获取到图片token: ${imageToken}`);
    } else if (block.file?.file_token) {
      imageToken = block.file.file_token;
      console.log(`✅ 从 block.file.file_token 获取到图片token: ${imageToken}`);
    }
    
    // 检查是否是直接的图片URL（包括临时URL）
    if (!imageToken) {
      const possibleUrlFields = ['src', 'url', 'data', 'image_url', 'tmp_url'];
      for (const field of possibleUrlFields) {
        // 检查顶级字段
        if (typeof blockAny[field] === 'string') {
          const url = blockAny[field];
          
          if (url.startsWith('data:image/')) {
            console.log(`✅ 发现base64图片数据在字段: ${field}`);
            return generateImageHtml(url, block);
          } else if (url.startsWith('http')) {
            directImageUrl = url;
            console.log(`✅ 发现图片URL在字段: ${field}, URL: ${url}`);
            break;
          }
        }
        
        // 检查嵌套对象中的URL字段
        if (blockAny.image && typeof blockAny.image[field] === 'string') {
          const url = blockAny.image[field];
          
          if (url.startsWith('data:image/')) {
            console.log(`✅ 发现base64图片数据在字段: image.${field}`);
            return generateImageHtml(url, block);
          } else if (url.startsWith('http')) {
            directImageUrl = url;
            console.log(`✅ 发现图片URL在字段: image.${field}, URL: ${url}`);
            break;
          }
        }
      }
    }

    // 如果找到了直接的图片URL，尝试下载并保存
    if (directImageUrl) {
      return await processDirectImageUrl(directImageUrl, block, token, documentId);
    }

    // 如果有imageToken但不是直接URL，需要获取临时下载URL
    if (imageToken && !imageToken.startsWith('http')) {
      return await processImageToken(imageToken, block, token, documentId);
    }

    // 如果imageToken已经是HTTP URL，直接处理
    if (imageToken && imageToken.startsWith('http')) {
      return await processDirectImageUrl(imageToken, block, token, documentId);
    }

    // 都没找到，返回错误提示
    console.warn("❌ 图片块缺少token和直接URL:", block.block_id);
    console.warn("❌ 完整块结构:", JSON.stringify(block, null, 2));
    return `<div class="image-container" style="text-align: center; margin: 15px 0; padding: 20px; border: 2px dashed #ccc; border-radius: 8px;">
      <p style="color: #999; font-style: italic;">🖼️ 图片内容缺失</p>
      <p style="color: #666; font-size: 12px;">块类型: ${block.block_type}</p>
    </div>\n`;
    
  } catch (error) {
    console.error("❌ 处理图片块时出错:", error);
    return `<div class="image-container" style="text-align: center; margin: 15px 0; padding: 20px; border: 2px dashed #f5f5f5; border-radius: 8px;">
      <p style="color: #ff6b6b; font-style: italic;">🖼️ 图片处理错误</p>
      <p style="color: #666; font-size: 12px;">${error instanceof Error ? error.message : '未知错误'}</p>
    </div>\n`;
  }
}

// 处理直接的图片URL
async function processDirectImageUrl(imageUrl: string, block: FeishuBlock, token: string, documentId?: string): Promise<string> {
  console.log(`📥 处理直接图片URL: ${imageUrl}`);
  
  // 尝试下载并保存图片到本地
  const docId = documentId || 'unknown';
  const localImageUrl = await downloadAndSaveImage(imageUrl, docId, token);
  
  if (localImageUrl) {
    console.log(`✅ 图片已保存到本地: ${localImageUrl}`);
    return generateImageHtml(localImageUrl, block);
  } else {
    console.log(`⚠️ 图片下载失败，使用代理URL: ${imageUrl}`);
    // 下载失败，使用代理URL
    const proxyUrl = generateProxyImageUrl(imageUrl, token);
    return generateImageHtml(proxyUrl, block);
  }
}

// 处理图片token，获取临时URL后下载
async function processImageToken(imageToken: string, block: FeishuBlock, token: string, documentId?: string): Promise<string> {
  console.log(`🔍 处理图片token: ${imageToken}`);
  
  // 方案1: 尝试直接使用单个媒体下载API
  try {
    console.log(`🔗 尝试直接媒体下载API: ${imageToken}`);
    const mediaUrl = `https://open.feishu.cn/open-apis/drive/v1/medias/${imageToken}/download`;
    
    const response = await fetch(mediaUrl, {
      method: 'GET',
      headers: { 
        'Authorization': token,
        'Content-Type': 'application/json'
      },
    });
    
    console.log(`📊 媒体API响应状态: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      // 检查是否是重定向到真实图片URL
      const finalUrl = response.url;
      
      if (finalUrl !== mediaUrl) {
        console.log(`✅ 媒体API重定向到: ${finalUrl}`);
        return await processDirectImageUrl(finalUrl, block, token, documentId);
      } else {
        // 直接从响应获取图片数据
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.startsWith('image/')) {
          console.log(`✅ 媒体API直接返回图片数据: ${contentType}`);
          const imageBuffer = await response.arrayBuffer();
          
          // 保存图片到本地
          const docId = documentId || 'unknown';
          const fileName = `${docId}_${imageToken}_${Date.now()}.jpg`;
          const localPath = `./public/images/feishu/${fileName}`;
          
                     try {
             await fs.writeFile(localPath, Buffer.from(imageBuffer));
             const localUrl = `/images/feishu/${fileName}`;
             console.log(`✅ 图片保存成功: ${localUrl}`);
             return generateImageHtml(localUrl, block);
           } catch (saveError) {
            console.log(`⚠️ 保存失败，使用代理: ${saveError}`);
            // 保存失败，使用代理URL  
            const proxyUrl = generateProxyImageUrl(mediaUrl, token);
            return generateImageHtml(proxyUrl, block);
          }
        }
      }
    } else {
      console.log(`⚠️ 媒体API失败: ${response.status} ${response.statusText}`);
    }
  } catch (mediaError) {
    console.log("⚠️ 直接媒体API失败:", mediaError);
  }
  
  // 方案2: 尝试通过批量API获取临时下载URL (作为备用)
  try {
    console.log(`🔗 尝试批量API作为备用: ${imageToken}`);
    const tmpUrls = await batchGetTmpUrls([imageToken], token);
    
    if (tmpUrls && tmpUrls.length > 0) {
      const imageUrl = tmpUrls[0].tmp_download_url;
      console.log(`📥 批量API获取到临时URL: ${imageUrl}`);
      
      // 处理临时URL
      return await processDirectImageUrl(imageUrl, block, token, documentId);
    }
  } catch (apiError) {
    console.log("⚠️ 批量API也失败了:", apiError);
  }
  
  // 方案3: 如果都失败了，尝试构建图片代理URL
  try {
    console.log(`🔄 尝试生成代理URL: ${imageToken}`);
    const directMediaUrl = `https://open.feishu.cn/open-apis/drive/v1/medias/${imageToken}/download`;
    const proxyUrl = generateProxyImageUrl(directMediaUrl, token);
    
    console.log(`🔗 使用代理URL: ${proxyUrl}`);
    return generateImageHtml(proxyUrl, block);
    
  } catch (proxyError) {
    console.log("⚠️ 代理URL也失败了:", proxyError);
  }
  
  // 所有方法都失败了
  console.error("❌ 无法获取图片URL:", imageToken);
  return `<div class="image-container" style="text-align: center; margin: 15px 0; padding: 20px; border: 2px dashed #ccc; border-radius: 8px;">
    <p style="color: #999; font-style: italic;">🖼️ 图片无法加载</p>
    <p style="color: #666; font-size: 12px;">Token: ${imageToken.substring(0, 20)}...</p>
    <p style="color: #666; font-size: 11px;">请检查飞书应用权限配置</p>
  </div>\n`;
}

// 生成图片HTML
function generateImageHtml(imageSrc: string, block: FeishuBlock): string {
  const width = block.image?.width ? Math.min(block.image.width, 800) : undefined;
  const height = block.image?.height ? Math.min(block.image.height, 600) : undefined;
  
  const widthAttr = width ? `width="${width}"` : '';
  const heightAttr = height ? `height="${height}"` : '';
  
  return `<div class="image-container" style="text-align: center; margin: 15px 0;">
    <img src="${imageSrc}" 
         alt="飞书文档图片" 
         ${widthAttr} 
         ${heightAttr}
         style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" 
         loading="lazy" />
  </div>\n`;
}

// 处理网格块
function processGridBlock(block: FeishuBlock): string {
  try {
    return `<div class="grid-container" style="display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0;">\n<p><i>[网格布局 - ID: ${block.block_id}]</i></p>\n</div>\n`;
  } catch (error) {
    console.error("处理网格块时出错:", error);
    return `<p>[网格布局 - 处理错误]</p>\n`;
  }
}

// 处理折叠块
function processToggleBlock(block: FeishuBlock): string {
  try {
    // 提取折叠块标题
    let title = "";
    if (block.toggle?.elements) {
      for (const element of block.toggle.elements) {
        if (element.text_run) {
          title += element.text_run.content || "";
        }
      }
    }
    
    // 创建折叠块HTML
    return `<details>\n  <summary>▶ ${title || "折叠内容"}</summary>\n  <div class="toggle-content">\n    <p>[折叠块内容 - ID: ${block.block_id}]</p>\n  </div>\n</details>\n`;
  } catch (error) {
    console.error("处理折叠块时出错:", error);
    return `<p>[折叠块 - 处理错误]</p>\n`;
  }
}

// 整合处理飞书文档内容的函数
async function parseFeishuDocContent(docId: string, accessToken: string, kind: string): Promise<string> {
  try {
    console.log(`🔍 开始解析${kind}类型文档: ${docId}`);
    
    // 根据文档类型选择不同的解析方法
    if (kind === "docx") {
      return await parseDocxContent(docId, accessToken);
    } else if (kind === "docs" || kind === "doc") {
      const docContent = await parseDocsContent(docId, accessToken);
      
      // 将Markdown内容转换为HTML
      console.log("🔄 将Markdown转换为HTML...");
      
      // 为Markdown内容添加标题
      let content = `<h1>${docId}</h1>\n`;
      
      // 处理Markdown内容
      content += convertMarkdownToHtml(docContent);
      
      console.log(`✅ Markdown转HTML完成，内容长度: ${content.length} 字符`);
      return content;
    } else {
      throw new Error(`不支持的文档类型: ${kind}`);
    }
  } catch (error) {
    console.error(`解析${kind}文档内容时出错:`, error);
    throw error;
  }
}

// 解析docx格式文档
async function parseDocxContent(
  docId: string,
  token: string,
): Promise<string> {
  try {
    // 设置请求头，使用标准的Bearer格式
    const headers = {
      Authorization: token, // 直接使用传入的token，不再重新添加Bearer前缀
      "Content-Type": "application/json; charset=utf-8",
    };
    
    console.log("🔍 开始获取docx文档信息");
    
    // 获取文档基本信息
    const docInfoResponse = await fetch(
      `${FEISHU_CONFIG.base_url}/docx/v1/documents/${docId}`,
      { headers },
    );
    const docInfo = await docInfoResponse.json();

    console.log("📄 文档信息响应:", JSON.stringify(docInfo, null, 2));

    if (docInfo.code !== 0) {
      throw new Error(`获取文档信息失败: ${docInfo.msg}`);
    }

    // 获取文档标题
    const title = docInfo.data?.document?.title || "未命名文档";
    console.log("📑 文档标题:", title);

    // 统计数据，用于调试和优化
    const stats = {
      textBlocks: 0,
      headings: 0,
      lists: 0,
      codeBlocks: 0,
      files: 0,
      images: 0,
      tables: 0,
      grids: 0,
      toggles: 0, // 折叠块
      callouts: 0, // 标注块
      errors: 0,
    };

    // 开始构建HTML内容
    let content = `<h1>${title}</h1>\n`;

    // 获取文档块
    const blockResponse = await fetch(
      `${FEISHU_CONFIG.base_url}/docx/v1/documents/${docId}/blocks`,
      { headers },
    );
    const blockData = await blockResponse.json();

    if (blockData.code !== 0) {
      throw new Error(`获取文档块失败: ${blockData.msg}`);
    }

    console.log(
      "📦 获取文档块数量:",
      blockData.data?.items?.length || 0,
    );

    // 处理每一个块
    for (const block of blockData.data?.items || []) {
      console.log(`📦 处理块类型: ${block.block_type}, ID: ${block.block_id}`);
      
      // 对于可能的图片块，打印详细信息
      if (block.block_type === 16 || block.block_type === 27 || 
          block.block_type === 21 || block.block_type === 22 || 
          block.block_type === 23 || hasImageContent(block)) {
        console.log(`🔍 疑似图片块详细结构:`, JSON.stringify(block, null, 2));
      }
      
      // 处理文档内容
      switch (block.block_type) {
        case 2: // 文本
          content += processTextBlock(block);
          stats.textBlocks++;
          break;

        case 3: // 标题1
        case 4: // 标题2
        case 5: // 标题3
        case 6: // 标题4
        case 7: // 标题5
        case 8: // 标题6
        case 9: // 标题7
        case 10: // 标题8
        case 11: // 标题9
          content += processHeadingBlock(block);
          stats.headings++;
          break;

        case 12: // 无序列表
          content += processListBlock(block, true);
          stats.lists++;
          break;

        case 13: // 有序列表
          content += processListBlock(block, false);
          stats.lists++;
          break;

        case 15: // 文件
          content += `<p>📎 [文件附件]</p>\n`;
          stats.files++;
          break;

        case 16: // 旧版图片块类型
          console.log(`🖼️ 发现图片块 (类型16):`, JSON.stringify(block, null, 2));
          content += await processImageBlock(block, token, docId);
          stats.images++;
          break;
          
        case 27: // 新版图片块类型（根据飞书API文档）
          console.log(`🖼️ 发现图片块 (类型27):`, JSON.stringify(block, null, 2));
          content += await processImageBlock(block, token, docId);
          stats.images++;
          break;
          
        case 21: // 可能是另一种图片块类型
          console.log(`🖼️ 发现可能的图片块 (类型21):`, JSON.stringify(block, null, 2));
          if (hasImageContent(block)) {
            content += await processImageBlock(block, token, docId);
            stats.images++;
          } else {
            content += `<p>[类型21块 - ID: ${block.block_id}]</p>\n`;
          }
          break;
          
        case 22: // 可能是其他媒体类型
        case 23: // 文件类型，可能包含图片
          console.log(`🖼️ 发现可能的媒体块 (类型${block.block_type}):`, JSON.stringify(block, null, 2));
          if (hasImageContent(block)) {
            content += await processImageBlock(block, token, docId);
            stats.images++;
          } else {
            content += `<p>[类型${block.block_type}块 - ID: ${block.block_id}]</p>\n`;
          }
          break;

        case 17: // 表格
          content += `<p>📊 [表格内容 - ID: ${block.block_id}]</p>\n`;
          stats.tables++;
          break;

        case 18: // 网格
          content += processGridBlock(block);
          stats.grids++;
          break;

        case 19: // 标注块(callout)
          content += processCalloutBlock(block);
          stats.callouts++;
          break;
          
        case 20: // 折叠块(toggle)
          content += processToggleBlock(block);
          stats.toggles++;
          break;

        default:
          console.log(`⚠️ 未知块类型: ${block.block_type}`, JSON.stringify(block, null, 2));
          
          // 检查未知块类型是否包含图片信息
          if (hasImageContent(block)) {
            console.log(`🖼️ 在未知块类型${block.block_type}中发现图片内容，尝试处理`);
            content += await processImageBlock(block, token, docId);
            stats.images++;
          } else {
            content += `<p>[未知内容块 - 类型: ${block.block_type}]</p>\n`;
          }
      }
    }

    console.log("📊 文档统计:", stats);
    return content;
  } catch (error) {
    console.error("解析docx文档内容时出错:", error);
    throw error;
  }
}

// 创建飞书文档导出任务
async function createExportTask(
  fileToken: string,
  tenantToken: string,
): Promise<string> {
  try {
    console.log(`🚀 开始创建文档导出任务，文档token: ${fileToken}`);
    
    console.log('📄 file_token =', fileToken); // 调试日志，确认值不为空
    
    if (!fileToken) throw new Error('file_token is empty');
    
    // 更新为正确的API端点
    const url = `${FEISHU_CONFIG.base_url}/drive/v1/export_tasks`;
    
    // 根据最新API要求，使用file_token参数
    const requestBody = {
      file_token: fileToken,
      type: 'docx'  // 改为docx格式，更通用
    };
    
    console.log("📡 请求URL:", url);
    console.log("📋 请求参数:", JSON.stringify(requestBody, null, 2));
    console.log("🔑 Authorization:", `Bearer ${tenantToken.substring(0, 10)}...`);
    
    console.log("⏳ 开始发送API请求...");
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tenantToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    console.log("📡 API请求已发送");
    
    // 获取完整响应内容便于调试
    const responseText = await response.text();
    console.log("📊 API响应状态:", response.status);
    console.log("📊 API响应状态文本:", response.statusText);
    console.log("📊 API响应头:", JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    console.log("📊 API响应内容:", responseText);
    
    // 处理非200状态码
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`API端点不存在: ${url}。可能需要检查API版本或权限配置。响应内容: ${responseText}`);
      } else if (response.status === 403) {
        throw new Error(`权限不足: 应用需要 'drive:drive:readonly' 权限来导出文档。请在飞书开放平台配置相应权限。响应内容: ${responseText}`);
      } else if (response.status >= 400) {
        throw new Error(`API调用失败: HTTP ${response.status} - ${responseText}`);
      }
    }
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("✅ 成功解析响应JSON");
    } catch (error) {
      console.error("❌ 解析响应JSON失败:", error);
      throw new Error(`无法解析API响应: ${responseText.substring(0, 100)}...`);
    }
    
    // 检查API响应是否成功
    if (responseData.code !== 0) {
      console.error("❌ 创建导出任务失败详情:", responseData);
      
      // 识别权限错误并提供清晰提示
      if (responseData.code === 11304 || 
          (responseData.msg && (
            responseData.msg.includes('permission') || 
            responseData.msg.includes('Access denied') ||
            responseData.msg.includes('scope') ||
            responseData.msg.includes('no permission')
          ))) {
        throw new Error(`飞书API权限不足: ${responseData.msg || '权限错误'}。
请确保您的应用已获得以下权限之一:
- drive:drive:readonly
- docs:document:readonly
并确认应用已正确安装到企业中，且已获得文档访问权限。
请在飞书开放平台-应用管理-权限管理中添加这些权限，然后重新发布应用版本并审批通过。`);
      }
      
      // 字段验证失败
      if (responseData.code === 99992402 || responseData.msg?.includes('field validation')) {
        console.error("❌ 字段验证失败详情:", responseData.error?.field_violations);
        
        // 尝试解析具体的字段错误
        let fieldErrors = "未知字段错误";
        if (responseData.error?.field_violations) {
          fieldErrors = JSON.stringify(responseData.error.field_violations);
        }
        
        throw new Error(`API参数错误: 字段验证失败。
具体错误: ${fieldErrors}
请确保使用正确的API参数格式。飞书API可能已更新，请参考最新的飞书开放平台文档。
常见问题:
1. token参数格式不正确
2. type参数值不在允许范围内
3. 缺少必要的权限`);
      }
      
      throw new Error(`创建导出任务失败: ${responseData.msg || '未知错误'} (错误码: ${responseData.code})`);
    }
    
    // 成功情况下返回task_id
    const taskId = responseData.data?.task_id;
    if (!taskId) {
      throw new Error("API返回成功但没有返回task_id");
    }
    
    console.log(`✅ 导出任务创建成功, taskId: ${taskId}`);
    return taskId;
  } catch (error: any) {
    console.error("❌ 创建导出任务过程中发生异常:", error);
    console.error("❌ 异常详情:", error.message);
    throw error;
  }
}

// 轮询导出任务状态并获取下载地址
async function pollExportTask(
  taskId: string,
  tenantToken: string,
): Promise<string /*downloadUrl*/> {
  const url = `${FEISHU_CONFIG.base_url}/drive/v1/export_tasks/${taskId}`;
  for (let i = 0; i < 20; i++) {          // 最多等 20×500ms = 10s
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${tenantToken}` },
    });
    
    if (!res.ok) {
      throw new Error(`查询导出任务失败: HTTP ${res.status}`);
    }
    
    const j = await res.json();
    if (j.code !== 0) throw new Error(`查询导出任务失败: ${j.msg}`);
    const { status, result } = j.data;
    if (status === 'success') return result.file_url;
    if (status === 'failed')  throw new Error('导出任务失败');
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('导出任务超时');
}

// 下载docx并转换为Markdown
async function downloadDocxAndToMd(downloadUrl: string): Promise<string> {
  // 拿到导出的 zip（里头只有一个 <file>.docx）
  const zipBuf = new Uint8Array(await (await fetch(downloadUrl)).arrayBuffer());
  const zip = unzipSync(zipBuf);
  const docxName = Object.keys(zip).find(n => n.endsWith('.docx'));
  if (!docxName) throw new Error('ZIP 里没有 .docx');

  // 动态引入mammoth（运行时加载，避免webpack静态分析错误）
  const mammoth = await import('mammoth');
  const { value: html } = await mammoth.convertToHtml({
    buffer: Buffer.from(zip[docxName]),
  });
  
  // 简单地将HTML转换为Markdown（仅基本转换）
  const md = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<a href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<ul[^>]*>([^]*?)<\/ul>/gi, '$1\n')
    .replace(/<ol[^>]*>([^]*?)<\/ol>/gi, '$1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<img src="([^"]*)"[^>]*>/gi, '![]($1)')
    .replace(/<blockquote[^>]*>([^]*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<pre[^>]*>([^]*?)<\/pre>/gi, '```\n$1\n```\n\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]*>/g, '') // 删除所有剩余的HTML标签
    .replace(/\n\n\n+/g, '\n\n') // 删除多余的空行
    .trim();
  
  return md;
}

// 解析旧版docs格式文档 (优先使用直接API，导出API作为备选)
async function parseDocsContent(
  docId: string,
  token: string,
): Promise<string> {
  try {
    console.log("使用旧版docs文档解析方式");
    
    // 获取tenant token (Bearer格式)
    const tenantToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    console.log("文档ID:", docId, "Token长度:", tenantToken.length);
    
    // 首先尝试使用docs API直接获取内容
    try {
      console.log("⏳ 尝试使用docs API直接获取内容...");
      const directContent = await parseDocsDirectly(docId, token);
      console.log("✅ 直接API方法成功，内容长度:", directContent.length);
      return directContent;
    } catch (directError: any) {
      console.log("❌ 直接API方法失败:", directError.message);
      console.log("⏳ 尝试使用导出API作为备选方案...");
    }
    
    try {
      // 创建导出任务
      console.log("⏳ 开始创建导出任务...");
      const taskId = await createExportTask(docId, tenantToken);
      console.log("🎫 创建导出任务成功, taskId:", taskId);
      
      // 轮询获取下载链接
      console.log("⏳ 开始轮询导出任务状态...");
      const downloadUrl = await pollExportTask(taskId, tenantToken);
      console.log("📥 获取下载链接成功:", downloadUrl);
      
      // 下载并转换为Markdown
      console.log("⏳ 开始下载文档并转换为Markdown...");
      const markdown = await downloadDocxAndToMd(downloadUrl);
      console.log("✅ 文档下载并转换完成, 内容长度:", markdown.length);
      
      return markdown;
    } catch (error: any) {
      console.error("导出API方式解析失败:", error);
      
      // 针对特定错误进行友好处理
      if (error.message && (
        error.message.includes("field validation failed") ||
        error.message.includes("param error") ||
        error.message.includes("API端点不存在")
      )) {
        throw new Error("API参数错误或端点不存在: 请联系管理员检查API版本和权限配置");
      }
      
      if (error.message && error.message.includes("no permission")) {
        throw new Error("飞书API权限不足: 请确保应用已获得必要权限，并正确安装到企业中");
      }
      
      // 如果导出API也失败，尝试返回基本信息
      console.log("⚠️ 所有解析方法都失败，返回基本文档信息");
      return `# 文档解析失败

文档ID: ${docId}

由于以下原因无法解析文档内容：
${error.message}

可能的解决方案：
1. 检查文档权限设置
2. 确认应用已获得必要权限
3. 验证文档链接是否正确
4. 联系管理员检查API配置

请尝试重新分享文档或使用其他格式的文档。`;
    }
  } catch (error: any) {
    console.error("解析docs文档内容时出错:", error);
    throw error;
  }
}

// 直接使用docs API获取内容 (新增函数)
async function parseDocsDirectly(
  docId: string,
  token: string,
): Promise<string> {
  try {
    const headers = {
      Authorization: token,
      "Content-Type": "application/json; charset=utf-8",
    };
    
    console.log("🔍 尝试直接调用docs API");
    console.log("📄 文档ID:", docId);
    console.log("🔑 Token长度:", token.length);
    
    // 尝试获取docs文档内容 - 使用旧版API
    const apiUrl = `${FEISHU_CONFIG.base_url}/doc/v2/docs/${docId}/content`;
    console.log("📡 API URL:", apiUrl);
    
    const docResponse = await fetch(apiUrl, { headers });
    
    console.log("📊 API响应状态:", docResponse.status);
    console.log("📊 API响应状态文本:", docResponse.statusText);
    
    if (!docResponse.ok) {
      const errorText = await docResponse.text();
      console.error("❌ API响应错误内容:", errorText);
      throw new Error(`获取docs内容失败: HTTP ${docResponse.status} - ${errorText}`);
    }
    
    const docData = await docResponse.json();
    console.log("📄 API响应数据:", JSON.stringify(docData, null, 2));
    
    if (docData.code !== 0) {
      throw new Error(`获取docs内容失败: ${docData.msg} (错误码: ${docData.code})`);
    }
    
    console.log("📄 成功获取docs内容");
    
    // 处理docs格式的内容
    let content = `# ${docData.data?.title || '未命名文档'}\n\n`;
    
    // 简单处理docs内容
    if (docData.data?.content) {
      // 如果有结构化内容，尝试解析
      const docContent = docData.data.content;
      if (typeof docContent === 'string') {
        content += docContent;
      } else if (typeof docContent === 'object') {
        content += JSON.stringify(docContent, null, 2);
      }
    } else {
      content += "文档内容为空或无法解析。";
    }
    
    return content;
  } catch (error: any) {
    console.error("❌ 直接解析docs失败:", error);
    console.error("❌ 错误详情:", error.message);
    throw error;
  }
}

// POST 处理函数
export async function POST(req: NextRequest) {
  try {
    console.log("🔍 服务器端调试信息:");
    
    // 检查环境变量
    const appId = process.env.FEISHU_APP_ID;
    const appSecret = process.env.FEISHU_APP_SECRET;
    
    if (!appId) {
      console.error("❌ 缺少FEISHU_APP_ID环境变量");
      return Response.json({ error: "配置错误", details: "缺少飞书应用ID配置" }, { status: 500 });
    }
    
    console.log("FEISHU_APP_ID:", appId);
    
    if (!appSecret) {
      console.error("❌ 缺少FEISHU_APP_SECRET环境变量");
      return Response.json({ error: "配置错误", details: "缺少飞书应用密钥配置" }, { status: 500 });
    }
    
    console.log("FEISHU_APP_SECRET: 已配置");
    console.log("✅ 环境变量已配置，开始解析...");
    
    // 解析请求体
    const { url } = await req.json();
    
    if (!url) {
      console.error("❌ 缺少URL参数");
      return Response.json({ error: "参数错误", details: "缺少URL参数" }, { status: 400 });
    }
    
    console.log("🔗 收到请求链接:", url);
    
    // 验证URL格式
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (urlError) {
      console.error("❌ 无效的URL格式:", url);
      return Response.json({ error: "URL格式错误", details: "请提供有效的飞书文档链接" }, { status: 400 });
    }
    
    // 解析飞书链接
    const docPath = urlObj.pathname;
    console.log("📄 提取的文档路径:", docPath);
    
    const linkInfo = parseFeishuLink(url);
    if (!linkInfo) {
      console.error("❌ 无效的飞书链接格式");
      return Response.json({ error: "链接错误", details: "不支持的飞书文档链接格式" }, { status: 400 });
    }
    
    const { kind, token } = linkInfo;
    console.log("✅ 文档类型:", kind, "ID:", token);
    console.log("🔄 解析链接结果:", linkInfo);
    
    // 获取访问令牌
    console.log("🔑 文档Token:", token);
    const accessToken = await getFeishuAccessToken();
    console.log("🔑 Token响应:", accessToken);
    
    // 根据文档类型解析内容
    let content;
    try {
      console.log("🔍 开始解析" + kind + "类型文档:", token);
      content = await parseFeishuDocContent(token, accessToken, kind);
      
      // 计算内容元素
      const stats = countContentElements(content);
      
      // 转换为HTML（如果需要）
      const html = convertMarkdownToHtml(content);
      
      return Response.json({
        success: true,
        content,
        html,
        stats,
        metadata: {
          docType: kind,
          docId: token,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error("解析过程中发生错误:", error);
      
      // 提供更友好的错误消息
      let errorMessage = "解析飞书文档时发生错误，请稍后重试或联系管理员。";
      let errorDetails = error.message || "未知错误";
      let statusCode = 500;
      
      // 处理常见错误类型
      if (errorDetails.includes('飞书API权限不足')) {
        errorMessage = "飞书API权限不足，无法导出文档";
        errorDetails = `应用缺少必要的API权限。${errorDetails}`;
        statusCode = 403;
      } else if (errorDetails.includes('API参数错误')) {
        errorMessage = "API参数错误";
        statusCode = 400;
      } else if (errorDetails.includes('导出任务失败')) {
        errorMessage = "文档导出失败";
      }
      
      return Response.json({ 
        error: errorMessage, 
        details: errorDetails,
        originalError: error.message 
      }, { status: statusCode });
    }
  } catch (error: any) {
    console.error("处理请求时发生错误:", error);
    return Response.json({ 
      error: "服务器错误", 
      details: "处理请求时发生错误，请稍后重试", 
      originalError: error.message 
    }, { status: 500 });
  }
}

// 统计内容元素
function countContentElements(html: string) {
  const textBlocks = (html.match(/<p>/g) || []).length;
  const headings = (html.match(/<h[1-6]/g) || []).length;
  const lists = (html.match(/<[ou]l>/g) || []).length;
  const images = (html.match(/<img/g) || []).length;
  const videos = (html.match(/<video/g) || []).length;
  const files = (html.match(/<a[^>]*download/g) || []).length;
  const tables = (html.match(/<table/g) || []).length;
  const unknown = 0; // 无法直接从HTML中统计的未知元素
  
  return {
    textBlocks,
    headings,
    lists,
    images,
    videos,
    files,
    tables,
    unknown,
  };
}

// 将Markdown转换为HTML的辅助函数
function convertMarkdownToHtml(markdown: string): string {
  // 处理标题
  let html = markdown
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  
  // 处理段落（确保非标题、非列表的行转为段落）
  html = html.replace(/^([^<#\-\d\n].+)$/gm, '<p>$1</p>');
  
  // 处理列表
  html = html
    .replace(/^- (.+)$/gm, '<ul><li>$1</li></ul>')
    .replace(/^(\d+)\. (.+)$/gm, '<ol><li>$2</li></ol>');
  
  // 处理加粗和斜体
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\_\_(.+?)\_\_/g, '<strong>$1</strong>')
    .replace(/\_(.+?)\_/g, '<em>$1</em>');
  
  // 处理链接
  html = html
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // 处理图片
  html = html
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">');
  
  // 处理代码块 (使用 (?:pattern) 而不是 (?s) 标志)
  html = html
    .replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
  
  // 处理行内代码
  html = html
    .replace(/`([^`]+?)`/g, '<code>$1</code>');
  
  return html;
}
