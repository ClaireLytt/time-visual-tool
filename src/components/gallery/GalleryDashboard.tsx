import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { GALLERY_ROOMS } from '../../constants/gallery'
import type { Painting } from '../../types/gallery'

/* ═══════════════════════════════════════════
   Magnifier lens for brushstroke detail
   ═══════════════════════════════════════════ */
function MagnifierImage({ painting }: { painting: Painting }) {
  const imgRef = useRef<HTMLDivElement>(null)
  const [lens, setLens] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false })

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    setLens({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      show: true,
    })
  }, [])

  return (
    <div
      ref={imgRef}
      className="relative overflow-hidden rounded cursor-crosshair"
      style={{ minHeight: 200 }}
      onMouseMove={handleMove}
      onMouseEnter={() => setLens(p => ({ ...p, show: true }))}
      onMouseLeave={() => setLens(p => ({ ...p, show: false }))}
    >
      <div className="absolute inset-0 rounded" style={{ background: painting.fallbackGradient }} />
      <img
        src={painting.imageUrl}
        alt={`${painting.title} by ${painting.artist}`}
        className="relative w-full max-h-[60vh] object-contain rounded"
        referrerPolicy="no-referrer"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      {lens.show && (
        <div
          className="absolute w-32 h-32 rounded-full border-2 border-white/20 pointer-events-none overflow-hidden"
          style={{
            left: `${lens.x}%`, top: `${lens.y}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 30px rgba(0,0,0,0.7)',
          }}
        >
          <img
            src={painting.imageUrl} alt="" aria-hidden="true"
            className="absolute" referrerPolicy="no-referrer"
            style={{ width: '300%', height: '300%', left: `${-lens.x * 3 + 50}%`, top: `${-lens.y * 3 + 50}%`, maxWidth: 'none' }}
          />
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Human scale reference
   ═══════════════════════════════════════════ */
function HumanScale({ realSize }: { realSize: { widthCm: number; heightCm: number } }) {
  const SCALE = 60 / 170
  const paintH = realSize.heightCm * SCALE
  const paintW = realSize.widthCm * SCALE

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
          style={{ width: Math.max(8, Math.min(paintW, 120)), height: Math.max(8, Math.min(paintH, 80)) }}
        />
        <span className="text-[8px] text-white/30 mt-0.5">{realSize.heightCm}×{realSize.widthCm}cm</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Painting detail modal — full screen
   ═══════════════════════════════════════════ */
function PaintingModal({ painting, onClose, isZh }: { painting: Painting; onClose: () => void; isZh: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative max-w-3xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <MagnifierImage painting={painting} />

        <motion.div className="mt-5 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white tracking-wide">{painting.title}</h3>
          <p className="text-sm text-white/40 mt-1">{painting.artist} · {painting.year}</p>

          {painting.story && (
            <p className="text-sm text-white/55 mt-4 leading-relaxed max-w-lg mx-auto">
              {isZh ? painting.story.zh : painting.story.en}
            </p>
          )}

          {painting.palette && (
            <div className="flex gap-2.5 justify-center mt-5">
              {painting.palette.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="w-7 h-7 rounded-full border border-white/10 shadow-lg" style={{ background: c }} />
                  <span className="text-[9px] text-white/25 font-mono">{c}</span>
                </div>
              ))}
            </div>
          )}

          {painting.realSize && <HumanScale realSize={painting.realSize} />}
        </motion.div>

        <button onClick={onClose}
          className="absolute top-2 right-2 w-11 h-11 rounded-full bg-white/5 backdrop-blur text-white/60 hover:text-white hover:bg-white/15 flex items-center justify-center transition-all text-xl"
          aria-label="Close"
        >×</button>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   Free-form painting on the wall
   Each painting has unique position, size, rotation
   ═══════════════════════════════════════════ */
const LAYOUTS: { x: string; y: string; rotate: number; scale: number }[][] = [
  // Dutch Masters — asymmetric salon hang
  [
    { x: '8%',  y: '12%', rotate: -1.5, scale: 1.15 },
    { x: '38%', y: '6%',  rotate: 0.5,  scale: 1.4 },
    { x: '72%', y: '14%', rotate: 1.2,  scale: 1.1 },
  ],
  // Impressionism — airy, floating
  [
    { x: '6%',  y: '8%',  rotate: -0.8, scale: 1.35 },
    { x: '42%', y: '18%', rotate: 0,    scale: 1.2 },
    { x: '74%', y: '5%',  rotate: 1.5,  scale: 1.0 },
  ],
  // Renaissance — stately, centered weight
  [
    { x: '10%', y: '10%', rotate: 0,    scale: 1.0 },
    { x: '35%', y: '4%',  rotate: -0.5, scale: 1.5 },
    { x: '70%', y: '15%', rotate: 0.8,  scale: 1.25 },
  ],
]

function WallPainting({ painting, layout, onSelect, index }: {
  painting: Painting
  layout: { x: string; y: string; rotate: number; scale: number }
  onSelect: (p: Painting) => void
  index: number
}) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const w = painting.width * layout.scale
  const h = painting.height * layout.scale

  return (
    <motion.button
      onClick={() => onSelect(painting)}
      className="absolute group cursor-pointer"
      style={{ left: layout.x, top: layout.y }}
      initial={{ opacity: 0, y: 50, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: layout.rotate }}
      transition={{
        duration: 1,
        delay: 0.15 + index * 0.25,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      whileHover={{ scale: 1.06, rotate: 0, zIndex: 30 }}
      aria-label={`${painting.title} by ${painting.artist}`}
    >
      {/* Warm spotlight on hover */}
      <div
        className="absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(255,240,200,0.08) 0%, transparent 70%)' }}
      />

      {/* Shadow behind painting */}
      <div className="absolute inset-0 rounded" style={{
        boxShadow: '0 12px 48px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.5)',
      }} />

      {/* Painting */}
      <div className="relative overflow-hidden rounded bg-black" style={{ width: w, height: h }}>
        <div className="absolute inset-0" style={{ background: painting.fallbackGradient, opacity: imgLoaded ? 0 : 1, transition: 'opacity 0.6s' }} />
        {!imgError && (
          <img
            src={painting.imageUrl}
            alt={`${painting.title} by ${painting.artist}`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.6s' }}
            loading="lazy" referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Label — appears on hover */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        <p className="text-white/80 text-xs font-medium tracking-wide">{painting.title}</p>
        <p className="text-white/40 text-[10px] text-center">{painting.artist} · {painting.year}</p>
      </div>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════
   Main Gallery — full screen
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
    setTimeout(() => {
      setRoomIndex(index)
      setTransitioning(false)
    }, 500)
  }, [transitioning])

  const prevRoom = useMemo(() => GALLERY_ROOMS[(roomIndex - 1 + GALLERY_ROOMS.length) % GALLERY_ROOMS.length], [roomIndex])
  const nextRoom = useMemo(() => GALLERY_ROOMS[(roomIndex + 1) % GALLERY_ROOMS.length], [roomIndex])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selectedPainting) { if (e.key === 'Escape') setSelectedPainting(null); return }
      if (e.key === 'ArrowLeft') goToRoom((roomIndex - 1 + GALLERY_ROOMS.length) % GALLERY_ROOMS.length, -1)
      if (e.key === 'ArrowRight') goToRoom((roomIndex + 1) % GALLERY_ROOMS.length, 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [roomIndex, selectedPainting, goToRoom])

  return (
    <div className="w-full -mx-4 sm:-mx-6" style={{ marginTop: -16 }}>
      {/* ── Full-screen black gallery ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ background: '#050505', height: 'calc(100vh - 56px)', minHeight: 500 }}
      >
        {/* Room title — top center */}
        <div className="absolute top-4 left-0 right-0 z-20 text-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={room.id}
              className="text-sm font-medium tracking-[0.3em] uppercase text-white/50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
            >
              {isZh ? room.nameZh : room.name}
            </motion.h2>
          </AnimatePresence>

          {/* Room dots */}
          <div className="flex items-center justify-center gap-3 mt-2">
            {GALLERY_ROOMS.map((r, i) => (
              <button
                key={r.id}
                onClick={() => goToRoom(i, i > roomIndex ? 1 : -1)}
                className="w-11 h-8 flex items-center justify-center"
                aria-label={isZh ? r.nameZh : r.name}
              >
                <span className="block rounded-full transition-all duration-400"
                  style={{
                    width: i === roomIndex ? 18 : 5,
                    height: 5,
                    background: i === roomIndex ? '#c9a84c' : 'rgba(255,255,255,0.15)',
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Paintings — free-form positioned */}
        <AnimatePresence mode="wait">
          <motion.div
            key={room.id}
            className="absolute inset-0"
            initial={{ opacity: 0, x: slideDir * 120 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slideDir * 120 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            {room.paintings.map((p, i) => (
              <WallPainting
                key={p.id}
                painting={p}
                layout={layouts[i]}
                onSelect={setSelectedPainting}
                index={i}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows — edges */}
        <button
          onClick={() => goToRoom((roomIndex - 1 + GALLERY_ROOMS.length) % GALLERY_ROOMS.length, -1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 backdrop-blur-sm transition-all border border-white/10 cursor-pointer"
          aria-label={`Go to ${isZh ? prevRoom.nameZh : prevRoom.name}`}
        >
          <span className="text-lg text-white/50 hover:text-white">‹</span>
        </button>
        <button
          onClick={() => goToRoom((roomIndex + 1) % GALLERY_ROOMS.length, 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 backdrop-blur-sm transition-all border border-white/10 cursor-pointer"
          aria-label={`Go to ${isZh ? nextRoom.nameZh : nextRoom.name}`}
        >
          <span className="text-lg text-white/50 hover:text-white">›</span>
        </button>

        {/* Subtle vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }} />
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedPainting && (
          <PaintingModal painting={selectedPainting} onClose={() => setSelectedPainting(null)} isZh={isZh} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default GalleryDashboard
