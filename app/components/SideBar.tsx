"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Inbox, Book, ImageIcon, Bell, Layout, Upload, Map, Sun, Moon, BarChart2 } from 'lucide-react' // Import BarChart2
import { useTheme } from "next-themes"
// Removed QuickUpload import as it will be moved to app/layout.tsx

const nav = [
  { icon: Home, href: "/", label: "Home" },
  { icon: Inbox, href: "/inbox", label: "Inbox" },
  { icon: Book, href: "/library", label: "Library" },
  { icon: ImageIcon, href: "/gallery", label: "Gallery" },
  { icon: BarChart2, href: "/stats", label: "Stats" }, // Changed icon to BarChart2
  { icon: Bell, href: "/notifications", label: "Notifications" },
  { icon: Upload, href: "/upload", label: "Upload" },
  { icon: Map, href: "/roadmap", label: "Roadmap" },
]

export default function SideBar({ collapsed, toggleCollapsed }: { collapsed: boolean; toggleCollapsed: () => void }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-30 flex flex-col items-center
              bg-background transition-all duration-300
              ${collapsed ? "w-0 overflow-hidden" : "w-[60px]"}`}
    >
      {/* Logo */}
      <Link
        href="/"
        className="mt-4 mb-8 text-[10px] font-bold tracking-wider rotate-90 select-none dark:text-gray-200"
      >
        tma
      </Link>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-6">
        {/* Toggle Button - First item in navigation with distinct styling */}
        <button
          onClick={toggleCollapsed}
          aria-label="Toggle sidebar"
          className="group relative flex items-center justify-center w-10 h-10 rounded-md bg-gray-100 transition
                 text-gray-800 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white"
        >
          <Layout size={22} />
          {!collapsed && (
            <span
              className="absolute left-11 top-1/2 -translate-y-1/2 whitespace-nowrap
                     rounded bg-gray-800 px-2 py-0.5 text-xs text-white opacity-0
                     group-hover:opacity-100 transition pointer-events-none"
            >
              Toggle Sidebar
            </span>
          )}
        </button>

        {/* Regular Navigation Items */}
        {nav.map(({ icon: Icon, href, label }) => {
          const active = pathname === "/" ? href === pathname : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-md transition
                ${
                  active
                    ? "bg-white/20 text-amber-400 dark:bg-gray-800/50 dark:text-amber-300"
                    : "text-gray-600 hover:bg-white/10 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/20 dark:hover:text-white"
                }`}
            >
              <Icon size={22} />
              {!collapsed && (
                <span
                  className="absolute left-11 top-1/2 -translate-y-1/2 whitespace-nowrap
                             rounded bg-gray-800 px-2 py-0.5 text-xs text-white opacity-0
                             group-hover:opacity-100 transition pointer-events-none"
                >
                  {label}
                </span>
              )}
            </Link>
          )
        })}

        {/* Notifications Button - Added */}
        <Link
          href="/notifications"
          aria-label="通知"
          className={`group relative flex items-center justify-center w-10 h-10 rounded-md transition
              ${
                pathname === "/notifications"
                  ? "bg-white/20 text-amber-400 dark:bg-gray-800/50 dark:text-amber-300"
                  : "text-gray-600 hover:bg-white/10 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/20 dark:hover:text-white"
              }`}
        >
          <Bell size={22} />
          {/* 未读红点占位： */}
          {/* <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" /> */}
          {!collapsed && (
            <span
              className="absolute left-11 top-1/2 -translate-y-1/2 whitespace-nowrap
                       rounded bg-gray-800 px-2 py-0.5 text-xs text-white opacity-0
                       group-hover:opacity-100 transition pointer-events-none"
            >
              通知
            </span>
          )}
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="group relative flex items-center justify-center w-10 h-10 rounded-md transition
               text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-50"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && (
            <span
              className="absolute left-11 top-1/2 -translate-y-1/2 whitespace-nowrap
                   rounded bg-gray-800 px-2 py-0.5 text-xs text-white opacity-0
                   group-hover:opacity-100 transition pointer-events-none"
            >
              主题
            </span>
          )}
        </button>
      </nav>
    </aside>
  )
}
