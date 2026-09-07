import { useTranslation } from 'react-i18next'
import Header from './Header'
import Container from './Container'
import BottomTabBar from './BottomTabBar'
import DataMigrationDialog from '../auth/DataMigrationDialog'
import Dashboard from '../dashboard/Dashboard'
import FinanceDashboard from '../finance/FinanceDashboard'
import EatingDashboard from '../eating/EatingDashboard'
import DiaryDashboard from '../diary/DiaryDashboard'
import SportDashboard from '../sport/SportDashboard'
import ErrorBoundary from '../common/ErrorBoundary'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { APP_MODE_STORAGE_KEY } from '../../constants'
import type { AppMode } from '../../types'

function validateMode(raw: unknown): AppMode | null {
  return raw === 'time' || raw === 'finance' || raw === 'eating' || raw === 'diary' || raw === 'sport' ? raw : null
}

function AppShell() {
  const { t } = useTranslation()
  const [mode, setMode] = useLocalStorage<AppMode>(APP_MODE_STORAGE_KEY, 'time', validateMode)

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-lg"
      >
        {t('app.skipToContent')}
      </a>
      <Header mode={mode} />
      <ErrorBoundary>
        <Container>
          {mode === 'sport' ? <SportDashboard /> : mode === 'finance' ? <FinanceDashboard /> : mode === 'eating' ? <EatingDashboard /> : mode === 'diary' ? <DiaryDashboard /> : <Dashboard />}
        </Container>
      </ErrorBoundary>
      <BottomTabBar mode={mode} onChangeMode={setMode} />
      <DataMigrationDialog />
    </>
  )
}

export default AppShell
