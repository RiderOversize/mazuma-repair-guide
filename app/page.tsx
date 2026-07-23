"use client"

import { useSession, signOut } from "next-auth/react"
import { GlobalWatermark } from "@/components/watermark"
import { LoginView } from "@/components/login-view"
import { TechnicianApp } from "@/components/technician/technician-app"
import { AdminApp } from "@/components/admin/admin-app"
import { EmployeeBindView } from "@/components/employee-bind-view"
import { Loader2 } from "lucide-react"
import { updateUser } from "@/lib/data-service"

export default function Page() {
  const { data: session, status, update } = useSession()

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
          onBound={async () => {
            // Force session update to fetch the newly bound DB user
            await update();
          }}
        />
        <GlobalWatermark />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {dbUser.role === "technician" ? (
        <TechnicianApp user={dbUser} onLogout={() => signOut()} />
      ) : (
        <AdminApp user={dbUser} onLogout={() => signOut()} />
      )}
      <GlobalWatermark />
    </div>
  )
}
