import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'

export interface YouTubeEmbedHandle {
  seekTo: (seconds: number) => void
  /** Minimal HTMLAudioElement-like interface for game components */
  getAudioAdapter: () => AudioAdapter | null
}

/** Subset of HTMLAudioElement used by GapFillGame/TypeFillGame/TypingPractice */
export interface AudioAdapter {
  get currentTime(): number
  set currentTime(v: number)
  get paused(): boolean
  play(): Promise<void>
  pause(): void
}

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

const YouTubeEmbed = forwardRef<YouTubeEmbedHandle, YouTubeEmbedProps>(
  function YouTubeEmbed({ videoId, onTimeUpdate, onReady, onStateChange }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<YT.Player | null>(null)
    const rafRef = useRef<number>(0)
    const isPlayingRef = useRef(false)
    const onTimeUpdateRef = useRef(onTimeUpdate)
    onTimeUpdateRef.current = onTimeUpdate

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => playerRef.current?.seekTo(seconds, true),
      getAudioAdapter: (): AudioAdapter | null => {
        const player = playerRef.current
        if (!player) return null
        return {
          get currentTime() { return player.getCurrentTime() },
          set currentTime(v: number) { player.seekTo(v, true) },
          get paused() { return player.getPlayerState() !== 1 },
          play() { player.playVideo(); return Promise.resolve() },
          pause() { player.pauseVideo() },
        }
      },
    }), [])

    const startPolling = useCallback(() => {
      const poll = () => {
        if (playerRef.current && isPlayingRef.current) {
          onTimeUpdateRef.current(playerRef.current.getCurrentTime())
        }
        rafRef.current = requestAnimationFrame(poll)
      }
      rafRef.current = requestAnimationFrame(poll)
    }, [])

    useEffect(() => {
      let destroyed = false

      const init = async () => {
        await loadIframeAPI()
        if (destroyed || !containerRef.current) return

        const target = document.createElement('div')
        target.id = `yt-player-${videoId}-${Date.now()}`
        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(target)

        playerRef.current = new YT.Player(target.id, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
            cc_load_policy: 0,
            iv_load_policy: 3,
          },
          events: {
            onReady: () => { if (!destroyed) onReady?.() },
            onStateChange: (e) => {
              if (destroyed) return
              isPlayingRef.current = e.data === 1
              onStateChange?.(e.data)
            },
          },
        })

        startPolling()
      }

      init()

      return () => {
        destroyed = true
        cancelAnimationFrame(rafRef.current)
        try { playerRef.current?.destroy() } catch { /* already destroyed */ }
        playerRef.current = null
      }
    }, [videoId, startPolling, onReady, onStateChange])

    return (
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <div
          ref={containerRef}
          className="absolute inset-0 rounded-lg overflow-hidden bg-black"
        />
      </div>
    )
  },
)

export default YouTubeEmbed
