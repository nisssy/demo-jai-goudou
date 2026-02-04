"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="flex h-16 items-center px-6 gap-6">
        <nav className="flex items-center gap-4 text-sm font-medium ml-4">
          <Link
            href="/"
            className={cn(
              "transition-colors hover:text-primary",
              pathname === "/" ? "text-foreground font-bold" : "text-muted-foreground"
            )}
          >
            DMM管理画面
          </Link>
          <Link
            href="/vendor"
            className={cn(
              "transition-colors hover:text-primary",
              pathname === "/vendor" ? "text-foreground font-bold" : "text-muted-foreground"
            )}
          >
            デザイン業者画面
          </Link>
          <Link
            href="/prize-vendor"
            className={cn(
              "transition-colors hover:text-primary",
              pathname === "/prize-vendor" ? "text-foreground font-bold" : "text-muted-foreground"
            )}
          >
            景品業者画面
          </Link>
          <Link
            href="/admin"
            className={cn(
              "transition-colors hover:text-primary",
              pathname === "/admin" ? "text-foreground font-bold" : "text-muted-foreground"
            )}
          >
            事務管理課画面
          </Link>
        </nav>
      </div>
    </header>
  )
}
