"use client"
import { useState } from "react"
import { X, Plus, FileText, Link, Upload, MessageSquare } from "lucide-react"

export function AIButtons() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleToggleModal = () => {
    setIsModalOpen(!isModalOpen)
  }

  const actions = [
    {
      icon: FileText,
      title: "新建笔记",
      description: "创建一个新的知识片段",
      action: () => {
        console.log("创建新笔记")
        setIsModalOpen(false)
      },
    },
    {
      icon: Link,
      title: "导入链接",
      description: "从网页链接导入内容",
      action: () => {
        console.log("导入链接")
        setIsModalOpen(false)
      },
    },
    {
      icon: Upload,
      title: "上传文件",
      description: "上传文档、图片或其他文件",
      action: () => {
        console.log("上传文件")
        setIsModalOpen(false)
      },
    },
    {
      icon: MessageSquare,
      title: "开始对话",
      description: "与 AI 开始新的对话",
      action: () => {
        console.log("开始对话")
        setIsModalOpen(false)
      },
    },
  ]

  return (
    <>
      <div className="flex items-center space-x-6 mb-4">
        {/* 主要操作按钮 */}
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={handleToggleModal}
        >
          <Plus size={18} />
          新建内容
        </button>

        {/* 其他快捷按钮 */}
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          <Upload size={18} />
          快速导入
        </button>
      </div>

      {/* 创建内容弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleToggleModal} />

          {/* 模态框内容 */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">新建内容</h2>
              <button
                onClick={handleToggleModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="关闭"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* 操作选项 */}
            <div className="space-y-3">
              {actions.map(({ icon: Icon, title, description, action }) => (
                <button
                  key={title}
                  onClick={action}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
