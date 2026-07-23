"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Trash2, Edit, Save, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle, Boxes, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import type { DeviceModel, Category, SubCategory, SymptomType } from "@/lib/mock-data"
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
      res = res.filter(m => m.subcategoryId === filterSubCategory)
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
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">รุ่นสินค้า (Device Models)</h1>
          <p className="text-sm text-muted-foreground mt-1">จัดการข้อมูลรุ่นสินค้า รูปภาพประกอบ และสถานะการจัดจำหน่าย</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="size-4.5" />
          เพิ่มรุ่นใหม่
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-3xl border border-border/50 bg-card p-6 lg:p-8 shadow-md backdrop-blur-sm transition-all animate-in slide-in-from-top-4">
          <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-5">
            <div>
              <h3 className="font-display text-xl font-bold">{editingId ? "แก้ไขข้อมูลรุ่นสินค้า" : "เพิ่มรุ่นสินค้าใหม่"}</h3>
              <p className="text-sm text-muted-foreground mt-1">กรอกรายละเอียดของสินค้ารุ่นนี้ให้ครบถ้วน</p>
            </div>
            <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-full p-2 hover:bg-muted transition-colors">
              <X className="size-5" />
            </button>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <label className="mb-2 block text-sm font-semibold">รูปภาพสินค้า (Thumbnail URL)</label>
              <div className="flex flex-col gap-3">
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                />
                <div className="flex h-32 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 overflow-hidden">
                  {formData.thumbnail ? (
                     <img src={formData.thumbnail} alt="Preview" className="h-full w-full object-contain p-2" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                      <ImageIcon className="size-8" />
                      <span className="text-xs">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2 content-start">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">ชื่อรุ่นสินค้า <span className="text-destructive">*</span></label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น Mazuma รุ่น Hydro Pro"
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold">หมวดหมู่ย่อย (MAT Category) <span className="text-destructive">*</span></label>
                <select
                  required
                  value={formData.subcategoryId}
                  onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                >
                  <option value="">-- เลือกหมวดหมู่ย่อย --</option>
                  {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">ประเภทอาการ</label>
                <select
                  value={formData.symptomTypeId}
                  onChange={e => setFormData({ ...formData, symptomTypeId: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                >
                  <option value="">-- ไม่ระบุ --</option>
                  {symptomTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold">รหัสรุ่น (Product Code) <span className="text-destructive">*</span></label>
                <input
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="เช่น MZ-HP4500"
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">สถานะ</label>
                <div className="flex flex-wrap gap-3">
                   <label className={cn("flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 transition-all", formData.status === "active" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:bg-muted")}>
                     <input type="radio" name="status" value="active" checked={formData.status === "active"} onChange={() => setFormData({ ...formData, status: "active"})} className="text-primary focus:ring-primary" />
                     <span className="text-sm font-medium">เปิดจำหน่าย (Active)</span>
                   </label>
                   <label className={cn("flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 transition-all", formData.status === "draft" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-border hover:bg-muted")}>
                     <input type="radio" name="status" value="draft" checked={formData.status === "draft"} onChange={() => setFormData({ ...formData, status: "draft"})} className="text-amber-500 focus:ring-amber-500" />
                     <span className="text-sm font-medium">ฉบับร่าง (Draft)</span>
                   </label>
                   <label className={cn("flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 transition-all", formData.status === "discontinued" ? "border-destructive bg-destructive/5 ring-1 ring-destructive/20" : "border-border hover:bg-muted")}>
                     <input type="radio" name="status" value="discontinued" checked={formData.status === "discontinued"} onChange={() => setFormData({ ...formData, status: "discontinued"})} className="text-destructive focus:ring-destructive" />
                     <span className="text-sm font-medium">ยกเลิกผลิต (Discontinued)</span>
                   </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-border/50">
            <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md disabled:opacity-50 hover:bg-primary/90 hover:shadow-lg transition-all">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาชื่อรุ่น หรือ รหัสสินค้า..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Filter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={filterSubCategory}
            onChange={e => {
              setFilterSubCategory(e.target.value)
              setCurrentPage(1)
            }}
            className="h-10 w-full appearance-none rounded-xl border border-input bg-card pl-9 pr-8 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
          >
            <option value="">ทุกหมวดหมู่ย่อย</option>
            {subCategories.map(sc => (
              <option key={sc.id} value={sc.id}>{sc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-border/50 bg-muted/40">
              <tr>
                <th className="px-6 py-4 font-semibold text-muted-foreground">รูปภาพ</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">หมวดหมู่</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">ชื่อรุ่น</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">รหัสสินค้า</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">สถานะ</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedModels.map((m: DeviceModel) => {
                const subCat = subCategories.find(c => c.id === m.subcategoryId)
                return (
                  <tr key={m.id} className="group transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-background overflow-hidden">
                         {m.thumbnail ? <img src={m.thumbnail} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="size-5 text-muted-foreground/30" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-muted-foreground">{subCat ? `[${subCat.id}] ${subCat.name}` : m.subcategoryId || m.categoryId}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-base">{m.name}</p>
                      {m.createdAt && <p className="text-xs text-muted-foreground mt-0.5">เพิ่มเมื่อ: {new Date(m.createdAt).toLocaleDateString()}</p>}
                    </td>
                    <td className="px-6 py-4"><span className="font-mono text-sm bg-muted px-2 py-1 rounded-md">{m.code}</span></td>
                    <td className="px-6 py-4">
                      {m.status === "active" && <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-600"><CheckCircle2 className="size-3.5" /> จำหน่ายอยู่</span>}
                      {m.status === "draft" && <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600"><AlertCircle className="size-3.5" /> ฉบับร่าง</span>}
                      {m.status === "discontinued" && <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive"><X className="size-3.5" /> ยกเลิกผลิต</span>}
                      {!m.status && <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-600">Active</span>}
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(m)} className="inline-flex p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors" title="แก้ไข">
                          <Edit className="size-4.5" />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="inline-flex p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors" title="ลบ">
                          <Trash2 className="size-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {paginatedModels.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                     <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Boxes className="size-10 opacity-20" />
                        <p>ไม่มีข้อมูลรุ่นสินค้าที่ตรงกับการค้นหา</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              แสดง {((currentPage - 1) * ITEMS_PER_PAGE) + 1} ถึง {Math.min(currentPage * ITEMS_PER_PAGE, filteredModels.length)} จาก {filteredModels.length} รายการ
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:hover:bg-card shadow-sm transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="flex items-center justify-center px-2 text-sm font-medium">
                หน้า {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:hover:bg-card shadow-sm transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
