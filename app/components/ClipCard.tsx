"use client"
import Link from "next/link"
import { TagChip } from "@/app/components/TagChip"
import { Checkbox } from "@/components/ui/checkbox"
import type { Clip } from "@/app/store"

export function ClipCard({ clip }: { clip: Clip }) {
  return (
    <div className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <Checkbox id={clip.id} className="mt-1" />
      <div className="flex-1">
        <Link href={`/clip/${clip.id}`} className="block group">
          <h3 className="font-medium text-gray-900 text-base leading-relaxed group-hover:text-blue-600 transition-colors">
            {clip.title}
          </h3>
        </Link>
        <div className="mt-2 flex flex-wrap">
          {clip.tags.map((t) => (
            <TagChip key={t} label={t} />
          ))}
        </div>
      </div>
      <time className="text-sm text-gray-400 whitespace-nowrap">{clip.createdAt}</time>
    </div>
  )
}
