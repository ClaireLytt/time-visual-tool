/* ─── IELTS — Knowledge Base (errors + expressions) ─── */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useIeltsMistakes, useIeltsItems, useIeltsSessions } from './hooks'
import { IELTS_SUBJECTS, IELTS_TAGS, SUBJECT_COLORS } from './constants'
import type { IeltsSubject } from './types'

type ItemType = 'all' | 'mistake' | 'expression'

export default function KnowledgeView() {
  const { t } = useTranslation()
  const [subject, setSubject] = useState<IeltsSubject | 'all'>('all')
  const [tag, setTag] = useState('')
  const [search, setSearch] = useState('')
  const [itemType, setItemType] = useState<ItemType>('all')

  const { entries: allMistakes } = useIeltsMistakes()
  const { entries: allItems } = useIeltsItems()
  const { entries: allSessions } = useIeltsSessions()

  // Map sessionId → subject for filtering
  const sessionSubject = useMemo(
    () => new Map(allSessions.map(s => [s.id, s.subject])),
    [allSessions],
  )

  // Available tags for the selected subject
  const availableTags = useMemo(() => {
    if (subject === 'all') return Object.values(IELTS_TAGS).flat()
    return IELTS_TAGS[subject]
  }, [subject])

  // Filter mistakes
  const filteredMistakes = useMemo(() => {
    let list = allMistakes
    if (subject !== 'all') {
      list = list.filter(m => sessionSubject.get(m.sessionId) === subject)
    }
    if (tag) {
      list = list.filter(m => m.tag === tag)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m =>
        (m.myAnswer ?? '').toLowerCase().includes(q) ||
        (m.correctAnswer ?? '').toLowerCase().includes(q) ||
        (m.explanation ?? '').toLowerCase().includes(q) ||
        (m.questionNo ?? '').toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [allMistakes, subject, tag, search, sessionSubject])

  // Filter expressions
  const filteredExpressions = useMemo(() => {
    let list = allItems.filter(it => it.type === 'expression')
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(it =>
        it.content.toLowerCase().includes(q) ||
        (it.meaning ?? '').toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [allItems, search])

  const showMistakes = itemType === 'all' || itemType === 'mistake'
  const showExpressions = itemType === 'all' || itemType === 'expression'
  const totalCount = (showMistakes ? filteredMistakes.length : 0) + (showExpressions ? filteredExpressions.length : 0)

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="搜索错题、表达..."
        className="input-base w-full rounded-lg text-sm h-11"
      />

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type filter */}
        {(['all', 'mistake', 'expression'] as ItemType[]).map(tp => (
          <button
            key={tp}
            onClick={() => setItemType(tp)}
            className={`h-9 px-3 rounded-lg text-sm font-medium transition-all select-none no-press active:scale-[0.97] ${
              itemType === tp
                ? 'bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800 shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 hover:text-gray-600'
            }`}
          >
            {tp === 'all' ? '全部' : tp === 'mistake' ? '错题' : '表达'}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Subject filter */}
        <button
          onClick={() => { setSubject('all'); setTag('') }}
          className={`h-9 px-3 rounded-lg text-sm font-medium transition-all select-none no-press active:scale-[0.97] ${
            subject === 'all'
              ? 'bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800 shadow-sm'
              : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400'
          }`}
        >
          全部科目
        </button>
        {IELTS_SUBJECTS.map(s => (
          <button
            key={s}
            onClick={() => { setSubject(s); setTag('') }}
            className={`h-9 px-3 rounded-lg text-sm font-medium transition-all select-none no-press active:scale-[0.97] ${
              subject === s
                ? 'text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400'
            }`}
            style={subject === s ? { backgroundColor: SUBJECT_COLORS[s] } : undefined}
          >
            {t(`ielts.${s}`)}
          </button>
        ))}
      </div>

      {/* Tag filter (only for mistakes) */}
      {showMistakes && availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTag('')}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-all no-press ${
              !tag ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400'
            }`}
          >
            全部标签
          </button>
          {availableTags.map(t => (
            <button
              key={t}
              onClick={() => setTag(tag === t ? '' : t)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-all no-press ${
                tag === t ? 'bg-[#c0392b] text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-gray-400 px-1">共 {totalCount} 条</p>

      {/* Mistakes list */}
      {showMistakes && filteredMistakes.length > 0 && (
        <div className="panel divide-y divide-gray-100 dark:divide-gray-700/50 overflow-hidden">
          {filteredMistakes.slice(0, 50).map(m => (
            <div key={m.id} className="px-4 py-3 flex items-start gap-3">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold text-white shrink-0 mt-0.5"
                style={{ backgroundColor: '#c0392b' }}>
                {m.tag}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-800 dark:text-gray-200">
                  {m.questionNo && <span className="text-gray-400 mr-1">{m.questionNo}</span>}
                  {m.myAnswer && m.correctAnswer ? (
                    <>
                      <span className="line-through text-gray-400">{m.myAnswer}</span>
                      <span className="mx-1">→</span>
                      <span className="font-medium">{m.correctAnswer}</span>
                    </>
                  ) : m.correctAnswer ? (
                    <span className="font-medium">{m.correctAnswer}</span>
                  ) : null}
                </div>
                {m.explanation && (
                  <p className="text-xs text-gray-500 mt-1">{m.explanation}</p>
                )}
              </div>
              <span className="text-[10px] text-gray-400 tabular-nums shrink-0">{m.date.slice(5)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Expressions list */}
      {showExpressions && filteredExpressions.length > 0 && (
        <div className="panel divide-y divide-gray-100 dark:divide-gray-700/50 overflow-hidden">
          {filteredExpressions.slice(0, 50).map(item => (
            <div key={item.id} className="px-4 py-3">
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">表达</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.content}</p>
                  {item.meaning && <p className="text-xs text-gray-500 mt-0.5">{item.meaning}</p>}
                  {item.example && <p className="text-xs text-gray-400 italic mt-0.5">{item.example}</p>}
                </div>
                <span className="text-[10px] text-gray-400 tabular-nums shrink-0">{item.date.slice(5)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {totalCount === 0 && (
        <div className="panel p-10 text-center space-y-2">
          <p className="text-2xl">📚</p>
          <p className="text-sm text-gray-500">
            {search ? '没有匹配的结果' : '还没有错题和表达记录'}
          </p>
        </div>
      )}
    </div>
  )
}
