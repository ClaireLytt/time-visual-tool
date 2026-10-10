import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useTimeEntries } from '../../hooks/useTimeEntries'

type TimerMode = 'free' | 'pomodoro'
type PomodoroPhase = 'work' | 'break'

const POMODORO_WORK_SECONDS = 25 * 60
const POMODORO_BREAK_SECONDS = 5 * 60

interface QuickTimerProps {
  onComplete: (minutes: number) => void
}

export default function QuickTimer({ onComplete }: QuickTimerProps) {
  const { t } = useTranslation()
  const { categories, addEntry } = useTimeEntries()

  const [showTimer, setShowTimer] = useState(false)
  const [timerMode, setTimerMode] = useState<TimerMode>('free')
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>('work')
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name ?? '')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [savedMinutes, setSavedMinutes] = useState(0)

  const startRef = useRef<number>(0)
  const pausedElapsedRef = useRef<number>(0)

  const resolvedCategory = selectedCategory || (categories.length > 0 ? categories[0].name : '')

  useEffect(() => {
    if (!running || paused) return
    const id = setInterval(() => {
      const now = Math.floor((Date.now() - startRef.current) / 1000) + pausedElapsedRef.current
      setElapsed(now)
      if (timerMode === 'pomodoro') {
        const limit = pomodoroPhase === 'work' ? POMODORO_WORK_SECONDS : POMODORO_BREAK_SECONDS
        if (now >= limit) {
          clearInterval(id)
          setRunning(false)
          setPaused(false)
          if (pomodoroPhase === 'work') {
            setPomodoroPhase('break')
            setSavedMinutes(Math.round(limit / 60))
            setShowSaveForm(true)
          } else {
            setPomodoroPhase('work')
            setElapsed(0)
            pausedElapsedRef.current = 0
          }
        }
      }
    }, 1000)
    return () => clearInterval(id)
  }, [running, paused, timerMode, pomodoroPhase])

  const handleStart = useCallback(() => {
    startRef.current = Date.now()
    pausedElapsedRef.current = 0
    setElapsed(0)
    setRunning(true)
    setPaused(false)
    setShowSaveForm(false)
    if (timerMode === 'pomodoro') setPomodoroPhase('work')
  }, [timerMode])

  const handlePause = useCallback(() => {
    if (paused) {
      startRef.current = Date.now()
      pausedElapsedRef.current = elapsed
      setPaused(false)
    } else {
      pausedElapsedRef.current = elapsed
      setPaused(true)
    }
  }, [paused, elapsed])

  const handleStop = useCallback(() => {
    setRunning(false)
    setPaused(false)
    const minutes = Math.max(1, Math.round(elapsed / 60))
    setSavedMinutes(minutes)
    setShowSaveForm(true)
    onComplete(minutes)
  }, [elapsed, onComplete])

  const handleSaveEntry = useCallback(() => {
    addEntry({
      date: format(new Date(), 'yyyy-MM-dd'),
      activity: timerMode === 'pomodoro' ? t('timer.pomoActivity') : t('timer.entryActivity'),
      duration: savedMinutes,
      weight: 1,
      category: resolvedCategory || categories[0]?.name || '',
    })
    setShowSaveForm(false)
    setElapsed(0)
    pausedElapsedRef.current = 0
  }, [addEntry, savedMinutes, resolvedCategory, categories, t, timerMode])

  const handleStartBreak = useCallback(() => {
    setShowSaveForm(false)
    setPomodoroPhase('break')
    startRef.current = Date.now()
    pausedElapsedRef.current = 0
    setElapsed(0)
    setRunning(true)
    setPaused(false)
  }, [])

  const handleDismissSave = useCallback(() => {
    setShowSaveForm(false)
    setElapsed(0)
    pausedElapsedRef.current = 0
  }, [])

  const displaySeconds = timerMode === 'pomodoro' && running
    ? Math.max(0, (pomodoroPhase === 'work' ? POMODORO_WORK_SECONDS : POMODORO_BREAK_SECONDS) - elapsed)
    : elapsed
  const mm = String(Math.floor(displaySeconds / 60)).padStart(2, '0')
  const ss = String(displaySeconds % 60).padStart(2, '0')

  const isActive = running || paused || showSaveForm

  return (
    <>
      {showTimer && (
        <div className="panel p-4 mb-4">
          <div className="flex items-center justify-center gap-1 mb-3">
            <div className="inline-flex bg-gray-100 dark:bg-gray-700/60 rounded-full p-0.5 text-xs">
              <button type="button" onClick={() => { if (!isActive) setTimerMode('free') }} className={`px-3 py-1 rounded-full transition-colors ${timerMode === 'free' ? 'bg-mode-time text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`} disabled={isActive}>{t('timer.freeMode')}</button>
              <button type="button" onClick={() => { if (!isActive) setTimerMode('pomodoro') }} className={`px-3 py-1 rounded-full transition-colors ${timerMode === 'pomodoro' ? 'bg-mode-time text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`} disabled={isActive}>{t('timer.pomodoroMode')}</button>
            </div>
          </div>
          {timerMode === 'pomodoro' && (running || paused) && (
            <div className="text-center mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pomodoroPhase === 'work' ? 'bg-mode-time/15 text-mode-time' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                {pomodoroPhase === 'work' ? t('timer.pomodoroMode') : t('timer.breakTime')}
              </span>
            </div>
          )}
          <div className="text-center mb-3">
            <span className="font-mono text-4xl tabular-nums text-gray-900 dark:text-gray-100 tracking-wider">{mm}:{ss}</span>
          </div>
          {showSaveForm && timerMode === 'pomodoro' && pomodoroPhase === 'break' && (
            <div className="text-center mb-3">
              <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">{t('timer.breakTime')}</p>
            </div>
          )}
          <div className="flex items-center justify-center gap-3">
            {!running && !paused && !showSaveForm && (
              <button type="button" onClick={handleStart} className="w-12 h-12 rounded-full bg-mode-time text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity" aria-label={t('timer.start')}>
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </button>
            )}
            {(running || paused) && (
              <>
                <button type="button" onClick={handlePause} className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center shadow-md hover:opacity-90 transition-opacity" aria-label={paused ? t('timer.resume') : t('timer.pause')}>
                  {paused ? (<svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>) : (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>)}
                </button>
                <button type="button" onClick={handleStop} className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity" aria-label={t('timer.stop')}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
                </button>
              </>
            )}
          </div>
          {showSaveForm && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{t('timer.saveEntry')} — {savedMinutes} min</p>
              <div className="mb-3">
                <select value={resolvedCategory} onChange={e => setSelectedCategory(e.target.value)} className="input-base text-sm" aria-label={t('entry.categoryLabel')}>
                  {categories.map(cat => (<option key={cat.name} value={cat.name}>{t('category.names.' + cat.name, cat.name)}</option>))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleSaveEntry} className="flex-1 py-2 bg-mode-time text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">{t('timer.saveEntry')}</button>
                {timerMode === 'pomodoro' && pomodoroPhase === 'break' && (
                  <button type="button" onClick={handleStartBreak} className="flex-1 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">{t('timer.breakStart')}</button>
                )}
                <button type="button" onClick={handleDismissSave} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{t('timer.discard')}</button>
              </div>
            </div>
          )}
        </div>
      )}
      <button type="button" onClick={() => setShowTimer(s => !s)} className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${isActive ? 'bg-red-500 text-white animate-pulse' : 'bg-mode-time text-white hover:opacity-90'}`} aria-label={t('timer.start')}>
        {isActive ? (<span className="font-mono text-xs tabular-nums">{mm}:{ss}</span>) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 2h6" strokeLinecap="round" /></svg>
        )}
      </button>
    </>
  )
}
