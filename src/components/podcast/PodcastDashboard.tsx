import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { useFavoritePodcasts } from '../../hooks/useFavoritePodcasts'
import type { FeedSource } from '../../api/podcast'
import type { Episode, Feed } from '../../types/podcast'

type View =
  | { kind: 'search' }
  | { kind: 'episodes'; source: FeedSource }
  | { kind: 'player'; source: FeedSource; episode: Episode }
  | { kind: 'review' }
  | { kind: 'episodeWords'; episodeId: string; episodeTitle: string }
  | { kind: 'favorites' }

/** Encode view state into URL search params */
function viewToParams(view: View): Record<string, string> {
  switch (view.kind) {
    case 'search': return {}
    case 'episodes': {
      const p: Record<string, string> = { pv: 'episodes' }
      if ('feedUrl' in view.source && view.source.feedUrl) p.feed = view.source.feedUrl
      if ('collectionId' in view.source && view.source.collectionId) p.cid = String(view.source.collectionId)
      return p
    }
    case 'player': {
      const p: Record<string, string> = { pv: 'player', eid: view.episode.id, etitle: view.episode.title }
      if ('feedUrl' in view.source && view.source.feedUrl) p.feed = view.source.feedUrl
      if ('collectionId' in view.source && view.source.collectionId) p.cid = String(view.source.collectionId)
      if (view.episode.audioUrl) p.audio = view.episode.audioUrl
      return p
    }
    case 'review': return { pv: 'review' }
    case 'favorites': return { pv: 'favorites' }
    case 'episodeWords': return { pv: 'epwords', eid: view.episodeId, etitle: view.episodeTitle }
  }
}

/** Decode URL search params into a view state (partial — player needs episode data) */
function paramsToView(params: URLSearchParams): View | null {
  const pv = params.get('pv')
  if (!pv) return { kind: 'search' }
  if (pv === 'review') return { kind: 'review' }
  if (pv === 'favorites') return { kind: 'favorites' }
  if (pv === 'epwords') {
    const eid = params.get('eid')
    const etitle = params.get('etitle')
    if (eid && etitle) return { kind: 'episodeWords', episodeId: eid, episodeTitle: etitle }
  }
  if (pv === 'episodes') {
    const feed = params.get('feed')
    const cid = params.get('cid')
    if (feed) return { kind: 'episodes', source: { feedUrl: feed } }
    if (cid) return { kind: 'episodes', source: { collectionId: Number(cid) } }
  }
  if (pv === 'player') {
    const feed = params.get('feed')
    const cid = params.get('cid')
    const eid = params.get('eid')
    const etitle = params.get('etitle')
    const audio = params.get('audio')
    const source: FeedSource = feed ? { feedUrl: feed } : { collectionId: Number(cid ?? 0) }
    if (eid && audio) {
      const episode: Episode = {
        id: eid, title: etitle ?? '', audioUrl: audio,
        pubDate: null, duration: null, transcript: undefined,
      }
      return { kind: 'player', source, episode }
    }
  }
  return null
}

export default function PodcastDashboard() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setViewState] = useState<View>(() => paramsToView(searchParams) ?? { kind: 'search' })
  const [feed, setFeed] = useState<Feed | null>(null)

  // Sync view → URL (replace, don't push history for every click)
  const setView = useCallback((v: View) => {
    setViewState(v)
    setSearchParams(viewToParams(v), { replace: true })
  }, [setSearchParams])

  // On mount, restore view from URL
  useEffect(() => {
    const restored = paramsToView(searchParams)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (restored && restored.kind !== 'search') setViewState(restored)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const { words, sentences, recordLookup, saveSentence, removeSentence, removeWord, getEpisodeGroups } = useWordHistory()
  const savedSentenceTexts = useMemo(() => new Set(sentences.map(s => s.text)), [sentences])
  const { stats: episodeStats, toggleStar, toggleToLearn, recordWord, recordPlay } = useEpisodeStats()
  const { favorites, isFavorite, toggleFavorite } = useFavoritePodcasts()

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView({ kind: 'favorites' })}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
              {t('podcast.favorites')}
              {favorites.length > 0 && (
                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                  {favorites.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setView({ kind: 'review' })}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-mode-podcast transition-colors"
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
          </div>
        )}
      </div>

      {view.kind === 'search' && (
        <>
          <LearningGoal words={words} episodeStats={episodeStats} />
          <PodcastSearch onOpen={openFeed} />
          <PodcastCharts onOpen={openFeed} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />

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

      {view.kind === 'favorites' && (
        <div className="space-y-4">
          <button
            onClick={() => setView({ kind: 'search' })}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ‹ {t('podcast.back')}
          </button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('podcast.favorites')}</h2>
          {favorites.length === 0 ? (
            <p className="text-sm text-gray-400 px-1">{t('podcast.noFavorites')}</p>
          ) : (
            <div className="space-y-1.5">
              {favorites.map(p => (
                <button
                  key={p.collectionId}
                  onClick={() => openFeed(p.feedUrl ? { feedUrl: p.feedUrl } : { collectionId: p.collectionId })}
                  className="panel flex items-center gap-3 px-3 py-2.5 w-full text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all"
                >
                  <img src={p.artworkUrl600} alt="" loading="lazy" className="w-10 h-10 rounded-lg object-cover bg-gray-200 dark:bg-gray-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.collectionName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.artistName}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(p) }}
                    className="p-1.5 shrink-0 text-yellow-500 transition-colors hover:text-yellow-600"
                    aria-label="Remove favorite"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} fill="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                  </button>
                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
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
