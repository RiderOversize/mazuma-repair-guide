"use client"

import { useState, useEffect } from "react"
import { Play, Lock, FileText, Video, Maximize2, X, Eye, ChevronLeft, ZoomIn, ZoomOut, RotateCcw, Loader2 } from "lucide-react"
import { CustomYouTubePlayer } from "./custom-youtube-player"
import { CustomVideoPlayer } from "./custom-video-player"

/**
 * Secure video & PDF player.
 * - In-App PDF embedded preview and Fullscreen Modal
 * - Transparent overlay over top bar blocks Google Drive's 'Pop-out', 'Share' and 'Download' buttons
 * - Mobile Zoom Controls (Zoom In, Out, Pinch-to-zoom) & Pan/Scroll support
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
  const [zoom, setZoom] = useState(1)
  const [touchDistance, setTouchDistance] = useState<number | null>(null)
  
  const isRealVideo = mediaUrl && mediaUrl.startsWith("http");
  const isRealPdf = pdfUrl && pdfUrl.startsWith("http");

  const getDriveFileId = (url?: string) => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("drive.google.com") || urlObj.hostname.includes("docs.google.com")) {
        const fileIdMatch = urlObj.pathname.match(/\/file\/d\/([^/]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          return fileIdMatch[1];
        }
        const idParam = urlObj.searchParams.get("id");
        if (idParam) {
          return idParam;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const driveFileId = getDriveFileId(mediaUrl);

  const handleZoomIn = () => setZoom(prev => Math.min(Number((prev + 0.25).toFixed(2)), 3.0))
  const handleZoomOut = () => setZoom(prev => Math.max(Number((prev - 0.25).toFixed(2)), 1.0))
  const handleResetZoom = () => setZoom(1.0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setTouchDistance(dist)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistance !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const factor = dist / touchDistance
      setZoom(prev => {
        const next = prev * factor
        return Math.min(Math.max(Number(next.toFixed(2)), 1.0), 3.0)
      })
      setTouchDistance(dist)
    }
  }

  const handleTouchEnd = () => {
    setTouchDistance(null)
  }

  useEffect(() => {
    if (isPdfModalOpen) {
      document.body.style.overflow = "hidden"
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsPdfModalOpen(false)
          setZoom(1)
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        document.body.style.overflow = ""
        window.removeEventListener("keydown", handleKeyDown)
      }
    } else {
      setZoom(1)
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

  const [resolvedDocUrl, setResolvedDocUrl] = useState<string>("")
  const [isResolvingDoc, setIsResolvingDoc] = useState<boolean>(false)

  const isCanvaUrl = (url?: string) => {
    if (!url) return false;
    return url.includes("canva.com") || url.includes("canva.link");
  };

  const getCanvaEmbedUrl = (url: string) => {
    try {
      const iframeMatch = url.match(/src=["'](.*?)["']/);
      const targetUrl = iframeMatch ? iframeMatch[1] : url.trim();

      const urlObj = new URL(targetUrl);
      if (urlObj.hostname.includes("canva.com")) {
        let pathname = urlObj.pathname;
        if (pathname.endsWith("/edit") || pathname.endsWith("/watch") || pathname.endsWith("/preview")) {
          pathname = pathname.replace(/\/(edit|watch|preview)$/, "/view");
        } else if (!pathname.endsWith("/view")) {
          pathname = `${pathname.replace(/\/+$/, "")}/view`;
        }
        urlObj.pathname = pathname;
        urlObj.searchParams.set("embed", "");
        return urlObj.toString().replace("embed=", "embed");
      }
      return targetUrl;
    } catch (e) {
      if (url.includes("canva.com")) {
        if (!url.includes("embed")) {
          return url.includes("?") ? `${url}&embed` : `${url}?embed`;
        }
      }
      return url;
    }
  };

  const getDocumentEmbedUrl = (url?: string) => {
    if (!url) return "";
    if (isCanvaUrl(url)) {
      return getCanvaEmbedUrl(url);
    }
    return getDriveEmbedUrl(url);
  };

  useEffect(() => {
    if (!pdfUrl) {
      setResolvedDocUrl("");
      return;
    }

    if (pdfUrl.includes("canva.link")) {
      setIsResolvingDoc(true);
      fetch(`/api/media/resolve-canva?url=${encodeURIComponent(pdfUrl)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.embedUrl) {
            setResolvedDocUrl(data.embedUrl);
          } else {
            setResolvedDocUrl(getDocumentEmbedUrl(pdfUrl));
          }
        })
        .catch((err) => {
          console.error("Error resolving canva url:", err);
          setResolvedDocUrl(getDocumentEmbedUrl(pdfUrl));
        })
        .finally(() => {
          setIsResolvingDoc(false);
        });
    } else {
      setResolvedDocUrl(getDocumentEmbedUrl(pdfUrl));
    }
  }, [pdfUrl]);

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
            {isCanvaUrl(pdfUrl) ? "เอกสาร Canva" : "เอกสาร PDF"}
          </button>
        </div>

        <div className="relative aspect-[3/4] md:aspect-[4/3] w-full overflow-hidden rounded-xl bg-black ring-1 ring-black/20">
          {activeTab === "video" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
              {isRealVideo ? (
                mediaUrl?.includes("youtube.com") || mediaUrl?.includes("youtu.be") ? (
                  <CustomYouTubePlayer videoUrl={mediaUrl} />
                ) : driveFileId ? (
                  <CustomVideoPlayer
                    videoUrl={`/api/media/stream?fileId=${driveFileId}`}
                    fallbackDriveUrl={getDriveEmbedUrl(mediaUrl)}
                    label={label}
                  />
                ) : (
                  <CustomVideoPlayer
                    videoUrl={mediaUrl!}
                    label={label}
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
                isResolvingDoc ? (
                  <div className="flex flex-col items-center justify-center gap-3 w-full h-full bg-slate-900 text-white">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">กำลังโหลดเอกสาร Canva...</p>
                  </div>
                ) : (
                  <>
                    <iframe
                      className="w-full h-full border-0 bg-white"
                      src={resolvedDocUrl || getDocumentEmbedUrl(pdfUrl)}
                      allow="autoplay; fullscreen; clipboard-read; clipboard-write"
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                    {/* Invisible overlay over Google Drive's top toolbar to block 'Pop-out' (disabled for Canva to allow interaction) */}
                    {!isCanvaUrl(pdfUrl) && (
                      <div 
                        className="absolute top-0 right-0 w-36 sm:w-44 h-14 bg-transparent z-10 pointer-events-auto" 
                        title="เนื้อหามีลิขสิทธิ์" 
                        onContextMenu={e => e.preventDefault()} 
                      />
                    )}
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
                )
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

      {/* In-App Fullscreen PDF / Canva Reader Modal */}
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
                    {isCanvaUrl(pdfUrl) ? "เอกสาร Canva ขั้นตอนที่ " : "เอกสารขั้นตอนที่ "} {stepNum}
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                    <Lock className="size-2.5" />
                    {isCanvaUrl(pdfUrl) ? "Canva Interactive Guide" : "เอกสารสำหรับใช้งานภายใน"}
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

          {/* Modal PDF / Canva Frame */}
          <div 
            className="relative flex-1 w-full bg-slate-900 overflow-auto"
            style={{ WebkitOverflowScrolling: "touch" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="min-w-full min-h-full transition-all duration-100 ease-out origin-top-left flex items-center justify-center"
              style={{ 
                width: zoom > 1 ? `${zoom * 100}%` : "100%", 
                height: zoom > 1 ? `${zoom * 100}%` : "100%",
              }}
            >
              <div className="relative w-full h-full min-h-[85vh]">
                <iframe
                  className="w-full h-full border-0 bg-white min-h-[85vh]"
                  src={resolvedDocUrl || getDocumentEmbedUrl(pdfUrl)}
                  allow="autoplay; fullscreen; clipboard-read; clipboard-write"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
                {/* Invisible overlay over Google's top-right bar (disabled for Canva) */}
                {!isCanvaUrl(pdfUrl) && (
                  <div 
                    className="absolute top-0 right-0 w-48 h-16 bg-transparent z-30 pointer-events-auto" 
                    title="เนื้อหามีลิขสิทธิ์" 
                    onContextMenu={e => e.preventDefault()} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Floating Bottom Control Bar: Zoom Controls + Quick Back */}
          <div className="absolute bottom-5 inset-x-0 z-40 flex items-center justify-center pointer-events-none px-4">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-white/20 px-3 py-1.5 shadow-2xl backdrop-blur-md pointer-events-auto text-white">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="ซูมออก"
              >
                <ZoomOut className="size-4" />
              </button>
              
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 text-xs font-bold font-mono rounded-lg hover:bg-white/10 transition-colors"
                title="รีเซ็ตขนาด"
              >
                {Math.round(zoom * 100)}%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="ซูมเข้า"
              >
                <ZoomIn className="size-4" />
              </button>

              {zoom > 1 && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="flex size-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 active:scale-95 transition-all"
                  title="รีเซ็ตเป็น 100%"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              )}

              <div className="h-5 w-px bg-white/20 mx-1" />

              <button
                type="button"
                onClick={() => { setIsPdfModalOpen(false); setZoom(1); }}
                className="flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
              >
                <ChevronLeft className="size-3.5" />
                <span>กลับ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
