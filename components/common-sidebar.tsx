"use client"

import { List } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommonSidebarProps {
  title?: string
  subtitle?: string
  className?: string
  activeScreen?: string
  onNavigate?: (screen: string) => void
}

export function CommonSidebar({
  title = "JAS Event Manager",
  subtitle = "抽選イベント管理",
  className,
  activeScreen = "list",
  onNavigate,
}: CommonSidebarProps) {
  return (
    <aside className={cn("w-64 border-r border-border bg-card h-full", className)}>
      <div className="p-6">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <nav className="px-3 space-y-1">
        <button
          onClick={() => onNavigate?.("list")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            activeScreen === "list"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <List className="w-5 h-5" />
          <span className="font-medium">案件一覧</span>
        </button>
      </nav>
    </aside>
  )
}
