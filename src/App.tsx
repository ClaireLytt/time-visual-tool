import { useTranslation } from 'react-i18next'
import Header from './components/layout/Header'
import Container from './components/layout/Container'
import Dashboard from './components/dashboard/Dashboard'
import ErrorBoundary from './components/common/ErrorBoundary'

function App() {
  const { t } = useTranslation()
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-lg"
      >
        {t('app.skipToContent')}
      </a>
      <Header />
      <ErrorBoundary>
        <Container>
          <Dashboard />
        </Container>
      </ErrorBoundary>
    </>
  )
}

export default App
