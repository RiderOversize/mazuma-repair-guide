"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { TechnicianHome } from "./technician-home"
import { SymptomList } from "./symptom-list"
import { GuideWizard } from "./guide-wizard"
import { UserMenu } from "@/components/user-menu"
import { getCategory, type DeviceModel, type Guide } from "@/lib/mock-data"
import type { AuthUser } from "@/lib/auth"

type View = "home" | "symptoms" | "guide"

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

  return (
    <div className="min-h-screen bg-background">
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
        <div className="fixed right-4 top-3 z-[70]">
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      ) : null}

      {view === "home" && (
        <TechnicianHome
          onSelectCategory={(id) => {
            setCategoryId(id)
            setModel(null)
            setView("symptoms")
          }}
          onSelectModel={(m) => {
            setModel(m)
            setCategoryId(m.categoryId)
            setView("symptoms")
          }}
        />
      )}

      {view === "symptoms" && category && (
        <SymptomList
          category={category}
          model={model}
          onBack={() => setView("home")}
          onSelectGuide={(g) => {
            setGuide(g)
            setView("guide")
          }}
        />
      )}

      {view === "guide" && guide && (
        <GuideWizard guide={guide} onBack={() => setView("symptoms")} />
      )}
    </div>
  )
}
