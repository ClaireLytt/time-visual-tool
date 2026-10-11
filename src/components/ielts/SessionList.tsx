/* ─── IELTS — Session List with Inline Mistakes ─── */

import { useState, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmDialog from '../common/ConfirmDialog'
import AnimatedCollapse from '../common/AnimatedCollapse'
import MistakeForm from './MistakeForm'
import { SUBJECT_COLORS } from './constants'
import type { IeltsSubject, IeltsSession, IeltsMistake } from './types'

interface SessionListProps {
  sessions: IeltsSession[]
  mistakes: IeltsMistake[]
  date: string
  onDeleteSession: (id: string) => void
  onAddMistake: (mistake: IeltsMistake) => void
}

export default function SessionList({ sessions, mistakes, date, onDeleteSession, onAddMistake }: SessionListProps) {
  const { t } = useTranslation()

  // Hooks must be called unconditionally (before any early return)
  const sorted = useMemo(
    () => [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [sessions],
  )

  if (sessions.length === 0) {
    return (
      <div className="panel p-8 text-center space-y-2">
        <p className="text-2xl">📝</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('ielts.emptyToday')}</p>
        <p className="text-xs text-gray-400">点击上方「+ 记录练习」开始记录</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))' }}>
      {sorted.map(session => (
        <SessionItem
          key={session.id}
          session={session}
          mistakes={mistakes.filter(m => m.sessionId === session.id)}
          date={date}
          onDelete={() => onDeleteSession(session.id)}
          onAddMistake={onAddMistake}
        />
      ))}
    </div>
  )
}

const SessionItem = memo(function SessionItem({
  session,
  mistakes,
  date,
  onDelete,
  onAddMistake,
}: {
  session: IeltsSession
  mistakes: IeltsMistake[]
  date: string
  onDelete: () => void
  onAddMistake: (m: IeltsMistake) => void
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [showMistakeForm, setShowMistakeForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const color = SUBJECT_COLORS[session.subject as IeltsSubject] ?? '#888'

  return (
    <div className="panel overflow-hidden">
      {/* Session header */}
      <div className="p-3 flex items-start gap-2">
        {/* Subject badge */}
        <span
          className="px-1.5 py-0.5 rounded text-[11px] font-bold text-white shrink-0 mt-0.5"
          style={{ backgroundColor: color }}
        >
          {t(`ielts.${session.subject}`)}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{session.source}</span>
            {session.score && (
              <span className="text-sm font-bold tabular-nums" style={{ color }}>{session.score}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400 tabular-nums">{session.minutes}min</span>
            {mistakes.length > 0 && (
              <span className="text-xs text-[#c0392b] font-medium">{mistakes.length} 错题</span>
            )}
            {session.note && (
              <span className="text-xs text-gray-400 truncate">{session.note}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => setShowMistakeForm(!showMistakeForm)}
            className="inline-flex items-center justify-center h-8 px-2.5 rounded-md text-xs font-medium
              text-gray-400 hover:text-[#c0392b] hover:bg-gray-100 dark:hover:bg-gray-700/40
              transition-colors select-none no-press"
            title={t('ielts.addMistake')}
          >
            +错题
          </button>
          {mistakes.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-xs
                text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/40
                transition-colors select-none no-press"
            >
              {expanded ? '▲' : '▼'}
            </button>
          )}
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md
              text-gray-300 hover:text-[#c0392b] hover:bg-gray-100 dark:hover:bg-gray-700/40
              transition-colors select-none no-press"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded mistakes */}
      <AnimatedCollapse open={expanded && mistakes.length > 0}>
        <div className="px-3 pb-2 space-y-1.5 border-t border-gray-100 dark:border-gray-700/50 pt-2">
          {mistakes.map(m => (
            <div key={m.id} className="flex items-start gap-2 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-[#c0392b]/10 text-[#c0392b] font-medium shrink-0">{m.tag}</span>
              <div className="flex-1 min-w-0">
                {m.questionNo && <span className="text-gray-400 mr-1">{m.questionNo}</span>}
                {m.myAnswer && m.correctAnswer && (
                  <span className="text-gray-500">
                    <span className="line-through text-gray-400">{m.myAnswer}</span>
                    {' → '}
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{m.correctAnswer}</span>
                  </span>
                )}
                {m.explanation && <p className="text-gray-400 mt-0.5">{m.explanation}</p>}
              </div>
            </div>
          ))}
        </div>
      </AnimatedCollapse>

      {/* Inline mistake form */}
      <AnimatedCollapse open={showMistakeForm}>
        <div className="px-2 pb-2">
          <MistakeForm
            sessionId={session.id}
            subject={session.subject}
            date={date}
            onAdd={(m) => {
              onAddMistake(m)
            }}
            onClose={() => setShowMistakeForm(false)}
          />
        </div>
      </AnimatedCollapse>

      <ConfirmDialog
        open={confirmDelete}
        title={t('ielts.deleteSession')}
        message={t('ielts.deleteSessionConfirm')}
        onConfirm={() => { onDelete(); setConfirmDelete(false) }}
        onCancel={() => setConfirmDelete(false)}
        variant="danger"
      />
    </div>
  )
})
