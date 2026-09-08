import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { STORAGE_KEY } from '../constants'
import { FINANCE_STORAGE_KEY } from '../constants/finance'
import { EATING_STORAGE_KEY } from '../constants/eating'
import { DIARY_STORAGE_KEY } from '../constants/diary'
import { SPORT_STORAGE_KEY } from '../constants/sport'

const MIGRATION_FLAG = 'time-visual-migration-done'

const KEY_TO_COLLECTION: [string, string][] = [
  [STORAGE_KEY, 'timeData'],
  [FINANCE_STORAGE_KEY, 'financeData'],
  [EATING_STORAGE_KEY, 'eatingData'],
  [DIARY_STORAGE_KEY, 'diaryData'],
  [SPORT_STORAGE_KEY, 'sportData'],
]

export function hasLocalData(): boolean {
  if (localStorage.getItem(MIGRATION_FLAG)) return false
  return KEY_TO_COLLECTION.some(([key]) => {
    const raw = localStorage.getItem(key)
    return raw !== null && raw !== ''
  })
}

export async function migrateLocalStorageToFirestore(uid: string): Promise<void> {
  for (const [key, collection] of KEY_TO_COLLECTION) {
    const raw = localStorage.getItem(key)
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null) {
        const docRef = doc(db, 'users', uid, collection, 'data')
        await setDoc(docRef, parsed)
      }
    } catch {
      // skip invalid data
    }
  }
  localStorage.setItem(MIGRATION_FLAG, '1')
}

export function markMigrationDone(): void {
  localStorage.setItem(MIGRATION_FLAG, '1')
}
