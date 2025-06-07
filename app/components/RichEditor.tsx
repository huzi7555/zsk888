"use client"

import { useRef } from "react"
import { Bold, Italic, List, ImageIcon } from "lucide-react"

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertImage = () => {
    const url = prompt("请输入图片URL:")
    if (url) {
      execCommand("insertImage", url)
    }
  }

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 p-3 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="p-2 hover:bg-gray-200 rounded dark:text-gray-200 dark:hover:bg-gray-600"
          title="粗体"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="p-2 hover:bg-gray-200 rounded dark:text-gray-200 dark:hover:bg-gray-600"
          title="斜体"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="p-2 hover:bg-gray-200 rounded dark:text-gray-200 dark:hover:bg-gray-600"
          title="列表"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="p-2 hover:bg-gray-200 rounded dark:text-gray-200 dark:hover:bg-gray-600"
          title="插入图片"
        >
          <ImageIcon size={16} />
        </button>
      </div>

      {/* 编辑区域 */}
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-[200px] outline-none prose max-w-none dark:text-gray-100 dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: value || "<p>开始输入内容...</p>" }}
        onInput={handleInput}
        style={{ whiteSpace: "pre-wrap" }}
      />
    </div>
  )
}
