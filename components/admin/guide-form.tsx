"use client"

import { useState, useEffect } from "react"
import {
  Save,
  Loader2,
  X,
  Boxes,
  Stethoscope,
  Search,
  ChevronDown,
  CheckCircle2
} from "lucide-react"
import { type DeviceModel, type SymptomType, type Category, type SubCategory, type MasterDataMapping } from "@/lib/types"
import { getModels, getSymptomTypes, createMasterDataMapping, bulkCreateMasterDataMappings, updateMasterDataMapping, getCategories, getSubCategories, getMasterDataMappings } from "@/lib/data-service"
import { showToast, showAlert } from "@/lib/swal"
import type { AuthUser } from "@/lib/auth"
import { logActivity } from "@/lib/activity-service"
import { cn } from "@/lib/utils"

export function GuideForm({
  user,
  editMapping,
  initialModelIds,
  onFinish
}: {
  user?: AuthUser,
  editMapping?: MasterDataMapping | null,
  initialModelIds?: string[],
  onFinish?: (optimisticMappings?: MasterDataMapping[], isEdit?: boolean) => void
}) {
  const [models, setModels] = useState<DeviceModel[]>([])
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(initialModelIds || [])
  const [selectedSymptomTypeId, setSelectedSymptomTypeId] = useState<string>("")
  const [modelSearch, setModelSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  // Custom dropdown search state
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (editMapping) {
      const st = symptomTypes.find(s => s.subcategoryId === editMapping.symptomTypeCode || s.id === editMapping.symptomTypeCode)
      if (st) setSelectedSymptomTypeId(st.id)
      const m = models.find(mod => mod.code === editMapping.modelCode)
      if (m) setSelectedModelIds([m.id])
    }
  }, [editMapping, symptomTypes, models])

  const loadData = async () => {
    setLoading(true)
    try {
      const [m, st, c, sc, mdm] = await Promise.all([
        getModels(),
        getSymptomTypes(),
        getCategories(),
        getSubCategories(),
        getMasterDataMappings()
      ])
      setModels(m)
      setSymptomTypes(st)
      setCategories(c)
      setSubCategories(sc)
      if (!editMapping && st.length > 0 && !selectedSymptomTypeId) {
        setSelectedSymptomTypeId(st[0].id)
      }
    } catch (err: any) {
      showAlert("เกิดข้อผิดพลาดในการโหลดข้อมูล", err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault()

    if (selectedModelIds.length === 0) {
      showToast("กรุณาเลือกรุ่นสินค้าอย่างน้อย 1 รุ่น", "error")
      return
    }
    if (!selectedSymptomTypeId) {
      showToast("กรุณาเลือกประเภทอาการเสีย", "error")
      return
    }

    try {
      const symType = symptomTypes.find(s => s.id === selectedSymptomTypeId)
      if (!symType) throw new Error("ข้อมูลประเภทอาการไม่ถูกต้อง")

      if (editMapping) {
        const model = models.find(m => m.id === selectedModelIds[0])
        if (!model) throw new Error("ข้อมูลสินค้ารุ่นไม่ถูกต้อง")

        const category = categories.find(c => c.slug === model.categoryId || c.id === model.categoryId || c.name === model.categoryId)
        const matCode = category?.slug || category?.id || model.code?.split("-")[0] || ""
        const matName = category?.name || model.categoryId || ""

        const mappingData: MasterDataMapping = {
          id: editMapping.id,
          modelCode: model.code,
          modelName: model.name,
          matCategoryCode: matCode,
          matCategoryName: matName,
          symptomTypeCode: symType.subcategoryId || symType.id,
          symptomTypeName: symType.name,
        }

        showToast("อัปเดตการผูกข้อมูลสำเร็จ", "success")
        if (onFinish) onFinish([mappingData], true)

        updateMasterDataMapping(editMapping.id, mappingData as any)
          .then(() => {
            if (user) logActivity(user, "update", "masterdata_mapping", `${mappingData.modelName} -> ${mappingData.symptomTypeName}`, editMapping.id)
          })
          .catch(err => {
            console.error("Failed to update mapping in background:", err)
            showToast("บันทึกลง Google Sheet ไม่สำเร็จ", "error")
          })
      } else {
        const mappingsToCreate: MasterDataMapping[] = []
        for (const modelId of selectedModelIds) {
          const model = models.find(m => m.id === modelId)
          if (!model) continue

          const category = categories.find(c => c.slug === model.categoryId || c.id === model.categoryId || c.name === model.categoryId)
          const matCode = category?.slug || category?.id || model.code?.split("-")[0] || ""
          const matName = category?.name || model.categoryId || ""

          mappingsToCreate.push({
            id: `map-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            modelCode: model.code,
            modelName: model.name,
            matCategoryCode: matCode,
            matCategoryName: matName,
            symptomTypeCode: symType.subcategoryId || symType.id,
            symptomTypeName: symType.name,
          })
        }

        showToast(`บันทึกการผูกข้อมูลสำเร็จ ${mappingsToCreate.length} รายการ`, "success")
        if (onFinish) onFinish(mappingsToCreate, false)

        if (mappingsToCreate.length > 0) {
          bulkCreateMasterDataMappings(mappingsToCreate as any)
            .then(() => {
              if (user) logActivity(user, "create", "masterdata_mapping", `ผูกสินค้า ${mappingsToCreate.length} รุ่น -> ${symType.name}`)
            })
            .catch(err => {
              console.error("Failed to create mappings in background:", err)
              showToast("บันทึกลง Google Sheet ไม่สำเร็จ", "error")
            })
        }
      }
    } catch (err: any) {
      showAlert("เกิดข้อผิดพลาด", err.message, "error")
    } finally {
      setSaving(false)
    }
  }

  const filteredModels = models.filter(m => {
    const s = modelSearch.toLowerCase()
    return m.name.toLowerCase().includes(s) || m.code.toLowerCase().includes(s)
  })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg md:max-w-2xl rounded-3xl border border-border/50 shadow-xl overflow-visible flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 p-5 bg-muted/20 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Boxes className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                {editMapping ? "แก้ไขการจับคู่" : "สร้างการจับคู่"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">ผูกสินค้ารุ่นที่ต้องการเข้ากับประเภทอาการ</p>
            </div>
          </div>
          <button
            onClick={() => onFinish && onFinish()}
            className="flex size-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-visible flex-1">
          {loading ? (
            <div className="flex h-32 flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground animate-pulse">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <div className="space-y-6 relative">
              {/* Model Selection (Searchable Dropdown) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[0.8125rem] font-semibold text-foreground flex items-center gap-2">
                    <Boxes className="size-4 text-blue-500" />
                    เลือกรุ่นสินค้า (Product) {selectedModelIds.length > 0 && !editMapping && <span className="text-muted-foreground font-normal">({selectedModelIds.length} รุ่น)</span>}
                  </label>
                  {selectedModelIds.length > 0 && !editMapping && (
                    <button
                      type="button"
                      onClick={() => setSelectedModelIds([])}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                    >
                      ล้างทั้งหมด
                    </button>
                  )}
                </div>

                {selectedModelIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1 mb-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {selectedModelIds.map(id => {
                      const m = models.find(x => x.id === id)
                      if (!m) return null;
                      return (
                        <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold border border-primary/20 shadow-sm">
                          {m.name}
                          {!editMapping && (
                            <button type="button" onClick={() => setSelectedModelIds(prev => prev.filter(x => x !== id))} className="hover:text-primary/70 hover:bg-primary/20 rounded-full p-0.5 transition-colors">
                              <X className="size-3" />
                            </button>
                          )}
                        </span>
                      )
                    })}
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="size-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    disabled={!!editMapping}
                    placeholder={editMapping ? "ไม่สามารถเปลี่ยนรุ่นสินค้าได้ในโหมดแก้ไข" : "ค้นหารุ่นสินค้า (พิมพ์เพื่อค้นหา)..."}
                    value={modelSearch}
                    onChange={(e) => {
                      setModelSearch(e.target.value)
                      setIsModelDropdownOpen(true)
                    }}
                    onFocus={() => setIsModelDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsModelDropdownOpen(false), 200)}
                    className={cn(
                      "w-full rounded-xl border border-border/50 pl-9 pr-10 py-3 text-sm outline-none transition-all shadow-sm",
                      editMapping ? "bg-muted cursor-not-allowed opacity-60 text-muted-foreground" : "bg-background focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </div>

                  {isModelDropdownOpen && (
                    <div className="absolute z-[100] left-0 right-0 mt-1 bg-card border border-border/50 rounded-xl shadow-lg max-h-[220px] overflow-y-auto custom-scrollbar">
                      {!editMapping && filteredModels.length > 0 && (
                        <div
                          onClick={() => {
                            const allFilteredIds = filteredModels.map(m => m.id)
                            const allSelected = allFilteredIds.every(id => selectedModelIds.includes(id))
                            if (allSelected) {
                              setSelectedModelIds(prev => prev.filter(id => !allFilteredIds.includes(id)))
                            } else {
                              setSelectedModelIds(prev => {
                                const newSet = new Set([...prev, ...allFilteredIds])
                                return Array.from(newSet)
                              })
                            }
                          }}
                          className="px-4 py-2.5 text-[0.8125rem] cursor-pointer hover:bg-muted transition-colors border-b border-border/50 font-bold text-primary flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-sm z-10"
                        >
                          <span>{filteredModels.every(m => selectedModelIds.includes(m.id)) ? 'ยกเลิกการเลือกทั้งหมด (Deselect All)' : 'เลือกทั้งหมด (Select All)'}</span>
                          {filteredModels.every(m => selectedModelIds.includes(m.id)) && <CheckCircle2 className="size-4" />}
                        </div>
                      )}

                      {filteredModels.length > 0 ? (
                        filteredModels.map(m => {
                          const isSelected = selectedModelIds.includes(m.id)
                          return (
                            <div
                              key={m.id}
                              onClick={() => {
                                if (editMapping) {
                                  setSelectedModelIds([m.id])
                                  setIsModelDropdownOpen(false)
                                } else {
                                  setSelectedModelIds(prev => prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id])
                                }
                              }}
                              className={`px-4 py-2.5 text-[0.8125rem] cursor-pointer hover:bg-muted transition-colors border-b border-border/10 last:border-0 ${isSelected ? 'bg-primary/5' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{m.name}</div>
                                  <div className={`text-[0.6875rem] ${isSelected ? 'text-primary/70' : 'text-muted-foreground'}`}>{m.code}</div>
                                </div>
                                {isSelected && <CheckCircle2 className="size-4 text-primary" />}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="px-4 py-4 text-[0.8125rem] text-muted-foreground text-center">ไม่พบรุ่นสินค้า</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* SymptomType Selection */}
              <div className="space-y-2.5">
                <label className="text-[0.8125rem] font-semibold text-foreground flex items-center gap-2">
                  <Stethoscope className="size-4 text-rose-500" />
                  เลือกประเภทอาการ (Symptom Group)
                </label>
                <select
                  value={selectedSymptomTypeId}
                  onChange={(e) => setSelectedSymptomTypeId(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                >
                  <option value="">-- เลือกประเภทอาการ --</option>
                  {symptomTypes.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 bg-muted/20 p-4 rounded-b-3xl flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onFinish && onFinish()}
            disabled={saving}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || selectedModelIds.length === 0 || !selectedSymptomTypeId}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? 'กำลังบันทึก...' : 'บันทึกการผูกข้อมูล'}
          </button>
        </div>
      </div>
    </div>
  )
}
