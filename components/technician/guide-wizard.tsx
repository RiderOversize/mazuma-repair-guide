"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Phone,
  MonitorSmartphone,
  Check,
  X,
  Loader2
} from "lucide-react"
import { SecureVideoPlayer } from "./secure-video-player"
import {
  type Guide,
  type DeviceModel,
  type Category,
  type Symptom,
} from "@/lib/mock-data"
import { type AuthUser, SUPERVISORS } from "@/lib/auth"
import { logRepairFeedback, logSessionActivity } from "@/lib/data-service"
import { cn } from "@/lib/utils"

export function GuideWizard({
  guide,
  user,
  model,
  categories,
  models,
  symptoms,
  onBack,
}: {
  guide: Guide
  user: AuthUser
  model?: DeviceModel | null
  categories: Category[]
  models: DeviceModel[]
  symptoms: Symptom[]
  onBack: () => void
}) {
  const [current, setCurrent] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const category = categories.find(c => c.id === guide.categoryId)
  const symptom = symptoms.find(s => s.id === guide.symptomId)
  
  // Find applicable models based on symptomType matching
  const applicableModels = models.filter(m => m.categoryId === guide.categoryId && m.symptomTypeId === symptom?.symptomTypeId)
  const modelNames = applicableModels.map(m => m.name)
  const totalSteps = guide.steps.length
  const step = guide.steps[current]
  const isLast = current === totalSteps - 1

  useEffect(() => {
    logSessionActivity(
      user.employeeCode,
      user.name,
      `กำลังดูคู่มือ: ${guide.specificCause}${model ? ` (${model.name})` : ''}`
    )
  }, [user, guide.specificCause, model])

  const goNext = () => {
    if (isLast) {
      setShowFeedback(true)
    } else {
      setCurrent((c) => c + 1)
    }
  }
  const goPrev = () => setCurrent((c) => Math.max(0, c - 1))

  const handleFeedback = async (isSuccess: boolean) => {
    setIsSubmitting(true)
    await logRepairFeedback({
      guideId: guide.id,
      modelId: model?.id || null,
      userId: user.employeeCode,
      userName: user.name,
      isSuccess,
      stepsViewed: current + 1,
      totalSteps
    })
    setIsSubmitting(false)
    setShowFeedback(false)
    onBack()
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 px-4 pb-3 pt-14 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="mb-2 hidden sm:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          กลับ
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {category?.name}
          </span>
        </div>
        <h1 className="mt-1.5 font-display text-xl font-semibold leading-snug text-balance">
          {symptom?.description || "ไม่ระบุอาการ"}
        </h1>
      </header>

      <div className="flex flex-col gap-4 px-4 pt-4">
        {/* Specific cause callout */}
        <div className="flex items-start gap-2.5 rounded-xl border border-chart-3/40 bg-chart-3/10 p-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-chart-3" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              สาเหตุที่วินิจฉัย
            </p>
            <p className="font-display font-semibold text-foreground">
              {guide.specificCause}
            </p>
          </div>
        </div>

        {/* Supported models badge */}
        <div className="flex items-start gap-2 rounded-xl bg-muted p-3">
          <MonitorSmartphone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">ใช้ได้กับรุ่น: </span>
            {model ? model.name : (modelNames.length > 0 ? modelNames.join(", ") : "ทุกรุ่นที่เกี่ยวข้อง")}
          </p>
        </div>

        {/* Tools card */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center gap-2">
            <Wrench className="size-4 text-primary" />
            <h2 className="font-display text-sm font-semibold">อุปกรณ์ที่ต้องใช้</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {guide.toolsRequired.map((tool) => (
              <span
                key={tool}
                className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>
              ขั้นตอนที่ {step.stepNum} จาก {totalSteps}
            </span>
            <span>{Math.round(((current + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="flex gap-1.5">
            {guide.steps.map((s, i) => (
              <div
                key={s.stepNum}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i <= current ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </div>
        </div>

        {/* Single active step */}
        <SecureVideoPlayer stepNum={step.stepNum} label={guide.specificCause} />

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {step.stepNum}
          </div>
          <p className="leading-relaxed text-foreground">{step.instruction}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={current === 0}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition-colors",
              current === 0
                ? "cursor-not-allowed text-muted-foreground/50"
                : "text-foreground hover:bg-muted",
            )}
          >
            <ArrowLeft className="size-4" />
            ก่อนหน้า
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isLast ? "เสร็จสิ้น" : "ถัดไป"}
            {isLast ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <ArrowRight className="size-4" />
            )}
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          ทำตามทีละขั้นตอนเพื่อความปลอดภัย ไม่สามารถข้ามขั้นตอนได้
        </p>
      </div>

      {/* Sticky contact & feedback bar */}
      <div className="fixed inset-x-0 bottom-[65px] sm:bottom-0 z-40 border-t border-border bg-card/95 p-3 backdrop-blur shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="mx-auto max-w-lg flex flex-row gap-2">
          <button
            onClick={() => setShowFeedback(true)}
            className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-2 sm:px-4 py-3 font-display text-[11px] sm:text-sm font-semibold text-white shadow-md transition-transform active:scale-[0.98]"
          >
            <CheckCircle2 className="size-4 sm:size-5 shrink-0" />
            <span className="truncate">รายงานผล (จบงาน)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowContact(true)}
            className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-secondary hover:bg-secondary/80 px-2 sm:px-4 py-3 font-display text-[11px] sm:text-sm font-semibold text-secondary-foreground transition-colors"
          >
            <Phone className="size-4 sm:size-5 shrink-0" />
            <span className="truncate">ติดต่อหัวหน้าช่าง</span>
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-display font-bold text-foreground">
                เลือกหัวหน้าช่างที่ต้องการติดต่อ
              </h2>
              <button 
                onClick={() => setShowContact(false)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {SUPERVISORS.filter(sup => user.assignedSupervisors?.includes(sup.employeeCode)).map((sup) => (
                <div key={sup.employeeCode} className="flex items-center justify-between p-3 rounded-2xl border border-border bg-background hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {sup.initials}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{sup.name}</p>
                      <p className="text-xs text-muted-foreground">{sup.phone || "ไม่มีเบอร์"}</p>
                    </div>
                  </div>
                  {sup.phone ? (
                    <a
                      href={`tel:${sup.phone}`}
                      className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                    >
                      <Phone className="size-4" />
                      โทร
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground px-4">ไม่มีข้อมูล</span>
                  )}
                </div>
              ))}
              {SUPERVISORS.filter(sup => user.assignedSupervisors?.includes(sup.employeeCode)).length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm font-semibold text-foreground">ยังไม่มีหัวหน้าช่างที่ปรึกษาที่กำหนดไว้</p>
                  <p className="text-xs text-muted-foreground mt-1">กรุณาติดต่อแอดมินเพื่อกำหนดหัวหน้าช่างประจำตัว</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 flex flex-col gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <CheckCircle2 className="size-8" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                การซ่อมครั้งนี้สำเร็จหรือไม่?
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                การรายงานผลจะช่วยให้เราปรับปรุงคู่มือให้ดีขึ้น
                <br />(ดูไปแล้ว {current + 1} จาก {totalSteps} ขั้นตอน)
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                disabled={isSubmitting}
                onClick={() => handleFeedback(false)}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-4 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <X className="size-8" />
                <span className="font-bold">ไม่สำเร็จ</span>
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleFeedback(true)}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-600 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
              >
                <Check className="size-8" />
                <span className="font-bold">สำเร็จ</span>
              </button>
            </div>

            <button 
              disabled={isSubmitting}
              onClick={() => setShowFeedback(false)} 
              className="mt-2 text-sm font-semibold text-muted-foreground hover:text-foreground text-center flex justify-center items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "ยังไม่เสร็จ ขอดูต่อ"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
