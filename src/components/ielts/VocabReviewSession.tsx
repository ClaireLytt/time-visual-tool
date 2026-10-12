/* ─── IELTS — Vocabulary Review Session ─── */

import { useState, useRef, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { previewInterval, type Quality } from './sm2'
import { ACCENT, btnGhost, btnPrimary } from './styles'
import type { IeltsVocabWord } from './types'

interface VocabReviewSessionProps {
  words: IeltsVocabWord[]
  onRate: (wordId: string, quality: Quality) => void
  onExit: () => void
}

interface ReviewResult {
  word: IeltsVocabWord
  quality: Quality
}

const QUALITY_BUTTONS: { quality: Quality; label: string; color: string; icon: string }[] = [
  { quality: 0, label: '忘了', color: '#6b7280', icon: '❌' },
  { quality: 3, label: '困难', color: '#f59e0b', icon: '🤔' },
  { quality: 4, label: '记住了', color: '#10b981', icon: '✅' },
  { quality: 5, label: '简单', color: '#3b82f6', icon: '⚡' },
]

const qualityLabel = (q: Quality) =>
  q === 0 ? '忘了' : q === 3 ? '困难' : q === 4 ? '记住了' : '简单'
const qualityColor = (q: Quality) =>
  q === 0 ? '#6b7280' : q === 3 ? '#f59e0b' : q === 4 ? '#10b981' : '#3b82f6'

export default memo(function VocabReviewSession({ words, onRate, onExit }: VocabReviewSessionProps) {
  const { t } = useTranslation()
  const [shuffled] = useState(() => [...words].sort(() => Math.random() - 0.5))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const resultsRef = useRef<ReviewResult[]>([])
  const startTimeRef = useRef(Date.now())

  const current = shuffled[index]
  const total = shuffled.length

  // Session complete — show report
  if (!current || index >= total) {
    const results = resultsRef.current
    const correct = results.filter(r => r.quality >= 4).length
    const hard = results.filter(r => r.quality === 3).length
    const wrong = results.filter(r => r.quality === 0).length
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    const mm = Math.floor(elapsed / 60)
    const ss = elapsed % 60

    return (
      <div className="space-y-3">
        {/* Summary */}
        <div className="panel p-6 text-center space-y-3">
          <p className="text-3xl">🎉</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t('ielts.vocabReviewDone')}
          </p>
          <p className="text-sm text-gray-500">
            用时 {mm > 0 ? `${mm}分` : ''}{ss}秒 · 共 {results.length} 词
          </p>

          {/* Score breakdown */}
          <div className="flex justify-center gap-4 pt-2">
            <div className="text-center">
              <p className="text-xl font-bold text-green-500 tabular-nums">{correct}</p>
              <p className="text-xs text-gray-400">✅ 记住</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-500 tabular-nums">{hard}</p>
              <p className="text-xs text-gray-400">🤔 困难</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-500 tabular-nums">{wrong}</p>
              <p className="text-xs text-gray-400">❌ 忘了</p>
            </div>
          </div>

          {/* Accuracy bar */}
          {results.length > 0 && (
            <div className="w-full max-w-xs mx-auto">
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                {correct > 0 && (
                  <div className="h-full bg-green-500" style={{ width: `${(correct / results.length) * 100}%` }} />
                )}
                {hard > 0 && (
                  <div className="h-full bg-amber-400" style={{ width: `${(hard / results.length) * 100}%` }} />
                )}
                {wrong > 0 && (
                  <div className="h-full bg-gray-400" style={{ width: `${(wrong / results.length) * 100}%` }} />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1 tabular-nums">
                正确率 {Math.round(((correct + hard) / results.length) * 100)}%
              </p>
            </div>
          )}
        </div>

        {/* Wrong words list */}
        {wrong > 0 && (
          <div className="panel p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              ❌ 需要重点复习 ({wrong})
            </p>
            <div className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {results.filter(r => r.quality === 0).map(r => (
                <div key={r.word.id} className="py-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{r.word.word}</span>
                  {r.word.phonetic && <span className="text-xs text-gray-400">{r.word.phonetic}</span>}
                  <span className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">{r.word.meaning}</span>
                  <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600
                    dark:bg-amber-900/20 dark:text-amber-400 shrink-0">待复习</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All results */}
        {results.length > 3 && (
          <details className="panel overflow-hidden">
            <summary className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer
              hover:bg-gray-50/60 dark:hover:bg-gray-700/20 select-none">
              查看全部结果 ({results.length})
            </summary>
            <div className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {results.map(r => (
                <div key={r.word.id} className="px-4 py-2 flex items-center gap-2">
                  <span className="px-1.5 py-px rounded text-xs font-medium shrink-0"
                    style={{ backgroundColor: `${qualityColor(r.quality)}15`, color: qualityColor(r.quality) }}>
                    {qualityLabel(r.quality)}
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{r.word.word}</span>
                  <span className="text-sm text-gray-400 truncate flex-1">{r.word.meaning}</span>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onExit} className={`${btnGhost} h-11 px-5 flex-1
            border border-gray-200 dark:border-gray-700`}>
            ← {t('ielts.vocabBackToList')}
          </button>
          {wrong > 0 && (
            <button onClick={() => {
              // Restart with only wrong words
              resultsRef.current = []
              startTimeRef.current = Date.now()
              // Can't easily restart with subset in current architecture,
              // so just go back and let user start a new session
              onExit()
            }}
              className={`${btnPrimary(false)} h-11 px-5 flex-1`}
              style={{ backgroundColor: ACCENT }}>
              🔄 再练错词
            </button>
          )}
        </div>
      </div>
    )
  }

  const handleRate = (quality: Quality) => {
    resultsRef.current.push({ word: current, quality })
    onRate(current.id, quality)
    setFlipped(false)
    setIndex(i => i + 1)
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <button onClick={onExit} className={`${btnGhost} h-9 px-3`}>
          ← 返回
        </button>
        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(index / total) * 100}%`, backgroundColor: ACCENT }} />
        </div>
        <span className="text-xs text-gray-400 tabular-nums shrink-0">{index + 1}/{total}</span>
      </div>

      {/* Card */}
      <div className="panel p-0 cursor-pointer select-none overflow-hidden"
        onClick={() => !flipped && setFlipped(true)}
        style={{ perspective: 1000 }}>
        <AnimatePresence mode="wait">
          {!flipped ? (
            <motion.div key="front"
              initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.25 }}
              className="p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{current.word}</p>
              {current.phonetic && <p className="text-sm text-gray-400 mt-2">{current.phonetic}</p>}
              <p className="text-xs text-gray-400 mt-4">点击翻转查看释义</p>
            </motion.div>
          ) : (
            <motion.div key="back"
              initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.25 }}
              className="p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{current.word}</p>
              {current.phonetic && <p className="text-xs text-gray-400 mt-1">{current.phonetic}</p>}
              <p className="text-base text-gray-700 dark:text-gray-300 mt-3 font-medium">{current.meaning}</p>
              {current.example && <p className="text-sm text-gray-400 italic mt-2 max-w-md">{current.example}</p>}
              {current.source && <p className="text-xs text-gray-400 mt-3">📎 {current.source}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quality buttons */}
      {flipped && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-2">
          {QUALITY_BUTTONS.map(({ quality, label, color, icon }) => {
            const days = previewInterval(quality, current.repetitions, current.easeFactor, current.interval)
            return (
              <button key={quality} onClick={() => handleRate(quality)}
                className="flex flex-col items-center gap-1 py-3 px-2 rounded-2xl text-sm font-medium
                  transition-all select-none no-press active:scale-[0.95] hover:brightness-110"
                style={{ backgroundColor: `${color}15`, color }}>
                <span>{icon} {label}</span>
                <span className="text-xs opacity-70 tabular-nums">{days}天</span>
              </button>
            )
          })}
        </motion.div>
      )}
    </div>
  )
})
