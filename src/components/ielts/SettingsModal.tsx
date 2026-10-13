/* ─── IELTS — Settings Modal (exam date + target scores) ─── */

import { useState } from 'react'
import { IELTS_SUBJECTS, SUBJECT_COLORS } from './constants'
import { ACCENT, btnPrimary, btnGhost } from './styles'
import type { IeltsSubject } from './types'

const STORAGE_KEY_TARGETS = 'ielts-target-scores'
const STORAGE_KEY_EXAM = 'ielts-exam-date'

export interface TargetScores {
  listening: number
  reading: number
  writing: number
  speaking: number
}

export function getTargetScores(): TargetScores {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TARGETS)
    if (raw) return JSON.parse(raw)
  } catch { /* */ }
  return { listening: 7, reading: 7, writing: 7, speaking: 7 }
}

interface Props {
  open: boolean
  onClose: () => void
}

function readExamDate(): string {
  try { return localStorage.getItem(STORAGE_KEY_EXAM) ?? '' } catch { return '' }
}

export default function SettingsModal({ open, onClose }: Props) {
  if (!open) return null
  return <SettingsModalInner onClose={onClose} />
}

function SettingsModalInner({ onClose }: { onClose: () => void }) {
  const [examDate, setExamDate] = useState(readExamDate)
  const [targets, setTargets] = useState<TargetScores>(getTargetScores)

  const handleSave = () => {
    try {
      if (examDate) localStorage.setItem(STORAGE_KEY_EXAM, examDate)
      else localStorage.removeItem(STORAGE_KEY_EXAM)
      localStorage.setItem(STORAGE_KEY_TARGETS, JSON.stringify(targets))
    } catch { /* */ }
    onClose()
  }

  const labels: Record<IeltsSubject, string> = {
    listening: '听力', reading: '阅读', writing: '写作', speaking: '口语',
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-x-4 top-[12%] z-50 max-w-md mx-auto
        bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/50">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">⚙️ 设置</h3>
          <button onClick={onClose} className={`${btnGhost} h-8 w-8`}>✕</button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Exam date */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              🎯 考试日期
            </label>
            <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
              className="input-base w-full rounded-xl text-sm h-11" />
          </div>

          {/* Target scores */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              🎯 目标分数
            </label>
            <div className="grid grid-cols-2 gap-3">
              {IELTS_SUBJECTS.map(s => (
                <div key={s} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SUBJECT_COLORS[s] }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 w-10">{labels[s]}</span>
                  <input type="number" min="1" max="9" step="0.5"
                    value={targets[s]}
                    onChange={e => setTargets(prev => ({ ...prev, [s]: parseFloat(e.target.value) || 7 }))}
                    className="input-base w-full rounded-xl text-sm h-9 text-center" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/50 flex justify-end gap-2">
          <button onClick={onClose} className={`${btnGhost} h-10 px-4`}>取消</button>
          <button onClick={handleSave} className={`${btnPrimary()} h-10 px-6`}
            style={{ backgroundColor: ACCENT }}>
            保存
          </button>
        </div>
      </div>
    </>
  )
}
