"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  Boxes,
  Stethoscope,
  Film,
  Plus,
  Loader2,
  Activity,
  User,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  BarChart3,
  Wifi,
  ExternalLink,
  X,
  ChevronRight,
  Smartphone,
  Search
} from "lucide-react"
import type { Category, DeviceModel, MasterDataMapping, Guide, Symptom } from "@/lib/types"
import { preloadAdminData, type ActiveSession, type RepairFeedback } from "@/lib/data-service"
import { getActivities, type ActivityLog } from "@/lib/activity-service"
import { AuthUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

export function AdminDashboard({ 
  user, 
  onCreate, 
  onNavigateToGuides, 
  onNavigateTo,
  onNavigateToCreateGuideForModel
}: { 
  user: AuthUser, 
  onCreate: () => void, 
  onNavigateToGuides?: (search: string) => void, 
  onNavigateTo?: (view: any, subView?: string) => void,
  onNavigateToCreateGuideForModel?: (modelId: string) => void
}) {
  const [categories, setCategories] = useState<Category[]>([])
  const [mappings, setMappings] = useState<MasterDataMapping[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [users, setUsers] = useState<AuthUser[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [totalSymptoms, setTotalSymptoms] = useState(0)
  
  const [repairStats, setRepairStats] = useState({ total: 0, successRate: 0, avgStepsSuccess: "0", successCount: 0, failedCount: 0, feedbacks: [] as RepairFeedback[] })
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [topModels, setTopModels] = useState<{modelId: string, count: number}[]>([])
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [showAllActiveUsers, setShowAllActiveUsers] = useState(false)
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [showMissingMappingsModal, setShowMissingMappingsModal] = useState(false)
  const [showRepairStatsModal, setShowRepairStatsModal] = useState(false)
  const [selectedTopModel, setSelectedTopModel] = useState<string | null>(null)
  const [missingMappingSearch, setMissingMappingSearch] = useState("")
  const [repairFilter, setRepairFilter] = useState<"all" | "success" | "failed">("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const data = await preloadAdminData()
    const acts = await import("@/lib/activity-service").then(m => m.getActivities())
    setCategories(data.categories)
    setMappings(data.mappings)
    setModels(data.models)
    setGuides(data.guides || [])
    setSymptoms(data.symptoms || [])
    setTotalSymptoms(data.symptoms?.length || 0)
    setUsers(data.users || [])
    setActivities(acts)
    setRepairStats(data.repairStats)
    setActiveSessions(data.activeSessions)
    setTopModels(data.topModels)
    setLoading(false)
  }

  if (loading && mappings.length === 0) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="size-10 animate-spin text-primary" /></div>
  }

  const stats = [
    { label: "การจับคู่ทั้งหมด", value: mappings.length, icon: BookOpen, tone: "text-blue-500 bg-blue-500/10 border-blue-500/20", onClick: () => onNavigateTo?.("guides") },
    { label: "รุ่นสินค้า", value: models.length, icon: Smartphone, tone: "text-purple-500 bg-purple-500/10 border-purple-500/20", onClick: () => onNavigateTo?.("models") },
    { label: "หมวดหมู่สินค้า", value: categories.length, icon: Boxes, tone: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", onClick: () => onNavigateTo?.("master-data", "categories") },
    { label: "กลุ่มอาการ", value: totalSymptoms, icon: Stethoscope, tone: "text-amber-500 bg-amber-500/10 border-amber-500/20", onClick: () => onNavigateTo?.("master-data", "symptomTypesRoot") },
  ]

  const formatTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return "เมื่อสักครู่"
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
    return `${Math.floor(diff / 86400)} วันที่แล้ว`
  }

  const getActionText = (action: string) => {
    switch (action) {
      case "create": return "สร้างข้อมูลใหม่"
      case "update": return "อัปเดตข้อมูล"
      case "delete": return "ลบข้อมูล"
      case "login": return "เข้าสู่ระบบ"
      case "logout": return "ออกจากระบบ"
      default: return action
    }
  }

  const getModel = (id: string) => {
    return models.find(m => m.id === id || m.code === id)
  }

  const modelsWithoutMappings = models.filter(m => {
    return !mappings.some(map => map.modelCode === m.code)
  })

  // Set of symptomTypeIds that have at least 1 guide in Guides sheet
  const symptomTypeIdsWithGuides = new Set(
    guides
      .map((g) => {
        if (g.symptomTypeId) return g.symptomTypeId.trim();
        const sym = symptoms.find((s) => s.id === g.symptomId);
        return (sym?.symptomTypeId || "").trim();
      })
      .filter(Boolean)
  );

  const modelIdsWithDirectGuides = new Set(
    guides.flatMap((g) => (g.modelIds || []).map((id) => id.trim().toLowerCase()))
  );

  const isMappingBoundToGuide = (m: MasterDataMapping) => {
    const symCode = (m.symptomTypeCode || "").trim();
    if (symCode && symptomTypeIdsWithGuides.has(symCode)) return true;
    const mCode = (m.modelCode || "").trim().toLowerCase();
    if (mCode && modelIdsWithDirectGuides.has(mCode)) return true;
    return false;
  };

  const categoriesWithCount = categories.map(cat => {
    const uniqueMappedModels = new Set(
      mappings
        .filter(m => {
          const matchCat = (() => {
            if (cat.slug && m.matCategoryCode) {
              return m.matCategoryCode.startsWith(cat.slug);
            }
            const model = models.find(mod => mod.code === m.modelCode);
            return model?.categoryId === cat.id || model?.categoryId === cat.slug;
          })();
          if (!matchCat) return false;

          // Must actually have a repair guide in Guides sheet
          return isMappingBoundToGuide(m);
        })
        .map(m => m.modelCode)
    )
    return { ...cat, modelCount: uniqueMappedModels.size }
  }).sort((a, b) => b.modelCount - a.modelCount)

  const topCategories = categoriesWithCount.slice(0, 5)
  const maxCategoryCount = topCategories[0]?.modelCount || 1

  const uniqueUsersMap = new Map()
  for (const a of activities) {
    if (!uniqueUsersMap.has(a.userCode)) {
      uniqueUsersMap.set(a.userCode, a)
    }
  }
  const uniqueUsers = Array.from(uniqueUsersMap.values())

  return (
    <div className="mx-auto w-full px-4 pb-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">ภาพรวมระบบ</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            ยินดีต้อนรับ {user.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.href = '/?preview=true'}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-sm active:scale-95 transition-transform"
        >
          <ExternalLink className="size-4" />
          ดูแอพช่าง
        </button>
      </div>

      {/* Alert for missing guides */}
      {modelsWithoutMappings.length > 0 && (
        <div 
          onClick={() => setShowMissingMappingsModal(true)}
          className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 shadow-sm flex flex-col gap-3 cursor-pointer hover:bg-destructive/10 transition-colors"
        >
           <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/20 mt-0.5">
                 <AlertCircle className="size-4 text-destructive" />
              </div>
              <div>
                 <h3 className="font-display text-[15px] font-bold text-destructive leading-tight">พบสินค้ารุ่นที่ยังไม่ได้ผูกอาการ ({modelsWithoutMappings.length})</h3>
                 <p className="text-[13px] text-destructive/80 mt-1">
                   กรุณาเพิ่มการจับคู่ MasterData ให้รองรับรุ่นเหล่านี้
                 </p>
              </div>
           </div>
           <div className="flex flex-wrap items-center gap-1.5 pl-11">
              {modelsWithoutMappings.slice(0, 3).map(m => (
                <span key={m.id} className="text-[11px] bg-background/60 border border-destructive/20 px-2 py-0.5 rounded-md text-destructive/90 font-medium">{m.name}</span>
              ))}
              {modelsWithoutMappings.length > 3 && (
                <span className="text-[11px] bg-destructive/10 px-2 py-0.5 rounded-md text-destructive font-bold">
                  +{modelsWithoutMappings.length - 3} รุ่น
                </span>
              )}
           </div>
        </div>
      )}

      {/* Technician Performance Stats */}
      <h2 className="mb-3 font-display text-[16px] font-bold flex items-center gap-2">
        <Target className="size-4 text-emerald-500" /> สถิติการใช้งาน
      </h2>
      <div 
        className="mb-6 flex flex-col gap-3 cursor-pointer hover:brightness-[1.02] active:scale-[0.99] transition-all"
        onClick={() => setShowRepairStatsModal(true)}
      >
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[13px] font-semibold text-emerald-600">อัตราการซ่อมสำเร็จ</p>
            <p className="text-[11px] text-emerald-600/70 mt-0.5">จากทั้งหมด</p>
          </div>
          <span className="font-display text-3xl font-black text-emerald-600">{repairStats.successRate}%</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3 shadow-sm flex flex-col items-center text-center">
            <span className="font-display text-xl font-black text-blue-600">{repairStats.total}</span>
            <p className="text-[11px] font-semibold text-blue-600 mt-1">ใช้งาน (ครั้ง)</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 shadow-sm flex flex-col items-center text-center">
            <span className="font-display text-xl font-black text-emerald-600">{repairStats.successCount}</span>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">สำเร็จ</p>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3 shadow-sm flex flex-col items-center text-center">
            <span className="font-display text-xl font-black text-rose-600">{repairStats.failedCount}</span>
            <p className="text-[11px] font-semibold text-rose-600 mt-1">ไม่สำเร็จ</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <h2 className="mb-3 font-display text-[16px] font-bold flex items-center gap-2">
        <BarChart3 className="size-4 text-primary" /> ฐานข้อมูลระบบ
      </h2>
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              onClick={s.onClick}
              className={cn("rounded-2xl border bg-card p-4 shadow-sm flex flex-col cursor-pointer hover:brightness-105 active:scale-95 transition-all", s.tone)}
            >
              <div className="flex items-center gap-3 mb-2">
                 <div className="flex size-8 items-center justify-center rounded-xl bg-background/50 shadow-sm backdrop-blur-sm shrink-0">
                   <Icon className="size-4" />
                 </div>
                 <p className="font-display text-xl font-black opacity-90">{s.value}</p>
              </div>
              <p className="text-[12px] font-semibold opacity-90">{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Models Chart */}
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <h2 className="font-display text-[15px] font-bold">5 อันดับรุ่นยอดนิยม</h2>
          </div>
          <div className="space-y-3">
            {topModels.map((tm, i) => (
              <div 
                key={tm.modelId} 
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-xl transition-colors"
                onClick={() => setSelectedTopModel(tm.modelId)}
              >
                 <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold text-muted-foreground">
                   {i + 1}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="font-medium text-[13px] truncate text-foreground">{getModel(tm.modelId)?.name || tm.modelId}</p>
                   <p className="text-[11px] text-muted-foreground truncate">{getModel(tm.modelId)?.code || ""}</p>
                   <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                     <div 
                       className="h-full rounded-full bg-primary" 
                       style={{ width: `${Math.max(10, (tm.count / topModels[0].count) * 100)}%` }} 
                     />
                   </div>
                 </div>
                 <div className="shrink-0 text-right">
                   <span className="font-bold text-[13px]">{tm.count}</span>
                   <span className="text-[11px] text-muted-foreground ml-0.5">ครั้ง</span>
                 </div>
              </div>
            ))}
            {topModels.length === 0 && (
              <p className="text-[13px] text-muted-foreground text-center py-2">ยังไม่มีข้อมูล</p>
            )}
          </div>
        </div>

        {/* Recently Active Users (Replacing Live Sessions) */}
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="size-4 text-emerald-500" />
              <h2 className="font-display text-[15px] font-bold">เข้าใช้งานล่าสุด</h2>
            </div>
            {uniqueUsers.length > 5 && (
              <button 
                onClick={() => setShowAllActiveUsers(true)}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                ดูทั้งหมด
              </button>
            )}
          </div>
          <div className="space-y-3">
            {(() => {
              if (uniqueUsers.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                     <User className="size-6 opacity-20 mb-2" />
                     <p className="text-[12px]">ยังไม่มีข้อมูลการเข้าใช้งาน</p>
                  </div>
                )
              }

              return uniqueUsers.slice(0, 5).map((act) => {
                const user = users.find(u => u.employeeCode === act.userCode)
                
                return (
                  <div key={act.userCode} className="flex gap-3 items-center border-b border-border/40 pb-3 last:border-0 last:pb-0">
                     <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[13px] overflow-hidden">
                       {user?.avatar ? (
                         // eslint-disable-next-line @next/next/no-img-element
                         <img src={user.avatar} alt={act.userName} className="w-full h-full object-cover" />
                       ) : (
                         act.userName?.charAt(0) || <User className="size-4" />
                       )}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-[13px] font-bold text-foreground truncate">{act.userName}</p>
                       <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{getActionText(act.action)}</p>
                     </div>
                     <div className="shrink-0 text-right">
                       <span className="text-[11px] text-muted-foreground">{formatTimeAgo(act.timestamp)}</span>
                     </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>

        {/* Top Categories Chart */}
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="size-4 text-emerald-500" />
              <h2 className="font-display text-[15px] font-bold">5 อันดับหมวดหมู่ที่มีรุ่นสินค้าที่ผูกคู่มือแล้ว</h2>
            </div>
            {categoriesWithCount.length > 5 && (
              <button 
                onClick={() => setShowAllCategories(true)}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                ดูทั้งหมด
              </button>
            )}
          </div>
          <div className="space-y-3">
            {topCategories.length === 0 || maxCategoryCount === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-2">ยังไม่มีข้อมูลการผูกคู่มือ</p>
            ) : (
              topCategories.map((cat, i) => (
                <button key={cat.id} onClick={() => onNavigateToGuides?.(cat.slug || cat.name)} className="w-full text-left flex items-center gap-3 group hover:bg-muted/50 p-2 -mx-2 rounded-xl transition-colors">
                   <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold text-muted-foreground group-hover:bg-background">
                     {i + 1}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="font-medium text-[13px] truncate text-foreground group-hover:text-primary transition-colors">
                       {cat.slug && <span className="text-primary mr-1">{cat.slug} -</span>}
                       {cat.name}
                     </p>
                     <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                       <div 
                         className="h-full rounded-full bg-emerald-500" 
                         style={{ width: `${Math.max(10, (cat.modelCount / maxCategoryCount) * 100)}%` }} 
                       />
                     </div>
                   </div>
                   <div className="shrink-0 text-right flex items-center gap-2">
                     <div>
                       <span className="font-bold text-[13px]">{cat.modelCount}</span>
                       <span className="text-[11px] text-muted-foreground ml-0.5">รุ่น</span>
                     </div>
                     <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
                   </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Activity className="size-4 text-primary" />
               <h2 className="font-display text-[15px] font-bold">ความเคลื่อนไหวล่าสุด</h2>
            </div>
            {activities.length > 5 && (
              <button 
                onClick={() => setShowAllActivities(true)}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                ดูทั้งหมด
              </button>
            )}
          </div>
          
          <div className="relative border-l border-border/60 ml-2 space-y-4 pb-2">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="relative pl-5">
                 <span className="absolute -left-1.5 top-1 size-2.5 rounded-full bg-primary ring-4 ring-card"></span>
                 <div className="flex flex-col gap-0.5">
                    <p className="text-[13px] font-medium text-foreground">
                      {act.userName} <span className="font-normal text-muted-foreground">{getActionText(act.action)}</span>
                    </p>
                    {act.resourceName && (
                      <p className="text-[12px] font-semibold text-primary">{act.resourceName}</p>
                    )}
                    <div className="mt-0.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="size-2.5" /> {formatTimeAgo(act.timestamp)}</span>
                      <span className="flex items-center gap-1"><User className="size-2.5" /> {act.userCode}</span>
                    </div>
                 </div>
              </div>
            ))}
            
            {activities.length === 0 && (
              <div className="pl-5 text-[12px] text-muted-foreground">
                ยังไม่มีความเคลื่อนไหวในระบบ
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Show All Categories Modal */}
      {showAllCategories && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg md:max-w-3xl rounded-3xl border shadow-2xl p-6 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-foreground">
                หมวดหมู่ทั้งหมด ({categoriesWithCount.length})
              </h2>
              <button 
                onClick={() => setShowAllCategories(false)}
                className="p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto pr-2 space-y-2">
              {categoriesWithCount.map((cat, i) => (
                <button key={cat.id} onClick={() => { setShowAllCategories(false); onNavigateToGuides?.(cat.slug || cat.name); }} className="w-full text-left flex items-center gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0 group hover:bg-muted/50 p-2 -mx-2 rounded-xl transition-colors">
                   <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-[13px] font-bold text-muted-foreground group-hover:bg-background">
                     {i + 1}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="font-medium text-[14px] truncate text-foreground group-hover:text-primary transition-colors">
                       {cat.slug && <span className="text-primary mr-1">{cat.slug} -</span>}
                       {cat.name}
                     </p>
                     <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                       <div 
                         className="h-full rounded-full bg-emerald-500" 
                         style={{ width: `${Math.max(5, (cat.modelCount / maxCategoryCount) * 100)}%` }} 
                       />
                     </div>
                   </div>
                   <div className="shrink-0 text-right flex items-center gap-2">
                     <div>
                       <span className="font-bold text-[14px]">{cat.modelCount}</span>
                       <span className="text-[12px] text-muted-foreground ml-1">รุ่น</span>
                     </div>
                     <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
                   </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Show All Active Users Modal */}
      {showAllActiveUsers && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg md:max-w-3xl rounded-3xl border shadow-2xl p-6 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-foreground">
                ผู้เข้าใช้งานทั้งหมด ({uniqueUsers.length})
              </h2>
              <button 
                onClick={() => setShowAllActiveUsers(false)}
                className="p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto pr-2 space-y-4">
              {uniqueUsers.map((act) => {
                const user = users.find(u => u.employeeCode === act.userCode)

                return (
                  <div key={act.userCode} className="flex gap-3 items-center border-b border-border/40 pb-3 last:border-0 last:pb-0">
                     <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[13px] overflow-hidden">
                       {user?.avatar ? (
                         // eslint-disable-next-line @next/next/no-img-element
                         <img src={user.avatar} alt={act.userName} className="w-full h-full object-cover" />
                       ) : (
                         act.userName?.charAt(0) || <User className="size-4" />
                       )}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-[13px] font-bold text-foreground truncate">{act.userName}</p>
                       <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{getActionText(act.action)}</p>
                     </div>
                     <div className="shrink-0 text-right">
                       <span className="text-[11px] text-muted-foreground">{formatTimeAgo(act.timestamp)}</span>
                     </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Show All Activities Modal */}
      {showAllActivities && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg md:max-w-3xl rounded-3xl border shadow-2xl p-6 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-foreground">
                ความเคลื่อนไหวทั้งหมด ({activities.length})
              </h2>
              <button 
                onClick={() => setShowAllActivities(false)}
                className="p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto pr-2">
              <div className="relative border-l border-border/60 ml-2 space-y-4 pb-2 mt-2">
                {activities.map((act) => (
                  <div key={act.id} className="relative pl-5">
                     <span className="absolute -left-1.5 top-1 size-2.5 rounded-full bg-primary ring-4 ring-card"></span>
                     <div className="flex flex-col gap-0.5">
                        <p className="text-[13px] font-medium text-foreground">
                          {act.userName} <span className="font-normal text-muted-foreground">{getActionText(act.action)}</span>
                        </p>
                        {act.resourceName && (
                          <p className="text-[12px] font-semibold text-primary">{act.resourceName}</p>
                        )}
                        <div className="mt-0.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="size-2.5" /> {formatTimeAgo(act.timestamp)}</span>
                          <span className="flex items-center gap-1"><User className="size-2.5" /> {act.userCode}</span>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show Missing Mappings Modal */}
      {showMissingMappingsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl md:max-w-4xl rounded-3xl border shadow-2xl p-6 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-destructive flex items-center gap-2">
                <AlertCircle className="size-5" /> สินค้ารุ่นที่ยังไม่ได้ผูกอาการ ({modelsWithoutMappings.length})
              </h2>
              <button 
                onClick={() => setShowMissingMappingsModal(false)}
                className="p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="mb-4 relative shrink-0">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
               <input 
                 type="text" 
                 placeholder="ค้นหารุ่นสินค้า..."
                 value={missingMappingSearch}
                 onChange={e => setMissingMappingSearch(e.target.value)}
                 className="w-full pl-9 pr-4 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
               />
            </div>
            
            <div className="overflow-y-auto pr-2 space-y-3">
              {modelsWithoutMappings
                .filter(m => !missingMappingSearch || m.name.toLowerCase().includes(missingMappingSearch.toLowerCase()) || m.code.toLowerCase().includes(missingMappingSearch.toLowerCase()))
                .map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] text-foreground truncate">{m.code} - {m.name}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 truncate">หมวดหมู่: {categories.find(c => c.id === m.categoryId || c.slug === m.categoryId)?.name || m.categoryId}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowMissingMappingsModal(false)
                      onNavigateToCreateGuideForModel?.(m.id)
                    }}
                    className="shrink-0 ml-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[12px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Plus className="size-3.5" /> ไปผูกคู่มือ
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Show Repair Stats Modal */}
      {showRepairStatsModal && (() => {
        const dateFilteredFeedbacks = repairStats.feedbacks.filter(fb => {
          if (dateFilter !== "all") {
            const fbDate = new Date(fb.timestamp);
            const now = new Date();
            
            if (dateFilter === "today") {
              if (fbDate.toDateString() !== now.toDateString()) return false;
            } else if (dateFilter === "7d") {
              const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              if (fbDate < sevenDaysAgo) return false;
            } else if (dateFilter === "30d") {
              const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              if (fbDate < thirtyDaysAgo) return false;
            }
          }
          return true;
        });

        const successCount = dateFilteredFeedbacks.filter(fb => fb.isSuccess).length;
        const failedCount = dateFilteredFeedbacks.length - successCount;

        const displayedFeedbacks = dateFilteredFeedbacks.filter(fb => {
          if (repairFilter === "success" && !fb.isSuccess) return false;
          if (repairFilter === "failed" && fb.isSuccess) return false;
          return true;
        });

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-2xl md:max-w-4xl rounded-3xl border shadow-2xl p-6 flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                  <Target className="size-5 text-emerald-500" /> รายละเอียดการซ่อม ({dateFilteredFeedbacks.length} รายการ)
                </h2>
                <button 
                  onClick={() => setShowRepairStatsModal(false)}
                  className="p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex gap-2 p-1 bg-muted/30 rounded-xl w-fit">
                  <button
                    onClick={() => setRepairFilter("all")}
                    className={cn("px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all", repairFilter === "all" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    onClick={() => setRepairFilter("success")}
                    className={cn("px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all", repairFilter === "success" ? "bg-background shadow text-emerald-600" : "text-muted-foreground hover:text-foreground")}
                  >
                    สำเร็จ ({successCount})
                  </button>
                  <button
                    onClick={() => setRepairFilter("failed")}
                    className={cn("px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all", repairFilter === "failed" ? "bg-background shadow text-rose-600" : "text-muted-foreground hover:text-foreground")}
                  >
                    ไม่สำเร็จ ({failedCount})
                  </button>
                </div>

                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-1.5 bg-background border border-border/50 rounded-xl text-[13px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">ทุกช่วงเวลา</option>
                  <option value="today">วันนี้</option>
                  <option value="7d">7 วันที่ผ่านมา</option>
                  <option value="30d">30 วันที่ผ่านมา</option>
                </select>
              </div>

              <div className="overflow-y-auto pr-2 space-y-3">
                {displayedFeedbacks.map(fb => {
                  const model = getModel(fb.modelId || "")
                  const guide = guides.find(g => g.id === fb.guideId)
                  const symptom = symptoms.find(s => s.id === guide?.symptomId)
                  const fbUser = users.find(u => u.employeeCode === fb.userId)

                  return (
                    <div key={fb.id} className="flex flex-col p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {fbUser?.avatar ? (
                          <div className="size-8 rounded-full overflow-hidden shrink-0 border border-border/50">
                            <img src={fbUser.avatar} alt={fb.userName} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[12px]">
                            {fb.userName?.substring(0, 2) || "U"}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[14px] text-foreground">{fb.userName}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" /> {formatTimeAgo(fb.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className={cn("px-2.5 py-1 rounded-full text-[12px] font-bold", fb.isSuccess ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
                        {fb.isSuccess ? "ซ่อมสำเร็จ" : "ซ่อมไม่สำเร็จ"}
                      </div>
                    </div>
                    <div className="text-[13px] text-muted-foreground pl-10 space-y-1">
                      <p><span className="font-medium text-foreground">รุ่นสินค้า:</span> {model ? `${model.code} - ${model.name}` : fb.modelId || "ไม่ระบุ"}</p>
                      
                      {fb.isSuccess ? (
                        <>
                          <p><span className="font-medium text-foreground">อาการเสีย:</span> {symptom?.title || "ไม่ระบุ"}</p>
                          <p><span className="font-medium text-foreground">วินิจฉัย/การแก้ไข:</span> {guide?.title || "ไม่ระบุ"}</p>
                        </>
                      ) : (
                        <>
                          {fb.stepsViewed >= fb.totalSteps ? (
                            <>
                              <p><span className="font-medium text-foreground text-emerald-600">ดูครบทุกขั้นตอนแล้ว</span></p>
                              <p><span className="font-medium text-foreground">หมายเหตุ:</span> {fb.note || "ไม่ระบุ"}</p>
                            </>
                          ) : (
                            <p><span className="font-medium text-foreground">ดูถึงขั้นตอนที่:</span> {fb.stepsViewed} / {fb.totalSteps}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
                {displayedFeedbacks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-[14px]">
                    ยังไม่มีประวัติการซ่อมในช่วงเวลานี้
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Show Top Model Detail Modal */}
      {selectedTopModel && (() => {
        const modelInfo = getModel(selectedTopModel);
        const fbs = repairStats.feedbacks.filter(f => f.modelId === selectedTopModel);
        
        const symptomCounts: Record<string, number> = {};
        const guideCounts: Record<string, number> = {};
        fbs.forEach(fb => {
          const g = guides.find(gd => gd.id === fb.guideId);
          if (g) {
            if (g.symptomId) {
              symptomCounts[g.symptomId] = (symptomCounts[g.symptomId] || 0) + 1;
            }
            guideCounts[g.id] = (guideCounts[g.id] || 0) + 1;
          }
        });

        let topSymptomId = null;
        let topSymptomCount = 0;
        for (const [sId, count] of Object.entries(symptomCounts)) {
          if (count > topSymptomCount) { topSymptomId = sId; topSymptomCount = count; }
        }

        let topGuideId = null;
        let topGuideCount = 0;
        for (const [gId, count] of Object.entries(guideCounts)) {
          if (count > topGuideCount) { topGuideId = gId; topGuideCount = count; }
        }

        const topSymptom = symptoms.find(s => s.id === topSymptomId);
        const topGuide = guides.find(g => g.id === topGuideId);

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg md:max-w-xl rounded-3xl border shadow-2xl p-6 flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" /> สถิติของรุ่น
                </h2>
                <button 
                  onClick={() => setSelectedTopModel(null)}
                  className="p-2 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="mb-4">
                <p className="font-semibold text-[16px] text-foreground">{modelInfo?.name || selectedTopModel}</p>
                <p className="text-[13px] text-muted-foreground">{modelInfo?.code || ""}</p>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="size-4 text-amber-500" />
                    <span className="font-bold text-[14px] text-amber-600">อาการเสียที่พบบ่อยที่สุด</span>
                  </div>
                  <div className="flex justify-between items-end pl-6">
                    <p className="text-[14px] text-foreground font-medium">{topSymptom?.title || "ไม่ระบุ"}</p>
                    <p className="text-[13px] font-bold text-amber-600">{topSymptomCount > 0 ? `${topSymptomCount} ครั้ง` : "-"}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="size-4 text-emerald-500" />
                    <span className="font-bold text-[14px] text-emerald-600">สาเหตุ/การวินิจฉัยที่พบบ่อยที่สุด</span>
                  </div>
                  <div className="flex justify-between items-end pl-6">
                    <p className="text-[14px] text-foreground font-medium">{topGuide?.title || "ไม่ระบุ"}</p>
                    <p className="text-[13px] font-bold text-emerald-600">{topGuideCount > 0 ? `${topGuideCount} ครั้ง` : "-"}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="size-4 text-blue-500" />
                    <span className="font-bold text-[14px] text-blue-600">ประวัติการซ่อมทั้งหมด</span>
                  </div>
                  <div className="flex justify-between items-end pl-6">
                    <p className="text-[14px] text-foreground font-medium">รวมการบันทึกการซ่อม</p>
                    <p className="text-[13px] font-bold text-blue-600">{fbs.length} ครั้ง</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  )
}
