import type { Segment } from '../types/podcast'

/** Seconds → "mm:ss" (or "h:mm:ss" past an hour) */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

/** Index of the last segment whose start <= time, or -1 before the first one. Segments must be sorted by start. */
export function findActiveIndex(segments: Segment[], time: number): number {
  let lo = 0
  let hi = segments.length - 1
  let ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (segments[mid].start <= time) {
      ans = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return ans
}

export function isUrl(input: string): boolean {
  return /^https?:\/\//i.test(input.trim())
}

/** Parse "HH:MM:SS,mmm" or "HH:MM:SS.mmm" or "MM:SS.mmm" to seconds */
function parseTimestamp(ts: string): number {
  const parts = ts.replace(',', '.').split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0] ?? 0
}

/** Parse SRT subtitle text into segments */
export function parseSrt(text: string): Segment[] {
  const blocks = text.trim().replace(/\r\n/g, '\n').split(/\n\n+/)
  const segments: Segment[] = []
  for (const block of blocks) {
    const lines = block.split('\n')
    const timeLine = lines.find(l => l.includes('-->'))
    if (!timeLine) continue
    const [startStr, endStr] = timeLine.split('-->').map(s => s.trim())
    const textLines = lines.slice(lines.indexOf(timeLine) + 1).join(' ').trim()
    if (!textLines) continue
    segments.push({ start: parseTimestamp(startStr), end: parseTimestamp(endStr), text: textLines })
  }
  return segments
}

/** Parse WebVTT subtitle text into segments */
export function parseVtt(text: string): Segment[] {
  // Strip the WEBVTT header and any NOTE blocks
  const body = text.replace(/^WEBVTT[^\n]*\n/, '').replace(/^NOTE[^\n]*\n(?:(?!\n\n).)*\n\n/gms, '')
  return parseSrt(body)
}

/** Parse a JSON transcript (array of {start, end, text} or podcast-namespace format) */
export function parseJsonTranscript(json: string): Segment[] {
  const data = JSON.parse(json)
  if (Array.isArray(data)) {
    return data.map((s: Record<string, unknown>) => ({
      start: Number(s.start ?? s.startTime ?? 0),
      end: Number(s.end ?? s.endTime ?? s.start ?? 0),
      text: String(s.text ?? s.body ?? ''),
    })).filter((s: Segment) => s.text)
  }
  // Podcasting 2.0 JSON format: { segments: [...] }
  if (data.segments) return parseJsonTranscript(JSON.stringify(data.segments))
  return []
}
