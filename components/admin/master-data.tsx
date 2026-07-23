"use client"

import { useState, useEffect } from "react"
import { AuthUser } from "@/lib/auth"
import { Category } from "@/lib/mock-data"
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/data-service"
import { logActivity } from "@/lib/activity-service"
import { showToast, showAlert, confirmDelete } from "@/lib/swal"
import { Loader2, Plus, Trash2, Edit, ChevronRight, Boxes, Stethoscope, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function MasterDataManagement({ user }: { user: AuthUser }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  // Modals state
  const [showCatModal, setShowCatModal] = useState(false)
  const [catForm, setCatForm] = useState({ id: '', name: '', description: '', isEdit: false })

  const [showSymModal, setShowSymModal] = useState(false)
  const [symForm, setSymForm] = useState({ id: '', name: '', isEdit: false })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const cats = await getCategories()
    setCategories(cats)
    if (cats.length > 0 && !activeCategoryId) {
      setActiveCategoryId(cats[0].id)
    }
    setLoading(false)
  }

  const activeCategory = categories.find(c => c.id === activeCategoryId)

  const openAddCategory = () => {
    setCatForm({ id: '', name: '', description: '', isEdit: false })
    setShowCatModal(true)
  }

  const openEditCategory = (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation()
    setCatForm({ id: cat.id, name: cat.name, description: cat.description, isEdit: true })
    setShowCatModal(true)
  }

  const handleSaveCategory = async () => {
    if (!catForm.name) return showToast("กรุณากรอกชื่อหมวดหมู่", "error")
    
    try {
      if (catForm.isEdit) {
        await updateCategory(catForm.id, { name: catForm.name, description: catForm.description })
        await logActivity(user, "update", "category", `หมวดหมู่: ${catForm.name}`)
        showToast("แก้ไขหมวดหมู่สำเร็จ", "success")
      } else {
        await createCategory({ name: catForm.name, description: catForm.description })
        await logActivity(user, "create", "category", `หมวดหมู่: ${catForm.name}`)
        showToast("เพิ่มหมวดหมู่สำเร็จ", "success")
      }
      setShowCatModal(false)
      loadData()
    } catch (err: any) {
      showAlert("เกิดข้อผิดพลาด", err.message, "error")
    }
  }

  const handleDeleteCategory = async (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation()
    // if (cat.symptomGroups.length > 0) {
    //   return showAlert("ไม่สามารถลบได้", "หมวดหมู่นี้ยังมีกลุ่มอาการอยู่ กรุณาลบกลุ่มอาการทั้งหมดก่อน", "warning")
    // }
    const isConfirmed = await confirmDelete("ลบหมวดหมู่", `คุณต้องการลบหมวดหมู่ "${cat.name}" ใช่หรือไม่?`)
    if (isConfirmed) {
      try {
        await deleteCategory(cat.id)
        await logActivity(user, "delete", "category", `หมวดหมู่: ${cat.name}`)
        if (activeCategoryId === cat.id) setActiveCategoryId(null)
        showToast("ลบหมวดหมู่สำเร็จ", "success")
        loadData()
      } catch (err: any) {
        showAlert("เกิดข้อผิดพลาด", err.message, "error")
      }
    }
  }


  if (loading && categories.length === 0) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="size-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="mx-auto max-w-6xl pb-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">ข้อมูลพื้นฐาน (Master Data)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            จัดการหมวดหมู่สินค้าและกลุ่มอาการเสีย เพื่อนำไปใช้เป็นตัวเลือกในระบบ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-1 rounded-3xl border border-border/50 bg-card p-4 shadow-sm flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-display text-lg font-bold flex items-center gap-2"><Boxes className="size-5 text-primary" /> หมวดหมู่</h2>
            <button onClick={openAddCategory} className="inline-flex p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors">
              <Plus className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={cn(
                  "group w-full text-left px-4 py-3 rounded-2xl transition-all cursor-pointer",
                  activeCategoryId === cat.id 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-muted text-foreground"
                )}
              >
                <div className="flex items-center justify-between min-w-0">
                  <div className="min-w-0">
                    <p className="font-bold truncate">{cat.name}</p>
                    <p className={cn("text-xs mt-0.5", activeCategoryId === cat.id ? "text-primary-foreground/80" : "text-muted-foreground")}></p>
                  </div>
                  <div className={cn("flex items-center gap-1", activeCategoryId === cat.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity")}>
                    <button onClick={(e) => openEditCategory(cat, e)} className="p-1.5 hover:bg-black/10 rounded-lg"><Edit className="size-4" /></button>
                    <button onClick={(e) => handleDeleteCategory(cat, e)} className="p-1.5 hover:bg-black/10 rounded-lg"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Symptoms List placeholder */}
        <div className="lg:col-span-2 rounded-3xl border border-border/50 bg-card p-6 shadow-sm flex flex-col h-[600px] items-center justify-center text-center">
            <Stethoscope className="size-12 opacity-20 mb-3 text-primary" />
            <h2 className="font-display text-xl font-bold">ระบบจัดการอาการเสียอยู่ระหว่างการอัปเดต</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">เนื่องจากมีการเปลี่ยนแปลงโครงสร้างข้อมูลเป็นรูปแบบใหม่ (SymptomType & Symptom) กรุณาจัดการข้อมูลอาการเสียผ่าน Google Sheets ไปพลางๆ ก่อน</p>
        </div>
      </div>

      {/* Category Custom Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {catForm.isEdit ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
              </h2>
              <button onClick={() => setShowCatModal(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">ชื่อหมวดหมู่</label>
                <input 
                  autoFocus
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="เช่น เครื่องทำน้ำอุ่น"
                  value={catForm.name}
                  onChange={e => setCatForm({...catForm, name: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSaveCategory()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">คำอธิบาย</label>
                <input 
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="คำอธิบายสั้นๆ"
                  value={catForm.description}
                  onChange={e => setCatForm({...catForm, description: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSaveCategory()}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button onClick={() => setShowCatModal(false)} className="rounded-xl bg-muted px-6 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted/80 transition-all">
                ยกเลิก
              </button>
              <button onClick={handleSaveCategory} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
