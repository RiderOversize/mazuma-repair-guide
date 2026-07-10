"use client"

import { useMemo, useState } from "react"
import {
  Plus,
  Trash2,
  UploadCloud,
  GripVertical,
  CheckCircle2,
  ListChecks,
  Save,
} from "lucide-react"
import {
  categories,
  getModelsByCategory,
  type GuideStep,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

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

export function GuideForm() {
  const [categoryId, setCategoryId] = useState("")
  const [symptomGroupId, setSymptomGroupId] = useState("")
  const [specificCause, setSpecificCause] = useState("")
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [tools, setTools] = useState("")
  const [steps, setSteps] = useState<DraftStep[]>([newStep(1)])
  const [saved, setSaved] = useState(false)

  const category = categories.find((c) => c.id === categoryId)
  const symptomGroups = category?.symptomGroups ?? []
  const availableModels = useMemo(
    () => (categoryId ? getModelsByCategory(categoryId) : []),
    [categoryId],
  )
  const allSelected =
    availableModels.length > 0 && selectedModels.length === availableModels.length

  const resetDependents = (id: string) => {
    setCategoryId(id)
    setSymptomGroupId("")
    setSelectedModels([])
  }

  const toggleModel = (id: string) => {
    setSelectedModels((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    )
  }

  const toggleAll = () => {
    setSelectedModels(allSelected ? [] : availableModels.map((m) => m.id))
  }

  const addStep = () => setSteps((s) => [...s, newStep(s.length + 1)])
  const removeStep = (key: string) =>
    setSteps((s) =>
      s.filter((st) => st.key !== key).map((st, i) => ({ ...st, stepNum: i + 1 })),
    )
  const updateStep = (key: string, patch: Partial<DraftStep>) =>
    setSteps((s) => s.map((st) => (st.key === key ? { ...st, ...patch } : st)))

  const canSave =
    categoryId && symptomGroupId && specificCause.trim() && selectedModels.length > 0

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">สร้างคู่มือการซ่อมใหม่</h1>
        <p className="text-sm text-muted-foreground">
          กรอกข้อมูลตามลำดับขั้น ระบบจะปรับตัวเลือกอัตโนมัติตามประเภทที่เลือก
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Step 1 + 2: Category & Symptom Group */}
        <Section step={1} title="ประเภทและอาการเสีย">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ประเภทสินค้า">
              <select
                value={categoryId}
                onChange={(e) => resetDependents(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
              >
                <option value="">— เลือกประเภท —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="กลุ่มอาการ (Symptom Group)">
              <select
                value={symptomGroupId}
                onChange={(e) => setSymptomGroupId(e.target.value)}
                disabled={!categoryId}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          </div>
        </Section>

        {/* Step 2: Specific cause */}
        <Section step={2} title="สาเหตุเฉพาะ (Specific Cause)">
          <input
            type="text"
            value={specificCause}
            onChange={(e) => setSpecificCause(e.target.value)}
            placeholder="เช่น ความต้านทานฉนวนฮีตเตอร์ต่ำ"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </Section>

        {/* Step 4: Applicable models */}
        <Section step={3} title="รุ่นที่ใช้ได้">
          {!categoryId ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
              เลือกประเภทสินค้าก่อนเพื่อแสดงรายการรุ่น
            </p>
          ) : (
            <>
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  เลือกแล้ว {selectedModels.length} จาก {availableModels.length} รุ่น
                </p>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {allSelected ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableModels.map((m) => {
                  const active = selectedModels.includes(m.id)
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleModel(m.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/40",
                      )}
                    >
                      {active ? <CheckCircle2 className="size-3.5" /> : null}
                      {m.name}
                      <span className={cn("text-xs", active ? "opacity-80" : "text-muted-foreground")}>
                        {m.code}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </Section>

        {/* Step 5: Tools */}
        <Section step={4} title="อุปกรณ์ที่ต้องใช้">
          <input
            type="text"
            value={tools}
            onChange={(e) => setTools(e.target.value)}
            placeholder="ระบุอุปกรณ์ คั่นด้วยเครื่องหมายจุลภาค เช่น มัลติมิเตอร์, ไขควงแฉก"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
          />
          {tools.trim() ? (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {tools
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {t}
                  </span>
                ))}
            </div>
          ) : null}
        </Section>

        {/* Step 6: Step builder */}
        <Section step={5} title="ขั้นตอนการซ่อม (พร้อมวิดีโอ)">
          <div className="flex flex-col gap-3">
            {steps.map((st) => (
              <div
                key={st.key}
                className="rounded-xl border border-border bg-muted/40 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="size-4 text-muted-foreground" />
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {st.stepNum}
                    </span>
                    <span className="text-sm font-semibold">ขั้นตอนที่ {st.stepNum}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStep(st.key)}
                    disabled={steps.length === 1}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="size-3.5" />
                    ลบ
                  </button>
                </div>

                <textarea
                  value={st.instruction}
                  onChange={(e) => updateStep(st.key, { instruction: e.target.value })}
                  placeholder="คำอธิบายขั้นตอน..."
                  rows={2}
                  className="mb-2 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
                />

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={st.videoUrl}
                    onChange={(e) => updateStep(st.key, { videoUrl: e.target.value })}
                    placeholder="วาง URL วิดีโอ (Google Drive)"
                    className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateStep(st.key, {
                        videoUrl: `https://drive.google.com/mock/${st.key}`,
                      })
                    }
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <UploadCloud className="size-4" />
                    อัปโหลดขึ้น Drive
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/50 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <Plus className="size-4" />
              เพิ่มขั้นตอน
            </button>
          </div>
        </Section>

        {/* Save bar */}
        <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ListChecks className="size-4" />
            {steps.length} ขั้นตอน
          </div>
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
              <CheckCircle2 className="size-4" />
              บันทึกคู่มือเรียบร้อย
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="size-4" />
              บันทึกคู่มือ
            </button>
          )}
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
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-sm font-bold text-primary">
          {step}
        </span>
        <h2 className="font-display font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
