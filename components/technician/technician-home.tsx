"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useAppSettings } from "@/components/settings-provider"
import { cn } from "@/lib/utils"
import { TechToolsModal } from "./tech-tools-modal"
import { QrScannerModal } from "./qr-scanner-modal"
import { 
  Search, Flame, Droplets, Gauge, ChevronRight, X, Boxes, Moon, Sun, 
  Settings, Type, TextSelect, ShowerHead, Filter, Factory, GlassWater, 
  Fan, Wind, Cpu, Sparkles, Zap, ArrowUpRight, Activity, Calculator, Scan,
  Star, Clock, Stethoscope, AlertTriangle, CheckCircle2
} from "lucide-react"
import {
  type Category,
  type DeviceModel,
} from "@/lib/types"

interface CategoryTheme {
  icon: any
  gradient: string
  bgHover: string
  border: string
  borderHover: string
  iconBg: string
  iconColor: string
  badgeBg: string
  badgeText: string
  accentGlow: string
  tag: string
}

const themeFor = (slug: Category["slug"]): CategoryTheme => {
  switch (slug) {
    case "F1":
      return {
        icon: ShowerHead,
        gradient: "from-amber-500/15 via-orange-500/5 to-transparent",
        bgHover: "hover:from-amber-500/25 hover:via-orange-500/10",
        border: "border-amber-500/20",
        borderHover: "hover:border-amber-500/40 hover:shadow-amber-500/10",
        iconBg: "bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/20",
        iconColor: "text-amber-600 dark:text-amber-400",
        badgeBg: "bg-amber-500/10 border-amber-500/20",
        badgeText: "text-amber-700 dark:text-amber-300",
        accentGlow: "bg-amber-500/15",
        tag: "ทำน้ำอุ่น-น้ำร้อน",
      }
    case "F2":
    case "F3":
    case "F4":
      return {
        icon: Filter,
        gradient: "from-cyan-500/15 via-blue-500/5 to-transparent",
        bgHover: "hover:from-cyan-500/25 hover:via-blue-500/10",
        border: "border-cyan-500/20",
        borderHover: "hover:border-cyan-500/40 hover:shadow-cyan-500/10",
        iconBg: "bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/20",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        badgeBg: "bg-cyan-500/10 border-cyan-500/20",
        badgeText: "text-cyan-700 dark:text-cyan-300",
        accentGlow: "bg-cyan-500/15",
        tag: "เครื่องกรองน้ำ",
      }
    case "F6":
      return {
        icon: Factory,
        gradient: "from-slate-500/15 via-indigo-500/5 to-transparent",
        bgHover: "hover:from-slate-500/25 hover:via-indigo-500/10",
        border: "border-indigo-500/20",
        borderHover: "hover:border-indigo-500/40 hover:shadow-indigo-500/10",
        iconBg: "bg-gradient-to-br from-slate-500/20 to-indigo-500/10 text-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/20",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        badgeBg: "bg-indigo-500/10 border-indigo-500/20",
        badgeText: "text-indigo-700 dark:text-indigo-300",
        accentGlow: "bg-indigo-500/15",
        tag: "ระบบอุตสาหกรรม",
      }
    case "FA":
      return {
        icon: GlassWater,
        gradient: "from-sky-500/15 via-blue-500/5 to-transparent",
        bgHover: "hover:from-sky-500/25 hover:via-blue-500/10",
        border: "border-sky-500/20",
        borderHover: "hover:border-sky-500/40 hover:shadow-sky-500/10",
        iconBg: "bg-gradient-to-br from-sky-500/20 to-blue-500/10 text-sky-500 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/20",
        iconColor: "text-sky-600 dark:text-sky-400",
        badgeBg: "bg-sky-500/10 border-sky-500/20",
        badgeText: "text-sky-700 dark:text-sky-300",
        accentGlow: "bg-sky-500/15",
        tag: "ตู้กดน้ำดื่ม",
      }
    case "FB":
      return {
        icon: Fan,
        gradient: "from-teal-500/15 via-emerald-500/5 to-transparent",
        bgHover: "hover:from-teal-500/25 hover:via-emerald-500/10",
        border: "border-teal-500/20",
        borderHover: "hover:border-teal-500/40 hover:shadow-teal-500/10",
        iconBg: "bg-gradient-to-br from-teal-500/20 to-emerald-500/10 text-teal-500 shadow-md shadow-teal-500/10 ring-1 ring-teal-500/20",
        iconColor: "text-teal-600 dark:text-teal-400",
        badgeBg: "bg-teal-500/10 border-teal-500/20",
        badgeText: "text-teal-700 dark:text-teal-300",
        accentGlow: "bg-teal-500/15",
        tag: "พัดลมระบายอากาศ",
      }
    case "FC":
      return {
        icon: Wind,
        gradient: "from-violet-500/15 via-purple-500/5 to-transparent",
        bgHover: "hover:from-violet-500/25 hover:via-purple-500/10",
        border: "border-violet-500/20",
        borderHover: "hover:border-violet-500/40 hover:shadow-violet-500/10",
        iconBg: "bg-gradient-to-br from-violet-500/20 to-purple-500/10 text-violet-500 shadow-md shadow-violet-500/10 ring-1 ring-violet-500/20",
        iconColor: "text-violet-600 dark:text-violet-400",
        badgeBg: "bg-violet-500/10 border-violet-500/20",
        badgeText: "text-violet-700 dark:text-violet-300",
        accentGlow: "bg-violet-500/15",
        tag: "เครื่องฟอกอากาศ",
      }
    case "FD":
      return {
        icon: Gauge,
        gradient: "from-blue-600/15 via-indigo-500/5 to-transparent",
        bgHover: "hover:from-blue-600/25 hover:via-indigo-500/10",
        border: "border-blue-500/20",
        borderHover: "hover:border-blue-500/40 hover:shadow-blue-500/10",
        iconBg: "bg-gradient-to-br from-blue-600/20 to-indigo-500/10 text-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/20",
        iconColor: "text-blue-600 dark:text-blue-400",
        badgeBg: "bg-blue-500/10 border-blue-500/20",
        badgeText: "text-blue-700 dark:text-blue-300",
        accentGlow: "bg-blue-500/15",
        tag: "ปั๊มน้ำแรงดัน",
      }
    case "FF":
      return {
        icon: Cpu,
        gradient: "from-fuchsia-500/15 via-purple-500/5 to-transparent",
        bgHover: "hover:from-fuchsia-500/25 hover:via-purple-500/10",
        border: "border-fuchsia-500/20",
        borderHover: "hover:border-fuchsia-500/40 hover:shadow-fuchsia-500/10",
        iconBg: "bg-gradient-to-br from-fuchsia-500/20 to-purple-500/10 text-fuchsia-500 shadow-md shadow-fuchsia-500/10 ring-1 ring-fuchsia-500/20",
        iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
        badgeBg: "bg-fuchsia-500/10 border-fuchsia-500/20",
        badgeText: "text-fuchsia-700 dark:text-fuchsia-300",
        accentGlow: "bg-fuchsia-500/15",
        tag: "อุปกรณ์อัจฉริยะ",
      }
    default:
      return {
        icon: Boxes,
        gradient: "from-primary/15 via-primary/5 to-transparent",
        bgHover: "hover:from-primary/25 hover:via-primary/10",
        border: "border-border/50",
        borderHover: "hover:border-primary/40 hover:shadow-primary/10",
        iconBg: "bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-md ring-1 ring-primary/20",
        iconColor: "text-primary",
        badgeBg: "bg-secondary border-border/50",
        badgeText: "text-secondary-foreground",
        accentGlow: "bg-primary/15",
        tag: "สินค้าทั่วไป",
      }
  }
}

