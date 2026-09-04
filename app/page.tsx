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
import { Suspense, useCallback, useRef } from "react"

function PageContent() {
  const { data: session, status, update } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isPreview = searchParams.get("preview") === "true"
  const initialCategoryId = searchParams.get("categoryId") || undefined

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
  const isTechnician = userRole === "technician"

  return (
    <div className="min-h-screen bg-background">
      {isTechnician || (!isTechnician && isPreview) ? (
        <TechnicianApp 
          user={dbUser} 
          onLogout={!isPreview ? handleLogout : undefined} 
          preview={isPreview} 
          onExitPreview={() => router.push('/')} 
          initialCategoryId={initialCategoryId}
        />
      ) : (
        <AdminApp user={dbUser} onLogout={handleLogout} />
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
