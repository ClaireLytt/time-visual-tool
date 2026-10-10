import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import PodcastSearch from './PodcastSearch'
import PodcastCharts from './PodcastCharts'
import EpisodeList from './EpisodeList'
import EpisodePlayer from './EpisodePlayer'
import PodcastReview from './PodcastReview'
import EpisodeWordList from './EpisodeWordList'
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
  | { kind: 'episodeWords'; episodeId: string; episodeTitle: string }

export default function PodcastDashboard() {
  const { t } = useTranslation()
  const [view, setView] = useState<View>({ kind: 'search' })
  const [feed, setFeed] = useState<Feed | null>(null)
  const { words, sentences, recordLookup, saveSentence, removeSentence, removeWord, getEpisodeGroups } = useWordHistory()
  const savedSentenceTexts = useMemo(() => new Set(sentences.map(s => s.text)), [sentences])
  const { stats: episodeStats, toggleStar, toggleToLearn, recordWord, recordPlay } = useEpisodeStats()

  const openFeed = useCallback((source: FeedSource) => {
    setFeed(null)
    setView({ kind: 'episodes', source })
  }, [])

  // Wrap recordLookup to also track words per episode
  const currentEpisodeId = view.kind === 'player' ? view.episode.id : null
  const currentEpisodeTitle = view.kind === 'player' ? view.episode.title : null
  const handleWordLookup = useCallback((word: string) => {
    recordLookup(word, currentEpisodeId ?? undefined, currentEpisodeTitle ?? undefined)
    if (currentEpisodeId) recordWord(currentEpisodeId)
  }, [recordLookup, recordWord, currentEpisodeId, currentEpisodeTitle])

  // Track segment seeks per episode
  const handleSaveSentence = useCallback((text: string, title: string, timestamp: number) => {
    saveSentence(text, title, timestamp)
    if (currentEpisodeId) recordPlay(currentEpisodeId)
  }, [saveSentence, recordPlay, currentEpisodeId])

  // Batch-add extracted words
  const handleExtractWords = useCallback((extractedWords: string[]) => {
    for (const w of extractedWords) recordLookup(w, currentEpisodeId ?? undefined, currentEpisodeTitle ?? undefined)
    if (currentEpisodeId) {
      // Update episode word count by the batch size
      for (let i = 0; i < extractedWords.length; i++) recordWord(currentEpisodeId)
    }
  }, [recordLookup, recordWord, currentEpisodeId, currentEpisodeTitle])

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

          {/* Episode word groups */}
          {(() => {
            const groups = getEpisodeGroups()
            if (groups.length === 0) return null
            return (
              <div className="panel p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  📚 {t('episodeWords.byEpisode')}
                </p>
                <div className="space-y-1.5">
                  {groups.map(g => (
                    <button
                      key={g.episodeId}
                      onClick={() => setView({ kind: 'episodeWords', episodeId: g.episodeId, episodeTitle: g.episodeTitle })}
                      className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-left"
                    >
                      <span className="text-sm text-gray-800 dark:text-gray-200 truncate flex-1 mr-2">
                        {g.episodeTitle}
                      </span>
                      <span className="text-xs text-mode-podcast bg-mode-podcast/10 px-2 py-0.5 rounded-full shrink-0">
                        {t('episodeWords.wordCount', { count: g.count })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })()}
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
          onRemoveSentence={removeSentence}
          savedSentences={savedSentenceTexts}
          onExtractWords={handleExtractWords}
          onRemoveWord={removeWord}
        />
      )}

      {view.kind === 'review' && (
        <PodcastReview
          words={words}
          sentences={sentences}
          onBack={() => setView({ kind: 'search' })}
        />
      )}

      {view.kind === 'episodeWords' && (
        <div className="space-y-4">
          <button
            onClick={() => setView({ kind: 'search' })}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ‹ {t('podcast.back')}
          </button>
          <div className="panel p-4">
            <EpisodeWordList
              episodeId={view.episodeId}
              episodeTitle={view.episodeTitle}
              onClose={() => setView({ kind: 'search' })}
              onRemoveWord={removeWord}
            />
          </div>
        </div>
      )}
    </div>
  )
}
