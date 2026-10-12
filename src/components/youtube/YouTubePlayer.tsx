import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import YouTubeEmbed, { type YouTubeEmbedHandle } from './YouTubeEmbed'
import WordPopover from '../podcast/WordPopover'
import EpisodeWordList from '../podcast/EpisodeWordList'
import { findActiveIndex, formatClock } from '../../utils/transcript'
import { translateText } from '../../api/translate'
import { MODE_ACCENT } from '../../constants/modes'
import type { Segment } from '../../types/podcast'
import type { YouTubeVideoInfo } from '../../api/youtube'

interface YouTubePlayerProps {
  info: YouTubeVideoInfo
  segments: Segment[]
  onRecordLookup?: (word: string) => void
  onAddToVocab?: (word: string) => void
  onRemoveFromVocab?: (word: string) => void
  onSaveSentence?: (text: string, title: string, timestamp: number) => void
  onRemoveSentence?: (text: string, title: string) => void
  onRemoveWord?: (word: string) => void
  savedSentences?: Set<string>
}

interface SelectedWord {
  word: string
  rect: DOMRect
  sentence: string
  segStart: number
}

const ACCENT = MODE_ACCENT.youtube

function YouTubePlayer({
  info, segments,
  onRecordLookup, onAddToVocab, onRemoveFromVocab,
  onSaveSentence, onRemoveSentence, onRemoveWord, savedSentences,
}: YouTubePlayerProps) {
  const { t } = useTranslation()
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null)
  const [translations, setTranslations] = useState<Record<number, string>>({})
  const [showTranslation, setShowTranslation] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [showVideo, setShowVideo] = useState(true)
  const [showTranscript, setShowTranscript] = useState(true)
  const [showWordList, setShowWordList] = useState(false)
  const embedRef = useRef<YouTubeEmbedHandle>(null)
  const activeRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const userScrolling = useRef(false)
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>()

  const isPopoverOpen = selectedWord != null
  const activeIndex = useMemo(() => findActiveIndex(segments, currentTime), [segments, currentTime])

  useEffect(() => {
    if (activeIndex >= 0 && activeRef.current && !userScrolling.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeIndex])

  useEffect(() => {
    if (!isPopoverOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedWord(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isPopoverOpen])

  const handleWheel = useCallback(() => {
    userScrolling.current = true
    clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => { userScrolling.current = false }, 5000)
  }, [])

  const seekTo = useCallback((seconds: number) => {
    embedRef.current?.seekTo(seconds)
  }, [])

  const openWord = useCallback((el: HTMLElement, token: string, sentence: string, segStart: number) => {
    const clean = token.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '')
    if (!clean) return
    setSelectedWord({ word: clean, rect: el.getBoundingClientRect(), sentence, segStart })
  }, [])

  const closePopover = useCallback(() => setSelectedWord(null), [])

  const handleTranslate = useCallback(async () => {
    if (translating) return
    if (showTranslation && Object.keys(translations).length > 0) {
      setShowTranslation(false)
      return
    }
    setShowTranslation(true)
    if (Object.keys(translations).length > 0) return
    setTranslating(true)
    const trans: Record<number, string> = {}
    for (let i = 0; i < segments.length; i += 10) {
      const batch = segments.slice(i, i + 10)
      const results = await Promise.all(batch.map(s => translateText(s.text).catch(() => '...')))
      results.forEach((r, j) => { trans[i + j] = r })
      setTranslations({ ...trans })
    }
    setTranslating(false)
  }, [segments, translations, translating, showTranslation])

  return (
    <div className="space-y-3">
      {/* Video header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">{info.title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{info.channelName}</p>
      </div>

      {/* YouTube embed — collapsible */}
      <div>
        <button
          onClick={() => setShowVideo(v => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-1.5 transition-colors"
        >
          <svg className={`w-3 h-3 transition-transform ${showVideo ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          {showVideo ? t('youtube.hideVideo') : t('youtube.showVideo')}
        </button>
        {showVideo && (
          <YouTubeEmbed
            ref={embedRef}
            videoId={info.videoId}
            onTimeUpdate={setCurrentTime}
          />
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleTranslate}
          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/50"
          style={showTranslation ? { backgroundColor: `${ACCENT}20`, color: ACCENT } : undefined}
        >
          {translating ? t('youtube.translating') : showTranslation ? t('youtube.hideTranslation') : t('youtube.showTranslation')}
        </button>
        <button
          onClick={() => setShowTranscript(v => !v)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/50"
          style={showTranscript ? { backgroundColor: `${ACCENT}20`, color: ACCENT } : undefined}
        >
          {showTranscript ? t('youtube.hideTranscript') : t('youtube.showTranscript')}
        </button>
        <button
          onClick={() => setShowWordList(v => !v)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/50"
          style={showWordList ? { backgroundColor: `${ACCENT}20`, color: ACCENT } : undefined}
        >
          📚 {t('youtube.wordList')}
        </button>
        <span className="text-xs text-gray-400">{segments.length} {t('youtube.segments')}</span>
      </div>

      {/* Per-video word list */}
      {showWordList && (
        <div className="panel p-4">
          <EpisodeWordList
            episodeId={info.videoId}
            episodeTitle={info.title}
            onClose={() => setShowWordList(false)}
            onRemoveWord={onRemoveWord}
          />
        </div>
      )}

      {/* Transcript — collapsible scrollable subtitle list */}
      {showTranscript && (
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="max-h-[50vh] overflow-y-auto rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
        >
          {segments.map((seg, i) => {
            const isActive = i === activeIndex
            const isSaved = savedSentences?.has(seg.text) ?? false
            const words = seg.text.split(/\s+/)

            return (
              <div
                key={i}
                ref={isActive ? activeRef : undefined}
                onClick={() => seekTo(seg.start)}
                className={`group flex gap-2 px-3 py-2 cursor-pointer transition-all border-l-2 ${
                  isActive
                    ? 'bg-mode-youtube/10 font-medium border-mode-youtube'
                    : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span className="text-[11px] text-gray-400 tabular-nums shrink-0 pt-0.5 w-10">
                  {formatClock(seg.start)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                    {words.map((token, wi) => {
                      if (!/[a-zA-Z]/.test(token)) return <span key={wi}>{token}{' '}</span>
                      return (
                        <span
                          key={wi}
                          onClick={(e) => { e.stopPropagation(); openWord(e.currentTarget, token, seg.text, seg.start) }}
                          onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); openWord(e.currentTarget, token, seg.text, seg.start) }}
                          className="hover:bg-mode-youtube/20 active:bg-mode-youtube/30 rounded px-0.5 cursor-pointer transition-colors"
                          style={{ touchAction: 'manipulation' }}
                        >
                          {token}{' '}
                        </span>
                      )
                    })}
                  </p>
                  {showTranslation && translations[i] && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{translations[i]}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isSaved) onRemoveSentence?.(seg.text, info.title)
                    else onSaveSentence?.(seg.text, info.title, seg.start)
                  }}
                  className={`mt-1 shrink-0 transition-all ${
                    isSaved
                      ? 'text-yellow-500 dark:text-yellow-400 opacity-100'
                      : 'text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-yellow-500 dark:hover:text-yellow-400'
                  }`}
                  title={isSaved ? t('youtube.unsaveSentence') : t('youtube.saveSentence')}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {selectedWord && createPortal(
        <WordPopover
          word={selectedWord.word}
          anchorRect={selectedWord.rect}
          onClose={closePopover}
          onLookup={onRecordLookup}
          onAddToVocab={onAddToVocab}
          onRemoveFromVocab={onRemoveFromVocab}
          onSaveSentence={() => onSaveSentence?.(selectedWord.sentence, info.title, selectedWord.segStart)}
          isSentenceSaved={savedSentences?.has(selectedWord.sentence) ?? false}
          sentenceContext={selectedWord.sentence}
          accentColor={ACCENT}
        />,
        document.body,
      )}
    </div>
  )
}

export default YouTubePlayer
