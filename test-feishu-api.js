#!/usr/bin/env node

// 飞书API测试脚本
const https = require('https');
const { URL } = require('url');

// 配置
const FEISHU_CONFIG = {
  base_url: "https://open.feishu.cn/open-apis",
  app_id: process.env.FEISHU_APP_ID || "cli_a6c68c5a1f7bd00c",
  app_secret: process.env.FEISHU_APP_SECRET || "vGMQfb5KaBdJwWz5Yl8wHeDmwNfn5MDT",
};

// 获取访问令牌
async function getFeishuAccessToken() {
  const url = `${FEISHU_CONFIG.base_url}/auth/v3/tenant_access_token/internal/`;
  const data = JSON.stringify({
    app_id: FEISHU_CONFIG.app_id,
    app_secret: FEISHU_CONFIG.app_secret,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data,
  });

  const result = await response.json();
  
  if (result.code !== 0) {
    throw new Error(`获取访问令牌失败: ${result.msg} (错误码: ${result.code})`);
  }

  return `Bearer ${result.tenant_access_token}`;
}

// 解析飞书链接
function parseFeishuLink(url) {
  console.log("🔗 解析链接:", url);
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    console.log("📄 路径:", pathname);
    
    // 匹配 docx 格式文档 (新版多维表格)
    const docxMatch = pathname.match(/^\/docx\/([A-Za-z0-9_-]+)(?:\/.*)?$/);
    if (docxMatch) {
      return { kind: 'docx', token: docxMatch[1] };
    }
    
    // 匹配 docs 格式文档 (旧版云文档)
    const docsMatch = pathname.match(/^\/docs\/([A-Za-z0-9_-]+)(?:\/.*)?$/);
    if (docsMatch) {
      return { kind: 'docs', token: docsMatch[1] };
    }
    
    // 通用匹配，尝试提取最后一个路径段作为文档ID
    const segments = pathname.split('/').filter(s => s.length > 0);
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      // 简单判断，如果包含特定字符，可能是docs，否则是docx
      const kind = lastSegment.includes('doc') ? 'docs' : 'docx';
      return { kind, token: lastSegment };
    }
    
    return null;
  } catch (error) {
    console.error("❌ 解析链接失败:", error);
    return null;
  }
}

// 测试不同的API端点
async function testApiEndpoints(token, accessToken) {
  const endpoints = [
    // Docx相关API
    { name: "docx文档信息", url: `/docx/v1/documents/${token}` },
    { name: "docx文档块", url: `/docx/v1/documents/${token}/blocks` },
    
    // Docs相关API  
    { name: "docs文档内容(v2)", url: `/doc/v2/docs/${token}/content` },
    { name: "docs文档信息", url: `/doc/v2/docs/${token}` },
    
    // 导出相关API
    { name: "创建导出任务", url: `/drive/v1/export_tasks`, method: 'POST', body: { file_token: token, type: 'docx' } },
    { name: "文件元信息", url: `/drive/v1/files/${token}` },
    { name: "文件批量信息", url: `/drive/v1/files/batch_query`, method: 'POST', body: { file_tokens: [token] } },
  ];

  const headers = {
    Authorization: accessToken,
    "Content-Type": "application/json; charset=utf-8",
  };

  console.log("\n🧪 开始测试API端点:");
  console.log("=" * 50);

  for (const endpoint of endpoints) {
    console.log(`\n📡 测试: ${endpoint.name}`);
    console.log(`📍 URL: ${FEISHU_CONFIG.base_url}${endpoint.url}`);
    
    try {
      const options = {
        method: endpoint.method || 'GET',
        headers,
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
        console.log(`📦 请求体:`, JSON.stringify(endpoint.body, null, 2));
      }
      
      const response = await fetch(`${FEISHU_CONFIG.base_url}${endpoint.url}`, options);
      console.log(`📊 状态码: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      console.log(`📄 响应:`, JSON.stringify(data, null, 2));
      
      if (data.code === 0) {
        console.log("✅ 成功!");
      } else {
        console.log(`❌ 失败: ${data.msg} (错误码: ${data.code})`);
      }
      
    } catch (error) {
      console.log(`❌ 网络错误:`, error.message);
    }
  }
}

// 主测试函数
async function main() {
  console.log("🚀 飞书API测试开始");
  console.log("=" * 50);
  
  console.log("🔧 配置信息:");
  console.log(`📱 App ID: ${FEISHU_CONFIG.app_id}`);
  console.log(`🔐 App Secret: ${FEISHU_CONFIG.app_secret ? '已配置' : '未配置'}`);
  console.log(`🌐 Base URL: ${FEISHU_CONFIG.base_url}`);
  
  // 测试文档URL
  const testUrls = [
    "https://bytedance.larkoffice.com/docx/Ct5yd7jaxoHGGtxQDjZcmFgunCc",
    "https://bytedance.larkoffice.com/docs/doccnHh8Umo6qAyeOfJcGjV9bze",
    "https://feishu.cn/docx/TestDocx123",
    "https://feishu.cn/docs/TestDocs456"
  ];
  
  try {
    // 获取访问令牌
    console.log("\n🔑 获取访问令牌...");
    const accessToken = await getFeishuAccessToken();
    console.log("✅ 访问令牌获取成功");
    console.log(`🎫 Token: ${accessToken.substring(0, 20)}...`);
    
    // 测试每个URL
    for (const url of testUrls) {
      console.log("\n" + "=" * 60);
      console.log(`🔗 测试URL: ${url}`);
      
      const linkInfo = parseFeishuLink(url);
      if (!linkInfo) {
        console.log("❌ 无法解析链接");
        continue;
      }
      
      console.log(`📄 文档类型: ${linkInfo.kind}`);
      console.log(`🆔 文档ID: ${linkInfo.token}`);
      
      await testApiEndpoints(linkInfo.token, accessToken);
    }
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
  
  console.log("\n🏁 测试完成");
}

// 运行测试
if (require.main === module) {
  main();
} 