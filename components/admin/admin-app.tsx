"use client"

import { useState } from "react"
import Image from "next/image"
import {
  LayoutDashboard,
  FilePlus2,
  BookOpen,
  Boxes,
  Smartphone,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { AdminDashboard } from "./admin-dashboard"
import { GuideForm } from "./guide-form"
import { TechnicianApp } from "@/components/technician/technician-app"
import { UserMenu } from "@/components/user-menu"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/lib/auth"

type AdminView = "dashboard" | "create" | "guides" | "models" | "preview"

const nav: { id: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "ภาพรวม", icon: LayoutDashboard },
  { id: "create", label: "สร้างคู่มือ", icon: FilePlus2 },
  { id: "guides", label: "คู่มือทั้งหมด", icon: BookOpen },
  { id: "models", label: "รุ่นสินค้า", icon: Boxes },
  { id: "preview", label: "ดูหน้าแอปช่าง", icon: Smartphone },
]

export function AdminApp({
  user,
  onLogout,
}: {
  user: AuthUser
  onLogout: () => void
}) {
  const [view, setView] = useState<AdminView>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const go = (v: AdminView) => {
    setView(v)
    setSidebarOpen(false)
  }

  // Full-screen technician preview, rendered outside the admin chrome
  if (view === "preview") {
    return (
      <TechnicianApp
        user={user}
        preview
        onExitPreview={() => setView("dashboard")}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3 pt-3 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted"
          aria-label="เปิดเมนู"
        >
          <Menu className="size-5" />
        </button>
        <span className="font-display font-semibold">Mazuma Admin</span>
        <UserMenu user={user} onLogout={onLogout} />
      </div>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary font-display text-lg font-bold text-sidebar-primary-foreground">
              M
            </div>
            <div>
              <p className="font-display text-sm font-semibold leading-tight">Mazuma Admin</p>
              <p className="text-xs text-sidebar-foreground/60">ระบบจัดการคู่มือ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 hover:bg-sidebar-accent lg:hidden"
            aria-label="ปิดเมนู"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {nav.map((item) => {
            const Icon = item.icon
            const active = view === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
                <span className="relative size-8 shrink-0 overflow-hidden rounded-full">
                  <Image src={user.avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="32px" />
                </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 pt-6 lg:px-8 lg:pt-8">
        {/* Desktop top-right account control */}
        <div className="mb-4 hidden justify-end lg:flex">
          <UserMenu user={user} onLogout={onLogout} />
        </div>
        {view === "dashboard" && <AdminDashboard onCreate={() => setView("create")} />}
        {view === "create" && <GuideForm />}
        {view === "guides" && <AdminDashboard onCreate={() => setView("create")} />}
        {view === "models" && <ModelsPlaceholder />}
      </main>
    </div>
  )
}

function ModelsPlaceholder() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-display text-2xl font-semibold">รุ่นสินค้า</h1>
      <p className="text-sm text-muted-foreground">
        จัดการรุ่นสินค้าในแต่ละประเภท (ส่วนนี้อยู่ระหว่างการพัฒนาในต้นแบบ)
      </p>
    </div>
  )
}
