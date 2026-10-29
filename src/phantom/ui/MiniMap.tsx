/**
 * MiniMap — small always-visible map indicator in the game HUD.
 * Shows current position as a dot on a simplified opera house layout.
 */
import { useGameStore } from '../core/store';

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  'theater-audience': { x: 15, y: 20 },
  'theater-stage': { x: 30, y: 20 },
  'theater-backstage': { x: 45, y: 20 },
  'dressing-room': { x: 45, y: 35 },
  'spiral-stairs': { x: 38, y: 45 },
  'underground-tunnel': { x: 30, y: 55 },
  'underground-lake': { x: 20, y: 65 },
  'lair': { x: 12, y: 65 },
  'rooftop': { x: 30, y: 8 },
  'theater-performance': { x: 15, y: 35 },
  'final-lair': { x: 12, y: 52 },
  'epilogue': { x: 5, y: 65 },
};

const CONNECTIONS: [string, string][] = [
  ['theater-audience', 'theater-stage'],
  ['theater-audience', 'theater-backstage'],
  ['theater-backstage', 'dressing-room'],
  ['dressing-room', 'spiral-stairs'],
  ['spiral-stairs', 'underground-tunnel'],
  ['underground-tunnel', 'underground-lake'],
  ['underground-lake', 'lair'],
  ['lair', 'rooftop'],
  ['rooftop', 'theater-performance'],
  ['theater-performance', 'final-lair'],
  ['final-lair', 'epilogue'],
];

interface Props {
  onClick: () => void;
}

export default function MiniMap({ onClick }: Props) {
  const currentArea = useGameStore((s) => s.currentArea);
  const currentPos = NODE_POSITIONS[currentArea] || { x: 25, y: 35 };

  return (
    <div
      onClick={onClick}
      title="Map (M)"
      style={{
        width: 56, height: 42,
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(100,80,60,0.3)',
        borderRadius: 4,
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <svg viewBox="0 0 55 75" style={{ width: '100%', height: '100%' }}>
        {/* Connections */}
        {CONNECTIONS.map(([from, to]) => {
          const f = NODE_POSITIONS[from];
          const t = NODE_POSITIONS[to];
          if (!f || !t) return null;
          return (
            <line
              key={`${from}-${to}`}
              x1={f.x} y1={f.y} x2={t.x} y2={t.y}
              stroke="rgba(100,80,60,0.3)" strokeWidth={0.8}
            />
          );
        })}

        {/* Nodes */}
        {Object.entries(NODE_POSITIONS).map(([id, pos]) => (
          <circle
            key={id}
            cx={pos.x} cy={pos.y} r={1.5}
            fill={id === currentArea ? '#c5a55a' : 'rgba(100,80,60,0.4)'}
          />
        ))}

        {/* Current position pulse */}
        <circle cx={currentPos.x} cy={currentPos.y} r={3} fill="none" stroke="#c5a55a" strokeWidth={0.5} opacity={0.6}>
          <animate attributeName="r" from="2" to="5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
