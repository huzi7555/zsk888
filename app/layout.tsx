import "@/app/globals.css"
import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import LayoutShell from "@/app/components/LayoutShell"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Taskmaster AI",
  description: "Your intelligent task management assistant.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-stone-100 font-sans antialiased dark:bg-stone-950",
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LayoutShell>{children}</LayoutShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
