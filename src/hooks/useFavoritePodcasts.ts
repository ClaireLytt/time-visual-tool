import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export interface FavoritePodcast {
  collectionId: number
  collectionName: string
  artistName: string
  artworkUrl600: string
  feedUrl?: string
  savedAt: string
}

const STORAGE_KEY = 'podcast-favorites'
const MAX_FAVORITES = 100

export function useFavoritePodcasts() {
  const [favorites, setFavorites] = useLocalStorage<FavoritePodcast[]>(STORAGE_KEY, [])

  const isFavorite = useCallback((collectionId: number) => {
    return favorites.some(f => f.collectionId === collectionId)
  }, [favorites])

  const toggleFavorite = useCallback((podcast: {
    collectionId: number
    collectionName: string
    artistName: string
    artworkUrl600: string
    feedUrl?: string
  }) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.collectionId === podcast.collectionId)
      if (exists) {
        return prev.filter(f => f.collectionId !== podcast.collectionId)
      }
      const entry: FavoritePodcast = { ...podcast, savedAt: new Date().toISOString() }
      const next = [entry, ...prev]
      return next.length > MAX_FAVORITES ? next.slice(0, MAX_FAVORITES) : next
    })
  }, [setFavorites])

  return { favorites, isFavorite, toggleFavorite }
}
