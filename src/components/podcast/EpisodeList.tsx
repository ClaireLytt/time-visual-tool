import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchEpisodes, type FeedSource } from '../../api/podcast'
import { formatClock } from '../../utils/transcript'
import type { Episode, Feed } from '../../types/podcast'

const PAGE_SIZE = 50

interface EpisodeListProps {
  source: FeedSource
  feed: Feed | null
  onFeedLoaded: (feed: Feed) => void
  onBack: () => void
  onSelect: (episode: Episode) => void
}

export default function EpisodeList({ source, feed, onFeedLoaded, onBack, onSelect }: EpisodeListProps) {
  const { t, i18n } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [retryCount, setRetryCount] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (feed) return
    const ctrl = new AbortController()
    setError(null)
    fetchEpisodes(source, ctrl.signal)
      .then(onFeedLoaded)
      .catch(err => { if (!ctrl.signal.aborted) setError((err as Error).message) })
    return () => ctrl.abort()
  }, [source, feed, onFeedLoaded, retryCount])

  // Filter episodes by search keyword
  const filtered = useMemo(() => {
    if (!feed) return []
    const q = search.trim().toLowerCase()
    if (!q) return feed.episodes
    return feed.episodes.filter(ep =>
      ep.title.toLowerCase().includes(q)
    )
  }, [feed, search])

  // Reset visible count when search changes
  useEffect(() => setVisible(PAGE_SIZE), [search])

  const dateFmt = new Intl.DateTimeFormat(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'medium' })

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        ‹ {t('podcast.back')}
      </button>

      {feed && (
        <div className="panel p-4 flex items-center gap-4">
          {feed.artwork && <img src={feed.artwork} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />}
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{feed.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{feed.author}</p>
            <p className="text-xs text-gray-400 mt-1">{feed.episodes.length} {t('podcast.episodeCount')}</p>
          </div>
        </div>
      )}

      {/* Search within episodes */}
      {feed && feed.episodes.length > 5 && (
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('podcast.searchEpisodes')}
            className="w-full px-4 py-2.5 pl-9 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mode-podcast/30 focus:border-mode-podcast"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {!feed && !error && <p className="text-sm text-gray-400 px-1">{t('podcast.loadingEpisodes')}</p>}
      {error && (
        <div className="panel p-4 text-center space-y-2">
          <p className="text-sm text-red-500">{t('podcast.error')}: {error}</p>
          <button
            onClick={() => { setError(null); setRetryCount(c => c + 1) }}
            className="text-sm text-mode-podcast hover:underline"
          >
            {t('podcast.retry')}
          </button>
        </div>
      )}

      {feed && filtered.length > 0 && (
        <>
          {/* Show match count when searching */}
          {search.trim() && (
            <p className="text-xs text-gray-400 px-1">
              {t('podcast.searchResults', { count: filtered.length })}
            </p>
          )}
          <ul className="panel divide-y divide-gray-100 dark:divide-gray-700/50 overflow-hidden">
            {filtered.slice(0, visible).map(ep => (
              <li key={ep.id}>
                <button
                  onClick={() => onSelect(ep)}
                  className="w-full p-3 text-left hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">{ep.title}</p>
                  <p className="text-xs text-gray-400 mt-1 flex gap-3">
                    {ep.pubDate && <span>{dateFmt.format(new Date(ep.pubDate))}</span>}
                    {ep.duration !== null && <span className="tabular-nums">{formatClock(ep.duration)}</span>}
                    {ep.transcript && <span className="text-mode-podcast">{t('podcast.hasTranscript')}</span>}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {feed && search.trim() && filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">{t('podcast.noEpisodeMatch')}</p>
      )}

      {feed && visible < filtered.length && (
        <button
          onClick={() => setVisible(v => v + PAGE_SIZE)}
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {t('podcast.showMore')}
        </button>
      )}
    </div>
  )
}
