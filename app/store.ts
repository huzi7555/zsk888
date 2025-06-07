import { create } from "zustand"

// 模拟数据
const mockClips = [
  {
    id: "1",
    title: "React 图片优化技巧：使用 Next.js Image 组件提升性能",
    tags: ["前端", "性能", "React"],
    createdAt: "2025-06-05",
    content:
      "<p>在使用 Next.js 时，推荐使用内置的 Image 组件来自动优化图片。它会根据屏幕分辨率和设备像素比，动态生成合适尺寸的图像。</p>",
    summary: "介绍如何使用 Next.js Image 组件进行图片优化，提升网站性能。",
  },
  {
    id: "2",
    title: "AI prompt 模板收集：提升 ChatGPT 对话效果的实用技巧",
    tags: ["AI", "写作", "工具"],
    createdAt: "2025-06-03",
    content: "<p>一个好的 prompt 模板能帮助 AI 更准确地理解需求。常见做法是明确任务、提供上下文、要求格式。</p>",
    summary: "收集了提升 ChatGPT 对话效果的实用 prompt 模板和技巧。",
  },
  {
    id: "3",
    title: "TypeScript 高级类型应用：泛型约束与条件类型详解",
    tags: ["TypeScript", "前端", "编程"],
    createdAt: "2025-06-01",
    content: "<p>TypeScript 的高级类型系统提供了强大的类型推导和约束能力，包括泛型约束和条件类型。</p>",
    summary: "深入讲解 TypeScript 高级类型系统中的泛型约束与条件类型应用。",
  },
  {
    id: "4",
    title: "设计系统构建指南：从组件库到设计规范的完整流程",
    tags: ["设计", "UI/UX", "系统"],
    createdAt: "2025-05-30",
    content: "<p>构建设计系统需要从组件库设计开始，建立统一的设计规范和开发流程。</p>",
    summary: "完整介绍了设计系统的构建流程，从组件库到设计规范的实施。",
  },
]

interface Clip {
  id: string
  title: string
  tags: string[]
  createdAt: string
  content: string
  summary: string
}

interface UploadedContent {
  title: string
  paragraphs: string[]
  images: string[]
  videos: string[]
  links: { href: string; title: string }[]
  tags: string[]
  content: string
  summary: string
}

interface StoreState {
  clips: Clip[]
  tags: string[]
  filteredClips: Clip[]
  setFilteredClips: (searchQuery?: string, tag?: string) => void
  addUploadedContent: (content: UploadedContent) => void
  updateClipTags: (id: string, tags: string[]) => void
}

const useStore = create<StoreState>((set, get) => ({
  clips: mockClips,
  tags: ["前端", "性能", "React", "AI", "写作", "工具", "TypeScript", "设计", "UI/UX", "编程", "系统"],
  filteredClips: mockClips,

  setFilteredClips: (searchQuery = "", tag = "") => {
    let filtered = mockClips
    // 按关键词过滤
    if (searchQuery) {
      filtered = filtered.filter((clip) => clip.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    // 按标签过滤
    if (tag) {
      filtered = filtered.filter((clip) => clip.tags.includes(tag))
    }
    set({ filteredClips: filtered })
  },

  addUploadedContent: (content: UploadedContent) => {
    const now = new Date().toISOString().split("T")[0] // Get YYYY-MM-DD format
    const newClip: Clip = {
      id: Date.now().toString(),
      title: content.title,
      tags: content.tags, // Use tags from content, which now includes autoTags
      createdAt: now, // Use the current date
      content: content.content,
      summary: content.summary,
    }

    const currentClips = get().clips
    const updatedClips = [newClip, ...currentClips]

    // Update all tags
    const allTags = Array.from(new Set([...get().tags, ...content.tags]))

    set({
      clips: updatedClips,
      filteredClips: updatedClips,
      tags: allTags,
    })
  },

  updateClipTags: (id: string, tags: string[]) => {
    const currentClips = get().clips
    const updatedClips = currentClips.map((clip) => (clip.id === id ? { ...clip, tags } : clip))

    set({
      clips: updatedClips,
      filteredClips: updatedClips,
    })
  },
}))

export { useStore }
export type { Clip }
