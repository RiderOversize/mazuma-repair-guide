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
  Loader2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { SecureVideoPlayer } from "./secure-video-player"
import {
  type Guide,
  type DeviceModel,
  type Category,
  type Symptom,
  type SymptomType,
} from "@/lib/types"
import { type AuthUser, SUPERVISORS } from "@/lib/auth"
import { logRepairFeedback, logSessionActivity } from "@/lib/data-service"
import { cn } from "@/lib/utils"

export function GuideWizard({
  guide,
  guides,
  user,
  model,
  categories,
  models,
  symptoms,
  symptomTypes,
  onBack,
}: {
  guide: Guide
  guides?: Guide[]
  user: AuthUser
  model?: DeviceModel | null
  categories: Category[]
  models: DeviceModel[]
  symptoms: Symptom[]
  symptomTypes?: SymptomType[]
  onBack: () => void
}) {
  const [finished, setFinished] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackNote, setFeedbackNote] = useState("")

  const symGuides = guides?.filter(g => g.symptomId === guide.symptomId && g.status === 'published') || [guide]
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = symGuides.findIndex(g => g.id === guide.id)
    return idx >= 0 ? idx : 0
  })
  const [maxReachedIndex, setMaxReachedIndex] = useState(currentIndex)
  
  const currentGuide = symGuides[currentIndex]
  const hasMultipleGuides = symGuides.length > 1
  const isFirstGuide = currentIndex === 0
  const isLastGuide = currentIndex === symGuides.length - 1

  const category = categories.find(c => c.id === currentGuide.categoryId)
  const symptom = symptoms.find(s => s.id === currentGuide.symptomId)
  const symptomType = symptomTypes?.find(st => st.id === currentGuide.symptomTypeId)

  useEffect(() => {
    logSessionActivity(
      user.employeeCode,
      user.name,
      `กำลังดูคู่มือ: ${currentGuide.title}${model ? ` (${model.name})` : ''}`
    )
  }, [user, currentGuide.title, model])

  const handleFinish = () => {
    setShowFeedback(true)
  }

  const handleFeedback = async (isHelpful: boolean, reason?: string) => {
    setIsSubmitting(true)
    try {
      await logRepairFeedback({
        guideId: currentGuide.id,
        modelId: model?.id || null,
        userId: user.employeeCode,
        userName: user.name,
        isSuccess: isHelpful,
        stepsViewed: maxReachedIndex + 1,
        totalSteps: symGuides.length,
        note: feedbackNote
      })
      
      await logSessionActivity(
        user.employeeCode,
        user.name,
        `ให้คะแนนคู่มือ: ${isHelpful ? 'มีประโยชน์' : 'ไม่มีประโยชน์'}`
      )
    } catch (e) {
      console.error(e)
    }
    setIsSubmitting(false)
    setShowFeedback(false)
    if (!isHelpful) setShowContact(true)
  }

  if (finished) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm ring-8 ring-green-50/50">
          <CheckCircle2 className="size-10" />
        </div>
        <h2 className="mb-2 font-display text-2xl font-bold">ดำเนินการซ่อมเสร็จสิ้น!</h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          คุณได้ทำตามขั้นตอนทั้งหมดในคู่มือแล้ว หากเครื่องยังทำงานไม่ปกติ กรุณาติดต่อศูนย์บริการ
        </p>

        {showFeedback ? (
          <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="mb-4 font-semibold">คู่มือนี้ช่วยแก้ปัญหาได้หรือไม่?</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleFeedback(true)}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <ThumbsUp className="size-4" />}
                ช่วยได้ ปัญหาถูกแก้ไขแล้ว
              </button>
              <button
                onClick={() => handleFeedback(false)}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-3 text-sm font-semibold hover:bg-muted disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <ThumbsDown className="size-4" />}
                ยังช่วยไม่ได้ ปัญหายังอยู่
              </button>
            </div>
          </div>
        ) : showContact ? (
          <div className="w-full max-w-sm rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm animate-in zoom-in-95 duration-300">
            <h3 className="mb-2 font-display text-lg font-bold text-primary">ติดต่อผู้เชี่ยวชาญ</h3>
            <p className="mb-4 text-sm text-muted-foreground">เรากำลังดำเนินการประสานงานกับช่างเทคนิคอาวุโส</p>
            <div className="flex flex-col gap-2">
              <a href="tel:02-111-2222" className="flex items-center justify-center gap-2 rounded-xl bg-background px-4 py-2.5 text-sm font-semibold shadow-sm border">
                <Phone className="size-4 text-primary" />
                โทรหาหัวหน้าช่าง (พี่สมหมาย)
              </a>
              <button onClick={onBack} className="mt-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                กลับไปหน้ารายการอาการ
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onBack}
            className="rounded-xl border border-input bg-background px-6 py-2.5 text-sm font-semibold hover:bg-muted shadow-sm transition-all hover:shadow-md"
          >
            กลับหน้าแรก
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 px-4 pb-4 pt-14 backdrop-blur-2xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ChevronLeft className="size-5" />
          <span>อาการเสีย</span>
        </button>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary uppercase tracking-wide">
            {category?.name}
          </span>
          {model && (
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground uppercase tracking-wide">
              {model.name}
            </span>
          )}
        </div>
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
              {symptom?.title || symptom?.description || "ไม่ระบุสาเหตุ"}
            </p>
            <p className="mt-1 text-sm text-foreground/80">
              <span className="font-medium text-muted-foreground">คู่มือ: </span>
              {currentGuide.title}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {hasMultipleGuides && (
            <div className="mb-2">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>
                  คู่มือตรวจสอบขั้นตอนที่ {currentIndex + 1} จาก {symGuides.length}
                </span>
                <span>{Math.round(((currentIndex + 1) / symGuides.length) * 100)}%</span>
              </div>
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-in-out" 
                  style={{ width: `${((currentIndex + 1) / symGuides.length) * 100}%` }}
                />
              </div>
              <div className="flex gap-2">
                {symGuides.map((_, i) => {
                  const isReached = i <= maxReachedIndex;
                  const isActive = i === currentIndex;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (isReached) setCurrentIndex(i);
                      }}
                      disabled={!isReached}
                      className={cn(
                        "flex size-8 flex-1 items-center justify-center rounded-xl text-sm font-bold transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : isReached
                          ? "bg-primary/20 text-primary hover:bg-primary/30"
                          : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <SecureVideoPlayer 
            stepNum={currentIndex + 1} 
            label={currentGuide.title} 
            mediaUrl={currentGuide.mediaUrl}
            pdfUrl={currentGuide.pdfUrl}
          />
          
          {hasMultipleGuides && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
                disabled={isFirstGuide}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-0 px-4 py-3.5 text-[15px] font-semibold transition-colors bg-muted/60",
                  isFirstGuide
                    ? "cursor-not-allowed opacity-50"
                    : "text-foreground active:bg-muted",
                )}
              >
                <ArrowLeft className="size-5" />
                ก่อนหน้า
              </button>
              <button
                type="button"
                onClick={() => {
                  const newIndex = Math.min(symGuides.length - 1, currentIndex + 1);
                  setCurrentIndex(newIndex);
                  setMaxReachedIndex(prev => Math.max(prev, newIndex));
                }}
                disabled={isLastGuide}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition-colors bg-primary/10",
                  isLastGuide
                    ? "cursor-not-allowed opacity-50"
                    : "text-primary active:bg-primary/20",
                )}
              >
                ถัดไป
                <ArrowRight className="size-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sticky contact & feedback bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-background/80 p-4 pb-safe backdrop-blur-2xl">
        <div className="mx-auto max-w-[480px] flex flex-row gap-3">
          <button
            onClick={() => setShowFeedback(true)}
            className="flex flex-[2] items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-display text-[14px] font-bold text-white shadow-sm transition-transform active:scale-[0.98] bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
          >
            <CheckCircle2 className="size-5 shrink-0" />
            <span className="truncate">จบงาน</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowContact(true)}
            className="flex flex-[1] items-center justify-center gap-2 rounded-2xl bg-muted/80 hover:bg-muted px-4 py-3.5 font-display text-[14px] font-bold text-foreground transition-transform active:scale-[0.98]"
          >
            <Phone className="size-5 shrink-0" />
            <span className="truncate">ติดต่อช่าง</span>
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
              </p>
            </div>
            
            <div className="w-full">
              <textarea
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="ระบุหมายเหตุเพิ่มเติม (ไม่บังคับ)..."
                className="w-full min-h-[80px] p-3 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
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
