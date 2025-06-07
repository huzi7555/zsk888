"use client"

interface RichViewerProps {
  html: string
}

export default function RichViewer({ html }: RichViewerProps) {
  return (
    <div
      className="prose max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{
        __html: html || "<p><em>（空内容）</em></p>",
      }}
    />
  )
}
