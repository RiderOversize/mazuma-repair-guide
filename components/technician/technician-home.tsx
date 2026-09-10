"use client"

import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react"
import { useTheme } from "next-themes"
import { useAppSettings } from "@/components/settings-provider"
import { cn } from "@/lib/utils"
import { TechToolsModal } from "./tech-tools-modal"
import { QrScannerModal } from "./qr-scanner-modal"
import { 
  Search, Flame, Droplets, Gauge, ChevronRight, X, Boxes, Moon, Sun, 
  Settings, Type, TextSelect, ShowerHead, Filter, Factory, GlassWater, 
  Fan, Wind, Cpu, Sparkles, Zap, ArrowUpRight, Activity, Calculator, Scan,
  AlertTriangle, Stethoscope, History, Star, Clock, CheckCircle2, BookOpen, Layers, ChevronLeft, Bot
} from "lucide-react"
import {
  type Category,
  type DeviceModel,
  type Symptom,
  type SymptomType,
  type MasterDataMapping,
  type Guide,
} from "@/lib/types"
import { getCategoryTheme, type CategoryTheme, isModelInSubCategory } from "@/lib/category-theme"
import { DiscontinuedCornerRibbon } from "./discontinued-corner-ribbon"

const themeFor = (slugOrName?: string): CategoryTheme => getCategoryTheme(slugOrName)


export interface DiagnosticOption {
  symptom: Symptom
  symptomType?: SymptomType
  code: string
  codeDisplay: string
  symptomTypeName: string
  guides: Guide[]
  categoryName?: string
}

export interface DiagnosticGroup {
  id: string
  title: string
  description: string
  severity: "Low" | "Medium" | "High" | "Critical"
  options: DiagnosticOption[]
}

function extractCleanCode(code: string, sTypeName?: string): string {
  const combined = `${code} ${sTypeName || ""}`.toUpperCase()
  if (combined.includes("1R")) return "1R"
  if (combined.includes("2R")) return "2R"
  if (combined.includes("3R")) return "3R"
  if (code.startsWith("WH-")) return code.replace("WH-", "")
  if (code.startsWith("EL-")) return code.replace("EL-", "")
  return code || sTypeName || "ทั่วไป"
}

export interface TechnicianHomeRef {
  handleBack: () => boolean
  resetHome?: () => void
}

