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
  const isExpired = daysLeft !== null && daysLeft < 0

  const handleSave = (date: string) => {
    setExamDate(date)
    try { localStorage.setItem(STORAGE_KEY, date) } catch { /* ignore */ }
    setEditing(false)
  }

  const handleClear = () => {
    setExamDate('')
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }

  const color = daysLeft === null ? '#888'
    : isExpired ? '#9ca3af'
    : daysLeft === 0 ? '#e74c3c'
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
    <div className="panel p-2.5 text-center">
      <span className="text-base">🎯</span>
      {daysLeft !== null ? (
        isExpired ? (
          <>
            <p className="text-sm font-bold text-gray-400 mt-0.5">考试已结束</p>
            <button onClick={handleClear}
              className="text-[10px] text-[#c0392b] font-medium mt-0.5 hover:underline select-none">
              设置新日期
            </button>
          </>
        ) : daysLeft === 0 ? (
          <>
            <p className="text-lg font-bold mt-0.5" style={{ color }}>🔥 今天</p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">考试日</p>
          </>
        ) : (
          <button onClick={() => setEditing(true)} className="w-full no-press">
            <p className="text-lg font-bold tabular-nums mt-0.5" style={{ color }}>{daysLeft}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{t('ielts.daysLeft')}</p>
          </button>
        )
      ) : (
        <button onClick={() => setEditing(true)} className="w-full no-press">
          <p className="text-[10px] text-gray-400 mt-1 leading-tight">{t('ielts.setExamDate')}</p>
        </button>
      )}
    </div>
  )
}
