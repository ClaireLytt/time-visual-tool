/* ─── IELTS — Review Card (Spaced Repetition) ─── */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { IeltsItem, IeltsReview } from './types'

interface ReviewCardProps {
  item: IeltsItem
  review: IeltsReview
  onGood: () => void
  onAgain: () => void
}

export default memo(function ReviewCard({ item, review, onGood, onAgain }: ReviewCardProps) {
  const { t } = useTranslation()

  const typeLabel = item.type === 'mistake' ? '❌ 错题'
    : item.type === 'expression' ? '📝 表达'
    : '📋 待办'

  return (
    <div className="panel p-3 space-y-2">
      {/* Type badge + review count */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-gray-400">{typeLabel}</span>
        <span className="text-[10px] text-gray-400 tabular-nums">
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
          <p className="text-[10px] text-gray-400 mt-1">📎 {item.source}</p>
        )}
      </div>

      {/* Actions — right-aligned, consistent sizing */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={onAgain}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium
            bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-gray-600
            transition-colors select-none no-press active:scale-[0.97]"
        >
          🔄 {t('ielts.again')}
        </button>
        <button
          onClick={onGood}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-5 rounded-lg text-sm font-semibold text-white
            transition-colors select-none no-press active:scale-[0.97] hover:brightness-110"
          style={{ backgroundColor: '#10b981' }}
        >
          ✅ {t('ielts.remembered')}
        </button>
      </div>
    </div>
  )
})
