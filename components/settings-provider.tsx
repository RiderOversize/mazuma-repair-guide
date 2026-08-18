"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type FontSize = "sm" | "base" | "lg" | "xl"
export type FontFamily = "sarabun" | "kanit" | "noto-sans-thai" | "prompt"

interface SettingsContextType {
  fontSize: FontSize
  fontFamily: FontFamily
  setFontSize: (size: FontSize) => void
  setFontFamily: (font: FontFamily) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>("base")
  const [fontFamily, setFontFamilyState] = useState<FontFamily>("sarabun")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedFontSize = localStorage.getItem("app-font-size") as FontSize
    const savedFontFamily = localStorage.getItem("app-font-family") as FontFamily
    
    if (savedFontSize) setFontSizeState(savedFontSize)
    if (savedFontFamily) setFontFamilyState(savedFontFamily)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-font-size", fontSize)
      document.documentElement.setAttribute("data-font-family", fontFamily)
    }
  }, [fontSize, fontFamily, mounted])

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size)
    localStorage.setItem("app-font-size", size)
  }

  const setFontFamily = (font: FontFamily) => {
    setFontFamilyState(font)
    localStorage.setItem("app-font-family", font)
  }

  // Prevent flash of incorrect settings by not rendering children until mounted? 
  // Actually, standard practice for SSR is to inject a small script, but since it's just sizing/fonts, hydration is fine.
  
  return (
    <SettingsContext.Provider value={{ fontSize, fontFamily, setFontSize, setFontFamily }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useAppSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useAppSettings must be used within a SettingsProvider")
  }
  return context
}
