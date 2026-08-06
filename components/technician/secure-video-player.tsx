"use client"

import { useState } from "react"
import { Play, Lock, FileText, Video } from "lucide-react"
import { CustomYouTubePlayer } from "./custom-youtube-player"

const VIEW_DATE = "10 ก.ค. 2026"

/**
 * Secure video player mock.
 * - Fake embed (no real controls / no download path)
 * - Transparent overlay at z-20 blocks all clicks & right-click
 * - Repeated -45deg watermark identifies the current viewer
 */
export function SecureVideoPlayer({
  stepNum,
  label,
  mediaUrl,
  pdfUrl,
}: {
  stepNum: number
  label?: string
  mediaUrl?: string
  pdfUrl?: string
}) {
  const [activeTab, setActiveTab] = useState<"video" | "pdf">("video")
  
  const isRealVideo = mediaUrl && mediaUrl.startsWith("http");
  const isRealPdf = pdfUrl && pdfUrl.startsWith("http");

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      let videoId = "";
      if (urlObj.hostname.includes("youtube.com")) {
        if (urlObj.pathname === "/watch") {
          videoId = urlObj.searchParams.get("v") || "";
        } else if (urlObj.pathname.startsWith("/embed/")) {
          return url; // Already an embed URL
        } else if (urlObj.pathname.startsWith("/shorts/")) {
          videoId = urlObj.pathname.split("/shorts/")[1];
        }
      } else if (urlObj.hostname === "youtu.be") {
        videoId = urlObj.pathname.slice(1);
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1&disablekb=1`;
      }
      return url;
    } catch (e) {
      return url;
    }
  }

  const getDriveEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("drive.google.com") || urlObj.hostname.includes("docs.google.com")) {
        const fileIdMatch = urlObj.pathname.match(/\/file\/d\/([^/]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
        }
        const idParam = urlObj.searchParams.get("id");
        if (idParam) {
          return `https://drive.google.com/file/d/${idParam}/preview`;
        }
      }
      return url;
    } catch (e) {
      return url;
    }
  }

  return (
    <div className="flex flex-col gap-3" onContextMenu={(e) => e.preventDefault()}>
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 rounded-xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setActiveTab("video")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
            activeTab === "video"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
          }`}
        >
          <Video className="size-4" />
          วิดีโอ
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pdf")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
            activeTab === "pdf"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
          }`}
        >
          <FileText className="size-4" />
          เอกสาร PDF
        </button>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 ring-1 ring-black/20">
        {activeTab === "video" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            {isRealVideo ? (
              mediaUrl?.includes("youtube.com") || mediaUrl?.includes("youtu.be") ? (
                <CustomYouTubePlayer videoUrl={mediaUrl} />
              ) : (mediaUrl?.includes("drive.google.com") || mediaUrl?.includes("docs.google.com")) ? (
                <>
                  <iframe
                    className="w-full h-full"
                    src={getDriveEmbedUrl(mediaUrl)}
                    allow="autoplay"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                  ></iframe>
                  {/* Invisible overlay over the top right to block the 'Pop-out' button */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-transparent z-10 pointer-events-auto" title="เนื้อหามีลิขสิทธิ์" onContextMenu={e => e.preventDefault()} />
                </>
              ) : (
                <video 
                  src={mediaUrl} 
                  controls 
                  className="w-full h-full object-contain"
                  controlsList="nodownload noplaybackrate"
                  disablePictureInPicture
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-800 to-slate-950 w-full h-full">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                  <Play className="size-7 translate-x-0.5 fill-white/90 text-white/90" />
                </div>
                <p className="text-sm font-medium text-white/80">
                  หัวข้อตรวจสอบที่ {stepNum}
                </p>
                {label ? (
                  <p className="max-w-[80%] text-center text-xs text-white/50">{label}</p>
                ) : null}

                {/* Fake progress / control bar (non-functional visual only) */}
                <div className="absolute inset-x-4 bottom-3">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-1/3 rounded-full bg-white/70" />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/50">
                    <span>00:42</span>
                    <span>02:15</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200">
            {isRealPdf ? (
              <iframe src={pdfUrl} className="w-full h-full" />
            ) : (
              <>
                <FileText className="size-16 text-slate-400" />
                <p className="text-sm font-medium text-slate-600">
                  เอกสารหัวข้อตรวจสอบที่ {stepNum}
                </p>
                {label ? (
                  <p className="max-w-[80%] text-center text-xs text-slate-500">{label}</p>
                ) : null}
                <button className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90">
                  แตะเพื่อเปิด PDF
                </button>
              </>
            )}
          </div>
        )}

        {/* Secure badge */}
        <div className="absolute left-3 top-3 z-30 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm pointer-events-none">
          <Lock className="size-3" />
          เนื้อหามีลิขสิทธิ์
        </div>
      </div>
    </div>
  )
}
