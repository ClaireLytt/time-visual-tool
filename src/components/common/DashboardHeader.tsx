import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ViewModeToggle from '../dashboard/ViewModeToggle'
import AnimatedCollapse from './AnimatedCollapse'
import type { ExtendedViewMode } from '../../types'
import type { ReactNode } from 'react'

interface DashboardHeaderProps<M extends ExtendedViewMode> {
  viewMode: M
  modes: readonly M[]
  onViewModeChange: (mode: M) => void
  settingsContent?: ReactNode
}

function DashboardHeader<M extends ExtendedViewMode>({ viewMode, modes, onViewModeChange, settingsContent }: DashboardHeaderProps<M>) {
  const { t } = useTranslation()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <ViewModeToggle viewMode={viewMode} modes={modes} onViewModeChange={onViewModeChange} />
        {settingsContent && (
          <button
            onClick={() => setShowSettings(s => !s)}
            className={`btn-icon transition-colors ${showSettings ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-pressed' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
            aria-label={t('settings.label')}
            aria-expanded={showSettings}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>

      {settingsContent && (
        <AnimatedCollapse open={showSettings}>
          <div className="space-y-4 mb-4">
            {settingsContent}
          </div>
        </AnimatedCollapse>
      )}
    </>
  )
}

export default DashboardHeader
