"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
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
} from "lucide-react"

// --- Type Definitions (Mirrored from app/page.tsx) ---
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
}

export default function VendorView() {
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
    },
  ])

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // --- Confirmation Dialog States ---
  const [showPosterConfirm, setShowPosterConfirm] = useState(false)
  const [showDmConfirm, setShowDmConfirm] = useState(false)

  // --- File Upload Logic ---
  const posterFileInputRef = useRef<HTMLInputElement>(null)
  const dmFileInputRef = useRef<HTMLInputElement>(null)

  const handlePosterFileClick = () => {
    posterFileInputRef.current?.click()
  }

  const handleDmFileClick = () => {
    dmFileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'dm') => {
    const file = event.target.files?.[0]
    if (file) {
      console.log(`${type} file selected:`, file.name)
      toast({
        title: "ファイル選択",
        description: `${type === 'poster' ? 'ポスター' : 'DM'}のデザイン画像「${file.name}」を選択しました`,
      })
    }
  }

  const handlePosterSubmit = () => {
    setShowPosterConfirm(false)
    toast({
      title: "送信完了",
      description: "ポスターデザインを送信しました",
    })
  }

  const handleDmSubmit = () => {
    setShowDmConfirm(false)
    toast({
      title: "送信完了",
      description: "DMデザインを送信しました",
    })
  }

  // --- UI Components ---

  // List View (with Sidebar showing only "案件一覧" button)
  if (!selectedProject) {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50">
        {/* Sidebar: Only Header Button */}
        <div className="w-80 border-r bg-background flex flex-col h-full p-4">
           <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg flex items-center gap-2 font-bold shadow-sm">
            <List className="w-5 h-5" />
            案件一覧
          </div>
        </div>

        {/* Main Content: Project List */}
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          <ScrollArea className="h-full">
             <div className="p-8 max-w-5xl">
              {/* No header text needed here based on user request "その下の案件のカードは削除して" referring to sidebar */}
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

            {/* Card 2: ポスター領域 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  ポスター領域
                </CardTitle>
                <CardDescription>ポスターデザインのアップロードとスケジュール管理</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <Label>初稿希望日</Label>
                      <Input type="date" className="w-full" />
                  </div>
                  <div className="space-y-2">
                      <Label>納品完了日</Label>
                      <Input type="date" className="w-full" />
                  </div>
                </div>

                <div 
                  className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={handlePosterFileClick}
                >
                  <input 
                    type="file" 
                    ref={posterFileInputRef} 
                    className="hidden" 
                    accept="image/*,.pdf,.ai"
                    onChange={(e) => handleFileChange(e, 'poster')}
                  />
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">デザインイメージをアップロード</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    ドラッグ＆ドロップ、またはクリックしてファイルを選択
                  </p>
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation()
                    handlePosterFileClick()
                  }}>ファイルを選択</Button>
                </div>

                <div className="flex justify-end pt-2">
                  <Button className="w-full sm:w-auto" onClick={() => setShowPosterConfirm(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    送信する
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: DM領域 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  DM領域
                </CardTitle>
                  <CardDescription>DMデザインのアップロードとスケジュール管理</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <Label>初稿希望日</Label>
                      <Input type="date" className="w-full" />
                  </div>
                  <div className="space-y-2">
                      <Label>納品完了日</Label>
                      <Input type="date" className="w-full" />
                  </div>
                </div>

                <div 
                  className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={handleDmFileClick}
                >
                  <input 
                    type="file" 
                    ref={dmFileInputRef} 
                    className="hidden" 
                    accept="image/*,.pdf,.ai"
                    onChange={(e) => handleFileChange(e, 'dm')}
                  />
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">デザインイメージをアップロード</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    ドラッグ＆ドロップ、またはクリックしてファイルを選択
                  </p>
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation()
                    handleDmFileClick()
                  }}>ファイルを選択</Button>
                </div>

                <div className="flex justify-end pt-2">
                  <Button className="w-full sm:w-auto" onClick={() => setShowDmConfirm(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    送信する
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </div>

      {/* Confirmation Dialogs */}
      <Dialog open={showPosterConfirm} onOpenChange={setShowPosterConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ポスターデザインの送信</DialogTitle>
            <DialogDescription>
              アップロードしたデザインを送信しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPosterConfirm(false)}>キャンセル</Button>
            <Button onClick={handlePosterSubmit}>送信</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDmConfirm} onOpenChange={setShowDmConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>DMデザインの送信</DialogTitle>
            <DialogDescription>
              アップロードしたデザインを送信しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDmConfirm(false)}>キャンセル</Button>
            <Button onClick={handleDmSubmit}>送信</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
