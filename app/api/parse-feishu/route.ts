import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { request as rawRequest } from "undici";
import { unzipSync, strFromU8 } from 'fflate';

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
    token: string;
    width?: number;
    height?: number;
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

  const json = await res.json();
  console.log(`批量获取临时URL响应: ${JSON.stringify(json)}`);

  if (json.code !== 0) {
    throw new Error(`飞书错误 ${json.code}: ${json.msg || "未知错误"}`);
  }

  return json.data.tmp_download_urls;
}

// 将图片URL转换为base64
async function downloadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url); // 注意：下载时不要再添加Authorization头

    if (!response.ok) {
      console.error("下载图片失败:", response.status, response.statusText);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("下载图片时出错:", error);
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

// 处理图片块
function processImageBlock(block: FeishuBlock): string {
  try {
    // 简化处理，只返回图片占位符
    return `<p>🖼️ [图片内容 - ID: ${block.block_id}]</p>\n`;
  } catch (error) {
    console.error("处理图片块时出错:", error);
    return `<p>🖼️ [图片处理错误]</p>\n`;
  }
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

        case 16: // 图片
          content += processImageBlock(block);
          stats.images++;
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
          content += `<p>[未知内容块 - 类型: ${block.block_type}]</p>\n`;
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
  const res = await fetch('https://open.feishu.cn/open-apis/drive/v1/export_tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tenantToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_token: fileToken,
      file_extension: 'docx',           // ← 官方字段叫 file_extension
    }),
  });

  const j = await res.json();
  if (j.code !== 0) {
    throw new Error(`创建导出任务失败: ${j.msg}`);
  }
  return j.data.ticket;                // 返回任务 ticket
}

// 轮询导出任务状态并获取下载地址
async function pollExportTask(
  ticket: string,
  tenantToken: string,
): Promise<string /*downloadUrl*/> {
  const url = `https://open.feishu.cn/open-apis/drive/v1/export_tasks/${ticket}`;
  for (let i = 0; i < 20; i++) {          // 最多等 20×500ms = 10s
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${tenantToken}` },
    });
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

// 解析旧版docs格式文档 (使用export API)
async function parseDocsContent(
  docId: string,
  token: string,
): Promise<string> {
  try {
    console.log("使用旧版docs文档解析方式");
    
    // 获取tenant token (Bearer格式)
    const tenantToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    // 创建导出任务
    const ticket = await createExportTask(docId, tenantToken);
    console.log("🎫 创建导出任务成功, ticket:", ticket);
    
    // 轮询获取下载链接
    const downloadUrl = await pollExportTask(ticket, tenantToken);
    console.log("📥 获取下载链接成功:", downloadUrl);
    
    // 下载并转换为Markdown
    return await downloadDocxAndToMd(downloadUrl);
  } catch (error) {
    console.error("解析旧版docs文档失败:", error);
    throw error;
  }
}

// POST 处理函数
export async function POST(req: NextRequest) {
  try {
    console.log("🔍 服务器端调试信息:");
    
    // 检查环境变量
    console.log("FEISHU_APP_ID:", FEISHU_CONFIG.app_id);
    if (FEISHU_CONFIG.app_secret) {
      console.log("FEISHU_APP_SECRET:", "已配置");
    } else {
      console.log("FEISHU_APP_SECRET:", "未配置");
      return NextResponse.json(
        { error: "缺少飞书API凭证" },
        { status: 500 }
      );
    }
    
    console.log("✅ 环境变量已配置，开始解析...");
    
    // 获取请求数据
    const data = await req.json();
    const url = data.url;
    
    if (!url) {
      return NextResponse.json(
        { error: "缺少链接URL" },
        { status: 400 }
      );
    }
    
    console.log("🔗 收到请求链接:", url);
    
    // 解析飞书文档链接
    const parseResult = parseFeishuLink(url);
    
    console.log("🔄 解析链接结果:", parseResult);
    
    if (!parseResult) {
      return NextResponse.json(
        { error: "无效的飞书文档链接" },
        { status: 400 }
      );
    }
    
    const { kind, token: docId } = parseResult;
    console.log("🔑 文档Token:", docId);
    
    // 获取访问令牌
    const accessToken = await getFeishuAccessToken();
    
    // 解析文档内容
    const content = await parseFeishuDocContent(docId, accessToken, kind);
    
    // 统计文档内容
    const stats = countContentElements(content);
    console.log("📊 解析统计:", stats);
    
    return NextResponse.json({ content, stats });
  } catch (error: any) {
    console.error("解析失败:", error);
    return NextResponse.json(
      { error: error.message || "解析过程中发生错误" },
      { status: 500 }
    );
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
