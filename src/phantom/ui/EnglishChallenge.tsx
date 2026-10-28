/**
 * EnglishChallenge — modal that appears after collecting an item,
 * teaching English vocabulary and phrases from The Phantom of the Opera.
 */
import { useState, useCallback, useMemo } from 'react';
import { EnglishChallenge as ChallengeData, EnglishVocab } from '../core/types';

interface Props {
  challenge: ChallengeData;
  onComplete: (passed: boolean) => void;
}

type Phase = 'quote' | 'vocab' | 'challenge' | 'result';

export default function EnglishChallengeModal({ challenge, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('quote');
  const [vocabIdx, setVocabIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [passed, setPassed] = useState(false);

  // For match type: track matched pairs
  const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});

  const checkAnswer = useCallback(() => {
    const trimmed = answer.trim();
    if (challenge.type === 'fill-blank' || challenge.type === 'translate') {
      const isCorrect = challenge.answers.some(
        (a) => a.toLowerCase().replace(/[.,!?;:'"]/g, '') === trimmed.toLowerCase().replace(/[.,!?;:'"]/g, '')
      );
      if (isCorrect) {
        setPassed(true);
        setPhase('result');
      } else {
        setAttempts((a) => a + 1);
        if (attempts >= 0) setShowHint(true);
        if (attempts >= 2) {
          // After 3 attempts, show correct answer
          setPassed(false);
          setPhase('result');
        }
      }
    }
  }, [answer, challenge, attempts]);

  const checkMatch = useCallback(() => {
    const allCorrect = challenge.vocab.every((v) => {
      const sel = matchSelections[v.word];
      return sel === v.meaning;
    });
    if (allCorrect) {
      setPassed(true);
      setPhase('result');
    } else {
      setAttempts((a) => a + 1);
      if (attempts >= 0) setShowHint(true);
      if (attempts >= 2) {
        setPassed(false);
        setPhase('result');
      }
    }
  }, [matchSelections, challenge, attempts]);

  // Shuffled meanings for match type
  const shuffledMeanings = useMemo(() => {
    const meanings = challenge.vocab.map((v) => v.meaning);
    // Simple deterministic shuffle based on challenge id
    const seed = challenge.id.length;
    return meanings.sort((a, b) => {
      const ha = (a.charCodeAt(0) + seed) % 7;
      const hb = (b.charCodeAt(0) + seed) % 7;
      return ha - hb;
    });
  }, [challenge]);

  const containerStyle: React.CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'rgba(10,9,8,0.92)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 150,
    animation: 'ecFadeIn 0.4s ease-out',
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: 520, width: '92%', maxHeight: '85vh', overflowY: 'auto',
    background: 'linear-gradient(145deg, #1a1816, #221f1c)',
    border: '1px solid #3a3228',
    borderRadius: 12,
    padding: '1.8rem',
    fontFamily: 'Georgia, serif',
    color: '#e0d8cc',
  };

  const btnStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif',
    fontSize: '0.85rem',
    padding: '0.5rem 1.5rem',
    background: 'transparent',
    border: '1px solid #4a3a2e',
    color: '#c5a55a',
    borderRadius: 4,
    cursor: 'pointer',
    letterSpacing: '0.06em',
  };

  const renderQuotePhase = () => (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '0.7rem', color: '#6a5a48', letterSpacing: '0.15em', margin: '0 0 1rem' }}>
        ENGLISH LEARNING
      </p>
      <div style={{
        padding: '1.2rem',
        background: 'rgba(197,165,90,0.06)',
        borderLeft: '3px solid #c5a55a',
        borderRadius: '0 6px 6px 0',
        margin: '0 0 1rem',
        textAlign: 'left',
      }}>
        <p style={{ fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 0.5rem', color: '#c5a55a' }}>
          {challenge.quote}
        </p>
        <p style={{ fontSize: '0.85rem', color: '#9a8a78', margin: 0 }}>
          {challenge.quoteZh}
        </p>
      </div>
      <p style={{ fontSize: '0.72rem', color: '#6a5a48', margin: '0 0 1.2rem' }}>
        — {challenge.source}
      </p>
      <button onClick={() => setPhase('vocab')} style={btnStyle}>
        Learn Vocabulary →
      </button>
    </div>
  );

  const renderVocabPhase = () => {
    const v = challenge.vocab[vocabIdx];
    return (
      <div>
        <p style={{ fontSize: '0.7rem', color: '#6a5a48', letterSpacing: '0.15em', margin: '0 0 0.8rem' }}>
          VOCABULARY ({vocabIdx + 1}/{challenge.vocab.length})
        </p>
        <VocabCard vocab={v} />
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.2rem' }}>
          {vocabIdx > 0 && (
            <button onClick={() => setVocabIdx((i) => i - 1)} style={btnStyle}>
              ← Prev
            </button>
          )}
          {vocabIdx < challenge.vocab.length - 1 ? (
            <button onClick={() => setVocabIdx((i) => i + 1)} style={btnStyle}>
              Next →
            </button>
          ) : (
            <button onClick={() => setPhase('challenge')} style={{ ...btnStyle, borderColor: '#c5a55a' }}>
              Start Challenge →
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderChallengePhase = () => (
    <div>
      <p style={{ fontSize: '0.7rem', color: '#6a5a48', letterSpacing: '0.15em', margin: '0 0 0.8rem' }}>
        {challenge.type === 'fill-blank' ? 'FILL IN THE BLANK' :
         challenge.type === 'translate' ? 'TRANSLATION' : 'MATCHING'}
      </p>
      <p style={{ fontSize: '0.95rem', color: '#e0d8cc', lineHeight: 1.7, margin: '0 0 1rem' }}>
        {challenge.question}
      </p>

      {challenge.type === 'match' ? (
        <div>
          {challenge.vocab.map((v) => (
            <div key={v.word} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.4rem 0' }}>
              <span style={{ fontSize: '0.9rem', color: '#c5a55a', minWidth: 100 }}>{v.word}</span>
              <span style={{ color: '#6a5a48' }}>=</span>
              <select
                value={matchSelections[v.word] || ''}
                onChange={(e) => setMatchSelections((s) => ({ ...s, [v.word]: e.target.value }))}
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.85rem',
                  padding: '0.3rem 0.5rem',
                  background: '#1a1816',
                  border: '1px solid #3a3228',
                  color: '#e0d8cc',
                  borderRadius: 4,
                  flex: 1,
                }}
              >
                <option value="">-- select --</option>
                {shuffledMeanings.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={checkMatch} style={btnStyle}>Check</button>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') checkAnswer(); }}
            placeholder="Type your answer..."
            autoFocus
            style={{
              width: '100%',
              fontFamily: 'Georgia, serif',
              fontSize: '0.95rem',
              padding: '0.6rem 0.8rem',
              background: '#0a0908',
              border: '1px solid #3a3228',
              color: '#e0d8cc',
              borderRadius: 6,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1rem' }}>
            <button onClick={checkAnswer} style={btnStyle}>Check</button>
            <button onClick={() => { setPassed(false); setPhase('result'); }} style={{ ...btnStyle, color: '#6a5a48' }}>
              Skip
            </button>
          </div>
        </div>
      )}

      {showHint && (
        <p style={{
          fontSize: '0.8rem', color: '#c5a55a',
          marginTop: '0.8rem', fontStyle: 'italic',
          background: 'rgba(197,165,90,0.08)',
          padding: '0.5rem 0.8rem',
          borderRadius: 4,
        }}>
          💡 {challenge.hint}
        </p>
      )}

      {attempts > 0 && !passed && phase === 'challenge' && (
        <p style={{ fontSize: '0.75rem', color: '#8a6a5a', marginTop: '0.5rem' }}>
          {attempts >= 2 ? 'Last attempt!' : `${3 - attempts} attempts remaining`}
        </p>
      )}
    </div>
  );

  const renderResultPhase = () => (
    <div style={{ textAlign: 'center' }}>
      {passed ? (
        <>
          <p style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>✨</p>
          <p style={{ fontSize: '1.1rem', color: '#c5a55a', margin: '0 0 0.5rem' }}>Excellent!</p>
          <p style={{ fontSize: '0.85rem', color: '#9a8a78' }}>
            You&apos;ve mastered this phrase!
          </p>
        </>
      ) : (
        <>
          <p style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>📖</p>
          <p style={{ fontSize: '1.1rem', color: '#9a8a78', margin: '0 0 0.5rem' }}>Keep learning!</p>
          <p style={{ fontSize: '0.85rem', color: '#6a5a48', margin: '0 0 0.8rem' }}>
            The correct answer:
          </p>
          <p style={{
            fontSize: '0.95rem', color: '#c5a55a', fontStyle: 'italic',
            background: 'rgba(197,165,90,0.08)',
            padding: '0.6rem',
            borderRadius: 4,
          }}>
            {challenge.answers[0]}
          </p>
        </>
      )}
      {/* Grammar note */}
      {challenge.grammarNote && (
        <div style={{
          marginTop: '1rem',
          background: 'rgba(138,175,176,0.08)',
          borderLeft: '3px solid #8aafb0',
          borderRadius: '0 4px 4px 0',
          padding: '0.5rem 0.8rem',
          textAlign: 'left',
        }}>
          <p style={{ fontSize: '0.65rem', color: '#6a5a48', letterSpacing: '0.1em', margin: '0 0 0.2rem' }}>
            GRAMMAR NOTE
          </p>
          <p style={{ fontSize: '0.78rem', color: '#8aafb0', margin: '0 0 0.2rem' }}>
            {challenge.grammarNote}
          </p>
          {challenge.grammarNoteZh && (
            <p style={{ fontSize: '0.72rem', color: '#5a6a6a', margin: 0 }}>
              {challenge.grammarNoteZh}
            </p>
          )}
        </div>
      )}
      <button
        onClick={() => onComplete(passed)}
        style={{ ...btnStyle, marginTop: '1.2rem' }}
      >
        Continue →
      </button>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        {phase === 'quote' && renderQuotePhase()}
        {phase === 'vocab' && renderVocabPhase()}
        {phase === 'challenge' && renderChallengePhase()}
        {phase === 'result' && renderResultPhase()}
      </div>

      <style>{`
        @keyframes ecFadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}

/** Single vocabulary card */
function VocabCard({ vocab }: { vocab: EnglishVocab }) {
  return (
    <div style={{
      background: 'rgba(197,165,90,0.06)',
      border: '1px solid #2a2420',
      borderRadius: 8,
      padding: '1.2rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', margin: '0 0 0.4rem' }}>
        <span style={{ fontSize: '1.3rem', color: '#c5a55a', fontWeight: 'bold' }}>
          {vocab.word}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#6a5a48' }}>
          {vocab.phonetic}
        </span>
      </div>
      <p style={{ fontSize: '0.9rem', color: '#9a8a78', margin: '0 0 0.8rem' }}>
        {vocab.meaning}
      </p>
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '0.6rem 0.8rem',
        borderRadius: 4,
      }}>
        <p style={{ fontSize: '0.85rem', color: '#e0d8cc', margin: '0 0 0.3rem', fontStyle: 'italic' }}>
          {vocab.example}
        </p>
        <p style={{ fontSize: '0.78rem', color: '#6a5a48', margin: 0 }}>
          {vocab.exampleZh}
        </p>
      </div>
    </div>
  );
}
