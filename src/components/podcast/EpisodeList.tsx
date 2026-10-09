import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (feed) return
    const ctrl = new AbortController()
    setError(null)
    fetchEpisodes(source, ctrl.signal)
      .then(onFeedLoaded)
      .catch(err => { if (!ctrl.signal.aborted) setError((err as Error).message) })
    return () => ctrl.abort()
  }, [source, feed, onFeedLoaded])

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

      {!feed && !error && <p className="text-sm text-gray-400 px-1">{t('podcast.loadingEpisodes')}</p>}
      {error && <p className="text-sm text-red-500 px-1">{t('podcast.error')}: {error}</p>}

      {feed && (
        <ul className="panel divide-y divide-gray-100 dark:divide-gray-700/50 overflow-hidden">
          {feed.episodes.slice(0, visible).map(ep => (
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
      )}

      {feed && visible < feed.episodes.length && (
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
