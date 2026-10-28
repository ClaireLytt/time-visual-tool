/**
 * DialogueOverlay — cinematic dialogue scenes with typewriter effect.
 * Supports branching choices and bilingual display (CN/EN).
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { DialogueScene, DialogueLine } from '../core/types';

interface Props {
  scene: DialogueScene;
  onComplete: () => void;
}

const SPEAKER_COLORS: Record<string, string> = {
  Phantom: '#9a8a78',
  Christine: '#c5a55a',
  Raoul: '#8aafb0',
  Carlotta: '#b07070',
  'Madame Giry': '#8a8a7a',
  Manager: '#7a8a6a',
  Narrator: '#5a5a50',
};

const MOOD_EMOJI: Record<string, string> = {
  angry: '😠',
  sad: '😢',
  fearful: '😨',
  tender: '💕',
  desperate: '😰',
  triumphant: '👑',
};

export default function DialogueOverlay({ scene, onComplete }: Props) {
  // Flatten lines: start with scene.lines, insert choice responses when picked
  const [allLines, setAllLines] = useState<DialogueLine[]>(scene.lines);
  const [lineIdx, setLineIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const line = allLines[lineIdx];
  const isLast = lineIdx >= allLines.length - 1;

  // Typewriter effect
  useEffect(() => {
    if (!line) return;
    setDisplayedText('');
    setIsTyping(true);
    setShowChoices(false);
    let i = 0;
    const text = line.text;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        // If this line has choices, show them after typing
        if (line.choices && line.choices.length > 0) {
          setShowChoices(true);
        }
      }
    }, 35);
    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [lineIdx, line]);

  const advance = useCallback(() => {
    if (isTyping) {
      // Skip to full text
      if (timerRef.current) clearInterval(timerRef.current);
      if (line) setDisplayedText(line.text);
      setIsTyping(false);
      if (line?.choices && line.choices.length > 0) {
        setShowChoices(true);
      }
      return;
    }
    // Don't advance if showing choices — wait for player to pick one
    if (showChoices) return;

    if (isLast) {
      onComplete();
    } else {
      setLineIdx((i) => i + 1);
    }
  }, [isTyping, isLast, onComplete, line, showChoices]);

  const handleChoice = useCallback((choiceIdx: number) => {
    if (!line?.choices) return;
    const choice = line.choices[choiceIdx];
    // Insert the choice's response lines after the current line
    const before = allLines.slice(0, lineIdx + 1);
    const after = allLines.slice(lineIdx + 1);
    setAllLines([...before, ...choice.response, ...after]);
    setShowChoices(false);
    setLineIdx((i) => i + 1);
  }, [line, lineIdx, allLines]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showChoices) return; // Don't advance via keyboard when choices are shown
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [advance, showChoices]);

  if (!line) return null;

  const speakerColor = SPEAKER_COLORS[line.speaker] || '#9a8a78';
  const isNarrator = line.speaker === 'Narrator';

  return (
    <div
      onClick={showChoices ? undefined : advance}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,9,8,0.85)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 120,
        cursor: showChoices ? 'default' : 'pointer',
        animation: 'dlgFadeIn 0.3s ease-out',
      }}
    >
      {/* Dialogue box */}
      <div style={{
        background: isNarrator
          ? 'linear-gradient(to top, rgba(20,18,16,0.95), rgba(20,18,16,0.6))'
          : 'linear-gradient(to top, rgba(30,26,22,0.97), rgba(30,26,22,0.85))',
        padding: '1.5rem 2rem 2rem',
        minHeight: 140,
        borderTop: `1px solid ${isNarrator ? '#2a2420' : '#3a3228'}`,
      }}>
        {/* Speaker name */}
        {!isNarrator && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 0 0.6rem' }}>
            {line.mood && MOOD_EMOJI[line.mood] && (
              <span style={{ fontSize: '0.9rem' }}>{MOOD_EMOJI[line.mood]}</span>
            )}
            <span style={{
              fontFamily: 'Georgia, serif',
              fontSize: '0.85rem',
              color: speakerColor,
              letterSpacing: '0.08em',
              fontWeight: 'bold',
            }}>
              {line.speaker}
            </span>
          </div>
        )}

        {/* Main text */}
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: isNarrator ? '0.88rem' : '1rem',
          color: isNarrator ? '#6a6a60' : '#e0d8cc',
          fontStyle: isNarrator ? 'italic' : 'normal',
          lineHeight: 1.8,
          margin: 0,
          minHeight: '2em',
        }}>
          {displayedText}
          {isTyping && <span style={{ animation: 'dlgBlink 0.5s infinite' }}>{'▌'}</span>}
        </p>

        {/* English translation (shown after typing completes) */}
        {!isTyping && line.textEn && !showChoices && (
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '0.78rem',
            color: '#7a7a6a',
            margin: '0.5rem 0 0',
            fontStyle: 'italic',
            animation: 'dlgFadeIn 0.3s ease-out',
          }}>
            EN: {line.textEn}
          </p>
        )}

        {/* Choices */}
        {showChoices && line.choices && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            marginTop: '0.8rem',
            animation: 'dlgFadeIn 0.4s ease-out',
          }}>
            {line.choices.map((choice, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); handleChoice(i); }}
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.85rem',
                  padding: '0.6rem 1rem',
                  background: 'rgba(197,165,90,0.06)',
                  border: '1px solid rgba(197,165,90,0.2)',
                  borderRadius: 6,
                  color: '#c5a55a',
                  cursor: 'pointer',
                  textAlign: 'left',
                  lineHeight: 1.5,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(197,165,90,0.12)';
                  (e.target as HTMLElement).style.borderColor = 'rgba(197,165,90,0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(197,165,90,0.06)';
                  (e.target as HTMLElement).style.borderColor = 'rgba(197,165,90,0.2)';
                }}
              >
                {choice.label}
                <span style={{
                  display: 'block',
                  fontSize: '0.7rem',
                  color: '#6a5a48',
                  fontStyle: 'italic',
                  marginTop: '0.15rem',
                }}>
                  {choice.labelEn}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Progress and hint */}
        {!showChoices && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: '0.8rem',
          }}>
            <span style={{ fontSize: '0.65rem', color: '#4a3a2e' }}>
              {lineIdx + 1} / {allLines.length}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#4a3a2e' }}>
              {isTyping ? 'Click to skip' : (isLast ? 'Click to continue' : 'Click for next')}
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dlgFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes dlgBlink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
      `}</style>
    </div>
  );
}
