/* ─── IELTS — JSON Import Page ─── */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format, addDays } from 'date-fns'
import { toast } from 'sonner'
import AnimatedCollapse from '../common/AnimatedCollapse'
import { validateImportJson } from './validation'
import type { ParsedImport } from './validation'
import { useIeltsSessions, useIeltsMistakes, useIeltsItems, useIeltsReviews, useIeltsReflections, useIeltsImports } from './hooks'
import { IELTS_TAGS, SUBJECT_COLORS } from './constants'
import { ACCENT, btnPrimary, btnSecondary, textareaClass } from './styles'
import { getNextReviewDate } from './utils'
import type { IeltsSubject } from './types'

/** Placeholder prompt — user will customize later */
const AI_PROMPT = `请把我们今天的学习对话整理成 JSON，严格遵守以下格式，只输出 JSON，不要加代码块以外的任何文字。

字段：version（固定1）、date、sessions、mistakes、expressions、todos、reflection。

约束：
1. subject 只能是 listening / reading / writing / speaking
2. tag 只能从下面选：
   听力：拼写、单复数时态、没听到、同义替换、跟丢了
   阅读：TFNG混淆、定位错、生词、时间不够
   写作：任务回应、连贯、词汇、语法
   口语：流利度、词汇、语法、发音
3. 今天没聊到的内容，对应数组写 []
4. 不确定的信息宁可留空字符串，不要编造`

