/* ─── IELTS Review Module — Main Dashboard ─── */

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { viewToParams, paramsToView } from './utils'
import RecordView from './RecordView'
import ImportView from './ImportView'
import StatsView from './StatsView'
import HomeView from './HomeView'
import KnowledgeView from './KnowledgeView'
import WeeklyView from './WeeklyView'
import VocabView from './VocabView'
import { useIeltsShortcuts, ShortcutHelpOverlay } from './KeyboardShortcuts'
import OfflineBanner from './OfflineBanner'
import type { IeltsView } from './types'

const TABS: { kind: IeltsView['kind']; label: string; icon: string }[] = [
  { kind: 'home',      label: '首页', icon: '🏠' },
  { kind: 'record',    label: '记录', icon: '✏️' },
  { kind: 'import',    label: '导入', icon: '📋' },
  { kind: 'knowledge', label: '知识库', icon: '📚' },
  { kind: 'stats',     label: '分析', icon: '📊' },
  { kind: 'weekly',    label: '周报', icon: '📅' },
  { kind: 'vocab',     label: '词汇', icon: '📖' },
]

function IeltsDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const view = useMemo(() => paramsToView(searchParams), [searchParams])
  const { showHelp, setShowHelp } = useIeltsShortcuts()

  const setView = useCallback((v: IeltsView) => {
    setSearchParams(viewToParams(v), { replace: true })
  }, [setSearchParams])

  return (
    <div id="main-content" className="space-y-4">
      <OfflineBanner />
      <ShortcutHelpOverlay open={showHelp} onClose={() => setShowHelp(false)} />
      {/* ── Segmented nav (shadcn segmented-control style) ── */}
      <nav className="flex overflow-x-auto scrollbar-none bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm p-1.5 rounded-full gap-1
        shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-700/50">
        {TABS.map(tab => {
          const active = view.kind === tab.kind
          return (
            <button
              key={tab.kind}
              onClick={() => setView({ kind: tab.kind } as IeltsView)}
              className="relative px-4 h-9 rounded-full text-sm font-medium transition-all duration-150 select-none no-press z-10 shrink-0"
            >
              {active && (
                <motion.div
                  layoutId="ielts-nav"
                  className="absolute inset-0 bg-[#c0392b]/10 dark:bg-[#c0392b]/20 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className={`relative flex items-center gap-1.5 ${
                active ? 'text-[#c0392b] font-semibold' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}>
                <span className="text-xs">{tab.icon}</span>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>

      {view.kind === 'home' && <HomeView />}
      {view.kind === 'record' && <RecordView />}
      {view.kind === 'import' && <ImportView onNavigate={(tab) => setView({ kind: tab as IeltsView['kind'] })} />}
      {view.kind === 'stats' && <StatsView />}
      {view.kind === 'knowledge' && <KnowledgeView />}
      {view.kind === 'weekly' && <WeeklyView />}
      {view.kind === 'vocab' && <VocabView />}
    </div>
  )
}

export default IeltsDashboard
