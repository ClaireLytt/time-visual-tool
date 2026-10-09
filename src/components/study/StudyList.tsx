import SimpleEntryList from '../common/SimpleEntryList'
import StudyItem from './StudyItem'
import type { StudyEntry } from '../../types/study'

interface StudyListProps {
  entries: StudyEntry[]
  onDelete: (id: string) => void
  onRepeat?: (entry: StudyEntry) => void
}

export default function StudyList({ entries, onDelete, onRepeat }: StudyListProps) {
  return (
    <SimpleEntryList
      entries={entries}
      emptyKey="study.emptyTitle"
      renderItem={entry => <StudyItem entry={entry} onDelete={onDelete} onRepeat={onRepeat} />}
    />
  )
}
