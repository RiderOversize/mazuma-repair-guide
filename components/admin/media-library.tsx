"use client"

import { useState, useEffect, useRef } from "react"
import { AuthUser } from "@/lib/auth"
import { logActivity } from "@/lib/activity-service"
import { showToast, showAlert, confirmDelete, MySwal } from "@/lib/swal"
import { getSymptomTypes, getSymptoms, getGuides, updateGuide } from "@/lib/data-service"
import { UploadCloud, Search, Trash2, Loader2, FileText, ChevronDown, LayoutGrid, Grid3X3, List, ArrowDownAZ, ArrowUpAZ, ArrowDown01, ArrowUp10, CalendarDays, ArrowDownUp, FolderPlus, Folder, ChevronRight, CheckSquare, Square, FolderUp, X, ChevronLeft, Stethoscope, AlertTriangle, FileDown, Edit, HardDrive, PlaySquare, CheckCircle2, Save } from "lucide-react"
import { cn } from "@/lib/utils"

type MediaType = "pdf" | "image" | "video" | "folder"
type ViewMode = "large" | "medium" | "list"
type SortOption = "date-desc" | "date-asc" | "name-asc" | "name-desc" | "size-desc" | "size-asc"

interface MediaFile {
  id: string
  name: string
  type: MediaType
  url: string
  thumbnailUrl: string
  size: string
  rawSize: number
  createdAt: string
}

interface Breadcrumb {
  id: string
  name: string
}

