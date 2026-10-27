import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { GALLERY_ROOMS } from '../../constants/gallery'
import type { GalleryRoom, Painting } from '../../types/gallery'

/* ── Painting frame with hover info ── */
function PaintingFrame({ painting, onSelect }: { painting: Painting; onSelect: (p: Painting) => void }) {
  return (
    <button
      onClick={() => onSelect(painting)}
      className="absolute group cursor-pointer"
      style={{
        left: `${painting.wallX}%`,
        top: `${painting.wallY}%`,
        width: painting.width,
        height: painting.height,
        transform: 'translate(-50%, -50%)',
      }}
      aria-label={`${painting.title} by ${painting.artist}`}
    >
      {/* Gold frame */}
      <div
        className="absolute -inset-3 rounded-sm"
        style={{
          background: 'linear-gradient(135deg, #c9a84c 0%, #f0d68a 25%, #c9a84c 50%, #a07830 75%, #c9a84c 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}
      />
      {/* Inner mat */}
      <div
        className="absolute -inset-1 rounded-sm"
        style={{ background: '#1a1610' }}
      />
      {/* The painting */}
      <img
        src={painting.imageUrl}
        alt={`${painting.title} by ${painting.artist}`}
        className="relative w-full h-full object-cover rounded-sm"
        loading="lazy"
      />
      {/* Hover label */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
        <div className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-md shadow-lg backdrop-blur-sm">
          <span className="font-semibold">{painting.title}</span>
          <span className="text-white/60 ml-1">— {painting.artist}, {painting.year}</span>
        </div>
      </div>
      {/* Spotlight effect */}
      <div
        className="absolute -inset-3 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,245,200,0.15) 0%, transparent 70%)',
        }}
      />
    </button>
  )
}

/* ── Doorway navigation ── */
function Doorway({ label, direction, onClick }: { label: string; direction: 'left' | 'right'; onClick: () => void }) {
  const isLeft = direction === 'left'
  return (
    <button
      onClick={onClick}
      className="absolute bottom-0 z-20 group cursor-pointer"
      style={{
        [isLeft ? 'left' : 'right']: '2%',
        width: 80,
        height: 140,
      }}
      aria-label={`Go to ${label}`}
    >
      {/* Doorway arch */}
      <div
        className="w-full h-full rounded-t-full relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0a0806 0%, #1a1510 60%, #2a2018 100%)',
          border: '3px solid #8a7a60',
          borderBottom: 'none',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), 0 0 15px rgba(0,0,0,0.4)',
        }}
      >
        {/* Depth glow */}
        <div
          className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(ellipse at 50% 80%, rgba(200,180,140,0.3) 0%, transparent 70%)',
          }}
        />
        {/* Arrow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl text-amber-200/50 group-hover:text-amber-200/90 transition-colors duration-200">
            {isLeft ? '←' : '→'}
          </span>
        </div>
      </div>
      {/* Label */}
      <div className="text-center mt-1">
        <span className="text-[10px] text-amber-200/60 group-hover:text-amber-200 transition-colors font-medium tracking-wide uppercase">
          {label}
        </span>
      </div>
    </button>
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
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Frame */}
        <div
          className="p-4 rounded"
          style={{
            background: 'linear-gradient(135deg, #c9a84c 0%, #f0d68a 20%, #c9a84c 40%, #a07830 60%, #c9a84c 80%, #f0d68a 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          <div className="bg-[#1a1610] p-2 rounded-sm">
            <img
              src={painting.imageUrl}
              alt={`${painting.title} by ${painting.artist}`}
              className="w-full max-h-[60vh] object-contain rounded-sm"
            />
          </div>
        </div>
        {/* Info plaque */}
        <div
          className="mt-4 mx-auto max-w-md text-center px-6 py-3 rounded"
          style={{
            background: 'linear-gradient(135deg, #d4c19c, #c9b48a)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          <h3 className="text-lg font-bold text-[#2a2018] tracking-wide">{painting.title}</h3>
          <p className="text-sm text-[#5a4a38] mt-0.5">{painting.artist} · {painting.year}</p>
        </div>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors text-xl"
          aria-label="Close"
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ── Main 3D Gallery ── */
function GalleryDashboard() {
  const { t, i18n } = useTranslation()
  const [roomIndex, setRoomIndex] = useState(0)
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const room = GALLERY_ROOMS[roomIndex]
  const isZh = i18n.language === 'zh'

  const goToRoom = useCallback((index: number) => {
    if (transitioning) return
    setTransitioning(true)
    setTimeout(() => {
      setRoomIndex(index)
      setTransitioning(false)
    }, 500)
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
    <div className="w-full" ref={containerRef}>
      {/* Room name header */}
      <div className="text-center mb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold tracking-wide text-gray-800 dark:text-gray-100">
              {isZh ? room.nameZh : room.name}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              {GALLERY_ROOMS.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => goToRoom(i)}
                  className="transition-all duration-200"
                  style={{
                    width: i === roomIndex ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === roomIndex ? '#c9a84c' : 'rgba(180,160,120,0.3)',
                  }}
                  aria-label={isZh ? r.nameZh : r.name}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3D Gallery Room */}
      <div
        className="relative mx-auto overflow-hidden rounded-xl"
        style={{
          perspective: '800px',
          perspectiveOrigin: '50% 45%',
          maxWidth: 700,
          height: 420,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={room.id}
            initial={{ opacity: 0, rotateY: transitioning ? 15 : 0 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -15 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* ── Back wall ── */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${room.wallColor} 0%, ${room.wallColor}ee 70%, ${room.wallColor}cc 100%)`,
                transform: 'translateZ(0px)',
              }}
            >
              {/* Wall texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                }}
              />
              {/* Crown molding */}
              <div
                className="absolute top-0 left-0 right-0 h-4"
                style={{
                  background: 'linear-gradient(180deg, #8a7a60 0%, #6a5a40 40%, transparent 100%)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              />
              {/* Baseboard */}
              <div
                className="absolute bottom-0 left-0 right-0 h-3"
                style={{
                  background: 'linear-gradient(0deg, #5a4a30 0%, #7a6a50 100%)',
                }}
              />

              {/* Paintings on the wall */}
              {room.paintings.map((p) => (
                <PaintingFrame key={p.id} painting={p} onSelect={setSelectedPainting} />
              ))}

              {/* Doorways */}
              <Doorway
                label={isZh ? prevRoom.nameZh : prevRoom.name}
                direction="left"
                onClick={() => goToRoom((roomIndex - 1 + GALLERY_ROOMS.length) % GALLERY_ROOMS.length)}
              />
              <Doorway
                label={isZh ? nextRoom.nameZh : nextRoom.name}
                direction="right"
                onClick={() => goToRoom((roomIndex + 1) % GALLERY_ROOMS.length)}
              />
            </div>

            {/* ── Floor with checkered pattern ── */}
            <div
              className="absolute left-0 right-0 bottom-0"
              style={{
                height: '40%',
                transformOrigin: 'bottom center',
                transform: 'rotateX(60deg)',
                background: `
                  repeating-conic-gradient(
                    ${room.floorLight} 0% 25%,
                    ${room.floorDark} 0% 50%
                  ) 0 0 / 60px 60px`,
                opacity: 0.7,
              }}
            />

            {/* Ambient lighting */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 20%, rgba(255,240,200,0.08) 0%, transparent 60%)',
              }}
            />
            {/* Vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.4) 100%)',
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Room info & painting list */}
      <div className="mt-4 space-y-2 max-w-[700px] mx-auto">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t('galleryApp.hint', '← → keys or tap doorways to explore')}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {room.paintings.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPainting(p)}
              className="panel p-2 text-left hover:ring-2 ring-amber-400/50 transition-all cursor-pointer"
            >
              <img
                src={p.imageUrl}
                alt={`${p.title} by ${p.artist}`}
                className="w-full h-20 object-cover rounded mb-1.5"
                loading="lazy"
              />
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{p.title}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{p.artist} · {p.year}</p>
            </button>
          ))}
        </div>
      </div>

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
