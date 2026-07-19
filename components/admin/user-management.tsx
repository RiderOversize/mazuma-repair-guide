"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Shield, ShieldAlert, Save, CheckCircle2, UserPlus, Trash2, Loader2, X, Calendar, Activity, Users } from "lucide-react"
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

export function UserManagement({ user }: { user?: AuthUser }) {
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form states for new user
  const [newName, setNewName] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newEmpCode, setNewEmpCode] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newRole, setNewRole] = useState<Role>("technician")
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active")
  const [newAssignedSupervisors, setNewAssignedSupervisors] = useState<string[]>([])
  const [newAccessibleMenus, setNewAccessibleMenus] = useState<string[]>(["dashboard", "guides", "models"])

  useEffect(() => {
    loadUsers()
  }, [])

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

  const handleDelete = async (employeeCode: string) => {
    const isConfirmed = await confirmDelete(
      "ลบผู้ใช้งาน",
      "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานรายนี้? (การลบจะไม่สามารถกู้คืนได้)"
    )
    if (!isConfirmed) return
    
    setSaving(true)
    try {
      await deleteUser(employeeCode)
      if (selectedUserId === employeeCode) setSelectedUserId(null)
      await loadUsers()
      showToast("ลบผู้ใช้งานสำเร็จ", "success")
    } catch (error) {
      console.error(error)
      showAlert("ลบไม่สำเร็จ", "ไม่สามารถลบผู้ใช้งานได้ในขณะนี้", "error")
    }
    setSaving(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newEmpCode) return
    setSaving(true)
    try {
      const newUser: AuthUser = {
        role: newRole,
        name: newName,
        title: newTitle || (newRole === "admin" ? "ผู้ดูแลระบบ" : "ช่างเทคนิค"),
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
      setIsCreating(false)
      setNewName("")
      setNewTitle("")
      setNewEmpCode("")
      setNewPhone("")
      setNewAssignedSupervisors([])
      setNewAccessibleMenus(["dashboard", "guides", "models"])
      await loadUsers()
      showToast("สร้างผู้ใช้งานใหม่สำเร็จ", "success")
    } catch (error: any) {
      showAlert("เกิดข้อผิดพลาด", error.message || "ไม่สามารถสร้างผู้ใช้งานได้", "error")
    }
    setSaving(false)
  }

  if (loading && users.length === 0) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="size-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="w-full lg:w-[35%] xl:w-[30%]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">ผู้ใช้งานทั้งหมด</h2>
            <p className="text-sm text-muted-foreground mt-1">จัดการพนักงานและสิทธิ์การเข้าถึง</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsCreating(true)
              setSelectedUserId(null)
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
          >
            <UserPlus className="size-4" />
            เพิ่ม
          </button>
        </div>
        <div className="flex flex-col gap-2.5 pr-2">
          {users.map(u => (
            <div key={u.employeeCode} className="group relative flex items-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedUserId(u.employeeCode)
                  setIsCreating(false)
                }}
                className={cn(
                  "flex flex-1 items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-200",
                  selectedUserId === u.employeeCode && !isCreating
                    ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                    : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                )}
              >
                <div className="relative size-11 shrink-0 overflow-hidden rounded-full ring-2 ring-background">
                  <Image src={u.avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="44px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate font-semibold">{u.name}</p>
                    <span className={cn("inline-flex size-2 rounded-full", u.status === "active" ? "bg-green-500" : "bg-muted-foreground")} title={u.status === "active" ? "เปิดใช้งาน" : "ระงับการใช้งาน"} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground mt-0.5">
                    {u.role === "admin" ? "ผู้ดูแลระบบ" : u.role === "head" ? "หัวหน้าช่าง" : "ช่างเทคนิค"} • {u.employeeCode}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(u.employeeCode)}
                disabled={saving}
                className="absolute right-3 hidden shrink-0 rounded-xl p-2.5 text-destructive transition-colors hover:bg-destructive/10 group-hover:flex"
                title="ลบผู้ใช้งาน"
              >
                <Trash2 className="size-4.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="w-full flex-1">
        {isCreating ? (
          <form onSubmit={handleCreate} className="rounded-3xl border border-border/50 bg-card p-6 lg:p-8 shadow-sm backdrop-blur-sm transition-all">
            <div className="mb-8 flex items-center justify-between border-b border-border/50 pb-5">
              <div>
                <h3 className="font-display text-xl font-bold">เพิ่มผู้ใช้งานใหม่</h3>
                <p className="text-sm text-muted-foreground mt-1">กรอกข้อมูลพนักงานเพื่อสร้างบัญชีใหม่</p>
              </div>
              <button type="button" onClick={() => setIsCreating(false)} className="rounded-full p-2 hover:bg-muted transition-colors">
                <X className="size-5" />
              </button>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">รหัสพนักงาน <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  required
                  value={newEmpCode}
                  onChange={e => setNewEmpCode(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                  placeholder="เช่น MZ-999"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">ชื่อ-นามสกุล <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                  placeholder="ชื่อ นามสกุล"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">ตำแหน่ง (Title)</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                  placeholder="เช่น ช่างเทคนิคอาวุโส"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                  placeholder="เช่น 0812345678"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">ระดับสิทธิ์ (Role)</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as Role)}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                >
                  <option value="technician">ช่างเทคนิค (Technician)</option>
                  <option value="head">หัวหน้าช่าง (Head)</option>
                  <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">สถานะ</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as "active" | "inactive")}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
                >
                  <option value="active">เปิดใช้งาน (Active)</option>
                  <option value="inactive">ระงับชั่วคราว (Inactive)</option>
                </select>
              </div>

              {newRole === "technician" && (
                <div className="sm:col-span-2 mt-2">
                  <label className="mb-3 block text-sm font-semibold">กำหนดหัวหน้าช่างที่ปรึกษา (เลือกได้มากกว่า 1) <span className="text-muted-foreground text-xs font-normal ml-2">*สำหรับให้ช่างโทรติดต่อเมื่อพบปัญหา</span></label>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {users.filter(u => u.role === "head").map(sup => {
                      const hasAccess = newAssignedSupervisors.includes(sup.employeeCode)
                      return (
                        <label
                          key={sup.employeeCode}
                          className={cn(
                            "group flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all duration-200",
                            hasAccess 
                              ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/10" 
                              : "border-border bg-background/50 hover:border-primary/50 hover:bg-background"
                          )}
                        >
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
                            "flex size-5 shrink-0 items-center justify-center rounded",
                            hasAccess ? "bg-primary text-primary-foreground" : "border border-input bg-background group-hover:border-primary/50"
                          )}>
                            {hasAccess && <CheckCircle2 className="size-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={cn("block text-sm font-semibold truncate", hasAccess ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                              {sup.name}
                            </span>
                            <span className="block text-xs text-muted-foreground truncate">{sup.phone || "ไม่มีเบอร์"}</span>
                          </div>
                        </label>
                      )
                    })}
                    {users.filter(u => u.role === "head").length === 0 && (
                      <p className="text-sm text-muted-foreground col-span-full">ยังไม่มีรายชื่อหัวหน้าช่างในระบบ กรุณาเพิ่มหัวหน้าช่างก่อน</p>
                    )}
                  </div>
                </div>
              )}

              {newRole !== "technician" && (
                <div className="sm:col-span-2 mt-2">
                  <label className="mb-3 block text-sm font-semibold">สิทธิ์การเข้าถึงเมนู (เลือกได้มากกว่า 1)</label>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {AVAILABLE_MENUS.map(menu => {
                      const hasAccess = newAccessibleMenus.includes(menu.id)
                      return (
                        <label
                          key={menu.id}
                          className={cn(
                            "group flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all duration-200",
                            hasAccess 
                              ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/10" 
                              : "border-border bg-background/50 hover:border-primary/50 hover:bg-background"
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
                            hasAccess ? "bg-primary text-primary-foreground" : "border border-input bg-background group-hover:border-primary/50"
                          )}>
                            {hasAccess && <CheckCircle2 className="size-3.5" />}
                          </div>
                          <span className={cn("text-sm font-semibold", hasAccess ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                            {menu.label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
               <button
                 type="submit"
                 disabled={saving}
                 className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
               >
                 {saving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                 สร้างบัญชี
               </button>
            </div>
          </form>
        ) : selectedUser ? (
          <div className="rounded-3xl border border-border/50 bg-card p-6 lg:p-8 shadow-sm transition-all">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/50 pb-6">
               <div className="flex items-center gap-5">
                 <div className="relative size-20 shrink-0 overflow-hidden rounded-full ring-4 ring-background shadow-md">
                   <Image src={selectedUser.avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="80px" />
                 </div>
                 <div>
                   <h3 className="font-display text-2xl font-bold">{selectedUser.name}</h3>
                   <p className="text-sm text-muted-foreground mt-1">{selectedUser.title} • {selectedUser.employeeCode}</p>
                   <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary ring-1 ring-primary/20">
                        <Shield className="size-3.5" />
                        {selectedUser.role.toUpperCase()}
                      </div>
                      <button 
                        onClick={toggleStatus}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 transition-colors hover:bg-opacity-80",
                          selectedUser.status === "active" 
                            ? "bg-green-500/10 text-green-600 ring-green-500/20 hover:bg-green-500/20" 
                            : "bg-muted text-muted-foreground ring-border hover:bg-muted/80"
                        )}
                      >
                        <Activity className="size-3.5" />
                        {selectedUser.status === "active" ? "ACTIVE" : "INACTIVE"}
                      </button>
                   </div>
                 </div>
               </div>
               {selectedUser.createdAt && (
                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full self-start">
                   <Calendar className="size-3.5" />
                   เข้าร่วม {new Date(selectedUser.createdAt).toLocaleDateString('th-TH')}
                 </div>
               )}
            </div>
            
            <div className="mb-5">
              <h4 className="font-display text-lg font-bold">สิทธิ์การเข้าถึงเมนู (Access Control)</h4>
              <p className="text-sm text-muted-foreground mt-1">คลิกเพื่อเปิด/ปิดสิทธิ์การเข้าถึงเมนูต่างๆ ของผู้ใช้งานนี้ (บันทึกอัตโนมัติ)</p>
            </div>
            
            {selectedUser.role === "technician" ? (
              <>
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 py-6 text-center mb-6">
                  <div className="rounded-full bg-amber-500/10 p-3">
                    <ShieldAlert className="size-6 text-amber-500" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-amber-700 dark:text-amber-500">สำหรับช่างเทคนิคเท่านั้น</h5>
                    <p className="text-sm text-muted-foreground mt-1">ช่างเทคนิคจะมีสิทธิ์ใช้หน้าแอปช่างเท่านั้น ไม่สามารถเข้าถึงระบบหลังบ้านได้</p>
                  </div>
                </div>
                
                <div className="mb-5">
                  <h4 className="font-display text-lg font-bold">กำหนดหัวหน้าช่างที่ปรึกษา</h4>
                  <p className="text-sm text-muted-foreground mt-1">เลือกหัวหน้าช่างที่ช่างเทคนิคท่านนี้สามารถติดต่อได้ (บันทึกอัตโนมัติ)</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {users.filter(u => u.role === "head").map(sup => {
                    const hasAccess = (selectedUser.assignedSupervisors || []).includes(sup.employeeCode)
                    return (
                      <label
                        key={sup.employeeCode}
                        className={cn(
                          "group flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all duration-200",
                          hasAccess 
                            ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/10" 
                            : "border-border hover:border-border/80 hover:bg-muted/50"
                        )}
                      >
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={hasAccess}
                          onChange={() => toggleSupervisor(sup.employeeCode)}
                        />
                        <div className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded",
                          hasAccess ? "bg-primary text-primary-foreground" : "border border-input bg-background group-hover:border-primary/50"
                        )}>
                          {hasAccess && <CheckCircle2 className="size-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={cn("block text-sm font-semibold truncate", hasAccess ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                            {sup.name}
                          </span>
                          <span className="block text-xs text-muted-foreground truncate">{sup.phone || "ไม่มีเบอร์"}</span>
                        </div>
                      </label>
                    )
                  })}
                  {users.filter(u => u.role === "head").length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-full">ยังไม่มีรายชื่อหัวหน้าช่างในระบบ</p>
                  )}
                </div>
              </>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {AVAILABLE_MENUS.map(menu => {
                  const hasAccess = (selectedUser.accessibleMenus || []).includes(menu.id)
                  return (
                    <label
                      key={menu.id}
                      className={cn(
                        "group flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all duration-200",
                        hasAccess 
                          ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/10" 
                          : "border-border hover:border-border/80 hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded",
                        hasAccess ? "bg-primary text-primary-foreground" : "border border-input bg-background group-hover:border-primary/50"
                      )}>
                        {hasAccess && <CheckCircle2 className="size-3.5" />}
                      </div>
                      <span className={cn("text-sm font-semibold", hasAccess ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                        {menu.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
           <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/30 p-8 text-center">
             <div className="rounded-full bg-muted p-4 mb-4">
               <Users className="size-8 text-muted-foreground/50" />
             </div>
             <h3 className="font-display text-lg font-bold text-muted-foreground">ไม่มีข้อมูลที่เลือก</h3>
             <p className="text-sm text-muted-foreground/70 mt-1">เลือกผู้ใช้งานจากรายชื่อด้านซ้ายเพื่อจัดการสิทธิ์</p>
             <button
                onClick={() => setIsCreating(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition-colors"
             >
               <UserPlus className="size-4" /> เริ่มสร้างผู้ใช้งานใหม่
             </button>
           </div>
        )}
      </div>
    </div>
  )
}
