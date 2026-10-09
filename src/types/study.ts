export interface StudyEntry {
  id: string
  subject: string
  duration: number
  notes: string
  date: string
  createdAt: string
}

export interface StudyStorageData {
  version: number
  entries: StudyEntry[]
}
