"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Home, ChevronLeft } from "lucide-react"
import { TechnicianHome } from "./technician-home"
import { SymptomList } from "./symptom-list"
import { GuideWizard } from "./guide-wizard"
import { UserMenu } from "@/components/user-menu"
import { SubCategoryList } from "./subcategory-list"
import { ModelList } from "./model-list"
import { type Category, type DeviceModel, type Guide, type SubCategory, type SymptomType, type Symptom } from "@/lib/types"
import { preloadTechnicianData } from "@/lib/data-service"
import { logActivity } from "@/lib/activity-service"
import type { AuthUser } from "@/lib/auth"

type View = "home" | "subcategories" | "models" | "symptoms" | "guide"

export function TechnicianApp({
  user,
  onLogout,
  preview = false,
  onExitPreview,
  initialCategoryId,
}: {
  user: AuthUser
  onLogout?: () => void
  preview?: boolean
  onExitPreview?: () => void
  initialCategoryId?: string
}) {
  const [view, setView] = useState<View>(initialCategoryId ? "models" : "home")
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId || null)
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
        const data = await preloadTechnicianData()
        
        // Build unique models from MasterData mappings
        const uniqueModelsMap = new Map<string, DeviceModel>()
        data.mappings.forEach(m => {
          if (!uniqueModelsMap.has(m.modelCode)) {
             const categoryId = (m.matCategoryCode || "").substring(0, 2)
             uniqueModelsMap.set(m.modelCode, {
                id: m.modelCode, 
                code: m.modelCode,
                name: m.modelName,
                categoryId: categoryId,
                subcategoryId: m.matCategoryCode,
                symptomTypeId: m.symptomTypeCode,
                status: "active"
             })
          }
        })
        const mappedModels = Array.from(uniqueModelsMap.values())
        
        setCategories(data.categories)
        setModels(mappedModels)
        setGuides(data.guides)
        setSubCategories(data.subCategories)
        setSymptomTypes(data.symptomTypes)
        setSymptoms(data.symptoms)

        // Handle initial routing if category is passed
        if (initialCategoryId && data.categories.some(c => c.id === initialCategoryId)) {
          const category = data.categories.find(c => c.id === initialCategoryId)
          const hasSubCats = data.subCategories.some(sc => sc.categoryId === initialCategoryId || (category && sc.categoryId === category.slug))
          if (hasSubCats) {
            setView("subcategories")
          } else {
            setView("models")
          }
        }
      } catch (error) {
        console.error("Failed to load technician data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [initialCategoryId])

  const category = categoryId ? categories.find(c => c.id === categoryId) : undefined

  useEffect(() => {
    if (preview) return
    const sessionKey = `logged_in_${user.employeeCode}`
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "true")
      logActivity(user, "login", "system", "แอปพลิเคชันช่าง", "", "เข้าใช้งานระบบ").catch(console.error)
    }
  }, [preview, user])

  const handleBack = () => {
    if (view === "subcategories") setView("home")
    else if (view === "models") {
      // Check if this category has subcategories
      const hasSubCats = subCategories.some(sc => sc.categoryId === categoryId || (category && sc.categoryId === category.slug))
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
                const category = categories.find(c => c.id === id)
              const hasSubCats = subCategories.some(sc => sc.categoryId === id || (category && sc.categoryId === category.slug))
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
                setSubCategoryId(sc.index || sc.id)
                setView("models")
              }}
              onSelectModel={(m) => {
                setModel(m)
                setSubCategoryId(m.subcategoryId || null)
                setView("symptoms")
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
              guides={guides}
              user={user}
              model={model}
              categories={categories}
              models={models}
              symptoms={symptoms}
              symptomTypes={symptomTypes}
              onBack={() => setView("symptoms")} 
            />
          )}
        </>
      )}

      {/* Bottom Navigation for Mobile */}
      {view !== "guide" && (
        <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border/40 bg-background/70 backdrop-blur-2xl pb-safe">
          <div className="flex items-center justify-around px-2 py-1 max-w-[480px] mx-auto h-14">
            <button
              onClick={() => setView("home")}
              className={`flex flex-col items-center justify-center gap-1 w-20 h-full transition-colors ${view === "home" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Home className={`size-6 ${view === "home" ? "fill-primary/20" : ""}`} strokeWidth={view === "home" ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-wide">หน้าแรก</span>
            </button>
            
            {view !== "home" && (
              <button
                onClick={handleBack}
                className="flex flex-col items-center justify-center gap-1 w-20 h-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="size-6" strokeWidth={2} />
                <span className="text-[10px] font-medium tracking-wide">ย้อนกลับ</span>
              </button>
            )}
            
            {/* Can add more tabs here if needed, like Settings or Profile */}
          </div>
        </div>
      )}
    </div>
  )
}
