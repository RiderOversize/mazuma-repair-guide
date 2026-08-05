"use client"

import { useState, useEffect } from "react"
import { AuthUser } from "@/lib/auth"
import { Category, SubCategory, SymptomType, Symptom, Guide } from "@/lib/types"
import { 
  getCategories, createCategory, updateCategory, deleteCategory, 
  getSubCategories, createSubCategory, updateSubCategory, deleteSubCategory, 
  getSymptomTypes, createSymptomType, updateSymptomType, deleteSymptomType,
  getSymptoms, createSymptom, updateSymptom, deleteSymptom,
  getGuides, createGuide, updateGuide, deleteGuide
} from "@/lib/data-service"
import { logActivity } from "@/lib/activity-service"
import { showToast, showAlert, confirmDelete } from "@/lib/swal"
import { Loader2, Plus, Trash2, Edit, ChevronRight, Boxes, Stethoscope, X, ListTree, FolderOpen, Wrench, AlertTriangle, FileText, ArrowRight, Video, FileDown } from "lucide-react"

export function MasterDataManagement({ user }: { user: AuthUser }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string | null>(null)
  const [activeSymptomTypeId, setActiveSymptomTypeId] = useState<string | null>(null)
  const [activeSymptomId, setActiveSymptomId] = useState<string | null>(null)

  // Modals state
  const [showCatModal, setShowCatModal] = useState(false)
  const [catForm, setCatForm] = useState({ id: '', name: '', description: '', slug: '', isEdit: false })

  const [showSubCatModal, setShowSubCatModal] = useState(false)
  const [subCatForm, setSubCatForm] = useState({ id: '', index: '', name: '', isEdit: false })

  const [showSymModal, setShowSymModal] = useState(false)
  const [symForm, setSymForm] = useState({ id: '', subcategoryId: '', name: '', description: '', isEdit: false })

  const [showIssueModal, setShowIssueModal] = useState(false)
  const [issueForm, setIssueForm] = useState({ id: '', title: '', description: '', severity: 'Medium', isEdit: false })

  const [showGuideModal, setShowGuideModal] = useState(false)
  const [guideForm, setGuideForm] = useState({ id: '', title: '', mediaUrl: '', pdfUrl: '', isEdit: false })

  // Drill-down state
  const [currentView, setCurrentView] = useState<'mainMenu' | 'categories' | 'subCategories' | 'symptomTypesRoot' | 'symptoms' | 'guides'>('mainMenu')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [cats, subCats, symTypes, syms, gds] = await Promise.all([
      getCategories(), getSubCategories(), getSymptomTypes(), getSymptoms(), getGuides()
    ])
    setCategories(cats)
    setSubCategories(subCats)
    setSymptomTypes(symTypes)
    setSymptoms(syms)
    setGuides(gds)
    setLoading(false)
  }

  const activeCategory = categories.find(c => c.id === activeCategoryId)
  const activeSubCategory = subCategories.find(s => s.id === activeSubCategoryId)
  const activeSymptomType = symptomTypes.find(st => st.id === activeSymptomTypeId)
  const activeSymptom = symptoms.find(s => s.id === activeSymptomId)

  // Category Actions
  const openAddCategory = () => {
    setCatForm({ id: '', name: '', description: '', slug: '', isEdit: false })
    setShowCatModal(true)
  }

  const openEditCategory = (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation()
    setCatForm({ id: cat.id, name: cat.name, description: cat.description, slug: cat.slug || '', isEdit: true })
    setShowCatModal(true)
  }

  const handleSaveCategory = async () => {
    if (!catForm.name) return showToast("กรุณากรอกชื่อหมวดหมู่", "error")
    try {
      if (catForm.isEdit) {
        await updateCategory(catForm.id, { name: catForm.name, description: catForm.description, slug: catForm.slug })
        await logActivity(user, "update", "category", `หมวดหมู่หลัก: ${catForm.name}`)
        showToast("แก้ไขหมวดหมู่สำเร็จ", "success")
      } else {
        await createCategory({ name: catForm.name, description: catForm.description, slug: catForm.slug })
        await logActivity(user, "create", "category", `หมวดหมู่หลัก: ${catForm.name}`)
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
    const isConfirmed = await confirmDelete("ลบหมวดหมู่หลัก", `คุณต้องการลบ "${cat.name}" ใช่หรือไม่?`)
    if (isConfirmed) {
      try {
        await deleteCategory(cat.id)
        await logActivity(user, "delete", "category", `หมวดหมู่หลัก: ${cat.name}`)
        if (activeCategoryId === cat.id) {
          setActiveCategoryId(null)
          setCurrentView('categories')
        }
        showToast("ลบหมวดหมู่สำเร็จ", "success")
        loadData()
      } catch (err: any) {
        showAlert("เกิดข้อผิดพลาด", err.message, "error")
      }
    }
  }

  // SubCategory Actions
  const openAddSubCategory = () => {
    setSubCatForm({ id: '', index: activeCategory?.slug || '', name: '', isEdit: false })
    setShowSubCatModal(true)
  }

  const openEditSubCategory = (subCat: SubCategory, e: React.MouseEvent) => {
    e.stopPropagation()
    setSubCatForm({ id: subCat.id, index: subCat.index, name: subCat.name, isEdit: true })
    setShowSubCatModal(true)
  }

  const handleSaveSubCategory = async () => {
    if (!subCatForm.index) return showToast("กรุณากรอกรหัส MAT Category Code", "error")
    if (!subCatForm.name) return showToast("กรุณากรอกชื่อหมวดหมู่ย่อย", "error")
    
    try {
      if (subCatForm.isEdit) {
        await updateSubCategory(subCatForm.id, { name: subCatForm.name })
        await logActivity(user, "update", "subcategory", `หมวดหมู่ย่อย: ${subCatForm.name}`)
        showToast("แก้ไขหมวดหมู่ย่อยสำเร็จ", "success")
      } else {
        await createSubCategory({ name: subCatForm.name, index: subCatForm.index, categoryId: activeCategory?.slug || '' })
        await logActivity(user, "create", "subcategory", `หมวดหมู่ย่อย: ${subCatForm.name}`)
        showToast("เพิ่มหมวดหมู่ย่อยสำเร็จ", "success")
      }
      setShowSubCatModal(false)
      loadData()
    } catch (err: any) {
      showAlert("เกิดข้อผิดพลาด", err.message, "error")
    }
  }

  const handleDeleteSubCategory = async (subCat: SubCategory, e: React.MouseEvent) => {
    e.stopPropagation()
    const isConfirmed = await confirmDelete("ลบหมวดหมู่ย่อย", `คุณต้องการลบ "${subCat.name}" ใช่หรือไม่?`)
    if (isConfirmed) {
      try {
        await deleteSubCategory(subCat.id)
        await logActivity(user, "delete", "subcategory", `หมวดหมู่ย่อย: ${subCat.name}`)
        if (activeSubCategoryId === subCat.id) {
          setActiveSubCategoryId(null)
          setCurrentView('subCategories')
        }
        showToast("ลบหมวดหมู่ย่อยสำเร็จ", "success")
        loadData()
      } catch (err: any) {
        showAlert("เกิดข้อผิดพลาด", err.message, "error")
      }
    }
  }

  // SymptomType Actions
  const openAddSymptomType = () => {
    setSymForm({ id: '', subcategoryId: '', name: '', description: '', isEdit: false })
    setShowSymModal(true)
  }

  const openEditSymptomType = (st: SymptomType, e: React.MouseEvent) => {
    e.stopPropagation()
    setSymForm({ id: st.id, subcategoryId: st.subcategoryId || '', name: st.name, description: st.description || '', isEdit: true })
    setShowSymModal(true)
  }

  const handleSaveSymptomType = async () => {
    if (!symForm.subcategoryId) return showToast("กรุณากรอกรหัสกลุ่มอาการ", "error")
    if (!symForm.name) return showToast("กรุณากรอกชื่อกลุ่มอาการ", "error")
    
    try {
      if (symForm.isEdit) {
        await updateSymptomType(symForm.id, { subcategoryId: symForm.subcategoryId, name: symForm.name, description: symForm.description })
        await logActivity(user, "update", "symptom_type", `กลุ่มอาการ: ${symForm.name}`)
        showToast("แก้ไขกลุ่มอาการสำเร็จ", "success")
      } else {
        await createSymptomType({ subcategoryId: symForm.subcategoryId, name: symForm.name, description: symForm.description })
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
    const isConfirmed = await confirmDelete("ลบกลุ่มอาการ", `คุณต้องการลบ "${st.name}" ใช่หรือไม่?`)
    if (isConfirmed) {
      try {
        await deleteSymptomType(st.id)
        await logActivity(user, "delete", "symptom_type", `กลุ่มอาการ: ${st.name}`)
        showToast("ลบกลุ่มอาการสำเร็จ", "success")
        loadData()
      } catch (err: any) {
        showAlert("เกิดข้อผิดพลาด", err.message, "error")
      }
    }
  }

  // Issue (Symptom) Actions
  const handleSaveIssue = async () => {
    if (!issueForm.title) return showToast("กรุณากรอกชื่ออาการเสีย", "error")
    if (!activeSymptomTypeId) return showToast("กรุณาเลือกกลุ่มอาการก่อน", "error")
    
    try {
      if (issueForm.isEdit) {
        await updateSymptom(issueForm.id, { 
          title: issueForm.title, 
          description: issueForm.description, 
          severity: issueForm.severity as any 
        })
        await logActivity(user, "update", "symptom", `อาการเสีย: ${issueForm.title}`)
        showToast("แก้ไขอาการเสียสำเร็จ", "success")
      } else {
        await createSymptom({ 
          id: issueForm.id,
          title: issueForm.title, 
          description: issueForm.description, 
          severity: issueForm.severity as any,
          symptomTypeId: activeSymptomType?.subcategoryId || activeSymptomTypeId,
          tags: []
        })
        await logActivity(user, "create", "symptom", `อาการเสีย: ${issueForm.title}`)
        showToast("เพิ่มอาการเสียสำเร็จ", "success")
      }
      setShowIssueModal(false)
      loadData()
    } catch (err: any) {
      showAlert("เกิดข้อผิดพลาด", err.message, "error")
    }
  }

  // Guide Actions
  const handleSaveGuide = async () => {
    if (!guideForm.title) return showToast("กรุณากรอกหัวข้อการตรวจสอบ", "error")
    if (!activeSymptomId) return showToast("กรุณาเลือก Issue ก่อน", "error")
    
    try {
      if (guideForm.isEdit) {
        await updateGuide(guideForm.id, { 
          title: guideForm.title, 
          mediaUrl: guideForm.mediaUrl,
          pdfUrl: guideForm.pdfUrl
        })
        await logActivity(user, "update", "guide", `หัวข้อ: ${guideForm.title}`)
        showToast("แก้ไขสำเร็จ", "success")
      } else {
        await createGuide({ 
          id: `gd-${Date.now()}`,
          title: guideForm.title, 
          symptomId: activeSymptom?.id || '',
          mediaUrl: guideForm.mediaUrl,
          pdfUrl: guideForm.pdfUrl,
          categoryId: '',
          toolsRequired: [],
          steps: []
        } as any)
        await logActivity(user, "create", "guide", `หัวข้อ: ${guideForm.title}`)
        showToast("เพิ่มสำเร็จ", "success")
      }
      setShowGuideModal(false)
      loadData()
    } catch (err: any) {
      showAlert("เกิดข้อผิดพลาด", err.message, "error")
    }
  }

  const goBack = () => {
    if (currentView === 'subCategories') {
      setCurrentView('categories')
      setActiveCategoryId(null)
    } else if (currentView === 'categories' || currentView === 'symptomTypesRoot') {
      setCurrentView('mainMenu')
    } else if (currentView === 'symptoms') {
      setCurrentView('symptomTypesRoot')
      setActiveSymptomTypeId(null)
    } else if (currentView === 'guides') {
      setCurrentView('symptoms')
      setActiveSymptomId(null)
    }
  }

  if (loading && categories.length === 0) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="size-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="mx-auto w-full px-4 pb-8">
      {currentView !== 'mainMenu' && (
        <div className="mb-6">
          <button
            onClick={goBack}
            className="mb-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronRight className="size-5 rotate-180" />
            <span>กลับ</span>
          </button>
          
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground line-clamp-2">
            {currentView === 'categories' && "จัดการหมวดหมู่หลัก"}
            {currentView === 'subCategories' && (activeCategory?.name || "หมวดหมู่ย่อย")}
            {currentView === 'symptomTypesRoot' && "จัดการอาการเสียและวิธีตรวจสอบ"}
            {currentView === 'symptoms' && (activeSymptomType?.name || "Issue")}
            {currentView === 'guides' && (activeSymptom?.title || "อาการเสียย่อย / หัวข้อการตรวจสอบ")}
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {currentView === 'categories' && "Product Group ทั้งหมด"}
            {currentView === 'subCategories' && "Product Category ในหมวดหมู่นี้"}
            {currentView === 'symptomTypesRoot' && "Symptom Group ทั้งหมด"}
            {currentView === 'symptoms' && "Issue ทั้งหมดที่ผูกกับ Symptom Group นี้"}
            {currentView === 'guides' && "อาการเสียย่อยและหัวข้อการตรวจสอบที่เกี่ยวข้องกับ Issue นี้"}
          </p>
        </div>
      )}

      {currentView === 'mainMenu' && (
        <div className="flex flex-col gap-6">
          <div className="mb-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">จัดการข้อมูล (Master Data)</h1>
            <p className="text-[13px] text-muted-foreground mt-1">เลือกส่วนที่ต้องการจัดการ</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => setCurrentView('categories')}
              className="group cursor-pointer rounded-2xl border border-border/40 bg-card p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50 flex flex-col items-center justify-center text-center gap-4"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Boxes className="size-8" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">1. จัดการ Category / Subcategory</h3>
                <p className="text-sm text-muted-foreground mt-1">เพิ่มลบแก้ไขหมวดหมู่หลักและหมวดหมู่ย่อย</p>
              </div>
            </div>
            <div 
              onClick={() => setCurrentView('symptomTypesRoot')}
              className="group cursor-pointer rounded-2xl border border-border/40 bg-card p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50 flex flex-col items-center justify-center text-center gap-4"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                <Stethoscope className="size-8" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">2. จัดการอาการเสียและวิธีตรวจสอบ</h3>
                <p className="text-sm text-muted-foreground mt-1">จัดการกลุ่มอาการเสีย อาการเสียย่อย และดูคู่มือที่เกี่ยวข้อง</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4">
        {currentView === 'categories' && (
          <button onClick={openAddCategory} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-sm">
            <Plus className="size-4" /> เพิ่มหมวดหมู่หลัก
          </button>
        )}
        {currentView === 'subCategories' && (
          <button onClick={openAddSubCategory} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-sm">
            <Plus className="size-4" /> เพิ่มหมวดหมู่ย่อย
          </button>
        )}
        {currentView === 'symptomTypesRoot' && (
          <button onClick={openAddSymptomType} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-sm">
            <Plus className="size-4" /> เพิ่มกลุ่มอาการ
          </button>
        )}
        {currentView === 'symptoms' && (
          <button onClick={() => { setIssueForm({ id: '', title: '', description: '', severity: 'Medium', isEdit: false }); setShowIssueModal(true) }} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-sm">
            <Plus className="size-4" /> เพิ่ม Issue
          </button>
        )}
        {currentView === 'guides' && (
          <button onClick={() => { setGuideForm({ id: '', title: '', mediaUrl: '', pdfUrl: '', isEdit: false }); setShowGuideModal(true) }} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-sm">
            <Plus className="size-4" /> เพิ่มหัวข้อการตรวจสอบ
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm">
        {/* Categories View */}
        {currentView === 'categories' && (
          <div className="flex flex-col">
            {categories.map((cat, i) => {
              const isLast = i === categories.length - 1;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setActiveCategoryId(cat.id)
                    setCurrentView('subCategories')
                  }}
                  className={`group flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors active:bg-muted ${!isLast ? 'border-b border-border/40' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Boxes className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[15px] truncate text-foreground">
                        {cat.slug && <span className="text-primary font-bold mr-1">{cat.slug} -</span>}
                        {cat.name}
                      </p>
                      <p className="text-[13px] text-muted-foreground truncate">{cat.description || 'ไม่มีคำอธิบาย'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={(e) => openEditCategory(cat, e)} className="p-2 text-muted-foreground hover:bg-black/5 hover:text-foreground rounded-full transition-colors"><Edit className="size-4" /></button>
                    <button onClick={(e) => handleDeleteCategory(cat, e)} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"><Trash2 className="size-4" /></button>
                    <ChevronRight className="size-5 text-muted-foreground/40" />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* SubCategories View */}
        {currentView === 'subCategories' && (
          <div className="flex flex-col">
            {(() => {
              const categoryIndex = activeCategory?.slug || '';
              const filteredSubCategories = subCategories.filter(sc => sc.categoryId === activeCategory?.id || sc.categoryId === categoryIndex);
              
              if (filteredSubCategories.length === 0) {
                return (
                  <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                    <ListTree className="size-10 text-muted-foreground/30 mb-3" />
                    <p className="text-[15px]">ไม่มีหมวดหมู่ย่อย</p>
                  </div>
                )
              }
              return filteredSubCategories.map((subCat, i) => {
                const isLast = i === filteredSubCategories.length - 1;
                return (
                  <div
                    key={subCat.id}
                    className={`group flex items-center justify-between p-4 hover:bg-muted/20 transition-colors ${!isLast ? 'border-b border-border/40' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                        <ListTree className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[15px] truncate text-foreground">
                          <span className="text-indigo-500 font-bold mr-1">{subCat.index} -</span>
                          {subCat.name}
                        </p>
                        <p className="text-[13px] text-muted-foreground truncate font-mono">ID: {subCat.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={(e) => openEditSubCategory(subCat, e)} className="p-2 text-muted-foreground hover:bg-black/5 hover:text-foreground rounded-full transition-colors"><Edit className="size-4" /></button>
                      <button onClick={(e) => handleDeleteSubCategory(subCat, e)} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"><Trash2 className="size-4" /></button>
                      <ChevronRight className="size-5 text-muted-foreground/40" />
                    </div>
                  </div>
                )
              });
            })()}
          </div>
        )}

        {/* Symptom Types View (Root) */}
        {currentView === 'symptomTypesRoot' && (
          <div className="flex flex-col">
            {symptomTypes.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                <Stethoscope className="size-10 text-muted-foreground/30 mb-3" />
                <p className="text-[15px]">ไม่มีกลุ่มอาการเสีย</p>
              </div>
            ) : (
              symptomTypes.map((st, i) => {
                const isLast = i === symptomTypes.length - 1;
                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      setActiveSymptomTypeId(st.id)
                      setCurrentView('symptoms')
                    }}
                    className={`group flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors active:bg-muted ${!isLast ? 'border-b border-border/40' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                        <Stethoscope className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[15px] truncate text-foreground">
                          <span className="text-blue-500 font-bold mr-1">{st.id} -</span>
                          {st.name}
                        </p>
                        <p className="text-[13px] text-muted-foreground truncate font-mono">คำอธิบาย: {st.description || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={(e) => openEditSymptomType(st, e)} className="p-2 text-muted-foreground hover:bg-black/5 hover:text-foreground rounded-full transition-colors"><Edit className="size-4" /></button>
                      <button onClick={(e) => handleDeleteSymptomType(st, e)} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"><Trash2 className="size-4" /></button>
                      <ChevronRight className="size-5 text-muted-foreground/40" />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Symptoms View */}
        {currentView === 'symptoms' && (
          <div className="flex flex-col">
            {(() => {
              const filteredSymptoms = symptoms.filter(s => 
                s.symptomTypeId === activeSymptomType?.id || 
                s.symptomTypeId === activeSymptomType?.name ||
                (activeSymptomType?.subcategoryId && s.symptomTypeId === activeSymptomType?.subcategoryId)
              );
              if (filteredSymptoms.length === 0) {
                return (
                  <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                    <AlertTriangle className="size-10 text-muted-foreground/30 mb-3" />
                    <p className="text-[15px]">ไม่มี Issue ในกลุ่มนี้</p>
                  </div>
                )
              }
              return filteredSymptoms.map((sym, i) => {
                const isLast = i === filteredSymptoms.length - 1;
                return (
                  <div
                    key={sym.id}
                    onClick={() => {
                      setActiveSymptomId(sym.id)
                      setCurrentView('guides')
                    }}
                    className={`group flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors active:bg-muted ${!isLast ? 'border-b border-border/40' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                        <AlertTriangle className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[15px] truncate text-foreground">{sym.title}</p>
                        <p className="text-[13px] text-muted-foreground truncate">{sym.description || 'ไม่มีคำอธิบาย'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setIssueForm({ id: sym.id, title: sym.title, description: sym.description, severity: sym.severity, isEdit: true }); setShowIssueModal(true) }} className="p-2 text-muted-foreground hover:bg-black/5 hover:text-foreground rounded-full transition-colors"><Edit className="size-4" /></button>
                      <button onClick={async (e) => {
                        e.stopPropagation()
                        const ok = await confirmDelete("ลบ Issue", `คุณต้องการลบ "${sym.title}" หรือไม่?`)
                        if (ok) {
                          try {
                            await deleteSymptom(sym.id)
                            showToast("ลบข้อมูลสำเร็จ", "success")
                            loadData()
                          } catch(err: any) { showAlert("Error", err.message, "error") }
                        }
                      }} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"><Trash2 className="size-4" /></button>
                      <ChevronRight className="size-5 text-muted-foreground/40" />
                    </div>
                  </div>
                )
              });
            })()}
          </div>
        )}

        {/* Guides View */}
        {currentView === 'guides' && (
          <div className="flex flex-col">
            {(() => {
              const filteredGuides = guides.filter(g => g.symptomId === activeSymptom?.id);
              if (filteredGuides.length === 0) {
                return (
                  <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                    <FileText className="size-10 text-muted-foreground/30 mb-3" />
                    <p className="text-[15px]">ยังไม่มีอาการเสียย่อย / หัวข้อการตรวจสอบสำหรับอาการนี้</p>
                  </div>
                )
              }
              return filteredGuides.map((guide, i) => {
                const isLast = i === filteredGuides.length - 1;
                return (
                  <div
                    key={guide.id}
                    className={`group flex items-center justify-between p-4 hover:bg-muted/20 transition-colors ${!isLast ? 'border-b border-border/40' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                        <FileText className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[15px] truncate text-foreground">{guide.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {guide.mediaUrl ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[11px] font-semibold">
                              <Video className="size-3" /> VDO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
                              <Video className="size-3" /> ไม่มี VDO
                            </span>
                          )}
                          {guide.pdfUrl ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[11px] font-semibold">
                              <FileDown className="size-3" /> PDF
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
                              <FileDown className="size-3" /> ไม่มี PDF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setGuideForm({ id: guide.id, title: guide.title, mediaUrl: guide.mediaUrl || '', pdfUrl: guide.pdfUrl || '', isEdit: true }); setShowGuideModal(true) }} className="p-2 text-muted-foreground hover:bg-black/5 hover:text-foreground rounded-full transition-colors"><Edit className="size-4" /></button>
                      <button onClick={async (e) => { e.stopPropagation(); const ok = await confirmDelete(guide.title); if (ok) { try { await deleteGuide(guide.id); showToast('ลบสำเร็จ', 'success'); loadData() } catch(err: any) { showAlert('เกิดข้อผิดพลาด', err.message, 'error') } } }} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                )
              });
            })()}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {catForm.isEdit ? 'แก้ไขหมวดหมู่หลัก' : 'เพิ่มหมวดหมู่หลัก'}
              </h2>
              <button onClick={() => setShowCatModal(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Index</label>
                <input 
                  autoFocus
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="เช่น F1"
                  value={catForm.slug}
                  onChange={e => setCatForm({...catForm, slug: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSaveCategory()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">ชื่อหมวดหมู่</label>
                <input 
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="เช่น เครื่องทำน้ำอุ่น"
                  value={catForm.name}
                  onChange={e => setCatForm({...catForm, name: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSaveCategory()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">คำอธิบาย (ไม่บังคับ)</label>
                <textarea 
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 min-h-[80px]" 
                  placeholder="อธิบายเพิ่มเติม..."
                  value={catForm.description}
                  onChange={e => setCatForm({...catForm, description: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowCatModal(false)} className="px-5 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleSaveCategory} className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 rounded-xl transition-all">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SubCategory Modal */}
      {showSubCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {subCatForm.isEdit ? 'แก้ไขหมวดหมู่ย่อย' : 'เพิ่มหมวดหมู่ย่อย'}
              </h2>
              <button onClick={() => setShowSubCatModal(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">รหัส MAT Category Code</label>
                <input 
                  autoFocus
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:bg-muted" 
                  placeholder="เช่น F1-01-00"
                  value={subCatForm.index}
                  disabled={subCatForm.isEdit}
                  onChange={e => setSubCatForm({...subCatForm, index: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSaveSubCategory()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">ชื่อหมวดหมู่ย่อย</label>
                <input 
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="เช่น เครื่องทำน้ำอุ่นแบบ X"
                  value={subCatForm.name}
                  onChange={e => setSubCatForm({...subCatForm, name: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSaveSubCategory()}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowSubCatModal(false)} className="px-5 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleSaveSubCategory} className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 rounded-xl transition-all">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SymptomType Modal */}
      {showSymModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {symForm.isEdit ? 'แก้ไขกลุ่มอาการ' : 'เพิ่มกลุ่มอาการใหม่'}
              </h2>
              <button onClick={() => setShowSymModal(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">รหัสกลุ่มอาการ</label>
                <input 
                  autoFocus
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="เช่น WH-EL1R"
                  value={symForm.subcategoryId}
                  onChange={e => setSymForm({...symForm, subcategoryId: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSaveSymptomType()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">ชื่อกลุ่มอาการ</label>
                <input 
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="เช่น อาการน้ำอุ่น 1R"
                  value={symForm.name}
                  onChange={e => setSymForm({...symForm, name: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSaveSymptomType()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">คำอธิบาย (ไม่บังคับ)</label>
                <textarea 
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 min-h-[80px]" 
                  placeholder="อธิบายเพิ่มเติม..."
                  value={symForm.description || ''}
                  onChange={e => setSymForm({...symForm, description: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowSymModal(false)} className="px-5 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleSaveSymptomType} className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 rounded-xl transition-all">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {issueForm.isEdit ? 'แก้ไข Issue' : 'เพิ่ม Issue'}
              </h2>
              <button onClick={() => setShowIssueModal(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">ชื่ออาการเสีย</label>
                <input 
                  autoFocus
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="เช่น เครื่องเปิดติด แต่เครื่องไม่ทำความร้อน"
                  value={issueForm.title}
                  onChange={e => setIssueForm({...issueForm, title: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSaveIssue()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">คำอธิบาย (ไม่บังคับ)</label>
                <textarea 
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 min-h-[80px]" 
                  placeholder="อธิบายอาการเพิ่มเติม..."
                  value={issueForm.description}
                  onChange={e => setIssueForm({...issueForm, description: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowIssueModal(false)} className="px-5 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleSaveIssue} className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 rounded-xl transition-all">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {guideForm.isEdit ? 'แก้ไขหัวข้อการตรวจสอบ' : 'เพิ่มหัวข้อการตรวจสอบ'}
              </h2>
              <button onClick={() => setShowGuideModal(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">หัวข้อการตรวจสอบ</label>
                <input 
                  autoFocus
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="เช่น ขดลวดฮีตเตอร์"
                  value={guideForm.title}
                  onChange={e => setGuideForm({...guideForm, title: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSaveGuide()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Video className="size-4 text-blue-500" /> ลิงค์ VDO (ไม่บังคับ)
                </label>
                <input 
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="https://..."
                  value={guideForm.mediaUrl}
                  onChange={e => setGuideForm({...guideForm, mediaUrl: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileDown className="size-4 text-orange-500" /> ลิงค์ PDF (ไม่บังคับ)
                </label>
                <input 
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                  placeholder="https://..."
                  value={guideForm.pdfUrl}
                  onChange={e => setGuideForm({...guideForm, pdfUrl: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowGuideModal(false)} className="px-5 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleSaveGuide} className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 rounded-xl transition-all">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
