import { WATERMARK_OWNER } from "@/lib/mock-data"

/**
 * Global fixed watermark shown across every view of the prototype.
 * Kept subtle and non-interactive so it never blocks the UI.
 */
export function GlobalWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-2 right-2 z-[60] select-none rounded-full bg-foreground/5 px-2.5 py-1 text-[10px] font-medium leading-none text-muted-foreground/70 backdrop-blur-sm"
    >
      Designed for: {WATERMARK_OWNER}
    </div>
  )
}
