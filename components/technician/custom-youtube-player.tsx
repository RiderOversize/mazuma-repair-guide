"use client"

import { useState } from "react"
import { Play, Loader2 } from "lucide-react"

interface CustomYouTubePlayerProps {
  videoUrl: string
}

/**
 * High-Security Direct YouTube Player for LINE In-App Browser & Mobile WebViews.
 * - Direct iframe embed on youtube-nocookie.com (passes mobile user gesture requirements 100%)
 * - Strict sandbox (blocks popups, external links, and navigation to youtube.com)
 * - Invisible shields block tapping 'Share' / 'Copy Link' (top bar) and YouTube logo (bottom right)
 * - Anti-leak: unlisted, modestbranding=1, rel=0, no context menu
 */
export function CustomYouTubePlayer({ videoUrl }: CustomYouTubePlayerProps) {
  const [isLoading, setIsLoading] = useState(true)

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
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Loading Spinner until Iframe is ready */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 pointer-events-none">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}

      {/* Direct Sandboxed YouTube Player */}
      <iframe
        key={videoId}
        src={embedUrl}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        // Strict Sandbox: allows video playback scripts & presentation, but BLOCKS all popups, window.open, and navigation to youtube.com
        sandbox="allow-scripts allow-same-origin allow-presentation"
        onLoad={() => setIsLoading(false)}
      />

      {/* Security Shield 1: Top Bar Blocker (Blocks tapping video title, share button, and copy link) */}
      <div
        className="absolute top-0 inset-x-0 h-12 bg-transparent z-20 pointer-events-auto select-none"
        title="เนื้อหาสงวนลิขสิทธิ์"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Security Shield 2: Bottom-Right YouTube Logo Blocker (Blocks tapping the YouTube watermark/logo) */}
      <div
        className="absolute bottom-0 right-10 w-24 h-11 bg-transparent z-20 pointer-events-auto select-none"
        title="เนื้อหาสงวนลิขสิทธิ์"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  )
}
