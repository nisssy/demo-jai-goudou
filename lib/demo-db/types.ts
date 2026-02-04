import type { Project, Company, Hall, Employee, PrizeVendor, Prize, TradingPartner, DesignRequest } from "@/types"

export type { Project, Company, Hall, Employee, PrizeVendor, Prize, TradingPartner, DesignRequest }

export type DemoDbData = {
  projects: Project[]
  companies: Company[]
  halls: Hall[]
  employees: Employee[]
  prizeVendors: PrizeVendor[]
  prizes: Prize[]
  tradingPartners: TradingPartner[]
  designRequests: DesignRequest[]
}
