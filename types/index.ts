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

export type Project = {
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
  // Additional fields for prize vendor
  deliveryVendor?: string
  orderFileName?: string
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
