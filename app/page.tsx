"use client"

import { useSession, signOut } from "next-auth/react"
import { GlobalWatermark } from "@/components/watermark"
import { LoginView } from "@/components/login-view"
import { TechnicianApp } from "@/components/technician/technician-app"
import { AdminApp } from "@/components/admin/admin-app"
import { EmployeeBindView } from "@/components/employee-bind-view"
import { Loader2 } from "lucide-react"
import { updateUser } from "@/lib/data-service"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function PageContent() {
  const { data: session, status, update } = useSession()
  const searchParams = useSearchParams()
  const isPreview = searchParams.get("preview") === "true"
  const initialCategoryId = searchParams.get("categoryId") || undefined

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="min-h-screen bg-background">
        <LoginView />
        <GlobalWatermark />
      </div>
    )
  }

  // User is authenticated with LINE, but are they bound to a DB user?
  const dbUser = (session.user as any).dbUser;

  if (!dbUser) {
    return (
      <div className="min-h-screen bg-background">
        <EmployeeBindView 
          lineProfile={{
            lineName: session.user.name || "LINE User",
            avatar: session.user.image || "/placeholder.svg"
          }}
          lineUserId={(session.user as any).lineUserId}
          onCancel={() => signOut()}
          onBound={async (boundUser?: any) => {
            // Force session update with the newly bound DB user directly
            await update({ boundUser });
          }}
        />
        <GlobalWatermark />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {dbUser.role === "technician" || (dbUser.role !== "technician" && isPreview) ? (
        <TechnicianApp 
          user={dbUser} 
          onLogout={!isPreview ? () => signOut() : undefined} 
          preview={isPreview} 
          onExitPreview={() => window.location.href = '/'} 
          initialCategoryId={initialCategoryId}
        />
      ) : (
        <AdminApp user={dbUser} onLogout={() => signOut()} />
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
