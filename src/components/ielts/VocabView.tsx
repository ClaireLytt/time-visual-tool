/* ─── IELTS — Vocabulary View ─── */

import { useState, useMemo, useCallback, useRef, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { toast } from 'sonner'
import CollapsibleForm from '../common/CollapsibleForm'
import ConfirmDialog from '../common/ConfirmDialog'
import { useIeltsVocab } from './hooks'
import { sm2, DEFAULT_EF, type Quality } from './sm2'
import { ACCENT, btnPrimary, btnToggle, inputClass, textareaClass } from './styles'
import VocabReviewSession from './VocabReviewSession'
import type { IeltsVocabWord } from './types'

const LIST_TYPES = [
  { value: 'core' as const, label: '核心词汇', icon: '⭐' },
  { value: 'academic' as const, label: '学术词汇', icon: '📖' },
  { value: 'custom' as const, label: '自定义', icon: '✏️' },
]

export default function VocabView() {
  const { t } = useTranslation()
  const vocab = useIeltsVocab()
  const [search, setSearch] = useState('')
  const [listFilter, setListFilter] = useState<string>('all')
  const [reviewing, setReviewing] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const today = format(new Date(), 'yyyy-MM-dd')

  const stats = useMemo(() => {
    const total = vocab.entries.length
    const mastered = vocab.entries.filter(w => w.repetitions >= 5).length
    const due = vocab.entries.filter(w => w.nextReview <= today).length
    return { total, mastered, due }
  }, [vocab.entries, today])

  // Count per list type
  const listCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const w of vocab.entries) counts.set(w.listType, (counts.get(w.listType) ?? 0) + 1)
    return counts
  }, [vocab.entries])

  const filtered = useMemo(() => {
    let list = [...vocab.entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (listFilter !== 'all') list = list.filter(w => w.listType === listFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(w => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q))
    }
    return list.slice(0, 100)
  }, [vocab.entries, listFilter, search])

  const dueWords = useMemo(
    () => vocab.entries.filter(w => w.nextReview <= today),
    [vocab.entries, today],
  )

  const handleAdd = useCallback((word: IeltsVocabWord) => {
    if (vocab.entries.some(w => w.word.toLowerCase() === word.word.toLowerCase())) {
      toast.error('该词汇已存在')
      return
    }
    vocab.addEntry(word)
    toast.success(t('ielts.vocabAdded'))
  }, [vocab, t])

  const handleRate = useCallback((wordId: string, quality: Quality) => {
    const word = vocab.entries.find(w => w.id === wordId)
    if (!word) return
    const result = sm2(quality, word.repetitions, word.easeFactor, word.interval)
    vocab.updateEntry(wordId, {
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReview: result.nextReviewDate,
    })
  }, [vocab])

  if (reviewing && dueWords.length > 0) {
    return <VocabReviewSession words={dueWords} onRate={handleRate} onExit={() => setReviewing(false)} />
  }

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="panel p-3 text-center">
          <p className="text-sm text-gray-400 mb-0.5">📚 {t('ielts.vocabTotal')}</p>
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{stats.total}</p>
        </div>
        <div className="panel p-3 text-center">
          <p className="text-sm text-gray-400 mb-0.5">📖 {t('ielts.reviewDue')}</p>
          <p className={`text-2xl font-bold tabular-nums ${stats.due > 0 ? 'text-[#c0392b]' : 'text-gray-900 dark:text-gray-100'}`}>
            {stats.due}
          </p>
        </div>
        <div className="panel p-3 text-center">
          <p className="text-sm text-gray-400 mb-0.5">✅ {t('ielts.vocabMastered')}</p>
          <p className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">{stats.mastered}</p>
        </div>
      </div>

      {/* Start review button */}
      {stats.due > 0 && (
        <button onClick={() => setReviewing(true)}
          className={`${btnPrimary(false)} w-full h-12`} style={{ backgroundColor: ACCENT }}>
          📖 {t('ielts.vocabStartReview')}（{stats.due} {t('ielts.vocabWords')}）
        </button>
      )}

      {/* Add word form */}
      <div ref={formRef}>
        <CollapsibleForm accentColor={ACCENT} addLabel={`+ ${t('ielts.vocabAddWord')}`}>
          <VocabAddForm onAdd={handleAdd} />
        </CollapsibleForm>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('ielts.vocabSearchPlaceholder')}
          className="input-base w-full rounded-lg text-base h-11 pl-10" />
      </div>

      {/* List type filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        <button onClick={() => setListFilter('all')}
          className={`${btnToggle(listFilter === 'all')} h-8 px-3 rounded-lg text-xs shrink-0`}>
          全部
          {stats.total > 0 && <span className="ml-1 text-xs opacity-50">{stats.total}</span>}
        </button>
        {LIST_TYPES.map(lt => {
          const count = listCounts.get(lt.value) ?? 0
          return (
            <button key={lt.value} onClick={() => setListFilter(lt.value)}
              className={`${btnToggle(listFilter === lt.value)} h-8 px-3 rounded-lg text-xs shrink-0`}>
              {lt.icon} {lt.label}
              {count > 0 && <span className="ml-1 text-xs opacity-50">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Word list — compact panel rows */}
      {filtered.length > 0 ? (
        <div className="panel divide-y divide-gray-100 dark:divide-gray-700/40 overflow-hidden">
          {filtered.map(word => (
            <WordRow key={word.id} word={word} today={today} onDelete={vocab.deleteEntry} />
          ))}
          {vocab.entries.length > 100 && filtered.length >= 100 && (
            <p className="text-xs text-gray-400 text-center py-2">仅显示前 100 条</p>
          )}
        </div>
      ) : (
        <div className="panel p-10 text-center space-y-3">
          <p className="text-3xl">📖</p>
          <p className="text-base font-medium text-gray-600 dark:text-gray-300">
            {search ? '没有匹配的词汇' : t('ielts.vocabEmpty')}
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            收集练习中遇到的生词，结合 SM-2 间隔重复高效记忆
          </p>
          {!search && (
            <button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className={`${btnPrimary(false)} h-10 px-5 text-sm mt-1`} style={{ backgroundColor: ACCENT }}>
              + {t('ielts.vocabAddWord')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Word Row (compact) ── */

const WordRow = memo(function WordRow({ word, today, onDelete }: {
  word: IeltsVocabWord; today: string; onDelete: (id: string) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isDue = word.nextReview <= today
  const isMastered = word.repetitions >= 5
  const listIcon = LIST_TYPES.find(l => l.value === word.listType)?.icon ?? '📖'

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5
      hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors">
      {/* Word + phonetic */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{word.word}</span>
          {word.phonetic && <span className="text-xs text-gray-400">{word.phonetic}</span>}
          <span className="text-xs text-gray-400">{listIcon}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{word.meaning}</span>
          {word.source && (
            <span className="text-xs text-gray-400 truncate shrink-0">· {word.source}</span>
          )}
        </div>
      </div>

      {/* Mastery status */}
      {isMastered ? (
        <span className="px-1.5 py-0.5 rounded text-xs font-medium shrink-0
          bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
          已掌握
        </span>
      ) : isDue ? (
        <span className="px-1.5 py-0.5 rounded text-xs font-medium shrink-0
          bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
          待复习
        </span>
      ) : (
        <span className="text-xs text-gray-400 tabular-nums shrink-0">
          {word.nextReview.slice(5)}
        </span>
      )}

      {/* Delete */}
      <button onClick={() => setConfirmDelete(true)}
        className="h-8 w-8 inline-flex items-center justify-center rounded shrink-0
          text-gray-300 hover:text-[#c0392b] hover:bg-gray-100 dark:hover:bg-gray-700/40
          transition-colors select-none no-press">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      <ConfirmDialog open={confirmDelete} title="删除词汇"
        message={`确定删除「${word.word}」？`}
        onConfirm={() => { onDelete(word.id); setConfirmDelete(false) }}
        onCancel={() => setConfirmDelete(false)} variant="danger" />
    </div>
  )
})

/* ── Add Form ── */

function VocabAddForm({ onAdd }: { onAdd: (word: IeltsVocabWord) => void }) {
  const { t } = useTranslation()
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [example, setExample] = useState('')
  const [source, setSource] = useState('')
  const [listType, setListType] = useState<IeltsVocabWord['listType']>('core')

  const canSubmit = word.trim() && meaning.trim()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    onAdd({
      id: crypto.randomUUID(),
      word: word.trim(), meaning: meaning.trim(),
      phonetic: phonetic.trim() || undefined,
      example: example.trim() || undefined,
      source: source.trim(), listType,
      easeFactor: DEFAULT_EF, interval: 0, repetitions: 0,
      nextReview: format(new Date(), 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
    })
    setWord(''); setMeaning(''); setPhonetic(''); setExample(''); setSource('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t('ielts.vocabWord')} *</label>
          <input value={word} onChange={e => setWord(e.target.value)}
            placeholder="e.g. ubiquitous" className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t('ielts.vocabMeaning')} *</label>
          <input value={meaning} onChange={e => setMeaning(e.target.value)}
            placeholder="无处不在的" className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t('ielts.vocabPhonetic')}</label>
          <input value={phonetic} onChange={e => setPhonetic(e.target.value)}
            placeholder="/juːˈbɪkwɪtəs/" className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t('ielts.vocabSource')}</label>
          <input value={source} onChange={e => setSource(e.target.value)}
            placeholder="剑雅 21 Test 2" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">{t('ielts.vocabExample')}</label>
        <textarea value={example} onChange={e => setExample(e.target.value)}
          placeholder="Smartphones have become ubiquitous in modern society."
          rows={2} className={textareaClass} style={{ minHeight: 48 }} />
      </div>
      <div className="flex gap-2">
        {LIST_TYPES.map(lt => (
          <button key={lt.value} type="button" onClick={() => setListType(lt.value)}
            className={`${btnToggle(listType === lt.value)} h-9 px-4 rounded-lg text-sm`}>
            {lt.icon} {lt.label}
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={!canSubmit}
          className={`${btnPrimary(!canSubmit)} h-11 px-6`} style={{ backgroundColor: ACCENT }}>
          + {t('ielts.vocabAddWord')}
        </button>
      </div>
    </form>
  )
}
