/* ─── IELTS — Practice Timer (Stopwatch) ─── */

import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { ACCENT } from './styles'

type TimerState = 'idle' | 'running' | 'paused'

interface PracticeTimerProps {
  onStop: (minutes: number) => void
}

export default memo(function PracticeTimer({ onStop }: PracticeTimerProps) {
  const { t } = useTranslation()
  const [state, setState] = useState<TimerState>('idle')
  const [elapsed, setElapsed] = useState(0) // seconds

  const startRef = useRef(0)
  const pausedElapsedRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef<TimerState>('idle')
  stateRef.current = state

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    const total = pausedElapsedRef.current + Math.floor((Date.now() - startRef.current) / 1000)
    setElapsed(total)
  }, [])

  const start = useCallback(() => {
    startRef.current = Date.now()
    pausedElapsedRef.current = 0
    setElapsed(0)
    setState('running')
  }, [])

  const pause = useCallback(() => {
    clearTimer()
    pausedElapsedRef.current = pausedElapsedRef.current + Math.floor((Date.now() - startRef.current) / 1000)
    setState('paused')
  }, [clearTimer])

  const resume = useCallback(() => {
    startRef.current = Date.now()
    setState('running')
  }, [])

  const stop = useCallback(() => {
    clearTimer()
    // If paused, use only accumulated time; if running, add current segment
    const total = stateRef.current === 'paused'
      ? pausedElapsedRef.current
      : pausedElapsedRef.current + Math.floor((Date.now() - startRef.current) / 1000)
    const minutes = Math.max(1, Math.round(total / 60))
    setState('idle')
    setElapsed(0)
    pausedElapsedRef.current = 0
    onStop(minutes)
  }, [onStop, clearTimer])

  // Use setInterval(1s) instead of requestAnimationFrame to avoid 60fps re-renders
  useEffect(() => {
    if (state === 'running') {
      tick() // immediate update
      intervalRef.current = setInterval(tick, 1000)
    } else {
      clearTimer()
    }
    return clearTimer
  }, [state, tick, clearTimer])

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  if (state === 'idle') {
    return (
      <button
        onClick={start}
        className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-medium
          transition-colors select-none no-press active:scale-[0.97]
          bg-gray-100 dark:bg-gray-700/50 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
          hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
        </svg>
        {t('ielts.timerStart')}
      </button>
    )
  }

  return (
    <div className="panel p-3 flex items-center gap-3">
      <div className="flex-1 flex items-center gap-2">
        <span
          className="inline-block w-2 h-2 rounded-full shrink-0"
          style={{
            backgroundColor: ACCENT,
            animation: state === 'running' ? 'pulse 1.5s infinite' : 'none',
            opacity: state === 'paused' ? 0.4 : 1,
          }}
        />
        <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100 font-mono">
          {mm}:{ss}
        </span>
        <span className="text-xs text-gray-400">{t('ielts.timer')}</span>
      </div>

      <div className="flex gap-1.5">
        {state === 'running' ? (
          <button onClick={pause}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg
              text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/40
              transition-colors select-none no-press"
            title="暂停">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>
        ) : (
          <button onClick={resume}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg
              text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/40
              transition-colors select-none no-press"
            title="继续">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
        <button onClick={stop}
          className="inline-flex items-center justify-center h-9 px-3 rounded-lg text-sm font-medium
            text-white transition-colors select-none no-press active:scale-[0.97] hover:brightness-110"
          style={{ backgroundColor: ACCENT }}>
          {t('ielts.timerStop')}
        </button>
      </div>
    </div>
  )
})
