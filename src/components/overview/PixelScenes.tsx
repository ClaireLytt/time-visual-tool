/**
 * Pixel art scene illustrations for each module.
 * Pure inline SVG — no external assets, instant load.
 * Each scene is a small 64×40 pixel grid rendered at display size.
 */

const PX = 1.5 // pixel scale factor

interface SceneProps {
  className?: string
}

/** ⚔️ Dungeon — stone walls, torches, clock */
export function DungeonScene({ className }: SceneProps) {
  return (
    <svg className={className} viewBox="0 0 64 40" width={64 * PX} height={40 * PX} style={{ imageRendering: 'pixelated' }}>
      {/* Stone wall */}
      <rect x="0" y="0" width="64" height="40" fill="#2a2a3a" />
      <rect x="0" y="32" width="64" height="8" fill="#1a1a2a" />
      {/* Bricks */}
      {[0,16,32,48].map(x => <rect key={x} x={x} y="0" width="14" height="6" fill="#333345" stroke="#252535" strokeWidth="0.5" />)}
      {[8,24,40,56].map(x => <rect key={x} x={x} y="7" width="14" height="6" fill="#333345" stroke="#252535" strokeWidth="0.5" />)}
      {/* Torch left */}
      <rect x="10" y="16" width="2" height="8" fill="#8B6914" />
      <rect x="9" y="13" width="4" height="4" fill="#f4b41a" />
      <rect x="10" y="11" width="2" height="3" fill="#ff6600" />
      <rect x="10" y="9" width="2" height="2" fill="#ffaa00" opacity="0.7" />
      {/* Torch right */}
      <rect x="52" y="16" width="2" height="8" fill="#8B6914" />
      <rect x="51" y="13" width="4" height="4" fill="#f4b41a" />
      <rect x="52" y="11" width="2" height="3" fill="#ff6600" />
      <rect x="52" y="9" width="2" height="2" fill="#ffaa00" opacity="0.7" />
      {/* Clock */}
      <circle cx="32" cy="20" r="7" fill="#1a1a2a" stroke="#0099db" strokeWidth="1.5" />
      <line x1="32" y1="20" x2="32" y2="15" stroke="#0099db" strokeWidth="1" />
      <line x1="32" y1="20" x2="36" y2="20" stroke="#0099db" strokeWidth="1" />
    </svg>
  )
}

/** 💰 Treasure — chest, coins */
export function TreasureScene({ className }: SceneProps) {
  return (
    <svg className={className} viewBox="0 0 64 40" width={64 * PX} height={40 * PX} style={{ imageRendering: 'pixelated' }}>
      <rect x="0" y="0" width="64" height="40" fill="#2a1a0a" />
      <rect x="0" y="32" width="64" height="8" fill="#1a0f05" />
      {/* Chest */}
      <rect x="20" y="18" width="24" height="14" fill="#8B4513" />
      <rect x="20" y="18" width="24" height="6" fill="#A0522D" rx="2" />
      <rect x="30" y="20" width="4" height="4" fill="#f4b41a" />
      <rect x="29" y="21" width="6" height="2" fill="#f4b41a" />
      {/* Coins */}
      {[[10,28],[14,30],[50,26],[54,29],[48,31]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#f4b41a" stroke="#c8960f" strokeWidth="0.5" />
      ))}
      {/* Sparkles */}
      {[[16,14],[46,12],[32,8]].map(([x,y],i) => (
        <g key={i}><rect x={x} y={y} width="2" height="2" fill="#fff" opacity="0.8" /><rect x={x-1} y={y+1} width="1" height="1" fill="#fff" opacity="0.4" /></g>
      ))}
    </svg>
  )
}

/** 🍺 Tavern — bar counter, mugs */
export function TavernScene({ className }: SceneProps) {
  return (
    <svg className={className} viewBox="0 0 64 40" width={64 * PX} height={40 * PX} style={{ imageRendering: 'pixelated' }}>
      <rect x="0" y="0" width="64" height="40" fill="#3a2510" />
      {/* Shelves */}
      <rect x="4" y="4" width="56" height="2" fill="#5a3a1a" />
      <rect x="4" y="14" width="56" height="2" fill="#5a3a1a" />
      {/* Bottles on shelves */}
      {[10,20,30,40,50].map(x => <rect key={x} x={x} y="6" width="4" height="8" fill="#3e8948" rx="1" />)}
      {[15,25,35,45].map(x => <rect key={x} x={x} y="8" width="3" height="6" fill="#c47070" rx="1" />)}
      {/* Counter */}
      <rect x="0" y="24" width="64" height="4" fill="#6a4a2a" />
      <rect x="0" y="28" width="64" height="12" fill="#4a3018" />
      {/* Mugs */}
      {[12,32,52].map(x => (
        <g key={x}><rect x={x} y="18" width="6" height="6" fill="#d4a06a" /><rect x={x+6} y="20" width="2" height="3" fill="#d4a06a" /><rect x={x+1} y="18" width="4" height="2" fill="#f77622" /></g>
      ))}
    </svg>
  )
}

