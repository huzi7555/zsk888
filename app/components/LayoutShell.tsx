"use client"
import { useState, type ReactNode } from "react"
import { LayoutPanelLeft } from "lucide-react"
import SideBar from "@/app/components/SideBar"
import { SiteFooter } from "@/app/components/SiteFooter"
import AppHeader from "@/app/components/AppHeader"
export default function LayoutShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleCollapsed = () => setCollapsed(!collapsed)

  return (
    <>
      {/* SideBar with toggle function passed */}
      <SideBar collapsed={collapsed} toggleCollapsed={toggleCollapsed} />

      {/* AppHeader with quick upload button */}
      <AppHeader />

      {/* Collapsed state toggle button - only visible when sidebar is collapsed */}
      {collapsed && (
        <button
          onClick={toggleCollapsed}
          aria-label="Expand sidebar"
          className="fixed top-4 left-4 z-40 w-10 h-10 rounded-md bg-white shadow-sm transition
                   text-gray-800 hover:text-gray-900
                   flex items-center justify-center"
        >
          <LayoutPanelLeft size={22} />
        </button>
      )}

      {/* Content */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${collapsed ? "pl-6" : "pl-[84px]"}`}>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>


    </>
  )
}
