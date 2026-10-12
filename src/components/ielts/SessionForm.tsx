/* ─── IELTS — Session Recording Form ─── */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { IELTS_SUBJECTS, IELTS_TAGS, SUBJECT_COLORS } from './constants'
import { ACCENT, btnPrimary, btnToggle, textareaClass } from './styles'
import SourceCategoryPicker from './SourceCategoryPicker'
import MockTestForm from './MockTestForm'
import type { IeltsSubject, IeltsSession, IeltsMistake, IeltsSourceCategory } from './types'

interface SessionFormProps {
  date: string
  categories: IeltsSourceCategory[]
  onAdd: (session: IeltsSession) => void
  onAddMistake?: (mistake: IeltsMistake) => void
  onAddCategory: (cat: IeltsSourceCategory) => void
  onUpdateCategory: (id: string, patch: Partial<IeltsSourceCategory>) => void
  onDeleteCategory: (id: string) => void
  defaultMinutes?: number
}

export default function SessionForm({
  date, categories, onAdd, onAddMistake,
  onAddCategory, onUpdateCategory, onDeleteCategory,
  defaultMinutes,
}: SessionFormProps) {
  const { t } = useTranslation()
  const [isMockMode, setIsMockMode] = useState(false)
  const [subject, setSubject] = useState<IeltsSubject>('listening')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [detail, setDetail] = useState('')

  // Sync categoryId when categories load async from Firestore
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])
  const [score, setScore] = useState('')
  const [minutes, setMinutes] = useState('')
  const [note, setNote] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Auto-fill minutes from timer
  useEffect(() => {
    if (defaultMinutes && defaultMinutes > 0) {
      setMinutes(String(defaultMinutes))
    }
  }, [defaultMinutes])

  const selectedCat = categories.find(c => c.id === categoryId)
  const source = selectedCat
    ? (detail.trim() ? `${selectedCat.name} ${detail.trim()}` : selectedCat.name)
    : detail.trim()
  const canSubmit = categoryId && Number(minutes) > 0
  const subjectTags = IELTS_TAGS[subject]
  const subjectColor = SUBJECT_COLORS[subject]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const sessionId = crypto.randomUUID()
    const now = new Date().toISOString()
    onAdd({
      id: sessionId,
      date,
      subject,
      source,
      categoryId,
      detail: detail.trim(),
      score: score.trim(),
      minutes: Number(minutes) || 0,
      note: note.trim(),
      createdAt: now,
    })
    if (onAddMistake) {
      for (const tag of selectedTags) {
        onAddMistake({
          id: crypto.randomUUID(), sessionId,
          questionNo: '', questionType: '', myAnswer: '', correctAnswer: '',
          tag, explanation: '', date, createdAt: now,
        })
      }
    }
    setDetail('')
    setScore('')
    setMinutes('')
    setNote('')
    setSelectedTags([])
    toast.success(t('ielts.addSession'))
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubjectChange = (s: IeltsSubject) => {
    setSubject(s)
    setSelectedTags([])
  }

  // Mock mode — render separate form
  if (isMockMode) {
    return (
      <div className="space-y-3">
        <div className="inline-flex bg-gray-100/80 dark:bg-gray-800/50 rounded-lg p-0.5 gap-0.5">
          <button type="button" onClick={() => setIsMockMode(false)} className={`${btnToggle(!isMockMode)} h-9 px-4 rounded-md text-sm`}>📝 单项练习</button>
          <button type="button" onClick={() => setIsMockMode(true)} className={`${btnToggle(isMockMode)} h-9 px-4 rounded-md text-sm`}>📋 完整模考</button>
        </div>
        <MockTestForm date={date} categories={categories} onAdd={onAdd} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* Mode toggle */}
      <div className="inline-flex bg-gray-100/80 dark:bg-gray-800/50 rounded-lg p-0.5 gap-0.5">
        <button type="button" onClick={() => setIsMockMode(false)} className={`${btnToggle(!isMockMode)} h-9 px-4 rounded-md text-sm`}>📝 单项练习</button>
        <button type="button" onClick={() => setIsMockMode(true)} className={`${btnToggle(isMockMode)} h-9 px-4 rounded-md text-sm`}>📋 完整模考</button>
      </div>

      {/* ① Subject toggle */}
      <div className="flex flex-wrap gap-2">
        {IELTS_SUBJECTS.map(s => {
          const active = subject === s
          return (
            <button
              key={s}
              type="button"
              onClick={() => handleSubjectChange(s)}
              className={`h-11 px-5 rounded-lg text-sm font-semibold transition-all select-none no-press active:scale-[0.97] ${
                active
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              style={active ? { backgroundColor: SUBJECT_COLORS[s] } : undefined}
            >
              {t(`ielts.${s}`)}
            </button>
          )
        })}
      </div>

      {/* ② Source category + detail */}
      <SourceCategoryPicker
        categories={categories}
        subject={subject}
        selectedId={categoryId}
        detail={detail}
        onSelect={setCategoryId}
        onDetailChange={setDetail}
        onAdd={onAddCategory}
        onUpdate={onUpdateCategory}
        onDelete={onDeleteCategory}
      />

      {/* ③ Score + Duration — with clear labels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t('ielts.score')}（选填）</label>
          <input
            value={score}
            onChange={e => setScore(e.target.value)}
            placeholder={t('ielts.scorePlaceholder')}
            className="input-base rounded-lg text-sm h-11 w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t('ielts.minutes')} *</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              placeholder="分钟"
              min="0"
              className="input-base rounded-lg text-sm text-center h-11"
              style={{ minWidth: 72, width: 72 }}
            />
            {[20, 30, 40, 60].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(String(m))}
                className={`flex-1 h-11 rounded-lg text-sm font-medium transition-all select-none no-press active:scale-[0.97] ${
                  Number(minutes) === m
                    ? 'bg-white dark:bg-gray-700 text-[#c0392b] shadow-sm font-semibold border border-gray-200 dark:border-gray-600'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 hover:text-gray-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ④ Error cause tags (optional, multi-select) */}
      <div>
        <p className="text-xs text-gray-400 mb-1.5">本次错因（可选）</p>
        <div className="flex flex-wrap gap-2">
          {subjectTags.map(tag => {
            const active = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`h-9 px-4 rounded-lg text-sm font-medium transition-all select-none no-press active:scale-[0.97] ${
                  active
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 hover:text-gray-700'
                }`}
                style={active ? { backgroundColor: subjectColor } : undefined}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* ⑤ Note */}
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder={t('ielts.notePlaceholder')}
        rows={2}
        className={textareaClass}
        style={{ minHeight: 60 }}
      />

      {/* ⑥ Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className={`${btnPrimary(!canSubmit)} h-11 px-6`}
          style={{ backgroundColor: ACCENT }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('ielts.addSession')}
        </button>
      </div>
    </form>
  )
}
