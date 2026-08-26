"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, Minimize, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [showControls, setShowControls] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Reset state on video change
  useEffect(() => {
    setIsPlaying(false)
    setIsReady(false)
    setCurrentTime(0)
    setShowControls(true)
    setIsScrubbing(false)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
  }, [videoId])

  // Auto-hide controls timer
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying && !isScrubbing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 2500)
    }
  }, [isPlaying, isScrubbing])

  useEffect(() => {
    if (isPlaying && !isScrubbing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 2500)
    } else {
      setShowControls(true)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying, isScrubbing])

  useEffect(() => {
    if (!videoId) return

    let isMounted = true

    const loadPlayer = () => {
      if (!containerRef.current || !isMounted) return

      // Destroy old instance if exists
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (e) {}
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        width: "100%",
        height: "100%",
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
            if (!isMounted) return
            setIsReady(true)
            setDuration(e.target.getDuration())
          },
          onStateChange: (e: any) => {
            if (!isMounted) return
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
      isMounted = false
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (e) {}
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
    if (!playerRef.current) return
    if (isPlaying) {
      try {
        playerRef.current.pauseVideo()
      } catch (e) {}
      setIsPlaying(false)
    } else {
      try {
        playerRef.current.playVideo()
        setIsPlaying(true)
      } catch (e) {}
    }
    resetControlsTimer()
  }

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
  }

  const handleSeekStart = () => {
    setIsScrubbing(true)
    setShowControls(true)
  }

  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    setIsScrubbing(false)
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      const newTime = parseFloat((e.target as HTMLInputElement).value)
      playerRef.current.seekTo(newTime, true)
    }
    resetControlsTimer()
  }

  const skipSeconds = (seconds: number) => {
    if (!playerRef.current) return
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    setCurrentTime(newTime)
    if (typeof playerRef.current.seekTo === "function") {
      playerRef.current.seekTo(newTime, true)
    }
    resetControlsTimer()
  }

  const toggleMute = () => {
    if (!playerRef.current) return
    if (isMuted) {
      if (typeof playerRef.current.unMute === "function") playerRef.current.unMute()
      setIsMuted(false)
    } else {
      if (typeof playerRef.current.mute === "function") playerRef.current.mute()
      setIsMuted(true)
    }
    resetControlsTimer()
  }

  const changePlaybackRate = () => {
    if (!playerRef.current) return
    const rates = [1, 1.25, 1.5, 2, 0.75]
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length
    const nextRate = rates[nextIndex]
    if (typeof playerRef.current.setPlaybackRate === "function") {
      playerRef.current.setPlaybackRate(nextRate)
    }
    setPlaybackRate(nextRate)
    resetControlsTimer()
  }

  const toggleFullscreen = () => {
    const el = containerRef.current?.parentElement
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(console.warn)
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(console.warn)
      setIsFullscreen(false)
    }
    resetControlsTimer()
  }

  if (!videoId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white text-sm">
        รูปแบบลิงก์ YouTube ไม่ถูกต้อง
      </div>
    )
  }

  return (
    <div
      key={videoId}
      className="relative w-full h-full bg-black group select-none overflow-hidden"
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      onClick={resetControlsTimer}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* The actual YouTube iframe will be mounted here */}
      <div className="absolute inset-0 pointer-events-none">
        <div ref={containerRef} />
      </div>

      {/* Transparent Click Layer */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onContextMenu={(e) => e.preventDefault()}
        onClick={togglePlay}
      >
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs">
            <Loader2 className="size-9 animate-spin text-primary" />
          </div>
        )}

        {/* Center Play Button on Pause / Stopped (Always visible when !isPlaying) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 transition-all duration-300">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                togglePlay()
              }}
              className="pointer-events-auto flex size-15 items-center justify-center rounded-full bg-primary/95 text-primary-foreground shadow-2xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="เล่นวิดีโอ"
            >
              <Play className="size-7 translate-x-0.5 fill-current" />
            </button>
          </div>
        )}
      </div>

      {/* Auto-Hiding Bottom Control Bar */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3.5 pb-2.5 pt-10 transition-all duration-300 ease-in-out",
          showControls ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Scrubber / Progress Bar */}
        <div className="group/seek relative w-full h-5 flex items-center cursor-pointer mb-1.5">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            onMouseDown={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onTouchStart={handleSeekStart}
            onTouchEnd={handleSeekEnd}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {/* Visual Progress Bar */}
          <div className="relative w-full h-1.5 bg-white/25 rounded-full overflow-hidden transition-all duration-200 group-hover/seek:h-2.5">
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-75"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="flex size-8 items-center justify-center rounded-full hover:bg-white/15 active:scale-95 transition-all text-white"
              aria-label={isPlaying ? "หยุดชั่วคราว" : "เล่นต่อ"}
            >
              {isPlaying ? (
                <Pause className="size-4.5 fill-current" />
              ) : (
                <Play className="size-4.5 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Skip -10s */}
            <button
              type="button"
              onClick={() => skipSeconds(-10)}
              className="flex size-7.5 items-center justify-center rounded-full hover:bg-white/15 active:scale-95 transition-all text-white/85 hover:text-white"
              title="ย้อนหลัง 10 วินาที"
            >
              <RotateCcw className="size-3.5" />
            </button>

            {/* Skip +10s */}
            <button
              type="button"
              onClick={() => skipSeconds(10)}
              className="flex size-7.5 items-center justify-center rounded-full hover:bg-white/15 active:scale-95 transition-all text-white/85 hover:text-white"
              title="ไปข้างหน้า 10 วินาที"
            >
              <RotateCw className="size-3.5" />
            </button>

            {/* Time */}
            <div className="text-[0.71875rem] font-mono font-medium tracking-wide text-white/90 ml-1 select-none">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/40 mx-1">/</span>
              <span className="text-white/60">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Speed */}
            <button
              type="button"
              onClick={changePlaybackRate}
              className="px-2 py-1 rounded-md hover:bg-white/15 text-[0.6875rem] font-bold font-mono text-white/85 hover:text-white transition-all"
              title="ความเร็วการเล่น"
            >
              {playbackRate}x
            </button>

            {/* Mute */}
            <button
              type="button"
              onClick={toggleMute}
              className="flex size-8 items-center justify-center rounded-full hover:bg-white/15 active:scale-95 transition-all text-white/85 hover:text-white"
              aria-label={isMuted ? "เปิดเสียง" : "ปิดเสียง"}
            >
              {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex size-8 items-center justify-center rounded-full hover:bg-white/15 active:scale-95 transition-all text-white/85 hover:text-white"
              aria-label="เต็มจอ"
            >
              {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
