import { create } from "zustand"

// 章节概括数据结构
interface SectionSummary {
  id: string
  title: string
  summary: string
  anchor: string // 用于锚点定位
  level: number // 标题级别 (1-6)
}

// AI分析结果数据结构
interface AIAnalysis {
  quickSummary: string // 极速摘要 (50字)
  detailedSummary: string // 详细摘要 (≤200字)
  sections: SectionSummary[] // 章节概括
  isAnalyzing: boolean // 是否正在分析
  analyzedAt?: string // 分析完成时间
}

// 更新Clip接口
interface Clip {
  id: string
  title: string
  manualTags: string[] // 手动标签
  autoTags: string[] // AI自动标签
  createdAt: string
  content: string
  summary: string // 基础摘要（保持兼容性）
  aiAnalysis?: AIAnalysis // AI分析结果
  status: 'pending' | 'analyzing' | 'completed' | 'archived' // 文档状态
  sourceType?: 'feishu' | 'tencent' | 'manual' // 来源类型
  originalUrl?: string // 原始链接
}

interface UploadedContent {
  title: string
  content: string
  tags: string[]
  autoTags?: string[]
  summary: string
  sourceType?: 'feishu' | 'tencent' | 'manual'
  originalUrl?: string
}

interface StoreState {
  clips: Clip[]
  tags: string[]
  filteredClips: Clip[]
  currentSearchQuery: string
  currentTag: string
  init: () => void
  setFilteredClips: (searchQuery?: string, tag?: string) => void
  addUploadedContent: (content: UploadedContent) => Promise<string>
  updateClipTags: (id: string, tags: string[]) => void
  startAIAnalysis: (id: string) => void
  updateAIAnalysis: (id: string, analysis: Partial<AIAnalysis>) => void
  addManualTag: (id: string, tag: string) => void
  removeManualTag: (id: string, tag: string) => void
  updateAutoTags: (id: string, tags: string[]) => void
  updateClipStatus: (id: string, status: Clip['status']) => void
  deleteClip: (id: string) => void
  applyCurrentFilters: () => void
}

// 模拟数据 - 更新为新的数据结构
const mockClips: Clip[] = [
  {
    id: "1",
    title: "React 图片优化技巧：使用 Next.js Image 组件提升性能",
    manualTags: ["前端", "性能"],
    autoTags: ["React", "Next.js", "优化"],
    createdAt: "2025-06-05",
    content:
      "<p>在使用 Next.js 时，推荐使用内置的 Image 组件来自动优化图片。它会根据屏幕分辨率和设备像素比，动态生成合适尺寸的图像。</p>",
    summary: "介绍如何使用 Next.js Image 组件进行图片优化，提升网站性能。",
    status: 'completed',
    sourceType: 'feishu',
    aiAnalysis: {
      quickSummary: "使用Next.js Image组件可以自动优化图片，提升性能。",
      detailedSummary: "在现代Web开发中，图片优化是提升用户体验的重要环节。Next.js提供的Image组件能够根据用户设备自动生成最合适的图片格式和尺寸，包括WebP转换、懒加载、响应式处理等功能，有效减少带宽消耗和加载时间。",
      sections: [
        {
          id: "section-1",
          title: "Image组件基础用法",
          summary: "介绍Image组件的基本使用方法和配置选项",
          anchor: "#基础用法",
          level: 2
        }
      ],
      isAnalyzing: false,
      analyzedAt: "2025-06-05T10:30:00Z"
    }
  },
  {
    id: "2",
    title: "AI prompt 模板收集：提升 ChatGPT 对话效果的实用技巧",
    manualTags: ["AI", "写作"],
    autoTags: ["ChatGPT", "模板", "技巧"],
    createdAt: "2025-06-03",
    content: "<p>一个好的 prompt 模板能帮助 AI 更准确地理解需求。常见做法是明确任务、提供上下文、要求格式。</p>",
    summary: "收集了提升 ChatGPT 对话效果的实用 prompt 模板和技巧。",
    status: 'pending',
    sourceType: 'manual'
  },
  {
    id: "3",
    title: "TypeScript 高级类型应用：泛型约束与条件类型详解",
    manualTags: ["TypeScript", "前端"],
    autoTags: ["编程", "泛型", "类型系统"],
    createdAt: "2025-06-01",
    content: "<p>TypeScript 的高级类型系统提供了强大的类型推导和约束能力，包括泛型约束和条件类型。</p>",
    summary: "深入讲解 TypeScript 高级类型系统中的泛型约束与条件类型应用。",
    status: 'analyzing',
    sourceType: 'feishu',
    aiAnalysis: {
      quickSummary: "",
      detailedSummary: "",
      sections: [],
      isAnalyzing: true
    }
  },
  {
    id: "4",
    title: "设计系统构建指南：从组件库到设计规范的完整流程",
    manualTags: ["设计", "UI/UX"],
    autoTags: ["系统", "组件库", "规范"],
    createdAt: "2025-05-30",
    content: "<p>构建设计系统需要从组件库设计开始，建立统一的设计规范和开发流程。</p>",
    summary: "完整介绍了设计系统的构建流程，从组件库到设计规范的实施。",
    status: 'completed',
    sourceType: 'tencent'
  },
]

