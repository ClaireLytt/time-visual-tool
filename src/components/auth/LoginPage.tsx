import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const SAVED_EMAIL_KEY = 'time-visual-saved-email'

function LoginPage() {
  const { t } = useTranslation()
  const { login, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(() => localStorage.getItem(SAVED_EMAIL_KEY) ?? '')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleForgotPassword = async () => {
    if (!email) {
      setError(t('auth.errorInvalidEmail'))
      return
    }
    setError('')
    setResetMsg('')
    try {
      await resetPassword(email)
      setResetMsg(t('auth.resetPasswordSent'))
    } catch {
      setError(t('auth.resetPasswordFailed'))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setResetMsg('')
    setSubmitting(true)
    try {
      await login(email, password)
      if (rememberMe) {
        localStorage.setItem(SAVED_EMAIL_KEY, email)
      } else {
        localStorage.removeItem(SAVED_EMAIL_KEY)
      }
      navigate('/app', { replace: true })
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError(t('auth.errorWrongPassword'))
      } else if (code === 'auth/invalid-email') {
        setError(t('auth.errorInvalidEmail'))
      } else {
        setError(t('auth.errorGeneric'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-calm-bg dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
          {t('auth.login')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-calm-border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-calm-accent focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-calm-border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-calm-accent focus:border-transparent outline-none"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-calm-border text-calm-accent focus:ring-calm-accent"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.rememberMe')}
            </span>
          </label>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {resetMsg && (
            <p className="text-sm text-mode-finance">{resetMsg}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-calm-accent hover:bg-calm-accent-hover disabled:opacity-50 text-white font-medium transition-colors"
          >
            {submitting ? t('auth.loading') : t('auth.loginButton')}
          </button>
        </form>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="mt-3 w-full text-center text-sm text-calm-accent hover:text-calm-accent-hover"
        >
          {t('auth.forgotPassword')}
        </button>
        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-calm-accent hover:text-calm-accent-hover font-medium">
            {t('auth.goToRegister')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
