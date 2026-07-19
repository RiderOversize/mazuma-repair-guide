"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Home, ChevronLeft } from "lucide-react"
import { TechnicianHome } from "./technician-home"
import { SymptomList } from "./symptom-list"
import { GuideWizard } from "./guide-wizard"
import { UserMenu } from "@/components/user-menu"
import { ModelList } from "./model-list"
import { getCategory, type DeviceModel, type Guide } from "@/lib/mock-data"
import { logSessionActivity } from "@/lib/data-service"
import type { AuthUser } from "@/lib/auth"

type View = "home" | "models" | "symptoms" | "guide"

export function TechnicianApp({
  user,
  onLogout,
  preview = false,
  onExitPreview,
}: {
  user: AuthUser
  onLogout?: () => void
  preview?: boolean
  onExitPreview?: () => void
}) {
  const [view, setView] = useState<View>("home")
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [model, setModel] = useState<DeviceModel | null>(null)
  const [guide, setGuide] = useState<Guide | null>(null)

  const category = categoryId ? getCategory(categoryId) : undefined

  useEffect(() => {
    if (preview) return
    let action = "หน้าหลัก"
    if (view === "models" && category) {
      action = `กำลังเลือกรุ่นในหมวด: ${category.name}`
    } else if (view === "symptoms" && category) {
      action = `กำลังค้นหาอาการ: ${model ? model.name : category.name}`
    }
    
    if (view !== "guide") {
      logSessionActivity(user.employeeCode, user.name, action).catch(console.error)
    }
  }, [view, category, model, preview, user])

  const handleBack = () => {
    if (view === "models") setView("home")
    else if (view === "symptoms") setView(model ? "models" : "home")
    else if (view === "guide") setView("symptoms")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top-right account control (hidden in admin preview) */}
      {preview ? (
        <div className="fixed inset-x-0 top-0 z-[70] flex items-center justify-between gap-3 border-b border-border bg-primary px-4 py-2.5 text-primary-foreground">
          <span className="text-sm font-medium">กำลังดูตัวอย่างแอปช่าง</span>
          <button
            type="button"
            onClick={onExitPreview}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm font-medium hover:bg-primary-foreground/25"
          >
            <ArrowLeft className="size-4" />
            กลับสู่แอดมิน
          </button>
        </div>
      ) : onLogout ? (
        <div className="fixed right-4 top-4 z-[100]">
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      ) : null}

      {view === "home" && (
        <TechnicianHome
          onSelectCategory={(id) => {
            setCategoryId(id)
            setModel(null)
            setView("models")
          }}
          onSelectModel={(m) => {
            setModel(m)
            setCategoryId(m.categoryId)
            setView("symptoms")
          }}
        />
      )}

      {view === "models" && category && (
        <ModelList 
          category={category}
          onBack={() => setView("home")}
          onSelectModel={(m) => {
            setModel(m)
            setView("symptoms")
          }}
        />
      )}

      {view === "symptoms" && category && (
        <SymptomList
          category={category}
          model={model}
          onBack={() => setView(model ? "models" : "home")}
          onSelectGuide={(g) => {
            setGuide(g)
            setView("guide")
          }}
        />
      )}

      {view === "guide" && guide && (
        <GuideWizard 
          guide={guide} 
          user={user}
          model={model}
          onBack={() => setView("symptoms")} 
        />
      )}

      {/* Bottom Navigation for Mobile */}
      {view !== "home" && (
        <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/80 backdrop-blur-md pb-safe sm:hidden">
          <div className="flex items-center justify-around p-3 max-w-lg mx-auto">
            <button
              onClick={handleBack}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors flex-1"
            >
              <ChevronLeft className="size-5" />
              <span className="text-[10px] font-medium">ย้อนกลับ</span>
            </button>
            <div className="w-px h-8 bg-border"></div>
            <button
              onClick={() => setView("home")}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors flex-1"
            >
              <Home className="size-5" />
              <span className="text-[10px] font-medium">หน้าแรก</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
