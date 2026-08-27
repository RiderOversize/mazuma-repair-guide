"use client"

import { useState, useEffect } from "react"
import { X, Loader2, Sparkles, FolderPlus, Layers, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import type { Category } from "@/lib/types"
import { createFullCategory } from "@/lib/data-service"
import { showToast, MySwal } from "@/lib/swal"
import type { UnmappedCategoryAlert } from "@/lib/activity-service"

interface CreateCategoryFromSftpModalProps {
  isOpen: boolean
  onClose: () => void
  item: UnmappedCategoryAlert | null
  categories: Category[]
  onSuccess: (syncedNow: boolean) => void
}

export function CreateCategoryFromSftpModal({
  isOpen,
  onClose,
  item,
  categories,
  onSuccess,
}: CreateCategoryFromSftpModalProps) {
  const [isNewGroup, setIsNewGroup] = useState(false)
  const [selectedGroupIndex, setSelectedGroupIndex] = useState("")
  const [newGroupIndex, setNewGroupIndex] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [subCatCode, setSubCatCode] = useState("")
  const [subCatName, setSubCatName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) {
      const rawCat = (item.categoryCode || "").trim()
      const isAlphanumericCode = /^[A-Za-z0-9]+-[A-Za-z0-9]+/.test(rawCat)
      
      // If rawCat is code format like FH-01-00
      if (isAlphanumericCode) {
        setSubCatCode(rawCat)
        setSubCatName(item.name && item.name !== rawCat ? item.name : rawCat)
        
        const prefix = rawCat.split("-")[0].toUpperCase()
        const existing = categories.find(
          (c) => (c.slug || "").toUpperCase() === prefix || (c.id || "").toUpperCase() === prefix
        )
        if (existing) {
          setIsNewGroup(false)
          setSelectedGroupIndex(existing.slug || existing.id)
        } else {
          setIsNewGroup(true)
          setNewGroupIndex(prefix)
          setNewGroupName("")
        }
      } else {
        // If rawCat is text like "เครื่องกำจัดเชื้อ", "ตัวโชว์"
        setSubCatCode("")
        setSubCatName(rawCat)
        setIsNewGroup(false)
        setSelectedGroupIndex("")
        setNewGroupIndex("")
        setNewGroupName(rawCat)
      }
    }
  }, [item, categories])

  if (!isOpen || !item) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const finalGroupIndex = isNewGroup ? newGroupIndex.trim().toUpperCase() : selectedGroupIndex.trim()
    const finalGroupName = isNewGroup ? newGroupName.trim() : (categories.find(c => c.slug === finalGroupIndex)?.name || "")
    const finalSubCatCode = subCatCode.trim()
    const finalSubCatName = subCatName.trim()

    if (!finalGroupIndex) {
      showToast("กรุณาระบุหรือเลือกกลุ่มสินค้าหลัก", "warning")
      return
    }
    if (!finalSubCatCode) {
      showToast("กรุณาระบุรหัสหมวดหมู่ SFTP", "warning")
      return
    }
    if (!finalSubCatName) {
      showToast("กรุณาระบุชื่อหมวดหมู่ย่อย", "warning")
      return
    }

    setSaving(true)
    try {
      await createFullCategory({
        isNewGroup,
        groupIndex: finalGroupIndex,
        groupName: finalGroupName,
        subCatIndex: finalSubCatCode,
        subCatName: finalSubCatName,
      })

      showToast("เพิ่มหมวดหมู่สำเร็จ กำลังดึงสินค้าเข้าระบบ...", "success")
      onClose()
      onSuccess(true)
    } catch (err: any) {
      console.error(err)
      showToast(err.message || "เกิดข้อผิดพลาดในการบันทึก", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">เพิ่มหมวดหมู่ใหม่จาก SFTP</h2>
              <p className="text-xs text-muted-foreground">บันทึกเชื่อมโยง Foreign Key ทั้ง 2 ตารางอัตโนมัติ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* SFTP Alert Meta */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 flex items-start gap-3">
            <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-semibold text-amber-700 dark:text-amber-400">
                ข้อมูลตรวจพบจาก SFTP (พบ {item.count} สินค้าที่ยังไม่ถูกนำเข้า)
              </div>
              <div className="text-muted-foreground text-[11px]">
                ตัวอย่างรหัสสินค้า: {item.sampleCodes.slice(0, 3).join(", ") || "-"}
              </div>
            </div>
          </div>

          {/* Section 1: ProductGroup (Parent Table) */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              1. กลุ่มสินค้าหลัก (ProductGroup)
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsNewGroup(false)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                  !isNewGroup
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <CheckCircle2 className={`size-3.5 ${!isNewGroup ? "opacity-100" : "opacity-0"}`} />
                เลือกกลุ่มที่มีอยู่เดิม
              </button>

              <button
                type="button"
                onClick={() => setIsNewGroup(true)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                  isNewGroup
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <FolderPlus className="size-3.5" />
                สร้างกลุ่มหลักใหม่
              </button>
            </div>

            {!isNewGroup ? (
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  เลือกกลุ่มสินค้าหลัก (Foreign Key `Index`)
                </label>
                <select
                  value={selectedGroupIndex}
                  onChange={(e) => setSelectedGroupIndex(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- กรุณาเลือกกลุ่มสินค้าหลัก --</option>
                  {categories.map((cat) => (
                    <option key={cat.id || cat.slug} value={cat.slug || cat.id}>
                      [{cat.slug || cat.id}] {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/20">
                <div className="col-span-1">
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    รหัสกลุ่ม (Index)*
                  </label>
                  <input
                    type="text"
                    value={newGroupIndex}
                    onChange={(e) => setNewGroupIndex(e.target.value.toUpperCase())}
                    placeholder="เช่น F1, F2, FA"
                    maxLength={6}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold uppercase text-foreground focus:border-primary focus:outline-none"
                    required={isNewGroup}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    ชื่อกลุ่มสินค้าหลัก (Description)*
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="เช่น เครื่องทำน้ำอุ่น-น้ำร้อน, ตู้น้ำ"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    required={isNewGroup}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: ProductCategory (Child Table) */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ArrowRight className="size-3.5 text-primary" />
              2. หมวดหมู่ย่อย (ProductCategory)
            </label>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  รหัสหมวดหมู่ SFTP (MAT Category Code)*
                </label>
                <input
                  type="text"
                  value={subCatCode}
                  onChange={(e) => setSubCatCode(e.target.value)}
                  placeholder="เช่น F1-01-00, F1-02-00"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-mono text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  ชื่อหมวดหมู่ย่อย (Description)*
                </label>
                <input
                  type="text"
                  value={subCatName}
                  onChange={(e) => setSubCatName(e.target.value)}
                  placeholder="เช่น เครื่องทำน้ำอุ่น, เครื่องกรองสแตนเลส"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  บันทึกหมวดหมู่
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
