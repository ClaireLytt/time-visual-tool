/* ─── IELTS — Home Dashboard ─── */

import { useMemo, useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays } from 'date-fns'
import ExamCountdown from './ExamCountdown'
import ReviewCard from './ReviewCard'
import StudyHeatmap from './StudyHeatmap'
import { useIeltsSessions, useIeltsMistakes, useIeltsItems, useIeltsReviews } from './hooks'
import { getNextReviewDate } from './utils'
import { SUBJECT_COLORS } from './constants'
import type { IeltsSubject } from './types'

export default function HomeView() {
  const { t } = useTranslation()
  // Reactive: updates if the app stays open past midnight
  const [today, setToday] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  useEffect(() => {
    const check = () => {
      const now = format(new Date(), 'yyyy-MM-dd')
      if (now !== today) setToday(now)
    }
    const id = setInterval(check, 60_000) // check every minute
    return () => clearInterval(id)
  }, [today])

  const sessions = useIeltsSessions()
  const mistakes = useIeltsMistakes()
  const items = useIeltsItems()
  const { dueReviews, updateEntry: updateReview } = useIeltsReviews()

  const weekMinutes = useMemo(() => {
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')
    return sessions.entries
      .filter(s => s.date >= weekAgo)
      .reduce((sum, s) => sum + s.minutes, 0)
  }, [sessions.entries])

  const weekWeaknesses = useMemo(() => {
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')
    const recentMistakes = mistakes.entries.filter(m => m.date >= weekAgo)
    const counts = new Map<string, number>()
    for (const m of recentMistakes) {
      counts.set(m.tag, (counts.get(m.tag) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag, count]) => ({ tag, count }))
  }, [mistakes.entries])

  const recentSessions = useMemo(
    () => [...sessions.entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [sessions.entries],
  )

  const dueItems = useMemo(() => {
    return dueReviews
      .map(review => {
        const item = items.entries.find(it => it.id === review.itemId)
        return item ? { review, item } : null
      })
      .filter(Boolean) as { review: typeof dueReviews[0]; item: typeof items.entries[0] }[]
  }, [dueReviews, items.entries])

  const handleGood = useCallback((reviewId: string, currentCount: number) => {
    updateReview(reviewId, {
      result: 'good',
      reviewCount: currentCount + 1,
      nextReviewDate: getNextReviewDate(currentCount + 1),
    })
  }, [updateReview])

  const handleAgain = useCallback((reviewId: string) => {
    updateReview(reviewId, {
      result: 'again',
      reviewCount: 0,
      nextReviewDate: getNextReviewDate(0),
    })
  }, [updateReview])

  const fmtDuration = (m: number) => m < 60 ? `${m}min` : `${(m / 60).toFixed(1)}h`

  const hasData = sessions.entries.length > 0 || dueItems.length > 0

  return (
    <div className="space-y-3">
      {/* Top section: countdown + key stats */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <ExamCountdown />
        <StatCard
          label={t('ielts.weeklyStudyTime')}
          value={fmtDuration(weekMinutes)}
          icon="⏱"
        />
        <StatCard
          label={t('ielts.reviewDue')}
          value={String(dueItems.length)}
          icon="📖"
          highlight={dueItems.length > 0}
        />
      </div>

      {/* Study heatmap */}
      {sessions.entries.length > 0 && <StudyHeatmap sessions={sessions.entries} />}

      {/* Empty state */}
      {!hasData && (
        <div className="panel p-8 text-center space-y-3">
          <p className="text-3xl">📝</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            开始你的雅思复盘之旅
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            切换到「记录」记录每次练习 · 切换到「导入」粘贴 AI 整理的 JSON
          </p>
        </div>
      )}

      {/* Weekly weaknesses */}
      {weekWeaknesses.length > 0 && (
        <div className="panel p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {t('ielts.topWeakness')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {weekWeaknesses.map(({ tag, count }, i) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${
                  i === 0
                    ? 'bg-[#c0392b]/10 text-[#c0392b] dark:text-[#ef6f6f]'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500'
                }`}
              >
                {tag}
                <span className="text-xs opacity-60">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Due reviews */}
      {dueItems.length > 0 && (
        <section>
          <SectionHeader title={`${t('ielts.reviewDue')} (${dueItems.length})`} />
          <div className="space-y-2">
            {dueItems.slice(0, 5).map(({ review, item }) => (
              <ReviewCard
                key={review.id}
                item={item}
                review={review}
                onGood={() => handleGood(review.id, review.reviewCount)}
                onAgain={() => handleAgain(review.id)}
              />
            ))}
            {dueItems.length > 5 && (
              <p className="text-xs text-gray-400 text-center py-1">
                还有 {dueItems.length - 5} 项待复习
              </p>
            )}
          </div>
        </section>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <section>
          <SectionHeader title="最近练习" />
          <div className="panel divide-y divide-gray-100 dark:divide-gray-700/50 overflow-hidden">
            {recentSessions.map(s => (
              <div key={s.id} className="flex items-center gap-2.5 px-3 py-2.5">
                <span
                  className="w-10 text-center py-0.5 rounded text-[11px] font-bold text-white shrink-0"
                  style={{ backgroundColor: SUBJECT_COLORS[s.subject as IeltsSubject] ?? '#888' }}
                >
                  {t(`ielts.${s.subject}`)}
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200 truncate flex-1 font-medium">{s.source}</span>
                {s.score && (
                  <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums shrink-0 font-medium">{s.score}</span>
                )}
                <span className="text-xs text-gray-400 tabular-nums shrink-0">{s.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, highlight }: {
  label: string; value: string; icon: string; highlight?: boolean
}) {
  return (
    <div className="panel p-2.5 text-center">
      <span className="text-base">{icon}</span>
      <p className={`text-lg font-bold tabular-nums mt-0.5 ${
        highlight ? 'text-[#c0392b]' : 'text-gray-900 dark:text-gray-100'
      }`}>
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-0.5">
      {title}
    </p>
  )
}
