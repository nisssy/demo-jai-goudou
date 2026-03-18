"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { RecordItem } from "@/types"

interface RecordDetailProps {
  record: RecordItem
  onBack: () => void
  onNavigateToProject: (projectId: string) => void
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm col-span-2">{value}</span>
    </div>
  )
}

export function RecordDetail({ record, onBack, onNavigateToProject }: RecordDetailProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button className="hover:text-primary" onClick={onBack}>
          案件一覧
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground">{record.recordNumber}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{record.recordTitle}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{record.recordNumber}</Badge>
              <Badge variant="secondary">{record.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <FormField label="レコード番号" value={String(record.recordNumber)} />
          <FormField label="営業申込日" value={record.salesApplicationDate || "-"} />
          <FormField label="発注日" value={record.orderDate} />
          <FormField label="獲得者" value={record.acquirer || "-"} />
          <FormField label="商材区分" value={record.productCategory} />
          <FormField label="商材名" value={record.productName} />
          <FormField label="キャンペーン目的" value={record.campaignPurpose} />
          <FormField label="課金方式" value={record.billingMethod} />
        </CardContent>
      </Card>

      {/* Store Info */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">店舗情報</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <FormField label="店舗コード" value={record.storeCode} />
          <FormField label="店舗名" value={record.storeName} />
          <FormField label="配信エリア" value={record.deliveryArea} />
          <FormField label="ターゲット" value={record.target} />
        </CardContent>
      </Card>

      {/* Publishing Info */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">掲載情報</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <FormField label="掲載開始希望日" value={record.publishStartDate} />
          <FormField label="掲載終了日" value={record.publishEndDate} />
          <FormField label="掲載日数" value={`${record.publishDays}日間`} />
          <FormField label="実NET額" value={`¥ ${record.netAmount.toLocaleString()}`} />
          <FormField label="日予算" value={`¥ ${record.dailyBudget.toLocaleString()}`} />
        </CardContent>
      </Card>

      {/* Related Project Link */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">関連案件</span>
            <Button variant="outline" size="sm" onClick={() => onNavigateToProject(record.projectId)}>
              案件 {record.projectCode} を表示
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
