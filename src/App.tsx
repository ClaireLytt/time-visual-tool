import { useTranslation } from 'react-i18next'
import Header from './components/layout/Header'
import Container from './components/layout/Container'
import Dashboard from './components/dashboard/Dashboard'
import FinanceDashboard from './components/finance/FinanceDashboard'
import ErrorBoundary from './components/common/ErrorBoundary'
import { useLocalStorage } from './hooks/useLocalStorage'
import { APP_MODE_STORAGE_KEY } from './constants/finance'
import type { AppMode } from './types/finance'

function validateMode(raw: unknown): AppMode | null {
  return raw === 'time' || raw === 'finance' ? raw : null
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
      <Header mode={mode} onToggleMode={() => setMode(prev => prev === 'time' ? 'finance' : 'time')} />
      <ErrorBoundary>
        <Container>
          {mode === 'finance' ? <FinanceDashboard /> : <Dashboard />}
        </Container>
      </ErrorBoundary>
    </>
  )
}

export default App
