"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  ChevronLeft,
} from "lucide-react"
import { RecordItem } from "@/types"

interface RecordListProps {
  records: RecordItem[]
  onNavigateToRecord: (recordId: string) => void
  onNavigateToProject: (projectId: string) => void
  onNewProject: () => void
  onNavigateToProductDetail: () => void
}

const productCategories = ["イベント", "ポイント", "オプション"]
const eventCategories = ["来店促進", "認知拡大"]
const productNames = ["トリニティーガール", "合同抽選会", "LINE広告", "お知らせバナー", "メインバナー"]

type ModalStep = "select-project" | "configure-product"

export function RecordList({
  records,
  onNavigateToRecord,
  onNavigateToProject,
  onNewProject,
  onNavigateToProductDetail,
}: RecordListProps) {
  // Search state
  const [companySearch, setCompanySearch] = useState("")
  const [searchTarget, setSearchTarget] = useState<"company" | "hall">("company")
  const [productCategory, setProductCategory] = useState("")
  const [eventCategory, setEventCategory] = useState("")
  const [periodType, setPeriodType] = useState("実施日")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [hallTantou, setHallTantou] = useState("")
  const [projectNo, setProjectNo] = useState("")
  const [projectName, setProjectName] = useState("")

  // Tab state
  const [activeTab, setActiveTab] = useState<"list" | "messages">("list")
  const messageCount = 5

  // Modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [modalStep, setModalStep] = useState<ModalStep>("select-project")
  const [selectedProjectForAdd, setSelectedProjectForAdd] = useState<string | null>(null)

  // Modal search state
  const [modalCompanySearch, setModalCompanySearch] = useState("")
  const [modalSearchTarget, setModalSearchTarget] = useState<"company" | "hall">("company")
  const [modalProductCategory, setModalProductCategory] = useState("")
  const [modalEventCategory, setModalEventCategory] = useState("")
  const [modalPeriodType, setModalPeriodType] = useState("実施日")
  const [modalDateFrom, setModalDateFrom] = useState("")
  const [modalDateTo, setModalDateTo] = useState("")
  const [modalHallTantou, setModalHallTantou] = useState("")
  const [modalProjectNo, setModalProjectNo] = useState("")
  const [modalProjectName, setModalProjectName] = useState("")

  // Product config state
  const [newProductCategory, setNewProductCategory] = useState("")
  const [newProductName, setNewProductName] = useState("")

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (companySearch) {
        if (searchTarget === "company" && !record.companyName?.toLowerCase().includes(companySearch.toLowerCase())) return false
        if (searchTarget === "hall" && !record.hallName?.toLowerCase().includes(companySearch.toLowerCase())) return false
      }
      if (productCategory && record.productCategory !== productCategory) return false
      if (eventCategory && record.eventCategory !== eventCategory) return false
      if (hallTantou && !record.hall担当?.includes(hallTantou)) return false
      if (projectNo && !record.projectCode.includes(projectNo)) return false
      if (projectName && !record.projectName?.includes(projectName)) return false
      if (dateFrom && record.publishStartDate < dateFrom) return false
      if (dateTo && record.publishEndDate > dateTo) return false
      return true
    })
  }, [records, companySearch, searchTarget, productCategory, eventCategory, hallTantou, projectNo, projectName, dateFrom, dateTo])

  // Get unique projects for the modal table
  const uniqueProjects = useMemo(() => {
    const projectMap = new Map<string, { projectCode: string; projectName: string; projectNo: string }>()
    records.forEach((r) => {
      if (!projectMap.has(r.projectId)) {
        projectMap.set(r.projectId, {
          projectCode: r.projectCode,
          projectName: r.projectName || "",
          projectNo: r.projectId,
        })
      }
    })
    return Array.from(projectMap.entries()).map(([id, data]) => ({ id, ...data }))
  }, [records])

  const handleOpenAddProduct = () => {
    setShowAddProductModal(true)
    setModalStep("select-project")
    setSelectedProjectForAdd(null)
  }

  const handleModalNext = () => {
    if (selectedProjectForAdd) {
      setModalStep("configure-product")
    }
  }

  const handleModalBack = () => {
    setModalStep("select-project")
  }

  const handleAddProduct = () => {
    setShowAddProductModal(false)
    setModalStep("select-project")
    setSelectedProjectForAdd(null)
    setNewProductCategory("")
    setNewProductName("")
    onNavigateToProductDetail()
  }

  const getStatusColor = (status: string) => {
    if (status.includes("申請中")) return "bg-blue-500"
    if (status.includes("事務承認") || status.includes("承認済")) return "bg-blue-700"
    if (status.includes("完了")) return "bg-blue-900"
    return "bg-blue-500"
  }

  // Search panel component (shared between main screen and modal)
  function SearchPanel({
    company, setCompany, target, setTarget,
    prodCat, setProdCat, evtCat, setEvtCat,
    period, setPeriod, from, setFrom, to, setTo,
    tantou, setTantou, no, setNo, name, setName,
    compact = false,
  }: {
    company: string; setCompany: (v: string) => void
    target: "company" | "hall"; setTarget: (v: "company" | "hall") => void
    prodCat: string; setProdCat: (v: string) => void
    evtCat: string; setEvtCat: (v: string) => void
    period: string; setPeriod: (v: string) => void
    from: string; setFrom: (v: string) => void
    to: string; setTo: (v: string) => void
    tantou: string; setTantou: (v: string) => void
    no: string; setNo: (v: string) => void
    name: string; setName: (v: string) => void
    compact?: boolean
  }) {
    return (
      <div className={`space-y-4 ${compact ? "text-sm" : ""}`}>
        <div className="grid grid-cols-3 gap-6">
          {/* 法人/ホール */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">法人/ホール</Label>
            <div className="flex gap-0">
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="法人名を検索..."
                className="rounded-r-none h-9 text-sm"
              />
              <div className="flex border border-l-0 rounded-r-md overflow-hidden">
                <button
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${target === "company" ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-accent"}`}
                  onClick={() => setTarget("company")}
                >
                  法人
                </button>
                <button
                  className={`px-3 py-1.5 text-xs font-medium border-l transition-colors ${target === "hall" ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-accent"}`}
                  onClick={() => setTarget("hall")}
                >
                  ホール
                </button>
              </div>
            </div>
          </div>

          {/* 商品カテゴリ */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">商品カテゴリ</Label>
            <Select value={prodCat} onValueChange={setProdCat}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {productCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* イベント区分 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">イベント区分</Label>
            <Select value={evtCat} onValueChange={setEvtCat}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {eventCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 期間 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">期間</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-9 text-sm w-28">
                <SelectValue placeholder="実施日" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="実施日">実施日</SelectItem>
                <SelectItem value="発注日">発注日</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 text-sm"
              />
              <span className="text-muted-foreground">～</span>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* ホール担当 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">ホール担当</Label>
            <Input
              value={tantou}
              onChange={(e) => setTantou(e.target.value)}
              placeholder="ホール担当を検索..."
              className="h-9 text-sm"
            />
          </div>

          {/* 案件No */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">案件No</Label>
            <Input
              value={no}
              onChange={(e) => setNo(e.target.value)}
              placeholder="案件Noを入力..."
              className="h-9 text-sm"
            />
          </div>
        </div>

        <div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">案件名</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="案件名を入力..."
              className="h-9 text-sm max-w-sm"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Title + Action Buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">案件一覧</h2>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleOpenAddProduct} className="gap-1.5">
            <Plus className="w-4 h-4" />
            新規商材追加
          </Button>
          <Button onClick={onNewProject} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            新規案件作成
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          <button
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === "list"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("list")}
          >
            案件一覧
          </button>
          <button
            className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
              activeTab === "messages"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("messages")}
          >
            新着メッセージ
            <Badge className="bg-red-500 text-white text-xs px-1.5 py-0 min-w-[20px] h-5 rounded-full">
              {messageCount}
            </Badge>
          </button>
        </div>
      </div>

      {activeTab === "list" && (
        <>
          {/* Search Panel */}
          <Card>
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-base">案件検索</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                複数の条件で案件を絞り込むことができます
              </p>
              <SearchPanel
                company={companySearch} setCompany={setCompanySearch}
                target={searchTarget} setTarget={setSearchTarget}
                prodCat={productCategory} setProdCat={setProductCategory}
                evtCat={eventCategory} setEvtCat={setEventCategory}
                period={periodType} setPeriod={setPeriodType}
                from={dateFrom} setFrom={setDateFrom}
                to={dateTo} setTo={setDateTo}
                tantou={hallTantou} setTantou={setHallTantou}
                no={projectNo} setNo={setProjectNo}
                name={projectName} setName={setProjectName}
              />
            </CardContent>
          </Card>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs bg-muted/50">
                  <TableHead className="w-[30px]"></TableHead>
                  <TableHead className="min-w-[120px]">ステータス</TableHead>
                  <TableHead className="min-w-[160px]">レコードタイトル</TableHead>
                  <TableHead className="w-[80px]">発注日</TableHead>
                  <TableHead className="w-[90px]">レコード番号</TableHead>
                  <TableHead className="w-[80px]">店舗コード</TableHead>
                  <TableHead className="w-[100px]">店舗名</TableHead>
                  <TableHead className="w-[110px]">掲載開始希望日</TableHead>
                  <TableHead className="w-[90px]">掲載終了日</TableHead>
                  <TableHead className="w-[70px]">掲載日数</TableHead>
                  <TableHead className="w-[90px] text-right">実NET額</TableHead>
                  <TableHead className="w-[80px] text-right">日予算</TableHead>
                  <TableHead className="w-[120px]">キャンペーン目的</TableHead>
                  <TableHead className="w-[70px]">課金方式</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="text-sm hover:bg-muted/30">
                    <TableCell className="pr-0">
                      <div className={`w-3 h-3 rounded-sm ${getStatusColor(record.status)}`} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{record.status}</TableCell>
                    <TableCell className="text-muted-foreground">{record.recordTitle}</TableCell>
                    <TableCell>{record.orderDate}</TableCell>
                    <TableCell>
                      <button
                        className="text-blue-600 hover:underline font-medium"
                        onClick={() => onNavigateToProject(record.projectId)}
                      >
                        {record.projectCode}
                      </button>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{record.storeCode}</TableCell>
                    <TableCell className="text-muted-foreground">{record.storeName}</TableCell>
                    <TableCell>{record.publishStartDate}</TableCell>
                    <TableCell>{record.publishEndDate}</TableCell>
                    <TableCell className="text-center">{record.publishDays} 日間</TableCell>
                    <TableCell className="text-right">¥ {record.netAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">¥ {record.dailyBudget.toLocaleString()}</TableCell>
                    <TableCell>{record.campaignPurpose}</TableCell>
                    <TableCell>{record.billingMethod}</TableCell>
                  </TableRow>
                ))}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                      該当するレコードがありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {activeTab === "messages" && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            新着メッセージはありません
          </CardContent>
        </Card>
      )}

      {/* 新規商材追加モーダル */}
      <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {modalStep === "select-project" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">追加先案件を選択</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <SearchPanel
                  company={modalCompanySearch} setCompany={setModalCompanySearch}
                  target={modalSearchTarget} setTarget={setModalSearchTarget}
                  prodCat={modalProductCategory} setProdCat={setModalProductCategory}
                  evtCat={modalEventCategory} setEvtCat={setModalEventCategory}
                  period={modalPeriodType} setPeriod={setModalPeriodType}
                  from={modalDateFrom} setFrom={setModalDateFrom}
                  to={modalDateTo} setTo={setModalDateTo}
                  tantou={modalHallTantou} setTantou={setModalHallTantou}
                  no={modalProjectNo} setNo={setModalProjectNo}
                  name={modalProjectName} setName={setModalProjectName}
                  compact
                />

                {/* Project table in modal */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs bg-muted/50">
                        <TableHead className="w-[30px]"></TableHead>
                        <TableHead className="min-w-[120px]">ステータス</TableHead>
                        <TableHead className="min-w-[160px]">レコードタイトル</TableHead>
                        <TableHead className="w-[80px]">発注日</TableHead>
                        <TableHead className="w-[90px]">レコード番号</TableHead>
                        <TableHead className="w-[80px]">店舗コード</TableHead>
                        <TableHead className="w-[100px]">店舗名</TableHead>
                        <TableHead className="w-[110px]">掲載開始希望日</TableHead>
                        <TableHead className="w-[90px]">掲載終了日</TableHead>
                        <TableHead className="w-[70px]">掲載日数</TableHead>
                        <TableHead className="w-[90px] text-right">実NET額</TableHead>
                        <TableHead className="w-[80px] text-right">日予算</TableHead>
                        <TableHead className="w-[120px]">キャンペーン目的</TableHead>
                        <TableHead className="w-[70px]">課金方式</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow
                          key={record.id}
                          className={`text-sm cursor-pointer transition-colors ${
                            selectedProjectForAdd === record.projectId ? "bg-blue-50 dark:bg-blue-950" : "hover:bg-muted/30"
                          }`}
                          onClick={() => setSelectedProjectForAdd(record.projectId)}
                        >
                          <TableCell className="pr-0">
                            <div className={`w-3 h-3 rounded-sm ${getStatusColor(record.status)}`} />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{record.status}</TableCell>
                          <TableCell className="text-muted-foreground">{record.recordTitle}</TableCell>
                          <TableCell>{record.orderDate}</TableCell>
                          <TableCell>
                            <span className="text-blue-600 font-medium">{record.projectCode}</span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{record.storeCode}</TableCell>
                          <TableCell className="text-muted-foreground">{record.storeName}</TableCell>
                          <TableCell>{record.publishStartDate}</TableCell>
                          <TableCell>{record.publishEndDate}</TableCell>
                          <TableCell className="text-center">{record.publishDays} 日間</TableCell>
                          <TableCell className="text-right">¥ {record.netAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">¥ {record.dailyBudget.toLocaleString()}</TableCell>
                          <TableCell>{record.campaignPurpose}</TableCell>
                          <TableCell>{record.billingMethod}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddProductModal(false)}>
                  キャンセル
                </Button>
                <Button
                  onClick={handleModalNext}
                  disabled={!selectedProjectForAdd}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  次へ
                </Button>
              </DialogFooter>
            </>
          )}

          {modalStep === "configure-product" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <button onClick={handleModalBack} className="text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <DialogTitle className="text-lg">商材の設定</DialogTitle>
                </div>
              </DialogHeader>

              <div className="py-8 px-4 space-y-6">
                <ul className="space-y-3 text-base list-disc list-inside">
                  <li>
                    <span className="font-medium">商材区分</span>
                    <span className="text-muted-foreground">（イベント、ポイント、オプション）</span>
                  </li>
                  <li>
                    <span className="font-medium">商材名</span>
                    <span className="text-muted-foreground">（トリニティーガール、合同抽選会、LINE広告、お知らせバナー、メインバナーなど）</span>
                    <span>の設定</span>
                  </li>
                </ul>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">商材区分</Label>
                    <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">商材名</Label>
                    <Select value={newProductName} onValueChange={setNewProductName}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {productNames.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddProductModal(false)}>
                  キャンセル
                </Button>
                <Button
                  onClick={handleAddProduct}
                  disabled={!newProductCategory || !newProductName}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  追加
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
