"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, ChevronRight, Plus } from "lucide-react"
import { Project, ProductItem, Employee, Company } from "@/types"

interface ProjectDetailProps {
  project: Project
  productItems: ProductItem[]
  employees: Employee[]
  companies: Company[]
  onBack: () => void
  onSelectProject: (project: Project) => void
}

export function ProjectDetail({
  project,
  productItems,
  employees,
  companies,
  onBack,
  onSelectProject,
}: ProjectDetailProps) {
  const salesPerson = employees.find((e) => e.id === project.salesPersonId)
  const company = companies.find((c) => c.name === project.companyName)

  const getProjectStatusLabel = (status: Project["status"]) => {
    const labels: Record<string, string> = {
      draft: "下書き",
      "quote-created": "見積もり作成済み",
      confirmed: "確定",
      "in-progress": "進行中",
      completed: "完了",
    }
    return labels[status] || status
  }

  const getProjectStatusVariant = (status: Project["status"]) => {
    switch (status) {
      case "draft": return "outline" as const
      case "quote-created": return "secondary" as const
      case "confirmed":
      case "in-progress": return "default" as const
      case "completed": return "secondary" as const
      default: return "outline" as const
    }
  }

  const getProductStatusVariant = (status: string) => {
    switch (status) {
      case "提案中": return "outline" as const
      case "進行中": return "default" as const
      case "完了": return "secondary" as const
      case "キャンセル": return "destructive" as const
      default: return "outline" as const
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "イベント": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "ポイント": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "オプション": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const projectProducts = productItems.filter((p) => p.projectId === project.id)
  const categoryCounts = projectProducts.reduce(
    (acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button className="hover:text-primary" onClick={onBack}>
          案件一覧
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground">案件 {project.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {project.hallNames.join(" / ")} - {salesPerson?.name || "未設定"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">案件No: {project.id}</Badge>
              <Badge variant={getProjectStatusVariant(project.status)}>
                {getProjectStatusLabel(project.status)}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => onSelectProject(project)}>
          商材ステッパーを開く
        </Button>
      </div>

      {/* Project Info Card */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">案件情報</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">法人</span>
              <span className="text-sm col-span-2">{project.companyName}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">ホール</span>
              <span className="text-sm col-span-2">{project.hallNames.join(", ")}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">担当営業</span>
              <span className="text-sm col-span-2">{salesPerson?.name || "-"}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">依頼日</span>
              <span className="text-sm col-span-2">{project.createdAt}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">エリア</span>
              <span className="text-sm col-span-2">{project.area}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">予算</span>
              <span className="text-sm col-span-2">¥{project.budget}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">商材一覧</h3>
          <span className="text-sm text-muted-foreground">
            {projectProducts.length}件
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <span key={cat} className="ml-2">
                {cat}: {count}
              </span>
            ))}
          </span>
        </div>
        <Button size="sm" variant="outline">
          <Plus className="w-3.5 h-3.5 mr-1" />
          商材を追加
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="w-[100px]">区分</TableHead>
                <TableHead>商材名</TableHead>
                <TableHead className="w-[100px]">開始日</TableHead>
                <TableHead className="w-[100px]">終了日</TableHead>
                <TableHead className="w-[80px]">ステータス</TableHead>
                <TableHead className="w-[120px]">キャスティング</TableHead>
                <TableHead className="w-[110px] text-right">見積金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectProducts.map((product) => (
                <TableRow key={product.id} className="text-sm">
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.startDate}</TableCell>
                  <TableCell>{product.endDate}</TableCell>
                  <TableCell>
                    <Badge variant={getProductStatusVariant(product.status)} className="text-xs">
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.casting || "-"}</TableCell>
                  <TableCell className="text-right">¥{product.estimateAmount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {projectProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    商材がありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
