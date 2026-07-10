"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Phone,
  MonitorSmartphone,
} from "lucide-react"
import { SecureVideoPlayer } from "./secure-video-player"
import {
  type Guide,
  getCategory,
  getSymptomGroup,
  getModelNames,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function GuideWizard({
  guide,
  onBack,
}: {
  guide: Guide
  onBack: () => void
}) {
  const [current, setCurrent] = useState(0)
  const [finished, setFinished] = useState(false)

  const category = getCategory(guide.categoryId)
  const symptomGroup = getSymptomGroup(category, guide.symptomGroupId)
  const modelNames = getModelNames(guide.supportedModels)
  const totalSteps = guide.steps.length
  const step = guide.steps[current]
  const isLast = current === totalSteps - 1

  const goNext = () => {
    if (isLast) {
      setFinished(true)
    } else {
      setCurrent((c) => c + 1)
    }
  }
  const goPrev = () => setCurrent((c) => Math.max(0, c - 1))

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 px-4 pb-3 pt-16 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
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
          {symptomGroup?.name}
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
            {modelNames.join(", ")}
          </p>
        </div>

        {finished ? (
          <FinishedCard onRestart={() => setFinished(false)} totalSteps={totalSteps} />
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Sticky contact bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-3 backdrop-blur">
        <div className="mx-auto max-w-lg">
          <a
            href="tel:1234"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 font-display text-base font-semibold text-accent-foreground shadow-sm transition-transform active:scale-[0.98]"
          >
            <Phone className="size-5" />
            ติดต่อฝ่ายเทคนิค
          </a>
        </div>
      </div>
    </div>
  )
}

function FinishedCard({
  onRestart,
  totalSteps,
}: {
  onRestart: () => void
  totalSteps: number
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <CheckCircle2 className="size-8" />
      </div>
      <h2 className="font-display text-lg font-semibold">ซ่อมเสร็จสมบูรณ์</h2>
      <p className="text-sm text-muted-foreground">
        คุณทำครบทั้ง {totalSteps} ขั้นตอนแล้ว หากยังพบปัญหา กรุณาติดต่อฝ่ายเทคนิค
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted"
      >
        <ArrowLeft className="size-4" />
        ดูขั้นตอนอีกครั้ง
      </button>
    </div>
  )
}