// 保存到localStorage
const saveToStorage = (clips: Clip[], tags: string[]) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('taskmaster-clips', JSON.stringify(clips))
    localStorage.setItem('taskmaster-tags', JSON.stringify(tags))
  } catch (error) {
    console.error('保存本地数据失败:', error)
  }
}

// 从localStorage加载数据（仅在客户端）
const loadFromStorage = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const savedClips = localStorage.getItem('taskmaster-clips')
    const savedTags = localStorage.getItem('taskmaster-tags')
    
    return {
      clips: savedClips ? JSON.parse(savedClips) : null,
      tags: savedTags ? JSON.parse(savedTags) : null
    }
  } catch (error) {
    console.error('加载本地数据失败:', error)
    return null
  }
}

const useStore = create<StoreState>((set, get) => ({
  clips: mockClips, // 始终从mockClips开始，避免水合错误
  tags: ["前端", "性能", "React", "AI", "写作", "工具", "TypeScript", "设计", "UI/UX", "编程", "系统"],
  filteredClips: mockClips,
  currentSearchQuery: "",
  currentTag: "",

  // 初始化函数，在客户端调用
  init: () => {
    const saved = loadFromStorage()
    if (saved && saved.clips && saved.tags) {
      set({
        clips: saved.clips,
        tags: saved.tags,
        filteredClips: saved.clips
      })
    }
  },

  applyCurrentFilters: () => {
    const { clips, currentSearchQuery, currentTag } = get()
    let filtered = clips
    
    // 按关键词过滤
    if (currentSearchQuery) {
      filtered = filtered.filter((clip) => 
        clip.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        clip.content.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        clip.manualTags.some(t => t.toLowerCase().includes(currentSearchQuery.toLowerCase())) ||
        clip.autoTags.some(t => t.toLowerCase().includes(currentSearchQuery.toLowerCase()))
      )
    }
    
    // 按标签过滤
    if (currentTag) {
      filtered = filtered.filter((clip) => 
        clip.manualTags.includes(currentTag) || clip.autoTags.includes(currentTag)
      )
    }
    
    set({ filteredClips: filtered })
  },

  setFilteredClips: (searchQuery = "", tag = "") => {
    set({ 
      currentSearchQuery: searchQuery, 
      currentTag: tag 
    })
    
    const { applyCurrentFilters } = get()
    applyCurrentFilters()
  },

  addUploadedContent: async (content: UploadedContent) => {
    const { clips: currentClips, tags: currentTags, currentSearchQuery, currentTag } = get()
    
    const now = new Date().toISOString().split("T")[0]
    const newClip: Clip = {
      id: Date.now().toString(),
      title: content.title,
      manualTags: content.tags || [],
      autoTags: content.autoTags || [],
      createdAt: now,
      content: content.content,
      summary: content.summary,
      status: 'pending',
      sourceType: content.sourceType || 'manual',
      originalUrl: content.originalUrl
    }

    const updatedClips = [newClip, ...currentClips]

    // 更新所有标签
    const allTagsSet = new Set(currentTags.concat(content.tags).concat(content.autoTags || []))
    const allTags = Array.from(allTagsSet)

    // 直接计算过滤结果
    let filtered = updatedClips
    
    if (currentSearchQuery) {
      filtered = filtered.filter((clip) => 
        clip.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        clip.content.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        clip.manualTags.some(t => t.toLowerCase().includes(currentSearchQuery.toLowerCase())) ||
        clip.autoTags.some(t => t.toLowerCase().includes(currentSearchQuery.toLowerCase()))
      )
    }
    
    if (currentTag) {
      filtered = filtered.filter((clip) => 
        clip.manualTags.includes(currentTag) || clip.autoTags.includes(currentTag)
      )
    }

    set({
      clips: updatedClips,
      tags: allTags,
      filteredClips: filtered
    })

    // 保存到本地存储
    saveToStorage(updatedClips, allTags)

    return newClip.id
  },

  updateClipTags: (id: string, tags: string[]) => {
    const currentClips = get().clips
    const updatedClips = currentClips.map((clip) => 
      clip.id === id ? { ...clip, manualTags: tags } : clip
    )

    set({
      clips: updatedClips,
    })

    // 重新应用过滤条件
    const { applyCurrentFilters } = get()
    applyCurrentFilters()
  },

  startAIAnalysis: (id: string) => {
    const currentClips = get().clips
    const updatedClips = currentClips.map((clip) => 
      clip.id === id ? { 
        ...clip, 
        status: 'analyzing' as const,
        aiAnalysis: {
          quickSummary: "",
          detailedSummary: "",
          sections: [],
          isAnalyzing: true
        }
      } : clip
    )

    set({
      clips: updatedClips,
    })

    // 重新应用过滤条件
    const { applyCurrentFilters } = get()
    applyCurrentFilters()
  },

  updateAIAnalysis: (id: string, analysis: Partial<AIAnalysis>) => {
    const { clips: currentClips, currentSearchQuery, currentTag } = get()
    const updatedClips = currentClips.map((clip) => 
      clip.id === id ? { 
        ...clip, 
        status: analysis.isAnalyzing === false ? 'completed' as const : clip.status,
        aiAnalysis: { 
          ...clip.aiAnalysis, 
          ...analysis,
          analyzedAt: analysis.isAnalyzing === false ? new Date().toISOString() : clip.aiAnalysis?.analyzedAt
        } as AIAnalysis
      } : clip
    )

    // 直接计算过滤结果
    let filtered = updatedClips
    
    if (currentSearchQuery) {
      filtered = filtered.filter((clip) => 
        clip.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        clip.content.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        clip.manualTags.some(t => t.toLowerCase().includes(currentSearchQuery.toLowerCase())) ||
        clip.autoTags.some(t => t.toLowerCase().includes(currentSearchQuery.toLowerCase()))
      )
    }
    
    if (currentTag) {
      filtered = filtered.filter((clip) => 
        clip.manualTags.includes(currentTag) || clip.autoTags.includes(currentTag)
      )
    }

    set({
      clips: updatedClips,
      filteredClips: filtered
    })

    // 保存到本地存储
    const { tags } = get()
    saveToStorage(updatedClips, tags)
  },

  addManualTag: (id: string, tag: string) => {
    const currentClips = get().clips
    const updatedClips = currentClips.map((clip) => 
      clip.id === id ? { 
        ...clip, 
        manualTags: clip.manualTags.concat(tag).filter((t, i, arr) => arr.indexOf(t) === i)
      } : clip
    )

    // 更新全局标签
    const allTagsSet = new Set(get().tags.concat([tag]))
    const allTags = Array.from(allTagsSet)

    set({
      clips: updatedClips,
      tags: allTags
    })

    // 重新应用过滤条件
    const { applyCurrentFilters } = get()
    applyCurrentFilters()
  },

  removeManualTag: (id: string, tag: string) => {
    const currentClips = get().clips
    const updatedClips = currentClips.map((clip) => 
      clip.id === id ? { 
        ...clip, 
        manualTags: clip.manualTags.filter(t => t !== tag)
      } : clip
    )

    set({
      clips: updatedClips,
    })

    // 重新应用过滤条件
    const { applyCurrentFilters } = get()
    applyCurrentFilters()
  },

  updateAutoTags: (id: string, tags: string[]) => {
    const currentClips = get().clips
    const updatedClips = currentClips.map((clip) => 
      clip.id === id ? { ...clip, autoTags: tags } : clip
    )

    // 更新全局标签
    const allTagsSet = new Set(get().tags.concat(tags))
    const allTags = Array.from(allTagsSet)

    set({
      clips: updatedClips,
      tags: allTags
    })

    // 重新应用过滤条件
    const { applyCurrentFilters } = get()
    applyCurrentFilters()
  },

  updateClipStatus: (id: string, status: Clip['status']) => {
    const currentClips = get().clips
    const updatedClips = currentClips.map((clip) => 
      clip.id === id ? { ...clip, status } : clip
    )

    set({
      clips: updatedClips,
    })

    // 重新应用过滤条件
    const { applyCurrentFilters } = get()
    applyCurrentFilters()
  },

  deleteClip: (id: string) => {
    const { clips: currentClips, tags: currentTags, currentSearchQuery, currentTag } = get()
    const updatedClips = currentClips.filter((clip) => clip.id !== id)

    // 直接计算过滤结果
    let filtered = updatedClips
    
    if (currentSearchQuery) {
      filtered = filtered.filter((clip) => 
        clip.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        clip.content.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        clip.manualTags.some(t => t.toLowerCase().includes(currentSearchQuery.toLowerCase())) ||
        clip.autoTags.some(t => t.toLowerCase().includes(currentSearchQuery.toLowerCase()))
      )
    }
    
    if (currentTag) {
      filtered = filtered.filter((clip) => 
        clip.manualTags.includes(currentTag) || clip.autoTags.includes(currentTag)
      )
    }

    set({
      clips: updatedClips,
      filteredClips: filtered
    })

    // 保存到本地存储
    saveToStorage(updatedClips, currentTags)
  },
}))

export { useStore }
export type { Clip, UploadedContent, AIAnalysis, SectionSummary }
