import { useMemo } from 'react'
import { GALLERY_ROOMS } from '../../constants/gallery'
import { PAINTING_EXTRAS } from '../../constants/paintingData'

/**
 * Daily painting — deterministic pick based on date.
 * Returns a different painting each day, cycling through all 15.
 */
export function useDailyPainting() {
  return useMemo(() => {
    const all = GALLERY_ROOMS.flatMap(r => r.paintings)
    const today = new Date()
    const dayHash = today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()
    const painting = all[dayHash % all.length]
    const extra = PAINTING_EXTRAS[painting.id]
    return { painting, extra }
  }, [])
}

/** Compact daily painting card for Overview dashboard */
export function DailyPaintingCard({ isZh }: { onClick?: () => void; isZh: boolean }) {
  const { painting, extra } = useDailyPainting()

  return (
    <div className="w-full text-left overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]">

      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-lg overflow-hidden relative shrink-0">
          <div className="absolute inset-0" style={{ background: painting.fallbackGradient }} />
          <img src={painting.imageUrl} alt={painting.title}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-amber-400/60 tracking-wider uppercase mb-0.5">
            {isZh ? '📖 今日名画' : '📖 Painting of the Day'}
          </p>
          <p className="text-sm font-medium text-white/80 truncate">{painting.title}</p>
          <p className="text-[11px] text-white/40">{painting.artist} · {painting.year}</p>
          {extra?.museum && <p className="text-[10px] text-white/25 mt-0.5 truncate">📍 {extra.museum}</p>}
        </div>
      </div>
    </div>
  )
}
