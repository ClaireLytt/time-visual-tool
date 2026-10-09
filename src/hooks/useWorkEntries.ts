import { createSimpleEntriesHook } from './createSimpleEntriesHook'
import type { WorkEntry } from '../types/work'

export const useWorkEntries = createSimpleEntriesHook<WorkEntry>('workData')
