import Layout from "@/components/Layout.js";

export default function LayoutTestPage() {
  // 模拟文档数据（适配新Layout）
  const mockData = {
    createdAt: "2024年1月15日 14:30",
    source: "🪶 飞书文档",
    manualTags: ["深度学习", "NLP", "AI技术"],
    aiTags: ["Transformer", "注意力机制", "神经网络"],
    relatedDocs: [
      {
        url: "/doc/transformer-guide",
        title: "Transformer架构详解"
      },
      {
        url: "/doc/nlp-applications", 
        title: "NLP应用案例集锦"
      },
      {
        url: "/doc/ai-trends",
        title: "AI技术发展趋势"
      }
    ]
  };

  return (
    <Layout documentData={mockData}>
      {/* children 已由 Layout 接收并处理 */}
      <div></div>
    </Layout>
  );
} 