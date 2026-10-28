import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { GALLERY_ROOMS } from '../../constants/gallery'
import type { Painting } from '../../types/gallery'

/* ═══════════════════════════════════════════
   Ambient sound — Web Audio API drones
   ═══════════════════════════════════════════ */
const AMBIENT_FREQS: Record<string, number[]> = {
  bells:  [261.6, 329.6, 392.0],   // C major chord — church-like
  piano:  [220.0, 277.2, 330.0],   // A major — gentle
  organ:  [130.8, 196.0, 261.6],   // low C — solemn
}

function useAmbientSound(soundType?: string, enabled = true) {
  const ctxRef = useRef<AudioContext | null>(null)
  const gainsRef = useRef<GainNode[]>([])

  useEffect(() => {
    if (!enabled || !soundType) return
    const freqs = AMBIENT_FREQS[soundType]
    if (!freqs) return

    try {
      const ctx = new AudioContext()
      ctxRef.current = ctx
      const gains: GainNode[] = []

      freqs.forEach((freq) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq
        const gain = ctx.createGain()
        gain.gain.value = 0
        gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 2)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        gains.push(gain)
      })
      gainsRef.current = gains

      return () => {
        gains.forEach(g => {
          try { g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5) } catch (e) { void e }
        })
        setTimeout(() => { try { ctx.close() } catch (e) { void e } }, 600)
      }
    } catch (e) {
      void e
      return undefined
    }
  }, [soundType, enabled])
}

/* ═══════════════════════════════════════════
   Flashlight mode — CSS mask follows pointer
   ═══════════════════════════════════════════ */
function useFlashlight(containerRef: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [pos, setPos] = useState({ x: 50, y: 50 })

  useEffect(() => {
    if (!enabled || !containerRef.current) return
    const el = containerRef.current
    const handler = (e: MouseEvent | TouchEvent) => {
      const rect = el.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      setPos({
        x: ((clientX - rect.left) / rect.width) * 100,
        y: ((clientY - rect.top) / rect.height) * 100,
      })
    }
    el.addEventListener('mousemove', handler)
    el.addEventListener('touchmove', handler)
    return () => {
      el.removeEventListener('mousemove', handler)
      el.removeEventListener('touchmove', handler)
    }
  }, [enabled, containerRef])

  return pos
}

/* ═══════════════════════════════════════════
   Single painting on the wall
   ═══════════════════════════════════════════ */
