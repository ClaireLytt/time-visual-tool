import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('auth.errorPasswordMismatch'))
      return
    }

    setSubmitting(true)
    try {
      await register(email, password)
      navigate('/app', { replace: true })
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'auth/email-already-in-use') {
        setError(t('auth.errorEmailInUse'))
      } else if (code === 'auth/invalid-email') {
        setError(t('auth.errorInvalidEmail'))
      } else if (code === 'auth/weak-password') {
        setError(t('auth.errorWeakPassword'))
      } else {
        setError(t('auth.errorGeneric'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
          {t('auth.register')}
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
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('auth.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium transition-colors"
          >
            {submitting ? t('auth.loading') : t('auth.registerButton')}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium">
            {t('auth.goToLogin')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
