import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import PodcastSearch from './PodcastSearch'
import PodcastCharts from './PodcastCharts'
import EpisodeList from './EpisodeList'
import EpisodePlayer from './EpisodePlayer'
import PodcastReview from './PodcastReview'
import LearningGoal from './LearningGoal'
import { useWordHistory } from '../../hooks/useWordHistory'
import { useEpisodeStats } from '../../hooks/useEpisodeStats'
import type { FeedSource } from '../../api/podcast'
import type { Episode, Feed } from '../../types/podcast'

type View =
  | { kind: 'search' }
  | { kind: 'episodes'; source: FeedSource }
  | { kind: 'player'; source: FeedSource; episode: Episode }
  | { kind: 'review' }

export default function PodcastDashboard() {
  const { t } = useTranslation()
  const [view, setView] = useState<View>({ kind: 'search' })
  const [feed, setFeed] = useState<Feed | null>(null)
  const { words, sentences, recordLookup, saveSentence } = useWordHistory()
  const savedSentenceTexts = useMemo(() => new Set(sentences.map(s => s.text)), [sentences])
  const { stats: episodeStats, toggleStar, toggleToLearn, recordWord, recordPlay } = useEpisodeStats()

  const openFeed = useCallback((source: FeedSource) => {
    setFeed(null)
    setView({ kind: 'episodes', source })
  }, [])

  // Wrap recordLookup to also track words per episode
  const currentEpisodeId = view.kind === 'player' ? view.episode.id : null
  const handleWordLookup = useCallback((word: string) => {
    recordLookup(word)
    if (currentEpisodeId) recordWord(currentEpisodeId)
  }, [recordLookup, recordWord, currentEpisodeId])

  // Track segment seeks per episode
  const handleSaveSentence = useCallback((text: string, title: string, timestamp: number) => {
    saveSentence(text, title, timestamp)
    if (currentEpisodeId) recordPlay(currentEpisodeId)
  }, [saveSentence, recordPlay, currentEpisodeId])

  // Batch-add extracted words
  const handleExtractWords = useCallback((extractedWords: string[]) => {
    for (const w of extractedWords) recordLookup(w)
    if (currentEpisodeId) {
      // Update episode word count by the batch size
      for (let i = 0; i < extractedWords.length; i++) recordWord(currentEpisodeId)
    }
  }, [recordLookup, recordWord, currentEpisodeId])

  return (
    <div id="main-content" className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-pixel text-[8px] text-mode-podcast px-1">🎧 {t('podcastApp.scene')}</p>

        {view.kind === 'search' && (
          <button
            onClick={() => setView({ kind: 'review' })}
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-mode-podcast transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {t('podcast.reviewTitle')}
            {words.length > 0 && (
              <span className="bg-mode-podcast/15 text-mode-podcast text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                {words.length}
              </span>
            )}
          </button>
        )}
      </div>

      {view.kind === 'search' && (
        <>
          <LearningGoal words={words} episodeStats={episodeStats} />
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
          episodeStats={episodeStats}
          onToggleStar={toggleStar}
          onToggleToLearn={toggleToLearn}
        />
      )}

      {view.kind === 'player' && (
        <EpisodePlayer
          episode={view.episode}
          onBack={() => setView({ kind: 'episodes', source: view.source })}
          onWordLookup={handleWordLookup}
          onSaveSentence={handleSaveSentence}
          savedSentences={savedSentenceTexts}
          onExtractWords={handleExtractWords}
        />
      )}

      {view.kind === 'review' && (
        <PodcastReview
          words={words}
          sentences={sentences}
          onBack={() => setView({ kind: 'search' })}
        />
      )}
    </div>
  )
}