function WallPainting({ painting, onSelect, index }: {
  painting: Painting
  onSelect: (p: Painting) => void
  index: number
}) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <motion.button
      onClick={() => onSelect(painting)}
      className="group cursor-pointer relative flex flex-col items-center"
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
      }}
      whileHover={{ scale: 1.04, y: -6 }}
      aria-label={`${painting.title} by ${painting.artist}`}
    >
      {/* Spotlight glow */}
      <div
        className="absolute -inset-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255,240,200,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Thin gold border */}
      <div
        className="relative rounded overflow-hidden"
        style={{
          padding: 2,
          background: 'linear-gradient(135deg, #c9a84c66, #f0d68a44, #c9a84c66)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        <div className="relative overflow-hidden rounded-sm bg-black">
          <div
            className="absolute inset-0"
            style={{
              background: painting.fallbackGradient,
              opacity: imgLoaded ? 0 : 1,
              transition: 'opacity 0.5s',
            }}
          />
          {!imgError && (
            <img
              src={painting.imageUrl}
              alt={`${painting.title} by ${painting.artist}`}
              className="relative block object-cover"
              style={{
                opacity: imgLoaded ? 1 : 0,
                transition: 'opacity 0.5s',
                width: painting.width,
                height: painting.height,
              }}
              loading="lazy"
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}
          {imgError && <div style={{ width: painting.width, height: painting.height }} />}
        </div>
      </div>

      {/* Always-visible label */}
      <div className="mt-2.5 text-center max-w-[200px]">
        <p className="text-white/70 text-[11px] font-medium tracking-wide leading-tight">{painting.title}</p>
        <p className="text-white/35 text-[10px] mt-0.5">{painting.artist}</p>
      </div>

      {/* Color palette dots */}
      {painting.palette && (
        <div className="flex gap-1 mt-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
          {painting.palette.map((c, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full border border-white/10"
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
      )}
    </motion.button>
  )
}

/* ═══════════════════════════════════════════
   Human scale reference (silhouette)
   ═══════════════════════════════════════════ */
function HumanScale({ realSize }: { realSize: { widthCm: number; heightCm: number } }) {
  // Scale: 170cm person = 60px tall
  const SCALE = 60 / 170
  const paintH = realSize.heightCm * SCALE
  const paintW = realSize.widthCm * SCALE
  const humanH = 60

  return (
    <div className="flex items-end gap-2 justify-center mt-3">
      {/* Human silhouette */}
      <div className="flex flex-col items-center">
        <svg width="16" height={humanH} viewBox="0 0 16 60" fill="none" aria-hidden="true">
          <circle cx="8" cy="4" r="4" fill="rgba(255,255,255,0.4)" />
          <rect x="5" y="9" width="6" height="22" rx="3" fill="rgba(255,255,255,0.3)" />
          <rect x="3" y="31" width="4" height="24" rx="2" fill="rgba(255,255,255,0.25)" />
          <rect x="9" y="31" width="4" height="24" rx="2" fill="rgba(255,255,255,0.25)" />
        </svg>
        <span className="text-[8px] text-white/30 mt-0.5">170cm</span>
      </div>
      {/* Painting rectangle */}
      <div className="flex flex-col items-center">
        <div
          className="border border-white/30 rounded-sm bg-white/5"
          style={{
            width: Math.max(8, Math.min(paintW, 120)),
            height: Math.max(8, Math.min(paintH, 80)),
          }}
        />
        <span className="text-[8px] text-white/30 mt-0.5">
          {realSize.heightCm}×{realSize.widthCm}cm
        </span>
      </div>
    </div>
  )
}

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
      className="relative overflow-hidden rounded-lg cursor-crosshair"
      style={{ minHeight: 200 }}
      onMouseMove={handleMove}
      onMouseEnter={() => setLens(p => ({ ...p, show: true }))}
      onMouseLeave={() => setLens(p => ({ ...p, show: false }))}
    >
      <div className="absolute inset-0 rounded-lg" style={{ background: painting.fallbackGradient }} />
      <img
        src={painting.imageUrl}
        alt={`${painting.title} by ${painting.artist}`}
        className="relative w-full max-h-[55vh] object-contain rounded-lg"
        referrerPolicy="no-referrer"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      {/* Magnifier lens */}
      {lens.show && (
        <div
          className="absolute w-28 h-28 rounded-full border-2 border-white/30 pointer-events-none overflow-hidden"
          style={{
            left: `${lens.x}%`,
            top: `${lens.y}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 20px rgba(0,0,0,0.6)',
          }}
        >
          <img
            src={painting.imageUrl}
            alt=""
            className="absolute"
            style={{
              width: '300%',
              height: '300%',
              left: `${-lens.x * 3 + 50}%`,
              top: `${-lens.y * 3 + 50}%`,
              maxWidth: 'none',
            }}
            referrerPolicy="no-referrer"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Painting detail modal
   ═══════════════════════════════════════════ */
function PaintingModal({ painting, onClose, isZh }: { painting: Painting; onClose: () => void; isZh: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/92 backdrop-blur-md" />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative max-w-2xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Magnifier image */}
        <MagnifierImage painting={painting} />

        {/* Info */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-xl font-bold text-white tracking-wide">{painting.title}</h3>
          <p className="text-sm text-white/50 mt-1">{painting.artist} · {painting.year}</p>

          {/* Story */}
          {painting.story && (
            <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-md mx-auto px-4">
              {isZh ? painting.story.zh : painting.story.en}
            </p>
          )}

          {/* Palette */}
          {painting.palette && (
            <div className="flex gap-2 justify-center mt-4">
              {painting.palette.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span
                    className="w-6 h-6 rounded-full border border-white/15 shadow-lg"
                    style={{ background: c }}
                  />
                  <span className="text-[9px] text-white/30 font-mono">{c}</span>
                </div>
              ))}
            </div>
          )}

          {/* Human scale comparison */}
          {painting.realSize && <HumanScale realSize={painting.realSize} />}
        </motion.div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20 transition-colors text-xl"
          aria-label="Close"
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   Timeline bar
   ═══════════════════════════════════════════ */
function Timeline({ paintings }: { paintings: Painting[] }) {
  const years = paintings.map(p => Number(p.year))
  const min = Math.min(...years) - 20
  const max = Math.max(...years) + 20
  const range = max - min

  return (
    <div className="px-8 py-2">
      <div className="relative h-8">
        {/* Line */}
        <div className="absolute top-3 left-0 right-0 h-px bg-white/15" />
        {/* Year markers */}
        {paintings.map((p) => {
          const pct = ((Number(p.year) - min) / range) * 100
          return (
            <div
              key={p.id}
              className="absolute flex flex-col items-center"
              style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-2 h-2 rounded-full bg-amber-400/80 border border-amber-300/50" />
              <span className="text-[9px] text-white/50 mt-1 whitespace-nowrap">
                {p.year}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Nav arrow
   ═══════════════════════════════════════════ */
function NavArrow({ direction, label, onClick }: { direction: 'left' | 'right'; label: string; onClick: () => void }) {
  const isLeft = direction === 'left'
  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 -translate-y-1/2 z-20 group cursor-pointer"
      style={{ [isLeft ? 'left' : 'right']: 12 }}
      aria-label={`Go to ${label}`}
    >
      <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 backdrop-blur-sm transition-all duration-200 border border-white/10">
        <span className="text-lg text-white/60 group-hover:text-white transition-colors">
          {isLeft ? '‹' : '›'}
        </span>
      </div>
    </button>
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
  const [slideDir, setSlideDir] = useState(0) // -1 left, 1 right
  const [flashlight, setFlashlight] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const galleryRef = useRef<HTMLDivElement>(null)

  const room = GALLERY_ROOMS[roomIndex]
  const isZh = i18n.language === 'zh'

  // Ambient sound
  useAmbientSound(room.ambientSound, soundOn)

  // Flashlight
  const flashPos = useFlashlight(galleryRef, flashlight)

  const goToRoom = useCallback((index: number, dir: number) => {
    if (transitioning) return
    setSlideDir(dir)
    setTransitioning(true)
    setTimeout(() => {
      setRoomIndex(index)
      setTransitioning(false)
    }, 400)
  }, [transitioning])

  const prevRoom = useMemo(() => {
    const i = (roomIndex - 1 + GALLERY_ROOMS.length) % GALLERY_ROOMS.length
    return GALLERY_ROOMS[i]
  }, [roomIndex])

  const nextRoom = useMemo(() => {
    const i = (roomIndex + 1) % GALLERY_ROOMS.length
    return GALLERY_ROOMS[i]
  }, [roomIndex])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selectedPainting) {
        if (e.key === 'Escape') setSelectedPainting(null)
        return
      }
      if (e.key === 'ArrowLeft') goToRoom((roomIndex - 1 + GALLERY_ROOMS.length) % GALLERY_ROOMS.length, -1)
      if (e.key === 'ArrowRight') goToRoom((roomIndex + 1) % GALLERY_ROOMS.length, 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [roomIndex, selectedPainting, goToRoom])

  // Always dark — immersive gallery
  const dotActive = '#c9a84c'
  const dotInactive = 'rgba(255,255,255,0.2)'

  return (
    <div className="w-full -mx-4 sm:-mx-6">
      {/* ── Gallery canvas ── */}
      <div
        ref={galleryRef}
        className="relative w-full overflow-hidden"
        style={{
          background: '#0a0a0a',
          minHeight: 480,
          // Flashlight mask
          ...(flashlight ? {
            WebkitMaskImage: `radial-gradient(circle 120px at ${flashPos.x}% ${flashPos.y}%, black 60%, transparent 100%)`,
            maskImage: `radial-gradient(circle 120px at ${flashPos.x}% ${flashPos.y}%, black 60%, transparent 100%)`,
          } : {}),
        }}
      >
        {/* Room title */}
        <div className="pt-5 pb-1 text-center relative z-10">
          <AnimatePresence mode="wait">
            <motion.h2
              key={room.id}
              className="text-lg font-semibold tracking-widest uppercase text-white/80"
              initial={{ opacity: 0, x: slideDir * 40, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -slideDir * 40, filter: 'blur(4px)' }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            >
              {isZh ? room.nameZh : room.name}
            </motion.h2>
          </AnimatePresence>

          {/* Room dots */}
          <div className="flex items-center justify-center gap-0 mt-1.5">
            {GALLERY_ROOMS.map((r, i) => (
              <button
                key={r.id}
                onClick={() => goToRoom(i, i > roomIndex ? 1 : -1)}
                className="flex items-center justify-center"
                style={{ width: 44, height: 32 }}
                aria-label={isZh ? r.nameZh : r.name}
              >
                <span
                  className="block rounded-full transition-all duration-300"
                  style={{
                    width: i === roomIndex ? 20 : 6,
                    height: 6,
                    background: i === roomIndex ? dotActive : dotInactive,
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Paintings — slide transition */}
        <div className="relative z-10 px-16 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={room.id}
              initial={{ opacity: 0, x: slideDir * 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -slideDir * 100, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
              className="flex items-start justify-center gap-10 sm:gap-14 flex-wrap py-4"
            >
              {room.paintings.map((p, i) => (
                <WallPainting
                  key={p.id}
                  painting={{
                    ...p,
                    // Override label colors for light mode via a trick — we override in the component
                  }}
                  onSelect={setSelectedPainting}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Timeline */}
        <div className="relative z-10">
          <Timeline paintings={room.paintings} />
        </div>

        {/* Nav arrows */}
        <NavArrow
          direction="left"
          label={isZh ? prevRoom.nameZh : prevRoom.name}
          onClick={() => goToRoom((roomIndex - 1 + GALLERY_ROOMS.length) % GALLERY_ROOMS.length, -1)}
        />
        <NavArrow
          direction="right"
          label={isZh ? nextRoom.nameZh : nextRoom.name}
          onClick={() => goToRoom((roomIndex + 1) % GALLERY_ROOMS.length, 1)}
        />

        {/* Vignette edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.3) 100%)',
          }}
        />

        {/* Control buttons — top right */}
        <div className="absolute top-3 right-3 z-20 flex gap-1.5">
          <button
            onClick={() => setFlashlight(f => !f)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all ${
              flashlight
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-white/5 text-white/40 border border-white/10'
            }`}
            aria-label="Flashlight mode"
            title={isZh ? '手电筒模式' : 'Flashlight mode'}
          >
            🔦
          </button>
          <button
            onClick={() => setSoundOn(s => !s)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all ${
              soundOn
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-white/5 text-white/40 border border-white/10'
            }`}
            aria-label="Ambient sound"
            title={isZh ? '环境音' : 'Ambient sound'}
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-500 text-center mt-2.5 px-4">
        ← → {isZh ? '方向键切换展厅 · 点击画作查看详情 · 🔦手电筒 · 🔊环境音' : 'switch rooms · click painting for details · 🔦flashlight · 🔊ambient'}
      </p>

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
