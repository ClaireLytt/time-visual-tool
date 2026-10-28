/**
 * ReadingPassages — longer English reading texts with comprehension questions.
 * Unlocked by collecting items. Keywords are highlighted in the text.
 */
import { useState, useMemo } from 'react';
import { useGameStore } from '../core/store';
import { READING_PASSAGES, getUnlockedPassages } from '../core/reading-passages';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ReadingPassages({ open, onClose }: Props) {
  const collectedItems = useGameStore((s) => s.collectedItems);
  const unlocked = useMemo(() => getUnlockedPassages(collectedItems.length), [collectedItems]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const passage = unlocked[selectedIdx];

  if (!open) return null;

  const btnStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif', fontSize: '0.78rem',
    padding: '0.4rem 1rem', background: 'transparent',
    border: '1px solid #3a3228', color: '#c5a55a',
    borderRadius: 4, cursor: 'pointer',
  };

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
          width: '92%', maxWidth: 600, maxHeight: '85vh',
          background: 'linear-gradient(135deg, #1a1816, #221f1c)',
          border: '1px solid #2a2420',
          borderRadius: 8,
          padding: '1.5rem',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <p style={{
          fontSize: '0.65rem', color: '#4a3a2e',
          letterSpacing: '0.15em', margin: '0 0 0.8rem',
          textAlign: 'center',
        }}>
          READING ({unlocked.length}/{READING_PASSAGES.length} unlocked)
        </p>

        {/* Passage selector */}
        <div style={{
          display: 'flex', gap: '0.3rem', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: '1rem',
        }}>
          {unlocked.map((p, i) => (
            <button
              key={p.id}
              onClick={() => { setSelectedIdx(i); setShowAnswer(false); setShowTranslation(false); }}
              style={{
                ...btnStyle,
                fontSize: '0.7rem',
                padding: '0.3rem 0.6rem',
                background: selectedIdx === i ? 'rgba(197,165,90,0.12)' : 'transparent',
                borderColor: selectedIdx === i ? '#c5a55a' : '#2a2420',
              }}
            >
              {i + 1}. {p.title}
            </button>
          ))}
        </div>

        {passage ? (
          <>
            {/* Title */}
            <h3 style={{ fontSize: '1.1rem', color: '#c5a55a', margin: '0 0 0.2rem' }}>
              {passage.title}
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#6a5a48', margin: '0 0 1rem' }}>
              {passage.titleZh}
            </p>

            {/* English text with highlighted keywords */}
            <div style={{
              fontSize: '0.88rem', color: '#d8ccb4',
              lineHeight: 1.9, marginBottom: '0.8rem',
            }}>
              {highlightKeywords(passage.textEn, passage.keywords)}
            </div>

            {/* Toggle translation */}
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              style={{ ...btnStyle, marginBottom: '0.8rem' }}
            >
              {showTranslation ? 'Hide Translation' : 'Show Translation'}
            </button>

            {showTranslation && (
              <p style={{
                fontSize: '0.82rem', color: '#7a7a6a',
                lineHeight: 1.7, marginBottom: '0.8rem',
                background: 'rgba(255,255,255,0.02)',
                padding: '0.6rem 0.8rem',
                borderRadius: 4,
              }}>
                {passage.textZh}
              </p>
            )}

            {/* Keywords */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.65rem', color: '#4a3a2e', letterSpacing: '0.1em', margin: '0 0 0.3rem' }}>
                KEY VOCABULARY
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {passage.keywords.map((kw) => (
                  <span key={kw.word} style={{
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.5rem',
                    background: 'rgba(138,175,176,0.08)',
                    border: '1px solid rgba(138,175,176,0.15)',
                    borderRadius: 3,
                    color: '#8aafb0',
                  }}>
                    <strong>{kw.word}</strong> — {kw.meaning}
                  </span>
                ))}
              </div>
            </div>

            {/* Comprehension question */}
            <div style={{
              background: 'rgba(197,165,90,0.06)',
              borderLeft: '3px solid #c5a55a',
              borderRadius: '0 4px 4px 0',
              padding: '0.6rem 0.8rem',
              marginBottom: '0.8rem',
            }}>
              <p style={{ fontSize: '0.65rem', color: '#6a5a48', letterSpacing: '0.1em', margin: '0 0 0.3rem' }}>
                COMPREHENSION
              </p>
              <p style={{ fontSize: '0.85rem', color: '#c5a55a', margin: '0 0 0.2rem' }}>
                {passage.question}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6a5a48', margin: '0 0 0.5rem' }}>
                {passage.questionZh}
              </p>
              {showAnswer ? (
                <p style={{ fontSize: '0.82rem', color: '#8aafb0', fontStyle: 'italic', margin: 0 }}>
                  {passage.answer}
                </p>
              ) : (
                <button onClick={() => setShowAnswer(true)} style={btnStyle}>
                  Show Answer
                </button>
              )}
            </div>
          </>
        ) : (
          <p style={{ fontSize: '0.85rem', color: '#4a3a2e', textAlign: 'center', fontStyle: 'italic' }}>
            Collect items to unlock reading passages!
          </p>
        )}
      </div>
    </div>
  );
}

/** Highlight keywords in text by wrapping them in styled spans */
function highlightKeywords(
  text: string,
  keywords: { word: string; meaning: string }[]
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = -1;
    let earliestKw: { word: string; meaning: string } | null = null;
    let earliestIdx = remaining.length;

    for (const kw of keywords) {
      const idx = remaining.toLowerCase().indexOf(kw.word.toLowerCase());
      if (idx !== -1 && idx < earliestIdx) {
        earliestIdx = idx;
        earliestKw = kw;
        earliest = idx;
      }
    }

    if (earliest === -1 || !earliestKw) {
      parts.push(remaining);
      break;
    }

    if (earliest > 0) {
      parts.push(remaining.slice(0, earliest));
    }

    const matched = remaining.slice(earliest, earliest + earliestKw.word.length);
    parts.push(
      <span
        key={key++}
        title={earliestKw.meaning}
        style={{
          color: '#8aafb0',
          borderBottom: '1px dotted rgba(138,175,176,0.4)',
          cursor: 'help',
        }}
      >
        {matched}
      </span>
    );

    remaining = remaining.slice(earliest + earliestKw.word.length);
  }

  return parts;
}
