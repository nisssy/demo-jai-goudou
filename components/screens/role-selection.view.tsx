"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Palette, Package, ClipboardList } from "lucide-react"
import type { GoudouRole } from "@/types"

export type RoleSelectionViewProps = {
  onSelectRole: (role: GoudouRole) => void
}

export function RoleSelectionView({ onSelectRole }: RoleSelectionViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            DMM アミューズメント事業部 業務アプリ
          </h1>
          <p className="text-lg text-slate-600">
            ロールを選択してください
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectRole("SalesInsight")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">営業・インサイト</CardTitle>
              <CardDescription className="text-base">
                案件の登録、見積もりの作成・提示を行います
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectRole("Admin")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <ClipboardList className="h-8 w-8 text-slate-600" />
              </div>
              <CardTitle className="text-2xl">事務管理課</CardTitle>
              <CardDescription className="text-base">
                抽選・景品・配送の実行と管理を行います
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectRole("DesignVendor")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <Palette className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">デザイン業者</CardTitle>
              <CardDescription className="text-base">
                デザイン・制作の依頼確認と納品を行います
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectRole("PrizeVendor")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-violet-600" />
              </div>
              <CardTitle className="text-2xl">景品業者</CardTitle>
              <CardDescription className="text-base">
                景品手配の依頼確認と発送・納品を行います
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
