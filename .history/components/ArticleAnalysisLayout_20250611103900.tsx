"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MessageCircle, ArrowLeft, Brain, Loader2 } from "lucide-react";
import ChatDrawer from "./ChatDrawer";
import FoldableMeta from "./FoldableMeta";
import Link from "next/link";

// 新接口类型
interface NewLayoutProps {
  article: { title: string; content: string; meta: React.ReactNode };
  analysis: { speedy: React.ReactNode; detail: React.ReactNode };
}

// 旧接口类型
interface OldLayoutProps {
  article: {
    id: string;
    title: string;
    content: string;
    meta: React.ReactNode;
    summary?: string;
    aiAnalysis?: any;
    status: 'pending' | 'analyzing' | 'completed' | 'archived';
  };
  onStartAnalysis?: () => void;
  onSendMessage?: (message: string) => Promise<string>;
}

type ArticleAnalysisLayoutProps = NewLayoutProps | OldLayoutProps;

// 类型保护函数
function isNewLayout(props: ArticleAnalysisLayoutProps): props is NewLayoutProps {
  return 'analysis' in props;
}

export default function ArticleAnalysisLayout(props: ArticleAnalysisLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isNewLayout(props)) {
    // 新接口：简洁布局
    const { article, analysis } = props;
    
    return (
      <div className="relative flex h-screen overflow-hidden md:flex-row flex-col bg-muted/30">
        {/* 左栏：原文 - 优化为60%宽度 */}
        <main className="md:w-3/5 w-full overflow-y-auto p-6">
          <h1 className="text-2xl font-semibold mb-4 text-foreground">{article.title}</h1>
          <FoldableMeta>{article.meta}</FoldableMeta>
          <article
            className="prose prose-slate max-w-none
                     prose-headings:text-foreground
                     prose-p:text-foreground
                     prose-strong:text-foreground
                     prose-code:bg-muted prose-code:text-foreground
                     prose-pre:bg-muted 
                     prose-blockquote:border-primary prose-blockquote:text-foreground
                     prose-li:text-foreground"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </main>

        {/* 右栏：分析 - 扩大为40%宽度 */}
        <aside className="md:w-2/5 w-full md:border-l border-t md:border-t-0 bg-background/95 backdrop-blur overflow-y-auto p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">AI 分析</h2>
          
          <div className="space-y-4">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                {analysis.speedy}
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="p-4">
                {analysis.detail}
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* 浮动聊天按钮 */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full p-3 shadow-lg bg-primary text-primary-foreground hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>

        {/* Drawer */}
        <ChatDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    );
  } else {
    // 旧接口：完整功能布局 
    const { article, onStartAnalysis, onSendMessage } = props;
    
    const hasAIAnalysis = article.aiAnalysis && !article.aiAnalysis.isAnalyzing;
    const canStartAnalysis = article.status === 'pending' || (article.status === 'completed' && !hasAIAnalysis);
    
    const scrollToSection = (anchor: string, title: string) => {
      try {
        const decodedAnchor = decodeURIComponent(anchor);
        const anchorId = decodedAnchor.replace('#', '');
        const element = document.getElementById(anchorId) || 
                      document.querySelector(`[id="${anchorId}"]`) ||
                      Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
                           .find(el => el.textContent?.includes(title));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (error) {
        console.error('章节跳转失败:', error);
      }
    };

    return (
      <div className="flex h-screen overflow-hidden bg-muted/30 md:flex-row flex-col">
        {/* 左栏：原文内容 - 桌面端60%，移动端全宽 */}
        <main className="md:w-3/5 w-full overflow-y-auto">
          <div className="max-w-none mx-auto p-4 md:p-6">
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

            {/* 文档标题 */}
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

        {/* 右栏：AI 分析结果 - 桌面端40%，移动端全宽 */}
        <aside className="md:w-2/5 w-full md:border-l border-t md:border-t-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
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
                        {article.aiAnalysis.sections.map((section: any, index: number) => (
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
        <ChatDrawer 
          open={drawerOpen} 
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    );
  }
} 