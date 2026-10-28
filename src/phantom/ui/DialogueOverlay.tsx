/**
 * DialogueOverlay — cinematic dialogue scenes with typewriter effect.
 * Shows character portraits, dialogue lines with optional English translations.
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
  const [lineIdx, setLineIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const line = scene.lines[lineIdx];
  const isLast = lineIdx >= scene.lines.length - 1;

  // Typewriter effect
  useEffect(() => {
    if (!line) return;
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const text = line.text;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 35);
    timerRef.current = interval as unknown as ReturnType<typeof setTimeout>;
    return () => clearInterval(interval);
  }, [lineIdx, line]);

  const advance = useCallback(() => {
    if (isTyping) {
      // Skip to full text
      if (timerRef.current) clearInterval(timerRef.current as unknown as ReturnType<typeof setInterval>);
      setDisplayedText(line.text);
      setIsTyping(false);
      return;
    }
    if (isLast) {
      onComplete();
    } else {
      setLineIdx((i) => i + 1);
    }
  }, [isTyping, isLast, onComplete, line]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [advance]);

  if (!line) return null;

  const speakerColor = SPEAKER_COLORS[line.speaker] || '#9a8a78';
  const isNarrator = line.speaker === 'Narrator';

  return (
    <div
      onClick={advance}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,9,8,0.85)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 120,
        cursor: 'pointer',
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
          {isTyping && <span style={{ animation: 'dlgBlink 0.5s infinite' }}>▌</span>}
        </p>

        {/* English translation (shown after typing completes) */}
        {!isTyping && line.textEn && (
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

        {/* Progress and hint */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: '0.8rem',
        }}>
          <span style={{ fontSize: '0.65rem', color: '#4a3a2e' }}>
            {lineIdx + 1} / {scene.lines.length}
          </span>
          <span style={{ fontSize: '0.65rem', color: '#4a3a2e' }}>
            {isTyping ? 'Click to skip' : (isLast ? 'Click to continue' : 'Click for next')}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes dlgFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes dlgBlink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
      `}</style>
    </div>
  );
}