/** ⚔️ Arena — colosseum pillars, sand */
export function ArenaScene({ className }: SceneProps) {
  return (
    <svg className={className} viewBox="0 0 64 40" width={64 * PX} height={40 * PX} style={{ imageRendering: 'pixelated' }}>
      <rect x="0" y="0" width="64" height="28" fill="#87CEEB" />
      <rect x="0" y="28" width="64" height="12" fill="#d4b483" />
      {/* Pillars */}
      {[6,22,42,58].map(x => (
        <g key={x}>
          <rect x={x-2} y="4" width="4" height="24" fill="#b8b0a0" />
          <rect x={x-3} y="2" width="6" height="3" fill="#c8c0b0" />
          <rect x={x-3} y="26" width="6" height="3" fill="#c8c0b0" />
        </g>
      ))}
      {/* Sword in sand */}
      <rect x="31" y="22" width="2" height="10" fill="#888" />
      <rect x="28" y="30" width="8" height="2" fill="#666" />
      <rect x="31" y="20" width="2" height="3" fill="#2ce8f5" />
    </svg>
  )
}

/** 📜 Library — bookshelves */
export function LibraryScene({ className }: SceneProps) {
  return (
    <svg className={className} viewBox="0 0 64 40" width={64 * PX} height={40 * PX} style={{ imageRendering: 'pixelated' }}>
      <rect x="0" y="0" width="64" height="40" fill="#2a2030" />
      <rect x="0" y="34" width="64" height="6" fill="#1a1520" />
      {/* Bookshelves */}
      {[2, 16, 30].map(sy => (
        <g key={sy}>
          <rect x="4" y={sy} width="56" height="12" fill="#4a3020" />
          <rect x="4" y={sy} width="56" height="1" fill="#5a4030" />
          {/* Books */}
          {Array.from({length: 10}, (_, i) => {
            const colors = ['#e43b44','#3e8948','#0099db','#8b5cf6','#f4b41a','#f77622','#2ce8f5','#be4a7f','#c4a36b','#6b8db5']
            return <rect key={i} x={6 + i * 5} y={sy + 2} width="4" height="9" fill={colors[i]} rx="0.5" />
          })}
        </g>
      ))}
      {/* Candle */}
      <rect x="30" y="28" width="4" height="5" fill="#f0e0c0" />
      <rect x="31" y="26" width="2" height="3" fill="#f4b41a" />
      <rect x="31" y="24" width="2" height="2" fill="#ff6600" opacity="0.8" />
    </svg>
  )
}

/** 🏰 Castle — fortress walls, flag */
export function CastleScene({ className }: SceneProps) {
  return (
    <svg className={className} viewBox="0 0 64 40" width={64 * PX} height={40 * PX} style={{ imageRendering: 'pixelated' }}>
      <rect x="0" y="0" width="64" height="28" fill="#4a6090" />
      <rect x="0" y="28" width="64" height="12" fill="#3e8948" />
      {/* Castle */}
      <rect x="16" y="10" width="32" height="22" fill="#b8b0a0" />
      {/* Battlements */}
      {[16,22,28,34,40,44].map(x => <rect key={x} x={x} y="6" width="4" height="6" fill="#b8b0a0" />)}
      {/* Gate */}
      <rect x="27" y="22" width="10" height="10" fill="#3a2a1a" rx="5" />
      {/* Windows */}
      <rect x="20" y="16" width="4" height="4" fill="#1a1a2a" />
      <rect x="40" y="16" width="4" height="4" fill="#1a1a2a" />
      {/* Flag */}
      <rect x="31" y="0" width="1" height="8" fill="#666" />
      <polygon points="32,1 40,4 32,7" fill="#e8a838" />
    </svg>
  )
}

