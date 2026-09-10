"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface DiscontinuedCornerRibbonProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function DiscontinuedCornerRibbon({
  size = "md",
  className,
  text = "ยกเลิกผลิต",
}: DiscontinuedCornerRibbonProps) {
  if (size === "lg") {
    return (
      <div
        className={cn(
          "absolute top-0 right-0 size-24 overflow-hidden pointer-events-none z-20 select-none",
          className
        )}
        aria-label={text}
      >
        <div
          className={cn(
            "absolute top-[17px] -right-[27px] w-[120px] rotate-45 text-center py-1",
            "bg-gradient-to-r from-red-500/15 via-red-500/25 to-red-500/15",
            "dark:from-red-950/90 dark:via-red-900/90 dark:to-red-950/90",
            "backdrop-blur-md border-y border-red-500/40 dark:border-red-500/60",
            "shadow-[0_2px_8px_rgba(239,68,68,0.2)]"
          )}
        >
          <span className="block text-[10px] font-black tracking-widest text-red-600 dark:text-red-400">
            {text}
          </span>
        </div>
      </div>
    )
  }

  // size === "sm" or "md" for cards
  const isSm = size === "sm"

  return (
    <div
      className={cn(
        "absolute top-0 right-0 pointer-events-none overflow-hidden z-10 select-none",
        isSm ? "size-16" : "size-20",
        className
      )}
      aria-label={text}
    >
      <div
        className={cn(
          "absolute rotate-45 text-center",
          isSm
            ? "top-[9px] -right-[21px] w-[86px] py-0.5"
            : "top-[12px] -right-[23px] w-[96px] py-0.5",
          "bg-gradient-to-r from-red-500/15 via-red-500/25 to-red-500/15",
          "dark:from-red-950/90 dark:via-red-900/90 dark:to-red-950/90",
          "backdrop-blur-xs border-y border-red-500/40 dark:border-red-500/60",
          "shadow-[0_2px_6px_rgba(239,68,68,0.18)]"
        )}
      >
        <span
          className={cn(
            "block font-black tracking-wider text-red-600 dark:text-red-400 leading-tight",
            isSm ? "text-[8px]" : "text-[9px]"
          )}
        >
          {text}
        </span>
      </div>
    </div>
  )
}
