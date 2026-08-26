"use client"

import { useState } from "react"
import Image from "next/image"
import { Loader2, IdCard, AlertCircle, ArrowLeft, Phone } from "lucide-react"
import { SuccessToast } from "@/components/login-view"
import { getUsers, updateUser } from "@/lib/data-service"

export function EmployeeBindView({
  lineProfile,
  lineUserId,
  onCancel,
  onBound,
}: {
  lineProfile: { lineName: string; avatar: string }
  lineUserId: string
  onCancel: () => void
  onBound: () => void
}) {
  const [code, setCode] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "verifying" | "success">("idle")

  async function confirm() {
    if (status !== "idle") return
    const normalizedCode = code.trim().toUpperCase()
    const normalizedPhone = phone.trim()
    
    if (!normalizedCode || !normalizedPhone) {
      setError("กรุณากรอกรหัสพนักงานและเบอร์โทรศัพท์ให้ครบถ้วน")
      return
    }
    setError(null)
    setStatus("verifying")

    try {
      const users = await getUsers()
      const user = users.find(u => u.employeeCode === normalizedCode)

      if (!user) {
        setStatus("idle")
        setError("ไม่พบรหัสพนักงานนี้ในระบบ กรุณาตรวจสอบอีกครั้ง")
        return
      }

      if (user.status !== "active") {
        setStatus("idle")
        setError("บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อแอดมิน")
        return
      }

      if (user.phone !== normalizedPhone) {
        setStatus("idle")
        setError("เบอร์โทรศัพท์ไม่ถูกต้อง")
        return
      }

      // Bind the LINE ID to the user in the database
      await updateUser(user.employeeCode, { 
        lineUserId, 
        avatar: lineProfile.avatar,
        lineName: lineProfile.lineName
      })
      
      setStatus("success")
      
      setTimeout(() => {
        onBound()
      }, 1500)

    } catch (err) {
      setStatus("idle")
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ กรุณาลองใหม่")
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 overflow-hidden bg-zinc-950">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[60%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen opacity-70 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-[40%] -right-[20%] w-[60%] h-[50%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-screen opacity-50" />
      </div>

      {status === "success" ? <SuccessToast message="ผูกบัญชีสำเร็จ! กำลังเข้าสู่ระบบ..." /> : null}

      <div className="relative z-10 w-full max-w-sm">
        <button
          type="button"
          onClick={onCancel}
          className="mb-6 flex items-center gap-1.5 text-[0.8125rem] font-semibold text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          ยกเลิก
        </button>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {/* LINE identity being bound */}
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white/5 p-3 border border-white/10">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10">
              <Image src={lineProfile.avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="48px" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{lineProfile.lineName}</p>
              <p className="text-[0.6875rem] text-zinc-400 font-medium mt-0.5">เชื่อมต่อผ่าน LINE สำเร็จ</p>
            </div>
          </div>

          <div className="mb-6">
             <h1 className="font-display text-xl font-bold text-white">ยืนยันตัวตนพนักงาน</h1>
             <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-zinc-400">
               เข้าใช้งานครั้งแรก กรุณากรอกรหัสพนักงานและเบอร์โทรศัพท์ของคุณเพื่อผูกบัญชี
             </p>
          </div>

          <div className="space-y-4">
             <div>
               <label htmlFor="employee-code" className="block text-[0.8125rem] font-semibold text-zinc-300 mb-1.5">
                 รหัสพนักงาน (Employee Code)
               </label>
               <div className="relative">
                 <IdCard className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-zinc-500" />
                 <input
                   id="employee-code"
                   type="text"
                   inputMode="text"
                   autoComplete="off"
                   placeholder="MZ-001"
                   value={code}
                   onChange={(e) => {
                     setCode(e.target.value)
                     if (error) setError(null)
                   }}
                   disabled={status !== "idle"}
                   className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm uppercase tracking-wide text-white outline-none transition-all focus:border-primary focus:bg-black/40 focus:ring-4 focus:ring-primary/20 disabled:opacity-50 placeholder:text-zinc-600 shadow-inner"
                 />
               </div>
             </div>

             <div>
               <label htmlFor="phone" className="block text-[0.8125rem] font-semibold text-zinc-300 mb-1.5">
                 เบอร์โทรศัพท์ (Phone Number)
               </label>
               <div className="relative">
                 <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-zinc-500" />
                 <input
                   id="phone"
                   type="tel"
                   inputMode="tel"
                   autoComplete="off"
                   placeholder="081xxxxxxx"
                   value={phone}
                   onChange={(e) => {
                     setPhone(e.target.value)
                     if (error) setError(null)
                   }}
                   onKeyDown={(e) => {
                     if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) confirm()
                   }}
                   disabled={status !== "idle"}
                   className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all focus:border-primary focus:bg-black/40 focus:ring-4 focus:ring-primary/20 disabled:opacity-50 placeholder:text-zinc-600 shadow-inner"
                 />
               </div>
             </div>
          </div>

          {error ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-[0.8125rem] font-medium text-red-400">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={confirm}
            disabled={status !== "idle"}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
          >
            {status === "verifying" ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                กำลังตรวจสอบ...
              </>
            ) : (
              "ยืนยันตัวตน"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
