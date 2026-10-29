/**
 * Certificate — generates a visual progress certificate that players
 * can screenshot and share. Shows their learning achievements.
 */
import { useMemo } from 'react';
import { useGameStore } from '../core/store';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { ACHIEVEMENTS } from '../core/achievements';
import { getUnlockedIdioms } from '../core/idioms';

interface Props {
  open: boolean;
  onClose: () => void;
  earnedAchievements: string[];
}

export default function Certificate({ open, onClose, earnedAchievements }: Props) {
  const learning = useGameStore((s) => s.learning);
  const collectedItems = useGameStore((s) => s.collectedItems);

  const totalVocab = useMemo(() => {
    return ENGLISH_CHALLENGES
      .filter((ch) => learning.completedChallenges.includes(ch.id))
      .reduce((sum, ch) => sum + ch.vocab.length, 0);
  }, [learning.completedChallenges]);

  const idiomCount = getUnlockedIdioms(collectedItems).length;
  const completionPct = Math.round(
    (learning.completedChallenges.length / ENGLISH_CHALLENGES.length) * 100
  );

  const grade = completionPct >= 90 ? 'S' : completionPct >= 70 ? 'A' :
    completionPct >= 50 ? 'B' : completionPct >= 30 ? 'C' : 'D';

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 210,
        background: 'rgba(10,9,8,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 480,
          background: 'linear-gradient(145deg, #1e1a16, #2a2420, #1e1a16)',
          border: '2px solid #c5a55a',
          borderRadius: 12,
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(197,165,90,0.15), inset 0 0 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Decorative top line */}
        <div style={{
          width: '80%', height: 1,
          background: 'linear-gradient(90deg, transparent, #c5a55a, transparent)',
          margin: '0 auto 1.2rem',
        }} />

        <p style={{
          fontSize: '0.6rem', color: '#6a5a48',
          letterSpacing: '0.3em', margin: '0 0 0.5rem',
        }}>
          CERTIFICATE OF ACHIEVEMENT
        </p>

        <h2 style={{
          fontSize: '1.6rem', color: '#c5a55a',
          margin: '0 0 0.2rem', letterSpacing: '0.1em',
        }}>
          The Phantom of the Opera
        </h2>
        <p style={{
          fontSize: '0.75rem', color: '#9a8a78',
          margin: '0 0 1rem',
        }}>
          English Learning Journey
        </p>

        {/* Grade */}
        <div style={{
          display: 'inline-block',
          width: 60, height: 60,
          borderRadius: '50%',
          border: '2px solid #c5a55a',
          lineHeight: '56px',
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: grade === 'S' ? '#c5a55a' : grade === 'A' ? '#8aafb0' : '#9a8a78',
          margin: '0 0 0.8rem',
        }}>
          {grade}
        </div>

        <p style={{
          fontSize: '0.72rem', color: '#6a5a48',
          margin: '0 0 1rem',
        }}>
          {completionPct}% Complete
        </p>

        {/* Stats row */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '1.5rem',
          margin: '0 0 1rem',
        }}>
          <div>
            <p style={{ fontSize: '1.2rem', color: '#c5a55a', margin: 0, fontWeight: 'bold' }}>
              {totalVocab}
            </p>
            <p style={{ fontSize: '0.55rem', color: '#5a5a50', margin: 0 }}>Words</p>
          </div>
          <div>
            <p style={{ fontSize: '1.2rem', color: '#8aafb0', margin: 0, fontWeight: 'bold' }}>
              {idiomCount}
            </p>
            <p style={{ fontSize: '0.55rem', color: '#5a5a50', margin: 0 }}>Idioms</p>
          </div>
          <div>
            <p style={{ fontSize: '1.2rem', color: '#9a8a78', margin: 0, fontWeight: 'bold' }}>
              {learning.totalScore}
            </p>
            <p style={{ fontSize: '0.55rem', color: '#5a5a50', margin: 0 }}>Score</p>
          </div>
          <div>
            <p style={{ fontSize: '1.2rem', color: '#b0a090', margin: 0, fontWeight: 'bold' }}>
              {earnedAchievements.length}
            </p>
            <p style={{ fontSize: '0.55rem', color: '#5a5a50', margin: 0 }}>Badges</p>
          </div>
        </div>

        {/* Best combo */}
        {(learning.bestCombo || 0) > 0 && (
          <p style={{ fontSize: '0.72rem', color: '#c87a6a', margin: '0 0 0.8rem' }}>
            {'🔥'} Best Combo: {learning.bestCombo}x
          </p>
        )}

        {/* Badges earned */}
        {earnedAchievements.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.3rem',
            justifyContent: 'center', margin: '0 0 1rem',
          }}>
            {ACHIEVEMENTS
              .filter((a) => earnedAchievements.includes(a.id))
              .map((a) => (
                <span key={a.id} style={{ fontSize: '1.1rem' }} title={a.name}>
                  {a.icon}
                </span>
              ))
            }
          </div>
        )}

        {/* Date */}
        <div style={{
          width: '80%', height: 1,
          background: 'linear-gradient(90deg, transparent, #3a3228, transparent)',
          margin: '0 auto 0.6rem',
        }} />
        <p style={{
          fontSize: '0.65rem', color: '#4a3a2e', margin: 0,
        }}>
          {today}
        </p>

        <p style={{
          fontSize: '0.55rem', color: '#3a3028', margin: '1rem 0 0',
        }}>
          Screenshot to save your certificate
        </p>
      </div>
    </div>
  );
}
