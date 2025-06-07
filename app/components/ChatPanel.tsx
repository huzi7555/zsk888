"use client"
import { useState } from "react"
import { PlaneIcon as PaperPlane, Plus } from "lucide-react"

export function ChatPanel() {
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "你好，有什么我可以帮助分析这条知识的吗？" },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return
    // 添加用户消息
    setMessages((prev) => [...prev, { id: prev.length + 1, role: "user", content: input.trim() }])
    // 模拟 AI 回复
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, role: "assistant", content: "这是基于当前条目的示例回答：" + input.trim() },
      ])
    }, 500)
    setInput("")
  }

  const handleNewChat = () => {
    setMessages([{ id: 1, role: "assistant", content: "开始新的对话，有什么我可以帮助你的吗？" }])
  }

  return (
    <div className="h-full flex flex-col border-l border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
      {/* 标题栏 - 添加新建对话按钮 */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Ask AI</h2>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="新建对话"
        >
          <Plus size={16} />
          新对话
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] px-3 py-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* 输入框 */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的问题..."
            className="flex-1 resize-none h-12 px-3 py-2 rounded-md border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            aria-label="发送"
          >
            <PaperPlane size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
