/* ─── IELTS Review Module — Types ─── */

export type IeltsSubject = 'listening' | 'reading' | 'writing' | 'speaking'

export interface IeltsSession {
  id: string
  date: string
  subject: IeltsSubject
  source: string          // auto-generated: "分类名 detail", e.g. "剑雅 21 Test 2"
  categoryId?: string     // links to IeltsSourceCategory.id
  detail?: string         // free-text detail within that category
  score: string           // e.g. "32/40", "6.5"
  minutes: number
  note: string
  createdAt: string
}

export interface IeltsMistake {
  id: string
  sessionId: string
  questionNo: string      // e.g. "Q23"
  questionType: string    // e.g. "填空", "TFNG"
  myAnswer: string
  correctAnswer: string
  tag: string             // must be in IELTS_TAGS[subject]
  explanation: string
  date: string
  createdAt: string
}

export interface IeltsItem {
  id: string
  type: 'mistake' | 'expression' | 'todo'
  content: string
  meaning?: string        // for expressions
  example?: string        // for expressions
  source: string
  date: string
  createdAt: string
}

export interface IeltsReview {
  id: string
  itemId: string
  nextReviewDate: string  // yyyy-MM-dd
  reviewCount: number
  result: 'good' | 'again'
  createdAt: string
}

export interface IeltsReflection {
  id: string
  date: string
  text: string
  createdAt: string
}

export interface IeltsImportRecord {
  id: string
  importedAt: string
  rawJson: string
  status: 'success' | 'error'
}

/* ─── Source categories ─── */

export interface IeltsSourceCategory {
  id: string
  name: string
  placeholder: string       // input hint, e.g. "如 21 Test 2"
  subjects: IeltsSubject[]  // which subjects this category applies to (empty = all)
  builtIn?: boolean         // true = cannot be deleted
}

/* ─── Storage wrappers (Firestore document shape) ─── */

export interface IeltsSessionsData {
  version: number
  entries: IeltsSession[]
  sourceCategories?: IeltsSourceCategory[]
}

export interface IeltsMistakesData {
  version: number
  entries: IeltsMistake[]
}

export interface IeltsItemsData {
  version: number
  entries: IeltsItem[]
}

export interface IeltsReviewsData {
  version: number
  entries: IeltsReview[]
}

export interface IeltsReflectionsData {
  version: number
  entries: IeltsReflection[]
}

export interface IeltsImportsData {
  version: number
  entries: IeltsImportRecord[]
}

/* ─── Internal view routing ─── */

export type IeltsView =
  | { kind: 'home' }
  | { kind: 'record' }
  | { kind: 'import' }
  | { kind: 'stats' }
  | { kind: 'knowledge' }
  | { kind: 'weekly' }
