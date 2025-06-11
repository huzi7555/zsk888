"use client";

export default function FeishuDocument() {
  return (
    <div className="p-4 h-full">
      <div className="text-center text-gray-500 mb-4">
        <h3 className="font-medium mb-2">📄 飞书原文档</h3>
      </div>
      
      {/* 模拟飞书文档内容 */}
      <div className="space-y-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium mb-2">文档标题</h4>
          <p className="text-gray-600">深度学习在自然语言处理中的应用</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium mb-2">内容预览</h4>
          <div className="text-gray-600 space-y-2">
            <p>1. 引言</p>
            <p>2. 技术发展历程</p>
            <p>3. Transformer架构</p>
            <p>4. 核心技术要点</p>
            <p>5. 应用场景</p>
            <p>6. 未来展望</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium mb-2">统计信息</h4>
          <div className="text-gray-600 space-y-1">
            <p>• 字数：约 1,200 字</p>
            <p>• 章节：6 个主要部分</p>
            <p>• 更新时间：2024年1月15日</p>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-400 mt-6">
          <p>完整文档内容将在实际应用中加载</p>
        </div>
      </div>
    </div>
  );
} 