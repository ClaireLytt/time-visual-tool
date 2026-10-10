import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchCharts, type ChartFeed, type ChartPodcast, type FeedSource } from '../../api/podcast'

const TABS: { key: ChartFeed; labelKey: string }[] = [
  { key: 'top', labelKey: 'podcast.chartTop' },
  { key: 'popular', labelKey: 'podcast.chartPopular' },
]

const COUNTRIES = [
  { code: 'us', labelKey: 'podcast.country.us' },
  { code: 'gb', labelKey: 'podcast.country.gb' },
  { code: 'ca', labelKey: 'podcast.country.ca' },
  { code: 'es', labelKey: 'podcast.country.es' },
  { code: 'fr', labelKey: 'podcast.country.fr' },
  { code: 'de', labelKey: 'podcast.country.de' },
  { code: 'pt', labelKey: 'podcast.country.pt' },
  { code: 'jp', labelKey: 'podcast.country.jp' },
  { code: 'kr', labelKey: 'podcast.country.kr' },
  { code: 'se', labelKey: 'podcast.country.se' },
  { code: 'it', labelKey: 'podcast.country.it' },
  { code: 'ru', labelKey: 'podcast.country.ru' },
  { code: 'tr', labelKey: 'podcast.country.tr' },
  { code: 'no', labelKey: 'podcast.country.no' },
  { code: 'ae', labelKey: 'podcast.country.ae' },
]

// iTunes podcast genre IDs
const GENRES = [
  { id: '1469', labelKey: 'podcast.genre.languageLearning' },
  { id: '1315', labelKey: 'podcast.genre.science' },
  { id: '1318', labelKey: 'podcast.genre.technology' },
  { id: '1304', labelKey: 'podcast.genre.education' },
  { id: '1512', labelKey: 'podcast.genre.healthFitness' },
  { id: '1321', labelKey: 'podcast.genre.business' },
  { id: '1489', labelKey: 'podcast.genre.news' },
  { id: '1324', labelKey: 'podcast.genre.societyCulture' },
  { id: '1301', labelKey: 'podcast.genre.arts' },
  { id: '1303', labelKey: 'podcast.genre.comedy' },
  { id: '1483', labelKey: 'podcast.genre.fiction' },
  { id: '1487', labelKey: 'podcast.genre.history' },
  { id: '1305', labelKey: 'podcast.genre.kidsFamily' },
  { id: '1502', labelKey: 'podcast.genre.leisure' },
  { id: '1310', labelKey: 'podcast.genre.music' },
  { id: '1545', labelKey: 'podcast.genre.sports' },
]

interface PodcastChartsProps {
  onOpen: (source: FeedSource) => void
  isFavorite?: (id: number) => boolean
  onToggleFavorite?: (p: ChartPodcast) => void
}

/** Dropdown select component */
function FilterDropdown({ label, options, value, onChange }: {
  label: string
  options: Array<{ value: string; label: string }>
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:border-mode-podcast transition-colors min-w-[5rem]"
      >
        <span className="truncate">{selected?.label ?? label}</span>
        <svg className={`w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 left-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <ul className="max-h-60 overflow-y-auto overscroll-contain py-1">
            <li>
              <button
                onClick={() => { onChange(''); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${!value ? 'text-mode-podcast bg-mode-podcast/5' : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                {!value && <span className="text-mode-podcast">✓</span>}
                <span className={!value ? '' : 'pl-5'}>{label}</span>
              </button>
            </li>
            {options.map(o => (
              <li key={o.value}>
                <button
                  onClick={() => { onChange(o.value); setOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${value === o.value ? 'text-mode-podcast bg-mode-podcast/5' : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  {value === o.value && <span className="text-mode-podcast">✓</span>}
                  <span className={value === o.value ? '' : 'pl-5'}>{o.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function PodcastCharts({ onOpen, isFavorite, onToggleFavorite }: PodcastChartsProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<ChartFeed>('top')
  const [country, setCountry] = useState('')
  const [genreId, setGenreId] = useState('')
  const [data, setData] = useState<Record<string, ChartPodcast[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const cacheKey = `${activeTab}:${country}:${genreId}`

  useEffect(() => {
    if (data[cacheKey]) return

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null)

    fetchCharts(activeTab, ctrl.signal, country || undefined, genreId || undefined)
      .then(results => {
        if (!ctrl.signal.aborted) {
          setData(prev => ({ ...prev, [cacheKey]: results }))
        }
      })
      .catch(err => {
        if (!ctrl.signal.aborted) setError((err as Error).message)
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false)
      })

    return () => ctrl.abort()
  }, [activeTab, country, genreId, cacheKey, data])

  const items = data[cacheKey] ?? []

  const countryOptions = COUNTRIES.map(c => ({ value: c.code, label: t(c.labelKey) }))
  const genreOptions = GENRES.map(g => ({ value: g.id, label: t(g.labelKey) }))

  return (
    <div className="space-y-3">
      {/* Tab bar + filters in one row */}
      <div className="flex items-center gap-2 px-1 flex-wrap">
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
        <FilterDropdown
          label={t('podcast.filter.country')}
          options={countryOptions}
          value={country}
          onChange={setCountry}
        />
        <FilterDropdown
          label={t('podcast.filter.allCategories')}
          options={genreOptions}
          value={genreId}
          onChange={setGenreId}
        />
      </div>

      {/* Loading skeleton */}
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
            onClick={() => { setData(prev => { const n = { ...prev }; delete n[cacheKey]; return n }) }}
            className="mt-2 text-xs text-mode-podcast hover:underline"
          >
            {t('podcast.retry')}
          </button>
        </div>
      )}

      {/* Chart list */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((p, i) => (
            <button
              key={p.collectionId}
              onClick={() => onOpen(p.feedUrl ? { feedUrl: p.feedUrl } : { collectionId: p.collectionId })}
              className="panel flex items-center gap-3 px-3 py-2.5 w-full text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.03] active:scale-[0.99] transition-all"
            >
              <span className="w-5 text-center text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums shrink-0">{i + 1}</span>
              <img src={p.artworkUrl600} alt="" loading="lazy" className="w-10 h-10 rounded-lg object-cover bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.collectionName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.artistName}</p>
              </div>
              {onToggleFavorite && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(p) }}
                  className={`p-1.5 shrink-0 transition-colors ${isFavorite?.(p.collectionId) ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-500'}`}
                  aria-label="Favorite"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} fill={isFavorite?.(p.collectionId) ? 'currentColor' : 'none'}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                  </svg>
                </button>
              )}
              <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-gray-400 px-1 text-center py-8">{t('podcast.noFilterResults')}</p>
      )}
    </div>
  )
}
