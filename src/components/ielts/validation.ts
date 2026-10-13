/* ─── IELTS — JSON Import Validation ─── */

import { IELTS_SUBJECTS, ALL_TAGS } from './constants'
import type { IeltsSubject } from './types'

/** Parsed import data (after validation) */
export interface ParsedImport {
  version: number
  date: string
  sessions: ParsedSession[]
  mistakes: ParsedMistake[]
  expressions: ParsedExpression[]
  todos: ParsedTodo[]
  reflection: string
}

export interface ParsedSession {
  subject: IeltsSubject
  source: string
  score: string
  minutes: number
  note: string
}

export interface ParsedMistake {
  subject: IeltsSubject
  source: string
  question_no: string
  question_type: string
  my_answer: string
  correct_answer: string
  tag: string
  explanation: string
}

export interface ParsedExpression {
  subject: IeltsSubject
  text: string
  meaning: string
  example: string
}

export interface ParsedTodo {
  content: string
  due_in_days: number
}

type ValidationResult =
  | { ok: true; data: ParsedImport }
  | { ok: false; errors: string[] }

const VALID_SUBJECTS = new Set<string>(IELTS_SUBJECTS)
const VALID_TAGS = new Set<string>(ALL_TAGS)

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s))
}

export function validateImportJson(raw: unknown): ValidationResult {
  const errors: string[] = []

  // Top-level structure
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, errors: ['根节点必须是 JSON 对象'] }
  }

  const obj = raw as Record<string, unknown>

  // version
  if (obj.version !== 1) {
    errors.push('version: 必须为 1')
  }

  // date
  if (typeof obj.date !== 'string' || !isValidDate(obj.date)) {
    errors.push('date: 必须是 yyyy-MM-dd 格式的日期')
  }

  // sessions
  if (!Array.isArray(obj.sessions)) {
    errors.push('sessions: 必须是数组')
  } else {
    obj.sessions.forEach((s: unknown, i: number) => {
      if (!s || typeof s !== 'object') {
        errors.push(`sessions[${i}]: 必须是对象`)
        return
      }
      const so = s as Record<string, unknown>
      if (typeof so.subject !== 'string' || !VALID_SUBJECTS.has(so.subject)) {
        errors.push(`sessions[${i}].subject: 必须是 ${IELTS_SUBJECTS.join('/')}`)
      }
      if (typeof so.source !== 'string' || !so.source.trim()) {
        errors.push(`sessions[${i}].source: 不能为空`)
      }
      if (typeof so.minutes !== 'number' || so.minutes < 0) {
        errors.push(`sessions[${i}].minutes: 必须是非负数`)
      }
    })
  }

  // mistakes
  if (!Array.isArray(obj.mistakes)) {
    errors.push('mistakes: 必须是数组')
  } else {
    obj.mistakes.forEach((m: unknown, i: number) => {
      if (!m || typeof m !== 'object') {
        errors.push(`mistakes[${i}]: 必须是对象`)
        return
      }
      const mo = m as Record<string, unknown>
      if (typeof mo.subject !== 'string' || !VALID_SUBJECTS.has(mo.subject)) {
        errors.push(`mistakes[${i}].subject: 必须是 ${IELTS_SUBJECTS.join('/')}`)
      }
      if (typeof mo.tag !== 'string' || !VALID_TAGS.has(mo.tag)) {
        errors.push(`mistakes[${i}].tag: '${mo.tag}' 不在标签表中`)
      }
    })
  }

  // expressions
  if (!Array.isArray(obj.expressions)) {
    errors.push('expressions: 必须是数组')
  } else {
    obj.expressions.forEach((e: unknown, i: number) => {
      if (!e || typeof e !== 'object') {
        errors.push(`expressions[${i}]: 必须是对象`)
        return
      }
      const eo = e as Record<string, unknown>
      if (typeof eo.subject !== 'string' || !VALID_SUBJECTS.has(eo.subject)) {
        errors.push(`expressions[${i}].subject: 必须是 ${IELTS_SUBJECTS.join('/')}`)
      }
      if (typeof eo.text !== 'string' || !eo.text.trim()) {
        errors.push(`expressions[${i}].text: 不能为空`)
      }
    })
  }

  // todos
  if (!Array.isArray(obj.todos)) {
    errors.push('todos: 必须是数组')
  } else {
    obj.todos.forEach((t: unknown, i: number) => {
      if (!t || typeof t !== 'object') {
        errors.push(`todos[${i}]: 必须是对象`)
        return
      }
      const to = t as Record<string, unknown>
      if (typeof to.content !== 'string' || !to.content.trim()) {
        errors.push(`todos[${i}].content: 不能为空`)
      }
      if (typeof to.due_in_days !== 'number' || to.due_in_days < 0) {
        errors.push(`todos[${i}].due_in_days: 必须是非负整数`)
      }
    })
  }

  // reflection
  if (typeof obj.reflection !== 'string') {
    errors.push('reflection: 必须是字符串')
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  // Build validated result
  const sessions = (obj.sessions as Record<string, unknown>[]).map(s => ({
    subject: s.subject as IeltsSubject,
    source: (s.source as string).trim(),
    score: typeof s.score === 'string' ? s.score.trim() : '',
    minutes: (s.minutes as number) || 0,
    note: typeof s.note === 'string' ? s.note.trim() : '',
  }))

  const mistakeEntries = (obj.mistakes as Record<string, unknown>[]).map(m => ({
    subject: m.subject as IeltsSubject,
    source: typeof m.source === 'string' ? m.source.trim() : '',
    question_no: typeof m.question_no === 'string' ? m.question_no.trim() : '',
    question_type: typeof m.question_type === 'string' ? m.question_type.trim() : '',
    my_answer: typeof m.my_answer === 'string' ? m.my_answer.trim() : '',
    correct_answer: typeof m.correct_answer === 'string' ? m.correct_answer.trim() : '',
    tag: m.tag as string,
    explanation: typeof m.explanation === 'string' ? m.explanation.trim() : '',
  }))

  const expressions = (obj.expressions as Record<string, unknown>[]).map(e => ({
    subject: e.subject as IeltsSubject,
    text: (e.text as string).trim(),
    meaning: typeof e.meaning === 'string' ? e.meaning.trim() : '',
    example: typeof e.example === 'string' ? e.example.trim() : '',
  }))

  const todos = (obj.todos as Record<string, unknown>[]).map(t => ({
    content: (t.content as string).trim(),
    due_in_days: (t.due_in_days as number) || 0,
  }))

  return {
    ok: true,
    data: {
      version: 1,
      date: obj.date as string,
      sessions,
      mistakes: mistakeEntries,
      expressions,
      todos,
      reflection: typeof obj.reflection === 'string' ? obj.reflection.trim() : '',
    },
  }
}
