"use client"
import { InboxToolbar } from "@/app/components/InboxToolbar"
import { ClipCard } from "@/app/components/ClipCard"
import { GroupHeader } from "@/app/components/GroupHeader"
// import { SimplifiedNewButton } from "@/app/components/SimplifiedNewButton" // Removed
import { useStore } from "@/app/store"
import type { Clip } from "@/app/store"

function groupByDate(clips: Clip[]) {
  return clips.reduce<Record<string, Clip[]>>((acc, clip) => {
    ;(acc[clip.createdAt] = acc[clip.createdAt] || []).push(clip)
    return acc
  }, {})
}

export default function InboxPage() {
  const { filteredClips, tags, setFilteredClips } = useStore()
  const grouped = groupByDate(filteredClips)
  const pendingCount = filteredClips.length
  const archivedCount = 12 // 假数据

  return (
    <div className="py-8 px-4 min-h-screen">
      {" "}
      {/* Removed explicit background */}
      <section className="mx-auto w-full max-w-[1200px] px-10 py-8 bg-white/70 backdrop-blur rounded-2xl shadow-xl shadow-black/5 ring-1 ring-white/30 relative overflow-visible dark:bg-gray-800/70 dark:ring-gray-700/30">
        {/* 新建按钮 - 确保容器不会裁剪按钮 - REMOVED, now in AppHeader */}
        {/* <SimplifiedNewButton /> */}

        {/* === Sticky 头部：标题 + 统计 + 工具条 === */}
        <div className="sticky top-0 z-10 -mx-10 bg-white/60 backdrop-blur shadow-sm rounded-t-2xl dark:bg-gray-800/60 dark:shadow-gray-950/20">
          {/* 主/副标题 + 统计 */}
          <div className="flex flex-wrap items-center justify-between px-10 pt-4 pr-20">
            <div>
              <h1 className="flex items-center text-xl font-semibold text-gray-900 dark:text-gray-100">
                📥 收件箱
                <span className="inline-flex items-center ml-4 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  Pending&nbsp;{pendingCount}
                </span>
                <span className="inline-flex items-center ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  已归档&nbsp;{archivedCount}
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">管理和整理您收集的知识片段</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-200 mt-4 mb-4 dark:border-gray-700" />

          {/* 工具条 */}
          <div className="px-10 pb-4">
            <InboxToolbar tags={tags} setFilteredClips={setFilteredClips} />
          </div>
        </div>

        {/* === 列表区 === */}
        <div className="mt-6">
          {Object.keys(grouped).length ? (
            Object.entries(grouped)
              .sort(([a], [b]) => b.localeCompare(a)) // 按日期倒序排列
              .map(([date, clips]) => (
                <div key={date}>
                  <GroupHeader date={date} />
                  <div className="space-y-6">
                    {clips.map((c) => (
                      <ClipCard key={c.id} clip={c} />
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <div className="flex flex-col items-center pt-24 text-gray-400 dark:text-gray-500">
              <span className="text-6xl mb-4">🔍</span>
              <p className="text-sm">没有找到匹配的条目，尝试其他搜索词或标签</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
