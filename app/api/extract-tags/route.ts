import { NextRequest, NextResponse } from 'next/server'

interface ExtractTagsRequest {
  content: string
  title?: string
}

interface ExtractTagsResponse {
  autoTags: string[]
  error?: string
}

// 简化的关键词提取算法
function extractKeywords(text: string, title?: string): string[] {
  // 将标题和内容合并进行分析
  const fullText = (title ? title + ' ' + text : text).toLowerCase()
  
  // 移除HTML标签
  const cleanText = fullText.replace(/<[^>]*>/g, ' ')
  
  // 技术相关关键词映射
  const techKeywords = {
    '前端': ['react', 'vue', 'angular', 'javascript', 'css', 'html', 'frontend', '前端', 'ui', '界面', '组件'],
    '后端': ['node', 'python', 'java', 'go', 'rust', 'api', 'backend', '后端', '服务器', 'server'],
    '数据库': ['mysql', 'postgresql', 'mongodb', 'redis', 'sql', '数据库', 'database'],
    '人工智能': ['ai', 'ml', 'deep learning', 'neural', 'chatgpt', 'gpt', '人工智能', '机器学习', '深度学习'],
    '产品': ['产品', '需求', '功能', 'product', '用户体验', 'ux', 'ui', '设计'],
    '项目管理': ['项目', '管理', '团队', 'project', 'management', '协作'],
    '性能优化': ['性能', '优化', 'performance', '速度', '缓存', 'cache'],
    '安全': ['安全', 'security', '认证', 'auth', '加密'],
    '移动端': ['移动', 'mobile', 'ios', 'android', 'app'],
    '云服务': ['云', 'cloud', 'aws', 'azure', '阿里云', '腾讯云'],
    '工具': ['工具', 'tool', '插件', 'plugin', '扩展'],
    '文档': ['文档', 'document', '说明', '指南', 'guide'],
    '测试': ['测试', 'test', 'testing', '单元测试', '集成测试'],
    '部署': ['部署', 'deploy', 'deployment', 'ci/cd', 'devops']
  }
  
  const extractedTags: string[] = []
  
  // 检查技术关键词
  Object.entries(techKeywords).forEach(([tag, keywords]) => {
    const hasKeyword = keywords.some(keyword => 
      cleanText.includes(keyword.toLowerCase())
    )
    if (hasKeyword) {
      extractedTags.push(tag)
    }
  })
  
  // 如果没有匹配到技术关键词，添加通用标签
  if (extractedTags.length === 0) {
    if (cleanText.includes('教程') || cleanText.includes('学习') || cleanText.includes('tutorial')) {
      extractedTags.push('教程')
    }
    if (cleanText.includes('分享') || cleanText.includes('经验') || cleanText.includes('总结')) {
      extractedTags.push('经验分享')
    }
    if (cleanText.includes('问题') || cleanText.includes('解决') || cleanText.includes('troubleshoot')) {
      extractedTags.push('问题解决')
    }
  }
  
  // 如果还是没有标签，使用默认标签
  if (extractedTags.length === 0) {
    extractedTags.push('知识', '文档')
  }
  
  // 限制标签数量为3-5个
  return extractedTags.slice(0, 5)
}

export async function POST(request: NextRequest) {
  try {
    const { content, title }: ExtractTagsRequest = await request.json()
    
    if (!content) {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      )
    }
    
    // 提取关键词标签
    const autoTags = extractKeywords(content, title)
    
    console.log('🏷️ AI标签提取成功:', autoTags)
    
    return NextResponse.json({
      autoTags
    } as ExtractTagsResponse)
    
  } catch (error) {
    console.error('❌ AI标签提取失败:', error)
    return NextResponse.json(
      { error: '标签提取失败，请重试' },
      { status: 500 }
    )
  }
} 