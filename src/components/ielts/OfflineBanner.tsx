/* ─── Offline status banner ─── */

import { useState, useEffect } from 'react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="sticky top-0 z-30 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800
      px-4 py-2 text-center text-xs font-medium text-amber-700 dark:text-amber-300">
      📡 离线中 · 数据已本地缓存，联网后自动同步
    </div>
  )
}
