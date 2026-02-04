import type { DemoDbData } from "./types"

export const DEMO_DB_STORAGE_KEY = "demo-jai-goudou:demo-db"

function getInitialData(): DemoDbData {
  return {
    employees: [
      { id: "E001", name: "田中太郎", email: "tanaka@example.com" },
      { id: "E002", name: "佐藤花子", email: "sato@example.com" },
      { id: "E003", name: "鈴木一郎", email: "suzuki@example.com" },
      { id: "E004", name: "高橋美咲", email: "takahashi@example.com" },
      { id: "E005", name: "伊藤健太", email: "ito@example.com" },
      { id: "E006", name: "渡辺さくら", email: "watanabe@example.com" },
    ],
    companies: [
      { id: "C001", name: "株式会社オメガ", salesPersonId: "E001", email: "omega@example.com" },
      { id: "C002", name: "株式会社メガ", salesPersonId: "E002", email: "mega@example.com" },
      { id: "C003", name: "株式会社サンライズ", salesPersonId: "E003", email: "sunrise@example.com" },
      { id: "C004", name: "株式会社スカイ", salesPersonId: "E004", email: "sky@example.com" },
      { id: "C005", name: "株式会社デルタ", salesPersonId: "E005", email: "delta@example.com" },
    ],
    halls: [
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
    ],
    projects: [
      {
        id: "P001",
        companyName: "株式会社メガ",
        hallNames: ["メガホール大阪", "メガホール東京"],
        eventStartDate: "2024-11-15",
        eventEndDate: "2024-11-15",
        area: "大阪府大阪市",
        status: "order-received",
        budget: "450,000",
        createdAt: "2024-10-01",
        salesPersonId: "E002",
        insightPersonId: "E004",
        dmMailing: "yes",
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
        prizeInfo: [
          { prizeId: "PRZ001", rank: "A賞", name: "クオカード 10,000円", quantity: "1" },
          { prizeId: "PRZ002", rank: "B賞", name: "商品券 5,000円", quantity: "3" },
          { prizeId: "PRZ003", rank: "C賞", name: "粗品セット", quantity: "50" },
        ],
      },
      {
        id: "P002",
        companyName: "株式会社サンライズ",
        hallNames: ["サンライズホール名古屋", "サンライズホール福岡"],
        eventStartDate: "2024-12-10",
        eventEndDate: "2024-12-10",
        area: "愛知県名古屋市",
        status: "proposing",
        budget: "280,000",
        createdAt: "2024-10-15",
        salesPersonId: "E003",
        insightPersonId: "E005",
        dmMailing: "no",
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
        prizeInfo: [
          { prizeId: "PRZ004", rank: "1等", name: "旅行券 30,000円", quantity: "1" },
          { prizeId: "PRZ005", rank: "2等", name: "ギフトカード 5,000円", quantity: "5" },
          { prizeId: "PRZ006", rank: "3等", name: "オリジナルグッズ", quantity: "100" },
        ],
      },
      {
        id: "P003",
        companyName: "株式会社スカイ",
        hallNames: ["スカイホール福岡", "スカイホール広島"],
        eventStartDate: "2025-01-20",
        eventEndDate: "2025-01-20",
        area: "福岡県福岡市",
        status: "proposing",
        budget: "350,000",
        createdAt: "2024-11-01",
        salesPersonId: "E004",
        insightPersonId: "E006",
        dmMailing: "yes",
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
        prizeInfo: [
          { prizeId: "PRZ022", rank: "特賞", name: "ギフトカード 10,000円", quantity: "1" },
          { prizeId: "PRZ020", rank: "A賞", name: "スイーツギフト", quantity: "10" },
          { prizeId: "PRZ021", rank: "B賞", name: "クリスマスグッズ", quantity: "50" },
        ],
      },
    ],
    prizeVendors: [
      { id: "PV001", name: "景品業者A", email: "prize-a@example.com" },
      { id: "PV002", name: "景品業者B", email: "prize-b@example.com" },
      { id: "PV003", name: "景品業者C", email: "prize-c@example.com" },
    ],
    prizes: [
      { id: "PRZ001", name: "クオカード 10,000円", vendorId: "PV001" },
      { id: "PRZ002", name: "商品券 5,000円", vendorId: "PV001" },
      { id: "PRZ003", name: "粗品セット", vendorId: "PV001" },
      { id: "PRZ004", name: "旅行券 30,000円", vendorId: "PV001" },
      { id: "PRZ005", name: "ギフトカード 5,000円", vendorId: "PV002" },
      { id: "PRZ006", name: "オリジナルグッズ", vendorId: "PV002" },
      { id: "PRZ007", name: "宿泊券 20,000円分", vendorId: "PV002" },
      { id: "PRZ008", name: "レストラン券 3,000円", vendorId: "PV002" },
      { id: "PRZ009", name: "映画チケット", vendorId: "PV002" },
      { id: "PRZ010", name: "ノベルティ", vendorId: "PV002" },
      { id: "PRZ011", name: "ビール券 10,000円分", vendorId: "PV002" },
      { id: "PRZ012", name: "クオカード 3,000円", vendorId: "PV002" },
      { id: "PRZ013", name: "ドリンク券", vendorId: "PV002" },
      { id: "PRZ014", name: "健康食品ギフト", vendorId: "PV003" },
      { id: "PRZ015", name: "商品券 2,000円", vendorId: "PV003" },
      { id: "PRZ016", name: "お菓子詰め合わせ", vendorId: "PV003" },
      { id: "PRZ017", name: "お菓子詰め合わせ 5,000円", vendorId: "PV003" },
      { id: "PRZ018", name: "ハロウィングッズ", vendorId: "PV003" },
      { id: "PRZ019", name: "キャンディ", vendorId: "PV003" },
      { id: "PRZ020", name: "スイーツギフト", vendorId: "PV003" },
      { id: "PRZ021", name: "クリスマスグッズ", vendorId: "PV001" },
      { id: "PRZ022", name: "ギフトカード 10,000円", vendorId: "PV001" },
      { id: "PRZ023", name: "粗品A", vendorId: "PV001" },
      { id: "PRZ024", name: "粗品B", vendorId: "PV002" },
      { id: "PRZ025", name: "商品券 1,000円", vendorId: "PV003" },
      { id: "PRZ026", name: "限定グッズ", vendorId: "PV003" },
    ],
    tradingPartners: [
      { id: "TP001", name: "印刷会社A", industry: "printing", email: "print-a@example.com" },
      { id: "TP002", name: "印刷会社B", industry: "printing", email: "print-b@example.com" },
      { id: "TP003", name: "印刷会社C", industry: "printing", email: "print-c@example.com" },
      { id: "TP004", name: "デザイン工房α", industry: "design", email: "design-alpha@example.com" },
      { id: "TP005", name: "デザインスタジオβ", industry: "design", email: "design-beta@example.com" },
      { id: "TP006", name: "景品業者A", industry: "prize", email: "prize-a@example.com" },
      { id: "TP007", name: "景品業者B", industry: "prize", email: "prize-b@example.com" },
    ],
    designRequests: [],
  }
}

