import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { GALLERY_ROOMS } from '../../constants/gallery'
import type { Painting } from '../../types/gallery'

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
   Magnifier lens
   ═══════════════════════════════════════════ */
function MagnifierImage({ painting }: { painting: Painting }) {
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
      {lens.show && (
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
function PaintingModal({ painting, onClose, isZh, onPrev, onNext }: {
  painting: Painting; onClose: () => void; isZh: boolean
  onPrev: () => void; onNext: () => void
}) {
  // Keyboard nav within modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext])

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
        <MagnifierImage painting={painting} />

        <motion.div className="mt-4 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="text-xl font-bold text-white tracking-wide">{painting.title}</h3>
          <p className="text-sm text-white/40 mt-1">{painting.artist} · {painting.year}</p>

          {painting.story && (
            <p className="text-sm text-white/50 mt-3 leading-relaxed max-w-lg mx-auto">
              {isZh ? painting.story.zh : painting.story.en}
            </p>
          )}

          {painting.palette && (
            <div className="flex gap-2 justify-center mt-4">
              {painting.palette.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="w-6 h-6 rounded-full border border-white/10 shadow-lg" style={{ background: c }} />
                  <span className="text-[8px] text-white/25 font-mono">{c}</span>
                </div>
              ))}
            </div>
          )}

          {painting.realSize && <HumanScale realSize={painting.realSize} />}
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
      <div className="relative overflow-hidden rounded bg-black" style={{ width: w, height: h }}>
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
function GalleryDashboard() {
  const { i18n } = useTranslation()
  const [roomIndex, setRoomIndex] = useState(0)
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [slideDir, setSlideDir] = useState(0)

  const room = GALLERY_ROOMS[roomIndex]
  const isZh = i18n.language === 'zh'
  const layouts = LAYOUTS[roomIndex] || LAYOUTS[0]

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
    <div className="fixed inset-0 z-30 flex flex-col" style={{ top: 56, background: '#050505' }}
      {...swipeHandlers}
    >
      {/* Zone 1: Room header */}
      <div className="shrink-0 text-center pt-3 pb-1">
        <AnimatePresence mode="wait">
          <motion.h2 key={room.id} className="text-sm font-medium tracking-[0.3em] uppercase text-white/50"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.4 }}>
            {isZh ? room.nameZh : room.name}
          </motion.h2>
        </AnimatePresence>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          {GALLERY_ROOMS.map((r, i) => (
            <button key={r.id} onClick={() => goToRoom(i, i > roomIndex ? 1 : -1)}
              className="w-10 h-7 flex items-center justify-center" aria-label={isZh ? r.nameZh : r.name}>
              <span className="block rounded-full transition-all duration-300"
                style={{ width: i === roomIndex ? 16 : 4, height: 4, background: i === roomIndex ? '#c9a84c' : 'rgba(255,255,255,0.15)' }} />
            </button>
          ))}
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
            isZh={isZh} onPrev={goToPrevPainting} onNext={goToNextPainting} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default GalleryDashboard
