"use client"

import { useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  AlertCircle,
  Phone,
  MonitorSmartphone,
  Check,
  X,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Send,
} from "lucide-react"
import { SecureVideoPlayer } from "./secure-video-player"
import {
  type Guide,
  type DeviceModel,
  type Category,
  type Symptom,
  type SymptomType,
} from "@/lib/types"
import { type AuthUser } from "@/lib/auth"
import { logRepairFeedback, getUsers } from "@/lib/data-service"
import { logActivity } from "@/lib/activity-service"
import { cn } from "@/lib/utils"

const COMMON_FAILURE_REASONS = [
  "อะไหล่ไม่ตรงรุ่น",
  "ไม่มีอะไหล่เปลี่ยน",
  "อาการไม่ตรงกับคู่มือ",
  "เครื่องมือหน้างานไม่พร้อม",
  "ต้องส่งเครื่องเข้าศูนย์ใหญ่",
  "ลูกค้าขอยกเลิกซ่อม",
]

export function GuideWizard({
  guide,
  guides,
  user,
  model,
  categories,
  models,
  symptoms,
  symptomTypes,
  preview = false,
  onBack,
  onHome,
}: {
  guide: Guide
  guides?: Guide[]
  user: AuthUser
  model?: DeviceModel | null
  categories: Category[]
  models: DeviceModel[]
  symptoms: Symptom[]
  symptomTypes?: SymptomType[]
  preview?: boolean
  onBack: () => void
  onHome?: () => void
}) {
  const [finished, setFinished] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackResult, setFeedbackResult] = useState<boolean | null>(null)
  const [feedbackNote, setFeedbackNote] = useState("")
  const [feedbackError, setFeedbackError] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showThankYou, setShowThankYou] = useState(false)
  const [showAskContact, setShowAskContact] = useState(false)
  const [dbSupervisors, setDbSupervisors] = useState<AuthUser[]>([])

  useEffect(() => {
    if (showContact && dbSupervisors.length === 0) {
      getUsers().then(users => {
        setDbSupervisors(users.filter(u => u.role === "head"))
      }).catch(console.error)
    }
  }, [showContact, dbSupervisors.length])

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
  const symptomType = symptomTypes?.find(st => st.id === (currentGuide.symptomTypeId || symptom?.symptomTypeId))

  useEffect(() => {
    // Prevent spam by using a ref or session storage, but since currentGuide changes rarely in a session,
    // we can log it. To avoid re-logging on remount, we check sessionStorage.
    const viewKey = `viewed_${currentGuide.id}_${user.employeeCode}`;
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, "true");
      logActivity(
        user,
        "view",
        "guide",
        currentGuide.title,
        currentGuide.id,
        model ? `ดูบนเครื่อง ${model.name}` : "วินิจฉัยด่วน"
      ).catch(console.error)
    }
  }, [user, currentGuide.id, currentGuide.title, model])

  const handleOpenFeedback = () => {
    setFeedbackResult(null)
    setFeedbackNote("")
    setFeedbackError("")
    setShowFeedback(true)
  }

  const handleCloseFeedback = () => {
    setShowFeedback(false)
    setFeedbackResult(null)
    setFeedbackNote("")
    setFeedbackError("")
  }

  const handleSelectResult = (isSuccess: boolean) => {
    setFeedbackResult(isSuccess)
    setFeedbackError("")
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  const handleSelectReason = (reason: string) => {
    setFeedbackNote((prev) => {
      const trimmed = prev.trim()
      if (!trimmed) return reason
      if (trimmed.includes(reason)) return prev
      return `${trimmed}, ${reason}`
    })
    setFeedbackError("")
    textareaRef.current?.focus()
  }

  const handleSubmitFeedback = async () => {
    if (feedbackResult === null) return

    // If unsuccessful, note is required
    if (!feedbackResult && !feedbackNote.trim()) {
      setFeedbackError("กรุณาระบุสาเหตุที่ซ่อมไม่สำเร็จก่อนส่งรายงาน")
      textareaRef.current?.focus()
      return
    }

    setFeedbackError("")
    setIsSubmitting(true)
    const isHelpful = feedbackResult
    try {
      await logRepairFeedback({
        guideId: currentGuide.id,
        modelId: model?.id || "วินิจฉัยด่วน",
        userId: user.employeeCode,
        userName: user.name,
        isSuccess: isHelpful,
        stepsViewed: maxReachedIndex + 1,
        totalSteps: symGuides.length,
        note: feedbackNote.trim()
      })

      await logActivity(
        user,
        "update",
        "guide",
        currentGuide.title,
        currentGuide.id,
        `ส่งผลการซ่อม: ${isHelpful ? 'สำเร็จ' : 'ไม่สำเร็จ'}${feedbackNote.trim() ? ` (${feedbackNote.trim()})` : ''}`
      )
    } catch (e) {
      console.error(e)
    }
    setIsSubmitting(false)
    setShowFeedback(false)
    setFeedbackResult(null)
    setFeedbackNote("")

    if (isHelpful) {
      setShowThankYou(true)
    } else {
      setShowAskContact(true)
    }
  }

  const handleFeedback = (isHelpful: boolean) => {
    handleSelectResult(isHelpful)
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
            onClick={onHome || onBack}
            className="rounded-xl border border-input bg-background px-6 py-2.5 text-sm font-semibold hover:bg-muted shadow-sm transition-all hover:shadow-md"
          >
            กลับหน้าแรก
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "mx-auto flex min-h-screen w-full max-w-3xl flex-col pb-28",
      preview ? "pt-12" : "pt-2"
    )}>
      <div className="flex flex-col gap-4 px-4 pt-2">
        {/* Specific cause callout */}
        <div className="flex flex-col gap-2.5 rounded-2xl border border-chart-3/40 bg-chart-3/10 p-3.5 shadow-sm">
          {model && (
            <div className="flex flex-col gap-1 pb-2.5 border-b border-chart-3/20">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[10.5px]">
                    รุ่นสินค้า
                  </span>
                  {model.status === "discontinued" && (
                    <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10.5px] font-bold text-amber-800 dark:text-amber-300">
                      ยกเลิกผลิต
                    </span>
                  )}
                </div>
                {model.code && (
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md bg-background/80 border border-border/60 text-[10.5px] font-mono font-semibold text-muted-foreground">
                    {model.code}
                  </span>
                )}
              </div>
              <p className="font-display text-[13.5px] font-bold text-foreground leading-snug break-words mt-0.5">
                {model.name}
              </p>
              {model.status === "discontinued" && (
                <div className="mt-1 rounded-xl border border-amber-500/25 bg-amber-500/10 p-2 flex items-start gap-1.5 text-[0.6875rem] text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span>รุ่นนี้ยกเลิกการผลิตแล้ว — โปรดตรวจสอบสต็อกอะไหล่หรือเทียบเคียงอะไหล่ทดแทน</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-chart-3" />
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  อาการเสีย
                </p>
                <p className="mt-0.5 font-display text-[0.9375rem] font-semibold leading-snug text-foreground">
                  {symptom?.title || symptom?.description || "ไม่ระบุอาการเสีย"}
                </p>
              </div>
              <div>
                <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  สาเหตุที่วินิจฉัย
                </p>
                <p className="mt-0.5 text-sm font-medium leading-snug text-foreground/90">
                  {currentGuide.title}
                </p>
              </div>
            </div>
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
            key={`guide-step-${currentIndex}-${currentGuide.id || currentIndex}-${currentGuide.mediaUrl || ''}-${currentGuide.pdfUrl || ''}`}
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
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-0 px-4 py-3.5 text-[0.9375rem] font-semibold transition-colors bg-muted/60",
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
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-4 py-3.5 text-[0.9375rem] font-semibold transition-colors bg-primary/10",
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
          {/* Action buttons (จบงาน & ติดต่อช่าง) placed in content flow */}
          <div className="pt-3 pb-6 flex flex-row gap-3">
            <button
              onClick={handleOpenFeedback}
              className="flex flex-[2] items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-display text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.98] bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 cursor-pointer"
            >
              <CheckCircle2 className="size-5 shrink-0" />
              <span className="truncate">จบงาน</span>
            </button>

            <button
              type="button"
              onClick={() => setShowContact(true)}
              className="flex flex-[1] items-center justify-center gap-2 rounded-2xl bg-muted/80 hover:bg-muted px-4 py-3.5 font-display text-sm font-bold text-foreground transition-transform active:scale-[0.98] cursor-pointer"
            >
              <Phone className="size-5 shrink-0" />
              <span className="truncate">ติดต่อช่าง</span>
            </button>
          </div>
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
              {dbSupervisors.filter(sup => sup && sup.employeeCode && user.assignedSupervisors?.includes(sup.employeeCode)).map((sup, idx) => (
                <div key={sup.employeeCode || `sup-wiz-${idx}`} className="flex items-center justify-between p-3 rounded-2xl border border-border bg-background hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {sup.avatar && sup.avatar.trim() !== "" && sup.avatar !== "/avatars/technician.png" && sup.avatar !== "/avatars/admin.png" ? (
                      <div className="size-10 rounded-full overflow-hidden shrink-0 border border-border shadow-sm">
                        <img src={sup.avatar} alt={sup.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 shadow-sm">
                        {sup.initials}
                      </div>
                    )}
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
              {dbSupervisors.filter(sup => user.assignedSupervisors?.includes(sup.employeeCode)).length === 0 && (
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
          <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 flex flex-col gap-5">
            {feedbackResult === null ? (
              /* Step 1: Select outcome */
              <>
                <div className="flex flex-col items-center text-center">
                  <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    การซ่อมครั้งนี้สำเร็จหรือไม่?
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    การรายงานผลจะช่วยให้เราปรับปรุงคู่มือให้ดีขึ้น
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSelectResult(false)}
                    className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-5 text-destructive hover:bg-destructive/10 active:scale-95 transition-all cursor-pointer"
                  >
                    <X className="size-9" />
                    <span className="font-bold text-base">ไม่สำเร็จ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectResult(true)}
                    className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/5 p-5 text-emerald-600 hover:bg-emerald-500/10 active:scale-95 transition-all cursor-pointer"
                  >
                    <Check className="size-9" />
                    <span className="font-bold text-base">สำเร็จ</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCloseFeedback}
                  className="mt-1 text-sm font-semibold text-muted-foreground hover:text-foreground text-center py-2 transition-colors cursor-pointer"
                >
                  ยังไม่เสร็จ ขอดูต่อ
                </button>
              </>
            ) : (
              /* Step 2: Note / Reason input + Submit button */
              <>
                <div className="flex items-center justify-between pb-1 border-b border-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackResult(null)
                      setFeedbackError("")
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                    เปลี่ยนผลการซ่อม
                  </button>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs",
                    feedbackResult
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  )}>
                    {feedbackResult ? (
                      <>
                        <Check className="size-3.5" />
                        ซ่อมสำเร็จ
                      </>
                    ) : (
                      <>
                        <X className="size-3.5" />
                        ซ่อมไม่สำเร็จ
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col text-left">
                  <h3 className="text-lg font-display font-bold text-foreground">
                    {feedbackResult ? "บันทึกข้อมูลเพิ่มเติม" : "ระบุสาเหตุที่ซ่อมไม่สำเร็จ"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {feedbackResult
                      ? "ระบุข้อคิดเห็นหรือข้อเสนอแนะเพิ่มเติมเพื่อพัฒนาคู่มือ (ถ้ามี)"
                      : "กรุณาระบุสาเหตุหรือปัญหาที่พบ เพื่อบันทึกข้อมูลและส่งต่อให้หัวหน้าช่าง"}
                  </p>
                </div>

                <div className="w-full flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      {feedbackResult ? "ข้อเสนอแนะ / หมายเหตุ" : "สาเหตุที่ไม่สำเร็จ"}
                    </label>
                    <span className={cn(
                      "text-[11px] font-medium transition-colors",
                      !feedbackResult
                        ? "text-destructive font-semibold"
                        : "text-muted-foreground"
                    )}>
                      {!feedbackResult ? "* บังคับระบุสาเหตุ" : "(ไม่บังคับ)"}
                    </span>
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={feedbackNote}
                    onChange={(e) => {
                      setFeedbackNote(e.target.value)
                      if (feedbackError && e.target.value.trim()) {
                        setFeedbackError("")
                      }
                    }}
                    placeholder={
                      feedbackResult
                        ? "ระบุข้อคิดเห็น หรือสิ่งที่อยากเสนอแนะเพิ่มเติม (ไม่บังคับ)..."
                        : "ระบุสาเหตุที่ซ่อมไม่สำเร็จ เช่น อะไหล่ไม่ตรงรุ่น, เครื่องมือไม่พร้อม..."
                    }
                    className={cn(
                      "w-full min-h-[95px] p-3 rounded-xl border bg-background text-sm resize-none transition-all focus:outline-none focus:ring-2",
                      feedbackError
                        ? "border-destructive ring-2 ring-destructive/20 focus:ring-destructive"
                        : "border-input focus:ring-primary/50"
                    )}
                  />

                  {feedbackError && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{feedbackError}</span>
                    </div>
                  )}

                  {!feedbackResult && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="text-[11px] text-muted-foreground font-medium">
                        เลือกสาเหตุด่วน:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {COMMON_FAILURE_REASONS.map((reason) => (
                          <button
                            key={reason}
                            type="button"
                            onClick={() => handleSelectReason(reason)}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-border bg-muted/60 text-muted-foreground hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive active:scale-95 transition-all cursor-pointer"
                          >
                            + {reason}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    disabled={isSubmitting}
                    onClick={handleSubmitFeedback}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer",
                      feedbackResult
                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                        : "bg-destructive hover:bg-destructive/90 shadow-destructive/20"
                    )}
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="size-4" />
                        <span>ส่งรายงาน</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setFeedbackResult(null)
                      setFeedbackError("")
                    }}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground text-center py-1 transition-colors cursor-pointer"
                  >
                    ย้อนกลับไปเลือกใหม่
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Ask Contact Modal */}
      {showAskContact && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 flex flex-col gap-4 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-2">
              <Phone className="size-8" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">
              ต้องการติดต่อหัวหน้าช่างหรือไม่?
            </h2>
            <p className="text-muted-foreground text-sm">
              เนื่องจากการซ่อมไม่สำเร็จ คุณสามารถติดต่อหัวหน้าช่างเพื่อขอคำปรึกษาเพิ่มเติมได้
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowAskContact(false)
                  if (onHome) onHome()
                  else onBack()
                }}
                className="flex-1 rounded-2xl border border-input bg-background px-4 py-3.5 text-sm font-bold text-foreground hover:bg-muted transition-all active:scale-95"
              >
                ไม่เป็นไร
              </button>
              <button
                onClick={() => {
                  setShowAskContact(false)
                  setShowContact(true)
                }}
                className="flex-1 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 flex flex-col gap-4 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
              <ThumbsUp className="size-8" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              ขอบคุณสำหรับข้อมูล!
            </h2>
            <p className="text-muted-foreground text-sm">
              เราจะนำข้อมูลนี้ไปพัฒนาคู่มือให้ดียิ่งขึ้นต่อไปครับ
            </p>
            <button
              onClick={() => {
                setShowThankYou(false)
                if (onHome) onHome()
                else onBack()
              }}
              className="mt-4 w-full rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
            >
              กลับหน้าแรก
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
