import { Z_TOOL } from '../core/z-index';
/**
 * WordScramble — mini-game to unscramble vocabulary words.
 * Accessible from the pause menu. Uses learned vocabulary only.
 */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { useGameStore } from '../core/store';
import { getConfig } from '../core/difficulty';

interface Props {
  open: boolean;
  onClose: () => void;
}

function scramble(word: string, seed: number): string {
  const chars = word.split('');
  // Fisher-Yates with deterministic seed
  let s = seed;
  for (let i = chars.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  // If unchanged, swap first two
  if (chars.join('') === word && chars.length > 1) {
    [chars[0], chars[1]] = [chars[1], chars[0]];
  }
  return chars.join('');
}

export default function WordScramble({ open, onClose }: Props) {
  const learning = useGameStore((s) => s.learning);

  const allWords = useMemo(() => {
    return ENGLISH_CHALLENGES
      .filter((ch) => learning.completedChallenges.includes(ch.id))
      .flatMap((ch) => ch.vocab.map((v) => ({ word: v.word, meaning: v.meaning })));
  }, [learning.completedChallenges]);

  const [wordIdx, setWordIdx] = useState(0);
  const [input, setInput] = useState('');
  const [solved, setSolved] = useState(0);
  const [total, setTotal] = useState(0);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const diffConfig = getConfig();
  const [timeLeft, setTimeLeft] = useState(diffConfig.scrambleTime);
  const [gameOver, setGameOver] = useState(false);
  const [scrambleSeed, setScrambleSeed] = useState(() => Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentWord = allWords[wordIdx % allWords.length];
  const scrambled = useMemo(
    () => currentWord ? scramble(currentWord.word, scrambleSeed) : '',
    [currentWord, scrambleSeed]
  );

  // Timer
  useEffect(() => {
    if (!open || gameOver || allWords.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [open, gameOver, allWords.length]);

  const nextWord = useCallback(() => {
    setScrambleSeed(Date.now());
    setWordIdx((i) => (i + 1) % allWords.length);
    setInput('');
    setShowResult(null);
  }, [allWords.length]);

  const check = useCallback(() => {
    if (!currentWord) return;
    setTotal((t) => t + 1);
    if (input.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setSolved((s) => s + 1);
      setShowResult('correct');
      setTimeout(nextWord, 800);
    } else {
      setShowResult('wrong');
      setTimeout(() => setShowResult(null), 800);
    }
  }, [input, currentWord, nextWord]);

  const restart = useCallback(() => {
    setSolved(0);
    setTotal(0);
    setTimeLeft(diffConfig.scrambleTime);
    setGameOver(false);
    setShowResult(null);
    setInput('');
    setScrambleSeed(Date.now());
  }, [diffConfig.scrambleTime]);

  if (!open) return null;

  if (allWords.length < 3) {
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
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>🧩</p>
          <p>Need at least 3 vocabulary words!</p>
          <p style={{ fontSize: '0.78rem', color: '#4a3a2e' }}>
            Complete more English challenges to unlock Word Scramble.
          </p>
        </div>
      </div>
    );
  }

  const btnStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif', fontSize: '0.82rem',
    padding: '0.5rem 1.4rem', background: 'transparent',
    border: '1px solid #3a3228', color: '#c5a55a',
    borderRadius: 4, cursor: 'pointer', letterSpacing: '0.06em',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.94)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: Z_TOOL, fontFamily: 'Georgia, serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '90%', maxWidth: 420, marginBottom: '1rem',
      }}>
        <span style={{ fontSize: '0.75rem', color: '#6a5a48', letterSpacing: '0.12em' }}>
          WORD SCRAMBLE
        </span>
        <span style={{
          fontSize: '0.85rem',
          color: timeLeft <= 5 ? '#c87a6a' : '#c5a55a',
          fontWeight: 'bold',
        }}>
          {timeLeft}s
        </span>
      </div>

      {gameOver ? (
        /* Game over screen */
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>⏰</p>
          <p style={{ fontSize: '1.1rem', color: '#c5a55a', margin: '0 0 0.3rem' }}>
            Time&apos;s up!
          </p>
          <p style={{ fontSize: '1.3rem', color: '#8aafb0', margin: '0 0 0.3rem' }}>
            {solved} / {total}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#6a5a48', margin: '0 0 1.2rem' }}>
            {solved >= 5 ? 'Amazing!' : solved >= 3 ? 'Good job!' : 'Keep practicing!'}
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
            <button onClick={restart} style={btnStyle}>Play Again</button>
            <button onClick={onClose} style={{ ...btnStyle, color: '#6a5a48' }}>Close</button>
          </div>
        </div>
      ) : (
        /* Game play */
        <>
          {/* Score */}
          <div style={{
            fontSize: '0.75rem', color: '#6a5a48', marginBottom: '0.8rem',
          }}>
            Solved: {solved}
          </div>

          {/* Scrambled word */}
          <div style={{
            display: 'flex', gap: '0.4rem', marginBottom: '0.8rem',
          }}>
            {scrambled.split('').map((ch, i) => (
              <span key={i} style={{
                width: 36, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(197,165,90,0.1)',
                border: '1px solid #3a3228',
                borderRadius: 4,
                fontSize: '1.3rem',
                color: '#c5a55a',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}>
                {ch}
              </span>
            ))}
          </div>

          {/* Hint: meaning */}
          <p style={{
            fontSize: '0.8rem', color: '#8aafb0',
            margin: '0 0 1rem', fontStyle: 'italic',
          }}>
            Hint: {currentWord?.meaning}
          </p>

          {/* Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') check(); }}
            placeholder="Type the word..."
            autoFocus
            style={{
              width: '80%', maxWidth: 300,
              fontFamily: 'Georgia, serif', fontSize: '1rem',
              padding: '0.6rem 0.8rem',
              background: showResult === 'correct' ? 'rgba(100,160,100,0.15)'
                : showResult === 'wrong' ? 'rgba(180,100,100,0.15)'
                : '#0a0908',
              border: showResult === 'correct' ? '1px solid rgba(100,160,100,0.4)'
                : showResult === 'wrong' ? '1px solid rgba(180,100,100,0.4)'
                : '1px solid #3a3228',
              color: '#e0d8cc',
              borderRadius: 6, outline: 'none',
              textAlign: 'center',
              letterSpacing: '0.1em',
              transition: 'background 0.3s, border-color 0.3s',
            }}
          />

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
            <button onClick={check} style={btnStyle}>Check</button>
            <button onClick={nextWord} style={{ ...btnStyle, color: '#6a5a48' }}>Skip</button>
            <button onClick={onClose} style={{ ...btnStyle, color: '#4a3a2e', borderColor: '#2a2420' }}>
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}
