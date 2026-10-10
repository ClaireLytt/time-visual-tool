import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useAuth } from '../../contexts/AuthContext'
import { HomeIcon, ClockIcon, WalletIcon, UtensilsIcon, BookIcon, DumbbellIcon, CheckSquareIcon, ListTodoIcon, StudyIcon, WorkIcon, PodcastIcon } from '../icons'
import { MODE_ACCENT } from '../../constants/modes'
import ProfileDrawer from './ProfileDrawer'
import type { AppMode } from '../../types'

interface HeaderProps {
  mode: AppMode
  onBack: () => void
}

const MODE_CONFIG: Record<AppMode, { icon: typeof ClockIcon; colorClass: string; titleKey: string }> = {
  overview: { icon: HomeIcon,        colorClass: 'text-calm-accent', titleKey: 'overviewApp.title' },
  time:     { icon: ClockIcon,       colorClass: 'text-mode-time',    titleKey: 'app.title' },
  finance:  { icon: WalletIcon,      colorClass: 'text-mode-finance', titleKey: 'financeApp.title' },
  eating:   { icon: UtensilsIcon,    colorClass: 'text-mode-eating',  titleKey: 'eatingApp.title' },
  diary:    { icon: BookIcon,        colorClass: 'text-mode-diary',   titleKey: 'diaryApp.title' },
  sport:    { icon: DumbbellIcon,    colorClass: 'text-mode-sport',   titleKey: 'sportApp.title' },
  habit:    { icon: CheckSquareIcon, colorClass: 'text-mode-habit',   titleKey: 'habitApp.title' },
  todo:     { icon: ListTodoIcon,    colorClass: 'text-mode-todo',    titleKey: 'todoApp.title' },
  study:    { icon: StudyIcon,       colorClass: 'text-mode-study',   titleKey: 'studyApp.title' },
  work:     { icon: WorkIcon,        colorClass: 'text-mode-work',    titleKey: 'workApp.title' },
  podcast:  { icon: PodcastIcon,     colorClass: 'text-mode-podcast', titleKey: 'podcastApp.title' },
}

function AvatarButton({ size = 32, onClick }: { size?: number; onClick: () => void }) {
  const { user } = useAuth()
  const initial = user?.email?.charAt(0).toUpperCase() ?? '?'
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className="rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label="Profile"
    >
      {initial}
    </motion.button>
  )
}

function Header({ mode, onBack }: HeaderProps) {
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isOverview = mode === 'overview'
  const cfg = MODE_CONFIG[mode]
  const Icon = cfg.icon
  const accent = MODE_ACCENT[mode]

  return (
    <>
      <header
        className="bg-[#f4f1ea]/80 dark:bg-[#262b44]/80 backdrop-blur-xl backdrop-saturate-150 pt-[env(safe-area-inset-top)] sticky top-0 z-40"
        style={{
          borderBottom: `2px solid ${accent}4d`,
          transition: 'border-color 400ms ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          {isOverview ? (
            /* ── Overview mode: avatar + title ── */
            <>
              <AvatarButton size={36} onClick={() => setDrawerOpen(true)} />
              <h1 className="flex-1 text-xl font-bold tracking-display text-gray-900 dark:text-gray-100">
                TimeVisual
              </h1>
            </>
          ) : (
            /* ── Module mode: back + icon + title + avatar ── */
            <>
              <motion.button
                onClick={onBack}
                whileTap={{ scale: 0.88 }}
                className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label={t('overview.title')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </motion.button>
              <Icon className={`w-6 h-6 ${cfg.colorClass} shrink-0`} />
              <h1 className="flex-1 text-lg font-bold tracking-display text-gray-900 dark:text-gray-100 truncate">
                {t(cfg.titleKey)}
              </h1>
              <AvatarButton size={30} onClick={() => setDrawerOpen(true)} />
            </>
          )}
        </div>
      </header>

      <ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}

export default Header
