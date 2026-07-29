"use client"

import { useState, useEffect } from "react"
import { AuthUser } from "@/lib/auth"
import { Category, SymptomType, Symptom } from "@/lib/mock-data"
import { getCategories, createCategory, updateCategory, deleteCategory, getSymptomTypes, createSymptomType, updateSymptomType, deleteSymptomType, getSymptoms, createSymptom, updateSymptom, deleteSymptom } from "@/lib/data-service"
import { logActivity } from "@/lib/activity-service"
import { showToast, showAlert, confirmDelete } from "@/lib/swal"
import { Loader2, Plus, Trash2, Edit, ChevronRight, Boxes, Stethoscope, X, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export function MasterDataManagement({ user }: { user: AuthUser }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [activeSymptomTypeId, setActiveSymptomTypeId] = useState<string | null>(null)

  // Modals state
  const [showCatModal, setShowCatModal] = useState(false)
  const [catForm, setCatForm] = useState({ id: '', name: '', description: '', isEdit: false })

  const [showSymModal, setShowSymModal] = useState(false)
  const [symForm, setSymForm] = useState({ id: '', name: '', isEdit: false })

  const [showRootModal, setShowRootModal] = useState(false)
  const [rootForm, setRootForm] = useState({ id: '', title: '', description: '', severity: 'Medium', isEdit: false })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [cats, symTypes, syms] = await Promise.all([getCategories(), getSymptomTypes(), getSymptoms()])
    setCategories(cats)
    setSymptomTypes(symTypes)
    setSymptoms(syms)
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
    const isConfirmed = await confirmDelete("ลบหมวดหมู่", `คุณต้องการลบหมวดหมู่ "${cat.name}" ใช่หรือไม่?`)
    if (isConfirmed) {
      try {
        await deleteCategory(cat.id)
        await logActivity(user, "delete", "category", `หมวดหมู่: ${cat.name}`)
        if (activeCategoryId === cat.id) {
          setActiveCategoryId(null)
          setActiveSymptomTypeId(null)
        }
        showToast("ลบหมวดหมู่สำเร็จ", "success")
        loadData()
      } catch (err: any) {
        showAlert("เกิดข้อผิดพลาด", err.message, "error")
      }
    }
  }

  const openAddSymptomType = () => {
    setSymForm({ id: '', name: '', isEdit: false })
    setShowSymModal(true)
  }

  const openEditSymptomType = (st: SymptomType, e: React.MouseEvent) => {
    e.stopPropagation()
    setSymForm({ id: st.id, name: st.name, isEdit: true })
    setShowSymModal(true)
  }

  const handleSaveSymptomType = async () => {
    if (!symForm.name) return showToast("กรุณากรอกชื่อกลุ่มอาการ", "error")
    if (!activeCategoryId) return showToast("กรุณาเลือกหมวดหมู่หลักก่อน", "error")
    
    try {
      if (symForm.isEdit) {
        await updateSymptomType(symForm.id, { name: symForm.name })
        await logActivity(user, "update", "symptom_type", `กลุ่มอาการ: ${symForm.name}`)
        showToast("แก้ไขกลุ่มอาการสำเร็จ", "success")
      } else {
        await createSymptomType({ name: symForm.name, categoryId: activeCategoryId })
        await logActivity(user, "create", "symptom_type", `กลุ่มอาการ: ${symForm.name}`)
        showToast("เพิ่มกลุ่มอาการสำเร็จ", "success")
      }
      setShowSymModal(false)
      loadData()
    } catch (err: any) {
      showAlert("เกิดข้อผิดพลาด", err.message, "error")
    }
  }

  const handleDeleteSymptomType = async (st: SymptomType, e: React.MouseEvent) => {
    e.stopPropagation()
    const isConfirmed = await confirmDelete("ลบกลุ่มอาการ", `คุณต้องการลบกลุ่มอาการ "${st.name}" ใช่หรือไม่?`)
    if (isConfirmed) {
      try {
        await deleteSymptomType(st.id)
        await logActivity(user, "delete", "symptom_type", `กลุ่มอาการ: ${st.name}`)
        if (activeSymptomTypeId === st.id) setActiveSymptomTypeId(null)
        showToast("ลบกลุ่มอาการสำเร็จ", "success")
        loadData()
      } catch (err: any) {
        showAlert("เกิดข้อผิดพลาด", err.message, "error")
      }
    }
  }

  const openAddRootCause = () => {
    setRootForm({ id: '', title: '', description: '', severity: 'Medium', isEdit: false })
    setShowRootModal(true)
  }

  const openEditRootCause = (sym: Symptom, e: React.MouseEvent) => {
    e.stopPropagation()
    setRootForm({ id: sym.id, title: sym.title, description: sym.description, severity: sym.severity, isEdit: true })
    setShowRootModal(true)
  }

  const handleSaveRootCause = async () => {
    if (!rootForm.title) return showToast("กรุณากรอกชื่ออาการเสีย", "error")
    if (!activeSymptomTypeId) return showToast("กรุณาเลือกกลุ่มอาการก่อน", "error")
    
    try {
      if (rootForm.isEdit) {
        await updateSymptom(rootForm.id, { title: rootForm.title, description: rootForm.description, severity: rootForm.severity as any })
        await logActivity(user, "update", "symptom", `อาการเสีย: ${rootForm.title}`)
        showToast("แก้ไขอาการเสียสำเร็จ", "success")
      } else {
        await createSymptom({ title: rootForm.title, description: rootForm.description, severity: rootForm.severity as any, symptomTypeId: activeSymptomTypeId })
        await logActivity(user, "create", "symptom", `อาการเสีย: ${rootForm.title}`)
        showToast("เพิ่มอาการเสียสำเร็จ", "success")
      }
      setShowRootModal(false)
      loadData()
    } catch (err: any) {
      showAlert("เกิดข้อผิดพลาด", err.message, "error")
    }
  }

  const handleDeleteRootCause = async (sym: Symptom, e: React.MouseEvent) => {
    e.stopPropagation()
    const isConfirmed = await confirmDelete("ลบอาการเสีย", `คุณต้องการลบอาการเสีย "${sym.title}" ใช่หรือไม่?`)
    if (isConfirmed) {
      try {
        await deleteSymptom(sym.id)
        await logActivity(user, "delete", "symptom", `อาการเสีย: ${sym.title}`)
        showToast("ลบอาการเสียสำเร็จ", "success")
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
                onClick={() => {
                  if (activeCategoryId !== cat.id) {
                    setActiveCategoryId(cat.id)
                    setActiveSymptomTypeId(null)
                  }
                }}
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

        {/* Symptom Types List */}
        <div className="lg:col-span-1 rounded-3xl border border-border/50 bg-card p-4 shadow-sm flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-display text-lg font-bold flex items-center gap-2"><Stethoscope className="size-5 text-primary" /> กลุ่มอาการเสีย</h2>
            {activeCategoryId && (
              <button onClick={openAddSymptomType} className="inline-flex p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                <Plus className="size-5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {(() => {
              const filteredSymptomTypes = symptomTypes.filter(st => st.categoryId === activeCategoryId);
              return (
                <>
                  {filteredSymptomTypes.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => setActiveSymptomTypeId(st.id)}
                      className={cn(
                        "group w-full text-left px-4 py-3 rounded-2xl transition-all cursor-pointer",
                        activeSymptomTypeId === st.id 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between min-w-0">
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{st.name}</p>
                          <p className={cn("text-xs mt-0.5 font-mono", activeSymptomTypeId === st.id ? "text-primary-foreground/80" : "text-muted-foreground")}>{st.id}</p>
                        </div>
                        <div className={cn("flex items-center gap-1", activeSymptomTypeId === st.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity")}>
                          <button onClick={(e) => openEditSymptomType(st, e)} className="p-1.5 hover:bg-black/10 rounded-lg"><Edit className="size-4" /></button>
                          <button onClick={(e) => handleDeleteSymptomType(st, e)} className="p-1.5 hover:bg-black/10 rounded-lg"><Trash2 className="size-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredSymptomTypes.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                      <Stethoscope className="size-8 opacity-20 mb-2" />
                      <p>ไม่มีข้อมูลกลุ่มอาการเสียในหมวดหมู่นี้</p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Symptoms List */}
        <div className="lg:col-span-1 rounded-3xl border border-border/50 bg-card p-4 shadow-sm flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-display text-lg font-bold flex items-center gap-2"><Activity className="size-5 text-primary" /> อาการเสีย</h2>
            {activeSymptomTypeId && (
              <button onClick={openAddRootCause} className="inline-flex p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                <Plus className="size-5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {(() => {
              if (!activeSymptomTypeId) return (
                <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                  <Activity className="size-8 opacity-20 mb-2" />
                  <p>กรุณาเลือกกลุ่มอาการเสียก่อน</p>
                </div>
              )
              const filteredSymptoms = symptoms.filter(s => s.symptomTypeId === activeSymptomTypeId);
              return (
                <>
                  {filteredSymptoms.map((sym) => (
                    <div key={sym.id} className="group flex items-center justify-between px-4 py-3 rounded-2xl border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-sm truncate">{sym.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{sym.description}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={(e) => openEditRootCause(sym, e)} className="p-1.5 hover:bg-black/10 rounded-lg"><Edit className="size-4" /></button>
                        <button onClick={(e) => handleDeleteRootCause(sym, e)} className="p-1.5 hover:bg-black/10 rounded-lg"><Trash2 className="size-4" /></button>
                      </div>
                    </div>
                  ))}
                  {filteredSymptoms.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                      <Activity className="size-8 opacity-20 mb-2" />
                      <p>ไม่มีข้อมูลอาการเสียในกลุ่มอาการนี้</p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
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

      {/* SymptomType Custom Modal */}
      {showSymModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {symForm.isEdit ? 'แก้ไขกลุ่มอาการเสีย' : 'เพิ่มกลุ่มอาการเสียใหม่'}
              </h2>
              <button onClick={() => setShowSymModal(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">ชื่อกลุ่มอาการเสีย</label>
                <input 
                  autoFocus
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="เช่น ระบบทำน้ำอุ่น"
                  value={symForm.name}
                  onChange={e => setSymForm({...symForm, name: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSaveSymptomType()}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button onClick={() => setShowSymModal(false)} className="rounded-xl bg-muted px-6 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted/80 transition-all">
                ยกเลิก
              </button>
              <button onClick={handleSaveSymptomType} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Symptom (Root Cause) Custom Modal */}
      {showRootModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {rootForm.isEdit ? 'แก้ไขอาการเสีย' : 'เพิ่มอาการเสียใหม่'}
              </h2>
              <button onClick={() => setShowRootModal(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">ชื่ออาการเสีย</label>
                <input 
                  autoFocus
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="เช่น ไฟเข้าแต่น้ำไม่ร้อน"
                  value={rootForm.title}
                  onChange={e => setRootForm({...rootForm, title: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSaveRootCause()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">คำอธิบาย</label>
                <input 
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="คำอธิบายเพิ่มเติม (ถ้ามี)"
                  value={rootForm.description}
                  onChange={e => setRootForm({...rootForm, description: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSaveRootCause()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">ระดับความรุนแรง</label>
                <select 
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  value={rootForm.severity}
                  onChange={e => setRootForm({...rootForm, severity: e.target.value})}
                >
                  <option value="Low">Low (ต่ำ)</option>
                  <option value="Medium">Medium (ปานกลาง)</option>
                  <option value="High">High (สูง)</option>
                  <option value="Critical">Critical (วิกฤต)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button onClick={() => setShowRootModal(false)} className="rounded-xl bg-muted px-6 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted/80 transition-all">
                ยกเลิก
              </button>
              <button onClick={handleSaveRootCause} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
