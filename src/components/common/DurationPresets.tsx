interface DurationPresetsProps {
  onSelect: (minutes: number) => void
  selected?: number
}

const PRESETS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1h', value: 60 },
]

export default function DurationPresets({ onSelect, selected }: DurationPresetsProps) {
  return (
    <div className="flex gap-1.5">
      {PRESETS.map(p => (
        <button
          key={p.value}
          type="button"
          onClick={() => onSelect(p.value)}
          className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
            selected === p.value
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
