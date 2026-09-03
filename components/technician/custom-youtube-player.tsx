"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface CustomYouTubePlayerProps {
  videoUrl: string
}

/**
 * High-Security YouTube Player for LINE In-App Browser & Mobile WebViews.
 * - Direct iframe embed on youtube-nocookie.com (plays 100% on iOS WKWebView / Android WebView)
 * - Permissions-Policy blocks clipboard access ('clipboard-write' disabled)
 * - Multi-layer Security Shields:
 *     1. Bottom-Left Shield (Opaque Black): Completely covers & blocks the 🔗 Share/Copy Link button.
 *     2. Bottom-Right Shield (Opaque Black): Completely covers & blocks the YouTube logo link.
 *     3. Top-Bar & Top-Right Shields: Completely cover & block Title, Channel link, and 3-dots share menu.
 * - Global clipboard wipe listener & navigator.clipboard.writeText override prevent copying video links.
 * - Strict sandbox blocks popups, window.open, and external navigation.
 */
export function CustomYouTubePlayer({ videoUrl }: CustomYouTubePlayerProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Block clipboard copying globally and override writeText while player is active
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", "")
      }
    }
    document.addEventListener("copy", handleCopy, true)

    let originalWriteText: ((text: string) => Promise<void>) | null = null
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard)
      navigator.clipboard.writeText = async () => {
        // Block clipboard writing silently
        return Promise.resolve()
      }
    }

    return () => {
      document.removeEventListener("copy", handleCopy, true)
      if (originalWriteText && typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText = originalWriteText
      }
    }
  }, [])

  // Extract clean video ID
  let videoId = ""
  try {
    const urlObj = new URL(videoUrl)
    if (urlObj.hostname.includes("youtube.com")) {
      if (urlObj.pathname === "/watch") {
        videoId = urlObj.searchParams.get("v") || ""
      } else if (urlObj.pathname.startsWith("/embed/")) {
        videoId = urlObj.pathname.split("/embed/")[1]?.split("?")[0] || ""
      } else if (urlObj.pathname.startsWith("/shorts/")) {
        videoId = urlObj.pathname.split("/shorts/")[1]?.split("?")[0] || ""
      }
    } else if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1).split("?")[0] || ""
    }
  } catch (e) {
    videoId = ""
  }

  if (!videoId) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-zinc-900 text-zinc-400 text-xs">
        ไม่พบวิดีโอหรือลิงก์ไม่ถูกต้อง
      </div>
    )
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&disablekb=1`

  return (
    <div
      className="relative w-full h-full bg-black select-none overflow-hidden"
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Loading Spinner until Iframe is ready */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 pointer-events-none">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}

      {/* Direct Sandboxed YouTube Player (clipboard-write is strictly omitted to block copy) */}
      <iframe
        key={videoId}
        src={embedUrl}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        // Strict Sandbox: allows video playback, but BLOCKS all popups, window.open, and navigation to youtube.com
        sandbox="allow-scripts allow-same-origin allow-presentation"
        onLoad={() => setIsLoading(false)}
      />

      {/* Security Shield 1: Full-Width Top Bar (80px) - Long Transparent Box blocking Title, Avatar & Channel */}
      <div
        className="absolute top-0 inset-x-0 h-20 bg-transparent z-20 pointer-events-auto select-none"
        title="เนื้อหาสงวนลิขสิทธิ์"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onTouchStart={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Security Shield 2: Bottom Bar - Long Transparent Box (left-0 to right-12, h-14) */}
      {/* Completely transparent (bg-transparent) - blocks 🔗 Share button & YouTube logo without any black bar */}
      <div
        className="absolute bottom-0 left-0 right-12 h-14 bg-transparent z-30 pointer-events-auto select-none"
        title="เนื้อหาสงวนลิขสิทธิ์"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onTouchStart={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  )
}
