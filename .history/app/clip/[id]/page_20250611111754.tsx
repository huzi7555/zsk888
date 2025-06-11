"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TagChip } from "@/app/components/TagChip"
import RichViewer from "@/app/components/RichViewer"
import { useStore } from "@/app/store"
import { fakeTagSuggest } from "@/app/utils/aiFake"

function useClipAndRelated(id: string) {
  const { clips, init } = useStore()
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    init()
    setIsInitialized(true)
  }, [init])
  
  const clip = clips.find((c) => c.id === id)
  const related = clip ? clips
    .filter((c) => c.id !== id)
    .sort((a, b) => {
      const clipTags = [...(clip?.manualTags || []), ...(clip?.autoTags || [])]
      const overlapA = fakeTagSuggest(a.content).filter((t) => clipTags.includes(t)).length
      const overlapB = fakeTagSuggest(b.content).filter((t) => clipTags.includes(t)).length
      return overlapB - overlapA
    })
    .slice(0, 3) : []
    
  return { clip, related, isInitialized }
}

export default function ClipDetailPage({ params }: { params: { id: string } }) {
  const { clip, related, isInitialized } = useClipAndRelated(params.id)

  // 只有在初始化完成后，如果还找不到文档才重定向
  if (isInitialized && !clip) {
    redirect("/inbox")
  }

  // 如果还没初始化，显示加载状态
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 如果找不到文档，不应该渲染页面内容
  if (!clip) {
    return null
  }

  return (
    <main className="min-h-screen flex">
      {" "}
      {/* Removed explicit background */}
      <div className="flex-1 overflow-y-auto px-10 py-8">
        <div className="mx-auto w-full max-w-[800px] bg-white rounded-2xl shadow-lg px-8 py-6 relative dark:bg-gray-800">
          {/* SimplifiedNewButton removed, now handled by AppHeader */}
          {/* <SimplifiedNewButton /> */}
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/inbox"
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft size={20} />
              <span className="ml-1 text-sm">返回</span>
            </Link>
          </div>

          {/* 标签显示 */}
          <div className="mb-4 space-y-2">
            {/* 手动标签 */}
            {clip.manualTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 mr-2">🏷️ 手动标签:</span>
                {clip.manualTags.map((tag: string) => (
                  <TagChip key={`manual-${tag}`} label={tag} />
                ))}
              </div>
            )}
            
            {/* AI标签 */}
            {clip.autoTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 mr-2">✨ AI标签:</span>
                {clip.autoTags.map((tag: string) => (
                  <TagChip key={`auto-${tag}`} label={tag} />
            ))}
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-4 dark:text-gray-100">{clip.title}</h1>
          <RichViewer html={clip.content} />
        </div>
      </div>
      <aside className="w-80 pl-8 pr-6 py-8 border-l border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
        {/* AI分析结果 */}
        {clip.aiAnalysis && !clip.aiAnalysis.isAnalyzing ? (
          <div className="space-y-6">
            {/* 极速摘要 */}
            <div>
              <h4 className="font-medium mb-3 text-blue-600 dark:text-blue-400 flex items-center">
                ⚡ 极速摘要 (50字)
              </h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                  {clip.aiAnalysis.quickSummary}
                </p>
              </div>
            </div>

            {/* 详细摘要 */}
            <div>
              <h4 className="font-medium mb-3 text-purple-600 dark:text-purple-400 flex items-center">
                📄 详细摘要 (200字)
              </h4>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed whitespace-pre-line">
                  {clip.aiAnalysis.detailedSummary}
                </p>
              </div>
            </div>

            {/* 章节概括 */}
            {clip.aiAnalysis.sections && clip.aiAnalysis.sections.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-green-600 dark:text-green-400 flex items-center">
                  📋 章节概括
                </h4>
                <div className="space-y-2">
                  {clip.aiAnalysis.sections.map((section, index) => (
                    <div 
                      key={section.id}
                      className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <h5 className="font-medium text-sm text-green-800 dark:text-green-300 mb-1">
                        {index + 1}. {section.title}
                      </h5>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        {section.summary}
                      </p>
                      <button
                        onClick={() => {
                          // 滚动到对应章节（如果有锚点）
                          const element = document.querySelector(section.anchor);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="text-xs text-green-600 dark:text-green-400 hover:underline mt-1"
                      >
                        🔗 跳转到章节
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : clip.aiAnalysis?.isAnalyzing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">AI正在分析中...</p>
          </div>
        ) : (
          <div>
            <h4 className="font-medium mb-3 dark:text-gray-100">💡 提示</h4>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                这篇文档还没有AI分析结果。点击"开始AI分析"来生成智能摘要和章节概括。
              </p>
            </div>
            
            {/* 旧版摘要作为备用显示 */}
            {clip.summary && (
              <div>
                <h4 className="font-medium mb-2 dark:text-gray-100">📝 基础摘要</h4>
        <p className="text-sm text-gray-700 mb-6 whitespace-pre-line dark:text-gray-300">{clip.summary}</p>
              </div>
            )}
          </div>
        )}

        {/* 相关推荐 */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-3 dark:text-gray-100">🔗 相关推荐</h4>
          {related.length > 0 ? (
            related.map((c) => (
          <Link
            key={c.id}
            href={`/clip/${c.id}`}
            className="block text-sm text-blue-600 mb-2 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            • {c.title}
          </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">暂无相关推荐</p>
          )}
        </div>
      </aside>
    </main>
  )
}
