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
    // Already cached in state
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

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="panel p-3 animate-pulse">
              <div className="w-full aspect-square rounded-lg bg-gray-200 dark:bg-gray-700 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1.5" />
              <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
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

      {/* Chart grid */}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {items.map((p, i) => (
            <button
              key={p.collectionId}
              onClick={() => onOpen(p.feedUrl ? { feedUrl: p.feedUrl } : { collectionId: p.collectionId })}
              className="panel p-3 text-left hover:scale-[1.02] transition-transform"
            >
              <div className="relative">
                <img
                  src={p.artworkUrl600}
                  alt=""
                  loading="lazy"
                  className="w-full aspect-square rounded-lg object-cover bg-gray-200 dark:bg-gray-700"
                />
                <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-xs font-bold px-1.5 py-0.5 rounded-md tabular-nums">
                  {i + 1}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                {p.collectionName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {p.artistName}
              </p>
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
