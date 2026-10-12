import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import YouTubePlayer from './YouTubePlayer'
import { useYouTubeHistory } from '../../hooks/useYouTubeHistory'
import { useWordHistory } from '../../hooks/useWordHistory'
import { extractVideoId, fetchYouTubeInfo, fetchYouTubeTranscript } from '../../api/youtube'
import { MODE_ACCENT } from '../../constants/modes'
import type { Segment } from '../../types/podcast'
import type { YouTubeVideoInfo } from '../../api/youtube'

type View =
  | { kind: 'home' }
  | { kind: 'player'; videoId: string; info: YouTubeVideoInfo; segments: Segment[] }

const ACCENT = MODE_ACCENT.youtube

function YouTubeDashboard() {
  const { t } = useTranslation()
  const [view, setView] = useState<View>({ kind: 'home' })
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { history, addToHistory, removeFromHistory, clearHistory } = useYouTubeHistory()
  const {
    recordLookup, toggleBookmark, saveSentence, removeSentence,
    removeWord, sentences,
  } = useWordHistory()

  const savedSentenceTexts = useMemo(() => new Set(sentences.map(s => s.text)), [sentences])

  const loadVideo = useCallback(async (inputUrl: string) => {
    setError('')
    const videoId = extractVideoId(inputUrl.trim())
    if (!videoId) {
      setError(t('youtube.invalidUrl'))
      return
    }

    setLoading(true)
    try {
      const [info, segments] = await Promise.all([
        fetchYouTubeInfo(inputUrl.trim()),
        fetchYouTubeTranscript(videoId),
      ])

      addToHistory({
        videoId: info.videoId,
        title: info.title,
        channelName: info.channelName,
        thumbnailUrl: info.thumbnailUrl,
      })

      setView({ kind: 'player', videoId: info.videoId, info, segments })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [t, addToHistory])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) loadVideo(url)
  }, [url, loadVideo])

  // Re-open a video from history
  const handleHistoryClick = useCallback((video: typeof history[number]) => {
    const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`
    setUrl(videoUrl)
    loadVideo(videoUrl)
  }, [loadVideo])

  if (view.kind === 'player') {
    return (
      <div id="main-content" className="space-y-3">
        <button
          onClick={() => setView({ kind: 'home' })}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          {t('youtube.back')}
        </button>

        <YouTubePlayer
          info={view.info}
          segments={view.segments}
          onRecordLookup={(word) => recordLookup(word, view.videoId, view.info.title)}
          onAddToVocab={toggleBookmark}
          onRemoveFromVocab={removeWord}
          onSaveSentence={saveSentence}
          onRemoveSentence={removeSentence}
          onRemoveWord={removeWord}
          savedSentences={savedSentenceTexts}
        />
      </div>
    )
  }

  // Home view
  return (
    <div id="main-content" className="space-y-4">
      {/* URL Input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('youtube.urlPlaceholder')}
            className="input-base flex-1 text-sm"
            disabled={loading}
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={loading || !url.trim()}
            className="px-4 py-2 text-sm font-medium text-white rounded-xl transition-opacity disabled:opacity-40"
            style={{ backgroundColor: ACCENT }}
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
              </svg>
            ) : (
              t('youtube.load')
            )}
          </motion.button>
        </div>
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
      </form>

      {/* Watch History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('youtube.history')}</h3>
            <button
              onClick={clearHistory}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              {t('youtube.clearHistory')}
            </button>
          </div>

          <div className="space-y-1.5">
            {history.slice(0, 20).map((video) => (
              <motion.button
                key={video.videoId}
                onClick={() => handleHistoryClick(video)}
                whileTap={{ scale: 0.98 }}
                className="panel w-full text-left flex gap-3 p-2 no-press group"
              >
                <img
                  src={video.thumbnailUrl}
                  alt=""
                  className="w-24 h-14 object-cover rounded-lg shrink-0 bg-gray-100 dark:bg-gray-700"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0 py-0.5">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                    {video.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{video.channelName}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromHistory(video.videoId) }}
                  className="p-1 shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                  aria-label="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📺</div>
          <p className="text-sm text-gray-400 dark:text-gray-500">{t('youtube.noHistory')}</p>
          <p className="text-xs text-gray-400/60 dark:text-gray-500/60 mt-1">{t('youtube.urlPlaceholder')}</p>
        </div>
      )}
    </div>
  )
}

export default YouTubeDashboard
