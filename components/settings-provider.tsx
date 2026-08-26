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

  const applyFontSettings = (size: FontSize, font: FontFamily) => {
    if (typeof document === "undefined") return
    document.documentElement.setAttribute("data-font-size", size)
    document.documentElement.setAttribute("data-font-family", font)
    
    // Direct CSS root font size to guarantee 100% immediate effect across all browsers & Tailwind rem units
    const sizeMap: Record<FontSize, string> = {
      sm: "13.5px",
      base: "16px",
      lg: "18.5px",
      xl: "21px",
    }
    document.documentElement.style.fontSize = sizeMap[size] || "16px"
  }

  useEffect(() => {
    const savedFontSize = localStorage.getItem("app-font-size") as FontSize
    const savedFontFamily = localStorage.getItem("app-font-family") as FontFamily
    
    const initialSize = savedFontSize || "base"
    const initialFont = savedFontFamily || "sarabun"

    if (savedFontSize) setFontSizeState(savedFontSize)
    if (savedFontFamily) setFontFamilyState(savedFontFamily)
    
    applyFontSettings(initialSize, initialFont)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      applyFontSettings(fontSize, fontFamily)
    }
  }, [fontSize, fontFamily, mounted])

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size)
    localStorage.setItem("app-font-size", size)
    applyFontSettings(size, fontFamily)
  }

  const setFontFamily = (font: FontFamily) => {
    setFontFamilyState(font)
    localStorage.setItem("app-font-family", font)
    applyFontSettings(fontSize, font)
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
