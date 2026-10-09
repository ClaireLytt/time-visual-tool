interface SparklineData {
  emoji: string
  label: string
  values: number[]
  color: string
}

interface WeeklySparklinesProps {
  data: SparklineData[]
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1)
  const w = 60
  const h = 20
  const pad = 2
  const points = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2)
      const y = h - pad - (v / max) * (h - pad * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function WeeklySparklines({ data }: WeeklySparklinesProps) {
  return (
    <div className="panel p-4 space-y-2">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-sm w-6 text-center">{d.emoji}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 w-10 shrink-0 truncate">{d.label}</span>
          <Sparkline values={d.values} color={d.color} />
          <span className="text-xs tabular-nums text-gray-700 dark:text-gray-300 ml-auto">
            {d.values[d.values.length - 1]}
          </span>
        </div>
      ))}
    </div>
  )
}
