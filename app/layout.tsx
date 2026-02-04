import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ProjectProvider } from "@/contexts/project-context"
import { Header } from "@/components/layout/header"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JAS Event Manager - 抽選イベント管理システム",
  description: "AI自動化機能を搭載した抽選イベント管理SaaSシステム",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`font-sans antialiased`}>
        <ProjectProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            {children}
            <Toaster />
          </div>
        </ProjectProvider>
        <Analytics />
      </body>
    </html>
  )
}
