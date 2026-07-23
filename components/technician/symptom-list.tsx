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
} from "@/lib/mock-data"
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
  
  // Filter symptoms to only those matching this model's symptomType
  const applicableSymptoms = symptomTypeId 
    ? symptoms.filter(s => s.symptomTypeId === symptomTypeId)
    : []

  const [open, setOpen] = useState<string | null>(applicableSymptoms[0]?.id ?? null)

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-16">
      <div className="sticky top-0 z-20 bg-background pt-14 pb-4 border-b border-border/40 mb-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 hidden sm:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          กลับหน้าหลัก
        </button>

        {/* Model detail (when arrived via search) */}
        {model ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary whitespace-nowrap">
              <Tag className="size-3.5" />
              รุ่นที่เลือก
            </div>
            <p className="mt-1 font-display text-lg sm:text-xl font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{model.name}</p>
            <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
              รหัส: {model.code} · {category.name}
            </p>
          </div>
        ) : (
          <div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-primary whitespace-nowrap">
              {category.name}
            </span>
            <h1 className="mt-1.5 font-display text-lg sm:text-xl font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{category.description}</h1>
          </div>
        )}
      </div>

      {/* Symptom Group Display */}
      {model && symptomGroup && (
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="size-4 text-muted-foreground" />
            <h2 className="font-display text-sm font-semibold text-muted-foreground">
              กลุ่มอาการที่เสีย
            </h2>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="font-display font-medium text-foreground">{symptomGroup.name}</p>
            <p className="text-xs text-muted-foreground mt-1">รหัสกลุ่ม: {symptomGroup.id}</p>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center gap-2">
        <Stethoscope className="size-4 text-muted-foreground" />
        <h2 className="font-display text-sm font-semibold text-muted-foreground">
          อาการเสียที่พบ
        </h2>
      </div>

      {/* Symptom list accordion */}
      <div className="flex flex-col gap-2.5">
        {applicableSymptoms.length === 0 ? (
           <div className="text-center p-8 bg-muted/40 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
             {model ? "ไม่มีข้อมูลอาการสำหรับรุ่นนี้" : "โปรดเลือกรุ่นสินค้าก่อน"}
           </div>
        ) : (
          applicableSymptoms.map((sym) => {
            const symGuides = guides.filter(g => g.categoryId === category.id && g.symptomId === sym.id && g.status === 'published')
            const isOpen = open === sym.id
            return (
              <div
                key={sym.id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : sym.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <span className="font-display font-semibold leading-snug text-balance">
                    {sym.description}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        symGuides.length
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {symGuides.length} วิธี
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-5 text-muted-foreground transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </div>
                </button>

                {isOpen ? (
                  <div className="border-t border-border bg-muted/40 p-3">
                    {symGuides.length === 0 ? (
                      <p className="px-1 py-2 text-center text-sm text-muted-foreground">
                        ยังไม่มีคู่มือสำหรับอาการนี้
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {symGuides.map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => onSelectGuide(g)}
                            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Wrench className="size-3.5 shrink-0 text-primary" />
                                <p className="truncate font-medium">{g.specificCause}</p>
                              </div>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {g.steps.length} ขั้นตอน
                              </p>
                            </div>
                            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
