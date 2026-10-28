/**
 * GameEnding — final screen shown after completing the game.
 * Displays full stats, ending text, and learned vocabulary summary.
 */
import { useMemo } from 'react';
import { useGameStore } from '../core/store';
import { getAllCollectibles } from '../core/constants';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { ACHIEVEMENTS } from '../core/achievements';
import { getEndingText, determineEnding } from '../renderer-2d/story-events';

interface Props {
  earnedAchievements: string[];
  onRestart: () => void;
}

export default function GameEnding({ earnedAchievements, onRestart }: Props) {
  const collectedItems = useGameStore((s) => s.collectedItems);
  const learning = useGameStore((s) => s.learning);

  const allCollectibles = useMemo(() => getAllCollectibles(), []);
  const endingType = determineEnding(collectedItems.length);
  const endingText = getEndingText(endingType);

  const allVocab = useMemo(() => {
    return ENGLISH_CHALLENGES
      .filter((ch) => learning.completedChallenges.includes(ch.id))
      .flatMap((ch) => ch.vocab);
  }, [learning.completedChallenges]);

  const earnedBadges = ACHIEVEMENTS.filter((a) => earnedAchievements.includes(a.id));

  const btnStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif', fontSize: '0.9rem',
    padding: '0.6rem 2rem', background: 'transparent',
    border: '1px solid #4a3a2e', color: '#c5a55a',
    borderRadius: 4, cursor: 'pointer', letterSpacing: '0.08em',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0a0908',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, fontFamily: 'Georgia, serif',
      animation: 'endFadeIn 2s ease-out',
    }}>
      <div style={{
        maxWidth: 560, width: '92%', maxHeight: '90vh',
        overflowY: 'auto', padding: '2rem',
        textAlign: 'center',
      }}>
        {/* Mask icon */}
        <div style={{ fontSize: '3rem', margin: '0 0 1rem' }}>
          {endingType === 'full' ? '🎭' : endingType === 'standard' ? '🎵' : '🌙'}
        </div>

        {/* Ending text */}
        {endingText.map((line, i) => (
          <p key={i} style={{
            fontSize: line === '' ? '0.5rem' : '1rem',
            color: '#d8ccb4',
            fontStyle: 'italic',
            lineHeight: 1.8,
            margin: line === '' ? '0.3rem 0' : '0.2rem 0',
          }}>
            {line || ' '}
          </p>
        ))}

        <div style={{ width: 60, height: 1, background: '#3a3228', margin: '1.5rem auto' }} />

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.8rem', marginBottom: '1.5rem',
        }}>
          <StatBox icon="📜" value={`${collectedItems.length}/${allCollectibles.length}`} label="Collectibles" />
          <StatBox icon="🎓" value={`${learning.completedChallenges.length}/${ENGLISH_CHALLENGES.length}`} label="Challenges" />
          <StatBox icon="⭐" value={String(learning.totalScore)} label="Score" />
        </div>

        {/* Achievements */}
        {earnedBadges.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{
              fontSize: '0.7rem', color: '#4a3a2e',
              letterSpacing: '0.15em', margin: '0 0 0.5rem',
            }}>
              ACHIEVEMENTS EARNED
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
              {earnedBadges.map((a) => (
                <span key={a.id} style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.6rem',
                  background: 'rgba(197,165,90,0.08)',
                  border: '1px solid rgba(197,165,90,0.2)',
                  borderRadius: 4,
                  color: '#c5a55a',
                }}>
                  {a.icon} {a.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Vocabulary learned */}
        {allVocab.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{
              fontSize: '0.7rem', color: '#4a3a2e',
              letterSpacing: '0.15em', margin: '0 0 0.5rem',
            }}>
              VOCABULARY MASTERED ({allVocab.length} WORDS)
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: 'center' }}>
              {allVocab.map((v, i) => (
                <span key={`${v.word}-${i}`} style={{
                  fontSize: '0.68rem',
                  padding: '0.2rem 0.5rem',
                  background: 'rgba(138,175,176,0.08)',
                  borderRadius: 3,
                  color: '#8aafb0',
                }}>
                  {v.word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button onClick={onRestart} style={btnStyle}>
            Return to Title
          </button>
        </div>

        <p style={{
          fontSize: '0.6rem', color: '#2a2420', marginTop: '2rem',
        }}>
          THE PHANTOM OF THE OPERA
        </p>
      </div>

      <style>{`
        @keyframes endFadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}

function StatBox({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(100,80,60,0.15)',
      borderRadius: 6, padding: '0.8rem 0.5rem',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '0.15rem',
    }}>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      <span style={{ fontSize: '1.1rem', color: '#c5a55a', fontWeight: 'bold' }}>{value}</span>
      <span style={{ fontSize: '0.6rem', color: '#6a5a48' }}>{label}</span>
    </div>
  );
}
