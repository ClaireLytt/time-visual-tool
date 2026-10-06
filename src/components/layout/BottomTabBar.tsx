import { useTranslation } from 'react-i18next'
import { ClockIcon, WalletIcon, UtensilsIcon, BookIcon, DumbbellIcon } from '../icons'
import type { AppMode } from '../../types'

interface BottomTabBarProps {
  mode: AppMode
  onChangeMode: (mode: AppMode) => void
}

const TABS: { mode: AppMode; icon: typeof ClockIcon; labelKey: string; activeColor: string }[] = [
  { mode: 'time', icon: ClockIcon, labelKey: 'mode.time', activeColor: 'text-mode-time' },
  { mode: 'finance', icon: WalletIcon, labelKey: 'mode.finance', activeColor: 'text-mode-finance' },
  { mode: 'eating', icon: UtensilsIcon, labelKey: 'mode.eating', activeColor: 'text-mode-eating' },
  { mode: 'diary', icon: BookIcon, labelKey: 'mode.diary', activeColor: 'text-mode-diary' },
  { mode: 'sport', icon: DumbbellIcon, labelKey: 'mode.sport', activeColor: 'text-mode-sport' },
]

function BottomTabBar({ mode, onChangeMode }: BottomTabBarProps) {
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl backdrop-saturate-150 shadow-[0_-1px_12px_rgba(0,0,0,0.04)] z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-5xl mx-auto flex">
        {TABS.map(tab => {
          const isActive = mode === tab.mode
          const Icon = tab.icon
          return (
            <button
              key={tab.mode}
              onClick={() => onChangeMode(tab.mode)}
              className={`no-press flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${isActive ? tab.activeColor : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
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
