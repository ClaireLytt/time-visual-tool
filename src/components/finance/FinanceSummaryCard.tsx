import { useTranslation } from 'react-i18next'
import { formatAmount } from '../../utils/money'

interface FinanceSummaryCardProps {
  income: number
  expense: number
  balance: number
  entryCount: number
}

function FinanceSummaryCard({ income, expense, balance, entryCount }: FinanceSummaryCardProps) {
  const { t } = useTranslation()

  const stats = [
    { label: t('finance.income'), value: formatAmount(income), color: 'text-green-600 dark:text-green-400' },
    { label: t('finance.expense'), value: formatAmount(expense), color: 'text-rose-600 dark:text-rose-400' },
    {
      label: t('finance.balance'),
      value: formatAmount(balance),
      color: balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400',
    },
    { label: t('summary.entryCount'), value: t('finance.countUnit', { count: entryCount }), color: 'text-gray-800 dark:text-gray-100' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {stats.map(stat => (
        <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center">
          <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

export default FinanceSummaryCard
