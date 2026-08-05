"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronDown,
  Stethoscope,
  Wrench,
  ArrowRight,
  Tag,
  Activity,
} from "lucide-react"
import {
  type Category,
  type DeviceModel,
  type Guide,
  type SymptomType,
  type Symptom,
} from "@/lib/types"
import { cn } from "@/lib/utils"

export function SymptomList({
  category,
  model,
  guides,
  symptomTypes,
  symptoms,
  onBack,
  onSelectGuide,
}: {
  category: Category
  model?: DeviceModel | null
  guides: Guide[]
  symptomTypes: SymptomType[]
  symptoms: Symptom[]
  onBack: () => void
  onSelectGuide: (guide: Guide) => void
}) {
  // Find which symptom type applies (usually based on model)
  const symptomTypeId = model?.symptomTypeId
  const symptomGroup = symptomTypes.find(t => t.id === symptomTypeId)
  
  // Filter symptoms to only those matching this model's symptomType, 
  // or fallback to symptoms that have active guides in this category.
  const applicableSymptoms = model
    ? (symptomTypeId 
        ? symptoms.filter(s => {
            if (s.symptomTypeId !== symptomTypeId) return false;
            // Filter out model-specific symptoms if the current model is not included
            if (s.specificModelIds && s.specificModelIds.length > 0) {
              if (!s.specificModelIds.includes(model.id)) {
                return false;
              }
            }
            return true;
          })
        : []) // If a model is selected but has no symptomTypeId mapped, show nothing
    : symptoms.filter(s => guides.some(g => g.symptomId === s.id && g.status === 'published'))

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

        {/* Model detail (when arrived via search) */}
        {model ? (
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary mb-2">
              <Tag className="size-3" />
              รุ่นที่เลือก
            </div>
            <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground line-clamp-1">{model.name}</h1>
            <p className="text-[13px] font-medium text-muted-foreground mt-1">
              รหัส: {model.code} · {category.name}
            </p>
          </div>
        ) : (
          <div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary mb-2">
              {category.name}
            </span>
            <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground line-clamp-1">{category.description}</h1>
          </div>
        )}
      </div>

      {/* Symptom Group Display */}
      {model && symptomGroup && (
        <div className="mb-6">
          <h2 className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase pl-1 mb-2">
            กลุ่มอาการที่เสีย
          </h2>
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Activity className="size-5" />
            </div>
            <div>
              <p className="font-display font-semibold text-[15px] text-foreground leading-tight">{symptomGroup.name}</p>
              <p className="text-[13px] text-muted-foreground mt-0.5 font-mono">รหัส: {symptomGroup.id}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <h2 className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase pl-1">
          อาการเสียที่พบ
        </h2>
      </div>

      {/* Symptom list accordion */}
      <div className="flex flex-col gap-3">
        {applicableSymptoms.length === 0 ? (
           <div className="text-center p-10 bg-muted/30 rounded-2xl border border-dashed border-border/50 text-[15px] text-muted-foreground">
             {model ? "ไม่มีข้อมูลอาการสำหรับรุ่นนี้" : "โปรดเลือกรุ่นสินค้าก่อน"}
           </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm">
            {applicableSymptoms.map((sym, i) => {
              const symGuides = guides.filter(g => g.symptomId === sym.id && g.status === 'published')
              const isLast = i === applicableSymptoms.length - 1;
              const hasGuide = symGuides.length > 0;
              
              return (
                <div key={sym.id} className={`${!isLast ? 'border-b border-border/40' : ''}`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (hasGuide) {
                        onSelectGuide(symGuides[0]);
                      }
                    }}
                    disabled={!hasGuide}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors ${hasGuide ? 'hover:bg-muted/30 active:bg-muted/50' : 'opacity-70 cursor-not-allowed'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${hasGuide ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Stethoscope className="size-4" />
                      </div>
                      <span className={`font-medium text-[15px] leading-snug ${hasGuide ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {sym.title || sym.description}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!hasGuide && (
                        <span className="text-[11px] font-medium text-muted-foreground px-2">ไม่มีข้อมูล</span>
                      )}
                      <ArrowRight
                        className={cn(
                          "size-5 transition-transform",
                          hasGuide ? "text-primary/70" : "text-muted-foreground/30",
                        )}
                      />
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
