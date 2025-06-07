export function fakeSummary(html: string, max = 120) {
  const text = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ")
  return text.slice(0, max) + (text.length > max ? "…" : "")
}

const stopWords = ["the", "and", "of", "to", "在", "是", "了", "的"]
export function fakeTagSuggest(html: string) {
  const freq: Record<string, number> = {}
  html
    .replace(/<[^>]+>/g, "")
    .toLowerCase()
    .replace(/[^a-zA-Z\u4e00-\u9fa5\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !stopWords.includes(w))
    .forEach((w) => (freq[w] = (freq[w] || 0) + 1))
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w)
}
