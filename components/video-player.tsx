"use client"

import { useState, useRef, useEffect } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Film,
  Youtube,
  AlertCircle,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VideoPlayerProps {
  title: string
  videoId: string
  type: string
  trailerKey?: string
  streamingSource?: {
    url: string
    title: string
    source: string
    license: string
  }
}

// Public domain movies from Archive.org - fallback if no streaming source is provided
const PUBLIC_DOMAIN_MOVIES = [
  {
    title: "Night of the Living Dead (1968)",
    url: "https://ia800707.us.archive.org/5/items/Night_of_the_Living_Dead_1968_720p/Night_of_the_Living_Dead_1968_720p.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
  {
    title: "The Little Shop of Horrors (1960)",
    url: "https://ia801603.us.archive.org/13/items/TheLittleShopOfHorrors1960/The_Little_Shop_of_Horrors_1960.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
  {
    title: "Charade (1963)",
    url: "https://ia800103.us.archive.org/27/items/Charade1963/Charade1963_512kb.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
  {
    title: "Plan 9 from Outer Space (1959)",
    url: "https://ia800300.us.archive.org/1/items/Plan9FromOuterSpace1959/Plan9FromOuterSpace1959.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
  {
    title: "The Phantom of the Opera (1925)",
    url: "https://ia800204.us.archive.org/4/items/ThePhantomoftheOpera/Phantom_of_the_Opera_512kb.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
]

export function VideoPlayer({ title, videoId, type, trailerKey, streamingSource }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(true)
  const [playbackMode, setPlaybackMode] = useState<"trailer" | "fullMovie">(streamingSource ? "fullMovie" : "trailer")
  const [error, setError] = useState<string | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get a consistent movie based on the videoId if no streaming source is provided
  const movieIndex = Number.parseInt(videoId) % PUBLIC_DOMAIN_MOVIES.length
  const fallbackMovie = PUBLIC_DOMAIN_MOVIES[movieIndex]

  // Use provided streaming source or fallback
  const fullMovie = streamingSource || fallbackMovie

  // YouTube embed URL for trailer
  const youtubeUrl = trailerKey
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=0&enablejsapi=1&modestbranding=1&rel=0&showinfo=0`
    : `https://www.youtube.com/embed/aqz-KE-bpKQ?autoplay=1&controls=0&enablejsapi=1&modestbranding=1&rel=0&showinfo=0`

  useEffect(() => {
    const video = videoRef.current
    if (!video || (playbackMode === "trailer" && trailerKey)) return

    const onLoadedMetadata = () => {
      setDuration(video.duration)
      setIsBuffering(false)
    }

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const onEnded = () => {
      setIsPlaying(false)
    }

    const onWaiting = () => {
      setIsBuffering(true)
    }

    const onPlaying = () => {
      setIsBuffering(false)
    }

    const onError = () => {
      setError("Failed to load video. The source may be unavailable.")
      setIsBuffering(false)
    }

    video.addEventListener("loadedmetadata", onLoadedMetadata)
    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("ended", onEnded)
    video.addEventListener("waiting", onWaiting)
    video.addEventListener("playing", onPlaying)
    video.addEventListener("error", onError)

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata)
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("ended", onEnded)
      video.removeEventListener("waiting", onWaiting)
      video.removeEventListener("playing", onPlaying)
      video.removeEventListener("error", onError)
    }
  }, [playbackMode, trailerKey])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          togglePlay()
          break
        case "ArrowRight":
          skip(10)
          break
        case "ArrowLeft":
          skip(-10)
          break
        case "f":
          toggleFullscreen()
          break
        case "m":
          toggleMute()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Reset player state when switching modes
  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setIsBuffering(true)
    setError(null)

    // Auto-play after a short delay
    const timer = setTimeout(() => {
      togglePlay()
    }, 1000)

    return () => clearTimeout(timer)
  }, [playbackMode])

  const togglePlay = () => {
    if (error) return

    if (playbackMode === "trailer" && trailerKey) {
      // YouTube control via postMessage
      const iframe = iframeRef.current
      if (!iframe) return

      try {
        if (isPlaying) {
          iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*")
        } else {
          iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', "*")
        }
        setIsPlaying(!isPlaying)
      } catch (error) {
        console.error("Error controlling YouTube player:", error)
      }

      resetControlsTimeout()
      return
    }

    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch((err) => {
        console.error("Error playing video:", err)
        setError("Failed to play video. Please try again.")
      })
    }

    setIsPlaying(!isPlaying)
    resetControlsTimeout()
  }

  const toggleMute = () => {
    if (error) return

    if (playbackMode === "trailer" && trailerKey) {
      // YouTube mute via postMessage
      const iframe = iframeRef.current
      if (!iframe) return

      try {
        if (isMuted) {
          iframe.contentWindow?.postMessage('{"event":"command","func":"unMute","args":""}', "*")
        } else {
          iframe.contentWindow?.postMessage('{"event":"command","func":"mute","args":""}', "*")
        }
        setIsMuted(!isMuted)
      } catch (error) {
        console.error("Error muting YouTube player:", error)
      }

      resetControlsTimeout()
      return
    }

    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
    resetControlsTimeout()
  }

  const toggleFullscreen = () => {
    const player = playerRef.current
    if (!player) return

    if (!isFullscreen) {
      if (player.requestFullscreen) {
        player.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }

    resetControlsTimeout()
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const handleVolumeChange = (value: number[]) => {
    if (error) return

    const newVolume = value[0]

    if (playbackMode === "trailer" && trailerKey) {
      // YouTube volume via postMessage
      const iframe = iframeRef.current
      if (!iframe) return

      try {
        iframe.contentWindow?.postMessage(`{"event":"command","func":"setVolume","args":[${newVolume * 100}]}`, "*")
        setVolume(newVolume)
        setIsMuted(newVolume === 0)
      } catch (error) {
        console.error("Error setting YouTube volume:", error)
      }

      resetControlsTimeout()
      return
    }

    const video = videoRef.current
    if (!video) return

    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    resetControlsTimeout()
  }

  const handleSeek = (value: number[]) => {
    if (error) return

    const newTime = value[0]

    if (playbackMode === "trailer" && trailerKey) {
      // YouTube seek via postMessage
      const iframe = iframeRef.current
      if (!iframe) return

      try {
        iframe.contentWindow?.postMessage(`{"event":"command","func":"seekTo","args":[${newTime}, true]}`, "*")
        setCurrentTime(newTime)
      } catch (error) {
        console.error("Error seeking YouTube player:", error)
      }

      resetControlsTimeout()
      return
    }

    const video = videoRef.current
    if (!video) return

    video.currentTime = newTime
    setCurrentTime(newTime)
    resetControlsTimeout()
  }

  const skip = (seconds: number) => {
    if (error) return

    if (playbackMode === "trailer" && trailerKey) {
      // For YouTube, we need to know the current time first
      // This is approximate since we can't easily get the current time from YouTube
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
      handleSeek([newTime])
      return
    }

    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
    resetControlsTimeout()
  }

  const resetControlsTimeout = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    return [h > 0 ? h.toString().padStart(2, "0") : null, m.toString().padStart(2, "0"), s.toString().padStart(2, "0")]
      .filter(Boolean)
      .join(":")
  }

  return (
    <div className="flex flex-col w-full">
      {/* Playback Mode Selector */}
      <div className="bg-gray-900 p-2 border-b border-gray-800">
        <Tabs
          value={playbackMode}
          onValueChange={(value) => setPlaybackMode(value as "trailer" | "fullMovie")}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="trailer" className="flex items-center gap-2" disabled={!trailerKey}>
              <Youtube className="h-4 w-4" />
              Trailer {!trailerKey && "(Unavailable)"}
            </TabsTrigger>
            <TabsTrigger value="fullMovie" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Full Movie
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Video Player */}
      <div
        ref={playerRef}
        className="relative w-full aspect-video bg-black"
        onMouseMove={resetControlsTimeout}
        onClick={togglePlay}
      >
        {/* Video or YouTube Embed */}
        {playbackMode === "trailer" && trailerKey ? (
          <iframe
            ref={iframeRef}
            src={youtubeUrl}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        ) : (
          <video
            ref={videoRef}
            src={fullMovie.url}
            className="w-full h-full"
            poster={`https://image.tmdb.org/t/p/w1280/placeholder.jpg`}
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Buffering Indicator */}
        {isBuffering && !error && (playbackMode !== "trailer" || !trailerKey) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}

        {/* Controls Overlay */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar */}
          <div className="p-4">
            <h2 className="text-lg font-medium">
              {playbackMode === "fullMovie" ? fullMovie.title : title}
              {playbackMode === "fullMovie" && (
                <span className="ml-2 text-sm text-green-400">
                  ({fullMovie.license} - {fullMovie.source})
                </span>
              )}
            </h2>
          </div>

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Button
              variant="ghost"
              size="icon"
              className="h-16 w-16 rounded-full bg-black/30 backdrop-blur-sm pointer-events-auto"
              onClick={togglePlay}
              disabled={!!error}
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="p-4 space-y-2">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <span className="text-sm">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1 cursor-pointer [&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/30 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&>span:first-child_span]:bg-primary"
                disabled={!!error}
              />
              <span className="text-sm">{formatTime(duration)}</span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={togglePlay} disabled={!!error}>
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>

                <Button variant="ghost" size="icon" onClick={() => skip(-10)} disabled={!!error}>
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button variant="ghost" size="icon" onClick={() => skip(10)} disabled={!!error}>
                  <SkipForward className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2 ml-2">
                  <Button variant="ghost" size="icon" onClick={toggleMute} disabled={!!error}>
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>

                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-24 cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&>span:first-child_span]:bg-primary"
                    disabled={!!error}
                  />
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={toggleFullscreen} disabled={!!error}>
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
