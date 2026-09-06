import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { parseAmountInput, formatAmount } from '../../utils/money'
import type { FinanceEntry, FinanceEntryType, FinanceCategory } from '../../types/finance'

interface FinanceEntryFormProps {
  selectedDate: string
  categories: FinanceCategory[]
  onAdd: (entry: Omit<FinanceEntry, 'id' | 'createdAt'>) => void
  editingEntry?: FinanceEntry | null
  onUpdate?: (id: string, updates: Partial<FinanceEntry>) => void
  onCancelEdit?: () => void
}

function FinanceEntryForm({ selectedDate, categories, onAdd, editingEntry, onUpdate, onCancelEdit }: FinanceEntryFormProps) {
  const { t } = useTranslation()
  const [type, setType] = useState<FinanceEntryType>('expense')
  const [description, setDescription] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')
  const [prevEditingEntry, setPrevEditingEntry] = useState(editingEntry)

  const isEditing = !!editingEntry

  if (prevEditingEntry !== editingEntry) {
    setPrevEditingEntry(editingEntry)
    if (editingEntry) {
      setType(editingEntry.type)
      setDescription(editingEntry.description)
      setAmountInput(String(editingEntry.amount))
      setCategory(editingEntry.category)
      setError('')
    } else {
      setType('expense')
      setDescription('')
      setAmountInput('')
      setCategory('')
      setError('')
    }
  }

  const typeCategories = categories.filter(c => c.kind === type)
  const effectiveCategory = typeCategories.some(c => c.name === category)
    ? category
    : (typeCategories[0]?.name ?? '')

  const parsedAmount = parseAmountInput(amountInput)
  const showCalcResult = parsedAmount !== null && /[+-]/.test(amountInput.trim().slice(1))

  const handleTypeChange = (next: FinanceEntryType) => {
    setType(next)
    setCategory('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const amount = parseAmountInput(amountInput)
    if (amount === null) {
      setError(t('finance.errorAmount'))
      return
    }

    if (isEditing && onUpdate) {
      onUpdate(editingEntry.id, {
        description: description.trim(),
        amount,
        type,
        category: effectiveCategory,
      })
      onCancelEdit?.()
    } else {
      onAdd({
        date: selectedDate,
        description: description.trim(),
        amount,
        type,
        category: effectiveCategory,
      })
      setDescription('')
      setAmountInput('')
      setError('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        {isEditing ? t('finance.editTitle') : t('finance.addTitle')}
      </h3>

      <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 mb-3" role="radiogroup" aria-label={t('finance.typeLabel')}>
        <button
          type="button"
          role="radio"
          aria-checked={type === 'expense'}
          onClick={() => handleTypeChange('expense')}
          className={`flex-1 py-1.5 text-sm font-medium transition-colors ${type === 'expense' ? 'bg-rose-500 text-white' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
          - {t('finance.expense')}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={type === 'income'}
          onClick={() => handleTypeChange('income')}
          className={`flex-1 py-1.5 text-sm font-medium transition-colors ${type === 'income' ? 'bg-green-500 text-white' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
          + {t('finance.income')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t('finance.descriptionPlaceholder')}
            aria-label={t('finance.descriptionLabel')}
            className="input-base"
            maxLength={100}
          />
        </div>

        <div>
          <input
            type="text"
            value={amountInput}
            onChange={e => setAmountInput(e.target.value)}
            placeholder={t('finance.amountPlaceholder')}
            aria-label={t('finance.amountLabel')}
            className="input-base"
            inputMode="decimal"
          />
          {showCalcResult && (
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1" aria-live="polite">
              = {formatAmount(parsedAmount)}
            </p>
          )}
        </div>

        <div>
          <select
            value={effectiveCategory}
            onChange={e => setCategory(e.target.value)}
            aria-label={t('entry.categoryLabel')}
            className="input-base"
          >
            {typeCategories.map(cat => (
              <option key={cat.name} value={cat.name}>{t('category.names.' + cat.name, cat.name)}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-xs mb-2" role="alert">{error}</p>}

      <div className={isEditing ? 'flex gap-2' : ''}>
        <button
          type="submit"
          className={`${isEditing ? 'flex-1' : 'w-full'} py-2 ${type === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-rose-500 hover:bg-rose-600'} text-white text-sm font-medium rounded-lg transition-colors`}
        >
          {isEditing ? t('entry.saveButton') : t('finance.addButton')}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('entry.cancelButton')}
          </button>
        )}
      </div>
    </form>
  )
}

export default FinanceEntryForm
