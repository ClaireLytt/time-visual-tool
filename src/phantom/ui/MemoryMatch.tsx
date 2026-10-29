/**
 * MemoryMatch — flip cards to match English words with their Chinese meanings.
 * Classic concentration/memory game using learned vocabulary.
 */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { useGameStore } from '../core/store';
import { playCorrect, playWrong } from '../audio/ui-sfx';
import { getConfig } from '../core/difficulty';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Card {
  id: number;
  pairId: number;
  text: string;
  type: 'en' | 'zh';
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function MemoryMatch({ open, onClose }: Props) {
  const learning = useGameStore((s) => s.learning);

  const allVocab = useMemo(() => {
    return ENGLISH_CHALLENGES
      .filter((ch) => learning.completedChallenges.includes(ch.id))
      .flatMap((ch) => ch.vocab);
  }, [learning.completedChallenges]);

  // Pick 6 words for 12 cards (3x4 grid)
  const cards = useMemo<Card[]>(() => {
    const pairCount = Math.min(getConfig().memoryPairs, allVocab.length);
    const words = allVocab.slice(0, pairCount);
    const cardList: Card[] = [];
    words.forEach((v, i) => {
      cardList.push({ id: i * 2, pairId: i, text: v.word, type: 'en' });
      cardList.push({ id: i * 2 + 1, pairId: i, text: v.meaning, type: 'zh' });
    });
    return shuffle(cardList);
  }, [allVocab]);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const lockRef = useRef(false);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      const t = requestAnimationFrame(() => setGameComplete(true));
      return () => cancelAnimationFrame(t);
    }
  }, [matched, cards.length]);

  const handleFlip = useCallback((cardId: number) => {
    if (lockRef.current) return;
    if (flipped.includes(cardId) || matched.includes(cardId)) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      lockRef.current = true;
      const [first, second] = newFlipped;
      const card1 = cards.find((c) => c.id === first);
      const card2 = cards.find((c) => c.id === second);

      if (card1 && card2 && card1.pairId === card2.pairId && card1.type !== card2.type) {
        // Match!
        playCorrect();
        setTimeout(() => {
          setMatched((m) => [...m, first, second]);
          setFlipped([]);
          lockRef.current = false;
        }, 600);
      } else {
        // No match
        playWrong();
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 1000);
      }
    }
  }, [flipped, matched, cards]);

  const restart = useCallback(() => {
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameComplete(false);
  }, []);

  if (!open) return null;

  if (allVocab.length < 4) {
    return (
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 210, cursor: 'pointer', fontFamily: 'Georgia, serif',
      }}>
        <div style={{ color: '#6a5a48', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{'🃏'}</p>
          <p>Need more vocabulary for Memory Match!</p>
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
      zIndex: 210, fontFamily: 'Georgia, serif',
    }}>
      <p style={{ fontSize: '0.7rem', color: '#6a5a48', letterSpacing: '0.15em', margin: '0 0 0.3rem' }}>
        MEMORY MATCH
      </p>
      <p style={{ fontSize: '0.72rem', color: '#4a3a2e', margin: '0 0 0.8rem' }}>
        Moves: {moves} | Matched: {matched.length / 2}/{cards.length / 2}
      </p>

      {gameComplete ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{'✨'}</p>
          <p style={{ fontSize: '1.1rem', color: '#c5a55a', margin: '0 0 0.3rem' }}>Complete!</p>
          <p style={{ fontSize: '0.85rem', color: '#9a8a78', margin: '0 0 1rem' }}>
            Finished in {moves} moves
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
            <button onClick={restart} style={btnStyle}>Play Again</button>
            <button onClick={onClose} style={{ ...btnStyle, color: '#6a5a48' }}>Close</button>
          </div>
        </div>
      ) : (
        <>
          {/* Card grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem',
            maxWidth: 440,
            width: '92%',
          }}>
            {cards.map((card) => {
              const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
              const isMatched = matched.includes(card.id);
              return (
                <div
                  key={card.id}
                  onClick={() => handleFlip(card.id)}
                  style={{
                    height: 70,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isMatched ? 'rgba(100,160,100,0.12)'
                      : isFlipped ? (card.type === 'en' ? 'rgba(197,165,90,0.12)' : 'rgba(138,175,176,0.12)')
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isMatched ? 'rgba(100,160,100,0.3)' : isFlipped ? '#3a3228' : '#2a2420'}`,
                    borderRadius: 6,
                    cursor: isMatched ? 'default' : 'pointer',
                    transition: 'background 0.3s, border-color 0.3s',
                    padding: '0.3rem',
                  }}
                >
                  {isFlipped ? (
                    <span style={{
                      fontSize: card.text.length > 6 ? '0.72rem' : '0.85rem',
                      color: card.type === 'en' ? '#c5a55a' : '#8aafb0',
                      fontWeight: card.type === 'en' ? 'bold' : 'normal',
                      textAlign: 'center',
                      wordBreak: 'break-word',
                    }}>
                      {card.text}
                    </span>
                  ) : (
                    <span style={{ fontSize: '1.2rem', color: '#3a3228' }}>?</span>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={onClose} style={{ ...btnStyle, color: '#3a3228', borderColor: '#2a2420', marginTop: '1rem' }}>
            Close
          </button>
        </>
      )}
    </div>
  );
}
