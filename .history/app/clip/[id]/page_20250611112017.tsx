import Layout from '@/components/Layout.js';

// 模拟接口数据
const mockData = {
  createdAt: '2025-06-10',
  source: '🪶 飞书文档',
  manualTags: ['前端', '性能'],
  aiTags: ['React', 'Next.js', '优化'],
  relatedDocs: [
    { title: '飞书文档导入内容', url: '#' },
    { title: 'React 图片优化技巧', url: '#' },
    { title: '设计系统构建指南', url: '#' },
  ],
};

export default function ClipPage() {
  return (
    <Layout documentData={mockData}>
      {/* children 已由 Layout 接收并忽略 */}
      <div></div>
    </Layout>
  );
}
