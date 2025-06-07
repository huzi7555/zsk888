"use client"

import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TagChip } from "@/app/components/TagChip"
import RichViewer from "@/app/components/RichViewer"
import { useStore } from "@/app/store"
import { fakeTagSuggest } from "@/app/utils/aiFake"

function useClipAndRelated(id: string) {
  const clips = useStore((s) => s.clips)
  const clip = clips.find((c) => c.id === id)
  const related = clips
    .filter((c) => c.id !== id)
    .sort((a, b) => {
      const overlapA = fakeTagSuggest(a.content).filter((t) => clip?.tags.includes(t)).length
      const overlapB = fakeTagSuggest(b.content).filter((t) => clip?.tags.includes(t)).length
      return overlapB - overlapA
    })
    .slice(0, 3)
  return { clip, related }
}

export default function ClipDetailPage({ params }: { params: { id: string } }) {
  const { clip, related } = useClipAndRelated(params.id)
  const updateClipTags = useStore((s) => s.updateClipTags)

  if (!clip) redirect("/inbox")

  const removeTag = (tagToRemove: string) => {
    const newTags = clip.tags.filter((tag) => tag !== tagToRemove)
    updateClipTags(clip.id, newTags)
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
          <div className="mb-4">
            {clip.tags.map((tag) => (
              <TagChip key={tag} label={tag} onRemove={() => removeTag(tag)} />
            ))}
          </div>

          <h1 className="text-2xl font-bold mb-4 dark:text-gray-100">{clip.title}</h1>
          <RichViewer html={clip.content} />
        </div>
      </div>
      <aside className="w-72 pl-8 pr-6 py-8 border-l border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
        <h4 className="font-medium mb-2 dark:text-gray-100">🧠 AI 摘要</h4>
        <p className="text-sm text-gray-700 mb-6 whitespace-pre-line dark:text-gray-300">{clip.summary}</p>
        <h4 className="font-medium mb-2 dark:text-gray-100">相关推荐</h4>
        {related.map((c) => (
          <Link
            key={c.id}
            href={`/clip/${c.id}`}
            className="block text-sm text-blue-600 mb-2 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            • {c.title}
          </Link>
        ))}
      </aside>
    </main>
  )
}
