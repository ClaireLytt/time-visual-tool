import { useState, useRef, useMemo, useEffect } from 'react'
import { motion } from 'motion/react'
import { GALLERY_ROOMS } from '../../constants/gallery'
import { PAINTING_EXTRAS } from '../../constants/paintingData'
import type { Painting } from '../../types/gallery'

/* ═══════════════════════════════════════════
   World Map — painting museum locations
   ═══════════════════════════════════════════ */
interface MapPin { x: number; y: number; city: string; paintings: (Painting & { museum: string })[] }

const CITY_COORDS: Record<string, { x: number; y: number }> = {
  'The Hague': { x: 49.5, y: 26 }, 'Amsterdam': { x: 49.8, y: 25 },
  'Paris': { x: 48.5, y: 27.5 }, 'New York': { x: 25, y: 31 },
  'Florence': { x: 51.5, y: 29 }, 'Vatican': { x: 51.3, y: 30 },
  'Madrid': { x: 46, y: 31 }, 'Zürich': { x: 50.5, y: 27.5 },
  'Beijing': { x: 76, y: 31 }, 'Taipei': { x: 79, y: 36 },
  'Chicago': { x: 22, y: 30 }, 'Other': { x: 50, y: 48 },
}

function getCity(museum: string): string {
  for (const [city] of Object.entries(CITY_COORDS)) {
    if (city === 'Other') continue
    if (museum.includes(city)) return city
  }
  if (museum.includes('Rijks')) return 'Amsterdam'
  if (museum.includes('Louvre') || museum.includes('Marmottan')) return 'Paris'
  if (museum.includes('MoMA')) return 'New York'
  if (museum.includes('Uffizi')) return 'Florence'
  if (museum.includes('Sistine')) return 'Vatican'
  if (museum.includes('Reina')) return 'Madrid'
  if (museum.includes('Palace Museum')) return 'Beijing'
  return 'Other'
}

