"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Bell,
  ArrowRight,
  Upload,
  Loader2,
  Mail,
  ImageIcon,
  Package,
  Calendar,
  DollarSign,
  Users,
  Building,
  MapPin,
  Send,
  FileCheck,
  TrendingUp,
  Truck,
  List,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { CommonSidebar } from "@/components/common-sidebar"
import { ProjectStepper } from "@/components/project-stepper"
import { Project, HallQuote, QuoteItem, Employee, Company, Hall } from "@/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Screen = "list" | "proposal" | "production" | "lottery" | "accounting"
type PrizeItem = { rank: string; name: string; quantity: string }

// 事前定義の景品セット（選択後に手動編集可能）
const PRIZE_SETS: { id: string; label: string; items: PrizeItem[] }[] = [
  {
    id: "newyear",
    label: "年末大抽選会セット",
    items: [
      { rank: "A賞", name: "クオカード 10,000円", quantity: "1" },
      { rank: "B賞", name: "商品券 5,000円", quantity: "3" },
      { rank: "C賞", name: "粗品セット", quantity: "50" },
    ],
  },
  {
    id: "spring",
    label: "春のキャンペーンセット",
    items: [
      { rank: "1等", name: "旅行券 30,000円", quantity: "1" },
      { rank: "2等", name: "ギフトカード 5,000円", quantity: "5" },
      { rank: "3等", name: "オリジナルグッズ", quantity: "100" },
    ],
  },
  {
    id: "gw",
    label: "ゴールデンウィークセット",
    items: [
      { rank: "特賞", name: "宿泊券 20,000円分", quantity: "2" },
      { rank: "A賞", name: "レストラン券 3,000円", quantity: "10" },
      { rank: "B賞", name: "映画チケット", quantity: "30" },
      { rank: "参加賞", name: "ノベルティ", quantity: "500" },
    ],
  },
  {
    id: "summer",
    label: "夏祭りセット",
    items: [
      { rank: "大賞", name: "ビール券 10,000円分", quantity: "1" },
      { rank: "A賞", name: "クオカード 3,000円", quantity: "5" },
      { rank: "B賞", name: "ドリンク券", quantity: "100" },
    ],
  },
  {
    id: "respect",
    label: "敬老の日セット",
    items: [
      { rank: "特別賞", name: "健康食品ギフト", quantity: "3" },
      { rank: "A賞", name: "商品券 2,000円", quantity: "20" },
      { rank: "参加賞", name: "お菓子詰め合わせ", quantity: "200" },
    ],
  },
  {
    id: "halloween",
    label: "ハロウィンセット",
    items: [
      { rank: "1等", name: "お菓子詰め合わせ 5,000円", quantity: "2" },
      { rank: "2等", name: "ハロウィングッズ", quantity: "20" },
      { rank: "参加賞", name: "キャンディ", quantity: "300" },
    ],
  },
  {
    id: "christmas",
    label: "クリスマスセット",
    items: [
      { rank: "特賞", name: "ギフトカード 10,000円", quantity: "1" },
      { rank: "A賞", name: "スイーツギフト", quantity: "10" },
      { rank: "B賞", name: "クリスマスグッズ", quantity: "50" },
    ],
  },
  {
    id: "newcustomer",
    label: "新規顧客獲得セット",
    items: [
      { rank: "A賞", name: "クオカード 3,000円", quantity: "5" },
      { rank: "B賞", name: "粗品A", quantity: "30" },
      { rank: "C賞", name: "粗品B", quantity: "100" },
    ],
  },
  {
    id: "repeat",
    label: "リピーター感謝セット",
    items: [
      { rank: "感謝賞", name: "商品券 1,000円", quantity: "20" },
      { rank: "特別賞", name: "限定グッズ", quantity: "50" },
    ],
  },
  {
    id: "simple",
    label: "シンプル1賞セット",
    items: [{ rank: "A賞", name: "クオカード 10,000円", quantity: "1" }],
  },
]
type Role = "sales" | "admin"

