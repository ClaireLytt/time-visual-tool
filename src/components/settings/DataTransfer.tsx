import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmDialog from '../common/ConfirmDialog'

interface DataTransferProps<T> {
  data: T
  onImport: (data: T, mode: 'replace' | 'merge') => void
  onExport: (data: T) => void
  readFile: (file: File) => Promise<T>
  getCounts: (data: T) => { entries: number; categories: number }
}

function DataTransfer<T>({ data, onImport, onExport, readFile, getCounts }: DataTransferProps<T>) {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<T | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const imported = await readFile(file)
      setPending(imported)
      setStatus(null)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('dataTransfer.importFailed') })
    }
  }

  const handleImport = (mode: 'replace' | 'merge') => {
    if (pending === null) return
    onImport(pending, mode)
    setPending(null)
    setStatus({ type: 'success', message: mode === 'replace' ? t('dataTransfer.replaceSuccess') : t('dataTransfer.mergeSuccess') })
  }

  const pendingCounts = pending !== null ? getCounts(pending) : { entries: 0, categories: 0 }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">{t('dataTransfer.title')}</h3>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('dataTransfer.exportDesc')}</p>
          <button
            onClick={() => {
              try {
                onExport(data)
              } catch (err) {
                setStatus({ type: 'error', message: err instanceof Error ? err.message : t('dataTransferError.exportFailed') })
              }
            }}
            className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t('dataTransfer.exportButton')}
          </button>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('dataTransfer.importDesc')}</p>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            aria-label={t('dataTransfer.importFileLabel')}
          >
            {t('dataTransfer.importButton')}
          </button>
        </div>

        {status && (
          <p className={`text-xs ${status.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`} role="status">
            {status.message}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={t('dataTransfer.importTitle')}
        message={t('dataTransfer.importMessage', { entries: pendingCounts.entries, categories: pendingCounts.categories })}
        confirmLabel={t('dataTransfer.replaceButton')}
        cancelLabel={t('dataTransfer.mergeButton')}
        confirmVariant="danger"
        onConfirm={() => handleImport('replace')}
        onCancel={() => handleImport('merge')}
      />
    </div>
  )
}

export default DataTransfer
