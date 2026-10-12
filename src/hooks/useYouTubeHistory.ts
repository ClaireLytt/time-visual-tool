import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export interface WatchedVideo {
  videoId: string
  title: string
  channelName: string
  thumbnailUrl: string
  lastWatched: string
  watchCount: number
}

const STORAGE_KEY = 'youtube-video-history'
const MAX_VIDEOS = 200

export function useYouTubeHistory() {
  const [history, setHistory] = useLocalStorage<WatchedVideo[]>(STORAGE_KEY, [])

  const addToHistory = useCallback((video: Omit<WatchedVideo, 'lastWatched' | 'watchCount'>) => {
    setHistory(prev => {
      const existing = prev.find(v => v.videoId === video.videoId)
      const updated: WatchedVideo = {
        ...video,
        lastWatched: new Date().toISOString(),
        watchCount: existing ? existing.watchCount + 1 : 1,
      }
      const filtered = prev.filter(v => v.videoId !== video.videoId)
      return [updated, ...filtered].slice(0, MAX_VIDEOS)
    })
  }, [setHistory])

  const removeFromHistory = useCallback((videoId: string) => {
    setHistory(prev => prev.filter(v => v.videoId !== videoId))
  }, [setHistory])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [setHistory])

  return { history, addToHistory, removeFromHistory, clearHistory }
}
