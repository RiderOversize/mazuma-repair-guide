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

  // Filter symptoms strictly for this symptomType
  const applicableSymptoms = resolvedSymptomTypeId
    ? symptoms.filter((s) => {
        if (s.symptomTypeId !== resolvedSymptomTypeId) return false
        if (s.specificModelIds && s.specificModelIds.length > 0 && model) {
          if (!s.specificModelIds.includes(model.id)) {
            return false
          }
        }
        return true
      })
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
            <div className={cn("absolute -top-12 -right-12 size-36 rounded-full blur-2xl pointer-events-none opacity-60", theme.accentGlow)} />

            {/* Model / Category Details with Category Slug Badge */}
            {model ? (
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-background flex items-center justify-center shadow-md">
                    {model.thumbnail ? (
                      <img src={model.thumbnail} alt="" className="size-full object-cover" />
                    ) : (
                      <CategoryIcon className="size-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9.5px] font-bold text-primary mb-0.5 border border-primary/20">
                      <Tag className="size-2.5" />
                      <span>รุ่นที่เลือกซ่อม</span>
                    </div>
                    <h1 className="font-display text-base font-bold leading-tight tracking-tight text-foreground truncate">
                      {model.name}
                    </h1>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate font-mono">
                      <span className="font-semibold text-foreground/80">{model.code}</span> <span className="opacity-40 mx-1">•</span> {category.name}
                    </p>
                  </div>
                </div>

                <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider border shadow-2xs font-mono", theme.badgeBg, theme.badgeText)}>
                  {category.slug}
                </span>
              </div>
            ) : (
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("flex size-10.5 shrink-0 items-center justify-center rounded-xl shadow-md", theme.iconBg)}>
                    <CategoryIcon className="size-5 stroke-[1.8]" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="font-display text-base font-bold leading-tight tracking-tight text-foreground">
                      {category.name}
                    </h1>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      เลือกอาการเสียเพื่อดูคู่มือ
                    </p>
                  </div>
                </div>

                <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider border shadow-2xs font-mono", theme.badgeBg, theme.badgeText)}>
                  {category.slug}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Symptoms List with Calibrated Top Clearance */}
      <div className={cn("px-4 pb-24 space-y-2.5", preview ? "pt-[166px]" : "pt-[126px]")}>
        {/* Symptom Group Card (if available) */}
        {model && symptomGroup && (
          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-3 flex items-center gap-3 shadow-2xs">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Activity className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{symptomGroup.name}</p>
              <p className="text-[10.5px] font-mono text-muted-foreground mt-0.5">รหัสกลุ่มอาการ: {symptomGroup.id}</p>
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
                        <p className="font-display text-[13.5px] font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                          {sym.title || sym.description}
                        </p>
                        {hasGuide ? (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                            <BookOpen className="size-3" /> มีคู่มือแก้ไขปัญหา
                          </p>
                        ) : (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
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