/** 📋 Quest board — pinboard with notes */
export function QuestScene({ className }: SceneProps) {
  return (
    <svg className={className} viewBox="0 0 64 40" width={64 * PX} height={40 * PX} style={{ imageRendering: 'pixelated' }}>
      <rect x="0" y="0" width="64" height="40" fill="#3a2a1a" />
      {/* Board */}
      <rect x="6" y="4" width="52" height="32" fill="#8B6914" stroke="#6a4a0a" strokeWidth="2" />
      {/* Notes/quests */}
      <rect x="10" y="8" width="14" height="10" fill="#f0e8d0" transform="rotate(-3 17 13)" />
      <rect x="28" y="7" width="12" height="12" fill="#e0d8c0" transform="rotate(2 34 13)" />
      <rect x="44" y="9" width="10" height="8" fill="#f0e8d0" transform="rotate(-1 49 13)" />
      <rect x="12" y="22" width="16" height="10" fill="#ddd8c0" transform="rotate(1 20 27)" />
      <rect x="32" y="23" width="14" height="9" fill="#f0e8d0" transform="rotate(-2 39 27)" />
      {/* Pins */}
      {[[16,8],[33,7],[48,9],[19,22],[38,23]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill={['#e43b44','#5b8def','#f4b41a','#3e8948','#8b5cf6'][i]} />
      ))}
    </svg>
  )
}

/** 🎓 Academy — classroom, chalkboard */
export function AcademyScene({ className }: SceneProps) {
  return (
    <svg className={className} viewBox="0 0 64 40" width={64 * PX} height={40 * PX} style={{ imageRendering: 'pixelated' }}>
      <rect x="0" y="0" width="64" height="40" fill="#2a2a3a" />
      <rect x="0" y="32" width="64" height="8" fill="#4a3a2a" />
      {/* Chalkboard */}
      <rect x="8" y="4" width="48" height="24" fill="#2d5a3d" stroke="#5a3a1a" strokeWidth="2" />
      {/* Chalk text */}
      <line x1="14" y1="10" x2="30" y2="10" stroke="#c8d8c0" strokeWidth="1" />
      <line x1="14" y1="14" x2="26" y2="14" stroke="#c8d8c0" strokeWidth="1" />
      <line x1="14" y1="18" x2="34" y2="18" stroke="#c8d8c0" strokeWidth="1" />
      {/* Math */}
      <text x="38" y="14" fill="#c8d8c0" fontSize="6" fontFamily="monospace">E=mc²</text>
      {/* Desk */}
      <rect x="4" y="30" width="56" height="3" fill="#6a4a2a" />
      {/* Graduation cap */}
      <polygon points="50,6 56,9 50,12 44,9" fill="#1a1a2a" />
      <rect x="49" y="4" width="2" height="3" fill="#1a1a2a" />
    </svg>
  )
}

/** 🏢 Guild Hall — medieval office, table, scrolls */
export function GuildHallScene({ className }: SceneProps) {
  return (
    <svg className={className} viewBox="0 0 64 40" width={64 * PX} height={40 * PX} style={{ imageRendering: 'pixelated' }}>
      <rect x="0" y="0" width="64" height="40" fill="#3a2a1a" />
      {/* Banner */}
      <rect x="24" y="2" width="16" height="14" fill="#e67e22" />
      <polygon points="24,16 32,20 40,16" fill="#e67e22" />
      <rect x="30" y="8" width="4" height="4" fill="#fff" opacity="0.3" />
      {/* Table */}
      <rect x="8" y="24" width="48" height="4" fill="#6a4a2a" />
      <rect x="12" y="28" width="4" height="10" fill="#5a3a1a" />
      <rect x="48" y="28" width="4" height="10" fill="#5a3a1a" />
      {/* Scrolls on table */}
      <rect x="16" y="20" width="8" height="4" fill="#f0e0c0" rx="2" />
      <rect x="28" y="21" width="10" height="3" fill="#e0d0b0" rx="1.5" />
      {/* Quill */}
      <line x1="44" y1="18" x2="48" y2="24" stroke="#f0e0c0" strokeWidth="1" />
      <polygon points="44,16 43,18 45,18" fill="#f0e0c0" />
      {/* Ink */}
      <rect x="40" y="21" width="3" height="3" fill="#1a1a2a" />
    </svg>
  )
}

/** Map of mode to scene component */
export const SCENE_COMPONENTS: Record<string, React.FC<SceneProps>> = {
  time: DungeonScene,
  finance: TreasureScene,
  eating: TavernScene,
  sport: ArenaScene,
  diary: LibraryScene,
  habit: CastleScene,
  todo: QuestScene,
  study: AcademyScene,
  work: GuildHallScene,
}
