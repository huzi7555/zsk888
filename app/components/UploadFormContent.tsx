"use client"

import type React from "react"
import { useState, forwardRef, useImperativeHandle } from "react"
import RichEditor from "./RichEditor"
import { SourceSelector } from "./SourceSelector"
import { TagChip } from "./TagChip"
import { useStore } from "../store"
import { fakeTagSuggest } from "../utils/aiFake"
import { parseTencentDoc, parseFeishuDoc, fakeSummary, fakeTags } from "@/app/utils/docParsers"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LinkIcon, ImageIcon, Video, Clipboard, FileText } from "lucide-react" // Import FileText
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog" // Import Dialog components

// Define the interface for the ref object
export interface UploadFormContentRef {
  submit: () => Promise<void>
}

interface UploadFormContentProps {
  showFooter?: boolean // Added optional showFooter prop
  onConfirm?: () => void
  onCancel?: () => void
}

// Use forwardRef to expose the submit method
const UploadFormContent = forwardRef<UploadFormContentRef, UploadFormContentProps>(
  ({ showFooter = true, onConfirm, onCancel }, ref) => {
    const addUploadedContent = useStore((s) => s.addUploadedContent)

    const [title, setTitle] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [html, setHtml] = useState("")
    const [tagInput, setTagInput] = useState("")
    const [selectedSourceType, setSelectedSourceType] = useState<string | null>(null)

    const [raw, setRaw] = useState("") // Keep raw state
    const [summary, setSummary] = useState("")
    const [autoTags, setAutoTags] = useState<string[]>([])

    const [feishuTencentLink, setFeishuTencentLink] = useState("")
    const [wechatFile, setWechatFile] = useState<File | null>(null)
    const [wechatChatType, setWechatChatType] = useState<"friend" | "group">("friend")

    const [showRawModal, setShowRawModal] = useState(false) // State for raw content modal

    // New state variables
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const suggestedTags = fakeTagSuggest(html || "")

    const handleAddTag = () => {
      if (tagInput.trim()) {
        setTags((t) => {
          const newTags = [...t, tagInput.trim()]
          return Array.from(new Set(newTags))
        })
        setTagInput("")
      }
    }

    const removeTag = (tagToRemove: string) => setTags(tags.filter((tag) => tag !== tagToRemove))

    const addSuggestedTag = (tag: string) => {
      if (!tags.includes(tag.replace(/^#/, ""))) {
        setTags([...tags, tag.replace(/^#/, "")])
      }
    }

    // This function will be exposed via ref
    const handleFinalUpload = async () => {
      await addUploadedContent({
        title: title || "未命名条目",
        tags: tags, // 手动标签
        autoTags: autoTags, // AI标签
        content: html,
        summary: summary,
        sourceType: selectedSourceType as 'feishu' | 'tencent' | 'manual',
        originalUrl: selectedSourceType === 'feishu' || selectedSourceType === 'tencent' ? feishuTencentLink : undefined
      })
      // Reset form fields after successful upload
      setTitle("")
      setTags([])
      setHtml("")
      setTagInput("")
      setSelectedSourceType(null)
      setFeishuTencentLink("")
      setWechatFile(null)
      setWechatChatType("friend")
      setRaw("")
      setSummary("")
      setAutoTags([])
    }

    // Expose handleFinalUpload as 'submit' via the ref
    useImperativeHandle(ref, () => ({
      submit: handleFinalUpload,
    }))

    const handlePasteText = () => {
      const text = prompt("请输入要粘贴的文本:")
      if (text) {
        setHtml((prevHtml) => prevHtml + `<p>${text.replace(/\n/g, "<br/>")}</p>`)
      }
    }

    const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string
          setHtml(
            (prevHtml) =>
              prevHtml + `<p><img src="${imageUrl}" alt="Uploaded Image" style="max-width: 100%; height: auto;"/></p>`,
          )
        }
        reader.readAsDataURL(file)
      }
    }

    const handleUploadVideo = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const videoUrl = e.target?.result as string
          setHtml(
            (prevHtml) =>
              prevHtml + `<p><video controls src="${videoUrl}" style="max-w-full; height: auto;"></video></p>`,
          )
        }
        reader.readAsDataURL(file)
      }
    }

    const handleInsertLink = () => {
      const url = prompt("请输入链接URL:")
      const linkText = prompt("请输入链接文本:")
      if (url && linkText) {
        setHtml(
          (prevHtml) => prevHtml + `<p><a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a></p>`,
        )
      }
    }

    // Renamed and updated parsing logic for Feishu/Tencent
    const handleParse = async () => {
      if (!feishuTencentLink) {
        setError("请先输入文档链接")
        return
      }
      setLoading(true)
      setError("")

      try {
        let txt = ""
        let defaultTitle = ""
        if (selectedSourceType === "feishu") {
          txt = await parseFeishuDoc(feishuTencentLink)
          defaultTitle = "飞书文档导入内容"
        } else if (selectedSourceType === "tencent") {
          txt = await parseTencentDoc(feishuTencentLink)
          defaultTitle = "腾讯文档导入内容"
        }
        if (!txt) throw new Error("解析失败，返回空文本")

        setRaw(txt) // AI 摘要 / 标签 用
        setHtml(txt) // 预填编辑器
        setTitle(defaultTitle)
        setSummary(await fakeSummary(txt))
        setAutoTags(await fakeTags(txt))
      } catch (e: any) {
        setError(e.message || "解析出错")
      } finally {
        setLoading(false)
      }
    }

    const processWechatContent = async () => {
      if (!wechatFile) return

      const reader = new FileReader()
      reader.onload = async (e) => {
        const content = e.target?.result as string
        let parsedContent = ""
        const defaultTitle = `微信聊天记录 (${wechatChatType === "friend" ? "好友" : "群"}) 导入`

        if (wechatFile.type === "text/plain" || wechatFile.name.endsWith(".txt")) {
          parsedContent = `<p>这是从微信聊天记录文件 <code>${wechatFile.name}</code> 模拟解析的内容：</p><p>${content.replace(/\n/g, "</p><p>")}</p>`
        } else if (wechatFile.type === "text/html" || wechatFile.name.endsWith(".html")) {
          const parser = new DOMParser()
          const doc = parser.parseFromString(content, "text/html")
          const bodyContent = doc.body.innerHTML
          parsedContent = `<p>这是从微信聊天记录文件 <code>${wechatFile.name}</code> 模拟解析的内容：</p>${bodyContent}`
        } else {
          parsedContent = `<p>不支持的文件格式：${wechatFile.type}。这是文件内容：</p><p>${content}</p>`
        }

        setRaw(parsedContent) // Keep setRaw call
        setHtml("") // Editor remains blank
        setTitle(defaultTitle)
        setSummary(await fakeSummary(parsedContent))
        setAutoTags(await fakeTags(parsedContent))
      }
      reader.readAsText(wechatFile)
    }

    const handleSourceSelect = (type: string) => {
      setSelectedSourceType(type)
      setTitle("")
      setTags([])
      setHtml("")
      setTagInput("")
      setFeishuTencentLink("")
      setWechatFile(null)
      setWechatChatType("friend")
      setRaw("")
      setSummary("")
      setAutoTags([])
      setError("") // Clear error on source change
    }

    return (
      <div className="h-[90vh] flex flex-col">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4 dark:text-gray-200">选择内容来源</h2>
            <div className="flex flex-wrap gap-3">
              <SourceSelector onSelect={handleSourceSelect} selectedType={selectedSourceType} />
            </div>
          </div>
          <div className="mb-4">
            <Input
              placeholder="标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded mb-3 px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            />
            {autoTags.length > 0 && (
              <div className="flex gap-2 text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">建议标签：</span>
                {autoTags.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-300">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <Input
                placeholder="标签（按回车添加）"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTag()
                  }
                }}
                className="flex-grow border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              />
              <Button onClick={handleAddTag} className="dark:bg-blue-700 dark:hover:bg-blue-800">
                添加标签
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((t) => (
                <TagChip key={t} label={t} onRemove={() => removeTag(t)} />
              ))}
            </div>

            {suggestedTags.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2 dark:text-gray-400">AI 建议标签：</p>
                <div className="flex gap-2">
                  {suggestedTags.map((tag) => (
                    <TagChip key={tag} label={`#${tag}`} onClick={() => addSuggestedTag(tag)} />
                  ))}
                </div>
              </div>
            )}
          </div>
          {selectedSourceType === "feishu" || selectedSourceType === "tencent" ? (
            <div className="mb-6 p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-3 dark:text-gray-100">
                {selectedSourceType === "feishu" ? "飞书文档" : "腾讯文档"} 导入
              </h3>
              <Input
                placeholder="请输入文档链接"
                value={feishuTencentLink}
                onChange={(e) => setFeishuTencentLink(e.target.value)}
                className="mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
              />
              {/* Updated button JSX */}
              <Button
                onClick={handleParse}
                disabled={loading}
                className="mb-4 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
              >
                {loading ? "解析中…" : "解析文档内容"}
              </Button>
              {/* Error message display */}
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
          ) : selectedSourceType === "wechat" ? (
            <div className="mb-6 p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-3 dark:text-gray-100">微信聊天记录导入</h3>
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant={wechatChatType === "friend" ? "default" : "outline"}
                  onClick={() => setWechatChatType("friend")}
                  className="dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white data-[state=unchecked]:dark:bg-gray-700 data-[state=unchecked]:dark:border-gray-600 data-[state=unchecked]:dark:text-gray-200"
                >
                  微信好友
                </Button>
                <Button
                  variant={wechatChatType === "group" ? "default" : "outline"}
                  onClick={() => setWechatChatType("group")}
                  className="dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white data-[state=unchecked]:dark:bg-gray-700 data-[state=unchecked]:dark:border-gray-600 data-[state=unchecked]:dark:text-gray-200"
                >
                  微信群
                </Button>
              </div>
              <Input
                type="file"
                accept=".txt,.html"
                onChange={(e) => setWechatFile(e.target.files?.[0] || null)}
                className="mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
              />
              <Button
                onClick={processWechatContent}
                disabled={!wechatFile}
                className="mb-4 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                解析聊天记录
              </Button>
            </div>
          ) : selectedSourceType === "note" ? (
            <div className="mb-6 p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-3 dark:text-gray-100">随手笔记</h3>
            </div>
          ) : (
            <div className="mb-6 p-4 border rounded-lg bg-white text-center text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
              请选择一个内容来源开始创建新条目。
            </div>
          )}
          {selectedSourceType && (
            <>
              <h2 className="text-lg font-medium mb-4 mt-6 dark:text-gray-200">内容编辑器</h2>
              <div className="flex flex-wrap gap-3 mb-4">
                <Button
                  variant="outline"
                  onClick={handlePasteText}
                  className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <Clipboard size={16} /> 文本张贴
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("image-upload-input")?.click()}
                  className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <ImageIcon size={16} /> 图片上传
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadImage}
                  />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("video-upload-input")?.click()}
                  className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <Video size={16} /> 视频上传
                  <input
                    id="video-upload-input"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleUploadVideo}
                  />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleInsertLink}
                  className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <LinkIcon size={16} /> 链接选择
                </Button>
                {/* New "原文" button */}
                <Button
                  variant="outline"
                  onClick={() => setShowRawModal(true)}
                  disabled={!raw} // Disable if no raw content
                  className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <FileText size={16} /> 原文
                </Button>
              </div>
              <RichEditor value={html} onChange={setHtml} />
            </>
          )}
        </div>
        {/* Conditional footer for buttons */}
        {showFooter && (
          <div className="h-16 shrink-0 flex items-center justify-end gap-4 px-6 border-t bg-white/90 dark:bg-[#222]/90 backdrop-blur">
            <Button variant="ghost" onClick={onCancel} className="text-gray-600 hover:text-black dark:text-gray-300">
              取消
            </Button>
            <Button variant="default" onClick={onConfirm}>
              确认上传
            </Button>
          </div>
        )}

        {/* Raw Content Modal */}
        <Dialog open={showRawModal} onOpenChange={setShowRawModal}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>原文</DialogTitle>
              <DialogDescription className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {raw || "没有原文内容。"}
              </DialogDescription>
            </DialogHeader>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                关闭
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    )
  },
)

UploadFormContent.displayName = "UploadFormContent"

export default UploadFormContent
