import { NextRequest, NextResponse } from 'next/server'

// 飞书API配置
const FEISHU_CONFIG = {
  app_id: process.env.FEISHU_APP_ID || '',
  app_secret: process.env.FEISHU_APP_SECRET || '',
  base_url: 'https://open.feishu.cn/open-apis'
}

// 定义飞书API返回的数据类型
interface FeishuBlock {
  block_type: number;
  block_id?: string;
  parent_id?: string;
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
          }
        }
      }
    }>
  };
  heading?: {
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
          }
        }
      }
    }>
  };
  bulleted?: {
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
          }
        }
      }
    }>
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
          }
        }
      }
    }>
  };
  image?: {
    token: string;
    width?: number;
    height?: number;
  };
}

interface TmpDownloadUrl {
  file_token: string;
  tmp_download_url: string;
}

// 获取飞书访问token
async function getFeishuToken(): Promise<string> {
  try {
    const response = await fetch(`${FEISHU_CONFIG.base_url}/auth/v3/tenant_access_token/internal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: FEISHU_CONFIG.app_id,
        app_secret: FEISHU_CONFIG.app_secret
      })
    })
    
    const data = await response.json()
    if (data.code !== 0) {
      throw new Error(`飞书API错误: ${data.msg}`)
    }
    return data.tenant_access_token
  } catch (error) {
    console.error('获取飞书token失败:', error)
    throw new Error('飞书认证失败')
  }
}

// 从飞书链接提取文档ID
function extractDocId(url: string): string {
  const patterns = [
    /\/docs\/([a-zA-Z0-9_-]+)/,
    /\/doc\/([a-zA-Z0-9_-]+)/,
    /\/docx\/([a-zA-Z0-9_-]+)/,
    /\/wiki\/([a-zA-Z0-9_-]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  throw new Error('无法从链接中提取文档ID')
}

// 批量获取临时下载URL
async function batchGetTmpUrls(tokens: string[], accessToken: string): Promise<TmpDownloadUrl[]> {
  const res = await fetch(
    'https://open.feishu.cn/open-apis/drive/v1/medias/batch_get_tmp_download_url',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file_tokens: tokens }),
    },
  )
  
  const json = await res.json()
  console.log(`批量获取临时URL响应: ${JSON.stringify(json)}`)
  
  if (json.code !== 0) {
    throw new Error(`飞书错误 ${json.code}: ${json.msg || '未知错误'}`)
  }
  
  return json.data.tmp_download_urls
}

// 将图片URL转换为base64
async function downloadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url) // 注意：下载时不要再添加Authorization头
    
    if (!response.ok) {
      console.error('下载图片失败:', response.status, response.statusText)
      return null
    }
    
    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'
    const base64 = Buffer.from(buffer).toString('base64')
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error('下载图片时出错:', error)
    return null
  }
}

// 自动检测文本中的URL并转换为链接
function autoLinkUrls(text: string): string {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
}

// 处理文本块
function processTextBlock(block: FeishuBlock): string {
  let html = ''
  for (const element of block.text?.elements || []) {
    let content = element.text_run?.content || ''
    
    // 处理格式
    if (element.text_run?.text_element_style) {
      const style = element.text_run.text_element_style
      if (style.bold) content = `<strong>${content}</strong>`
      if (style.italic) content = `<em>${content}</em>`
      if (style.underline) content = `<u>${content}</u>`
      if (style.strike) content = `<del>${content}</del>`
      if (style.link?.url) content = `<a href="${style.link.url}" target="_blank">${content}</a>`
    }
    
    html += content
  }
  
  // 自动识别URL
  html = autoLinkUrls(html)
  
  return `<p>${html}</p>\n`
}

// 处理标题块
function processHeadingBlock(block: FeishuBlock): string {
  const level = parseInt(String(block.block_type).replace('heading', ''), 10) || 1
  const headingTag = `h${Math.min(level, 6)}`
  
  let html = ''
  for (const element of block.heading?.elements || []) {
    let content = element.text_run?.content || ''
    
    // 处理格式
    if (element.text_run?.text_element_style) {
      const style = element.text_run.text_element_style
      if (style.bold) content = `<strong>${content}</strong>`
      if (style.italic) content = `<em>${content}</em>`
      if (style.underline) content = `<u>${content}</u>`
      if (style.strike) content = `<del>${content}</del>`
      if (style.link?.url) content = `<a href="${style.link.url}" target="_blank">${content}</a>`
    }
    
    html += content
  }
  
  return `<${headingTag}>${html}</${headingTag}>\n`
}

// 处理列表块
function processListBlock(block: FeishuBlock, isBulleted: boolean): string {
  const listType = isBulleted ? 'ul' : 'ol'
  let html = `<${listType}>`
  
  for (const element of block[isBulleted ? 'bulleted' : 'ordered']?.elements || []) {
    let content = element.text_run?.content || ''
    
    // 处理格式
    if (element.text_run?.text_element_style) {
      const style = element.text_run.text_element_style
      if (style.bold) content = `<strong>${content}</strong>`
      if (style.italic) content = `<em>${content}</em>`
      if (style.underline) content = `<u>${content}</u>`
      if (style.strike) content = `<del>${content}</del>`
      if (style.link?.url) content = `<a href="${style.link.url}" target="_blank">${content}</a>`
    }
    
    html += `<li>${content}</li>`
  }
  
  html += `</${listType}>\n`
  return html
}

// 核心：解析飞书文档内容
async function parseFeishuDocContent(docId: string, token: string): Promise<string> {
  try {
    // 获取文档基本信息
    const docInfoResponse = await fetch(`${FEISHU_CONFIG.base_url}/docx/v1/documents/${docId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const docInfo = await docInfoResponse.json()
    
    console.log('📄 文档信息响应:', JSON.stringify(docInfo, null, 2))
    
    if (docInfo.code !== 0) {
      throw new Error(`获取文档信息失败: ${docInfo.msg}`)
    }
    
    // 获取文档内容块
    const contentResponse = await fetch(`${FEISHU_CONFIG.base_url}/docx/v1/documents/${docId}/blocks?page_size=500`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const contentData = await contentResponse.json()
    
    if (contentData.code !== 0) {
      throw new Error(`获取文档内容失败: ${contentData.msg}`)
    }
    
    const allBlocks = contentData.data?.items || []
    console.log('📄 内容块数量:', allBlocks.length)
    
    // 打印所有block_type，帮助调试
    console.log('🔍 所有区块类型:', allBlocks.map((b: FeishuBlock) => b.block_type))
    
    // 1. 提取所有图片token
    const imageTokens = allBlocks
      .filter((block: FeishuBlock) => block.block_type === 17) // 17 是图片类型
      .map((block: FeishuBlock) => block.image?.token)
      .filter(Boolean)
    
    console.log(`🖼️ 发现 ${imageTokens.length} 张图片`)
    
    // 2. 批量获取所有图片的临时下载链接
    let tmpUrlMap = new Map<string, string>()
    
    if (imageTokens.length > 0) {
      // 按每50个token一组进行分批处理
      const BATCH_SIZE = 50
      const chunks: string[][] = []
      
      for (let i = 0; i < imageTokens.length; i += BATCH_SIZE) {
        chunks.push(imageTokens.slice(i, i + BATCH_SIZE))
      }
      
      // 并行处理所有批次
      try {
        const allResults = await Promise.all(
          chunks.map(chunk => batchGetTmpUrls(chunk, token))
        )
        
        // 将所有结果合并到一个Map中
        allResults.flat().forEach(item => {
          tmpUrlMap.set(item.file_token, item.tmp_download_url)
        })
        
        console.log(`✅ 成功获取 ${tmpUrlMap.size} 个临时下载链接`)
      } catch (error) {
        console.error('批量获取临时链接失败:', error)
      }
    }
    
    // 3. 处理文档内容
    const title = docInfo.data?.document?.title || '未命名文档'
    let content = `<h1>${title}</h1>\n`
    
    // 统计信息
    let stats = {
      textBlocks: 0,
      headings: 0,
      lists: 0,
      images: 0,
      videos: 0,
      files: 0,
      tables: 0,
      unknown: 0
    }
    
    // 处理所有块
    for (const block of allBlocks) {
      switch (block.block_type) {
        case 2: // 文本
          content += processTextBlock(block)
          stats.textBlocks++
          break
          
        case 3: // 标题1
        case 4: // 标题2
        case 5: // 标题3
        case 6: // 标题4
        case 7: // 标题5
        case 8: // 标题6
        case 9: // 标题7
        case 10: // 标题8
        case 11: // 标题9
          const level = block.block_type - 2
          content += processHeadingBlock(block)
          stats.headings++
          break
          
        case 12: // 无序列表
          content += processListBlock(block, true)
          stats.lists++
          break
          
        case 13: // 有序列表
          content += processListBlock(block, false)
          stats.lists++
          break
          
        case 17: // 图片
          stats.images++
          
          const downloadUrl = tmpUrlMap.get(block.image?.token || '')
          if (!downloadUrl) {
            content += `<p>🖼️ [图片缺失: ${block.image?.token}]</p>\n`
            break
          }
          
          content += `<p><img src="${downloadUrl}" 
                         alt="飞书文档图片" 
                         style="max-width:100%;height:auto;"/></p>\n`
          break
          
        case 18: // 视频
          content += `<p>📹 [视频内容]</p>\n`
          stats.videos++
          break
          
        case 15: // 文件
          content += `<p>📎 [文件附件]</p>\n`
          stats.files++
          break
          
        case 27: // 表格
          content += `<p>📊 [表格内容]</p>\n`
          stats.tables++
          break
          
        default:
          console.log(`未知区块类型: ${block.block_type}`, block)
          content += `<p>[未知内容块]</p>\n`
          stats.unknown++
      }
    }
    
    console.log('📊 解析统计:', stats)
    
    return content
  } catch (error) {
    console.error('解析文档内容时出错:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    // 检查环境变量
    console.log('🔍 服务器端调试信息:')
    console.log('FEISHU_APP_ID:', FEISHU_CONFIG.app_id)
    console.log('FEISHU_APP_SECRET:', FEISHU_CONFIG.app_secret ? '已配置' : '未配置')
    
    if (!FEISHU_CONFIG.app_id || !FEISHU_CONFIG.app_secret) {
      return NextResponse.json({ 
        error: '服务器环境变量未配置', 
        message: '请先配置飞书API密钥' 
      }, { status: 500 })
    }
    
    console.log('✅ 环境变量已配置，开始解析...')
    
    // 获取飞书链接
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ 
        error: '参数错误', 
        message: '请提供有效的飞书文档链接' 
      }, { status: 400 })
    }
    
    // 提取文档ID
    const documentId = extractDocId(url)
    console.log('📄 提取的文档ID:', documentId)
    
    // 获取访问令牌
    const token = await getFeishuToken()
    console.log('🔑 获取Token成功')
    
    // 解析文档内容
    const htmlContent = await parseFeishuDocContent(documentId, token)
    
    return NextResponse.json({ 
      title: '飞书文档解析结果',
      html: htmlContent 
    })
    
  } catch (error: any) {
    console.error('解析飞书文档失败:', error)
    
    return NextResponse.json({ 
      error: '解析失败', 
      message: error.message || '未知错误'
    }, { status: 500 })
  }
} 