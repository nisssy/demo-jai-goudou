"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CommonSidebar } from "@/components/common-sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Calendar, 
  MapPin, 
  Building, 
  Upload, 
  FileText, 
  ImageIcon, 
  Mail,
  CheckCircle2,
  List,
  Send,
  DollarSign,
  Eye,
  ArrowLeft,
  Package,
  Truck,
  FileSpreadsheet,
  Download,
} from "lucide-react"

// --- Type Definitions ---
type QuoteItem = {
  id: number
  name: string
  quantity: number
  unitPrice: number
  included: boolean
}

type HallQuote = {
  hallName: string
  quoteItems: QuoteItem[]
  percentage?: number
  calculatedAmount?: number
}

type Project = {
  id: string
  companyName: string
  hallNames: string[]
  eventStartDate: string
  eventEndDate: string
  area: string
  status: "draft" | "quote-created" | "confirmed" | "in-progress" | "completed"
  budget: string
  createdAt: string
  salesPersonId: string
  posterCount?: string
  target?: string
  hallQuotes?: HallQuote[]
  // Prize Vendor specific fields
  deliveryVendor?: string
  orderFileName?: string
}

export default function PrizeVendorView() {
  const { toast } = useToast()
  
  // --- Mock Data ---
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "P001",
      companyName: "株式会社メガ",
      hallNames: ["メガホール大阪", "メガホール東京"],
      eventStartDate: "2024-11-15",
      eventEndDate: "2024-11-15",
      area: "大阪府大阪市",
      status: "confirmed",
      budget: "450,000",
      createdAt: "2024-10-01",
      salesPersonId: "E002",
      posterCount: "100",
      target: "女性40代",
      deliveryVendor: "ヤマト運輸",
      orderFileName: "20241115_個別発注書_メガホール大阪.xlsx"
    },
    {
      id: "P002",
      companyName: "株式会社サンライズ",
      hallNames: ["サンライズホール名古屋", "サンライズホール福岡"],
      eventStartDate: "2024-12-10",
      eventEndDate: "2024-12-10",
      area: "愛知県名古屋市",
      status: "in-progress",
      budget: "280,000",
      createdAt: "2024-10-15",
      salesPersonId: "E003",
      posterCount: "40",
      target: "男性20代",
      deliveryVendor: "佐川急便",
      orderFileName: "20241210_個別発注書_サンライズホール.xlsx"
    },
    {
      id: "P003",
      companyName: "株式会社スカイ",
      hallNames: ["スカイホール福岡", "スカイホール広島"],
      eventStartDate: "2025-01-20",
      eventEndDate: "2025-01-20",
      area: "福岡県福岡市",
      status: "quote-created",
      budget: "350,000",
      createdAt: "2024-11-01",
      salesPersonId: "E004",
      posterCount: "60",
      target: "ファミリー層",
      deliveryVendor: "日本郵便",
      orderFileName: "20250120_個別発注書_スカイホール.xlsx"
    },
  ])

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // --- Confirmation Dialog States ---
  const [showConfirm, setShowConfirm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])

  // --- Mock CSV Data ---
  const mockCsvData = [
    { No: 1, 品名: "クオカード1000円分", 数量: 1, 配送先名: "山田太郎", 住所: "東京都渋谷区...", 電話番号: "090-1234-5678" },
    { No: 2, 品名: "カタログギフト", 数量: 1, 配送先名: "佐藤花子", 住所: "神奈川県横浜市...", 電話番号: "080-2345-6789" },
    { No: 3, 品名: "和牛セット", 数量: 1, 配送先名: "鈴木一郎", 住所: "大阪府大阪市...", 電話番号: "070-3456-7890" },
    { No: 4, 品名: "旅行券", 数量: 1, 配送先名: "高橋美咲", 住所: "北海道札幌市...", 電話番号: "090-9876-5432" },
    { No: 5, 品名: "お米券", 数量: 2, 配送先名: "伊藤健太", 住所: "福岡県福岡市...", 電話番号: "080-8765-4321" },
  ]

  // --- File Upload Logic ---
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log(`file selected:`, file.name)
      toast({
        title: "ファイル選択",
        description: `配送情報ファイル「${file.name}」を選択しました`,
      })
    }
  }

  const handleSubmit = () => {
    setShowConfirm(false)
    toast({
      title: "送信完了",
      description: "配送情報を送信しました",
    })
  }

  const handlePreview = () => {
    setPreviewData(mockCsvData)
    setShowPreview(true)
  }

  // --- UI Components ---

  // List View (with Sidebar showing only "案件一覧" button)
  if (!selectedProject) {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50">
        {/* Sidebar: Common Sidebar */}
        <CommonSidebar activeScreen="list" />

        {/* Main Content: Project List */}
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          <ScrollArea className="h-full">
             <div className="p-8 max-w-5xl">
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-sm">
                              {project.id}
                            </Badge>
                            <Badge variant={project.status === "confirmed" || project.status === "in-progress" ? "default" : "secondary"}>
                              {project.status === "confirmed" ? "確定" : 
                               project.status === "in-progress" ? "進行中" : 
                               project.status === "completed" ? "完了" : "下書き"}
                            </Badge>
                          </div>

                          <div>
                            <h3 className="text-xl font-semibold text-foreground">{project.hallNames.join(" / ")}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {project.eventStartDate === project.eventEndDate
                                  ? project.eventStartDate
                                  : `${project.eventStartDate} ～ ${project.eventEndDate}`}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {project.area}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />¥{project.budget}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground">作成日: {project.createdAt}</div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProject(project)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          詳細
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  }

  // Detail View (Full Width)
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50">
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <ScrollArea className="h-full">
          <div className="container mx-auto py-6 max-w-4xl px-4">
            
            {/* Back Button */}
            <div className="mb-4">
              <Button variant="ghost" onClick={() => setSelectedProject(null)} className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft className="w-4 h-4" />
                案件一覧に戻る
              </Button>
            </div>
            
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                {selectedProject.companyName}
                <Badge variant="outline" className="ml-2 font-normal">
                  {selectedProject.id}
                </Badge>
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center"><Building className="w-4 h-4 mr-1" /> {selectedProject.hallNames.join(" / ")}</span>
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {selectedProject.area}</span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Card 1: 案件情報 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  案件情報
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">イベント名</Label>
                  <div className="font-medium mt-1">{selectedProject.companyName} 抽選会イベント</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">開催日</Label>
                  <div className="font-medium mt-1">{selectedProject.eventStartDate} 〜 {selectedProject.eventEndDate}</div>
                </div>
                  <div>
                  <Label className="text-muted-foreground">会場</Label>
                  <div className="font-medium mt-1">{selectedProject.hallNames.join(", ")}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">ターゲット</Label>
                  <div className="font-medium mt-1">{selectedProject.target || "未定"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: 景品領域 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  景品領域
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* 発注書情報 */}
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    発注書情報・指定配送業者
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">指定配送業者:</span>
                      <span className="font-bold">{selectedProject.deliveryVendor || "未定"}</span>
                    </div>
                    <div className="flex items-center justify-between bg-background border p-3 rounded-md shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-green-100 text-green-700 p-2 rounded shrink-0">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium truncate">{selectedProject.orderFileName || "発注書未発行.xlsx"}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <Button variant="outline" size="sm" className="gap-2" onClick={handlePreview}>
                          <Eye className="w-4 h-4" />
                          プレビュー
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                          DL
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 配送情報アップロード */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    配送情報アップロード領域
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    発注書情報に追跡番号が追加されたファイルをアップロードしてください
                  </p>
                  
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer bg-muted/10"
                    onClick={handleFileClick}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                    />
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">配送情報をアップロード</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      ドラッグ＆ドロップ、またはクリックしてファイルを選択
                    </p>
                    <Button variant="outline" size="sm" onClick={(e) => {
                      e.stopPropagation()
                      handleFileClick()
                    }}>ファイルを選択</Button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button className="w-full sm:w-auto" onClick={() => setShowConfirm(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    送信する
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>配送情報の送信</DialogTitle>
            <DialogDescription>
              アップロードした配送情報を送信しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>キャンセル</Button>
            <Button onClick={handleSubmit}>送信</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>発注書プレビュー</DialogTitle>
          </DialogHeader>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(mockCsvData[0] || {}).map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCsvData.map((row, i) => (
                  <TableRow key={i}>
                    {Object.values(row).map((cell: any, j) => (
                      <TableCell key={j}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
