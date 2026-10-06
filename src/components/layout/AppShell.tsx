import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import Header from './Header'
import Container from './Container'
import BottomTabBar from './BottomTabBar'
import DataMigrationDialog from '../auth/DataMigrationDialog'
import ErrorBoundary from '../common/ErrorBoundary'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { APP_MODE_STORAGE_KEY } from '../../constants'
import type { AppMode } from '../../types'

const Dashboard = lazy(() => import('../dashboard/Dashboard'))
const FinanceDashboard = lazy(() => import('../finance/FinanceDashboard'))
const EatingDashboard = lazy(() => import('../eating/EatingDashboard'))
const DiaryDashboard = lazy(() => import('../diary/DiaryDashboard'))
const SportDashboard = lazy(() => import('../sport/SportDashboard'))

function validateMode(raw: unknown): AppMode | null {
  return raw === 'time' || raw === 'finance' || raw === 'eating' || raw === 'diary' || raw === 'sport' ? raw : null
}

const modeComponent: Record<AppMode, React.LazyExoticComponent<() => JSX.Element>> = {
  time: Dashboard,
  finance: FinanceDashboard,
  eating: EatingDashboard,
  diary: DiaryDashboard,
  sport: SportDashboard,
}

/**
 * Mode switch animation.
 * Gate: a few times/day → occasional. Purpose: preventing jarring change.
 * Tool: motion AnimatePresence mode="wait" — needs exit before enter.
 * Budget: 120ms exit + 180ms enter = 300ms total. Opacity only — no slide (tabs have no direction).
 * Reduced-motion: instant swap.
 */
function AppShell() {
  const { t } = useTranslation()
  const [mode, setMode] = useLocalStorage<AppMode>(APP_MODE_STORAGE_KEY, 'time', validateMode)
  const ActiveDashboard = modeComponent[mode]

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-calm-accent focus:text-white focus:rounded-lg"
      >
        {t('app.skipToContent')}
      </a>
      <Header mode={mode} />
      <ErrorBoundary>
        <Container>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            >
              <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-calm-accent border-t-transparent rounded-full animate-spin" /></div>}>
                <ActiveDashboard />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </Container>
      </ErrorBoundary>
      <BottomTabBar mode={mode} onChangeMode={setMode} />
      <DataMigrationDialog />
    </>
  )
}

export default AppShell
