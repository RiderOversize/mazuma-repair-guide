"use client"

import { useState } from "react"
import { ChevronLeft, Search, ChevronRight, X, Boxes } from "lucide-react"
import { type Category, type DeviceModel, getModelsByCategory } from "@/lib/mock-data"

export function ModelList({
  category,
  onBack,
  onSelectModel,
}: {
  category: Category
  onBack: () => void
  onSelectModel: (model: DeviceModel) => void
}) {
  const [query, setQuery] = useState("")
  const models = getModelsByCategory(category.id)
  
  const results = query.trim() 
    ? models.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.code.toLowerCase().includes(query.toLowerCase()))
    : models

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-16">
      <div className="sticky top-0 z-20 bg-background pt-14 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 hidden sm:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          กลับหน้าหลัก
        </button>

        <div className="mb-4">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-primary whitespace-nowrap">
            {category.name}
          </span>
          <h1 className="mt-1.5 font-display text-lg sm:text-xl font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">เลือกรุ่นสินค้า</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            กรุณาเลือกรุ่นที่ต้องการดูอาการเสีย
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาด้วยชื่อรุ่น หรือรหัส..."
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-sm outline-none ring-primary/30 focus:ring-2"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          พบ {results.length} รุ่น
        </p>
        
        {results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center flex flex-col items-center justify-center">
             <Boxes className="size-8 text-muted-foreground/30 mb-2" />
             <p className="text-sm text-muted-foreground">ไม่พบรุ่นสินค้า</p>
          </div>
        ) : (
          results.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectModel(m)}
              className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-muted"
            >
              <div>
                <p className="font-medium group-hover:text-primary transition-colors">{m.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  รหัส: {m.code}
                </p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
