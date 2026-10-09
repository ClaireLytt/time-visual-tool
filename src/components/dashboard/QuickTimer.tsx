import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface QuickTimerProps {
  onComplete: (minutes: number) => void
}

export default function QuickTimer({ onComplete }: QuickTimerProps) {
  const { t } = useTranslation()
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  const handleStart = useCallback(() => {
    startRef.current = Date.now()
    setElapsed(0)
    setRunning(true)
  }, [])

  const handleStop = useCallback(() => {
    setRunning(false)
    const minutes = Math.max(1, Math.round(elapsed / 60))
    onComplete(minutes)
    setElapsed(0)
  }, [elapsed, onComplete])

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  return (
    <div className="panel p-3 flex items-center justify-between mb-4">
      {running ? (
        <>
          <span className="font-mono text-xl tabular-nums text-gray-900 dark:text-gray-100">
            ⏱ {mm}:{ss}
          </span>
          <button onClick={handleStop} className="btn-tactile px-4 bg-px-red text-white">
            ■
          </button>
        </>
      ) : (
        <>
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('timer.idle', '计时器')}</span>
          <button onClick={handleStart} className="btn-tactile px-4 bg-mode-time text-white">
            ▶
          </button>
        </>
      )}
    </div>
  )
}
