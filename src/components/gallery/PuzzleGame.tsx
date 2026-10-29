import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GALLERY_ROOMS } from '../../constants/gallery'

/* ═══════════════════════════════════════════
   3×3 Puzzle Game — drag tiles to solve
   ═══════════════════════════════════════════ */

function generatePuzzle(seed: number): number[] {
  // Create solvable permutation using seed
  const tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8] // 8 = empty
  // Fisher-Yates with deterministic seed
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = ((seed + 1) * (i + 3) * 17 + i * 7) % (i + 1)
    const tmp = tiles[i]; tiles[i] = tiles[j]; tiles[j] = tmp
  }
  // Ensure solvable: count inversions (excluding empty=8)
  let inversions = 0
  for (let i = 0; i < 9; i++) {
    for (let j = i + 1; j < 9; j++) {
      if (tiles[i] !== 8 && tiles[j] !== 8 && tiles[i] > tiles[j]) inversions++
    }
  }
  // If odd inversions, swap first two non-empty tiles to make even
  if (inversions % 2 !== 0) {
    const a = tiles.findIndex(t => t !== 8)
    const b = tiles.findIndex((t, idx) => idx > a && t !== 8)
    if (b >= 0) { const tmp = tiles[a]; tiles[a] = tiles[b]; tiles[b] = tmp }
  }
  return tiles
}

function isSolved(tiles: number[]): boolean {
  return tiles.every((t, i) => t === i)
}

export function PuzzleGame({ isZh, onClose }: { isZh: boolean; onClose: () => void }) {
  const allPaintings = useMemo(() => GALLERY_ROOMS.flatMap(r => r.paintings), [])
  const [paintingIdx, setPaintingIdx] = useState(0)
  const [gameState, setGameState] = useState<'pick' | 'playing' | 'won'>('pick')
  const [tiles, setTiles] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null)

  const painting = allPaintings[paintingIdx]

  const startGame = useCallback((idx: number) => {
    setPaintingIdx(idx)
    const newTiles = generatePuzzle(idx + Date.now() % 100)
    setTiles(newTiles)
    setMoves(0)
    setSeconds(0)
    setGameState('playing')
    // Start timer
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    setTimerRef(prev => { if (prev) clearInterval(prev); return t })
  }, [])

  const handleTileClick = useCallback((clickIdx: number) => {
    if (gameState !== 'playing') return
    const emptyIdx = tiles.indexOf(8)
    // Check adjacency
    const clickRow = Math.floor(clickIdx / 3), clickCol = clickIdx % 3
    const emptyRow = Math.floor(emptyIdx / 3), emptyCol = emptyIdx % 3
    const adjacent = (Math.abs(clickRow - emptyRow) + Math.abs(clickCol - emptyCol)) === 1
    if (!adjacent) return

    const newTiles = [...tiles]
    newTiles[emptyIdx] = newTiles[clickIdx]
    newTiles[clickIdx] = 8
    setTiles(newTiles)
    setMoves(m => m + 1)

    if (isSolved(newTiles)) {
      setGameState('won')
      if (timerRef) clearInterval(timerRef)
    }
  }, [tiles, gameState, timerRef])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" />
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="relative max-w-md w-full" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">🧩 {isZh ? '拼图游戏' : 'Puzzle Game'}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:text-white flex items-center justify-center" aria-label="Close">×</button>
        </div>

        {gameState === 'pick' && (
          <div>
            <p className="text-xs text-white/40 mb-3">{isZh ? '选一幅画开始拼图：' : 'Pick a painting to puzzle:'}</p>
            <div className="grid grid-cols-5 gap-2">
              {allPaintings.map((p, i) => (
                <button key={p.id} onClick={() => startGame(i)}
                  className="aspect-square rounded-lg overflow-hidden relative border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer">
                  <div className="absolute inset-0" style={{ background: p.fallbackGradient }} />
                  <img src={p.imageUrl} alt={p.title} className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'won') && (
          <div>
            {/* Stats */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/50">{painting.title}</p>
              <div className="flex gap-3 text-xs text-white/40 font-mono">
                <span>⏱ {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>
                <span>👆 {moves}</span>
              </div>
            </div>

            {/* Puzzle grid */}
            <div className="grid grid-cols-3 gap-0.5 rounded-lg overflow-hidden bg-white/5 aspect-square max-w-[300px] mx-auto">
              {tiles.map((tile, idx) => {
                if (tile === 8) {
                  return <div key={idx} className="bg-black/80" />
                }
                const row = Math.floor(tile / 3)
                const col = tile % 3
                return (
                  <button
                    key={idx}
                    onClick={() => handleTileClick(idx)}
                    className="relative overflow-hidden cursor-pointer hover:brightness-110 transition-all"
                    aria-label={`Tile ${tile + 1}`}
                  >
                    <div className="absolute inset-0" style={{ background: painting.fallbackGradient }} />
                    <img
                      src={painting.imageUrl}
                      alt=""
                      className="absolute"
                      referrerPolicy="no-referrer"
                      style={{
                        width: '300%', height: '300%',
                        left: `${-col * 100}%`, top: `${-row * 100}%`,
                        maxWidth: 'none',
                      }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    {/* Tile number overlay */}
                    <span className="absolute top-0.5 left-1 text-[9px] text-white/30 font-mono">{tile + 1}</span>
                  </button>
                )
              })}
            </div>

            {/* Reference image (small) */}
            <div className="mt-3 flex items-center gap-3">
              <div className="w-16 h-16 rounded overflow-hidden relative shrink-0 border border-white/10">
                <div className="absolute inset-0" style={{ background: painting.fallbackGradient }} />
                <img src={painting.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
              <p className="text-[10px] text-white/30">{isZh ? '参考图 — 点击相邻空格的方块来移动' : 'Reference — click a tile next to the empty space'}</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-3">
              <button onClick={() => startGame(paintingIdx)}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 transition-all cursor-pointer">
                {isZh ? '重新开始' : 'Restart'}
              </button>
              <button onClick={() => setGameState('pick')}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 transition-all cursor-pointer">
                {isZh ? '换一幅画' : 'Change'}
              </button>
            </div>
          </div>
        )}

        {/* Win overlay */}
        <AnimatePresence>
          {gameState === 'won' && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl backdrop-blur">
              <div className="text-center">
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-lg font-bold text-amber-300">{isZh ? '拼图完成！' : 'Puzzle Complete!'}</p>
                <p className="text-sm text-white/50 mt-1">{moves} {isZh ? '步' : 'moves'} · {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</p>
                <p className="text-xs text-white/40 mt-2">{painting.title}</p>
                <button onClick={() => setGameState('pick')}
                  className="mt-4 px-6 py-2 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-sm hover:bg-amber-400/30 transition-all cursor-pointer">
                  {isZh ? '再来一局' : 'Play Again'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
