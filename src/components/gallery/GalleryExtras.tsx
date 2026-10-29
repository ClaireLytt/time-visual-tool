import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GALLERY_ROOMS } from '../../constants/gallery'
import { ACHIEVEMENTS } from '../../constants/achievements'
import type { AchievementStats } from '../../constants/achievements'
import type { Painting } from '../../types/gallery'

/* ═══════════════════════════════════════════
   Achievement stats hook
   ═══════════════════════════════════════════ */
export function useAchievements() {
  const [stats, setStats] = useState<AchievementStats>(() => {
    try {
      const s = localStorage.getItem('gallery-achievements')
      return s ? JSON.parse(s) : { roomsVisited: [], favorites: [], notesWritten: 0, quizCorrect: 0, paintingsViewed: [] }
    } catch { return { roomsVisited: [], favorites: [], notesWritten: 0, quizCorrect: 0, paintingsViewed: [] } }
  })

  const persist = useCallback((next: AchievementStats) => {
    setStats(next)
    try { localStorage.setItem('gallery-achievements', JSON.stringify(next)) } catch { /* */ }
  }, [])

  const trackRoom = useCallback((roomId: string) => {
    setStats(prev => {
      if (prev.roomsVisited.includes(roomId)) return prev
      const next = { ...prev, roomsVisited: [...prev.roomsVisited, roomId] }
      persist(next)
      return next
    })
  }, [persist])

  const trackPainting = useCallback((paintingId: string) => {
    setStats(prev => {
      if (prev.paintingsViewed.includes(paintingId)) return prev
      const next = { ...prev, paintingsViewed: [...prev.paintingsViewed, paintingId] }
      persist(next)
      return next
    })
  }, [persist])

  const trackNote = useCallback(() => {
    setStats(prev => {
      const next = { ...prev, notesWritten: prev.notesWritten + 1 }
      persist(next)
      return next
    })
  }, [persist])

  const trackQuiz = useCallback((correct: boolean) => {
    if (!correct) return
    setStats(prev => {
      const next = { ...prev, quizCorrect: prev.quizCorrect + 1 }
      persist(next)
      return next
    })
  }, [persist])

  const syncFavorites = useCallback((favs: string[]) => {
    setStats(prev => {
      const next = { ...prev, favorites: favs }
      persist(next)
      return next
    })
  }, [persist])

  const unlocked = useMemo(() => ACHIEVEMENTS.filter(a => a.check(stats)), [stats])

  return { stats, trackRoom, trackPainting, trackNote, trackQuiz, syncFavorites, unlocked }
}

/* ═══════════════════════════════════════════
   Achievement toast — shows when unlocked
   ═══════════════════════════════════════════ */
