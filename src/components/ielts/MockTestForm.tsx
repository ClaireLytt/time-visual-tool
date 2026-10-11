import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { IELTS_SUBJECTS, SUBJECT_COLORS } from './constants'
import { ACCENT, btnPrimary, inputClass } from './styles'
import type { IeltsSession, IeltsSubject, IeltsSourceCategory } from './types'

interface Props {
  date: string
  categories: IeltsSourceCategory[]
  onAdd: (session: IeltsSession) => void
}

export default function MockTestForm({ date, categories, onAdd }: Props) {
  const { t } = useTranslation()
  const [source, setSource] = useState('')
  const [scores, setScores] = useState<Record<IeltsSubject, string>>({
    listening: '', reading: '', writing: '', speaking: '',
  })
  const [durations, setDurations] = useState<Record<IeltsSubject, string>>({
    listening: '30', reading: '60', writing: '60', speaking: '15',
  })

  const totalScore = (() => {
    const vals = IELTS_SUBJECTS.map(s => parseFloat(scores[s])).filter(n => !isNaN(n))
    if (vals.length === 0) return null
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
  })()

  const canSubmit = source.trim() && IELTS_SUBJECTS.some(s => scores[s].trim())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const now = new Date().toISOString()
    const categoryId = categories[0]?.id ?? ''

    for (const subject of IELTS_SUBJECTS) {
      if (!scores[subject].trim() && !durations[subject].trim()) continue
      onAdd({
        id: crypto.randomUUID(),
        date,
        subject,
        source: source.trim(),
        categoryId,
        detail: source.trim(),
        score: scores[subject].trim(),
        minutes: Number(durations[subject]) || 0,
        note: '模考',
        createdAt: now,
      })
    }

    setSource('')
    setScores({ listening: '', reading: '', writing: '', speaking: '' })
    setDurations({ listening: '30', reading: '60', writing: '60', speaking: '15' })
    toast.success('模考记录已保存')
  }

  const subjectLabel = (s: IeltsSubject) =>
    s === 'listening' ? '听力' : s === 'reading' ? '阅读' : s === 'writing' ? '写作' : '口语'

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Source */}
      <input
        value={source}
        onChange={e => setSource(e.target.value)}
        placeholder="如：剑雅21 Test 2"
        className={inputClass}
      />

      {/* 4 subject rows */}
      <div className="space-y-2">
        {IELTS_SUBJECTS.map(s => (
          <div key={s} className="flex items-center gap-2">
            <span
              className="w-12 text-center py-1 rounded-lg text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: SUBJECT_COLORS[s] }}
            >
              {subjectLabel(s)}
            </span>
            <input
              value={scores[s]}
              onChange={e => setScores(prev => ({ ...prev, [s]: e.target.value }))}
              placeholder="分数"
              className="input-base rounded-lg text-sm h-10 flex-1"
            />
            <input
              type="number"
              value={durations[s]}
              onChange={e => setDurations(prev => ({ ...prev, [s]: e.target.value }))}
              placeholder="min"
              className="input-base rounded-lg text-sm h-10 w-16 text-center"
            />
          </div>
        ))}
      </div>

      {/* Total */}
      {totalScore && (
        <div className="text-center">
          <span className="text-xs text-gray-400">总分：</span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalScore}</span>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className={`${btnPrimary(!canSubmit)} h-11 px-6`}
          style={{ backgroundColor: ACCENT }}
        >
          保存模考记录
        </button>
      </div>
    </form>
  )
}
