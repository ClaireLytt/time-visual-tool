/* ─── IELTS — Mistake Attribution Form ─── */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { IELTS_TAGS, QUESTION_TYPES } from './constants'
import { ACCENT, btnPrimary, btnGhost, inputClass, textareaClass } from './styles'
import type { IeltsSubject, IeltsMistake } from './types'

interface MistakeFormProps {
  sessionId: string
  subject: IeltsSubject
  date: string
  onAdd: (mistake: IeltsMistake) => void
  onClose?: () => void
}

export default function MistakeForm({ sessionId, subject, date, onAdd, onClose }: MistakeFormProps) {
  const { t } = useTranslation()
  const tags = IELTS_TAGS[subject]

  const [questionNo, setQuestionNo] = useState('')
  const [questionType, setQuestionType] = useState('')
  const [myAnswer, setMyAnswer] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [tag, setTag] = useState('')
  const [explanation, setExplanation] = useState('')

  const canSubmit = tag !== ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    onAdd({
      id: crypto.randomUUID(),
      sessionId,
      questionNo: questionNo.trim(),
      questionType: questionType.trim(),
      myAnswer: myAnswer.trim(),
      correctAnswer: correctAnswer.trim(),
      tag,
      explanation: explanation.trim(),
      date,
      createdAt: new Date().toISOString(),
    })
    setQuestionNo('')
    setQuestionType('')
    setMyAnswer('')
    setCorrectAnswer('')
    setTag('')
    setExplanation('')
    toast.success(t('ielts.addMistake'))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('ielts.addMistake')}
        </span>
        {onClose && (
          <button type="button" onClick={onClose} className={`${btnGhost} h-8 w-8`}>✕</button>
        )}
      </div>

      {/* Question No + Type */}
      <div className="grid grid-cols-2 gap-2">
        <input value={questionNo} onChange={e => setQuestionNo(e.target.value)}
          placeholder={`${t('ielts.questionNo')} (Q23)`} className={inputClass} />
        <input value={questionType} onChange={e => setQuestionType(e.target.value)}
          placeholder={t('ielts.questionType')} className={inputClass} list="ielts-qtypes" />
        <datalist id="ielts-qtypes">
          {QUESTION_TYPES.map(qt => <option key={qt} value={qt} />)}
        </datalist>
      </div>

      {/* Answers */}
      <div className="grid grid-cols-2 gap-2">
        <input value={myAnswer} onChange={e => setMyAnswer(e.target.value)}
          placeholder={t('ielts.myAnswer')} className={inputClass} />
        <input value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)}
          placeholder={t('ielts.correctAnswer')} className={inputClass} />
      </div>

      {/* Tag chips — proper touch targets */}
      <div>
        <p className="text-xs text-gray-400 mb-1.5">{t('ielts.tag')}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map(tagName => (
            <button
              key={tagName}
              type="button"
              onClick={() => setTag(tag === tagName ? '' : tagName)}
              className={`h-9 px-4 rounded-lg text-sm font-medium transition-all select-none no-press active:scale-[0.97] ${
                tag === tagName
                  ? 'bg-[#c0392b] text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tagName}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <textarea
        value={explanation}
        onChange={e => setExplanation(e.target.value)}
        placeholder={t('ielts.explanationPlaceholder')}
        rows={2}
        className={textareaClass}
        style={{ minHeight: 60 }}
      />

      {/* Submit — right-aligned, not full width */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className={`${btnPrimary(!canSubmit)} h-10 px-5`}
          style={{ backgroundColor: ACCENT }}
        >
          {t('ielts.addMistake')}
        </button>
      </div>
    </form>
  )
}
