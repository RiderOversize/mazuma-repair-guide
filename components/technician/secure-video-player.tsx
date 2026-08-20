"use client"

import { useState, useEffect } from "react"
import { Play, Lock, FileText, Video, Maximize2, X, Eye, ChevronLeft } from "lucide-react"
import { CustomYouTubePlayer } from "./custom-youtube-player"

/**
 * Secure video & PDF player.
 * - In-App PDF embedded preview and Fullscreen Modal
 * - Transparent overlay over top bar blocks Google Drive's 'Pop-out', 'Share' and 'Download' buttons
 * - Allows full scrolling and zooming inside the document body
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
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  
  const isRealVideo = mediaUrl && mediaUrl.startsWith("http");
  const isRealPdf = pdfUrl && pdfUrl.startsWith("http");

  useEffect(() => {
    if (isPdfModalOpen) {
      document.body.style.overflow = "hidden"
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsPdfModalOpen(false)
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        document.body.style.overflow = ""
        window.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [isPdfModalOpen])

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
    <>
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

        <div className="relative aspect-[3/4] md:aspect-[4/3] w-full overflow-hidden rounded-xl bg-black ring-1 ring-black/20">
          {activeTab === "video" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
              {isRealVideo ? (
                mediaUrl?.includes("youtube.com") || mediaUrl?.includes("youtu.be") ? (
                  <CustomYouTubePlayer videoUrl={mediaUrl} />
                ) : (mediaUrl?.includes("drive.google.com") || mediaUrl?.includes("docs.google.com")) ? (
                  <>
                    <iframe
                      className="w-full h-full border-0"
                      src={getDriveEmbedUrl(mediaUrl)}
                      allow="autoplay"
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                    ></iframe>
                    {/* Invisible overlay over the entire top bar to block the 'Pop-out' and 'Share' buttons */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-transparent z-10 pointer-events-auto" title="เนื้อหามีลิขสิทธิ์" onContextMenu={e => e.preventDefault()} />
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
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
              {isRealPdf ? (
                <>
                  <iframe
                    className="w-full h-full border-0 bg-white"
                    src={getDriveEmbedUrl(pdfUrl)}
                    allow="autoplay"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                  ></iframe>
                  {/* Invisible overlay over Google Drive's top toolbar to block 'Pop-out', 'Share', and 'Download' */}
                  <div 
                    className="absolute top-0 right-0 w-36 sm:w-44 h-14 bg-transparent z-10 pointer-events-auto" 
                    title="เนื้อหามีลิขสิทธิ์" 
                    onContextMenu={e => e.preventDefault()} 
                  />
                  {/* Fullscreen Button Overlay */}
                  <button
                    type="button"
                    onClick={() => setIsPdfModalOpen(true)}
                    className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-xl bg-primary/90 px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-lg backdrop-blur-sm hover:bg-primary transition-all active:scale-95"
                  >
                    <Maximize2 className="size-3.5" />
                    เปิดอ่านเต็มจอ
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200 w-full h-full">
                  <FileText className="size-16 text-slate-400" />
                  <p className="text-sm font-medium text-slate-600">
                    เอกสารหัวข้อตรวจสอบที่ {stepNum}
                  </p>
                  {label ? (
                    <p className="max-w-[80%] text-center text-xs text-slate-500">{label}</p>
                  ) : null}
                  <button disabled className="mt-2 rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm">
                    ไม่มีเอกสาร
                  </button>
                </div>
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

      {/* In-App Fullscreen PDF Reader Modal */}
      {isPdfModalOpen && isRealPdf && (
        <div 
          className="fixed inset-0 z-[120] flex flex-col bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200"
          onContextMenu={e => e.preventDefault()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-3 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all active:scale-95 shrink-0"
              >
                <ChevronLeft className="size-5" />
                <span>ย้อนกลับ</span>
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white truncate">
                    เอกสารขั้นตอนที่ {stepNum}
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                    <Lock className="size-2.5" />
                    เอกสารสำหรับใช้งานภายใน
                  </span>
                </div>
                {label && (
                  <p className="text-xs text-slate-400 truncate">{label}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPdfModalOpen(false)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors active:scale-95 shrink-0"
            >
              <X className="size-4" />
              <span>ปิดเอกสาร</span>
            </button>
          </div>

          {/* Modal PDF Frame */}
          <div className="relative flex-1 w-full bg-slate-900 overflow-hidden">
            <iframe
              className="w-full h-full border-0 bg-white"
              src={getDriveEmbedUrl(pdfUrl)}
              allow="autoplay"
              sandbox="allow-scripts allow-same-origin allow-presentation"
            ></iframe>
            {/* Invisible overlay over Google's top-right bar to block 'Pop-out', 'Share', and 'Download' */}
            <div 
              className="absolute top-0 right-0 w-48 h-16 bg-transparent z-30 pointer-events-auto" 
              title="เนื้อหามีลิขสิทธิ์" 
              onContextMenu={e => e.preventDefault()} 
            />

            {/* Floating Back Button at bottom for mobile convenience */}
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(false)}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-slate-900/90 border border-white/20 px-5 py-2.5 text-xs font-bold text-white shadow-2xl backdrop-blur-md hover:bg-slate-800 transition-all active:scale-95"
            >
              <ChevronLeft className="size-4 text-primary" />
              <span>ย้อนกลับไปหน้าคู่มือ</span>
              <X className="size-3.5 opacity-60 ml-1" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
