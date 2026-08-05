"use client"

import { useState, useEffect } from "react"
import {
  Save,
  Loader2,
  X,
  Boxes,
  Stethoscope,
  Search,
  ChevronDown
} from "lucide-react"
import { type DeviceModel, type SymptomType, type Category, type SubCategory, type MasterDataMapping } from "@/lib/types"
import { getModels, getSymptomTypes, createMasterDataMapping, updateMasterDataMapping, getCategories, getSubCategories, getMasterDataMappings } from "@/lib/data-service"
import { showToast, showAlert } from "@/lib/swal"
import type { AuthUser } from "@/lib/auth"
import { logActivity } from "@/lib/activity-service"

export function GuideForm({ 
  user, 
  editMapping,
  onFinish 
}: { 
  user?: AuthUser, 
  editMapping?: MasterDataMapping | null,
  onFinish?: () => void 
}) {
  const [models, setModels] = useState<DeviceModel[]>([])
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [selectedModelId, setSelectedModelId] = useState<string>("")
  const [selectedSymptomTypeId, setSelectedSymptomTypeId] = useState<string>("")
  
  // Custom dropdown search state
  const [modelSearch, setModelSearch] = useState("")
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [mods, symTypes, cats, subCats, maps] = await Promise.all([
      getModels(), getSymptomTypes(), getCategories(), getSubCategories(), getMasterDataMappings()
    ])
    
    // Filter out models that are already mapped
    const mappedModelCodes = new Set(maps.map(m => m.modelCode))
    if (editMapping) {
      mappedModelCodes.delete(editMapping.modelCode)
    }
    
    const availableModels = mods.filter(m => !mappedModelCodes.has(m.code))
    
    setModels(availableModels)
    setSymptomTypes(symTypes)
    setCategories(cats)
    setSubCategories(subCats)
    
    if (editMapping) {
      // Find model ID by code from available models
      const m = availableModels.find(x => x.code === editMapping.modelCode)
      if (m) {
        setSelectedModelId(m.id)
        setModelSearch(`${m.name} (${m.code})`)
      }
      
      // Symptom type code might be saved in subcategoryId
      const st = symTypes.find(x => x.subcategoryId === editMapping.symptomTypeCode || x.id === editMapping.symptomTypeCode)
      if (st) setSelectedSymptomTypeId(st.id)
    }
    
    setLoading(false)
  }

  const handleSave = async () => {
    if (!selectedModelId) return showToast("กรุณาเลือกรุ่นสินค้า", "error")
    if (!selectedSymptomTypeId) return showToast("กรุณาเลือกประเภทอาการ", "error")

    setSaving(true)
    try {
      const model = models.find(m => m.id === selectedModelId)
      const symType = symptomTypes.find(st => st.id === selectedSymptomTypeId)

      if (!model || !symType) throw new Error("ข้อมูลไม่ถูกต้อง")

      // Find category or subcategory for MAT category name
      const category = categories.find(c => c.id === model.categoryId)
      const subCategory = subCategories.find(sc => sc.id === model.subcategoryId)
      
      const matCode = subCategory?.id || category?.slug || model.categoryId
      const matName = subCategory?.name || category?.name || ""

      const mappingData = {
        modelCode: model.code,
        modelName: model.name,
        matCategoryCode: matCode,
        matCategoryName: matName,
        symptomTypeCode: symType.subcategoryId || symType.id,
        symptomTypeName: symType.name,
      }

      if (editMapping) {
        await updateMasterDataMapping(editMapping.id, mappingData as any)
        if (user) await logActivity(user, "update", "masterdata_mapping", `${mappingData.modelName} -> ${mappingData.symptomTypeName}`, editMapping.id)
        showToast("อัปเดตการผูกข้อมูลสำเร็จ", "success")
      } else {
        await createMasterDataMapping(mappingData as any)
        if (user) await logActivity(user, "create", "masterdata_mapping", `${mappingData.modelName} -> ${mappingData.symptomTypeName}`)
        showToast("บันทึกการผูกข้อมูลสำเร็จ", "success")
      }
      
      if (onFinish) onFinish()
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-3xl border border-border/50 shadow-xl overflow-visible flex flex-col max-h-[90vh]">
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
              <p className="text-[12px] text-muted-foreground mt-0.5">ผูกสินค้ารุ่นที่ต้องการเข้ากับประเภทอาการ</p>
            </div>
          </div>
          <button
            onClick={onFinish}
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
                <label className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                  <Boxes className="size-4 text-blue-500" />
                  เลือกรุ่นสินค้า (Product)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="size-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="ค้นหารุ่นสินค้า (พิมพ์เพื่อค้นหา)..."
                    value={modelSearch}
                    onChange={(e) => {
                      setModelSearch(e.target.value)
                      setIsModelDropdownOpen(true)
                      if (selectedModelId) setSelectedModelId("")
                    }}
                    onFocus={() => setIsModelDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsModelDropdownOpen(false), 200)}
                    className="w-full rounded-xl border border-border/50 bg-background pl-9 pr-10 py-3 text-[14px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </div>
                  
                  {isModelDropdownOpen && (
                    <div className="absolute z-[100] left-0 right-0 mt-1 bg-card border border-border/50 rounded-xl shadow-lg max-h-[220px] overflow-y-auto custom-scrollbar">
                      {filteredModels.length > 0 ? (
                        filteredModels.map(m => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedModelId(m.id)
                              setModelSearch(`${m.name} (${m.code})`)
                              setIsModelDropdownOpen(false)
                            }}
                            className={`px-4 py-2.5 text-[13px] cursor-pointer hover:bg-muted transition-colors border-b border-border/10 last:border-0 ${selectedModelId === m.id ? 'bg-primary/5' : ''}`}
                          >
                            <div className={`font-semibold ${selectedModelId === m.id ? 'text-primary' : 'text-foreground'}`}>{m.name}</div>
                            <div className={`text-[11px] ${selectedModelId === m.id ? 'text-primary/70' : 'text-muted-foreground'}`}>{m.code}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-[13px] text-muted-foreground text-center">ไม่พบรุ่นสินค้า</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* SymptomType Selection */}
              <div className="space-y-2.5">
                <label className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                  <Stethoscope className="size-4 text-rose-500" />
                  เลือกประเภทอาการ (Symptom Group)
                </label>
                <select
                  value={selectedSymptomTypeId}
                  onChange={(e) => setSelectedSymptomTypeId(e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-[14px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
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
            onClick={onFinish}
            disabled={saving}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || !selectedModelId || !selectedSymptomTypeId}
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
