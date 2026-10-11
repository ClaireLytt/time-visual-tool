/* ─── IELTS Review Module — Utilities ─── */

import { addDays, format } from 'date-fns'
import { REVIEW_INTERVALS } from './constants'
import type { IeltsView, IeltsMistake, IeltsReview } from './types'

/* ── URL search params serialization ── */

const VIEW_PARAM = 'iv' // ielts-view

export function viewToParams(view: IeltsView): Record<string, string> {
  switch (view.kind) {
    case 'home':      return {}
    case 'record':    return { [VIEW_PARAM]: 'record' }
    case 'import':    return { [VIEW_PARAM]: 'import' }
    case 'stats':     return { [VIEW_PARAM]: 'stats' }
    case 'knowledge': return { [VIEW_PARAM]: 'knowledge' }
    case 'weekly':    return { [VIEW_PARAM]: 'weekly' }
  }
}

export function paramsToView(params: URLSearchParams): IeltsView {
  const iv = params.get(VIEW_PARAM)
  if (!iv) return { kind: 'home' }
  switch (iv) {
    case 'record':    return { kind: 'record' }
    case 'import':    return { kind: 'import' }
    case 'stats':     return { kind: 'stats' }
    case 'knowledge': return { kind: 'knowledge' }
    case 'weekly':    return { kind: 'weekly' }
    default:          return { kind: 'home' }
  }
}

/* ── Spaced repetition helpers ── */

export function getNextReviewDate(reviewCount: number): string {
  const idx = Math.min(reviewCount, REVIEW_INTERVALS.length - 1)
  const days = REVIEW_INTERVALS[idx]
  return format(addDays(new Date(), days), 'yyyy-MM-dd')
}

export function isDueForReview(review: IeltsReview): boolean {
  const today = format(new Date(), 'yyyy-MM-dd')
  return review.nextReviewDate <= today
}

/* ── Score parsing ── */

/**
 * Parse score string to a numeric band (0-9 scale).
 * "32/40" → 7.2 (ratio × 9)
 * "6.5"   → 6.5
 * ""      → null
 */
export function parseScore(score: string): number | null {
  if (!score || !score.trim()) return null
  const s = score.trim()
  // Fraction: "32/40"
  if (s.includes('/')) {
    const [num, den] = s.split('/')
    const n = parseFloat(num)
    const d = parseFloat(den)
    if (!isNaN(n) && !isNaN(d) && d > 0) return Math.round((n / d) * 9 * 10) / 10
    return null
  }
  // Direct number: "6.5"
  const n = parseFloat(s)
  if (!isNaN(n) && n >= 0 && n <= 9) return n
  return null
}

/* ── Tag aggregation ── */

export interface TagCount {
  tag: string
  count: number
  percentage: number
}

export function aggregateTagCounts(
  mistakes: IeltsMistake[],
  filter?: { subject?: string; after?: string; sessions?: { id: string; subject: string }[] },
): TagCount[] {
  let filtered = mistakes
  if (filter?.subject && filter.sessions) {
    // Filter by the session's subject, not by tag (tags like '词汇'/'语法' overlap across subjects)
    const sessionSubject = new Map(filter.sessions.map(s => [s.id, s.subject]))
    filtered = filtered.filter(m => sessionSubject.get(m.sessionId) === filter.subject)
  }
  if (filter?.after) {
    filtered = filtered.filter(m => m.date >= filter.after!)
  }

  const counts = new Map<string, number>()
  for (const m of filtered) {
    counts.set(m.tag, (counts.get(m.tag) ?? 0) + 1)
  }

  const total = filtered.length || 1
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
}
