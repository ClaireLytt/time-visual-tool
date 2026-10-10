import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchEpisodes, type FeedSource } from '../../api/podcast'
import { formatClock } from '../../utils/transcript'
import type { Episode, Feed } from '../../types/podcast'
import type { EpisodeMeta, SortMode } from '../../hooks/useEpisodeStats'

const PAGE_SIZE = 50

interface EpisodeListProps {
  source: FeedSource
  feed: Feed | null
  onFeedLoaded: (feed: Feed) => void
  onBack: () => void
  onSelect: (episode: Episode) => void
  /** Per-episode learning metadata */
  episodeStats?: Record<string, EpisodeMeta>
  onToggleStar?: (id: string) => void
  onToggleToLearn?: (id: string) => void
}

export default function EpisodeList({
  source, feed, onFeedLoaded, onBack, onSelect,
  episodeStats, onToggleStar, onToggleToLearn,
}: EpisodeListProps) {
  const { t, i18n } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [retryCount, setRetryCount] = useState(0)
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('default')

  useEffect(() => {
    if (feed) return
    const ctrl = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset before async fetch
    setError(null)
    fetchEpisodes(source, ctrl.signal)
      .then(onFeedLoaded)
      .catch(err => { if (!ctrl.signal.aborted) setError((err as Error).message) })
    return () => ctrl.abort()
  }, [source, feed, onFeedLoaded, retryCount])

  // Filter + sort episodes
  const filtered = useMemo(() => {
    if (!feed) return []
    const q = search.trim().toLowerCase()
    const list = q
      ? feed.episodes.filter(ep => ep.title.toLowerCase().includes(q))
      : [...feed.episodes]

    if (sortMode === 'recent') {
      list.sort((a, b) => {
        const ta = episodeStats?.[a.id]?.lastPlayed ?? ''
        const tb = episodeStats?.[b.id]?.lastPlayed ?? ''
        // Push episodes with no play history to the end
        if (!ta && !tb) return 0
        if (!ta) return 1
        if (!tb) return -1
        return tb.localeCompare(ta) // most recent first
      })
    } else if (sortMode === 'words') {
      list.sort((a, b) => {
        const wa = episodeStats?.[a.id]?.wordCount ?? 0
        const wb = episodeStats?.[b.id]?.wordCount ?? 0
        return wb - wa // most words first
      })
    } else if (sortMode === 'difficulty') {
      // Shorter episodes first as a proxy for "easier"
      list.sort((a, b) => (a.duration ?? 9999) - (b.duration ?? 9999))
    }

    return list
  }, [feed, search, sortMode, episodeStats])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional pagination reset on filter change
  useEffect(() => setVisible(PAGE_SIZE), [search, sortMode])

  const dateFmt = new Intl.DateTimeFormat(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'medium' })

  const sortOptions: Array<{ value: SortMode; label: string }> = [
    { value: 'default', label: t('podcast.sortDefault') },
    { value: 'difficulty', label: t('podcast.sortDifficulty') },
    { value: 'recent', label: t('podcast.sortRecent') },
    { value: 'words', label: t('podcast.sortWords') },
  ]

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

      {/* Search + Sort bar */}
      {feed && feed.episodes.length > 5 && (
        <div className="flex gap-2">
          <div className="relative flex-1">
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
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>
          {/* Sort dropdown */}
          <select
            value={sortMode}
            onChange={e => setSortMode(e.target.value as SortMode)}
            className="px-3 py-2.5 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-mode-podcast/30"
          >
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
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
          {search.trim() && (
            <p className="text-xs text-gray-400 px-1">
              {t('podcast.searchResults', { count: filtered.length })}
            </p>
          )}
          <ul className="panel divide-y divide-gray-100 dark:divide-gray-700/50 overflow-hidden">
            {filtered.slice(0, visible).map(ep => {
              const meta = episodeStats?.[ep.id]
              const isStarred = meta?.starred ?? false
              const isToLearn = meta?.toLearn ?? false
              const hasActivity = meta && (meta.segmentsListened > 0 || meta.wordCount > 0)

              return (
                <li key={ep.id} className="group">
                  <div className="flex items-start p-3 gap-3">
                    {/* Main content — click to open player */}
                    <button
                      onClick={() => onSelect(ep)}
                      className="flex-1 text-left min-w-0 hover:opacity-80 transition-opacity"
                    >
                      {/* Title + status badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{ep.title}</p>
                        {isStarred && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-medium shrink-0">
                            {t('podcast.badgeStarred')}
                          </span>
                        )}
                        {isToLearn && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium shrink-0">
                            {t('podcast.badgeToLearn')}
                          </span>
                        )}
                        {hasActivity && !isStarred && !isToLearn && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium shrink-0">
                            {t('podcast.badgeLearning')}
                          </span>
                        )}
                      </div>

                      {/* Date, duration, transcript badge */}
                      <p className="text-xs text-gray-400 mt-1 flex gap-3">
                        {ep.pubDate && <span>{dateFmt.format(new Date(ep.pubDate))}</span>}
                        {ep.duration !== null && <span className="tabular-nums">{formatClock(ep.duration)}</span>}
                        {ep.transcript && <span className="text-mode-podcast">{t('podcast.hasTranscript')}</span>}
                      </p>

                      {/* Learning stats — only shown if there's activity */}
                      {hasActivity && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 flex gap-3">
                          {meta.segmentsListened > 0 && (
                            <span>📖 {meta.segmentsListened} {t('podcast.statSegments')}</span>
                          )}
                          {meta.wordCount > 0 && (
                            <span>📝 {meta.wordCount} {t('podcast.statWords')}</span>
                          )}
                        </p>
                      )}
                    </button>

                    {/* Quick action icons — ⭐ star, 📖 to-learn */}
                    <div className="flex items-center gap-1 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleStar?.(ep.id) }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isStarred
                            ? 'text-yellow-500'
                            : 'text-gray-300 dark:text-gray-600 hover:text-yellow-500'
                        }`}
                        title={t('podcast.toggleStar')}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                          fill={isStarred ? 'currentColor' : 'none'}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleToLearn?.(ep.id) }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isToLearn
                            ? 'text-blue-500'
                            : 'text-gray-300 dark:text-gray-600 hover:text-blue-500'
                        }`}
                        title={t('podcast.toggleToLearn')}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                          fill={isToLearn ? 'currentColor' : 'none'}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
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
