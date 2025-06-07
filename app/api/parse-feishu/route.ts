import { NextRequest, NextResponse } from 'next/server'

// 飞书API配置
const FEISHU_CONFIG = {
  app_id: process.env.FEISHU_APP_ID || '',
  app_secret: process.env.FEISHU_APP_SECRET || '',
  base_url: 'https://open.feishu.cn/open-apis'
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

// 获取飞书图片并转换为base64
async function getFeishuImageUrl(imageToken: string, token: string): Promise<string | null> {
  try {
    // 🔍 调试：打印关键信息
    console.log('🔍 【调试步骤1】准备获取临时下载链接')
    console.log('  - imageToken:', imageToken)
    console.log('  - token长度:', token?.length || 0)
    
    const apiUrl = 'https://open.feishu.cn/open-apis/drive/v1/media/batch_get_tmp_download_url'
    const requestData = { file_tokens: [imageToken] }
    
    console.log('  - API URL:', apiUrl)
    console.log('  - 请求数据:', JSON.stringify(requestData, null, 2))
    
    // 步骤1: 使用正确的POST方法获取临时下载链接
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
    
    console.log('  - 响应状态:', response.status, response.statusText)
    
    if (!response.ok) {
      console.error('❌ API调用失败:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('❌ 错误详情:', errorText)
      return null
    }
    
    const result = await response.json()
    console.log('✅ API响应:', JSON.stringify(result, null, 2))
    
    // 检查飞书API的响应格式
    if (result.code !== 0) {
      console.error('❌ 飞书API错误:', result.msg || '未知错误')
      return null
    }
    
    if (!result.data?.tmp_download_urls?.length) {
      console.error('❌ 没有获取到临时下载链接')
      return null
    }
    
    const tmpDownloadUrl = result.data.tmp_download_urls[0].tmp_download_url
    console.log('✅ 获取到临时下载链接:', tmpDownloadUrl)
    
    // 步骤2: 使用临时链接下载图片二进制数据
    const downloadResponse = await fetch(tmpDownloadUrl)
    
    if (!downloadResponse.ok) {
      console.error('❌ 图片下载失败:', downloadResponse.status, downloadResponse.statusText)
      return null
    }
    
    // 获取图片二进制数据
    const imageBuffer = await downloadResponse.arrayBuffer()
    const contentType = downloadResponse.headers.get('content-type') || 'image/png'
    
    // 转换为base64编码
    const base64String = Buffer.from(imageBuffer).toString('base64')
    const dataUrl = `data:${contentType};base64,${base64String}`
    
    console.log('✅ 图片转换成功，大小:', Math.round(base64String.length / 1024), 'KB')
    return dataUrl
    
  } catch (error) {
    console.error('❌ 获取图片过程中发生错误:', error)
    return null
  }
}

// 自动检测文本中的URL并转换为链接
function autoLinkUrls(text: string): string {
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

// 获取飞书文件信息和处理方式
async function getFeishuFileInfo(fileToken: string, token: string): Promise<{ type: 'download' | 'embed', url: string } | null> {
  try {
    // 对于文件，我们提供下载链接而不是内嵌
    // 因为大部分文件（特别是视频）太大不适合base64编码
    const downloadUrl = `${FEISHU_CONFIG.base_url}/drive/v1/media/${fileToken}/download`
    
    // 检查文件是否可访问
    const testResponse = await fetch(downloadUrl, {
      method: 'HEAD', // 只获取头部信息，不下载内容
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (testResponse.ok) {
      return { type: 'download', url: downloadUrl }
    } else {
      console.error('文件不可访问:', testResponse.status, testResponse.statusText)
      return null
    }
  } catch (error) {
    console.error('检查文件访问失败:', error)
    return null
  }
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
    
    // 获取文档内容块 - 尝试递归获取所有内容
    const contentResponse = await fetch(`${FEISHU_CONFIG.base_url}/docx/v1/documents/${docId}/blocks?page_size=500`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const contentData = await contentResponse.json()
    
    if (contentData.code !== 0) {
      throw new Error(`获取文档内容失败: ${contentData.msg}`)
    }
    
    console.log('📄 内容块数量:', contentData.data?.items?.length || 0)
    
    const title = docInfo.data?.document?.title || '未命名文档'
    let content = `# ${title}\n\n`
    
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
    
    // 解析内容块
    for (const block of contentData.data?.items || []) {
      switch (block.block_type) {
        case 1: // 页面块/段落容器
          // 这通常是一个容器，不需要特殊处理
          break
          
        case 2: // 文本
          if (block.text) {
            const textContent = block.text.elements?.map((el: any) => {
              if (el.text_run) {
                return el.text_run.content || ''
              } else if (el.link) {
                // 处理链接
                const linkText = el.link.text || el.link.url || ''
                const linkUrl = el.link.url || ''
                return `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
              }
              return ''
            }).join('') || ''
            if (textContent.trim()) {
              // 自动检测和转换URL为链接
              const linkedContent = autoLinkUrls(textContent)
              content += `<p>${linkedContent}</p>\n`
              stats.textBlocks++
            }
          }
          break
          
        case 3: // 标题1
          if (block.heading1) {
            const headingText = block.heading1.elements?.map((el: any) => el.text_run?.content || '').join('') || ''
            if (headingText.trim()) {
              content += `<h1>${headingText}</h1>\n`
              stats.headings++
            }
          }
          break
          
        case 4: // 标题2
          if (block.heading2) {
            const headingText = block.heading2.elements?.map((el: any) => el.text_run?.content || '').join('') || ''
            if (headingText.trim()) {
              content += `<h2>${headingText}</h2>\n`
              stats.headings++
            }
          }
          break
          
        case 5: // 标题3
          if (block.heading3) {
            const headingText = block.heading3.elements?.map((el: any) => el.text_run?.content || '').join('') || ''
            if (headingText.trim()) {
              content += `<h3>${headingText}</h3>\n`
              stats.headings++
            }
          }
          break
          
        case 12: // 项目符号列表
          if (block.bullet) {
            const listText = block.bullet.elements?.map((el: any) => el.text_run?.content || '').join('') || ''
            if (listText.trim()) {
              content += `<li>${listText}</li>\n`
              stats.lists++
            }
          }
          break
          
        case 13: // 有序列表
          if (block.ordered) {
            const listText = block.ordered.elements?.map((el: any) => el.text_run?.content || '').join('') || ''
            if (listText.trim()) {
              content += `<li>${listText}</li>\n`
              stats.lists++
            }
          }
          break
          
        case 27: // 图片
          if (block.image?.token) {
            stats.images++
            console.log(`🔍 【发现图片块】第${stats.images}张图片`)
            console.log('  - image.token:', block.image.token)
            console.log('  - 完整image对象:', JSON.stringify(block.image, null, 2))
            
            try {
              // 获取图片下载链接
              const imageUrl = await getFeishuImageUrl(block.image.token, token)
              if (imageUrl) {
                content += `<p><img src="${imageUrl}" alt="飞书文档图片" style="max-width: 100%; height: auto;" /></p>\n`
                console.log('  ✅ 图片处理成功')
              } else {
                content += `<p>🖼️ [图片: ${block.image.token}] <em>需要配置图片访问权限</em></p>\n`
                console.log('  ❌ 图片处理失败：返回null')
              }
            } catch (error) {
              console.error('获取图片失败:', error)
              content += `<p>🖼️ [图片: ${block.image.token}] <em>权限不足或网络错误</em></p>\n`
            }
          }
          break
          
        case 28: // 视频
          if (block.file?.token) {
            stats.videos++
            try {
              // 获取视频信息
              const fileInfo = await getFeishuFileInfo(block.file.token, token)
              if (fileInfo) {
                const fileName = block.file.name || '视频文件'
                content += `<p>🎥 <a href="${fileInfo.url}" target="_blank" rel="noopener noreferrer">${fileName}</a> (点击下载视频)</p>\n`
              } else {
                content += `<p>[视频无法加载: ${block.file.token}]</p>\n`
              }
            } catch (error) {
              console.error('获取视频失败:', error)
              content += `<p>[视频加载失败: ${block.file.token}]</p>\n`
            }
          }
          break
          
        case 29: // 文件
          if (block.file?.token) {
            stats.files++
            try {
              // 获取文件信息
              const fileInfo = await getFeishuFileInfo(block.file.token, token)
              if (fileInfo) {
                const fileName = block.file.name || '未知文件'
                content += `<p>📎 <a href="${fileInfo.url}" target="_blank" rel="noopener noreferrer">${fileName}</a></p>\n`
              } else {
                content += `<p>[文件无法加载: ${block.file.token}]</p>\n`
              }
            } catch (error) {
              console.error('获取文件失败:', error)
              content += `<p>[文件加载失败: ${block.file.token}]</p>\n`
            }
          }
          break
          
        case 15: // 表格
          stats.tables++
          content += '<p>[表格内容]</p>\n'
          break
          
        case 14: // 分割线
          content += `<hr/>\n`
          break
          
        case 19: // 引用块
          if (block.quote) {
            const quoteContent = block.quote.elements?.map((el: any) => el.text_run?.content || '').join('') || ''
            if (quoteContent.trim()) {
              content += `<blockquote>${quoteContent}</blockquote>\n`
              stats.textBlocks++
            }
          }
          break
          
        case 22: // 代码块
          if (block.code) {
            const codeContent = block.code.elements?.map((el: any) => el.text_run?.content || '').join('') || ''
            if (codeContent.trim()) {
              content += `<pre><code>${codeContent}</code></pre>\n`
              stats.textBlocks++
            }
          }
          break
          
        case 23: // 链接块
          if (block.link) {
            const linkText = block.link.text || block.link.url || '链接'
            const linkUrl = block.link.url || '#'
            content += `<p><a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a></p>\n`
            stats.textBlocks++
          }
          break
          
        case 24: // 嵌入块
          if (block.embed) {
            const embedUrl = block.embed.url || ''
            const embedTitle = block.embed.title || '嵌入内容'
            content += `<p>🔗 <a href="${embedUrl}" target="_blank" rel="noopener noreferrer">${embedTitle}</a></p>\n`
            stats.textBlocks++
          }
          break
          
        case 25: // 网格布局
          content += `<p>[网格布局内容]</p>\n`
          break
          
        case 30: // 高亮块
          if (block.callout) {
            const calloutContent = block.callout.elements?.map((el: any) => el.text_run?.content || '').join('') || ''
            if (calloutContent.trim()) {
              content += `<div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; margin: 10px 0;">${calloutContent}</div>\n`
              stats.textBlocks++
            }
          }
          break
          
        case 33: // 其他内容块（可能是代码块或特殊格式）
          if (block.code) {
            const codeContent = block.code.elements?.map((el: any) => el.text_run?.content || '').join('') || ''
            if (codeContent.trim()) {
              content += `<pre><code>${codeContent}</code></pre>\n`
              stats.textBlocks++
            }
          } else {
            // 尝试提取其他可能的文本内容
            stats.unknown++
          }
          break
          
        case 34: // 多媒体块
          if (block.media) {
            content += `<p>[多媒体内容]</p>\n`
            stats.unknown++
          }
          break
          
        default:
          // 未识别的块类型
          stats.unknown++
          console.log(`未处理的块类型: ${block.block_type}`)
          break
      }
    }
    
    // 输出统计信息
    console.log('📊 解析统计:', stats)
    
    // 添加统计到内容末尾
    const statsText = []
    if (stats.textBlocks > 0) statsText.push(`${stats.textBlocks} 段文本`)
    if (stats.headings > 0) statsText.push(`${stats.headings} 个标题`)
    if (stats.lists > 0) statsText.push(`${stats.lists} 个列表项`)
    if (stats.images > 0) statsText.push(`${stats.images} 张图片`)
    if (stats.videos > 0) statsText.push(`${stats.videos} 个视频`)
    if (stats.files > 0) statsText.push(`${stats.files} 个文件`)
    if (stats.tables > 0) statsText.push(`${stats.tables} 个表格`)
    
    if (statsText.length > 0) {
      content += `\n\n---\n\n📊 **解析统计**: ${statsText.join('、')}\n`
    }
    
    // 如果有图片无法加载，添加权限配置说明
    if (stats.images > 0) {
      content += `\n\n> ℹ️ **提示**: 如果图片无法显示，请在飞书开放平台为应用添加以下权限：\n`
      content += `> - \`im:file\` - 获取单个用户文件\n`
      content += `> - \`drive:file\` - 访问云文档文件\n`
      content += `> - \`drive:file:readonly\` - 查看云空间中所有文件\n`
    }
    
    return content
    
  } catch (error) {
    console.error('解析飞书文档失败:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: '缺少文档链接' }, { status: 400 })
    }
    
    // 调试日志
    console.log('🔍 服务器端调试信息:')
    console.log('FEISHU_APP_ID:', process.env.FEISHU_APP_ID)
    console.log('FEISHU_APP_SECRET:', process.env.FEISHU_APP_SECRET ? '已配置' : '未配置')
    
    // 检查是否配置了飞书API
    if (!FEISHU_CONFIG.app_id || !FEISHU_CONFIG.app_secret) {
      console.log('❌ 环境变量未配置，返回模拟数据')
      return NextResponse.json({
        content: `# 飞书文档内容 (模拟)\n\n> 来源：${url}\n\n⚠️ 需要配置飞书API密钥才能获取真实内容\n\n这里是模拟的文档内容...`,
        isSimulated: true
      })
    }
    
    console.log('✅ 环境变量已配置，开始解析...')
    const docId = extractDocId(url)
    console.log('📄 提取的文档ID:', docId)
    
    const token = await getFeishuToken()
    console.log('🔑 获取Token成功')
    
    const content = await parseFeishuDocContent(docId, token)
    
    return NextResponse.json({
      content: content + `\n\n> 来源：${url}\n\n✅ 已成功解析飞书文档内容`,
      isSimulated: false
    })
    
  } catch (error) {
    console.error('❌ API路由错误:', error)
    return NextResponse.json(
      { error: `解析失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    )
  }
} 