import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { WordRecord } from '../../hooks/useWordHistory'
import type { EpisodeMeta } from '../../hooks/useEpisodeStats'

interface LearningGoalProps {
  words: WordRecord[]
  episodeStats: Record<string, EpisodeMeta>
}

/** Get start of current week (Monday 00:00) */
function weekStart(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1 // Monday = 0
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const GOAL_EPISODES = 3
const GOAL_WORDS = 10

export default function LearningGoal({ words, episodeStats }: LearningGoalProps) {
  const { t } = useTranslation()
  const start = useMemo(() => weekStart(), [])

  const weekWords = useMemo(() =>
    words.filter(w => new Date(w.lastSeen) >= start).length,
    [words, start],
  )

  const weekEpisodes = useMemo(() =>
    Object.values(episodeStats).filter(e =>
      e.lastPlayed && new Date(e.lastPlayed) >= start && e.segmentsListened > 0
    ).length,
    [episodeStats, start],
  )

  const epProgress = Math.min(weekEpisodes, GOAL_EPISODES)
  const wordProgress = Math.min(weekWords, GOAL_WORDS)
  const epPct = Math.round((epProgress / GOAL_EPISODES) * 100)
  const wordPct = Math.round((wordProgress / GOAL_WORDS) * 100)

  return (
    <div className="panel px-4 py-3 flex items-center gap-4">
      <div className="text-2xl">🎯</div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {t('podcast.goalTitle')}
        </p>
        {/* Episodes progress */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div className="h-full rounded-full bg-mode-podcast transition-all" style={{ width: `${epPct}%` }} />
          </div>
          <span className="text-[11px] tabular-nums text-gray-500 dark:text-gray-400 shrink-0">
            {t('podcast.goalEpisodes', { done: epProgress, total: GOAL_EPISODES })}
          </span>
        </div>
        {/* Words progress */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${wordPct}%` }} />
          </div>
          <span className="text-[11px] tabular-nums text-gray-500 dark:text-gray-400 shrink-0">
            {t('podcast.goalWords', { done: wordProgress, total: GOAL_WORDS })}
          </span>
        </div>
      </div>
    </div>
  )
}
