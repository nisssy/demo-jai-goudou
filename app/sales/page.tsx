"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  ListOrdered,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  User,
  Edit2,
  Plus,
  ChevronLeft,
  Trash2,
  Download,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProjectStepper } from "@/components/project-stepper"
import { Project, HallQuote, QuoteItem, Employee, Company, Hall, GoudouRole } from "@/types"
import { useProject } from "@/contexts/project-context"
import { ProjectListFiltersView } from "@/components/screens/project-list-filters.view"
import { ProductTypeSelectionView } from "@/components/screens/product-type-selection.view"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Screen = "list" | "registration" | "add-product" | "proposal" | "production" | "lottery" | "accounting"
type PrizeItem = { rank: string; name: string; quantity: string; prizeId?: string }

// 事前定義の景品セット（景品マスタID参照。name は選択時にマスタから解決）
const PRIZE_SETS_BY_ID: { id: string; label: string; items: { prizeId: string; rank: string; quantity: string }[] }[] = [
  { id: "newyear", label: "年末大抽選会セット", items: [{ prizeId: "PRZ001", rank: "A賞", quantity: "1" }, { prizeId: "PRZ002", rank: "B賞", quantity: "3" }, { prizeId: "PRZ003", rank: "C賞", quantity: "50" }] },
  { id: "spring", label: "春のキャンペーンセット", items: [{ prizeId: "PRZ004", rank: "1等", quantity: "1" }, { prizeId: "PRZ005", rank: "2等", quantity: "5" }, { prizeId: "PRZ006", rank: "3等", quantity: "100" }] },
  { id: "gw", label: "ゴールデンウィークセット", items: [{ prizeId: "PRZ007", rank: "特賞", quantity: "2" }, { prizeId: "PRZ008", rank: "A賞", quantity: "10" }, { prizeId: "PRZ009", rank: "B賞", quantity: "30" }, { prizeId: "PRZ010", rank: "参加賞", quantity: "500" }] },
  { id: "summer", label: "夏祭りセット", items: [{ prizeId: "PRZ011", rank: "大賞", quantity: "1" }, { prizeId: "PRZ012", rank: "A賞", quantity: "5" }, { prizeId: "PRZ013", rank: "B賞", quantity: "100" }] },
  { id: "respect", label: "敬老の日セット", items: [{ prizeId: "PRZ014", rank: "特別賞", quantity: "3" }, { prizeId: "PRZ015", rank: "A賞", quantity: "20" }, { prizeId: "PRZ016", rank: "参加賞", quantity: "200" }] },
  { id: "halloween", label: "ハロウィンセット", items: [{ prizeId: "PRZ017", rank: "1等", quantity: "2" }, { prizeId: "PRZ018", rank: "2等", quantity: "20" }, { prizeId: "PRZ019", rank: "参加賞", quantity: "300" }] },
  { id: "christmas", label: "クリスマスセット", items: [{ prizeId: "PRZ022", rank: "特賞", quantity: "1" }, { prizeId: "PRZ020", rank: "A賞", quantity: "10" }, { prizeId: "PRZ021", rank: "B賞", quantity: "50" }] },
  { id: "newcustomer", label: "新規顧客獲得セット", items: [{ prizeId: "PRZ012", rank: "A賞", quantity: "5" }, { prizeId: "PRZ023", rank: "B賞", quantity: "30" }, { prizeId: "PRZ024", rank: "C賞", quantity: "100" }] },
  { id: "repeat", label: "リピーター感謝セット", items: [{ prizeId: "PRZ025", rank: "感謝賞", quantity: "20" }, { prizeId: "PRZ026", rank: "特別賞", quantity: "50" }] },
  { id: "simple", label: "シンプル1賞セット", items: [{ prizeId: "PRZ001", rank: "A賞", quantity: "1" }] },
]
type Role = "sales" | "admin"

const VALID_SCREENS: Screen[] = ["list", "registration", "add-product", "proposal", "production", "lottery", "accounting"]

function parseScreen(s: string | null): Screen {
  if (s && VALID_SCREENS.includes(s as Screen)) return s as Screen
  return "list"
}

function SalesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    setCurrentGoudouRole,
    projects,
    setProjects,
    companies,
    halls,
    employees,
    prizeVendors,
    prizes,
    tradingPartners,
    getProjectById,
    createProject,
    updateProject,
    addPosterRequest,
    addDesignRequest,
    getPosterRequestsByProject,
    getDesignRequestsByProjectAndType,
    getPosterRequestById,
    getDesignRequestById,
    addPosterRequestComment,
  } = useProject()

  const screen = parseScreen(searchParams.get("screen"))
  const projectId = searchParams.get("projectId")
  const editId = searchParams.get("editId")

  const selectedProject = projectId ? getProjectById(projectId) : null
  const addingProductProject = screen === "add-product" && projectId ? getProjectById(projectId) : null
  const editingProjectId = editId

  useEffect(() => {
    setCurrentGoudouRole("SalesInsight")
  }, [setCurrentGoudouRole])

  const navigateTo = useCallback(
    (newScreen: Screen, opts?: { projectId?: string | null; editId?: string | null }) => {
      const p = new URLSearchParams()
      p.set("screen", newScreen)
      if (opts?.projectId) p.set("projectId", opts.projectId)
      else if (projectId && (newScreen === "proposal" || newScreen === "production" || newScreen === "lottery" || newScreen === "accounting"))
        p.set("projectId", projectId)
      if (opts?.editId) p.set("editId", opts.editId)
      router.push(`/sales?${p.toString()}`)
    },
    [router, projectId]
  )

  const [currentRole, setCurrentRole] = useState<Role>("sales")
  const [showNotifications, setShowNotifications] = useState(false)
  const { toast } = useToast()

  // 案件検索フィルター（営業・インサイトの案件一覧用）
  const [searchProjectNumber, setSearchProjectNumber] = useState("")
  const [searchProjectName, setSearchProjectName] = useState("")
  const [selectedSalesPersonId, setSelectedSalesPersonId] = useState<string | null>(null)
  const [salesPersonSearchOpen, setSalesPersonSearchOpen] = useState(false)
  const [salesPersonSearchQuery, setSalesPersonSearchQuery] = useState("")
  const [searchDateMode, setSearchDateMode] = useState<"execution" | "created">("created")
  const [searchDateFrom, setSearchDateFrom] = useState("")
  const [searchDateTo, setSearchDateTo] = useState("")
  const [searchCategory, setSearchCategory] = useState<string | null>(null)
  const [searchEventType, setSearchEventType] = useState<string | null>(null)
  const [eventTypeSearchOpen, setEventTypeSearchOpen] = useState(false)
  const [eventTypeSearchQuery, setEventTypeSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchType, setSearchType] = useState<"hall" | "company">("company")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedHallName, setSelectedHallName] = useState<string | null>(null)
  const [selectedCompanyIdForFilter, setSelectedCompanyIdForFilter] = useState<string | null>(null)

  // 商材追加フロー: カテゴリ・イベント区分選択後に提案画面へ
  const [addProductCategory, setAddProductCategory] = useState("")
  const [addProductEventType, setAddProductEventType] = useState("")
  const [addProductEventTypeSearchOpen, setAddProductEventTypeSearchOpen] = useState(false)
  const [addProductEventTypeSearchQuery, setAddProductEventTypeSearchQuery] = useState("")

  // 案件作成時に商材（合同抽選会）を同時に追加するか
  const [registrationAddProduct, setRegistrationAddProduct] = useState(false)
  const [registrationProductEventStart, setRegistrationProductEventStart] = useState("")
  const [registrationProductEventEnd, setRegistrationProductEventEnd] = useState("")

  // 案件作成・編集: 法人・ホールのマスタ検索用
  const [regCompanySearchOpen, setRegCompanySearchOpen] = useState(false)
  const [regCompanySearchQuery, setRegCompanySearchQuery] = useState("")
  const [regHallSearchOpen, setRegHallSearchOpen] = useState(false)
  const [regHallSearchQuery, setRegHallSearchQuery] = useState("")

  // 新規案件: 商材情報入力のカテゴリ・イベント区分
  const [regNewCategory, setRegNewCategory] = useState("")
  const [regNewEventType, setRegNewEventType] = useState("")
  // 商材情報入力: 複数ホール選択でどの行のPopoverが開いているか
  const [regHallSearchOpenForIndex, setRegHallSearchOpenForIndex] = useState<number | null>(null)
  // 商材情報入力: 行ごとの法人ID（法人から検索・選択用）。hallNames と同長
  const [regRowCompanyIds, setRegRowCompanyIds] = useState<string[]>([""])
  // 商材情報入力: どの行の法人検索Popoverが開いているか
  const [regCompanySearchOpenForIndex, setRegCompanySearchOpenForIndex] = useState<number | null>(null)

  // Screen 1: Proposal State
  const [companyName, setCompanyName] = useState("")
  const [hallNames, setHallNames] = useState<string[]>([""])
  const [hallCompanyIds, setHallCompanyIds] = useState<string[]>([""])
  const [hallOpens, setHallOpens] = useState<boolean[]>([])
  const [companyOpens, setCompanyOpens] = useState<boolean[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [salesPersonId, setSalesPersonId] = useState("")
  const [insightPersonId, setInsightPersonId] = useState("")
  const [eventStartDate, setEventStartDate] = useState("")
  const [eventEndDate, setEventEndDate] = useState("")
  const [area, setArea] = useState("")
  const [dmMailing, setDmMailing] = useState<"yes" | "no">("no")
  const [projectName, setProjectName] = useState("")
  const [requestDate, setRequestDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [eventType, setEventType] = useState("")
  const [prizeInfo, setPrizeInfo] = useState<PrizeItem[]>([
    { rank: "A賞", name: "", quantity: "" }
  ])
  const [selectedPrizeSetId, setSelectedPrizeSetId] = useState<string>("")
  const [prizeMasterAddOpen, setPrizeMasterAddOpen] = useState(false)
  const [prizeMasterSearchQuery, setPrizeMasterSearchQuery] = useState("")
  const [dmOrderCount, setDmOrderCount] = useState("")
  const [syncLoading, setSyncLoading] = useState(false)

  const [quoteGenerated, setQuoteGenerated] = useState(false)
  const [projectStatus, setProjectStatus] = useState<Project["status"]>("before-proposal")
  const [projectReadingCertainty, setProjectReadingCertainty] = useState<Project["readingCertainty"] | "">("")
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfOutputHallName, setPdfOutputHallName] = useState<string | null>(null)
  const [pdfStep, setPdfStep] = useState<"template" | "preview">("template")
  const [pdfEditableItems, setPdfEditableItems] = useState<QuoteItem[]>([])
  const [pdfEditingItems, setPdfEditingItems] = useState(false)
  const pdfEditableItemsBackupRef = useRef<QuoteItem[] | null>(null)
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

  // 見積書PDFモーダル用のデフォルト項目（1セットのみ）
  const PDF_DEFAULT_QUOTE_ITEMS: QuoteItem[] = [
    { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 50000, included: true },
    { id: 2, name: "ポスター印刷", quantity: 50, unitPrice: 2000, included: true },
    { id: 3, name: "DM発送代行", quantity: 1, unitPrice: 150000, included: true },
    { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 30000, included: true },
  ]

  // Screen 2: Production State
  const [aiProofing, setAiProofing] = useState(false)
  const [proofingComplete, setProofingComplete] = useState(false)
  const [showDateError, setShowDateError] = useState(false)
  const [showFontError, setShowFontError] = useState(false)

  const [showPosterOrderModal, setShowPosterOrderModal] = useState(false)
  /** ポスター発注モーダルで選択した発注先（取引先マスタのID。印刷会社のみ） */
  const [posterOrderVendorId, setPosterOrderVendorId] = useState<string>("")
  /** デザイン依頼（ポスター/DM/当選者リスト）詳細・コメントモーダルで表示する依頼ID */
  const [designRequestDetailId, setDesignRequestDetailId] = useState<string | null>(null)
  const [designRequestCommentText, setDesignRequestCommentText] = useState("")
  /** DM作成依頼モーダルで選択したデザイン会社（取引先マスタのID。デザイン業のみ） */
  const [dmCreateVendorId, setDmCreateVendorId] = useState<string>("")
  const [showDMCreateModal, setShowDMCreateModal] = useState(false)
  /** 制作進行で表示するポスター依頼のコメント入力（プレビューセクション内で使用） */
  const [posterCommentText, setPosterCommentText] = useState("")
  /** 顧客（ホール）へポスター確認用メール送信済みの案件ID */
  const [posterSentToCustomerProjectIds, setPosterSentToCustomerProjectIds] = useState<string[]>([])
  const [showPosterOrderDocumentModal, setShowPosterOrderDocumentModal] = useState(false)
  /** 顧客（ホール）へポスター確認メール送信モーダル */
  const [showPosterConfirmEmailModal, setShowPosterConfirmEmailModal] = useState(false)
  const [posterConfirmToType, setPosterConfirmToType] = useState<"company" | "hall">("hall")
  const [posterConfirmHallName, setPosterConfirmHallName] = useState<string>("")
  const [posterConfirmCc, setPosterConfirmCc] = useState<string[]>([])
  const [posterConfirmMessage, setPosterConfirmMessage] = useState<string>("")
  /** ポスターの共有方法: 圧縮して添付 / ストレージURL */
  const [posterConfirmShareMethod, setPosterConfirmShareMethod] = useState<"compress" | "storage_url">("compress")
  /** ポスター発注メールに発注書を添付するか */
  const [posterOrderAttachOrderDoc, setPosterOrderAttachOrderDoc] = useState(true)

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
    setCompanyName(project.companyName)
    const projectHallNames = project.hallNames.length >= 1 ? project.hallNames : [""]
    setHallNames(projectHallNames)
    const projectRegRowCompanyIds = projectHallNames.map((hallName) => {
      if (!hallName) return ""
      const hall = halls.find((h) => h.name === hallName)
      return hall?.companyId || ""
    })
    setRegRowCompanyIds(projectRegRowCompanyIds)
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
    setInsightPersonId(project.insightPersonId || "")
    setEventStartDate(project.eventStartDate)
    setEventEndDate(project.eventEndDate)
    setArea(project.area)
    setProjectStatus(project.status)
    setProjectReadingCertainty(project.readingCertainty ?? "")
    setPrizeInfo(
      project.prizeInfo && project.prizeInfo.length > 0
        ? project.prizeInfo
        : [{ rank: "A賞", name: "", quantity: "", prizeId: undefined }]
    )

    if (project.status !== "before-proposal") {
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

    navigateTo("proposal", { projectId: project.id })
  }

  const fillFormFromProject = useCallback(
    (project: Project) => {
      setCompanyName(project.companyName)
      setProjectName(project.projectName || "")
      setRequestDate(project.createdAt || new Date().toISOString().slice(0, 10))
      const projectHallNames = project.hallNames.length >= 1 ? project.hallNames : [""]
      setHallNames(projectHallNames)
      const projectRegRowCompanyIds = projectHallNames.map((hallName) => {
        if (!hallName) return ""
        const hall = halls.find((h) => h.name === hallName)
        return hall?.companyId || ""
      })
      setRegRowCompanyIds(projectRegRowCompanyIds)
      const projectHallCompanyIds = projectHallNames.map((hallName) => {
        if (!hallName) return ""
        const hall = halls.find((h) => h.name === hallName)
        return hall?.companyId || ""
      })
      setHallCompanyIds(projectHallCompanyIds)
      setSelectedCompanyId(projectHallCompanyIds[0] || "")
      setSalesPersonId(project.salesPersonId)
      setInsightPersonId(project.insightPersonId || "")
      setEventStartDate(project.eventStartDate)
      setEventEndDate(project.eventEndDate)
      setArea(project.area)
      setDmMailing(project.dmMailing ?? "no")
      setProjectStatus(project.status)
      setProjectReadingCertainty(project.readingCertainty ?? "")
      setPrizeInfo(
        project.prizeInfo && project.prizeInfo.length > 0
          ? project.prizeInfo
          : [{ rank: "A賞", name: "", quantity: "", prizeId: undefined }]
      )
      if (project.status !== "before-proposal" && project.hallQuotes) {
        const quotesMap: { [hallName: string]: QuoteItem[] } = {}
        const percentagesMap: { [hallName: string]: number } = {}
        project.hallQuotes.forEach((hallQuote) => {
          quotesMap[hallQuote.hallName] = hallQuote.quoteItems
          if (hallQuote.percentage !== undefined) percentagesMap[hallQuote.hallName] = hallQuote.percentage
        })
        setHallQuotes(quotesMap)
        setHallPercentages(percentagesMap)
        setQuoteGenerated(true)
        const totalItemsMap: { [itemId: number]: string } = {}
        defaultQuoteItems.forEach((item) => {
          if (item.id === 2) {
            const firstHallQuote = project.hallQuotes?.[0]
            if (firstHallQuote) {
              const hallItem = firstHallQuote.quoteItems.find((qi) => qi.id === item.id)
              if (hallItem && hallItem.unitPrice > 0) {
                setPosterPrintUnitPrice(hallItem.unitPrice.toString())
                let totalQuantity = 0
                project.hallQuotes?.forEach((hq) => {
                  const hItem = hq.quoteItems.find((qi) => qi.id === item.id)
                  if (hItem) totalQuantity += hItem.quantity
                })
                if (totalQuantity > 0) {
                  setPosterPrintQuantity(totalQuantity.toString())
                  totalItemsMap[item.id] = String(totalQuantity * hallItem.unitPrice)
                }
              }
            }
          } else {
            let totalItemAmount = 0
            project.hallQuotes?.forEach((hq) => {
              const hallItem = hq.quoteItems.find((qi) => qi.id === item.id)
              if (hallItem && hq.percentage && hq.percentage > 0) {
                const itemTotal = hallItem.unitPrice * hallItem.quantity
                const itemTotalAmount = Math.floor((itemTotal * 100) / hq.percentage)
                if (itemTotalAmount > totalItemAmount) totalItemAmount = itemTotalAmount
              }
            })
            if (totalItemAmount > 0) totalItemsMap[item.id] = String(totalItemAmount)
          }
        })
        setTotalQuoteItems(totalItemsMap)
      } else {
        setQuoteGenerated(false)
        setHallQuotes({})
        setHallPercentages({})
        setTotalQuoteItems({
          1: "50000",
          3: "150000",
          4: "30000",
        })
        setPosterPrintQuantity("50")
        setPosterPrintUnitPrice("2000")
      }
    },
    [halls, defaultQuoteItems]
  )

  useEffect(() => {
    if (screen === "registration" && editId) {
      const project = getProjectById(editId)
      if (project) {
        setCompanyName(project.companyName)
        setProjectName(project.projectName || "")
        setRequestDate(project.createdAt || new Date().toISOString().slice(0, 10))
        const projectHallNames = project.hallNames.length >= 1 ? project.hallNames : [""]
        setHallNames(projectHallNames)
        const projectRegRowCompanyIds = projectHallNames.map((hallName) => {
          if (!hallName) return ""
          const hall = halls.find((h) => h.name === hallName)
          return hall?.companyId || ""
        })
        setRegRowCompanyIds(projectRegRowCompanyIds)
        const projectHallCompanyIds = projectHallNames.map((hallName) => {
          if (!hallName) return ""
          const hall = halls.find((h) => h.name === hallName)
          return hall?.companyId || ""
        })
        setHallCompanyIds(projectHallCompanyIds)
        setSelectedCompanyId(projectHallCompanyIds[0] || "")
        setSalesPersonId(project.salesPersonId)
        setInsightPersonId(project.insightPersonId || "")
        setEventStartDate(project.eventStartDate)
        setEventEndDate(project.eventEndDate)
        setArea(project.area)
        setDmMailing(project.dmMailing ?? "no")
        setProjectStatus(project.status)
        setProjectReadingCertainty(project.readingCertainty ?? "")
        setPrizeInfo(
          project.prizeInfo && project.prizeInfo.length > 0
            ? project.prizeInfo
            : [{ rank: "A賞", name: "", quantity: "", prizeId: undefined }]
        )
      }
    }
  }, [screen, editId, getProjectById, halls])

  useEffect(() => {
    if (screen === "proposal" && selectedProject) fillFormFromProject(selectedProject)
  }, [screen, selectedProject?.id])

  // 見積書PDFモーダルを開いたとき、対象ホールの見積項目で編集用stateを初期化（なければデフォルト1セット）。DM投函無の場合はDM発送代行を除外
  useEffect(() => {
    if (showPdfModal && pdfOutputHallName) {
      const current = hallQuotes[pdfOutputHallName]
      const baseItems = current && current.length > 0 ? current : PDF_DEFAULT_QUOTE_ITEMS
      const filtered = dmMailing === "yes" ? baseItems : baseItems.filter((i) => i.id !== 3)
      setPdfEditableItems(filtered.map((i) => ({ ...i })))
      setPdfStep("template")
      setPdfEditingItems(false)
      pdfEditableItemsBackupRef.current = null
    }
  }, [showPdfModal, pdfOutputHallName, dmMailing])

  useEffect(() => {
    if (showPosterOrderModal && !posterOrderVendorId) {
      const first = (tradingPartners ?? []).find((t) => t.industry === "printing")
      if (first) setPosterOrderVendorId(first.id)
    }
  }, [showPosterOrderModal, posterOrderVendorId, tradingPartners])

  useEffect(() => {
    if (showDMCreateModal && !dmCreateVendorId) {
      const first = (tradingPartners ?? []).find((t) => t.industry === "design")
      if (first) setDmCreateVendorId(first.id)
    }
  }, [showDMCreateModal, dmCreateVendorId, tradingPartners])

  const handleNewProject = () => {
    setProjectName("")
    setRequestDate(new Date().toISOString().slice(0, 10))
    setRegistrationAddProduct(false)
    setRegistrationProductEventStart("")
    setRegistrationProductEventEnd("")
    setCompanyName("")
    setHallNames([""])
    setRegRowCompanyIds([""])
    setHallCompanyIds([""])
    setHallOpens([])
    setCompanyOpens([])
    setSelectedCompanyId("")
    setSalesPersonId("")
    setInsightPersonId("")
    setEventStartDate("")
    setEventEndDate("")
    setArea("")
    setQuoteGenerated(false)
    setProjectStatus("before-proposal")
    setProjectReadingCertainty("")
    setHallQuotes({})
    setHallPercentages({})
    setTotalQuoteItems({
      1: "50000", // ポスターデザイン
      3: "150000", // DM発送代行
      4: "30000", // 抽選システム利用料
    })
    setPosterPrintQuantity("50")
    setPosterPrintUnitPrice("2000")
    setRegistrationAddProduct(true)
    const t = new Date().toISOString().slice(0, 10)
    setRegistrationProductEventStart(t)
    setRegistrationProductEventEnd(t)
    setRegNewCategory("ポイント")
    setRegNewEventType("合同抽選会")
    setPrizeInfo([{ rank: "A賞", name: "", quantity: "" }])
    setSelectedPrizeSetId("")
    navigateTo("registration")
  }

  const handleBackFromRegistration = () => {
    router.push("/sales")
  }

  const handleSaveProjectFromRegistration = () => {
    const validHallNames = hallNames.filter((h) => h.trim() !== "")
    if (!companyName.trim()) {
      toast({ title: "入力エラー", description: "法人名を入力してください", variant: "destructive" })
      return
    }
    if (validHallNames.length < 1) {
      toast({ title: "入力エラー", description: "ホール名を1件以上入力してください", variant: "destructive" })
      return
    }
    if (editingProjectId && eventStartDate && eventEndDate && eventStartDate > eventEndDate) {
      toast({ title: "入力エラー", description: "イベント終了日は開始日以降を指定してください", variant: "destructive" })
      return
    }
    if (editingProjectId && eventStartDate && eventEndDate && eventStartDate > eventEndDate) {
      toast({ title: "入力エラー", description: "イベント終了日は開始日以降を指定してください", variant: "destructive" })
      return
    }

    if (editingProjectId) {
      updateProject(editingProjectId, {
        projectName: projectName.trim() || undefined,
        companyName: companyName.trim(),
        hallNames: validHallNames,
        createdAt: requestDate,
        salesPersonId,
        insightPersonId: insightPersonId || undefined,
        eventStartDate: eventStartDate || undefined,
        eventEndDate: eventEndDate || undefined,
        area: area || undefined,
        dmMailing: dmMailing || undefined,
      })
      toast({ title: "案件を更新しました。商材・見積の設定に進みます。" })
      navigateTo("proposal", { projectId: editingProjectId })
      return
    } else {
      const today = new Date().toISOString().slice(0, 10)
      const defaultQuoteItems = [
        { id: 1, name: "ポスターデザイン", quantity: 1, unitPrice: 50000, included: true },
        { id: 2, name: "ポスター印刷", quantity: 50, unitPrice: 2000, included: true },
        { id: 3, name: "DM発送代行", quantity: 1000, unitPrice: 150, included: true },
        { id: 4, name: "抽選システム利用料", quantity: 1, unitPrice: 30000, included: true },
      ]
      const hallQuotes =
        validHallNames.length > 0
          ? validHallNames.map((hallName) => ({
              hallName,
              quoteItems: defaultQuoteItems,
            }))
          : undefined
      const created = createProject({
        projectNumber: undefined,
        projectName: projectName.trim() || undefined,
        companyName: companyName.trim(),
        hallNames: validHallNames,
        eventStartDate: today,
        eventEndDate: today,
        area: area || "",
        status: "before-proposal",
        dmMailing: dmMailing || undefined,
        budget: hallQuotes
          ? String(
              hallQuotes.reduce(
                (sum, hq) =>
                  sum +
                  hq.quoteItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
                0
              )
            )
          : "0",
        createdAt: requestDate,
        salesPersonId,
        insightPersonId: insightPersonId || undefined,
        hallQuotes,
      })
      toast({
        title: "案件を作成しました",
        description: "商材・見積・設定画面で詳細を入力してください。",
      })
      navigateTo("proposal", { projectId: created.id })
      return
    }
    router.push("/sales")
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
    if (eventStartDate > eventEndDate) {
      toast({
        title: "⚠️ 入力エラー",
        description: "イベント終了日は開始日以降を指定してください",
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
    const totalAmount =
      Object.entries(totalQuoteItems).reduce(
        (sum, [key, amount]) =>
          sum + (dmMailing === "no" && key === "3" ? 0 : parseFloat(amount) || 0),
        0
      ) + posterPrintAmount

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
      // 各項目の全体金額から、割合で各ホールの金額を計算（DM投函無の場合はDM発送代行を除外）
      const hallQuoteItems: QuoteItem[] = defaultQuoteItems
        .filter((item) => dmMailing === "yes" || item.id !== 3)
        .map((item) => {
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
      const created = createProject({
        projectNumber: undefined,
        companyName,
        hallNames: validHallNames,
        eventStartDate,
        eventEndDate,
        area,
        status: "proposing",
        readingCertainty: (projectReadingCertainty === "A" || projectReadingCertainty === "B" || projectReadingCertainty === "C") ? projectReadingCertainty : undefined,
        dmMailing: dmMailing || undefined,
        budget: "",
        createdAt: new Date().toISOString().split("T")[0],
        salesPersonId,
        insightPersonId: insightPersonId || undefined,
        hallQuotes: hallQuotesArray,
      })
      navigateTo("proposal", { projectId: created.id })
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
      updateProject(selectedProject.id, {
        companyName,
        hallNames: validHallNames,
        eventStartDate,
        eventEndDate,
        area,
        salesPersonId,
        insightPersonId: insightPersonId || undefined,
        hallQuotes: hallQuotesArray,
        status: projectStatus,
        readingCertainty: projectStatus === "order-received" ? undefined : (projectReadingCertainty === "A" || projectReadingCertainty === "B" || projectReadingCertainty === "C" ? projectReadingCertainty : undefined),
        dmMailing: dmMailing || undefined,
        prizeInfo: prizeInfo.length > 0 ? prizeInfo : undefined,
      })
    }

    toast({
      title: "✅ 見積もり作成完了",
      description: "各ホールごとに見積内容が生成されました",
    })
  }

  const handleConfirmProject = () => {
    setProjectStatus("order-received")

    if (selectedProject) {
      updateProject(selectedProject.id, { status: "order-received" })
    }

    toast({
      title: "✅ 受注に更新",
      description: "ステータスを受注に更新しました",
    })
  }

  const handleStatusChange = (newStatus: Project["status"]) => {
    setProjectStatus(newStatus)
    if (selectedProject) {
      const isBeforeOrder = newStatus === "before-proposal" || newStatus === "proposing"
      updateProject(selectedProject.id, {
        status: newStatus,
        readingCertainty: isBeforeOrder && (projectReadingCertainty === "A" || projectReadingCertainty === "B" || projectReadingCertainty === "C") ? projectReadingCertainty : undefined,
      })
    }
  }

  const handleReadingCertaintyChange = (value: Project["readingCertainty"] | "") => {
    setProjectReadingCertainty(value)
    if (selectedProject && (projectStatus === "before-proposal" || projectStatus === "proposing")) {
      updateProject(selectedProject.id, { readingCertainty: value === "A" || value === "B" || value === "C" ? value : undefined })
    }
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
    return quoteItems
      .filter((item) => item.included && (dmMailing === "yes" || item.id !== 3))
      .reduce((sum, item) => {
        if (item.id === 2) return sum + item.quantity * item.unitPrice
        return sum + item.unitPrice
      }, 0)
  }

  const calculateAllQuotesTotal = () => {
    return Object.keys(hallQuotes).reduce((total, hallName) => total + calculateQuoteTotal(hallName), 0)
  }

  const getStatusLabel = (status: Project["status"]) => {
    const labels: Record<Project["status"], string> = {
      "before-proposal": "提案前",
      proposing: "提案中",
      "order-received": "受注",
    }
    return labels[status]
  }

  const getStatusVariant = (status: Project["status"]) => {
    const variants: Record<Project["status"], "default" | "secondary" | "outline" | "destructive"> = {
      "before-proposal": "outline",
      proposing: "secondary",
      "order-received": "default",
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
    { id: "proposal", label: "商材・見積・設定" },
    { id: "production", label: "制作進行・AI校正" },
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
      <div className="flex-1 flex flex-col">
        {/* Stepper - 案件作成/編集/商材追加選択では非表示 */}
        {screen !== "list" && screen !== "registration" && screen !== "add-product" && (
          <ProjectStepper
            steps={steps}
            currentStep={screen}
            onStepClick={(id) => navigateTo(id as Screen)}
          />
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {screen === "list" && (
            <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
              <div className="border-b border-slate-100 mb-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">案件一覧</h2>
                  <button
                    type="button"
                    onClick={handleNewProject}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    新規案件作成
                  </button>
                </div>
              </div>

              <ProjectListFiltersView
                searchProjectNumber={searchProjectNumber}
                onSearchProjectNumberChange={setSearchProjectNumber}
                searchProjectName={searchProjectName}
                onSearchProjectNameChange={setSearchProjectName}
                selectedSalesPersonId={selectedSalesPersonId}
                onSelectedSalesPersonIdChange={setSelectedSalesPersonId}
                salesPersonSearchOpen={salesPersonSearchOpen}
                onSalesPersonSearchOpenChange={setSalesPersonSearchOpen}
                salesPersonSearchQuery={salesPersonSearchQuery}
                onSalesPersonSearchQueryChange={setSalesPersonSearchQuery}
                searchDateMode={searchDateMode}
                onSearchDateModeChange={setSearchDateMode}
                searchDateFrom={searchDateFrom}
                onSearchDateFromChange={setSearchDateFrom}
                searchDateTo={searchDateTo}
                onSearchDateToChange={setSearchDateTo}
                searchCategory={searchCategory}
                onSearchCategoryChange={setSearchCategory}
                searchEventType={searchEventType}
                onSearchEventTypeChange={setSearchEventType}
                eventTypeSearchOpen={eventTypeSearchOpen}
                onEventTypeSearchOpenChange={setEventTypeSearchOpen}
                eventTypeSearchQuery={eventTypeSearchQuery}
                onEventTypeSearchQueryChange={setEventTypeSearchQuery}
                searchOpen={searchOpen}
                onSearchOpenChange={setSearchOpen}
                searchType={searchType}
                onSearchTypeChange={setSearchType}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                selectedHallName={selectedHallName}
                onSelectedHallNameChange={setSelectedHallName}
                selectedCompanyId={selectedCompanyIdForFilter}
                onSelectedCompanyIdChange={setSelectedCompanyIdForFilter}
                searchHalls={(q, companyId) =>
                  halls.filter(
                    (h) =>
                      h.name.toLowerCase().includes(q.toLowerCase()) &&
                      (companyId == null || h.companyId === companyId)
                  )
                }
                searchCompanies={(q) => companies.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))}
                getCompanyById={(id) => companies.find((c) => c.id === id) ?? null}
                searchEmployees={(q) => employees.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()))}
                getEmployeeById={(id) => employees.find((e) => e.id === id) ?? null}
              />

              {(() => {
                const filtered = projects.filter((p) => {
                  const pn = p.projectNumber ?? p.id
                  const pName = p.projectName ?? (p.hallNames[0] ? `${p.companyName} - ${p.hallNames[0]}` : p.companyName)
                  const company = companies.find((c) => c.name === p.companyName)
                  if (searchProjectNumber && !pn.toLowerCase().includes(searchProjectNumber.toLowerCase())) return false
                  if (searchProjectName && !pName.toLowerCase().includes(searchProjectName.toLowerCase())) return false
                  if (selectedSalesPersonId && p.salesPersonId !== selectedSalesPersonId) return false
                  if (searchDateFrom) {
                    const date = searchDateMode === "created" ? p.createdAt : p.eventStartDate
                    if (date < searchDateFrom) return false
                  }
                  if (searchDateTo) {
                    const date = searchDateMode === "created" ? p.createdAt : p.eventEndDate
                    if (date > searchDateTo) return false
                  }
                  if (selectedHallName && !p.hallNames.includes(selectedHallName)) return false
                  if (selectedCompanyIdForFilter && company?.id !== selectedCompanyIdForFilter) return false
                  return true
                })
                return filtered.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    {searchProjectNumber || searchProjectName || selectedSalesPersonId || searchDateFrom || searchDateTo || selectedHallName || selectedCompanyIdForFilter
                      ? "検索結果が見つかりませんでした"
                      : "案件がありません"}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filtered.map((project) => {
                    const projectNumber = project.projectNumber ?? project.id
                    const displayName =
                      project.projectName ||
                      (project.hallNames.length > 0 ? `${project.companyName} - ${project.hallNames[0]}` : project.companyName)
                    const salesPerson = employees.find((e) => e.id === project.salesPersonId)
                    const salesPersonName = salesPerson?.name ?? "-"
                    const firstHallName = project.hallNames[0] ?? "-"
                    const company = companies.find((c) => c.name === project.companyName)
                    const companyId = company?.id ?? "-"
                    return (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="mb-4 pb-4 border-b-2 border-slate-300">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="flex flex-col gap-1 min-w-0 w-full">
                                  <h2 className="text-3xl font-bold text-slate-900 break-words">{displayName}</h2>
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                                      案件No: {projectNumber}
                                    </span>
                                    <Badge variant="outline" className="whitespace-nowrap">
                                      1件の商材
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  <span>
                                    法人名: <span className="font-medium text-slate-900">{project.companyName}</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>
                                    法人ID: <span className="font-medium text-slate-900">{companyId}</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>
                                    ホール名:{" "}
                                    <span className="font-medium text-slate-900">{firstHallName}</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>
                                    担当営業: <span className="font-medium text-slate-900">{salesPersonName}</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    依頼日: <span className="font-medium text-slate-900">{project.createdAt}</span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => navigateTo("registration", { editId: project.id })}
                                >
                                  <Edit2 className="h-4 w-4" />
                                  案件を編集
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => {
                                    setAddProductCategory("")
                                    setAddProductEventType("")
                                    setAddProductEventTypeSearchQuery("")
                                    navigateTo("add-product", { projectId: project.id })
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                  商材を追加
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div
                              className="bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer p-5"
                              onClick={() => {
                                handleSelectProject(project)
                                navigateTo("proposal", { projectId: project.id })
                              }}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-base font-semibold text-slate-900">合同抽選会</h3>
                                    <Badge variant={getStatusVariant(project.status)}>{getStatusLabel(project.status)}</Badge>
                                  </div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                      案件No: {projectNumber}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">実施日</div>
                                      <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {project.eventStartDate === project.eventEndDate
                                          ? project.eventStartDate
                                          : `${project.eventStartDate} ～ ${project.eventEndDate}`}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">見積金額</div>
                                      <div className="text-lg font-semibold text-slate-900">¥{project.budget}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-slate-500 mb-1">担当営業</div>
                                      <div className="text-sm font-medium text-slate-700">{salesPersonName}</div>
                                    </div>
                                  </div>
                                  {(() => {
                                    type ProdStatus = "未依頼" | "初稿待ち" | "修正依頼済み" | "修正待ち" | "完了"
                                    const getDesignStatus = (type: "poster" | "dm" | "winner-list"): ProdStatus => {
                                      const requests = getDesignRequestsByProjectAndType(project.id, type)
                                      const sorted = [...requests].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
                                      const latest = sorted[0]
                                      if (!latest) return "未依頼"
                                      if (latest.status === "requested") return "初稿待ち"
                                      if (latest.status === "uploaded") {
                                        const comments = latest.comments
                                        if (comments.length === 0) return "修正待ち"
                                        const last = comments[comments.length - 1]
                                        if (last.role === "SalesInsight") return "修正依頼済み"
                                        return "完了"
                                      }
                                      return "完了"
                                    }
                                    const posterStatus = getDesignStatus("poster")
                                    const dmStatus = project.dmMailing === "yes" ? getDesignStatus("dm") : null
                                    const winnerListStatus = getDesignStatus("winner-list")
                                    const hasPrizeOrder = !!(project.prizeOrderRequestedAt || (project.prizeOrdersByVendor && project.prizeOrdersByVendor.length > 0))
                                    const prizeDeliveryStatus = !hasPrizeOrder
                                      ? "未発注"
                                      : (project.prizeDeliveryInfoByVendor?.length ?? 0) > 0
                                        ? "配送報告済み"
                                        : "配送待ち"
                                    const variant = (s: string) =>
                                      s === "完了" || s === "配送報告済み" ? "default" : s === "未依頼" || s === "未発注" ? "outline" : "secondary"
                                    return (
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-100">
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-slate-500">ポスター制作状況</span>
                                          <Badge variant={variant(posterStatus)} className="text-xs w-fit">
                                            {posterStatus}
                                          </Badge>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-slate-500">DM制作状況</span>
                                          {dmStatus !== null ? (
                                            <Badge variant={variant(dmStatus)} className="text-xs w-fit">
                                              {dmStatus}
                                            </Badge>
                                          ) : (
                                            <span className="text-xs text-slate-400">ー</span>
                                          )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-slate-500">当選通知書作成状況</span>
                                          <Badge variant={variant(winnerListStatus)} className="text-xs w-fit">
                                            {winnerListStatus}
                                          </Badge>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-slate-500">景品配送状況</span>
                                          <Badge variant={variant(prizeDeliveryStatus)} className="text-xs w-fit">
                                            {prizeDeliveryStatus}
                                          </Badge>
                                        </div>
                                      </div>
                                    )
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
                )
              })()}
            </div>
          )}

          {/* 案件作成・編集 */}
          {screen === "registration" && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <Button type="button" variant="ghost" size="icon" onClick={handleBackFromRegistration} className="h-10 w-10">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold text-slate-900">
                  {editingProjectId ? "案件編集" : "新規案件作成"}
                </h1>
              </div>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900">基本情報</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-companyName">法人名</Label>
                      <Popover open={regCompanySearchOpen} onOpenChange={setRegCompanySearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={regCompanySearchOpen}
                            className="w-full justify-between font-normal"
                          >
                            {companyName || "法人名を検索..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="法人名を検索..."
                              value={regCompanySearchQuery}
                              onValueChange={setRegCompanySearchQuery}
                            />
                            <CommandList>
                              <CommandEmpty>法人が見つかりませんでした</CommandEmpty>
                              <CommandGroup>
                                {companies
                                  .filter((c) =>
                                    c.name.toLowerCase().includes((regCompanySearchQuery || "").toLowerCase())
                                  )
                                  .map((company) => (
                                    <CommandItem
                                      key={company.id}
                                      value={company.name}
                                      onSelect={() => {
                                        setCompanyName(company.name)
                                        setSelectedCompanyId(company.id)
                                        setHallNames([""])
                                        setRegCompanySearchOpen(false)
                                        setRegCompanySearchQuery("")
                                      }}
                                    >
                                      <Check
                                        className={cn("mr-2 h-4 w-4", companyName === company.name ? "opacity-100" : "opacity-0")}
                                      />
                                      <div className="flex flex-col">
                                        <span>{company.name}</span>
                                        <span className="text-xs text-slate-500">法人ID: {company.id}</span>
                                      </div>
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-companyId">法人ID</Label>
                      <Input
                        id="reg-companyId"
                        value={selectedCompanyId || ""}
                        disabled
                        className="bg-slate-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-hallName">ホール名</Label>
                      <Popover open={regHallSearchOpen} onOpenChange={setRegHallSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={regHallSearchOpen}
                            className="w-full justify-between font-normal"
                          >
                            {(hallNames[0] ?? "").trim() || "ホール名を検索..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="ホール名を検索..."
                              value={regHallSearchQuery}
                              onValueChange={setRegHallSearchQuery}
                            />
                            <CommandList>
                              <CommandEmpty>ホールが見つかりませんでした</CommandEmpty>
                              <CommandGroup>
                                {halls
                                  .filter(
                                    (h) =>
                                      h.name.toLowerCase().includes((regHallSearchQuery || "").toLowerCase()) &&
                                      (!selectedCompanyId || h.companyId === selectedCompanyId)
                                  )
                                  .map((hall) => {
                                    const salesPerson = employees.find((e) => e.id === hall.salesPersonId)
                                    return (
                                      <CommandItem
                                        key={hall.id}
                                        value={hall.name}
                                        onSelect={() => {
                                          setHallNames([hall.name])
                                          setCompanyName(companies.find((c) => c.id === hall.companyId)?.name ?? companyName)
                                          setSelectedCompanyId(hall.companyId)
                                          setSalesPersonId(hall.salesPersonId)
                                          setRegHallSearchOpen(false)
                                          setRegHallSearchQuery("")
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            (hallNames[0] ?? "") === hall.name ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        <div className="flex flex-col">
                                          <span>{hall.name}</span>
                                          <span className="text-xs text-slate-500">
                                            担当: {salesPerson?.name ?? hall.salesPersonId}
                                          </span>
                                        </div>
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
                      <Label htmlFor="reg-hallId">ホールID</Label>
                      <Input
                        id="reg-hallId"
                        value={halls.find((h) => h.name === (hallNames[0] ?? ""))?.id ?? ""}
                        disabled
                        className="bg-slate-50"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="reg-projectName">案件名</Label>
                      <Input
                        id="reg-projectName"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="例: マルハン渋谷店 - 山田 太郎"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-acquirerName">ホール担当営業</Label>
                      <Select value={salesPersonId} onValueChange={setSalesPersonId}>
                        <SelectTrigger id="reg-acquirerName">
                          <SelectValue placeholder="担当営業を選択..." />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-requestDate">依頼日</Label>
                      <Input
                        id="reg-requestDate"
                        type="date"
                        value={requestDate}
                        onChange={(e) => setRequestDate(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  onClick={handleSaveProjectFromRegistration}
                  className="gap-2"
                  disabled={
                    !editingProjectId &&
                    (!companyName.trim() || hallNames.filter((h) => h.trim() !== "").length < 1)
                  }
                  title={
                    !editingProjectId &&
                    (!companyName.trim() || hallNames.filter((h) => h.trim() !== "").length < 1)
                      ? "法人名とホールを1件以上選択してください。作成後は商材・見積・設定画面で詳細を入力します。"
                      : undefined
                  }
                >
                  {editingProjectId ? "案件を更新" : "案件を作成"}
                </Button>
                {!editingProjectId &&
                  (!companyName.trim() || hallNames.filter((h) => h.trim() !== "").length < 1) && (
                    <span className="text-sm text-muted-foreground">
                      法人名とホールを選択すると案件を作成できます。作成後は商材・見積・設定画面へ進みます。
                    </span>
                  )}
                {editingProjectId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (selectedProject) handleSelectProject(selectedProject)
                    }}
                  >
                    商材（合同抽選会）の設定へ進む
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 商材追加: カテゴリ・イベント区分選択 */}
          {screen === "add-product" && addingProductProject && (
            <ProductTypeSelectionView
              category={addProductCategory}
              onCategoryChange={(v) => {
                setAddProductCategory(v)
                setAddProductEventType("")
              }}
              eventType={addProductEventType}
              onEventTypeChange={setAddProductEventType}
              eventTypeSearchOpen={addProductEventTypeSearchOpen}
              onEventTypeSearchOpenChange={setAddProductEventTypeSearchOpen}
              eventTypeSearchQuery={addProductEventTypeSearchQuery}
              onEventTypeSearchQueryChange={setAddProductEventTypeSearchQuery}
              onConfirm={() => {
                if (addingProductProject) {
                  handleSelectProject(addingProductProject)
                  setAddProductCategory("")
                  setAddProductEventType("")
                  navigateTo("proposal", { projectId: addingProductProject.id })
                }
              }}
              onBack={() => {
                setAddProductCategory("")
                setAddProductEventType("")
                router.push("/sales")
              }}
              confirmLabel="入力画面へ進む"
            />
          )}

          {/* Screen 1: Proposal */}
          {screen === "proposal" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <Button type="button" variant="ghost" size="icon" onClick={() => router.push("/sales")} className="h-10 w-10">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">商材・見積・設定</h2>
                <p className="text-muted-foreground mt-2">
                  {selectedProject ? "商材の詳細を確認・編集します" : "商材の見積もりと設定を作成します"}
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

                  <div className="space-y-2">
                    <Label>DM投函有無</Label>
                    <Select value={dmMailing} onValueChange={(v: "yes" | "no") => setDmMailing(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">無</SelectItem>
                        <SelectItem value="yes">有</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">「有」の場合のみ、制作進行でDM作成依頼〜状況確認・コメントの流れが表示されます</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-start-date">イベント開始日</Label>
                      <Input
                        id="event-start-date"
                        type="date"
                        value={eventStartDate}
                        onChange={(e) => {
                          const v = e.target.value
                          setEventStartDate(v)
                          if (eventEndDate && v && eventEndDate < v) {
                            setEventEndDate(v)
                          }
                        }}
                        max={eventEndDate || undefined}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-end-date">イベント終了日</Label>
                      <Input
                        id="event-end-date"
                        type="date"
                        value={eventEndDate}
                        onChange={(e) => {
                          const v = e.target.value
                          setEventEndDate(v)
                          if (eventStartDate && v && eventStartDate > v) {
                            setEventStartDate(v)
                          }
                        }}
                        min={eventStartDate || undefined}
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
                    <Label htmlFor="insight-person">本案件のインサイト担当</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {insightPersonId
                            ? employees.find((e) => e.id === insightPersonId)?.name || "インサイト担当を選択..."
                            : "インサイト担当を選択..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="インサイト担当を検索..." />
                          <CommandList>
                            <CommandEmpty>インサイト担当が見つかりませんでした。</CommandEmpty>
                            <CommandGroup>
                              {employees.map((employee) => (
                                <CommandItem
                                  key={employee.id}
                                  value={employee.name}
                                  onSelect={() => {
                                    setInsightPersonId(employee.id)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      insightPersonId === employee.id ? "opacity-100" : "opacity-0"
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
                    <Label htmlFor="event-type">イベント名</Label>
                    <Input 
                      id="event-type" 
                      placeholder="例: 年末大抽選会" 
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    景品セットを選択
                  </CardTitle>
                  <CardDescription>景品セットを選ぶか、景品情報を手動で入力してください</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>景品セット</Label>
                    <Select
                      value={selectedPrizeSetId}
                      onValueChange={(value) => {
                        const set = PRIZE_SETS_BY_ID.find((s) => s.id === value)
                        if (set) {
                          setSelectedPrizeSetId(value)
                          setPrizeInfo(
                            set.items.map((item) => ({
                              prizeId: item.prizeId,
                              name: prizes.find((p) => p.id === item.prizeId)?.name ?? "",
                              rank: item.rank,
                              quantity: item.quantity,
                            }))
                          )
                        }
                      }}
                    >
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue placeholder="景品セットを選ぶ（選択後に編集可能）" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIZE_SETS_BY_ID.map((set) => (
                          <SelectItem key={set.id} value={set.id}>
                            {set.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label>景品情報</Label>
                    <div className="flex gap-2">
                      <Popover open={prizeMasterAddOpen} onOpenChange={setPrizeMasterAddOpen}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="sm">
                            景品マスタから追加
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[360px] p-0" align="end">
                          <Command>
                            <CommandInput
                              placeholder="景品名で検索..."
                              value={prizeMasterSearchQuery}
                              onValueChange={setPrizeMasterSearchQuery}
                            />
                            <CommandList>
                              <CommandEmpty>景品が見つかりませんでした</CommandEmpty>
                              <CommandGroup>
                                {prizes
                                  .filter((p) => p.name.toLowerCase().includes((prizeMasterSearchQuery || "").toLowerCase()))
                                  .map((prize) => {
                                    const vendor = prizeVendors.find((v) => v.id === prize.vendorId)
                                    return (
                                      <CommandItem
                                        key={prize.id}
                                        value={prize.name}
                                        onSelect={() => {
                                          setPrizeInfo((prev) => [...prev, { prizeId: prize.id, name: prize.name, rank: "", quantity: "" }])
                                          setPrizeMasterAddOpen(false)
                                          setPrizeMasterSearchQuery("")
                                        }}
                                      >
                                        <div className="flex flex-col">
                                          <span>{prize.name}</span>
                                          <span className="text-xs text-muted-foreground">業者: {vendor?.name ?? prize.vendorId}</span>
                                        </div>
                                      </CommandItem>
                                    )
                                  })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPrizeInfo([...prizeInfo, { rank: "", name: "", quantity: "", prizeId: undefined }])}
                      >
                        + 景品を追加
                      </Button>
                    </div>
                  </div>

                  {(() => {
                    const vendorIdsInUse = prizeInfo
                      .map((p) => (p.prizeId ? prizes.find((z) => z.id === p.prizeId)?.vendorId : null))
                      .filter((id): id is string => Boolean(id))
                    const distinctVendorCount = new Set(vendorIdsInUse).size
                    const overVendorRule = distinctVendorCount >= 3
                    return (
                      <>
                        {overVendorRule && (
                          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            <span className="font-medium">業務ルール:</span> 1イベントでは3社以上の業者の景品を選択できません。現在{" "}
                            <span className="font-semibold">{distinctVendorCount}社</span>の景品が含まれています。2社以内に調整してください。
                          </div>
                        )}
                        {prizeInfo.map((prize, index) => {
                          const prizeMaster = prize.prizeId ? prizes.find((p) => p.id === prize.prizeId) : null
                          const vendorName = prizeMaster ? prizeVendors.find((v) => v.id === prizeMaster.vendorId)?.name : null
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <div className="grid grid-cols-4 gap-2 flex-1">
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
                                <Input
                                  value={vendorName ?? "手動入力"}
                                  disabled
                                  className="bg-slate-50 text-muted-foreground"
                                  placeholder="業者"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => setPrizeInfo(prizeInfo.filter((_, i) => i !== index))}
                                aria-label="この景品を削除"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        })}
                      </>
                    )
                  })()}
                  {(prizeInfo.length === 0 || !prizeInfo[0]?.name) && (
                    <p className="text-sm text-destructive font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      景品の情報がないと見積もりが出せません
                    </p>
                  )}
                </CardContent>
              </Card>

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
                        <p className="text-xs text-muted-foreground">各項目の全体金額を入力してください。各ホールの金額は割合で自動計算されます。DM投函が「無」の場合はDM発送代行は表示されません。</p>
                        {defaultQuoteItems.filter((item) => dmMailing === "yes" || item.id !== 3).map((item) => {
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
                            // 各項目の合計金額を計算（DM投函無の場合はDM発送代行を除外）
                            const posterPrintQty = parseFloat(posterPrintQuantity) || 0
                            const posterPrintPrice = parseFloat(posterPrintUnitPrice) || 0
                            const posterPrintAmount = posterPrintQty * posterPrintPrice
                            const totalAmount =
                              Object.entries(totalQuoteItems).reduce(
                                (sum, [key, amount]) =>
                                  sum +
                                  (dmMailing === "no" && key === "3" ? 0 : parseFloat(amount) || 0),
                                0
                              ) + posterPrintAmount
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
                            
                            // Calculate Company Amount（DM投函無の場合はDM発送代行を除外）
                            const posterPrintQty = parseFloat(posterPrintQuantity) || 0
                            const posterPrintPrice = parseFloat(posterPrintUnitPrice) || 0
                            const posterPrintAmount = posterPrintQty * posterPrintPrice
                            const totalAmount =
                              Object.entries(totalQuoteItems).reduce(
                                (sum, [key, amount]) =>
                                  sum +
                                  (dmMailing === "no" && key === "3" ? 0 : parseFloat(amount) || 0),
                                0
                              ) + posterPrintAmount
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
                          // 各項目の合計金額を計算（DM投函無の場合はDM発送代行を除外）
                          const posterPrintQty = parseFloat(posterPrintQuantity) || 0
                          const posterPrintPrice = parseFloat(posterPrintUnitPrice) || 0
                          const posterPrintAmount = posterPrintQty * posterPrintPrice
                          const totalAmount =
                            Object.entries(totalQuoteItems).reduce(
                              (sum, [key, amount]) =>
                                sum +
                                (dmMailing === "no" && key === "3" ? 0 : parseFloat(amount) || 0),
                              0
                            ) + posterPrintAmount

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
                      // 各項目の合計金額を計算（DM投函無の場合はDM発送代行を除外）
                      const posterPrintQty = parseFloat(posterPrintQuantity) || 0
                      const posterPrintPrice = parseFloat(posterPrintUnitPrice) || 0
                      const posterPrintAmount = posterPrintQty * posterPrintPrice
                      const totalAmount =
                        Object.entries(totalQuoteItems).reduce(
                          (sum, [key, amount]) =>
                            sum + (dmMailing === "no" && key === "3" ? 0 : parseFloat(amount) || 0),
                          0
                        ) + posterPrintAmount
                      const calculatedAmount = totalAmount > 0 ? Math.floor((totalAmount * percentage) / 100) : 0
                      const quoteItems = (hallQuotes[hallName] || []).filter(
                        (item) => dmMailing === "yes" || item.id !== 3
                      )

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
                              <Button
                                onClick={() => {
                                  setPdfOutputHallName(hallName)
                                  setPdfStep("template")
                                  setShowPdfModal(true)
                                }}
                                variant="outline"
                                className="flex-1"
                              >
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
                              const totalAmount =
                                Object.entries(totalQuoteItems).reduce(
                                  (sum, [key, amount]) =>
                                    sum +
                                    (dmMailing === "no" && key === "3" ? 0 : parseFloat(amount) || 0),
                                  0
                                ) + posterPrintAmount
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
                    <div className="space-y-2">
                      <Label>ステータス</Label>
                      <Select
                        value={projectStatus}
                        onValueChange={(v) => handleStatusChange(v as Project["status"])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="before-proposal">提案前</SelectItem>
                          <SelectItem value="proposing">提案中</SelectItem>
                          <SelectItem value="order-received">受注</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(projectStatus === "before-proposal" || projectStatus === "proposing") && (
                      <div className="space-y-2">
                        <Label>ヨミ</Label>
                        <Select
                          value={projectReadingCertainty === "A" || projectReadingCertainty === "B" || projectReadingCertainty === "C" ? projectReadingCertainty : ""}
                          onValueChange={(v) => handleReadingCertaintyChange(v as Project["readingCertainty"] | "")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {(projectStatus === "before-proposal" || projectStatus === "proposing") && (
                      <Button
                        onClick={handleConfirmProject}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        受注にする
                      </Button>
                    )}

                    {projectStatus === "order-received" && (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-600">
                          受注済みです。制作フェーズに進めます。
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
                <Button onClick={() => navigateTo("production")} size="lg">
                  制作フェーズへ
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Screen 2: Production */}
          {screen === "production" && (
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
                  <CardDescription>ポスター・DMの制作状況</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectId && (() => {
                    type ProdStatus = "未依頼" | "初稿待ち" | "修正依頼済み" | "修正待ち" | "完了"
                    const getProductionStatus = (type: "poster" | "dm"): ProdStatus => {
                      const requests = getDesignRequestsByProjectAndType(projectId, type)
                      const sorted = [...requests].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
                      const latest = sorted[0]
                      if (!latest) return "未依頼"
                      if (latest.status === "requested") return "初稿待ち"
                      if (latest.status === "uploaded") {
                        const comments = latest.comments
                        if (comments.length === 0) return "修正待ち" // アップロード済み・営業確認待ち
                        const last = comments[comments.length - 1]
                        if (last.role === "SalesInsight") return "修正依頼済み"
                        return "完了" // 業者返答済み
                      }
                      return "完了"
                    }
                    const posterStatus = getProductionStatus("poster")
                    const dmStatus = getProductionStatus("dm")
                    const variant = (s: ProdStatus) =>
                      s === "完了" ? "default" : s === "未依頼" ? "outline" : "secondary"
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">ポスター制作状況</span>
                          <Badge variant={variant(posterStatus)} className="text-sm">
                            {posterStatus}
                          </Badge>
                        </div>
                        {(selectedProject?.dmMailing === "yes" || dmMailing === "yes") && (
                          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium">DM制作状況</span>
                            <Badge variant={variant(dmStatus)} className="text-sm">
                              {dmStatus}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                  {!projectId && (
                    <p className="text-sm text-muted-foreground py-2">案件を選択すると制作状況を表示します</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    ポスター発注
                  </CardTitle>
                  <CardDescription>印刷会社へポスター作成を発注。発注時に発注書を自動作成します。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">発注先</span>
                      <span className="font-medium">印刷会社A</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowPosterOrderModal(true)}
                    className="w-full bg-gradient-to-r from-primary to-blue-600"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    ポスター発注（依頼文自動生成）
                  </Button>
                  {projectId && getPosterRequestsByProject(projectId).length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <h4 className="font-semibold text-sm text-muted-foreground">発注書</h4>
                      <p className="text-sm text-muted-foreground">発注時に発注書を自動作成しました。</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowPosterOrderDocumentModal(true)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        発注書を表示
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {projectId && (() => {
                const posterRequests = getPosterRequestsByProject(projectId)
                const sortedPoster = [...posterRequests].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
                const latestPoster = sortedPoster[0]
                const salesPersonName = employees.find((e) => e.id === selectedProject?.salesPersonId)?.name ?? "営業"
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        ポスター プレビュー・AI校正・修正依頼
                      </CardTitle>
                      <CardDescription>アップロード確認 → プレビュー参照 → AI校正チェック → 修正依頼（コメント）</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {!latestPoster ? (
                        <p className="text-sm text-muted-foreground py-4">まだポスター発注はありません。上記の「ポスター発注」から依頼してください。</p>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">対象依頼</span>
                            <span className="font-medium">{latestPoster.vendorName ?? "発注先"}</span>
                            <Badge variant={latestPoster.status === "uploaded" ? "default" : "secondary"}>
                              {latestPoster.status === "uploaded" ? "アップロード済み" : "初稿待ち"}
                            </Badge>
                          </div>

                          {/* 2. アップロードされたもののプレビュー参照 */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-muted-foreground">アップロードされたもののプレビュー</h4>
                            {latestPoster.status === "uploaded" && latestPoster.uploadedFileName ? (
                              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-dashed border-muted-foreground/30 aspect-[3/4] max-w-sm">
                                <div className="text-center space-y-4">
                                  <h3 className="text-2xl font-bold">大抽選会</h3>
                                  <p className="text-xl font-semibold">12/24開催</p>
                                  <p className="text-lg">オメガホール</p>
                                  <p className="text-base">商品券10万円分</p>
                                </div>
                                <p className="absolute bottom-2 left-2 right-2 text-center text-xs text-muted-foreground truncate">
                                  {latestPoster.uploadedFileName}
                                  {latestPoster.uploadedAt && `（${new Date(latestPoster.uploadedAt).toLocaleString("ja")}）`}
                                </p>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/20 aspect-[3/4] max-w-sm flex items-center justify-center">
                                <p className="text-sm text-muted-foreground">初稿のアップロード待ち</p>
                              </div>
                            )}
                          </div>

                          {/* 3. AI校正チェック */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">AI校正チェック</h4>
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <p className="text-xs text-muted-foreground">JASデータ</p>
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
                                <p className="text-xs text-muted-foreground">ポスタープレビュー</p>
                                <div className={`relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-dashed border-muted-foreground/30 aspect-[3/4] ${showDateError ? "ring-4 ring-destructive" : ""}`}>
                                  {aiProofing && (
                                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center rounded-lg animate-pulse">
                                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    </div>
                                  )}
                                  <div className="text-center space-y-4">
                                    <h3 className="text-2xl font-bold">大抽選会</h3>
                                    <p className="text-xl font-semibold">12/24開催</p>
                                    <p className="text-lg">オメガホール</p>
                                    <p className="text-base">商品券10万円分</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {proofingComplete && (
                              <>
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
                                    className="flex-1"
                                    onClick={() => {
                                      toast({ title: "修正依頼を送信しました", description: "下記コメントで業者へ依頼できます。" })
                                    }}
                                  >
                                    修正依頼（下記コメントで送信）
                                  </Button>
                                  <Button
                                    className="flex-1"
                                    onClick={() => {
                                      toast({ title: "承認完了", description: "制作物を承認しました" })
                                    }}
                                  >
                                    承認する
                                  </Button>
                                </div>
                              </>
                            )}
                            {!proofingComplete && latestPoster.status === "uploaded" && (
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
                          </div>

                          {/* 4. 修正依頼（コメント） */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">コメント・修正依頼</h4>
                            <div className="rounded border p-3 bg-muted/30 space-y-2 max-h-48 overflow-y-auto">
                              {latestPoster.comments.length === 0 ? (
                                <p className="text-sm text-muted-foreground">まだコメントはありません</p>
                              ) : (
                                latestPoster.comments.map((c) => (
                                  <div key={c.id} className="text-sm">
                                    <span className="font-medium text-muted-foreground">
                                      {c.role === "SalesInsight" ? "営業" : "デザイン業者"}
                                      {c.authorName && `（${c.authorName}）`}:
                                    </span>{" "}
                                    {c.text}
                                    <span className="block text-xs text-muted-foreground mt-0.5">
                                      {new Date(c.createdAt).toLocaleString("ja")}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="修正依頼や確認メッセージを入力"
                                value={posterCommentText}
                                onChange={(e) => setPosterCommentText(e.target.value)}
                                rows={2}
                                className="resize-none flex-1"
                              />
                              <Button
                                size="sm"
                                className="shrink-0"
                                onClick={() => {
                                  if (!posterCommentText.trim()) return
                                  addPosterRequestComment(latestPoster.id, {
                                    role: "SalesInsight",
                                    authorId: selectedProject?.salesPersonId,
                                    authorName: salesPersonName,
                                    text: posterCommentText.trim(),
                                  })
                                  setPosterCommentText("")
                                  toast({ title: "コメントを送信しました" })
                                }}
                              >
                                <Send className="w-4 h-4 mr-1" />
                                送信
                              </Button>
                            </div>
                          </div>

                          {/* 5. 出来上がったポスターを顧客(ホール)にメール送信（確認のため） */}
                          {latestPoster.status === "uploaded" && projectId && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm text-muted-foreground">顧客（ホール）へ確認用送信</h4>
                              {posterSentToCustomerProjectIds.includes(projectId) ? (
                                <Alert className="border-primary bg-primary/5">
                                  <CheckCircle2 className="h-4 w-4 text-primary" />
                                  <AlertDescription>
                                    <strong>顧客（ホール）へ送信済み</strong>
                                    <br />
                                    <span className="text-sm">ポスターをメール添付で送信しました。確認のご返信をお待ちください。</span>
                                  </AlertDescription>
                                </Alert>
                              ) : (
                                <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                                  <p className="text-sm text-muted-foreground">出来上がったポスターを顧客（ホール）にメール添付で送信し、内容の確認を依頼します。</p>
                                  <Button
                                    onClick={() => {
                                      const firstHallName = selectedProject?.hallNames?.[0] ?? ""
                                      setPosterConfirmHallName(firstHallName)
                                      setPosterConfirmToType("hall")
                                      setPosterConfirmCc([])
                                      setPosterConfirmMessage(
                                        "お世話になっております。\n\nポスターの初稿が出来上がりましたので、添付のうえご確認をお願いいたします。\nご確認のうえ、修正のご希望等がございましたらご連絡ください。\n\nよろしくお願いいたします。"
                                      )
                                      setShowPosterConfirmEmailModal(true)
                                    }}
                                    variant="outline"
                                    className="w-full"
                                  >
                                    <Mail className="w-4 h-4 mr-2" />
                                    出来上がったポスターを顧客(ホール)にメール添付して送信（確認のため）
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                )
              })()}

              {projectId && (selectedProject?.dmMailing === "yes" || dmMailing === "yes") && (() => {
                const dmRequests = getDesignRequestsByProjectAndType(projectId, "dm")
                const sortedDm = [...dmRequests].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
                const latestDm = sortedDm[0]
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        DM作成依頼・状況確認・コメント
                      </CardTitle>
                      <CardDescription>ポスターの後にDM作成依頼を送信し、アップロード確認・コメントでやり取り</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {selectedProject && (
                        <Button
                          onClick={() => setShowDMCreateModal(true)}
                          variant="outline"
                          className="w-full bg-gradient-to-r from-primary/10 to-blue-600/10"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          DM作成依頼（依頼文自動生成）
                        </Button>
                      )}
                      {dmRequests.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">まだDM作成依頼はありません</p>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">対象依頼</span>
                            <span className="font-medium">{latestDm.vendorName ?? "デザイン業者"}</span>
                            <Badge variant={latestDm.status === "uploaded" ? "default" : "secondary"}>
                              {latestDm.status === "uploaded" ? "アップロード済み" : "初稿待ち"}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-muted-foreground">アップロードされたもののプレビュー</h4>
                            {latestDm.status === "uploaded" && latestDm.uploadedFileName ? (
                              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 aspect-[3/4] max-w-[280px] flex flex-col">
                                <div className="flex-1 p-4 flex flex-col justify-center text-center space-y-2">
                                  <h3 className="text-lg font-bold text-foreground">大抽選会のご案内</h3>
                                  <p className="text-sm font-semibold">
                                    {selectedProject?.eventStartDate === selectedProject?.eventEndDate
                                      ? selectedProject?.eventStartDate
                                      : `${selectedProject?.eventStartDate ?? ""} ～ ${selectedProject?.eventEndDate ?? ""}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{selectedProject?.hallNames?.join("／") || "ー"}</p>
                                  <p className="text-xs text-muted-foreground">{selectedProject?.companyName || ""}</p>
                                </div>
                                <p className="p-2 text-center text-xs text-muted-foreground truncate border-t bg-muted/30">
                                  {latestDm.uploadedFileName}
                                  {latestDm.uploadedAt && `（${new Date(latestDm.uploadedAt).toLocaleString("ja")}）`}
                                </p>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/20 aspect-[3/4] max-w-[280px] flex items-center justify-center">
                                <p className="text-sm text-muted-foreground">初稿のアップロード待ち</p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-muted-foreground">依頼一覧・詳細・コメント</h4>
                            <ul className="divide-y divide-border space-y-0">
                              {dmRequests.map((r) => (
                                <li key={r.id} className="py-3 first:pt-0">
                                  <div className="flex items-center justify-between gap-4">
                                    <div>
                                      <div className="font-medium">{r.vendorName ?? "デザイン業者"}</div>
                                      <div className="text-xs text-muted-foreground mt-0.5">
                                        {new Date(r.requestedAt).toLocaleString("ja")}
                                        {r.uploadedFileName && (
                                          <span className="ml-2 text-green-600">・アップロード済み: {r.uploadedFileName}</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={r.status === "uploaded" ? "default" : "secondary"}>
                                        {r.status === "uploaded" ? "アップロード済み" : "依頼済み"}
                                      </Badge>
                                      <Button variant="outline" size="sm" onClick={() => setDesignRequestDetailId(r.id)}>
                                        <Eye className="w-4 h-4 mr-1" />
                                        詳細・コメント
                                      </Button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )
              })()}

            </div>
          )}

          {/* Lottery screen removed: 抽選・景品・配送 is now on 事務管理課 (admin) screen only */}
          {false && (
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
          {screen === "accounting" && (
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

      <Dialog
        open={showPdfModal}
        onOpenChange={(open) => {
          setShowPdfModal(open)
          if (!open) {
            setPdfOutputHallName(null)
            setPdfStep("template")
            setPdfEditableItems([])
            setPdfEditingItems(false)
            pdfEditableItemsBackupRef.current = null
          }
        }}
      >
        <DialogContent className="max-w-[1000px] sm:max-w-[1000px] w-[90vw] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{pdfStep === "template" ? "見積書作成" : "見積書プレビュー"}</DialogTitle>
            <DialogDescription>
              {pdfStep === "template"
                ? pdfOutputHallName
                  ? `${pdfOutputHallName} の見積書項目を編集してください`
                  : "見積書の項目を編集してください"
                : "生成した見積書を確認してください"}
            </DialogDescription>
          </DialogHeader>

          {pdfStep === "template" ? (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-6 min-h-0" style={{ maxHeight: "calc(85vh - 250px)" }}>
                {/* 見積書項目の編集 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">見積書項目</h3>
                    <div className="flex items-center gap-2">
                      {pdfEditingItems ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (pdfEditableItemsBackupRef.current) setPdfEditableItems(pdfEditableItemsBackupRef.current)
                              pdfEditableItemsBackupRef.current = null
                              setPdfEditingItems(false)
                            }}
                          >
                            キャンセル
                          </Button>
                          <Button size="sm" onClick={() => { pdfEditableItemsBackupRef.current = null; setPdfEditingItems(false) }}>
                            保存
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            pdfEditableItemsBackupRef.current = pdfEditableItems.map((i) => ({ ...i }))
                            setPdfEditingItems(true)
                          }}
                          disabled={pdfEditableItems.length === 0}
                        >
                          編集
                        </Button>
                      )}
                      {pdfEditingItems && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newItem: QuoteItem = {
                              id: Math.max(0, ...pdfEditableItems.map((i) => i.id)) + 1,
                              name: "新しい項目",
                              quantity: 1,
                              unitPrice: 0,
                              included: true,
                            }
                            setPdfEditableItems([...pdfEditableItems, newItem])
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          項目を追加
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {pdfEditableItems.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">項目がありません。項目を追加してください。</div>
                    ) : (
                      pdfEditableItems.map((item) => (
                        <Card key={item.id} className="border-slate-200">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Switch
                                checked={item.included}
                                disabled={!pdfEditingItems}
                                onCheckedChange={(checked) => {
                                  setPdfEditableItems(pdfEditableItems.map((i) => (i.id === item.id ? { ...i, included: checked } : i)))
                                }}
                              />
                              <div className="flex-1 space-y-2">
                                {pdfEditingItems ? (
                                  <div className="flex gap-2 flex-wrap items-center">
                                    <Input
                                      value={item.name}
                                      onChange={(e) => setPdfEditableItems(pdfEditableItems.map((i) => (i.id === item.id ? { ...i, name: e.target.value } : i)))}
                                      className="flex-1 min-w-[120px]"
                                      placeholder="項目名"
                                    />
                                    {item.id === 2 ? (
                                      <>
                                        <Input
                                          type="number"
                                          value={item.quantity}
                                          onChange={(e) => setPdfEditableItems(pdfEditableItems.map((i) => (i.id === item.id ? { ...i, quantity: Number(e.target.value) || 0 } : i)))}
                                          className="w-24"
                                          placeholder="枚数"
                                        />
                                        <Input
                                          type="number"
                                          value={item.unitPrice}
                                          onChange={(e) => setPdfEditableItems(pdfEditableItems.map((i) => (i.id === item.id ? { ...i, unitPrice: Number(e.target.value) || 0 } : i)))}
                                          className="w-28"
                                          placeholder="単価"
                                        />
                                      </>
                                    ) : (
                                      <Input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => setPdfEditableItems(pdfEditableItems.map((i) => (i.id === item.id ? { ...i, unitPrice: Number(e.target.value) || 0 } : i)))}
                                        className="w-32"
                                        placeholder="金額"
                                      />
                                    )}
                                    <Button size="sm" variant="outline" onClick={() => setPdfEditableItems(pdfEditableItems.filter((i) => i.id !== item.id))}>
                                      削除
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-slate-900">{item.name}</div>
                                      <div className="text-sm text-slate-600">
                                        {item.id === 2 ? `${item.quantity}枚 × ¥${item.unitPrice.toLocaleString()}` : `¥${item.unitPrice.toLocaleString()}`}
                                      </div>
                                    </div>
                                    <span className="font-medium">
                                      ¥{(item.id === 2 ? item.quantity * item.unitPrice : item.unitPrice).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t pt-4 flex-shrink-0">
                <Button variant="outline" onClick={() => setShowPdfModal(false)}>
                  キャンセル
                </Button>
                <Button
                  onClick={() => {
                    if (pdfEditableItems.filter((i) => i.included).length === 0) {
                      toast({ title: "項目を選択してください", description: "表示する項目が1件以上必要です", variant: "destructive" })
                      return
                    }
                    setPdfStep("preview")
                  }}
                  disabled={pdfEditableItems.filter((i) => i.included).length === 0}
                >
                  見積書を生成
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0" style={{ maxHeight: "calc(85vh - 200px)" }}>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">PDFプレビュー</Badge>
                </div>

                <div className="bg-white border-2 border-slate-300 rounded-lg shadow-lg p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-slate-900">見積書</h2>
                      <div className="text-right text-sm text-slate-600">
                        <div>発行日: {new Date().toLocaleDateString("ja-JP")}</div>
                        {selectedProject?.projectNumber && <div>案件No: {selectedProject.projectNumber}</div>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-lg font-medium">{companyName} 御中</div>
                      {pdfOutputHallName && <div className="text-sm text-slate-600">対象: {pdfOutputHallName}</div>}
                      <p className="text-sm text-slate-600">下記の通りお見積もりいたします。</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">案件名</div>
                        <div className="font-medium text-slate-900">{projectName || (companyName && pdfOutputHallName ? `${companyName} - ${pdfOutputHallName}` : "-")}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">実施日</div>
                        <div className="font-medium text-slate-900">{eventStartDate && eventEndDate ? `${eventStartDate} ～ ${eventEndDate}` : requestDate || "-"}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-900">見積明細</h3>
                      <div className="bg-slate-50 p-2 rounded border border-slate-200">
                        {pdfOutputHallName && <div className="text-xs text-slate-600 mb-2">{pdfOutputHallName}</div>}
                        <table className="w-full border border-slate-300">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="text-left p-3 text-sm font-medium text-slate-700 border-b border-slate-300">項目</th>
                              <th className="text-right p-3 text-sm font-medium text-slate-700 border-b border-slate-300">金額</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pdfEditableItems
                              .filter((i) => i.included)
                              .map((item) => (
                                <tr key={item.id} className="border-b border-slate-200">
                                  <td className="p-3 text-sm font-medium">
                                    {item.name}
                                    {item.id === 2 && item.quantity > 0 && (
                                      <span className="block text-slate-600 font-normal text-xs mt-0.5">
                                        {item.quantity}枚 × ¥{item.unitPrice.toLocaleString()}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-sm text-right font-medium">
                                    ¥{(item.id === 2 ? item.quantity * item.unitPrice : item.unitPrice).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                          <tfoot className="bg-slate-100 border-t border-slate-300">
                            <tr>
                              <td className="p-3 text-sm font-bold text-slate-700">合計金額（税込）</td>
                              <td className="p-3 text-sm text-right font-bold text-blue-600 text-lg">
                                ¥{pdfEditableItems
                                  .filter((i) => i.included)
                                  .reduce((sum, i) => sum + (i.id === 2 ? i.quantity * i.unitPrice : i.unitPrice), 0)
                                  .toLocaleString()}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t pt-4 flex-shrink-0">
                <Button variant="outline" onClick={() => setPdfStep("template")}>
                  戻る
                </Button>
                <Button
                  onClick={() => {
                    setShowPdfModal(false)
                    setPdfOutputHallName(null)
                    setPdfStep("template")
                    setPdfEditableItems([])
                    setPdfEditingItems(false)
                    toast({
                      title: "📄 PDF生成完了",
                      description: "見積書がダウンロードされました",
                    })
                  }}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  ダウンロード
                </Button>
              </div>
            </>
          )}
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

      {/* 顧客（ホール）へポスター確認メール送信モーダル */}
      <Dialog
        open={showPosterConfirmEmailModal}
        onOpenChange={(open) => {
          setShowPosterConfirmEmailModal(open)
          if (!open) {
            setPosterConfirmHallName("")
            setPosterConfirmToType("hall")
            setPosterConfirmCc([])
            setPosterConfirmMessage("")
            setPosterConfirmShareMethod("compress")
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>顧客（ホール）へポスター確認メール送信</DialogTitle>
            <DialogDescription>送信先・CC・本文を確認・編集してから送信してください</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>To（送信先）</Label>
              {(() => {
                const selectedHall = halls.find((h) => h.name === posterConfirmHallName)
                const selectedCompany = selectedHall ? companies.find((c) => c.id === selectedHall.companyId) : null
                const projectHallNames = selectedProject?.hallNames?.length ? selectedProject.hallNames : [posterConfirmHallName || ""]
                return (
                  <>
                    <div className="flex gap-2">
                      <Button
                        variant={posterConfirmToType === "company" ? "default" : "outline"}
                        onClick={() => setPosterConfirmToType("company")}
                        className="flex-1"
                      >
                        法人({selectedCompany?.name || "-"})
                      </Button>
                      <Button
                        variant={posterConfirmToType === "hall" ? "default" : "outline"}
                        onClick={() => setPosterConfirmToType("hall")}
                        className="flex-1"
                      >
                        ホール({selectedHall?.name || "-"})
                      </Button>
                    </div>
                    {projectHallNames.length > 1 ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            {posterConfirmHallName || "ホールを選択..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="ホールを検索..." />
                            <CommandList>
                              {projectHallNames.filter(Boolean).map((name) => (
                                <CommandItem
                                  key={name}
                                  value={name}
                                  onSelect={() => setPosterConfirmHallName(name)}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", posterConfirmHallName === name ? "opacity-100" : "opacity-0")} />
                                  {name}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    ) : null}
                    <Input
                      type="email"
                      placeholder="メールアドレス"
                      value={posterConfirmToType === "company" ? selectedCompany?.email || "" : selectedHall?.email || ""}
                      readOnly
                      className="bg-muted"
                    />
                  </>
                )
              })()}
            </div>

            <div className="space-y-2">
              <Label>CC（カーボンコピー）</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {posterConfirmCc.length > 0 ? `${posterConfirmCc.length}名選択中` : "従業員を選択..."}
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
                              if (posterConfirmCc.includes(employee.id)) {
                                setPosterConfirmCc(posterConfirmCc.filter((id) => id !== employee.id))
                              } else {
                                setPosterConfirmCc([...posterConfirmCc, employee.id])
                              }
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", posterConfirmCc.includes(employee.id) ? "opacity-100" : "opacity-0")} />
                            {employee.name} {employee.email && `(${employee.email})`}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {posterConfirmCc.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {posterConfirmCc.map((id) => {
                    const employee = employees.find((e) => e.id === id)
                    return employee ? (
                      <Badge key={id} variant="secondary">
                        {employee.name}
                        <button
                          type="button"
                          onClick={() => setPosterConfirmCc(posterConfirmCc.filter((eid) => eid !== id))}
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

            <div className="space-y-3 rounded-lg border p-4 bg-muted/20">
              <Label className="text-base">ポスターの共有方法</Label>
              <div className="space-y-2">
                <RadioGroup
                  value={posterConfirmShareMethod}
                  onValueChange={(v) => setPosterConfirmShareMethod(v as "compress" | "storage_url")}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compress" id="poster-share-compress" />
                    <Label htmlFor="poster-share-compress" className="font-normal cursor-pointer">
                      圧縮して添付する
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="storage_url" id="poster-share-storage" />
                    <Label htmlFor="poster-share-storage" className="font-normal cursor-pointer">
                      ストレージサービスのURLで共有する
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label>メール本文（編集可）</Label>
              <Textarea
                value={posterConfirmMessage}
                onChange={(e) => setPosterConfirmMessage(e.target.value)}
                placeholder="メッセージを入力..."
                className="min-h-[180px]"
              />
            </div>

            <div className="space-y-2">
              <Label>プレビュー</Label>
              <Card className="border">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1 text-sm">
                    {(() => {
                      const selectedHall = halls.find((h) => h.name === posterConfirmHallName)
                      const selectedCompany = selectedHall ? companies.find((c) => c.id === selectedHall.companyId) : null
                      return (
                        <>
                          <div>
                            <span className="font-semibold">To:</span>{" "}
                            {posterConfirmToType === "company" ? selectedCompany?.email || "-" : selectedHall?.email || "-"}
                          </div>
                          {posterConfirmCc.length > 0 && (
                            <div>
                              <span className="font-semibold">CC:</span>{" "}
                              {posterConfirmCc.map((id) => employees.find((e) => e.id === id)?.email).filter(Boolean).join(", ")}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold">添付:</span>{" "}
                            {posterConfirmShareMethod === "compress" ? "ポスター（圧縮ファイル）" : "ポスター（ストレージURL）"}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                  <div className="border-t pt-3">
                    <div className="whitespace-pre-wrap text-sm">{posterConfirmMessage || "（本文未入力）"}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPosterConfirmEmailModal(false)}>
              キャンセル
            </Button>
            <Button
              onClick={() => {
                if (projectId) {
                  setPosterSentToCustomerProjectIds((prev) => (prev.includes(projectId) ? prev : [...prev, projectId]))
                }
                setShowPosterConfirmEmailModal(false)
                const posterLabel = posterConfirmShareMethod === "compress" ? "ポスター（圧縮添付）" : "ポスター（ストレージURL）"
                toast({
                  title: "顧客（ホール）へ送信しました",
                  description: `${posterLabel}を送信しました。確認のご返信をお待ちください。`,
                })
              }}
            >
              <Mail className="w-4 h-4 mr-2" />
              送信
            </Button>
          </DialogFooter>
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

      <Dialog open={showPosterOrderDocumentModal} onOpenChange={setShowPosterOrderDocumentModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ポスター発注書</DialogTitle>
            <DialogDescription>発注時に自動作成された発注書</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {projectId && (() => {
              const project = getProjectById(projectId)
              const posterReqs = getPosterRequestsByProject(projectId)
              const latest = posterReqs.length > 0 ? [...posterReqs].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())[0] : null
              if (!project || !latest) return <p className="text-sm text-muted-foreground">発注情報がありません</p>
              return (
                <div className="rounded-lg border bg-white p-6 text-black space-y-4">
                  <div className="text-center border-b-2 border-black pb-2">
                    <h2 className="text-xl font-bold">発注書</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-muted-foreground">発注日</div>
                    <div>{new Date(latest.requestedAt).toLocaleDateString("ja")}</div>
                    <div className="text-muted-foreground">発注先</div>
                    <div className="font-medium">{latest.vendorName ?? "印刷会社"}</div>
                    <div className="text-muted-foreground">案件名</div>
                    <div>{project.projectName || project.companyName + " " + (project.hallNames?.join("／") || "")}</div>
                    <div className="text-muted-foreground">会場</div>
                    <div>{project.hallNames?.join("、") || "ー"}</div>
                    <div className="text-muted-foreground">品名</div>
                    <div>ポスター制作</div>
                    <div className="text-muted-foreground">納期</div>
                    <div>初稿: {posterFirstDraftDate || "要相談"}／最終納品: 要相談</div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">上記のとおり発注いたします。</p>
                </div>
              )
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => toast({ title: "ダウンロード", description: "発注書をPDFでダウンロードしました" })}>
              PDFでダウンロード
            </Button>
            <Button onClick={() => setShowPosterOrderDocumentModal(false)}>閉じる</Button>
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
            {(() => {
              const printingPartners = (tradingPartners ?? []).filter((t) => t.industry === "printing")
              const selectedPosterVendor =
                printingPartners.find((t) => t.id === posterOrderVendorId) ?? printingPartners[0]
              const displayVendorName = selectedPosterVendor?.name ?? ""
              return (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">発注先（印刷会社から選択）</label>
                    <Select
                      value={posterOrderVendorId || printingPartners[0]?.id || ""}
                      onValueChange={setPosterOrderVendorId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="印刷会社を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {printingPartners.map((tp) => (
                          <SelectItem key={tp.id} value={tp.id}>
                            {tp.name}（印刷会社）
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">取引先マスタの「印刷会社」から選択しています</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">イメージ画像添付</label>
                    <Input type="file" />
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
                      value={`${displayVendorName} 御中

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
                  {projectId && (() => {
                    const project = getProjectById(projectId)
                    if (!project) return null
                    return (
                      <div className="space-y-3 rounded-lg border p-4 bg-muted/20">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">発注書（プレビュー）</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">メールに添付する</span>
                            <Switch
                              checked={posterOrderAttachOrderDoc}
                              onCheckedChange={setPosterOrderAttachOrderDoc}
                            />
                          </div>
                        </div>
                        <div className="rounded-lg border bg-white p-4 text-black space-y-3 text-sm">
                          <div className="text-center border-b-2 border-black pb-2">
                            <h3 className="font-bold">発注書</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="text-muted-foreground">発注日</div>
                            <div>{new Date().toLocaleDateString("ja")}</div>
                            <div className="text-muted-foreground">発注先</div>
                            <div className="font-medium">{displayVendorName || "ー"}</div>
                            <div className="text-muted-foreground">案件名</div>
                            <div>{project.projectName || project.companyName + " " + (project.hallNames?.join("／") || "")}</div>
                            <div className="text-muted-foreground">会場</div>
                            <div>{project.hallNames?.join("、") || "ー"}</div>
                            <div className="text-muted-foreground">品名</div>
                            <div>ポスター制作</div>
                            <div className="text-muted-foreground">納期</div>
                            <div>初稿: {posterFirstDraftDate || "要相談"}／最終納品: 要相談</div>
                          </div>
                          <p className="text-xs text-muted-foreground pt-1">上記のとおり発注いたします。</p>
                        </div>
                      </div>
                    )
                  })()}
                </>
              )
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPosterOrderModal(false)}>
              キャンセル
            </Button>
            <Button
              onClick={() => {
                const printingPartners = (tradingPartners ?? []).filter((t) => t.industry === "printing")
                const selected = printingPartners.find((t) => t.id === posterOrderVendorId) ?? printingPartners[0]
                const project = projectId ? getProjectById(projectId) : null
                if (project) {
                  addPosterRequest({
                    projectId: project.id,
                    projectName: project.projectName,
                    companyName: project.companyName,
                    hallNames: project.hallNames,
                    eventStartDate: project.eventStartDate,
                    eventEndDate: project.eventEndDate,
                    requestedBy: project.salesPersonId,
                    requestedByName: employees.find((e) => e.id === project.salesPersonId)?.name,
                    vendorId: selected?.id ?? "",
                    vendorName: selected?.name,
                  })
                }
                setShowPosterOrderModal(false)
                setPosterOrderAttachOrderDoc(true)
                const attachNote = posterOrderAttachOrderDoc ? "発注書を添付し、" : ""
                toast({
                  title: "発注依頼を送信しました",
                  description: `${attachNote}${selected?.name ?? "印刷会社"}にポスター制作を依頼しました。`,
                })
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              送信する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {designRequestDetailId && (() => {
        const pr = getDesignRequestById(designRequestDetailId)
        if (!pr) return null
        const typeLabels = { poster: "ポスター依頼", dm: "DM依頼", "winner-list": "当選者リスト依頼" } as const
        const salesPersonName = employees.find((e) => e.id === selectedProject?.salesPersonId)?.name ?? "営業"
        return (
          <Dialog open={!!designRequestDetailId} onOpenChange={(open) => !open && (setDesignRequestDetailId(null), setDesignRequestCommentText(""))}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>{typeLabels[pr.requestType]}の詳細・コメント</DialogTitle>
                <DialogDescription>
                  {pr.vendorName} への依頼（{new Date(pr.requestedAt).toLocaleString("ja")}）
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
                <div className="text-sm">
                  <p className="font-medium">案件: {pr.companyName} / {pr.hallNames.join(", ")}</p>
                  {pr.uploadedFileName && (
                    <p className="mt-2 text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      アップロード済み: {pr.uploadedFileName}
                      {pr.uploadedAt && <span className="text-muted-foreground">（{new Date(pr.uploadedAt).toLocaleString("ja")}）</span>}
                    </p>
                  )}
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">コメント</Label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto rounded border p-3 bg-muted/30">
                    {pr.comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">まだコメントはありません</p>
                    ) : (
                      pr.comments.map((c) => (
                        <div key={c.id} className="text-sm">
                          <span className="font-medium text-muted-foreground">
                            {c.role === "SalesInsight" ? "営業" : "デザイン業者"}
                            {c.authorName && `（${c.authorName}）`}:
                          </span>{" "}
                          {c.text}
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {new Date(c.createdAt).toLocaleString("ja")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="design-request-comment">コメントを追加（営業）</Label>
                  <Textarea
                    id="design-request-comment"
                    placeholder="修正依頼や確認メッセージを入力"
                    value={designRequestCommentText}
                    onChange={(e) => setDesignRequestCommentText(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!designRequestCommentText.trim()) return
                      addPosterRequestComment(designRequestDetailId, {
                        role: "SalesInsight",
                        authorId: selectedProject?.salesPersonId,
                        authorName: salesPersonName,
                        text: designRequestCommentText.trim(),
                      })
                      setDesignRequestCommentText("")
                      toast({ title: "コメントを送信しました" })
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    送信
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )
      })()}

      <Dialog open={showDMCreateModal} onOpenChange={setShowDMCreateModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>DM作成依頼</DialogTitle>
            <DialogDescription>デザイン会社を選択し、依頼文を自動生成して送信</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>デザイン会社（マスタから選択）</Label>
              <Select value={dmCreateVendorId} onValueChange={setDmCreateVendorId}>
                <SelectTrigger>
                  <SelectValue placeholder="デザイン会社を選択" />
                </SelectTrigger>
                <SelectContent>
                  {(tradingPartners ?? [])
                    .filter((t) => t.industry === "design")
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">DMプレビュー</label>
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 aspect-[3/4] max-w-[280px] flex flex-col">
                    <div className="flex-1 p-4 flex flex-col justify-center text-center space-y-2">
                      <h3 className="text-lg font-bold text-foreground">大抽選会のご案内</h3>
                      <p className="text-sm font-semibold">
                        {selectedProject?.eventStartDate === selectedProject?.eventEndDate
                          ? selectedProject?.eventStartDate
                          : `${selectedProject?.eventStartDate ?? "ー"} ～ ${selectedProject?.eventEndDate ?? ""}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedProject?.hallNames?.join("／") || "ー"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedProject?.companyName || ""}
                      </p>
                    </div>
                    {dmImageUploaded && (
                      <div className="h-20 bg-muted/50 flex items-center justify-center border-t">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">依頼内容に応じたDMイメージ（イメージ画像ありの場合は下部に表示）</p>
                </div>
              </div>
              <div className="space-y-4">
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
                  <Button variant="ghost" size="icon" onClick={() => setDmImageUploaded(false)}>
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
              <Input value="【JAS】DM作成のご依頼" readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">本文（AI自動生成）</label>
              <textarea
                className="w-full min-h-[200px] p-3 border rounded-md"
                readOnly
                value={(() => {
                  const vendorName = (tradingPartners ?? []).find((t) => t.id === dmCreateVendorId)?.name ?? "デザイン業者"
                  return `${vendorName} 御中

いつもお世話になっております。
JASイベント管理チームです。

下記の内容でDMのデザイン作成をお願いいたします。

【案件情報】
- イベント名: ${selectedProject?.projectName || selectedProject?.hallNames?.join("／") || "ー"}
- イベント日: ${selectedProject?.eventStartDate ?? ""}${selectedProject?.eventEndDate && selectedProject.eventEndDate !== selectedProject?.eventStartDate ? ` ～ ${selectedProject.eventEndDate}` : ""}
${dmImageUploaded ? "- 添付: イメージ画像（dm_image_v1.jpg）" : ""}

【納期】
初稿: ${dmFirstDraftDate || "未設定"}まで

【注意事項】
- デザイン確定後、DM投函の手配をお願いいたします
- ご不明点がございましたらお気軽にお問い合わせください

よろしくお願いいたします。`
                })()}
              />
            </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDMCreateModal(false)}>
              キャンセル
            </Button>
            <Button
              disabled={!dmCreateVendorId || !selectedProject}
              onClick={() => {
                if (!selectedProject || !dmCreateVendorId) return
                const vendor = (tradingPartners ?? []).find((t) => t.id === dmCreateVendorId)
                addDesignRequest({
                  requestType: "dm",
                  projectId: selectedProject.id,
                  projectName: selectedProject.projectName,
                  companyName: selectedProject.companyName,
                  hallNames: selectedProject.hallNames,
                  eventStartDate: selectedProject.eventStartDate,
                  eventEndDate: selectedProject.eventEndDate,
                  requestedBy: selectedProject.salesPersonId,
                  requestedByName: employees.find((e) => e.id === selectedProject.salesPersonId)?.name,
                  vendorId: dmCreateVendorId,
                  vendorName: vendor?.name ?? "デザイン業者",
                })
                setShowDMCreateModal(false)
                toast({
                  title: "DM作成依頼を送信しました",
                  description: `${vendor?.name ?? "デザイン業者"}に通知が届きます。`,
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

export default function SalesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">読み込み中...</div>}>
      <SalesPageContent />
    </Suspense>
  )
}
