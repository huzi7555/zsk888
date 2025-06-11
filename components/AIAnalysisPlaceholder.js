// components/AIAnalysisPlaceholder.js
export default function AIAnalysisPlaceholder({ activeTab }) {
  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="p-6 bg-blue-50 rounded-lg mx-6 border border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
              ⚡ 极速摘要
            </h3>
            <div className="text-gray-600 text-sm">
              <p className="mb-2">正在生成文档的核心要点摘要...</p>
              <div className="animate-pulse">
                <div className="h-4 bg-blue-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-blue-200 rounded w-4/5 mb-2"></div>
                <div className="h-4 bg-blue-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        );
      case 'analysis':
        return (
          <div className="p-6 bg-purple-50 rounded-lg mx-6 border border-purple-100">
            <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
              📄 详细分析
            </h3>
            <div className="text-gray-600 text-sm">
              <p className="mb-2">正在进行深度内容分析...</p>
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-purple-200 rounded w-full"></div>
                <div className="h-4 bg-purple-200 rounded w-5/6"></div>
                <div className="h-4 bg-purple-200 rounded w-4/5"></div>
                <div className="h-4 bg-purple-200 rounded w-full"></div>
                <div className="h-4 bg-purple-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        );
      case 'outline':
        return (
          <div className="p-6 bg-green-50 rounded-lg mx-6 border border-green-100">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center">
              📝 章节概括
            </h3>
            <div className="text-gray-600 text-sm">
              <p className="mb-2">正在生成章节结构概括...</p>
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-green-200 rounded w-2/3"></div>
                <div className="h-3 bg-green-200 rounded w-3/4 ml-4"></div>
                <div className="h-3 bg-green-200 rounded w-1/2 ml-4"></div>
                <div className="h-4 bg-green-200 rounded w-2/3"></div>
                <div className="h-3 bg-green-200 rounded w-3/5 ml-4"></div>
              </div>
            </div>
          </div>
        );
      case 'suggestion':
        return (
          <div className="p-6 bg-yellow-50 rounded-lg mx-6 border border-yellow-100">
            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
              💡 学习建议
            </h3>
            <div className="text-gray-600 text-sm">
              <p className="mb-2">正在生成个性化学习建议...</p>
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-yellow-200 rounded w-4/5"></div>
                <div className="h-4 bg-yellow-200 rounded w-full"></div>
                <div className="h-4 bg-yellow-200 rounded w-3/4"></div>
                <div className="h-4 bg-yellow-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="overflow-auto">
      {renderContent()}
    </section>
  );
} 