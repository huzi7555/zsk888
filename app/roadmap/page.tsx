import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const roadmapContent = `
# Roadmap for tma · Knowledge Copilot

## Q3 2025
- **增强 AI 功能**: 引入更高级的 AI 模型，支持多模态输入（图片、音频）。
- **内容搜索优化**: 实现全文搜索和语义搜索，提高搜索准确性。
- **协作编辑**: 支持多人实时协作编辑文档。

## Q4 2025
- **导出功能**: 支持将知识片段导出为多种格式（PDF, Markdown, Word）。
- **移动端应用**: 发布 iOS 和 Android 移动应用。
- **插件系统**: 开放 API，允许第三方开发者创建插件。

## 2026
- **知识图谱可视化**: 将知识片段关联起来，形成可视化知识图谱。
- **智能推荐系统**: 根据用户习惯和内容关联，智能推荐相关知识。
- **离线模式**: 支持离线查看和编辑部分内容。
`

export default function RoadmapPage() {
  return (
    <div className="py-8 px-4 min-h-screen">
      {" "}
      {/* Removed explicit background */}
      <section className="mx-auto w-full max-w-[1200px] px-10 py-8 bg-white/70 backdrop-blur rounded-2xl shadow-xl shadow-black/5 ring-1 ring-white/30 relative dark:bg-gray-800/70 dark:ring-gray-700/30">
        <div className="prose max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{roadmapContent}</ReactMarkdown>
        </div>
      </section>
    </div>
  )
}
