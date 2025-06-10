"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Image, 
  Video, 
  Link, 
  Table, 
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Eye,
  Copy,
  Tag,
  Plus,
  X,
  Sparkles,
  Loader2
} from "lucide-react"

interface ParsedContent {
  title: string
  content: string
  images: { url: string; alt: string; fileToken: string }[]
  videos: { url: string; title: string; fileToken: string }[]
  embeddedDocs: { title: string; url: string; content?: string }[]
  externalLinks: { url: string; title: string; description: string; image?: string }[]
  tables: any[]
  attachments: { name: string; url: string; fileToken: string }[]
}

interface ParsePreviewProps {
  content?: ParsedContent
  isLoading?: boolean
  error?: string
  onTagsChange?: (manualTags: string[], autoTags: string[]) => void
  initialManualTags?: string[]
  initialAutoTags?: string[]
}

interface TagChipProps {
  label: string
  variant?: 'manual' | 'auto'
  removable?: boolean
  onRemove?: () => void
  onClick?: () => void
}

function TagChip({ label, variant = 'manual', removable = false, onRemove, onClick }: TagChipProps) {
  const baseClasses = "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors"
  const manualClasses = "bg-blue-100 text-blue-800 hover:bg-blue-200"
  const autoClasses = "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
  
  return (
    <span 
      className={`${baseClasses} ${variant === 'manual' ? manualClasses : autoClasses} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {variant === 'auto' && <Sparkles className="h-3 w-3" />}
      {label}
      {removable && onRemove && (
        <X 
          className="h-3 w-3 cursor-pointer hover:text-red-600" 
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        />
      )}
    </span>
  )
}

export function ParsePreview({ 
  content, 
  isLoading, 
  error, 
  onTagsChange,
  initialManualTags = [],
  initialAutoTags = []
}: ParsePreviewProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'links' | 'docs' | 'tags'>('content')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [manualTags, setManualTags] = useState<string[]>(initialManualTags)
  const [autoTags, setAutoTags] = useState<string[]>(initialAutoTags)
  const [newTagInput, setNewTagInput] = useState('')
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)

  // 当父组件传入标签时，更新本地状态
  useEffect(() => {
    setManualTags(initialManualTags)
  }, [initialManualTags])

  useEffect(() => {
    setAutoTags(initialAutoTags)
  }, [initialAutoTags])

  // 自动生成AI标签
  useEffect(() => {
    if (content && content.content && autoTags.length === 0) {
      generateAutoTags()
    }
  }, [content])

  const generateAutoTags = async () => {
    if (!content) return
    
    setIsGeneratingTags(true)
    try {
      const response = await fetch('/api/extract-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.content,
          title: content.title
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAutoTags(data.autoTags || [])
        onTagsChange?.(manualTags, data.autoTags || [])
      }
    } catch (error) {
      console.error('AI标签生成失败:', error)
    } finally {
      setIsGeneratingTags(false)
    }
  }

  const addManualTag = () => {
    if (newTagInput.trim() && !manualTags.includes(newTagInput.trim())) {
      const newTags = [...manualTags, newTagInput.trim()]
      setManualTags(newTags)
      setNewTagInput('')
      onTagsChange?.(newTags, autoTags)
    }
  }

  const removeManualTag = (tag: string) => {
    const newTags = manualTags.filter(t => t !== tag)
    setManualTags(newTags)
    onTagsChange?.(newTags, autoTags)
  }

  const removeAutoTag = (tag: string) => {
    const newTags = autoTags.filter(t => t !== tag)
    setAutoTags(newTags)
    onTagsChange?.(manualTags, newTags)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addManualTag()
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">正在解析飞书文档...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardContent className="p-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">解析失败</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!content) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <FileText className="mx-auto h-12 w-12 mb-2" />
            <p>请输入飞书文档链接开始解析</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const tabs = [
    { id: 'content', label: '内容', icon: FileText, count: null },
    { id: 'tags', label: '标签', icon: Tag, count: manualTags.length + autoTags.length },
    { id: 'media', label: '媒体', icon: Image, count: content.images.length + content.videos.length },
    { id: 'links', label: '链接', icon: ExternalLink, count: content.externalLinks.length },
    { id: 'docs', label: '内嵌文档', icon: FileText, count: content.embeddedDocs.length }
  ] as const

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{content.title}</span>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              📊 已解析
            </Badge>
          </div>
        </CardTitle>
        
        {/* 统计信息 */}
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          {content.images.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <Image className="h-3 w-3" />
              {content.images.length} 张图片
            </Badge>
          )}
          {content.videos.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <Video className="h-3 w-3" />
              {content.videos.length} 个视频
            </Badge>
          )}
          {content.externalLinks.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <Link className="h-3 w-3" />
              {content.externalLinks.length} 个链接
            </Badge>
          )}
          {content.embeddedDocs.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              {content.embeddedDocs.length} 个内嵌文档
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* 标签页导航 */}
        <div className="flex space-x-1 mb-4 border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* 内容展示 */}
        <div className="space-y-4">
          {activeTab === 'content' && (
            <div className="prose max-w-none">
              <div 
                className="text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-6">
              {/* 手动标签管理 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">手动标签</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {manualTags.map(tag => (
                    <TagChip
                      key={tag}
                      label={tag}
                      variant="manual"
                      removable
                      onRemove={() => removeManualTag(tag)}
                    />
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="添加标签..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={addManualTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* AI自动标签 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">AI 智能标签</span>
                  {isGeneratingTags && (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {autoTags.map(tag => (
                    <TagChip
                      key={tag}
                      label={tag}
                      variant="auto"
                      removable
                      onRemove={() => removeAutoTag(tag)}
                    />
                  ))}
                </div>
                
                {autoTags.length === 0 && !isGeneratingTags && (
                  <Button 
                    onClick={generateAutoTags} 
                    variant="outline" 
                    size="sm"
                    className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    生成智能标签
                  </Button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* 图片部分 */}
              {content.images.length > 0 && (
                <div>
                  <div 
                    className="flex items-center gap-2 cursor-pointer mb-3"
                    onClick={() => toggleSection('images')}
                  >
                    {expandedSections.images ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                    <Image className="h-4 w-4" />
                    <span className="font-medium">图片 ({content.images.length})</span>
                  </div>
                  
                  {expandedSections.images && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      {content.images.map((img, idx) => (
                        <div key={idx} className="border rounded-lg overflow-hidden">
                          <img 
                            src={img.url} 
                            alt={img.alt}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-2 text-xs text-gray-600">
                            <p className="truncate">{img.alt}</p>
                            <button className="text-blue-600 hover:underline mt-1">
                              查看原图
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 视频部分 */}
              {content.videos.length > 0 && (
                <div>
                  <div 
                    className="flex items-center gap-2 cursor-pointer mb-3"
                    onClick={() => toggleSection('videos')}
                  >
                    {expandedSections.videos ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                    <Video className="h-4 w-4" />
                    <span className="font-medium">视频 ({content.videos.length})</span>
                  </div>
                  
                  {expandedSections.videos && (
                    <div className="space-y-3 ml-6">
                      {content.videos.map((video, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Video className="h-8 w-8 text-gray-400" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{video.title}</p>
                              <p className="text-xs text-gray-500">视频文件</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                预览
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                下载
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-3">
              {content.externalLinks.map((link, idx) => (
                <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    {link.image && (
                      <img 
                        src={link.image} 
                        alt=""
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 truncate">{link.title}</h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{link.description}</p>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate block"
                      >
                        {link.url}
                      </a>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
              
              {content.externalLinks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Link className="mx-auto h-12 w-12 mb-2" />
                  <p>暂无外部链接</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-3">
              {content.embeddedDocs.map((doc, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{doc.title}</h4>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        查看原文档
                      </a>
                    </div>
                  </div>
                  {doc.content && (
                    <div className="mt-3 pt-3 border-t">
                      <div 
                        className="text-xs text-gray-600 prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: doc.content }}
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {content.embeddedDocs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 mb-2" />
                  <p>暂无内嵌文档</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
