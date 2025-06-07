"use client"
import { Library, FileText, Sparkles } from "lucide-react"
import Link from "next/link"

const actions = [
  { icon: Library, label: "知识库广场", href: "/library" },
  { icon: FileText, label: "文档解读", href: "/upload" },
  { icon: Sparkles, label: "智能写作", href: "#" },
]

export function QuickActions() {
  return (
    <div className="flex items-center gap-16 mt-12">
      {actions.map(({ icon: Icon, label, href }) => (
        <Link
          key={label}
          href={href}
          className="flex flex-col items-center gap-4 group cursor-pointer"
        >
          <div className="w-20 h-20 rounded-full bg-stone-50 dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-md group-hover:border-stone-300 dark:group-hover:border-stone-700">
            <Icon
              size={28}
              strokeWidth={1.5}
              className="text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors"
            />
          </div>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
            {label}
          </span>
        </Link>
      ))}
    </div>
  )
} 