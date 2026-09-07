import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { hasLocalData, migrateLocalStorageToFirestore, markMigrationDone } from '../../utils/migrateLocalData'

function DataMigrationDialog() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const shouldShow = useMemo(() => !!(user && hasLocalData()), [user])
  const [dismissed, setDismissed] = useState(false)
  const [migrating, setMigrating] = useState(false)

  const show = shouldShow && !dismissed

  if (!show || !user) return null

  const handleMigrate = async () => {
    setMigrating(true)
    try {
      await migrateLocalStorageToFirestore(user.uid)
      setDismissed(true)
    } catch {
      setMigrating(false)
    }
  }

  const handleSkip = () => {
    markMigrationDone()
    setDismissed(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <p className="text-gray-900 dark:text-gray-100 mb-4">
          {t('auth.migratePrompt')}
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            disabled={migrating}
            className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {t('auth.migrateSkip')}
          </button>
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50"
          >
            {migrating ? t('auth.loading') : t('auth.migrateButton')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataMigrationDialog
