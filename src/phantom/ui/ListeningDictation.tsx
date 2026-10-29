import { Z_TOOL } from '../core/z-index';
/**
 * ListeningDictation — hear an English sentence via TTS, type what you hear.
 * Tests listening comprehension and spelling.
 */
import { useState, useMemo, useCallback } from 'react';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { useGameStore } from '../core/store';
import { playCorrect, playWrong } from '../audio/ui-sfx';

interface Props {
  open: boolean;
  onClose: () => void;
}

function speak(text: string, rate: number = 0.8) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find((v) => v.lang.startsWith('en'));
  if (enVoice) u.voice = enVoice;
  window.speechSynthesis.speak(u);
}

export default function ListeningDictation({ open, onClose }: Props) {
  const learning = useGameStore((s) => s.learning);

  const sentences = useMemo(() => {
    return ENGLISH_CHALLENGES
      .filter((ch) => learning.completedChallenges.includes(ch.id))
      .flatMap((ch) => ch.vocab.map((v) => ({
        text: v.example,
        meaning: v.exampleZh,
        source: ch.source,
      })))
      .filter((s) => s.text.split(' ').length <= 10);
  }, [learning.completedChallenges]);

  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct' | 'close' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const current = sentences[idx % Math.max(sentences.length, 1)];
  const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const check = useCallback(() => {
    if (!current) return;
    const clean = (s: string) => s.toLowerCase().replace(/[.,!?;:'"]/g, '').trim();
    const attempt = clean(input);
    const answer = clean(current.text);
    setTotal((t) => t + 1);

    if (attempt === answer) {
      setResult('correct');
      setScore((s) => s + 1);
      playCorrect();
    } else {
      // Check if close (>70% of words correct)
      const aWords = attempt.split(/\s+/);
      const cWords = answer.split(/\s+/);
      const correctWords = aWords.filter((w) => cWords.includes(w)).length;
      if (correctWords / cWords.length > 0.7) {
        setResult('close');
        setScore((s) => s + 0.5);
      } else {
        setResult('wrong');
        playWrong();
      }
    }
    setShowAnswer(true);
  }, [input, current]);

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % sentences.length);
    setInput('');
    setResult(null);
    setShowAnswer(false);
  }, [sentences.length]);

  if (!open) return null;

  if (sentences.length < 2 || !hasTTS) {
    return (
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(10,9,8,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: Z_TOOL, cursor: 'pointer', fontFamily: 'Georgia, serif',
      }}>
        <div style={{ color: '#6a5a48', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{'🎧'}</p>
          <p>{!hasTTS ? 'Text-to-Speech not available' : 'Need more vocabulary!'}</p>
          <p style={{ fontSize: '0.78rem', color: '#4a3a2e' }}>
            {!hasTTS ? 'This browser does not support speech synthesis.' : 'Complete more challenges to unlock Listening Dictation.'}
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
      zIndex: Z_TOOL, fontFamily: 'Georgia, serif',
    }}>
      <p style={{ fontSize: '0.7rem', color: '#6a5a48', letterSpacing: '0.15em', margin: '0 0 0.3rem' }}>
        LISTENING DICTATION
      </p>
      <p style={{ fontSize: '0.72rem', color: '#8aafb0', margin: '0 0 1rem' }}>
        Score: {score}/{total}
      </p>

      {/* Play buttons */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
        <button onClick={() => speak(current.text, 0.8)} style={{ ...btnStyle, fontSize: '1.2rem', padding: '0.6rem 1.5rem' }}>
          {'🔊'} Play
        </button>
        <button onClick={() => speak(current.text, 0.5)} style={{ ...btnStyle, fontSize: '0.9rem', color: '#8aafb0' }}>
          {'🐢'} Slow
        </button>
      </div>

      {/* Hint: word count */}
      <p style={{ fontSize: '0.72rem', color: '#4a3a2e', margin: '0 0 0.6rem' }}>
        ({current.text.split(' ').length} words)
      </p>

      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !showAnswer) check(); }}
        placeholder="Type what you hear..."
        disabled={showAnswer}
        style={{
          width: '85%', maxWidth: 420,
          fontFamily: 'Georgia, serif', fontSize: '0.95rem',
          padding: '0.6rem 0.8rem',
          background: result === 'correct' ? 'rgba(100,160,100,0.12)'
            : result === 'close' ? 'rgba(197,165,90,0.12)'
            : result === 'wrong' ? 'rgba(180,100,100,0.12)'
            : '#0a0908',
          border: `1px solid ${result === 'correct' ? 'rgba(100,160,100,0.4)' : result === 'wrong' ? 'rgba(180,100,100,0.4)' : '#3a3228'}`,
          color: '#e0d8cc',
          borderRadius: 6, outline: 'none',
          textAlign: 'center',
          transition: 'background 0.3s, border-color 0.3s',
        }}
      />

      {/* Result */}
      {showAnswer && (
        <div style={{ marginTop: '0.8rem', textAlign: 'center', animation: 'ldFade 0.3s ease-out' }}>
          {result === 'correct' && (
            <p style={{ fontSize: '0.9rem', color: '#a0c8a0' }}>{'✨'} Perfect!</p>
          )}
          {result === 'close' && (
            <p style={{ fontSize: '0.9rem', color: '#c5a55a' }}>{'👍'} Almost!</p>
          )}
          {result === 'wrong' && (
            <p style={{ fontSize: '0.9rem', color: '#c89090' }}>Not quite.</p>
          )}
          <p style={{ fontSize: '0.85rem', color: '#8aafb0', fontStyle: 'italic', margin: '0.3rem 0' }}>
            {current.text}
          </p>
          <p style={{ fontSize: '0.72rem', color: '#5a5a50', margin: 0 }}>
            {current.meaning}
          </p>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
        {!showAnswer ? (
          <button onClick={check} style={btnStyle}>Check</button>
        ) : (
          <button onClick={next} style={btnStyle}>Next {'→'}</button>
        )}
        <button onClick={onClose} style={{ ...btnStyle, color: '#3a3228', borderColor: '#2a2420' }}>Close</button>
      </div>

      <style>{`
        @keyframes ldFade { from { opacity: 0; transform: translateY(5px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
