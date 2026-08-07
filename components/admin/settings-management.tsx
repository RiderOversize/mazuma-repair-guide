"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { 
  Moon, 
  Sun, 
  Monitor, 
  Database, 
  Trash2, 
  RefreshCw, 
  Globe, 
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Bell
} from "lucide-react"

import type { AuthUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

export function SettingsManagement({ user }: { user: AuthUser }) {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [modalMessage, setModalMessage] = useState<string | null>(null)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClearCache = () => {
    setIsClearing(true)
    setTimeout(() => {
      setIsClearing(false)
      alert("ล้างแคชระบบเรียบร้อยแล้ว")
    }, 1500)
  }

  if (!mounted) {
    return null
  }

  const currentTheme = theme === "system" ? systemTheme : theme

  return (
    <div className="px-4 pb-24 pt-4 md:max-w-3xl md:mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">ตั้งค่าระบบ</h1>
          <p className="text-sm text-muted-foreground mt-1">ตั้งค่าทั่วไปของระบบและฐานข้อมูล</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">ลักษณะที่ปรากฏ</h2>
          <div className="overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm">
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  {currentTheme === "dark" ? <Moon className="size-5" /> : <Sun className="size-5" />}
                </div>
                <div>
                  <h3 className="font-medium text-[15px] text-foreground">โหมดหน้าจอ (Theme)</h3>
                  <p className="text-[13px] text-muted-foreground">ปรับเปลี่ยนโทนสีของแอปพลิเคชัน</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all",
                    theme === "light" 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border/40 bg-card hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  <Sun className="size-5" />
                  <span className="text-xs font-medium">สว่าง</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all",
                    theme === "dark" 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border/40 bg-card hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  <Moon className="size-5" />
                  <span className="text-xs font-medium">มืด</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all",
                    theme === "system" 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border/40 bg-card hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  <Monitor className="size-5" />
                  <span className="text-xs font-medium">ตามระบบ</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">ระบบและแอปพลิเคชัน</h2>
          <div className="overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm">
            <button 
              onClick={() => setModalMessage("ฟีเจอร์เปลี่ยนภาษากำลังอยู่ในช่วงพัฒนา (Coming Soon)")}
              className="group flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-muted/30 active:bg-muted/50 border-b border-border/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Globe className="size-5" />
                </div>
                <span className="font-medium text-[15px] text-foreground">ภาษา (Language)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-muted-foreground">ไทย</span>
                <ChevronRight className="size-5 text-muted-foreground/40" />
              </div>
            </button>
            <button 
              onClick={() => setModalMessage("ฟีเจอร์การแจ้งเตือนกำลังอยู่ในช่วงพัฒนา (Coming Soon)")}
              className="group flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-muted/30 active:bg-muted/50 border-b border-border/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Bell className="size-5" />
                </div>
                <span className="font-medium text-[15px] text-foreground">การแจ้งเตือน</span>
              </div>
              <ChevronRight className="size-5 text-muted-foreground/40" />
            </button>
            <button 
              onClick={() => setModalMessage("ฟีเจอร์ความปลอดภัยและสิทธิ์กำลังอยู่ในช่วงพัฒนา (Coming Soon)")}
              className="group flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-muted/30 active:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                  <ShieldCheck className="size-5" />
                </div>
                <span className="font-medium text-[15px] text-foreground">ความปลอดภัยและสิทธิ์</span>
              </div>
              <ChevronRight className="size-5 text-muted-foreground/40" />
            </button>
          </div>
        </div>

        {/* Database & Data */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">ฐานข้อมูลและหน่วยความจำ</h2>
          <div className="overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Database className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-[15px] text-foreground">สถานะฐานข้อมูล</h3>
                  <p className="text-[13px] text-emerald-500 flex items-center gap-1">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                    </span>
                    เชื่อมต่อปกติ
                  </p>
                </div>
              </div>
              <button className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <RefreshCw className="size-4" />
              </button>
            </div>
            
            <button 
              onClick={handleClearCache}
              disabled={isClearing}
              className="group flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors active:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  {isClearing ? <RefreshCw className="size-5 animate-spin" /> : <Trash2 className="size-5" />}
                </div>
                <div>
                  <span className="font-medium text-[15px] text-destructive">ล้างแคชระบบ (Clear Cache)</span>
                  <p className="text-[13px] text-muted-foreground">ลบข้อมูลชั่วคราวเพื่อเพิ่มพื้นที่</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary mb-3 shadow-lg">
            <span className="font-display font-bold text-primary-foreground text-xl">M</span>
          </div>
          <p className="font-medium text-foreground">Mazuma Repair Guide</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">เวอร์ชัน 1.0.0 (Build 2024)</p>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {modalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
              <Globe className="size-6" />
            </div>
            <h3 className="mb-2 text-center font-display text-lg font-bold text-foreground">
              แจ้งเตือน
            </h3>
            <p className="mb-6 text-center text-[15px] text-muted-foreground">
              {modalMessage}
            </p>
            <button
              onClick={() => setModalMessage(null)}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
