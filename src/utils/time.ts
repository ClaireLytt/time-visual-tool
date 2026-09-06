import i18n from '../i18n'

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return i18n.t('duration.minutes', { m })
  if (m === 0) return i18n.t('duration.hours', { h })
  return i18n.t('duration.hoursMinutes', { h, m })
}

export function parseDurationInput(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const colonMatch = trimmed.match(/^(\d+):(\d{1,2})$/)
  if (colonMatch) {
    const mins = parseInt(colonMatch[2])
    if (mins >= 60) return null
    return parseInt(colonMatch[1]) * 60 + mins
  }

  const hourMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:h|小时)$/i)
  if (hourMatch) {
    return Math.round(parseFloat(hourMatch[1]) * 60)
  }

  const num = parseFloat(trimmed)
  if (!isNaN(num) && num > 0) {
    return Math.round(num)
  }

  return null
}
