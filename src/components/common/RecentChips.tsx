interface RecentChipsProps {
  items: string[]
  onSelect: (value: string) => void
}

export default function RecentChips({ items, onSelect }: RecentChipsProps) {
  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(item)}
          className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {item}
        </button>
      ))}
    </div>
  )
}
