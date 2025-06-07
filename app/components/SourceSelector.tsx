"use client"

interface SourceSelectorProps {
  onSelect: (type: string) => void
  selectedType: string | null
}

export function SourceSelector({ onSelect, selectedType }: SourceSelectorProps) {
  const sources = [
    { key: "feishu" as const, label: "飞书文档", icon: "📄" },
    { key: "wechat" as const, label: "微信聊天", icon: "💬" },
    { key: "note" as const, label: "随手笔记", icon: "📝" },
    { key: "tencent" as const, label: "腾讯文档", icon: "📋" },
  ]

  return (
    <>
      {sources.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            selectedType === key
              ? "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/50 dark:border-blue-400 dark:text-blue-300"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <span className="text-lg">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </>
  )
}
