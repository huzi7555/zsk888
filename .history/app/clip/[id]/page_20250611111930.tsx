"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { TagChip } from "@/app/components/TagChip"
import { useStore } from "@/app/store"
import { fakeTagSuggest } from "@/app/utils/aiFake"
import ArticleAnalysisLayout from "@/components/ArticleAnalysisLayout"

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
  const { startAIAnalysis, updateAIAnalysis } = useStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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

  // 处理AI分析
  const handleStartAnalysis = async () => {
    if (clip.status === 'analyzing' || isAnalyzing) return
    
    setIsAnalyzing(true)
    startAIAnalysis(clip.id)
    
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: clip.content,
          title: clip.title,
          clipId: clip.id
        })
      })
      
      if (response.ok) {
        const analysis = await response.json()
        updateAIAnalysis(clip.id, {
          quickSummary: analysis.quickSummary,
          detailedSummary: analysis.detailedSummary,
          sections: analysis.sections,
          isAnalyzing: false
        })
      } else {
        // 分析失败，重置状态
        updateAIAnalysis(clip.id, { isAnalyzing: false })
      }
    } catch (error) {
      console.error('AI分析失败:', error)
      updateAIAnalysis(clip.id, { isAnalyzing: false })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 处理AI对话（可选功能）
  const handleSendMessage = async (message: string): Promise<string> => {
    // 这里可以连接到实际的AI对话API
    // 暂时返回一个示例响应
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟延迟
    return `关于"${clip.title}"：这是一个示例回复。实际使用时需要连接到真实的AI API。用户问题：${message}`
  }

  // 构建文章元信息
  const articleMeta = (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium">创建时间:</span>
        <span>{clip.createdAt}</span>
      </div>
      
      {clip.sourceType && (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium">来源:</span>
          <span className="capitalize">
            {clip.sourceType === 'feishu' ? '🪶 飞书文档' : 
             clip.sourceType === 'tencent' ? '🐧 腾讯文档' : 
             '📝 手动输入'}
          </span>
        </div>
      )}

      {clip.originalUrl && (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium">原始链接:</span>
          <a 
            href={clip.originalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline truncate"
          >
            打开原文档
          </a>
        </div>
      )}

      {/* 标签信息 */}
      {(clip.manualTags.length > 0 || clip.autoTags.length > 0) && (
        <div className="space-y-2 pt-2 border-t">
          {clip.manualTags.length > 0 && (
            <div>
              <span className="text-xs font-medium block mb-1">🏷️ 手动标签:</span>
              <div className="flex flex-wrap gap-1">
                {clip.manualTags.map((tag) => (
                  <TagChip key={`manual-${tag}`} label={tag} />
                ))}
              </div>
            </div>
          )}
          
          {clip.autoTags.length > 0 && (
            <div>
              <span className="text-xs font-medium block mb-1">✨ AI标签:</span>
              <div className="flex flex-wrap gap-1">
                {clip.autoTags.map((tag) => (
                  <TagChip key={`auto-${tag}`} label={tag} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 相关推荐 */}
      {related.length > 0 && (
        <div className="pt-2 border-t">
          <span className="text-xs font-medium block mb-2">🔗 相关文档:</span>
          <div className="space-y-1">
            {related.map((relatedClip) => (
              <a
                key={relatedClip.id}
                href={`/clip/${relatedClip.id}`}
                className="block text-xs text-blue-600 hover:underline truncate"
              >
                • {relatedClip.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <ArticleAnalysisLayout
      article={{
        id: clip.id,
        title: clip.title,
        content: clip.content,
        meta: articleMeta,
        summary: clip.summary,
        aiAnalysis: clip.aiAnalysis,
        status: clip.status
      }}
      onStartAnalysis={handleStartAnalysis}
      onSendMessage={handleSendMessage}
    />
  )
}
