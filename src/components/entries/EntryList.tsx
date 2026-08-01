import type { TimeEntry } from '../../types'
import EntryItem from './EntryItem'

interface EntryListProps {
  entries: TimeEntry[]
  onDelete: (id: string) => void
}

function EntryList({ entries, onDelete }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-400 text-sm">今天还没有记录</p>
        <p className="text-gray-400 text-xs mt-1">添加你的第一条时间记录吧</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
      <h3 className="text-sm font-semibold text-gray-700 px-3 pt-2 pb-1">
        时间记录 ({entries.length})
      </h3>
      <div className="divide-y divide-gray-100">
        {entries.map(entry => (
          <EntryItem key={entry.id} entry={entry} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

export default EntryList
