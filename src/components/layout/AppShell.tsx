import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import Header from './Header'
import Container from './Container'
import DataMigrationDialog from '../auth/DataMigrationDialog'
import ErrorBoundary from '../common/ErrorBoundary'
import OverviewDashboard from '../overview/OverviewDashboard'
import Dashboard from '../dashboard/Dashboard'
import FinanceDashboard from '../finance/FinanceDashboard'
import EatingDashboard from '../eating/EatingDashboard'
import DiaryDashboard from '../diary/DiaryDashboard'
import SportDashboard from '../sport/SportDashboard'
import HabitDashboard from '../habit/HabitDashboard'
import TodoDashboard from '../todo/TodoDashboard'
import StudyDashboard from '../study/StudyDashboard'
import WorkDashboard from '../work/WorkDashboard'
import PodcastDashboard from '../podcast/PodcastDashboard'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useTimeEntries } from '../../hooks/useTimeEntries'
import { useFinanceEntries } from '../../hooks/useFinanceEntries'
import { useEatingEntries } from '../../hooks/useEatingEntries'
import { useDiaryEntries } from '../../hooks/useDiaryEntries'
import { useSportEntries } from '../../hooks/useSportEntries'
import { useHabitEntries } from '../../hooks/useHabitEntries'
import { useTodoEntries } from '../../hooks/useTodoEntries'
import { useStudyEntries } from '../../hooks/useStudyEntries'
import { useWorkEntries } from '../../hooks/useWorkEntries'
import { APP_MODE_STORAGE_KEY } from '../../constants'
import { ALL_MODES } from '../../constants/modes'
import type { AppMode } from '../../types'

const MODE_COLORS: Record<AppMode, { light: string; dark: string }> = {
  overview: { light: '#e8e4d9', dark: '#1a1c2c' },
  time:     { light: '#dde6f0', dark: '#141828' },
  finance:  { light: '#dde8df', dark: '#142018' },
  eating:   { light: '#f0e4d4', dark: '#281c14' },
  diary:    { light: '#e4ddf0', dark: '#1e1428' },
  sport:    { light: '#d4eef0', dark: '#142028' },
  habit:    { light: '#f0e6d0', dark: '#28201a' },
  todo:     { light: '#dce4f4', dark: '#141c2a' },
  study:    { light: '#dce4f4', dark: '#141c2a' },
  work:     { light: '#f4e6d0', dark: '#281e14' },
  podcast:  { light: '#f2dde6', dark: '#28141e' },
}

function validateMode(raw: unknown): AppMode | null {
  return ALL_MODES.includes(raw as AppMode) ? (raw as AppMode) : null
}

function AppShell() {
  const { t } = useTranslation()
  const [mode, setMode] = useLocalStorage<AppMode>(APP_MODE_STORAGE_KEY, 'overview', validateMode)

  // Preload all module data so tab switches never show a spinner
  useTimeEntries()
  useFinanceEntries()
  useEatingEntries()
  useDiaryEntries()
  useSportEntries()
  useHabitEntries()
  useTodoEntries()
  useStudyEntries()
  useWorkEntries()
  // podcast: no Firestore data to preload (served by the local API server)

  // Mode-tinted immersion background
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    const colors = MODE_COLORS[mode]
    document.body.style.setProperty('--mode-bg', isDark ? colors.dark : colors.light)

    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains('dark')
      document.body.style.setProperty('--mode-bg', dark ? colors.dark : colors.light)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [mode])

  const renderDashboard = () => {
    switch (mode) {
      case 'overview': return <OverviewDashboard onNavigate={setMode} />
      case 'time': return <Dashboard />
      case 'finance': return <FinanceDashboard />
      case 'eating': return <EatingDashboard />
      case 'diary': return <DiaryDashboard />
      case 'sport': return <SportDashboard />
      case 'habit': return <HabitDashboard />
      case 'todo': return <TodoDashboard />
      case 'study': return <StudyDashboard />
      case 'work': return <WorkDashboard />
      case 'podcast': return <PodcastDashboard />
      default: {
        const _exhaustive: never = mode
        console.warn(`Unhandled mode: ${_exhaustive}`)
        return null
      }
    }
  }

  return (
    <>
      {/* Pixel art ambient decoration */}
      {/* Subtle pixel sparkle decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-15 dark:opacity-30 scene-stars" />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-calm-accent focus:text-white focus:rounded-lg"
      >
        {t('app.skipToContent')}
      </a>
      <Header mode={mode} onBack={() => setMode('overview')} />
      <ErrorBoundary>
        <Container>
          <AnimatePresence initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, position: 'absolute' as const, inset: 0 }}
              transition={{ duration: 0.1, ease: [0.23, 1, 0.32, 1] }}
              className="relative z-10"
            >
              {renderDashboard()}
            </motion.div>
          </AnimatePresence>
        </Container>
      </ErrorBoundary>
      <DataMigrationDialog />
    </>
  )
}

export default AppShell
