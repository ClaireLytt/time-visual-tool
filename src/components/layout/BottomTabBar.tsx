import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { HomeIcon, ClockIcon, WalletIcon, UtensilsIcon, BookIcon, DumbbellIcon } from '../icons'
import type { AppMode } from '../../types'

interface BottomTabBarProps {
  mode: AppMode
  onChangeMode: (mode: AppMode) => void
}

const TABS: { mode: AppMode; icon: typeof ClockIcon; labelKey: string; activeColor: string; dotColor: string }[] = [
  { mode: 'overview', icon: HomeIcon, labelKey: 'mode.overview', activeColor: 'text-calm-accent', dotColor: '#6b8db5' },
  { mode: 'time', icon: ClockIcon, labelKey: 'mode.time', activeColor: 'text-mode-time', dotColor: '#6b8db5' },
  { mode: 'finance', icon: WalletIcon, labelKey: 'mode.finance', activeColor: 'text-mode-finance', dotColor: '#7aab8e' },
  { mode: 'eating', icon: UtensilsIcon, labelKey: 'mode.eating', activeColor: 'text-mode-eating', dotColor: '#c4a36b' },
  { mode: 'diary', icon: BookIcon, labelKey: 'mode.diary', activeColor: 'text-mode-diary', dotColor: '#9b8db5' },
  { mode: 'sport', icon: DumbbellIcon, labelKey: 'mode.sport', activeColor: 'text-mode-sport', dotColor: '#6ba5a0' },
]

function BottomTabBar({ mode, onChangeMode }: BottomTabBarProps) {
  const { t } = useTranslation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl backdrop-saturate-[1.8]"
      style={{
        boxShadow: '0 -1px 0 rgba(0,0,0,0.06), 0 -4px 12px rgba(0,0,0,0.03)',
      }}
    >
      <div className="max-w-5xl mx-auto flex">
        {TABS.map(tab => {
          const isActive = mode === tab.mode
          const Icon = tab.icon
          return (
            <button
              key={tab.mode}
              onClick={() => onChangeMode(tab.mode)}
              className={`no-press flex-1 flex flex-col items-center gap-0.5 py-2 transition-all ${isActive ? tab.activeColor : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
              aria-label={t(tab.labelKey)}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>{t(tab.labelKey)}</span>
              {isActive && (
                <motion.div
                  layoutId="tab-dot"
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: tab.dotColor, boxShadow: `0 0 4px ${tab.dotColor}60` }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomTabBar
