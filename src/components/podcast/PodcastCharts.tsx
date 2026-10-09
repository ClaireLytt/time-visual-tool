import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchCharts, type ChartFeed, type ChartPodcast, type FeedSource } from '../../api/podcast'

const TABS: { key: ChartFeed; labelKey: string }[] = [
  { key: 'top', labelKey: 'podcast.chartTop' },
  { key: 'popular', labelKey: 'podcast.chartPopular' },
]

interface PodcastChartsProps {
  onOpen: (source: FeedSource) => void
}

export default function PodcastCharts({ onOpen }: PodcastChartsProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<ChartFeed>('top')
  const [data, setData] = useState<Record<string, ChartPodcast[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (data[activeTab]) return

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true)
    setError(null)

    fetchCharts(activeTab, ctrl.signal)
      .then(results => {
        if (!ctrl.signal.aborted) {
          setData(prev => ({ ...prev, [activeTab]: results }))
        }
      })
      .catch(err => {
        if (!ctrl.signal.aborted) setError((err as Error).message)
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false)
      })

    return () => ctrl.abort()
  }, [activeTab, data])

  const items = data[activeTab] ?? []

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex gap-2 px-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-mode-podcast text-white'
                : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Loading skeleton — horizontal rows */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="panel flex items-center gap-3 px-3 py-2.5 animate-pulse">
              <div className="w-5 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1.5" />
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="panel p-4 text-center">
          <p className="text-sm text-gray-400">😕 {t('podcast.chartError')}</p>
          <button
            onClick={() => { setData(prev => { const n = { ...prev }; delete n[activeTab]; return n }) }}
            className="mt-2 text-xs text-mode-podcast hover:underline"
          >
            {t('podcast.retry')}
          </button>
        </div>
      )}

      {/* Chart list — compact horizontal rows */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((p, i) => (
            <button
              key={p.collectionId}
              onClick={() => onOpen(p.feedUrl ? { feedUrl: p.feedUrl } : { collectionId: p.collectionId })}
              className="panel flex items-center gap-3 px-3 py-2.5 w-full text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.03] active:scale-[0.99] transition-all"
            >
              {/* Rank number */}
              <span className="w-5 text-center text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
                {i + 1}
              </span>

              {/* Small artwork */}
              <img
                src={p.artworkUrl600}
                alt=""
                loading="lazy"
                className="w-10 h-10 rounded-lg object-cover bg-gray-200 dark:bg-gray-700 shrink-0"
              />

              {/* Name & author */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {p.collectionName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {p.artistName}
                </p>
              </div>

              {/* Chevron */}
              <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-gray-400 px-1 text-center py-8">{t('podcast.chartEmpty')}</p>
      )}
    </div>
  )
}
