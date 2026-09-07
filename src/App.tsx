import { useTranslation } from 'react-i18next'
import Header from './components/layout/Header'
import Container from './components/layout/Container'
import BottomTabBar from './components/layout/BottomTabBar'
import Dashboard from './components/dashboard/Dashboard'
import FinanceDashboard from './components/finance/FinanceDashboard'
import EatingDashboard from './components/eating/EatingDashboard'
import ErrorBoundary from './components/common/ErrorBoundary'
import { useLocalStorage } from './hooks/useLocalStorage'
import { APP_MODE_STORAGE_KEY } from './constants'
import type { AppMode } from './types'

function validateMode(raw: unknown): AppMode | null {
  return raw === 'time' || raw === 'finance' || raw === 'eating' ? raw : null
}

function App() {
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
          {mode === 'finance' ? <FinanceDashboard /> : mode === 'eating' ? <EatingDashboard /> : <Dashboard />}
        </Container>
      </ErrorBoundary>
      <BottomTabBar mode={mode} onChangeMode={setMode} />
    </>
  )
}

export default App
