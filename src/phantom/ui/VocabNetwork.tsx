/**
 * VocabNetwork — visual word relationship graph showing semantic connections
 * between learned vocabulary. Words cluster by theme (music, emotion, place).
 */
import { useMemo } from 'react';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { useGameStore } from '../core/store';
import { Z_TOOL } from '../core/z-index';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface VocabNode {
  word: string;
  meaning: string;
  theme: string;
  x: number;
  y: number;
}

interface VocabEdge {
  from: string;
  to: string;
  relation: string;
}

const THEME_COLORS: Record<string, string> = {
  music: '#c5a55a',
  emotion: '#c87a6a',
  place: '#8aafb0',
  person: '#b0a090',
  action: '#9a8a78',
  object: '#7a9a8a',
};

// Classify words into themes
const WORD_THEMES: Record<string, string> = {
  chandelier: 'object', catastrophe: 'action', sabotage: 'action',
  opera: 'music', ghost: 'person', order: 'action',
  angel: 'person', mystery: 'emotion', beneath: 'place',
  wander: 'action', fond: 'emotion', childhood: 'emotion',
  phantom: 'person', melody: 'music', haunt: 'emotion',
  unfurl: 'action', splendor: 'object',
  glance: 'action', triumph: 'emotion', surrender: 'action',
  weep: 'emotion', solitude: 'emotion', torment: 'emotion',
  mask: 'object', dare: 'action', reveal: 'action',
  shelter: 'place', promise: 'action', devotion: 'emotion',
  obsession: 'emotion', eternal: 'emotion',
  triumphant: 'emotion', performance: 'music', destiny: 'emotion',
  masquerade: 'music', parade: 'action', facade: 'object',
  farewell: 'emotion', echo: 'music', legacy: 'emotion',
  architect: 'person', invisible: 'emotion', compassion: 'emotion',
  prejudice: 'emotion', humanity: 'person', fade: 'action',
  transcend: 'action',
};

// Semantic relationships between words
const EDGES: VocabEdge[] = [
  { from: 'phantom', to: 'ghost', relation: 'synonym' },
  { from: 'phantom', to: 'mask', relation: 'wears' },
  { from: 'phantom', to: 'melody', relation: 'creates' },
  { from: 'phantom', to: 'solitude', relation: 'lives in' },
  { from: 'melody', to: 'opera', relation: 'part of' },
  { from: 'melody', to: 'echo', relation: 'becomes' },
  { from: 'opera', to: 'chandelier', relation: 'contains' },
  { from: 'opera', to: 'performance', relation: 'is a' },
  { from: 'mask', to: 'reveal', relation: 'opposite' },
  { from: 'mask', to: 'masquerade', relation: 'used in' },
  { from: 'mask', to: 'facade', relation: 'similar' },
  { from: 'haunt', to: 'ghost', relation: 'done by' },
  { from: 'haunt', to: 'echo', relation: 'similar' },
  { from: 'solitude', to: 'weep', relation: 'causes' },
  { from: 'solitude', to: 'torment', relation: 'causes' },
  { from: 'devotion', to: 'obsession', relation: 'extreme of' },
  { from: 'devotion', to: 'eternal', relation: 'quality' },
  { from: 'farewell', to: 'legacy', relation: 'leaves' },
  { from: 'farewell', to: 'echo', relation: 'becomes' },
  { from: 'triumph', to: 'triumphant', relation: 'adjective' },
  { from: 'triumph', to: 'destiny', relation: 'leads to' },
  { from: 'compassion', to: 'humanity', relation: 'expression of' },
  { from: 'prejudice', to: 'mask', relation: 'metaphor' },
  { from: 'angel', to: 'phantom', relation: 'alias of' },
  { from: 'sabotage', to: 'catastrophe', relation: 'causes' },
  { from: 'shelter', to: 'beneath', relation: 'location' },
  { from: 'dare', to: 'reveal', relation: 'leads to' },
];

