/* ─── IELTS — Session List (Compact rows with batch select) ─── */

import { useState, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmDialog from '../common/ConfirmDialog'
import AnimatedCollapse from '../common/AnimatedCollapse'
import MistakeForm from './MistakeForm'
import { SUBJECT_COLORS } from './constants'
import { ACCENT } from './styles'
import type { IeltsSubject, IeltsSession, IeltsMistake } from './types'

interface SessionListProps {
  sessions: IeltsSession[]
  mistakes: IeltsMistake[]
  date: string
  onDeleteSession: (id: string) => void
  onAddMistake: (mistake: IeltsMistake) => void
  onEditSession?: (id: string, patch: Partial<IeltsSession>) => void
  showDate?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
  onToggleSelectAll?: () => void
  onScrollToForm?: () => void
}

export default function SessionList({
  sessions, mistakes, date, onDeleteSession, onAddMistake, onEditSession,
  showDate, selectedIds, onToggleSelect, onToggleSelectAll, onScrollToForm,
}: SessionListProps) {
  const { t } = useTranslation()

  const sorted = useMemo(
    () => [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [sessions],
  )

  const hasSelection = selectedIds && onToggleSelect
  const allSelected = hasSelection && sessions.length > 0 && selectedIds.size === sessions.length

  if (sessions.length === 0) {
    return (
      <div className="panel p-10 text-center space-y-3">
        <p className="text-3xl">📝</p>
        <p className="text-base font-medium text-gray-600 dark:text-gray-300">
          {t('ielts.emptyToday')}
        </p>
        <p className="text-sm text-gray-400 leading-relaxed">
          记录每次练习的分数、用时和错因，追踪你的进步轨迹
        </p>
        {onScrollToForm && (
          <button
            onClick={onScrollToForm}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg text-sm font-semibold text-white
              transition-colors select-none no-press active:scale-[0.97] hover:brightness-110 mt-1"
            style={{ backgroundColor: ACCENT }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t('ielts.addSession')}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="panel divide-y divide-gray-100 dark:divide-gray-700/40 overflow-hidden">
      {/* Select-all header */}
      {hasSelection && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 dark:bg-gray-800/30">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected ?? false}
              onChange={onToggleSelectAll}
              className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600
                text-[#c0392b] focus:ring-[#c0392b]/30 cursor-pointer"
            />
            <span className="text-xs text-gray-400">
              {allSelected ? '取消全选' : '全选'}
            </span>
          </label>
          <span className="text-xs text-gray-400 ml-auto tabular-nums">
            {sessions.length} 条记录
          </span>
        </div>
      )}

      {sorted.map(session => (
        <SessionRow
          key={session.id}
          session={session}
          mistakes={mistakes.filter(m => m.sessionId === session.id)}
          date={date}
          onDelete={() => onDeleteSession(session.id)}
          onAddMistake={onAddMistake}
          onEdit={onEditSession}
          showDate={showDate}
          selected={selectedIds?.has(session.id) ?? false}
          onToggleSelect={onToggleSelect ? () => onToggleSelect(session.id) : undefined}
        />
      ))}
    </div>
  )
}

const SessionRow = memo(function SessionRow({
  session, mistakes, date, onDelete, onAddMistake, onEdit, showDate, selected, onToggleSelect,
}: {
  session: IeltsSession
  mistakes: IeltsMistake[]
  date: string
  onDelete: () => void
  onAddMistake: (m: IeltsMistake) => void
  onEdit?: (id: string, patch: Partial<IeltsSession>) => void
  showDate?: boolean
  selected: boolean
  onToggleSelect?: () => void
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [showMistakeForm, setShowMistakeForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editScore, setEditScore] = useState(session.score)
  const [editMinutes, setEditMinutes] = useState(String(session.minutes))
  const [editNote, setEditNote] = useState(session.note)
  const color = SUBJECT_COLORS[session.subject as IeltsSubject] ?? '#888'

  return (
    <div className={`transition-colors ${
      selected
        ? 'bg-[#c0392b]/[0.03] dark:bg-[#c0392b]/[0.06]'
        : 'hover:bg-gray-50/60 dark:hover:bg-gray-700/20'
    }`}>
      {/* ── Main row ── */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Checkbox */}
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600
              text-[#c0392b] focus:ring-[#c0392b]/30 cursor-pointer shrink-0"
          />
        )}

        {/* Left: info */}
        <div className="flex-1 min-w-0 space-y-0.5">
          {/* Line 1: (date) + badge + source + score */}
          <div className="flex items-center gap-1.5">
            {showDate && (
              <span className="text-sm text-gray-400 tabular-nums shrink-0 mr-0.5">
                {session.date.slice(5)}
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-sm font-bold text-white leading-tight shrink-0"
              style={{ backgroundColor: color }}>
              {t(`ielts.${session.subject}`)}
            </span>
            <span className="text-lg font-medium text-gray-800 dark:text-gray-200 truncate">
              {session.source}
            </span>
            {session.score && (
              <span className="text-base font-bold tabular-nums shrink-0" style={{ color }}>
                {session.score}
              </span>
            )}
          </div>

          {/* Line 2: error tags + note */}
          {(mistakes.length > 0 || session.note) && (
            <div className="flex items-center gap-1 min-w-0">
              {mistakes.map(m => (
                <span key={m.id}
                  className="px-2 py-0.5 rounded text-sm font-medium shrink-0
                    bg-[#c0392b]/8 text-[#c0392b] dark:text-[#ef6f6f] leading-tight">
                  {m.tag}
                </span>
              ))}
              {session.note && (
                <span className="text-sm text-gray-400 truncate ml-0.5">{session.note}</span>
              )}
            </div>
          )}
        </div>

        {/* Right: duration + actions */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-sm text-gray-400 tabular-nums mr-1">{session.minutes}min</span>
          <button onClick={() => setShowMistakeForm(!showMistakeForm)}
            className="h-9 px-3 rounded text-sm font-medium
              text-gray-400 hover:text-[#c0392b] hover:bg-gray-100 dark:hover:bg-gray-700/40
              transition-colors select-none no-press">
            +错题
          </button>
          {mistakes.length > 0 && (
            <button onClick={() => setExpanded(!expanded)}
              className="h-9 px-3 rounded text-sm font-medium
                hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors select-none no-press"
              style={{ color }}>
              {expanded ? '▲' : `错题(${mistakes.length})`}
            </button>
          )}
          {onEdit && (
            <button onClick={() => {
              if (!editing) { setEditScore(session.score); setEditMinutes(String(session.minutes)); setEditNote(session.note) }
              setEditing(!editing)
            }}
              className="h-8 w-8 inline-flex items-center justify-center rounded
                text-gray-300 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/40
                transition-colors select-none no-press">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          <button onClick={() => setConfirmDelete(true)}
            className="h-8 w-8 inline-flex items-center justify-center rounded
              text-gray-300 hover:text-[#c0392b] hover:bg-gray-100 dark:hover:bg-gray-700/40
              transition-colors select-none no-press">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Inline edit form */}
      <AnimatedCollapse open={editing}>
        <div className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-gray-700/40 space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-0.5 block">分数</label>
              <input value={editScore} onChange={e => setEditScore(e.target.value)}
                placeholder="如 32/40" className="input-base w-full rounded-lg text-sm h-9" />
            </div>
            <div className="w-20">
              <label className="text-xs text-gray-400 mb-0.5 block">用时</label>
              <input type="number" value={editMinutes} onChange={e => setEditMinutes(e.target.value)}
                className="input-base w-full rounded-lg text-sm h-9 text-center" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-0.5 block">备注</label>
            <input value={editNote} onChange={e => setEditNote(e.target.value)}
              className="input-base w-full rounded-lg text-sm h-9" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(false)}
              className="h-8 px-3 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100
                dark:hover:bg-gray-700/40 transition-colors select-none">
              取消
            </button>
            <button onClick={() => {
              onEdit?.(session.id, {
                score: editScore.trim(),
                minutes: Number(editMinutes) || session.minutes,
                note: editNote.trim(),
              })
              setEditing(false)
            }}
              className="h-8 px-4 rounded-lg text-xs font-semibold text-white
                hover:brightness-110 transition-colors select-none"
              style={{ backgroundColor: ACCENT }}>
              保存
            </button>
          </div>
        </div>
      </AnimatedCollapse>

      {/* Expanded mistakes */}
      <AnimatedCollapse open={expanded && mistakes.length > 0}>
        <div className="px-3 pb-2 space-y-1 border-t border-gray-100 dark:border-gray-700/40 pt-2 ml-7">
          {mistakes.map(m => (
            <div key={m.id} className="flex items-start gap-1.5 text-xs">
              <span className="px-1 py-px rounded bg-[#c0392b]/10 text-[#c0392b] font-medium shrink-0 leading-tight">{m.tag}</span>
              <div className="flex-1 min-w-0">
                {m.questionNo && <span className="text-gray-400 mr-1">{m.questionNo}</span>}
                {m.myAnswer && m.correctAnswer && (
                  <span className="text-gray-500">
                    <span className="line-through text-gray-400">{m.myAnswer}</span>
                    {' → '}
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{m.correctAnswer}</span>
                  </span>
                )}
                {m.explanation && <p className="text-gray-400 mt-0.5 truncate">{m.explanation}</p>}
              </div>
            </div>
          ))}
        </div>
      </AnimatedCollapse>

      {/* Inline mistake form */}
      <AnimatedCollapse open={showMistakeForm}>
        <div className="px-3 pb-2">
          <MistakeForm sessionId={session.id} subject={session.subject} date={date}
            onAdd={(m) => { onAddMistake(m) }} onClose={() => setShowMistakeForm(false)} />
        </div>
      </AnimatedCollapse>

      <ConfirmDialog open={confirmDelete} title={t('ielts.deleteSession')}
        message={t('ielts.deleteSessionConfirm')}
        onConfirm={() => { onDelete(); setConfirmDelete(false) }}
        onCancel={() => setConfirmDelete(false)} confirmVariant="danger" />
    </div>
  )
})
