"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Home, ChevronLeft } from "lucide-react"
import { TechnicianHome } from "./technician-home"
import { SymptomList } from "./symptom-list"
import { GuideWizard } from "./guide-wizard"
import { UserMenu } from "@/components/user-menu"
import { SubCategoryList } from "./subcategory-list"
import { ModelList } from "./model-list"
import { type Category, type DeviceModel, type Guide, type SubCategory, type SymptomType, type Symptom } from "@/lib/mock-data"
import { logSessionActivity, getCategories, getModels, getGuides, getSubCategories, getSymptomTypes, getSymptoms } from "@/lib/data-service"
import type { AuthUser } from "@/lib/auth"

type View = "home" | "subcategories" | "models" | "symptoms" | "guide"

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
  const [subCategoryId, setSubCategoryId] = useState<string | null>(null)
  const [model, setModel] = useState<DeviceModel | null>(null)
  const [guide, setGuide] = useState<Guide | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, mods, gds, subCats, symTypes, syms] = await Promise.all([
          getCategories(),
          getModels(),
          getGuides(),
          getSubCategories(),
          getSymptomTypes(),
          getSymptoms()
        ])
        setCategories(cats)
        setModels(mods)
        setGuides(gds)
        setSubCategories(subCats)
        setSymptomTypes(symTypes)
        setSymptoms(syms)
      } catch (error) {
        console.error("Failed to load technician data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const category = categoryId ? categories.find(c => c.id === categoryId) : undefined

  useEffect(() => {
    if (preview) return
    let action = "หน้าหลัก"
    if (view === "subcategories" && category) {
      action = `กำลังเลือกประเภทย่อยในหมวด: ${category.name}`
    } else if (view === "models" && category) {
      action = `กำลังเลือกรุ่นในหมวด: ${category.name}`
    } else if (view === "symptoms" && category) {
      action = `กำลังค้นหาอาการ: ${model ? model.name : category.name}`
    }
    
    if (view !== "guide") {
      logSessionActivity(user.employeeCode, user.name, action).catch(console.error)
    }
  }, [view, category, model, preview, user])

  const handleBack = () => {
    if (view === "subcategories") setView("home")
    else if (view === "models") {
      // Check if this category has subcategories
      const hasSubCats = subCategories.some(sc => sc.categoryId === categoryId)
      if (hasSubCats) {
        setView("subcategories")
      } else {
        setView("home")
      }
    }
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

      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      ) : (
        <>
          {view === "home" && (
            <TechnicianHome
              categories={categories}
              models={models}
              onSelectCategory={(id) => {
                setCategoryId(id)
                setModel(null)
                setSubCategoryId(null)
                // Check if category has subcategories
                const hasSubCats = subCategories.some(sc => sc.categoryId === id)
                if (hasSubCats) {
                  setView("subcategories")
                } else {
                  setView("models")
                }
              }}
              onSelectModel={(m) => {
                setModel(m)
                setCategoryId(m.categoryId)
                setSubCategoryId(m.subcategoryId || null)
                setView("symptoms")
              }}
            />
          )}

          {view === "subcategories" && category && (
            <SubCategoryList 
              category={category}
              subCategories={subCategories}
              models={models}
              onBack={() => setView("home")}
              onSelectSubCategory={(sc) => {
                setSubCategoryId(sc.id)
                setView("models")
              }}
            />
          )}

          {view === "models" && category && (
            <ModelList 
              category={category}
              subCategoryId={subCategoryId}
              models={models}
              onBack={() => {
                const hasSubCats = subCategories.some(sc => sc.categoryId === category.id)
                setView(hasSubCats ? "subcategories" : "home")
              }}
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
              guides={guides}
              symptomTypes={symptomTypes}
              symptoms={symptoms}
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
              categories={categories}
              models={models}
              symptoms={symptoms}
              onBack={() => setView("symptoms")} 
            />
          )}
        </>
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
