import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import Header from './Header'
import Container from './Container'
import BottomTabBar from './BottomTabBar'
import DataMigrationDialog from '../auth/DataMigrationDialog'
import ErrorBoundary from '../common/ErrorBoundary'
import OverviewDashboard from '../overview/OverviewDashboard'
import Dashboard from '../dashboard/Dashboard'
import FinanceDashboard from '../finance/FinanceDashboard'
import EatingDashboard from '../eating/EatingDashboard'
import DiaryDashboard from '../diary/DiaryDashboard'
import SportDashboard from '../sport/SportDashboard'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { APP_MODE_STORAGE_KEY } from '../../constants'
import type { AppMode } from '../../types'

function validateMode(raw: unknown): AppMode | null {
  return raw === 'overview' || raw === 'time' || raw === 'finance' || raw === 'eating' || raw === 'diary' || raw === 'sport' ? raw : null
}

function AppShell() {
  const { t } = useTranslation()
  const [mode, setMode] = useLocalStorage<AppMode>(APP_MODE_STORAGE_KEY, 'overview', validateMode)

  const renderDashboard = () => {
    switch (mode) {
      case 'overview': return <OverviewDashboard onNavigate={setMode} />
      case 'time': return <Dashboard />
      case 'finance': return <FinanceDashboard />
      case 'eating': return <EatingDashboard />
      case 'diary': return <DiaryDashboard />
      case 'sport': return <SportDashboard />
    }
  }

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
              {renderDashboard()}
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
