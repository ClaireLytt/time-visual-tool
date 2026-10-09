import { useState, useEffect, useCallback, useRef } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const cache = new Map<string, unknown>()

export function clearFirestoreCache() {
  cache.clear()
}

function cacheKey(uid: string, collection: string): string {
  return `${uid}/${collection}`
}

/**
 * Max time (ms) to show a loading spinner before falling back to initial data.
 * Prevents infinite spinners when Firestore is slow or offline.
 */
const LOADING_TIMEOUT_MS = 3000

export function useFirestore<T>(
  collectionName: string,
  initialValue: T,
  validate?: (data: unknown) => T | null,
): { data: T; setData: (value: T | ((prev: T) => T)) => void; loading: boolean; error: string | null } {
  const { user } = useAuth()
  const uid = user?.uid

  const resolve = (): T => {
    if (!uid) return initialValue
    const key = cacheKey(uid, collectionName)
    if (cache.has(key)) return cache.get(key) as T
    return initialValue
  }

  // Only show loading if there's a user AND no cached data yet
  const hasCachedData = !!uid && cache.has(cacheKey(uid!, collectionName))
  const [data, setDataState] = useState<T>(resolve)
  const [loading, setLoading] = useState(() => !!uid && !hasCachedData)
  const [error, setError] = useState<string | null>(null)
  const dataRef = useRef<T>(data)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    if (!uid) return

    // If cache already has data, ensure loading is false immediately
    const key = cacheKey(uid, collectionName)
    if (cache.has(key)) {
      setLoading(false)
    }

    const docRef = doc(db, 'users', uid, collectionName, 'data')

    // Timeout fallback: stop loading after LOADING_TIMEOUT_MS even if
    // Firestore hasn't responded (e.g. offline, slow network)
    const timer = setTimeout(() => {
      setLoading(false)
    }, LOADING_TIMEOUT_MS)

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        clearTimeout(timer)
        if (snapshot.exists()) {
          const raw = snapshot.data()
          const validated = validate ? validate(raw) : (raw as T)
          const result = validated ?? initialValue
          setDataState(result)
          dataRef.current = result
          cache.set(key, result)
        } else {
          setDataState(initialValue)
          dataRef.current = initialValue
          cache.set(key, initialValue)
        }
        setLoading(false)
      },
      () => {
        clearTimeout(timer)
        setLoading(false)
      },
    )

    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, collectionName])

  const setData = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (!uid) return

      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(dataRef.current) : value

      setDataState(newValue)
      dataRef.current = newValue
      cache.set(cacheKey(uid, collectionName), newValue)

      setError(null)
      const docRef = doc(db, 'users', uid, collectionName, 'data')
      setDoc(docRef, newValue as Record<string, unknown>).catch(() => {
        setError('save_failed')
      })
    },
    [uid, collectionName],
  )

  if (!uid) return { data: initialValue, setData, loading: false, error: null }

  return { data, setData, loading, error }
}
