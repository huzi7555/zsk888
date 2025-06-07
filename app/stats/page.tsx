"use client" // Added client directive as useStore is a client hook
import { useStore } from "@/app/store" // Import useStore

export default function StatsPage() {
  const clips = useStore((s) => s.clips)

  // Calculate entries by day for the last 7 days
  const byDay = clips.reduce<Record<string, number>>((acc, c) => {
    const d = c.createdAt.slice(0, 10) // Ensure YYYY-MM-DD format
    acc[d] = (acc[d] || 0) + 1
    return acc
  }, {})

  // Get the last 7 days, including days with no entries
  const last7Days = Array.from({ length: 7 })
    .map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split("T")[0]
    })
    .reverse() // To show from oldest to newest

  const dailyCounts = last7Days.map((date) => ({
    date,
    count: byDay[date] || 0,
  }))

  // Calculate top 5 tags
  const topTags = Object.entries(
    clips
      .flatMap((c) => c.tags)
      .reduce<Record<string, number>>((a, t) => {
        a[t] = (a[t] || 0) + 1
        return a
      }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <main className="p-10 space-y-10">
      <h1 className="text-2xl font-bold dark:text-gray-100">仪表盘</h1>
      <section>
        <h2 className="mb-3 text-lg font-semibold dark:text-gray-200">📈 新建条目趋势（最近 7 天）</h2>
        <ul className="grid grid-cols-7 gap-2 text-center">
          {dailyCounts.map(({ date, count }) => (
            <li key={date} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{count}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{date.slice(5)}</div>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold dark:text-gray-200">🏷️ 热门标签 TOP5</h2>
        <ul className="flex flex-wrap gap-4">
          {topTags.map(([tag, n]) => (
            <li
              key={tag}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/50 dark:text-blue-300"
            >
              {tag}·{n}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
