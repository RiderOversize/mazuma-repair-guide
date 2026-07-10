"use client"

import { useState } from "react"
import { GlobalWatermark } from "@/components/watermark"
import { LoginView } from "@/components/login-view"
import { TechnicianApp } from "@/components/technician/technician-app"
import { AdminApp } from "@/components/admin/admin-app"
import type { AuthUser } from "@/lib/auth"

export default function Page() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

  const login = (user: AuthUser) => setCurrentUser(user)
  const logout = () => setCurrentUser(null)

  return (
    <div className="min-h-screen bg-background">
      {currentUser === null ? (
        <LoginView onLogin={login} />
      ) : currentUser.role === "technician" ? (
        <TechnicianApp user={currentUser} onLogout={logout} />
      ) : (
        <AdminApp user={currentUser} onLogout={logout} />
      )}

      <GlobalWatermark />
    </div>
  )
}
