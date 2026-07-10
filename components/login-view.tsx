"use client"

import { useState } from "react"
import Image from "next/image"
import { Loader2, ChevronRight, ShieldCheck, UserPlus, Wrench, LayoutDashboard, CheckCircle2, X } from "lucide-react"
import { MOCK_USERS, type AuthUser } from "@/lib/auth"
import { EmployeeBindView } from "@/components/employee-bind-view"

type Stage = "login" | "connecting" | "scenario" | "bind"

// Mock LINE profile of the person authenticating (before we know who they are)
const NEW_LINE_PROFILE = {
  lineName: "Nattawut.k",
  avatar: "/avatars/new-user.png",
}

export function LoginView({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [stage, setStage] = useState<Stage>("login")

  function startLineLogin() {
    setStage("connecting")
    // Simulate the OAuth round-trip to LINE
    setTimeout(() => setStage("scenario"), 1600)
  }

  if (stage === "bind") {
    return (
      <EmployeeBindView
        lineProfile={NEW_LINE_PROFILE}
        onCancel={() => setStage("scenario")}
        onBound={onLogin}
      />
    )
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
            disabled={stage === "connecting"}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 font-medium text-white shadow-sm transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-80"
            style={{ backgroundColor: "#06C755" }}
          >
            {stage === "connecting" ? (
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

      {/* Scenario picker modal */}
      {stage === "scenario" ? (
        <ScenarioModal
          onClose={() => setStage("login")}
          onExisting={(user) => onLogin(user)}
          onNewUser={() => setStage("bind")}
        />
      ) : null}
    </div>
  )
}

function ScenarioModal({
  onClose,
  onExisting,
  onNewUser,
}: {
  onClose: () => void
  onExisting: (user: AuthUser) => void
  onNewUser: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-sm rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-base font-semibold">จำลองสถานการณ์การเข้าสู่ระบบ</p>
            <p className="mt-0.5 text-xs text-muted-foreground">เลือกบัญชี LINE เพื่อทดสอบ (เวอร์ชันสาธิต)</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <ScenarioButton
            avatar={MOCK_USERS.technician.avatar}
            icon={<Wrench className="size-3.5" />}
            title="ผู้ใช้เก่า: ช่างสมชาย"
            subtitle="Technician • เข้าสู่หน้าช่างทันที"
            onClick={() => onExisting(MOCK_USERS.technician)}
          />
          <ScenarioButton
            avatar={MOCK_USERS.admin.avatar}
            icon={<LayoutDashboard className="size-3.5" />}
            title="ผู้ใช้เก่า: แอดมินภานุเดช"
            subtitle="Admin • เข้าสู่แดชบอร์ดทันที"
            onClick={() => onExisting(MOCK_USERS.admin)}
            accent
          />
          <ScenarioButton
            avatar={NEW_LINE_PROFILE.avatar}
            icon={<UserPlus className="size-3.5" />}
            title="พนักงานใหม่ (เพิ่งแอดบอทครั้งแรก)"
            subtitle="New User • ต้องยืนยันรหัสพนักงาน"
            onClick={onNewUser}
          />
        </div>
      </div>
    </div>
  )
}

function ScenarioButton({
  avatar,
  icon,
  title,
  subtitle,
  onClick,
  accent = false,
}: {
  avatar: string
  icon: React.ReactNode
  title: string
  subtitle: string
  onClick: () => void
  accent?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-all hover:border-primary/50 hover:shadow-md"
    >
      <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
        <Image src={avatar || "/placeholder.svg"} alt="" fill className="object-cover" sizes="40px" />
        <span
          className={
            accent
              ? "absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-accent-foreground ring-2 ring-card"
              : "absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card"
          }
        >
          {icon}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
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
