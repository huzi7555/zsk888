'use client';

import { useState } from 'react';

export default function TestImagePage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const testImageProxy = async () => {
    setTestResults(['🧪 开始测试图片代理功能...']);
    
    // 测试一个公开的图片URL
    const testImageUrl = 'https://via.placeholder.com/300x200.png?text=Test+Image';
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(testImageUrl)}`;
    
    try {
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        const contentType = response.headers.get('Content-Type');
        const contentLength = response.headers.get('Content-Length');
        
        setTestResults(prev => [
          ...prev,
          `✅ 代理请求成功`,
          `📊 Content-Type: ${contentType}`,
          `📊 Content-Length: ${contentLength} 字节`,
          `🔗 代理URL: ${proxyUrl}`
        ]);
      } else {
        setTestResults(prev => [
          ...prev,
          `❌ 代理请求失败: ${response.status} ${response.statusText}`
        ]);
      }
    } catch (error) {
      setTestResults(prev => [
        ...prev,
        `❌ 代理请求异常: ${error instanceof Error ? error.message : '未知错误'}`
      ]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">图片代理功能测试</h1>
      
      <div className="space-y-4">
        <button
          onClick={testImageProxy}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🧪 测试图片代理
        </button>

        {testResults.length > 0 && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">测试结果:</h3>
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">测试图片显示:</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">原始图片:</p>
              <img 
                src="https://via.placeholder.com/300x200.png?text=Original+Image" 
                alt="原始测试图片"
                className="border rounded"
              />
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">通过代理的图片:</p>
              <img 
                src="/api/proxy-image?url=https%3A//via.placeholder.com/300x200.png%3Ftext%3DProxy%2BImage" 
                alt="代理测试图片"
                className="border rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 