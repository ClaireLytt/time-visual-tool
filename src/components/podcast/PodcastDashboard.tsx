import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import PodcastSearch from './PodcastSearch'
import PodcastCharts from './PodcastCharts'
import EpisodeList from './EpisodeList'
import EpisodePlayer from './EpisodePlayer'
import type { FeedSource } from '../../api/podcast'
import type { Episode, Feed } from '../../types/podcast'

type View =
  | { kind: 'search' }
  | { kind: 'episodes'; source: FeedSource }
  | { kind: 'player'; source: FeedSource; episode: Episode }

export default function PodcastDashboard() {
  const { t } = useTranslation()
  const [view, setView] = useState<View>({ kind: 'search' })
  // Keep the loaded feed so going back from the player doesn't refetch
  const [feed, setFeed] = useState<Feed | null>(null)

  const openFeed = useCallback((source: FeedSource) => {
    setFeed(null)
    setView({ kind: 'episodes', source })
  }, [])

  return (
    <div id="main-content" className="space-y-4">
      <p className="font-pixel text-[8px] text-mode-podcast px-1">🎧 {t('podcastApp.scene')}</p>

      {view.kind === 'search' && (
        <>
          <PodcastSearch onOpen={openFeed} />
          <PodcastCharts onOpen={openFeed} />
        </>
      )}

      {view.kind === 'episodes' && (
        <EpisodeList
          source={view.source}
          feed={feed}
          onFeedLoaded={setFeed}
          onBack={() => setView({ kind: 'search' })}
          onSelect={episode => setView({ kind: 'player', source: view.source, episode })}
        />
      )}

      {view.kind === 'player' && (
        <EpisodePlayer
          episode={view.episode}
          onBack={() => setView({ kind: 'episodes', source: view.source })}
        />
      )}
    </div>
  )
}
