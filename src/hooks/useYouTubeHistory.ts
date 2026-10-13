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

export interface VideoFolder {
  id: string
  name: string
  icon: string
  videoIds: string[]
  createdAt: string
}

const HISTORY_KEY = 'youtube-video-history'
const FOLDERS_KEY = 'youtube-video-folders'
const MAX_VIDEOS = 200

export function useYouTubeHistory() {
  const [history, setHistory] = useLocalStorage<WatchedVideo[]>(HISTORY_KEY, [])
  const [folders, setFolders] = useLocalStorage<VideoFolder[]>(FOLDERS_KEY, [])

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

  const clearHistory = useCallback(() => setHistory([]), [setHistory])

  // ── Folder operations ──

  const createFolder = useCallback((name: string, icon = '📁') => {
    const folder: VideoFolder = { id: crypto.randomUUID(), name, icon, videoIds: [], createdAt: new Date().toISOString() }
    setFolders(prev => [...prev, folder])
    return folder.id
  }, [setFolders])

  const renameFolder = useCallback((folderId: string, name: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name } : f))
  }, [setFolders])

  const changeFolderIcon = useCallback((folderId: string, icon: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, icon } : f))
  }, [setFolders])

  const deleteFolder = useCallback((folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId))
  }, [setFolders])

  const addToFolder = useCallback((folderId: string, videoId: string) => {
    setFolders(prev => prev.map(f =>
      f.id === folderId && !f.videoIds.includes(videoId)
        ? { ...f, videoIds: [...f.videoIds, videoId] }
        : f,
    ))
  }, [setFolders])

  const removeFromFolder = useCallback((folderId: string, videoId: string) => {
    setFolders(prev => prev.map(f =>
      f.id === folderId ? { ...f, videoIds: f.videoIds.filter(id => id !== videoId) } : f,
    ))
  }, [setFolders])

  /** Get the folders a video belongs to */
  const getFoldersForVideo = useCallback((videoId: string) => {
    return folders.filter(f => f.videoIds.includes(videoId))
  }, [folders])

  return {
    history, addToHistory, removeFromHistory, clearHistory,
    folders, createFolder, renameFolder, changeFolderIcon, deleteFolder,
    addToFolder, removeFromFolder, getFoldersForVideo,
  }
}
