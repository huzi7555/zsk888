"use client"
import { useState } from "react"
import type React from "react"

import { Search, Check } from "lucide-react"

export function InboxToolbar({
  tags,
  setFilteredClips,
}: {
  tags: string[]
  setFilteredClips: (query: string, tag: string) => void
}) {
  const [query, setQuery] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value
    setQuery(searchQuery)
    // 触发过滤功能
    setFilteredClips(searchQuery, "")
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder="搜索待整理条目…"
          className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
        />
      </div>

      {/* 标签过滤按钮 */}
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, 4).map((tag) => (
          <button
            key={tag}
            onClick={() => setFilteredClips(query, tag)}
            className="px-3 py-1.5 text-xs rounded-full border bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      <button className="flex items-center gap-1 h-10 px-4 rounded-md bg-black text-white text-sm hover:bg-gray-800 transition-colors">
        <Check size={16} /> 全部确认
      </button>
    </div>
  )
}
