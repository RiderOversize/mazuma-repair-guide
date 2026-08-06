"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Loader2 } from "lucide-react"

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function CustomYouTubePlayer({ videoUrl }: { videoUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)

  // Extract video ID
  let videoId = ""
  try {
    const urlObj = new URL(videoUrl)
    if (urlObj.hostname.includes("youtube.com")) {
      if (urlObj.pathname === "/watch") {
        videoId = urlObj.searchParams.get("v") || ""
      } else if (urlObj.pathname.startsWith("/embed/")) {
        videoId = urlObj.pathname.split("/embed/")[1]?.split("?")[0] || ""
      } else if (urlObj.pathname.startsWith("/shorts/")) {
        videoId = urlObj.pathname.split("/shorts/")[1] || ""
      }
    } else if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1)
    }
  } catch (e) {
    // Ignore invalid URL
  }

  useEffect(() => {
    if (!videoId) return;

    const loadPlayer = () => {
      if (!containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e: any) => {
            setIsReady(true)
            setDuration(e.target.getDuration())
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true)
            } else if (
              e.data === window.YT.PlayerState.PAUSED ||
              e.data === window.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false)
            }
          },
        },
      })
    }

    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        loadPlayer()
      }
    } else {
      loadPlayer()
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [videoId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && !isScrubbing) {
      interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime())
        }
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isScrubbing])

  const formatTime = (timeInSeconds: number) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "0:00"
    const m = Math.floor(timeInSeconds / 60)
    const s = Math.floor(timeInSeconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const togglePlay = () => {
    if (!playerRef.current || !isReady) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
  }

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    setIsScrubbing(false)
    if (playerRef.current) {
      const newTime = parseFloat((e.target as HTMLInputElement).value)
      playerRef.current.seekTo(newTime, true)
    }
  }

  if (!videoId) {
    return <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white text-sm">รูปแบบลิงก์ YouTube ไม่ถูกต้อง</div>
  }

  return (
    <div className="relative w-full h-full bg-black group select-none">
      {/* The actual YouTube iframe will be mounted here */}
      {/* Absolute inset-0 on containerRef ensures it fills the wrapper */}
      <div className="absolute inset-0 pointer-events-none" ref={containerRef} />

      {/* 100% Overlay to block ALL clicks to the iframe */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer" 
        onContextMenu={(e) => e.preventDefault()}
        onClick={togglePlay}
      >
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Loader2 className="size-8 animate-spin text-white" />
          </div>
        )}

        {/* Big Center Play Button (Visible only when paused & ready) */}
        {isReady && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-md transition-transform scale-100 group-active:scale-95">
              <Play className="size-8 translate-x-1 fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* Custom Bottom Control Bar */}
      <div 
        className={`absolute bottom-0 inset-x-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-2 pt-12 transition-opacity duration-300 ${
          isPlaying && !isScrubbing ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        }`}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Seek Bar */}
        <div className="group/seek relative w-full h-4 flex items-center cursor-pointer mb-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeekChange}
            onMouseDown={() => setIsScrubbing(true)}
            onMouseUp={handleSeekMouseUp}
            onTouchStart={() => setIsScrubbing(true)}
            onTouchEnd={handleSeekMouseUp}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {/* Visual Progress Bar */}
          <div className="relative w-full h-1.5 bg-white/30 rounded-full overflow-hidden transition-all group-hover/seek:h-2.5">
            <div 
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-75" 
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={togglePlay}
            className="text-white hover:text-primary transition-colors p-1"
          >
            {isPlaying ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 fill-current" />
            )}
          </button>
          
          <div className="text-white/90 text-[11px] font-medium font-mono tabular-nums tracking-wider">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  )
}
