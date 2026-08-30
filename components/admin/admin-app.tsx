"use client"

import { useState } from "react"
import Image from "next/image"
import {
  LayoutDashboard,
  FilePlus2,
  BookOpen,
  Database,
  Smartphone,
  Menu,
  X,
  LogOut,
  Users,
  ChevronLeft,
  Settings,
  Image as ImageIcon,
  MonitorSmartphone,
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
import { UserManagement, getEffectiveMenus } from "./user-management"
import { ModelsManagement } from "./models-management"
import { GuidesManagement } from "./guides-management"
import { MasterDataManagement } from "./master-data"
import { MediaLibrary } from "./media-library"
import { SettingsManagement } from "./settings-management"
import { TechnicianApp } from "@/components/technician/technician-app"
import { UserMenu } from "@/components/user-menu"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/lib/auth"
import { getUsers } from "@/lib/data-service"
import { showToast } from "@/lib/swal"
import { useEffect } from "react"
import { ShieldAlert } from "lucide-react"

const topNavItems = [
  { id: "dashboard", label: "ภาพรวม", icon: LayoutDashboard },
  { id: "guides", label: "คู่มือและรุ่นสินค้า", icon: BookOpen },
  { id: "master-data", label: "จัดการข้อมูล", icon: Database },
  { id: "more", label: "เพิ่มเติม", icon: Menu },
]

const moreItems = [
  { id: "media", label: "คลังสื่อ (Media)", icon: ImageIcon, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "users", label: "ผู้ใช้งานและสิทธิ์", icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "settings", label: "ตั้งค่าระบบ", icon: Settings, color: "text-gray-500", bg: "bg-gray-500/10" },
  { id: "preview", label: "ดูหน้าแอปช่าง", icon: MonitorSmartphone, color: "text-pink-500", bg: "bg-pink-500/10" },
]

export function AdminApp({
  user: initialUser,
  onLogout,
}: {
  user: AuthUser
  onLogout: () => void
}) {
  const [user, setUser] = useState<AuthUser>(initialUser);

  // Sync fresh permissions from server on mount
  useEffect(() => {
    async function syncPermissions() {
      try {
        const allUsers = await getUsers();
        const fresh = allUsers.find(u => u.employeeCode === initialUser.employeeCode);
        if (fresh) {
          setUser(fresh);
        }
      } catch (err) {
        console.error("Failed to sync fresh user permissions:", err);
      }
    }
    syncPermissions();
  }, [initialUser.employeeCode]);

  const effectiveMenus = getEffectiveMenus(user);

  const hasAccess = (menuId: string) => {
    if (menuId === "more") return true;
    if (menuId === "create" || menuId === "models") return hasAccess("guides");
    if (menuId === "guides") {
      return effectiveMenus.includes("guides") || effectiveMenus.includes("models");
    }
    return effectiveMenus.includes(menuId);
  }

  const availableTopNavItems = topNavItems.filter(item => hasAccess(item.id));
  const availableMoreItems = moreItems.filter(item => hasAccess(item.id));
  if (availableMoreItems.length === 0) {
    const moreIdx = availableTopNavItems.findIndex(i => i.id === "more");
    if (moreIdx > -1) availableTopNavItems.splice(moreIdx, 1);
  }

  const [view, setView] = useState<AdminView | "more">(() => {
    const eff = getEffectiveMenus(initialUser);
    if (eff.includes("dashboard")) return "dashboard";
    if (eff.length > 0) {
      const first = eff.find(id => id !== "dashboard") || eff[0];
      if (first) return first as AdminView;
    }
    return "more";
  })
  const [editGuideId, setEditGuideId] = useState<string | null>(null)
  const [guidesSearch, setGuidesSearch] = useState("")
  const [guidesInitialModelId, setGuidesInitialModelId] = useState<string | undefined>()
  const [masterDataSubView, setMasterDataSubView] = useState<string>("mainMenu")
  const [resetKey, setResetKey] = useState(0)

  const [globalBack, setGlobalBack] = useState<(() => void) | null>(null)
  
  const go = (v: AdminView | "more") => {
    if (v !== "more" && !hasAccess(v)) {
      showToast("คุณไม่มีสิทธิ์เข้าถึงเมนูนี้", "warning");
      return;
    }
    if (view === v) {
      setResetKey(prev => prev + 1)
      if (v === "master-data") setMasterDataSubView("mainMenu")
    } else {
      setView(v)
    }
    if (v !== "create") setEditGuideId(null)
    if (v !== "guides") setGuidesSearch("")
  }

  const handleNavigateToGuides = (search: string) => {
    if (!hasAccess("guides")) {
      showToast("คุณไม่มีสิทธิ์เข้าถึงเมนูนี้", "warning");
      return;
    }
    setGuidesSearch(search)
    setGuidesInitialModelId(undefined)
    setView("guides")
  }

  const handleNavigateToCreateGuideForModel = (modelId: string) => {
    if (!hasAccess("guides")) {
      showToast("คุณไม่มีสิทธิ์เข้าถึงเมนูนี้", "warning");
      return;
    }
    setGuidesSearch("")
    setGuidesInitialModelId(modelId)
    setView("guides")
  }

  const handleNavigateTo = (targetView: AdminView, subView?: string) => {
    if (!hasAccess(targetView)) {
      showToast("คุณไม่มีสิทธิ์เข้าถึงเมนูนี้", "warning");
      return;
    }
    if (targetView === "master-data" && subView) {
      setMasterDataSubView(subView)
    }
    setView(targetView)
  }

  const handleCreateGuide = () => {
    if (!hasAccess("guides")) {
      showToast("คุณไม่มีสิทธิ์เข้าถึงเมนูนี้", "warning");
      return;
    }
    setEditGuideId(null)
    setView("create")
  }

  const handleEditGuide = (id: string) => {
    if (!hasAccess("guides")) {
      showToast("คุณไม่มีสิทธิ์เข้าถึงเมนูนี้", "warning");
      return;
    }
    setEditGuideId(id)
    setView("create")
  }

  // Full-screen technician preview
  if (view === "preview") {
    return (
      <TechnicianApp
        user={user}
        preview
        onExitPreview={() => {
          if (hasAccess("dashboard")) setView("dashboard");
          else if (effectiveMenus.length > 0) setView(effectiveMenus[0] as AdminView);
          else setView("more");
        }}
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
              <p className="truncate text-[0.9375rem] font-bold text-foreground">{user.name}</p>
              <p className="truncate text-[0.8125rem] text-muted-foreground">{user.title}</p>
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
                    <span className="font-medium text-[0.9375rem] text-foreground">{item.label}</span>
                  </div>
                  <ChevronLeft className="size-5 rotate-180 text-muted-foreground/40" />
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    if (!hasAccess(view)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
            <ShieldAlert className="size-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">ไม่ได้รับอนุญาตให้เข้าถึง</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            บัญชีของคุณไม่ได้รับสิทธิ์ในการใช้งานเมนูนี้ กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์เพิ่มเติม
          </p>
          <button
            onClick={() => {
              if (hasAccess("dashboard")) setView("dashboard");
              else if (effectiveMenus.length > 0) setView(effectiveMenus[0] as AdminView);
              else setView("more");
            }}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            กลับหน้าหลัก
          </button>
        </div>
      )
    }

    return (
      <div className="pb-24 pt-4">
        {view === "dashboard" && <AdminDashboard key={resetKey} user={user} onCreate={handleCreateGuide} onNavigateToGuides={handleNavigateToGuides} onNavigateTo={handleNavigateTo} onNavigateToCreateGuideForModel={handleNavigateToCreateGuideForModel} />}
        {(view === "guides" || view === "models") && <GuidesManagement key={`guides-${guidesInitialModelId || 'none'}-${resetKey}`} user={user} initialSearch={guidesSearch} initialModelId={guidesInitialModelId} setGlobalBack={setGlobalBack} />}
        {view === "master-data" && <MasterDataManagement key={resetKey} user={user} initialView={masterDataSubView} setGlobalBack={setGlobalBack} />}
        {view === "media" && <MediaLibrary key={resetKey} user={user} />}
        {view === "users" && <UserManagement key={resetKey} user={user} setGlobalBack={setGlobalBack} onLogout={onLogout} onUserUpdate={(updated) => setUser(updated)} />}
        {view === "settings" && <SettingsManagement key={resetKey} user={user} />}
      </div>
    )
  }

  // Which bottom tab is active
  const activeTab = view === "more" || availableTopNavItems.some(t => t.id === view) ? view : "more";

  return (
    <div className="min-h-screen bg-background flex justify-center overflow-hidden">
      <div className="w-full md:max-w-none max-w-[480px] bg-background h-[100dvh] relative md:shadow-none shadow-2xl md:border-none sm:border-x border-border/40 flex flex-col md:flex-row">
        
        {/* Sidebar for PC/Tablet */}
        <div className="hidden md:flex flex-col md:w-[80px] lg:w-64 border-r border-border/40 bg-card z-50 shrink-0 transition-all duration-300">
          <div className="flex items-center gap-3 p-4 border-b border-border/40 h-16 shrink-0 justify-center lg:justify-start">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground shadow-sm">
              M
            </div>
            <span className="font-display font-semibold text-foreground hidden lg:block whitespace-nowrap">Mazuma Admin</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-2 custom-scrollbar">
            {(() => {
              const allItems = [
                ...topNavItems.filter(item => item.id !== "more" && hasAccess(item.id)),
                ...moreItems.filter(item => hasAccess(item.id))
              ];
              return allItems.map(item => {
                const Icon = item.icon;
                const isActive = view === item.id || (view === "create" && item.id === "guides");
                return (
                  <button
                    key={item.id}
                    onClick={() => go(item.id as AdminView)}
                    title={item.label}
                    className={`group flex items-center w-full rounded-xl transition-all ${isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'} justify-center h-12 px-0 lg:justify-start lg:h-auto lg:py-2.5 lg:px-3 lg:gap-3`}
                  >
                    <Icon className="size-5 shrink-0" />
                    <span className="font-medium text-sm hidden lg:block whitespace-nowrap">{item.label}</span>
                  </button>
                )
              });
            })()}
          </div>
          
          <div className="border-t border-border/40 p-3 lg:p-4 shrink-0 flex flex-col lg:flex-row items-center gap-4 lg:gap-3">
            <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
              <Image src={user.avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="40px" />
            </span>
            <div className="min-w-0 flex-1 text-left hidden lg:block">
              <p className="truncate text-sm font-bold text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.title}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex size-10 lg:size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="size-5 lg:size-4" />
            </button>
          </div>
        </div>

        {/* Mobile top bar (only if not in 'more' view to save space) */}
        {view !== "more" && (
          <div className="flex-none z-40 flex md:hidden items-center justify-between border-b border-border/40 bg-background/95 px-4 py-3 pt-safe backdrop-blur-2xl">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground shadow-sm">
                M
              </div>
              <span className="font-display font-semibold text-foreground">Mazuma Admin</span>
            </div>
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          {/* PC Header - Global Back Button Support */}
          <div className="hidden md:flex h-16 border-b border-border/40 items-center px-6 sticky top-0 bg-background/95 backdrop-blur-sm z-30">
            {globalBack ? (
              <button
                onClick={globalBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
              >
                <ChevronLeft className="size-5" />
                ย้อนกลับ
              </button>
            ) : (
              <h2 className="font-display font-semibold text-lg text-foreground">
                {view === "dashboard" ? "ภาพรวม" :
                 view === "guides" ? "คู่มือ" :
                 view === "create" ? (editGuideId ? "แก้ไขคู่มือ" : "สร้างคู่มือ") :
                 view === "master-data" ? "จัดการข้อมูล" :
                 view === "models" ? "จัดการรุ่นสินค้า" :
                 view === "media" ? "คลังสื่อ (Media)" :
                 view === "users" ? "ผู้ใช้งานและสิทธิ์" :
                 view === "settings" ? "ตั้งค่าระบบ" : ""}
              </h2>
            )}
          </div>
          {renderContent()}
        </main>

        {/* Bottom Tab Bar (Mobile Only) */}
        <div className="absolute md:hidden bottom-0 inset-x-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-2xl pb-safe">
          <div className="flex items-center justify-around px-2 py-1 max-w-[480px] mx-auto h-14">
            {(globalBack || (view !== "dashboard" && view !== "more")) && (
              <button
                onClick={() => {
                  if (globalBack) globalBack();
                  else if (availableMoreItems.some(i => i.id === view)) go("more");
                  else go("dashboard");
                }}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-foreground transition-colors"
              >
                <ChevronLeft className="size-6" strokeWidth={2} />
                <span className="text-[0.625rem] font-medium tracking-wide">ย้อนกลับ</span>
              </button>
            )}
            {availableTopNavItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => go(item.id as AdminView | "more")}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className={`size-6 ${isActive ? "fill-primary/20" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[0.625rem] font-medium tracking-wide">{item.label}</span>
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
      <p className="text-[0.8125rem] text-muted-foreground">{desc}</p>
    </div>
  )
}
