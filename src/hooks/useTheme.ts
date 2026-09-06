import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'time-visual-theme'

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyDark(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return (saved === 'light' || saved === 'dark' || saved === 'system') ? saved : 'system'
  })

  const isDark = theme === 'dark' || (theme === 'system' && getSystemDark())

  useEffect(() => {
    applyDark(isDark)
  }, [isDark])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyDark(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem(STORAGE_KEY, t)
  }, [])

  const cycleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')
  }, [theme, setTheme])

  return { theme, setTheme, isDark, cycleTheme }
}
