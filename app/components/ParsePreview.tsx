"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Copy
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
}

export function ParsePreview({ content, isLoading, error }: ParsePreviewProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'links' | 'docs'>('content')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

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
                    <div className="space-y-2 ml-6">
                      {content.videos.map((video, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Video className="h-5 w-5 text-gray-400" />
                            <span className="text-sm">{video.title}</span>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            播放
                          </Button>
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
                <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 hover:text-blue-600">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          {link.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </h4>
                      {link.description && (
                        <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{link.url}</p>
                    </div>
                    {link.image && (
                      <img 
                        src={link.image} 
                        alt={link.title}
                        className="w-16 h-16 object-cover rounded ml-4"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-4">
              {content.embeddedDocs.map((doc, idx) => (
                <div key={idx} className="border rounded-lg">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => toggleSection(`doc-${idx}`)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedSections[`doc-${idx}`] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{doc.title}</h4>
                        <p className="text-xs text-gray-500">{doc.url}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      打开
                    </Button>
                  </div>
                  
                  {expandedSections[`doc-${idx}`] && doc.content && (
                    <div className="px-4 pb-4 border-t bg-gray-50">
                      <div 
                        className="text-sm text-gray-700 mt-3"
                        dangerouslySetInnerHTML={{ __html: doc.content }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
