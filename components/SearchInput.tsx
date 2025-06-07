import { Paperclip, Scissors, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchInput() {
  return (
    <div className="relative flex items-center w-full max-w-2xl mt-8">
      <div className="absolute left-0 flex items-center pl-4 pointer-events-none">
        <span className="text-xl">🐼</span>
      </div>
      <Input
        placeholder="@DeepSeek 精选.硅谷创社 通俗解释什么是MCP"
        className="h-14 w-full rounded-lg border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 pl-12 pr-32 text-base shadow-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:ring-primary/20"
      />
      <div className="absolute right-0 flex items-center pr-4 space-x-3">
        <Paperclip
          size={20}
          className="text-zinc-500 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300"
        />
        <Scissors
          size={20}
          className="text-zinc-500 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300"
        />
        <ChevronDown
          size={20}
          className="text-zinc-500 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300"
        />
      </div>
    </div>
  )
} 