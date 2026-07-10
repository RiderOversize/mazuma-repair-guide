"use client"

import {
  BookOpen,
  Boxes,
  Stethoscope,
  Film,
  Plus,
  ArrowUpRight,
} from "lucide-react"
import {
  categories,
  guides,
  models,
  getCategory,
  getModelNames,
} from "@/lib/mock-data"

export function AdminDashboard({ onCreate }: { onCreate: () => void }) {
  const totalSymptoms = categories.reduce(
    (sum, c) => sum + c.symptomGroups.length,
    0,
  )
  const totalSteps = guides.reduce((sum, g) => sum + g.steps.length, 0)

  const stats = [
    { label: "คู่มือทั้งหมด", value: guides.length, icon: BookOpen, tone: "text-chart-1 bg-chart-1/10" },
    { label: "รุ่นสินค้า", value: models.length, icon: Boxes, tone: "text-chart-2 bg-chart-2/10" },
    { label: "กลุ่มอาการ", value: totalSymptoms, icon: Stethoscope, tone: "text-chart-3 bg-chart-3/10" },
    { label: "วิดีโอขั้นตอน", value: totalSteps, icon: Film, tone: "text-chart-4 bg-chart-4/10" },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">ภาพรวมระบบ</h1>
          <p className="text-sm text-muted-foreground">
            จัดการคู่มือการซ่อมแบบ Symptom-Driven ทั้งหมด
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          สร้างคู่มือใหม่
        </button>
      </div>

      {/* Stats grid: 1 col mobile, 3 (2) cols desktop */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className={`mb-3 flex size-10 items-center justify-center rounded-xl ${s.tone}`}>
                <Icon className="size-5" />
              </div>
              <p className="font-display text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Category breakdown */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {categories.map((cat) => {
          const count = guides.filter((g) => g.categoryId === cat.id).length
          return (
            <div key={cat.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-display font-semibold">{cat.name}</p>
              <p className="mb-3 text-xs text-muted-foreground">{cat.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{cat.symptomGroups.length} อาการ</span>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground">
                  {count} คู่มือ
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent guides table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display font-semibold">คู่มือล่าสุด</h2>
          <span className="text-xs text-muted-foreground">{guides.length} รายการ</span>
        </div>
        <div className="divide-y divide-border">
          {guides.map((g) => {
            const cat = getCategory(g.categoryId)
            const sg = cat?.symptomGroups.find((s) => s.id === g.symptomGroupId)
            return (
              <div
                key={g.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{g.specificCause}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {cat?.name} · {sg?.name}
                  </p>
                </div>
                <div className="hidden text-xs text-muted-foreground sm:block">
                  {getModelNames(g.supportedModels).length} รุ่น
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {g.steps.length} ขั้นตอน
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
