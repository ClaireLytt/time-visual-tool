import { Z_TOOL } from '../core/z-index';
/**
 * ProgressMap — visual mini-map of the opera house showing explored areas,
 * collectibles found, and current position.
 */
import { useMemo } from 'react';
import { useGameStore } from '../core/store';
import { getAreasForAct, getCollectiblesForAct } from '../core/constants';
import { ActId } from '../core/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface MapNode {
  id: string;
  name: string;
  x: number;
  y: number;
  actId: number;
  collectibleCount: number;
  collectiblesFound: number;
}

const MAP_LAYOUT: Record<string, { x: number; y: number }> = {
  // Act 1
  'theater-audience': { x: 200, y: 120 },
  'theater-stage': { x: 340, y: 120 },
  'theater-backstage': { x: 480, y: 120 },
  // Act 2
  'dressing-room': { x: 480, y: 200 },
  'spiral-stairs': { x: 420, y: 270 },
  'underground-tunnel': { x: 340, y: 330 },
  'underground-lake': { x: 250, y: 390 },
  // Act 3
  'lair': { x: 160, y: 390 },
  // Act 4
  'rooftop': { x: 340, y: 50 },
  // Act 5
  'theater-performance': { x: 200, y: 200 },
  'final-lair': { x: 160, y: 310 },
  'epilogue': { x: 80, y: 390 },
};

const MAP_CONNECTIONS: [string, string][] = [
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

const ACT_COLORS: Record<number, string> = {
  1: '#c5a55a',
  2: '#8aafb0',
  3: '#b07070',
  4: '#9a8a78',
  5: '#a08a6a',
};

export default function ProgressMap({ open, onClose }: Props) {
  const currentArea = useGameStore((s) => s.currentArea);
  const currentAct = useGameStore((s) => s.currentAct);
  const collectedItems = useGameStore((s) => s.collectedItems);

  // Build map nodes
  const nodes = useMemo<MapNode[]>(() => {
    const result: MapNode[] = [];
    for (let act = 1; act <= 5; act++) {
      const areas = getAreasForAct(act);
      const collectibles = getCollectiblesForAct(act);
      areas.forEach((area) => {
        const pos = MAP_LAYOUT[area.id] || { x: 300, y: 300 };
        const areaCollectibles = collectibles.filter((c) => c.areaId === area.id);
        result.push({
          id: area.id,
          name: area.name,
          x: pos.x,
          y: pos.y,
          actId: act,
          collectibleCount: areaCollectibles.length,
          collectiblesFound: areaCollectibles.filter((c) => collectedItems.includes(c.id)).length,
        });
      });
    }
    return result;
  }, [collectedItems]);

  // Which areas have been visited (check if any event in that area was triggered)
  const visitedAreas = useMemo(() => {
    const visited = new Set<string>();
    visited.add(currentArea);
    // Consider area visited if its act start area was the current/past area
    for (let act = 1 as ActId; act <= currentAct; act++) {
      getAreasForAct(act).forEach((a) => visited.add(a.id));
    }
    return visited;
  }, [currentArea, currentAct]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: Z_TOOL,
        background: 'rgba(10,9,8,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 620, maxHeight: '85vh',
          background: 'linear-gradient(135deg, #1a1816, #221f1c)',
          border: '1px solid #2a2420',
          borderRadius: 8,
          padding: '1.5rem',
          overflowY: 'auto',
        }}
      >
        <p style={{
          fontSize: '0.7rem', color: '#6a5a48',
          letterSpacing: '0.15em', margin: '0 0 0.3rem',
          textAlign: 'center',
        }}>
          OPERA HOUSE MAP
        </p>
        <p style={{
          fontSize: '0.72rem', color: '#4a3a2e',
          textAlign: 'center', margin: '0 0 1rem',
        }}>
          {collectedItems.length}/15 collectibles found
        </p>

        {/* SVG Map */}
        <svg viewBox="0 0 560 440" style={{ width: '100%', height: 'auto' }}>
          {/* Connections */}
          {MAP_CONNECTIONS.map(([from, to]) => {
            const fromPos = MAP_LAYOUT[from];
            const toPos = MAP_LAYOUT[to];
            if (!fromPos || !toPos) return null;
            const visited = visitedAreas.has(from) && visitedAreas.has(to);
            return (
              <line
                key={`${from}-${to}`}
                x1={fromPos.x} y1={fromPos.y}
                x2={toPos.x} y2={toPos.y}
                stroke={visited ? '#3a3228' : '#1a1816'}
                strokeWidth={visited ? 2 : 1}
                strokeDasharray={visited ? 'none' : '4 4'}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const visited = visitedAreas.has(node.id);
            const isCurrent = node.id === currentArea;
            const color = ACT_COLORS[node.actId] || '#6a5a48';

            return (
              <g key={node.id}>
                {/* Node circle */}
                <circle
                  cx={node.x} cy={node.y}
                  r={isCurrent ? 14 : 10}
                  fill={visited ? color : '#1a1816'}
                  stroke={isCurrent ? '#e0d8cc' : visited ? color : '#2a2420'}
                  strokeWidth={isCurrent ? 2.5 : 1.5}
                  opacity={visited ? 1 : 0.3}
                />

                {/* Current position indicator */}
                {isCurrent && (
                  <circle
                    cx={node.x} cy={node.y} r={18}
                    fill="none" stroke="#e0d8cc" strokeWidth={1}
                    opacity={0.4}
                  >
                    <animate attributeName="r" from="14" to="22" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Collectible indicator */}
                {node.collectibleCount > 0 && visited && (
                  <text
                    x={node.x} y={node.y + 3}
                    textAnchor="middle"
                    fontSize="8"
                    fill={node.collectiblesFound === node.collectibleCount ? '#c5a55a' : '#e0d8cc'}
                    fontFamily="Georgia, serif"
                  >
                    {node.collectiblesFound}/{node.collectibleCount}
                  </text>
                )}

                {/* Label */}
                <text
                  x={node.x} y={node.y + 24}
                  textAnchor="middle"
                  fontSize="9"
                  fill={visited ? '#9a8a78' : '#2a2420'}
                  fontFamily="Georgia, serif"
                >
                  {visited ? node.name : '???'}
                </text>
              </g>
            );
          })}

          {/* Act labels */}
          <text x="30" y="130" fontSize="10" fill="#3a3228" fontFamily="Georgia, serif">Act 1</text>
          <text x="500" y="220" fontSize="10" fill="#3a3228" fontFamily="Georgia, serif">Act 2</text>
          <text x="80" y="400" fontSize="10" fill="#3a3228" fontFamily="Georgia, serif">Act 3</text>
          <text x="370" y="55" fontSize="10" fill="#3a3228" fontFamily="Georgia, serif">Act 4</text>
          <text x="100" y="220" fontSize="10" fill="#3a3228" fontFamily="Georgia, serif">Act 5</text>
        </svg>

        <p style={{
          fontSize: '0.65rem', color: '#3a3028',
          textAlign: 'center', margin: '0.8rem 0 0',
        }}>
          click anywhere to close
        </p>
      </div>
    </div>
  );
}
