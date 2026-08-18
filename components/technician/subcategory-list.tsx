"use client"

import { useState } from "react"
import { ChevronLeft, Search, ChevronRight, X, Boxes, Sparkles, ArrowRight } from "lucide-react"
import { type Category, type SubCategory, type DeviceModel } from "@/lib/types"
import { getCategoryTheme, isModelInSubCategory } from "@/lib/category-theme"
import { cn } from "@/lib/utils"

export function SubCategoryList({
  category,
  subCategories,
  models,
  preview = false,
  onBack,
  onSelectSubCategory,
  onSelectModel,
}: {
  category: Category
  subCategories: SubCategory[]
  models: DeviceModel[]
  preview?: boolean
  onBack: () => void
  onSelectSubCategory: (subCategory: SubCategory) => void
  onSelectModel?: (model: DeviceModel) => void
}) {
  const [query, setQuery] = useState("")
  const theme = getCategoryTheme(category.slug)
  const CategoryIcon = theme.icon

  const catSubCategories = subCategories.filter(
    (sc) => sc.categoryId === category.id || sc.categoryId === category.slug
  )

  const results = query.trim()
    ? catSubCategories.filter(
        (sc) =>
          sc.name.toLowerCase().includes(query.toLowerCase()) ||
          sc.id.toLowerCase().includes(query.toLowerCase()) ||
          (sc.index && sc.index.toLowerCase().includes(query.toLowerCase()))
      )
    : catSubCategories

  const modelResults = query.trim()
    ? models.filter(
        (m) =>
          (catSubCategories.some((sc) => sc.id === m.subcategoryId || sc.index === m.subcategoryId) ||
            m.categoryId === category.id || m.categoryId === category.slug) &&
          (m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.code.toLowerCase().includes(query.toLowerCase()))
      )
    : []

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
            {/* Background Ambient Glow */}
            <div className={cn("absolute -top-12 -right-12 size-36 rounded-full blur-2xl pointer-events-none opacity-60", theme.accentGlow)} />
            
            {/* Category Title, Icon & Badge */}
            <div className="relative z-10 flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("flex size-10.5 shrink-0 items-center justify-center rounded-xl shadow-md transition-transform", theme.iconBg)}>
                  <CategoryIcon className="size-5.5 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-base font-bold leading-tight tracking-tight text-foreground truncate">
                    {category.name}
                  </h1>
                  <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate">
                    <span>เลือกประเภทสินค้าย่อย</span>
                    <span className="opacity-40">•</span>
                    <span className="font-medium text-foreground/80">{catSubCategories.length} ประเภท</span>
                  </p>
                </div>
              </div>

              <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider border shadow-2xs font-mono", theme.badgeBg, theme.badgeText)}>
                {category.slug}
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative z-10">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาประเภทสินค้าย่อย หรือรหัส..."
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

      {/* Scrollable Subcategories List with Calibrated Top Clearance */}
      <div className={cn("px-4 pb-24 space-y-2.5", preview ? "pt-[190px]" : "pt-[150px]")}>
        {results.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              <span>ประเภทสินค้าย่อย ({results.length})</span>
            </p>
          </div>
        )}

        {results.length === 0 && modelResults.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-muted/20 px-4 py-12 text-center flex flex-col items-center justify-center">
            <Boxes className="size-12 text-muted-foreground/30 mb-3" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-foreground">ไม่พบประเภทสินค้าที่ค้นหา</p>
            <p className="text-xs text-muted-foreground mt-1">ลองค้นหาด้วยคำอื่น หรือกดล้างคำค้นหา</p>
          </div>
        ) : (
          <>
            {results.map((sc) => {
              const numModels = models.filter((m) => isModelInSubCategory(m, category, sc)).length
              const subCode = sc.index || sc.id

              return (
                <div
                  key={sc.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectSubCategory(sc)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSelectSubCategory(sc)
                  }}
                  className={cn(
                    "group relative flex items-center justify-between overflow-hidden rounded-[22px] border bg-gradient-to-r p-3.5 text-left backdrop-blur-md transition-all duration-300 ease-out cursor-pointer",
                    "hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]",
                    theme.border,
                    theme.borderHover,
                    theme.gradient,
                    theme.bgHover,
                    "bg-card/80 dark:bg-card/50"
                  )}
                >
                  {/* Watermark Icon */}
                  <div className="absolute -right-2 -bottom-2 pointer-events-none opacity-[0.03] dark:opacity-[0.06] group-hover:opacity-[0.10] group-hover:scale-110 transition-all duration-500">
                    <CategoryIcon className="size-20" />
                  </div>

                  {/* Left: Code badge & Name */}
                  <div className="relative z-10 flex items-center gap-3 min-w-0 pr-2">
                    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl font-mono text-[11px] font-bold border transition-transform duration-300 group-hover:scale-105", theme.badgeBg, theme.badgeText)}>
                      {subCode ? subCode.replace(`${category.slug}-`, "") : "01"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-[14px] font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {sc.name}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        {subCode}
                      </p>
                    </div>
                  </div>

                  {/* Right: Model Count & Chevron */}
                  <div className="relative z-10 flex items-center gap-2.5 shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-background/80 dark:bg-background/60 border border-border/60 px-2.5 py-1 text-[11px] font-semibold text-foreground/80 group-hover:border-primary/40 group-hover:text-primary transition-colors shadow-2xs">
                      <span className="size-1.5 rounded-full bg-primary/70 group-hover:bg-primary group-hover:animate-ping" />
                      {numModels} รุ่น
                    </span>
                    <div className="flex size-8 items-center justify-center rounded-full bg-background/80 border border-border/50 text-muted-foreground group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground group-hover:translate-x-0.5 transition-all shadow-2xs">
                      <ChevronRight className="size-4" />
                    </div>
                  </div>
                </div>
              )
            })}

            {/* If direct model results exist from search */}
            {modelResults.length > 0 && (
              <div className="pt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground px-1">
                  รุ่นสินค้าที่ตรงกับคำค้นหา ({modelResults.length})
                </p>
                <div className="space-y-2">
                  {modelResults.map((m) => (
                    <div
                      key={m.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectModel?.(m)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onSelectModel?.(m)
                      }}
                      className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card/80 p-3 text-left backdrop-blur-md transition-all hover:border-primary/40 hover:bg-muted/40 cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                          <Boxes className="size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {m.name}
                          </p>
                          <p className="text-[10.5px] font-mono text-muted-foreground mt-0.5 truncate">
                            {m.code}
                          </p>
                        </div>
                      </div>
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="size-3.5" />
                      </div>
                    </div>
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
