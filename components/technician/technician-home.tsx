"use client"

import { useState } from "react"
import { Search, Flame, Droplets, Gauge, ChevronRight, X, Boxes } from "lucide-react"
import {
  type Category,
  type DeviceModel,
} from "@/lib/mock-data"

const iconFor = (slug: Category["slug"]) => {
  switch (slug) {
    case "F1":
      return Flame
    case "F2":
    case "F3":
    case "F4":
    case "F6":
      return Droplets
    case "FD":
      return Gauge
    default:
      return Boxes
  }
}

export function TechnicianHome({
  categories,
  models,
  onSelectCategory,
  onSelectModel,
}: {
  categories: Category[]
  models: DeviceModel[]
  onSelectCategory: (categoryId: string) => void
  onSelectModel: (model: DeviceModel) => void
}) {
  const [query, setQuery] = useState("")
  
  const results = query.trim() 
    ? models.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.code.toLowerCase().includes(query.toLowerCase()))
    : []

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-16">
      <div className="sticky top-0 z-20 bg-background pt-14 pb-4">
        {/* Brand header */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">
              M
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold leading-tight">
                Mazuma Repair Guide
              </h1>
              <p className="text-xs text-muted-foreground">คู่มือซ่อมสำหรับช่างเทคนิค</p>
            </div>
          </div>
        </div>

        {/* Global search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาด้วยชื่อรุ่น หรือรหัสสินค้า"
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-sm outline-none ring-primary/30 focus:ring-2"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="ล้างการค้นหา"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Search results */}
      {query.trim() ? (
        <div className="mb-6">
          {results.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
              ไม่พบรุ่นที่ตรงกับ &quot;{query}&quot;
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                พบ {results.length} รุ่น
              </p>
              {results.map((m) => {
                const cat = categories.find(c => c.id === m.categoryId)
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectModel(m)}
                    className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.code} · {cat?.name}
                      </p>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* Category selection */}
      <h2 className="mb-3 font-display text-sm font-semibold text-muted-foreground">
        เลือกประเภทสินค้า
      </h2>
      <div className="flex flex-col gap-3">
        {categories.map((cat) => {
          const Icon = iconFor(cat.slug)
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold">{cat.id} - {cat.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {cat.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {models.filter(m => m.categoryId === cat.id).length} รุ่น
                </span>
                <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
