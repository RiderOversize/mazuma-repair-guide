"use client"

import { useEffect } from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { SettingsProvider } from "./settings-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Unregister any active PWA service workers in development mode to prevent stale API & chunk caching
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister()
        }
      })
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SettingsProvider>
        <SessionProvider>{children}</SessionProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}