export function WorldMap({ isZh, onSelect, onClose }: {
  isZh: boolean; onSelect: (p: Painting) => void; onClose: () => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  const pins = useMemo(() => {
    const map = new Map<string, MapPin>()
    GALLERY_ROOMS.forEach(room => {
      room.paintings.forEach(p => {
        const extra = PAINTING_EXTRAS[p.id]
        const museum = extra?.museum || 'Unknown'
        const city = getCity(museum)
        const coords = CITY_COORDS[city] || CITY_COORDS['Other']
        if (!map.has(city)) map.set(city, { ...coords, city, paintings: [] })
        map.get(city)!.paintings.push({ ...p, museum })
      })
    })
    return Array.from(map.values())
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" />
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">🌍 {isZh ? '名画世界地图' : 'World Art Map'}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:text-white flex items-center justify-center" aria-label="Close">×</button>
        </div>
        <div className="relative w-full aspect-[2/1] bg-[#0a0f1a] rounded-xl overflow-hidden border border-white/5">
          <svg viewBox="0 0 100 60" className="w-full h-full">
            {/* Continent shapes */}
            <path d="M10,18 L15,15 L30,14 L28,20 L25,28 L20,35 L15,38 L10,33 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.2" />
            <path d="M42,12 L55,10 L65,12 L70,15 L72,20 L68,25 L60,28 L55,35 L50,38 L45,35 L42,30 L40,22 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.2" />
            <path d="M48,35 L52,32 L58,35 L55,45 L50,50 L46,45 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.2" />
            <path d="M68,15 L80,12 L88,18 L85,25 L82,30 L78,32 L72,28 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.2" />
            {pins.map(pin => (
              <g key={pin.city} onMouseEnter={() => setHovered(pin.city)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
                <circle cx={pin.x} cy={pin.y} r={0.8 + pin.paintings.length * 0.4}
                  fill={hovered === pin.city ? '#c9a84c' : 'rgba(201,168,76,0.6)'} stroke="rgba(201,168,76,0.3)" strokeWidth="0.3" />
                <circle cx={pin.x} cy={pin.y} r={1.5 + pin.paintings.length * 0.3} fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.15">
                  <animate attributeName="r" from={String(1.5 + pin.paintings.length * 0.3)} to="3" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x={pin.x} y={pin.y - 2} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="1.8" fontFamily="system-ui">{pin.city}</text>
              </g>
            ))}
          </svg>
          {hovered && (() => {
            const pin = pins.find(p => p.city === hovered)
            if (!pin) return null
            return (
              <div className="absolute bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg p-3 pointer-events-auto z-10"
                style={{ left: `${pin.x}%`, top: `${Math.min(pin.y + 5, 50)}%`, transform: 'translateX(-50%)', minWidth: 160 }}>
                <p className="text-xs font-bold text-white mb-1">{pin.city}</p>
                {pin.paintings.map(p => (
                  <button key={p.id} onClick={() => onSelect(p)} className="block w-full text-left hover:bg-white/5 rounded px-1 py-0.5 cursor-pointer">
                    <p className="text-[10px] text-white/70">{p.title}</p>
                    <p className="text-[9px] text-white/40">{p.museum}</p>
                  </button>
                ))}
              </div>
            )
          })()}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   Painting comparison
   ═══════════════════════════════════════════ */
export function PaintingComparison({ isZh, onClose }: { isZh: boolean; onClose: () => void }) {
  const all = useMemo(() => GALLERY_ROOMS.flatMap(r => r.paintings), [])
  const [li, setLi] = useState(0)
  const [ri, setRi] = useState(1)
  const l = all[li], r = all[ri]
  const le = PAINTING_EXTRAS[l.id], re = PAINTING_EXTRAS[r.id]
  const la = (l.realSize?.widthCm || 50) * (l.realSize?.heightCm || 50)
  const ra = (r.realSize?.widthCm || 50) * (r.realSize?.heightCm || 50)
  const mx = Math.max(la, ra)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" />
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="relative max-w-3xl w-full my-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">📐 {isZh ? '画作对比' : 'Compare'}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:text-white flex items-center justify-center" aria-label="Close">×</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[{ idx: li, set: setLi, p: l, ex: le }, { idx: ri, set: setRi, p: r, ex: re }].map(({ idx, set, p, ex }, side) => (
            <div key={side}>
              <select value={idx} onChange={e => set(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white/70 mb-2">
                {all.map((pp, i) => <option key={pp.id} value={i}>{pp.title}</option>)}
              </select>
              <div className="aspect-[4/3] rounded-lg overflow-hidden relative bg-black">
                <div className="absolute inset-0" style={{ background: p.fallbackGradient }} />
                <img src={p.imageUrl} alt={p.title} className="absolute inset-0 w-full h-full object-contain"
                  referrerPolicy="no-referrer" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
              <p className="text-xs text-white/70 mt-1 text-center">{p.title}</p>
              <p className="text-[10px] text-white/40 text-center">{p.artist} · {p.year}</p>
              {ex && <p className="text-[9px] text-amber-400/40 text-center">{ex.museum}</p>}
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/3 rounded-lg p-2">
            <p className="text-[9px] text-white/30 uppercase">{isZh ? '年代差' : 'Gap'}</p>
            <p className="text-lg font-bold text-amber-400/70">{Math.abs(Number(l.year) - Number(r.year))}</p>
            <p className="text-[9px] text-white/30">{isZh ? '年' : 'yrs'}</p>
          </div>
          <div className="bg-white/3 rounded-lg p-2">
            <p className="text-[9px] text-white/30 uppercase">{isZh ? '面积比' : 'Size'}</p>
            <div className="flex items-end justify-center gap-1 h-8">
              <div className="bg-amber-400/30 rounded-sm" style={{ width: 16, height: `${(la / mx) * 100}%`, minHeight: 3 }} />
              <div className="bg-white/20 rounded-sm" style={{ width: 16, height: `${(ra / mx) * 100}%`, minHeight: 3 }} />
            </div>
          </div>
          <div className="bg-white/3 rounded-lg p-2">
            <p className="text-[9px] text-white/30 uppercase">{isZh ? '色调' : 'Hue'}</p>
            <div className="flex gap-0.5 justify-center mt-1 flex-wrap">
              {(l.palette || []).slice(0, 3).map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
              <span className="text-white/15 text-[9px] mx-0.5">vs</span>
              {(r.palette || []).slice(0, 3).map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   Color wheel analysis
   ═══════════════════════════════════════════ */
function hexToHsl(hex: string): [number, number] {
  const rv = parseInt(hex.slice(1, 3), 16) / 255
  const gv = parseInt(hex.slice(3, 5), 16) / 255
  const bv = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(rv, gv, bv), min = Math.min(rv, gv, bv)
  const l = (max + min) / 2
  if (max === min) return [0, 0]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === rv ? ((gv - bv) / d + (gv < bv ? 6 : 0)) / 6
    : max === gv ? ((bv - rv) / d + 2) / 6
    : ((rv - gv) / d + 4) / 6
  return [h * 360, s]
}

export function ColorWheel({ isZh, onClose }: { isZh: boolean; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const allColors = useMemo(() => {
    const result: { color: string; room: string; h: number; s: number }[] = []
    GALLERY_ROOMS.forEach(room => {
      room.paintings.forEach(p => {
        (p.palette || []).forEach(c => {
          if (!c.startsWith('#') || c.length < 7) return
          const [h, s] = hexToHsl(c)
          result.push({ color: c, room: isZh ? room.nameZh : room.name, h, s })
        })
      })
    })
    return result
  }, [isZh])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = 300; canvas.width = size; canvas.height = size
    const cx = size / 2, cy = size / 2, radius = size / 2 - 30
    for (let a = 0; a < 360; a++) {
      const rad = (a - 90) * Math.PI / 180
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius + 15, rad, rad + Math.PI / 180 * 1.5)
      ctx.fillStyle = `hsl(${a}, 60%, 40%)`; ctx.globalAlpha = 0.08; ctx.fill()
    }
    ctx.globalAlpha = 1
    allColors.forEach(c => {
      const rad = (c.h - 90) * Math.PI / 180
      ctx.beginPath()
      ctx.arc(cx + Math.cos(rad) * c.s * radius * 0.9, cy + Math.sin(rad) * c.s * radius * 0.9, 5, 0, Math.PI * 2)
      ctx.fillStyle = c.color; ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.5; ctx.stroke()
    })
  }, [allColors])

  const roomSummary = useMemo(() => {
    const rooms = new Map<string, { warm: number; cool: number; neutral: number }>()
    allColors.forEach(c => {
      if (!rooms.has(c.room)) rooms.set(c.room, { warm: 0, cool: 0, neutral: 0 })
      const e = rooms.get(c.room)!
      if (c.s < 0.15) e.neutral++
      else if (c.h < 60 || c.h > 300) e.warm++
      else if (c.h > 180 && c.h < 300) e.cool++
      else e.neutral++
    })
    return Array.from(rooms.entries())
  }, [allColors])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" />
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">🎨 {isZh ? '色彩分析' : 'Color Analysis'}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:text-white flex items-center justify-center" aria-label="Close">×</button>
        </div>
        <div className="flex justify-center mb-3">
          <canvas ref={canvasRef} className="rounded-full" style={{ width: 220, height: 220 }} />
        </div>
        <p className="text-[10px] text-white/35 text-center mb-3">
          {isZh ? '每点=一个主色，按色相/饱和度定位' : 'Each dot = one dominant color by hue & saturation'}
        </p>
        <div className="space-y-1">
          {roomSummary.map(([room, counts]) => {
            const total = counts.warm + counts.cool + counts.neutral
            return (
              <div key={room} className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 w-20 shrink-0 truncate">{room}</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden flex bg-white/5">
                  <div className="bg-orange-400/60 h-full" style={{ width: `${(counts.warm / total) * 100}%` }} />
                  <div className="bg-gray-400/40 h-full" style={{ width: `${(counts.neutral / total) * 100}%` }} />
                  <div className="bg-blue-400/60 h-full" style={{ width: `${(counts.cool / total) * 100}%` }} />
                </div>
              </div>
            )
          })}
          <div className="flex gap-4 justify-center text-[9px] text-white/25 mt-1">
            <span>🟠 {isZh ? '暖' : 'Warm'}</span><span>⚪ {isZh ? '中' : 'Neutral'}</span><span>🔵 {isZh ? '冷' : 'Cool'}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
