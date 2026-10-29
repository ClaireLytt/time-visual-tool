/**
 * LearningStats — detailed progress analytics dashboard.
 * Shows vocabulary mastery, challenge history, study time estimate,
 * and a difficulty selector.
 */
import { useState, useMemo, useCallback } from 'react';
import { useGameStore } from '../core/store';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { IDIOMS, getUnlockedIdioms } from '../core/idioms';
import { READING_PASSAGES, getUnlockedPassages } from '../core/reading-passages';
import { ACHIEVEMENTS } from '../core/achievements';
import { Difficulty, DIFFICULTY_CONFIGS, getDifficulty, setDifficulty } from '../core/difficulty';
import { ENV_DESCRIPTIONS } from '../core/environment-descriptions';

interface Props {
  open: boolean;
  onClose: () => void;
  earnedAchievements: string[];
}

export default function LearningStats({ open, onClose, earnedAchievements }: Props) {
  const learning = useGameStore((s) => s.learning);
  const collectedItems = useGameStore((s) => s.collectedItems);
  const [difficulty, setDiff] = useState<Difficulty>(getDifficulty());

  const totalVocab = useMemo(() => {
    return ENGLISH_CHALLENGES
      .filter((ch) => learning.completedChallenges.includes(ch.id))
      .reduce((sum, ch) => sum + ch.vocab.length, 0);
  }, [learning.completedChallenges]);

  const totalReviews = useMemo(() => {
    return Object.values(learning.vocabReviewed).reduce((a, b) => a + b, 0);
  }, [learning.vocabReviewed]);

  const unlockedIdioms = getUnlockedIdioms(collectedItems).length;
  const unlockedPassages = getUnlockedPassages(collectedItems.length).length;
  const phrasesCollected = learning.phrasesCollected?.length || 0;

  const changeDifficulty = useCallback((d: Difficulty) => {
    setDiff(d);
    setDifficulty(d);
  }, []);

  // Estimate study time: ~30s per challenge + ~10s per review + ~60s per passage read
  const estimatedMinutes = Math.round(
    (learning.completedChallenges.length * 0.5 + totalReviews * 0.17 + unlockedPassages * 1)
  );

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
          width: '92%', maxWidth: 520, maxHeight: '85vh',
          background: 'linear-gradient(135deg, #1a1816, #221f1c)',
          border: '1px solid #2a2420',
          borderRadius: 8,
          padding: '1.5rem',
          overflowY: 'auto',
        }}
      >
        <p style={{
          fontSize: '0.65rem', color: '#4a3a2e',
          letterSpacing: '0.15em', margin: '0 0 1rem',
          textAlign: 'center',
        }}>
          LEARNING STATISTICS
        </p>

        {/* Main stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem', marginBottom: '1rem',
        }}>
          <StatCard value={String(learning.totalScore)} label="Total Score" icon={'⭐'} color="#c5a55a" />
          <StatCard value={`${learning.completedChallenges.length}/${ENGLISH_CHALLENGES.length}`} label="Challenges" icon={'🎓'} color="#8aafb0" />
          <StatCard value={String(totalVocab)} label="Words Learned" icon={'📚'} color="#9a8a78" />
          <StatCard value={String(totalReviews)} label="Reviews" icon={'🔁'} color="#b0a090" />
          <StatCard value={`${unlockedIdioms}/${IDIOMS.length}`} label="Idioms" icon={'💬'} color="#a08a6a" />
          <StatCard value={`${unlockedPassages}/${READING_PASSAGES.length}`} label="Articles" icon={'📰'} color="#8a9a7a" />
          <StatCard value={String(phrasesCollected)} label="Phrases" icon={'🌿'} color="#7a9a8a" />
          <StatCard value={`${earnedAchievements.length}/${ACHIEVEMENTS.length}`} label="Badges" icon={'🏆'} color="#c5a55a" />
          <StatCard value={`~${estimatedMinutes}m`} label="Study Time" icon={'⏰'} color="#8aafb0" />
          <StatCard value={String(learning.combo || 0)} label="Combo" icon={'🔥'} color="#c87a6a" />
          <StatCard value={String(learning.bestCombo || 0)} label="Best Combo" icon={'🏅'} color="#c5a55a" />
          <StatCard value={getDifficulty().toUpperCase()} label="Difficulty" icon={'⚙️'} color="#9a8a78" />
        </div>

        {/* Vocabulary mastery */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.65rem', color: '#4a3a2e', letterSpacing: '0.12em', margin: '0 0 0.4rem' }}>
            VOCABULARY MASTERY
          </p>
          <div style={{
            height: 8, background: '#1a1816',
            borderRadius: 4, overflow: 'hidden',
            border: '1px solid #2a2420',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (totalVocab / 36) * 100)}%`,
              background: 'linear-gradient(90deg, #c5a55a, #8aafb0)',
              borderRadius: 4,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <p style={{ fontSize: '0.65rem', color: '#4a3a2e', margin: '0.2rem 0 0', textAlign: 'right' }}>
            {totalVocab}/36+ words
          </p>
        </div>

        {/* Environment exploration */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.65rem', color: '#4a3a2e', letterSpacing: '0.12em', margin: '0 0 0.4rem' }}>
            EXPLORATION
          </p>
          <div style={{
            height: 8, background: '#1a1816',
            borderRadius: 4, overflow: 'hidden',
            border: '1px solid #2a2420',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (collectedItems.length / 15) * 100)}%`,
              background: '#c5a55a',
              borderRadius: 4,
            }} />
          </div>
          <p style={{ fontSize: '0.65rem', color: '#4a3a2e', margin: '0.2rem 0 0', textAlign: 'right' }}>
            {collectedItems.length}/15 collectibles &middot; {phrasesCollected}/{Object.keys(ENV_DESCRIPTIONS).length} phrases
          </p>
        </div>

        {/* Difficulty selector */}
        <div style={{ marginBottom: '0.5rem' }}>
          <p style={{ fontSize: '0.65rem', color: '#4a3a2e', letterSpacing: '0.12em', margin: '0 0 0.4rem' }}>
            DIFFICULTY
          </p>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map((d) => {
              const cfg = DIFFICULTY_CONFIGS[d];
              const isActive = difficulty === d;
              return (
                <button
                  key={d}
                  onClick={() => changeDifficulty(d)}
                  style={{
                    flex: 1,
                    fontFamily: 'Georgia, serif',
                    fontSize: '0.78rem',
                    padding: '0.5rem',
                    background: isActive ? 'rgba(197,165,90,0.12)' : 'transparent',
                    border: `1px solid ${isActive ? '#c5a55a' : '#2a2420'}`,
                    borderRadius: 4,
                    color: isActive ? '#c5a55a' : '#4a3a2e',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {cfg.icon} {cfg.labelZh}
                  <br />
                  <span style={{ fontSize: '0.6rem', color: '#5a5a50' }}>
                    {d === 'easy' ? 'More hints' : d === 'hard' ? 'Less time' : 'Balanced'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, icon, color }: { value: string; label: string; icon: string; color: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(100,80,60,0.12)',
      borderRadius: 6,
      padding: '0.6rem 0.4rem',
      textAlign: 'center',
    }}>
      <span style={{ fontSize: '0.9rem' }}>{icon}</span>
      <p style={{ fontSize: '1rem', color, fontWeight: 'bold', margin: '0.1rem 0' }}>{value}</p>
      <p style={{ fontSize: '0.55rem', color: '#5a5a50', margin: 0 }}>{label}</p>
    </div>
  );
}
