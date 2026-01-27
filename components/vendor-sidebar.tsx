import { List } from "lucide-react"

interface VendorSidebarProps {
  onBackToList?: () => void
}

export function VendorSidebar({ onBackToList }: VendorSidebarProps) {
  return (
    <div className="w-80 border-r bg-background flex flex-col h-full p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">JAS Event Manager</h1>
        <p className="text-muted-foreground mt-1">抽選イベント管理</p>
      </div>
      
      <div 
        className="bg-primary text-primary-foreground px-4 py-3 rounded-lg flex items-center gap-2 font-bold shadow-sm cursor-pointer hover:bg-primary/90 transition-colors"
        onClick={onBackToList}
        role="button"
      >
        <List className="w-5 h-5" />
        案件一覧
      </div>
    </div>
  )
}
