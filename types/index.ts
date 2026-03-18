export type QuoteItem = {
  id: number
  name: string
  quantity: number
  unitPrice: number
  included: boolean
}

export type HallQuote = {
  hallName: string
  quoteItems: QuoteItem[]
  percentage?: number
  calculatedAmount?: number
}

/** ロール: 営業・インサイト / デザイン業者 / 景品業者 / 事務管理課 */
export type GoudouRole = "SalesInsight" | "DesignVendor" | "PrizeVendor" | "Admin"

export type Project = {
  id: string
  /** 案件No（表示用、未指定時は id を使用） */
  projectNumber?: string
  /** 案件名（表示用、未指定時は法人名・ホール名から算出） */
  projectName?: string
  companyName: string
  hallNames: string[]
  eventStartDate: string
  eventEndDate: string
  area: string
  /** 提案前 | 提案中 | 受注 */
  status: "before-proposal" | "proposing" | "order-received"
  /** ヨミ（A/B/C）。提案前・提案中のときのみ入力可能 */
  readingCertainty?: "A" | "B" | "C"
  /** DM投函有無。有の場合のみ制作進行でDM作成依頼〜投函の流れを表示 */
  dmMailing?: "yes" | "no"
  budget: string
  createdAt: string
  salesPersonId: string
  /** 本案件のインサイト担当（従業員ID） */
  insightPersonId?: string
  posterCount?: string
  target?: string
  hallQuotes?: HallQuote[]
  /** 景品情報（商材）。rank, name, quantity, prizeId（景品マスタ参照） */
  prizeInfo?: { rank: string; name: string; quantity: string; prizeId?: string }[]
  // Additional fields for prize vendor
  deliveryVendor?: string
  orderFileName?: string
  /** 事務管理課で景品発注メール送信した日時（ISO）。景品業者画面で発注書・依頼を表示するために使用 */
  prizeOrderRequestedAt?: string
  /** 景品発注書の内容（事務管理課で送信時に保存。景品業者画面で表示）※1業者のみの場合はこちらも使用 */
  prizeOrderDocument?: {
    vendorName: string
    requestedAt: string
    projectName: string
    hallNames: string
    prizeNames: string
    totalQuantity: number
  }
  /** 業者ごとの景品発注依頼（複数業者へ送信した場合。景品業者画面で表示） */
  prizeOrdersByVendor?: {
    vendorId: string
    vendorName: string
    requestedAt: string
    document: {
      projectName: string
      hallNames: string
      prizeNames: string
      totalQuantity: number
    }
  }[]
  /** 事務管理課: 当選者リストアップロード済み日時（ISO）。再表示用 */
  winnerListUploadedAt?: string
  /** 事務管理課: 当選者リスト検証済み日時（ISO） */
  winnerListValidatedAt?: string
  /** 事務管理課: 当選通知書の依頼先デザイン業者（1社。取引先ID） */
  notificationOrderDesignVendorId?: string
  /** 事務管理課: 当選通知書の依頼先デザイン業者名（表示用） */
  notificationOrderDesignVendorName?: string
  /** 事務管理課: 当選者通知発注データ生成済み日時（ISO） */
  notificationOrderGeneratedAt?: string
  /** 事務管理課: 当選者通知依頼メール送信済み日時（ISO） */
  notificationOrderSentAt?: string
  /** 事務管理課: 景品発注書生成済み日時（ISO）。再表示用 */
  prizeOrderGeneratedAt?: string
  /** 事務管理課: クオカード書簡チェック済み日時（ISO） */
  quoCardLetterCheckedAt?: string
  /** 当選者リスト（事務管理課で検証済みのとき保存。景品業者画面で配送情報を当選者ごとに入力するために使用） */
  winnerList?: { id: string; name: string; address?: string; phone?: string; prize?: string }[]
  /** 景品業者ごとに入力された配送情報（景品業者画面で送信→事務管理課で参照）。当選者一人ひとり分の配送情報を deliveries に格納 */
  prizeDeliveryInfoByVendor?: {
    vendorId: string
    vendorName: string
    deliveredAt: string
    /** 従来形式（1業者1件）の場合は未使用 */
    carrierName?: string
    trackingNumber?: string
    shippedAt?: string
    /** 当選者ごとの配送情報（景品業者画面で一人ずつ入力） */
    deliveries?: {
      winnerId: string
      winnerName?: string
      carrierName?: string
      trackingNumber?: string
      shippedAt?: string
    }[]
  }[]
}

