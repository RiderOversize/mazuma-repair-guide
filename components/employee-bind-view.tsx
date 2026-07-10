"use client"

import { useState } from "react"
import Image from "next/image"
import { Loader2, IdCard, AlertCircle, ArrowLeft } from "lucide-react"
import { VALID_EMPLOYEE_CODES, type AuthUser } from "@/lib/auth"
import { SuccessToast } from "@/components/login-view"

export function EmployeeBindView({
  lineProfile,
  onCancel,
  onBound,
}: {
  lineProfile: { lineName: string; avatar: string }
  onCancel: () => void
  onBound: (user: AuthUser) => void
}) {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "verifying" | "success">("idle")

  function confirm() {
    if (status !== "idle") return
    const normalized = code.trim().toUpperCase()
    if (!normalized) {
      setError("กรุณากรอกรหัสพนักงาน")
      return
    }
    setError(null)
    setStatus("verifying")

    setTimeout(() => {
      const role = VALID_EMPLOYEE_CODES[normalized]
      if (!role) {
        setStatus("idle")
        setError("ไม่พบรหัสพนักงานนี้ในระบบ กรุณาลองใหม่ (ตัวอย่าง: MZ-205)")
        return
      }
      setStatus("success")
      // Show success toast briefly, then bind the LINE account and route in.
      setTimeout(() => {
        onBound({
          role,
          name: lineProfile.lineName,
          title: "ช่างเทคนิคภาคสนาม",
          initials: lineProfile.lineName.slice(0, 2).toUpperCase(),
          avatar: lineProfile.avatar,
          lineName: lineProfile.lineName,
          employeeCode: normalized,
        })
      }, 1100)
    }, 1200)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      {status === "success" ? <SuccessToast message="ผูกบัญชีสำเร็จ" /> : null}

      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={onCancel}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          ย้อนกลับ
        </button>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          {/* LINE identity being bound */}
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-muted/60 p-3">
            <span className="relative size-11 shrink-0 overflow-hidden rounded-full">
              <Image src={lineProfile.avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="44px" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{lineProfile.lineName}</p>
              <p className="text-xs text-muted-foreground">เข้าสู่ระบบด้วย LINE สำเร็จ</p>
            </div>
          </div>

          <h1 className="font-display text-lg font-semibold">ยืนยันตัวตนพนักงาน</h1>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            ระบบพบว่าคุณเข้าใช้งานครั้งแรก กรุณากรอกรหัสพนักงานเพื่อผูกบัญชี LINE ของคุณ
          </p>

          <label htmlFor="employee-code" className="mt-5 block text-sm font-medium">
            รหัสพนักงาน (Employee Code)
          </label>
          <div className="relative mt-1.5">
            <IdCard className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="employee-code"
              type="text"
              inputMode="text"
              autoComplete="off"
              placeholder="MZ-205"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                if (error) setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) confirm()
              }}
              disabled={status !== "idle"}
              className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3 text-sm uppercase tracking-wide outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
            />
          </div>

          {error ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={confirm}
            disabled={status !== "idle"}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground shadow-sm transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {status === "verifying" ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                กำลังตรวจสอบ...
              </>
            ) : (
              "ยืนยัน"
            )}
          </button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            รหัสสำหรับทดสอบ: MZ-205 หรือ MZ-206
          </p>
        </div>
      </div>
    </div>
  )
}
