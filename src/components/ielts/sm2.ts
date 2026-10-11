/* ─── SM-2 Spaced Repetition Algorithm ───
 *
 * Ported from IELTS-practice vocabScheduler.js (SuperMemo SM-2).
 * Pure functions — no side effects, no React dependencies.
 */

import { addDays, format } from 'date-fns'

/** Quality rating: 0 = wrong, 3 = hard, 4 = good, 5 = easy */
export type Quality = 0 | 3 | 4 | 5

export interface SM2State {
  easeFactor: number
  interval: number
  repetitions: number
}

export interface SM2Result extends SM2State {
  nextReviewDate: string
}

/** Default ease factor for brand-new items */
export const DEFAULT_EF = 2.5
const MIN_EF = 1.3
const MAX_EF = 3.0

/**
 * Core SM-2 scheduling function.
 *
 * @param quality   — 0 (wrong), 3 (hard), 4 (good), 5 (easy)
 * @param reps      — current repetition count
 * @param ef        — current ease factor (default 2.5)
 * @param interval  — current interval in days (default 0)
 * @returns updated SM-2 state + next review date
 */
export function sm2(quality: Quality, reps: number, ef: number, interval: number): SM2Result {
  let newEF = ef
  let newReps = reps
  let newInterval = interval

  if (quality < 3) {
    // Failed — reset repetitions, short interval, decrease EF
    newReps = 0
    newInterval = 1
    newEF = Math.max(MIN_EF, ef - 0.2)
  } else {
    // Passed — update EF using SM-2 formula
    newEF = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    newEF = Math.min(MAX_EF, Math.max(MIN_EF, newEF))

    if (newReps === 0) {
      newInterval = 1
    } else if (newReps === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * newEF)
    }
    newReps += 1
  }

  return {
    easeFactor: Math.round(newEF * 100) / 100,
    interval: newInterval,
    repetitions: newReps,
    nextReviewDate: format(addDays(new Date(), newInterval), 'yyyy-MM-dd'),
  }
}

/** Preview the next interval for a given quality (for button labels) */
export function previewInterval(quality: Quality, reps: number, ef: number, interval: number): number {
  return sm2(quality, reps, ef, interval).interval
}
