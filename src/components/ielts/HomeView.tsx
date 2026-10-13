/* ─── IELTS — Home Dashboard ─── */

import { useMemo, useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import ExamCountdown from './ExamCountdown'
import ReviewCard from './ReviewCard'
import StudyHeatmap from './StudyHeatmap'
import MistakeReviewSession from './MistakeReviewSession'
import SettingsModal from './SettingsModal'
import { useIeltsSessions, useIeltsMistakes, useIeltsItems, useIeltsReviews, useIeltsVocab } from './hooks'
import { sm2, DEFAULT_EF, type Quality } from './sm2'
import { SUBJECT_COLORS } from './constants'
import type { IeltsSubject } from './types'

export default function HomeView() {
  const { t } = useTranslation()
  const [, setSearchParams] = useSearchParams()

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
  const vocabHook = useIeltsVocab()

  // Vocab due words count
  const vocabDueCount = useMemo(() => {
    return vocabHook.entries.filter(w => w.nextReview <= today).length
  }, [vocabHook.entries, today])

  const weekMinutes = useMemo(() => {
    const weekAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')
    return sessions.entries
      .filter(s => s.date >= weekAgo)
      .reduce((sum, s) => sum + s.minutes, 0)
  }, [sessions.entries])

  const weekWeaknesses = useMemo(() => {
    const weekAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')
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

  const handleRate = useCallback((reviewId: string, quality: Quality, review: typeof dueReviews[0]) => {
    const ef = review.easeFactor ?? DEFAULT_EF
    const interval = review.interval ?? 0
    const result = sm2(quality, review.reviewCount, ef, interval)
    const resultLabel: 'good' | 'again' | 'hard' | 'easy' =
      quality === 0 ? 'again' : quality === 3 ? 'hard' : quality === 5 ? 'easy' : 'good'
    updateReview(reviewId, {
      result: resultLabel,
      reviewCount: result.repetitions,
      nextReviewDate: result.nextReviewDate,
      easeFactor: result.easeFactor,
      interval: result.interval,
    })
  }, [updateReview])

  // Review mode
  const [reviewMode, setReviewMode] = useState(false)
  const [reviewSnapshot, setReviewSnapshot] = useState<typeof dueItems>([])

  const handleReviewRate = useCallback((reviewId: string, result: 'again' | 'hard' | 'good', nextDate: string) => {
    const review = dueReviews.find(r => r.id === reviewId)
    if (!review) return
    updateReview(reviewId, {
      result,
      reviewCount: result === 'again' ? 0 : review.reviewCount + 1,
      nextReviewDate: nextDate,
    })
  }, [dueReviews, updateReview])

  const [showSettings, setShowSettings] = useState(false)

  const fmtDuration = (m: number) => m < 60 ? `${m}min` : `${(m / 60).toFixed(1)}h`

  const hasData = sessions.entries.length > 0 || dueItems.length > 0

  // Fullscreen review mode
  if (reviewMode && reviewSnapshot.length > 0) {
    return (
      <MistakeReviewSession
        items={reviewSnapshot}
        onRate={handleReviewRate}
        onExit={() => setReviewMode(false)}
      />
    )
  }

  return (
    <div className="space-y-3">
      {/* Settings gear */}
      <div className="flex justify-end -mb-1">
        <button onClick={() => setShowSettings(true)}
          className="h-8 w-8 rounded-full inline-flex items-center justify-center
            text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/40
            transition-colors select-none no-press">
          ⚙️
        </button>
      </div>
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

      {/* Top section: countdown + key stats */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <ExamCountdown />
        <StatCard
          label={t('ielts.weeklyStudyTime')}
          value={fmtDuration(weekMinutes)}
          icon="⏱"
          onClick={() => setSearchParams({ iv: 'weekly' }, { replace: true })}
        />
        <StatCard
          label={t('ielts.reviewDue')}
          value={String(dueItems.length + vocabDueCount)}
          icon="📖"
          highlight={(dueItems.length + vocabDueCount) > 0}
          subtitle={dueItems.length > 0 && vocabDueCount > 0 ? `错题${dueItems.length} + 词汇${vocabDueCount}` : undefined}
          onClick={dueItems.length > 0
            ? () => { setReviewSnapshot([...dueItems]); setReviewMode(true) }
            : vocabDueCount > 0
              ? () => setSearchParams({ iv: 'vocab' }, { replace: true })
              : () => setSearchParams({ iv: 'knowledge' }, { replace: true })
          }
        />
      </div>

      {/* Study heatmap */}
      {sessions.entries.length > 0 && (
        <StudyHeatmap
          sessions={sessions.entries}
          onDateClick={() => setSearchParams({ iv: 'record' }, { replace: true })}
        />
      )}

      {/* Empty state */}
      {!hasData && (
        <div className="panel p-10 text-center space-y-3">
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
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
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
                onRate={(quality) => handleRate(review.id, quality, review)}
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

      {/* Export backup */}
      {sessions.entries.length > 0 && (
        <button onClick={() => {
          const data = {
            version: 1, exportedAt: new Date().toISOString(),
            sessions: sessions.entries, mistakes: mistakes.entries, items: items.entries,
          }
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url; a.download = `ielts-backup-${today}.json`
          a.click(); URL.revokeObjectURL(url)
        }}
          className="w-full h-10 rounded-full text-sm font-medium text-gray-500
            bg-white/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700
            hover:bg-white hover:text-gray-700 transition-all duration-150 select-none no-press">
          💾 导出备份 JSON
        </button>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <section>
          <SectionHeader title="最近练习" />
          <div className="panel divide-y divide-gray-100 dark:divide-gray-700/50 overflow-hidden">
            {recentSessions.map(s => (
              <button key={s.id}
                onClick={() => setSearchParams({ iv: 'record' }, { replace: true })}
                className="flex items-center gap-2.5 px-3 py-2.5 w-full text-left
                  hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors no-press">
                <span
                  className="w-10 text-center py-0.5 rounded text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: SUBJECT_COLORS[s.subject as IeltsSubject] ?? '#888' }}
                >
                  {t(`ielts.${s.subject}`)}
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200 truncate flex-1 font-medium">{s.source}</span>
                {s.score && (
                  <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums shrink-0 font-medium">{s.score}</span>
                )}
                <span className="text-xs text-gray-400 tabular-nums shrink-0">{s.date.slice(5)}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, highlight, onClick, subtitle }: {
  label: string; value: string; icon: string; highlight?: boolean; onClick?: () => void; subtitle?: string
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className={`panel p-3 w-full flex flex-col items-center gap-1 ${
      onClick ? 'cursor-pointer no-press active:scale-[0.98]' : ''
    }`}>
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#c0392b]/8 text-base">
        {icon}
      </span>
      <p className={`text-2xl font-bold tabular-nums ${
        highlight ? 'text-[#c0392b]' : 'text-gray-900 dark:text-gray-100'
      }`} style={{ letterSpacing: '-0.02em' }}>
        {value}
      </p>
      <p className="text-xs text-gray-400 leading-tight">{label}</p>
      {subtitle && <p className="text-xs text-green-500 font-medium">{subtitle}</p>}
    </Tag>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-0.5">
      {title}
    </p>
  )
}
