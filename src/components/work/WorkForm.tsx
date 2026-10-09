import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_PROJECTS } from '../../constants/work'
import DurationPresets from '../common/DurationPresets'
import RecentChips from '../common/RecentChips'
import type { WorkEntry } from '../../types/work'

interface WorkFormProps {
  selectedDate: string
  onAdd: (entry: WorkEntry) => void
  recentProjects?: string[]
}

export default function WorkForm({ selectedDate, onAdd, recentProjects = [] }: WorkFormProps) {
  const { t } = useTranslation()
  const [project, setProject] = useState(recentProjects[0] || DEFAULT_PROJECTS[0])
  const [task, setTask] = useState('')
  const [duration, setDuration] = useState(30)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!task.trim() || !duration || duration <= 0) return
    onAdd({
      id: crypto.randomUUID(),
      project,
      task: task.trim(),
      duration,
      date: selectedDate,
      createdAt: new Date().toISOString(),
    })
    setTask('')
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-4 space-y-3">
      <p className="font-pixel text-[8px] text-[#e67e22] mb-1">{t('work.addTitle')}</p>
      <RecentChips items={recentProjects} onSelect={setProject} />
      <div className="flex gap-2">
        <select
          value={project}
          onChange={e => setProject(e.target.value)}
          className="input-base w-28 shrink-0"
        >
          {DEFAULT_PROJECTS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder={t('work.taskPlaceholder')}
          className="input-base flex-1"
        />
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={duration}
          onChange={e => setDuration(parseInt(e.target.value, 10) || 0)}
          placeholder={t('work.durationPlaceholder')}
          className="input-base w-28"
          min="1"
        />
        <DurationPresets onSelect={setDuration} selected={duration} />
        <button type="submit" className="btn-tactile px-4 bg-[#e67e22] text-white ml-auto">
          {t('work.addButton')}
        </button>
      </div>
    </form>
  )
}
