"use client"

import { useState } from "react"
import { ChevronLeft, Search, ChevronRight, X, Boxes } from "lucide-react"
import { type Category, type SubCategory, type DeviceModel } from "@/lib/mock-data"

export function SubCategoryList({
  category,
  subCategories,
  models,
  onBack,
  onSelectSubCategory,
  onSelectModel,
}: {
  category: Category
  subCategories: SubCategory[]
  models: DeviceModel[]
  onBack: () => void
  onSelectSubCategory: (subCategory: SubCategory) => void
  onSelectModel?: (model: DeviceModel) => void
}) {
  const [query, setQuery] = useState("")
  const catSubCategories = subCategories.filter(sc => sc.categoryId === category.id)
  
  const results = query.trim() 
    ? catSubCategories.filter(sc => sc.name.toLowerCase().includes(query.toLowerCase()) || sc.id.toLowerCase().includes(query.toLowerCase()))
    : catSubCategories

  const modelResults = query.trim()
    ? models.filter(m => 
        (catSubCategories.some(sc => sc.id === m.subcategoryId) || m.categoryId === category.id) &&
        (m.name.toLowerCase().includes(query.toLowerCase()) || m.code.toLowerCase().includes(query.toLowerCase()))
      )
    : []

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
          <h1 className="mt-1.5 font-display text-lg sm:text-xl font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">เลือกประเภทสินค้าย่อย</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            กรุณาเลือกประเภทสินค้าย่อยที่ต้องการดูรุ่น
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาด้วยชื่อ หรือรหัส..."
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
          พบ {results.length} ประเภท
        </p>
        
        {results.length === 0 && modelResults.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center flex flex-col items-center justify-center">
             <Boxes className="size-8 text-muted-foreground/30 mb-2" />
             <p className="text-sm text-muted-foreground">ไม่พบประเภทสินค้าย่อยหรือสินค้ารุ่นนี้</p>
          </div>
        ) : (
          <>
            {results.map((sc) => {
              const numModels = models.filter(m => m.subcategoryId === sc.id || (m.categoryId === category.id && !m.subcategoryId)).length;
              
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => onSelectSubCategory(sc)}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-muted"
                >
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">{sc.id} - {sc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {numModels} รุ่น
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </button>
              )
            })}
            
            {modelResults.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  พบสินค้ารุ่นที่ตรงกัน ({modelResults.length} รุ่น)
                </p>
                <div className="flex flex-col gap-2">
                  {modelResults.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onSelectModel?.(m)}
                      className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-background flex items-center justify-center">
                          {m.thumbnail ? (
                            <img src={m.thumbnail} alt="" className="size-full object-cover" />
                          ) : (
                            <Boxes className="size-5 text-muted-foreground/40" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors line-clamp-1">{m.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                            {m.code}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
