/* ─── IELTS Review Module — Constants ─── */

import type { IeltsSubject, IeltsSourceCategory } from './types'

export const IELTS_SUBJECTS: IeltsSubject[] = ['listening', 'reading', 'writing', 'speaking']

/** Preset error-cause tags per subject */
export const IELTS_TAGS: Record<IeltsSubject, string[]> = {
  listening: ['拼写', '单复数时态', '没听到', '同义替换', '跟丢了'],
  reading:   ['TFNG混淆', '定位错', '生词', '时间不够'],
  writing:   ['任务回应', '连贯', '词汇', '语法'],
  speaking:  ['流利度', '词汇', '语法', '发音'],
}

/** All tags flattened (for validation) */
export const ALL_TAGS: string[] = Object.values(IELTS_TAGS).flat()

/** Spaced repetition intervals in days */
export const REVIEW_INTERVALS = [1, 3, 7, 14] as const

/** Common question types for quick selection */
export const QUESTION_TYPES = [
  '填空', '选择', 'TFNG', '匹配', '表格', '简答', '段落标题', '句子完成', '图表', '其他',
] as const

/** Default source categories — "剑雅" is built-in and cannot be deleted */
export const DEFAULT_SOURCE_CATEGORIES: IeltsSourceCategory[] = [
  {
    id: 'builtin-cambridge',
    name: '剑雅',
    placeholder: '如 21 Test 2',
    subjects: [],   // empty = applies to all subjects
    builtIn: true,
  },
]

/** Subject display colors (for badges, charts) */
export const SUBJECT_COLORS: Record<IeltsSubject, string> = {
  listening: '#3b82f6',   // blue
  reading:   '#10b981',   // green
  writing:   '#f59e0b',   // amber
  speaking:  '#ef4444',   // red
}
