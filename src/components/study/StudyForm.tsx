import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_SUBJECTS } from '../../constants/study'
import DurationPresets from '../common/DurationPresets'
import RecentChips from '../common/RecentChips'
import type { StudyEntry } from '../../types/study'

interface StudyFormProps {
  selectedDate: string
  onAdd: (entry: StudyEntry) => void
  recentSubjects?: string[]
}

export default function StudyForm({ selectedDate, onAdd, recentSubjects = [] }: StudyFormProps) {
  const { t } = useTranslation()
  const [subject, setSubject] = useState(recentSubjects[0] || DEFAULT_SUBJECTS[0])
  const [duration, setDuration] = useState(30)
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !duration || duration <= 0) return
    onAdd({
      id: crypto.randomUUID(),
      subject,
      duration,
      notes: notes.trim(),
      date: selectedDate,
      createdAt: new Date().toISOString(),
    })
    setNotes('')
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-4 space-y-3">
      <p className="font-pixel text-[8px] text-[#4a90d9] mb-1">{t('study.addTitle')}</p>
      <RecentChips items={recentSubjects} onSelect={setSubject} />
      <div className="flex gap-2">
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="input-base flex-none w-28"
        >
          {DEFAULT_SUBJECTS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="number"
          value={duration}
          onChange={e => setDuration(parseInt(e.target.value, 10) || 0)}
          placeholder={t('study.durationPlaceholder')}
          className="input-base w-24"
          min="1"
        />
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={t('study.notesPlaceholder')}
          className="input-base flex-1"
        />
        <button type="submit" className="btn-tactile px-4 bg-[#4a90d9] text-white shrink-0">
          {t('study.addButton')}
        </button>
      </div>
      <DurationPresets onSelect={setDuration} selected={duration} />
    </form>
  )
}
