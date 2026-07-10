"use client"

import { useState } from "react"
import Image from "next/image"
import { LogOut, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/lib/auth"

export function UserMenu({
  user,
  onLogout,
  tone = "light",
}: {
  user: AuthUser
  onLogout: () => void
  tone?: "light" | "dark"
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 text-sm transition-colors",
          tone === "dark"
            ? "border-sidebar-border bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80"
            : "border-border bg-card text-foreground shadow-sm hover:bg-muted",
        )}
      >
        <span className="relative size-7 shrink-0 overflow-hidden rounded-full">
          <Image src={user.avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="28px" />
        </span>
        <span className="hidden max-w-[8rem] truncate font-medium sm:inline">{user.name}</span>
        <ChevronDown className="size-4 opacity-60" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[80] cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-[90] w-56 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
                <Image src={user.avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="40px" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">LINE: {user.lineName}</p>
              </div>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              ออกจากระบบ
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
