export async function parseTencentDoc(url: string) {
  await new Promise((r) => setTimeout(r, 600)) // 假网络
  return `# 腾讯文档内容\n\n> 来源：${url}\n\n这里是正文示例……`
}

// 飞书文档解析器 - 现在通过API路由处理

// 主要导出函数 - 解析飞书文档（通过API路由）
export async function parseFeishuDoc(url: string): Promise<string> {
  try {
    console.log('🔍 客户端调试信息:')
    console.log('准备调用API路由解析飞书文档:', url)
    
    const response = await fetch('/api/parse-feishu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '网络请求失败')
    }
    
    const data = await response.json()
    
    if (data.isSimulated) {
      console.log('⚠️ 服务器返回模拟数据')
    } else {
      console.log('✅ 服务器返回真实解析数据')
    }
    
    return data.content
    
  } catch (error) {
    console.error('❌ 解析飞书文档失败:', error)
    throw new Error(`解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

export async function fakeSummary(raw: string) {
  // 可以集成AI API来生成真实摘要
  const preview = raw.replace(/<[^>]*>/g, '').slice(0, 100)
  return preview + "…（AI生成摘要）"
}

export async function fakeTags(raw: string) {
  // 可以使用AI来分析内容并生成标签
  const content = raw.toLowerCase()
  const tags = []
  
  if (content.includes('技术') || content.includes('代码') || content.includes('开发')) tags.push('技术')
  if (content.includes('设计') || content.includes('UI') || content.includes('界面')) tags.push('设计') 
  if (content.includes('产品') || content.includes('需求') || content.includes('功能')) tags.push('产品')
  if (content.includes('会议') || content.includes('讨论') || content.includes('决策')) tags.push('会议')
  if (content.includes('文档') || content.includes('说明') || content.includes('指南')) tags.push('文档')
  
  return tags.length ? tags : ['飞书', '文档', '知识']
}
