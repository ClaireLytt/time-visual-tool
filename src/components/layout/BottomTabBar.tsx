import { useTranslation } from 'react-i18next'
import { ClockIcon, WalletIcon, UtensilsIcon, BookIcon } from '../icons'
import type { AppMode } from '../../types'

interface BottomTabBarProps {
  mode: AppMode
  onChangeMode: (mode: AppMode) => void
}

const TABS: { mode: AppMode; icon: typeof ClockIcon; labelKey: string; activeColor: string }[] = [
  { mode: 'time', icon: ClockIcon, labelKey: 'mode.time', activeColor: 'text-blue-500' },
  { mode: 'finance', icon: WalletIcon, labelKey: 'mode.finance', activeColor: 'text-green-500' },
  { mode: 'eating', icon: UtensilsIcon, labelKey: 'mode.eating', activeColor: 'text-amber-500' },
  { mode: 'diary', icon: BookIcon, labelKey: 'mode.diary', activeColor: 'text-purple-500' },
]

function BottomTabBar({ mode, onChangeMode }: BottomTabBarProps) {
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-5xl mx-auto flex">
        {TABS.map(tab => {
          const isActive = mode === tab.mode
          const Icon = tab.icon
          return (
            <button
              key={tab.mode}
              onClick={() => onChangeMode(tab.mode)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${isActive ? tab.activeColor : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
              aria-label={t(tab.labelKey)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{t(tab.labelKey)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomTabBar
