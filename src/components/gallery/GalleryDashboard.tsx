import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { GALLERY_ROOMS } from '../../constants/gallery'
import { ARTISTS } from '../../constants/artists'
import { PAINTING_EXTRAS } from '../../constants/paintingData'
import { useAchievements, AchievementToast, AchievementPanel, GlobalTimeline, PaintingQuiz } from './GalleryExtras'
import { WorldMap, PaintingComparison, ColorWheel } from './GalleryViews'
import type { Painting } from '../../types/gallery'

/* ═══════════════════════════════════════════
   Painting animations CSS (injected once)
   ═══════════════════════════════════════════ */
const ANIM_STYLE = `
@keyframes starry-swirl { 0%,100% { filter: brightness(1) } 50% { filter: brightness(1.08) } }
@keyframes ripple { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(1.005) } }
@keyframes wave-sway { 0%,100% { transform: translateX(0) } 50% { transform: translateX(1px) } }
.animate-starry img { animation: starry-swirl 4s ease-in-out infinite }
.animate-ripple img { animation: ripple 6s ease-in-out infinite }
.animate-wave img { animation: wave-sway 3s ease-in-out infinite }
`

/* ═══════════════════════════════════════════
   Typewriter hook for AI narration
   ═══════════════════════════════════════════ */
/** Typewriter — must be used in a component that remounts when text changes (use key prop) */
function Typewriter({ text, speed = 35 }: { text: string; speed?: number }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (i >= text.length) return
    const timer = setTimeout(() => setI(prev => prev + 1), speed)
    return () => clearTimeout(timer)
  }, [i, text, speed])

  return (
    <span>
      &ldquo;{text.slice(0, i)}{i < text.length && <span className="animate-pulse">|</span>}&rdquo;
    </span>
  )
}

/* ═══════════════════════════════════════════
   Painting notes hook (localStorage)
   ═══════════════════════════════════════════ */
function useNotes(paintingId: string) {
  const key = `gallery-note-${paintingId}`
  const [note, setNote] = useState(() => {
    try { return localStorage.getItem(key) || '' } catch { return '' }
  })
  const save = useCallback((val: string) => {
    setNote(val)
    try { localStorage.setItem(key, val) } catch { /* */ }
  }, [key])
  return { note, save }
}

/* ═══════════════════════════════════════════
   Favorites hook (localStorage)
   ═══════════════════════════════════════════ */
function useFavorites() {
  const [favs, setFavs] = useState<string[]>(() => {
    try { const s = localStorage.getItem('gallery-favorites'); return s ? JSON.parse(s) : [] }
    catch { return [] }
  })
  const toggle = useCallback((id: string) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      try { localStorage.setItem('gallery-favorites', JSON.stringify(next)) } catch { /* */ }
      return next
    })
  }, [])
  const isFav = useCallback((id: string) => favs.includes(id), [favs])
  return { favs, toggle, isFav }
}

/* ═══════════════════════════════════════════
   Touch swipe hook
   ═══════════════════════════════════════════ */
function useSwipe(onLeft: () => void, onRight: () => void) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) onRight()
      else onLeft()
    }
    touchStart.current = null
  }, [onLeft, onRight])

  return { onTouchStart, onTouchEnd }
}

/* ═══════════════════════════════════════════
   X-ray composition overlay — golden ratio, rule of thirds
   ═══════════════════════════════════════════ */
function CompositionOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {/* Rule of thirds */}
      <line x1="33.3" y1="0" x2="33.3" y2="100" stroke="rgba(201,168,76,0.4)" strokeWidth="0.3" />
      <line x1="66.6" y1="0" x2="66.6" y2="100" stroke="rgba(201,168,76,0.4)" strokeWidth="0.3" />
      <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="rgba(201,168,76,0.4)" strokeWidth="0.3" />
      <line x1="0" y1="66.6" x2="100" y2="66.6" stroke="rgba(201,168,76,0.4)" strokeWidth="0.3" />
      {/* Golden spiral approximation */}
      <path d="M 61.8 0 L 61.8 38.2 L 100 38.2" fill="none" stroke="rgba(255,200,100,0.3)" strokeWidth="0.3" />
      <path d="M 61.8 38.2 L 38.2 38.2 L 38.2 100" fill="none" stroke="rgba(255,200,100,0.3)" strokeWidth="0.3" />
      {/* Diagonals */}
      <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="0.2" strokeDasharray="2,2" />
      <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="0.2" strokeDasharray="2,2" />
      {/* Center cross */}
      <circle cx="50" cy="50" r="1" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="0.3" />
      {/* Power points */}
      <circle cx="33.3" cy="33.3" r="0.8" fill="rgba(201,168,76,0.6)" />
      <circle cx="66.6" cy="33.3" r="0.8" fill="rgba(201,168,76,0.6)" />
      <circle cx="33.3" cy="66.6" r="0.8" fill="rgba(201,168,76,0.6)" />
      <circle cx="66.6" cy="66.6" r="0.8" fill="rgba(201,168,76,0.6)" />
    </svg>
  )
}

