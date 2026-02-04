"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronLeft, ChevronsUpDown } from "lucide-react"

export type ProductTypeSelectionViewProps = {
  category: string
  onCategoryChange: (value: string) => void
  eventType: string
  onEventTypeChange: (value: string) => void
  eventTypeSearchOpen: boolean
  onEventTypeSearchOpenChange: (open: boolean) => void
  eventTypeSearchQuery: string
  onEventTypeSearchQueryChange: (value: string) => void
  onConfirm: () => void
  onBack: () => void
  confirmLabel?: string
  /** 画面上部のタイトル（未指定時は「商材を追加」） */
  title?: string
}

const EVENT_TYPES_BY_CATEGORY: Record<string, string[]> = {
  ポイント: ["合同抽選会"],
  イベント: [],
  オプション: [],
}

export function ProductTypeSelectionView({
  category,
  onCategoryChange,
  eventType,
  onEventTypeChange,
  eventTypeSearchOpen,
  onEventTypeSearchOpenChange,
  eventTypeSearchQuery,
  onEventTypeSearchQueryChange,
  onConfirm,
  onBack,
  confirmLabel = "次へ",
  title = "商材を追加",
}: ProductTypeSelectionViewProps) {
  const eventTypeOptions = category ? (EVENT_TYPES_BY_CATEGORY[category] ?? []) : []
  const canConfirm = !!category?.trim() && !!eventType?.trim()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button type="button" variant="ghost" size="icon" onClick={onBack} className="h-10 w-10">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">商材の種類を選択してください</CardTitle>
          <CardDescription>
            カテゴリとイベント区分を選択すると、必要な入力項目が表示されます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product-category" className="text-sm font-semibold">
              カテゴリ
            </Label>
            <Select value={category || undefined} onValueChange={onCategoryChange}>
              <SelectTrigger id="product-category" className="w-full">
                <SelectValue placeholder="カテゴリを選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ポイント">ポイント</SelectItem>
                <SelectItem value="イベント">イベント</SelectItem>
                <SelectItem value="オプション">オプション</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">イベント区分</Label>
            <Popover open={eventTypeSearchOpen} onOpenChange={onEventTypeSearchOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={eventTypeSearchOpen}
                  className="w-full justify-between"
                >
                  {eventType || "イベント区分を選択してください"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="イベント区分を検索..."
                    value={eventTypeSearchQuery}
                    onValueChange={onEventTypeSearchQueryChange}
                  />
                  <CommandList>
                    <CommandEmpty>イベント区分が見つかりませんでした</CommandEmpty>
                    <CommandGroup>
                      {eventTypeOptions
                        .filter((et) => et.toLowerCase().includes(eventTypeSearchQuery.toLowerCase()))
                        .map((et) => (
                          <CommandItem
                            key={et}
                            value={et}
                            onSelect={() => {
                              onEventTypeChange(et)
                              onEventTypeSearchOpenChange(false)
                              onEventTypeSearchQueryChange("")
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${eventType === et ? "opacity-100" : "opacity-0"}`} />
                            {et}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {category && eventTypeOptions.length === 0 && (
              <p className="text-sm text-slate-500">このカテゴリには登録可能なイベント区分がありません</p>
            )}
          </div>

          {!eventType?.trim() && category?.trim() && eventTypeOptions.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              まず「イベント区分」を選択してください。選択後に、実施日・見積などの入力項目が表示されます。
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              戻る
            </Button>
            <Button type="button" onClick={onConfirm} disabled={!canConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
