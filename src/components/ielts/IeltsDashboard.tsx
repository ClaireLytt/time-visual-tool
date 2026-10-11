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

  const setView = useCallback((v: IeltsView) => {
    setSearchParams(viewToParams(v), { replace: true })
  }, [setSearchParams])

  return (
    <div id="main-content" className="space-y-4">
      {/* ── Segmented nav (shadcn segmented-control style) ── */}
      <nav className="inline-flex bg-gray-100/80 dark:bg-gray-800/60 p-1 rounded-lg gap-0.5">
        {TABS.map(tab => {
          const active = view.kind === tab.kind
          return (
            <button
              key={tab.kind}
              onClick={() => setView({ kind: tab.kind } as IeltsView)}
              className="relative px-4 h-9 rounded-md text-sm font-medium transition-colors select-none no-press z-10"
            >
              {active && (
                <motion.div
                  layoutId="ielts-nav"
                  className="absolute inset-0 bg-white dark:bg-gray-700 rounded-md shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className={`relative flex items-center gap-1.5 ${
                active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
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