export default function ImportView({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { t } = useTranslation()
  const [raw, setRaw] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [parsed, setParsed] = useState<ParsedImport | null>(null)
  const [showTagTable, setShowTagTable] = useState(false)
  const [copied, setCopied] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ sessions: number; mistakes: number; expressions: number; todos: number } | null>(null)

  // Checkboxes for selective import
  const [checkedSessions, setCheckedSessions] = useState<boolean[]>([])
  const [checkedMistakes, setCheckedMistakes] = useState<boolean[]>([])
  const [checkedExpressions, setCheckedExpressions] = useState<boolean[]>([])
  const [checkedTodos, setCheckedTodos] = useState<boolean[]>([])

  const sessions = useIeltsSessions()
  const mistakes = useIeltsMistakes()
  const items = useIeltsItems()
  const reviews = useIeltsReviews()
  const reflections = useIeltsReflections()
  const imports = useIeltsImports()

  // Dedup detection
  const existingSessions = useMemo(() => {
    if (!parsed) return new Set<string>()
    return new Set(
      sessions.entries
        .filter(s => s.date === parsed.date)
        .map(s => `${s.date}|${s.source}`),
    )
  }, [sessions.entries, parsed])

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }, [])

  const handleValidate = useCallback(() => {
    setErrors([])
    setParsed(null)
    let obj: unknown
    try {
      obj = JSON.parse(raw)
    } catch (err) {
      const msg = err instanceof SyntaxError ? err.message : '未知错误'
      setErrors([`JSON 解析失败：${msg}`])
      return
    }
    const result = validateImportJson(obj)
    if (!result.ok) {
      setErrors(result.errors)
    } else {
      setParsed(result.data)
      setCheckedSessions(result.data.sessions.map(() => true))
      setCheckedMistakes(result.data.mistakes.map(() => true))
      setCheckedExpressions(result.data.expressions.map(() => true))
      setCheckedTodos(result.data.todos.map(() => true))
    }
  }, [raw])

  const handleConfirmImport = useCallback(() => {
    if (!parsed || importing) return
    setImporting(true)
    setImportResult(null)
    const now = new Date().toISOString()
    const date = parsed.date
    const importedCounts = { sessions: 0, mistakes: 0, expressions: 0, todos: 0 }

    // Build session ID lookup: new sessions + existing ones
    const sessionIdMap = new Map<string, string>()

    // Pre-populate with existing sessions for this date (for dedup-skipped ones)
    for (const existing of sessions.entries) {
      if (existing.date === date) {
        sessionIdMap.set(`${existing.subject}|${existing.source}`, existing.id)
      }
    }

    // Create new sessions (skipping duplicates)
    parsed.sessions.forEach((s, i) => {
      if (!checkedSessions[i]) return
      const key = `${date}|${s.source}`
      if (existingSessions.has(key)) return // already in sessionIdMap from above
      const id = crypto.randomUUID()
      sessionIdMap.set(`${s.subject}|${s.source}`, id)
      sessions.addEntry({
        id, date, subject: s.subject, source: s.source,
        score: s.score, minutes: s.minutes, note: s.note, createdAt: now,
      })
      importedCounts.sessions++
    })

    parsed.mistakes.forEach((m, i) => {
      if (!checkedMistakes[i]) return
      const mistakeId = crypto.randomUUID()
      // Link to session (new or existing)
      const linkedSessionId = sessionIdMap.get(`${m.subject}|${m.source}`) ?? ''
      mistakes.addEntry({
        id: mistakeId, sessionId: linkedSessionId, questionNo: m.question_no,
        questionType: m.question_type, myAnswer: m.my_answer,
        correctAnswer: m.correct_answer, tag: m.tag,
        explanation: m.explanation, date, createdAt: now,
      })
      const itemId = crypto.randomUUID()
      items.addEntry({
        id: itemId, type: 'mistake',
        content: `${m.question_no} ${m.my_answer} → ${m.correct_answer}`,
        source: m.source, date, createdAt: now,
      })
      reviews.addEntry({
        id: crypto.randomUUID(), itemId,
        nextReviewDate: getNextReviewDate(0),
        reviewCount: 0, result: 'again', createdAt: now,
      })
      importedCounts.mistakes++
    })

    parsed.expressions.forEach((e, i) => {
      if (!checkedExpressions[i]) return
      const itemId = crypto.randomUUID()
      items.addEntry({
        id: itemId, type: 'expression',
        content: e.text, meaning: e.meaning, example: e.example,
        source: '', date, createdAt: now,
      })
      reviews.addEntry({
        id: crypto.randomUUID(), itemId,
        nextReviewDate: getNextReviewDate(0),
        reviewCount: 0, result: 'again', createdAt: now,
      })
      importedCounts.expressions++
    })

    parsed.todos.forEach((td, i) => {
      if (!checkedTodos[i]) return
      const itemId = crypto.randomUUID()
      items.addEntry({
        id: itemId, type: 'todo', content: td.content,
        source: '', date, createdAt: now,
      })
      reviews.addEntry({
        id: crypto.randomUUID(), itemId,
        nextReviewDate: format(addDays(new Date(), td.due_in_days), 'yyyy-MM-dd'),
        reviewCount: 0, result: 'again', createdAt: now,
      })
      importedCounts.todos++
    })

    if (parsed.reflection) {
      reflections.addEntry({
        id: crypto.randomUUID(), date,
        text: parsed.reflection, createdAt: now,
      })
    }

    imports.addEntry({
      id: crypto.randomUUID(), importedAt: now,
      rawJson: raw, status: 'success',
    })

    // Optimistic: data is written to React state immediately (visible in UI).
    // Firestore writes happen async in the background via setDoc.
    // If Firestore fails, the error state on each hook will update,
    // but data remains in React state until page refresh.
    toast.success(`已导入 ${importedCounts.sessions} 条练习、${importedCounts.mistakes} 条错题、${importedCounts.expressions} 条表达、${importedCounts.todos} 条待办`)
    setImportResult(importedCounts)
    setImporting(false)
    setRaw('')
    setParsed(null)
  }, [parsed, raw, importing, checkedSessions, checkedMistakes, checkedExpressions, checkedTodos, existingSessions, sessions, mistakes, items, reviews, reflections, imports, t])

  // Preview summary counts
  const previewSummary = useMemo(() => {
    if (!parsed) return null
    const sessionCount = checkedSessions.filter(Boolean).length
    const mistakeCount = checkedMistakes.filter(Boolean).length
    const exprCount = checkedExpressions.filter(Boolean).length
    const todoCount = checkedTodos.filter(Boolean).length
    return { sessionCount, mistakeCount, exprCount, todoCount }
  }, [parsed, checkedSessions, checkedMistakes, checkedExpressions, checkedTodos])

  // Reactive Firestore error detection
  const writeErrors = [
    sessions.error && '练习记录',
    mistakes.error && '错题',
    items.error && '知识库',
    reviews.error && '复习计划',
    reflections.error && '反思',
    imports.error && '导入记录',
  ].filter(Boolean) as string[]

  return (
    <div className="space-y-3">
      {/* Firestore write error banner */}
      {writeErrors.length > 0 && (
        <div className="panel p-4 border-l-4 border-amber-500">
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">⚠ 数据保存异常</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            以下数据可能未同步到云端：{writeErrors.join('、')}。请检查网络连接或登录状态，刷新后查看数据是否存在。
          </p>
        </div>
      )}

      {/* Tip + Copy prompt + Tag table */}
      <div className="panel p-4 space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          在外部 AI 中用固定指令整理学习记录为 JSON，粘贴到下方即可导入。
        </p>
        <button
          onClick={handleCopyPrompt}
          className={`${btnSecondary} h-9 px-4 text-sm`}
        >
          {copied ? '✓ 已复制' : '📋 复制固定指令'}
        </button>
        <button
          onClick={() => setShowTagTable(!showTagTable)}
          className="block text-[13px] text-[#c0392b] font-medium no-press"
        >
          {showTagTable ? '▲ 收起标签表' : '▶ 查看标签表'}
        </button>
        <AnimatedCollapse open={showTagTable}>
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
            {(Object.entries(IELTS_TAGS) as [IeltsSubject, string[]][]).map(([subj, tags]) => (
              <div key={subj} className="flex items-start gap-2">
                <span
                  className="text-[13px] font-semibold shrink-0 w-10"
                  style={{ color: SUBJECT_COLORS[subj] }}
                >
                  {t(`ielts.${subj}`)}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-[13px]">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AnimatedCollapse>
      </div>

      {/* JSON textarea */}
      <div className="panel p-4">
        <textarea
          value={raw}
          onChange={e => { setRaw(e.target.value); setParsed(null); setErrors([]) }}
          placeholder="粘贴 JSON..."
          rows={6}
          className={`${textareaClass} font-mono`}
          style={{ minHeight: 120 }}
          spellCheck={false}
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleValidate}
            disabled={!raw.trim()}
            className={`${btnPrimary(!raw.trim())} h-11 px-6`}
            style={{ backgroundColor: ACCENT }}
          >
            {t('ielts.validate')}
          </button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="panel p-4 border-l-4 border-[#e74c3c]">
          <p className="text-sm font-semibold text-[#e74c3c] mb-2">{t('ielts.importErrors')} ({errors.length})</p>
          <ul className="space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-[13px] text-gray-600 dark:text-gray-400 font-mono">• {err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {parsed && previewSummary && (
        <div className="space-y-3">
          <div className="panel p-4">
            {/* Summary line */}
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              将导入：
              <span className="text-[#c0392b] font-semibold ml-1">{previewSummary.sessionCount} 条记录</span>
              {previewSummary.mistakeCount > 0 && <span className="text-gray-500">、{previewSummary.mistakeCount} 条错题</span>}
              {previewSummary.exprCount > 0 && <span className="text-gray-500">、{previewSummary.exprCount} 条表达</span>}
              {previewSummary.todoCount > 0 && <span className="text-gray-500">、{previewSummary.todoCount} 条待办</span>}
            </p>

            <p className="text-xs text-gray-400 mb-2">日期：{parsed.date}</p>

            {/* Sessions */}
            {parsed.sessions.length > 0 && (
              <PreviewSection title={`练习 (${parsed.sessions.length})`}>
                {parsed.sessions.map((s, i) => (
                  <label key={i} className="flex items-start gap-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={checkedSessions[i] ?? true}
                      onChange={e => {
                        const next = [...checkedSessions]
                        next[i] = e.target.checked
                        setCheckedSessions(next)
                      }}
                      className="mt-0.5"
                    />
                    <span className="text-[13px] text-gray-700 dark:text-gray-300">
                      [{s.subject}] {s.source} {s.score && `— ${s.score}`} {s.minutes}min
                      {existingSessions.has(`${parsed.date}|${s.source}`) && (
                        <span className="ml-1 text-amber-500 font-medium">⚠ {t('ielts.duplicate')}</span>
                      )}
                    </span>
                  </label>
                ))}
              </PreviewSection>
            )}

            {/* Mistakes */}
            {parsed.mistakes.length > 0 && (
              <PreviewSection title={`错题 (${parsed.mistakes.length})`}>
                {parsed.mistakes.map((m, i) => (
                  <label key={i} className="flex items-start gap-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={checkedMistakes[i] ?? true}
                      onChange={e => {
                        const next = [...checkedMistakes]
                        next[i] = e.target.checked
                        setCheckedMistakes(next)
                      }}
                      className="mt-0.5"
                    />
                    <span className="text-[13px] text-gray-700 dark:text-gray-300">
                      {m.question_no} <span className="text-[#c0392b] font-medium">[{m.tag}]</span> {m.my_answer} → {m.correct_answer}
                    </span>
                  </label>
                ))}
              </PreviewSection>
            )}

            {/* Expressions */}
            {parsed.expressions.length > 0 && (
              <PreviewSection title={`表达 (${parsed.expressions.length})`}>
                {parsed.expressions.map((e, i) => (
                  <label key={i} className="flex items-start gap-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={checkedExpressions[i] ?? true}
                      onChange={ev => {
                        const next = [...checkedExpressions]
                        next[i] = ev.target.checked
                        setCheckedExpressions(next)
                      }}
                      className="mt-0.5"
                    />
                    <span className="text-[13px] text-gray-700 dark:text-gray-300">
                      <strong>{e.text}</strong> — {e.meaning}
                    </span>
                  </label>
                ))}
              </PreviewSection>
            )}

            {/* Todos */}
            {parsed.todos.length > 0 && (
              <PreviewSection title={`待办 (${parsed.todos.length})`}>
                {parsed.todos.map((td, i) => (
                  <label key={i} className="flex items-start gap-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={checkedTodos[i] ?? true}
                      onChange={e => {
                        const next = [...checkedTodos]
                        next[i] = e.target.checked
                        setCheckedTodos(next)
                      }}
                      className="mt-0.5"
                    />
                    <span className="text-[13px] text-gray-700 dark:text-gray-300">
                      {td.content} <span className="text-gray-400">({td.due_in_days}天后)</span>
                    </span>
                  </label>
                ))}
              </PreviewSection>
            )}

            {/* Reflection */}
            {parsed.reflection && (
              <PreviewSection title="反思">
                <p className="text-[13px] text-gray-600 dark:text-gray-400 py-1">{parsed.reflection}</p>
              </PreviewSection>
            )}
          </div>

          {/* Actions — confirm + back */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setParsed(null); setErrors([]) }}
              className={`${btnSecondary} h-11 px-5`}
            >
              返回修改
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={importing}
              className={`${btnPrimary(importing)} h-11 px-6`}
              style={{ backgroundColor: ACCENT }}
            >
              {importing ? '导入中...' : t('ielts.confirmImport')}
            </button>
          </div>
        </div>
      )}
      {/* Import result */}
      {importResult && (
        <div className="panel p-4 border-l-4 border-green-500 space-y-2">
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">✓ 导入成功</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            已导入 {importResult.sessions} 条练习、{importResult.mistakes} 条错题、
            {importResult.expressions} 条表达、{importResult.todos} 条待办
          </p>
          <button
            onClick={() => onNavigate?.('record')}
            className={`${btnSecondary} h-9 px-4 text-sm`}
          >
            → 查看记录
          </button>
        </div>
      )}

      {/* Import history */}
      {imports.entries.length > 0 && (
        <div className="panel p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">导入历史</p>
          <div className="space-y-2">
            {[...imports.entries].sort((a, b) => b.importedAt.localeCompare(a.importedAt)).slice(0, 5).map(imp => (
              <ImportHistoryItem key={imp.id} record={imp} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ImportHistoryItem({ record }: { record: import('./types').IeltsImportRecord }) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(record.importedAt)
  const label = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

  // Count items in the raw JSON
  let counts = ''
  try {
    const data = JSON.parse(record.rawJson)
    const parts = []
    if (data.sessions?.length) parts.push(`${data.sessions.length} 练习`)
    if (data.mistakes?.length) parts.push(`${data.mistakes.length} 错题`)
    if (data.expressions?.length) parts.push(`${data.expressions.length} 表达`)
    if (data.todos?.length) parts.push(`${data.todos.length} 待办`)
    counts = parts.join('、')
  } catch { /* ignore */ }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-lg px-2 py-1.5 -mx-2 no-press"
      >
        <span className="text-gray-500 tabular-nums shrink-0">{label}</span>
        <span className="text-gray-400 text-xs truncate flex-1">{counts}</span>
        <span className="text-gray-400 text-xs shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <pre className="mt-1 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400 overflow-auto max-h-48 whitespace-pre-wrap">
          {(() => { try { return JSON.stringify(JSON.parse(record.rawJson), null, 2) } catch { return record.rawJson } })()}
        </pre>
      )}
    </div>
  )
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
      <div className="pl-1">{children}</div>
    </div>
  )
}
