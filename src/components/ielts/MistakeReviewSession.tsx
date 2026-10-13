/* ─── IELTS — Mistake Review Session (SM-2 simplified) ─── */

import { useState, useRef, memo } from 'react'
import { format, addDays } from 'date-fns'
import { ACCENT, btnGhost } from './styles'
import type { IeltsItem, IeltsReview } from './types'

interface Props {
  items: { item: IeltsItem; review: IeltsReview }[]
  onRate: (reviewId: string, result: 'again' | 'hard' | 'good', nextDate: string) => void
  onExit: () => void
}

const RATINGS = [
  { key: 'again' as const, label: '忘记', icon: '❌', color: '#ef4444', days: 1 },
  { key: 'hard' as const,  label: '模糊', icon: '🤔', color: '#f59e0b', days: 3 },
  { key: 'good' as const,  label: '认识', icon: '✅', color: '#10b981', days: 7 },
]

interface ReviewResult {
  item: IeltsItem
  rating: 'again' | 'hard' | 'good'
}

export default memo(function MistakeReviewSession({ items, onRate, onExit }: Props) {
  const [shuffled] = useState(() => [...items].sort(() => Math.random() - 0.5))
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const resultsRef = useRef<ReviewResult[]>([])
  const startTimeRef = useRef(Date.now())

  const current = shuffled[index]
  const total = shuffled.length

  // Completion screen
  if (!current || index >= total) {
    const results = resultsRef.current
    const good = results.filter(r => r.rating === 'good').length
    const hard = results.filter(r => r.rating === 'hard').length
    const again = results.filter(r => r.rating === 'again').length
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    const mm = Math.floor(elapsed / 60)
    const ss = elapsed % 60

    return (
      <div className="space-y-3">
        <div className="panel p-6 text-center space-y-3">
          <p className="text-3xl">🎉</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">复习完成！</p>
          <p className="text-sm text-gray-500">
            用时 {mm > 0 ? `${mm}分` : ''}{ss}秒 · 共 {results.length} 题
          </p>

          <div className="flex justify-center gap-4 pt-2">
            <div className="text-center">
              <p className="text-xl font-bold text-green-500 tabular-nums">{good}</p>
              <p className="text-xs text-gray-400">✅ 认识</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-500 tabular-nums">{hard}</p>
              <p className="text-xs text-gray-400">🤔 模糊</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-red-500 tabular-nums">{again}</p>
              <p className="text-xs text-gray-400">❌ 忘记</p>
            </div>
          </div>

          {results.length > 0 && (
            <div className="w-full max-w-xs mx-auto">
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                {good > 0 && <div className="h-full bg-green-500" style={{ width: `${(good / results.length) * 100}%` }} />}
                {hard > 0 && <div className="h-full bg-amber-400" style={{ width: `${(hard / results.length) * 100}%` }} />}
                {again > 0 && <div className="h-full bg-red-400" style={{ width: `${(again / results.length) * 100}%` }} />}
              </div>
            </div>
          )}
        </div>

        {/* Wrong items */}
        {again > 0 && (
          <div className="panel p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              ❌ 需要重点复习 ({again})
            </p>
            <div className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {results.filter(r => r.rating === 'again').map(r => (
                <div key={r.item.id} className="py-2">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{r.item.content}</p>
                  {r.item.source && <p className="text-xs text-gray-400 mt-0.5">📎 {r.item.source}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onExit} className={`${btnGhost} h-11 px-6 w-full border border-gray-200 dark:border-gray-700`}>
          ← 返回首页
        </button>
      </div>
    )
  }

  const handleRate = (rating: 'again' | 'hard' | 'good') => {
    const days = RATINGS.find(r => r.key === rating)!.days
    const nextDate = format(addDays(new Date(), days), 'yyyy-MM-dd')
    resultsRef.current.push({ item: current.item, rating })
    onRate(current.review.id, rating, nextDate)
    setRevealed(false)
    setIndex(i => i + 1)
  }

  const typeLabel = current.item.type === 'mistake' ? '❌ 错题'
    : current.item.type === 'expression' ? '📝 表达' : '📋 待办'

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <button onClick={onExit} className={`${btnGhost} h-9 px-3`}>← 返回</button>
        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(index / total) * 100}%`, backgroundColor: ACCENT }} />
        </div>
        <span className="text-xs text-gray-400 tabular-nums shrink-0">{index + 1}/{total}</span>
      </div>

      {/* Card */}
      <div className="panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{typeLabel}</span>
          <span className="text-xs text-gray-400 tabular-nums">第 {current.review.reviewCount + 1} 次复习</span>
        </div>

        {/* Content */}
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
          {current.item.content}
        </p>

        {current.item.source && (
          <p className="text-xs text-gray-400">📎 {current.item.source}</p>
        )}

        {/* Reveal button or answer */}
        {!revealed ? (
          <button onClick={() => setRevealed(true)}
            className="w-full h-11 rounded-full text-sm font-medium
              bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300
              hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors select-none">
            👁 显示答案
          </button>
        ) : (
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
            {current.item.meaning && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">释义 / 正确答案</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{current.item.meaning}</p>
              </div>
            )}
            {current.item.example && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">例句 / 解析</p>
                <p className="text-sm text-gray-500 italic">{current.item.example}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating buttons — only after reveal */}
      {revealed && (
        <div className="grid grid-cols-3 gap-2">
          {RATINGS.map(({ key, label, icon, color, days }) => (
            <button key={key} onClick={() => handleRate(key)}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-2xl text-sm font-medium
                transition-all duration-150 select-none no-press active:scale-[0.95] hover:brightness-110"
              style={{ backgroundColor: `${color}15`, color }}>
              <span>{icon} {label}</span>
              <span className="text-xs opacity-70 tabular-nums">{days}天后</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
})
