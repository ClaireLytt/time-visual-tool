/**
 * HighScores — local leaderboard tracking best game sessions.
 * Records score, collectibles, and date for each completed game.
 */
import { useMemo } from 'react';
import { useGameStore } from '../core/store';
import { Z_TOOL } from '../core/z-index';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ScoreEntry {
  score: number;
  collectibles: number;
  challenges: number;
  date: string;
}

const SCORES_KEY = 'phantom-highscores';

export function saveHighScore() {
  const state = useGameStore.getState();
  const entry: ScoreEntry = {
    score: state.learning.totalScore,
    collectibles: state.collectedItems.length,
    challenges: state.learning.completedChallenges.length,
    date: new Date().toISOString().slice(0, 10),
  };
  if (entry.score === 0) return;
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    const scores: ScoreEntry[] = raw ? JSON.parse(raw) : [];
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(0, 10)));
  } catch { /* */ }
}

function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    return raw ? JSON.parse(raw) as ScoreEntry[] : [];
  } catch { return []; }
}

export default function HighScores({ open, onClose }: Props) {
  const scores = useMemo(() => loadScores(), []);
  const currentScore = useGameStore((s) => s.learning.totalScore);

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
          width: '92%', maxWidth: 420,
          background: 'linear-gradient(135deg, #1a1816, #221f1c)',
          border: '1px solid #2a2420',
          borderRadius: 8,
          padding: '1.5rem',
        }}
      >
        <p style={{
          fontSize: '0.65rem', color: '#c5a55a',
          letterSpacing: '0.15em', margin: '0 0 0.8rem',
          textAlign: 'center',
        }}>
          HIGH SCORES
        </p>

        {scores.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: '#4a3a2e', textAlign: 'center', fontStyle: 'italic' }}>
            No scores yet. Complete challenges to record your score!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {scores.map((entry, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.5rem 0.6rem',
                background: entry.score === currentScore ? 'rgba(197,165,90,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${entry.score === currentScore ? 'rgba(197,165,90,0.2)' : 'rgba(100,80,60,0.1)'}`,
                borderRadius: 4,
              }}>
                <span style={{
                  fontSize: '1rem', width: 24, textAlign: 'center',
                  color: i === 0 ? '#c5a55a' : i === 1 ? '#9aabb5' : i === 2 ? '#b07070' : '#4a3a2e',
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.9rem', color: '#c5a55a', fontWeight: 'bold' }}>
                    {entry.score}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#6a5a48', marginLeft: '0.5rem' }}>
                    {entry.collectibles}/20 items &middot; {entry.challenges} challenges
                  </span>
                </div>
                <span style={{ fontSize: '0.6rem', color: '#3a3228' }}>
                  {entry.date}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