export default function JASEventManager() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("list")
  const [currentRole, setCurrentRole] = useState<Role>("sales")
  const [showNotifications, setShowNotifications] = useState(false)
  const { toast } = useToast()

  // 擬似DB: 従業員データ
  const employees: Employee[] = [
    { id: "E001", name: "田中太郎", email: "tanaka@example.com" },
    { id: "E002", name: "佐藤花子", email: "sato@example.com" },
    { id: "E003", name: "鈴木一郎", email: "suzuki@example.com" },
    { id: "E004", name: "高橋美咲", email: "takahashi@example.com" },
    { id: "E005", name: "伊藤健太", email: "ito@example.com" },
    { id: "E006", name: "渡辺さくら", email: "watanabe@example.com" },
  ]

  // 擬似DB: 法人とホールのデータ
  const companies: Company[] = [
    { id: "C001", name: "株式会社オメガ", salesPersonId: "E001", email: "omega@example.com" },
    { id: "C002", name: "株式会社メガ", salesPersonId: "E002", email: "mega@example.com" },
    { id: "C003", name: "株式会社サンライズ", salesPersonId: "E003", email: "sunrise@example.com" },
    { id: "C004", name: "株式会社スカイ", salesPersonId: "E004", email: "sky@example.com" },
    { id: "C005", name: "株式会社デルタ", salesPersonId: "E005", email: "delta@example.com" },
  ]

  const halls: Hall[] = [
    { id: "H001", name: "オメガホール東京", companyId: "C001", salesPersonId: "E001", email: "omega-tokyo@example.com" },
    { id: "H002", name: "オメガホール大阪", companyId: "C001", salesPersonId: "E001", email: "omega-osaka@example.com" },
    { id: "H003", name: "オメガホール名古屋", companyId: "C001", salesPersonId: "E006", email: "omega-nagoya@example.com" },
    { id: "H004", name: "メガホール大阪", companyId: "C002", salesPersonId: "E002", email: "mega-osaka@example.com" },
    { id: "H005", name: "メガホール東京", companyId: "C002", salesPersonId: "E002", email: "mega-tokyo@example.com" },
    { id: "H006", name: "サンライズホール名古屋", companyId: "C003", salesPersonId: "E003", email: "sunrise-nagoya@example.com" },
    { id: "H007", name: "サンライズホール福岡", companyId: "C003", salesPersonId: "E003" },
    { id: "H008", name: "スカイホール福岡", companyId: "C004", salesPersonId: "E004" },
    { id: "H009", name: "スカイホール広島", companyId: "C004", salesPersonId: "E004" },
    { id: "H010", name: "デルタ店舗", companyId: "C005", salesPersonId: "E005" },
  ]

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

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
      hallQuotes: [
        {
          hallName: "メガホール大阪",
          quoteItems: [
            { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 80000, included: true },
            { id: 2, name: "ポスター印刷", quantity: 100, unitPrice: 1800, included: true },
            { id: 3, name: "DM発送代行", quantity: 2000, unitPrice: 150, included: true },
            { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 30000, included: true },
          ],
        },
        {
          hallName: "メガホール東京",
          quoteItems: [
            { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 80000, included: true },
            { id: 2, name: "ポスター印刷", quantity: 100, unitPrice: 1800, included: true },
            { id: 3, name: "DM発送代行", quantity: 2000, unitPrice: 150, included: true },
            { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 30000, included: true },
          ],
        },
      ],
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
      hallQuotes: [
        {
          hallName: "サンライズホール名古屋",
          quoteItems: [
            { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 50000, included: true },
            { id: 2, name: "ポスター印刷", quantity: 40, unitPrice: 2200, included: true },
            { id: 3, name: "DM発送代行", quantity: 800, unitPrice: 150, included: true },
            { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 25000, included: true },
          ],
        },
        {
          hallName: "サンライズホール福岡",
          quoteItems: [
            { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 50000, included: true },
            { id: 2, name: "ポスター印刷", quantity: 40, unitPrice: 2200, included: true },
            { id: 3, name: "DM発送代行", quantity: 800, unitPrice: 150, included: true },
            { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 25000, included: true },
          ],
        },
      ],
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
      hallQuotes: [
        {
          hallName: "スカイホール福岡",
          quoteItems: [
            { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 60000, included: true },
            { id: 2, name: "ポスター印刷", quantity: 60, unitPrice: 2000, included: true },
            { id: 3, name: "DM発送代行", quantity: 1500, unitPrice: 150, included: true },
            { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 30000, included: true },
          ],
        },
        {
          hallName: "スカイホール広島",
          quoteItems: [
            { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 60000, included: true },
            { id: 2, name: "ポスター印刷", quantity: 60, unitPrice: 2000, included: true },
            { id: 3, name: "DM発送代行", quantity: 1500, unitPrice: 150, included: true },
            { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 30000, included: true },
          ],
        },
      ],
    },
  ])

  // Screen 1: Proposal State
  const [companyName, setCompanyName] = useState("")
  const [hallNames, setHallNames] = useState<string[]>([""])
  const [hallCompanyIds, setHallCompanyIds] = useState<string[]>([""])
  const [hallOpens, setHallOpens] = useState<boolean[]>([])
  const [companyOpens, setCompanyOpens] = useState<boolean[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [salesPersonId, setSalesPersonId] = useState("")
  const [eventStartDate, setEventStartDate] = useState("")
  const [eventEndDate, setEventEndDate] = useState("")
  const [area, setArea] = useState("")
  const [eventType, setEventType] = useState("")
  const [prizeInfo, setPrizeInfo] = useState<PrizeItem[]>([
    { rank: "A賞", name: "", quantity: "" }
  ])
  const [selectedPrizeSetId, setSelectedPrizeSetId] = useState<string>("")
  const [dmOrderCount, setDmOrderCount] = useState("")
  const [syncLoading, setSyncLoading] = useState(false)

  const [quoteGenerated, setQuoteGenerated] = useState(false)
  const [projectStatus, setProjectStatus] = useState<"draft" | "confirmed" | "in-progress" | "completed">("draft")
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [showWorkflowModal, setShowWorkflowModal] = useState(false)
  const [workflowHallName, setWorkflowHallName] = useState<string>("")
  const [workflowSlideIndex, setWorkflowSlideIndex] = useState(0)
  const [workflowFrom, setWorkflowFrom] = useState<string>("")
  const [workflowToType, setWorkflowToType] = useState<"company" | "hall">("hall")
  const [workflowCc, setWorkflowCc] = useState<string[]>([])
  const [workflowBcc, setWorkflowBcc] = useState<string[]>([])
  const [workflowMessageTemplate, setWorkflowMessageTemplate] = useState<string>("")
  const [workflowMessage, setWorkflowMessage] = useState<string>("")
  const [hallQuotes, setHallQuotes] = useState<{ [hallName: string]: QuoteItem[] }>({})
  const [hallPercentages, setHallPercentages] = useState<{ [hallName: string]: number }>({})
  const [proportionMode, setProportionMode] = useState<"hall" | "company">("hall")
  const [companyPercentages, setCompanyPercentages] = useState<{ [companyId: string]: number }>({})
  const [totalQuoteItems, setTotalQuoteItems] = useState<{ [itemId: number]: string }>({
    1: "50000", // ポスターデザイン
    3: "150000", // DM発送代行
    4: "30000", // 抽選システム利用料
  })
  const [posterPrintQuantity, setPosterPrintQuantity] = useState<string>("50")
  const [posterPrintUnitPrice, setPosterPrintUnitPrice] = useState<string>("2000")
  const [posterFirstDraftDate, setPosterFirstDraftDate] = useState("")
  const [dmFirstDraftDate, setDmFirstDraftDate] = useState("")
  const [dmImageUploaded, setDmImageUploaded] = useState(false)
  
  const defaultQuoteItems: QuoteItem[] = [
    { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 0, included: true },
    { id: 2, name: "ポスター印刷", quantity: 1, unitPrice: 0, included: true },
    { id: 3, name: "DM発送代行", quantity: 1, unitPrice: 0, included: true },
    { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 0, included: true },
  ]

  // Screen 2: Production State
  const [orderStatus, setOrderStatus] = useState<"drafting" | "proofing" | "finalized">("drafting")
  const [aiProofing, setAiProofing] = useState(false)
  const [proofingComplete, setProofingComplete] = useState(false)
  const [showDateError, setShowDateError] = useState(false)
  const [showFontError, setShowFontError] = useState(false)

  const [showPosterOrderModal, setShowPosterOrderModal] = useState(false)
  const [showFirstDraftModal, setShowFirstDraftModal] = useState(false)
  const [showFinalCheckModal, setShowFinalCheckModal] = useState(false)
  const [showDMOrderModal, setShowDMOrderModal] = useState(false)
  const [projectStatusProduction, setProjectStatusProduction] = useState<
    "進行中" | "初稿待ち" | "校正中" | "最終確認中" | "完了"
  >("進行中")
  const [posterDraftStatus, setPosterDraftStatus] = useState<"未作成" | "初稿完成" | "修正中" | "校了">("未作成")

  // Screen 3: Lottery State
  const [demoWinnerData, setDemoWinnerData] = useState([
    { id: 1, name: "山田太郎", address: "東京都渋谷区1-1-1", phone: "090-1234-5678", prize: "クオカード 10,000円" },
    { id: 2, name: "佐藤花子", address: "神奈川県横浜市2-2-2", phone: "080-2345-6789", prize: "クオカード 10,000円" },
    { id: 3, name: "鈴木一郎", address: "大阪府大阪市3-3-3", phone: "070-3456-7890", prize: "クオカード 10,000円" },
  ])

  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [showNotificationOrderModal, setShowNotificationOrderModal] = useState(false)
  const [notificationOrderGenerated, setNotificationOrderGenerated] = useState(false)
  const [notificationOrderSent, setNotificationOrderSent] = useState(false)
  const [showNotificationSendOrderModal, setShowNotificationSendOrderModal] = useState(false)
  const [showPrizeOrderModal, setShowPrizeOrderModal] = useState(false)
  const [showSendOrderModal, setShowSendOrderModal] = useState(false)
  // const [showLetterCheckModal, setShowLetterCheckModal] = useState(false) // This is already defined below
  const [editingWinnerData, setEditingWinnerData] = useState("")

  const [fileUploaded, setFileUploaded] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [showFixRequest, setShowFixRequest] = useState(false)

  const [winnerListValidated, setWinnerListValidated] = useState(false)
  const [showWinnerListError, setShowWinnerListError] = useState(false)
  const [prizeOrderGenerated, setPrizeOrderGenerated] = useState(false)
  const [prizeOrderSent, setPrizeOrderSent] = useState(false)
  const [prizeDeliveryDate, setPrizeDeliveryDate] = useState("")
  const [deliveryAlerts, setDeliveryAlerts] = useState<Array<{ project: string; days: number }>>([])
  const [deliveryFileUploaded, setDeliveryFileUploaded] = useState(false)
  const [showDeliveryData, setShowDeliveryData] = useState(false)

  // Demo delivery data
  const demoDeliveryData = [
    { id: 1, name: "山田太郎", address: "東京都渋谷区...", status: "配送中", tracking: "1234-5678-9012" },
    { id: 2, name: "佐藤花子", address: "神奈川県横浜市...", status: "配送完了", tracking: "9876-5432-1098" },
    { id: 3, name: "鈴木一郎", address: "大阪府大阪市...", status: "配送中", tracking: "4567-8901-2345" },
  ]
  const [quoCardLetterChecked, setQuoCardLetterChecked] = useState(false)
  const [showLetterCheckModal, setShowLetterCheckModal] = useState(false)
  const [letterCheckErrors, setLetterCheckErrors] = useState<string[]>([])

  // Screen 4: Accounting State
  const [carryoverProcessed, setCarryoverProcessed] = useState(false)
  const [cowboySyncing, setCowboySyncing] = useState(false)

  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showInvoiceVerifyModal, setShowInvoiceVerifyModal] = useState(false)
  const [showAgreementModal, setShowAgreementModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [invoiceCorrections, setInvoiceCorrections] = useState<any[]>([])
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [imageValidated, setImageValidated] = useState(false) // Added from updates
  const [showNotificationModal, setShowNotificationModal] = useState(false) // Added from updates
  const [showEmailModal, setShowEmailModal] = useState(false) // Added from updates

  const [selectedInvoice, setSelectedInvoice] = useState<{
    vendor: string
    amount: number
    status: "confirmed" | "pending" | "unconfirmed"
    invoiceDate: string
    items: { name: string; quantity: number; unitPrice: number }[]
  } | null>(null)
  const [invoiceStatuses, setInvoiceStatuses] = useState({
    vendorA: "confirmed",
    vendorB: "pending",
    vendorC: "pending",
  })

  const invoiceData = {
    vendorA: {
      vendor: "印刷会社A",
      amount: 150000,
      status: "confirmed" as const,
      invoiceDate: "2024-12-25",
      items: [
        { name: "ポスター印刷（A1サイズ）", quantity: 50, unitPrice: 2000 },
        { name: "チラシ印刷（A4サイズ）", quantity: 200, unitPrice: 250 },
      ],
    },
    vendorB: {
      vendor: "配送業者B",
      amount: 120000,
      status: "pending" as const,
      invoiceDate: "2024-12-28",
      items: [
        { name: "配送料（東京→大阪）", quantity: 1, unitPrice: 80000 },
        { name: "梱包資材費", quantity: 50, unitPrice: 800 },
      ],
    },
    vendorC: {
      vendor: "景品調達先C",
      amount: 180000,
      status: "pending" as const,
      invoiceDate: "2024-12-27",
      items: [
        { name: "A賞：高級家電", quantity: 5, unitPrice: 20000 },
        { name: "B賞：ギフトカード", quantity: 20, unitPrice: 4000 },
      ],
    },
  }

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project)
    setCompanyName(project.companyName)
    const projectHallNames = project.hallNames.length >= 1 ? project.hallNames : [""]
    setHallNames(projectHallNames)
    // 各ホールの法人IDを設定
    const projectHallCompanyIds = projectHallNames.map((hallName) => {
      if (!hallName) return ""
      const hall = halls.find((h) => h.name === hallName)
      return hall?.companyId || ""
    })
    setHallCompanyIds(projectHallCompanyIds)
    setHallOpens(Array(projectHallNames.length).fill(false))
    setCompanyOpens(Array(projectHallNames.length).fill(false))
    // 法人IDを設定（最初のホールの法人）
    const firstHall = halls.find((h) => h.name === projectHallNames[0])
    const company = firstHall ? companies.find((c) => c.id === firstHall.companyId) : companies.find((c) => c.name === project.companyName)
    setSelectedCompanyId(company?.id || "")
    setSalesPersonId(project.salesPersonId)
    setEventStartDate(project.eventStartDate)
    setEventEndDate(project.eventEndDate)
    setArea(project.area)
    setProjectStatus(
      project.status === "confirmed" ? "confirmed" : project.status === "in-progress" ? "in-progress" : "draft",
    )

    if (project.status !== "draft") {
      setQuoteGenerated(true)
      if (project.hallQuotes) {
        const quotesMap: { [hallName: string]: QuoteItem[] } = {}
        const percentagesMap: { [hallName: string]: number } = {}
        project.hallQuotes.forEach((hallQuote) => {
          quotesMap[hallQuote.hallName] = hallQuote.quoteItems
          if (hallQuote.percentage !== undefined) {
            percentagesMap[hallQuote.hallName] = hallQuote.percentage
          }
        })
        setHallQuotes(quotesMap)
        setHallPercentages(percentagesMap)
        // 各項目の全体金額を計算（各ホールの項目金額から逆算）
        const totalItemsMap: { [itemId: number]: string } = {}
        defaultQuoteItems.forEach((item) => {
          // ポスター印刷の場合は枚数と単価を復元
          if (item.id === 2) {
            // 最初のホールから枚数と単価を取得
            const firstHallQuote = project.hallQuotes?.[0]
            if (firstHallQuote) {
              const hallItem = firstHallQuote.quoteItems.find((qi) => qi.id === item.id)
              if (hallItem && hallItem.unitPrice > 0) {
                // 単価を復元
                setPosterPrintUnitPrice(hallItem.unitPrice.toString())
                // 全体の枚数を計算（各ホールの枚数を合計）
                let totalQuantity = 0
                project.hallQuotes?.forEach((hq) => {
                  const hItem = hq.quoteItems.find((qi) => qi.id === item.id)
                  if (hItem) {
                    totalQuantity += hItem.quantity
                  }
                })
                if (totalQuantity > 0) {
                  setPosterPrintQuantity(totalQuantity.toString())
                  // 全体金額を計算
                  const totalAmount = totalQuantity * hallItem.unitPrice
                  totalItemsMap[item.id] = totalAmount.toString()
                }
              }
            }
          } else {
            // その他の項目は金額から逆算
            let totalItemAmount = 0
            project.hallQuotes?.forEach((hq) => {
              const hallItem = hq.quoteItems.find((qi) => qi.id === item.id)
              if (hallItem && hq.percentage && hq.percentage > 0) {
                const itemTotal = hallItem.unitPrice * hallItem.quantity
                const itemTotalAmount = Math.floor((itemTotal * 100) / hq.percentage)
                // 最大値を採用（端数の影響を考慮）
                if (itemTotalAmount > totalItemAmount) {
                  totalItemAmount = itemTotalAmount
                }
              }
            })
            if (totalItemAmount > 0) {
              totalItemsMap[item.id] = totalItemAmount.toString()
            }
          }
        })
        setTotalQuoteItems(totalItemsMap)
      } else {
        setTotalQuoteItems({})
      }
    } else {
      setQuoteGenerated(false)
      setHallQuotes({})
      setHallPercentages({})
      setTotalQuoteItems({
        1: "50000", // ポスターデザイン
        3: "150000", // DM発送代行
        4: "30000", // 抽選システム利用料
      })
      setPosterPrintQuantity("50")
      setPosterPrintUnitPrice("2000")
    }

    setCurrentScreen("proposal")
  }

  const handleNewProject = () => {
    setSelectedProject(null)
    setCompanyName("")
    setHallNames([""])
    setHallCompanyIds([""])
    setHallOpens([])
    setCompanyOpens([])
    setSelectedCompanyId("")
    setSalesPersonId("")
    setEventStartDate("")
    setEventEndDate("")
    setArea("")
    setQuoteGenerated(false)
    setProjectStatus("draft")
    setHallQuotes({})
    setHallPercentages({})
    setTotalQuoteItems({
      1: "50000", // ポスターデザイン
      3: "150000", // DM発送代行
      4: "30000", // 抽選システム利用料
    })
    setPosterPrintQuantity("50")
    setPosterPrintUnitPrice("2000")
    setCurrentScreen("proposal")
  }

  const handleAIAutoPropose = () => {
    setCompanyName("株式会社オメガ")
    setSelectedCompanyId("C001")
    setHallNames(["オメガホール東京", "オメガホール大阪"])
    setHallCompanyIds(["C001", "C001"])
    setHallOpens([false, false])
    setCompanyOpens([false, false])
    setSalesPersonId("E001")
    setEventStartDate("2024-12-25")
    setEventEndDate("2024-12-25")
    setArea("東京都渋谷区")
    toast({
      title: "✨ AI自動提案完了",
      description: "過去の類似案件から最適な提案を生成しました",
    })
  }

  const handleGenerateQuote = () => {
    const validHallNames = hallNames.filter((name) => name.trim() !== "")
    if (validHallNames.length < 1 || !eventStartDate || !eventEndDate) {
      toast({
        title: "⚠️ 入力エラー",
        description: "基本情報を入力してください",
        variant: "destructive",
      })
      return
    }
    // 各ホールに法人が紐づいているかチェック
    const missingCompanyHalls: string[] = []
    validHallNames.forEach((hallName) => {
      const index = hallNames.indexOf(hallName)
      if (!hallCompanyIds[index] || hallCompanyIds[index].trim() === "") {
        missingCompanyHalls.push(hallName)
      }
    })
    
    if (missingCompanyHalls.length > 0) {
      toast({
        title: "⚠️ 入力エラー",
        description: `以下のホールに法人を選択してください: ${missingCompanyHalls.join(", ")}`,
        variant: "destructive",
      })
      return
    }
    
    // 各項目の金額を計算
    const posterPrintQty = parseFloat(posterPrintQuantity) || 0
    const posterPrintPrice = parseFloat(posterPrintUnitPrice) || 0
    const posterPrintAmount = posterPrintQty * posterPrintPrice
    const totalAmount = Object.values(totalQuoteItems).reduce((sum, amount) => {
      return sum + (parseFloat(amount) || 0)
    }, 0) + posterPrintAmount
    
    if (totalAmount <= 0) {
      toast({
        title: "⚠️ 入力エラー",
        description: "各項目の金額を入力してください",
        variant: "destructive",
      })
      return
    }
    
    const totalPercentage = Object.values(hallPercentages).reduce((sum, p) => sum + p, 0)
    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast({
        title: "⚠️ 入力エラー",
        description: "各ホールの割合の合計が100%になるように設定してください",
        variant: "destructive",
      })
      return
    }
    
    // 端数チェック（各項目ごとに）
    // 警告は表示するが、続行は可能
    
    // 各ホールごとに見積もりを生成
    const newHallQuotes: { [hallName: string]: QuoteItem[] } = {}
    validHallNames.forEach((hallName) => {
      const percentage = hallPercentages[hallName] || 0
      // 各項目の全体金額から、割合で各ホールの金額を計算
      const hallQuoteItems: QuoteItem[] = defaultQuoteItems.map((item) => {
        if (item.id === 2) {
          // ポスター印刷の場合は、全体の枚数と単価から各ホールの金額を計算
          const totalPosterAmount = posterPrintQty * posterPrintPrice
          const hallPosterAmount = Math.floor((totalPosterAmount * percentage) / 100)
          // 各ホールの枚数 = 各ホールの金額 / 単価（端数切り捨て）
          const hallPosterQty = posterPrintPrice > 0 ? Math.floor(hallPosterAmount / posterPrintPrice) : 0
          return {
            ...item,
            unitPrice: posterPrintPrice,
            quantity: hallPosterQty,
          }
        } else {
          // その他の項目は金額ベースで分配
          const totalItemAmount = parseFloat(totalQuoteItems[item.id] || "0") || 0
          const hallItemAmount = Math.floor((totalItemAmount * percentage) / 100)
          return {
            ...item,
            unitPrice: hallItemAmount,
            quantity: 1,
          }
        }
      })
      newHallQuotes[hallName] = hallQuoteItems
    })
    setHallQuotes(newHallQuotes)
    setQuoteGenerated(true)

    if (!selectedProject) {
      // 各項目の合計金額を計算（既に計算済みのtotalAmountを使用）
      const calculatedTotalAmount = totalAmount
      
      const hallQuotesArray: HallQuote[] = validHallNames.map((hallName) => {
        const percentage = hallPercentages[hallName] || 0
        const calculatedAmount = Math.floor((calculatedTotalAmount * percentage) / 100)
        return {
          hallName,
          quoteItems: newHallQuotes[hallName],
          percentage,
          calculatedAmount,
        }
      })
      const newProject: Project = {
        id: `P${String(projects.length + 1).padStart(3, "0")}`,
        companyName,
        hallNames: validHallNames,
        eventStartDate,
        eventEndDate,
        area,
        status: "quote-created",
        budget: "",
        createdAt: new Date().toISOString().split("T")[0],
        salesPersonId,
        hallQuotes: hallQuotesArray,
      }
      setProjects([...projects, newProject])
      setSelectedProject(newProject)
    } else {
      // Update existing selected project with new quote data
      // 各項目の合計金額を計算（既に計算済みのtotalAmountを使用）
      const calculatedTotalAmount = totalAmount
      
      const hallQuotesArray: HallQuote[] = validHallNames.map((hallName) => {
        const percentage = hallPercentages[hallName] || 0
        const calculatedAmount = Math.floor((calculatedTotalAmount * percentage) / 100)
        return {
          hallName,
          quoteItems: newHallQuotes[hallName],
          percentage,
          calculatedAmount,
        }
      })
      const updatedProjects = projects.map((p) =>
        p.id === selectedProject.id
          ? { ...p, companyName, hallNames: validHallNames, eventStartDate, eventEndDate, area, salesPersonId, hallQuotes: hallQuotesArray }
          : p,
      )
      setProjects(updatedProjects)
      setSelectedProject({
        ...selectedProject,
        companyName,
        hallNames: validHallNames,
        eventStartDate,
        eventEndDate,
        area,
        salesPersonId,
        hallQuotes: hallQuotesArray,
      })
    }

    toast({
      title: "✅ 見積もり作成完了",
      description: "各ホールごとに見積内容が生成されました",
    })
  }

  const handleConfirmProject = () => {
    setProjectStatus("confirmed")

    if (selectedProject) {
      setProjects(projects.map((p) => (p.id === selectedProject.id ? { ...p, status: "confirmed" } : p)))
      setSelectedProject({ ...selectedProject, status: "confirmed" })
    }

    toast({
      title: "✅ 案件確定",
      description: "案件が確定されました",
    })
  }

  const toggleQuoteItem = (hallName: string, id: number) => {
    setHallQuotes((quotes) => {
      const newQuotes = { ...quotes }
      if (newQuotes[hallName]) {
        newQuotes[hallName] = newQuotes[hallName].map((item) =>
          item.id === id ? { ...item, included: !item.included } : item
        )
      }
      return newQuotes
    })
  }

  const calculateQuoteTotal = (hallName: string) => {
    const quoteItems = hallQuotes[hallName] || []
    return quoteItems.filter((item) => item.included).reduce((sum, item) => {
      // ポスター印刷の場合は quantity × unitPrice、その他は unitPrice
      if (item.id === 2) {
        return sum + item.quantity * item.unitPrice
      }
      return sum + item.unitPrice
    }, 0)
  }

  const calculateAllQuotesTotal = () => {
    return Object.keys(hallQuotes).reduce((total, hallName) => total + calculateQuoteTotal(hallName), 0)
  }

  const getStatusLabel = (status: Project["status"]) => {
    const labels = {
      draft: "下書き",
      "quote-created": "見積もり作成済み",
      confirmed: "確定",
      "in-progress": "進行中",
      completed: "完了",
    }
    return labels[status]
  }

  const getStatusVariant = (status: Project["status"]) => {
    const variants: Record<Project["status"], "default" | "secondary" | "outline" | "destructive"> = {
      draft: "outline",
      "quote-created": "secondary",
      confirmed: "default",
      "in-progress": "default",
      completed: "default",
    }
    return variants[status]
  }

  const handlePSPSync = () => {
    setSyncLoading(true)
    setTimeout(() => {
      setSyncLoading(false)
      toast({
        title: "✅ PSPクラウド連携完了",
        description: "宛名抽出条件が正常に同期されました",
      })
    }, 2000)
  }

  const handleGenerateOrderEmail = () => {
    setShowEmailModal(true)
  }

  const handleAIProofing = () => {
    setAiProofing(true)
    setShowDateError(false)
    setShowFontError(false)

    setTimeout(() => {
      setShowDateError(true)
    }, 1500)

    setTimeout(() => {
      setShowFontError(true)
      setAiProofing(false)
      setProofingComplete(true)
    }, 2500)
  }

  const handleValidateWinnerList = () => {
    setFileUploaded(true)
    setEditingWinnerData(JSON.stringify(demoWinnerData, null, 2))
    setShowWinnerModal(true)
  }

  const confirmWinnerList = () => {
    setShowWinnerModal(false)
    setShowValidationErrors(true)
    setWinnerListValidated(false)
    toast({
      title: "AI検証を開始しました",
      description: "データの検証中です...",
    })

    setTimeout(() => {
      setShowValidationModal(true)
    }, 1000)
  }

  const confirmValidation = (isValid: boolean) => {
    setShowValidationModal(false)
    if (isValid) {
      setWinnerListValidated(true)
      setShowValidationErrors(false)
      toast({
        title: "検証完了",
        description: "当選者リストに問題はありませんでした",
      })
    } else {
      toast({
        title: "再アップロード依頼を送信しました",
        description: "ホール担当者にエラー内容とデータの再アップロード依頼メールを送信しました",
      })
    }
  }

  const handleFileUpload = () => {
    setFileUploaded(true)
    setTimeout(() => {
      setShowValidationErrors(true)
    }, 500)
  }

  const handleGenerateFixRequest = () => {
    setShowFixRequest(true)
  }

  const handleGenerateVendorData = () => {
    toast({
      title: "🔐 業者用データ生成完了",
      description: "パスワードは別メールで自動送信されました",
    })
  }

  const handleAutoCarryover = () => {
    setCarryoverProcessed(true)
    setTimeout(() => {
      alert(
        "未手配案件を翌月に自動繰越しました\n- シグマパーク年末イベント: 2025年1月分へ繰越\n- デルタ店舗新春キャンペーン: 2025年1月分へ繰越",
      )
    }, 1500)
  }

  const handleCowboySync = () => {
    setCowboySyncing(true)
    setTimeout(() => {
      setCowboySyncing(false)
      toast({
        title: "💰 Cowboy連携完了",
        description: "会計データが正常に連携され、支払依頼が完了しました",
      })
    }, 2000)
  }

  // Function to handle viewing invoice details
  const handleViewInvoice = (vendorKey: "vendorA" | "vendorB" | "vendorC") => {
    setSelectedInvoice(invoiceData[vendorKey])
    setShowInvoiceModal(true)
  }

  // Function to send agreement email
  const handleSendAgreementEmail = () => {
    if (selectedInvoice) {
      alert(`${selectedInvoice.vendor}に合意確認メールを送信しました`)
      setShowInvoiceModal(false)
    }
  }

  // Function to confirm invoice
  const handleConfirmInvoice = () => {
    if (selectedInvoice) {
      const vendorKey =
        selectedInvoice.vendor === "印刷会社A"
          ? "vendorA"
          : selectedInvoice.vendor === "配送業者B"
            ? "vendorB"
            : "vendorC"
      setInvoiceStatuses((prev) => ({ ...prev, [vendorKey]: "confirmed" }))
      alert(`${selectedInvoice.vendor}の請求書を確認済みにしました`)
      setShowInvoiceModal(false)
    }
  }

  // Function to request correction
  const handleRequestCorrection = () => {
    if (selectedInvoice) {
      alert(`${selectedInvoice.vendor}に修正依頼を送信しました`)
      setShowInvoiceModal(false)
    }
  }

  // Function to send reminders to vendors
  const handleSendReminders = () => {
    alert("未到着の業者2社（配送業者B、景品調達先C）にリマインダーを送信しました")
  }

  // Function to extract sales data
  const handleExtractSalesData = () => {
    alert(
      "売上計上データを抽出しました\n\n抽出期間: 2024年12月分\n対象案件数: 3件\n総計上額: ¥450,000\n\nデータをCSV形式でダウンロードします",
    )
  }

  // Enhanced winner list upload with AI validation
  const handleGenerateNotificationOrder = () => {
    setShowNotificationOrderModal(true)
  }

  const confirmNotificationOrderGeneration = () => {
    setShowNotificationOrderModal(false)
    setNotificationOrderGenerated(true)
    toast({
      title: "当選者通知発注データ生成完了",
      description: "winner_notification_20241225.xlsx が生成されました",
    })
  }

  const handleGeneratePrizeOrder = () => {
    setShowPrizeOrderModal(true)
  }

  const confirmPrizeOrderGeneration = () => {
    setShowPrizeOrderModal(false)
    setPrizeOrderGenerated(true)
    toast({
      title: "発注データ生成完了",
      description: "prize_order_20241225.xlsx が生成されました",
    })
  }

  const handleSendNotificationOrder = () => {
    setShowNotificationSendOrderModal(true)
  }

  const confirmSendNotificationOrder = () => {
    setShowNotificationSendOrderModal(false)
    setNotificationOrderSent(true)
    toast({
      title: "当選者通知依頼メール送信完了",
      description: "業者へ当選者通知の依頼メールを送信しました（パスワードメールも自動送信）",
    })
  }

  const handleSendPrizeOrder = () => {
    setShowSendOrderModal(true)
  }

  const confirmSendPrizeOrder = () => {
    setShowSendOrderModal(false)
    setPrizeOrderSent(true)
    toast({
      title: "発注メール送信完了",
      description: "パスワードメールも自動送信されました",
    })
  }

  // Added prize order data generation card
  // const handleGeneratePrizeOrder = () => {
  //   setTimeout(() => {
  //     setPrizeOrderGenerated(true)
  //     toast({
  //       title: "景品発注データ生成完了",
  //       description: "当選者リストから景品用発注フォーマットに自動変換しました",
  //     })
  //   }, 2000)
  // }

  // Added prize order sending card
  // const handleSendPrizeOrder = () => {
  //   setTimeout(() => {
  //     setPrizeOrderSent(true)
  //     toast({
  //       title: "発注メール送信完了",
  //       description: "景品発注書と暗号化データを業者に送信し、パスワードメールも自動送信しました",
  //     })
  //   }, 1500)
  // }

  // Added Quo Card letter verification card
  const handleCheckQuoCardLetter = () => {
    setShowLetterCheckModal(true)
  }

  const confirmLetterCheck = () => {
    setShowLetterCheckModal(false)
    setQuoCardLetterChecked(true)
    toast({
      title: "書簡チェック完了",
      description: "問題は検出されませんでした",
    })
  }

  const steps = [
    { id: "proposal", label: "案件・見積・設定" },
    { id: "production", label: "制作進行・AI校正" },
    { id: "lottery", label: "抽選・景品・配送" },
  ]

  // const handleFixLetterAndRecheck = () => {
  //   setLetterCheckErrors([])
  //   setTimeout(() => {
  //     setQuoCardLetterChecked(true)
  //     setShowLetterCheckModal(false)
  //     toast({
  //       title: "✅ 書簡内容確認完了",
  //       description: "すべての項目が正しく修正されました",
  //     })
  //   }, 1500)
  // }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Left Sidebar - Only show in list view */}
          {currentScreen === "list" && (
            <CommonSidebar
              activeScreen={currentScreen}
              onNavigate={(screen) => setCurrentScreen(screen as Screen)}
            />
          )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {currentRole === "sales" ? "営業・インサイト" : "事務管理"}
              </Badge>
              {selectedProject && (
                <Badge variant="secondary" className="text-sm">
                  案件ID: {selectedProject.id}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="role-switch" className="text-sm">
                  ロール切り替え
                </Label>
                <Switch
                  id="role-switch"
                  checked={currentRole === "admin"}
                  onCheckedChange={(checked) => setCurrentRole(checked ? "admin" : "sales")}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Stepper */}
        {currentScreen !== "list" && (
          <ProjectStepper
            steps={steps}
            currentStep={currentScreen}
            onStepClick={(id) => setCurrentScreen(id as Screen)}
          />
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {currentScreen === "list" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">案件一覧</h2>
                  <p className="text-muted-foreground mt-2">全ての案件を管理・確認できます</p>
                </div>
                <Button onClick={handleNewProject} className="gap-2">
                  <FileText className="w-4 h-4" />
                  新規案件作成
                </Button>
              </div>

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
                            <Badge variant={getStatusVariant(project.status)}>{getStatusLabel(project.status)}</Badge>
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
                          className="bg-transparent"
                          onClick={() => handleSelectProject(project)}
                        >
                          <Eye className="w-4 h-4" />
                          詳細
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Screen 1: Proposal */}
          {currentScreen === "proposal" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground">案件・見積・設定</h2>
                <p className="text-muted-foreground mt-2">
                  {selectedProject ? "案件の詳細を確認・編集します" : "新規案件の提案と見積もりを作成します"}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        基本情報入力
                      </CardTitle>
                      <CardDescription>イベントの基本情報を入力してください</CardDescription>
                    </div>
                    <Button onClick={handleAIAutoPropose} variant="outline" size="sm" className="bg-transparent">
                      <Sparkles className="w-4 h-4" />
                      AI自動入力
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>ホール名</Label>
                    </div>
                    {hallNames.map((hallName, index) => {
                      const hallCompanyId = hallCompanyIds[index] || ""
                      const hallCompany = companies.find((c) => c.id === hallCompanyId)
                      return (
                        <div key={index} className="grid grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`company-name-${index}`}>法人名 {index + 1}</Label>
                            <Popover
                              open={companyOpens[index] || false}
                              onOpenChange={(open) => {
                                const newOpens = [...companyOpens]
                                newOpens[index] = open
                                setCompanyOpens(newOpens)
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={companyOpens[index] || false}
                                  className="w-full justify-between"
                                >
                                  {hallCompany?.name || "法人名を検索..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="法人名を検索..." />
                                  <CommandList>
                                    <CommandEmpty>法人が見つかりませんでした。</CommandEmpty>
                                    <CommandGroup>
                                      {companies.map((company) => (
                                        <CommandItem
                                          key={company.id}
                                          value={company.name}
                                          onSelect={() => {
                                            const newHallCompanyIds = [...hallCompanyIds]
                                            newHallCompanyIds[index] = company.id
                                            setHallCompanyIds(newHallCompanyIds)
                                            const newOpens = [...companyOpens]
                                            newOpens[index] = false
                                            setCompanyOpens(newOpens)
                                            // ホールをリセット（法人が変わった場合）
                                            if (hallName) {
                                              const selectedHall = halls.find((h) => h.name === hallName)
                                              if (!selectedHall || selectedHall.companyId !== company.id) {
                                                const newHallNames = [...hallNames]
                                                newHallNames[index] = ""
                                                setHallNames(newHallNames)
                                              }
                                            }
                                            // 最初のホールの場合、法人名と営業担当を設定
                                            if (index === 0) {
                                              setCompanyName(company.name)
                                              setSelectedCompanyId(company.id)
                                              setSalesPersonId(company.salesPersonId)
                                            }
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              hallCompanyId === company.id ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {company.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label>法人の営業担当 {index + 1}</Label>
                            <Input
                              readOnly
                              value={
                                hallCompanyId
                                  ? employees.find((e) => e.id === hallCompany?.salesPersonId)?.name || "未設定"
                                  : "法人を選択してください"
                              }
                              className="bg-muted"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`hall-name-${index}`}>ホール名 {index + 1}</Label>
                            <Popover
                              open={hallOpens[index] || false}
                              onOpenChange={(open) => {
                                const newOpens = [...hallOpens]
                                newOpens[index] = open
                                setHallOpens(newOpens)
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={hallOpens[index] || false}
                                  className="w-full justify-between"
                                >
                                  {hallName || "ホール名を検索..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="ホール名または法人名を検索..." />
                                  <CommandList>
                                    <CommandEmpty>ホールが見つかりませんでした。</CommandEmpty>
                                    <CommandGroup>
                                      {halls.map((hall) => {
                                        const company = companies.find((c) => c.id === hall.companyId)
                                        const searchValue = `${hall.name} ${company?.name || ""}`
                                        return (
                                          <CommandItem
                                            key={hall.id}
                                            value={searchValue}
                                            onSelect={() => {
                                              const newHallNames = [...hallNames]
                                              newHallNames[index] = hall.name
                                              setHallNames(newHallNames)
                                              const newHallCompanyIds = [...hallCompanyIds]
                                              newHallCompanyIds[index] = hall.companyId
                                              setHallCompanyIds(newHallCompanyIds)
                                              const newOpens = [...hallOpens]
                                              newOpens[index] = false
                                              setHallOpens(newOpens)
                                              // 最初のホールの場合、法人名と営業担当を設定
                                              if (index === 0) {
                                                if (company) {
                                                  setCompanyName(company.name)
                                                  setSelectedCompanyId(company.id)
                                                }
                                                setSalesPersonId(hall.salesPersonId)
                                              }
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                hallName === hall.name ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            {hall.name} {company && `(${company.name})`}
                                          </CommandItem>
                                        )
                                      })}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label>ホールの営業担当 {index + 1}</Label>
                            <Input
                              readOnly
                              value={
                                hallName
                                  ? employees.find((e) => e.id === halls.find((h) => h.name === hallName)?.salesPersonId)?.name || "未設定"
                                  : "ホールを選択してください"
                              }
                              className="bg-muted"
                            />
                          </div>
                        </div>
                      )
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setHallNames([...hallNames, ""])
                        setHallCompanyIds([...hallCompanyIds, ""])
                        setHallOpens([...hallOpens, false])
                        setCompanyOpens([...companyOpens, false])
                      }}
                      className="w-full"
                    >
                      + ホールを追加
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-start-date">イベント開始日</Label>
                      <Input
                        id="event-start-date"
                        type="date"
                        value={eventStartDate}
                        onChange={(e) => setEventStartDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-end-date">イベント終了日</Label>
                      <Input
                        id="event-end-date"
                        type="date"
                        value={eventEndDate}
                        onChange={(e) => setEventEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sales-person">本案件の営業担当</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {salesPersonId
                            ? employees.find((e) => e.id === salesPersonId)?.name || "営業担当を選択..."
                            : "営業担当を選択..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="営業担当を検索..." />
                          <CommandList>
                            <CommandEmpty>営業担当が見つかりませんでした。</CommandEmpty>
                            <CommandGroup>
                              {employees.map((employee) => (
                                <CommandItem
                                  key={employee.id}
                                  value={employee.name}
                                  onSelect={() => {
                                    setSalesPersonId(employee.id)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      salesPersonId === employee.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {employee.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-type">商材名</Label>
                    <Input 
                      id="event-type" 
                      placeholder="例: 年末大抽選会" 
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>景品セットを選択</Label>
                      <Select
                        value={selectedPrizeSetId}
                        onValueChange={(value) => {
                          const set = PRIZE_SETS.find((s) => s.id === value)
                          if (set) {
                            setSelectedPrizeSetId(value)
                            setPrizeInfo(set.items.map((p) => ({ ...p })))
                          }
                        }}
                      >
                        <SelectTrigger className="w-full max-w-xs">
                          <SelectValue placeholder="景品セットを選ぶ（選択後に編集可能）" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIZE_SETS.map((set) => (
                            <SelectItem key={set.id} value={set.id}>
                              {set.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>景品情報</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPrizeInfo([...prizeInfo, { rank: "", name: "", quantity: "" }])}
                      >
                        + 景品を追加
                      </Button>
                    </div>
                    
                    {prizeInfo.map((prize, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="賞 (例: A賞)"
                          value={prize.rank}
                          onChange={(e) => {
                            const newInfo = [...prizeInfo]
                            newInfo[index].rank = e.target.value
                            setPrizeInfo(newInfo)
                          }}
                        />
                        <Input
                          placeholder="景品名"
                          value={prize.name}
                          onChange={(e) => {
                            const newInfo = [...prizeInfo]
                            newInfo[index].name = e.target.value
                            setPrizeInfo(newInfo)
                          }}
                        />
                         <Input
                          type="number"
                          placeholder="数"
                          value={prize.quantity}
                          onChange={(e) => {
                            const newInfo = [...prizeInfo]
                            newInfo[index].quantity = e.target.value
                            setPrizeInfo(newInfo)
                          }}
                        />
                      </div>
                    ))}
                    {(prizeInfo.length === 0 || !prizeInfo[0].name) && (
                       <p className="text-sm text-destructive font-medium flex items-center gap-1">
                         <AlertCircle className="w-4 h-4" />
                         景品の情報がないと見積もりが出せません
                       </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {(() => {
                const validHallNames = hallNames.filter((name) => name.trim() !== "")
                const basicInfoComplete = validHallNames.length >= 2 && eventStartDate && eventEndDate && prizeInfo.length > 0 && prizeInfo[0].name !== ""
                
                if (!basicInfoComplete) {
                  return (
                    <Card className="border-2 border-muted">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          見積もり設定
                        </CardTitle>
                        <CardDescription>基本情報の入力が完了すると、見積もり設定が表示されます</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                          <p className="text-muted-foreground">必要な情報: ホール2件以上、イベント開始日、イベント終了日、景品情報</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }

                return (
                  <Card className="border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        見積もり設定
                      </CardTitle>
                      <CardDescription>各項目の金額と各ホールの割合を設定してください</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Label>項目ごとの金額（円）</Label>
                        <p className="text-xs text-muted-foreground">各項目の全体金額を入力してください。各ホールの金額は割合で自動計算されます。</p>
                        {defaultQuoteItems.map((item) => {
                          // ポスター印刷は枚数と単価で計算
                          if (item.id === 2) {
                            const quantity = parseFloat(posterPrintQuantity) || 0
                            const unitPrice = parseFloat(posterPrintUnitPrice) || 0
                            const calculatedAmount = quantity * unitPrice
                            return (
                              <div key={item.id} className="space-y-2">
                                <Label htmlFor={`poster-print-quantity`} className="flex-1">
                                  {item.name}
                                </Label>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <Label htmlFor={`poster-print-quantity`} className="text-xs text-muted-foreground">枚数</Label>
                                    <Input
                                      id={`poster-print-quantity`}
                                      type="number"
                                      min="0"
                                      placeholder="0"
                                      value={posterPrintQuantity}
                                      onChange={(e) => {
                                        const value = e.target.value
                                        // 0から始まる数字を防ぐ（ただし、0単体は許可）
                                        if (value && value.length > 1 && value.startsWith("0") && value[1] !== ".") {
                                          return
                                        }
                                        setPosterPrintQuantity(value)
                                        // 金額を自動計算してtotalQuoteItemsに設定
                                        const qty = parseFloat(value) || 0
                                        const price = parseFloat(posterPrintUnitPrice) || 0
                                        const amount = qty * price
                                        setTotalQuoteItems((prev) => ({
                                          ...prev,
                                          [item.id]: amount > 0 ? amount.toString() : "",
                                        }))
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Label htmlFor={`poster-print-unit-price`} className="text-xs text-muted-foreground">単価（円）</Label>
                                    <Input
                                      id={`poster-print-unit-price`}
                                      type="number"
                                      step="100"
                                      min="0"
                                      placeholder="0"
                                      value={posterPrintUnitPrice}
                                      onChange={(e) => {
                                        const value = e.target.value
                                        // 0から始まる数字を防ぐ（ただし、0単体は許可）
                                        if (value && value.length > 1 && value.startsWith("0") && value[1] !== ".") {
                                          return
                                        }
                                        setPosterPrintUnitPrice(value)
                                        // 金額を自動計算してtotalQuoteItemsに設定
                                        const qty = parseFloat(posterPrintQuantity) || 0
                                        const price = parseFloat(value) || 0
                                        const amount = qty * price
                                        setTotalQuoteItems((prev) => ({
                                          ...prev,
                                          [item.id]: amount > 0 ? amount.toString() : "",
                                        }))
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 pt-6">
                                    <p className="text-sm font-medium">
                                      金額: ¥{calculatedAmount.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          if (item.id === 3) {
                            return (
                              <div key={item.id} className="space-y-2">
                                <Label>{item.name}</Label>
                                <div className="flex items-center gap-2">
                                  <div className="w-1/3">
                                    <Label className="text-xs text-muted-foreground">発注枚数</Label>
                                    <Input
                                      type="number"
                                      value={dmOrderCount}
                                      onChange={(e) => setDmOrderCount(e.target.value)}
                                      placeholder="枚数"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Label className="text-xs text-muted-foreground">金額</Label>
                                    <Input
                                      id={`total-item-${item.id}`}
                                      type="number"
                                      placeholder="0"
                                      value={totalQuoteItems[item.id] || ""}
                                      onChange={(e) => {
                                        const value = e.target.value
                                        setTotalQuoteItems((prev) => ({
                                          ...prev,
                                          [item.id]: value,
                                        }))
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          }

                          // その他の項目は固定費として金額を直接入力
                          return (
                            <div key={item.id} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`total-item-${item.id}`} className="flex-1">
                                  {item.name}
                                </Label>
                                <Input
                                  id={`total-item-${item.id}`}
                                  type="number"
                                  step="1000"
                                  min="0"
                                  placeholder="0"
                                  value={totalQuoteItems[item.id] || ""}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    // 0から始まる数字を防ぐ（ただし、0単体は許可）
                                    if (value && value.length > 1 && value.startsWith("0") && value[1] !== ".") {
                                      return
                                    }
                                    setTotalQuoteItems((prev) => ({
                                      ...prev,
                                      [item.id]: value,
                                    }))
                                  }}
                                  className="w-32"
                                />
                                <span className="text-sm text-muted-foreground">円</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Label>各項目の割合（%）</Label>
                            <div className="flex items-center space-x-1 bg-muted/50 p-1 rounded-lg">
                              <Button
                                variant={proportionMode === "hall" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setProportionMode("hall")}
                                className="h-7 text-xs"
                              >
                                ホールごと
                              </Button>
                              <Button
                                variant={proportionMode === "company" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => {
                                  setProportionMode("company")
                                  // Initialize company percentages based on halls if not set
                                  const uniqueCompanyIds = Array.from(new Set(hallCompanyIds.filter((id, idx) => hallNames[idx] && hallNames[idx].trim() !== "" && id)))
                                  if (Object.keys(companyPercentages).length === 0 && uniqueCompanyIds.length > 0) {
                                    const newCompanyPercentages: { [key: string]: number } = {}
                                    const equalPct = Math.floor(100 / uniqueCompanyIds.length)
                                    const remainder = 100 - (equalPct * uniqueCompanyIds.length)
                                    uniqueCompanyIds.forEach((id, idx) => {
                                      newCompanyPercentages[id] = equalPct + (idx < remainder ? 1 : 0)
                                    })
                                    setCompanyPercentages(newCompanyPercentages)
                                    
                                    // Update hall percentages accordingly
                                    const newHallPercentages: { [key: string]: number } = {}
                                    uniqueCompanyIds.forEach(id => {
                                      const companyPct = newCompanyPercentages[id]
                                      const hallsInCompany = hallNames.filter((_, hIdx) => hallCompanyIds[hIdx] === id && hallNames[hIdx].trim() !== "")
                                      if (hallsInCompany.length > 0) {
                                        const hallPct = companyPct / hallsInCompany.length
                                        hallsInCompany.forEach(hName => {
                                          newHallPercentages[hName] = hallPct
                                        })
                                      }
                                    })
                                    setHallPercentages(newHallPercentages)
                                  }
                                }}
                                className="h-7 text-xs"
                              >
                                法人ごと
                              </Button>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (proportionMode === "hall") {
                                const validHallNames = hallNames.filter((name) => name.trim() !== "")
                                if (validHallNames.length > 0) {
                                  const equalPercentage = Math.floor(100 / validHallNames.length)
                                  const remainder = 100 - (equalPercentage * validHallNames.length)
                                  const newPercentages: { [hallName: string]: number } = {}
                                  validHallNames.forEach((hn, idx) => {
                                    // 端数分を上から1%ずつ振る
                                    newPercentages[hn] = equalPercentage + (idx < remainder ? 1 : 0)
                                  })
                                  setHallPercentages(newPercentages)
                                }
                              } else {
                                const uniqueCompanyIds = Array.from(new Set(hallCompanyIds.filter((id, idx) => hallNames[idx] && hallNames[idx].trim() !== "" && id)))
                                if (uniqueCompanyIds.length > 0) {
                                  const equalPercentage = Math.floor(100 / uniqueCompanyIds.length)
                                  const remainder = 100 - (equalPercentage * uniqueCompanyIds.length)
                                  const newCompanyPercentages: { [key: string]: number } = {}
                                  uniqueCompanyIds.forEach((id, idx) => {
                                    newCompanyPercentages[id] = equalPercentage + (idx < remainder ? 1 : 0)
                                  })
                                  setCompanyPercentages(newCompanyPercentages)

                                  // Update hall percentages
                                  const newHallPercentages: { [key: string]: number } = {}
                                  uniqueCompanyIds.forEach(id => {
                                    const companyPct = newCompanyPercentages[id]
                                    const hallsInCompany = hallNames.filter((_, hIdx) => hallCompanyIds[hIdx] === id && hallNames[hIdx].trim() !== "")
                                    if (hallsInCompany.length > 0) {
                                      const hallPct = companyPct / hallsInCompany.length
                                      hallsInCompany.forEach(hName => {
                                        newHallPercentages[hName] = hallPct
                                      })
                                    }
                                  })
                                  setHallPercentages(newHallPercentages)
                                }
                              }
                            }}
                          >
                            均等に分配
                          </Button>
                        </div>
                        {proportionMode === "hall" ? (
                          hallNames.filter((name) => name.trim() !== "").map((hallName, index) => {
                            const percentage = hallPercentages[hallName] || 0
                            // 各項目の合計金額を計算
                            const posterPrintQty = parseFloat(posterPrintQuantity) || 0
                            const posterPrintPrice = parseFloat(posterPrintUnitPrice) || 0
                            const posterPrintAmount = posterPrintQty * posterPrintPrice
                            const totalAmount = Object.values(totalQuoteItems).reduce((sum, amount) => {
                              return sum + (parseFloat(amount) || 0)
                            }, 0) + posterPrintAmount
                            const calculatedAmount = totalAmount > 0 ? Math.floor((totalAmount * percentage) / 100) : 0

                            return (
                              <div key={index} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`percentage-${index}`} className="flex-1">
                                    {hallName} の割合
                                  </Label>
                                  <Input
                                    id={`percentage-${index}`}
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="5"
                                    placeholder="0"
                                    value={percentage || ""}
                                    onChange={(e) => {
                                      let value = e.target.value
                                      if (value && value.length > 1 && value.startsWith("0") && value[1] !== ".") {
                                        value = value.replace(/^0+/, "")
                                      }
                                      const numValue = parseFloat(value) || 0
                                      // 5の倍数に丸める (Hall mode: allow finer control? keeping simple for now)
                                      const roundedValue = numValue // Math.round(numValue / 5) * 5 // Allow precise input if needed, or keep consistent
                                      const newPercentages = { ...hallPercentages }
                                      newPercentages[hallName] = Math.min(100, Math.max(0, roundedValue))
                                      setHallPercentages(newPercentages)
                                    }}
                                    className="w-24"
                                  />
                                  <span className="text-sm text-muted-foreground">%</span>
                                  {totalAmount > 0 && (
                                    <span className="text-sm font-medium ml-2">
                                      = ¥{calculatedAmount.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          // Company Mode
                          Array.from(new Set(hallCompanyIds.filter((id, idx) => hallNames[idx] && hallNames[idx].trim() !== "" && id))).map((companyId, index) => {
                            const company = companies.find(c => c.id === companyId)
                            const percentage = companyPercentages[companyId] || 0
                            
                            // Calculate Company Amount
                            const posterPrintQty = parseFloat(posterPrintQuantity) || 0
                            const posterPrintPrice = parseFloat(posterPrintUnitPrice) || 0
                            const posterPrintAmount = posterPrintQty * posterPrintPrice
                            const totalAmount = Object.values(totalQuoteItems).reduce((sum, amount) => {
                              return sum + (parseFloat(amount) || 0)
                            }, 0) + posterPrintAmount
                            const calculatedAmount = totalAmount > 0 ? Math.floor((totalAmount * percentage) / 100) : 0

                            return (
                              <div key={companyId} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`company-percentage-${index}`} className="flex-1">
                                    {company?.name || "不明な法人"} の割合
                                  </Label>
                                  <Input
                                    id={`company-percentage-${index}`}
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="5"
                                    placeholder="0"
                                    value={percentage || ""}
                                    onChange={(e) => {
                                      let value = e.target.value
                                      if (value && value.length > 1 && value.startsWith("0") && value[1] !== ".") {
                                        value = value.replace(/^0+/, "")
                                      }
                                      const numValue = parseFloat(value) || 0
                                      const roundedValue = numValue
                                      
                                      const newCompanyPercentages = { ...companyPercentages }
                                      newCompanyPercentages[companyId] = Math.min(100, Math.max(0, roundedValue))
                                      setCompanyPercentages(newCompanyPercentages)

                                      // Update Halls for this company
                                      const hallsInCompany = hallNames.filter((_, hIdx) => hallCompanyIds[hIdx] === companyId && hallNames[hIdx].trim() !== "")
                                      if (hallsInCompany.length > 0) {
                                        const hallPct = newCompanyPercentages[companyId] / hallsInCompany.length
                                        const newHallPercentages = { ...hallPercentages }
                                        hallsInCompany.forEach(hName => {
                                          newHallPercentages[hName] = hallPct
                                        })
                                        setHallPercentages(newHallPercentages)
                                      }
                                    }}
                                    className="w-24"
                                  />
                                  <span className="text-sm text-muted-foreground">%</span>
                                  {totalAmount > 0 && (
                                    <span className="text-sm font-medium ml-2">
                                      = ¥{calculatedAmount.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                        
                        {(() => {
                          // 各項目の合計金額を計算
                          const posterPrintQty = parseFloat(posterPrintQuantity) || 0
                          const posterPrintPrice = parseFloat(posterPrintUnitPrice) || 0
                          const posterPrintAmount = posterPrintQty * posterPrintPrice
                          const totalAmount = Object.values(totalQuoteItems).reduce((sum, amount) => {
                            return sum + (parseFloat(amount) || 0)
                          }, 0) + posterPrintAmount
                          
                          if (totalAmount > 0) {
                            return (
                              <div className="space-y-2 pt-2 border-t">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">割合の合計:</span>
                                  <span className={`font-medium ${Object.values(hallPercentages).reduce((sum, p) => sum + p, 0) === 100 ? "text-green-600" : "text-destructive"}`}>
                                    {Object.values(hallPercentages).reduce((sum, p) => sum + p, 0).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">案件全体の見積金額:</span>
                                  <span className="font-medium">
                                    ¥{totalAmount.toLocaleString()}
                                  </span>
                                </div>
                                {Object.values(hallPercentages).reduce((sum, p) => sum + p, 0) !== 100 && (
                                  <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                      割合の合計が100%になるように設定してください
                                    </AlertDescription>
                                  </Alert>
                                )}
                                {(() => {
                                  const totalCalculated = Object.keys(hallPercentages).reduce((sum, hn) => {
                                    const p = hallPercentages[hn] || 0
                                    return sum + Math.floor((totalAmount * p) / 100)
                                  }, 0)
                                  const remainder = totalAmount - totalCalculated
                                  return remainder !== 0 ? (
                                    <Alert>
                                      <AlertTriangle className="h-4 w-4" />
                                      <AlertDescription>
                                        端数が発生しています: ¥{Math.abs(remainder).toLocaleString()}
                                        {remainder > 0 ? "（未配分）" : "（超過）"}
                                      </AlertDescription>
                                    </Alert>
                                  ) : null
                                })()}
                              </div>
                            )
                          }
                          return null
                        })()}
                      </div>

                      {!quoteGenerated && (
                        <Button
                          onClick={handleGenerateQuote}
                          className="w-full bg-gradient-to-r from-primary to-blue-600 text-primary-foreground"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          見積もりを作成
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })()}

              {quoteGenerated && (
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      見積もり
                    </CardTitle>
                    <CardDescription>各ホールの見積もり詳細</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {hallNames.filter((name) => name.trim() !== "").map((hallName, index) => {
                      const percentage = hallPercentages[hallName] || 0
                      // 各項目の合計金額を計算
                      const posterPrintQty = parseFloat(posterPrintQuantity) || 0
                      const posterPrintPrice = parseFloat(posterPrintUnitPrice) || 0
                      const posterPrintAmount = posterPrintQty * posterPrintPrice
                      const totalAmount = Object.values(totalQuoteItems).reduce((sum, amount) => {
                        return sum + (parseFloat(amount) || 0)
                      }, 0) + posterPrintAmount
                      const calculatedAmount = totalAmount > 0 ? Math.floor((totalAmount * percentage) / 100) : 0
                      const quoteItems = hallQuotes[hallName] || []
                      
                      return (
                        <Card key={index} className="border border-border">
                          <CardHeader>
                            <CardTitle className="text-lg">{hallName} の見積もり</CardTitle>
                            <CardDescription>
                              割合: {percentage}% | 見積金額: ¥{calculatedAmount.toLocaleString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-3">
                              {quoteItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    {item.id === 2 ? (
                                      <p className="text-sm text-muted-foreground">
                                        {item.quantity}枚 × ¥{item.unitPrice.toLocaleString()}
                                      </p>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">
                                        割合（{percentage}%）で計算された金額
                                      </p>
                                    )}
                                  </div>
                                  <p className="font-semibold">
                                    {item.id === 2 ? `¥${(item.quantity * item.unitPrice).toLocaleString()}` : `¥${item.unitPrice.toLocaleString()}`}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="border-t pt-4 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">項目合計金額</span>
                                <span className="text-xl font-bold">
                                  ¥{calculateQuoteTotal(hallName).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-primary">割合による見積金額</span>
                                <span className="text-2xl font-bold text-primary">
                                  ¥{calculatedAmount.toLocaleString()}
                                </span>
                              </div>
                              {calculateQuoteTotal(hallName) !== calculatedAmount && (
                                <Alert>
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>
                                    項目合計金額（¥{calculateQuoteTotal(hallName).toLocaleString()}）と割合による見積金額（¥{calculatedAmount.toLocaleString()}）が一致していません。
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>

                            <div className="flex gap-3">
                              <Button onClick={() => setShowPdfModal(true)} variant="outline" className="flex-1">
                                <FileCheck className="w-4 h-4 mr-2" />
                                PDF出力
                              </Button>
                              <Button
                                onClick={() => {
                                  setWorkflowHallName(hallName)
                                  setShowWorkflowModal(true)
                                }}
                                className="flex-1 bg-gradient-to-r from-primary to-blue-600"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                顧客へ通知
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                    {Object.keys(hallQuotes).length > 1 && (
                      <div className="border-t pt-4 mt-6">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-semibold">全ホール合計金額（割合ベース）</span>
                          <span className="text-3xl font-bold text-primary">
                            {(() => {
                              const posterPrintQty = parseFloat(posterPrintQuantity) || 0
                              const posterPrintPrice = parseFloat(posterPrintUnitPrice) || 0
                              const posterPrintAmount = posterPrintQty * posterPrintPrice
                              const totalAmount = Object.values(totalQuoteItems).reduce((sum, amount) => {
                                return sum + (parseFloat(amount) || 0)
                              }, 0) + posterPrintAmount
                              return `¥${Object.keys(hallPercentages).reduce((sum, hn) => {
                                const p = hallPercentages[hn] || 0
                                return sum + Math.floor((totalAmount * p) / 100)
                              }, 0).toLocaleString()}`
                            })()}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {quoteGenerated && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      案件ステータス管理
                    </CardTitle>
                    <CardDescription>案件の進行状況を管理します</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">現在のステータス:</span>
                      <Badge variant={projectStatus === "confirmed" ? "default" : "secondary"} className="text-sm">
                        {projectStatus === "draft" && "下書き"}
                        {projectStatus === "confirmed" && "確定"}
                        {projectStatus === "in-progress" && "進行中"}
                        {projectStatus === "completed" && "完了"}
                      </Badge>
                    </div>

                    {projectStatus === "draft" && (
                      <Button
                        onClick={handleConfirmProject}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        案件確定
                      </Button>
                    )}

                    {projectStatus === "confirmed" && (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-600">
                          案件が確定されました。制作フェーズに進めます。
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    宛名抽出条件
                  </CardTitle>
                  <CardDescription>PSPクラウドとの連携設定</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <MapPin className="h-4 w-4" />
                    <AlertDescription>
                      対象エリア: {area || "未設定"}
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handlePSPSync}
                    disabled={syncLoading}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    {syncLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        同期中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        PSPクラウド連携
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setCurrentScreen("production")} size="lg">
                  制作フェーズへ
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Screen 2: Production */}
          {currentScreen === "production" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground">制作進行・AI校正</h2>
                <p className="text-muted-foreground mt-2">制作物の進捗管理とAIによる自動校正</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    案件進行管理
                  </CardTitle>
                  <CardDescription>AI AGENTで自動ステータス更新</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">現在のステータス</span>
                    <Badge className="text-sm">{projectStatusProduction}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setProjectStatusProduction("初稿待ち")
                      toast({
                        title: "ステータスを更新しました",
                        description: "AI AGENTが自動的にステータスを更新しました",
                      })
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI自動ステータス更新
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    ポスター発注
                  </CardTitle>
                  <CardDescription>印刷会社へポスター作成を発注</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">発注先</span>
                      <span className="font-medium">印刷会社A</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ステータス</span>
                      <Badge variant={posterDraftStatus === "校了" ? "default" : "secondary"}>
                        {posterDraftStatus}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowPosterOrderModal(true)}
                    className="w-full bg-gradient-to-r from-primary to-blue-600"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    ポスター発注（依頼文自動生成）
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    ポスター初稿・校正フロー
                  </CardTitle>
                  <CardDescription>初稿確認→修正依頼→最終チェック</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center">
                      <div
                        className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${
                          posterDraftStatus !== "未作成"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        1
                      </div>
                      <p className="text-xs mt-1">初稿作成</p>
                    </div>
                    <div className="text-center">
                      <div
                        className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${
                          posterDraftStatus === "修正中" || posterDraftStatus === "校了"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        2
                      </div>
                      <p className="text-xs mt-1">初稿確認</p>
                    </div>
                    <div className="text-center">
                      <div
                        className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${
                          posterDraftStatus === "校了"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        3
                      </div>
                      <p className="text-xs mt-1">最終調整</p>
                    </div>
                    <div className="text-center">
                      <div
                        className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${
                          posterDraftStatus === "校了" && orderStatus === "finalized"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        4
                      </div>
                      <p className="text-xs mt-1">最終確認</p>
                    </div>
                  </div>

                  {posterDraftStatus === "未作成" ? (
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/20">
                      <p className="text-muted-foreground mb-4">デザイン業者からの初稿アップロード待ち</p>
                      <Button
                        onClick={() => {
                          setPosterDraftStatus("初稿完成")
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        (デモ用: アップロードを受信)
                      </Button>
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg p-4 mb-4 flex items-center justify-between bg-card">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded">
                          <ImageIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">poster_draft_v1.jpg</p>
                          <p className="text-xs text-muted-foreground">2024/12/20 14:30 アップロード済み</p>
                        </div>
                      </div>
                      <Badge variant="outline">初稿</Badge>
                    </div>
                  )}

                  <Button
                    onClick={() => setShowFirstDraftModal(true)}
                    variant="outline"
                    className="w-full"
                    disabled={posterDraftStatus === "未作成"}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    初稿確認・AI校正チェック
                  </Button>

                  <Button
                    onClick={() => setShowFinalCheckModal(true)}
                    variant="outline"
                    className="w-full"
                    disabled={posterDraftStatus !== "校了"}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    最終確認・顧客へ送付
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI校正チェック
                  </CardTitle>
                  <CardDescription>画像とデータの整合性を自動検証します</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left: JAS Data */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground">JASデータ</h4>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">日付:</span>
                          <span className="font-medium">12/25</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">店舗:</span>
                          <span className="font-medium">オメガホール</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">景品:</span>
                          <span className="font-medium">商品券10万円分</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Poster Preview */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground">ポスタープレビュー</h4>
                      <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-dashed border-muted-foreground/30 aspect-[3/4]">
                        {aiProofing && (
                          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center rounded-lg animate-pulse">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        )}

                        <div className="text-center space-y-4">
                          <h3 className="text-2xl font-bold">大抽選会</h3>
                          <div className={`relative inline-block ${showDateError ? "ring-4 ring-destructive" : ""}`}>
                            <p className="text-xl font-semibold">12/24開催</p>
                          </div>
                          <p className="text-lg">オメガホール</p>
                          <p className="text-base">商品券10万円分</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {proofingComplete && (
                    <div className="space-y-3">
                      {showDateError && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>⚠️ 日付不一致を検出しました。画像: 12/24、データ: 12/25</AlertDescription>
                        </Alert>
                      )}

                      {showFontError && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>⚠️ フォントの問題を検出しました。</AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => {
                            setOrderStatus("proofing")
                            setPosterDraftStatus("修正中")
                            toast({
                              title: "修正依頼を送信しました",
                              description: "制作会社に修正を依頼しました",
                            })
                          }}
                        >
                          修正依頼
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => {
                            setOrderStatus("finalized")
                            setPosterDraftStatus("校了")
                            toast({
                              title: "承認完了",
                              description: "制作物を承認しました",
                            })
                          }}
                        >
                          承認する
                        </Button>
                      </div>
                    </div>
                  )}

                  {!proofingComplete && (
                    <Button
                      onClick={handleAIProofing}
                      disabled={aiProofing}
                      className="w-full bg-gradient-to-r from-primary to-blue-600"
                    >
                      {aiProofing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          スキャン中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI校正チェック実行
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    DM投函依頼
                  </CardTitle>
                  <CardDescription>宛名データを添付してデザイン業者へ依頼</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setShowDMOrderModal(true)} variant="outline" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    DM投函依頼（依頼文自動生成）
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setCurrentScreen("lottery")} size="lg">
                  抽選・景品フェーズへ
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Screen 3: Lottery */}
          {currentScreen === "lottery" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground">抽選・景品・配送</h2>
                <p className="text-muted-foreground mt-2">当選者リストの管理と発送処理</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    当選者リストアップロード
                  </CardTitle>
                  <CardDescription>Excelファイル（.xlsx）をアップロードしてください</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!fileUploaded ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                          <p className="font-medium mb-2">PSP連携</p>
                          <p className="text-sm text-muted-foreground mb-4">ホールがアップロードしたデータを同期</p>
                          <div className="flex flex-col gap-2">
                            <Button 
                              onClick={() => {
                                setFileUploaded(true)
                                setShowWinnerListError(false)
                                setWinnerListValidated(true)
                                toast({ title: "同期完了", description: "PSPから正常なデータを取得しました" })
                              }}
                              className="bg-primary w-full"
                              size="sm"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              正常データを同期
                            </Button>
                            <Button 
                              onClick={() => {
                                setFileUploaded(true)
                                setShowWinnerListError(true)
                                setWinnerListValidated(false)
                                toast({ title: "同期完了", description: "PSPからデータを取得しましたが、不整合があります", variant: "destructive" })
                              }}
                              variant="destructive"
                              className="w-full"
                              size="sm"
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              異常データを同期
                            </Button>
                          </div>
                        </div>

                        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                          <p className="font-medium mb-2">ファイルアップロード</p>
                          <p className="text-sm text-muted-foreground mb-4">手元のExcelファイルをアップロード</p>
                          <div className="flex flex-col items-center justify-center h-[88px] border border-dashed rounded bg-background cursor-pointer hover:bg-accent/50"
                               onClick={() => {
                                 setFileUploaded(true)
                                 setShowWinnerListError(false)
                                 setWinnerListValidated(true)
                                 toast({ title: "アップロード完了", description: "ファイルが正常にアップロードされました" })
                               }}
                          >
                            <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">クリックしてファイルを選択</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-left space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-green-600" />
                          winners_list_20241225.xlsx (PSP連携済)
                        </p>
                        <Button variant="outline" size="sm" onClick={() => {
                           setFileUploaded(false)
                           setWinnerListValidated(false)
                           setShowWinnerListError(false)
                        }}>
                          リセット
                        </Button>
                      </div>
                      
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>名前</TableHead>
                              <TableHead>住所</TableHead>
                              <TableHead>電話番号</TableHead>
                              <TableHead>景品</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {demoWinnerData.map((winner) => (
                              <TableRow key={winner.id}>
                                <TableCell>{winner.name}</TableCell>
                                <TableCell>{winner.address}</TableCell>
                                <TableCell>{winner.phone}</TableCell>
                                <TableCell>{winner.prize}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {showWinnerListError && (
                         <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>エラー: 当選者数と見積もり情報の不一致</AlertTitle>
                            <AlertDescription>
                               <div className="mt-2 space-y-2">
                                 <p>当選者リスト: {demoWinnerData.length}名</p>
                                 <p>見積もり(景品数): {prizeInfo.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0)}名</p>
                                 <div className="pt-2">
                                   <Button 
                                     variant="destructive" 
                                     size="sm" 
                                     onClick={() => {
                                       toast({ 
                                         title: "再アップロード依頼送信完了", 
                                         description: "ホール担当者に再アップロード依頼メールを送信しました" 
                                       })
                                       setShowWinnerListError(false) // Reset error state for demo flow or keep it? Let's keep it to show "requested" state if complex, but simple toast is fine.
                                     }}
                                   >
                                      <Mail className="w-4 h-4 mr-2" />
                                      ホールに再アップロード依頼
                                   </Button>
                                 </div>
                               </div>
                            </AlertDescription>
                         </Alert>
                      )}
                    </div>
                  )}

                  {winnerListValidated && (
                    <Alert className="border-primary bg-primary/10">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <AlertDescription>
                        <strong>✅ 当選者リスト検証完了</strong>
                        <br />
                        <span className="text-sm">すべての必須項目が揃い、重複・フォーマット不備はありません</span>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* 当選者通知発注データ（景品発注データの前に配置） */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    当選者通知発注データ
                  </CardTitle>
                  <CardDescription>当選者リストから通知用発注フォーマット（はがき・DM等）へ自動変換</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!notificationOrderGenerated ? (
                    <Button
                      onClick={handleGenerateNotificationOrder}
                      className="w-full bg-gradient-to-r from-primary to-blue-600"
                      disabled={!winnerListValidated}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      通知データ自動生成
                    </Button>
                  ) : (
                    <>
                      <Alert className="border-primary bg-primary/10">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <AlertDescription>
                          <strong>✅ 当選者通知発注データ生成完了</strong>
                          <br />
                          <span className="text-sm">winner_notification_20241225.xlsx が生成されました</span>
                        </AlertDescription>
                      </Alert>
                      <div className="rounded-lg border border-border p-4 space-y-2">
                        <h4 className="font-semibold text-sm">通知データプレビュー</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>• 当選者数: {demoWinnerData.length}名</p>
                          <p>• 出力形式: はがき印刷用・DM発送用</p>
                          <p>• 項目: 氏名、住所、景品名、当選案内文</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* 景品発注データ生成 */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    景品発注データ生成
                  </CardTitle>
                  <CardDescription>当選者リストから景品用発注フォーマットへ自動変換</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!prizeOrderGenerated ? (
                    <Button
                      onClick={handleGeneratePrizeOrder}
                      className="w-full bg-gradient-to-r from-primary to-blue-600"
                      disabled={!winnerListValidated}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      発注データ自動生成
                    </Button>
                  ) : (
                    <>
                      <Alert className="border-primary bg-primary/10">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <AlertDescription>
                          <strong>✅ 発注データ生成完了</strong>
                          <br />
                          <span className="text-sm">prize_order_20241225.xlsx が生成されました</span>
                        </AlertDescription>
                      </Alert>

                      <div className="rounded-lg border border-border p-4 space-y-2">
                        <h4 className="font-semibold text-sm">発注データプレビュー</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>• 当選者数: 50名</p>
                          <p>• 景品種類: クオカード 10,000円</p>
                          <p>• 配送先: 個別配送（50件）</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* 当選者通知発注処理（景品発注処理の手前に配置） */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    当選者通知発注処理
                  </CardTitle>
                  <CardDescription>当選者通知を業者に依頼するためのメール送信（はがき印刷業者へ発注書を送信）</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!notificationOrderSent ? (
                    <div className="space-y-3">
                      {notificationOrderGenerated ? (
                        <>
                          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <p className="text-sm">当選者通知を業者に依頼するため、当選者通知発注データ（winner_notification_20241225.xlsx）をはがき印刷業者へメール送信します。</p>
                          </div>
                          <Button onClick={handleSendNotificationOrder} className="w-full" disabled={!notificationOrderGenerated}>
                            <Send className="w-4 h-4 mr-2" />
                            当選者通知依頼メールを送信（PDF + データ添付）
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            ※ パスワード保護されたファイルとパスワードメールが自動送信されます
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">当選者通知発注データの生成が完了すると、業者への依頼メール送信が可能になります</p>
                      )}
                    </div>
                  ) : (
                    <>
                      <Alert className="border-primary bg-primary/10">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <AlertDescription>
                          <strong>✅ 当選者通知依頼メール送信完了</strong>
                          <br />
                          <span className="text-sm">業者へ当選者通知の依頼メールを送信しました（パスワードメールも自動送信）</span>
                        </AlertDescription>
                      </Alert>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">送信日時:</span>
                          <span className="font-medium">2024-12-20 10:00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">送信先:</span>
                          <span className="font-medium">はがき印刷業者（当選者通知を依頼）</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    景品発注処理
                  </CardTitle>
                  <CardDescription>景品発注書を生成し業者へメール送信</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!prizeOrderSent ? (
                    <div className="space-y-3">
                      <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>納品希望日</Label>
                            <Input 
                              type="date" 
                              value={prizeDeliveryDate}
                              onChange={(e) => setPrizeDeliveryDate(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleSendPrizeOrder} className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        発注書をメール送信（PDF + データ添付）
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        ※ パスワード保護されたファイルとパスワードメールが自動送信されます
                      </p>
                    </div>
                  ) : (
                    <>
                      <Alert className="border-primary bg-primary/10">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <AlertDescription>
                          <strong>✅ 発注メール送信完了</strong>
                          <br />
                          <span className="text-sm">パスワードメールも自動送信されました</span>
                        </AlertDescription>
                      </Alert>

                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">発注日時:</span>
                          <span className="font-medium">2024-12-20 10:30</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">納品予定日:</span>
                          <span className="font-medium">未設定</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">経過日数:</span>
                          <span className="font-medium text-destructive">5営業日（⚠️ アラート）</span>
                        </div>
                      </div>

                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>納品日が3営業日以上空欄です。業者に確認してください。</AlertDescription>
                      </Alert>
                    </>
                  )}
                </CardContent>
              </Card>

              {prizeOrderSent && (
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      クオカード書簡内容チェック
                    </CardTitle>
                    <CardDescription>AI自動チェック：誤字・日付相違・定型文との差分検出</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!quoCardLetterChecked ? (
                      <Button
                        onClick={handleCheckQuoCardLetter}
                        className="w-full bg-gradient-to-r from-primary to-blue-600"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI書簡チェック実行
                      </Button>
                    ) : (
                      <Alert className="border-primary bg-primary/10">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <AlertDescription>
                          <strong>✅ 書簡内容確認完了</strong>
                          <br />
                          <span className="text-sm">誤字・日付相違・定型文との差分はありません</span>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    配送情報領域
                  </CardTitle>
                  <CardDescription>景品業者がアップロードした配送情報を確認できます</CardDescription>
                </CardHeader>
                <CardContent>
                  {!deliveryFileUploaded ? (
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/20">
                      <p className="text-muted-foreground mb-4">景品業者からの配送情報アップロード待ち</p>
                      <Button
                        onClick={() => {
                          setDeliveryFileUploaded(true)
                          toast({ title: "データ受信", description: "景品業者から配送情報がアップロードされました" })
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        (デモ用: アップロードを受信)
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <FileCheck className="w-8 h-8 text-primary" />
                           <div>
                             <p className="font-medium">delivery_report_20241225.pdf</p>
                             <p className="text-sm text-muted-foreground">2024-12-21 14:00 アップロード済み</p>
                           </div>
                         </div>
                         <div className="flex gap-2">
                           <Button variant="outline" size="sm" onClick={() => setShowDeliveryData(true)}>
                             <Eye className="w-4 h-4 mr-2" />
                             プレビュー
                           </Button>
                           <Button variant="outline" size="sm" onClick={() => toast({ title: "ダウンロード", description: "ファイルをダウンロードしました" })}>
                             ダウンロード
                           </Button>
                            <Button variant="outline" size="sm" onClick={() => setDeliveryFileUploaded(false)}>
                             リセット
                           </Button>
                         </div>
                       </div>
                       
                       <Button className="w-full" variant="secondary" onClick={() => setShowDeliveryData(true)}>
                          配送状況を確認する
                       </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Delivery Status Modal (PDF Preview) */}
          <Dialog open={showDeliveryData} onOpenChange={setShowDeliveryData}>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>配送情報プレビュー</DialogTitle>
                <DialogDescription>delivery_report_20241225.pdf</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-auto bg-gray-100 p-4 rounded-md border">
                <div className="bg-white text-black p-12 shadow-lg min-h-[800px] mx-auto max-w-[210mm] relative">
                  {/* PDF Header */}
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <h1 className="text-2xl font-serif font-bold mb-4 border-b-2 border-black pb-2 inline-block">配送完了報告書</h1>
                      <p className="text-sm">案件名：オメガホール大抽選会 景品配送</p>
                    </div>
                    <div className="text-right text-sm">
                      <p>発行日：2024年12月21日</p>
                      <p>No. 20241221-001</p>
                    </div>
                  </div>

                  {/* To */}
                  <div className="mb-12">
                    <p className="text-lg underline decoration-1 mb-2">株式会社オメガ 御中</p>
                    <p className="text-sm text-gray-600 ml-4">ご担当者様</p>
                  </div>

                  {/* From */}
                  <div className="mb-12 text-right">
                    <p className="font-bold mb-1">景品配送代行サービス株式会社</p>
                    <p className="text-xs text-gray-600">〒100-0001 東京都千代田区...</p>
                    <p className="text-xs text-gray-600">TEL: 03-1234-5678</p>
                  </div>

                  {/* Content */}
                  <div className="mb-8">
                    <p className="mb-4">拝啓</p>
                    <p className="mb-4">平素は格別のご高配を賜り、厚く御礼申し上げます。<br />
                    ご依頼いただきました景品の配送が完了いたしましたので、下記の通りご報告申し上げます。</p>
                    <p className="text-right">敬具</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-bold border-l-4 border-black pl-2 mb-4">配送明細</h3>
                    <table className="w-full border-collapse border border-black text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-black p-2 text-left">No.</th>
                          <th className="border border-black p-2 text-left">配送先氏名</th>
                          <th className="border border-black p-2 text-left">配送状況</th>
                          <th className="border border-black p-2 text-left">配送業者</th>
                          <th className="border border-black p-2 text-left">追跡番号</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demoDeliveryData.map((item, index) => (
                          <tr key={item.id}>
                            <td className="border border-black p-2 text-center">{index + 1}</td>
                            <td className="border border-black p-2">{item.name} 様</td>
                            <td className="border border-black p-2">{item.status}</td>
                            <td className="border border-black p-2">ヤマト運輸</td>
                            <td className="border border-black p-2 font-mono">{item.tracking}</td>
                          </tr>
                        ))}
                        {/* Fill empty rows for PDF look */}
                        {[...Array(5)].map((_, i) => (
                          <tr key={`empty-${i}`}>
                            <td className="border border-black p-2">&nbsp;</td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Stamp area */}
                  <div className="absolute bottom-12 right-12">
                    <div className="border border-red-500 text-red-500 w-20 h-20 rounded-full flex flex-col items-center justify-center rotate-[-15deg] opacity-80">
                      <span className="text-xs border-b border-red-500 w-16 text-center pb-1">配送代行</span>
                      <span className="text-sm font-bold py-1">確認済</span>
                      <span className="text-xs border-t border-red-500 w-16 text-center pt-1">12.21</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => toast({ title: "印刷", description: "プリンターに送信しました" })}>
                  印刷
                </Button>
                <Button onClick={() => setShowDeliveryData(false)}>閉じる</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Screen 4: Accounting */}
          {currentScreen === "accounting" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground">経理・計上センター</h2>
                <p className="text-muted-foreground mt-2">月次締めと会計連携の自動化</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    計上確認・請求書検証
                  </CardTitle>
                  <CardDescription>月末・月初の計上データ確認と請求書の相違チェック</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">業者名</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">見積金額</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">請求金額</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">ステータス</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">アクション</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-3 text-sm">印刷会社A</td>
                          <td className="px-4 py-3 text-sm">¥120,000</td>
                          <td className="px-4 py-3 text-sm">¥120,000</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="default">合致</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedVendor({ name: "印刷会社A", amount: 120000, status: "合致" })
                                setShowInvoiceModal(true)
                              }}
                            >
                              請求書発行
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm">配送業者B</td>
                          <td className="px-4 py-3 text-sm">¥45,000</td>
                          <td className="px-4 py-3 text-sm">¥47,500</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="destructive">相違あり</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedVendor({ name: "配送業者B", quote: 45000, invoice: 47500 })
                                setShowInvoiceVerifyModal(true)
                              }}
                            >
                              修正依頼
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm">景品調達先C</td>
                          <td className="px-4 py-3 text-sm">¥85,000</td>
                          <td className="px-4 py-3 text-sm">¥85,000</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="default">合致</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedVendor({ name: "景品調達先C", amount: 85000, status: "合致" })
                                setShowInvoiceModal(true)
                              }}
                            >
                              請求書発行
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAgreementModal(true)}
                      className="flex-1 bg-gradient-to-r from-primary to-blue-600"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      合意確認メール自動送信
                    </Button>
                    <Button onClick={() => setShowReportModal(true)} variant="outline" className="flex-1">
                      <Mail className="w-4 h-4 mr-2" />
                      請求チームへ報告
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    月次締め処理
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">案件名</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">納品日</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">ステータス</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">計上日</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-3 text-sm">オメガホール抽選会</td>
                          <td className="px-4 py-3 text-sm">2024-12-20</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="default">納品済み</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">2024-12-31</td>
                        </tr>
                        <tr className={carryoverProcessed ? "bg-primary/5" : ""}>
                          <td className="px-4 py-3 text-sm">シグマパーク年末イベント</td>
                          <td className="px-4 py-3 text-sm">2024-12-28</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant={carryoverProcessed ? "secondary" : "destructive"}>
                              {carryoverProcessed ? "繰越済み" : "未手配"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">{carryoverProcessed ? "2025-01-31" : "2024-12-31"}</td>
                        </tr>
                        <tr className={carryoverProcessed ? "bg-primary/5" : ""}>
                          <td className="px-4 py-3 text-sm">デルタ店舗新春キャンペーン</td>
                          <td className="px-4 py-3 text-sm">2025-01-05</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant={carryoverProcessed ? "secondary" : "destructive"}>
                              {carryoverProcessed ? "繰越済み" : "未手配"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">{carryoverProcessed ? "2025-01-31" : "2024-12-31"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <Button
                    onClick={handleAutoCarryover}
                    disabled={carryoverProcessed}
                    className="w-full bg-gradient-to-r from-primary to-blue-600"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    未手配繰越・自動実行
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    請求書モニター
                  </CardTitle>
                  <CardDescription>業者からの請求書到着状況</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>自動リマインダーを2社に送信しました</AlertDescription>
                  </Alert>

                  <div className="space-y-3 mb-4">
                    <button
                      onClick={() => handleViewInvoice("vendorA")}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{invoiceStatuses.vendorA === "confirmed" ? "🟢" : "🔴"}</span>
                        <div>
                          <p className="font-medium">印刷会社A</p>
                          <p className="text-sm text-muted-foreground">
                            {invoiceStatuses.vendorA === "confirmed" ? "請求書到着済み" : "請求書未到着"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={invoiceStatuses.vendorA === "confirmed" ? "default" : "destructive"}>
                        {invoiceStatuses.vendorA === "confirmed" ? "確認済み" : "要確認"}
                      </Badge>
                    </button>

                    <button
                      onClick={() => handleViewInvoice("vendorB")}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{invoiceStatuses.vendorB === "confirmed" ? "🟢" : "🔴"}</span>
                        <div>
                          <p className="font-medium">配送業者B</p>
                          <p className="text-sm text-muted-foreground">
                            {invoiceStatuses.vendorB === "confirmed" ? "請求書到着済み" : "請求書未到着"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={invoiceStatuses.vendorB === "confirmed" ? "default" : "destructive"}>
                        {invoiceStatuses.vendorB === "confirmed" ? "確認済み" : "要確認"}
                      </Badge>
                    </button>

                    <button
                      onClick={() => handleViewInvoice("vendorC")}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{invoiceStatuses.vendorC === "confirmed" ? "🟢" : "🔴"}</span>
                        <div>
                          <p className="font-medium">景品調達先C</p>
                          <p className="text-sm text-muted-foreground">
                            {invoiceStatuses.vendorC === "confirmed" ? "請求書到着済み" : "請求書未到着"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={invoiceStatuses.vendorC === "confirmed" ? "default" : "destructive"}>
                        {invoiceStatuses.vendorC === "confirmed" ? "確認済み" : "要確認"}
                      </Badge>
                    </button>
                  </div>

                  <Button onClick={handleSendReminders} variant="outline" className="w-full bg-transparent">
                    <Mail className="w-4 h-4 mr-2" />
                    未到着業者にリマインダー送信
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    売上計上データ抽出
                  </CardTitle>
                  <CardDescription>月初の売上計上データを自動抽出</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>全業者の請求書・合意メールが揃ってから抽出可能です</AlertDescription>
                  </Alert>

                  <div className="space-y-2 p-4 rounded-lg bg-muted/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">抽出期間</span>
                      <span className="font-medium">2024年12月分</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">対象案件数</span>
                      <span className="font-medium">3件</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">総計上額</span>
                      <span className="font-bold text-lg">¥450,000</span>
                    </div>
                  </div>

                  <Button onClick={handleExtractSalesData} className="w-full bg-gradient-to-r from-primary to-blue-600">
                    <Sparkles className="w-4 h-4 mr-2" />
                    売上計上データ自動抽出
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Cowboy連携
                  </CardTitle>
                  <CardDescription>会計システムへの自動連携</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center p-8">
                    <div className="text-6xl">🤠</div>
                  </div>

                  <Button
                    onClick={handleCowboySync}
                    disabled={cowboySyncing}
                    className="w-full bg-gradient-to-r from-primary to-blue-600"
                  >
                    {cowboySyncing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        連携中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Cowboyに連携（会計連携）
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>発注依頼メール</DialogTitle>
            <DialogDescription>AIが生成した発注依頼文です</DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-4 text-sm leading-relaxed">
            <p className="font-medium mb-2">件名: 【発注依頼】オメガホール抽選会ポスター制作</p>
            <br />
            <p>株式会社印刷パートナー 御中</p>
            <br />
            <p>いつもお世話になっております。</p>
            <br />
            <p>下記の通り、ポスター制作の発注をお願いいたします。</p>
            <br />
            <p>【案件概要】</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>案件名: オメガホール東京 抽選会</li>
              <li>イベント日: 2024年12月25日</li>
              <li>ポスター枚数: 50枚</li>
              <li>納期: 2024年12月15日</li>
            </ul>
            <br />
            <p>詳細は添付資料をご確認ください。</p>
            <p>ご不明点がございましたら、お気軽にお問い合わせください。</p>
            <br />
            <p>何卒よろしくお願いいたします。</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>見積書PDF出力</DialogTitle>
            <DialogDescription>見積書の出力設定を選択してください</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>テンプレート選択</Label>
              <select className="w-full p-2 border rounded-md">
                <option>標準テンプレート</option>
                <option>詳細テンプレート</option>
                <option>簡易テンプレート</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>項目名設定</Label>
              <Input placeholder="見積書のタイトルをカスタマイズ" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Switch />
                複数店舗向け見積書（請求分割）
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowPdfModal(false)} className="flex-1">
                キャンセル
              </Button>
              <Button
                onClick={() => {
                  setShowPdfModal(false)
                  toast({
                    title: "📄 PDF生成完了",
                    description: "見積書がダウンロードされました",
                  })
                }}
                className="flex-1"
              >
                PDF出力
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWorkflowModal} onOpenChange={(open) => {
        setShowWorkflowModal(open)
        if (!open) {
          setWorkflowSlideIndex(0)
          setWorkflowHallName("")
          setWorkflowFrom("")
          setWorkflowToType("hall")
          setWorkflowCc([])
          setWorkflowBcc([])
          setWorkflowMessageTemplate("")
          setWorkflowMessage("")
        }
      }}>
        <DialogContent className="max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>顧客へ通知</DialogTitle>
            <DialogDescription>ワークフローで見積書を自動通知します</DialogDescription>
          </DialogHeader>
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${workflowSlideIndex * 100}%)` }}
            >
              {/* スライド1: 送信先設定 */}
              <div className="min-w-full px-1 space-y-4">
                <div className="space-y-2">
                  <Label>From（送信元）</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {workflowFrom
                          ? employees.find((e) => e.id === workflowFrom)?.name || "従業員を選択..."
                          : "従業員を選択..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="従業員を検索..." />
                        <CommandList>
                          <CommandEmpty>従業員が見つかりませんでした。</CommandEmpty>
                          <CommandGroup>
                            {employees.map((employee) => (
                              <CommandItem
                                key={employee.id}
                                value={employee.name}
                                onSelect={() => {
                                  setWorkflowFrom(employee.id)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    workflowFrom === employee.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {employee.name} {employee.email && `(${employee.email})`}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>To（送信先）</Label>
                  <div className="space-y-2">
                    {(() => {
                      const selectedHall = halls.find((h) => h.name === workflowHallName)
                      const selectedCompany = selectedHall ? companies.find((c) => c.id === selectedHall.companyId) : null
                      
                      return (
                        <>
                          <div className="flex gap-2">
                            <Button
                              variant={workflowToType === "company" ? "default" : "outline"}
                              onClick={() => setWorkflowToType("company")}
                              className="flex-1"
                            >
                              法人({selectedCompany?.name || "-"})
                            </Button>
                            <Button
                              variant={workflowToType === "hall" ? "default" : "outline"}
                              onClick={() => setWorkflowToType("hall")}
                              className="flex-1"
                            >
                              ホール({selectedHall?.name || "-"})
                            </Button>
                          </div>
                          <Input
                            type="email"
                            placeholder="メールアドレス"
                            value={
                              workflowToType === "company"
                                ? selectedCompany?.email || ""
                                : selectedHall?.email || ""
                            }
                            readOnly
                            className="bg-muted"
                          />
                        </>
                      )
                    })()}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>CC（カーボンコピー）</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {workflowCc.length > 0
                          ? `${workflowCc.length}名選択中`
                          : "従業員を選択..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="従業員を検索..." />
                        <CommandList>
                          <CommandEmpty>従業員が見つかりませんでした。</CommandEmpty>
                          <CommandGroup>
                            {employees.map((employee) => (
                              <CommandItem
                                key={employee.id}
                                value={employee.name}
                                onSelect={() => {
                                  if (workflowCc.includes(employee.id)) {
                                    setWorkflowCc(workflowCc.filter((id) => id !== employee.id))
                                  } else {
                                    setWorkflowCc([...workflowCc, employee.id])
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    workflowCc.includes(employee.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {employee.name} {employee.email && `(${employee.email})`}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {workflowCc.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {workflowCc.map((id) => {
                        const employee = employees.find((e) => e.id === id)
                        return employee ? (
                          <Badge key={id} variant="secondary">
                            {employee.name}
                            <button
                              onClick={() => setWorkflowCc(workflowCc.filter((eid) => eid !== id))}
                              className="ml-2 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>BCC（ブラインドカーボンコピー）</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {workflowBcc.length > 0
                          ? `${workflowBcc.length}名選択中`
                          : "従業員を選択..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="従業員を検索..." />
                        <CommandList>
                          <CommandEmpty>従業員が見つかりませんでした。</CommandEmpty>
                          <CommandGroup>
                            {employees.map((employee) => (
                              <CommandItem
                                key={employee.id}
                                value={employee.name}
                                onSelect={() => {
                                  if (workflowBcc.includes(employee.id)) {
                                    setWorkflowBcc(workflowBcc.filter((id) => id !== employee.id))
                                  } else {
                                    setWorkflowBcc([...workflowBcc, employee.id])
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    workflowBcc.includes(employee.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {employee.name} {employee.email && `(${employee.email})`}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {workflowBcc.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {workflowBcc.map((id) => {
                        const employee = employees.find((e) => e.id === id)
                        return employee ? (
                          <Badge key={id} variant="secondary">
                            {employee.name}
                            <button
                              onClick={() => setWorkflowBcc(workflowBcc.filter((eid) => eid !== id))}
                              className="ml-2 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* スライド2: メッセージ本文 */}
              <div className="min-w-full px-1 space-y-4">
                <div className="space-y-2">
                  <Label>メッセージテンプレート</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: "template1", name: "テンプレート1: 標準", content: "お世話になっております。\n\nこの度は、お見積書をご送付いたします。\nご確認のほど、よろしくお願いいたします。\n\n何かご不明な点がございましたら、お気軽にお問い合わせください。\n\nよろしくお願いいたします。" },
                      { id: "template2", name: "テンプレート2: 丁寧", content: "いつもお世話になっております。\n\n本日は、お見積書をお送りさせていただきます。\n詳細につきましては、添付の見積書をご確認ください。\n\nご不明な点やご質問がございましたら、遠慮なくお申し付けください。\n\n今後ともよろしくお願い申し上げます。" },
                      { id: "template3", name: "テンプレート3: 簡潔", content: "お見積書をお送りします。\nご確認をお願いいたします。\n\nご質問等ございましたら、お気軽にご連絡ください。" },
                    ].map((template) => (
                      <Button
                        key={template.id}
                        variant={workflowMessageTemplate === template.id ? "default" : "outline"}
                        onClick={() => {
                          setWorkflowMessageTemplate(template.id)
                          setWorkflowMessage(template.content)
                        }}
                        className="justify-start text-left h-auto py-2"
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>メッセージ本文</Label>
                  <Textarea
                    value={workflowMessage}
                    onChange={(e) => setWorkflowMessage(e.target.value)}
                    placeholder="メッセージを入力してください..."
                    className="min-h-[200px]"
                  />
                </div>
              </div>

              {/* スライド3: プレビュー */}
              <div className="min-w-full px-1 space-y-4">
                <div className="space-y-2">
                  <Label>プレビュー</Label>
                  <Card className="border">
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-1 text-sm">
                        <div><span className="font-semibold">From:</span> {workflowFrom ? employees.find((e) => e.id === workflowFrom)?.email || "" : "-"}</div>
                        {(() => {
                          const selectedHall = halls.find((h) => h.name === workflowHallName)
                          const selectedCompany = selectedHall ? companies.find((c) => c.id === selectedHall.companyId) : null
                          return (
                            <div>
                              <span className="font-semibold">To:</span> {
                                workflowToType === "company"
                                  ? selectedCompany?.email || "-"
                                  : selectedHall?.email || "-"
                              }
                            </div>
                          )
                        })()}
                        {workflowCc.length > 0 && (
                          <div><span className="font-semibold">CC:</span> {workflowCc.map((id) => employees.find((e) => e.id === id)?.email).filter(Boolean).join(", ")}</div>
                        )}
                        {workflowBcc.length > 0 && (
                          <div><span className="font-semibold">BCC:</span> {workflowBcc.map((id) => employees.find((e) => e.id === id)?.email).filter(Boolean).join(", ")}</div>
                        )}
                      </div>
                      <div className="border-t pt-3">
                        <div className="whitespace-pre-wrap text-sm">{workflowMessage || "メッセージが入力されていません"}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              {[0, 1, 2].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setWorkflowSlideIndex(index)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    workflowSlideIndex === index ? "bg-primary" : "bg-muted"
                  }`}
                  aria-label={`スライド ${index + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (workflowSlideIndex > 0) {
                    setWorkflowSlideIndex(workflowSlideIndex - 1)
                  } else {
                    setShowWorkflowModal(false)
                  }
                }}
              >
                {workflowSlideIndex === 0 ? "キャンセル" : "戻る"}
              </Button>
              <Button
                onClick={() => {
                  const totalSlides = 3
                  if (workflowSlideIndex < totalSlides - 1) {
                    setWorkflowSlideIndex(workflowSlideIndex + 1)
                  } else {
                    setShowWorkflowModal(false)
                    toast({
                      title: "📧 通知送信完了",
                      description: "見積書が顧客に送信されました",
                    })
                  }
                }}
                className="bg-gradient-to-r from-primary to-blue-600"
              >
                {workflowSlideIndex === 2 ? "送信" : "次へ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              請求書詳細
            </DialogTitle>
            <DialogDescription>請求内容を確認し、必要な処理を実行してください</DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">業者名</p>
                  <p className="font-medium">{selectedInvoice.vendor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">請求日</p>
                  <p className="font-medium">{selectedInvoice.invoiceDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ステータス</p>
                  <Badge variant={selectedInvoice.status === "confirmed" ? "default" : "destructive"}>
                    {selectedInvoice.status === "confirmed" ? "確認済み" : "未確認"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">請求金額</p>
                  <p className="font-bold text-lg">¥{selectedInvoice.amount.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">請求明細</h4>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">品目</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">数量</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">単価</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">金額</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right">¥{item.unitPrice.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            ¥{(item.quantity * item.unitPrice).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted font-bold">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm text-right">
                          合計
                        </td>
                        <td className="px-4 py-3 text-sm text-right">¥{selectedInvoice.amount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
              閉じる
            </Button>
            <Button variant="outline" onClick={handleRequestCorrection}>
              <XCircle className="w-4 h-4 mr-2" />
              修正依頼
            </Button>
            <Button onClick={handleSendAgreementEmail} className="bg-blue-600">
              <Mail className="w-4 h-4 mr-2" />
              合意確認メール送信
            </Button>
            <Button onClick={handleConfirmInvoice} className="bg-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              請求書確認完了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInvoiceVerifyModal} onOpenChange={setShowInvoiceVerifyModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>請求金額相違・修正依頼</DialogTitle>
            <DialogDescription>見積金額と請求金額に相違があります。業者へ修正依頼を送信します。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                見積金額と請求金額に差異があります。内容を確認し、修正が必要な場合は業者に連絡してください。
              </AlertDescription>
            </Alert>

            <div className="p-4 rounded-lg border border-destructive bg-destructive/5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">業者名</span>
                  <span className="font-medium">{selectedVendor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">見積金額</span>
                  <span className="font-medium">¥{selectedVendor?.quote?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">請求金額</span>
                  <span className="font-bold text-destructive">¥{selectedVendor?.invoice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">差額</span>
                  <span className="font-bold text-destructive">
                    ¥{((selectedVendor?.invoice || 0) - (selectedVendor?.quote || 0))?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>修正依頼内容</Label>
              <Textarea
                placeholder="修正が必要な理由や詳細を記入してください"
                rows={5}
                defaultValue={`${selectedVendor?.name} 御中\n\nいつもお世話になっております。\n\n請求書を確認いたしましたが、見積金額(¥${selectedVendor?.quote?.toLocaleString()})と請求金額(¥${selectedVendor?.invoice?.toLocaleString()})に相違がございます。\n\nお手数ですが、内容をご確認の上、修正版をご送付いただけますでしょうか。\n\nよろしくお願いいたします。`}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShowInvoiceVerifyModal(false)}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => {
                  setShowInvoiceVerifyModal(false)
                  alert("修正依頼を送信しました")
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                修正依頼を送信
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAgreementModal} onOpenChange={setShowAgreementModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>請求金額合意確認メール送信</DialogTitle>
            <DialogDescription>請求金額に合意したことを確認するメールを業者へ自動送信します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>以下の業者へ合意確認メールを送信します</AlertDescription>
            </Alert>

            <div className="space-y-2">
              {["印刷会社A", "景品調達先C"].map((vendor) => (
                <div key={vendor} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium">{vendor}</span>
                  </div>
                  <Badge variant="outline">合意確認送信</Badge>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-muted/30 text-sm">
              <p className="font-medium mb-2">送信メール内容プレビュー:</p>
              <div className="space-y-1 text-muted-foreground">
                <p>件名: 【請求金額合意確認】{`{業者名}`}</p>
                <p className="mt-2">{`{業者名}`} 御中</p>
                <p className="mt-2">請求書を確認いたしました。請求金額に問題ございません。</p>
                <p>ご請求の通りお支払いいたします。</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAgreementModal(false)}>
                キャンセル
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-blue-600"
                onClick={() => {
                  setShowAgreementModal(false)
                  alert("合意確認メールを送信しました")
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                一括送信
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>請求チームへ確認完了報告</DialogTitle>
            <DialogDescription>全業者の請求書・合意メールが揃ったことを請求チームへ報告します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>全ての業者から請求書・合意メールが到着しました</AlertDescription>
            </Alert>

            <div className="p-4 rounded-lg border border-border space-y-3">
              <h4 className="font-medium">確認完了サマリー</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">対象案件</span>
                  <span className="font-medium">オメガホール抽選会</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">対象業者数</span>
                  <span className="font-medium">3社</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">請求書到着</span>
                  <span className="font-medium text-green-600">3/3社 完了</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">合意メール</span>
                  <span className="font-medium text-green-600">3/3社 完了</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">総請求金額</span>
                  <span className="font-bold text-lg">¥250,000</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>報告メッセージ</Label>
              <Textarea
                placeholder="請求チームへの報告内容"
                rows={5}
                defaultValue={`請求チーム 御中\n\nオメガホール抽選会の請求確認が完了しましたのでご報告いたします。\n\n・対象業者: 3社\n・総請求金額: ¥250,000\n・請求書到着: 完了\n・合意メール: 完了\n\n請求処理をよろしくお願いいたします。`}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowReportModal(false)}>
                キャンセル
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-blue-600"
                onClick={() => {
                  setShowReportModal(false)
                  alert("請求チームへ報告を送信しました")
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                報告送信
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>当選者リストの確認</DialogTitle>
            <DialogDescription>データを確認して、AI検証を実行します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>当選者データ（デモ）</Label>
              <Textarea
                value={editingWinnerData}
                onChange={(e) => setEditingWinnerData(e.target.value)}
                className="font-mono text-sm mt-2"
                rows={12}
              />
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-semibold text-sm">データサマリー</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 総件数: {demoWinnerData.length}件</p>
                <p>• 景品種類: クオカード 10,000円</p>
                <p>• 配送方法: 個別配送</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWinnerModal(false)}>
              キャンセル
            </Button>
            <Button onClick={confirmWinnerList} className="bg-gradient-to-r from-primary to-blue-600">
              <Sparkles className="w-4 h-4 mr-2" />
              AI検証を実行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI検証結果</DialogTitle>
            <DialogDescription>当選者リストの検証が完了しました</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="border-primary bg-primary/10">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>
                <strong>✅ 検証完了: 問題なし</strong>
                <br />
                <span className="text-sm">すべての必須項目が揃い、フォーマット不備はありません</span>
              </AlertDescription>
            </Alert>

            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-semibold text-sm">検証項目</h4>
              <div className="text-sm space-y-1">
                <p className="text-primary">✓ 必須項目（氏名・住所・電話番号）: OK</p>
                <p className="text-primary">✓ 重複エントリー: なし</p>
                <p className="text-primary">✓ フォーマット不備: なし</p>
                <p className="text-primary">✓ 電話番号形式: OK</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => confirmValidation(false)}>
              修正依頼を送信
            </Button>
            <Button onClick={() => confirmValidation(true)}>承認して次へ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNotificationOrderModal} onOpenChange={setShowNotificationOrderModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>当選者通知発注データ生成</DialogTitle>
            <DialogDescription>当選者リストから通知用発注データ（はがき・DM等）を自動生成します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">当選者数:</span>
                <span className="font-medium">{demoWinnerData.length}名</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">出力形式:</span>
                <span className="font-medium">はがき印刷用・DM発送用</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">含まれる項目:</span>
                <span className="font-medium">氏名、住所、景品名、当選案内文</span>
              </div>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>当選者通知データを生成すると、当選者リストから通知用フォーマットへ自動変換されます。</AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationOrderModal(false)}>
              キャンセル
            </Button>
            <Button onClick={confirmNotificationOrderGeneration} className="bg-gradient-to-r from-primary to-blue-600">
              <Mail className="w-4 h-4 mr-2" />
              データ生成を実行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrizeOrderModal} onOpenChange={setShowPrizeOrderModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>景品発注データ生成</DialogTitle>
            <DialogDescription>当選者リストから発注データを自動生成します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">当選者数:</span>
                <span className="font-medium">50名</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">景品種類:</span>
                <span className="font-medium">クオカード 10,000円分</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">配送方法:</span>
                <span className="font-medium">個別配送（50件）</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">発注先業者:</span>
                <span className="font-medium">景品調達先C</span>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>発注データを生成すると、自動的にフォーマット変換が実行されます。</AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrizeOrderModal(false)}>
              キャンセル
            </Button>
            <Button onClick={confirmPrizeOrderGeneration} className="bg-gradient-to-r from-primary to-blue-600">
              <Sparkles className="w-4 h-4 mr-2" />
              データ生成を実行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNotificationSendOrderModal} onOpenChange={setShowNotificationSendOrderModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>当選者通知依頼メール送信</DialogTitle>
            <DialogDescription>当選者通知を業者に依頼するため、はがき印刷業者へ発注書をメール送信します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">送信先業者:</span>
                <span className="font-medium">はがき印刷業者</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">メールアドレス:</span>
                <span className="font-medium">notification@print-vendor.jp</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">添付ファイル:</span>
                <span className="font-medium">winner_notification_20241225.xlsx (パスワード保護)</span>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium">自動送信される内容:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>発注書PDF + データファイル（パスワード保護）</li>
                <li>パスワード通知メール（別送）</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationSendOrderModal(false)}>
              キャンセル
            </Button>
            <Button onClick={confirmSendNotificationOrder}>
              <Send className="w-4 h-4 mr-2" />
              メール送信を実行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSendOrderModal} onOpenChange={setShowSendOrderModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>景品発注メール送信</DialogTitle>
            <DialogDescription>発注書をPDF形式で業者へ送信します</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">送信先業者:</span>
                <span className="font-medium">景品調達先C</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">メールアドレス:</span>
                <span className="font-medium">quo-card@vendor.jp</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">添付ファイル:</span>
                <span className="font-medium">prize_order_20241225.xlsx (パスワード保護)</span>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium">自動送信される内容:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>発注書PDF + データファイル（パスワード保護）</li>
                <li>パスワード通知メール（別送）</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendOrderModal(false)}>
              キャンセル
            </Button>
            <Button onClick={confirmSendPrizeOrder}>
              <Send className="w-4 h-4 mr-2" />
              メール送信を実行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLetterCheckModal} onOpenChange={setShowLetterCheckModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>クオカード書簡内容チェック</DialogTitle>
            <DialogDescription>AI自動チェック: 誤字・日付相違・定型文との差分を検出</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-semibold text-sm">書簡内容（サンプル）</h4>
              <div className="text-sm leading-relaxed bg-muted/30 p-3 rounded">
                <p>この度は、オメガホール大抽選会にご参加いただき、誠にありがとうございます。</p>
                <p className="mt-2">厳正なる抽選の結果、あなた様が当選されました。</p>
                <p className="mt-2">心よりお慶び申し上げます。</p>
                <p className="mt-2 text-right">2024年12月25日</p>
              </div>
            </div>

            <div className="rounded-lg border border-primary p-4 space-y-2 bg-primary/5">
              <h4 className="font-semibold text-sm text-primary">AI検証結果</h4>
              <div className="text-sm space-y-1">
                <p className="text-primary">✓ 誤字脱字: 検出なし</p>
                <p className="text-primary">✓ 日付相違: 問題なし</p>
                <p className="text-primary">✓ 定型文との差分: 許容範囲内</p>
                <p className="text-primary">✓ 敬語・表現: 適切</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLetterCheckModal(false)}>
              修正依頼
            </Button>
            <Button onClick={confirmLetterCheck}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              承認する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPosterOrderModal} onOpenChange={setShowPosterOrderModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ポスター発注依頼</DialogTitle>
            <DialogDescription>AI生成された依頼文を確認して送信してください</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">発注先</label>
              <Input value="印刷会社A" readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">イメージ画像添付</label>
              <Input type="file" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">初稿希望日</label>
              <Input
                type="date"
                value={posterFirstDraftDate}
                onChange={(e) => setPosterFirstDraftDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">件名</label>
              <Input value="【JAS】ポスター制作のご依頼" readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">本文（AI自動生成）</label>
              <textarea
                className="w-full min-h-[200px] p-3 border rounded-md"
                readOnly
                value={`印刷会社A 御中

いつもお世話になっております。
JASイベント管理チームです。

下記の内容でポスター制作をお願いいたします。

【案件情報】
- イベント名: オメガホール大抽選会
- 開催日: 2024年12月25日
- 会場: オメガホール（東京都渋谷区）
- 景品: 商品券10万円分
- ポスター枚数: 50枚

【納期】
初稿: ${posterFirstDraftDate || "2024-12-15"}まで
最終納品: 2024年12月20日まで

初稿完成後はSTUDIOにアップロードをお願いいたします。
店舗への送付→校了返信後にデザイン業者へ校了連絡を行います。

ご不明点がございましたらお気軽にお問い合わせください。
よろしくお願いいたします。`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPosterOrderModal(false)}>
              キャンセル
            </Button>
            <Button
              onClick={() => {
                setShowPosterOrderModal(false)
                setProjectStatusProduction("初稿待ち")
                toast({
                  title: "発注依頼を送信しました",
                  description: "印刷会社Aにポスター制作を依頼しました",
                })
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              送信する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFirstDraftModal} onOpenChange={setShowFirstDraftModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              ポスター初稿確認・AI校正
            </DialogTitle>
            <DialogDescription>
              入力データとポスター記載内容を自動突合、誤字脱字・日付相違・フォント崩れを自動検出
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">JASデータ</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">日付:</span>
                    <span className="font-medium">12/25</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">店舗:</span>
                    <span className="font-medium">オメガホール</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">景品:</span>
                    <span className="font-medium">商品券10万円分</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">ポスタープレビュー</h4>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border aspect-[3/4]">
                  <div className="text-center space-y-3">
                    <h3 className="text-xl font-bold">大抽選会</h3>
                    <p className="text-lg font-semibold">12/24開催</p>
                    <p className="text-base">オメガホール</p>
                    <p className="text-sm">商品券10万円分</p>
                  </div>
                </div>
              </div>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>AI検出結果</AlertTitle>
              <AlertDescription className="space-y-1">
                <p>• 日付不一致: ポスター「12/24」、データ「12/25」</p>
                <p>• フォント崩れの可能性あり</p>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium">修正依頼文（AI自動生成）</label>
              <textarea
                className="w-full min-h-[150px] p-3 border rounded-md"
                defaultValue={`印刷会社A 御中

初稿を確認させていただきました。
以下の点について修正をお願いいたします。

【修正箇所】
1. 開催日の誤り
   - 現在: 12/24
   - 正しい: 12/25

2. フォント崩れ
   - タイトル部分のフォントに崩れが見られます

お手数ですが修正版のアップロードをお願いいたします。`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFirstDraftModal(false)}>
              閉じる
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPosterDraftStatus("修正中")
                toast({
                  title: "修正依頼を送信",
                  description: "デザイン業者に修正を依頼しました",
                })
                setShowFirstDraftModal(false)
              }}
            >
              修正依頼を送信
            </Button>
            <Button
              onClick={() => {
                setPosterDraftStatus("校了")
                setProjectStatusProduction("校正中")
                toast({
                  title: "初稿を承認しました",
                  description: "店舗への送付準備が完了しました",
                })
                setShowFirstDraftModal(false)
              }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              承認する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFinalCheckModal} onOpenChange={setShowFinalCheckModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              最終確認・Wチェック
            </DialogTitle>
            <DialogDescription>インサイトと事務管理課でWチェック、入力データとポスター内容の完全突合</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">JASデータ</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">日付:</span>
                    <span className="font-medium">12/25</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">店舗:</span>
                    <span className="font-medium">オメガホール</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">景品:</span>
                    <span className="font-medium">商品券10万円分</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">最終ポスター</h4>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border aspect-[3/4]">
                  <div className="text-center space-y-3">
                    <h3 className="text-xl font-bold">大抽選会</h3>
                    <p className="text-lg font-semibold">12/25開催</p>
                    <p className="text-base">オメガホール</p>
                    <p className="text-sm">商品券10万円分</p>
                  </div>
                </div>
              </div>
            </div>

            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">AI最終チェック完了</AlertTitle>
              <AlertDescription className="text-green-700">
                すべてのデータが一致しています。問題は検出されませんでした。
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="insight-check" className="w-4 h-4" />
                <label htmlFor="insight-check" className="text-sm">
                  インサイトチーム確認済み
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="admin-check" className="w-4 h-4" />
                <label htmlFor="admin-check" className="text-sm">
                  事務管理課確認済み
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalCheckModal(false)}>
              閉じる
            </Button>
            <Button
              onClick={() => {
                setOrderStatus("finalized")
                setProjectStatusProduction("完了")
                toast({
                  title: "最終承認完了",
                  description: "顧客へポスターデータを送付しました",
                })
                setShowFinalCheckModal(false)
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              顧客へ送付
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDMOrderModal} onOpenChange={setShowDMOrderModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>DM投函依頼</DialogTitle>
            <DialogDescription>宛名データを添付してデザイン業者へ依頼</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">依頼先</label>
              <Input value="デザイン業者B" readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">初稿希望日</label>
              <Input
                type="date"
                value={dmFirstDraftDate}
                onChange={(e) => setDmFirstDraftDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">イメージ画像</label>
              {!dmImageUploaded ? (
                <div 
                  className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => setDmImageUploaded(true)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">クリックして画像をアップロード</p>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">dm_image_v1.jpg</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setDmImageUploaded(false)}
                  >
                    <XCircle className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">宛名データ</label>
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">customer_addresses_202412.xlsx</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">件名</label>
              <Input value="【JAS】DM投函のご依頼" readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">本文（AI自動生成）</label>
              <textarea
                className="w-full min-h-[200px] p-3 border rounded-md"
                readOnly
                value={`デザイン業者B 御中

いつもお世話になっております。
JASイベント管理チームです。

下記の内容でDM投函をお願いいたします。

【案件情報】
- イベント名: オメガホール大抽選会
- 投函予定日: 2024年12月20日
- 対象件数: 約500件
- 添付: 宛名データ（customer_addresses_202412.xlsx）
${dmImageUploaded ? "- 添付: イメージ画像（dm_image_v1.jpg）" : ""}

【納期】
初稿: ${dmFirstDraftDate || "2024-12-10"}まで

【注意事項】
- 宛名データはパスワード保護されています
- パスワードは別途メールでお送りいたします
- 投函完了後、完了報告をお願いいたします

ご不明点がございましたらお気軽にお問い合わせください。
よろしくお願いいたします。`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDMOrderModal(false)}>
              キャンセル
            </Button>
            <Button
              onClick={() => {
                setShowDMOrderModal(false)
                toast({
                  title: "DM投函依頼を送信しました",
                  description: "パスワードメールも自動送信されました",
                })
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              送信する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