export function MediaLibrary({ user }: { user: AuthUser }) {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("large")
  const [sortBy, setSortBy] = useState<SortOption>("date-desc")
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)

  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: 'root', name: 'หน้าหลัก' }])
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id

  // Multi-select State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Move Modal State
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string>('root')
  const [moveFolders, setMoveFolders] = useState<MediaFile[]>([])
  const [isMoving, setIsMoving] = useState(false)
  const [moveBreadcrumbs, setMoveBreadcrumbs] = useState<Breadcrumb[]>([{ id: 'root', name: 'หน้าหลัก' }])

  // Drill-down Upload Modal State
  const [isDrilldownModalOpen, setIsDrilldownModalOpen] = useState(false)
  const [drillStep, setDrillStep] = useState<1 | 2 | 3 | 4>(1)

  // Master Data Cache
  const [symptomTypes, setSymptomTypes] = useState<any[]>([])
  const [symptoms, setSymptoms] = useState<any[]>([])
  const [guides, setGuides] = useState<any[]>([])
  const [isMasterDataLoaded, setIsMasterDataLoaded] = useState(false)
  const [isMasterDataLoading, setIsMasterDataLoading] = useState(false)

  // Drill-down Selections
  const [activeSymType, setActiveSymType] = useState<any>(null)
  const [activeSym, setActiveSym] = useState<any>(null)
  const [activeGuide, setActiveGuide] = useState<any>(null)
  const [guideUploadingState, setGuideUploadingState] = useState<'pdf' | 'vdo' | null>(null)
  const [videoDestination, setVideoDestination] = useState<'drive' | 'youtube'>('drive')
  const [activeTab, setActiveTab] = useState<'drive' | 'youtube'>('drive')
  
  // Edited URLs for manual linking
  const [editedMediaUrl, setEditedMediaUrl] = useState<string>('')
  const [editedPdfUrl, setEditedPdfUrl] = useState<string>('')
  const [preselectedFileForLink, setPreselectedFileForLink] = useState<MediaFile | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const viewMenuRef = useRef<HTMLDivElement>(null)
  const sortMenuRef = useRef<HTMLDivElement>(null)

  const handleApiError = (error: any, defaultMsg: string) => {
    console.error(error)
    if (error.message === "QUOTA_EXCEEDED") {
      MySwal.fire({
        title: 'โควตา YouTube เต็ม!',
        text: 'โควตาการใช้งาน YouTube API สำหรับวันนี้เต็มแล้ว กรุณารอวันพรุ่งนี้ (รีเซ็ตเวลา 14:00 น. ตามเวลาไทย) หรือทำการขอขยายโควตากับทาง Google',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        customClass: {
          popup: "rounded-2xl border border-border bg-card text-foreground shadow-xl",
          title: "font-display text-xl font-bold text-foreground",
          htmlContainer: "text-sm text-muted-foreground",
          confirmButton: "rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors",
        },
        buttonsStyling: false
      })
    } else {
      showAlert("เกิดข้อผิดพลาด", error.message || defaultMsg, "error")
    }
  }

  const fetchMedia = async (folderId: string, tab: 'drive' | 'youtube' = activeTab) => {
    setIsLoading(true)
    try {
      const url = tab === 'youtube' 
        ? '/api/media/youtube'
        : (folderId === 'root' ? '/api/media' : `/api/media?folderId=${folderId}`)
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        setMedia(data.files)
      } else {
        throw new Error(data.error || "Failed to load files")
      }
    } catch (error: any) {
      handleApiError(error, "ไม่สามารถดึงข้อมูลไฟล์ได้")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia(currentFolderId, activeTab)
    setSelectedIds(new Set()) // Clear selection on folder/tab change
    if (!isMasterDataLoaded) {
      loadMasterData()
    }
  }, [currentFolderId, activeTab])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
        setIsViewMenuOpen(false)
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = media
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      switch (sortBy) {
        case "name-asc": return a.name.localeCompare(b.name, 'th')
        case "name-desc": return b.name.localeCompare(a.name, 'th')
        case "size-asc": return a.rawSize - b.rawSize
        case "size-desc": return b.rawSize - a.rawSize
        case "date-asc": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "date-desc":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(m => m.id)))
    }
  }

  const handleUploadClick = () => {
    setIsDrilldownModalOpen(true)
    setDrillStep(1)
    setActiveSymType(null)
    setActiveSym(null)
    setActiveGuide(null)
    setPreselectedFileForLink(null)
    if (!isMasterDataLoaded) {
      loadMasterData()
    }
  }

  const handleBadgeClick = async (e: React.MouseEvent, m: MediaFile, isLinked: boolean) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (isLinked) {
      const isConfirmed = await MySwal.fire({
        title: 'ยืนยันการแก้ไข',
        text: 'ไฟล์นี้มีการผูกกับคู่มือไว้แล้ว คุณต้องการเปิดฟอร์มเพื่อแก้ไขการผูกหรือไม่?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ใช่, แก้ไข',
        cancelButtonText: 'ยกเลิก',
        customClass: {
          popup: "rounded-2xl border border-border bg-card text-foreground shadow-xl",
          title: "font-display text-xl font-bold text-foreground",
          htmlContainer: "text-sm text-muted-foreground",
          confirmButton: "rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors",
          cancelButton: "rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition-colors",
          actions: "gap-2",
        },
        buttonsStyling: false,
      })
      if (!isConfirmed.isConfirmed) return
    }
    
    setPreselectedFileForLink(m)
    setIsDrilldownModalOpen(true)
    setDrillStep(1)
    setActiveSymType(null)
    setActiveSym(null)
    setActiveGuide(null)
    if (!isMasterDataLoaded) {
      loadMasterData()
    }
  }

  const loadMasterData = async () => {
    setIsMasterDataLoading(true)
    try {
      const [st, sym, g] = await Promise.all([
        getSymptomTypes(),
        getSymptoms(),
        getGuides()
      ])
      setSymptomTypes(st)
      setSymptoms(sym)
      setGuides(g)
      setIsMasterDataLoaded(true)
    } catch (e) {
      console.error(e)
    } finally {
      setIsMasterDataLoading(false)
    }
  }

  const handleGuideUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'vdo') => {
    const file = e.target.files?.[0]
    if (!file || !activeGuide) return

    const existingUrl = type === 'pdf' ? activeGuide.pdfUrl : activeGuide.mediaUrl
    if (existingUrl) {
      const isConfirmed = await MySwal.fire({
        title: 'มีข้อมูลอยู่แล้ว',
        text: `หัวข้อนี้มีลิงก์ ${type.toUpperCase()} อยู่แล้ว คุณต้องการอัปโหลดและบันทึกทับข้อมูลเดิมหรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'บันทึกทับ',
        cancelButtonText: 'ยกเลิก',
        customClass: {
          popup: "rounded-2xl border border-border bg-card text-foreground shadow-xl",
          title: "font-display text-xl font-bold text-foreground",
          htmlContainer: "text-sm text-muted-foreground",
          confirmButton: "rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors",
          cancelButton: "rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition-colors",
          actions: "gap-2",
        },
        buttonsStyling: false,
      })
      if (!isConfirmed.isConfirmed) {
        e.target.value = "" // Reset input
        return
      }
    }

    setGuideUploadingState(type)
    MySwal.fire({
      title: `กำลังอัปโหลด ${type.toUpperCase()}...`,
      text: 'กรุณารอสักครู่',
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading()
      }
    })

    try {
      let fileUrl = "";
      
      if (type === 'vdo' && videoDestination === 'youtube') {
        // 1. Get YouTube resumable upload session
        const sessionRes = await fetch('/api/upload/youtube/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size }),
        })
        const sessionData = await sessionRes.json()
        if (!sessionRes.ok) throw new Error(sessionData.error || 'Failed to initialize YouTube upload')

        // 2. Upload directly to YouTube
        const uploadRes = await fetch(sessionData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type, 'Content-Length': file.size.toString() },
          body: file,
        })
        if (!uploadRes.ok) throw new Error('Upload to YouTube failed')
        const data = await uploadRes.json()
        fileUrl = `https://www.youtube.com/watch?v=${data.id}`
      } else {
        // 1. Get Google Drive resumable upload session URL from our backend
        const sessionRes = await fetch('/api/upload/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, mimeType: file.type, folderId: currentFolderId !== 'root' ? currentFolderId : undefined }),
        })

        const sessionData = await sessionRes.json()
        if (!sessionRes.ok) throw new Error(sessionData.error || 'Failed to initialize Drive upload')

        // 2. Upload directly to Google Drive (Bypassing Vercel's 4.5MB limit)
        const uploadRes = await fetch(sessionData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        })

        if (!uploadRes.ok) throw new Error('Upload to Google Drive failed')

        const data = await uploadRes.json()
        fileUrl = data.webViewLink
      }

      const updateData = type === 'pdf' ? { pdfUrl: fileUrl } : { mediaUrl: fileUrl }
      const updatedGuide = await updateGuide(activeGuide.id, updateData)

      // Update local guides state
      setGuides(prev => prev.map(g => g.id === updatedGuide.id ? updatedGuide : g))
      setActiveGuide(updatedGuide)

      showAlert("สำเร็จ", `อัปโหลดและผูก ${type.toUpperCase()} สำเร็จ!`, "success")
      await logActivity(user, "update", "guide", `ผูกไฟล์ ${type.toUpperCase()} กับคู่มือ: ${updatedGuide.title}`)
      fetchMedia(currentFolderId)
    } catch (error: any) {
      handleApiError(error, "ไม่สามารถอัปโหลดไฟล์ได้")
    } finally {
      setGuideUploadingState(null)
      e.target.value = "" // Reset input
    }
  }

  const handleSaveManualUrl = async (type: 'pdf' | 'vdo', url: string) => {
    if (!activeGuide) return
    setGuideUploadingState(type)
    
    MySwal.fire({
      title: 'กำลังบันทึกข้อมูล...',
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading()
      }
    })

    try {
      const updateData = type === 'pdf' ? { pdfUrl: url } : { mediaUrl: url }
      const updatedGuide = await updateGuide(activeGuide.id, updateData)

      // Update local guides state
      setGuides(prev => prev.map(g => g.id === updatedGuide.id ? updatedGuide : g))
      setActiveGuide(updatedGuide)
      if (type === 'pdf') setEditedPdfUrl(updatedGuide.pdfUrl || '')
      if (type === 'vdo') setEditedMediaUrl(updatedGuide.mediaUrl || '')

      showAlert("สำเร็จ", "บันทึกการแก้ไขลิงก์สำเร็จ!", "success")
      await logActivity(user, "update", "guide", `แก้ไขลิงก์ ${type.toUpperCase()} ในคู่มือ: ${updatedGuide.title}`)
      fetchMedia(currentFolderId)
    } catch (error: any) {
      handleApiError(error, "ไม่สามารถบันทึกข้อมูลได้")
    } finally {
      setGuideUploadingState(null)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    MySwal.fire({
      title: 'กำลังอัปโหลดไฟล์...',
      text: 'กรุณารอสักครู่',
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading()
      }
    })

    try {
      if (activeTab === 'youtube') {
        const sessionRes = await fetch('/api/upload/youtube/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size }),
        })
        const sessionData = await sessionRes.json()
        if (!sessionRes.ok) throw new Error(sessionData.error || 'Failed to initialize YouTube upload')

        const uploadRes = await fetch(sessionData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type, 'Content-Length': file.size.toString() },
          body: file,
        })
        if (!uploadRes.ok) throw new Error('Upload to YouTube failed')
        
        showAlert("สำเร็จ", "อัปโหลดวิดีโอขึ้น YouTube สำเร็จ", "success")
        await logActivity(user, "create", "system", `อัปโหลดวิดีโอเข้า YouTube: ${file.name}`)
      } else {
        // 1. Get resumable upload session URL from our backend
        const sessionRes = await fetch('/api/upload/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, mimeType: file.type, folderId: currentFolderId !== 'root' ? currentFolderId : undefined }),
        })

        const sessionData = await sessionRes.json()
        if (!sessionRes.ok) throw new Error(sessionData.error || 'Failed to initialize upload')

        // 2. Upload directly to Google Drive (Bypassing Vercel's 4.5MB limit)
        const uploadRes = await fetch(sessionData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        })

        if (!uploadRes.ok) throw new Error('Upload to Google Drive failed')

        showAlert("สำเร็จ", "อัปโหลดไฟล์สำเร็จ", "success")
        await logActivity(user, "create", "system", `อัปโหลดเอกสาร ${file.name}`)
      }
      fetchMedia(currentFolderId, activeTab)
    } catch (error: any) {
      handleApiError(error, "ไม่สามารถอัปโหลดไฟล์ได้")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleCreateFolder = async () => {
    const { value: folderName } = await MySwal.fire({
      title: 'สร้างโฟลเดอร์ใหม่',
      input: 'text',
      inputPlaceholder: 'ชื่อโฟลเดอร์',
      showCancelButton: true,
      confirmButtonText: 'สร้าง',
      cancelButtonText: 'ยกเลิก',
      inputValidator: (value) => {
        if (!value) {
          return 'กรุณาระบุชื่อโฟลเดอร์!'
        }
      }
    })

    if (folderName) {
      setIsCreatingFolder(true)
      MySwal.fire({
        title: 'กำลังสร้างโฟลเดอร์...',
        allowOutsideClick: false,
        didOpen: () => {
          MySwal.showLoading()
        }
      })
      try {
        const res = await fetch("/api/media/folder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: folderName,
            parentId: currentFolderId === 'root' ? null : currentFolderId
          })
        })

        if (res.ok) {
          showAlert("สำเร็จ", "สร้างโฟลเดอร์สำเร็จ", "success")
          fetchMedia(currentFolderId)
        } else {
          const data = await res.json()
          throw new Error(data.error)
        }
      } catch (error: any) {
        console.error(error)
        showAlert("เกิดข้อผิดพลาด", error.message || "ไม่สามารถสร้างโฟลเดอร์ได้", "error")
      } finally {
        setIsCreatingFolder(false)
      }
    }
  }

  const handleRename = async () => {
    if (selectedIds.size !== 1) return
    const fileId = Array.from(selectedIds)[0]
    const file = media.find(m => m.id === fileId)
    if (!file) return

    const { value: newName } = await MySwal.fire({
      title: 'เปลี่ยนชื่อ',
      input: 'text',
      inputValue: file.name,
      inputPlaceholder: 'กรอกชื่อใหม่...',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      inputValidator: (value) => {
        if (!value) return 'กรุณาระบุชื่อ!'
      }
    })

    if (newName && newName !== file.name) {
      MySwal.fire({
        title: 'กำลังเปลี่ยนชื่อ...',
        allowOutsideClick: false,
        didOpen: () => {
          MySwal.showLoading()
        }
      })

      try {
        const url = activeTab === 'youtube' ? "/api/media/youtube" : "/api/media/rename"
        const res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activeTab === 'youtube' ? { id: fileId, name: newName } : { fileId, newName })
        })

        if (res.ok) {
          showAlert("สำเร็จ", "เปลี่ยนชื่อสำเร็จ", "success")
          fetchMedia(currentFolderId, activeTab)
        } else {
          const data = await res.json()
          throw new Error(data.error)
        }
      } catch (error: any) {
        handleApiError(error, "ไม่สามารถเปลี่ยนชื่อได้")
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    const isConfirmed = await confirmDelete(`คุณต้องการลบ ${selectedIds.size} รายการที่เลือก ใช่หรือไม่?`, "ข้อมูลที่ลบจะไม่สามารถกู้คืนได้ และหากไฟล์นี้ถูกผูกไว้ในคู่มือ ลิงก์ในคู่มือจะถูกลบออกด้วย")
    if (!isConfirmed) return

    MySwal.fire({
      title: 'กำลังลบ...',
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading()
      }
    })
    try {
      const idsParam = Array.from(selectedIds).join(',')
      const url = activeTab === 'youtube' ? `/api/media/youtube?ids=${idsParam}` : `/api/media?ids=${idsParam}`
      const res = await fetch(url, {
        method: "DELETE"
      })

      if (res.ok) {
        setMedia(prev => prev.filter(m => !selectedIds.has(m.id)))
        setSelectedIds(new Set())
        showAlert("สำเร็จ", "ลบสำเร็จ", "success")
        await logActivity(user, "delete", "system", `ลบข้อมูลจำนวน ${selectedIds.size} รายการ`)
      } else {
        const data = await res.json()
        throw new Error(data.error)
      }
    } catch (error: any) {
      handleApiError(error, "ไม่สามารถลบได้")
    }
  }

  // --- Move Modal Logic ---
  const handleOpenMoveModal = async () => {
    if (selectedIds.size === 0) return
    const isConfirmed = await MySwal.fire({
      title: 'ยืนยันการย้าย',
      text: `คุณต้องการย้าย ${selectedIds.size} รายการที่เลือก ใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'เลือกปลายทาง',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        popup: "rounded-2xl border border-border bg-card text-foreground shadow-xl",
        title: "font-display text-xl font-bold text-foreground",
        htmlContainer: "text-sm text-muted-foreground",
        confirmButton: "rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors",
        cancelButton: "rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition-colors",
        actions: "gap-2",
      },
      buttonsStyling: false,
    })
    if (!isConfirmed.isConfirmed) return

    setIsMoveModalOpen(true)
    setMoveBreadcrumbs([{ id: 'root', name: 'หน้าหลัก' }])
    fetchMoveFolders('root')
  }

  const fetchMoveFolders = async (folderId: string) => {
    try {
      const url = folderId === 'root' ? '/api/media' : `/api/media?folderId=${folderId}`
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        // Filter out non-folders and the currently selected folders (cannot move a folder into itself)
        setMoveFolders(data.files.filter((f: MediaFile) => f.type === 'folder' && !selectedIds.has(f.id)))
      }
    } catch (error) {
      console.error("Error fetching folders for move", error)
    }
  }

  const navigateMoveFolder = (id: string, name: string) => {
    setMoveTargetFolderId(id)
    setMoveBreadcrumbs(prev => [...prev, { id, name }])
    fetchMoveFolders(id)
  }

  const navigateMoveBreadcrumb = (index: number) => {
    const target = moveBreadcrumbs[index]
    setMoveTargetFolderId(target.id)
    setMoveBreadcrumbs(prev => prev.slice(0, index + 1))
    fetchMoveFolders(target.id)
  }

  const handleConfirmMove = async () => {
    if (selectedIds.size === 0) return

    // Prevent moving to the exact same folder they are currently in
    if (moveTargetFolderId === currentFolderId) {
      setIsMoveModalOpen(false)
      setSelectedIds(new Set())
      return
    }

    setIsMoving(true)
    MySwal.fire({
      title: 'กำลังย้ายข้อมูล...',
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading()
      }
    })

    try {
      const res = await fetch("/api/media/move", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileIds: Array.from(selectedIds),
          newParentId: moveTargetFolderId === 'root' ? null : moveTargetFolderId
        })
      })

      if (res.ok) {
        showAlert("สำเร็จ", "ย้ายข้อมูลสำเร็จ", "success")
        setSelectedIds(new Set())
        setIsMoveModalOpen(false)
        fetchMedia(currentFolderId)
      } else {
        const data = await res.json()
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error(error)
      showAlert("เกิดข้อผิดพลาด", error.message || "ไม่สามารถย้ายข้อมูลได้", "error")
    } finally {
      setIsMoving(false)
    }
  }

  const navigateToFolder = (id: string, name: string) => {
    // If selecting multiple, don't navigate on card click
    setBreadcrumbs(prev => [...prev, { id, name }])
  }

  const navigateToBreadcrumb = (index: number) => {
    setBreadcrumbs(prev => prev.slice(0, index + 1))
  }

  const getGridClass = () => {
    if (viewMode === "large") return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
    if (viewMode === "medium") return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
    return "flex flex-col gap-2"
  }

  const renderFileThumbnail = (m: MediaFile) => {
    if (m.thumbnailUrl) {
      return (
        <>
          <div className="w-full h-full p-2 flex items-center justify-center relative z-10 pointer-events-none">
            <img
              src={m.thumbnailUrl}
              alt={m.name}
              className="max-w-full max-h-full object-contain drop-shadow-md bg-white pointer-events-auto"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0';
              }}
            />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10 text-primary/40 gap-2 z-0 pointer-events-none">
            <FileText className={viewMode === "large" ? "size-16" : "size-10"} />
            <span className="text-xs font-semibold">PDF</span>
          </div>
        </>
      )
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/10 text-primary/40 gap-2 pointer-events-none">
        <FileText className={viewMode === "large" ? "size-16" : "size-10"} />
        <span className="text-xs font-semibold">PDF</span>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full px-4 pb-24">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">คลังสื่อ (PDF/Video)</h1>
          
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4 bg-muted/50 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('drive')}
              className={cn("px-4 py-2 text-[13px] font-semibold rounded-lg transition-all", activeTab === 'drive' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              Google Drive
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={cn("px-4 py-2 text-[13px] font-semibold rounded-lg transition-all", activeTab === 'youtube' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              YouTube
            </button>
          </div>

          {/* Breadcrumbs */}
          {activeTab === 'drive' && (
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground overflow-x-auto pb-1">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center gap-1.5 shrink-0">
                  {index > 0 && <ChevronRight className="size-3.5 opacity-50" />}
                  <button
                    onClick={() => navigateToBreadcrumb(index)}
                    className={cn(
                      "hover:text-primary transition-colors hover:underline",
                      index === breadcrumbs.length - 1 && "font-semibold text-foreground pointer-events-none"
                    )}
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept={activeTab === 'youtube' ? "video/*" : ".pdf,application/pdf"}
        />

        <div className="flex items-center gap-2">
          {activeTab === 'drive' && (
            <button
              type="button"
              onClick={handleCreateFolder}
              disabled={isCreatingFolder}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[13px] font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/80 active:scale-95 transition-all disabled:opacity-50"
            >
              {isCreatingFolder ? <Loader2 className="size-4 animate-spin" /> : <FolderPlus className="size-4" />}
              สร้างโฟลเดอร์
            </button>
          )}
          {activeTab === 'drive' ? (
            <button
              type="button"
              onClick={handleUploadClick}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm active:scale-95 transition-transform"
            >
              <UploadCloud className="size-4" />
              อัปโหลดเอกสาร
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUploadClick}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all"
            >
              <UploadCloud className="size-4" />
              อัปโหลดวิดีโอผูกกับคู่มือ
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาชื่อเอกสารหรือโฟลเดอร์..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/50 bg-card px-9 py-2.5 text-[14px] outline-none transition-all focus:border-primary shadow-sm"
          />
        </div>

        <div className="flex w-full sm:w-auto gap-2">
          <button
            onClick={selectAll}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card border border-border/50 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-foreground shadow-sm hover:border-border transition-colors"
          >
            {selectedIds.size === filtered.length && filtered.length > 0 ? (
              <><CheckSquare className="size-4 text-primary" /> ยกเลิก</>
            ) : (
              <><Square className="size-4 text-muted-foreground" /> เลือกทั้งหมด</>
            )}
          </button>

          {/* Sort Options Dropdown */}
          <div className="relative flex-1 sm:flex-initial" ref={sortMenuRef}>
            <button
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-2 bg-card border border-border/50 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-foreground shadow-sm hover:border-border transition-colors"
            >
              <span className="flex items-center gap-2">
                <ArrowDownUp className="size-4 text-muted-foreground" />
                จัดเรียง
              </span>
              <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isSortMenuOpen && "rotate-180")} />
            </button>

            {isSortMenuOpen && (
              <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-1.5 w-48 bg-card border border-border/50 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold text-muted-foreground uppercase px-3 py-1.5">เรียงตามวันที่</div>
                <button
                  onClick={() => { setSortBy("date-desc"); setIsSortMenuOpen(false); }}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg transition-colors", sortBy === "date-desc" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground")}
                >
                  <CalendarDays className="size-4" /> ใหม่สุดไปเก่าสุด
                </button>
                <button
                  onClick={() => { setSortBy("date-asc"); setIsSortMenuOpen(false); }}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg transition-colors", sortBy === "date-asc" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground")}
                >
                  <CalendarDays className="size-4" /> เก่าสุดไปใหม่สุด
                </button>

                <div className="border-t border-border/50 my-1"></div>

                <div className="text-[10px] font-bold text-muted-foreground uppercase px-3 py-1.5">เรียงตามชื่อ</div>
                <button
                  onClick={() => { setSortBy("name-asc"); setIsSortMenuOpen(false); }}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg transition-colors", sortBy === "name-asc" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground")}
                >
                  <ArrowDownAZ className="size-4" /> A-Z, ก-ฮ
                </button>
                <button
                  onClick={() => { setSortBy("name-desc"); setIsSortMenuOpen(false); }}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg transition-colors", sortBy === "name-desc" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground")}
                >
                  <ArrowUpAZ className="size-4" /> Z-A, ฮ-ก
                </button>
              </div>
            )}
          </div>

          {/* View Options Dropdown */}
          <div className="relative flex-1 sm:flex-initial" ref={viewMenuRef}>
            <button
              onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-2 bg-card border border-border/50 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-foreground shadow-sm hover:border-border transition-colors"
            >
              <span className="flex items-center gap-2">
                {viewMode === "large" && <LayoutGrid className="size-4" />}
                {viewMode === "medium" && <Grid3X3 className="size-4" />}
                {viewMode === "list" && <List className="size-4" />}
                <span className="hidden sm:inline">มุมมอง</span>
              </span>
              <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isViewMenuOpen && "rotate-180")} />
            </button>

            {isViewMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-card border border-border/50 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { setViewMode("large"); setIsViewMenuOpen(false); }}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg transition-colors", viewMode === "large" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground")}
                >
                  <LayoutGrid className="size-4" /> ไอคอนขนาดใหญ่
                </button>
                <button
                  onClick={() => { setViewMode("medium"); setIsViewMenuOpen(false); }}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg transition-colors", viewMode === "medium" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground")}
                >
                  <Grid3X3 className="size-4" /> ไอคอนขนาดกลาง
                </button>
                <button
                  onClick={() => { setViewMode("list"); setIsViewMenuOpen(false); }}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg transition-colors", viewMode === "list" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground")}
                >
                  <List className="size-4" /> รายละเอียด (List)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Loader2 className="size-8 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground text-sm">กำลังโหลดข้อมูลจาก Google Drive...</p>
        </div>
      ) : (
        <div className={getGridClass()}>
          {filtered.map(m => {
            const isFolder = m.type === 'folder';
            const isSelected = selectedIds.has(m.id);
            const isLinked = guides.some(g => g.mediaUrl === m.url || g.pdfUrl === m.url);

            if (viewMode === "list") {
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-colors shadow-sm gap-4 cursor-pointer group",
                    isSelected ? "border-primary bg-primary/5" : "border-border/40 bg-card hover:border-primary/30"
                  )}
                  onClick={(e) => {
                    if (selectedIds.size > 0) {
                      toggleSelection(m.id, e);
                    } else {
                      isFolder ? navigateToFolder(m.id, m.name) : window.open(m.url, '_blank');
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={(e) => toggleSelection(m.id, e)}
                      className={cn("p-1.5 rounded-md transition-colors", isSelected ? "text-primary" : "text-muted-foreground/30 group-hover:text-muted-foreground")}
                    >
                      {isSelected ? <CheckSquare className="size-5" /> : <Square className="size-5" />}
                    </button>
                    <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", isFolder ? "bg-amber-100" : "bg-red-100")}>
                      {isFolder ? <Folder className="size-5 text-amber-600" /> : <FileText className="size-5 text-red-600" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-semibold text-foreground truncate hover:text-primary transition-colors" title={m.name}>{m.name}</span>
                      <span className="text-[11px] text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {!isFolder && (
                      <button
                        onClick={(e) => handleBadgeClick(e, m, isLinked)}
                        className={cn(
                          "text-[11px] font-semibold px-2 py-0.5 rounded-full hidden sm:inline-flex hover:opacity-80 transition-opacity active:scale-95 cursor-pointer",
                          isLinked ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        )}>
                        {isLinked ? "ผูกคู่มือแล้ว" : "ยังไม่ผูก"}
                      </button>
                    )}
                    <span className="text-[12px] text-muted-foreground hidden sm:block">{isFolder ? '-' : m.size}</span>
                  </div>
                </div>
              )
            }

            // Grid Views (Large or Medium)
            if (isFolder) {
              return (
                <div
                  key={m.id}
                  onClick={(e) => {
                    if (selectedIds.size > 0) toggleSelection(m.id, e);
                    else navigateToFolder(m.id, m.name);
                  }}
                  className={cn(
                    "group relative rounded-xl border shadow-sm transition-all cursor-pointer",
                    isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border/50 bg-card hover:border-primary/40 hover:shadow-md"
                  )}
                >
                  <button
                    onClick={(e) => toggleSelection(m.id, e)}
                    className={cn(
                      "absolute top-2 right-2 p-1 rounded-md z-10 transition-opacity",
                      isSelected ? "text-primary opacity-100" : "text-muted-foreground/50 opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {isSelected ? <CheckSquare className="size-5 bg-background" /> : <Square className="size-5 bg-background" />}
                  </button>
                  <div className="flex items-center gap-3 p-4">
                    <Folder className="size-8 text-amber-500 shrink-0 fill-amber-100" strokeWidth={1.5} />
                    <p className="font-semibold truncate text-foreground flex-1 text-[14px]" title={m.name}>
                      {m.name}
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={m.id}
                onClick={(e) => {
                  if (selectedIds.size > 0) toggleSelection(m.id, e);
                  else window.open(m.url, '_blank');
                }}
                className={cn(
                  "group relative rounded-xl border overflow-hidden shadow-sm flex flex-col transition-shadow cursor-pointer",
                  isSelected ? "border-primary shadow-md ring-1 ring-primary" : "border-border/50 bg-card hover:shadow-md"
                )}
              >
                {/* Header */}
                <div className={cn("flex items-center gap-2 p-2.5 border-b border-border/30", isSelected ? "bg-primary/10" : "bg-background/50")}>
                  <button
                    onClick={(e) => toggleSelection(m.id, e)}
                    className={cn(
                      "p-0.5 rounded-md transition-opacity shrink-0",
                      isSelected ? "text-primary opacity-100" : "text-muted-foreground/50 opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {isSelected ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
                  </button>
                  <FileText className={cn("size-4 shrink-0", isSelected ? "text-primary" : "text-red-500")} />
                  <p className={cn("font-semibold truncate text-foreground flex-1", viewMode === "large" ? "text-[13px]" : "text-[11px]")} title={m.name}>
                    {m.name}
                  </p>
                </div>

                {/* Preview Body */}
                <div className="relative aspect-[4/3] bg-muted/20 flex flex-col items-center justify-center overflow-hidden hover:bg-muted/40 transition-colors pointer-events-none">
                  {renderFileThumbnail(m)}
                  
                  {/* Link Status Badge */}
                  <div className="absolute top-2 right-2 z-20 pointer-events-auto">
                    {isLinked ? (
                      <button onClick={(e) => handleBadgeClick(e, m, isLinked)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/90 text-white text-[10px] font-semibold backdrop-blur-sm shadow-sm hover:bg-green-600 transition-colors cursor-pointer" title="คลิกเพื่อแก้ไขการผูก">
                        <CheckCircle2 className="size-3" /> ผูกแล้ว
                      </button>
                    ) : (
                      <button onClick={(e) => handleBadgeClick(e, m, isLinked)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 text-muted-foreground text-[10px] font-semibold backdrop-blur-sm border border-border/50 shadow-sm hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-pointer" title="คลิกเพื่อผูกกับคู่มือ">
                        <AlertTriangle className="size-3" /> ยังไม่ผูก
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border bg-card/30 mt-4">
              <Folder className="size-10 text-muted-foreground/30 mb-3" />
              <h3 className="font-display text-[15px] font-bold text-muted-foreground">โฟลเดอร์ว่างเปล่า หรือไม่พบข้อมูลที่ค้นหา</h3>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-popover border border-border shadow-2xl rounded-full px-4 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-[13px] font-bold text-foreground px-2 whitespace-nowrap">
            เลือกไว้ {selectedIds.size} รายการ
          </span>
          <div className="h-6 w-px bg-border"></div>
          {selectedIds.size === 1 && (
            <button
              onClick={handleRename}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-secondary text-[13px] font-semibold text-foreground transition-colors whitespace-nowrap"
            >
              <Edit className="size-4" /> เปลี่ยนชื่อ
            </button>
          )}
          <button
            onClick={handleOpenMoveModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-secondary text-[13px] font-semibold text-foreground transition-colors whitespace-nowrap"
          >
            <FolderUp className="size-4" /> ย้าย
          </button>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-destructive/10 text-[13px] font-semibold text-destructive transition-colors whitespace-nowrap"
          >
            <Trash2 className="size-4" /> ลบ
          </button>
          <div className="h-6 w-px bg-border"></div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors shrink-0"
            title="ยกเลิกการเลือก"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Move Folder Modal */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h2 className="font-bold text-[15px] flex items-center gap-2">
                <FolderUp className="size-4 text-primary" /> เลือกปลายทาง
              </h2>
              <button onClick={() => setIsMoveModalOpen(false)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 bg-background">
              {/* Modal Breadcrumbs */}
              <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground overflow-x-auto pb-3 mb-2 border-b border-border/50">
                {moveBreadcrumbs.map((crumb, index) => (
                  <div key={crumb.id} className="flex items-center gap-1.5 shrink-0">
                    {index > 0 && <ChevronRight className="size-3.5 opacity-50" />}
                    <button
                      onClick={() => navigateMoveBreadcrumb(index)}
                      className={cn(
                        "hover:text-primary transition-colors hover:underline",
                        index === moveBreadcrumbs.length - 1 && "font-semibold text-foreground pointer-events-none"
                      )}
                    >
                      {crumb.name}
                    </button>
                  </div>
                ))}
              </div>

              {/* Folder List */}
              <div className="h-60 overflow-y-auto pr-2 space-y-1">
                {moveFolders.map(f => (
                  <button
                    key={f.id}
                    onClick={() => navigateMoveFolder(f.id, f.name)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Folder className="size-5 text-amber-500 shrink-0" />
                    <span className="text-[13px] font-semibold text-foreground truncate">{f.name}</span>
                    <ChevronRight className="size-4 text-muted-foreground/50 ml-auto" />
                  </button>
                ))}

                {moveFolders.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 gap-2">
                    <Folder className="size-8" />
                    <span className="text-[12px]">ไม่มีโฟลเดอร์ย่อย</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-2">
              <button
                onClick={() => setIsMoveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmMove}
                disabled={isMoving || moveTargetFolderId === currentFolderId}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isMoving ? <Loader2 className="size-4 animate-spin" /> : null}
                ย้ายมาที่นี่
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drill-down Upload Modal */}
      {isDrilldownModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
              <div className="flex items-center gap-3">
                {drillStep > 1 && (
                  <button
                    onClick={() => {
                      if (drillStep === 2) setDrillStep(1)
                      if (drillStep === 3) setDrillStep(2)
                      if (drillStep === 4) setDrillStep(3)
                    }}
                    className="p-1.5 rounded-md hover:bg-muted text-foreground transition-colors flex items-center gap-1 text-[13px] font-semibold"
                  >
                    <ChevronLeft className="size-4" /> ย้อนกลับ
                  </button>
                )}
                <div>
                  <h2 className="font-bold text-[16px] text-foreground flex items-center gap-2">
                    {drillStep === 1 && (preselectedFileForLink ? "เลือกคู่มือที่ต้องการผูก" : "จัดการอาการเสียและวิธีตรวจสอบ")}
                    {drillStep === 2 && activeSymType?.name}
                    {drillStep === 3 && activeSym?.title}
                    {drillStep === 4 && "แก้ไขหัวข้อการตรวจสอบ"}
                  </h2>
                  {drillStep === 1 && <p className="text-[12px] text-muted-foreground mt-0.5">{preselectedFileForLink ? "เลือกกลุ่มอาการที่ต้องการเชื่อมโยง" : "Symptom Group ทั้งหมด"}</p>}
                  {drillStep === 2 && <p className="text-[12px] text-muted-foreground mt-0.5">อาการเสียย่อยและหัวข้อการตรวจสอบที่ผูกกับ Symptom Group นี้</p>}
                  {drillStep === 3 && <p className="text-[12px] text-muted-foreground mt-0.5">หัวข้อการตรวจสอบแก้ไขที่เกี่ยวข้องกับ Issue นี้</p>}
                </div>
              </div>
              <button onClick={() => setIsDrilldownModalOpen(false)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors shrink-0">
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-0 bg-background">
              {isMasterDataLoading ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <Loader2 className="size-8 animate-spin mb-2" />
                  <p className="text-sm">กำลังโหลดข้อมูล...</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Step 1: Symptom Types */}
                  {drillStep === 1 && (
                    <>
                      <div className="p-4 border-b border-border/50 bg-muted/10 flex justify-end">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-[13px] font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/80 transition-colors"
                        >
                          <FileText className="size-4" /> อัปโหลดไฟล์ทั่วไป (ไม่ผูกข้อมูล)
                        </button>
                      </div>
                      {symptomTypes.map((st, i) => (
                        <div
                          key={st.id}
                          onClick={() => {
                            setActiveSymType(st)
                            setDrillStep(2)
                          }}
                          className={`group flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors ${i !== symptomTypes.length - 1 ? 'border-b border-border/40' : ''}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                              <Stethoscope className="size-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[14px] text-foreground">
                                <span className="text-blue-500 font-bold mr-1">{st.id} -</span>
                                {st.name}
                              </p>
                              <p className="text-[12px] text-muted-foreground">คำอธิบาย: {st.description || '-'}</p>
                            </div>
                          </div>
                          <ChevronRight className="size-5 text-muted-foreground/40 shrink-0" />
                        </div>
                      ))}
                    </>
                  )}

                  {/* Step 2: Symptoms */}
                  {drillStep === 2 && (() => {
                    const filteredSymptoms = symptoms.filter(s =>
                      s.symptomTypeId === activeSymType?.id ||
                      s.symptomTypeId === activeSymType?.name ||
                      (activeSymType?.subcategoryId && s.symptomTypeId === activeSymType?.subcategoryId)
                    );

                    if (filteredSymptoms.length === 0) {
                      return (
                        <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                          <AlertTriangle className="size-10 text-muted-foreground/30 mb-3" />
                          <p className="text-[15px]">ไม่มีอาการเสียย่อยในกลุ่มนี้</p>
                        </div>
                      )
                    }

                    return filteredSymptoms.map((sym, i) => (
                      <div
                        key={sym.id}
                        onClick={() => {
                          setActiveSym(sym)
                          setDrillStep(3)
                        }}
                        className={`group flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors ${i !== filteredSymptoms.length - 1 ? 'border-b border-border/40' : ''}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                            <AlertTriangle className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[14px] text-foreground">{sym.title}</p>
                            <p className="text-[12px] text-muted-foreground">{sym.description || 'ไม่มีคำอธิบาย'}</p>
                          </div>
                        </div>
                        <ChevronRight className="size-5 text-muted-foreground/40 shrink-0" />
                      </div>
                    ))
                  })()}

                  {/* Step 3: Guides */}
                  {drillStep === 3 && (() => {
                    const filteredGuides = guides.filter(g => g.symptomId === activeSym?.id);

                    if (filteredGuides.length === 0) {
                      return (
                        <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
                          <FileText className="size-10 text-muted-foreground/30 mb-3" />
                          <p className="text-[15px]">ยังไม่มีหัวข้อการตรวจสอบสำหรับอาการนี้</p>
                        </div>
                      )
                    }

                    return filteredGuides.map((g, i) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          setActiveGuide(g)
                          setEditedMediaUrl(g.mediaUrl || '')
                          setEditedPdfUrl(g.pdfUrl || '')
                          setDrillStep(4)
                        }}
                        className={`group flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors ${i !== filteredGuides.length - 1 ? 'border-b border-border/40' : ''}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                            <FileText className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[14px] text-foreground mb-1">{g.title}</p>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${g.mediaUrl ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}`}>
                                <UploadCloud className="size-3" /> {g.mediaUrl ? 'มี VDO' : 'ไม่มี VDO'}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${g.pdfUrl ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'}`}>
                                <FileDown className="size-3" /> {g.pdfUrl ? 'มี PDF' : 'ไม่มี PDF'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="size-5 text-muted-foreground/40 shrink-0" />
                      </div>
                    ))
                  })()}

                  {/* Step 4: Upload Modal */}
                  {drillStep === 4 && activeGuide && (
                    <div className="p-6">
                      <div className="mb-6">
                        <label className="text-[13px] font-semibold text-foreground block mb-2">หัวข้อการตรวจสอบ</label>
                        <input
                          type="text"
                          value={activeGuide.title}
                          readOnly
                          className="w-full rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-[14px] text-muted-foreground outline-none cursor-not-allowed"
                        />
                      </div>

                      {preselectedFileForLink && (
                        <div className="mb-6 bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3 justify-between">
                          <div className="flex items-center gap-2 text-[13px] text-primary min-w-0 flex-1">
                            <FileText className="size-4 shrink-0" />
                            <span className="truncate">นำไฟล์มาผูก: <strong>{preselectedFileForLink.name}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                            <button onClick={() => setEditedMediaUrl(preselectedFileForLink.url)} className="flex-1 sm:flex-none px-3 py-1.5 bg-background border border-border/50 rounded-lg text-[12px] font-semibold hover:border-primary/50 transition-colors">ดึงมาใส่ VDO</button>
                            <button onClick={() => setEditedPdfUrl(preselectedFileForLink.url)} className="flex-1 sm:flex-none px-3 py-1.5 bg-background border border-border/50 rounded-lg text-[12px] font-semibold hover:border-primary/50 transition-colors">ดึงมาใส่ PDF</button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-5">
                        {/* VDO Upload */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                              <UploadCloud className="size-4 text-blue-500" />อัปโหลด VDO (ไม่บังคับ)
                            </label>
                          </div>

                          <div className="flex gap-3 mb-3">
                            <div 
                              onClick={() => setVideoDestination('drive')}
                              className={`flex-1 relative flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${videoDestination === 'drive' ? 'border-blue-500 bg-blue-500/5' : 'border-border/60 hover:border-border bg-background'}`}
                            >
                              <div className={`flex size-7 shrink-0 items-center justify-center rounded-md ${videoDestination === 'drive' ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                <HardDrive className="size-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[12px] text-foreground">Google Drive</p>
                              </div>
                              {videoDestination === 'drive' && <CheckCircle2 className="size-3.5 text-blue-500 absolute top-1.5 right-1.5" />}
                            </div>

                            <div 
                              onClick={() => setVideoDestination('youtube')}
                              className={`flex-1 relative flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${videoDestination === 'youtube' ? 'border-red-500 bg-red-500/5' : 'border-border/60 hover:border-border bg-background'}`}
                            >
                              <div className={`flex size-7 shrink-0 items-center justify-center rounded-md ${videoDestination === 'youtube' ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                <PlaySquare className="size-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[12px] text-foreground">YouTube</p>
                              </div>
                              {videoDestination === 'youtube' && <CheckCircle2 className="size-3.5 text-red-500 absolute top-1.5 right-1.5" />}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editedMediaUrl}
                              onChange={(e) => setEditedMediaUrl(e.target.value)}
                              placeholder="https://..."
                              className="flex-1 rounded-xl border border-border/50 bg-background hover:border-primary/50 focus:border-primary px-3 py-2 text-[14px] text-foreground outline-none transition-colors"
                            />
                            {editedMediaUrl !== (activeGuide.mediaUrl || '') ? (
                              <button
                                onClick={() => handleSaveManualUrl('vdo', editedMediaUrl)}
                                disabled={guideUploadingState !== null}
                                className="h-full flex items-center gap-1.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[13px] font-semibold transition-colors disabled:opacity-50 shrink-0"
                              >
                                {guideUploadingState === 'vdo' ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                บันทึกลิงก์
                              </button>
                            ) : (
                              <div className="relative overflow-hidden inline-block shrink-0">
                                <button
                                  disabled={guideUploadingState !== null}
                                  className="h-full flex items-center gap-1.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground text-[13px] font-semibold transition-colors disabled:opacity-50"
                                >
                                  {guideUploadingState === 'vdo' ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                                  อัปโหลดใหม่
                                </button>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => handleGuideUpload(e, 'vdo')}
                                  disabled={guideUploadingState !== null}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* PDF Upload */}
                        <div>
                          <label className="text-[13px] font-semibold text-foreground flex items-center gap-2 mb-2">
                            <FileDown className="size-4 text-orange-500" />ลิงก์ PDF (ไม่บังคับ)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editedPdfUrl}
                              onChange={(e) => setEditedPdfUrl(e.target.value)}
                              placeholder="https://..."
                              className="flex-1 rounded-xl border border-border/50 bg-background hover:border-primary/50 focus:border-primary px-3 py-2 text-[14px] text-foreground outline-none transition-colors"
                            />
                            {editedPdfUrl !== (activeGuide.pdfUrl || '') ? (
                              <button
                                onClick={() => handleSaveManualUrl('pdf', editedPdfUrl)}
                                disabled={guideUploadingState !== null}
                                className="h-full flex items-center gap-1.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[13px] font-semibold transition-colors disabled:opacity-50 shrink-0"
                              >
                                {guideUploadingState === 'pdf' ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                บันทึกลิงก์
                              </button>
                            ) : (
                              <div className="relative overflow-hidden inline-block shrink-0">
                                <button
                                  disabled={guideUploadingState !== null}
                                  className="h-full flex items-center gap-1.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground text-[13px] font-semibold transition-colors disabled:opacity-50"
                                >
                                  {guideUploadingState === 'pdf' ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                                  อัปโหลดใหม่
                                </button>
                                <input
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  onChange={(e) => handleGuideUpload(e, 'pdf')}
                                  disabled={guideUploadingState !== null}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-border/50">
                        <button
                          onClick={() => setIsDrilldownModalOpen(false)}
                          className="px-5 py-2 rounded-xl text-[14px] font-semibold text-muted-foreground hover:bg-muted transition-colors"
                        >
                          ปิดหน้าต่าง
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
