"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronDown,
  Stethoscope,
  Wrench,
  ArrowRight,
  Tag,
} from "lucide-react"
import {
  type Category,
  type DeviceModel,
  type Guide,
  getGuidesBySymptomGroup,
  getModelNames,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function SymptomList({
  category,
  model,
  onBack,
  onSelectGuide,
}: {
  category: Category
  model?: DeviceModel | null
  onBack: () => void
  onSelectGuide: (guide: Guide) => void
}) {
  const [open, setOpen] = useState<string | null>(category.symptomGroups[0]?.id ?? null)

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

      <div className="mb-3 flex items-center gap-2">
        <Stethoscope className="size-4 text-muted-foreground" />
        <h2 className="font-display text-sm font-semibold text-muted-foreground">
          เลือกอาการเสียที่พบ
        </h2>
      </div>

      {/* Symptom group accordion */}
      <div className="flex flex-col gap-2.5">
        {category.symptomGroups.map((sg) => {
          const guides = getGuidesBySymptomGroup(sg.id)
          const isOpen = open === sg.id
          return (
            <div
              key={sg.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : sg.id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <span className="font-display font-semibold leading-snug text-balance">
                  {sg.name}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      guides.length
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {guides.length} วิธี
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
                  {guides.length === 0 ? (
                    <p className="px-1 py-2 text-center text-sm text-muted-foreground">
                      ยังไม่มีคู่มือสำหรับอาการนี้
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {guides.map((g) => (
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
                              {g.steps.length} ขั้นตอน · ใช้ได้กับ{" "}
                              {getModelNames(g.supportedModels).length} รุ่น
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
        })}
      </div>
    </div>
  )
}
