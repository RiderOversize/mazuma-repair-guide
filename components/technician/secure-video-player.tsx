"use client"

import { Play, Lock } from "lucide-react"
import { WATERMARK_OWNER } from "@/lib/mock-data"

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
  const watermarkText = `ดูโดย: ${WATERMARK_OWNER} - ${VIEW_DATE}`

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 ring-1 ring-black/20">
      {/* Fake video surface */}
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

      {/* Diagonal repeating watermark layer */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <div className="absolute -inset-1/4 flex flex-col justify-center gap-14 rotate-[-45deg]">
          {Array.from({ length: 7 }).map((_, row) => (
            <div
              key={row}
              className="flex justify-center gap-14 whitespace-nowrap text-[11px] font-medium text-white/15"
            >
              {Array.from({ length: 4 }).map((_, col) => (
                <span key={col}>{watermarkText}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Unclickable transparent security overlay */}
      <div
        className="absolute inset-0 z-20 cursor-not-allowed"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        aria-hidden="true"
      />

      {/* Secure badge */}
      <div className="absolute left-3 top-3 z-30 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
        <Lock className="size-3" />
        เนื้อหามีลิขสิทธิ์
      </div>
    </div>
  )
}
