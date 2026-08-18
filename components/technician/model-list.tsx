"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Search, ChevronRight, X, Boxes, Sparkles, Star } from "lucide-react"
import { type Category, type SubCategory, type DeviceModel } from "@/lib/types"
import { getCategoryTheme, isModelInSubCategory } from "@/lib/category-theme"
import { cn } from "@/lib/utils"

export function ModelList({
  category,
  subCategory,
  subCategoryId,
  models,
  preview = false,
  onBack,
  onSelectModel,
}: {
  category: Category
  subCategory?: SubCategory | null
  subCategoryId?: string | null
  models: DeviceModel[]
  preview?: boolean
  onBack: () => void
  onSelectModel: (model: DeviceModel) => void
}) {
  const [query, setQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const theme = getCategoryTheme(category.slug)
  const CategoryIcon = theme.icon

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mazuma_tech_favorites")
      if (saved) setFavorites(JSON.parse(saved))
    } catch (e) {}
  }, [])

  const toggleFavorite = (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = favorites.includes(modelId)
      ? favorites.filter((id) => id !== modelId)
      : [...favorites, modelId]
    setFavorites(next)
    try {
      localStorage.setItem("mazuma_tech_favorites", JSON.stringify(next))
    } catch (e) {}
  }
  
  // Filter models for this subcategory using shared isModelInSubCategory logic
  const catModels = models.filter((m) =>
    isModelInSubCategory(m, category, subCategory, subCategoryId)
  )
  
  const results = query.trim() 
    ? catModels.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()) || m.code.toLowerCase().includes(query.toLowerCase()))
    : catModels

  return (
    <div className="mx-auto w-full max-w-[480px]">
      {/* Permanently Fixed Top Header */}
      <div
        className={cn(
          "fixed inset-x-0 z-30 flex justify-center pointer-events-none transition-all duration-300",
          preview ? "top-[41px]" : "top-0"
        )}
      >
        <div className="w-full max-w-[480px] pointer-events-auto px-4 pt-3 pb-2.5 bg-background/85 backdrop-blur-2xl border-b border-border/40 shadow-xs">
          {/* Top Header Card */}
          <div className="relative overflow-hidden rounded-[24px] border border-border/60 bg-card/80 backdrop-blur-xl p-3.5 shadow-sm">
            <div className={cn("absolute -top-12 -right-12 size-36 rounded-full blur-2xl pointer-events-none opacity-60", theme.accentGlow)} />

            {/* Title & Category Badge */}
            <div className="relative z-10 flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("flex size-10.5 shrink-0 items-center justify-center rounded-xl shadow-md transition-transform", theme.iconBg)}>
                  <CategoryIcon className="size-5.5 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-base font-bold leading-tight tracking-tight text-foreground truncate">
                    {subCategory?.name || "เลือกรุ่นสินค้า"}
                  </h1>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    <span className="font-semibold text-foreground/80">{category.name}</span>
                    {subCategory?.index ? ` (${subCategory.index})` : ""} • {catModels.length} รุ่น
                  </p>
                </div>
              </div>

              <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider border shadow-2xs font-mono", theme.badgeBg, theme.badgeText)}>
                {category.slug}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative z-10">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาด้วยชื่อรุ่น หรือรหัสสินค้า..."
                className="w-full rounded-xl border border-border/70 bg-background/90 py-2 pl-8.5 pr-8 text-xs text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-sm"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex size-4.5 items-center justify-center rounded-full bg-muted text-foreground/70 hover:text-foreground"
                >
                  <X className="size-2.5" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Model Cards Grid with Calibrated Top Clearance */}
      <div className={cn("px-4 pb-24 space-y-2.5", preview ? "pt-[190px]" : "pt-[150px]")}>
        {results.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              <span>รุ่นสินค้า ({results.length})</span>
            </p>
          </div>
        )}
        
        {results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-muted/20 px-4 py-12 text-center flex flex-col items-center justify-center">
            <Boxes className="size-12 text-muted-foreground/30 mb-3" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-foreground">ไม่พบรุ่นสินค้าที่ค้นหา</p>
            <p className="text-xs text-muted-foreground mt-1">ลองพิมพ์คำค้นหาอื่น หรือกดล้างคำค้นหา</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((m) => {
              const isFav = favorites.includes(m.id)

              return (
                <div
                  key={m.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectModel(m)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSelectModel(m)
                  }}
                  className="group relative flex items-center justify-between rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md p-3.5 text-left transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-md cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {/* Thumbnail / Icon Box */}
                    <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-background/90 flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105">
                      {m.thumbnail ? (
                        <img src={m.thumbnail} alt="" className="size-full object-cover" />
                      ) : (
                        <Boxes className="size-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="min-w-0">
                      <p className="font-display text-[14px] font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {m.name}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
                        <span className="font-semibold text-foreground/80">{m.code}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions (Favorite + Chevron) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(m.id, e)}
                      className={cn(
                        "p-1.5 rounded-full transition-colors",
                        isFav ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground/40 hover:text-amber-500"
                      )}
                      title="บันทึกเป็นรายการโปรด"
                    >
                      <Star className={cn("size-4", isFav ? "fill-amber-500" : "")} />
                    </button>
                    <div className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-background border border-border/50 group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground group-hover:translate-x-0.5 transition-all shadow-2xs">
                      <ChevronRight className="size-4" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