/* ═══════════════════════════════════════════
   Related paintings — same artist or same era
   ═══════════════════════════════════════════ */
function RelatedPaintings({ current, isZh, onSelect }: {
  current: Painting; isZh: boolean; onSelect: (p: Painting) => void
}) {
  const related = useMemo(() => {
    const all = GALLERY_ROOMS.flatMap(r => r.paintings)
    // Same artist first, then same century
    const sameArtist = all.filter(p => p.id !== current.id && p.artist === current.artist)
    const currentCentury = Math.floor(Number(current.year) / 100)
    const sameEra = all.filter(p => p.id !== current.id && p.artist !== current.artist && Math.floor(Number(p.year) / 100) === currentCentury)
    return [...sameArtist, ...sameEra].slice(0, 3)
  }, [current])

  if (related.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">
        {isZh ? '相关画作' : 'Related'}
      </p>
      <div className="flex gap-2 justify-center">
        {related.map(p => (
          <button key={p.id} onClick={() => onSelect(p)}
            className="w-16 h-12 rounded overflow-hidden border border-white/10 hover:border-white/30 transition-all cursor-pointer relative group">
            <div className="absolute inset-0" style={{ background: p.fallbackGradient }} />
            <img src={p.imageUrl} alt={p.title} className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[8px] text-white/80 truncate px-1">{p.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Magnifier lens
   ═══════════════════════════════════════════ */
function MagnifierImage({ painting, showXray }: { painting: Painting; showXray: boolean }) {
  const imgRef = useRef<HTMLDivElement>(null)
  const [lens, setLens] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false })

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    setLens({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100, show: true })
  }, [])

  return (
    <div ref={imgRef} className="relative overflow-hidden rounded cursor-crosshair" style={{ minHeight: 160 }}
      onMouseMove={handleMove}
      onMouseEnter={() => setLens(p => ({ ...p, show: true }))}
      onMouseLeave={() => setLens(p => ({ ...p, show: false }))}
    >
      <div className="absolute inset-0 rounded" style={{ background: painting.fallbackGradient }} />
      <img src={painting.imageUrl} alt={`${painting.title} by ${painting.artist}`}
        className="relative w-full max-h-[50vh] object-contain rounded" referrerPolicy="no-referrer"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <CompositionOverlay visible={showXray} />
      {lens.show && !showXray && (
        <div className="absolute w-28 h-28 rounded-full border-2 border-white/20 pointer-events-none overflow-hidden"
          style={{ left: `${lens.x}%`, top: `${lens.y}%`, transform: 'translate(-50%, -50%)', boxShadow: '0 0 30px rgba(0,0,0,0.7)' }}
        >
          <img src={painting.imageUrl} alt="" aria-hidden="true" className="absolute" referrerPolicy="no-referrer"
            style={{ width: '300%', height: '300%', left: `${-lens.x * 3 + 50}%`, top: `${-lens.y * 3 + 50}%`, maxWidth: 'none' }}
          />
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Human scale
   ═══════════════════════════════════════════ */
function HumanScale({ realSize }: { realSize: { widthCm: number; heightCm: number } }) {
  const S = 60 / 170
  return (
    <div className="flex items-end gap-2 justify-center mt-3">
      <div className="flex flex-col items-center">
        <svg width="16" height={60} viewBox="0 0 16 60" fill="none" aria-hidden="true">
          <circle cx="8" cy="4" r="4" fill="rgba(255,255,255,0.4)" />
          <rect x="5" y="9" width="6" height="22" rx="3" fill="rgba(255,255,255,0.3)" />
          <rect x="3" y="31" width="4" height="24" rx="2" fill="rgba(255,255,255,0.25)" />
          <rect x="9" y="31" width="4" height="24" rx="2" fill="rgba(255,255,255,0.25)" />
        </svg>
        <span className="text-[8px] text-white/30 mt-0.5">170cm</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="border border-white/30 rounded-sm bg-white/5"
          style={{ width: Math.max(8, Math.min(realSize.widthCm * S, 120)), height: Math.max(8, Math.min(realSize.heightCm * S, 80)) }}
        />
        <span className="text-[8px] text-white/30 mt-0.5">{realSize.heightCm}×{realSize.widthCm}cm</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Painting modal — with prev/next navigation
   ═══════════════════════════════════════════ */
function PaintingModal({ painting, onClose, isZh, onPrev, onNext, isFav, onToggleFav, onSelectRelated }: {
  painting: Painting; onClose: () => void; isZh: boolean
  onPrev: () => void; onNext: () => void
  isFav: boolean; onToggleFav: () => void
  onSelectRelated: (p: Painting) => void
}) {
  const [showBio, setShowBio] = useState(false)
  const [showNarration, setShowNarration] = useState(false)
  const [showXray, setShowXray] = useState(false)
  const artist = ARTISTS[painting.artist]
  const extra = PAINTING_EXTRAS[painting.id]
  const { note, save: saveNote } = useNotes(painting.id)
  const quoteText = extra?.quote ? (isZh ? extra.quote.zh : extra.quote.en) : ''

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (showBio) setShowBio(false); else onClose() }
      if (!showBio && e.key === 'ArrowLeft') onPrev()
      if (!showBio && e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext, showBio])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" />
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative max-w-3xl w-full my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <MagnifierImage painting={painting} showXray={showXray} />

        <motion.div className="mt-4 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="text-xl font-bold text-white tracking-wide">{painting.title}</h3>

          {/* Artist + year + fav + narration button */}
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-sm text-white/40">
              {artist ? (
                <button onClick={() => setShowBio(true)} className="hover:text-amber-400/70 transition-colors underline underline-offset-2 decoration-white/20 cursor-pointer">
                  {painting.artist}
                </button>
              ) : painting.artist}
              {' · '}{painting.year}
            </p>
            <button onClick={onToggleFav} className="text-base transition-transform hover:scale-110" aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}>
              {isFav ? '★' : '☆'}
            </button>
            {extra?.quote && (
              <button onClick={() => setShowNarration(!showNarration)}
                className={`text-xs px-2 py-0.5 rounded-full transition-all ${showNarration ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-white/30 hover:text-white/60'}`}
                aria-label="AI narration">
                {isZh ? '导览' : 'Tour'}
              </button>
            )}
            <button onClick={() => setShowXray(!showXray)}
              className={`text-xs px-2 py-0.5 rounded-full transition-all ${showXray ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-white/30 hover:text-white/60'}`}
              aria-label="Composition overlay">
              {isZh ? '构图' : 'X-ray'}
            </button>
          </div>

          {/* AI narration — typewriter */}
          {showNarration && quoteText && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="mt-3 max-w-md mx-auto bg-white/3 rounded-lg p-3 border border-white/5">
              <p className="text-sm text-amber-200/70 italic leading-relaxed text-left">
                <Typewriter key={painting.id} text={quoteText} />
              </p>
              <p className="text-[10px] text-white/25 mt-1.5 text-right">— {painting.artist}</p>
            </motion.div>
          )}

          {painting.story && !showNarration && (
            <p className="text-sm text-white/50 mt-3 leading-relaxed max-w-lg mx-auto">
              {isZh ? painting.story.zh : painting.story.en}
            </p>
          )}

          {/* Data card: museum, value, duration, incidents */}
          {extra && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-3 text-[10px] text-white/30">
              <span>📍 {extra.museum}</span>
              {extra.value && <span>💰 {extra.value}</span>}
              {extra.duration && <span>⏱ {extra.duration}</span>}
              {extra.incidents && <span>⚡ {extra.incidents}</span>}
            </div>
          )}

          {painting.palette && (
            <div className="flex gap-2 justify-center mt-3">
              {painting.palette.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />
                  <span className="text-[7px] text-white/20 font-mono">{c}</span>
                </div>
              ))}
            </div>
          )}

          {painting.realSize && <HumanScale realSize={painting.realSize} />}

          {/* Related paintings */}
          <RelatedPaintings current={painting} isZh={isZh} onSelect={onSelectRelated} />

          {/* Personal notes */}
          <div className="mt-3 max-w-sm mx-auto">
            <textarea
              value={note}
              onChange={(e) => saveNote(e.target.value)}
              placeholder={isZh ? '写下你的感想...' : 'Your thoughts...'}
              className="w-full bg-white/3 border border-white/8 rounded-lg px-3 py-2 text-xs text-white/60 placeholder-white/20 resize-none focus:outline-none focus:border-white/20 transition-colors"
              rows={2}
            />
          </div>
        </motion.div>

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/5 backdrop-blur text-white/60 hover:text-white hover:bg-white/15 flex items-center justify-center transition-all text-xl"
          aria-label="Close">×</button>

        {/* Prev/Next painting */}
        <button onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all"
          aria-label="Previous painting">‹</button>
        <button onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all"
          aria-label="Next painting">›</button>

        {/* Artist bio popup */}
        <AnimatePresence>
          {showBio && artist && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-xl rounded-lg p-4 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowBio(false)} className="absolute top-2 right-2 text-white/40 hover:text-white text-sm" aria-label="Close bio">×</button>
              <h4 className="text-sm font-bold text-white">{artist.name}</h4>
              <p className="text-[11px] text-amber-400/60 mt-0.5">{artist.nationality} · {artist.born}–{artist.died}</p>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">{isZh ? artist.bio.zh : artist.bio.en}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   Free-form painting — responsive sizes
   ═══════════════════════════════════════════ */
const LAYOUTS: { x: string; y: string; rotate: number; scale: number }[][] = [
  [{ x: '6%', y: '5%', rotate: -1.5, scale: 1.15 }, { x: '30%', y: '0%', rotate: 0.5, scale: 1.5 }, { x: '68%', y: '10%', rotate: 1.2, scale: 1.15 }],
  [{ x: '5%', y: '2%', rotate: -0.8, scale: 1.4 }, { x: '38%', y: '12%', rotate: 0, scale: 1.25 }, { x: '70%', y: '0%', rotate: 1.5, scale: 1.05 }],
  [{ x: '8%', y: '5%', rotate: 0, scale: 1.05 }, { x: '28%', y: '0%', rotate: -0.5, scale: 1.5 }, { x: '62%', y: '8%', rotate: 0.8, scale: 1.2 }],
  // Modern Art
  [{ x: '5%', y: '3%', rotate: -2, scale: 1.3 }, { x: '35%', y: '8%', rotate: 0, scale: 1.35 }, { x: '66%', y: '0%', rotate: 1.8, scale: 1.15 }],
  // Eastern Art
  [{ x: '7%', y: '0%', rotate: 0, scale: 1.2 }, { x: '34%', y: '5%', rotate: -0.5, scale: 1.45 }, { x: '65%', y: '3%', rotate: 0.8, scale: 1.1 }],
]

function WallPainting({ painting, layout, onSelect, index }: {
  painting: Painting
  layout: { x: string; y: string; rotate: number; scale: number }
  onSelect: (p: Painting) => void
  index: number
}) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  // Responsive: scale down on small screens
  const responsiveScale = typeof window !== 'undefined' && window.innerWidth < 640 ? 0.65 : 1
  const w = painting.width * layout.scale * responsiveScale
  const h = painting.height * layout.scale * responsiveScale

  return (
    <motion.button
      onClick={() => onSelect(painting)}
      className="absolute group cursor-pointer"
      style={{ left: layout.x, top: layout.y }}
      initial={{ opacity: 0, y: 50, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: layout.rotate }}
      transition={{ duration: 1, delay: 0.15 + index * 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      whileHover={{ scale: 1.06, rotate: 0, zIndex: 30 }}
      aria-label={`${painting.title} by ${painting.artist}`}
    >
      <div className="absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(255,240,200,0.08) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 rounded" style={{ boxShadow: '0 12px 48px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.5)' }} />
      <div className={`relative overflow-hidden rounded bg-black ${PAINTING_EXTRAS[painting.id]?.animClass || ''}`} style={{ width: w, height: h }}>
        <div className="absolute inset-0" style={{ background: painting.fallbackGradient, opacity: imgLoaded ? 0 : 1, transition: 'opacity 0.6s' }} />
        {!imgError && (
          <img src={painting.imageUrl} alt={`${painting.title} by ${painting.artist}`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.6s' }}
            loading="lazy" referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)} onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        <p className="text-white/80 text-xs font-medium tracking-wide">{painting.title}</p>
        <p className="text-white/40 text-[10px] text-center">{painting.artist} · {painting.year}</p>
      </div>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════
   Bottom info bar
   ═══════════════════════════════════════════ */
function InfoBar({ room, isZh }: { room: typeof GALLERY_ROOMS[number]; isZh: boolean }) {
  const years = room.paintings.map(p => Number(p.year))
  const min = Math.min(...years) - 20
  const max = Math.max(...years) + 20
  const range = max - min

  const roomPalette = useMemo(() => {
    const seen = new Set<string>()
    const colors: string[] = []
    room.paintings.forEach(p => { p.palette?.forEach(c => { if (!seen.has(c)) { seen.add(c); colors.push(c) } }) })
    return colors.slice(0, 8)
  }, [room.paintings])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
      className="px-5 py-3 grid gap-4 sm:gap-6" style={{ gridTemplateColumns: '1fr auto 1fr', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="min-w-0">
        {room.era && <span className="block text-[10px] tracking-[0.15em] uppercase text-amber-600/50 mb-1 font-mono">{isZh ? room.era.zh : room.era.en}</span>}
        {room.roomStory && <p className="text-[11px] leading-relaxed text-white/35 italic line-clamp-3">{isZh ? room.roomStory.zh : room.roomStory.en}</p>}
      </div>
      <div className="flex flex-col items-center justify-end gap-1 min-w-[140px]">
        <div className="w-full h-px bg-white/10" />
        <div className="flex justify-between w-full">
          {room.paintings.map(p => {
            const pct = ((Number(p.year) - min) / range) * 100
            return (
              <div key={p.id} className="flex flex-col items-center gap-1" style={{ marginLeft: `${pct * 0.3}%` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
                <span className="text-[9px] text-white/40 font-mono">{p.year}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex flex-col items-end justify-end gap-1">
        <span className="text-[9px] tracking-[0.1em] uppercase text-white/20">{isZh ? '展厅色谱' : 'Room Palette'}</span>
        <div className="flex gap-1">
          {roomPalette.map((c, i) => <div key={i} className="w-3 h-3 rounded-full border border-white/8" style={{ background: c }} title={c} />)}
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   Main Gallery
   ═══════════════════════════════════════════ */
function GalleryDashboard({ onBack }: { onBack?: () => void } = {}) {
  const { i18n } = useTranslation()
  const [roomIndex, setRoomIndex] = useState(0)
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [slideDir, setSlideDir] = useState(0)

  const room = GALLERY_ROOMS[roomIndex]
  const isZh = i18n.language === 'zh'
  const layouts = LAYOUTS[roomIndex] || LAYOUTS[0]
  const { toggle: toggleFav, isFav, favs } = useFavorites()
  const achievements = useAchievements()
  const [showAchievements, setShowAchievements] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [showColorWheel, setShowColorWheel] = useState(false)
  const [newAchievement, setNewAchievement] = useState<{ icon: string; titleZh: string; titleEn: string } | null>(null)
  const prevUnlockedCount = useRef(achievements.unlocked.length)

  // Track room visits
  const trackRoom = achievements.trackRoom
  useEffect(() => { trackRoom(room.id) }, [room.id, trackRoom])

  // Track painting views
  const trackPainting = achievements.trackPainting
  useEffect(() => {
    if (selectedPainting) trackPainting(selectedPainting.id)
  }, [selectedPainting, trackPainting])

  // Sync favorites to achievements
  const syncFavs = achievements.syncFavorites
  useEffect(() => { syncFavs(favs) }, [favs, syncFavs])

  // Detect new achievement unlocks
  useEffect(() => {
    if (achievements.unlocked.length > prevUnlockedCount.current) {
      const newest = achievements.unlocked[achievements.unlocked.length - 1]
      setNewAchievement(newest)
    }
    prevUnlockedCount.current = achievements.unlocked.length
  }, [achievements.unlocked])

  // Inject animation styles once
  useEffect(() => {
    if (document.getElementById('gallery-anims')) return
    const style = document.createElement('style')
    style.id = 'gallery-anims'
    style.textContent = ANIM_STYLE
    document.head.appendChild(style)
    return () => { style.remove() }
  }, [])

  // Random explore
  const randomExplore = useCallback(() => {
    const ri = Math.floor(Math.random() * GALLERY_ROOMS.length)
    const pi = Math.floor(Math.random() * GALLERY_ROOMS[ri].paintings.length)
    setSlideDir(ri > roomIndex ? 1 : -1)
    setRoomIndex(ri)
    setTimeout(() => setSelectedPainting(GALLERY_ROOMS[ri].paintings[pi]), 400)
  }, [roomIndex])

  const goToRoom = useCallback((index: number, dir: number) => {
    if (transitioning) return
    setSlideDir(dir)
    setTransitioning(true)
    setTimeout(() => { setRoomIndex(index); setTransitioning(false) }, 500)
  }, [transitioning])

  // Swipe support
  const swipeHandlers = useSwipe(
    () => goToRoom((roomIndex + 1) % GALLERY_ROOMS.length, 1),
    () => goToRoom((roomIndex - 1 + GALLERY_ROOMS.length) % GALLERY_ROOMS.length, -1),
  )

  const prevRoom = useMemo(() => GALLERY_ROOMS[(roomIndex - 1 + GALLERY_ROOMS.length) % GALLERY_ROOMS.length], [roomIndex])
  const nextRoom = useMemo(() => GALLERY_ROOMS[(roomIndex + 1) % GALLERY_ROOMS.length], [roomIndex])

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selectedPainting) return // modal handles its own keys
      if (e.key === 'ArrowLeft') goToRoom((roomIndex - 1 + GALLERY_ROOMS.length) % GALLERY_ROOMS.length, -1)
      if (e.key === 'ArrowRight') goToRoom((roomIndex + 1) % GALLERY_ROOMS.length, 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [roomIndex, selectedPainting, goToRoom])

  // In-modal painting navigation
  const modalPaintingIndex = selectedPainting ? room.paintings.findIndex(p => p.id === selectedPainting.id) : -1
  const goToPrevPainting = useCallback(() => {
    if (modalPaintingIndex <= 0) return
    setSelectedPainting(room.paintings[modalPaintingIndex - 1])
  }, [modalPaintingIndex, room.paintings])
  const goToNextPainting = useCallback(() => {
    if (modalPaintingIndex >= room.paintings.length - 1) return
    setSelectedPainting(room.paintings[modalPaintingIndex + 1])
  }, [modalPaintingIndex, room.paintings])

  return (
    <div className="fixed inset-0 z-30 flex flex-col" style={{ background: '#050505' }}
      {...swipeHandlers}
    >
      {/* Zone 1: Room header with back button */}
      <div className="shrink-0 pt-[env(safe-area-inset-top)] relative">
        {/* Back button — top left */}
        {onBack && (
          <button onClick={onBack}
            className="absolute left-3 top-[calc(env(safe-area-inset-top)+8px)] z-10 w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-sm flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/10"
            aria-label={isZh ? '返回' : 'Back'}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        <div className="text-center pt-3 pb-1">
          <AnimatePresence mode="wait">
            <motion.h2 key={room.id} className="text-sm font-medium tracking-[0.3em] uppercase text-white/50"
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.4 }}>
              {isZh ? room.nameZh : room.name}
            </motion.h2>
          </AnimatePresence>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          {GALLERY_ROOMS.map((r, i) => (
            <button key={r.id} onClick={() => goToRoom(i, i > roomIndex ? 1 : -1)}
              className="w-11 h-11 flex items-center justify-center" aria-label={isZh ? r.nameZh : r.name}>
              <span className="block rounded-full transition-all duration-300"
                style={{ width: i === roomIndex ? 16 : 4, height: 4, background: i === roomIndex ? '#c9a84c' : 'rgba(255,255,255,0.15)' }} />
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Zone 2: Painting canvas */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={room.id} className="absolute inset-0"
            initial={{ opacity: 0, x: slideDir * 120 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -slideDir * 120 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
            {room.paintings.map((p, i) => (
              <WallPainting key={p.id} painting={p} layout={layouts[i]} onSelect={setSelectedPainting} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        <button onClick={() => goToRoom((roomIndex - 1 + GALLERY_ROOMS.length) % GALLERY_ROOMS.length, -1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 backdrop-blur-sm transition-all border border-white/10 cursor-pointer"
          aria-label={`Go to ${isZh ? prevRoom.nameZh : prevRoom.name}`}>
          <span className="text-lg text-white/50">‹</span>
        </button>
        <button onClick={() => goToRoom((roomIndex + 1) % GALLERY_ROOMS.length, 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 backdrop-blur-sm transition-all border border-white/10 cursor-pointer"
          aria-label={`Go to ${isZh ? nextRoom.nameZh : nextRoom.name}`}>
          <span className="text-lg text-white/50">›</span>
        </button>

        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />

        {/* Bottom toolbar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          <button onClick={randomExplore}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white/40 hover:text-white/70 text-xs tracking-wide transition-all cursor-pointer"
            aria-label="Random painting">
            🎲 {isZh ? '随机' : 'Random'}
          </button>
          <button onClick={() => setShowTimeline(true)}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white/40 hover:text-white/70 text-xs tracking-wide transition-all cursor-pointer"
            aria-label="Timeline">
            📈 {isZh ? '时间线' : 'Timeline'}
          </button>
          <button onClick={() => setShowQuiz(true)}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white/40 hover:text-white/70 text-xs tracking-wide transition-all cursor-pointer"
            aria-label="Quiz">
            🎯 {isZh ? '猜画' : 'Quiz'}
          </button>
          <button onClick={() => setShowMap(true)}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white/40 hover:text-white/70 text-xs tracking-wide transition-all cursor-pointer"
            aria-label="World map">
            🌍
          </button>
          <button onClick={() => setShowCompare(true)}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white/40 hover:text-white/70 text-xs tracking-wide transition-all cursor-pointer"
            aria-label="Compare">
            📐
          </button>
          <button onClick={() => setShowColorWheel(true)}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white/40 hover:text-white/70 text-xs tracking-wide transition-all cursor-pointer"
            aria-label="Color analysis">
            🎨
          </button>
          <button onClick={() => setShowAchievements(true)}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white/40 hover:text-white/70 text-xs tracking-wide transition-all cursor-pointer"
            aria-label="Achievements">
            🏆 {achievements.unlocked.length}/{6}
          </button>
        </div>
      </div>

      {/* Zone 3: Info bar */}
      <div className="shrink-0">
        <AnimatePresence mode="wait">
          <motion.div key={room.id}><InfoBar room={room} isZh={isZh} /></motion.div>
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPainting && (
          <PaintingModal painting={selectedPainting} onClose={() => setSelectedPainting(null)}
            isZh={isZh} onPrev={goToPrevPainting} onNext={goToNextPainting}
            isFav={isFav(selectedPainting.id)} onToggleFav={() => toggleFav(selectedPainting.id)}
            onSelectRelated={setSelectedPainting} />
        )}
      </AnimatePresence>

      {/* Overlays: achievements, timeline, quiz */}
      <AnimatePresence>
        {showAchievements && <AchievementPanel isZh={isZh} stats={achievements.stats} onClose={() => setShowAchievements(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showTimeline && <GlobalTimeline isZh={isZh} onSelect={(p) => { setShowTimeline(false); setSelectedPainting(p) }} onClose={() => setShowTimeline(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showQuiz && <PaintingQuiz isZh={isZh} onClose={() => setShowQuiz(false)} onCorrect={() => achievements.trackQuiz(true)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showMap && <WorldMap isZh={isZh} onSelect={(p) => { setShowMap(false); setSelectedPainting(p) }} onClose={() => setShowMap(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showCompare && <PaintingComparison isZh={isZh} onClose={() => setShowCompare(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showColorWheel && <ColorWheel isZh={isZh} onClose={() => setShowColorWheel(false)} />}
      </AnimatePresence>

      <AchievementToast achievement={newAchievement} isZh={isZh} onDone={() => setNewAchievement(null)} />
    </div>
  )
}

export default GalleryDashboard
