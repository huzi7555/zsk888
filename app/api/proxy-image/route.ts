import { NextRequest, NextResponse } from 'next/server';

// 标记这个路由为动态，禁用静态生成
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const token = searchParams.get('token');

    if (!imageUrl) {
      return new NextResponse('缺少图片URL参数', { status: 400 });
    }

    // 构建请求头
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    };

    // 如果提供了token，添加Authorization头
    if (token) {
      headers['Authorization'] = token;
    }

    console.log(`🖼️ 代理图片请求: ${imageUrl}`);

    const response = await fetch(imageUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`❌ 图片代理失败: ${response.status} ${response.statusText}`);
      
      // 对于403错误，返回一个占位图片而不是错误
      if (response.status === 403) {
        // 创建一个简单的占位图片SVG
        const placeholderSvg = `
          <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f3f4f6"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">
              图片无法加载
            </text>
          </svg>
        `;
        
        return new NextResponse(placeholderSvg, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      return new NextResponse('图片加载失败', { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';

    console.log(`✅ 图片代理成功: ${imageBuffer.byteLength} 字节`);

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 缓存24小时
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('❌ 图片代理错误:', error);
    return new NextResponse('图片代理服务错误', { status: 500 });
  }
} 