export default function VocabNetwork({ open, onClose }: Props) {
  const learning = useGameStore((s) => s.learning);

  const learnedWords = useMemo(() => {
    const words = new Set<string>();
    ENGLISH_CHALLENGES
      .filter((ch) => learning.completedChallenges.includes(ch.id))
      .forEach((ch) => ch.vocab.forEach((v) => words.add(v.word)));
    return words;
  }, [learning.completedChallenges]);

  // Build nodes with positions (force-directed-ish layout via theme clusters)
  const nodes = useMemo<VocabNode[]>(() => {
    const themePositions: Record<string, { cx: number; cy: number }> = {
      music: { cx: 280, cy: 80 },
      emotion: { cx: 150, cy: 220 },
      place: { cx: 420, cy: 220 },
      person: { cx: 280, cy: 350 },
      action: { cx: 80, cy: 100 },
      object: { cx: 480, cy: 100 },
    };
    const themeCounts: Record<string, number> = {};
    const result: VocabNode[] = [];
    learnedWords.forEach((word) => {
      const theme = WORD_THEMES[word] || 'action';
      const pos = themePositions[theme] || { cx: 280, cy: 200 };
      const count = themeCounts[theme] || 0;
      themeCounts[theme] = count + 1;
      const angle = (count * 2.4) + word.charCodeAt(0) * 0.1;
      const dist = 40 + count * 18;
      result.push({
        word,
        meaning: '',
        theme,
        x: pos.cx + Math.cos(angle) * dist,
        y: pos.cy + Math.sin(angle) * dist,
      });
    });
    return result;
  }, [learnedWords]);

  // Filter edges to only show connections between learned words
  const activeEdges = useMemo(() => {
    return EDGES.filter((e) => learnedWords.has(e.from) && learnedWords.has(e.to));
  }, [learnedWords]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        zIndex: Z_TOOL,
        background: 'rgba(10,9,8,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 580, maxHeight: '85vh',
          background: 'linear-gradient(135deg, #1a1816, #221f1c)',
          border: '1px solid #2a2420',
          borderRadius: 8,
          padding: '1.5rem',
          overflowY: 'auto',
        }}
      >
        <p style={{
          fontSize: '0.65rem', color: '#4a3a2e',
          letterSpacing: '0.15em', margin: '0 0 0.3rem',
          textAlign: 'center',
        }}>
          VOCABULARY NETWORK ({learnedWords.size} words)
        </p>

        {/* Theme legend */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '0.8rem' }}>
          {Object.entries(THEME_COLORS).map(([theme, color]) => (
            <span key={theme} style={{ fontSize: '0.6rem', color, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
              {theme}
            </span>
          ))}
        </div>

        {learnedWords.size < 3 ? (
          <p style={{ fontSize: '0.85rem', color: '#4a3a2e', textAlign: 'center', fontStyle: 'italic', marginTop: '2rem' }}>
            Learn more words to see the network grow!
          </p>
        ) : (
          <svg viewBox="0 0 560 420" style={{ width: '100%', height: 'auto' }}>
            {/* Edges */}
            {activeEdges.map((edge, i) => {
              const from = nodes.find((n) => n.word === edge.from);
              const to = nodes.find((n) => n.word === edge.to);
              if (!from || !to) return null;
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;
              return (
                <g key={i}>
                  <line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="rgba(100,90,80,0.3)" strokeWidth={1}
                  />
                  <text x={mx} y={my - 4} textAnchor="middle" fontSize="6" fill="#4a3a2e"
                    fontFamily="Georgia, serif" fontStyle="italic">
                    {edge.relation}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const color = THEME_COLORS[node.theme] || '#9a8a78';
              return (
                <g key={node.word}>
                  <circle cx={node.x} cy={node.y} r={18} fill="rgba(26,24,22,0.9)"
                    stroke={color} strokeWidth={1.5} />
                  <text x={node.x} y={node.y + 1} textAnchor="middle" fontSize="7.5"
                    fill={color} fontFamily="Georgia, serif" fontWeight="bold">
                    {node.word}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
