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
          className="fixed inset-y-0 right-0 z-50 w-full md:w-96 shadow-lg bg-background flex flex-col outline-none"
        >
          {/* —— 顶部栏 —— */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-medium text-lg">文档原文</h2>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="prose prose-sm max-w-none">
              <h1 className="text-lg font-bold mb-4">AI 文档学习分析</h1>
              <p className="text-gray-600 text-sm mb-4">
                这里显示飞书文档的原始内容，您可以在此查看完整的文档原文，同时在左侧查看AI分析结果。
              </p>
              
              <h2 className="text-base font-semibold mt-6 mb-3">1. 引言</h2>
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                在现代软件开发中，AI技术正在逐步改变我们处理和分析文档的方式。本文将详细介绍如何构建一个智能的文档学习分析系统，帮助用户快速理解和掌握文档内容。
              </p>
              
              <h2 className="text-base font-semibold mt-6 mb-3">2. 技术概述</h2>
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                我们的系统采用了最新的自然语言处理技术，结合机器学习算法，能够自动提取文档的关键信息并生成智能分析报告。系统支持多种文档格式，包括飞书文档、Word文档、PDF等。
              </p>
              
              <h3 className="text-sm font-medium mt-4 mb-2">2.1 架构设计</h3>
              <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                系统采用微服务架构，包含文档处理服务、AI分析服务、用户界面服务等多个模块。每个模块都可以独立部署和扩展，确保系统的高可用性和可维护性。
              </p>
              
              <h3 className="text-sm font-medium mt-4 mb-2">2.2 核心算法</h3>
              <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                基于Transformer架构的深度学习模型，能够理解文档的语义结构并提取关键信息。我们使用了预训练的大语言模型，并针对中文文档进行了专门的优化。
              </p>
              
              <h2 className="text-base font-semibold mt-6 mb-3">3. 实现细节</h2>
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                详细的实现包括数据预处理、模型训练、推理优化等多个步骤。我们特别关注了中文文本的特殊处理，包括分词、实体识别、关系提取等。
              </p>
              
              <h3 className="text-sm font-medium mt-4 mb-2">3.1 数据预处理</h3>
              <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                文档首先经过格式化处理，去除无关的格式信息，保留核心文本内容。然后进行分段、分句等预处理步骤。
              </p>
              
              <h3 className="text-sm font-medium mt-4 mb-2">3.2 特征提取</h3>
              <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                使用预训练模型提取文本的语义特征，生成高维向量表示，为后续的分析和理解提供基础。
              </p>
              
              <h2 className="text-base font-semibold mt-6 mb-3">4. 功能特性</h2>
              <ul className="text-gray-700 text-sm space-y-2 mb-4">
                <li>• 智能摘要生成：自动提取文档关键信息</li>
                <li>• 结构化分析：识别文档的层次结构</li>
                <li>• 关键词提取：自动标记重要概念</li>
                <li>• 问答系统：基于文档内容的智能问答</li>
              </ul>
              
              <h2 className="text-base font-semibold mt-6 mb-3">5. 总结</h2>
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                通过本系统，用户可以快速获得文档的核心内容和智能分析，大大提高了学习和工作效率。未来我们将继续优化算法，提升分析的准确性和实用性。
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
