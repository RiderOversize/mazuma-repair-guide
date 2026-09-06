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

    // Auto-clean stale problematic caches in user's browser (e.g. stale 'apis' / 'pages' caches from old next-pwa builds)
    if (typeof window !== "undefined" && "caches" in window) {
      const CACHE_CLEANUP_KEY = "mzm_cache_cleanup_v3"
      if (!localStorage.getItem(CACHE_CLEANUP_KEY)) {
        caches.keys().then(async (keys) => {
          for (const key of keys) {
            await caches.delete(key).catch(() => {})
          }
        }).catch(() => {})

        // Force Service Worker to check for updates immediately
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const reg of registrations) {
              reg.update().catch(() => {})
            }
          }).catch(() => {})
        }

        localStorage.setItem(CACHE_CLEANUP_KEY, "true")
      }
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SettingsProvider>
        <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false} refetchInterval={0}>
          {children}
        </SessionProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}
