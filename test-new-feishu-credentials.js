#!/usr/bin/env node

// 测试新的飞书凭据
const fs = require('fs');

// 手动读取.env.local文件
function loadEnvFile() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n');
    const env = {};
    
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    });
    
    return env;
  } catch (error) {
    console.error('无法读取.env.local文件:', error.message);
    return {};
  }
}

async function testFeishuCredentials() {
  console.log('🧪 测试飞书凭据...');
  
  const env = loadEnvFile();
  const appId = env.FEISHU_APP_ID;
  const appSecret = env.FEISHU_APP_SECRET;
  
  console.log(`📱 App ID: ${appId}`);
  console.log(`🔐 App Secret: ${appSecret ? '已配置' : '未配置'}`);
  
  if (!appId || !appSecret) {
    console.log('❌ 凭据未配置完整');
    return false;
  }
  
  try {
    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret,
      }),
    });

    const data = await response.json();
    console.log('📊 API响应:', JSON.stringify(data, null, 2));

    if (data.code === 0) {
      console.log('✅ 凭据验证成功！');
      console.log(`🎫 获取到访问令牌: ${data.tenant_access_token.substring(0, 20)}...`);
      return true;
    } else {
      console.log(`❌ 凭据验证失败: ${data.msg} (错误码: ${data.code})`);
      
      // 提供错误码帮助信息
      if (data.code === 10003) {
        console.log('💡 错误码10003通常表示:');
        console.log('   - App ID 或 App Secret 格式不正确');
        console.log('   - 凭据不是来自同一个应用');
        console.log('   - 应用可能被禁用或删除');
      } else if (data.code === 10014) {
        console.log('💡 错误码10014通常表示:');
        console.log('   - App ID 不存在');
        console.log('   - 应用可能被删除或禁用');
      } else if (data.code === 10015) {
        console.log('💡 错误码10015通常表示:');
        console.log('   - App Secret 错误');
        console.log('   - 请确认App Secret是否正确');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
    return false;
  }
}

testFeishuCredentials(); 