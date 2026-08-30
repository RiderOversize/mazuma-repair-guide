"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Loader2, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react"

export function LoginView() {
  const [isConnecting, setIsConnecting] = useState(false)
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (errorParam) {
      if (errorParam === "OAuthCallbackError" || errorParam === "Callback") {
        setAuthError("การเชื่อมต่อกับ LINE หมดอายุหรือถูกขัดจังหวะ กรุณาลองกดเข้าสู่ระบบใหม่อีกครั้ง")
      } else if (errorParam === "OAuthSignin") {
        setAuthError("ไม่สามารถเริ่มการยืนยันตัวตนกับ LINE ได้ กรุณาลองใหม่อีกครั้ง")
      } else {
        setAuthError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง")
      }
    }
  }, [errorParam])

  function startLineLogin() {
    if (isConnecting) return
    setIsConnecting(true)
    setAuthError(null)
    signIn("line", { callbackUrl: "/" }).catch(() => {
      setIsConnecting(false)
      setAuthError("ไม่สามารถเชื่อมต่อกับ LINE ได้")
    })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 overflow-hidden bg-zinc-950">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[60%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen opacity-70 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-[40%] -right-[20%] w-[60%] h-[50%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-screen opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Brand */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-5 flex size-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-primary to-primary/50 font-display text-4xl font-bold text-white shadow-2xl ring-1 ring-white/20">
            M
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white drop-shadow-sm">Mazuma</h1>
          <p className="mt-2 text-sm font-medium text-zinc-400">ระบบจัดการและคู่มือซ่อมสำหรับทีมงาน</p>
        </div>

        {/* Login card - Glassmorphism */}
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h2 className="font-display text-lg font-semibold text-white">เข้าสู่ระบบ</h2>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-zinc-400">
              เข้าสู่ระบบด้วยบัญชี LINE ของคุณเพื่อเริ่มใช้งานระบบคู่มือซ่อม
            </p>
          </div>

          {authError && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-left text-xs text-rose-200">
              <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-medium text-rose-300">{authError}</p>
                <p className="mt-1 text-[11px] text-rose-300/80">
                  (หากเปิดจากแอป LINE ให้แตะปุ่มจุด 3 จุด และเลือก "เปิดด้วยเบราว์เซอร์เริ่มต้น")
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={startLineLogin}
            disabled={isConnecting}
            className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-4 py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 cursor-pointer"
            style={{ backgroundColor: "#06C755" }}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            {isConnecting ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                กำลังเชื่อมต่อ...
              </>
            ) : (
              <>
                <LineIcon className="size-5" />
                เข้าสู่ระบบด้วย LINE
              </>
            )}
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-zinc-400">
            <ShieldCheck className="size-4 text-emerald-400" />
            ยืนยันตัวตนพนักงานผ่านระบบความปลอดภัยสูง
          </div>
        </div>

        <p className="mt-8 text-center text-[0.6875rem] font-medium text-zinc-500">
          © {new Date().getFullYear()} Mazuma. สงวนลิขสิทธิ์เนื้อหาและวิดีโอทั้งหมด.
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
