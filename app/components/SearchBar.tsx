"use client"
import { Link, Scissors, ChevronDown } from "lucide-react"

export function SearchBar() {
  return (
    <div className="relative max-w-[800px] w-full mt-10">
      <div className="flex items-center h-12 bg-white rounded-lg shadow-sm pl-12 pr-4">
        <input
          className="flex-1 outline-none placeholder-gray-400 text-sm"
          placeholder="🔍 精选 TED 演讲，推荐适合英语初学者的演讲"
        />
        <div className="flex items-center gap-3 text-gray-500">
          <Link size={18} className="cursor-pointer hover:text-gray-700 transition-colors" />
          <Scissors size={18} className="cursor-pointer hover:text-gray-700 transition-colors" />
          <ChevronDown size={18} />
        </div>
      </div>
      {/* Panda icon */}
      <img
        src="/icons/panda.png"
        alt="panda"
        className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-600"
      />
    </div>
  )
}
