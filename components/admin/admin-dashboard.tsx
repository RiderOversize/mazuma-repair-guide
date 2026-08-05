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
  ExternalLink
} from "lucide-react"
import type { Category, DeviceModel, MasterDataMapping } from "@/lib/types"
import { preloadAdminData, type ActiveSession } from "@/lib/data-service"
import { getActivities, type ActivityLog } from "@/lib/activity-service"
import { AuthUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

export function AdminDashboard({ user, onCreate }: { user: AuthUser, onCreate: () => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [mappings, setMappings] = useState<MasterDataMapping[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [totalSymptoms, setTotalSymptoms] = useState(0)
  
  const [repairStats, setRepairStats] = useState({ total: 0, successRate: 0, avgStepsSuccess: "0" })
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [topModels, setTopModels] = useState<{modelId: string, count: number}[]>([])
  
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
    setTotalSymptoms(data.symptoms.length)
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
    { label: "การจับคู่ทั้งหมด", value: mappings.length, icon: BookOpen, tone: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { label: "รุ่นสินค้า", value: models.length, icon: Boxes, tone: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
    { label: "หมวดหมู่สินค้า", value: categories.length, icon: Boxes, tone: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { label: "กลุ่มอาการ", value: totalSymptoms, icon: Stethoscope, tone: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
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

  const getModelName = (id: string) => {
    return models.find(m => m.id === id)?.name || id
  }

  const modelsWithoutMappings = models.filter(m => {
    return !mappings.some(map => map.modelCode === m.code)
  })

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
        <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 shadow-sm flex flex-col gap-3">
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
      <div className="mb-6 flex flex-col gap-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[13px] font-semibold text-emerald-600">อัตราการซ่อมสำเร็จ</p>
            <p className="text-[11px] text-emerald-600/70 mt-0.5">จากทั้งหมด</p>
          </div>
          <span className="font-display text-3xl font-black text-emerald-600">{repairStats.successRate}%</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 shadow-sm flex flex-col items-center text-center">
            <span className="font-display text-2xl font-black text-blue-600">{repairStats.total}</span>
            <p className="text-[12px] font-semibold text-blue-600 mt-1">ใช้งาน (ครั้ง)</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm flex flex-col items-center text-center">
            <span className="font-display text-2xl font-black text-amber-600">{repairStats.avgStepsSuccess}</span>
            <p className="text-[12px] font-semibold text-amber-600 mt-1">ขั้นตอนเฉลี่ยที่สำเร็จ</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <h2 className="mb-3 font-display text-[16px] font-bold flex items-center gap-2">
        <BarChart3 className="size-4 text-primary" /> ฐานข้อมูลระบบ
      </h2>
      <div className="mb-6 grid grid-cols-2 gap-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className={cn("rounded-2xl border bg-card p-4 shadow-sm flex flex-col", s.tone)}
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

      <div className="flex flex-col gap-6">
        {/* Top Models Chart */}
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <h2 className="font-display text-[15px] font-bold">5 อันดับรุ่นยอดนิยม</h2>
          </div>
          <div className="space-y-3">
            {topModels.map((tm, i) => (
              <div key={tm.modelId} className="flex items-center gap-3">
                 <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold text-muted-foreground">
                   {i + 1}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="font-medium text-[13px] truncate text-foreground">{getModelName(tm.modelId)}</p>
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

        {/* Live Sessions */}
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex size-2 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <h2 className="font-display text-[15px] font-bold">ช่างที่กำลังใช้งาน</h2>
            </div>
            <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
              {activeSessions.length} ออนไลน์
            </span>
          </div>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.userId} className="flex gap-3 items-center border-b border-border/40 pb-3 last:border-0 last:pb-0">
                 <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[13px]">
                   {session.userName.charAt(0) || <User className="size-4" />}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-[13px] font-bold text-foreground truncate">{session.userName}</p>
                   <p className="text-[11px] text-muted-foreground mt-0.5">{session.action}</p>
                 </div>
              </div>
            ))}
            {activeSessions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                 <Wifi className="size-6 opacity-20 mb-2" />
                 <p className="text-[12px]">ไม่มีช่างออนไลน์ในขณะนี้</p>
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <div>
          <h2 className="mb-3 font-display text-[16px] font-bold">ข้อมูลตามหมวดหมู่</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const count = mappings.filter((m) => {
                const model = models.find(mod => mod.code === m.modelCode)
                return model?.categoryId === cat.id
              }).length
              return (
                <div key={cat.id} className="rounded-2xl border border-border/50 bg-card p-3 sm:p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="font-display text-[14px] sm:text-[15px] font-bold line-clamp-2 leading-tight">
                      {cat.slug && <span className="text-primary mr-1">{cat.slug} -</span>}
                      {cat.name}
                    </p>
                    <p className="mb-3 mt-1 text-[11px] text-muted-foreground line-clamp-1">{cat.description}</p>
                  </div>
                  <div className="flex flex-col gap-2 text-[11px] font-medium">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Boxes className="size-3.5" /> {models.filter(m => m.categoryId === cat.id).length} รุ่น
                    </span>
                    <span className="flex w-max items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                      <BookOpen className="size-3.5" /> {count} การจับคู่
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity Log */}
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
             <Activity className="size-4 text-primary" />
             <h2 className="font-display text-[15px] font-bold">ความเคลื่อนไหวล่าสุด</h2>
          </div>
          
          <div className="relative border-l border-border/60 ml-2 space-y-4 pb-2">
            {activities.slice(0, 10).map((act) => (
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
    </div>
  )
}
