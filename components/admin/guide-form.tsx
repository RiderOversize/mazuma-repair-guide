"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Plus,
  Trash2,
  GripVertical,
  ListChecks,
  Save,
  Loader2,
  X,
} from "lucide-react"
import { type Category, type Symptom, type Guide, type SubCategory, type DeviceModel, type SymptomType } from "@/lib/mock-data"
import { getCategories, getSymptoms, getGuideById, createGuide, updateGuide, getSubCategories, getModels, getSymptomTypes } from "@/lib/data-service"
import { showToast, showAlert } from "@/lib/swal"
import { guideSchema, type GuideFormData } from "@/lib/validations/guide"
import type { AuthUser } from "@/lib/auth"

export function GuideForm({ user, editId, onFinish }: { user?: AuthUser, editId?: string | null, onFinish?: () => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modelSearch, setModelSearch] = useState("")

  // Modals
  const [showAddCatModal, setShowAddCatModal] = useState(false)
  const [newCatName, setNewCatName] = useState("")

  const [showAddSubCatModal, setShowAddSubCatModal] = useState(false)
  const [newSubCatName, setNewSubCatName] = useState("")

  const [showAddSymptomGroupModal, setShowAddSymptomGroupModal] = useState(false)
  const [newSymptomGroupName, setNewSymptomGroupName] = useState("")

  const [showAddSymptomModal, setShowAddSymptomModal] = useState(false)
  const [newSymptomName, setNewSymptomName] = useState("")

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<GuideFormData>({
    resolver: zodResolver(guideSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      subcategoryId: "",
      modelIds: [],
      symptomTypeId: "",
      symptomId: "",
      description: "",
      difficulty: "Intermediate",
      timeEstimated: "",
      status: "draft",
      tags: [],
      toolsRequired: [],
      partsRequired: [],
      steps: [{ stepNum: 1, title: "", instruction: "", mediaUrl: "", pdfUrl: "", warning: "" }]
    }
  })

  // Watch for cascading dropdowns
  const selectedCategoryId = watch("categoryId")
  const selectedSubcategoryId = watch("subcategoryId")
  const selectedSymptomTypeId = watch("symptomTypeId")

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: "steps"
  })

  useEffect(() => {
    loadData()
  }, [editId])

  const loadData = async () => {
    setLoading(true)
    const [cats, subCats, mods, symTypes, syms] = await Promise.all([
      getCategories(), getSubCategories(), getModels(), getSymptomTypes(), getSymptoms()
    ])
    setCategories(cats)
    setSubCategories(subCats)
    setModels(mods)
    setSymptomTypes(symTypes)
    setSymptoms(syms)
    
    if (editId) {
      const g = await getGuideById(editId)
      if (g) {
        reset({
          title: g.title,
          categoryId: g.categoryId,
          subcategoryId: g.subcategoryId || "",
          modelIds: g.modelIds || [],
          symptomTypeId: g.symptomTypeId || "",
          symptomId: g.symptomId || "",
          description: g.description || "",
          difficulty: g.difficulty || "Intermediate",
          timeEstimated: g.timeEstimated || "",
          status: g.status as any,
          tags: g.tags || [],
          toolsRequired: g.toolsRequired || [],
          partsRequired: g.partsRequired || [],
          steps: g.steps.map(s => ({
            stepNum: s.stepNum,
            title: s.title || "",
            instruction: s.instruction,
            mediaUrl: s.mediaUrl || "",
            pdfUrl: s.pdfUrl || "",
            warning: s.warning || ""
          }))
        })
      }
    }
    setLoading(false)
  }

  const onSubmit = async (data: GuideFormData) => {
    setSaving(true)
    try {
      const guideData: Guide = {
        id: editId || `g-${Date.now()}`,
        title: data.title,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        modelIds: data.modelIds,
        symptomTypeId: data.symptomTypeId,
        symptomId: data.symptomId,
        description: data.description,
        difficulty: data.difficulty,
        timeEstimated: data.timeEstimated,
        status: data.status as any,
        tags: data.tags,
        toolsRequired: data.toolsRequired,
        partsRequired: data.partsRequired,
        steps: data.steps.map((s, i) => ({ ...s, stepNum: i + 1 }))
      }

      if (editId) {
        await updateGuide(editId, guideData)
        showToast("อัปเดตคู่มือสำเร็จ", "success")
      } else {
        await createGuide(guideData)
        showToast("สร้างคู่มือสำเร็จ", "success")
      }
      if (onFinish) {
        setTimeout(onFinish, 1000)
      }
    } catch (err: any) {
      showAlert("เกิดข้อผิดพลาด", err.message, "error")
    }
    setSaving(false)
  }

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return showToast("กรุณากรอกชื่อประเภทสินค้า", "warning")
    try {
      const newCat = await import("@/lib/data-service").then(m => m.createCategory({ name: newCatName.trim() }))
      setCategories(prev => [...prev, newCat])
      setValue("categoryId", newCat.id)
      setShowAddCatModal(false)
      setNewCatName("")
      showToast("เพิ่มประเภทสินค้าสำเร็จ", "success")
    } catch (err: any) {
      showAlert("เกิดข้อผิดพลาด", err.message, "error")
    }
  }

  const handleAddSubCategory = async () => {
    if (!newSubCatName.trim()) return showToast("กรุณากรอกชื่อประเภทย่อย", "warning")
    const categoryId = watch("categoryId")
    if (!categoryId) return showToast("กรุณาเลือกประเภทสินค้าหลักก่อน", "warning")
    try {
      const newSubCat = await import("@/lib/data-service").then(m => m.createSubCategory({ id: `sub-${Date.now()}`, categoryId, name: newSubCatName.trim() }))
      setSubCategories(prev => [...prev, newSubCat])
      setValue("subcategoryId", newSubCat.id)
      setShowAddSubCatModal(false)
      setNewSubCatName("")
      showToast("เพิ่มประเภทย่อยสำเร็จ", "success")
    } catch (err: any) {
      showAlert("เกิดข้อผิดพลาด", err.message, "error")
    }
  }

  const handleAddSymptomGroup = async () => {
    if (!newSymptomGroupName.trim()) return showToast("กรุณากรอกชื่อกลุ่มอาการ", "warning")
    const categoryId = watch("categoryId")
    if (!categoryId) return showToast("กรุณาเลือกประเภทสินค้าหลักก่อน", "warning")
    try {
      const newGroup = await import("@/lib/data-service").then(m => m.createSymptomType({ name: newSymptomGroupName.trim(), categoryId }))
      setSymptomTypes(prev => [...prev, newGroup])
      setValue("symptomTypeId", newGroup.id)
      setShowAddSymptomGroupModal(false)
      setNewSymptomGroupName("")
      showToast("เพิ่มกลุ่มอาการสำเร็จ", "success")
    } catch (err: any) {
      showAlert("เกิดข้อผิดพลาด", err.message, "error")
    }
  }

  const handleAddSymptom = async () => {
    if (!newSymptomName.trim()) return showToast("กรุณากรอกชื่อสาเหตุ/ข้อตรวจสอบ", "warning")
    const symptomTypeId = watch("symptomTypeId")
    if (!symptomTypeId) return showToast("กรุณาเลือกกลุ่มอาการก่อน", "warning")
    try {
      const newSym = await import("@/lib/data-service").then(m => m.createSymptom({ title: newSymptomName.trim(), symptomTypeId, description: newSymptomName.trim() }))
      setSymptoms(prev => [...prev, newSym])
      setValue("symptomId", newSym.id)
      setShowAddSymptomModal(false)
      setNewSymptomName("")
      showToast("เพิ่มข้อตรวจสอบสำเร็จ", "success")
    } catch (err: any) {
      showAlert("เกิดข้อผิดพลาด", err.message, "error")
    }
  }

  if (loading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="size-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={onFinish} className="mb-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            ← กลับไปหน้าก่อนหน้า
          </button>
          <h1 className="font-display text-3xl font-bold tracking-tight">{editId ? "แก้ไขคู่มือการซ่อม" : "สร้างคู่มือการซ่อมใหม่"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ระบบจัดการขั้นสูง (Enterprise-Grade Data Pipeline) ตรวจสอบความถูกต้องแบบ Real-time
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Section step={1} title="ข้อมูลพื้นฐาน (Basic Info)">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="ชื่อคู่มือ/วิธีแก้ปัญหา (Guide Title)" required>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="เช่น การเปลี่ยนฮีตเตอร์ทำความร้อน"
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                />
                {errors.title && <span className="text-xs font-semibold text-destructive mt-1 block">{errors.title.message}</span>}
              </Field>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="block text-sm font-semibold">ประเภทสินค้า (Category) <span className="text-destructive">*</span></span>
                <button type="button" onClick={() => setShowAddCatModal(true)} className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"><Plus className="size-3" /> เพิ่มประเภทใหม่</button>
              </div>
              <select
                {...register("categoryId")}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
              >
                <option value="">— เลือกประเภทหลัก —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <span className="text-xs font-semibold text-destructive mt-1 block">{errors.categoryId.message}</span>}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="block text-sm font-semibold">ประเภทย่อย (Subcategory)</span>
                {selectedCategoryId && (
                  <button type="button" onClick={() => setShowAddSubCatModal(true)} className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"><Plus className="size-3" /> เพิ่มประเภทย่อยใหม่</button>
                )}
              </div>
              <select
                {...register("subcategoryId")}
                disabled={!selectedCategoryId}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
              >
                <option value="">— ทั้งหมดในหมวดหมู่นี้ —</option>
                {subCategories
                  .filter(sc => sc.categoryId === selectedCategoryId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <Field label="ใช้สำหรับสินค้ารุ่น (Specific Models) - เว้นว่างหากใช้ได้กับทุกรุ่นในหมวดนี้">
                <div className="relative flex flex-col gap-2 rounded-xl border border-input bg-background/50 p-3">
                  <input
                    type="text"
                    placeholder="ค้นหารุ่นสินค้า..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    disabled={!selectedCategoryId}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  />
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-border/50 bg-background/80 p-2">
                    {!selectedCategoryId ? (
                      <div className="text-center text-sm text-muted-foreground p-4">กรุณาเลือกประเภทสินค้าก่อน</div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {models
                          .filter(m => m.categoryId === selectedCategoryId && (!selectedSubcategoryId || m.subcategoryId === selectedSubcategoryId))
                          .filter(m => !modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase()) || m.code.toLowerCase().includes(modelSearch.toLowerCase()))
                          .map((m) => {
                            const isSelected = (watch("modelIds") || []).includes(m.id);
                            return (
                              <label key={m.id} className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-muted/50">
                                <input
                                  type="checkbox"
                                  value={m.id}
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const current = watch("modelIds") || [];
                                    if (e.target.checked) {
                                      setValue("modelIds", [...current, m.id]);
                                    } else {
                                      setValue("modelIds", current.filter(id => id !== m.id));
                                    }
                                  }}
                                  className="size-4 rounded border-input text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium">{m.code} - {m.name}</span>
                              </label>
                            )
                          })
                        }
                        {models.filter(m => m.categoryId === selectedCategoryId && (!selectedSubcategoryId || m.subcategoryId === selectedSubcategoryId)).filter(m => !modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase()) || m.code.toLowerCase().includes(modelSearch.toLowerCase())).length === 0 && (
                          <div className="text-center text-sm text-muted-foreground p-4">ไม่พบรุ่นสินค้าที่ค้นหา</div>
                        )}
                      </div>
                    )}
                  </div>
                  {(watch("modelIds") || []).length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      เลือกรุ่นแล้ว: <span className="font-bold text-primary">{(watch("modelIds") || []).length}</span> รุ่น
                    </div>
                  )}
                </div>
              </Field>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="block text-sm font-semibold">กลุ่มอาการเสีย (Symptom Group)</span>
                {selectedCategoryId && (
                  <button type="button" onClick={() => setShowAddSymptomGroupModal(true)} className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"><Plus className="size-3" /> เพิ่มกลุ่มอาการใหม่</button>
                )}
              </div>
              <select
                {...register("symptomTypeId")}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
              >
                <option value="">— เลือกกลุ่มอาการ —</option>
                {symptomTypes.map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="block text-sm font-semibold">สาเหตุ/ข้อตรวจสอบ (Root Cause)</span>
                {selectedSymptomTypeId && (
                  <button type="button" onClick={() => setShowAddSymptomModal(true)} className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"><Plus className="size-3" /> เพิ่มข้อตรวจสอบใหม่</button>
                )}
              </div>
              <select
                {...register("symptomId")}
                disabled={!selectedSymptomTypeId}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
              >
                <option value="">— เลือกสาเหตุที่พบ —</option>
                {symptoms
                  .filter(s => s.symptomTypeId === selectedSymptomTypeId)
                  .map((s) => {
                    const icon = s.severity === 'Critical' ? '🔴' : s.severity === 'High' ? '🟠' : s.severity === 'Medium' ? '🟡' : s.severity === 'Low' ? '🟢' : '⚪';
                    return (
                    <option key={s.id} value={s.id}>
                      {icon} {s.title || s.description}
                    </option>
                  )})}
              </select>
            </div>
            
            <div className="sm:col-span-2">
              <Field label="รายละเอียดเพิ่มเติม (Description)">
                <textarea
                  {...register("description")}
                  placeholder="อธิบายสรุปสั้นๆ เกี่ยวกับคู่มือฉบับนี้..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                />
              </Field>
            </div>
            
            <Field label="ระดับความยาก (Difficulty)">
              <select
                {...register("difficulty")}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
              >
                <option value="Beginner">เริ่มต้น (Beginner)</option>
                <option value="Intermediate">ปานกลาง (Intermediate)</option>
                <option value="Advanced">เชี่ยวชาญ (Advanced)</option>
              </select>
            </Field>

            <Field label="เวลาโดยประมาณ (Estimated Time)">
              <input
                type="text"
                {...register("timeEstimated")}
                placeholder="เช่น 15-30 นาที"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
              />
            </Field>

            <Field label="สถานะของคู่มือ (Status)">
              <select
                {...register("status")}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
              >
                <option value="published">เผยแพร่ (Published)</option>
                <option value="draft">ฉบับร่าง (Draft)</option>
                <option value="archived">เก็บถาวร (Archived)</option>
              </select>
            </Field>

            <Field label="แท็ก (Tags) - คั่นด้วยจุลภาค">
              <input
                type="text"
                onChange={(e) => {
                  const val = e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                  setValue("tags", val)
                }}
                defaultValue={watch("tags")?.join(", ")}
                placeholder="เช่น ไฟฟ้า, ความร้อน"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
              />
            </Field>
          </div>
        </Section>

        <Section step={2} title="อุปกรณ์ที่ต้องใช้ (Tools Required)">
          <input
            type="text"
            onChange={(e) => {
              const val = e.target.value.split(',').map(v => v.trim()).filter(Boolean)
              setValue("toolsRequired", val)
            }}
            defaultValue={watch("toolsRequired")?.join(", ")}
            placeholder="ระบุอุปกรณ์ คั่นด้วยเครื่องหมายจุลภาค (,) เช่น มัลติมิเตอร์, ไขควงแฉก"
            className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {(watch("toolsRequired") || []).map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow-sm"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold">อะไหล่ที่ต้องเตรียม (Parts Required)</h3>
            <input
              type="text"
              onChange={(e) => {
                const val = e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                setValue("partsRequired", val)
              }}
              defaultValue={watch("partsRequired")?.join(", ")}
              placeholder="ระบุอะไหล่ คั่นด้วยเครื่องหมายจุลภาค (,) เช่น แผงวงจรหลัก, โอริงขนาด 10mm"
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {(watch("partsRequired") || []).map((t, i) => (
                <span
                  key={`part-${t}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Section>

        <Section step={3} title="ขั้นตอนการซ่อม (Step-by-step)">
          <div className="flex flex-col gap-4">
            {stepFields.map((field, index) => (
              <div
                key={field.id}
                className="group relative rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <GripVertical className="size-5 text-muted-foreground cursor-move opacity-50 hover:opacity-100" />
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground shadow-sm">
                      {index + 1}
                    </span>
                    <span className="font-display text-sm font-bold">ขั้นตอนที่ {index + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    disabled={stepFields.length === 1}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="ลบขั้นตอน"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">หัวข้อการตรวจสอบ / ขั้นตอน (Step Title) <span className="text-destructive">*</span></label>
                    <input
                      type="text"
                      {...register(`steps.${index}.title` as const)}
                      placeholder="เช่น ถอดน็อต 4 ตัว"
                      className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                    />
                    {errors.steps?.[index]?.title && <span className="text-xs font-semibold text-destructive mt-1 block">{errors.steps[index]?.title?.message}</span>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">วิธีการตรวจสอบ / การแก้ไข <span className="text-destructive">*</span></label>
                    <textarea
                      {...register(`steps.${index}.instruction` as const)}
                      placeholder="อธิบายขั้นตอนอย่างละเอียด..."
                      rows={2}
                      className="w-full resize-y rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                    />
                    {errors.steps?.[index]?.instruction && <span className="text-xs font-semibold text-destructive mt-1 block">{errors.steps[index]?.instruction?.message}</span>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">ลิงก์ VDO หรือ รูปภาพ (Media URL)</label>
                    <input
                      type="text"
                      {...register(`steps.${index}.mediaUrl` as const)}
                      placeholder="https://drive.google.com/... หรือลิงก์รูปภาพ"
                      className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                    />
                    {errors.steps?.[index]?.mediaUrl && <span className="text-xs font-semibold text-destructive mt-1 block">{errors.steps[index]?.mediaUrl?.message}</span>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">ลิงก์ PDF หรือ เอกสารอ้างอิง (PDF URL)</label>
                    <input
                      type="text"
                      {...register(`steps.${index}.pdfUrl` as const)}
                      placeholder="https://drive.google.com/..."
                      className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                    />
                    {errors.steps?.[index]?.pdfUrl && <span className="text-xs font-semibold text-destructive mt-1 block">{errors.steps[index]?.pdfUrl?.message}</span>}
                  </div>
                  
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-destructive">คำเตือน / ข้อควรระวัง (Warning) [ไม่บังคับ]</label>
                    <input
                      type="text"
                      {...register(`steps.${index}.warning` as const)}
                      placeholder="เช่น ระวังไฟดูด ต้องถอดปลั๊กก่อนเสมอ"
                      className="w-full rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm outline-none transition-all focus:border-destructive focus:bg-destructive/10 focus:ring-4 focus:ring-destructive/20 text-destructive placeholder:text-destructive/50 font-semibold"
                    />
                  </div>
                  {/* Hidden stepNum field */}
                  <input type="hidden" {...register(`steps.${index}.stepNum` as const, { valueAsNumber: true })} defaultValue={index + 1} />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => appendStep({ stepNum: stepFields.length + 1, title: "", instruction: "", mediaUrl: "", pdfUrl: "", warning: "" })}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-4 text-sm font-bold text-primary transition-all hover:border-primary/60 hover:bg-primary/10"
            >
              <Plus className="size-5" />
              เพิ่มขั้นตอนใหม่
            </button>
            {errors.steps?.root && <span className="text-sm font-semibold text-destructive text-center block">{errors.steps.root.message}</span>}
          </div>
        </Section>

        {/* Floating Save Bar */}
        <div className="sticky bottom-4 z-10 mx-auto mt-4 flex w-full max-w-4xl items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 font-medium text-muted-foreground">
              <ListChecks className="size-5 text-primary" />
              รวม {stepFields.length} ขั้นตอน
            </div>
            {Object.keys(errors).length > 0 && (
              <div className="hidden sm:flex text-destructive font-semibold items-center gap-1 text-xs bg-destructive/10 px-2 py-1 rounded-md">
                กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
            {editId ? "บันทึกการแก้ไข" : "สร้างคู่มือใหม่"}
          </button>
        </div>
      </form>

      {/* Add Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">เพิ่มประเภทสินค้าใหม่</h2>
              <button onClick={() => setShowAddCatModal(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"><X className="size-5" /></button>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">ชื่อประเภทสินค้า</label>
              <input 
                autoFocus
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                placeholder="เช่น เครื่องฟอกอากาศ"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
              />
            </div>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowAddCatModal(false)} className="rounded-xl bg-muted px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted/80 transition-all">ยกเลิก</button>
              <button type="button" onClick={handleAddCategory} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {showAddSubCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">เพิ่มประเภทย่อยใหม่</h2>
              <button onClick={() => setShowAddSubCatModal(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"><X className="size-5" /></button>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">ชื่อประเภทย่อย</label>
              <input 
                autoFocus
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                placeholder="เช่น ปั๊มน้ำอัตโนมัติ"
                value={newSubCatName}
                onChange={e => setNewSubCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubCategory()}
              />
            </div>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowAddSubCatModal(false)} className="rounded-xl bg-muted px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted/80 transition-all">ยกเลิก</button>
              <button type="button" onClick={handleAddSubCategory} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {showAddSymptomGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">เพิ่มกลุ่มอาการใหม่</h2>
              <button onClick={() => setShowAddSymptomGroupModal(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"><X className="size-5" /></button>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">ชื่อกลุ่มอาการ</label>
              <input 
                autoFocus
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                placeholder="เช่น น้ำรั่วซึม"
                value={newSymptomGroupName}
                onChange={e => setNewSymptomGroupName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSymptomGroup()}
              />
            </div>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowAddSymptomGroupModal(false)} className="rounded-xl bg-muted px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted/80 transition-all">ยกเลิก</button>
              <button type="button" onClick={handleAddSymptomGroup} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {showAddSymptomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-3xl border shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">เพิ่มข้อตรวจสอบใหม่</h2>
              <button onClick={() => setShowAddSymptomModal(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"><X className="size-5" /></button>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">ชื่อสาเหตุ/ข้อตรวจสอบ</label>
              <input 
                autoFocus
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10" 
                placeholder="เช่น สายยางเสื่อมสภาพ"
                value={newSymptomName}
                onChange={e => setNewSymptomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSymptom()}
              />
            </div>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowAddSymptomModal(false)} className="rounded-xl bg-muted px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted/80 transition-all">ยกเลิก</button>
              <button type="button" onClick={handleAddSymptom} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({
  step,
  title,
  children,
}: {
  step: number
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-border/50 bg-card/40 p-6 shadow-sm backdrop-blur-sm sm:p-8">
      <div className="mb-6 flex items-center gap-3 border-b border-border/50 pb-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground shadow-sm">
          {step}
        </span>
        <h2 className="font-display text-lg font-bold">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  )
}
