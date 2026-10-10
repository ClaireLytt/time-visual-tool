import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { lookupWord, type DictResult } from '../../api/dictionary'
import { useWordHistory } from '../../hooks/useWordHistory'

export interface EpisodeWordListProps {
  episodeId: string
  episodeTitle: string
  onClose: () => void
  onRemoveWord?: (word: string) => void
}

export default function EpisodeWordList({
  episodeId,
  episodeTitle,
  onClose,
  onRemoveWord,
}: EpisodeWordListProps) {
  const { t } = useTranslation()
  const { words, toggleBookmark, sentences } = useWordHistory()
  const episodeWords = words.filter(w => w.episodeId === episodeId)

  // Dictionary cache for definitions
  const [dictCache, setDictCache] = useState<Map<string, DictResult | null>>(new Map())

  // Look up all episode words in the offline dictionary
  useEffect(() => {
    let cancelled = false
    const lookupAll = async () => {
      for (const wr of episodeWords) {
        if (dictCache.has(wr.word)) continue
        const result = await lookupWord(wr.word)
        if (cancelled) return
        setDictCache(prev => new Map(prev).set(wr.word, result))
      }
    }
    lookupAll()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId])

  // Find a saved sentence that contains the word
  const findSentence = (word: string): string | undefined => {
    const lower = word.toLowerCase()
    return sentences.find(
      s => s.episodeTitle === episodeTitle && s.text.toLowerCase().includes(lower),
    )?.text
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
            {t('episodeWords.title')}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{episodeTitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-mode-podcast bg-mode-podcast/10 px-2 py-0.5 rounded-full">
            {t('episodeWords.wordCount', { count: episodeWords.length })}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Empty state */}
      {episodeWords.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-400">{t('episodeWords.empty')}</p>
        </div>
      )}

      {/* Word cards */}
      <div className="space-y-2 max-h-[24rem] overflow-y-auto">
        {episodeWords.map(wr => {
          const dict = dictCache.get(wr.word)
          const sentence = findSentence(wr.word)
          const phonetic = dict?.phonetics?.us?.text || dict?.phonetics?.uk?.text || ''
          return (
            <div
              key={wr.word}
              className="rounded-lg border border-gray-100 dark:border-gray-700/50 p-3 space-y-1.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {wr.word}
                  </span>
                  {phonetic && (
                    <span className="text-xs text-gray-400">/{phonetic}/</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Bookmark toggle */}
                  <button
                    onClick={() => toggleBookmark(wr.word)}
                    className={`text-sm transition-colors ${
                      wr.bookmarked
                        ? 'text-yellow-500'
                        : 'text-gray-300 dark:text-gray-600 hover:text-yellow-500'
                    }`}
                  >
                    {wr.bookmarked ? '★' : '☆'}
                  </button>
                  {/* Remove button */}
                  {onRemoveWord && (
                    <button
                      onClick={() => onRemoveWord(wr.word)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Chinese definition */}
              {dict?.definitions && dict.definitions.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {dict.definitions[0]}
                </p>
              )}

              {/* Sentence context */}
              {sentence && (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic line-clamp-2">
                  &ldquo;{sentence}&rdquo;
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
