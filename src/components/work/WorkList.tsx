import SimpleEntryList from '../common/SimpleEntryList'
import WorkItem from './WorkItem'
import type { WorkEntry } from '../../types/work'

interface WorkListProps {
  entries: WorkEntry[]
  onDelete: (id: string) => void
  onRepeat?: (entry: WorkEntry) => void
}

export default function WorkList({ entries, onDelete, onRepeat }: WorkListProps) {
  return (
    <SimpleEntryList
      entries={entries}
      emptyKey="work.emptyTitle"
      renderItem={entry => <WorkItem entry={entry} onDelete={onDelete} onRepeat={onRepeat} />}
    />
  )
}
