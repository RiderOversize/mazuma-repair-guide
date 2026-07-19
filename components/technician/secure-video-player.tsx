"use client"

import { useState } from "react"
import { Play, Lock, FileText, Video } from "lucide-react"

const VIEW_DATE = "10 ก.ค. 2026"

/**
 * Secure video player mock.
 * - Fake embed (no real controls / no download path)
 * - Transparent overlay at z-20 blocks all clicks & right-click
 * - Repeated -45deg watermark identifies the current viewer
 */
export function SecureVideoPlayer({
  stepNum,
  label,
}: {
  stepNum: number
  label?: string
}) {
  const [activeTab, setActiveTab] = useState<"video" | "pdf">("video")

  return (
    <div className="flex flex-col gap-3">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 rounded-xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setActiveTab("video")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
            activeTab === "video"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
          }`}
        >
          <Video className="size-4" />
          วิดีโอ
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pdf")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
            activeTab === "pdf"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
          }`}
        >
          <FileText className="size-4" />
          เอกสาร PDF
        </button>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 ring-1 ring-black/20">
        {activeTab === "video" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-800 to-slate-950">
            <div className="flex size-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Play className="size-7 translate-x-0.5 fill-white/90 text-white/90" />
            </div>
            <p className="text-sm font-medium text-white/80">
              วิดีโอขั้นตอนที่ {stepNum}
            </p>
            {label ? (
              <p className="max-w-[80%] text-center text-xs text-white/50">{label}</p>
            ) : null}

            {/* Fake progress / control bar (non-functional visual only) */}
            <div className="absolute inset-x-4 bottom-3">
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-1/3 rounded-full bg-white/70" />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/50">
                <span>00:42</span>
                <span>02:15</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200">
            <FileText className="size-16 text-slate-400" />
            <p className="text-sm font-medium text-slate-600">
              เอกสารขั้นตอนที่ {stepNum}
            </p>
            {label ? (
              <p className="max-w-[80%] text-center text-xs text-slate-500">{label}</p>
            ) : null}
            <button className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90">
              แตะเพื่อเปิด PDF
            </button>
          </div>
        )}

        {/* Secure badge */}
        <div className="absolute left-3 top-3 z-30 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
          <Lock className="size-3" />
          เนื้อหามีลิขสิทธิ์
        </div>
      </div>
    </div>
  )
}
