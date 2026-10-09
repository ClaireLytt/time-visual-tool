import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { HomeIcon, ClockIcon, WalletIcon, UtensilsIcon, BookIcon, DumbbellIcon, CheckSquareIcon, ListTodoIcon, StudyIcon, WorkIcon, PodcastIcon } from '../icons'
import type { AppMode } from '../../types'

interface BottomTabBarProps {
  mode: AppMode
  onChangeMode: (mode: AppMode) => void
}

const TABS: { mode: AppMode; icon: typeof ClockIcon; labelKey: string; color: string }[] = [
  { mode: 'overview', icon: HomeIcon, labelKey: 'mode.overview', color: '#f4b41a' },
  { mode: 'time', icon: ClockIcon, labelKey: 'mode.time', color: '#0099db' },
  { mode: 'finance', icon: WalletIcon, labelKey: 'mode.finance', color: '#3e8948' },
  { mode: 'eating', icon: UtensilsIcon, labelKey: 'mode.eating', color: '#f77622' },
  { mode: 'diary', icon: BookIcon, labelKey: 'mode.diary', color: '#8b5cf6' },
  { mode: 'sport', icon: DumbbellIcon, labelKey: 'mode.sport', color: '#2ce8f5' },
  { mode: 'habit', icon: CheckSquareIcon, labelKey: 'mode.habit', color: '#e8a838' },
  { mode: 'todo', icon: ListTodoIcon, labelKey: 'mode.todo', color: '#5b8def' },
  { mode: 'study', icon: StudyIcon, labelKey: 'mode.study', color: '#4a90d9' },
  { mode: 'work', icon: WorkIcon, labelKey: 'mode.work', color: '#e67e22' },
  { mode: 'podcast', icon: PodcastIcon, labelKey: 'mode.podcast', color: '#c2417a' },
]

function BottomTabBar({ mode, onChangeMode }: BottomTabBarProps) {
  const { t } = useTranslation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] bg-[#f4f1ea]/90 dark:bg-[#1a1c2c]/90 backdrop-blur-xl backdrop-saturate-[1.8]"
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
              className="no-press flex-1 flex flex-col items-center gap-0.5 py-2 relative transition-colors"
              style={{ color: isActive ? tab.color : '#8a8a8a' }}
              aria-label={t(tab.labelKey)}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator — soft colored bar */}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 left-3 right-3 h-[2px] rounded-full"
                  style={{ backgroundColor: tab.color, boxShadow: `0 0 6px ${tab.color}40` }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{t(tab.labelKey)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomTabBar
