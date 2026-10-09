import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { searchPodcasts, type FeedSource } from '../../api/podcast'
import { isUrl } from '../../utils/transcript'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import type { PodcastSummary } from '../../types/podcast'

const MAX_HISTORY = 10

interface PodcastSearchProps {
  onOpen: (source: FeedSource) => void
}

export default function PodcastSearch({ onOpen }: PodcastSearchProps) {
  const { t } = useTranslation()
  const [history, setHistory] = useLocalStorage<string[]>('podcast-search-history', [])
  const [query, setQuery] = useState(() => history[0] ?? '')
  const [results, setResults] = useState<PodcastSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  // Close history dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowHistory(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const addToHistory = (q: string) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item !== q)
      return [q, ...filtered].slice(0, MAX_HISTORY)
    })
  }

  const removeFromHistory = (q: string) => {
    setHistory(prev => prev.filter(item => item !== q))
  }

  const clearHistory = () => {
    setHistory([])
    setShowHistory(false)
  }

  const doSearch = (q: string) => {
    addToHistory(q)
    setShowHistory(false)
    if (isUrl(q)) {
      onOpen({ feedUrl: q })
      return
    }
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true)
    setError(null)
    searchPodcasts(q, ctrl.signal)
      .then(r => { setResults(r); setSearched(true) })
      .catch(err => { if (!ctrl.signal.aborted) setError((err as Error).message) })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    doSearch(q)
  }

  const pickHistory = (q: string) => {
    setQuery(q)
    doSearch(q)
  }

  return (
    <div className="space-y-4">
      {/*
        The search bar + history dropdown live OUTSIDE .panel
        so overflow:hidden on .panel doesn't clip the dropdown.
      */}
      <div ref={wrapperRef} className="relative">
        <form onSubmit={submit} className="panel p-4 flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { if (history.length > 0) setShowHistory(true) }}
            placeholder={t('podcast.searchPlaceholder')}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-mode-podcast"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-white bg-mode-podcast disabled:opacity-50 shrink-0"
            disabled={!query.trim()}
          >
            {isUrl(query) ? t('podcast.importRss') : t('podcast.search')}
          </button>
        </form>

        {/* History dropdown — positioned relative to the wrapper, outside .panel's overflow:hidden */}
        {showHistory && history.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400">{t('podcast.searchHistory')}</span>
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                {t('podcast.clearHistory')}
              </button>
            </div>
            <ul className="max-h-60 overflow-y-auto overscroll-contain">
              {history.map(item => (
                <li key={item} className="flex items-center hover:bg-black/5 dark:hover:bg-white/5">
                  <button
                    type="button"
                    onClick={() => pickHistory(item)}
                    className="flex-1 px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 truncate"
                  >
                    <span className="mr-1.5">{isUrl(item) ? '🔗' : '🔍'}</span>
                    {item}
                  </button>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removeFromHistory(item) }}
                    className="px-3 py-2.5 text-gray-300 hover:text-red-500 text-base shrink-0"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-gray-400 px-1">{t('podcast.searching')}</p>}
      {error && <p className="text-sm text-red-500 px-1">{t('podcast.error')}: {error}</p>}
      {!loading && searched && results.length === 0 && (
        <p className="text-sm text-gray-400 px-1">{t('podcast.noResults')}</p>
      )}

      {results.length > 0 && (
        <ul className="panel divide-y divide-gray-100 dark:divide-gray-700/50 overflow-hidden">
          {results.map(p => (
            <li key={p.collectionId}>
              <button
                onClick={() => onOpen(p.feedUrl ? { feedUrl: p.feedUrl } : { collectionId: p.collectionId })}
                className="w-full flex items-center gap-4 p-3 text-left hover:bg-black/5 dark:hover:bg-white/5"
              >
                <img src={p.artworkUrl600} alt="" loading="lazy" className="w-16 h-16 rounded-lg object-cover shrink-0 bg-gray-200" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{p.collectionName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{p.artistName}</p>
                </div>
                <span className="text-gray-300">›</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
