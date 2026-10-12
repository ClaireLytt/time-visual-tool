import { useTranslation } from 'react-i18next'

interface FoodCatcherCardProps {
  onClick: () => void
}

export default function FoodCatcherCard({ onClick }: FoodCatcherCardProps) {
  const { t } = useTranslation()

  return (
    <button
      onClick={onClick}
      className="panel p-4 mb-4 w-full text-left flex items-center gap-4 group hover:border-mode-eating/30 transition-colors"
    >
      <span className="text-3xl shrink-0" role="img" aria-hidden="true">🍽️</span>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {t('game.foodCatcher')}
        </h3>
        <p className="text-xs text-calm-muted dark:text-gray-400 mt-0.5">
          {t('game.foodCatcherDesc')}
        </p>
      </div>

      <span className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-mode-eating/10 text-mode-eating group-hover:bg-mode-eating/20 transition-colors">
        {t('game.start')} ▶
      </span>
    </button>
  )
}
