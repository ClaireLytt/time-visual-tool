import { Z_TOOL } from '../core/z-index';
/**
 * SentenceBuilder — drag-to-reorder word tiles to form correct English sentences.
 * Uses quotes from the opera that the player has encountered.
 */
import { useState, useMemo, useCallback } from 'react';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { useGameStore } from '../core/store';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface SentenceData {
  sentence: string;
  source: string;
}

function shuffleWords(words: string[], seed: number): string[] {
  const arr = [...words];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure it's actually shuffled
  if (arr.join(' ') === words.join(' ') && arr.length > 1) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

export default function SentenceBuilder({ open, onClose }: Props) {
  const learning = useGameStore((s) => s.learning);

  // Build sentence pool from completed challenges
  const sentences = useMemo<SentenceData[]>(() => {
    const pool: SentenceData[] = [];
    ENGLISH_CHALLENGES
      .filter((ch) => learning.completedChallenges.includes(ch.id))
      .forEach((ch) => {
        // Use vocab example sentences (simpler, learnable)
        ch.vocab.forEach((v) => {
          if (v.example.split(' ').length >= 4 && v.example.split(' ').length <= 10) {
            pool.push({ sentence: v.example, source: ch.source });
          }
        });
      });
    return pool;
  }, [learning.completedChallenges]);

  const [sentIdx, setSentIdx] = useState(0);
  const [seed, setSeed] = useState(() => Date.now());
  const [selected, setSelected] = useState<number[]>([]);
  const [solved, setSolved] = useState(0);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);

  const current = sentences[sentIdx % sentences.length];
  const words = useMemo(
    () => current ? current.sentence.replace(/[.,!?;:'"]/g, '').split(' ') : [],
    [current]
  );
  const shuffled = useMemo(
    () => shuffleWords(words, seed),
    [words, seed]
  );

  const builtSentence = selected.map((i) => shuffled[i]).join(' ');

  const handleTileClick = useCallback((idx: number) => {
    if (showResult) return;
    if (selected.includes(idx)) {
      // Deselect
      setSelected((s) => s.filter((i) => i !== idx));
    } else {
      setSelected((s) => [...s, idx]);
    }
  }, [selected, showResult]);

  const checkSentence = useCallback(() => {
    const correct = words.join(' ').toLowerCase();
    const attempt = builtSentence.toLowerCase();
    if (attempt === correct) {
      setShowResult('correct');
      setSolved((s) => s + 1);
    } else {
      setShowResult('wrong');
    }
  }, [words, builtSentence]);

  const nextSentence = useCallback(() => {
    setSentIdx((i) => (i + 1) % sentences.length);
    setSeed(Date.now());
    setSelected([]);
    setShowResult(null);
  }, [sentences.length]);

  if (!open) return null;

  if (sentences.length < 2) {
    return (
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: Z_TOOL, cursor: 'pointer',
      }}>
        <div style={{
          fontFamily: 'Georgia, serif', color: '#6a5a48',
          fontSize: '0.95rem', textAlign: 'center',
        }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{'📝'}</p>
          <p>Need more vocabulary!</p>
          <p style={{ fontSize: '0.78rem', color: '#4a3a2e' }}>
            Complete more English challenges to unlock Sentence Builder.
          </p>
        </div>
      </div>
    );
  }

  const btnStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif', fontSize: '0.82rem',
    padding: '0.5rem 1.4rem', background: 'transparent',
    border: '1px solid #3a3228', color: '#c5a55a',
    borderRadius: 4, cursor: 'pointer',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.94)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: Z_TOOL, fontFamily: 'Georgia, serif',
    }}>
      <p style={{ fontSize: '0.7rem', color: '#6a5a48', letterSpacing: '0.15em', margin: '0 0 0.3rem' }}>
        SENTENCE BUILDER
      </p>
      <p style={{ fontSize: '0.72rem', color: '#4a3a2e', margin: '0 0 1rem' }}>
        Tap words in the correct order to build the sentence
      </p>

      {/* Source hint */}
      <p style={{ fontSize: '0.7rem', color: '#6a5a48', fontStyle: 'italic', margin: '0 0 1rem' }}>
        {current?.source}
      </p>

      {/* Built sentence area */}
      <div style={{
        minHeight: 50, width: '90%', maxWidth: 480,
        background: showResult === 'correct' ? 'rgba(100,160,100,0.1)'
          : showResult === 'wrong' ? 'rgba(180,100,100,0.1)'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${showResult === 'correct' ? 'rgba(100,160,100,0.3)' : showResult === 'wrong' ? 'rgba(180,100,100,0.3)' : '#2a2420'}`,
        borderRadius: 8, padding: '0.8rem',
        marginBottom: '1rem',
        display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
        alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        {selected.length === 0 ? (
          <span style={{ fontSize: '0.8rem', color: '#3a3228', fontStyle: 'italic' }}>
            Your sentence will appear here...
          </span>
        ) : (
          selected.map((idx, pos) => (
            <span
              key={`built-${pos}`}
              onClick={() => handleTileClick(idx)}
              style={{
                fontSize: '0.9rem', color: '#c5a55a',
                padding: '0.3rem 0.6rem',
                background: 'rgba(197,165,90,0.12)',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {shuffled[idx]}
            </span>
          ))
        )}
      </div>

      {/* Word tiles */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
        justifyContent: 'center', width: '90%', maxWidth: 480,
        marginBottom: '1.2rem',
      }}>
        {shuffled.map((word, i) => {
          const isSelected = selected.includes(i);
          return (
            <button
              key={`tile-${i}`}
              onClick={() => handleTileClick(i)}
              disabled={showResult !== null}
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '0.9rem',
                padding: '0.4rem 0.8rem',
                background: isSelected ? 'rgba(60,50,40,0.5)' : 'rgba(197,165,90,0.08)',
                border: `1px solid ${isSelected ? '#2a2420' : 'rgba(197,165,90,0.25)'}`,
                borderRadius: 6,
                color: isSelected ? '#4a3a2e' : '#e0d8cc',
                cursor: showResult ? 'default' : 'pointer',
                opacity: isSelected ? 0.4 : 1,
                transition: 'all 0.2s',
              }}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* Result feedback */}
      {showResult === 'correct' && (
        <p style={{ fontSize: '0.9rem', color: '#8aafb0', margin: '0 0 0.5rem' }}>
          {'✨'} Correct! Solved: {solved}
        </p>
      )}
      {showResult === 'wrong' && (
        <p style={{ fontSize: '0.8rem', color: '#c87a6a', margin: '0 0 0.5rem' }}>
          Not quite. Try again!
        </p>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        {showResult === 'correct' ? (
          <button onClick={nextSentence} style={btnStyle}>Next Sentence {'→'}</button>
        ) : (
          <>
            {selected.length === words.length && (
              <button onClick={checkSentence} style={btnStyle}>Check</button>
            )}
            {selected.length > 0 && showResult === 'wrong' && (
              <button onClick={() => { setSelected([]); setShowResult(null); }} style={btnStyle}>
                Reset
              </button>
            )}
          </>
        )}
        <button onClick={onClose} style={{ ...btnStyle, color: '#4a3a2e', borderColor: '#2a2420' }}>
          Close
        </button>
      </div>
    </div>
  );
}