export function TechnicianHome({
  categories,
  models,
  preview = false,
  onSelectCategory,
  onSelectModel,
}: {
  categories: Category[]
  models: DeviceModel[]
  preview?: boolean
  onSelectCategory: (categoryId: string) => void
  onSelectModel: (model: DeviceModel) => void
}) {
  const [query, setQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [mainView, setMainView] = useState<"categories" | "diagnostics" | "favorites" | "recents">("categories")
  const [favorites, setFavorites] = useState<string[]>([])
  const [recents, setRecents] = useState<string[]>([])
  const [showTools, setShowTools] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  const { theme, setTheme, systemTheme } = useTheme()
  const { fontSize, setFontSize, fontFamily, setFontFamily } = useAppSettings()
  const [mounted, setMounted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const filterGroups = [
    { id: "all", label: "ทั้งหมด", icon: Sparkles },
    { id: "water_filter", label: "เครื่องกรองน้ำ", icon: Filter, slugs: ["F2", "F3", "F4", "F6"] },
    { id: "water_heater", label: "ทำน้ำอุ่น-ร้อน", icon: ShowerHead, slugs: ["F1"] },
    { id: "dispenser", label: "ตู้กดน้ำ", icon: GlassWater, slugs: ["FA"] },
    { id: "air_cool", label: "พัดลม / ฟอกอากาศ", icon: Wind, slugs: ["FB", "FC"] },
    { id: "smart_pump", label: "ปั๊มน้ำ / Smart", icon: Zap, slugs: ["FD", "FF"] },
  ]

  const quickSearches = [
    { label: "LINEAR", query: "LINEAR" },
    { label: "AQ-50UF", query: "AQ-50UF" },
    { label: "POWER 3500", query: "POWER" },
    { label: "RO PURE", query: "RO" },
    { label: "SUPERIOR", query: "SUPERIOR" },
  ]

  const diagnosticTopics = [
    {
      id: "no_heat",
      title: "น้ำไม่ร้อน / ไม่ทำความร้อน",
      desc: "ไฟไม่เข้า, ฮีตเตอร์ไม่ทำงาน, เทอร์โมสตัทตัด",
      icon: Flame,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      query: "F1",
    },
    {
      id: "water_leak",
      title: "น้ำรั่วซึม / น้ำหยด",
      desc: "รอยต่อท่อ, โอริงเสื่อม, ตัวเรือนแตกร้าว",
      icon: Droplets,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
      query: "F2",
    },
    {
      id: "slow_flow",
      title: "น้ำไหลช้า / ไส้กรองตัน",
      desc: "แรงดันน้ำลดลง, น้ำมีกลิ่นหรือสีผิดปกติ",
      icon: Filter,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      query: "F3",
    },
    {
      id: "elcb_trip",
      title: "ไฟ ELCB ทริป / ไฟกะพริบ",
      desc: "ตรวจพบไฟรั่ว, บอร์ดตัดการทำงาน, ไฟเตือน",
      icon: Zap,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      query: "F1",
    },
    {
      id: "pump_issue",
      title: "ปั๊มไม่ตัด / ปั๊มไม่เดิน",
      desc: "แรงดันตก, สวิตช์แรงดันชำรุด, ถังลมรั่ว",
      icon: Gauge,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      query: "FD",
    },
    {
      id: "fan_air",
      title: "ลมไม่แรง / มีกลิ่นอับ",
      desc: "มอเตอร์ไม่หมุน, แผ่นฟอกตัน, แผ่นรังผึ้งแห้ง",
      icon: Wind,
      color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
      query: "FC",
    },
  ]

  useEffect(() => {
    setMounted(true)
    try {
      const savedFavs = localStorage.getItem("mazuma_tech_favorites")
      if (savedFavs) setFavorites(JSON.parse(savedFavs))
      const savedRecents = localStorage.getItem("mazuma_tech_recents")
      if (savedRecents) setRecents(JSON.parse(savedRecents))
    } catch (e) {
      console.error(e)
    }
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

  const handleSelectModelWithHistory = (m: DeviceModel) => {
    try {
      const next = [m.id, ...recents.filter((id) => id !== m.id)].slice(0, 15)
      setRecents(next)
      localStorage.setItem("mazuma_tech_recents", JSON.stringify(next))
    } catch (e) {}
    onSelectModel(m)
  }

  const filteredCategories = selectedGroup === "all"
    ? categories
    : categories.filter(c => {
        const group = filterGroups.find(g => g.id === selectedGroup)
        return group?.slugs?.includes(c.slug)
      })

  const favoriteModels = models.filter((m) => favorites.includes(m.id))
  const recentModels = recents.map((id) => models.find((m) => m.id === id)).filter(Boolean) as DeviceModel[]

  const results = query.trim()
    ? models.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.code.toLowerCase().includes(query.toLowerCase()))
    : []

  const currentTheme = theme === "system" ? systemTheme : theme

  return (
    <div className="mx-auto w-full max-w-[480px]">
      {/* Permanently Locked Fixed Header */}
      <div className={cn(
        "fixed inset-x-0 z-30 flex justify-center pointer-events-none transition-all",
        preview ? "top-[41px]" : "top-0"
      )}>
        <div className={cn(
          "w-full max-w-[480px] pointer-events-auto bg-background/95 backdrop-blur-2xl px-4 border-b border-border/40 shadow-xs pb-3",
          preview ? "pt-3" : "pt-10"
        )}>
          {/* Top Status & Tool Buttons */}
          <div className="flex items-center justify-between pb-3 px-0.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">
                Online Database
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              {/* Tech Tools Button */}
              <button
                onClick={() => setShowTools(true)}
                className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all text-[11px] font-bold shadow-2xs"
                title="เครื่องมือ & คำนวณช่าง"
                aria-label="เครื่องมือช่าง"
              >
                <Calculator className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>เครื่องมือช่าง</span>
              </button>

              {mounted && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex size-7.5 items-center justify-center rounded-full bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted hover:border-primary/40 transition-all shadow-xs"
                  aria-label="ตั้งค่าแอป"
                >
                  <Settings className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Brand header */}
          <div className="mb-3 flex items-center justify-between px-0.5">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative flex size-10.5 items-center justify-center rounded-[14px] bg-gradient-to-br from-primary via-blue-600 to-indigo-700 font-display text-lg font-black text-white shadow-md">
                  M
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="font-display text-[21px] font-extrabold leading-none tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent pb-0.5">
                  Mazuma Repair
                </h1>
                <p className="text-[10.5px] font-semibold text-muted-foreground/90 tracking-wider uppercase">Technical Service Guide</p>
              </div>
            </div>
          </div>

          {/* Global search with QR Scanner Button */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-sky-500/20 to-primary/30 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -z-10"></div>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อรุ่น หรือรหัสสินค้าด่วน..."
              className="w-full rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl py-2.5 pl-10.5 pr-14 text-[14px] outline-none shadow-xs transition-all duration-300 focus:bg-background focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="ล้างการค้นหา"
                >
                  <X className="size-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="flex size-7 items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all border border-primary/20 shadow-2xs"
                  title="สแกน QR / บาร์โค้ด"
                  aria-label="สแกน QR"
                >
                  <Scan className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Search Shortcut Chips */}
          {!query && (
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar no-scrollbar pt-2 pb-1 -mx-1 px-1">
              <span className="text-[10px] font-semibold text-muted-foreground/70 shrink-0 flex items-center gap-1 mr-0.5">
                <Zap className="size-3 text-amber-500 fill-amber-500 animate-pulse" /> ค้นหาด่วน:
              </span>
              {quickSearches.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setQuery(item.query)}
                  className="shrink-0 rounded-full bg-muted/50 hover:bg-primary/10 border border-border/40 hover:border-primary/30 px-2.5 py-0.5 text-[10.5px] font-medium text-muted-foreground hover:text-primary transition-all duration-200 shadow-2xs"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Main View Mode Selector (Categories | Diagnostics | Favorites | Recents) */}
          {!query && (
            <div className="mt-2 pt-2 border-t border-border/40">
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar no-scrollbar pb-0.5 -mx-1 px-1">
                {[
                  { id: "categories", label: "หมวดหมู่", icon: Sparkles },
                  { id: "diagnostics", label: "วินิจฉัยด่วน", icon: Stethoscope },
                  { id: "favorites", label: `รายการโปรด (${favorites.length})`, icon: Star },
                  { id: "recents", label: `ดูประวัติ (${recents.length})`, icon: Clock },
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = mainView === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setMainView(tab.id as any)}
                      className={cn(
                        "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-bold transition-all duration-300 shadow-2xs",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                          : "bg-muted/40 hover:bg-card border border-border/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("size-3.5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Sub-Filter for Categories view */}
              {mainView === "categories" && (
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar no-scrollbar pt-2 pb-0.5 -mx-1 px-1">
                  {filterGroups.map((group) => {
                    const Icon = group.icon
                    const isActive = selectedGroup === group.id
                    return (
                      <button
                        key={group.id}
                        onClick={() => setSelectedGroup(group.id)}
                        className={cn(
                          "shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-200",
                          isActive
                            ? "bg-foreground text-background shadow-xs font-bold"
                            : "bg-card/70 hover:bg-card border border-border/50 text-muted-foreground"
                        )}
                      >
                        <Icon className="size-3" />
                        <span>{group.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Area with Dynamic Padding */}
      <div className={cn(
        "px-4 pb-24 transition-all",
        query
          ? (preview ? "pt-[210px]" : "pt-[240px]")
          : mainView === "categories"
            ? (preview ? "pt-[370px]" : "pt-[400px]")
            : (preview ? "pt-[335px]" : "pt-[365px]")
      )}>
        {/* Search results view */}
        {query.trim() ? (
          <div className="mb-6">
            {results.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                ขออภัยไม่พบรุ่นที่ค้นหา หรือ ยังไม่มีคู่มือ
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-muted-foreground pl-1">
                  พบ {results.length} รุ่น
                </p>
                {results.map((m) => {
                  const cat = categories.find(c => c.id === m.categoryId || c.slug === m.categoryId)
                  const isFav = favorites.includes(m.id)
                  return (
                    <div
                      key={m.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectModelWithHistory(m)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSelectModelWithHistory(m)
                      }}
                      className="group flex items-center justify-between rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm px-4 py-3.5 text-left transition-all duration-300 hover:bg-muted/50 hover:shadow-md hover:border-primary/30 cursor-pointer"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-bold text-[14.5px] group-hover:text-primary transition-colors truncate">{m.name}</p>
                        <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">
                          <span className="font-semibold text-foreground/80">{m.code}</span> <span className="opacity-40 mx-1">•</span> {cat?.name}
                        </p>
                      </div>

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
                        <div className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-background border border-border/50 group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all duration-300 shadow-2xs">
                          <ChevronRight className="size-4" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : null}

        {/* TAB 1: Categories View */}
        {!query && mainView === "categories" && (
          <div className="grid grid-cols-2 gap-3">
            {filteredCategories.map((cat) => {
              const theme = themeFor(cat.slug)
              const Icon = theme.icon
              const catModelsCount = models.filter(m => m.categoryId === cat.id || m.categoryId === cat.slug).length

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={cn(
                    "group relative flex flex-col justify-between overflow-hidden rounded-[26px] border bg-gradient-to-br p-4 text-left backdrop-blur-md transition-all duration-500 ease-out",
                    "hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.98]",
                    theme.border,
                    theme.borderHover,
                    theme.gradient,
                    theme.bgHover,
                    "bg-card/70 dark:bg-card/40"
                  )}
                >
                  {/* Glass sheen highlight on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                  {/* Giant Translucent Watermark Icon */}
                  <div className="absolute -right-3 -bottom-3 pointer-events-none opacity-[0.04] dark:opacity-[0.07] group-hover:opacity-[0.14] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700 ease-out">
                    <Icon className="size-24 stroke-[1.2]" />
                  </div>

                  {/* Top Row: Icon + Code Badge + Arrow */}
                  <div className="relative z-10 flex items-start justify-between w-full mb-3">
                    <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", theme.iconBg)}>
                      <Icon className="size-6 stroke-[1.8]" />
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider border shadow-2xs font-mono", theme.badgeBg, theme.badgeText)}>
                        {cat.slug}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-0.5">
                        <ArrowUpRight className={cn("size-3.5", theme.iconColor)} />
                      </div>
                    </div>
                  </div>

                  {/* Middle: Title & Tag */}
                  <div className="relative z-10 w-full mb-3">
                    <p className="font-display text-[13.5px] font-bold leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </p>
                    <p className="text-[10.5px] font-medium text-muted-foreground/80 mt-1 line-clamp-1">
                      {theme.tag}
                    </p>
                  </div>

                  {/* Bottom: Model count badge */}
                  <div className="relative z-10 mt-auto pt-1 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full bg-background/80 dark:bg-background/50 border border-border/60 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground group-hover:border-primary/30 group-hover:text-foreground transition-all shadow-2xs">
                      <span className="size-1.5 rounded-full bg-primary/60 group-hover:bg-primary group-hover:animate-ping" />
                      {catModelsCount} รุ่น
                    </span>
                    <span className="text-[10.5px] font-semibold text-primary opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                      เปิดดู →
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* TAB 2: Quick Diagnostics Finder View */}
        {!query && mainView === "diagnostics" && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-3.5 flex items-center gap-3">
              <Stethoscope className="size-5 text-primary shrink-0" />
              <p className="text-[12px] text-foreground/90 font-medium leading-relaxed">
                เลือก **อาการเสียที่พบ** ด้านล่างเพื่อดูแนวทางการแก้ไขและรุ่นสินค้าที่เกี่ยวข้องทันที
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {diagnosticTopics.map((topic) => {
                const Icon = topic.icon
                return (
                  <button
                    key={topic.id}
                    onClick={() => setQuery(topic.query)}
                    className="group flex items-center justify-between rounded-2xl bg-card border border-border/60 p-4 text-left shadow-2xs hover:border-primary/40 hover:bg-muted/40 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl border", topic.color)}>
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-[11.5px] text-muted-foreground mt-0.5">
                          {topic.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ChevronRight className="size-4" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Favorites View */}
        {!query && mainView === "favorites" && (
          <div className="space-y-3">
            {favoriteModels.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/60 bg-muted/20 p-8 text-center flex flex-col items-center justify-center">
                <Star className="size-12 text-amber-500/30 mb-3" />
                <h3 className="font-display text-base font-bold text-foreground">ยังไม่มีรายการโปรด</h3>
                <p className="text-[12px] text-muted-foreground max-w-[240px] mt-1">
                  แตะไอคอนดาว ⭐ ที่รุ่นสินค้าเพื่อบันทึกไว้เปิดดูได้รวดเร็วที่นี่
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-[12px] font-semibold text-muted-foreground pl-1">
                  รุ่นโปรดที่บันทึกไว้ ({favoriteModels.length})
                </p>
                {favoriteModels.map((m) => {
                  const cat = categories.find(c => c.id === m.categoryId || c.slug === m.categoryId)
                  return (
                    <div
                      key={m.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectModelWithHistory(m)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSelectModelWithHistory(m)
                      }}
                      className="group flex items-center justify-between rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-card px-4 py-3.5 text-left transition-all duration-300 hover:bg-amber-500/10 hover:shadow-md cursor-pointer"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-bold text-[14.5px] text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                          {m.name}
                        </p>
                        <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">
                          <span className="font-semibold text-foreground/80">{m.code}</span> <span className="opacity-40 mx-1">•</span> {cat?.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(m.id, e)}
                          className="p-1.5 text-amber-500 hover:scale-110 transition-transform"
                          title="ลบออกจากรายการโปรด"
                        >
                          <Star className="size-4.5 fill-amber-500" />
                        </button>
                        <div className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-background border border-border/50 group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:text-white transition-all shadow-2xs">
                          <ChevronRight className="size-4" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Recents View */}
        {!query && mainView === "recents" && (
          <div className="space-y-3">
            {recentModels.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/60 bg-muted/20 p-8 text-center flex flex-col items-center justify-center">
                <Clock className="size-12 text-muted-foreground/30 mb-3" />
                <h3 className="font-display text-base font-bold text-foreground">ยังไม่มีประวัติการเปิดดู</h3>
                <p className="text-[12px] text-muted-foreground max-w-[240px] mt-1">
                  เมื่อคุณเปิดดูคู่มือรุ่นใดๆ จะแสดงประวัติให้เข้าถึงทันทีที่นี่
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between pl-1 pr-1">
                  <p className="text-[12px] font-semibold text-muted-foreground">
                    รุ่นที่เปิดดูล่าสุด ({recentModels.length})
                  </p>
                  <button
                    onClick={() => {
                      setRecents([])
                      localStorage.removeItem("mazuma_tech_recents")
                    }}
                    className="text-[11px] font-medium text-destructive hover:underline"
                  >
                    ล้างประวัติ
                  </button>
                </div>

                {recentModels.map((m) => {
                  const cat = categories.find(c => c.id === m.categoryId || c.slug === m.categoryId)
                  const isFav = favorites.includes(m.id)
                  return (
                    <div
                      key={m.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectModelWithHistory(m)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSelectModelWithHistory(m)
                      }}
                      className="group flex items-center justify-between rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm px-4 py-3.5 text-left transition-all duration-300 hover:bg-muted/50 hover:shadow-md hover:border-primary/30 cursor-pointer"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-bold text-[14.5px] group-hover:text-primary transition-colors truncate">{m.name}</p>
                        <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">
                          <span className="font-semibold text-foreground/80">{m.code}</span> <span className="opacity-40 mx-1">•</span> {cat?.name}
                        </p>
                      </div>

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
                        <div className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-background border border-border/50 group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all shadow-2xs">
                          <ChevronRight className="size-4" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tech Tools Modal */}
      {showTools && (
        <TechToolsModal onClose={() => setShowTools(false)} />
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QrScannerModal
          models={models}
          onClose={() => setShowScanner(false)}
          onScanResult={(model) => handleSelectModelWithHistory(model)}
        />
      )}

      {/* Settings Modal */}
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

