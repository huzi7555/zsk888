"use client";

import DocumentInfo from "./DocumentInfo";

interface AIAnalysisProps {
  documentMeta: {
    createdAt: string;
    source: string;
    manualTags: string[];
    aiTags: string[];
    relatedDocs: Array<{
      url: string;
      title: string;
    }>;
  };
}

export default function AIAnalysis({ documentMeta }: AIAnalysisProps) {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* 文档信息常显区域 */}
      <section>
        <h2 className="text-lg font-semibold mb-3">📋 文档信息</h2>
        <DocumentInfo meta={documentMeta} />
      </section>

      {/* AI 分析结果区域 */}
      <section>
        <h2 className="text-lg font-semibold mb-3">🤖 AI 智能分析</h2>
        
        <div className="space-y-4">
          {/* 极速摘要 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">⚡ 极速摘要</h3>
            <p className="text-sm text-blue-700">
              AI分析内容将在这里显示...
            </p>
          </div>
          
          {/* 详细分析 */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-medium text-purple-800 mb-2">📄 详细分析</h3>
            <div className="text-sm text-purple-700 space-y-2">
              <p>详细的AI分析结果将在这里展示...</p>
            </div>
          </div>
          
          {/* 章节概括 */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-800 mb-2">📝 章节概括</h3>
            <p className="text-sm text-green-700">
              文档章节分析将在这里显示...
            </p>
          </div>
        </div>
      </section>

      {/* 学习建议 */}
      <section>
        <h2 className="text-lg font-semibold mb-3">💡 学习建议</h2>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            基于文档内容的个性化学习建议将在这里显示...
          </p>
        </div>
      </section>
    </div>
  );
} 