export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}分钟`
  if (m === 0) return `${h}小时`
  return `${h}小时${m}分钟`
}

export function parseDurationInput(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // "1:30" format
  const colonMatch = trimmed.match(/^(\d+):(\d{1,2})$/)
  if (colonMatch) {
    const mins = parseInt(colonMatch[2])
    if (mins >= 60) return null
    return parseInt(colonMatch[1]) * 60 + mins
  }

  // "1.5h" or "1.5小时" format
  const hourMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:h|小时)$/i)
  if (hourMatch) {
    return Math.round(parseFloat(hourMatch[1]) * 60)
  }

  // plain number = minutes
  const num = parseFloat(trimmed)
  if (!isNaN(num) && num > 0) {
    return Math.round(num)
  }

  return null
}
