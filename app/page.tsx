"use client"

import { useSession, signOut } from "next-auth/react"
import { GlobalWatermark } from "@/components/watermark"
import { LoginView } from "@/components/login-view"
import { TechnicianApp } from "@/components/technician/technician-app"
import { AdminApp } from "@/components/admin/admin-app"
import { EmployeeBindView } from "@/components/employee-bind-view"
import { Loader2 } from "lucide-react"
import { getUsers } from "@/lib/data-service"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"

const BACKOFFICE_MENUS = ["dashboard", "guides", "master-data", "media", "users", "settings"]

function PageContent() {
  const { data: session, status, update } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isPreview = searchParams.get("preview") === "true"
  const initialCategoryId = searchParams.get("categoryId") || undefined
  const [adminMode, setAdminMode] = useState(false)
  const [liveUser, setLiveUser] = useState<any>(null)

  // Stable logout handler that doesn't change on every render
  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: "/" })
  }, [])

  // Keep last known valid user in ref to gracefully handle brief reconnects / network blips
  const lastValidUserRef = useRef<any>(null)
  const sessionDbUser = (session?.user as any)?.dbUser
  if (sessionDbUser) {
    lastValidUserRef.current = sessionDbUser
  }

  const activeUser = liveUser || sessionDbUser || lastValidUserRef.current
  const activeUserRef = useRef(activeUser)
  activeUserRef.current = activeUser

  // Live permission & role synchronization (reads from RAM cache in <2ms, 0 Google Sheets API calls)
  useEffect(() => {
    const userCode = activeUser?.employeeCode
    const lineId = activeUser?.lineUserId
    if (!userCode && !lineId) return

    let isMounted = true

    async function syncPermissions() {
      try {
        const current = activeUserRef.current
        if (!current) return

        const users = await getUsers()
        if (!isMounted) return

        const fresh = users.find((u) => 
          (current.employeeCode && u.employeeCode?.trim().toLowerCase() === current.employeeCode?.trim().toLowerCase()) ||
          (current.lineUserId && u.lineUserId && u.lineUserId === current.lineUserId)
        )

        if (!fresh || !isMounted) return

        if (fresh.status === "inactive") {
          handleLogout()
          return
        }

        const roleChanged = fresh.role !== current.role
        const menusChanged = JSON.stringify(fresh.accessibleMenus || []) !== JSON.stringify(current.accessibleMenus || [])
        const nameChanged = fresh.name !== current.name
        const statusChanged = fresh.status !== current.status

        if (roleChanged || menusChanged || nameChanged || statusChanged) {
          setLiveUser(fresh)
          lastValidUserRef.current = fresh
          // Update NextAuth session cookie in background
          update({ boundUser: fresh }).catch(() => {})
        }
      } catch (err) {
        // Silently ignore network blips
      }
    }

    // Initial check on mount
    syncPermissions()

    // Sync when returning to the tab or unlocking mobile phone
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncPermissions()
      }
    }
    window.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("focus", syncPermissions)

    // Periodic check every 60s
    const timer = setInterval(syncPermissions, 60000)

    return () => {
      isMounted = false
      window.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("focus", syncPermissions)
      clearInterval(timer)
    }
  }, [activeUser?.employeeCode, activeUser?.lineUserId, handleLogout, update])

  if (status === "loading" && !activeUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "unauthenticated" || (!session?.user && !activeUser)) {
    return (
      <div className="min-h-screen bg-background">
        <LoginView />
        <GlobalWatermark />
      </div>
    )
  }

  // User is authenticated with LINE, but are they bound to a DB user?
  const dbUser = activeUser;

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
            setLiveUser(boundUser);
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
          onSwitchToTechnician={isHead ? () => setAdminMode(false) : () => router.push('/?preview=true')}
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