export type Employee = {
  id: string
  name: string
  email?: string
}

export type Company = {
  id: string
  name: string
  salesPersonId: string
  email?: string
}

export type Hall = {
  id: string
  name: string
  companyId: string
  salesPersonId: string
  email?: string
}

<<<<<<< Updated upstream
/** 景品業者（1業者に複数景品が紐づく: 多対1） */
export type PrizeVendor = {
  id: string
  name: string
  email?: string
}

/** 景品マスタ（1景品は1業者に紐づく） */
export type Prize = {
  id: string
  name: string
  vendorId: string
}

/** 業種: 印刷会社 / デザイン会社 / 景品会社 */
export type TradingPartnerIndustry = "printing" | "design" | "prize"

/** 取引先マスタ（企業情報・業種付き） */
export type TradingPartner = {
  id: string
  name: string
  /** 印刷会社 | デザイン会社 | 景品会社 */
  industry: TradingPartnerIndustry
  email?: string
}

/** デザイン依頼（ポスター/DM/当選者リスト）へのコメント（営業⇔デザイン業者） */
export type DesignRequestComment = {
  id: string
  role: "SalesInsight" | "DesignVendor"
  authorId?: string
  authorName: string
  text: string
  createdAt: string
}

/** 依頼種別: ポスター / DM / 当選者リスト */
export type DesignRequestType = "poster" | "dm" | "winner-list"

/** デザイン依頼（営業→デザイン業者、アップロード・コメント連携）ポスター・DM・当選者リスト共通 */
export type DesignRequest = {
  id: string
  requestType: DesignRequestType
  projectId: string
  projectName?: string
  companyName: string
  hallNames: string[]
  eventStartDate?: string
  eventEndDate?: string
  requestedAt: string
  requestedBy: string
  requestedByName?: string
  status: "requested" | "uploaded"
  vendorId: string
  vendorName?: string
  uploadedFileName?: string
  uploadedAt?: string
  comments: DesignRequestComment[]
}

/** @deprecated use DesignRequestComment */
export type PosterRequestComment = DesignRequestComment

/** @deprecated use DesignRequest */
export type PosterRequest = DesignRequest
=======
export type RecordItem = {
  id: string
  projectId: string
  projectCode: string
  recordNumber: number
  recordTitle: string
  storeCode: string
  storeName: string
  orderDate: string
  publishStartDate: string
  publishEndDate: string
  publishDays: number
  netAmount: number
  dailyBudget: number
  campaignPurpose: string
  billingMethod: string
  deliveryArea: string
  target: string
  salesApplicationDate?: string
  acquirer?: string
  hall担当?: string
  companyName?: string
  hallName?: string
  productCategory: "イベント" | "ポイント" | "オプション"
  productName: string
  eventCategory: string
  status: string
  projectName?: string
}

export type SearchCondition = {
  id: string
  name: string
  productCategory: string
  productName: string
  projectNumber: string
  recordNumber: string
  statuses: string[]
}

export type ProductItem = {
  id: string
  projectId: string
  category: "ポスター" | "DM" | "抽選" | "デジタル広告" | "その他"
  name: string
  startDate: string
  endDate: string
  status: "提案中" | "進行中" | "完了" | "キャンセル"
  casting?: string
  estimateAmount: number
}
>>>>>>> Stashed changes
