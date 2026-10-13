/* ─── IELTS — Knowledge Base (errors + expressions) ─── */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays } from 'date-fns'
import { toast } from 'sonner'
import ConfirmDialog from '../common/ConfirmDialog'
import AnimatedCollapse from '../common/AnimatedCollapse'
import { useIeltsMistakes, useIeltsItems, useIeltsSessions, useIeltsReviews, useIeltsVocab } from './hooks'
import { DEFAULT_EF } from './sm2'
import { IELTS_SUBJECTS, IELTS_TAGS, SUBJECT_COLORS } from './constants'
import { ACCENT, btnPrimary, btnGhost, btnToggle } from './styles'
import type { IeltsSubject, IeltsMistake, IeltsItem, IeltsReview } from './types'

type ItemType = 'all' | 'mistake' | 'expression'
type DateRange = '7d' | '30d' | '90d' | 'all'

const DATE_RANGES: { key: DateRange; label: string }[] = [
  { key: '7d',  label: '近7天' },
  { key: '30d', label: '近30天' },
  { key: '90d', label: '近90天' },
  { key: 'all', label: '全部' },
]

export default function KnowledgeView() {
  const { t } = useTranslation()
  const [subject, setSubject] = useState<IeltsSubject | 'all'>('all')
  const [tag, setTag] = useState('')
  const [search, setSearch] = useState('')
  const [itemType, setItemType] = useState<ItemType>('all')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false)
  const [detailItem, setDetailItem] = useState<{ mistake?: IeltsMistake; item?: IeltsItem; review?: IeltsReview } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const mistakesHook = useIeltsMistakes()
  const itemsHook = useIeltsItems()
  const sessionsHook = useIeltsSessions()
  const reviewsHook = useIeltsReviews()
  const vocabHook = useIeltsVocab()

  const { entries: allMistakes } = mistakesHook
  const { entries: allItems } = itemsHook
  const { entries: allSessions } = sessionsHook

  const sessionSubject = useMemo(() => new Map(allSessions.map(s => [s.id, s.subject])), [allSessions])
  const sessionSource = useMemo(() => new Map(allSessions.map(s => [s.id, s.source])), [allSessions])

  // Date filter boundary
  const dateAfter = useMemo(() => {
    if (dateRange === 'all') return ''
    const days = dateRange === '7d' ? 6 : dateRange === '30d' ? 29 : 89
    return format(subDays(new Date(), days), 'yyyy-MM-dd')
  }, [dateRange])

  // Available tags
  const availableTags = useMemo(() => {
    if (subject === 'all') return [...new Set(Object.values(IELTS_TAGS).flat())]
    return IELTS_TAGS[subject]
  }, [subject])

  // Review status lookup: itemId → review
  const reviewMap = useMemo(
    () => new Map(reviewsHook.entries.map(r => [r.itemId, r])),
    [reviewsHook.entries],
  )



  // Filter mistakes
  const filteredMistakes = useMemo(() => {
    let list = allMistakes
    if (dateAfter) list = list.filter(m => m.date >= dateAfter)
    if (subject !== 'all') list = list.filter(m => sessionSubject.get(m.sessionId) === subject)
    if (tag) list = list.filter(m => m.tag === tag)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m =>
        (m.myAnswer ?? '').toLowerCase().includes(q) ||
        (m.correctAnswer ?? '').toLowerCase().includes(q) ||
        (m.explanation ?? '').toLowerCase().includes(q) ||
        (m.questionNo ?? '').toLowerCase().includes(q),
      )
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [allMistakes, subject, tag, search, sessionSubject, dateAfter])

  // Filter expressions
  const filteredExpressions = useMemo(() => {
    let list = allItems.filter(it => it.type === 'expression')
    if (dateAfter) list = list.filter(it => it.date >= dateAfter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(it => it.content.toLowerCase().includes(q) || (it.meaning ?? '').toLowerCase().includes(q))
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [allItems, search, dateAfter])

  const showMistakes = itemType === 'all' || itemType === 'mistake'
  const showExpressions = itemType === 'all' || itemType === 'expression'
  const totalCount = (showMistakes ? filteredMistakes.length : 0) + (showExpressions ? filteredExpressions.length : 0)

  // Batch operations
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }, [])

  const handleBatchDelete = useCallback(() => {
    for (const id of selectedIds) mistakesHook.deleteEntry(id)
    toast.success(`已删除 ${selectedIds.size} 条`)
    setSelectedIds(new Set())
    setConfirmBatchDelete(false)
  }, [selectedIds, mistakesHook])

  // Build mistake→mastery lookup: match items to mistakes by content+date
  const masteryMap = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const map = new Map<string, 'due' | 'mastered'>()
    // Items created from mistakes use content pattern: "Q23 libary → library"
    // Match by date + content containing the mistake's answers
    for (const item of allItems) {
      if (item.type !== 'mistake') continue
      const review = reviewMap.get(item.id)
      if (!review) continue
      // Find the mistake that matches this item by date and content
      for (const m of allMistakes) {
        if (m.date !== item.date) continue
        const pattern = `${m.questionNo} ${m.myAnswer} → ${m.correctAnswer}`
        if (item.content === pattern) {
          if (review.reviewCount >= 4) map.set(m.id, 'mastered')
          else if (review.nextReviewDate <= today) map.set(m.id, 'due')
          break
        }
      }
    }
    return map
  }, [allItems, allMistakes, reviewMap])

  // Stats for top bar
  const statsThisWeek = useMemo(() => {
    const weekAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')
    return allMistakes.filter(m => m.date >= weekAgo).length
  }, [allMistakes])
  const statsDue = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return reviewsHook.entries.filter(r => r.nextReviewDate <= today).length
  }, [reviewsHook.entries])
  const statsMastered = useMemo(() => {
    return reviewsHook.entries.filter(r => r.reviewCount >= 4).length
  }, [reviewsHook.entries])

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="panel p-3 text-center">
          <p className="text-sm text-gray-400 mb-0.5">📝 本周新增</p>
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{statsThisWeek}</p>
        </div>
        <div className="panel p-3 text-center">
          <p className="text-sm text-gray-400 mb-0.5">🔄 待复习</p>
          <p className={`text-2xl font-bold tabular-nums ${statsDue > 0 ? 'text-[#c0392b]' : 'text-gray-900 dark:text-gray-100'}`}>{statsDue}</p>
        </div>
        <div className="panel p-3 text-center">
          <p className="text-sm text-gray-400 mb-0.5">✅ 已掌握</p>
          <p className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">{statsMastered}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜索错题、表达..." className="input-base w-full rounded-lg text-sm h-11 pl-9" />
      </div>

      {/* Filter row 1: type + subject + date range */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type filter */}
        {(['all', 'mistake', 'expression'] as ItemType[]).map(tp => (
          <button key={tp} onClick={() => setItemType(tp)}
            className={`h-10 px-4 rounded-full text-sm font-medium transition-all duration-150 select-none no-press active:scale-[0.97] ${
              itemType === tp
                ? 'bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800 shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 hover:text-gray-600'
            }`}>
            {tp === 'all' ? '全部' : tp === 'mistake' ? '❌ 错题' : '📝 表达'}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-0.5" />

        {/* Subject filter */}
        <button onClick={() => { setSubject('all'); setTag('') }}
          className={`${btnToggle(subject === 'all')} h-10 px-4 rounded-lg text-sm`}>
          全部科目
        </button>
        {IELTS_SUBJECTS.map(s => (
          <button key={s} onClick={() => { setSubject(s); setTag('') }}
            className={`h-10 px-4 rounded-full text-sm font-medium transition-all duration-150 select-none no-press active:scale-[0.97] ${
              subject === s ? 'text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400'
            }`}
            style={subject === s ? { backgroundColor: SUBJECT_COLORS[s] } : undefined}>
            {t(`ielts.${s}`)}
          </button>
        ))}

        <div className="flex-1" />

        {/* Date range */}
        <div className="flex gap-1">
          {DATE_RANGES.map(r => (
            <button key={r.key} onClick={() => setDateRange(r.key)}
              className={`h-8 px-3 rounded-full text-xs font-medium transition-all duration-150 select-none no-press ${
                dateRange === r.key
                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold'
                  : 'bg-gray-50 dark:bg-gray-800/40 text-gray-400 hover:text-gray-600'
              }`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter row 2: error-cause tags — horizontal scroll */}
      {showMistakes && availableTags.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none">
          <button onClick={() => setTag('')}
            className={`h-9 px-4 rounded-full text-sm font-medium transition-all no-press shrink-0 ${
              !tag ? 'bg-[#c0392b]/10 text-[#c0392b] font-semibold' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400'
            }`}>
            全部标签
          </button>
          {availableTags.map(tg => (
            <button key={tg} onClick={() => setTag(tag === tg ? '' : tg)}
              className={`h-9 px-4 rounded-full text-sm font-medium transition-all no-press shrink-0 ${
                tag === tg ? 'bg-[#c0392b] text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400'
              }`}>
              {tg}
            </button>
          ))}
        </div>
      )}

      {/* Results count + batch bar */}
      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-400 flex-1">共 {totalCount} 条</p>
        {selectedIds.size > 0 && (
          <>
            <span className="text-xs font-medium text-[#c0392b]">已选 {selectedIds.size}</span>
            <button onClick={() => setSelectedIds(new Set())}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100
                dark:hover:bg-gray-700/40 transition-colors select-none">
              取消
            </button>
            <button onClick={() => setConfirmBatchDelete(true)}
              className="text-xs font-medium text-white px-3 py-1 rounded-full hover:brightness-110 transition-colors select-none"
              style={{ backgroundColor: ACCENT }}>
              批量删除
            </button>
          </>
        )}
      </div>

      {/* Mistakes list */}
      {showMistakes && filteredMistakes.length > 0 && (
        <div className="panel divide-y divide-gray-100 dark:divide-gray-700/40 overflow-hidden">
          {filteredMistakes.slice(0, 50).map(m => {
            const subj = sessionSubject.get(m.sessionId) as IeltsSubject | undefined
            const source = sessionSource.get(m.sessionId) ?? ''
            const color = subj ? SUBJECT_COLORS[subj] : '#c0392b'
            const mastery = masteryMap.get(m.id) ?? null
            const isExpanded = expandedId === m.id
            return (
              <div key={m.id}>
                <div className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50/60 dark:hover:bg-gray-700/20
                  transition-colors cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : m.id)}>
                  {/* Checkbox */}
                  <input type="checkbox" checked={selectedIds.has(m.id)}
                    onChange={() => toggleSelect(m.id)}
                    onClick={e => e.stopPropagation()}
                    className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600
                      text-[#c0392b] focus:ring-[#c0392b]/30 cursor-pointer shrink-0" />

                  {/* Tag badge */}
                  <span className="px-1.5 py-px rounded text-xs font-bold text-white leading-tight shrink-0"
                    style={{ backgroundColor: color }}>
                    {m.tag}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 dark:text-gray-200 truncate">
                      {m.questionNo && <span className="text-gray-400 mr-1">{m.questionNo}</span>}
                      {m.myAnswer && m.correctAnswer ? (
                        <><span className="line-through text-gray-400">{m.myAnswer}</span> → <span className="font-medium">{m.correctAnswer}</span></>
                      ) : m.correctAnswer ? <span className="font-medium">{m.correctAnswer}</span> : (
                        <span className="text-sm text-gray-400">暂无答案</span>
                      )}
                    </div>
                    {source && <p className="text-xs text-gray-400 truncate mt-0.5">📎 {source}</p>}
                  </div>

                  {/* Mastery + date + expand icon */}
                  <div className="flex items-center gap-2 shrink-0">
                    {mastery === 'due' && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600
                        dark:bg-amber-900/20 dark:text-amber-400">待复习</span>
                    )}
                    {mastery === 'mastered' && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600
                        dark:bg-green-900/20 dark:text-green-400">已掌握</span>
                    )}
                    <span className="text-xs text-gray-400 tabular-nums">{m.date.slice(5)}</span>
                    <span className="text-xs text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Inline edit form */}
                <AnimatedCollapse open={isExpanded}>
                  <MistakeEditPanel mistake={m} onUpdate={(patch) => {
                    mistakesHook.updateEntry(m.id, patch)
                    toast.success('已更新')
                  }} />
                </AnimatedCollapse>
              </div>
            )
          })}
          {filteredMistakes.length > 50 && (
            <p className="text-xs text-gray-400 text-center py-2">仅显示前 50 条</p>
          )}
        </div>
      )}

      {/* Expressions list */}
      {showExpressions && filteredExpressions.length > 0 && (
        <div className="panel divide-y divide-gray-100 dark:divide-gray-700/40 overflow-hidden">
          {filteredExpressions.slice(0, 50).map(item => (
            <div key={item.id}
              className="px-3 py-2.5 hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors cursor-pointer"
              onClick={() => setDetailItem({ item })}>
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-900/30
                  text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">表达</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.content}</p>
                  {item.meaning && <p className="text-xs text-gray-500 mt-0.5">{item.meaning}</p>}
                  {item.example && <p className="text-xs text-gray-400 italic mt-0.5 truncate">{item.example}</p>}
                </div>
                <span className="text-xs text-gray-400 tabular-nums shrink-0">{item.date.slice(5)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {totalCount === 0 && (
        <div className="panel p-10 text-center space-y-3">
          <p className="text-3xl">📚</p>
          <p className="text-base font-medium text-gray-600 dark:text-gray-300">
            {search ? '没有匹配的结果' : '还没有错题和表达记录'}
          </p>
          <p className="text-xs text-gray-400">
            在「记录」或「导入」页面添加练习数据后，错题和表达会自动归集到这里
          </p>
        </div>
      )}

      {/* Detail modal */}
      {detailItem && (
        <DetailModal
          mistake={detailItem.mistake}
          item={detailItem.item}
          sessionSource={sessionSource}
          sessionSubject={sessionSubject}
          onClose={() => setDetailItem(null)}
          onUpdateMistake={(id, patch) => { mistakesHook.updateEntry(id, patch); toast.success('已更新') }}
          onAddVocab={(word, meaning, source) => {
            if (vocabHook.entries.some(w => w.word.toLowerCase() === word.toLowerCase())) {
              toast.error('该词汇已存在'); return
            }
            vocabHook.addEntry({
              id: crypto.randomUUID(), word, meaning, source, listType: 'custom',
              easeFactor: DEFAULT_EF, interval: 0, repetitions: 0,
              nextReview: format(new Date(), 'yyyy-MM-dd'),
              createdAt: new Date().toISOString(),
            })
            toast.success(`「${word}」已添加到词汇本`)
          }}
        />
      )}

      {/* Batch delete confirm */}
      <ConfirmDialog open={confirmBatchDelete} title="批量删除"
        message={`确定删除选中的 ${selectedIds.size} 条记录？`}
        onConfirm={handleBatchDelete} onCancel={() => setConfirmBatchDelete(false)} confirmVariant="danger" />
    </div>
  )
}

/* ─── Detail Modal ─── */

function DetailModal({ mistake, item, sessionSource, sessionSubject, onClose, onUpdateMistake, onAddVocab }: {
  mistake?: IeltsMistake
  item?: IeltsItem
  sessionSource: Map<string, string>
  sessionSubject: Map<string, string>
  onClose: () => void
  onUpdateMistake: (id: string, patch: Partial<IeltsMistake>) => void
  onAddVocab?: (word: string, meaning: string, source: string) => void
}) {
  const { t } = useTranslation()
  const [editTag, setEditTag] = useState(mistake?.tag ?? '')
  const [vocabAdded, setVocabAdded] = useState(false)

  if (!mistake && !item) return null

  const subj = mistake ? sessionSubject.get(mistake.sessionId) as IeltsSubject | undefined : undefined
  const source = mistake ? sessionSource.get(mistake.sessionId) ?? '' : item?.source ?? ''
  const color = subj ? SUBJECT_COLORS[subj] : '#c0392b'
  const tags = subj ? IELTS_TAGS[subj] : Object.values(IELTS_TAGS).flat()

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-x-4 top-[15%] z-50 max-w-lg mx-auto
        bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/50">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {mistake ? '错题详情' : '表达详情'}
          </h3>
          <button onClick={onClose} className={`${btnGhost} h-8 w-8`}>✕</button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {mistake && (
            <>
              {/* Subject + tag */}
              <div className="flex items-center gap-2 flex-wrap">
                {subj && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold text-white"
                    style={{ backgroundColor: color }}>
                    {t(`ielts.${subj}`)}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#c0392b]/8 text-[#c0392b]">
                  {mistake.tag}
                </span>
                <span className="text-xs text-gray-400 tabular-nums">{mistake.date}</span>
              </div>

              {/* Answer */}
              <div className="panel p-3">
                {mistake.questionNo && (
                  <p className="text-xs text-gray-400 mb-1">题号：{mistake.questionNo}</p>
                )}
                {mistake.questionType && (
                  <p className="text-xs text-gray-400 mb-1">题型：{mistake.questionType}</p>
                )}
                {(mistake.myAnswer || mistake.correctAnswer) && (
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    {mistake.myAnswer && <span className="line-through text-gray-400 mr-2">{mistake.myAnswer}</span>}
                    {mistake.correctAnswer && <span className="font-medium text-green-600 dark:text-green-400">→ {mistake.correctAnswer}</span>}
                  </div>
                )}
              </div>

              {/* Explanation */}
              {mistake.explanation && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">解析</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{mistake.explanation}</p>
                </div>
              )}

              {/* Source */}
              {source && (
                <p className="text-xs text-gray-400">📎 来源：{source}</p>
              )}

              {/* Edit tag */}
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1.5">修改错因标签</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tg => (
                    <button key={tg} onClick={() => setEditTag(tg)}
                      className={`h-9 px-4 rounded-full text-sm font-medium transition-all no-press shrink-0 ${
                        editTag === tg ? 'bg-[#c0392b] text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400'
                      }`}>
                      {tg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to vocab */}
              {onAddVocab && mistake.correctAnswer && (
                <button
                  onClick={() => {
                    onAddVocab(mistake.correctAnswer, mistake.explanation || mistake.tag, source)
                    setVocabAdded(true)
                  }}
                  disabled={vocabAdded}
                  className={`w-full h-10 rounded-full text-sm font-medium transition-colors select-none no-press ${
                    vocabAdded
                      ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  }`}>
                  {vocabAdded ? '✓ 已添加到词汇本' : '📖 添加关联词汇到词汇本'}
                </button>
              )}
            </>
          )}

          {item && (
            <>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{item.content}</p>
              {item.meaning && <p className="text-sm text-gray-600 dark:text-gray-400">{item.meaning}</p>}
              {item.example && <p className="text-sm text-gray-400 italic">{item.example}</p>}
              {item.source && <p className="text-xs text-gray-400 mt-2">📎 {item.source}</p>}
              <p className="text-xs text-gray-400">{item.date}</p>
            </>
          )}
        </div>

        {/* Footer */}
        {mistake && editTag !== mistake.tag && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/50 flex justify-end">
            <button
              onClick={() => { onUpdateMistake(mistake.id, { tag: editTag }); onClose() }}
              className={`${btnPrimary()} h-10 px-5 text-sm`}
              style={{ backgroundColor: ACCENT }}>
              保存修改
            </button>
          </div>
        )}
      </div>
    </>
  )
}

/* ── Inline mistake edit panel ── */

function MistakeEditPanel({ mistake, onUpdate }: {
  mistake: IeltsMistake
  onUpdate: (patch: Partial<IeltsMistake>) => void
}) {
  const [questionNo, setQuestionNo] = useState(mistake.questionNo)
  const [myAnswer, setMyAnswer] = useState(mistake.myAnswer)
  const [correctAnswer, setCorrectAnswer] = useState(mistake.correctAnswer)
  const [explanation, setExplanation] = useState(mistake.explanation)

  const hasChanges = questionNo !== mistake.questionNo || myAnswer !== mistake.myAnswer
    || correctAnswer !== mistake.correctAnswer || explanation !== mistake.explanation

  return (
    <div className="px-4 pb-3 pt-2 border-t border-gray-100 dark:border-gray-700/40 space-y-2 ml-6">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-400 mb-0.5 block">题号</label>
          <input value={questionNo} onChange={e => setQuestionNo(e.target.value)}
            placeholder="如 Q23" className="input-base w-full rounded-xl text-sm h-9" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-0.5 block">我的答案</label>
          <input value={myAnswer} onChange={e => setMyAnswer(e.target.value)}
            placeholder="我写的答案" className="input-base w-full rounded-xl text-sm h-9" />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-0.5 block">正确答案</label>
        <input value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)}
          placeholder="正确答案" className="input-base w-full rounded-xl text-sm h-9" />
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-0.5 block">错因分析</label>
        <textarea value={explanation} onChange={e => setExplanation(e.target.value)}
          placeholder="为什么错了..."
          rows={2} className="input-base w-full rounded-xl text-sm resize-none" style={{ minHeight: 48 }} />
      </div>
      {hasChanges && (
        <div className="flex justify-end">
          <button onClick={() => onUpdate({
            questionNo: questionNo.trim(),
            myAnswer: myAnswer.trim(),
            correctAnswer: correctAnswer.trim(),
            explanation: explanation.trim(),
          })}
            className="h-8 px-4 rounded-full text-xs font-semibold text-white hover:brightness-110 transition-colors select-none"
            style={{ backgroundColor: ACCENT }}>
            保存修改
          </button>
        </div>
      )}
    </div>
  )
}
