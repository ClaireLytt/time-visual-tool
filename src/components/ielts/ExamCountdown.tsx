/* ─── IELTS — Exam Countdown Widget (compact) ─── */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { differenceInCalendarDays } from 'date-fns'

const STORAGE_KEY = 'ielts-exam-date'

export default function ExamCountdown() {
  const { t } = useTranslation()
  const [examDate, setExamDate] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) ?? '' } catch { return '' }
  })
  const [editing, setEditing] = useState(false)

  const daysLeft = examDate ? differenceInCalendarDays(new Date(examDate), new Date()) : null

  const handleSave = (date: string) => {
    setExamDate(date)
    try { localStorage.setItem(STORAGE_KEY, date) } catch { /* ignore */ }
    setEditing(false)
  }

  const color = daysLeft === null ? '#888'
    : daysLeft < 7 ? '#e74c3c'
    : daysLeft < 30 ? '#f59e0b'
    : '#10b981'

  if (editing) {
    return (
      <div className="panel p-2.5 text-center">
        <input
          type="date"
          value={examDate}
          onChange={e => handleSave(e.target.value)}
          autoFocus
          className="input-base w-full text-xs"
        />
      </div>
    )
  }

  return (
    <button onClick={() => setEditing(true)} className="panel p-2.5 text-center w-full no-press">
      <span className="text-base">🎯</span>
      {daysLeft !== null ? (
        <>
          <p className="text-lg font-bold tabular-nums mt-0.5" style={{ color }}>
            {daysLeft > 0 ? daysLeft : '🔥'}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
            {daysLeft > 0 ? t('ielts.daysLeft') : '考试日'}
          </p>
        </>
      ) : (
        <p className="text-[10px] text-gray-400 mt-1 leading-tight">{t('ielts.setExamDate')}</p>
      )}
    </button>
  )
}