export function AchievementToast({ achievement, isZh, onDone }: {
  achievement: { icon: string; titleZh: string; titleEn: string } | null
  isZh: boolean
  onDone: () => void
}) {
  useEffect(() => {
    if (!achievement) return
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [achievement, onDone])

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-amber-400/15 backdrop-blur-xl border border-amber-400/30 rounded-xl px-5 py-3 flex items-center gap-3"
        >
          <span className="text-2xl">{achievement.icon}</span>
          <div>
            <p className="text-sm font-bold text-amber-300">{isZh ? '成就解锁!' : 'Achievement Unlocked!'}</p>
            <p className="text-xs text-white/60">{isZh ? achievement.titleZh : achievement.titleEn}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════
   Achievement panel — shows all achievements
   ═══════════════════════════════════════════ */
export function AchievementPanel({ isZh, stats, onClose }: {
  isZh: boolean; stats: AchievementStats; onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-[#111] border border-white/10 rounded-xl p-5 max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white mb-4 text-center">
          {isZh ? '🏆 成就' : '🏆 Achievements'}
        </h3>
        <div className="space-y-2">
          {ACHIEVEMENTS.map(a => {
            const done = a.check(stats)
            return (
              <div key={a.id} className={`flex items-center gap-3 p-2 rounded-lg ${done ? 'bg-amber-400/10' : 'bg-white/3 opacity-50'}`}>
                <span className="text-xl">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? 'text-amber-300' : 'text-white/40'}`}>
                    {isZh ? a.titleZh : a.titleEn}
                  </p>
                  <p className="text-[10px] text-white/30">{isZh ? a.descZh : a.descEn}</p>
                </div>
                <span className="text-xs">{done ? '✓' : '○'}</span>
              </div>
            )
          })}
        </div>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 text-white/40 hover:text-white flex items-center justify-center" aria-label="Close">×</button>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   Global timeline — all 15 paintings across 500 years
   ═══════════════════════════════════════════ */
export function GlobalTimeline({ isZh, onSelect, onClose }: {
  isZh: boolean; onSelect: (p: Painting) => void; onClose: () => void
}) {
  const allPaintings = useMemo(() => {
    return GALLERY_ROOMS.flatMap(r => r.paintings.map(p => ({
      ...p,
      roomName: isZh ? r.nameZh : r.name,
    }))).sort((a, b) => Number(a.year) - Number(b.year))
  }, [isZh])

  const minYear = Number(allPaintings[0].year) - 30
  const maxYear = Number(allPaintings[allPaintings.length - 1].year) + 30
  const range = maxYear - minYear

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col" onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" />
      <div className="relative flex-1 flex flex-col p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">
            {isZh ? '📈 500年艺术时间线' : '📈 500 Years of Art'}
          </h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:text-white flex items-center justify-center" aria-label="Close">×</button>
        </div>

        {/* Timeline */}
        <div className="flex-1 relative overflow-x-auto overflow-y-hidden">
          <div className="relative h-full min-w-[800px]">
            {/* Axis line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/15" />

            {/* Century markers */}
            {[1400, 1500, 1600, 1700, 1800, 1900, 2000].map(y => {
              const pct = ((y - minYear) / range) * 100
              if (pct < 0 || pct > 100) return null
              return (
                <div key={y} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${pct}%` }}>
                  <div className="w-px h-4 bg-white/20 -translate-y-2" />
                  <span className="absolute top-6 -translate-x-1/2 text-[10px] text-white/25 font-mono">{y}</span>
                </div>
              )
            })}

            {/* Paintings */}
            {allPaintings.map((p, i) => {
              const pct = ((Number(p.year) - minYear) / range) * 100
              const above = i % 2 === 0
              return (
                <motion.button
                  key={p.id}
                  className="absolute group cursor-pointer"
                  style={{ left: `${pct}%`, top: above ? '10%' : '55%' }}
                  initial={{ opacity: 0, y: above ? -20 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  onClick={() => onSelect(p)}
                  aria-label={`${p.title} ${p.year}`}
                >
                  <div className="w-14 h-10 rounded overflow-hidden border border-white/15 group-hover:border-amber-400/50 transition-all shadow-lg relative">
                    <div className="absolute inset-0" style={{ background: p.fallbackGradient }} />
                    <img src={p.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                  {/* Connector line */}
                  <div className={`absolute left-1/2 w-px bg-white/10 ${above ? 'top-full h-[calc(40vh-40px)]' : 'bottom-full h-[calc(40vh-40px)]'}`} />
                  {/* Label */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <p className="text-[10px] text-white/70 font-medium">{p.title}</p>
                    <p className="text-[9px] text-white/40 text-center">{p.year} · {p.roomName}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   Painting quiz game
   ═══════════════════════════════════════════ */
export function PaintingQuiz({ isZh, onClose, onCorrect }: {
  isZh: boolean; onClose: () => void; onCorrect: () => void
}) {
  const allPaintings = useMemo(() => GALLERY_ROOMS.flatMap(r => r.paintings), [])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)

  // Pure deterministic question generation — no Math.random
  const question = useMemo(() => {
    const qi = questionIndex
    const correct = allPaintings[qi % allPaintings.length]
    const others = allPaintings.filter(p => p.id !== correct.id)
    // Pick 3 wrong answers deterministically based on index
    const wrong = [
      others[qi % others.length],
      others[(qi + 3) % others.length],
      others[(qi + 7) % others.length],
    ]
    // Deterministic "shuffle" using index-based rotation
    const pool = [...wrong, correct]
    const rotation = qi % pool.length
    const options = [...pool.slice(rotation), ...pool.slice(0, rotation)]
    // Deterministic crop position
    const cropX = ((qi * 37 + 13) % 60) + 10
    const cropY = ((qi * 53 + 7) % 60) + 10
    return { correct, options, cropX, cropY }
  }, [questionIndex, allPaintings])

  const handleAnswer = useCallback((paintingId: string) => {
    if (answered) return
    setAnswered(paintingId)
    const isCorrect = paintingId === question.correct.id
    if (isCorrect) {
      setScore(s => s + 1)
      setStreak(s => s + 1)
      onCorrect()
    } else {
      setStreak(0)
    }
    setTimeout(() => {
      setAnswered(null)
      setQuestionIndex(i => i + 1)
    }, 1500)
  }, [answered, question, onCorrect])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" />
      <motion.div
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="relative bg-[#111] border border-white/10 rounded-xl p-5 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">🎯 {isZh ? '猜画游戏' : 'Painting Quiz'}</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-400/70 font-mono">{score} {isZh ? '分' : 'pts'}</span>
            {streak >= 3 && <span className="text-xs text-orange-400">🔥{streak}</span>}
          </div>
        </div>

        {/* Cropped clue image */}
        <div className="w-full h-40 rounded-lg overflow-hidden relative bg-black mb-4">
          <div className="absolute inset-0" style={{ background: question.correct.fallbackGradient }} />
          <img
            src={question.correct.imageUrl}
            alt="Mystery painting"
            className="absolute"
            referrerPolicy="no-referrer"
            style={{
              width: '300%', height: '300%',
              left: `${-question.cropX * 2}%`, top: `${-question.cropY * 2}%`,
              maxWidth: 'none',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <p className="absolute bottom-2 left-3 text-xs text-white/50">
            {isZh ? '这是哪幅画？' : 'Which painting is this?'}
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2">
          {question.options.map(p => {
            const isCorrectAnswer = p.id === question.correct.id
            const wasSelected = answered === p.id
            let bg = 'bg-white/5 hover:bg-white/10'
            if (answered) {
              if (isCorrectAnswer) bg = 'bg-green-500/20 border-green-500/40'
              else if (wasSelected) bg = 'bg-red-500/20 border-red-500/40'
            }
            return (
              <button key={p.id} onClick={() => handleAnswer(p.id)}
                className={`p-3 rounded-lg border border-white/10 text-left transition-all cursor-pointer ${bg}`}>
                <p className="text-xs font-medium text-white/80 truncate">{p.title}</p>
                <p className="text-[10px] text-white/40 truncate">{p.artist}</p>
              </button>
            )
          })}
        </div>

        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 text-white/40 hover:text-white flex items-center justify-center" aria-label="Close">×</button>
      </motion.div>
    </motion.div>
  )
}
