"use client"
import * as Dialog from "@radix-ui/react-dialog"
import { useRef } from "react"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import UploadFormContent from "@/app/components/UploadFormContent"

export default function QuickUploadTrigger() {
  const formRef = useRef<{ submit: () => void } | null>(null)

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-800 transition-colors dark:text-gray-400 dark:hover:text-white"
          title="快速上传"
        >
          <Zap size={20} />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content
          className="fixed right-0 top-0 h-full w-[480px] flex flex-col
                                  bg-white dark:bg-[#333] shadow z-50" // z-50 retained
        >
          <div className="flex-1 overflow-y-auto p-6">
            <UploadFormContent ref={formRef} showFooter={false} />
          </div>

          {/* 统一的确认条（只有这一条） */}
          <div
            className="h-16 shrink-0 flex items-center justify-end gap-4 px-6 border-t
                          bg-white/90 dark:bg-[#222]/90 backdrop-blur"
          >
            <Dialog.Close asChild>
              <Button variant="ghost" className="text-gray-600 hover:text-black dark:text-gray-300">
                取消
              </Button>
            </Dialog.Close>

            {/* 用 Dialog.Close 包裹确认按钮，提交后自动关闭 */}
            <Dialog.Close asChild>
              <Button variant="default" onClick={() => formRef.current?.submit()}>
                确认上传
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
