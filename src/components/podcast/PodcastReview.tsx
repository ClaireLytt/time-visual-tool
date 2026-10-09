import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from '../../hooks/useTheme'
import type { WordRecord, SavedSentence } from '../../hooks/useWordHistory'

type Period = 'week' | 'month' | '6month' | 'year'

interface PodcastReviewProps {
  words: WordRecord[]
  sentences: SavedSentence[]
  onBack: () => void
}

/** Get the start date for a given period, ending at `now` */
function periodStart(period: Period, now: Date): Date {
  const d = new Date(now)
  switch (period) {
    case 'week': d.setDate(d.getDate() - 6); break
    case 'month': d.setMonth(d.getMonth() - 1); break
    case '6month': d.setMonth(d.getMonth() - 6); break
    case 'year': d.setFullYear(d.getFullYear() - 1); break
  }
  d.setHours(0, 0, 0, 0)
  return d
}

/** Day-of-week labels (localized short names) */
function weekdayLabels(locale: string): string[] {
  const base = new Date(2026, 9, 5) // Monday 2026-10-05
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    return d.toLocaleDateString(locale, { weekday: 'short' })
  })
}

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

type SubView = 'main' | 'vocab' | 'sentences'

export default function PodcastReview({ words, sentences, onBack }: PodcastReviewProps) {
  const { t, i18n } = useTranslation()
  const { isDark } = useTheme()
  const [period, setPeriod] = useState<Period>('week')
  const [subView, setSubView] = useState<SubView>('main')

  const now = useMemo(() => new Date(), [])
  const start = useMemo(() => periodStart(period, now), [period, now])

  // Filter words in range
  const wordsInRange = useMemo(() =>
    words.filter(w => {
      const d = new Date(w.lastSeen)
      return d >= start && d <= now
    }),
    [words, start, now],
  )

  // Build chart data
  const chartData = useMemo(() => {
    if (period === 'week') {
      // Group by day of week
      const labels = weekdayLabels(i18n.language === 'zh' ? 'zh-CN' : 'en-US')
      const counts = Array(7).fill(0) as number[]
      for (const w of wordsInRange) {
        const d = new Date(w.lastSeen)
        // Monday=0 ... Sunday=6
        const dow = (d.getDay() + 6) % 7
        counts[dow] += 1
      }
      return labels.map((label, i) => ({ label, count: counts[i] }))
    }
    if (period === 'month') {
      // Group by week number within the month
      const weeks: Record<string, number> = {}
      for (const w of wordsInRange) {
        const d = new Date(w.lastSeen)
        const weekNum = Math.ceil(d.getDate() / 7)
        const key = `W${weekNum}`
        weeks[key] = (weeks[key] ?? 0) + 1
      }
      return Array.from({ length: 5 }, (_, i) => ({
        label: `W${i + 1}`,
        count: weeks[`W${i + 1}`] ?? 0,
      }))
    }
    if (period === '6month') {
      // Group by month
      const months: Record<string, number> = {}
      for (const w of wordsInRange) {
        const d = new Date(w.lastSeen)
        const key = d.toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short' })
        months[key] = (months[key] ?? 0) + 1
      }
      const result: Array<{ label: string; count: number }> = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now)
        d.setMonth(d.getMonth() - i)
        const label = d.toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short' })
        result.push({ label, count: months[label] ?? 0 })
      }
      return result
    }
    // year — group by year-month key to avoid cross-year collisions
    const months: Record<string, number> = {}
    for (const w of wordsInRange) {
      const d = new Date(w.lastSeen)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      months[key] = (months[key] ?? 0) + 1
    }
    // Build 12 bars going back from current month
    const result: Array<{ label: string; count: number }> = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now)
      d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const label = d.toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short' })
      result.push({ label, count: months[key] ?? 0 })
    }
    return result
  }, [period, wordsInRange, i18n.language, now])

  const total = wordsInRange.length
  const maxCount = Math.max(0, ...chartData.map(d => d.count))
  const avg = chartData.length > 0 ? (total / chartData.length).toFixed(1) : '0'

  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const tickColor = isDark ? '#9ca3af' : '#52514e'
  const barColor = isDark ? '#818cf8' : '#6366f1' // podcast purple

  const periods: Array<{ key: Period; label: string }> = [
    { key: 'week', label: t('podcast.reviewWeek') },
    { key: 'month', label: t('podcast.reviewMonth') },
    { key: '6month', label: t('podcast.review6Month') },
    { key: 'year', label: t('podcast.reviewYear') },
  ]

  const menuItems = [
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
        </svg>
      ),
      label: t('podcast.reviewVocab'),
      count: words.length,
      onClick: () => setSubView('vocab'),
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      ),
      label: t('podcast.reviewSentences'),
      count: sentences.length,
      onClick: () => setSubView('sentences'),
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      ),
      label: t('podcast.reviewSpaced'),
      count: null,
      onClick: () => {},
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
      ),
      label: t('podcast.reviewDictation'),
      count: null,
      onClick: () => {},
    },
  ]

  const handleBack = () => {
    if (subView !== 'main') setSubView('main')
    else onBack()
  }

  return (
    <div id="main-content" className="space-y-4">
      {/* Back button */}
      <button onClick={handleBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
        </svg>
        {t('podcast.back')}
      </button>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {subView === 'vocab' ? t('podcast.reviewVocab') : subView === 'sentences' ? t('podcast.reviewSentences') : t('podcast.reviewTitle')}
      </h2>

      {/* Period tabs + chart — only on main view */}
      {subView === 'main' && <div className="panel">
        <div className="flex rounded-xl bg-gray-100 dark:bg-gray-700/50 p-1">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                period === p.key
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="px-4 pt-4 pb-2 flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">{t('podcast.reviewTotal')}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
              {total} <span className="text-sm font-normal text-gray-400">{t('podcast.reviewUnit')}</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDate(start)} {t('podcast.reviewTo')} {formatDate(now)}
            </p>
          </div>
          <div className="text-right text-xs space-y-1">
            <div>
              <span className="text-gray-400 dark:text-gray-500">{t('podcast.reviewMax')}</span>
              <p className="text-lg font-semibold text-mode-podcast">{maxCount}</p>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500">{t('podcast.reviewAvg')}</span>
              <p className="text-lg font-semibold text-mode-podcast">{avg}</p>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: tickColor }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: tickColor }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value: number) => [value, t('podcast.reviewUnit')]}
                contentStyle={{
                  borderRadius: '8px',
                  border: `1px solid ${gridColor}`,
                  backgroundColor: isDark ? '#1f2937' : '#fff',
                  color: isDark ? '#e5e7eb' : '#111827',
                  fontSize: '13px',
                }}
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
              />
              <Bar dataKey="count" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>}

      {/* Menu list */}
      {subView === 'main' && (
        <div className="panel divide-y divide-gray-100 dark:divide-gray-700">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <span className="text-mode-podcast">{item.icon}</span>
              <span className="flex-1 text-left text-sm font-medium text-gray-800 dark:text-gray-200">
                {item.label}
              </span>
              {item.count != null && (
                <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">{item.count}</span>
              )}
              <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* ── Vocabulary list sub-view ── */}
      {subView === 'vocab' && (
        <div className="panel divide-y divide-gray-100 dark:divide-gray-700">
          {words.length === 0 && (
            <p className="px-4 py-8 text-sm text-gray-400 text-center">{t('podcast.dictNoResult')}</p>
          )}
          {[...words].sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)).map(w => (
            <div key={w.word} className="flex items-center gap-3 px-4 py-3">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{w.word}</span>
              <span className="text-xs text-gray-400 tabular-nums">{w.count}×</span>
              <span className="text-xs text-gray-400">{new Date(w.lastSeen).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Saved sentences sub-view ── */}
      {subView === 'sentences' && (
        <div className="space-y-2">
          {sentences.length === 0 && (
            <div className="panel px-4 py-8 text-sm text-gray-400 text-center">
              {t('podcast.noSavedSentences')}
            </div>
          )}
          {[...sentences].reverse().map((s, i) => (
            <div key={i} className="panel px-4 py-3 space-y-1.5">
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">"{s.text}"</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424" />
                </svg>
                <span className="truncate">{s.episodeTitle}</span>
                <span className="shrink-0">·</span>
                <span className="shrink-0">{new Date(s.savedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
