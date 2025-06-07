"use client"
import QuickUploadTrigger from "@/app/components/QuickUploadTrigger"

export default function AppHeader() {
  return (
    <header className="fixed top-0 right-0 z-40 p-4">
      <QuickUploadTrigger />
    </header>
  )
} 