export const TechnicianHome = forwardRef<TechnicianHomeRef, {
  categories: Category[]
  models: DeviceModel[]
  symptoms?: Symptom[]
  symptomTypes?: SymptomType[]
  mappings?: MasterDataMapping[]
  guides?: Guide[]
  preview?: boolean
  activeTab?: "categories" | "diagnostics" | "favorites" | "recents"
  onTabChange?: (tab: "categories" | "diagnostics" | "favorites" | "recents") => void
  selectedDiagnosticGroup?: DiagnosticGroup | null
  onSelectDiagnosticGroup?: (group: DiagnosticGroup | null) => void
  onSelectCategory: (categoryId: string) => void
  onSelectModel: (model: DeviceModel) => void
  onSelectDiagnostic?: (categoryId: string) => void
  onSelectGuide?: (guide: Guide, fromQuickDiagnostic?: boolean) => void
  headerRight?: React.ReactNode
}>(function TechnicianHome({
  categories,
  models,
  symptoms = [],
  symptomTypes = [],
  mappings = [],
  guides = [],
  preview = false,
  activeTab = "categories",
  onTabChange,
  selectedDiagnosticGroup: propDiagnosticGroup,
  onSelectDiagnosticGroup,
  onSelectCategory,
  onSelectModel,
  onSelectDiagnostic,
  onSelectGuide,
  headerRight,
}, ref) {
  const [query, setQuery] = useState("")
  const [diagnosticQuery, setDiagnosticQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [mainView, setMainView] = useState<"categories" | "diagnostics" | "favorites" | "recents">(activeTab || "categories")
  const [favorites, setFavorites] = useState<string[]>([])
  const [recents, setRecents] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showTools, setShowTools] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [localDiagnosticGroup, setLocalDiagnosticGroup] = useState<DiagnosticGroup | null>(null)
  const selectedDiagnosticGroup = propDiagnosticGroup !== undefined ? propDiagnosticGroup : localDiagnosticGroup
  const setSelectedDiagnosticGroup = (group: DiagnosticGroup | null) => {
    setLocalDiagnosticGroup(group)
    onSelectDiagnosticGroup?.(group)
  }
  const [showSettings, setShowSettings] = useState(false)

  useImperativeHandle(ref, () => ({
    handleBack: () => {
      if (selectedDiagnosticGroup) {
        setSelectedDiagnosticGroup(null)
        return true
      }
      if (showTools) {
        setShowTools(false)
        return true
      }
      if (showScanner) {
        setShowScanner(false)
        return true
      }
      if (showSettings) {
        setShowSettings(false)
        return true
      }
      if (diagnosticQuery) {
        setDiagnosticQuery("")
        return true
      }
      if (query) {
        setQuery("")
        return true
      }
      return false
    },
    resetHome: () => {
      setSelectedDiagnosticGroup(null)
      setShowTools(false)
      setShowScanner(false)
      setShowSettings(false)
      setQuery("")
      setDiagnosticQuery("")
    }
  }))

  useEffect(() => {
    if (activeTab) setMainView(activeTab)
  }, [activeTab])

  const { theme, setTheme, systemTheme } = useTheme()
  const { fontSize, setFontSize, fontFamily, setFontFamily } = useAppSettings()
  const [mounted, setMounted] = useState(false)

  // Dynamically generate quick searches from recent searches and available models
  const quickSearches = useMemo(() => {
    const list: {label: string, query: string}[] = []
    
    // 1. Add recent search history first
    if (recentSearches && recentSearches.length > 0) {
      recentSearches.forEach(q => {
        list.push({ 
          label: q.length > 15 ? q.substring(0, 15) + "..." : q, 
          query: q 
        })
      })
    }

    // 2. If we need more items, fill with models
    if (models && models.length > 0 && list.length < 5) {
      const selected: typeof models = []
      const seenCategories = new Set<string>()
      
      for (const m of models) {
        if (!seenCategories.has(m.categoryId)) {
          selected.push(m)
          seenCategories.add(m.categoryId)
        }
        if (selected.length + list.length >= 5) break
      }
      
      if (selected.length + list.length < 5) {
        for (const m of models) {
          if (!selected.some(s => s.id === m.id)) {
            selected.push(m)
          }
          if (selected.length + list.length >= 5) break
        }
      }
      
      selected.forEach(m => {
        const label = m.code.length <= 12 ? m.code : (m.name.split(' ')[0] || m.code)
        // Only add if we don't already have a very similar search query
        if (!list.some((item: any) => item.query === m.code)) {
          list.push({ 
            label: label.substring(0, 15).trim(), 
            query: m.code 
          })
        }
      })
    }
    
    return list.slice(0, 5) // ensure max 5 chips
  }, [models, recentSearches])

  // Filter symptoms that have published guides and group by identical symptom title
  const quickDiagnostics = useMemo(() => {
    if (!symptoms || !guides) return []
    
    const groupMap = new Map<string, {
      title: string
      description: string
      severity: "Low" | "Medium" | "High" | "Critical"
      options: DiagnosticOption[]
    }>()

    symptoms.forEach((sym) => {
      // Find published guides for this symptom
      const symGuides = guides.filter(g => g.symptomId === sym.id && (g.status === "published" || !g.status))
      if (symGuides.length === 0) return

      const cleanTitle = (sym.title || sym.description || "").trim()
      if (!cleanTitle) return

      const sType = symptomTypes.find(st => st.id === sym.symptomTypeId || st.subcategoryId === sym.symptomTypeId)
      
      const rawCode = sym.symptomTypeId || sym.id || ""
      const codeDisplay = extractCleanCode(rawCode, sType?.name)

      // Category name
      const guideCatId = symGuides[0]?.categoryId
      const cat = categories.find(c => 
        c.id === guideCatId || 
        c.slug === guideCatId || 
        (guideCatId && (c.slug.toUpperCase().startsWith(guideCatId.toUpperCase() + "-") || c.id.toUpperCase().startsWith(guideCatId.toUpperCase() + "-")))
      )

      const option: DiagnosticOption = {
        symptom: sym,
        symptomType: sType,
        code: rawCode,
        codeDisplay: codeDisplay,
        symptomTypeName: sType?.name || (cat ? `หมวด ${cat.name}` : `รหัส ${codeDisplay}`),
        guides: symGuides,
        categoryName: cat?.name
      }

      if (!groupMap.has(cleanTitle)) {
        groupMap.set(cleanTitle, {
          title: cleanTitle,
          description: sym.description || "",
          severity: sym.severity || "Medium",
          options: [option]
        })
      } else {
        const existing = groupMap.get(cleanTitle)!
        // Avoid duplicate options with exact same symptom id
        if (!existing.options.some(o => o.symptom.id === sym.id)) {
          existing.options.push(option)
        }
      }
    })

    return Array.from(groupMap.entries()).map(([id, group]) => ({
      id,
      ...group
    }))
  }, [symptoms, guides, symptomTypes, categories])

  // Filter quick diagnostics based on search query
  const filteredDiagnostics = useMemo(() => {
    const q = (diagnosticQuery || "").trim().toLowerCase()
    if (!q) return quickDiagnostics

    return quickDiagnostics.filter((topic) => {
      // 1. Check title & description
      if (topic.title.toLowerCase().includes(q)) return true
      if (topic.description && topic.description.toLowerCase().includes(q)) return true

      // 2. Check options (codes, codeDisplay, symptomTypeName, categoryName)
      return topic.options.some((opt) => {
        if (opt.code && opt.code.toLowerCase().includes(q)) return true
        if (opt.codeDisplay && opt.codeDisplay.toLowerCase().includes(q)) return true
        if (opt.symptomTypeName && opt.symptomTypeName.toLowerCase().includes(q)) return true
        if (opt.categoryName && opt.categoryName.toLowerCase().includes(q)) return true
        if (opt.symptom?.title && opt.symptom.title.toLowerCase().includes(q)) return true
        if (opt.symptom?.description && opt.symptom.description.toLowerCase().includes(q)) return true
        return false
      })
    })
  }, [quickDiagnostics, diagnosticQuery])

  useEffect(() => {
    setMounted(true)
    try {
      const savedFavs = localStorage.getItem("mazuma_tech_favorites")
      if (savedFavs) setFavorites(JSON.parse(savedFavs))
      const savedRecents = localStorage.getItem("mazuma_tech_recents")
      if (savedRecents) setRecents(JSON.parse(savedRecents))
      const savedSearches = localStorage.getItem("mazuma_tech_searches")
      if (savedSearches) setRecentSearches(JSON.parse(savedSearches))
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
      
      // Track search query history if it was a search
      if (query.trim()) {
        const q = query.trim()
        const savedSearches = localStorage.getItem("mazuma_tech_searches")
        const currentSearches = savedSearches ? JSON.parse(savedSearches) : []
        const nextSearches = [q, ...currentSearches.filter((s: string) => s.toLowerCase() !== q.toLowerCase())].slice(0, 5)
        setRecentSearches(nextSearches)
        localStorage.setItem("mazuma_tech_searches", JSON.stringify(nextSearches))
      }
    } catch (e) {}
    onSelectModel(m)
  }

  // โชว์เฉพาะหมวดที่มีคู่มือแล้วเท่านั้น (มีรุ่นที่มีคู่มือจริง > 0)
  const categoriesWithModels = useMemo(() => {
    return categories.filter((cat) => {
      const count = models.filter((m) =>
        m.categoryId === cat.id ||
        m.categoryId === cat.slug ||
        m.categoryId === cat.name ||
        isModelInSubCategory(m, cat)
      ).length
      return count > 0
    })
  }, [categories, models])

  // กลุ่มหมวดหมู่หลักในระบบ
  const baseFilterGroups = useMemo(() => [
    { id: "all", label: "ทั้งหมด", icon: Sparkles, slugs: [] as string[] },
    { id: "water_filter", label: "เครื่องกรองน้ำ", icon: Filter, slugs: ["F2", "F3", "F4", "F6", "กรอง"] },
    { id: "water_heater", label: "ทำน้ำอุ่น-ร้อน", icon: ShowerHead, slugs: ["F1", "น้ำอุ่น", "น้ำร้อน", "หม้อต้ม"] },
    { id: "sterilizer", label: "เครื่องกำจัดเชื้อ", icon: Cpu, slugs: ["FJ", "กำจัดเชื้อ", "เชื้อ", "sterilizer"] },
    { id: "dispenser", label: "ตู้กดน้ำ", icon: GlassWater, slugs: ["FA", "ตู้", "กดน้ำ"] },
    { id: "air_cool", label: "พัดลม / ฟอกอากาศ", icon: Wind, slugs: ["FB", "FC", "พัดลม", "ฟอกอากาศ"] },
    { id: "smart_pump", label: "ปั๊มน้ำ / Smart", icon: Zap, slugs: ["FD", "FF", "FE", "ปั๊ม", "smart"] },
    { id: "ice_maker", label: "เครื่องผลิตน้ำแข็ง", icon: Boxes, slugs: ["FH", "น้ำแข็ง"] },
    { id: "robot", label: "หุ่นยนต์บริการ", icon: Bot, slugs: ["FK", "robot", "หุ่นยนต์", "pudu"] },
  ], [])

  // แสดงเฉพาะกลุ่มที่มีคู่มือ/รุ่นสินค้าจริง (> 0 รุ่น) เพื่อให้สอดคล้องกับหมวดที่มีคู่มือ
  const filterGroups = useMemo(() => {
    const matched = baseFilterGroups.filter((group) => {
      if (group.id === "all") return true
      return categoriesWithModels.some((c) => {
        const name = (c.name || "").toLowerCase()
        const slug = (c.slug || "").toLowerCase()
        const id = (c.id || "").toLowerCase()
        return group.slugs.some((s) => {
          const sLower = s.toLowerCase()
          return (
            slug === sLower ||
            slug.startsWith(sLower + "-") ||
            slug.includes(sLower) ||
            id === sLower ||
            id.startsWith(sLower + "-") ||
            name.includes(sLower)
          )
        })
      })
    })

    // ตรวจสอบว่ามีหมวดหมู่อื่นใน categoriesWithModels ที่ยังไม่อยู่ใน matched หรือไม่
    const unmatched = categoriesWithModels.filter((c) => {
      return !baseFilterGroups.some((g) => {
        if (g.id === "all") return false
        const name = (c.name || "").toLowerCase()
        const slug = (c.slug || "").toLowerCase()
        const id = (c.id || "").toLowerCase()
        return g.slugs.some((s) => {
          const sLower = s.toLowerCase()
          return (
            slug === sLower ||
            slug.startsWith(sLower + "-") ||
            slug.includes(sLower) ||
            id === sLower ||
            id.startsWith(sLower + "-") ||
            name.includes(sLower)
          )
        })
      })
    })

    const dynamic = unmatched.map((c) => {
      const theme = themeFor(c.name || c.slug)
      return {
        id: `custom_${c.id}`,
        label: c.name,
        icon: theme.icon || Boxes,
        slugs: [c.id, c.slug, c.name].filter(Boolean),
      }
    })

    return [...matched, ...dynamic]
  }, [baseFilterGroups, categoriesWithModels])

  // หากกลุ่มที่เลือกไม่มีอยู่ในแท็บที่แสดง ให้รีเซ็ตกลับเป็น "all"
  useEffect(() => {
    if (selectedGroup !== "all" && !filterGroups.some((g) => g.id === selectedGroup)) {
      setSelectedGroup("all")
    }
  }, [filterGroups, selectedGroup])

  const filteredCategories = selectedGroup === "all"
    ? categoriesWithModels
    : categoriesWithModels.filter(c => {
        const group = filterGroups.find(g => g.id === selectedGroup)
        const name = (c.name || "").toLowerCase()
        const slug = (c.slug || "").toLowerCase()
        const id = (c.id || "").toLowerCase()
        return group?.slugs?.some(s => {
          const sLower = s.toLowerCase()
          return (
            slug === sLower || 
            slug.startsWith(sLower + "-") || 
            slug.includes(sLower) ||
            id === sLower || 
            id.startsWith(sLower + "-") ||
            name.includes(sLower)
          )
        })
      })

  const favoriteModels = models.filter((m) => favorites.includes(m.id))
  const recentModels = recents.map((id) => models.find((m) => m.id === id)).filter(Boolean) as DeviceModel[]

  const results = query.trim()
    ? models.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.code.toLowerCase().includes(query.toLowerCase()))
    : []

  const currentTheme = theme === "system" ? systemTheme : theme

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Permanently Locked Sticky Header */}
      <div className="sticky top-0 z-30 transition-all w-full">
        <div className="w-full bg-background/95 backdrop-blur-2xl px-4 border-b border-border/40 shadow-xs pb-3 pt-3.5 sm:pt-4">
          {/* Top Status & Tool Buttons */}
          <div className="flex items-center justify-between pb-3 px-0.5">
            {/* Left side: Tech Tools & App Settings */}
            <div className="flex items-center gap-1.5">
              {/* Tech Tools Button */}
              <button
                onClick={() => setShowTools(true)}
                className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all text-[0.6875rem] font-bold shadow-2xs"
                title="เครื่องมือ & คำนวณช่าง"
                aria-label="เครื่องมือช่าง"
              >
                <Calculator className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>เครื่องมือช่าง</span>
              </button>

              {/* Settings Button */}
              {mounted && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex size-7.5 items-center justify-center rounded-full bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted hover:border-primary/40 transition-all shadow-xs"
                  aria-label="ตั้งค่าแอป"
                  title="ตั้งค่าแอป"
                >
                  <Settings className="size-3.5" />
                </button>
              )}
            </div>

            {/* Right side: Profile & Actions (in normal flow, not floating) */}
            {headerRight && (
              <div className="flex items-center gap-1.5">
                {headerRight}
              </div>
            )}
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
                <h1 className="font-display text-xl font-extrabold leading-none tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent pb-0.5">
                  Mazuma Repair
                </h1>
                <p className="text-[0.6875rem] font-semibold text-muted-foreground/90 tracking-wider uppercase">Technical Service Guide</p>
              </div>
            </div>
          </div>

          {/* Global search */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-sky-500/20 to-primary/30 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -z-10"></div>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="search"
              value={mainView === "diagnostics" ? diagnosticQuery : query}
              onChange={(e) => {
                if (mainView === "diagnostics") {
                  setDiagnosticQuery(e.target.value)
                } else {
                  setQuery(e.target.value)
                }
              }}
              placeholder={mainView === "diagnostics" ? "ค้นหาอาการเสีย เช่น ไม่ร้อน, ไฟดูด, น้ำรั่ว, 1R..." : "ค้นหาชื่อรุ่น หรือรหัสสินค้าด่วน..."}
              className="w-full rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl py-2.5 pl-10.5 pr-10 text-sm outline-none shadow-xs transition-all duration-300 focus:bg-background focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
            
            {(mainView === "diagnostics" ? diagnosticQuery : query) && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (mainView === "diagnostics") setDiagnosticQuery("")
                    else setQuery("")
                  }}
                  className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="ล้างการค้นหา"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Search Shortcut Chips (for Models) */}
          {!query && mainView === "categories" && (
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar no-scrollbar pt-2 pb-1 -mx-1 px-1">
              <span className="text-[0.625rem] font-semibold text-muted-foreground/70 shrink-0 flex items-center gap-1 mr-0.5">
                <Zap className="size-3 text-amber-500 fill-amber-500 animate-pulse" /> ค้นหาด่วน:
              </span>
              {quickSearches.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setQuery(item.query)}
                  className="shrink-0 rounded-full bg-muted/50 hover:bg-primary/10 border border-border/40 hover:border-primary/30 px-2.5 py-0.5 text-[0.6875rem] font-medium text-muted-foreground hover:text-primary transition-all duration-200 shadow-2xs"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Quick Diagnostic Filter Chips (when on Diagnostics Tab) */}
          {mainView === "diagnostics" && (
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar no-scrollbar pt-2 pb-1 -mx-1 px-1">
              <span className="text-[0.625rem] font-semibold text-muted-foreground/70 shrink-0 flex items-center gap-1 mr-0.5">
                <Zap className="size-3 text-amber-500 fill-amber-500 animate-pulse" /> ค้นหาด่วน:
              </span>
              {[
                { label: "ไม่ทำความร้อน", query: "ไม่ทำความร้อน" },
                { label: "ไฟไม่เข้า / ไม่ติด", query: "ไม่ทำงาน" },
                { label: "ไฟดูด / ไฟรั่ว", query: "ไฟดูด" },
                { label: "น้ำรั่วซึม", query: "น้ำรั่ว" },
                { label: "น้ำร้อนจัด", query: "น้ำร้อนจัด" },
                { label: "รหัส 1R", query: "1R" },
                { label: "รหัส 2R", query: "2R" },
              ].map((chip) => {
                const isActive = diagnosticQuery === chip.query
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setDiagnosticQuery(isActive ? "" : chip.query)}
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium transition-all duration-200 shadow-2xs",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                        : "bg-muted/50 hover:bg-primary/10 border-border/40 hover:border-primary/30 text-muted-foreground hover:text-primary"
                    )}
                  >
                    {chip.label}
                  </button>
                )
              })}
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
                      onClick={() => {
                        setMainView(tab.id as any)
                        onTabChange?.(tab.id as any)
                      }}
                      className={cn(
                        "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300 shadow-2xs",
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
                          "shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold transition-all duration-200",
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

      {/* Content Area */}
      <div className="px-4 pt-4 pb-24 transition-all">
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
                  const cat = categories.find(c => c.id === m.categoryId || c.slug === m.categoryId || c.name === m.categoryId || isModelInSubCategory(m, c))
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
                      className="group relative overflow-hidden flex items-center justify-between rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm px-4 py-3.5 text-left transition-all duration-300 hover:bg-muted/50 hover:shadow-md hover:border-primary/30 cursor-pointer"
                    >
                      {m.status === "discontinued" && <DiscontinuedCornerRibbon size="sm" />}

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

        {/* TAB 1: Categories View (1 Column List) */}
        {!query && mainView === "categories" && (
          <div className="flex flex-col gap-2.5">
            {filteredCategories.map((cat) => {
              const theme = themeFor(cat.name || cat.slug)
              const Icon = theme.icon
              const catModelsCount = models.filter(m => m.categoryId === cat.id || m.categoryId === cat.slug || m.categoryId === cat.name || isModelInSubCategory(m, cat)).length

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={cn(
                    "group relative flex items-center justify-between overflow-hidden rounded-2xl border bg-gradient-to-r p-3.5 sm:p-4 text-left backdrop-blur-md transition-all duration-300 ease-out",
                    "hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]",
                    theme.border,
                    theme.borderHover,
                    theme.gradient,
                    theme.bgHover,
                    "bg-card/70 dark:bg-card/40"
                  )}
                >
                  {/* Glass sheen highlight on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

                  {/* Giant Translucent Watermark Icon on the right */}
                  <div className="absolute -right-2 -bottom-4 pointer-events-none opacity-[0.04] dark:opacity-[0.07] group-hover:opacity-[0.12] group-hover:scale-110 transition-all duration-500 ease-out">
                    <Icon className="size-24 stroke-[1.2]" />
                  </div>

                  {/* Left: Icon + Title */}
                  <div className="relative z-10 flex items-center gap-3.5 min-w-0 pr-2">
                    <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105", theme.iconBg)}>
                      <Icon className="size-5.5 stroke-[1.8]" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-display text-[15px] sm:text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors truncate">
                        {cat.name}
                      </p>
                    </div>
                  </div>

                  {/* Right: Model Count & Action button */}
                  <div className="relative z-10 flex items-center gap-2.5 shrink-0 pl-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-xs transition-all duration-300 shadow-2xs",
                        theme.badgeBg,
                        theme.badgeText,
                        "group-hover:scale-105"
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full transition-all",
                          catModelsCount > 0 ? "bg-current opacity-80" : "bg-muted-foreground/40"
                        )}
                      />
                      <span>
                        {catModelsCount} <span className="font-normal opacity-85 text-[11px]">รุ่น</span>
                      </span>
                    </span>

                    <div className="flex size-8 items-center justify-center rounded-full bg-background/80 border border-border/50 text-muted-foreground group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all duration-300 shadow-2xs group-hover:translate-x-0.5">
                      <ChevronRight className="size-4" />
                    </div>
                  </div>
                </button>
              )
            })}

            {filteredCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed border-border/60 text-center bg-card/30">
                <Boxes className="size-10 text-muted-foreground/30 mb-2" />
                <p className="font-display text-sm font-bold text-foreground">ยังไม่มีคู่มือสำหรับหมวดนี้</p>
                <p className="text-xs text-muted-foreground mt-1">ระบบจะแสดงเฉพาะหมวดหมู่ที่มีคู่มือการซ่อมแล้วเท่านั้น</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Quick Diagnostics Finder View */}
        {!query && mainView === "diagnostics" && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-3.5 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <Stethoscope className="size-5 text-primary shrink-0" />
                <p className="text-[12px] text-foreground/90 font-medium leading-relaxed">
                  เลือก <strong className="text-primary font-bold">อาการเสียที่พบ</strong> ด้านล่างเพื่อดูแนวทางการแก้ไขและรุ่นสินค้าทันที
                </p>
              </div>
              {diagnosticQuery && (
                <button
                  type="button"
                  onClick={() => setDiagnosticQuery("")}
                  className="shrink-0 rounded-full bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-[11px] font-bold transition-colors"
                >
                  ล้างค้นหา
                </button>
              )}
            </div>

            {diagnosticQuery && (
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  พบ {filteredDiagnostics.length} อาการเสีย สำหรับ &ldquo;<span className="text-foreground font-bold">{diagnosticQuery}</span>&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => setDiagnosticQuery("")}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  แสดงทั้งหมด ({quickDiagnostics.length})
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5">
              {filteredDiagnostics.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/60 bg-muted/20 p-8 text-center flex flex-col items-center justify-center">
                  <Stethoscope className="size-12 text-muted-foreground/30 mb-3" />
                  <h3 className="font-display text-base font-bold text-foreground">ไม่พบอาการเสียที่ค้นหา</h3>
                  <p className="text-xs text-muted-foreground max-w-[260px] mt-1">
                    ไม่พบรายการที่ตรงกับ &ldquo;{diagnosticQuery}&rdquo; ลองค้นหาด้วยคำอื่น เช่น ไม่ร้อน, ไฟรั่ว, น้ำรั่ว หรือรหัส 1R
                  </p>
                  <button
                    type="button"
                    onClick={() => setDiagnosticQuery("")}
                    className="mt-4 rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold shadow-xs hover:bg-primary/90 transition-all"
                  >
                    ล้างการค้นหา (แสดงทั้งหมด)
                  </button>
                </div>
              ) : (
                filteredDiagnostics.map((topic) => {
                  let Icon = Stethoscope
                  let colorClass = "text-blue-500 bg-blue-500/10 border-blue-500/20"
                  
                  if (topic.severity === "Critical") {
                    Icon = AlertTriangle
                    colorClass = "text-rose-500 bg-rose-500/10 border-rose-500/20"
                  } else if (topic.severity === "High") {
                    Icon = Flame
                    colorClass = "text-amber-500 bg-amber-500/10 border-amber-500/20"
                  } else if (topic.severity === "Low") {
                    Icon = Activity
                    colorClass = "text-cyan-500 bg-cyan-500/10 border-cyan-500/20"
                  }

                  const hasMultipleCodes = topic.options.length > 1

                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        if (topic.options.length === 1 && topic.options[0].guides.length > 0 && onSelectGuide) {
                          onSelectGuide(topic.options[0].guides[0], true)
                        } else if (topic.options.length > 1) {
                          setSelectedDiagnosticGroup(topic)
                        }
                      }}
                      className="group flex items-center justify-between rounded-2xl bg-card border border-border/60 p-4 text-left shadow-2xs hover:border-primary/40 hover:bg-muted/40 transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl border", colorClass)}>
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display text-[0.875rem] font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {topic.title}
                          </h3>
                          <p className="text-[0.71875rem] text-muted-foreground mt-0.5 truncate">
                            {topic.description || "ระบุอาการเพิ่มเติม..."}
                          </p>

                          {/* Multiple Code Tags */}
                          {hasMultipleCodes && (
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="text-[0.625rem] font-semibold text-muted-foreground">
                                เลือกรหัส:
                              </span>
                              {topic.options.map((opt, i) => (
                                <span
                                  key={`${opt.code}-${i}`}
                                  className="inline-flex items-center rounded-md bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[0.625rem] font-bold text-primary"
                                >
                                  {opt.codeDisplay}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
  
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasMultipleCodes && (
                          <span className="hidden sm:inline-block text-[0.6875rem] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {topic.options.length} รหัส
                          </span>
                        )}
                        <div className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <ChevronRight className="size-4" />
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
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
                  const cat = categories.find(c => c.id === m.categoryId || c.slug === m.categoryId || c.name === m.categoryId || isModelInSubCategory(m, c))
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
                  const cat = categories.find(c => c.id === m.categoryId || c.slug === m.categoryId || c.name === m.categoryId || isModelInSubCategory(m, c))
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

      {/* Symptom Code Selection Modal (e.g. 1R vs 2R) */}
      {selectedDiagnosticGroup && (
        <div 
          onClick={() => setSelectedDiagnosticGroup(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[85vh] flex flex-col bg-card border border-border/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-300"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 flex items-start justify-between px-5 py-4 border-b border-border/40">
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[0.6875rem] font-bold text-primary">
                    <Stethoscope className="size-3.5" />
                    เลือกรหัสอาการเสีย
                  </span>
                  <span className="text-[0.6875rem] text-muted-foreground">
                    ({selectedDiagnosticGroup.options.length} รูปแบบ)
                  </span>
                </div>
                <h2 className="text-base font-display font-bold text-foreground leading-snug">
                  {selectedDiagnosticGroup.title}
                </h2>
                <p className="text-[0.71875rem] text-muted-foreground mt-0.5 line-clamp-1">
                  เลือกรูปแบบเครื่องหรือรหัสอาการเสียเพื่อเปิดดูวิธีซ่อม
                </p>
              </div>
              <button 
                onClick={() => setSelectedDiagnosticGroup(null)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/60 hover:bg-muted text-foreground transition-colors"
                title="ปิด"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* List of symptom code options */}
            <div className="p-4 space-y-2.5 overflow-y-auto max-h-[calc(85vh-130px)]">
              {selectedDiagnosticGroup.options.map((opt, idx) => (
                <button
                  key={`${opt.code}-${idx}`}
                  onClick={() => {
                    if (opt.guides.length > 0 && onSelectGuide) {
                      onSelectGuide(opt.guides[0], true)
                    }
                  }}
                  className="w-full group flex items-center justify-between p-3.5 rounded-2xl border border-border/70 bg-gradient-to-r from-card to-muted/20 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md transition-all text-left active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    {/* Big Code Pill */}
                    <div className="flex flex-col items-center justify-center min-w-[3.25rem] px-2.5 py-2 rounded-xl bg-primary/10 border border-primary/25 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shrink-0">
                      <span className="text-[0.625rem] uppercase font-medium opacity-75">รหัส</span>
                      <span className="text-base font-black tracking-tight leading-none mt-0.5">
                        {opt.codeDisplay}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {opt.symptomTypeName || `กลุ่มรหัส ${opt.codeDisplay}`}
                        </span>
                        {opt.categoryName && (
                          <span className="text-[0.625rem] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
                            {opt.categoryName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <ChevronRight className="size-4" />
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 bg-muted/20 border-t border-border/30 text-center">
              <button
                onClick={() => setSelectedDiagnosticGroup(null)}
                className="w-full py-2 rounded-xl border border-border/60 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

