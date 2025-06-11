export default function DocumentInfo({ data }) {
  // 合并标签数据
  const allTags = [...(data.manualTags || []), ...(data.aiTags || [])];
  
  return (
    <section className="mb-4 mx-4 px-6 py-4 bg-white rounded-lg shadow-sm w-80" style={{ backgroundColor: '#F9FAFB' }}>
      <h2 className="text-xl mb-3 flex items-center font-semibold">📁 文档信息</h2>
      <div className="space-y-2" style={{ lineHeight: '1.5' }}>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 mr-3">📅</span>
          <span className="text-gray-700">创建时间：{data.createdAt}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 mr-3">✏️</span>
          <span className="text-gray-700">修改时间：{data.modifiedAt || data.createdAt}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 mr-3">📂</span>
          <span className="text-gray-700">主题：{data.theme || '技术文档'}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 mr-3">🪶</span>
          <span className="text-gray-700">来源：{data.source}</span>
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
              {allTags.map((tag, index) => (
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
    </section>
  );
} 