import Header from './components/layout/Header'
import Container from './components/layout/Container'
import Dashboard from './components/dashboard/Dashboard'
import ErrorBoundary from './components/common/ErrorBoundary'

function App() {
  return (
    <>
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
