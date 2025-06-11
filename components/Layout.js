// components/Layout.js
"use client";

import { useState, useEffect, useRef } from 'react';
import DocumentInfo from './DocumentInfo';
import AIAnalysisPlaceholder from './AIAnalysisPlaceholder';

export default function Layout({ children, documentData }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 默认激活极速摘要
  const [docDrawerOpen, setDocDrawerOpen] = useState(false); // 文档原文抽屉状态
  const [docInfoHeight, setDocInfoHeight] = useState(0); // 文档信息区域高度
  const [docInfoTop, setDocInfoTop] = useState(0); // 文档信息区域顶部位置
  const docInfoRef = useRef(null); // 文档信息区域引用

  // 精确测量文档信息区域的位置和高度
  useEffect(() => {
    const measureDocInfo = () => {
      if (docInfoRef.current) {
        const rect = docInfoRef.current.getBoundingClientRect();
        setDocInfoTop(rect.top);
        setDocInfoHeight(rect.height);
      }
    };

    measureDocInfo();
    window.addEventListener('resize', measureDocInfo);
    window.addEventListener('scroll', measureDocInfo);

    return () => {
      window.removeEventListener('resize', measureDocInfo);
      window.removeEventListener('scroll', measureDocInfo);
    };
  }, [docDrawerOpen]);

  // ESC键关闭抽屉
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && docDrawerOpen) {
        setDocDrawerOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [docDrawerOpen]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-100 border-b z-10 relative">
        <h1 className="text-2xl font-semibold">AI 文档学习分析</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDocDrawerOpen(v => !v)}
            aria-label="查看文档原文"
            className="text-2xl focus:outline-none hover:scale-110 transition-transform group relative"
            title="文档原文"
          >
            📄
            <div className="absolute bottom-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              文档原文
            </div>
          </button>
          <button
            onClick={() => {/* 一键摘要功能 */}}
            aria-label="一键摘要"
            className="text-2xl focus:outline-none hover:scale-110 transition-transform group relative"
            title="快速摘要"
          >
            ⚡
            <div className="absolute bottom-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              快速摘要
            </div>
          </button>
        </div>
      </header>

      {/* 主体布局 */}
      <div className="flex flex-1 overflow-hidden">
        {/* AI 分析主区 - 随抽屉滑动 */}
        <main 
          className="flex-1 overflow-auto bg-gray-50 transition-all duration-300 ease-in-out" 
          style={{ 
            padding: '24px', // 使用统一的内边距
            paddingTop: '48px' // 顶部稍微多一点间距
          }}
        >
          {/* 文档信息区 */}
          <div 
            ref={docInfoRef}
            className="mb-4 px-6 py-4 bg-white rounded-lg shadow-sm"
            style={{ 
              backgroundColor: '#F9FAFB',
              width: '320px'
            }}
          >
            <h2 className="text-xl mb-3 flex items-center font-semibold">📁 文档信息</h2>
            <div className="space-y-2" style={{ lineHeight: '1.5' }}>
              <div className="flex items-center">
                <span className="inline-block w-4 h-4 mr-3">📅</span>
                <span className="text-gray-700">创建时间：{documentData.createdAt}</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-4 h-4 mr-3">✏️</span>
                <span className="text-gray-700">修改时间：{documentData.modifiedAt || documentData.createdAt}</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-4 h-4 mr-3">📂</span>
                <span className="text-gray-700">主题：{documentData.theme || '技术文档'}</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-4 h-4 mr-3">🪶</span>
                <span className="text-gray-700">来源：{documentData.source}</span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-4 h-4 mr-3 mt-0.5">🏷️</span>
                <div className="flex-1">
                  <span className="text-gray-700">标签：</span>
                  <div 
                    className="flex gap-2 mt-1 overflow-x-auto"
                    style={{ 
                      whiteSpace: 'nowrap',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitScrollbar: { display: 'none' }
                    }}
                  >
                    {[...(documentData.manualTags || []), ...(documentData.aiTags || [])].map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        style={{
                          backgroundColor: '#E6F7FF',
                          color: '#1890FF',
                          height: '28px',
                          lineHeight: '26px',
                          borderRadius: '14px'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI 智能分析区 */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center mb-4">
              🤖 AI 智能分析
            </h2>
            
            {/* Tab 栏交互区域 */}
            <div 
              role="tablist" 
              className="flex gap-6 mb-4 border-b border-gray-200"
              onKeyDown={(e) => {
                const tabs = ['summary', 'analysis', 'outline', 'suggestion'];
                const currentIndex = tabs.indexOf(activeTab);
                if (e.key === 'ArrowLeft' && currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1]);
                } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1]);
                }
              }}
            >
              <button 
                role="tab"
                aria-selected={activeTab === 'summary'}
                onClick={() => setActiveTab('summary')}
                tabIndex={activeTab === 'summary' ? 0 : -1}
                className={`pb-2 transition-all duration-200 cursor-pointer hover:underline ${
                  activeTab === 'summary' 
                    ? 'border-b-2 border-blue-500 text-blue-600 font-bold' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ⚡ 极速摘要
              </button>
              <button 
                role="tab"
                aria-selected={activeTab === 'analysis'}
                onClick={() => setActiveTab('analysis')}
                tabIndex={activeTab === 'analysis' ? 0 : -1}
                className={`pb-2 transition-all duration-200 cursor-pointer hover:underline ${
                  activeTab === 'analysis' 
                    ? 'border-b-2 border-blue-500 text-blue-600 font-bold' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📄 详细分析
              </button>
              <button 
                role="tab"
                aria-selected={activeTab === 'outline'}
                onClick={() => setActiveTab('outline')}
                tabIndex={activeTab === 'outline' ? 0 : -1}
                className={`pb-2 transition-all duration-200 cursor-pointer hover:underline ${
                  activeTab === 'outline' 
                    ? 'border-b-2 border-blue-500 text-blue-600 font-bold' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📝 章节概括
              </button>
              <button 
                role="tab"
                aria-selected={activeTab === 'suggestion'}
                onClick={() => setActiveTab('suggestion')}
                tabIndex={activeTab === 'suggestion' ? 0 : -1}
                className={`pb-2 transition-all duration-200 cursor-pointer hover:underline ${
                  activeTab === 'suggestion' 
                    ? 'border-b-2 border-blue-500 text-blue-600 font-bold' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                💡 学习建议
              </button>
            </div>
            
            {/* AI 分析内容区 - 根据激活Tab渲染 */}
            <AIAnalysisPlaceholder activeTab={activeTab} />
          </div>
        </main>
      </div>



      {/* 独立的右侧AI聊天抽屉 */}
      <aside
        className={`
          fixed top-0 right-0 h-screen bg-white border-l border-gray-200 overflow-auto
          transition-[width] duration-300 z-50 shadow-lg
          ${chatOpen ? 'w-80 pointer-events-auto' : 'w-0 pointer-events-none'}
        `}
      >
        {chatOpen && (
          <div className="h-full flex flex-col">
            {/* 抽屉标题栏 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">💬 AI 聊天助手</h3>
              <button
                onClick={() => setChatOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="关闭AI聊天"
              >
                ✕
              </button>
            </div>
            
            {/* AI聊天内容区 */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              <div className="text-center text-gray-500">
                <p className="text-sm">🎉 AI 聊天助手已就绪</p>
                <p className="text-xs mt-1">请输入您的问题，我会带上当前页面的上下文为您解答</p>
              </div>
            </div>
            
            {/* 输入区域 */}
            <div className="flex gap-2 p-4 border-t border-gray-200">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          placeholder-gray-500"
                placeholder="请输入问题…"
              />
              <button
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 
                          text-white rounded-lg font-medium
                          hover:from-blue-600 hover:to-purple-700 
                          transition-all duration-200
                          flex items-center gap-1"
              >
                <span>发送</span>
                <span className="text-sm">⚡</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* 文档原文抽屉 - 按照完整规范实现 */}
      <div 
        className={`fixed bg-white shadow-lg overflow-hidden z-40 ${
          docDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{ 
          top: `${docInfoTop}px`, // 垂直对齐：抽屉顶部与文档信息区顶部同高
          right: '0px', // 水平位置：紧贴浏览器视口右边缘
          width: docDrawerOpen ? '320px' : '0px', // 展开宽度：固定320px，折叠宽度：0px
          height: `${docInfoHeight}px`, // 高度：动态取自文档信息区高度
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          border: '1px solid rgba(229, 231, 235, 0.8)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'width 0.3s ease', // 动画：transition-width 0.3s ease
          overflow: 'hidden'
        }}
        role="region"
        aria-labelledby="doc-drawer-title"
      >
        {docDrawerOpen && (
          <div className="h-full flex flex-col">
            {/* 抽屉头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <h3 
                id="doc-drawer-title"
                className="text-xl font-semibold flex items-center"
              >
                📄 文档原文
              </h3>
              <button
                onClick={() => setDocDrawerOpen(false)}
                className="w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center rounded hover:bg-gray-100"
                aria-label="关闭文档原文"
              >
                ✕
              </button>
            </div>
            
            {/* 抽屉内容区 - 启用竖向滚动 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-white">
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
          </div>
        )}
      </div>

      {/* 右下角AI聊天按钮 */}
      <div className="fixed right-6 bottom-6 z-20 group">
        <button
          onClick={() => setChatOpen(v => !v)}
          aria-label="打开 AI 聊天"
          className="
            w-14 h-14 rounded-full
            bg-gradient-to-br from-blue-500 to-purple-600
            text-white text-3xl
            shadow-xl pointer-events-auto
            hover:scale-105 transition-all duration-200
            flex items-center justify-center
          "
        >
          💬⚡
        </button>
        {/* hover提示气泡 */}
        <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          AI 聊天
        </div>
      </div>
    </div>
  );
} 