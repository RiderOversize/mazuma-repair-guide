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
  Wifi
} from "lucide-react"
import type { Category, DeviceModel, Guide } from "@/lib/mock-data"
import { getCategories, getGuides, getModels, getRepairStats, getActiveSessions, getTopModels, type ActiveSession } from "@/lib/data-service"
import { getActivities, type ActivityLog } from "@/lib/activity-service"
import { AuthUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

export function AdminDashboard({ user, onCreate }: { user: AuthUser, onCreate: () => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  
  const [repairStats, setRepairStats] = useState({ total: 0, successRate: 0, avgStepsSuccess: "0" })
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [topModels, setTopModels] = useState<{modelId: string, count: number}[]>([])
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [cats, gds, mods, acts, repStats, sessions, top] = await Promise.all([
      getCategories(), getGuides(), getModels(), getActivities(),
      getRepairStats(), getActiveSessions(), getTopModels()
    ])
    setCategories(cats)
    setGuides(gds)
    setModels(mods)
    setActivities(acts)
    setRepairStats(repStats)
    setActiveSessions(sessions)
    setTopModels(top)
    setLoading(false)
  }

  if (loading && guides.length === 0) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="size-10 animate-spin text-primary" /></div>
  }

  const totalSymptoms = categories.reduce((sum, c) => sum + c.symptomGroups.length, 0)
  const totalSteps = guides.reduce((sum, g) => sum + g.steps.length, 0)

  const stats = [
    { label: "คู่มือทั้งหมด", value: guides.length, icon: BookOpen, tone: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { label: "รุ่นสินค้า", value: models.length, icon: Boxes, tone: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
    { label: "กลุ่มอาการ", value: totalSymptoms, icon: Stethoscope, tone: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { label: "วิดีโอขั้นตอน", value: totalSteps, icon: Film, tone: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
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

  const modelsWithoutGuides = models.filter(m => !guides.some(g => g.supportedModels.includes(m.id)))

  return (
    <div className="mx-auto max-w-6xl pb-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">ภาพรวมระบบ (Dashboard)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ยินดีต้อนรับ {user.name}, นี่คือสถานะล่าสุดของระบบคู่มือการซ่อม
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="size-4.5" />
          สร้างคู่มือใหม่
        </button>
      </div>

      {/* Technician Performance Stats */}
      <h2 className="mb-4 font-display text-xl font-bold flex items-center gap-2">
        <Target className="size-5 text-emerald-500" /> สถิติการใช้งานของช่างเทคนิค
      </h2>
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-600 mb-2">อัตราการซ่อมสำเร็จ (Success Rate)</p>
          <div className="flex items-end gap-2">
            <span className="font-display text-5xl font-black text-emerald-600">{repairStats.successRate}%</span>
            <span className="text-sm font-medium text-emerald-600/70 mb-1">จากทั้งหมด</span>
          </div>
        </div>
        <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-5 shadow-sm">
          <p className="text-sm font-semibold text-blue-600 mb-2">จำนวนการใช้งานคู่มือ (ครั้ง)</p>
          <div className="flex items-end gap-2">
            <span className="font-display text-4xl font-black text-blue-600">{repairStats.total}</span>
          </div>
        </div>
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm">
          <p className="text-sm font-semibold text-amber-600 mb-2">จำนวนขั้นตอนเฉลี่ยที่ซ่อมสำเร็จ</p>
          <div className="flex items-end gap-2">
            <span className="font-display text-4xl font-black text-amber-600">{repairStats.avgStepsSuccess}</span>
            <span className="text-sm font-medium text-amber-600/70 mb-1">ขั้นตอน</span>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Top Models Chart */}
          <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm h-full">
            <div className="mb-6 flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              <h2 className="font-display text-lg font-bold">5 อันดับสินค้ารุ่นที่ถูกเปิดดูคู่มือบ่อยที่สุด</h2>
            </div>
            <div className="space-y-4">
              {topModels.map((tm, i) => (
                <div key={tm.modelId} className="flex items-center gap-4">
                   <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                     {i + 1}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="font-medium truncate text-foreground">{getModelName(tm.modelId)}</p>
                     <div className="mt-1.5 h-2 w-full rounded-full bg-muted overflow-hidden">
                       <div 
                         className="h-full rounded-full bg-primary" 
                         style={{ width: `${Math.max(10, (tm.count / topModels[0].count) * 100)}%` }} 
                       />
                     </div>
                   </div>
                   <div className="shrink-0 text-right">
                     <span className="font-bold">{tm.count}</span>
                     <span className="text-xs text-muted-foreground ml-1">ครั้ง</span>
                   </div>
                </div>
              ))}
              {topModels.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">ยังไม่มีข้อมูลการใช้งาน</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {/* Live Sessions */}
          <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm h-full">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative flex size-3 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </div>
                <h2 className="font-display text-lg font-bold">ช่างที่กำลังใช้งาน</h2>
              </div>
              <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                {activeSessions.length} ออนไลน์
              </span>
            </div>
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.userId} className="flex gap-3 items-start border-b border-border/40 pb-3 last:border-0 last:pb-0">
                   <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                     {session.userName.charAt(0) || <User className="size-5" />}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-foreground truncate">{session.userName}</p>
                     <p className="text-xs text-muted-foreground mt-0.5">{session.action}</p>
                   </div>
                </div>
              ))}
              {activeSessions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                   <Wifi className="size-8 opacity-20 mb-2" />
                   <p className="text-sm">ไม่มีช่างออนไลน์ในขณะนี้</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alert for missing guides */}
      {modelsWithoutGuides.length > 0 && (
        <div className="mb-8 rounded-3xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-4 transition-all hover:bg-destructive/10">
           <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/20">
                 <AlertCircle className="size-5 text-destructive" />
              </div>
              <div>
                 <h3 className="font-display text-lg font-bold text-destructive">พบสินค้ารุ่นใหม่ที่ยังไม่มีคู่มือการซ่อม ({modelsWithoutGuides.length} รุ่น)</h3>
                 <p className="text-sm text-destructive/80 mt-1">
                   มีรุ่นสินค้าใหม่ในระบบที่ช่างเทคนิคยังไม่สามารถดูคู่มือได้ กรุณาเพิ่มคู่มือให้รองรับรุ่นเหล่านี้
                 </p>
                 <div className="flex flex-wrap items-center gap-2 mt-3">
                    {modelsWithoutGuides.slice(0, 5).map(m => (
                      <span key={m.id} className="text-xs bg-background/60 border border-destructive/20 px-2.5 py-1 rounded-md text-destructive/90 font-semibold shadow-sm">{m.name}</span>
                    ))}
                    {modelsWithoutGuides.length > 5 && (
                      <span className="text-xs bg-destructive/10 px-2.5 py-1 rounded-md text-destructive font-bold shadow-sm">
                        + อีก {modelsWithoutGuides.length - 5} รุ่น
                      </span>
                    )}
                 </div>
              </div>
           </div>
           <button
             type="button"
             onClick={onCreate}
             className="shrink-0 mt-2 sm:mt-0 inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-bold text-destructive-foreground shadow-sm transition-all hover:bg-destructive/90 hover:scale-105"
           >
             <Plus className="size-4" />
             สร้างคู่มือใหม่
           </button>
        </div>
      )}

      {/* Stats grid */}
      <h2 className="mb-4 mt-8 font-display text-xl font-bold flex items-center gap-2">
        <BarChart3 className="size-5 text-primary" /> ข้อมูลฐานข้อมูลระบบ
      </h2>
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className={cn("group rounded-3xl border bg-card p-5 shadow-sm transition-all hover:shadow-md", s.tone)}
            >
              <div className="flex items-center justify-between">
                 <div className="flex size-12 items-center justify-center rounded-2xl bg-background/50 shadow-sm backdrop-blur-sm">
                   <Icon className="size-6" />
                 </div>
                 <p className="font-display text-4xl font-black opacity-80 group-hover:opacity-100 transition-opacity">{s.value}</p>
              </div>
              <p className="mt-4 font-semibold opacity-90">{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           {/* Category breakdown */}
          <h2 className="mb-4 font-display text-xl font-bold">ข้อมูลตามหมวดหมู่</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {categories.map((cat) => {
              const count = guides.filter((g) => g.categoryId === cat.id).length
              return (
                <div key={cat.id} className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-primary/20">
                  <p className="font-display text-lg font-bold">[{cat.id}] {cat.name}</p>
                  <p className="mb-5 mt-1 text-sm text-muted-foreground">{cat.description}</p>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Stethoscope className="size-4" /> {cat.symptomGroups.length} อาการ
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary">
                      <BookOpen className="size-4" /> {count} คู่มือ
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
           {/* Activity Log */}
           <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm h-full flex flex-col">
              <div className="mb-6 flex items-center gap-2">
                 <Activity className="size-5 text-primary" />
                 <h2 className="font-display text-lg font-bold">ความเคลื่อนไหวล่าสุด</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="relative border-l border-border/60 ml-3 space-y-6 pb-4">
                  {activities.map((act) => (
                    <div key={act.id} className="relative pl-6">
                       <span className="absolute -left-1.5 top-1.5 size-3 rounded-full bg-primary ring-4 ring-background"></span>
                       <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium text-foreground">
                            {act.userName} <span className="font-normal text-muted-foreground">{getActionText(act.action)}</span>
                          </p>
                          {act.resourceName && (
                            <p className="text-xs font-semibold text-primary">{act.resourceName}</p>
                          )}
                          <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="size-3" /> {formatTimeAgo(act.timestamp)}</span>
                            <span className="flex items-center gap-1"><User className="size-3" /> {act.userCode}</span>
                          </div>
                       </div>
                    </div>
                  ))}
                  
                  {activities.length === 0 && (
                    <div className="pl-6 text-sm text-muted-foreground">
                      ยังไม่มีความเคลื่อนไหวในระบบ
                    </div>
                  )}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
