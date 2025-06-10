"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Tag, 
  Clock, 
  Eye, 
  MoreHorizontal,
  ExternalLink,
  Loader2,
  FileText,
  Brain,
  Archive,
  Trash2,
  Edit
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Clip, useStore } from '../store'

interface DocumentCardProps {
  clip: Clip
  onClick?: () => void
}

export function DocumentCard({ clip, onClick }: DocumentCardProps) {
  const { startAIAnalysis, updateAIAnalysis, updateClipStatus, deleteClip } = useStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleStartAnalysis = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
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

  const getStatusBadge = () => {
    switch (clip.status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">待处理</Badge>
      case 'analyzing':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            分析中
          </Badge>
        )
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600">已完成</Badge>
      case 'archived':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">已归档</Badge>
      default:
        return null
    }
  }

  const getSourceIcon = () => {
    switch (clip.sourceType) {
      case 'feishu':
        return '🪶'
      case 'tencent':
        return '🐧'
      default:
        return '📝'
    }
  }

  const hasAIAnalysis = clip.aiAnalysis && !clip.aiAnalysis.isAnalyzing
  const canStartAnalysis = clip.status === 'pending' || (clip.status === 'completed' && !hasAIAnalysis)

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-medium truncate pr-2 group-hover:text-blue-600 transition-colors">
            {getSourceIcon()} {clip.title}
          </CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusBadge()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    window.location.href = `/clip/${clip.id}`
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  查看详情
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    if (clip.originalUrl) {
                      window.open(clip.originalUrl, '_blank')
                    }
                  }}
                  disabled={!clip.originalUrl}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  打开原文档
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    updateClipStatus(clip.id, clip.status === 'archived' ? 'completed' : 'archived')
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {clip.status === 'archived' ? '取消归档' : '归档'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('确定要删除这个文档吗？此操作无法撤销。')) {
                      deleteClip(clip.id)
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* AI分析摘要 */}
        {hasAIAnalysis && clip.aiAnalysis && (
          <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800 line-clamp-2">
              💡 {clip.aiAnalysis.quickSummary}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* 基础摘要 */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {clip.summary}
        </p>

        {/* 标签区域 */}
        <div className="space-y-2 mb-3">
          {/* 手动标签 */}
          {clip.manualTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {clip.manualTags.slice(0, 3).map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {clip.manualTags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{clip.manualTags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* AI标签 */}
          {clip.autoTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {clip.autoTags.slice(0, 3).map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {clip.autoTags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{clip.autoTags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {clip.createdAt}
            </span>
            {clip.originalUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-gray-500 hover:text-blue-600"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(clip.originalUrl, '_blank')
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                原文档
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* AI分析按钮 */}
            {canStartAnalysis && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                onClick={handleStartAnalysis}
                disabled={isAnalyzing || clip.status === 'analyzing'}
              >
                {isAnalyzing || clip.status === 'analyzing' ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    分析中
                  </>
                ) : (
                  <>
                    <Brain className="h-3 w-3 mr-1" />
                    AI分析
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = `/clip/${clip.id}`
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              查看
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 