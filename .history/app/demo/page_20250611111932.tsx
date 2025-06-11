import ArticleAnalysisLayout from "@/components/ArticleAnalysisLayout";

export default function DemoPage() {
  // 模拟文档数据
  const article = {
    id: "demo-1",
    title: "飞书文档导入内容：70多款效率神器完整指南",
    meta: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium">创建时间:</span>
          <span>2024-05-02</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium">来源:</span>
          <span>🪶 飞书文档</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium">作者:</span>
          <span>效率专家</span>
        </div>
      </div>
    ),
    content: `
      <h2 id="section-1">项目概述</h2>
      <p>使用 V0 AI 快速生成一个轻量级前端 Web 应用，帮助用户从微信群聊天记录中提炼技术要点，并将分散在各处的学习笔记集中到可搜索、可标签的知识库中。所有功能均在前端完成，数据保存在浏览器 localStorage。</p>
      
      <h3 id="section-2">技术栈</h3>
      <ul>
        <li><strong>框架</strong>：Next.js 14 + React 18</li>
        <li><strong>样式</strong>：Tailwind CSS + shadcn/ui</li>
        <li><strong>状态管理</strong>：Zustand</li>
        <li><strong>数据存储</strong>：浏览器 localStorage</li>
      </ul>

      <h3 id="section-3">核心功能</h3>
      <p>工欲善其事，必先利其器！尤其是做互联网的，所有重复性的工作，都要交给工具。</p>
      <p>做互联网十几年，使用了不下于上千款工具，最终筛选出了这70多款「效率开挂」神器，这篇文章应该是目前关于效率工具+实用工具方面，最全面的文章，全篇无广告，都是我自己筛选出来的工具和使用心得。</p>
      
      <blockquote>
        <p>时间永远是最稀缺的资源，所以废话不多说，让咱们直接开挂吧！</p>
      </blockquote>

      <h3 id="section-4">自动化效率神器</h3>
      <p>官网：<a href="https://www.yingdao.com" target="_blank">https://www.yingdao.com</a></p>
      <p>办公自动化效率神器，无需编程，支持手机、电脑、网页的自动化操作，花个几天的时间去学习一下官方教程，就可以实现简单的自动化脚本。</p>
      
      <p>可以解决那些需要重复操作的工作，比如批量重命名文件、自动发视频、统计每天的销售数据等等，几乎是有规律性可循的操作，基本都能胜任。</p>
    `,
    summary: "介绍了70多款软件效率工具的完整指南，包含项目概述、技术栈选择、核心功能介绍等内容。",
    aiAnalysis: {
      quickSummary: "飞书文档导入内容：70多款软件、100多张图、1w多字，一份全网最硬核的「效率开挂」神器指南！",
      detailedSummary: "本文档《飞书文档导入内容》深入探讨了技术实现细节，包含具体的代码示例和解决方案。文档介绍了使用Next.js 14构建的轻量级前端应用，主要功能包括微信群聊天记录提炼、学习笔记管理等。技术栈涵盖React 18、Tailwind CSS、shadcn/ui等现代前端技术。适合作为参考资料长期保存和查阅。",
      sections: [
        {
          id: "section-1",
          title: "项目概述",
          summary: "介绍了基本概念和应用背景",
          anchor: "#section-1",
          level: 2
        },
        {
          id: "section-2", 
          title: "技术栈",
          summary: "详细说明了技术选型和架构方案",
          anchor: "#section-2",
          level: 3
        },
        {
          id: "section-3",
          title: "核心功能",
          summary: "阐述了产品的主要功能特性",
          anchor: "#section-3", 
          level: 3
        },
        {
          id: "section-4",
          title: "自动化效率神器",
          summary: "推荐了实用的自动化工具",
          anchor: "#section-4",
          level: 3
        }
      ],
      isAnalyzing: false
    },
    status: 'completed' as const
  };

  const handleStartAnalysis = async () => {
    console.log('开始AI分析...');
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    // 模拟AI回复
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = [
      `关于"${article.title}"：这是一篇非常详细的效率工具指南。您提到：${message}`,
      `根据文档内容，我建议您关注自动化工具的学习。您的问题"${message}"很有价值。`,
      `文档中提到的70多款工具都经过作者十几年的实践验证。关于"${message}"，我认为...`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <ArticleAnalysisLayout
      article={article}
      onStartAnalysis={handleStartAnalysis}
      onSendMessage={handleSendMessage}
    />
  );
} 