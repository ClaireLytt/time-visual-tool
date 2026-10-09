import { createSimpleEntriesHook } from './createSimpleEntriesHook'
import type { StudyEntry } from '../types/study'

export const useStudyEntries = createSimpleEntriesHook<StudyEntry>('studyData')
