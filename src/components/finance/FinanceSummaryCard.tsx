import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatAmount } from '../../utils/money'

interface FinanceSummaryCardProps {
  income: number
  expense: number
  balance: number
  entryCount: number
}

const FinanceSummaryCard = memo(function FinanceSummaryCard({ income, expense, balance, entryCount }: FinanceSummaryCardProps) {
  const { t } = useTranslation()

  const stats = [
    { label: t('finance.income'), value: formatAmount(income), color: 'text-mode-finance' },
    { label: t('finance.expense'), value: formatAmount(expense), color: 'text-[#c47070]' },
    {
      label: t('finance.balance'),
      value: formatAmount(balance),
      color: balance >= 0 ? 'text-calm-accent' : 'text-[#c47070]',
    },
    { label: t('summary.entryCount'), value: t('finance.countUnit', { count: entryCount }), color: 'text-gray-800 dark:text-gray-100' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-[2fr_2fr_1fr_1fr] gap-4 mb-5">
      {stats.map((stat, i) => (
        <div key={stat.label} className={`panel ${i < 2 ? 'pt-6 pb-4 pl-5 pr-4 text-left' : 'p-3 text-center'}`}>
          <p className="font-pixel text-[7px] text-px-green dark:text-px-green mb-2">{stat.label}</p>
          <p className={`${i < 2 ? 'text-2xl' : 'text-lg'} font-bold tabular-nums tracking-display ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
})

export default FinanceSummaryCard
