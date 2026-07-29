"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Boxes,
  Film,
  Search,
  Filter
} from "lucide-react"
import type { Category, DeviceModel, Guide, Symptom, SymptomType } from "@/lib/mock-data"
import { getCategories, getGuides, getModels, deleteGuide, getSymptoms, getSymptomTypes } from "@/lib/data-service"
import { logActivity } from "@/lib/activity-service"
import { showToast, confirmDelete, showAlert } from "@/lib/swal"
import { AuthUser } from "@/lib/auth"

export function GuidesManagement({ user, onCreate, onEdit }: { user: AuthUser, onCreate: () => void, onEdit: (id: string) => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [cats, gds, mods, syms, symTypes] = await Promise.all([
      getCategories(), getGuides(), getModels(), getSymptoms(), getSymptomTypes()
    ])
    setCategories(cats)
    setGuides(gds)
    setModels(mods)
    setSymptoms(syms)
    setSymptomTypes(symTypes)
    setLoading(false)
  }

  const handleDelete = async (guide: Guide) => {
    const isConfirmed = await confirmDelete("ลบคู่มือ", "คุณแน่ใจหรือไม่ที่จะลบคู่มือการซ่อมนี้?")
    if (!isConfirmed) return
    
    try {
      await deleteGuide(guide.id)
      await logActivity(user, "delete", "guide", guide.title, guide.id)
      await loadData()
      showToast("ลบคู่มือสำเร็จ", "success")
    } catch (err: any) {
      showAlert("ลบไม่สำเร็จ", err.message, "error")
    }
  }

  const handleStatusChange = async (guide: Guide, newStatus: string) => {
    try {
      setGuides(guides.map(g => g.id === guide.id ? { ...g, status: newStatus as any } : g))
      await import("@/lib/data-service").then(m => m.updateGuide(guide.id, { status: newStatus as any }))
      showToast("อัปเดตสถานะสำเร็จ", "success")
      logActivity(user, "update", "guide", guide.id, guide.title, `อัปเดตสถานะเป็น ${newStatus}`)
    } catch (err: any) {
      showToast("เกิดข้อผิดพลาด", "error")
      loadData()
    }
  }

  const filteredGuides = guides.filter((g) => {
    if (g.status === 'archived') return false;
    const matchSearch = (g.title || '').toLowerCase().includes(search.toLowerCase()) || 
                        (g.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchCat = filterCat ? g.categoryId === filterCat : true
    return matchSearch && matchCat
  })

  if (loading && guides.length === 0) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="size-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="mx-auto max-w-6xl pb-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">คู่มือการซ่อมทั้งหมด</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ค้นหา แก้ไข และจัดการคู่มือการซ่อมทั้งหมดในระบบ
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="size-4.5" />
          สร้างคู่มือใหม่
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาชื่ออาการเสีย หรือแท็ก..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-10 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
         </div>
         <div className="relative min-w-[200px]">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 appearance-none"
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
         </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/50 bg-muted/40">
              <tr>
                <th className="px-6 py-4 font-semibold text-muted-foreground">หัวข้อ / อาการเสีย</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">หมวดหมู่</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">รุ่นที่รองรับ</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">ขั้นตอน</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">สถานะ</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredGuides.map((g) => {
                const cat = categories.find((c) => c.id === g.categoryId)
                const sym = symptoms.find((s) => s.id === g.symptomId)
                const symType = symptomTypes.find((st) => st.id === sym?.symptomTypeId)
                const linkedModels = g.modelIds && g.modelIds.length > 0
                  ? models.filter(m => g.modelIds!.includes(m.id))
                  : (symType ? models.filter(m => m.symptomTypeId === symType.id) : [])
                const tooltipText = linkedModels.map(m => `[${m.code}] ${m.name}`).join('\n') || 'ไม่มีข้อมูลรุ่นที่ระบุชัดเจน'
                
                return (
                  <tr key={g.id} className="group transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4 max-w-[350px]">
                      <p className="font-bold text-base whitespace-normal">{g.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                         {g.tags && g.tags.length > 0 && (
                            <div className="flex gap-1">
                              {g.tags.map(t => <span key={t} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{t}</span>)}
                            </div>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[250px]">
                       <p className="font-medium text-foreground whitespace-normal">{cat?.name}</p>
                       <p className="text-xs text-muted-foreground mt-0.5 whitespace-normal">{sym?.description || 'ไม่ระบุอาการ'}</p>
                    </td>
                    <td className="px-6 py-4">
                       <span 
                         className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground cursor-help"
                         title={tooltipText}
                       >
                         <Boxes className="size-3.5" />
                         {linkedModels.length} รุ่น
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                         <Film className="size-3.5" />
                         {g.steps.length} ขั้นตอน
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={g.status}
                        onChange={(e) => handleStatusChange(g, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full outline-none cursor-pointer text-center ${
                          g.status === 'published' ? 'bg-green-500/10 text-green-600' : 
                          g.status === 'draft' ? 'bg-amber-500/10 text-amber-600' : 
                          'bg-muted text-muted-foreground'
                        }`}
                      >
                        <option value="published">เผยแพร่</option>
                        <option value="draft">ฉบับร่าง</option>
                        <option value="archived">เก็บถาวร</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right align-middle whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button onClick={() => onEdit(g.id)} className="inline-flex p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors" title="แก้ไข">
                          <Edit className="size-4.5" />
                        </button>
                        <button onClick={() => handleDelete(g)} className="inline-flex p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors" title="ลบ">
                          <Trash2 className="size-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredGuides.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                     <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <BookOpen className="size-10 opacity-20" />
                        <p>ไม่พบคู่มือที่ตรงกับเงื่อนไข</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
