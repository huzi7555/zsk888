"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowLeft, Brain, Loader2 } from "lucide-react";
import ChatDrawer from "./ChatDrawer";
import FoldableMeta from "./FoldableMeta";
import Link from "next/link";

interface AnalysisData {
  quickSummary: string;
  detailedSummary: string;
  sections: Array<{
    id: string;
    title: string;
    summary: string;
    anchor: string;
    level: number;
  }>;
  isAnalyzing?: boolean;
}

interface ArticleData {
  id: string;
  title: string;
  content: string;
  meta: React.ReactNode;
  summary?: string;
  aiAnalysis?: AnalysisData;
  status: 'pending' | 'analyzing' | 'completed' | 'archived';
}

interface ArticleAnalysisLayoutProps {
  article: ArticleData;
  onStartAnalysis?: () => void;
  onSendMessage?: (message: string) => Promise<string>;
}

export default function ArticleAnalysisLayout({
  article,
  onStartAnalysis,
  onSendMessage,
}: ArticleAnalysisLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hasAIAnalysis = article.aiAnalysis && !article.aiAnalysis.isAnalyzing;
  const canStartAnalysis = article.status === 'pending' || (article.status === 'completed' && !hasAIAnalysis);

  const scrollToSection = (anchor: string, title: string) => {
    try {
      // 解码URL编码的锚点
      const decodedAnchor = decodeURIComponent(anchor);
      // 移除#号
      const anchorId = decodedAnchor.replace('#', '');
      // 尝试多种方式查找元素
      const element = document.getElementById(anchorId) || 
                    document.querySelector(`[id="${anchorId}"]`) ||
                    // 备用方案：查找包含标题文本的元素
                    Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
                         .find(el => el.textContent?.includes(title));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.warn('未找到章节元素:', title, anchor);
      }
    } catch (error) {
      console.error('章节跳转失败:', error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* 左栏：原文内容 */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* 返回按钮 */}
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/inbox"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-sm">返回文档列表</span>
            </Link>
          </div>

          {/* 文档卡片 */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold leading-tight">
                {article.title}
              </CardTitle>
              <FoldableMeta>{article.meta}</FoldableMeta>
            </CardHeader>
          </Card>

          {/* 文档内容 */}
          <Card>
            <CardContent className="p-6">
              <article
                className="prose prose-slate max-w-none 
                         prose-headings:scroll-mt-6
                         prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4
                         prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3
                         prose-h3:text-lg prose-h3:font-medium prose-h3:mb-2
                         prose-p:mb-4 prose-p:leading-relaxed
                         prose-ul:mb-4 prose-ol:mb-4
                         prose-li:mb-1
                         prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                         prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg
                         prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4
                         prose-img:rounded-lg prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 右栏：AI 分析结果 */}
      <aside className="w-96 border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 overflow-y-auto shrink-0">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">AI 分析</h2>
            {canStartAnalysis && (
              <Button
                variant="outline"
                size="sm"
                onClick={onStartAnalysis}
                disabled={article.status === 'analyzing'}
                className="h-8"
              >
                {article.status === 'analyzing' ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    分析中
                  </>
                ) : (
                  <>
                    <Brain className="h-3 w-3 mr-1" />
                    开始分析
                  </>
                )}
              </Button>
            )}
          </div>

          {/* AI 分析结果 */}
          {hasAIAnalysis && article.aiAnalysis ? (
            <div className="space-y-4">
              {/* 极速摘要 */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                    ⚡ 极速摘要 (50字)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {article.aiAnalysis.quickSummary}
                  </p>
                </CardContent>
              </Card>

              {/* 详细摘要 */}
              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
                    📄 详细摘要 (200字)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-purple-800 leading-relaxed whitespace-pre-line">
                    {article.aiAnalysis.detailedSummary}
                  </p>
                </CardContent>
              </Card>

              {/* 章节概括 */}
              {article.aiAnalysis.sections && article.aiAnalysis.sections.length > 0 && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-green-700 flex items-center">
                      📋 章节概括
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {article.aiAnalysis.sections.map((section, index) => (
                        <div 
                          key={section.id}
                          className="p-3 bg-green-100/70 rounded-lg border border-green-200"
                        >
                          <h5 className="font-medium text-sm text-green-800 mb-1">
                            {index + 1}. {section.title}
                          </h5>
                          <p className="text-xs text-green-700 mb-2">
                            {section.summary}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => scrollToSection(section.anchor, section.title)}
                            className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-200/50"
                          >
                            🔗 跳转到章节
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : article.aiAnalysis?.isAnalyzing ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-sm text-muted-foreground">AI正在分析中...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-yellow-700">
                    💡 提示
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-yellow-800">
                    这篇文档还没有AI分析结果。点击"开始分析"来生成智能摘要和章节概括。
                  </p>
                </CardContent>
              </Card>
              
              {/* 基础摘要作为备用显示 */}
              {article.summary && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">📝 基础摘要</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {article.summary}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* 浮动聊天按钮 */}
      {onSendMessage && (
        <Button
          onClick={() => setDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* AI 对话抽屉 */}
      {onSendMessage && (
        <ChatDrawer 
          open={drawerOpen} 
          onClose={() => setDrawerOpen(false)}
          onSendMessage={onSendMessage}
          articleTitle={article.title}
        />
      )}
    </div>
  );
} 