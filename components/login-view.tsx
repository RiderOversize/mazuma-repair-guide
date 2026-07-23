"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react"

export function LoginView() {
  const [isConnecting, setIsConnecting] = useState(false)

  function startLineLogin() {
    setIsConnecting(true)
    signIn("line")
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary font-display text-3xl font-bold text-primary-foreground shadow-lg">
            M
          </div>
          <h1 className="font-display text-2xl font-semibold">Mazuma Repair Guide</h1>
          <p className="mt-1 text-sm text-muted-foreground">ระบบคู่มือซ่อมสำหรับทีมช่างและผู้ดูแล</p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-1 font-display text-sm font-semibold">เข้าสู่ระบบ</p>
          <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
            เข้าสู่ระบบด้วยบัญชี LINE ของคุณเพื่อเริ่มใช้งานคู่มือซ่อม
          </p>

          <button
            type="button"
            onClick={startLineLogin}
            disabled={isConnecting}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 font-medium text-white shadow-sm transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-80"
            style={{ backgroundColor: "#06C755" }}
          >
            {isConnecting ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                กำลังเชื่อมต่อกับ LINE...
              </>
            ) : (
              <>
                <LineIcon className="size-5" />
                เข้าสู่ระบบด้วย LINE
              </>
            )}
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            ยืนยันตัวตนพนักงานผ่านบัญชี LINE ที่ผูกไว้
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          เนื้อหาวิดีโอและคู่มือเป็นลิขสิทธิ์ของ Mazuma
        </p>
      </div>
    </div>
  )
}

export function SuccessToast({ message }: { message: string }) {
  return (
    <div className="fixed inset-x-0 top-4 z-[120] flex justify-center px-4">
      <div className="flex items-center gap-2.5 rounded-full border border-accent/30 bg-card px-4 py-2.5 shadow-lg">
        <CheckCircle2 className="size-5 text-accent" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  )
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 5.69 2 10.23c0 4.07 3.56 7.48 8.37 8.12.33.07.77.22.88.5.1.26.07.66.03.92l-.14.86c-.04.26-.2 1.01.88.55 1.09-.46 5.87-3.46 8.01-5.92C21.36 13.66 22 12 22 10.23 22 5.69 17.52 2 12 2ZM7.94 12.86H6.02a.53.53 0 0 1-.53-.53V8.5a.53.53 0 0 1 1.06 0v3.3h1.39a.53.53 0 0 1 0 1.06Zm2.07-.53a.53.53 0 0 1-1.06 0V8.5a.53.53 0 0 1 1.06 0v3.83Zm4.44 0a.53.53 0 0 1-.36.5.56.56 0 0 1-.17.03.53.53 0 0 1-.43-.21l-1.96-2.67v2.35a.53.53 0 0 1-1.06 0V8.5a.53.53 0 0 1 .36-.5.53.53 0 0 1 .6.18l1.96 2.67V8.5a.53.53 0 0 1 1.06 0v3.83Zm3.4-2.45a.53.53 0 0 1 0 1.06h-1.39v.86h1.39a.53.53 0 0 1 0 1.06h-1.92a.53.53 0 0 1-.53-.53V8.5a.53.53 0 0 1 .53-.53h1.92a.53.53 0 0 1 0 1.06h-1.39v.85h1.39Z" />
    </svg>
  )
}
