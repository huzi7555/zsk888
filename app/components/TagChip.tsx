"use client"

import { X } from "lucide-react"

interface TagChipProps {
  label: string
  onRemove?: () => void
  onClick?: () => void
}

export function TagChip({ label, onRemove, onClick }: TagChipProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 mr-2 cursor-pointer hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
      onClick={onClick}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors dark:hover:bg-gray-500"
        >
          <X size={10} />
        </button>
      )}
    </span>
  )
}
