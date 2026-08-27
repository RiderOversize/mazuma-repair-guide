"use client"

import { useState, useEffect, useMemo } from "react"
import { AlertTriangle, Plus, Sparkles, Search, Layers, X, ExternalLink, ArrowRight } from "lucide-react"
import type { Category } from "@/lib/types"
import { getUnmappedCategoryAlerts, type UnmappedCategoryAlert } from "@/lib/activity-service"
import { CreateCategoryFromSftpModal } from "./create-category-from-sftp-modal"
import { showToast } from "@/lib/swal"

interface UnmappedCategoriesBannerProps {
  categories: Category[]
  onCategoryCreated: () => void
  onManualSyncRequest?: () => Promise<void>
}

export function UnmappedCategoriesBanner({
  categories,
  onCategoryCreated,
  onManualSyncRequest,
}: UnmappedCategoriesBannerProps) {
  const [alerts, setAlerts] = useState<UnmappedCategoryAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [isListModalOpen, setIsListModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<UnmappedCategoryAlert | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const data = await getUnmappedCategoryAlerts()
      setAlerts(data)
    } catch (err) {
      console.error("Failed to load unmapped category alerts:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = (item: UnmappedCategoryAlert) => {
    setSelectedItem(item)
    setIsCreateModalOpen(true)
  }

  const handleCreateSuccess = async (syncedNow: boolean) => {
    await loadAlerts()
    onCategoryCreated()

    if (syncedNow && onManualSyncRequest) {
      await onManualSyncRequest()
    } else if (syncedNow) {
      try {
        showToast("กำลังเริ่มดึงสินค้าจาก SFTP...", "info")
        const res = await fetch("/api/sync-sftp-to-sheets")
        const json = await res.json()
        if (json.success) {
          showToast(`Sync สำเร็จ! เพิ่มโมเดลใหม่ ${json.stats?.inserted || 0} รายการ`, "success")
          onCategoryCreated()
          loadAlerts()
        } else {
          showToast(json.error || "เกิดข้อผิดพลาดในการ Sync", "error")
        }
      } catch (e: any) {
        showToast("ไม่สามารถเรียก Sync ได้: " + e.message, "error")
      }
    }
  }

  const filteredAlerts = useMemo(() => {
    if (!searchQuery.trim()) return alerts
    const q = searchQuery.toLowerCase()
    return alerts.filter(
      (a) =>
        (a.categoryCode || "").toLowerCase().includes(q) ||
        (a.name || "").toLowerCase().includes(q) ||
        (a.sampleCodes || []).some((sc) => sc.toLowerCase().includes(q))
    )
  }, [alerts, searchQuery])

  if (isDismissed || alerts.length === 0) {
    return null
  }

  const totalUnmappedProducts = alerts.reduce((acc, curr) => acc + (curr.count || 1), 0)

  return (
    <>
      {/* Compact Notification Bar */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 p-3.5 shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-amber-950 shadow-sm animate-pulse">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  ตรวจพบหมวดหมู่ใหม่จาก SFTP ที่ยังไม่ได้ตั้งค่าในระบบ
                </span>
                <span className="rounded-full bg-amber-500/25 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                  {alerts.length} หมวด ({totalUnmappedProducts.toLocaleString()} รายการสินค้าตกหล่น)
                </span>
              </div>
              <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                สินค้าเหล่านี้ยังไม่ถูกนำเข้าสู่ระบบคู่มือซ่อมจนกว่าจะเพิ่มหมวดหมู่ให้ตรงกัน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsListModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 px-4 py-2 text-xs font-bold text-amber-950 shadow-sm transition-all"
            >
              <Layers className="size-4" />
              ดูรายการทั้งหมด ({alerts.length})
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="rounded-xl p-2 text-amber-800/60 dark:text-amber-300/60 hover:bg-amber-500/20 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
              title="ซ่อนการแจ้งเตือน"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Unmapped Categories Modal */}
      {isListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex flex-col w-full max-w-4xl max-h-[85vh] rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4 bg-muted/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Layers className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    หมวดหมู่ใหม่จาก SFTP ที่ยังไม่ได้ตั้งค่า
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                      {alerts.length} หมวด
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    รวมสินค้าตกหล่นทั้งหมด {totalUnmappedProducts.toLocaleString()} รายการ
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsListModalOpen(false)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-border/50 bg-card shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อหมวดหมู่ หรือ รหัสสินค้าตัวอย่าง..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-9 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Categories List */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  ไม่พบหมวดหมู่ที่ตรงกับคำค้นหา
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredAlerts.map((item, idx) => (
                    <div
                      key={item.categoryCode || idx}
                      className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-bold text-sm text-foreground">
                            {item.categoryCode || item.name || "ไม่ระบุชื่อหมวด"}
                          </span>
                          <span className="rounded-full bg-amber-500/15 border border-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300 shrink-0">
                            {item.count} สินค้า
                          </span>
                        </div>

                        {item.name && item.name !== item.categoryCode && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                            <span className="font-medium text-foreground/70">ตัวอย่างสินค้า:</span> {item.name}
                          </p>
                        )}

                        {item.sampleCodes && item.sampleCodes.length > 0 && (
                          <p className="text-[11px] font-mono text-muted-foreground truncate">
                            รหัส: {item.sampleCodes.slice(0, 3).join(", ")}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenCreateModal(item)}
                        className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] py-2.5 text-xs font-bold text-amber-950 shadow-xs transition-all mt-1"
                      >
                        <Plus className="size-3.5" />
                        เพิ่มหมวดนี้เข้าระบบ
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-3.5 border-t border-border/60 bg-muted/30 shrink-0">
              <button
                type="button"
                onClick={() => setIsListModalOpen(false)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form for Creating Category */}
      <CreateCategoryFromSftpModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setSelectedItem(null)
        }}
        item={selectedItem}
        categories={categories}
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}
