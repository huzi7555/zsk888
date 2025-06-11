"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function ChatDrawer({ 
  open, 
  onClose 
}: { 
  open: boolean; 
  onClose: () => void; 
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween" }}
          className="fixed inset-y-0 right-0 w-full md:w-96 bg-background z-50 shadow-lg border-l flex flex-col"
        >
          {/* 关闭按钮 */}
          <div className="p-4 border-b flex-shrink-0">
            <button 
              onClick={onClose} 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ✕ 关闭
            </button>
          </div>
          
          {/* 消息区 */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center text-muted-foreground">
              <h3 className="font-medium mb-2">AI 助手</h3>
              <p className="text-sm">Chat messages ...</p>
              <p className="text-xs mt-2">功能开发中，敬请期待</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 