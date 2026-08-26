"use client"

import { useState, useEffect, useMemo } from "react"
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Search,
  Boxes,
  Stethoscope,
  Filter,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ExternalLink,
  X,
  Layers,
  ArrowLeft,
  Calendar,
  Sparkles,
  Tag
} from "lucide-react"
import type { Category, SubCategory, MasterDataMapping, DeviceModel, SymptomType } from "@/lib/types"
import {
  getCategories,
  getSubCategories,
  getModels,
  createModel,
  updateModel,
  deleteModel,
  getMasterDataMappings,
  deleteMasterDataMapping,
  getSymptomTypes
} from "@/lib/data-service"
import { getLastSyncTime, logActivity } from "@/lib/activity-service"
import { showToast, confirmDelete, showAlert } from "@/lib/swal"
import { AuthUser } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { GuideForm } from "./guide-form"

interface GuidesManagementProps {
  user: AuthUser
  initialSearch?: string
  initialModelId?: string
  setGlobalBack?: (fn: (() => void) | null) => void
}

export function GuidesManagement({
  user,
  initialSearch = "",
  initialModelId,
  setGlobalBack
}: GuidesManagementProps) {
  // Data states
  const [models, setModels] = useState<DeviceModel[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([])
  const [mappings, setMappings] = useState<MasterDataMapping[]>([])
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Navigation & View state
  const [selectedModelId, setSelectedModelId] = useState<string | null>(initialModelId || null)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [filterSubCategory, setFilterSubCategory] = useState("")
  const [filterGuideStatus, setFilterGuideStatus] = useState<"all" | "has_guides" | "no_guides">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 30

  // Model Create/Edit Modal State
  const [isModelFormOpen, setIsModelFormOpen] = useState(false)
  const [editingModelId, setEditingModelId] = useState<string | null>(null)
  const [modelFormData, setModelFormData] = useState({
    id: "",
    categoryId: "",
    subcategoryId: "",
    symptomTypeId: "",
    name: "",
    code: "",
    status: "active" as "active" | "discontinued" | "draft",
    thumbnail: "",
  })
  const [savingModel, setSavingModel] = useState(false)

  // Guide Create/Edit Modal State
  const [isGuideFormOpen, setIsGuideFormOpen] = useState(false)
  const [editingMapping, setEditMapping] = useState<MasterDataMapping | null>(null)
  const [guideFormModelIds, setGuideFormModelIds] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  // Sync global back button with Selected Model detail view
  useEffect(() => {
    if (setGlobalBack) {
      if (selectedModelId) {
        setGlobalBack(() => () => setSelectedModelId(null))
      } else {
        setGlobalBack(null)
      }
    }
  }, [selectedModelId, setGlobalBack])

  const loadData = async () => {
    setLoading(true)
    try {
      const [mods, cats, subCats, symTypes, maps, syncTime] = await Promise.all([
        getModels(),
        getCategories(),
        getSubCategories(),
        getSymptomTypes(),
        getMasterDataMappings(),
        getLastSyncTime()
      ])
      setModels(mods)
      setCategories(cats)
      setSubCategories(subCats)
      setSymptomTypes(symTypes)
      setMappings([...maps].reverse())
      setLastSyncTime(syncTime)
    } catch (err: any) {
      console.error("Error loading models & guides:", err)
      showAlert("โหลดข้อมูลไม่สำเร็จ", err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  // Group mappings by Model Code for fast lookup
  const mappingsByModelCode = useMemo(() => {
    const map = new Map<string, MasterDataMapping[]>()
    mappings.forEach(m => {
      const code = (m.modelCode || "").trim().toUpperCase()
      if (!code) return
      if (!map.has(code)) map.set(code, [])
      map.get(code)!.push(m)
    })
    return map
  }, [mappings])

  // Count statistics
  const stats = useMemo(() => {
    let hasGuidesCount = 0
    let noGuidesCount = 0
    models.forEach(m => {
      const code = (m.code || "").trim().toUpperCase()
      const guides = mappingsByModelCode.get(code) || []
      if (guides.length > 0) {
        hasGuidesCount++
      } else {
        noGuidesCount++
      }
    })
    return {
      totalModels: models.length,
      totalGuides: mappings.length,
      hasGuidesCount,
      noGuidesCount
    }
  }, [models, mappingsByModelCode, mappings])

  // Filtered Models for the catalog view
  const filteredModels = useMemo(() => {
    return models.filter(m => {
      const code = (m.code || "").trim().toUpperCase()
      const guides = mappingsByModelCode.get(code) || []

      // Guide status filter
      if (filterGuideStatus === "has_guides" && guides.length === 0) return false
      if (filterGuideStatus === "no_guides" && guides.length > 0) return false

      // Subcategory filter
      if (filterSubCategory) {
        const selectedSubCat = subCategories.find(sc => sc.id === filterSubCategory)
        const matchSub = m.subcategoryId === filterSubCategory ||
          (selectedSubCat && (m.subcategoryId === selectedSubCat.index || m.subcategoryId === selectedSubCat.name))
        if (!matchSub) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchModel = (m.name || "").toLowerCase().includes(q) || (m.code || "").toLowerCase().includes(q)
        const matchGuide = guides.some(g => (g.symptomTypeName || "").toLowerCase().includes(q) || (g.symptomTypeCode || "").toLowerCase().includes(q))
        if (!matchModel && !matchGuide) return false
      }

      return true
    })
  }, [models, mappingsByModelCode, filterGuideStatus, filterSubCategory, searchQuery, subCategories])

  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE) || 1

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [totalPages, currentPage])

  const paginatedModels = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredModels.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredModels, currentPage])

  // Selected Model object for detail view
  const selectedModel = useMemo(() => {
    if (!selectedModelId) return null
    return models.find(m => m.id === selectedModelId) || null
  }, [models, selectedModelId])

  // Guides for selected model
  const guidesForSelectedModel = useMemo(() => {
    if (!selectedModel) return []
    const code = (selectedModel.code || "").trim().toUpperCase()
    return mappingsByModelCode.get(code) || []
  }, [selectedModel, mappingsByModelCode])

  // Handlers for Model CRUD
  const openCreateModel = () => {
    setModelFormData({
      id: `m-${Date.now()}`,
      categoryId: categories[0]?.id || "",
      subcategoryId: "",
      symptomTypeId: "",
      name: "",
      code: "",
      status: "active",
      thumbnail: "",
    })
    setEditingModelId(null)
    setIsModelFormOpen(true)
  }

  const openEditModel = (m: DeviceModel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setModelFormData({
      ...m,
      subcategoryId: m.subcategoryId || "",
      symptomTypeId: m.symptomTypeId || "",
      status: m.status || "active",
      thumbnail: m.thumbnail || ""
    })
    setEditingModelId(m.id)
    setIsModelFormOpen(true)
  }

  const handleDeleteModel = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const isConfirmed = await confirmDelete("ลบรุ่นสินค้า", "คุณแน่ใจหรือไม่ที่จะลบรุ่นสินค้านี้?")
    if (!isConfirmed) return

    setLoading(true)
    try {
      await deleteModel(id)
      await logActivity(user, "delete", "model", `ลบรุ่นสินค้า id: ${id}`)
      if (selectedModelId === id) setSelectedModelId(null)
      await loadData()
      showToast("ลบรุ่นสินค้าสำเร็จ", "success")
    } catch (err: any) {
      showAlert("ลบไม่สำเร็จ", err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingModel(true)
    try {
      if (editingModelId) {
        await updateModel(editingModelId, modelFormData)
        await logActivity(user, "update", "model", `แก้ไขรุ่น: ${modelFormData.name} (${modelFormData.code})`, editingModelId)
        showToast("อัปเดตข้อมูลรุ่นสำเร็จ", "success")
      } else {
        await createModel(modelFormData as DeviceModel)
        await logActivity(user, "create", "model", `เพิ่มรุ่นใหม่: ${modelFormData.name} (${modelFormData.code})`)
        showToast("สร้างรุ่นสินค้าสำเร็จ", "success")
      }
      setIsModelFormOpen(false)
      await loadData()
    } catch (err: any) {
      showAlert("บันทึกไม่สำเร็จ", err.message, "error")
    } finally {
      setSavingModel(false)
    }
  }

  // Handlers for Guide Mappings
  const openCreateGuideForModel = (model: DeviceModel, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditMapping(null)
    setGuideFormModelIds([model.id])
    setIsGuideFormOpen(true)
  }

  const openEditGuide = (mapping: MasterDataMapping, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditMapping(mapping)
    const m = models.find(x => x.code === mapping.modelCode)
    setGuideFormModelIds(m ? [m.id] : [])
    setIsGuideFormOpen(true)
  }

  const handleDeleteGuide = async (mapping: MasterDataMapping, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const isConfirmed = await confirmDelete("ลบการผูกคู่มือ", `คุณแน่ใจหรือไม่ที่จะลบคู่มือ "${mapping.symptomTypeName}" สำหรับรุ่น ${mapping.modelName}?`)
    if (!isConfirmed) return

    try {
      await deleteMasterDataMapping(mapping.id)
      await logActivity(user, "delete", "masterdata_mapping", `${mapping.modelName} -> ${mapping.symptomTypeName}`, mapping.id)
      await loadData()
      showToast("ลบคู่มือสำเร็จ", "success")
    } catch (err: any) {
      showAlert("ลบไม่สำเร็จ", err.message, "error")
    }
  }

  const handleGuideModalFinish = () => {
    setIsGuideFormOpen(false)
    setEditMapping(null)
    loadData()
  }

  if (loading && models.length === 0) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">กำลังโหลดคู่มือและรุ่นสินค้า...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full px-4 pb-12">
      {/* ========================================================================= */}
      {/* 1. MODEL DETAIL & GUIDE MANAGEMENT VIEW (When a Model is Selected)       */}
      {/* ========================================================================= */}
      {selectedModel ? (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
          {/* Top Breadcrumb & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedModelId(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-card border border-border/50 px-3.5 py-2 text-[0.8125rem] font-semibold text-foreground hover:bg-muted transition-colors shadow-xs active:scale-95"
            >
              <ArrowLeft className="size-4" />
              กลับไปหน้ารายการรุ่น
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => openEditModel(selectedModel, e)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-muted px-3.5 py-2 text-[0.8125rem] font-semibold text-foreground hover:bg-muted/80 transition-colors active:scale-95 shadow-xs"
              >
                <Edit className="size-4" />
                แก้ไขข้อมูลรุ่น
              </button>
              <button
                type="button"
                onClick={() => openCreateGuideForModel(selectedModel)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[0.8125rem] font-bold text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-95 transition-transform"
              >
                <Plus className="size-4" />
                ผูกคู่มืออาการใหม่
              </button>
            </div>
          </div>

          {/* Model Info Banner */}
          <div className="rounded-3xl border border-border/40 bg-card p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-background shadow-inner flex items-center justify-center">
                {selectedModel.thumbnail ? (
                  <img
                    src={selectedModel.thumbnail}
                    alt={selectedModel.name}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <ImageIcon className="size-10 text-muted-foreground/30" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.6875rem] font-bold text-primary">
                    <Smartphone className="size-3" />
                    {selectedModel.code}
                  </span>
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-bold",
                    selectedModel.status === "active" ? "bg-green-500/10 text-green-600" : selectedModel.status === "draft" ? "bg-amber-500/10 text-amber-600" : "bg-destructive/10 text-destructive"
                  )}>
                    {selectedModel.status === "active" ? "เปิดจำหน่าย" : selectedModel.status === "draft" ? "ฉบับร่าง" : "ยกเลิกผลิต"}
                  </span>
                  {subCategories.find(sc => sc.id === selectedModel.subcategoryId || sc.index === selectedModel.subcategoryId)?.name && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[0.6875rem] font-medium text-muted-foreground">
                      <Layers className="size-3" />
                      {subCategories.find(sc => sc.id === selectedModel.subcategoryId || sc.index === selectedModel.subcategoryId)?.name}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight">
                  {selectedModel.name}
                </h1>

                <p className="text-[0.8125rem] text-muted-foreground">
                  มีคู่มือการซ่อมแล้ว <strong className="text-foreground">{guidesForSelectedModel.length}</strong> อาการ
                </p>
              </div>
            </div>
          </div>

          {/* Guides Section for This Model */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Stethoscope className="size-5 text-primary" />
                  คู่มือซ่อมตามอาการเสีย ({guidesForSelectedModel.length} รายการ)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">รายการคู่มือที่ช่างเทคนิคจะมองเห็นเมื่อเลือกรุ่นสินค้านี้</p>
              </div>

              <button
                type="button"
                onClick={() => openCreateGuideForModel(selectedModel)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary px-3.5 py-1.5 text-xs font-bold transition-colors active:scale-95"
              >
                <Plus className="size-3.5" />
                เพิ่มคู่มืออาการ
              </button>
            </div>

            {guidesForSelectedModel.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {guidesForSelectedModel.map((mapping) => (
                  <div
                    key={mapping.id}
                    className="group relative flex flex-col justify-between rounded-2xl bg-card border border-border/40 p-4 shadow-sm hover:border-primary/40 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                            <Stethoscope className="size-4.5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm leading-tight text-foreground line-clamp-2">
                              {mapping.symptomTypeName}
                            </h3>
                            <p className="text-[0.6875rem] font-medium text-muted-foreground mt-0.5">
                              รหัสอาการ: {mapping.symptomTypeCode}
                            </p>
                          </div>
                        </div>
                      </div>

                      {mapping.matCategoryName && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-muted/40 px-2 py-0.5 text-[0.6875rem] text-muted-foreground">
                          <Tag className="size-3" />
                          {mapping.matCategoryName}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-border/40 mt-4">
                      <button
                        type="button"
                        onClick={(e) => openEditGuide(mapping, e)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 py-2 text-xs font-bold text-primary active:scale-95 transition-transform"
                      >
                        <Edit className="size-3.5" />
                        แก้ไขคู่มือ
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteGuide(mapping, e)}
                        className="shrink-0 inline-flex items-center justify-center rounded-xl bg-destructive/10 hover:bg-destructive/20 p-2 text-destructive active:scale-95 transition-transform"
                        title="ลบการผูกคู่มือนี้"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3.5 rounded-3xl border-2 border-dashed border-border/60 p-10 text-center bg-card/30">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                  <AlertCircle className="size-7" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">ยังไม่มีคู่มือสำหรับสินค้ารุ่นนี้</h3>
                  <p className="text-[0.8125rem] text-muted-foreground mt-1 max-w-sm">
                    ผูกประเภทอาการเสียเข้ากับรุ่นสินค้านี้ เพื่อให้ช่างสามารถดูขั้นตอนการซ่อมได้
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openCreateGuideForModel(selectedModel)}
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[0.8125rem] font-bold text-primary-foreground shadow-sm active:scale-95 transition-transform"
                >
                  <Plus className="size-4" />
                  ผูกคู่มือแรกสำหรับรุ่นนี้
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. CATALOG VIEW (All Models with Guides Status Indicator)                */
        /* ========================================================================= */
        <div className="space-y-5">
          {/* Header Section */}
          <div className="sticky top-0 md:top-16 z-20 bg-background/95 backdrop-blur-md pb-3.5 pt-2 -mx-4 px-4 border-b border-border/40 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <BookOpen className="size-6 text-primary" />
                  จัดการคู่มือและรุ่นสินค้า
                </h1>
                <p className="text-[0.8125rem] text-muted-foreground mt-0.5">
                  ศูนย์รวมข้อมูลรุ่นสินค้าและคู่มือการซ่อม ({filteredModels.length} จาก {stats.totalModels} รุ่น)
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                {lastSyncTime && (
                  <div className="bg-chart-4/10 border border-chart-4/20 text-chart-4 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-4 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-4"></span>
                    </span>
                    <div className="text-[0.6875rem] leading-tight">
                      <span className="font-semibold block">SFTP ล่าสุด</span>
                      <span className="opacity-90">{new Date(lastSyncTime).toLocaleDateString("th-TH")}</span>
                    </div>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={openCreateModel}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-[0.8125rem] font-semibold text-primary-foreground shadow-sm active:scale-95 transition-transform"
                >
                  <Plus className="size-4" />
                  เพิ่มรุ่นใหม่
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col gap-2.5">
              {/* Search & SubCategory Filter */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อรุ่น, รหัสสินค้า, หรือชื่ออาการเสีย..."
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="h-10 w-full rounded-xl border border-border/50 bg-card pl-9 pr-8 text-sm outline-none transition-all focus:border-primary shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("")
                        setCurrentPage(1)
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative sm:w-60 shrink-0">
                  <Filter className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <select
                    value={filterSubCategory}
                    onChange={e => {
                      setFilterSubCategory(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="h-10 w-full appearance-none rounded-xl border border-border/50 bg-card pl-9 pr-8 text-[0.8125rem] outline-none transition-all focus:border-primary shadow-sm text-foreground"
                  >
                    <option value="">ทุกหมวดหมู่ย่อย</option>
                    {categories.map(cat => {
                      const subCatsForCat = subCategories.filter(sc => sc.categoryId === cat.id || sc.categoryId === cat.slug)
                      if (subCatsForCat.length === 0) return null
                      return (
                        <optgroup key={cat.id} label={`หมวดหมู่: ${cat.name}`}>
                          {subCatsForCat.map(sc => (
                            <option key={sc.id} value={sc.id}>{sc.name}</option>
                          ))}
                        </optgroup>
                      )
                    })}
                  </select>
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => { setFilterGuideStatus("all"); setCurrentPage(1); }}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                    filterGuideStatus === "all"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-card border border-border/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  ทั้งหมด ({stats.totalModels})
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterGuideStatus("has_guides"); setCurrentPage(1); }}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all inline-flex items-center gap-1.5",
                    filterGuideStatus === "has_guides"
                      ? "bg-green-600 text-white shadow-xs"
                      : "bg-card border border-border/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <CheckCircle2 className="size-3.5" />
                  มีคู่มือแล้ว ({stats.hasGuidesCount})
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterGuideStatus("no_guides"); setCurrentPage(1); }}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all inline-flex items-center gap-1.5",
                    filterGuideStatus === "no_guides"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-card border border-border/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <AlertCircle className="size-3.5" />
                  ยังไม่มีคู่มือ ({stats.noGuidesCount})
                </button>
              </div>
            </div>
          </div>

          {/* Model List */}
          <div className="flex flex-col gap-3">
            {paginatedModels.map((m: DeviceModel) => {
              const code = (m.code || "").trim().toUpperCase()
              const guides = mappingsByModelCode.get(code) || []
              const subCat = subCategories.find(c => c.id === m.subcategoryId || c.index === m.subcategoryId)

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedModelId(m.id)}
                  className="group relative flex flex-col sm:flex-row justify-between rounded-2xl border border-border/40 bg-card p-4 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer gap-4 sm:items-center overflow-hidden"
                >
                  {/* Status Badge */}
                  {guides.length > 0 ? (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[0.625rem] font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      มีคู่มือแล้ว
                    </div>
                  ) : (
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[0.625rem] font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      ยังไม่มีคู่มือ
                    </div>
                  )}

                  {/* Left: Image & Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1 mt-2 sm:mt-0">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-background overflow-hidden shadow-inner">
                      {m.thumbnail ? (
                        <img src={m.thumbnail} alt={m.name} className="h-full w-full object-contain p-1" />
                      ) : (
                        <ImageIcon className="size-5 text-muted-foreground/30" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="font-bold text-[0.6875rem] text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {m.code}
                        </span>
                        {subCat && (
                          <span className="text-[0.6875rem] text-muted-foreground truncate max-w-[200px]">
                            {subCat.name}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm leading-snug text-foreground truncate group-hover:text-primary transition-colors pr-16 sm:pr-0">
                        {m.name}
                      </h3>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-border/40 pt-3 sm:pt-0 sm:pl-4 shrink-0" onClick={e => e.stopPropagation()}>
                    {guides.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setSelectedModelId(m.id)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 px-3 py-2 text-xs font-bold text-primary active:scale-95 transition-transform"
                      >
                        <BookOpen className="size-3.5" />
                        ดูคู่มือ
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => openCreateGuideForModel(m, e)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 active:scale-95 transition-transform"
                      >
                        <Plus className="size-3.5" />
                        ผูกคู่มือ
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => openEditModel(m, e)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                      title="แก้ไขข้อมูลรุ่น"
                    >
                      <Edit className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteModel(m.id, e)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                      title="ลบรุ่นสินค้านี้"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredModels.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border p-12 text-center bg-card/30">
              <Boxes className="size-10 text-muted-foreground/30 mb-1" />
              <h3 className="font-display text-[0.9375rem] font-bold text-muted-foreground">ไม่พบรุ่นสินค้าที่ค้นหา</h3>
              <p className="text-[0.8125rem] text-muted-foreground/70">ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรอง</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setFilterSubCategory(""); setFilterGuideStatus("all"); }}
                className="mt-2 text-xs font-semibold text-primary hover:underline"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-6 border-t border-border/40">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-10 items-center justify-center gap-1 rounded-xl px-4 bg-card border border-border/40 disabled:opacity-40 text-[0.8125rem] font-medium shadow-sm active:scale-95 transition-transform"
              >
                <ChevronLeft className="size-4" /> ก่อนหน้า
              </button>

              <span className="text-[0.8125rem] font-semibold text-muted-foreground">
                หน้า {currentPage} จาก {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-10 items-center justify-center gap-1 rounded-xl px-4 bg-card border border-border/40 disabled:opacity-40 text-[0.8125rem] font-medium shadow-sm active:scale-95 transition-transform"
              >
                ถัดไป <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODALS (Model Form & Guide Form)                                      */}
      {/* ========================================================================= */}

      {/* Model Create / Edit Form Modal */}
      {isModelFormOpen && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[90]" onClick={() => setIsModelFormOpen(false)}></div>
          <div className="fixed inset-0 z-[100] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-[480px] md:max-w-2xl md:top-[5vh] md:h-[90vh] md:rounded-3xl flex flex-col bg-background animate-in slide-in-from-bottom-full duration-300 sm:border border-border/40 shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-background/95 backdrop-blur-sm z-10 shrink-0">
              <h3 className="font-display text-lg font-bold text-foreground">
                {editingModelId ? "แก้ไขรุ่นสินค้า" : "เพิ่มรุ่นสินค้าใหม่"}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsModelFormOpen(false)} 
                className="p-2 -mr-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <form id="model-form" onSubmit={handleSaveModel} className="flex flex-col gap-6">
                <div className="space-y-2">
                  <label className="text-[0.8125rem] font-semibold text-foreground">รูปภาพสินค้า (URL)</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex h-36 items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/30 overflow-hidden">
                      {modelFormData.thumbnail ? (
                        <img
                          src={modelFormData.thumbnail}
                          alt="Preview"
                          className="h-full w-full object-contain p-2"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                          <ImageIcon className="size-8" />
                          <span className="text-xs font-medium">ไม่มีรูปภาพ</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      value={modelFormData.thumbnail}
                      onChange={e => setModelFormData({ ...modelFormData, thumbnail: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm outline-none transition-all focus:border-primary shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.8125rem] font-semibold text-foreground">ชื่อรุ่นสินค้า <span className="text-destructive">*</span></label>
                  <input
                    required
                    value={modelFormData.name}
                    onChange={e => setModelFormData({ ...modelFormData, name: e.target.value })}
                    placeholder="เช่น Mazuma รุ่น Hydro Pro"
                    className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm outline-none transition-all focus:border-primary shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[0.8125rem] font-semibold text-foreground">รหัสรุ่น (Model Code) <span className="text-destructive">*</span></label>
                  <input
                    required
                    value={modelFormData.code}
                    onChange={e => setModelFormData({ ...modelFormData, code: e.target.value.toUpperCase() })}
                    placeholder="เช่น MZ-HP4500"
                    className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm outline-none transition-all focus:border-primary shadow-sm uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[0.8125rem] font-semibold text-foreground">หมวดหมู่หลัก <span className="text-destructive">*</span></label>
                  <select
                    required
                    value={modelFormData.categoryId}
                    onChange={e => setModelFormData({ ...modelFormData, categoryId: e.target.value, subcategoryId: "" })}
                    className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm outline-none transition-all focus:border-primary shadow-sm"
                  >
                    <option value="">เลือกหมวดหมู่หลัก</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.8125rem] font-semibold text-foreground">หมวดหมู่ย่อย <span className="text-destructive">*</span></label>
                  <select
                    required
                    value={modelFormData.subcategoryId}
                    onChange={e => setModelFormData({ ...modelFormData, subcategoryId: e.target.value })}
                    disabled={!modelFormData.categoryId}
                    className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm outline-none transition-all focus:border-primary shadow-sm disabled:opacity-50"
                  >
                    <option value="">เลือกหมวดหมู่ย่อย</option>
                    {subCategories.filter(sc => {
                      const selectedCat = categories.find(c => c.id === modelFormData.categoryId)
                      return selectedCat && (sc.categoryId === selectedCat.slug || sc.categoryId === selectedCat.id)
                    }).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.8125rem] font-semibold text-foreground">สถานะ</label>
                  <div className="flex flex-col gap-2">
                    <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors", modelFormData.status === "active" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:bg-muted/50")}>
                      <input type="radio" name="status" value="active" checked={modelFormData.status === "active"} onChange={() => setModelFormData({ ...modelFormData, status: "active" })} className="size-4 text-primary focus:ring-primary" />
                      <span className="text-sm font-medium">เปิดจำหน่าย</span>
                    </label>
                    <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors", modelFormData.status === "draft" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border bg-card hover:bg-muted/50")}>
                      <input type="radio" name="status" value="draft" checked={modelFormData.status === "draft"} onChange={() => setModelFormData({ ...modelFormData, status: "draft" })} className="size-4 text-amber-500 focus:ring-amber-500" />
                      <span className="text-sm font-medium">ฉบับร่าง</span>
                    </label>
                    <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors", modelFormData.status === "discontinued" ? "border-destructive bg-destructive/5 ring-1 ring-destructive/20" : "border-border bg-card hover:bg-muted/50")}>
                      <input type="radio" name="status" value="discontinued" checked={modelFormData.status === "discontinued"} onChange={() => setModelFormData({ ...modelFormData, status: "discontinued" })} className="size-4 text-destructive focus:ring-destructive" />
                      <span className="text-sm font-medium">ยกเลิกผลิต</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="shrink-0 p-5 border-t border-border/40 bg-background/95 backdrop-blur-sm z-10">
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModelFormOpen(false)} 
                  className="flex-1 py-3.5 rounded-xl border border-border/50 bg-card font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  form="model-form"
                  disabled={savingModel} 
                  className="flex-1 py-3.5 rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {savingModel ? <Loader2 className="size-5 animate-spin" /> : "บันทึกข้อมูล"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Guide Form Modal */}
      {isGuideFormOpen && (
        <GuideForm
          user={user}
          editMapping={editingMapping}
          initialModelIds={guideFormModelIds.length > 0 ? guideFormModelIds : undefined}
          onFinish={handleGuideModalFinish}
        />
      )}
    </div>
  )
}
