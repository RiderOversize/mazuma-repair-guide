"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Shield, ShieldAlert, Save, CheckCircle2, UserPlus, Trash2, Loader2, X, Calendar, Activity, Users, Search, Edit2 } from "lucide-react"
import type { AuthUser, Role } from "@/lib/auth"
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/data-service"
import { showToast, confirmDelete, showAlert } from "@/lib/swal"
import { cn } from "@/lib/utils"

const AVAILABLE_MENUS = [
  { id: "dashboard", label: "ภาพรวมระบบ" },
  { id: "master-data", label: "ข้อมูลพื้นฐาน (Master Data)" },
  { id: "models", label: "รุ่นสินค้า" },
  { id: "guides", label: "คู่มือการซ่อม" },
  { id: "create", label: "สร้างคู่มือ" },
  { id: "media", label: "คลังสื่อ (Media)" },
  { id: "users", label: "ผู้ใช้งานและสิทธิ์" },
  { id: "settings", label: "ตั้งค่าระบบ" },
  { id: "preview", label: "ดูหน้าแอปช่าง" },
]

export function UserManagement({ user, setGlobalBack }: { user?: AuthUser, setGlobalBack?: (fn: (() => void) | null) => void }) {
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'detail'>('list')
  const [searchQuery, setSearchQuery] = useState("")
  const [headSearch, setHeadSearch] = useState("")

  const [newEmpCode, setNewEmpCode] = useState("")
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newRole, setNewRole] = useState<Role>("technician")
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active")
  const [newAccessibleMenus, setNewAccessibleMenus] = useState<string[]>([])
  const [newAssignedSupervisors, setNewAssignedSupervisors] = useState<string[]>([])

  const [editingName, setEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (setGlobalBack) {
      if (currentView !== 'list') {
        setGlobalBack(() => goBack)
      } else {
        setGlobalBack(null)
      }
    }
  }, [currentView, setGlobalBack])

  const loadUsers = async () => {
    setLoading(true)
    const data = await getUsers()
    setUsers(data)
    setLoading(false)
  }

  const selectedUser = users.find(u => u.employeeCode === selectedUserId)

  const toggleMenu = async (menuId: string) => {
    if (!selectedUser) return
    const menus = selectedUser.accessibleMenus || []
    const newMenus = menus.includes(menuId) 
      ? menus.filter(m => m !== menuId) 
      : [...menus, menuId]
    
    setUsers(prev => prev.map(u => 
      u.employeeCode === selectedUserId ? { ...u, accessibleMenus: newMenus } : u
    ))

    try {
      await updateUser(selectedUser.employeeCode, { accessibleMenus: newMenus })
    } catch (error) {
      console.error(error)
      showToast("เกิดข้อผิดพลาดในการบันทึก", "error")
      loadUsers()
    }
  }

  const toggleSupervisor = async (supervisorCode: string) => {
    if (!selectedUser) return
    const currentList = selectedUser.assignedSupervisors || []
    const newList = currentList.includes(supervisorCode)
      ? currentList.filter(id => id !== supervisorCode)
      : [...currentList, supervisorCode]

    setUsers(prev => prev.map(u => 
      u.employeeCode === selectedUserId ? { ...u, assignedSupervisors: newList } : u
    ))

    try {
      await updateUser(selectedUser.employeeCode, { assignedSupervisors: newList })
      showToast("อัปเดตสิทธิ์สำเร็จ", "success")
    } catch (error) {
      console.error(error)
      showToast("เกิดข้อผิดพลาดในการบันทึก", "error")
      loadUsers()
    }
  }

  const toggleStatus = async () => {
    if (!selectedUser) return
    const nextStatus = selectedUser.status === "active" ? "inactive" : "active"
    setUsers(prev => prev.map(u => 
      u.employeeCode === selectedUserId ? { ...u, status: nextStatus } : u
    ))
    try {
      await updateUser(selectedUser.employeeCode, { status: nextStatus })
      showToast("อัปเดตสถานะผู้ใช้สำเร็จ", "success")
    } catch (error) {
      console.error(error)
      showToast("เกิดข้อผิดพลาดในการบันทึก", "error")
      loadUsers()
    }
  }

  const changeRole = async (newRole: Role) => {
    if (!selectedUser || selectedUser.role === newRole) return
    
    const newTitle = newRole === "admin" ? "ผู้ดูแลระบบ" : newRole === "head" ? "หัวหน้าช่าง" : "ช่างเทคนิค";
    let updates: Partial<AuthUser> = { role: newRole, title: newTitle }
    
    if (newRole !== "technician" && (!selectedUser.accessibleMenus || selectedUser.accessibleMenus.length === 0)) {
      updates.accessibleMenus = ["dashboard", "guides", "models"]
    }
    
    setUsers(prev => prev.map(u => 
      u.employeeCode === selectedUserId ? { ...u, ...updates } : u
    ))
    try {
      await updateUser(selectedUser.employeeCode, updates)
      showToast("เปลี่ยนระดับสิทธิ์สำเร็จ", "success")
    } catch (error) {
      console.error(error)
      showToast("เกิดข้อผิดพลาดในการบันทึก", "error")
      loadUsers()
    }
  }

  const handleDelete = async (employeeCode: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const isConfirmed = await confirmDelete(
      "ลบผู้ใช้งาน",
      "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานรายนี้? (การลบจะไม่สามารถกู้คืนได้)"
    )
    if (!isConfirmed) return
    
    setSaving(true)
    try {
      await deleteUser(employeeCode)
      if (selectedUserId === employeeCode) {
        setSelectedUserId(null)
        setCurrentView('list')
      }
      await loadUsers()
      showToast("ลบผู้ใช้งานสำเร็จ", "success")
    } catch (error) {
      console.error(error)
      showAlert("ลบไม่สำเร็จ", "ไม่สามารถลบผู้ใช้งานได้ในขณะนี้", "error")
    }
    setSaving(false)
  }

  const startEditName = () => {
    if (selectedUser) {
      setEditNameValue(selectedUser.name)
      setEditingName(true)
    }
  }

  const saveName = async () => {
    if (!selectedUser || !editNameValue.trim() || editNameValue.trim() === selectedUser.name) {
      setEditingName(false)
      return
    }
    
    const newName = editNameValue.trim()
    const newInitials = newName.substring(0, 2)
    
    setUsers(prev => prev.map(u => 
      u.employeeCode === selectedUserId ? { ...u, name: newName, initials: newInitials } : u
    ))
    try {
      await updateUser(selectedUser.employeeCode, { name: newName, initials: newInitials })
      showToast("เปลี่ยนชื่อสำเร็จ", "success")
    } catch (error) {
      console.error(error)
      showToast("เกิดข้อผิดพลาดในการบันทึก", "error")
      loadUsers()
    }
    setEditingName(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newEmpCode) return
    setSaving(true)
    try {
      const newUser: AuthUser = {
        role: newRole,
        name: newName,
        title: newRole === "admin" ? "ผู้ดูแลระบบ" : newRole === "head" ? "หัวหน้าช่าง" : "ช่างเทคนิค",
        initials: newName.substring(0, 2),
        avatar: newRole === "admin" ? "/avatars/admin.png" : "/avatars/technician.png",
        lineName: "-",
        employeeCode: newEmpCode,
        phone: newPhone,
        accessibleMenus: newRole !== "technician" ? newAccessibleMenus : undefined,
        assignedSupervisors: newRole === "technician" ? newAssignedSupervisors : undefined,
        status: newStatus,
        createdAt: new Date().toISOString()
      }
      await createUser(newUser)
      setNewName("")
      setNewEmpCode("")
      setNewPhone("")
      setNewAssignedSupervisors([])
      setNewAccessibleMenus(["dashboard", "guides", "models"])
      await loadUsers()
      setCurrentView('list')
      showToast("สร้างผู้ใช้งานใหม่สำเร็จ", "success")
    } catch (error: any) {
      showAlert("เกิดข้อผิดพลาด", error.message || "ไม่สามารถสร้างผู้ใช้งานได้", "error")
    }
    setSaving(false)
  }

  const goBack = () => {
    setCurrentView('list')
    setSelectedUserId(null)
  }

  if (loading && users.length === 0) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="size-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="mx-auto w-full px-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground line-clamp-2">
          {currentView === 'list' && "ผู้ใช้งานทั้งหมด"}
          {currentView === 'create' && "เพิ่มผู้ใช้งานใหม่"}
          {currentView === 'detail' && (
            editingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="text" 
                  value={editNameValue} 
                  onChange={e => setEditNameValue(e.target.value)} 
                  className="rounded-xl border border-input bg-card px-4 py-1.5 text-xl outline-none focus:border-primary shadow-sm flex-1 min-w-0"
                  autoFocus
                />
                <button onClick={saveName} className="rounded-xl bg-primary p-2 text-primary-foreground hover:bg-primary/90 shadow-sm transition-all active:scale-95 shrink-0">
                  <CheckCircle2 className="size-5" />
                </button>
                <button onClick={() => setEditingName(false)} className="rounded-xl bg-muted p-2 text-muted-foreground hover:bg-muted/80 transition-all active:scale-95 shrink-0">
                  <X className="size-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group">
                <span className="truncate">{selectedUser?.name}</span>
                <button onClick={startEditName} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full opacity-60 hover:opacity-100 transition-all active:scale-95 shrink-0">
                  <Edit2 className="size-5" />
                </button>
              </div>
            )
          )}
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          {currentView === 'list' && "จัดการพนักงานและสิทธิ์การเข้าถึง"}
          {currentView === 'create' && "กรอกข้อมูลพนักงานเพื่อสร้างบัญชี"}
          {currentView === 'detail' && `${selectedUser?.title || ''} • ${selectedUser?.employeeCode || ''}`}
        </p>
      </div>

      {currentView === 'list' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setCurrentView('create')}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-sm active:scale-95 transition-transform"
            >
              <UserPlus className="size-4" /> เพิ่มผู้ใช้
            </button>
          </div>
          
          <div className="mb-4 relative">
             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
             <input
               type="text"
               placeholder="ค้นหาชื่อ หรือรหัสพนักงาน..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full rounded-xl border border-border/50 bg-card px-9 py-3 text-[14px] outline-none transition-all focus:border-primary shadow-sm"
             />
          </div>
          
          <div className="flex flex-col overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm">
            {users.filter(u => {
              const q = searchQuery.toLowerCase()
              return u.name.toLowerCase().includes(q) || u.employeeCode.toLowerCase().includes(q)
            }).map((u, i, arr) => {
              const isLast = i === arr.length - 1;
              return (
                <div
                  key={u.employeeCode}
                  onClick={() => {
                    setSelectedUserId(u.employeeCode)
                    setCurrentView('detail')
                  }}
                  className={`group flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors active:bg-muted ${!isLast ? 'border-b border-border/40' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-background border border-border/40">
                      <Image src={u.avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[15px] truncate text-foreground leading-tight">{u.name}</p>
                        <span className={cn("inline-flex size-2 shrink-0 rounded-full", u.status === "active" ? "bg-green-500" : "bg-muted-foreground")} title={u.status === "active" ? "เปิดใช้งาน" : "ระงับการใช้งาน"} />
                      </div>
                      <p className="text-[12px] text-muted-foreground truncate mt-0.5">
                        {u.role === "admin" ? "ผู้ดูแลระบบ" : u.role === "head" ? "หัวหน้าช่าง" : "ช่างเทคนิค"} • {u.employeeCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(u.employeeCode, e)}
                      className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right text-muted-foreground/40"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {currentView === 'create' && (
        <form onSubmit={handleCreate} className="flex flex-col gap-5 rounded-2xl border border-border/40 bg-card p-4 shadow-sm pb-8">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-foreground">รหัสพนักงาน <span className="text-destructive">*</span></label>
            <input
              type="text"
              required
              value={newEmpCode}
              onChange={e => setNewEmpCode(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-[14px] outline-none transition-all focus:border-primary shadow-sm"
              placeholder="เช่น MZ-999"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-foreground">ชื่อ-นามสกุล <span className="text-destructive">*</span></label>
            <input
              type="text"
              required
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-[14px] outline-none transition-all focus:border-primary shadow-sm"
              placeholder="ชื่อ นามสกุล"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-foreground">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-[14px] outline-none transition-all focus:border-primary shadow-sm"
              placeholder="เช่น 0812345678"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-foreground">ระดับสิทธิ์ (Role)</label>
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value as Role)}
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-[14px] outline-none transition-all focus:border-primary shadow-sm"
            >
              <option value="technician">ช่างเทคนิค (Technician)</option>
              <option value="head">หัวหน้าช่าง (Head)</option>
              <option value="admin">ผู้ดูแลระบบ (Admin)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-foreground">สถานะ</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as "active" | "inactive")}
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-[14px] outline-none transition-all focus:border-primary shadow-sm"
            >
              <option value="active">เปิดใช้งาน (Active)</option>
              <option value="inactive">ระงับชั่วคราว (Inactive)</option>
            </select>
          </div>

          {newRole === "technician" && (
            <div className="mt-2 space-y-3">
              <div>
                <label className="text-[13px] font-semibold text-foreground">กำหนดหัวหน้าช่างที่ปรึกษา</label>
                <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">เลือกหัวหน้าช่างที่สามารถให้คำปรึกษาได้ (เลือกได้มากกว่า 1)</p>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อหัวหน้าช่าง..."
                    value={headSearch}
                    onChange={e => setHeadSearch(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background/50 pl-9 pr-4 py-2.5 text-[13px] outline-none transition-all focus:border-primary shadow-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {users.filter(u => u.role === "head" && (u.name.toLowerCase().includes(headSearch.toLowerCase()) || u.employeeCode.toLowerCase().includes(headSearch.toLowerCase()))).map(sup => {
                  const hasAccess = newAssignedSupervisors.includes(sup.employeeCode)
                  return (
                    <label
                      key={sup.employeeCode}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition-all hover:bg-muted/30 active:scale-[0.98]",
                        hasAccess 
                          ? "border-primary/50 bg-primary/5" 
                          : "border-border bg-card"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          "block text-[15px] font-semibold truncate transition-colors",
                          hasAccess ? "text-primary" : "text-foreground"
                        )}>{sup.name}</span>
                        <span className="block text-[13px] text-muted-foreground truncate">{sup.phone || "ไม่มีเบอร์"}</span>
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={hasAccess}
                        onChange={() => {
                          if (hasAccess) {
                            setNewAssignedSupervisors(prev => prev.filter(id => id !== sup.employeeCode))
                          } else {
                            setNewAssignedSupervisors(prev => [...prev, sup.employeeCode])
                          }
                        }}
                      />
                      <div className={cn(
                        "w-12 h-7 rounded-full flex items-center shrink-0 transition-colors duration-300 relative border border-transparent shadow-inner",
                        hasAccess ? "bg-primary" : "bg-muted-foreground/30"
                      )}>
                        <div className={cn(
                          "absolute left-1 size-5 bg-white rounded-full shadow-sm transition-transform duration-300",
                          hasAccess ? "translate-x-5" : "translate-x-0"
                        )} />
                      </div>
                    </label>
                  )
                })}
                {users.filter(u => u.role === "head" && (u.name.toLowerCase().includes(headSearch.toLowerCase()) || u.employeeCode.toLowerCase().includes(headSearch.toLowerCase()))).length === 0 && (
                  <p className="text-[13px] text-muted-foreground bg-muted/30 p-3 rounded-xl text-center">ไม่พบรายชื่อหัวหน้าช่างที่ค้นหา</p>
                )}
              </div>
            </div>
          )}

          {newRole !== "technician" && (
            <div className="mt-2 space-y-3">
              <label className="text-[13px] font-semibold text-foreground">สิทธิ์การเข้าถึงเมนู (เลือกได้มากกว่า 1)</label>
              <div className="flex flex-col gap-2">
                {AVAILABLE_MENUS.map(menu => {
                  const hasAccess = newAccessibleMenus.includes(menu.id)
                  return (
                    <label
                      key={menu.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                        hasAccess 
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                          : "border-border bg-card"
                      )}
                    >
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={hasAccess}
                        onChange={() => {
                          if (hasAccess) {
                            setNewAccessibleMenus(prev => prev.filter(id => id !== menu.id))
                          } else {
                            setNewAccessibleMenus(prev => [...prev, menu.id])
                          }
                        }}
                      />
                      <div className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded",
                        hasAccess ? "bg-primary text-primary-foreground" : "border border-input bg-background"
                      )}>
                        {hasAccess && <CheckCircle2 className="size-3.5" />}
                      </div>
                      <span className="text-[14px] font-semibold text-foreground">{menu.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border/40">
             <button
               type="submit"
               disabled={saving}
               className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-[15px] font-bold text-primary-foreground shadow-md transition-all active:scale-95 disabled:opacity-50"
             >
               {saving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
               สร้างบัญชี
             </button>
          </div>
        </form>
      )}

      {currentView === 'detail' && selectedUser && (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4 border-b border-border/40 pb-5 mb-5">
               <div className="relative size-16 shrink-0 overflow-hidden rounded-full ring-2 ring-background border border-border/40 shadow-sm">
                 <Image src={selectedUser.avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="64px" />
               </div>
               <div className="min-w-0 flex-1">
                 <div className="flex flex-wrap items-center gap-2 mb-1">
                    <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                      <Shield className="size-3" />
                      {selectedUser.role.toUpperCase()}
                    </div>
                    <div 
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                        selectedUser.status === "active" 
                          ? "bg-green-500/10 text-green-600" 
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Activity className="size-3" />
                      {selectedUser.status === "active" ? "ACTIVE" : "INACTIVE"}
                    </div>
                 </div>
                 {selectedUser.createdAt && (
                   <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                     <Calendar className="size-3" /> เข้าร่วม {new Date(selectedUser.createdAt).toLocaleDateString('th-TH')}
                   </p>
                 )}
               </div>
            </div>
            
            {/* Role Change */}
            <div className="mb-6 border-b border-border/40 pb-6">
              <h4 className="font-display text-[15px] font-bold mb-3">ปรับเปลี่ยนระดับสิทธิ์ (Role)</h4>
              <select
                value={selectedUser.role}
                onChange={(e) => changeRole(e.target.value as Role)}
                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-[14px] outline-none transition-all focus:border-primary shadow-sm font-medium"
              >
                <option value="technician">ช่างเทคนิค (Technician)</option>
                <option value="head">หัวหน้าช่าง (Head)</option>
                <option value="admin">ผู้ดูแลระบบ (Admin)</option>
              </select>
            </div>
            
            {selectedUser.role === "technician" ? (
              <>
                <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 p-3 text-amber-600 mb-5 border border-amber-500/20">
                  <ShieldAlert className="size-5 shrink-0" />
                  <p className="text-[12px] font-medium leading-tight">ช่างเทคนิคจะมีสิทธิ์ใช้หน้าแอปช่างเท่านั้น ไม่สามารถเข้าถึงระบบหลังบ้านได้</p>
                </div>
                
                <div className="mb-3">
                  <h4 className="font-display text-[15px] font-bold">กำหนดหัวหน้าช่างที่ปรึกษา</h4>
                  <p className="text-[12px] text-muted-foreground mt-0.5 mb-3">แตะเพื่อเปิด/ปิดสิทธิ์การเข้าถึง (บันทึกอัตโนมัติ)</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อหัวหน้าช่าง..."
                      value={headSearch}
                      onChange={e => setHeadSearch(e.target.value)}
                      className="w-full rounded-xl border border-input bg-card pl-9 pr-4 py-2.5 text-[13px] outline-none transition-all focus:border-primary shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {users.filter(u => u.role === "head" && (u.name.toLowerCase().includes(headSearch.toLowerCase()) || u.employeeCode.toLowerCase().includes(headSearch.toLowerCase()))).map(sup => {
                    const hasAccess = (selectedUser.assignedSupervisors || []).includes(sup.employeeCode)
                    return (
                      <label
                        key={sup.employeeCode}
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition-all hover:bg-muted/30 active:scale-[0.98]",
                          hasAccess 
                            ? "border-primary/50 bg-primary/5" 
                            : "border-border bg-card"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <span className={cn(
                            "block text-[15px] font-semibold truncate transition-colors",
                            hasAccess ? "text-primary" : "text-foreground"
                          )}>{sup.name}</span>
                          <span className="block text-[13px] text-muted-foreground truncate">{sup.phone || "ไม่มีเบอร์"}</span>
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={hasAccess}
                          onChange={() => toggleSupervisor(sup.employeeCode)}
                        />
                        <div className={cn(
                          "w-12 h-7 rounded-full flex items-center shrink-0 transition-colors duration-300 relative border border-transparent shadow-inner",
                          hasAccess ? "bg-primary" : "bg-muted-foreground/30"
                        )}>
                          <div className={cn(
                            "absolute left-1 size-5 bg-white rounded-full shadow-sm transition-transform duration-300",
                            hasAccess ? "translate-x-5" : "translate-x-0"
                          )} />
                        </div>
                      </label>
                    )
                  })}
                  {users.filter(u => u.role === "head" && (u.name.toLowerCase().includes(headSearch.toLowerCase()) || u.employeeCode.toLowerCase().includes(headSearch.toLowerCase()))).length === 0 && (
                    <p className="text-[13px] text-muted-foreground bg-muted/30 p-3 rounded-xl text-center">ไม่พบรายชื่อหัวหน้าช่างที่ค้นหา</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <h4 className="font-display text-[15px] font-bold">สิทธิ์การเข้าถึงเมนู</h4>
                  <p className="text-[12px] text-muted-foreground mt-0.5">แตะเพื่อเปิด/ปิดสิทธิ์การเข้าถึง (บันทึกอัตโนมัติ)</p>
                </div>
                <div className="flex flex-col gap-2">
                  {AVAILABLE_MENUS.map(menu => {
                    const hasAccess = (selectedUser.accessibleMenus || []).includes(menu.id)
                    return (
                      <label
                        key={menu.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition-all hover:bg-muted/30 active:scale-[0.98]",
                          hasAccess 
                            ? "border-primary/50 bg-primary/5" 
                            : "border-border bg-card"
                        )}
                      >
                        <span className={cn(
                          "text-[15px] font-semibold transition-colors",
                          hasAccess ? "text-primary" : "text-foreground"
                        )}>{menu.label}</span>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={hasAccess}
                          onChange={() => toggleMenu(menu.id)}
                        />
                        <div className={cn(
                          "w-12 h-7 rounded-full flex items-center shrink-0 transition-colors duration-300 relative border border-transparent shadow-inner",
                          hasAccess ? "bg-primary" : "bg-muted-foreground/30"
                        )}>
                          <div className={cn(
                            "absolute left-1 size-5 bg-white rounded-full shadow-sm transition-transform duration-300",
                            hasAccess ? "translate-x-5" : "translate-x-0"
                          )} />
                        </div>
                      </label>
                    )
                  })}
                </div>
              </>
            )}

            <div className="mt-6 pt-6 border-t border-border/40">
              <h4 className="font-display text-[15px] font-bold mb-3 text-destructive">ตั้งค่าสถานะบัญชี</h4>
              <label className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition-all hover:bg-destructive/5 active:scale-[0.98]",
                selectedUser.status === "inactive"
                  ? "border-destructive/50 bg-destructive/10" 
                  : "border-border bg-card"
              )}>
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "block text-[15px] font-semibold truncate transition-colors",
                    selectedUser.status === "inactive" ? "text-destructive" : "text-foreground"
                  )}>ระงับสิทธิ์การใช้งานบัญชีนี้</span>
                  <span className="block text-[13px] text-muted-foreground truncate">ผู้ใช้นี้จะไม่สามารถเข้าสู่ระบบได้ชั่วคราว</span>
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={selectedUser.status === "inactive"}
                  onChange={toggleStatus}
                />
                <div className={cn(
                  "w-12 h-7 rounded-full flex items-center shrink-0 transition-colors duration-300 relative border border-transparent shadow-inner",
                  selectedUser.status === "inactive" ? "bg-destructive" : "bg-muted-foreground/30"
                )}>
                  <div className={cn(
                    "absolute left-1 size-5 bg-white rounded-full shadow-sm transition-transform duration-300",
                    selectedUser.status === "inactive" ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
