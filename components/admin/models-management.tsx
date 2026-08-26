"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Trash2, Edit, Save, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle, Boxes, Search, Filter, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import type { DeviceModel, Category, SubCategory, SymptomType } from "@/lib/types"
import { getModels, createModel, updateModel, deleteModel, getCategories, getSubCategories, getSymptomTypes } from "@/lib/data-service"
import { getLastSyncTime } from "@/lib/activity-service"
import { showToast, confirmDelete, showAlert } from "@/lib/swal"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/lib/auth"

export function ModelsManagement({ user }: { user?: AuthUser }) {
  const [models, setModels] = useState<DeviceModel[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([])
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Filter and Pagination state
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSubCategory, setFilterSubCategory] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 50

  // Edit / Create state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    id: "",
    categoryId: "",
    subcategoryId: "",
    symptomTypeId: "",
    name: "",
    code: "",
    status: "active" as "active" | "discontinued" | "draft",
    thumbnail: "",
  })
  
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [mods, cats, subCats, symTypes, syncTime] = await Promise.all([
        getModels(), 
        getCategories(), 
        getSubCategories(), 
        getSymptomTypes(),
        getLastSyncTime()
      ])
      setModels(mods)
      setCategories(cats)
      setSubCategories(subCats)
      setSymptomTypes(symTypes)
      setLastSyncTime(syncTime)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredModels = useMemo(() => {
    let res = models
    if (filterSubCategory) {
      const selectedSubCat = subCategories.find(sc => sc.id === filterSubCategory);
      res = res.filter(m => 
        m.subcategoryId === filterSubCategory || 
        (selectedSubCat && (m.subcategoryId === selectedSubCat.index || m.subcategoryId === selectedSubCat.name))
      )
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      res = res.filter(m => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q))
    }
    return res
  }, [models, filterSubCategory, searchQuery])

  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE) || 1

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [totalPages, currentPage])

  const paginatedModels = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredModels.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredModels, currentPage])

  const openCreate = () => {
    setFormData({ 
      id: `m-${Date.now()}`, 
      categoryId: categories[0]?.id || "", 
      subcategoryId: "",
      symptomTypeId: "",
      name: "", 
      code: "",
      status: "active",
      thumbnail: "" 
    })
    setEditingId(null)
    setIsFormOpen(true)
  }

  const openEdit = (m: DeviceModel) => {
    setFormData({ ...m, subcategoryId: m.subcategoryId || "", symptomTypeId: m.symptomTypeId || "", status: m.status || "active", thumbnail: m.thumbnail || "" })
    setEditingId(m.id)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirmDelete("ลบรุ่นสินค้า", "คุณแน่ใจหรือไม่ที่จะลบรุ่นสินค้านี้?")
    if (!isConfirmed) return
    
    setSaving(true)
    try {
      await deleteModel(id)
      await loadData()
      showToast("ลบรุ่นสินค้าสำเร็จ", "success")
    } catch (err: any) {
      showAlert("ลบไม่สำเร็จ", err.message, "error")
    }
    setSaving(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await updateModel(editingId, formData)
        showToast("อัปเดตข้อมูลรุ่นสำเร็จ", "success")
      } else {
        await createModel(formData as DeviceModel)
        showToast("สร้างรุ่นสินค้าสำเร็จ", "success")
      }
      setIsFormOpen(false)
      await loadData()
    } catch (err: any) {
      showAlert("บันทึกไม่สำเร็จ", err.message, "error")
    }
    setSaving(false)
  }

  if (loading && models.length === 0) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="size-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="mx-auto w-full px-4 pb-8">
      {/* Sticky Header Section */}
      <div className="sticky top-0 md:top-16 z-20 bg-background/95 backdrop-blur-md pb-3.5 pt-2 -mx-4 px-4 border-b border-border/40 mb-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">จัดการรุ่นสินค้า</h1>
            <p className="text-[0.8125rem] text-muted-foreground mt-0.5">
              ข้อมูลรุ่นสินค้า รูปภาพประกอบ และสถานะ ({filteredModels.length} รุ่น)
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {lastSyncTime && (
              <div className="bg-chart-4/10 border border-chart-4/20 text-chart-4 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-4 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-4"></span>
                </span>
                <div className="text-[0.6875rem] leading-tight">
                  <span className="font-semibold block">SFTP ล่าสุด</span>
                  <span className="opacity-90">{new Date(lastSyncTime).toLocaleDateString("th-TH")} {new Date(lastSyncTime).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            )}
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-[0.8125rem] font-semibold text-primary-foreground shadow-sm active:scale-95 transition-transform"
            >
              <Plus className="size-4" />
              เพิ่มรุ่นใหม่
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาชื่อรุ่น หรือ รหัสสินค้า..."
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
          <div className="relative sm:w-64 shrink-0">
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
                const subCatsForCat = subCategories.filter(sc => sc.categoryId === cat.id || sc.categoryId === cat.slug);
                if (subCatsForCat.length === 0) return null;
                return (
                  <optgroup key={cat.id} label={`หมวดหมู่: ${cat.name}`}>
                    {subCatsForCat.map(sc => (
                      <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Card List / PC Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {paginatedModels.map((m: DeviceModel) => {
          const subCat = subCategories.find(c => c.id === m.subcategoryId)
          return (
            <div key={m.id} className="flex gap-3 overflow-hidden rounded-2xl border border-border/40 bg-card p-3 shadow-sm">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-background overflow-hidden">
                {m.thumbnail ? <img src={m.thumbnail} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="size-6 text-muted-foreground/30" />}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-[0.9375rem] leading-tight text-foreground line-clamp-1">{m.name}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      {m.status === "active" && <span className="size-2 rounded-full bg-green-500" title="Active"></span>}
                      {m.status === "draft" && <span className="size-2 rounded-full bg-amber-500" title="Draft"></span>}
                      {m.status === "discontinued" && <span className="size-2 rounded-full bg-destructive" title="Discontinued"></span>}
                    </div>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground truncate">{m.code}</p>
                  <p className="text-xs text-muted-foreground truncate">{subCat ? subCat.name : m.subcategoryId || m.categoryId}</p>
                  <p className="text-[0.625rem] text-muted-foreground/70 mt-2 flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    อัปเดต/ซิงค์: {m.lastSyncAt ? new Date(m.lastSyncAt).toLocaleString('th-TH') : (m.updatedAt ? new Date(m.updatedAt).toLocaleString('th-TH') : '-')}
                  </p>
                </div>
                <div className="flex justify-end gap-1 mt-1">
                  <button onClick={() => openEdit(m)} className="p-1.5 text-muted-foreground hover:bg-black/5 rounded-lg transition-colors"><Edit className="size-4" /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </div>
          )
        })}
        
        {paginatedModels.length === 0 && (
          <div className="py-12 text-center flex flex-col items-center">
            <Boxes className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-[0.9375rem] text-muted-foreground">ไม่มีข้อมูลรุ่นสินค้าที่ตรงกับการค้นหา</p>
          </div>
        )}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-10 items-center justify-center gap-1 rounded-xl px-4 bg-card border border-border/40 disabled:opacity-50 text-[0.8125rem] font-medium shadow-sm active:scale-95 transition-transform"
          >
            <ChevronLeft className="size-4" /> ก่อนหน้า
          </button>
          <div className="text-[0.8125rem] font-medium text-muted-foreground">
            {currentPage} / {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-10 items-center justify-center gap-1 rounded-xl px-4 bg-card border border-border/40 disabled:opacity-50 text-[0.8125rem] font-medium shadow-sm active:scale-95 transition-transform"
          >
            ถัดไป <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {/* Form Modal (Full Screen Mobile / Centered PC) */}
      {isFormOpen && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[90] hidden md:block" onClick={() => setIsFormOpen(false)}></div>
          <div className="fixed inset-0 z-[100] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-[480px] md:max-w-2xl md:top-[5vh] md:h-[90vh] md:rounded-3xl flex flex-col bg-background animate-in slide-in-from-bottom-full duration-300 sm:border border-border/40 shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-background/95 backdrop-blur-sm z-10 shrink-0">
            <h3 className="font-display text-lg font-bold text-foreground">
              {editingId ? "แก้ไขรุ่นสินค้า" : "เพิ่มรุ่นสินค้าใหม่"}
            </h3>
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)} 
              className="p-2 -mr-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
          
          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <form id="model-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-[0.8125rem] font-semibold text-foreground">รูปภาพสินค้า (URL)</label>
                <div className="flex flex-col gap-3">
                  <div className="flex h-36 items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/30 overflow-hidden">
                    {formData.thumbnail ? (
                       <img src={formData.thumbnail} alt="Preview" className="h-full w-full object-contain p-2" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                        <ImageIcon className="size-8" />
                        <span className="text-xs font-medium">ไม่มีรูปภาพ</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm outline-none transition-all focus:border-primary shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[0.8125rem] font-semibold text-foreground">ชื่อรุ่นสินค้า <span className="text-destructive">*</span></label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น Mazuma รุ่น Hydro Pro"
                  className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm outline-none transition-all focus:border-primary shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[0.8125rem] font-semibold text-foreground">รหัสรุ่น (Model Code) <span className="text-destructive">*</span></label>
                <input
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="เช่น MZ-HP4500"
                  className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm outline-none transition-all focus:border-primary shadow-sm uppercase"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[0.8125rem] font-semibold text-foreground">หมวดหมู่หลัก <span className="text-destructive">*</span></label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: "" })}
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
                  value={formData.subcategoryId}
                  onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })}
                  disabled={!formData.categoryId}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3.5 text-sm outline-none transition-all focus:border-primary shadow-sm disabled:opacity-50"
                >
                  <option value="">เลือกหมวดหมู่ย่อย</option>
                  {subCategories.filter(sc => {
                    const selectedCat = categories.find(c => c.id === formData.categoryId);
                    return selectedCat && sc.categoryId === selectedCat.slug;
                  }).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[0.8125rem] font-semibold text-foreground">สถานะ</label>
                <div className="flex flex-col gap-2">
                   <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors", formData.status === "active" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:bg-muted/50")}>
                     <input type="radio" name="status" value="active" checked={formData.status === "active"} onChange={() => setFormData({ ...formData, status: "active"})} className="size-4 text-primary focus:ring-primary" />
                     <span className="text-sm font-medium">เปิดจำหน่าย</span>
                   </label>
                   <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors", formData.status === "draft" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border bg-card hover:bg-muted/50")}>
                     <input type="radio" name="status" value="draft" checked={formData.status === "draft"} onChange={() => setFormData({ ...formData, status: "draft"})} className="size-4 text-amber-500 focus:ring-amber-500" />
                     <span className="text-sm font-medium">ฉบับร่าง</span>
                   </label>
                   <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors", formData.status === "discontinued" ? "border-destructive bg-destructive/5 ring-1 ring-destructive/20" : "border-border bg-card hover:bg-muted/50")}>
                     <input type="radio" name="status" value="discontinued" checked={formData.status === "discontinued"} onChange={() => setFormData({ ...formData, status: "discontinued"})} className="size-4 text-destructive focus:ring-destructive" />
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
                onClick={() => setIsFormOpen(false)} 
                className="flex-1 py-3.5 rounded-xl border border-border/50 bg-card font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-sm"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                form="model-form"
                disabled={saving} 
                className="flex-1 py-3.5 rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="size-5 animate-spin" /> : "บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  )
}
