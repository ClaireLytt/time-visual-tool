import { Z_TOOL } from '../core/z-index';
/**
 * IdiomCollection — browse English idioms learned through the story.
 * Each shows literal vs figurative meaning with story context.
 */
import { useState, useMemo } from 'react';
import { useGameStore } from '../core/store';
import { IDIOMS, getUnlockedIdioms } from '../core/idioms';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function IdiomCollection({ open, onClose }: Props) {
  const collectedItems = useGameStore((s) => s.collectedItems);
  const unlocked = useMemo(() => getUnlockedIdioms(collectedItems), [collectedItems]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const idiom = unlocked[selectedIdx];

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
          letterSpacing: '0.15em', margin: '0 0 0.8rem',
          textAlign: 'center',
        }}>
          IDIOM COLLECTION ({unlocked.length}/{IDIOMS.length})
        </p>

        {/* Idiom cards */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: 'center', marginBottom: '1rem' }}>
          {IDIOMS.map((id) => {
            const isUnlocked = unlocked.some((u) => u.id === id.id);
            return (
              <button
                key={id.id}
                onClick={() => isUnlocked ? setSelectedIdx(unlocked.findIndex((u) => u.id === id.id)) : undefined}
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.5rem',
                  background: selectedIdx === unlocked.findIndex((u) => u.id === id.id) ? 'rgba(197,165,90,0.12)' : 'transparent',
                  border: '1px solid ' + (isUnlocked ? '#3a3228' : '#1a1816'),
                  borderRadius: 3,
                  color: isUnlocked ? '#c5a55a' : '#2a2420',
                  cursor: isUnlocked ? 'pointer' : 'default',
                }}
              >
                {isUnlocked ? id.idiom : '???'}
              </button>
            );
          })}
        </div>

        {idiom ? (
          <>
            {/* Idiom header */}
            <h3 style={{
              fontSize: '1.1rem', color: '#c5a55a',
              margin: '0 0 0.3rem', fontStyle: 'italic',
            }}>
              &ldquo;{idiom.idiom}&rdquo;
            </h3>

            {/* Figurative meaning */}
            <div style={{
              background: 'rgba(197,165,90,0.06)',
              borderLeft: '3px solid #c5a55a',
              borderRadius: '0 4px 4px 0',
              padding: '0.5rem 0.8rem',
              margin: '0.6rem 0',
            }}>
              <p style={{ fontSize: '0.65rem', color: '#6a5a48', letterSpacing: '0.1em', margin: '0 0 0.2rem' }}>
                FIGURATIVE MEANING
              </p>
              <p style={{ fontSize: '0.85rem', color: '#d8ccb4', margin: '0 0 0.2rem' }}>
                {idiom.meaning}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6a5a48', margin: 0 }}>
                {idiom.meaningZh}
              </p>
            </div>

            {/* Literal meaning */}
            <div style={{
              background: 'rgba(138,175,176,0.06)',
              borderLeft: '3px solid #8aafb0',
              borderRadius: '0 4px 4px 0',
              padding: '0.5rem 0.8rem',
              margin: '0.6rem 0',
            }}>
              <p style={{ fontSize: '0.65rem', color: '#5a6a6a', letterSpacing: '0.1em', margin: '0 0 0.2rem' }}>
                LITERAL MEANING
              </p>
              <p style={{ fontSize: '0.82rem', color: '#8aafb0', margin: '0 0 0.2rem' }}>
                {idiom.literal}
              </p>
              <p style={{ fontSize: '0.72rem', color: '#5a6a6a', margin: 0 }}>
                {idiom.literalZh}
              </p>
            </div>

            {/* Story context */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 4,
              padding: '0.6rem 0.8rem',
              margin: '0.6rem 0',
            }}>
              <p style={{ fontSize: '0.65rem', color: '#4a3a2e', letterSpacing: '0.1em', margin: '0 0 0.2rem' }}>
                IN THE STORY
              </p>
              <p style={{ fontSize: '0.82rem', color: '#d8ccb4', fontStyle: 'italic', margin: '0 0 0.2rem' }}>
                {idiom.storyContext}
              </p>
              <p style={{ fontSize: '0.72rem', color: '#6a5a48', margin: '0 0 0.2rem' }}>
                {idiom.storyContextZh}
              </p>
              <p style={{ fontSize: '0.6rem', color: '#3a3228', margin: 0 }}>
                Unlocked: {idiom.unlockSource}
              </p>
            </div>
          </>
        ) : (
          <p style={{ fontSize: '0.85rem', color: '#4a3a2e', textAlign: 'center', fontStyle: 'italic' }}>
            Collect items to discover English idioms from the story!
          </p>
        )}
      </div>
    </div>
  );
}
