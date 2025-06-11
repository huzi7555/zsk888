import ArticleAnalysisLayout from "@/components/ArticleAnalysisLayout";

export default function DemoPage() {
  const mockArticle = {
    title: "深度学习在自然语言处理中的应用",
    content: `
      <h1>引言</h1>
      <p>自然语言处理（NLP）是人工智能领域的重要分支，而深度学习技术为NLP领域带来了革命性的变化。</p>
      
      <h2>技术发展历程</h2>
      <p>从最初的基于规则的方法，到统计机器学习，再到如今的深度学习，NLP技术经历了三个重要阶段。</p>
      
      <h3>Transformer架构</h3>
      <p>2017年，Google提出了<strong>Transformer</strong>架构，彻底改变了序列建模的方式。它采用了注意力机制，能够并行处理序列数据。</p>
      
      <blockquote>
        <p>"注意力就是你所需要的一切" - Google Research团队在论文中如是说。</p>
      </blockquote>
      
      <h2>核心技术要点</h2>
      <ul>
        <li><code>Self-Attention</code>机制实现长距离依赖建模</li>
        <li>多头注意力提升模型表达能力</li>
        <li>位置编码处理序列位置信息</li>
        <li>残差连接和层归一化确保训练稳定性</li>
      </ul>
      
      <h2>应用场景</h2>
      <p>深度学习在NLP中的应用非常广泛：</p>
      <ol>
        <li>机器翻译系统</li>
        <li>文本摘要生成</li>
        <li>对话系统与聊天机器人</li>
        <li>情感分析与文本分类</li>
      </ol>
      
      <h2>未来展望</h2>
      <p>随着大型语言模型的不断发展，我们期待看到更多创新的应用场景。从GPT系列到最新的多模态模型，技术发展日新月异。</p>
    `,
    meta: (
      <div className="space-y-2">
        <div><strong>作者:</strong> AI研究团队</div>
        <div><strong>发布时间:</strong> 2024年1月15日</div>
        <div><strong>字数:</strong> 约 1,200 字</div>
        <div><strong>标签:</strong> 深度学习, NLP, Transformer, AI</div>
        <div><strong>来源:</strong> 技术博客</div>
      </div>
    )
  };

  const mockAnalysis = {
    speedy: (
      <div>
        <h4 className="font-medium text-blue-700 mb-2">⚡ 极速摘要</h4>
        <p className="text-sm text-blue-800">
          本文介绍了深度学习在自然语言处理中的革命性应用，重点阐述了Transformer架构的重要性及其在机器翻译、文本摘要等领域的广泛应用前景。
        </p>
      </div>
    ),
    detail: (
      <div>
        <h4 className="font-medium text-purple-700 mb-2">📄 详细分析</h4>
        <div className="text-sm text-purple-800 space-y-2">
          <p><strong>核心观点:</strong> Transformer架构通过自注意力机制实现了对序列数据的高效并行处理。</p>
          <p><strong>技术亮点:</strong> 多头注意力、位置编码、残差连接等关键技术确保了模型的强大表达能力。</p>
          <p><strong>应用价值:</strong> 在机器翻译、对话系统、文本分类等多个NLP任务中展现出优异性能。</p>
          <p><strong>发展趋势:</strong> 从GPT到多模态模型，大型语言模型正在不断推动NLP技术边界。</p>
        </div>
      </div>
    )
  };

  return (
    <div className="h-screen">
      <ArticleAnalysisLayout 
        article={mockArticle} 
        analysis={mockAnalysis} 
      />
    </div>
  );
} 