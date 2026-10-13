import { useTranslation } from 'react-i18next'
import type { TodoRepeat, TodoRepeatType } from '../../types/todo'

const REPEAT_TYPES: TodoRepeatType[] = ['none', 'daily', 'weekly', 'monthly', 'custom']
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0]

interface RepeatEditorProps {
  /** undefined means "no repeat" */
  value: TodoRepeat | undefined
  onChange: (repeat: TodoRepeat | undefined) => void
}

/** Controlled editor for a todo repeat rule, shared by the add form and item editing */
export default function RepeatEditor({ value, onChange }: RepeatEditorProps) {
  const { t } = useTranslation()
  const type: TodoRepeatType = value?.type ?? 'none'

  const setType = (next: TodoRepeatType) => {
    if (next === 'none') { onChange(undefined); return }
    onChange({
      type: next,
      ...(value?.until ? { until: value.until } : {}),
      ...(next === 'weekly' && value?.weekdays ? { weekdays: value.weekdays } : {}),
      ...(next === 'custom' ? { interval: value?.interval ?? 2 } : {}),
    })
  }

  const toggleWeekday = (d: number) => {
    if (!value) return
    const cur = value.weekdays ?? []
    const weekdays = cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d]
    onChange({ ...value, ...(weekdays.length > 0 ? { weekdays } : { weekdays: undefined }) })
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 flex-wrap items-center">
        <span className="text-xs text-gray-400 dark:text-gray-500">🔁 {t('todo.repeat.label')}</span>
        {REPEAT_TYPES.map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setType(r)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              type === r
                ? 'bg-[#5b8def] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t(`todo.repeat.${r}`)}
          </button>
        ))}
      </div>
      {type === 'weekly' && value && (
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">{t('todo.repeat.weekdaysLabel')}</span>
          {WEEKDAYS.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => toggleWeekday(d)}
              className={`w-7 h-7 text-xs font-medium rounded-full transition-all ${
                (value.weekdays ?? []).includes(d)
                  ? 'bg-[#5b8def] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {t(`todo.weekday.${d}`)}
            </button>
          ))}
        </div>
      )}
      {type === 'custom' && value && (
        <div className="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-400">
          <span>{t('todo.repeat.every')}</span>
          <input
            type="number"
            min="1"
            value={value.interval ?? 2}
            onChange={e => onChange({ ...value, interval: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
            className="input-base w-16 text-xs py-1"
          />
          <span>{t('todo.repeat.days')}</span>
        </div>
      )}
      {type !== 'none' && value && (
        <div className="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-400">
          <span>{t('todo.repeat.untilLabel')}</span>
          <input
            type="date"
            value={value.until ?? ''}
            onChange={e => onChange({ ...value, ...(e.target.value ? { until: e.target.value } : { until: undefined }) })}
            className="input-base w-auto text-xs py-1"
          />
          {!value.until && <span className="text-gray-300 dark:text-gray-600">{t('todo.repeat.forever')}</span>}
        </div>
      )}
    </div>
  )
}
