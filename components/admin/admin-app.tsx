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
  Users,
  ChevronLeft,
} from "lucide-react"

export type AdminView = 
  | "dashboard"
  | "guides"
  | "master-data"
  | "create"
  | "models"
  | "media"
  | "users"
  | "settings"
  | "preview"

import { AdminDashboard } from "./admin-dashboard"
import { UserManagement } from "./user-management"
import { ModelsManagement } from "./models-management"
import { GuidesManagement } from "./guides-management"
import { MasterDataManagement } from "./master-data"
import { MediaLibrary } from "./media-library"
import { SettingsManagement } from "./settings-management"
import { TechnicianApp } from "@/components/technician/technician-app"
import { UserMenu } from "@/components/user-menu"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/lib/auth"

const topNavItems = [
  { id: "dashboard", label: "ภาพรวม", icon: LayoutDashboard },
  { id: "guides", label: "คู่มือ", icon: BookOpen },
  { id: "master-data", label: "จัดการข้อมูล", icon: Boxes },
  { id: "more", label: "เพิ่มเติม", icon: Menu },
]

const moreItems = [
  { id: "models", label: "จัดการรุ่นสินค้า", icon: Smartphone, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "media", label: "คลังสื่อ (Media)", icon: LayoutDashboard, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "users", label: "ผู้ใช้งานและสิทธิ์", icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "settings", label: "ตั้งค่าระบบ", icon: Menu, color: "text-gray-500", bg: "bg-gray-500/10" },
  { id: "preview", label: "ดูหน้าแอปช่าง", icon: Smartphone, color: "text-pink-500", bg: "bg-pink-500/10" },
]

export function AdminApp({
  user,
  onLogout,
}: {
  user: AuthUser
  onLogout: () => void
}) {
  const allowedMenus = user.accessibleMenus || [];
  const hasAccess = (menuId: string) => {
    if (menuId === "more") return true;
    if (user.role === "admin" && allowedMenus.length === 0) return true;
    return allowedMenus.includes(menuId);
  }

  const availableTopNavItems = topNavItems.filter(item => hasAccess(item.id));
  const availableMoreItems = moreItems.filter(item => hasAccess(item.id));
  if (availableMoreItems.length === 0) {
    const moreIdx = availableTopNavItems.findIndex(i => i.id === "more");
    if (moreIdx > -1) availableTopNavItems.splice(moreIdx, 1);
  }

  const [view, setView] = useState<AdminView | "more">(() => {
    if (user.role === "admin" && allowedMenus.length === 0) return "dashboard";
    if (allowedMenus.includes("dashboard")) return "dashboard";
    if (allowedMenus.length > 0) return allowedMenus[0] as AdminView;
    return "dashboard";
  })
  const [editGuideId, setEditGuideId] = useState<string | null>(null)
  const [guidesSearch, setGuidesSearch] = useState("")
  const [guidesInitialModelId, setGuidesInitialModelId] = useState<string | undefined>()
  const [masterDataSubView, setMasterDataSubView] = useState<string>("mainMenu")

  const go = (v: AdminView | "more") => {
    setView(v)
    if (v !== "create") setEditGuideId(null)
    if (v !== "guides") setGuidesSearch("")
  }

  const handleNavigateToGuides = (search: string) => {
    setGuidesSearch(search)
    setGuidesInitialModelId(undefined)
    setView("guides")
  }

  const handleNavigateToCreateGuideForModel = (modelId: string) => {
    setGuidesSearch("")
    setGuidesInitialModelId(modelId)
    setView("guides")
  }

  const handleNavigateTo = (targetView: AdminView, subView?: string) => {
    if (targetView === "master-data" && subView) {
      setMasterDataSubView(subView)
    }
    setView(targetView)
  }

  const handleCreateGuide = () => {
    setEditGuideId(null)
    setView("create")
  }

  const handleEditGuide = (id: string) => {
    setEditGuideId(id)
    setView("create")
  }

  // Full-screen technician preview
  if (view === "preview") {
    return (
      <TechnicianApp
        user={user}
        preview
        onExitPreview={() => setView("dashboard")}
      />
    )
  }

  const renderContent = () => {
    if (view === "more") {
      return (
        <div className="px-4 pb-24 pt-14">
          <h2 className="mb-4 text-2xl font-display font-bold text-foreground">เมนูเพิ่มเติม</h2>
          
          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-card border border-border/40 p-4 shadow-sm">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-full">
              <Image src={user.avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="48px" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-foreground">{user.name}</p>
              <p className="truncate text-[13px] text-muted-foreground">{user.title}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm">
            {availableMoreItems.map((item, i) => {
              const isLast = i === availableMoreItems.length - 1;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id as AdminView)}
                  className={`group flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors active:bg-muted/50 ${!isLast ? 'border-b border-border/40' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", item.bg, item.color)}>
                      <Icon className="size-5" />
                    </div>
                    <span className="font-medium text-[15px] text-foreground">{item.label}</span>
                  </div>
                  <ChevronLeft className="size-5 rotate-180 text-muted-foreground/40" />
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div className="pb-24 pt-4">
        {view === "dashboard" && <AdminDashboard user={user} onCreate={handleCreateGuide} onNavigateToGuides={handleNavigateToGuides} onNavigateTo={handleNavigateTo} onNavigateToCreateGuideForModel={handleNavigateToCreateGuideForModel} />}
        {view === "guides" && <GuidesManagement key={guidesInitialModelId || 'guides'} user={user} initialSearch={guidesSearch} initialModelId={guidesInitialModelId} />}
        {view === "models" && <ModelsManagement user={user} />}
        {view === "master-data" && <MasterDataManagement user={user} initialView={masterDataSubView} />}
        {view === "media" && <MediaLibrary user={user} />}
        {view === "users" && <UserManagement user={user} />}
        {view === "settings" && <SettingsManagement user={user} />}
      </div>
    )
  }

  // Which bottom tab is active
  const activeTab = view === "more" || availableTopNavItems.some(t => t.id === view) ? view : "more";

  return (
    <div className="min-h-screen bg-background flex justify-center overflow-hidden">
      <div className="w-full max-w-[480px] bg-background h-[100dvh] relative shadow-2xl sm:border-x border-border/40 flex flex-col">
        {/* Mobile top bar (only if not in 'more' view to save space) */}
        {view !== "more" && (
          <div className="flex-none z-40 flex items-center justify-between border-b border-border/40 bg-background/95 px-4 py-3 pt-safe backdrop-blur-2xl">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground shadow-sm">
                M
              </div>
              <span className="font-display font-semibold text-foreground">Mazuma Admin</span>
            </div>
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </main>

        {/* Bottom Tab Bar */}
        <div className="absolute bottom-0 inset-x-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-2xl pb-safe">
          <div className="flex items-center justify-around px-2 py-1 max-w-[480px] mx-auto h-14">
            {availableTopNavItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => go(item.id as AdminView | "more")}
                  className={`flex flex-col items-center justify-center gap-1 w-[20%] h-full transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className={`size-6 ${isActive ? "fill-primary/20" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlaceholderView({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/30 px-4 text-center mx-4 mt-6">
      <h2 className="mb-2 font-display text-xl font-semibold">{title}</h2>
      <p className="text-[13px] text-muted-foreground">{desc}</p>
    </div>
  )
}
