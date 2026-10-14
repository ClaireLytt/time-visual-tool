import type { FinanceEntry, FinanceLuck } from '../types/finance'

/** Draw probabilities: good 30%, normal 50%, bad 20% */
const GOOD_THRESHOLD = 0.3
const NORMAL_THRESHOLD = 0.8

/** Monthly savings score starts here; draws deduct from it */
export const SAVINGS_SCORE_BASE = 100

/** Score delta per draw result: good costs nothing, bad costs extra */
export const LUCK_SCORE_DELTA: Record<FinanceLuck, number> = {
  good: 0,
  normal: -1,
  bad: -3,
}

export function drawLuck(random: () => number = Math.random): FinanceLuck {
  const r = random()
  if (r < GOOD_THRESHOLD) return 'good'
  if (r < NORMAL_THRESHOLD) return 'normal'
  return 'bad'
}

export interface FinanceLuckStats {
  draws: number
  good: number
  normal: number
  bad: number
  /** SAVINGS_SCORE_BASE plus all draw deltas, floored at 0 */
  score: number
}

/** Tallies blind-box results over a set of entries (e.g. one month). */
export function computeLuckStats(entries: FinanceEntry[]): FinanceLuckStats {
  const stats: FinanceLuckStats = { draws: 0, good: 0, normal: 0, bad: 0, score: SAVINGS_SCORE_BASE }
  for (const e of entries) {
    if (e.type !== 'expense' || e.luck == null) continue
    stats.draws += 1
    stats[e.luck] += 1
    stats.score += LUCK_SCORE_DELTA[e.luck]
  }
  stats.score = Math.max(0, stats.score)
  return stats
}
