import { useTranslation } from 'react-i18next'

export interface SportTemplate {
  emoji: string
  labelKey: string
  fallback: string
  content: string
  duration: number
  sportType: string
}

const TEMPLATES: SportTemplate[] = [
  { emoji: '\u{1F3C3}', labelKey: 'sport.templateRunning', fallback: 'Running 30min', content: '跑步', duration: 30, sportType: '跑步' },
  { emoji: '\u{1F3CB}️', labelKey: 'sport.templateGym', fallback: 'Gym 60min', content: '力量训练', duration: 60, sportType: '力量训练' },
  { emoji: '\u{1F9D8}', labelKey: 'sport.templateYoga', fallback: 'Yoga 45min', content: '瑜伽', duration: 45, sportType: '瑜伽' },
  { emoji: '\u{1F6B4}', labelKey: 'sport.templateCycling', fallback: 'Cycling 40min', content: '骑行', duration: 40, sportType: '骑行' },
]

interface SportQuickTemplatesProps {
  onSelect: (template: SportTemplate) => void
}

export default function SportQuickTemplates({ onSelect }: SportQuickTemplatesProps) {
  const { t } = useTranslation()

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold tracking-wide uppercase text-calm-muted dark:text-gray-400 mb-2">
        {t('sport.quickTemplates')}
      </p>
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map(tpl => (
          <button
            key={tpl.labelKey}
            type="button"
            onClick={() => onSelect(tpl)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700/60 hover:bg-mode-sport/15 dark:hover:bg-mode-sport/20 text-sm text-gray-700 dark:text-gray-200 rounded-full transition-colors border border-transparent hover:border-mode-sport/30"
          >
            <span>{tpl.emoji}</span>
            <span>{t(tpl.labelKey, tpl.fallback)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
