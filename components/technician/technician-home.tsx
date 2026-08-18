"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useAppSettings } from "@/components/settings-provider"
import { cn } from "@/lib/utils"
import { Search, Flame, Droplets, Gauge, ChevronRight, X, Boxes, Moon, Sun, Settings, Type, TextSelect, ShowerHead, Filter, Factory, GlassWater, Fan, Wind, Cpu } from "lucide-react"
import {
  type Category,
  type DeviceModel,
} from "@/lib/types"

const iconFor = (slug: Category["slug"]) => {
  switch (slug) {
    case "F1":
      return ShowerHead
    case "F2":
    case "F3":
    case "F4":
      return Filter
    case "F6":
      return Factory
    case "FA":
      return GlassWater
    case "FB":
      return Fan
    case "FC":
      return Wind
    case "FD":
      return Gauge
    case "FF":
      return Cpu
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
  const { theme, setTheme, systemTheme } = useTheme()
  const { fontSize, setFontSize, fontFamily, setFontFamily } = useAppSettings()
  const [mounted, setMounted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const results = query.trim()
    ? models.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.code.toLowerCase().includes(query.toLowerCase()))
    : []

  const currentTheme = theme === "system" ? systemTheme : theme

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-20 pt-safe">
      <div className="sticky top-0 z-20 bg-background/70 backdrop-blur-2xl pt-14 pb-4 -mx-4 px-4 border-b border-border/40 mb-5">
        {/* Brand header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/20 font-display text-xl font-bold text-primary-foreground">
              M
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold leading-tight tracking-tight">
                Mazuma Repair
              </h1>
              <p className="text-xs font-medium text-muted-foreground/80">คู่มือซ่อมสำหรับช่างเทคนิค</p>
            </div>
          </div>
          
          {mounted && (
            <button
              onClick={() => setShowSettings(true)}
              className="flex size-9 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="ตั้งค่าแอป"
            >
              <Settings className="size-4.5" />
            </button>
          )}
        </div>

        {/* Global search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหารุ่น หรือรหัสสินค้า"
            className="w-full rounded-2xl border-0 bg-muted/60 py-3 pl-11 pr-10 text-[15px] outline-none ring-primary/30 transition-all focus:bg-background focus:ring-2 focus:shadow-sm"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full bg-muted-foreground/20 text-foreground hover:bg-muted-foreground/30"
              aria-label="ล้างการค้นหา"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Search results */}
      {query.trim() ? (
        <div className="mb-6">
          {results.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
              ขออภัยไม่พบรุ่นที่ค้นหา หรือ ยังไม่มีคู่มือ
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                พบ {results.length} รุ่น
              </p>
              {results.map((m) => {
                const cat = categories.find(c => c.id === m.categoryId || c.slug === m.categoryId)
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
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          const Icon = iconFor(cat.slug)
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <div className="w-full flex-1 flex items-center justify-center">
                <p className="font-display text-sm font-semibold line-clamp-2 leading-tight">{cat.slug} - {cat.name}</p>
              </div>
              <div className="mt-auto">
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                  {models.filter(m => m.categoryId === cat.id || m.categoryId === cat.slug).length} รุ่น
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-card border shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh] overflow-hidden">
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 flex items-center justify-between p-4 border-b border-border/40">
              <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                <Settings className="size-5 text-primary" /> ตั้งค่าแอป
              </h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar pb-6">
              {/* Theme */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />} โหมดหน้าจอ
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all", theme === "light" ? "border-primary bg-primary/5 text-primary" : "border-border/40 bg-card hover:bg-muted/50 text-muted-foreground")}
                  >
                    <span className="text-[13px] font-medium">สว่าง</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all", theme === "dark" ? "border-primary bg-primary/5 text-primary" : "border-border/40 bg-card hover:bg-muted/50 text-muted-foreground")}
                  >
                    <span className="text-[13px] font-medium">มืด</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all", theme === "system" ? "border-primary bg-primary/5 text-primary" : "border-border/40 bg-card hover:bg-muted/50 text-muted-foreground")}
                  >
                    <span className="text-[13px] font-medium">ตามระบบ</span>
                  </button>
                </div>
              </div>

              {/* Font */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Type className="size-4" /> รูปแบบตัวอักษร
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFontFamily("sarabun")}
                    className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all", fontFamily === "sarabun" ? "border-primary bg-primary/5 text-primary" : "border-border/40 bg-card hover:bg-muted/50 text-muted-foreground")}
                  >
                    <span className="text-[13px] font-medium font-sans">สารบรรณ</span>
                  </button>
                  <button
                    onClick={() => setFontFamily("prompt")}
                    className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all", fontFamily === "prompt" ? "border-primary bg-primary/5 text-primary" : "border-border/40 bg-card hover:bg-muted/50 text-muted-foreground")}
                  >
                    <span className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-prompt)' }}>พร้อม</span>
                  </button>
                  <button
                    onClick={() => setFontFamily("kanit")}
                    className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all", fontFamily === "kanit" ? "border-primary bg-primary/5 text-primary" : "border-border/40 bg-card hover:bg-muted/50 text-muted-foreground")}
                  >
                    <span className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-kanit)' }}>คณิต</span>
                  </button>
                  <button
                    onClick={() => setFontFamily("noto-sans-thai")}
                    className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all", fontFamily === "noto-sans-thai" ? "border-primary bg-primary/5 text-primary" : "border-border/40 bg-card hover:bg-muted/50 text-muted-foreground")}
                  >
                    <span className="text-[13px] font-medium" style={{ fontFamily: 'var(--font-noto-sans-thai)' }}>โนโต</span>
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <TextSelect className="size-4" /> ขนาดตัวอักษร
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "sm", label: "เล็ก", size: "text-[12px]" },
                    { id: "base", label: "ปกติ", size: "text-[14px]" },
                    { id: "lg", label: "ใหญ่", size: "text-[18px]" },
                    { id: "xl", label: "ใหญ่มาก", size: "text-[22px]" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setFontSize(s.id as any)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2 transition-all",
                        fontSize === s.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border/40 bg-card hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <span className={`font-medium ${s.size} leading-none`}>A</span>
                      <span className="text-[11px]">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
