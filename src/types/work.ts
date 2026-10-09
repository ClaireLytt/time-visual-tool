export interface WorkEntry {
  id: string
  project: string
  task: string
  duration: number
  date: string
  createdAt: string
}

export interface WorkStorageData {
  version: number
  entries: WorkEntry[]
}
