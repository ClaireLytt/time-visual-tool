/**
 * PronunciationPractice — hear vocabulary words spoken aloud using
 * browser Text-to-Speech API. Practice listening and repeating.
 */
import { useState, useMemo, useCallback } from 'react';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { useGameStore } from '../core/store';
import { EnglishVocab } from '../core/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

function speak(text: string, rate: number = 0.85) {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  u.pitch = 1;
  // Try to find an English voice
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find((v) => v.lang.startsWith('en'));
  if (enVoice) u.voice = enVoice;
  window.speechSynthesis.speak(u);
  return true;
}

export default function PronunciationPractice({ open, onClose }: Props) {
  const learning = useGameStore((s) => s.learning);
  const reviewVocab = useGameStore((s) => s.reviewVocab);

  const allVocab = useMemo(() => {
    const vocab: (EnglishVocab & { source: string })[] = [];
    ENGLISH_CHALLENGES
      .filter((ch) => learning.completedChallenges.includes(ch.id))
      .forEach((ch) => {
        ch.vocab.forEach((v) => vocab.push({ ...v, source: ch.source }));
      });
    return vocab;
  }, [learning.completedChallenges]);

  const [idx, setIdx] = useState(0);
  const [speed, setSpeed] = useState<'slow' | 'normal'>('normal');
  const [showMeaning, setShowMeaning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const card = allVocab[idx % Math.max(allVocab.length, 1)];
  const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const playWord = useCallback(() => {
    if (!card) return;
    setIsSpeaking(true);
    speak(card.word, speed === 'slow' ? 0.5 : 0.85);
    reviewVocab(card.word);
    setTimeout(() => setIsSpeaking(false), 1200);
  }, [card, speed, reviewVocab]);

  const playSentence = useCallback(() => {
    if (!card) return;
    setIsSpeaking(true);
    speak(card.example, speed === 'slow' ? 0.6 : 0.85);
    setTimeout(() => setIsSpeaking(false), 3000);
  }, [card, speed]);

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % allVocab.length);
    setShowMeaning(false);
  }, [allVocab.length]);

  const prev = useCallback(() => {
    setIdx((i) => (i - 1 + allVocab.length) % allVocab.length);
    setShowMeaning(false);
  }, [allVocab.length]);

  if (!open) return null;

  if (allVocab.length === 0) {
    return (
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 210, cursor: 'pointer', fontFamily: 'Georgia, serif',
      }}>
        <div style={{ color: '#6a5a48', fontSize: '0.95rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{'🔊'}</p>
          <p>No vocabulary yet!</p>
          <p style={{ fontSize: '0.78rem', color: '#4a3a2e' }}>
            Complete challenges to unlock Pronunciation Practice.
          </p>
        </div>
      </div>
    );
  }

  const btnStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif', fontSize: '0.82rem',
    padding: '0.5rem 1.2rem', background: 'transparent',
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
        PRONUNCIATION PRACTICE ({idx + 1}/{allVocab.length})
      </p>

      {!hasTTS && (
        <p style={{ fontSize: '0.72rem', color: '#c87a6a', margin: '0 0 0.5rem' }}>
          Text-to-Speech not available in this browser
        </p>
      )}

      {/* Speed toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setSpeed('normal')}
          style={{ ...btnStyle, fontSize: '0.7rem', padding: '0.25rem 0.6rem',
            background: speed === 'normal' ? 'rgba(197,165,90,0.12)' : 'transparent',
            borderColor: speed === 'normal' ? '#c5a55a' : '#2a2420',
          }}
        >
          Normal Speed
        </button>
        <button
          onClick={() => setSpeed('slow')}
          style={{ ...btnStyle, fontSize: '0.7rem', padding: '0.25rem 0.6rem',
            background: speed === 'slow' ? 'rgba(138,175,176,0.12)' : 'transparent',
            borderColor: speed === 'slow' ? '#8aafb0' : '#2a2420',
            color: speed === 'slow' ? '#8aafb0' : '#6a5a48',
          }}
        >
          {'🐢'} Slow
        </button>
      </div>

      {/* Word card */}
      <div style={{
        width: '90%', maxWidth: 420,
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${isSpeaking ? 'rgba(197,165,90,0.4)' : '#2a2420'}`,
        borderRadius: 12,
        padding: '1.5rem 2rem',
        textAlign: 'center',
        transition: 'border-color 0.3s',
      }}>
        {/* Word */}
        <p style={{ fontSize: '1.8rem', color: '#c5a55a', fontWeight: 'bold', margin: '0 0 0.3rem' }}>
          {card.word}
        </p>
        <p style={{ fontSize: '0.8rem', color: '#6a5a48', margin: '0 0 0.8rem' }}>
          {card.phonetic}
        </p>

        {/* Play buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.8rem' }}>
          <button onClick={playWord} disabled={!hasTTS} style={{
            ...btnStyle, fontSize: '1rem', padding: '0.5rem 1.5rem',
            opacity: hasTTS ? 1 : 0.4,
          }}>
            {'🔊'} Word
          </button>
          <button onClick={playSentence} disabled={!hasTTS} style={{
            ...btnStyle, fontSize: '1rem', padding: '0.5rem 1.5rem',
            opacity: hasTTS ? 1 : 0.4,
          }}>
            {'📢'} Sentence
          </button>
        </div>

        {/* Show/hide meaning */}
        <button
          onClick={() => setShowMeaning(!showMeaning)}
          style={{ ...btnStyle, fontSize: '0.75rem', marginBottom: '0.6rem' }}
        >
          {showMeaning ? 'Hide Meaning' : 'Show Meaning'}
        </button>

        {showMeaning && (
          <div style={{ animation: 'pronFade 0.3s ease-out' }}>
            <p style={{ fontSize: '0.9rem', color: '#8aafb0', margin: '0 0 0.3rem' }}>
              {card.meaning}
            </p>
            <p style={{
              fontSize: '0.82rem', color: '#d8ccb4',
              fontStyle: 'italic', margin: '0 0 0.2rem',
            }}>
              {card.example}
            </p>
            <p style={{ fontSize: '0.72rem', color: '#5a5a50', margin: 0 }}>
              {card.exampleZh}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
        <button onClick={prev} style={btnStyle}>{'←'} Prev</button>
        <button onClick={onClose} style={{ ...btnStyle, color: '#4a3a2e', borderColor: '#2a2420' }}>Close</button>
        <button onClick={next} style={btnStyle}>Next {'→'}</button>
      </div>

      <style>{`
        @keyframes pronFade { from { opacity: 0; transform: translateY(5px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
