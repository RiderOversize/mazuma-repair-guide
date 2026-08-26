"use client"

import { useState } from "react"
import {
  ChevronLeft,
  Stethoscope,
  Wrench,
  ArrowRight,
  Tag,
  Activity,
  BookOpen,
} from "lucide-react"
import {
  type Category,
  type DeviceModel,
  type Guide,
  type SymptomType,
  type Symptom,
} from "@/lib/types"
import { getCategoryTheme } from "@/lib/category-theme"
import { cn } from "@/lib/utils"

export function SymptomList({
  category,
  model,
  guides,
  symptomTypes,
  symptoms,
  mappings,
  preview = false,
  onBack,
  onSelectGuide,
}: {
  category: Category
  model?: DeviceModel | null
  guides: Guide[]
  symptomTypes: SymptomType[]
  symptoms: Symptom[]
  mappings?: any[]
  preview?: boolean
  onBack: () => void
  onSelectGuide: (guide: Guide) => void
}) {
  const theme = getCategoryTheme(category.slug)
  const CategoryIcon = theme.icon

  // 1. Resolve symptomTypeId from model, or from MasterData mappings
  let resolvedSymptomTypeId = (model?.symptomTypeId || "").trim()
  if (!resolvedSymptomTypeId && model && mappings && mappings.length > 0) {
    const map = mappings.find(
      (m: any) =>
        (m.modelCode && model.code && m.modelCode.trim().toLowerCase() === model.code.trim().toLowerCase()) ||
        (m.modelName && model.name && m.modelName.trim().toLowerCase() === model.name.trim().toLowerCase()) ||
        (model.code && m.modelCode && (model.code.includes(m.modelCode) || m.modelCode.includes(model.code))) ||
        (model.name && m.modelName && (model.name.includes(m.modelName) || m.modelName.includes(model.name)))
    )
    if (map?.symptomTypeCode) {
      resolvedSymptomTypeId = map.symptomTypeCode.trim()
    }
  }

  const symptomGroup = symptomTypes.find((t) => t.id === resolvedSymptomTypeId)

  // Filter symptoms strictly for this symptomType if model exists
  // If NO model, show ALL symptoms for this category!
  const applicableSymptoms = model && resolvedSymptomTypeId
    ? symptoms.filter((s) => {
        if (s.symptomTypeId !== resolvedSymptomTypeId) return false
        if (s.specificModelIds && s.specificModelIds.length > 0 && model) {
          if (!s.specificModelIds.includes(model.id)) {
            return false
          }
        }
        return true
      })
    : symptoms.filter((s) => {
        // Find if this symptom belongs to a symptomType that belongs to this category
        const sType = symptomTypes.find(t => t.id === s.symptomTypeId)
        
        // 1. Check direct property
        if (sType && (sType.categoryId === category.id || sType.categoryId === category.slug || sType.subcategoryId === category.id)) {
          return true
        }
        
        // 2. Check mappings (MasterData)
        if (mappings && mappings.length > 0) {
          const isMapped = mappings.some(m => 
            (m.matCategoryCode?.toLowerCase() === category.slug.toLowerCase() || 
             m.matCategoryCode?.toLowerCase() === category.id.toLowerCase()) && 
            m.symptomTypeCode === s.symptomTypeId
          )
          if (isMapped) return true
        }

        // 3. Check guides (if there's a guide for this symptom and this category)
        const hasGuideInCat = guides.some(g => 
          g.symptomId === s.id && 
          (g.categoryId === category.id || g.categoryId === category.slug)
        )
        if (hasGuideInCat) return true

        return false
      })

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Permanently Sticky Top Header */}
      <div className="sticky top-0 z-30 flex justify-center transition-all duration-300 w-full">
        <div className="w-full bg-background/85 backdrop-blur-2xl px-4 pt-3 pb-2.5 border-b border-border/40 shadow-xs">
          {/* Top Header Card */}
          <div className="relative overflow-hidden rounded-[24px] border border-border/60 bg-card/80 backdrop-blur-xl p-3.5 shadow-sm">
            <div className={cn("absolute -top-12 -right-12 size-36 rounded-full blur-2xl pointer-events-none opacity-60", theme.accentGlow)} />

            {/* Model / Category Details with Category Slug Badge */}
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-background flex items-center justify-center shadow-md">
                  {model && model.thumbnail && model.thumbnail.trim() !== "" ? (
                    <img src={model.thumbnail} alt="" className="size-full object-cover" />
                  ) : (
                    <CategoryIcon className="size-5 text-primary" />
                  )}
                </div>
                <div className="flex flex-col items-start pt-1">
                  <span className={cn("rounded-full px-2 py-0.5 text-[0.625rem] font-bold tracking-wider mb-1", theme.badgeBg, theme.badgeText)}>
                    {category.slug}
                  </span>
                  <h1 className="font-display text-[1.125rem] font-bold leading-none text-foreground truncate max-w-[200px]">
                    {model ? model.name : category.name}
                  </h1>
                  <p className="text-xs font-semibold text-muted-foreground mt-1 truncate">
                    {model ? model.code : "วินิจฉัยรวมทุกรุ่น"}
                  </p>
                </div>
              </div>

              <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-bold tracking-wider border shadow-2xs font-mono", theme.badgeBg, theme.badgeText)}>
                {category.slug}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Symptoms List */}
      <div className="px-4 pt-4 pb-24 space-y-2.5">
        {/* Symptom Group Card (if available) */}
        {symptomGroup ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-3 mb-2 shadow-xs">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Activity className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{symptomGroup.name}</p>
              <p className="text-[0.65625rem] font-mono text-muted-foreground mt-0.5">รหัสกลุ่มอาการ: {symptomGroup.id}</p>
            </div>
          </div>
        ) : !model && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-3 mb-2 shadow-xs">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Activity className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">หมวดหมู่: {category.name}</p>
              <p className="text-[0.65625rem] font-medium text-muted-foreground mt-0.5">แสดงอาการเสียทั้งหมดของสินค้านี้</p>
            </div>
          </div>
        )}

        {/* Symptoms List */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Stethoscope className="size-3.5 text-primary" />
              <span>อาการเสียที่พบ ({applicableSymptoms.length})</span>
            </p>
          </div>

          {applicableSymptoms.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 bg-muted/20 px-4 py-12 text-center flex flex-col items-center justify-center">
              <Wrench className="size-12 text-muted-foreground/30 mb-3" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-foreground">ยังไม่มีรายการอาการเสียสำหรับรุ่นนี้</p>
              <p className="text-xs text-muted-foreground mt-1">สามารถแจ้ง Admin เพิ่มคู่มือรุ่นนี้ได้ในระบบ</p>
            </div>
          ) : (
            <div className="space-y-2">
              {applicableSymptoms.map((sym) => {
                const symGuides = guides.filter((g) => g.symptomId === sym.id && g.status === "published")
                const hasGuide = symGuides.length > 0

                return (
                  <div
                    key={sym.id}
                    role="button"
                    tabIndex={hasGuide ? 0 : undefined}
                    onClick={() => {
                      if (hasGuide) onSelectGuide(symGuides[0])
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && hasGuide) onSelectGuide(symGuides[0])
                    }}
                    className={cn(
                      "group relative flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all duration-300 backdrop-blur-md",
                      hasGuide
                        ? "border-border/60 bg-card/80 hover:border-primary/40 hover:bg-muted/40 hover:shadow-md cursor-pointer active:scale-[0.99]"
                        : "border-border/40 bg-muted/20 opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={cn(
                          "flex size-9.5 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300",
                          hasGuide
                            ? "bg-primary/10 text-primary border-primary/20 group-hover:scale-105"
                            : "bg-muted text-muted-foreground border-border/40"
                        )}
                      >
                        <Stethoscope className="size-4.5" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-display text-[0.84375rem] font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                          {sym.title || sym.description}
                        </p>
                        {hasGuide ? (
                          <p className="text-[0.6875rem] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                            <BookOpen className="size-3" /> มีคู่มือแก้ไขปัญหา
                          </p>
                        ) : (
                          <p className="text-[0.6875rem] text-muted-foreground mt-0.5">
                            ยังไม่มีคู่มือ
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-background border border-border/50 text-muted-foreground group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground group-hover:translate-x-0.5 transition-all shadow-2xs">
                      <ArrowRight className="size-4" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
