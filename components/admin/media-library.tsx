"use client"

import { useState } from "react"
import { AuthUser } from "@/lib/auth"
import { logActivity } from "@/lib/activity-service"
import { showToast, showAlert } from "@/lib/swal"
import { UploadCloud, Image as ImageIcon, Film, Search, Filter, MoreVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

type MediaType = "image" | "video"

interface MediaFile {
  id: string
  name: string
  type: MediaType
  url: string
  thumbnailUrl: string
  size: string
  createdAt: string
}

const mockMedia: MediaFile[] = [
  { id: "md-1", name: "heater-broken.jpg", type: "image", url: "https://images.unsplash.com/photo-1585250005740-410a56247c4e", thumbnailUrl: "https://images.unsplash.com/photo-1585250005740-410a56247c4e?w=200&h=200&fit=crop", size: "1.2 MB", createdAt: "2024-03-01T10:00:00Z" },
  { id: "md-2", name: "pump-noise-test.mp4", type: "video", url: "https://drive.google.com/mock/pump", thumbnailUrl: "https://images.unsplash.com/photo-1584820927508-ea24dfc02b37?w=200&h=200&fit=crop", size: "15.4 MB", createdAt: "2024-03-05T14:30:00Z" },
  { id: "md-3", name: "board-short.jpg", type: "image", url: "https://images.unsplash.com/photo-1627918349272-9b2f2757270d", thumbnailUrl: "https://images.unsplash.com/photo-1627918349272-9b2f2757270d?w=200&h=200&fit=crop", size: "2.1 MB", createdAt: "2024-03-10T09:15:00Z" },
]

export function MediaLibrary({ user }: { user: AuthUser }) {
  const [media, setMedia] = useState<MediaFile[]>(mockMedia)
  const [activeTab, setActiveTab] = useState<MediaType | "all">("all")
  const [search, setSearch] = useState("")

  const filtered = media.filter(m => {
    const matchType = activeTab === "all" || m.type === activeTab
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const handleUploadClick = async () => {
    // Mock upload flow
    showAlert("ระบบจำลอง", "ขณะนี้เป็นระบบจำลอง การกดปุ่มนี้จะจำลองการเพิ่มรูปภาพใหม่ในคลัง", "info")
    const newMedia: MediaFile = {
      id: `md-${Date.now()}`,
      name: `upload-${Date.now()}.jpg`,
      type: "image",
      url: "https://images.unsplash.com/photo-1542013936693-884638332954",
      thumbnailUrl: "https://images.unsplash.com/photo-1542013936693-884638332954?w=200&h=200&fit=crop",
      size: "800 KB",
      createdAt: new Date().toISOString()
    }
    setMedia([newMedia, ...media])
    showToast("อัปโหลดสำเร็จ", "success")
    await logActivity(user, "create", "system", `อัปโหลดไฟล์ ${newMedia.name}`)
  }

  const handleDelete = async (id: string, name: string) => {
    setMedia(prev => prev.filter(m => m.id !== id))
    showToast("ลบไฟล์สำเร็จ", "success")
    await logActivity(user, "delete", "system", `ลบไฟล์ ${name}`)
  }

  return (
    <div className="mx-auto w-full px-4 pb-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">คลังสื่อ</h1>
          <p className="text-[13px] text-muted-foreground mt-1">จัดการรูปภาพและวิดีโอ</p>
        </div>
        <button
          type="button"
          onClick={handleUploadClick}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-sm active:scale-95 transition-transform"
        >
          <UploadCloud className="size-4" />
          อัปโหลด
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3">
         <div className="flex bg-muted p-1 rounded-xl w-full">
            <button
               onClick={() => setActiveTab("all")}
               className={cn("flex-1 px-3 py-2 text-[13px] font-semibold rounded-lg transition-all", activeTab === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            >
               ทั้งหมด
            </button>
            <button
               onClick={() => setActiveTab("image")}
               className={cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-semibold rounded-lg transition-all", activeTab === "image" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            >
               <ImageIcon className="size-4" /> รูปภาพ
            </button>
            <button
               onClick={() => setActiveTab("video")}
               className={cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-semibold rounded-lg transition-all", activeTab === "video" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            >
               <Film className="size-4" /> วิดีโอ
            </button>
         </div>

         <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาชื่อไฟล์..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border/50 bg-card px-9 py-3 text-[14px] outline-none transition-all focus:border-primary shadow-sm"
            />
         </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map(m => (
          <div key={m.id} className="group relative rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm flex flex-col">
            <div className="relative aspect-square bg-muted">
               <img src={m.thumbnailUrl} alt={m.name} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/40 opacity-0 active:opacity-100 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <button onClick={() => handleDelete(m.id, m.name)} className="p-2.5 bg-destructive text-white rounded-full active:scale-95 transition-transform shadow-md">
                   <Trash2 className="size-4" />
                 </button>
               </div>
               {m.type === "video" && (
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg p-1.5 text-white shadow-sm">
                    <Film className="size-3.5" />
                  </div>
               )}
            </div>
            <div className="p-3">
               <p className="text-[12px] font-semibold truncate text-foreground">{m.name}</p>
               <div className="flex justify-between items-center mt-1 text-[10px] text-muted-foreground">
                  <span>{m.size}</span>
                  <span>{new Date(m.createdAt).toLocaleDateString()}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
         <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border bg-card/30 mt-4">
            <ImageIcon className="size-10 text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-[15px] font-bold text-muted-foreground">ไม่พบสื่อที่ค้นหา</h3>
         </div>
      )}
    </div>
  )
}
