"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Trash2, Edit, Save, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle, Boxes, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import type { DeviceModel, Category, SubCategory, SymptomType } from "@/lib/types"
import { getModels, createModel, updateModel, deleteModel, getCategories, getSubCategories, getSymptomTypes } from "@/lib/data-service"
import { showToast, confirmDelete, showAlert } from "@/lib/swal"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/lib/auth"

export function ModelsManagement({ user }: { user?: AuthUser }) {
  const [models, setModels] = useState<DeviceModel[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([])
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
    const [mods, cats, subCats, symTypes] = await Promise.all([getModels(), getCategories(), getSubCategories(), getSymptomTypes()])
    setModels(mods)
    setCategories(cats)
    setSubCategories(subCats)
    setSymptomTypes(symTypes)
    setLoading(false)
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
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">จัดการรุ่นสินค้า</h1>
        <p className="text-[13px] text-muted-foreground mt-1">ข้อมูลรุ่นสินค้า รูปภาพประกอบ และสถานะ</p>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-sm"
        >
          <Plus className="size-4" />
          เพิ่มรุ่นใหม่
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาชื่อรุ่น หรือ รหัสสินค้า..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="h-11 w-full rounded-2xl border border-input bg-card pl-9 pr-4 text-[14px] outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
        <div className="relative w-full">
          <Filter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={filterSubCategory}
            onChange={e => {
              setFilterSubCategory(e.target.value)
              setCurrentPage(1)
            }}
            className="h-11 w-full appearance-none rounded-2xl border border-input bg-card pl-9 pr-8 text-[14px] outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
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

      {/* Mobile Card List */}
      <div className="flex flex-col gap-3">
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
                    <p className="font-semibold text-[15px] leading-tight text-foreground line-clamp-1">{m.name}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      {m.status === "active" && <span className="size-2 rounded-full bg-green-500" title="Active"></span>}
                      {m.status === "draft" && <span className="size-2 rounded-full bg-amber-500" title="Draft"></span>}
                      {m.status === "discontinued" && <span className="size-2 rounded-full bg-destructive" title="Discontinued"></span>}
                    </div>
                  </div>
                  <p className="text-[12px] text-muted-foreground font-mono mt-0.5">{m.code}</p>
                  <p className="text-[12px] text-muted-foreground truncate">{subCat ? subCat.name : m.subcategoryId || m.categoryId}</p>
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
            <p className="text-[15px] text-muted-foreground">ไม่มีข้อมูลรุ่นสินค้าที่ตรงกับการค้นหา</p>
          </div>
        )}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-10 items-center justify-center gap-1 rounded-xl px-4 bg-card border border-border/40 disabled:opacity-50 text-[13px] font-medium shadow-sm active:scale-95 transition-transform"
          >
            <ChevronLeft className="size-4" /> ก่อนหน้า
          </button>
          <div className="text-[13px] font-medium text-muted-foreground">
            {currentPage} / {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-10 items-center justify-center gap-1 rounded-xl px-4 bg-card border border-border/40 disabled:opacity-50 text-[13px] font-medium shadow-sm active:scale-95 transition-transform"
          >
            ถัดไป <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {/* Form Modal (Full Screen Mobile) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-[480px] flex flex-col bg-background animate-in slide-in-from-bottom-full duration-300 sm:border-x border-border/40 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 pt-safe border-b border-border/40 bg-background/70 backdrop-blur-2xl">
            <button type="button" onClick={() => setIsFormOpen(false)} className="text-[15px] font-medium text-muted-foreground">ยกเลิก</button>
            <h3 className="font-display text-[17px] font-bold">{editingId ? "แก้ไขรุ่น" : "เพิ่มรุ่นใหม่"}</h3>
            <button type="button" onClick={handleSubmit} disabled={saving} className="text-[15px] font-semibold text-primary disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : "บันทึก"}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground">รูปภาพสินค้า (URL)</label>
                <div className="flex flex-col gap-3">
                  <div className="flex h-32 items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/30 overflow-hidden">
                    {formData.thumbnail ? (
                       <img src={formData.thumbnail} alt="Preview" className="h-full w-full object-contain p-2" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                        <ImageIcon className="size-8" />
                        <span className="text-[11px]">ไม่มีรูปภาพ</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-input bg-card px-4 py-3 text-[14px] outline-none transition-all focus:border-primary shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground">ชื่อรุ่นสินค้า <span className="text-destructive">*</span></label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น Mazuma รุ่น Hydro Pro"
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 text-[14px] outline-none transition-all focus:border-primary shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground">รหัสรุ่น <span className="text-destructive">*</span></label>
                <input
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="เช่น MZ-HP4500"
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 text-[14px] outline-none transition-all focus:border-primary shadow-sm uppercase"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground">หมวดหมู่หลัก <span className="text-destructive">*</span></label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: "" })}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 text-[14px] outline-none transition-all focus:border-primary shadow-sm"
                >
                  <option value="">เลือกหมวดหมู่หลัก</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground">หมวดหมู่ย่อย <span className="text-destructive">*</span></label>
                <select
                  required
                  value={formData.subcategoryId}
                  onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })}
                  disabled={!formData.categoryId}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 text-[14px] outline-none transition-all focus:border-primary shadow-sm disabled:opacity-50"
                >
                  <option value="">เลือกหมวดหมู่ย่อย</option>
                  {subCategories.filter(sc => sc.categoryId === formData.categoryId).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground">สถานะ</label>
                <div className="flex flex-col gap-2">
                   <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors", formData.status === "active" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card")}>
                     <input type="radio" name="status" value="active" checked={formData.status === "active"} onChange={() => setFormData({ ...formData, status: "active"})} className="size-4 text-primary focus:ring-primary" />
                     <span className="text-[14px] font-medium">เปิดจำหน่าย</span>
                   </label>
                   <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors", formData.status === "draft" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border bg-card")}>
                     <input type="radio" name="status" value="draft" checked={formData.status === "draft"} onChange={() => setFormData({ ...formData, status: "draft"})} className="size-4 text-amber-500 focus:ring-amber-500" />
                     <span className="text-[14px] font-medium">ฉบับร่าง</span>
                   </label>
                   <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors", formData.status === "discontinued" ? "border-destructive bg-destructive/5 ring-1 ring-destructive/20" : "border-border bg-card")}>
                     <input type="radio" name="status" value="discontinued" checked={formData.status === "discontinued"} onChange={() => setFormData({ ...formData, status: "discontinued"})} className="size-4 text-destructive focus:ring-destructive" />
                     <span className="text-[14px] font-medium">ยกเลิกผลิต</span>
                   </label>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
