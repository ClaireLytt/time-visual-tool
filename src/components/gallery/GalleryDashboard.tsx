import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { GALLERY_ROOMS } from '../../constants/gallery'
import type { Painting } from '../../types/gallery'

/* ── Single painting on the wall ── */
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
      className="group cursor-pointer relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
      }}
      whileHover={{ scale: 1.03, y: -4 }}
      aria-label={`${painting.title} by ${painting.artist}`}
    >
      {/* Spotlight glow behind painting */}
      <div
        className="absolute -inset-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255,240,200,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Thin gold border — subtle, not a heavy frame */}
      <div
        className="relative rounded overflow-hidden"
        style={{
          padding: 2,
          background: 'linear-gradient(135deg, #c9a84c88, #f0d68a66, #c9a84c88)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        <div className="relative overflow-hidden rounded-sm bg-black">
          {/* Fallback gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: painting.fallbackGradient,
              opacity: imgLoaded ? 0 : 1,
              transition: 'opacity 0.5s',
            }}
          />
          {/* Real image */}
          {!imgError && (
            <img
              src={painting.imageUrl}
              alt={`${painting.title} by ${painting.artist}`}
              className="relative block w-full h-full object-cover"
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
          {/* Fallback size placeholder */}
          {imgError && (
            <div style={{ width: painting.width, height: painting.height }} />
          )}
        </div>
      </div>

      {/* Label below painting */}
      <div className="mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white/90 text-xs font-medium tracking-wide">{painting.title}</p>
        <p className="text-white/50 text-[10px] mt-0.5">{painting.artist} · {painting.year}</p>
      </div>
    </motion.button>
  )
}

/* ── Painting detail modal ── */
function PaintingModal({ painting, onClose }: { painting: Painting; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative overflow-hidden rounded-lg" style={{ minHeight: 200 }}>
          <div className="absolute inset-0 rounded-lg" style={{ background: painting.fallbackGradient }} />
          <img
            src={painting.imageUrl}
            alt={`${painting.title} by ${painting.artist}`}
            className="relative w-full max-h-[65vh] object-contain rounded-lg"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
        {/* Info */}
        <motion.div
          className="mt-5 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-xl font-bold text-white tracking-wide">{painting.title}</h3>
          <p className="text-sm text-white/60 mt-1">{painting.artist} · {painting.year}</p>
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

/* ── Room nav arrow ── */
function NavArrow({ direction, label, onClick }: { direction: 'left' | 'right'; label: string; onClick: () => void }) {
  const isLeft = direction === 'left'
  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 -translate-y-1/2 z-20 group flex items-center gap-2 cursor-pointer"
      style={{ [isLeft ? 'left' : 'right']: 12 }}
      aria-label={`Go to ${label}`}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 backdrop-blur-sm transition-all duration-200 border border-white/10"
      >
        <span className="text-lg text-white/60 group-hover:text-white transition-colors">
          {isLeft ? '‹' : '›'}
        </span>
      </div>
    </button>
  )
}

/* ── Main Gallery ── */
function GalleryDashboard() {
  const { i18n } = useTranslation()
  const [roomIndex, setRoomIndex] = useState(0)
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null)
  const [transitioning, setTransitioning] = useState(false)

  const room = GALLERY_ROOMS[roomIndex]
  const isZh = i18n.language === 'zh'

  const goToRoom = useCallback((index: number) => {
    if (transitioning) return
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
      if (e.key === 'ArrowLeft') goToRoom((roomIndex - 1 + GALLERY_ROOMS.length) % GALLERY_ROOMS.length)
      if (e.key === 'ArrowRight') goToRoom((roomIndex + 1) % GALLERY_ROOMS.length)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [roomIndex, selectedPainting, goToRoom])

  return (
    <div className="w-full -mx-4 sm:-mx-6">
      {/* ── Black gallery canvas ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #111 40%, #0d0d0d 100%)',
          minHeight: 520,
        }}
      >
        {/* Subtle floor reflection */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background: 'linear-gradient(0deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
          }}
        />

        {/* Room title */}
        <div className="pt-6 pb-2 text-center relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold tracking-widest text-white/80 uppercase">
                {isZh ? room.nameZh : room.name}
              </h2>
            </motion.div>
          </AnimatePresence>

          {/* Room dots */}
          <div className="flex items-center justify-center gap-0 mt-2">
            {GALLERY_ROOMS.map((r, i) => (
              <button
                key={r.id}
                onClick={() => goToRoom(i)}
                className="flex items-center justify-center"
                style={{ width: 44, height: 32 }}
                aria-label={isZh ? r.nameZh : r.name}
              >
                <span
                  className="block rounded-full transition-all duration-300"
                  style={{
                    width: i === roomIndex ? 20 : 6,
                    height: 6,
                    background: i === roomIndex ? '#c9a84c' : 'rgba(255,255,255,0.2)',
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Paintings — horizontal layout with generous spacing */}
        <div className="relative z-10 px-16 pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={room.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-10 sm:gap-14 flex-wrap py-6"
            >
              {room.paintings.map((p, i) => (
                <WallPainting
                  key={p.id}
                  painting={p}
                  onSelect={setSelectedPainting}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav arrows */}
        <NavArrow
          direction="left"
          label={isZh ? prevRoom.nameZh : prevRoom.name}
          onClick={() => goToRoom((roomIndex - 1 + GALLERY_ROOMS.length) % GALLERY_ROOMS.length)}
        />
        <NavArrow
          direction="right"
          label={isZh ? nextRoom.nameZh : nextRoom.name}
          onClick={() => goToRoom((roomIndex + 1) % GALLERY_ROOMS.length)}
        />

        {/* Vignette edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.3) 100%)',
          }}
        />
      </div>

      {/* ── Hint ── */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 px-4">
        ← → {isZh ? '方向键切换展厅 · 点击画作查看详情' : 'keys to switch rooms · click a painting for details'}
      </p>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedPainting && (
          <PaintingModal painting={selectedPainting} onClose={() => setSelectedPainting(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default GalleryDashboard
