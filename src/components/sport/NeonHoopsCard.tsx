import { useTranslation } from 'react-i18next'

interface NeonHoopsCardProps {
  onClick: () => void
}

export default function NeonHoopsCard({ onClick }: NeonHoopsCardProps) {
  const { t } = useTranslation()

  return (
    <button
      onClick={onClick}
      className="panel p-4 mb-4 w-full text-left flex items-center gap-4 group hover:border-mode-sport/30 transition-colors"
    >
      {/* Basketball icon */}
      <span className="text-3xl shrink-0" role="img" aria-hidden="true">🏀</span>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {t('game.neonHoops')}
        </h3>
        <p className="text-xs text-calm-muted dark:text-gray-400 mt-0.5">
          {t('game.neonHoopsDesc')}
        </p>
      </div>

      {/* Play badge */}
      <span className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-mode-sport/10 text-mode-sport group-hover:bg-mode-sport/20 transition-colors">
        {t('game.start')} ▶
      </span>
    </button>
  )
}
