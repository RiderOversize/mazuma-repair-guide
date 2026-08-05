"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { LogOut, ChevronDown, User, Shield, X } from "lucide-react"
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 rounded-full border p-1 pr-3 text-sm transition-transform active:scale-95 shadow-sm",
          tone === "dark"
            ? "border-sidebar-border bg-sidebar-accent text-sidebar-foreground"
            : "border-border bg-card text-foreground",
        )}
      >
        <span className="relative size-8 shrink-0 overflow-hidden rounded-full ring-2 ring-background">
          <Image src={user.avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="32px" />
        </span>
        <div className="flex flex-col items-start min-w-0">
          <span className="max-w-[5rem] sm:max-w-[8rem] truncate font-bold text-[13px] leading-tight">{user.name}</span>
          <span className="text-[10px] text-muted-foreground font-medium">{user.role.toUpperCase()}</span>
        </div>
        <ChevronDown className="size-4 opacity-50 shrink-0" />
      </button>

      {/* Mobile Bottom Sheet Modal */}
      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setOpen(false)}
          />
          
          {/* Sheet */}
          <div className="relative z-10 w-full max-w-[480px] mx-auto bg-card rounded-t-[32px] border-t border-border/50 shadow-[0_-8px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-full duration-300 pt-3 pb-8 px-5 supports-[backdrop-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-xl pt-safe pb-safe-offset-4">
            {/* Pull indicator */}
            <div className="mx-auto w-12 h-1.5 rounded-full bg-border mb-6" />
            
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-display text-xl font-bold">บัญชีผู้ใช้</h2>
              <button 
                onClick={() => setOpen(false)}
                className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground active:scale-95 transition-all"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 mb-6">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-full ring-4 ring-background shadow-sm">
                <Image src={user.avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="64px" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[18px] font-bold text-foreground">{user.name}</p>
                <p className="truncate text-[13px] text-muted-foreground mt-0.5">{user.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    <Shield className="size-3" />
                    {user.role.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-muted-foreground">ID: {user.employeeCode}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/40 bg-card">
                 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <User className="size-5" />
                 </div>
                 <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">บัญชี LINE ที่เชื่อมต่อ</p>
                    <p className="text-[14px] font-bold text-foreground">{user.lineName || "ไม่ได้ระบุ"}</p>
                 </div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onLogout()
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive active:scale-[0.98] transition-transform mt-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                     <LogOut className="size-5" />
                  </div>
                  <span className="font-bold text-[15px]">ออกจากระบบ</span>
                </div>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
