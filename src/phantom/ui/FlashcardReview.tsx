/**
 * FlashcardReview — review learned vocabulary as flip cards.
 * Accessible from the pause menu.
 */
import { useState, useMemo, useCallback } from 'react';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { useGameStore } from '../core/store';
import { EnglishVocab } from '../core/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FlashcardReview({ open, onClose }: Props) {
  const learning = useGameStore((s) => s.learning);
  const reviewVocab = useGameStore((s) => s.reviewVocab);

  const allVocab = useMemo(() => {
    const vocab: (EnglishVocab & { source: string })[] = [];
    ENGLISH_CHALLENGES
      .filter((ch) => learning.completedChallenges.includes(ch.id))
      .forEach((ch) => {
        ch.vocab.forEach((v) => {
          vocab.push({ ...v, source: ch.source });
        });
      });
    return vocab;
  }, [learning.completedChallenges]);

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = allVocab[idx];

  const next = useCallback(() => {
    if (card) reviewVocab(card.word);
    setFlipped(false);
    setIdx((i) => (i + 1) % allVocab.length);
  }, [card, allVocab.length, reviewVocab]);

  const prev = useCallback(() => {
    setFlipped(false);
    setIdx((i) => (i - 1 + allVocab.length) % allVocab.length);
  }, [allVocab.length]);

  if (!open) return null;

  if (allVocab.length === 0) {
    return (
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 210, cursor: 'pointer',
      }}>
        <div style={{
          fontFamily: 'Georgia, serif', color: '#6a5a48',
          fontSize: '0.95rem', textAlign: 'center',
        }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>📚</p>
          <p>No vocabulary yet!</p>
          <p style={{ fontSize: '0.78rem', color: '#4a3a2e' }}>
            Collect items and complete challenges to unlock flashcards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.92)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 210,
      fontFamily: 'Georgia, serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '90%', maxWidth: 460, marginBottom: '1rem',
      }}>
        <span style={{ fontSize: '0.75rem', color: '#6a5a48', letterSpacing: '0.12em' }}>
          FLASHCARD REVIEW
        </span>
        <span style={{ fontSize: '0.75rem', color: '#6a5a48' }}>
          {idx + 1} / {allVocab.length}
        </span>
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          width: '90%', maxWidth: 460, minHeight: 240,
          perspective: '1000px',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: '100%', minHeight: 240,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s ease',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
        }}>
          {/* Front — English word */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(145deg, #2a2420, #1e1a16)',
            border: '1px solid #3a3228',
            borderRadius: 12,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
          }}>
            <span style={{ fontSize: '2rem', color: '#c5a55a', fontWeight: 'bold' }}>
              {card.word}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6a5a48', marginTop: '0.5rem' }}>
              {card.phonetic}
            </span>
            <span style={{
              fontSize: '0.65rem', color: '#4a3a2e', marginTop: '1.5rem',
            }}>
              tap to flip
            </span>
          </div>

          {/* Back — meaning + example */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(145deg, #2a2420, #1e1a16)',
            border: '1px solid rgba(138,175,176,0.3)',
            borderRadius: 12,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem 2rem',
          }}>
            <span style={{ fontSize: '1.2rem', color: '#8aafb0', fontWeight: 'bold' }}>
              {card.meaning}
            </span>
            <div style={{
              marginTop: '1rem',
              background: 'rgba(0,0,0,0.3)',
              padding: '0.8rem',
              borderRadius: 6,
              width: '100%',
            }}>
              <p style={{
                fontSize: '0.85rem', color: '#e0d8cc',
                fontStyle: 'italic', margin: '0 0 0.3rem',
              }}>
                {card.example}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6a5a48', margin: 0 }}>
                {card.exampleZh}
              </p>
            </div>
            <span style={{
              fontSize: '0.6rem', color: '#4a3a2e', marginTop: '0.8rem',
            }}>
              {card.source}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex', gap: '1rem', marginTop: '1.5rem',
        alignItems: 'center',
      }}>
        <button onClick={prev} style={navBtn}>← Prev</button>
        <button onClick={onClose} style={{ ...navBtn, color: '#6a5a48', borderColor: '#2a2420' }}>
          Close
        </button>
        <button onClick={next} style={navBtn}>Next →</button>
      </div>

      {/* Review count */}
      {card && learning.vocabReviewed[card.word] && (
        <p style={{
          fontSize: '0.65rem', color: '#4a3a2e', marginTop: '0.8rem',
        }}>
          Reviewed {learning.vocabReviewed[card.word]} time{learning.vocabReviewed[card.word] > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

const navBtn: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '0.82rem',
  padding: '0.5rem 1.4rem',
  background: 'transparent',
  border: '1px solid #3a3228',
  color: '#c5a55a',
  borderRadius: 4,
  cursor: 'pointer',
  letterSpacing: '0.06em',
};
