"use client"

import { useState } from "react"
import { ChevronLeft, Search, ChevronRight, X, Boxes } from "lucide-react"
import { type Category, type DeviceModel } from "@/lib/types"

export function ModelList({
  category,
  subCategoryId,
  models,
  onBack,
  onSelectModel,
}: {
  category: Category
  subCategoryId?: string | null
  models: DeviceModel[]
  onBack: () => void
  onSelectModel: (model: DeviceModel) => void
}) {
  const [query, setQuery] = useState("")
  
  const catModels = models.filter(m => {
    if (m.categoryId !== category.id && m.categoryId !== category.slug) return false;
    if (subCategoryId) {
      return m.subcategoryId === subCategoryId || !m.subcategoryId;
    }
    return true;
  })
  
  const results = query.trim() 
    ? catModels.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.code.toLowerCase().includes(query.toLowerCase()))
    : catModels

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-24 pt-safe">
      <div className="sticky top-0 z-20 bg-background/70 backdrop-blur-2xl pt-14 pb-4 -mx-4 px-4 border-b border-border/40 mb-5">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ChevronLeft className="size-5" />
          <span>หน้าก่อนหน้า</span>
        </button>

        <div className="mb-4">
          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground">
            เลือกรุ่นสินค้า
          </h1>
          <p className="text-[13px] font-medium text-muted-foreground mt-1">
            ในหมวดหมู่ {category.name}
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาด้วยชื่อรุ่น หรือรหัส..."
            className="w-full rounded-2xl border-0 bg-muted/60 py-3 pl-11 pr-10 text-[15px] outline-none ring-primary/30 transition-all focus:bg-background focus:ring-2 focus:shadow-sm"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full bg-muted-foreground/20 text-foreground hover:bg-muted-foreground/30"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {results.length > 0 && (
          <p className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase pl-1">
            รุ่นทั้งหมด ({results.length})
          </p>
        )}
        
        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/50 bg-muted/30 px-4 py-10 text-center flex flex-col items-center justify-center">
             <Boxes className="size-10 text-muted-foreground/30 mb-3" strokeWidth={1.5} />
             <p className="text-[15px] font-medium text-muted-foreground">ไม่พบรุ่นสินค้า</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm">
            {results.map((m, i) => {
              const isLast = i === results.length - 1;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectModel(m)}
                  className={`group flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors active:bg-muted/50 ${!isLast ? 'border-b border-border/40' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-lg border border-border/40 bg-background flex items-center justify-center shadow-sm">
                      {m.thumbnail ? (
                        <img src={m.thumbnail} alt="" className="size-full object-cover" />
                      ) : (
                        <Boxes className="size-5 text-muted-foreground/40" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[15px] group-hover:text-primary transition-colors line-clamp-1">{m.name}</p>
                      <p className="text-[13px] text-muted-foreground mt-0.5 font-mono">
                        {m.code}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground/40 shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
