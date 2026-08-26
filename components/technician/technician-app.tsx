"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Home, ChevronLeft } from "lucide-react"
import { TechnicianHome, type TechnicianHomeRef, type DiagnosticGroup } from "./technician-home"
import { SymptomList } from "./symptom-list"
import { GuideWizard } from "./guide-wizard"
import { UserMenu } from "@/components/user-menu"
import { SubCategoryList } from "./subcategory-list"
import { ModelList } from "./model-list"
import { type Category, type DeviceModel, type Guide, type SubCategory, type SymptomType, type Symptom, type MasterDataMapping } from "@/lib/types"
import { preloadTechnicianData } from "@/lib/data-service"
import { logActivity } from "@/lib/activity-service"
import type { AuthUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

type View = "home" | "subcategories" | "models" | "symptoms" | "guide"

export function TechnicianApp({
  user,
  preview,
  initialCategoryId,
  onExitPreview,
  onLogout,
}: {
  user: AuthUser
  preview?: boolean
  initialCategoryId?: string
  onExitPreview?: () => void
  onLogout?: () => void
}) {
  const [view, setView] = useState<View>("home")
  const [history, setHistory] = useState<View[]>(["home"])
  const [homeTab, setHomeTab] = useState<"categories" | "diagnostics" | "favorites" | "recents">("categories")
  const [selectedDiagnosticGroup, setSelectedDiagnosticGroup] = useState<DiagnosticGroup | null>(null)
  const homeRef = useRef<TechnicianHomeRef | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [subCategoryId, setSubCategoryId] = useState<string | null>(null)
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null)
  const [model, setModel] = useState<DeviceModel | null>(null)
  const [guide, setGuide] = useState<Guide | null>(null)

  // Preloaded data
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [mappings, setMappings] = useState<MasterDataMapping[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await preloadTechnicianData()
        setCategories(data.categories)
        setSubCategories(data.subCategories)
        setModels(data.models)
        setGuides(data.guides)
        setSymptomTypes(data.symptomTypes)
        setSymptoms(data.symptoms)
        setMappings(data.mappings || [])

        if (initialCategoryId) {
          const category = data.categories.find(
            (c) => c.id === initialCategoryId || c.slug === initialCategoryId
          )
          if (category) {
            setCategoryId(category.id)
            const hasSubCats = data.subCategories.some(
              (sc) => sc.categoryId === category.id || sc.categoryId === category.slug
            )
            const targetView: View = hasSubCats ? "subcategories" : "models"
            setView(targetView)
            setHistory(["home", targetView])
          }
        }
      } catch (err) {
        console.error("Failed to load technician data", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [initialCategoryId])

  const category = categoryId ? categories.find(c => c.id === categoryId || c.slug === categoryId) : undefined

  useEffect(() => {
    if (preview) return
    const sessionKey = `logged_in_${user.employeeCode}`
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "true")
      logActivity(user, "login", "system", "แอปพลิเคชันช่าง", "", "เข้าใช้งานระบบ").catch(console.error)
    }
  }, [preview, user])

  const navigateTo = (nextView: View) => {
    setHistory((prev) => (prev[prev.length - 1] === nextView ? prev : [...prev, nextView]))
    setView(nextView)
  }

  const handleBack = () => {
    if (view === "home") {
      if (selectedDiagnosticGroup) {
        setSelectedDiagnosticGroup(null)
        return
      }
      if (homeRef.current) {
        const handled = homeRef.current.handleBack()
        if (handled) return
      }
    }

    if (history.length > 1) {
      const newHistory = [...history]
      newHistory.pop() // remove current
      const prevView = newHistory[newHistory.length - 1]
      setHistory(newHistory)
      setView(prevView)
    } else {
      if (view === "home") {
        if (homeTab !== "categories") {
          setHomeTab("categories")
        }
      } else {
        setView("home")
        setHistory(["home"])
      }
    }
  }

  const handleHome = () => {
    setHistory(["home"])
    setView("home")
    setHomeTab("categories")
    setSelectedDiagnosticGroup(null)
    homeRef.current?.resetHome?.()
    setModel(null)
    setCategoryId(null)
    setSubCategoryId(null)
    setSubCategory(null)
  }

  const handleSelectModel = (m: DeviceModel) => {
    try {
      const saved = localStorage.getItem("mazuma_tech_recents")
      const current = saved ? JSON.parse(saved) : []
      const next = [m.id, ...current.filter((id: string) => id !== m.id)].slice(0, 15)
      localStorage.setItem("mazuma_tech_recents", JSON.stringify(next))
    } catch (e) { }
    setModel(m)
    setCategoryId(m.categoryId)
    setSubCategoryId(m.subcategoryId || null)
    navigateTo("symptoms")
  }

  return (
    <div className="min-h-screen bg-background/50 pb-20 mx-auto w-full max-w-3xl shadow-2xl sm:border-x border-border/40 relative">
      {/* Premium Decorative Ambient Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none flex justify-center overflow-hidden">
        <div className="w-full max-w-3xl h-[100dvh] relative">
          {/* Glowing Orbs with refined luxury hues */}
          <div className="absolute top-[-5%] left-[-15%] w-[420px] h-[420px] rounded-full bg-gradient-to-br from-primary/20 to-blue-500/10 blur-[110px]" />
          <div className="absolute top-[30%] right-[-25%] w-[380px] h-[380px] rounded-full bg-gradient-to-bl from-sky-400/15 via-indigo-500/10 to-transparent blur-[95px]" />
          <div className="absolute bottom-[-5%] left-[5%] w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-purple-600/15 to-primary/10 blur-[120px]" />

          {/* Subtle Dynamic Dot Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] dark:bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.07] dark:opacity-[0.12] [mask-image:radial-gradient(ellipse_90%_90%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
      </div>
      {/* Top-right account control (or admin preview banner) */}
      {preview ? (
        <div className="relative w-full z-[70] flex items-center justify-between gap-3 border-b border-border bg-primary px-4 py-2.5 text-primary-foreground shadow-xs">
          <span className="text-sm font-medium">กำลังดูตัวอย่างแอปช่าง</span>
          <button
            type="button"
            onClick={onExitPreview}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm font-medium hover:bg-primary-foreground/25 transition-colors"
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
              ref={homeRef}
              categories={categories}
              models={models}
              symptoms={symptoms}
              symptomTypes={symptomTypes}
              mappings={mappings}
              guides={guides}
              preview={preview}
              activeTab={homeTab}
              onTabChange={setHomeTab}
              selectedDiagnosticGroup={selectedDiagnosticGroup}
              onSelectDiagnosticGroup={setSelectedDiagnosticGroup}
              onSelectCategory={(id) => {
                setCategoryId(id)
                setModel(null)
                setSubCategoryId(null)
                setSubCategory(null)
                // Check if category has subcategories
                const cat = categories.find(c => c.id === id)
                const hasSubCats = subCategories.some(sc => sc.categoryId === id || (cat && sc.categoryId === cat.slug))
                if (hasSubCats) {
                  navigateTo("subcategories")
                } else {
                  navigateTo("models")
                }
              }}
              onSelectModel={handleSelectModel}
              onSelectDiagnostic={(id) => {
                setHomeTab("diagnostics")
                const cat = categories.find(c => c.slug === id || c.id === id)
                if (cat) {
                  setCategoryId(cat.id)
                  setModel(null)
                  setSubCategoryId(null)
                  setSubCategory(null)
                  navigateTo("symptoms")
                }
              }}
              onSelectGuide={(g, fromQuick = false) => {
                if (fromQuick) {
                  setHomeTab("diagnostics")
                }
                setGuide(g)
                navigateTo("guide")
              }}
            />
          )}

          {view === "subcategories" && category && (
            <SubCategoryList
              category={category}
              subCategories={subCategories}
              models={models}
              preview={preview}
              onBack={handleBack}
              onSelectSubCategory={(sc) => {
                setSubCategory(sc)
                setSubCategoryId(sc.index || sc.id)
                navigateTo("models")
              }}
              onSelectModel={handleSelectModel}
            />
          )}

          {view === "models" && category && (
            <ModelList
              category={category}
              subCategory={subCategory}
              subCategoryId={subCategoryId}
              models={models}
              preview={preview}
              onBack={handleBack}
              onSelectModel={handleSelectModel}
            />
          )}

          {view === "symptoms" && category && (
            <SymptomList
              category={category}
              model={model}
              guides={guides}
              symptomTypes={symptomTypes}
              symptoms={symptoms}
              mappings={mappings}
              preview={preview}
              onBack={handleBack}
              onSelectGuide={(g) => {
                setGuide(g)
                navigateTo("guide")
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
              preview={preview}
              onBack={handleBack}
              onHome={handleHome}
            />
          )}
        </>
      )}

      {/* Bottom Navigation for Mobile (Always accessible, with exact Back and Home action) */}
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border/40 bg-card/85 backdrop-blur-2xl pb-safe shadow-[0_-8px_25px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around px-3 py-1.5 max-w-3xl mx-auto h-15">
          <button
            onClick={handleHome}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 px-4 py-1 rounded-2xl transition-all duration-300",
              view === "home" && homeTab === "categories"
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            {view === "home" && homeTab === "categories" && (
              <span className="absolute -top-1.5 size-1 rounded-full bg-primary animate-pulse" />
            )}
            <Home className={cn("size-5.5 transition-transform", view === "home" && homeTab === "categories" ? "scale-110" : "")} strokeWidth={view === "home" && homeTab === "categories" ? 2.5 : 1.8} />
            <span className="text-[0.65625rem] tracking-wide">หน้าแรก</span>
          </button>

          {(view !== "home" || homeTab !== "categories" || selectedDiagnosticGroup !== null) && (
            <button
              onClick={handleBack}
              className="flex flex-col items-center justify-center gap-1 px-4 py-1 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200"
            >
              <ChevronLeft className="size-5.5" strokeWidth={1.8} />
              <span className="text-[0.65625rem] font-medium tracking-wide">ย้อนกลับ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
