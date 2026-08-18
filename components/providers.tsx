"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { SettingsProvider } from "./settings-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SettingsProvider>
        <SessionProvider>{children}</SessionProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}
