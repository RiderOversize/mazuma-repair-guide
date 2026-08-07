"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Search,
  Boxes,
  Stethoscope
} from "lucide-react"
import type { Category, MasterDataMapping, DeviceModel, SymptomType } from "@/lib/types"
import { getCategories, getMasterDataMappings, deleteMasterDataMapping } from "@/lib/data-service"
import { logActivity } from "@/lib/activity-service"
import { showToast, confirmDelete, showAlert } from "@/lib/swal"
import { AuthUser } from "@/lib/auth"
import { GuideForm } from "./guide-form"

export function GuidesManagement({ user, initialSearch = "", initialModelId }: { user: AuthUser, initialSearch?: string, initialModelId?: string }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [mappings, setMappings] = useState<MasterDataMapping[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)

  // Edit Modal State
  const [showModal, setShowModal] = useState(!!initialModelId)
  const [editMapping, setEditMapping] = useState<MasterDataMapping | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [cats, maps] = await Promise.all([
      getCategories(), getMasterDataMappings()
    ])
    setCategories(cats)
    setMappings([...maps].reverse())
    setLoading(false)
  }

  const handleDelete = async (mapping: MasterDataMapping) => {
    const isConfirmed = await confirmDelete("ลบการจับคู่", "คุณแน่ใจหรือไม่ที่จะลบการผูกสินค้านี้?")
    if (!isConfirmed) return
    
    try {
      await deleteMasterDataMapping(mapping.id)
      await logActivity(user, "delete", "masterdata_mapping", `${mapping.modelName} -> ${mapping.symptomTypeName}`)
      await loadData()
      showToast("ลบสำเร็จ", "success")
    } catch (err: any) {
      showAlert("ลบไม่สำเร็จ", err.message, "error")
    }
  }

  const handleCreate = () => {
    setEditMapping(null)
    setShowModal(true)
  }

  const handleEdit = (mapping: MasterDataMapping) => {
    setEditMapping(mapping)
    setShowModal(true)
  }

  const handleModalFinish = () => {
    setShowModal(false)
    setEditMapping(null)
    loadData()
  }

  const filteredMappings = mappings.filter((m) => {
    const matchSearch = (m.modelName || '').toLowerCase().includes(search.toLowerCase()) || 
                        (m.modelCode || '').toLowerCase().includes(search.toLowerCase()) ||
                        (m.symptomTypeName || '').toLowerCase().includes(search.toLowerCase()) ||
                        (m.matCategoryCode || '').toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  if (loading && mappings.length === 0) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="size-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="mx-auto w-full px-4 pb-8">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl pb-4 pt-2 -mx-4 px-4 border-b border-border/40 mb-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">การผูกคู่มือสินค้า (MasterData)</h1>
            <p className="text-[13px] text-muted-foreground mt-1">จัดการผูกสินค้ากับประเภทอาการ</p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-sm active:scale-95 transition-transform"
          >
            <Plus className="size-4" />
            สร้างการจับคู่
          </button>
        </div>

        <div className="flex flex-col gap-3">
           <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="ค้นหารุ่นสินค้า หรืออาการ..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-border/50 bg-card px-10 py-3 text-[14px] outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm"
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredMappings.map((m) => (
          <div key={m.id} className="group relative flex flex-col rounded-2xl bg-card border border-border/40 p-4 shadow-sm">
             <div className="flex items-start justify-between gap-3 mb-2">
               <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] leading-tight text-foreground line-clamp-2">{m.modelName}</p>
                  <p className="text-[12px] font-medium text-primary mt-1 truncate">รหัสสินค้า: {m.modelCode}</p>
               </div>
             </div>
             
             <div className="flex items-center gap-2 mt-2 mb-4 bg-muted/30 p-2 rounded-xl border border-border/40">
               <Stethoscope className="size-4 text-rose-500 shrink-0" />
               <div className="min-w-0">
                 <p className="text-[13px] font-semibold text-foreground truncate">{m.symptomTypeName}</p>
                 <p className="text-[11px] text-muted-foreground truncate">รหัสอาการ: {m.symptomTypeCode}</p>
               </div>
             </div>
             
             <div className="flex items-center gap-2 pt-3 border-t border-border/40 mt-auto">
               <button onClick={() => handleEdit(m)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-2 text-[13px] font-bold text-primary active:scale-95 transition-transform">
                 <Edit className="size-4" /> แก้ไข
               </button>
               <button onClick={() => handleDelete(m)} className="shrink-0 inline-flex items-center justify-center rounded-xl bg-destructive/10 p-2 text-destructive active:scale-95 transition-transform">
                 <Trash2 className="size-4.5" />
               </button>
             </div>
          </div>
        ))}
        
        {filteredMappings.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center bg-card/30">
            <Boxes className="size-10 text-muted-foreground/30 mb-2" />
            <h3 className="font-display text-[15px] font-bold text-muted-foreground">ไม่พบข้อมูล</h3>
            <p className="text-[13px] text-muted-foreground/70">ลองเปลี่ยนคำค้นหา หรือเพิ่มการจับคู่ใหม่</p>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <GuideForm 
          user={user}
          editMapping={editMapping}
          initialModelIds={initialModelId && !editMapping ? [initialModelId] : undefined}
          onFinish={() => {
            setShowModal(false)
            loadData()
          }} 
        />
      )}
    </div>
  )
}
