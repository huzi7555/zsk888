"use client"

export function GroupHeader({ date }: { date: string }) {
  return <h4 className="text-gray-500 font-medium mt-8 mb-4 first:mt-0">{date}</h4>
}
