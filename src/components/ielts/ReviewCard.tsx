/* ─── IELTS — Review Card (SM-2 Spaced Repetition) ─── */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { previewInterval, DEFAULT_EF, type Quality } from './sm2'
import type { IeltsItem, IeltsReview } from './types'

interface ReviewCardProps {
  item: IeltsItem
  review: IeltsReview
  onRate: (quality: Quality) => void
}

const QUALITY_BUTTONS: { quality: Quality; labelKey: string; color: string; icon: string }[] = [
  { quality: 0, labelKey: 'ielts.again',       color: '#6b7280', icon: '🔄' },
  { quality: 3, labelKey: 'ielts.hard',        color: '#f59e0b', icon: '🤔' },
  { quality: 4, labelKey: 'ielts.remembered',  color: '#10b981', icon: '✅' },
  { quality: 5, labelKey: 'ielts.easy',        color: '#3b82f6', icon: '⚡' },
]

export default memo(function ReviewCard({ item, review, onRate }: ReviewCardProps) {
  const { t } = useTranslation()

  const typeLabel = item.type === 'mistake' ? '❌ 错题'
    : item.type === 'expression' ? '📝 表达'
    : '📋 待办'

  const ef = review.easeFactor ?? DEFAULT_EF
  const interval = review.interval ?? 0

  return (
    <div className="panel p-3 space-y-2">
      {/* Type badge + review count */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">{typeLabel}</span>
        <span className="text-xs text-gray-400 tabular-nums">
          第 {review.reviewCount + 1} 次复习
        </span>
      </div>

      {/* Content */}
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.content}</p>
        {item.meaning && (
          <p className="text-xs text-gray-500 mt-1">{item.meaning}</p>
        )}
        {item.example && (
          <p className="text-xs text-gray-400 italic mt-0.5">{item.example}</p>
        )}
        {item.source && (
          <p className="text-xs text-gray-400 mt-1">📎 {item.source}</p>
        )}
      </div>

      {/* SM-2 quality buttons */}
      <div className="grid grid-cols-4 gap-1.5">
        {QUALITY_BUTTONS.map(({ quality, labelKey, color, icon }) => {
          const days = previewInterval(quality, review.reviewCount, ef, interval)
          return (
            <button
              key={quality}
              onClick={() => onRate(quality)}
              className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-xs font-medium
                transition-all select-none no-press active:scale-[0.95] hover:brightness-110"
              style={{ backgroundColor: `${color}12`, color }}
            >
              <span className="flex items-center gap-1">{icon} {t(labelKey)}</span>
              <span className="text-xs opacity-60 tabular-nums">{days}d</span>
            </button>
          )
        })}
      </div>
    </div>
  )
})
