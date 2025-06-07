"use client"
import { Bot, FileText, Sparkles } from "lucide-react"
import Link from "next/link"

const actions = [
  { icon: Bot, label: "知识广场", href: "#" },
  { icon: FileText, label: "文档解读", href: "#" },
  { icon: Sparkles, label: "智能写作", href: "#" },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-12 mt-12">
      {actions.map(({ icon: Icon, label, href }) => (
        <Link key={label} href={href} className="flex flex-col items-center gap-3 group cursor-pointer">
          <div className="w-20 h-20 rounded-full bg-white/70 backdrop-blur-sm shadow-inner flex items-center justify-center transition-transform group-hover:scale-105 group-hover:shadow-md">
            <Icon size={28} className="text-gray-700 group-hover:text-gray-800 transition-colors" />
          </div>
          <span className="text-sm text-gray-700 group-hover:text-gray-800 transition-colors">{label}</span>
        </Link>
      ))}
    </div>
  )
}
