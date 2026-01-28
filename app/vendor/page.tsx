"use client"

import { useState } from "react"
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
import { Project, QuoteItem, HallQuote } from "@/types"

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


  // --- UI Components ---

  // List View (with Sidebar showing "案件一覧" button and title)
  if (!selectedProject) {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50">
        {/* Sidebar: Common Component */}
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

                <div className="border border-border rounded-lg p-6 bg-card">
                  <h3 className="font-semibold mb-4">デザインイメージ（発注元提供）</h3>
                  <div className="border rounded-lg overflow-hidden bg-muted/20">
                    <div className="aspect-[3/4] relative flex items-center justify-center bg-gray-100">
                      <div className="text-center p-6">
                        <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm font-medium text-foreground">poster_sample_v1.jpg</p>
                        <p className="text-xs text-muted-foreground mt-1">2024/10/15 10:00 アップロード済み</p>
                      </div>
                    </div>
                    <div className="p-3 bg-card border-t flex justify-end">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        プレビュー
                      </Button>
                    </div>
                  </div>
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

                <div className="border border-border rounded-lg p-6 bg-card">
                  <h3 className="font-semibold mb-4">デザインイメージ（発注元提供）</h3>
                  <div className="border rounded-lg overflow-hidden bg-muted/20">
                    <div className="aspect-video relative flex items-center justify-center bg-gray-100">
                      <div className="text-center p-6">
                        <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm font-medium text-foreground">dm_sample_v1.jpg</p>
                        <p className="text-xs text-muted-foreground mt-1">2024/10/15 10:00 アップロード済み</p>
                      </div>
                    </div>
                    <div className="p-3 bg-card border-t flex justify-end">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        プレビュー
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </div>

      <Toaster />
    </div>
  )
}