export function getInitialDemoDbData(): DemoDbData {
  return getInitialData()
}

export function loadDemoDbFromStorage(): DemoDbData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(DEMO_DB_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<DemoDbData>
    if (!parsed || typeof parsed !== "object") return null
    if (!Array.isArray(parsed.projects)) return null
    if (!Array.isArray(parsed.companies)) return null
    if (!Array.isArray(parsed.halls)) return null
    if (!Array.isArray(parsed.employees)) return null
    const initial = getInitialData()
    const legacyStatusMap: Record<string, "before-proposal" | "proposing" | "order-received"> = {
      draft: "before-proposal",
      "before-proposal": "before-proposal",
      "quote-created": "proposing",
      "before-order": "proposing",
      proposing: "proposing",
      confirmed: "order-received",
      "in-progress": "proposing",
      completed: "order-received",
      "order-received": "order-received",
    }
    const projects = (parsed.projects as Array<{ status?: string; [k: string]: unknown }>).map((p) => ({
      ...p,
      status: legacyStatusMap[p.status ?? ""] ?? "before-proposal",
    }))
    return {
      projects,
      companies: parsed.companies,
      halls: parsed.halls,
      employees: parsed.employees,
      prizeVendors: Array.isArray(parsed.prizeVendors) && parsed.prizeVendors.length > 0 ? parsed.prizeVendors : initial.prizeVendors,
      prizes: Array.isArray(parsed.prizes) && parsed.prizes.length > 0 ? parsed.prizes : initial.prizes,
      tradingPartners: Array.isArray(parsed.tradingPartners) && parsed.tradingPartners.length > 0 ? parsed.tradingPartners : initial.tradingPartners,
      designRequests: (() => {
        if (Array.isArray(parsed.designRequests)) return parsed.designRequests
        if (Array.isArray(parsed.posterRequests)) {
          return (parsed.posterRequests as Array<Record<string, unknown>>).map((r, i) => ({
            ...r,
            requestType: "poster" as const,
            id: (r.id as string)?.startsWith("PR") ? r.id : `DR${String(i + 1).padStart(3, "0")}`,
          }))
        }
        return initial.designRequests
      })(),
    }
  } catch {
    return null
  }
}

export function saveDemoDbToStorage(data: DemoDbData): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(DEMO_DB_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore quota / private mode
  }
}

export function clearDemoDbStorage(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(DEMO_DB_STORAGE_KEY)
  } catch {
    // ignore
  }
}
