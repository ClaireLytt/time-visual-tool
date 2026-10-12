import { useEffect, useRef, useCallback } from 'react'

interface YouTubeEmbedProps {
  videoId: string
  onTimeUpdate: (time: number) => void
  onReady?: () => void
  onStateChange?: (state: number) => void
}

let apiLoaded = false
let apiLoading = false
const readyCallbacks: (() => void)[] = []

function loadIframeAPI(): Promise<void> {
  if (apiLoaded) return Promise.resolve()
  return new Promise(resolve => {
    readyCallbacks.push(resolve)
    if (apiLoading) return
    apiLoading = true
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true
      apiLoading = false
      prev?.()
      readyCallbacks.forEach(cb => cb())
      readyCallbacks.length = 0
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
}

function YouTubeEmbed({ videoId, onTimeUpdate, onReady, onStateChange }: YouTubeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const rafRef = useRef<number>(0)
  const isPlayingRef = useRef(false)

  const onTimeUpdateRef = useRef(onTimeUpdate)
  onTimeUpdateRef.current = onTimeUpdate

  const tick = useCallback(() => {
    if (playerRef.current && isPlayingRef.current) {
      onTimeUpdateRef.current(playerRef.current.getCurrentTime())
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    let destroyed = false

    const init = async () => {
      await loadIframeAPI()
      if (destroyed || !containerRef.current) return

      // Create a target div inside the container
      const target = document.createElement('div')
      target.id = `yt-player-${videoId}-${Date.now()}`
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(target)

      playerRef.current = new YT.Player(target.id, {
        videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          cc_load_policy: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            if (!destroyed) onReady?.()
          },
          onStateChange: (e) => {
            if (destroyed) return
            isPlayingRef.current = e.data === 1 // PLAYING
            onStateChange?.(e.data)
          },
        },
      })

      // Start polling loop
      rafRef.current = requestAnimationFrame(tick)
    }

    init()

    return () => {
      destroyed = true
      cancelAnimationFrame(rafRef.current)
      try { playerRef.current?.destroy() } catch { /* already destroyed */ }
      playerRef.current = null
    }
  }, [videoId, tick, onReady, onStateChange])

  /** Seek video to a specific time in seconds */
  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true)
  }, [])

  // Expose seekTo via a data attribute that parent can read
  useEffect(() => {
    const el = containerRef.current
    if (el) (el as any).__seekTo = seekTo
  }, [seekTo])

  return (
    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
      <div
        ref={containerRef}
        className="absolute inset-0 rounded-lg overflow-hidden bg-black"
      />
    </div>
  )
}

export default YouTubeEmbed
export type { YouTubeEmbedProps }
