import { NextRequest, NextResponse } from 'next/server'

interface AnalysisRequest {
  content: string
  title: string
  clipId: string
}

interface SectionSummary {
  id: string
  title: string
  summary: string
  anchor: string
  level: number
}

interface AnalysisResponse {
  quickSummary: string
  detailedSummary: string
  sections: SectionSummary[]
  error?: string
}

// 使用OpenAI API生成摘要
async function generateAISummary(content: string, title: string, type: 'quick' | 'detailed'): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const model = process.env.OPENAI_MODEL_GPT || 'gpt-4o-mini'

  if (!apiKey) {
    console.warn('OpenAI API Key未配置，使用模拟摘要')
    return generateFallbackSummary(content, title, type)
  }

  // 清理内容
  const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  
  // 限制内容长度以避免超出token限制
  const maxContentLength = type === 'quick' ? 2000 : 4000
  const truncatedContent = cleanContent.length > maxContentLength 
    ? cleanContent.slice(0, maxContentLength) + '...' 
    : cleanContent

  const prompt = type === 'quick' 
    ? `请为以下文档生成一个50字以内的极速摘要，要求简洁明了，突出核心要点：

文档标题：${title}
文档内容：${truncatedContent}

请直接返回摘要内容，不要包含"摘要："等前缀。`
    : `请为以下文档生成一个200字以内的详细摘要，要求全面准确，包含主要观点和价值：

文档标题：${title}
文档内容：${truncatedContent}

请直接返回摘要内容，不要包含"摘要："等前缀。`

  try {
    console.log(`🤖 调用OpenAI API生成${type === 'quick' ? '极速' : '详细'}摘要...`)
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: type === 'quick' ? 100 : 300,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenAI API调用失败: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`OpenAI API错误: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('OpenAI API返回格式异常:', data)
      throw new Error('OpenAI API返回格式异常')
    }

    const summary = data.choices[0].message.content.trim()
    console.log(`✅ ${type === 'quick' ? '极速' : '详细'}摘要生成成功: ${summary.slice(0, 50)}...`)
    
    return summary

  } catch (error) {
    console.error(`❌ OpenAI API调用失败:`, error)
    console.log('🔄 降级使用模拟摘要')
    return generateFallbackSummary(content, title, type)
  }
}

// 备用摘要生成（当API不可用时）
function generateFallbackSummary(content: string, title: string, type: 'quick' | 'detailed'): string {
  const cleanContent = content.replace(/<[^>]*>/g, ' ').trim()
  
  if (type === 'quick') {
    const words = cleanContent.split(/\s+/).slice(0, 15).join(' ')
    return `${title}：${words}...`
  } else {
    let summary = `本文档《${title}》`
    
    const hasCode = cleanContent.includes('代码') || cleanContent.includes('function') || cleanContent.includes('class')
    const hasDesign = cleanContent.includes('设计') || cleanContent.includes('界面') || cleanContent.includes('用户体验')
    const hasProcess = cleanContent.includes('流程') || cleanContent.includes('步骤') || cleanContent.includes('方法')
    
    if (hasCode) {
      summary += '深入探讨了技术实现细节，包含具体的代码示例和解决方案。'
    } else if (hasDesign) {
      summary += '从设计角度分析了用户需求和界面优化方案，提供了实用的设计指导。'
    } else if (hasProcess) {
      summary += '系统梳理了工作流程和操作方法，为实际执行提供了详细指引。'
    } else {
      summary += '提供了有价值的知识分享和经验总结。'
    }
    
    summary += '适合作为参考资料长期保存和查阅。'
    return summary
  }
}

// 使用AI生成章节摘要
async function generateSectionSummaries(content: string): Promise<SectionSummary[]> {
  const sections: SectionSummary[] = []
  
  // 匹配HTML标题标签
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi
  let match
  let sectionIndex = 1
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1])
    const title = match[2].replace(/<[^>]*>/g, '').trim()
    
    if (title && level <= 3) { // 只处理1-3级标题
      const sectionId = `section-${sectionIndex}`
      const anchor = `#${encodeURIComponent(title)}`
      
      // 尝试使用AI生成章节摘要
      let summary = ''
      try {
        const apiKey = process.env.OPENAI_API_KEY
        if (apiKey) {
          const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
          const model = process.env.OPENAI_MODEL_GPT || 'gpt-4o-mini'
          
          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: 'user',
                  content: `请为标题"${title}"生成一个20字以内的一句话概括。直接返回概括内容，不要前缀。`
                }
              ],
              max_tokens: 50,
              temperature: 0.3,
            }),
          })
          
          if (response.ok) {
            const data = await response.json()
            summary = data.choices[0].message.content.trim()
          }
        }
      } catch (error) {
        console.warn(`章节摘要生成失败: ${title}`, error)
      }
      
      // 如果AI生成失败，使用备用逻辑
      if (!summary) {
        if (title.includes('介绍') || title.includes('概述')) {
          summary = '介绍了基本概念和背景信息'
        } else if (title.includes('实现') || title.includes('方法')) {
          summary = '详细说明了具体实现方法和步骤'
        } else if (title.includes('示例') || title.includes('案例')) {
          summary = '通过实际案例展示了应用场景'
        } else if (title.includes('总结') || title.includes('结论')) {
          summary = '总结了关键要点和建议'
        } else {
          summary = `关于${title}的相关内容`
        }
      }
      
      sections.push({
        id: sectionId,
        title,
        summary,
        anchor,
        level
      })
      
      sectionIndex++
    }
  }
  
  // 如果没有找到标题，创建一个默认章节
  if (sections.length === 0) {
    sections.push({
      id: 'section-1',
      title: '主要内容',
      summary: '文档的核心内容和主要观点',
      anchor: '#主要内容',
      level: 1
    })
  }
  
  return sections
}

// 执行AI分析
async function performAnalysis(content: string, title: string): Promise<{
  quickSummary: string
  detailedSummary: string
  sections: SectionSummary[]
}> {
  console.log('🚀 开始AI分析，生成极速摘要...')
  
  // 并行生成极速摘要和提取章节
  const [quickSummary, sections] = await Promise.all([
    generateAISummary(content, title, 'quick'),
    generateSectionSummaries(content)
  ])
  
  console.log('📝 极速摘要完成，开始生成详细摘要...')
  
  // 生成详细摘要
  const detailedSummary = await generateAISummary(content, title, 'detailed')
  
  console.log('✅ 所有AI分析完成')
  
  return {
    quickSummary,
    detailedSummary,
    sections
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, title, clipId }: AnalysisRequest = await request.json()
    
    if (!content || !title) {
      return NextResponse.json(
        { error: '内容和标题不能为空' },
        { status: 400 }
      )
    }

    console.log(`🧠 开始AI分析文档: ${title} (ID: ${clipId})`)
    
    // 执行AI分析
    const analysisResult = await performAnalysis(content, title)
    
    console.log(`✅ AI分析完成: ${title}`)
    console.log(`📝 极速摘要: ${analysisResult.quickSummary}`)
    console.log(`📄 详细摘要: ${analysisResult.detailedSummary.substring(0, 100)}...`)
    console.log(`📋 章节数量: ${analysisResult.sections.length}`)
    
    return NextResponse.json({
      quickSummary: analysisResult.quickSummary,
      detailedSummary: analysisResult.detailedSummary,
      sections: analysisResult.sections
    } as AnalysisResponse)
    
  } catch (error) {
    console.error('❌ AI分析失败:', error)
    return NextResponse.json(
      { error: 'AI分析失败，请重试' },
      { status: 500 }
    )
  }
} 