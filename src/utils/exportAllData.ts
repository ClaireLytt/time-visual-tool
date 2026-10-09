/**
 * Export all module data as a single JSON file download.
 * Prevents data loss when switching devices.
 */
export function exportAllData(allData: Record<string, unknown>) {
  const blob = new Blob(
    [JSON.stringify({ exportedAt: new Date().toISOString(), version: 1, ...allData }, null, 2)],
    { type: 'application/json' },
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `timevisual-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
