"use client"

import { useMemo, useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  UploadCloud,
  GripVertical,
  CheckCircle2,
  ListChecks,
  Save,
  Loader2,
  X,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import {
  type GuideStep,
  type Category,
  type DeviceModel,
  type Guide,
} from "@/lib/mock-data"
import { getCategories, getModels, getGuideById, createGuide, updateGuide } from "@/lib/data-service"
import { showToast, showAlert } from "@/lib/swal"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/lib/auth"

interface DraftStep extends GuideStep {
  key: string
}

let stepKey = 0
const newStep = (stepNum: number): DraftStep => ({
  key: `step-${stepKey++}`,
  stepNum,
  instruction: "",
  videoUrl: "",
})

export function GuideForm({ user, editId, onFinish }: { user?: AuthUser, editId?: string | null, onFinish?: () => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [categoryId, setCategoryId] = useState("")
  const [symptomGroupId, setSymptomGroupId] = useState("")
  const [specificCause, setSpecificCause] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"published" | "draft" | "archived">("published")
  const [tagsInput, setTagsInput] = useState("")
  
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [searchModel, setSearchModel] = useState("")
  const [modelPage, setModelPage] = useState(1)
  const [tools, setTools] = useState("")
  const [steps, setSteps] = useState<DraftStep[]>([newStep(1)])

  useEffect(() => {
    loadData()
  }, [editId])

  const loadData = async () => {
    setLoading(true)
    const [cats, mods] = await Promise.all([getCategories(), getModels()])
    setCategories(cats)
    setModels(mods)
    
    if (editId) {
      const g = await getGuideById(editId)
      if (g) {
        setCategoryId(g.categoryId)
        setSymptomGroupId(g.symptomGroupId)
        setSpecificCause(g.specificCause)
        setDescription(g.description || "")
        setStatus(g.status || "published")
        setTagsInput((g.tags || []).join(", "))
        setSelectedModels(g.supportedModels)
        setTools(g.toolsRequired.join(", "))
        setSteps(g.steps.map(s => ({ ...s, key: `step-${stepKey++}` })))
      }
    } else {
      setCategoryId("")
      setSymptomGroupId("")
      setSpecificCause("")
      setDescription("")
      setStatus("draft")
      setTagsInput("")
      setSelectedModels([])
      setTools("")
      setSteps([newStep(1)])
    }
    setLoading(false)
  }

  const category = categories.find((c) => c.id === categoryId)
  const symptomGroups = category?.symptomGroups ?? []
  const availableModels = useMemo(
    () => (categoryId ? models.filter(m => m.categoryId === categoryId) : []),
    [categoryId, models],
  )
  const allSelected =
    availableModels.length > 0 && selectedModels.length === availableModels.length

  const resetDependents = (id: string) => {
    setCategoryId(id)
    setSymptomGroupId("")
    setSelectedModels([])
    setSearchModel("")
    setModelPage(1)
  }

  const toggleModel = (id: string) => {
    setSelectedModels((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    )
  }

  const toggleAll = () => {
    setSelectedModels(allSelected ? [] : availableModels.map((m) => m.id))
  }

  // Derived state for models search and pagination
  const filteredModels = useMemo(() => {
    if (!searchModel.trim()) return availableModels
    const q = searchModel.toLowerCase()
    return availableModels.filter(m => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q))
  }, [availableModels, searchModel])

  const ITEMS_PER_PAGE = 15
  const totalModelPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE) || 1
  
  // Ensure page is within bounds when search changes
  useEffect(() => {
    if (modelPage > totalModelPages) setModelPage(1)
  }, [totalModelPages, modelPage])

  const paginatedModels = useMemo(() => {
    const start = (modelPage - 1) * ITEMS_PER_PAGE
    return filteredModels.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredModels, modelPage])

  const addStep = () => setSteps((s) => [...s, newStep(s.length + 1)])
  const removeStep = (key: string) =>
    setSteps((s) =>
      s.filter((st) => st.key !== key).map((st, i) => ({ ...st, stepNum: i + 1 })),
    )
  const updateStep = (key: string, patch: Partial<DraftStep>) =>
    setSteps((s) => s.map((st) => (st.key === key ? { ...st, ...patch } : st)))

  const canSave =
    categoryId && symptomGroupId && specificCause.trim() && selectedModels.length > 0

  const handleSave = async () => {
    if (!canSave) {
      showAlert("ข้อมูลไม่ครบถ้วน", "กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน", "warning")
      return
    }
    setSaving(true)
    
    const guideData: Guide = {
      id: editId || `g-${Date.now()}`,
      categoryId,
      symptomGroupId,
      specificCause,
      description,
      status,
      tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
      supportedModels: selectedModels,
      toolsRequired: tools.split(",").map(t => t.trim()).filter(Boolean),
      steps: steps.map(({ key, ...rest }) => rest)
    }

    try {
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
            ระบุรายละเอียดและขั้นตอนการซ่อมแบบ Step-by-Step พร้อมวิดีโอประกอบ
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Section step={1} title="ข้อมูลพื้นฐาน (Basic Info)">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="ประเภทสินค้า" required>
              <select
                value={categoryId}
                onChange={(e) => resetDependents(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
              >
                <option value="">— เลือกประเภท —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.id}] {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="กลุ่มอาการ (Symptom Group)" required>
              <select
                value={symptomGroupId}
                onChange={(e) => setSymptomGroupId(e.target.value)}
                disabled={!categoryId}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {categoryId ? "— เลือกอาการ —" : "เลือกประเภทก่อน"}
                </option>
                {symptomGroups.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            
            <div className="sm:col-span-2">
              <Field label="สาเหตุเฉพาะ (Specific Cause)" required>
                <input
                  type="text"
                  value={specificCause}
                  onChange={(e) => setSpecificCause(e.target.value)}
                  placeholder="เช่น ความต้านทานฉนวนฮีตเตอร์ต่ำ"
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                />
              </Field>
            </div>
            
            <div className="sm:col-span-2">
              <Field label="รายละเอียดเพิ่มเติม (Description)">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายอาการเสียและข้อควรระวังเพิ่มเติม..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                />
              </Field>
            </div>
            
            <Field label="สถานะของคู่มือ">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "published" | "draft" | "archived")}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
              >
                <option value="published">เผยแพร่ (Published)</option>
                <option value="draft">ฉบับร่าง (Draft)</option>
                <option value="archived">เก็บถาวร (Archived)</option>
              </select>
            </Field>

            <Field label="แท็ก (Tags)">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="เช่น ไฟฟ้า, ความร้อน คั่นด้วยลูกน้ำ (,)"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
              />
            </Field>
          </div>
        </Section>

        <Section step={2} title="รุ่นสินค้าที่รองรับ (Supported Models)">
          {!categoryId ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 py-10 text-muted-foreground">
               <AlertCircle className="size-8 opacity-30" />
               <p className="text-sm">เลือกประเภทสินค้าด้านบนก่อน เพื่อแสดงรายการรุ่นที่รองรับ</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between bg-muted/50 p-3 rounded-xl gap-3">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <p className="text-sm font-medium whitespace-nowrap">
                    เลือกแล้ว ({selectedModels.length} จาก {availableModels.length})
                  </p>
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-xs font-bold text-primary hover:underline whitespace-nowrap"
                  >
                    {allSelected ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                  </button>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="ค้นหารุ่นสินค้า..."
                    value={searchModel}
                    onChange={(e) => {
                      setSearchModel(e.target.value)
                      setModelPage(1)
                    }}
                    className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {paginatedModels.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
                  ไม่พบรุ่นสินค้าที่ค้นหา
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {paginatedModels.map((m) => {
                    const active = selectedModels.includes(m.id)
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleModel(m.id)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                          active
                            ? "border-primary bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                            : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted",
                        )}
                      >
                        {active ? <CheckCircle2 className="size-4" /> : null}
                        {m.name}
                        <span className={cn("text-xs px-1.5 py-0.5 rounded-md", active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground")}>
                          {m.code}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {totalModelPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    หน้า {modelPage} จาก {totalModelPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModelPage(p => Math.max(1, p - 1))}
                      disabled={modelPage === 1}
                      className="flex size-8 items-center justify-center rounded-lg border hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelPage(p => Math.min(totalModelPages, p + 1))}
                      disabled={modelPage === totalModelPages}
                      className="flex size-8 items-center justify-center rounded-lg border hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Section>

        <Section step={3} title="อุปกรณ์ที่ต้องใช้ (Tools Required)">
          <input
            type="text"
            value={tools}
            onChange={(e) => setTools(e.target.value)}
            placeholder="ระบุอุปกรณ์ คั่นด้วยเครื่องหมายจุลภาค (,) เช่น มัลติมิเตอร์, ไขควงแฉก"
            className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
          />
          {tools.trim() ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {tools
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow-sm"
                  >
                    {t}
                  </span>
                ))}
            </div>
          ) : null}
        </Section>

        <Section step={4} title="ขั้นตอนการซ่อม (Step-by-step)">
          <div className="flex flex-col gap-4">
            {steps.map((st) => (
              <div
                key={st.key}
                className="group relative rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-3">
                    <GripVertical className="size-5 text-muted-foreground cursor-move opacity-50 hover:opacity-100" />
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground shadow-sm">
                      {st.stepNum}
                    </span>
                    <span className="font-display text-sm font-bold">ขั้นตอนที่ {st.stepNum}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStep(st.key)}
                    disabled={steps.length === 1}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="ลบขั้นตอน"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">คำอธิบายขั้นตอน</label>
                    <textarea
                      value={st.instruction}
                      onChange={(e) => updateStep(st.key, { instruction: e.target.value })}
                      placeholder="เช่น ถอดน็อต 4 ตัว บริเวณมุมเครื่อง..."
                      rows={2}
                      className="w-full resize-y rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">วิดีโอสาธิต (Video URL)</label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="url"
                        value={st.videoUrl}
                        onChange={(e) => updateStep(st.key, { videoUrl: e.target.value })}
                        placeholder="https://drive.google.com/..."
                        className="min-w-0 flex-1 rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateStep(st.key, {
                            videoUrl: `https://drive.google.com/mock/${st.key}`,
                          })
                        }
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition-all hover:bg-muted hover:border-primary/50"
                      >
                        <UploadCloud className="size-4" />
                        อัปโหลด
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addStep}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-4 text-sm font-bold text-primary transition-all hover:border-primary/60 hover:bg-primary/10"
            >
              <Plus className="size-5" />
              เพิ่มขั้นตอนใหม่
            </button>
          </div>
        </Section>

        {/* Floating Save Bar */}
        <div className="sticky bottom-4 z-10 mx-auto mt-4 flex w-full max-w-4xl items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 font-medium text-muted-foreground">
              <ListChecks className="size-5 text-primary" />
              รวม {steps.length} ขั้นตอน
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
            {editId ? "บันทึกการแก้ไข" : "สร้างคู่มือใหม่"}
          </button>
        </div>
      </div>
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
