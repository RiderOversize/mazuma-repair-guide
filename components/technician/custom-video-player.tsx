"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, Minimize, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomVideoPlayerProps {
  videoUrl: string
  label?: string
  fallbackDriveUrl?: string
}

export function CustomVideoPlayer({ videoUrl, label, fallbackDriveUrl }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [hasError, setHasError] = useState(false)
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reset all playback states whenever the video URL changes
  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setShowControls(true)
    setIsLoading(false)
    setIsScrubbing(false)
    setHasError(false)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [videoUrl])

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

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch((err) => {
            console.warn("Direct play blocked in mobile webview, attempting muted fallback:", err)
            if (videoRef.current) {
              videoRef.current.muted = true
              setIsMuted(true)
              videoRef.current.play().then(() => {
                setIsPlaying(true)
              }).catch((e) => {
                console.error("Video play completely blocked:", e)
                setHasError(true)
              })
            }
          })
      }
    }
    resetControlsTimer()
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current || isScrubbing) return
    setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
    setIsLoading(false)
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
    if (videoRef.current) {
      const newTime = parseFloat((e.target as HTMLInputElement).value)
      videoRef.current.currentTime = newTime
    }
    resetControlsTimer()
  }

  const skipSeconds = (seconds: number) => {
    if (!videoRef.current) return
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
    resetControlsTimer()
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
    resetControlsTimer()
  }

  const changePlaybackRate = () => {
    if (!videoRef.current) return
    const rates = [1, 1.25, 1.5, 2, 0.75]
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length
    const nextRate = rates[nextIndex]
    videoRef.current.playbackRate = nextRate
    setPlaybackRate(nextRate)
    resetControlsTimer()
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.warn)
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(console.warn)
      setIsFullscreen(false)
    }
    resetControlsTimer()
  }

  const formatTime = (timeInSeconds: number) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "0:00"
    const m = Math.floor(timeInSeconds / 60)
    const s = Math.floor(timeInSeconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  // Fallback to Drive iframe if streaming fails
  if (hasError && fallbackDriveUrl) {
    return (
      <iframe
        className="w-full h-full border-0"
        src={fallbackDriveUrl}
        allow="autoplay"
        sandbox="allow-scripts allow-same-origin allow-presentation"
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group select-none overflow-hidden"
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      onClick={resetControlsTimer}
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        key={videoUrl}
        src={videoUrl}
        className="w-full h-full object-contain"
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        crossOrigin="anonymous"
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
          setShowControls(true)
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        onClick={togglePlay}
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none z-20">
          <Loader2 className="size-9 animate-spin text-primary" />
        </div>
      )}

      {/* Big Center Play Button (Always visible when not playing) */}
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

      {/* Control Overlay Bar (Auto-hides when playing) */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3.5 pb-2.5 pt-10 transition-all duration-300 ease-in-out",
          showControls ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
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
          {/* Progress Bar Visual */}
          <div className="relative w-full h-1.5 bg-white/25 rounded-full overflow-hidden transition-all duration-200 group-hover/seek:h-2.5">
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-75"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2">
            {/* Play/Pause toggle */}
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

            {/* Time Indicator */}
            <div className="text-[0.71875rem] font-mono font-medium tracking-wide text-white/90 ml-1 select-none">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/40 mx-1">/</span>
              <span className="text-white/60">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Playback speed */}
            <button
              type="button"
              onClick={changePlaybackRate}
              className="px-2 py-1 rounded-md hover:bg-white/15 text-[0.6875rem] font-bold font-mono text-white/85 hover:text-white transition-all"
              title="ความเร็วการเล่น"
            >
              {playbackRate}x
            </button>

            {/* Mute/Unmute */}
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
