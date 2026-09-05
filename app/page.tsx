"use client"

import { useSession, signOut } from "next-auth/react"
import { GlobalWatermark } from "@/components/watermark"
import { LoginView } from "@/components/login-view"
import { TechnicianApp } from "@/components/technician/technician-app"
import { AdminApp } from "@/components/admin/admin-app"
import { EmployeeBindView } from "@/components/employee-bind-view"
import { Loader2 } from "lucide-react"
import { updateUser } from "@/lib/data-service"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useCallback, useRef, useState } from "react"

const BACKOFFICE_MENUS = ["dashboard", "guides", "master-data", "media", "users", "settings"]

function PageContent() {
  const { data: session, status, update } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isPreview = searchParams.get("preview") === "true"
  const initialCategoryId = searchParams.get("categoryId") || undefined
  const [adminMode, setAdminMode] = useState(false)

  // Stable logout handler that doesn't change on every render
  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: "/" })
  }, [])

  // Keep last known valid user in ref to gracefully handle brief reconnects / network blips
  const lastValidUserRef = useRef<any>(null)
  if (session?.user && (session.user as any).dbUser) {
    lastValidUserRef.current = (session.user as any).dbUser
  }

  if (status === "loading" && !lastValidUserRef.current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "unauthenticated" || (!session?.user && !lastValidUserRef.current)) {
    return (
      <div className="min-h-screen bg-background">
        <LoginView />
        <GlobalWatermark />
      </div>
    )
  }

  // User is authenticated with LINE, but are they bound to a DB user?
  const dbUser = (session?.user as any)?.dbUser || lastValidUserRef.current;

  if (!dbUser) {
    return (
      <div className="min-h-screen bg-background">
        <EmployeeBindView 
          lineProfile={{
            lineName: session?.user?.name || "LINE User",
            avatar: session?.user?.image || "/placeholder.svg"
          }}
          lineUserId={(session?.user as any)?.lineUserId}
          onCancel={handleLogout}
          onBound={async (boundUser?: any) => {
            // Force session update with the newly bound DB user directly
            await update({ boundUser });
          }}
        />
        <GlobalWatermark />
      </div>
    )
  }

  const userRole = String(dbUser.role || "technician").trim().toLowerCase()
  const isAdmin = userRole === "admin"
  const isHead = userRole === "head"
  
  // Check if head has additional backoffice permissions explicitly granted
  const grantedAdminMenus = Array.isArray(dbUser.accessibleMenus)
    ? dbUser.accessibleMenus.filter((m: string) => BACKOFFICE_MENUS.includes(m))
    : []
  const canHeadSwitchToAdmin = isHead && grantedAdminMenus.length > 0

  // Decision on whether to show AdminApp or TechnicianApp:
  // 1. Admin: always AdminApp (unless previewing)
  // 2. Head in adminMode (and has permissions): AdminApp
  // 3. Otherwise (Technicians, Heads by default, or Admin in preview): TechnicianApp
  const shouldShowAdmin = isAdmin ? !isPreview : (isHead && canHeadSwitchToAdmin && adminMode)

  return (
    <div className="min-h-screen bg-background">
      {shouldShowAdmin ? (
        <AdminApp 
          user={dbUser} 
          onLogout={handleLogout} 
          onSwitchToTechnician={isHead ? () => setAdminMode(false) : undefined}
        />
      ) : (
        <TechnicianApp 
          user={dbUser} 
          onLogout={!isPreview ? handleLogout : undefined} 
          preview={isAdmin && isPreview} 
          onExitPreview={() => router.push('/')} 
          initialCategoryId={initialCategoryId}
          canSwitchToAdmin={canHeadSwitchToAdmin}
          onSwitchToAdmin={() => setAdminMode(true)}
        />
      )}
      <GlobalWatermark />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <PageContent />
    </Suspense>
  )
}
