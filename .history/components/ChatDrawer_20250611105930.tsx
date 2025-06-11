"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 右侧抽屉
 * ------------------------------------------------------------------
 * ✧ 固定在 viewport 右侧（`right-0`）\
 * ✧ 宽度：移动端占满宽度；≥ 768 px 时固定 384 px（`w-full md:w-96`）\
 * ✧ framer-motion 进入 / 退出动画\
 * ------------------------------------------------------------------
 */
export default function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="chat-drawer"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.25 }}
          className="fixed top-16 bottom-16 right-0 z-50 w-full md:w-96 shadow-lg bg-background flex flex-col outline-none"
        >
          {/* —— 顶部栏 —— */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-medium text-lg">【测试】文档原文</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* —— 内容区域 —— */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center text-muted-foreground bg-yellow-100 p-8 rounded-lg">
              <h3 className="text-lg font-bold text-red-600 mb-4">🚧 内容已清空 🚧</h3>
              <p className="text-sm text-gray-700">所有示例内容已删除</p>
              <p className="text-xs mt-2 text-gray-600">UI框架保留，等待功能开发</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
