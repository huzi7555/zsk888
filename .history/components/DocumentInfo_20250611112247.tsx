"use client";

interface DocumentMeta {
  createdAt: string;
  source: string;
  manualTags: string[];
  aiTags: string[];
  relatedDocs: Array<{
    url: string;
    title: string;
  }>;
}

export default function DocumentInfo({ meta }: { meta: DocumentMeta }) {
  return (
    <div className="p-4 bg-white rounded-md shadow-sm space-y-3">
      {/* 直接展示所有字段，无折叠 */}
      <div className="text-sm">
        <p><span className="font-medium">创建时间：</span>{meta.createdAt}</p>
      </div>
      
      <div className="text-sm">
        <p><span className="font-medium">来源：</span>{meta.source}</p>
      </div>
      
      {meta.manualTags.length > 0 && (
        <div className="text-sm">
          <span className="font-medium">手动标签：</span>
          <span>{meta.manualTags.join('、')}</span>
        </div>
      )}
      
      {meta.aiTags.length > 0 && (
        <div className="text-sm">
          <span className="font-medium">AI 标签：</span>
          <span>{meta.aiTags.join('、')}</span>
        </div>
      )}
      
      {meta.relatedDocs.length > 0 && (
        <div className="text-sm">
          <p className="font-medium mb-1">相关文档：</p>
          <ul className="space-y-1 ml-2">
            {meta.relatedDocs.map((doc, index) => (
              <li key={index}>
                <a href={doc.url} className="text-blue-600 hover:underline">
                  • {doc.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 