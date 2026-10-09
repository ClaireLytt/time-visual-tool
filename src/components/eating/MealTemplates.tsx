const TEMPLATES = [
  { name: '早餐', calories: 400 },
  { name: '午餐', calories: 600 },
  { name: '晚餐', calories: 500 },
]

interface MealTemplatesProps {
  onQuickAdd: (meal: { name: string; calories: number }) => void
}

export default function MealTemplates({ onQuickAdd }: MealTemplatesProps) {
  return (
    <div className="flex gap-2">
      {TEMPLATES.map(m => (
        <button
          key={m.name}
          type="button"
          onClick={() => onQuickAdd(m)}
          className="btn-secondary flex-1 text-xs"
        >
          {m.name} ~{m.calories}kcal
        </button>
      ))}
    </div>
  )
}
