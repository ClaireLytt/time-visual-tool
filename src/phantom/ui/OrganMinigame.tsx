/**
 * OrganMinigame — play a sequence of organ notes to unlock a secret door.
 * Simon-says style: watch the pattern, then repeat it.
 * Uses Web Audio oscillator tones for each note.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { Z_TOOL } from '../core/z-index';

interface Props {
  open: boolean;
  onComplete: () => void;
  onClose: () => void;
}

const NOTES = [
  { key: 'C', freq: 261.63, label: 'Do', color: '#c5a55a' },
  { key: 'D', freq: 293.66, label: 'Re', color: '#b0a090' },
  { key: 'E', freq: 329.63, label: 'Mi', color: '#8aafb0' },
  { key: 'F', freq: 349.23, label: 'Fa', color: '#9a8a78' },
  { key: 'G', freq: 392.00, label: 'Sol', color: '#a08a6a' },
  { key: 'A', freq: 440.00, label: 'La', color: '#b07070' },
  { key: 'B', freq: 493.88, label: 'Si', color: '#7a9a8a' },
];

// Sequences get progressively harder
const SEQUENCES = [
  [0, 2, 4],          // C E G — simple triad
  [0, 2, 4, 2],       // C E G E — with repeat
  [4, 3, 2, 1, 0],    // G F E D C — descending
  [0, 1, 2, 3, 4, 5, 6], // full scale
  [2, 4, 6, 4, 2, 0],    // Music of the Night motif
];

// English music vocabulary taught per round
const ROUND_VOCAB = [
  { word: 'chord', meaning: '和弦', sentence: 'A chord is three or more notes played together.' },
  { word: 'scale', meaning: '音阶', sentence: 'A musical scale is a sequence of notes in order.' },
  { word: 'descending', meaning: '下行的', sentence: 'The melody moves in a descending pattern.' },
  { word: 'octave', meaning: '八度音程', sentence: 'An octave spans eight notes from C to C.' },
  { word: 'motif', meaning: '动机/主题', sentence: 'The Phantom\'s motif echoes throughout the opera.' },
];

let audioCtx: AudioContext | null = null;
function playNote(freq: number, duration = 0.4) {
  if (!audioCtx) { try { audioCtx = new AudioContext(); } catch { return; } }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.value = 0.2;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duration);
}

function playWrongBuzz() {
  if (!audioCtx) { try { audioCtx = new AudioContext(); } catch { return; } }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 110;
  gain.gain.value = 0.12;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.3);
}

type Phase = 'ready' | 'showing' | 'input' | 'success' | 'fail' | 'complete';

export default function OrganMinigame({ open, onComplete, onClose }: Props) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [showVocab, setShowVocab] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sequence = SEQUENCES[round] || SEQUENCES[SEQUENCES.length - 1];
  const vocab = ROUND_VOCAB[round] || ROUND_VOCAB[ROUND_VOCAB.length - 1];

  // Play the sequence for the player to watch
  const playSequence = useCallback(() => {
    setPhase('showing');
    setPlayerInput([]);
    let i = 0;
    const play = () => {
      if (i < sequence.length) {
        setHighlightIdx(sequence[i]);
        playNote(NOTES[sequence[i]].freq);
        timerRef.current = setTimeout(() => {
          setHighlightIdx(-1);
          i++;
          timerRef.current = setTimeout(play, 200);
        }, 500);
      } else {
        setPhase('input');
      }
    };
    timerRef.current = setTimeout(play, 500);
  }, [sequence]);

  // Handle player pressing a key
  const pressKey = useCallback((noteIdx: number) => {
    if (phase !== 'input') return;
    playNote(NOTES[noteIdx].freq, 0.3);
    setHighlightIdx(noteIdx);
    setTimeout(() => setHighlightIdx(-1), 200);

    const next = [...playerInput, noteIdx];
    setPlayerInput(next);

    // Check against sequence
    const pos = next.length - 1;
    if (next[pos] !== sequence[pos]) {
      playWrongBuzz();
      setPhase('fail');
      return;
    }
    if (next.length === sequence.length) {
      // Round complete!
      setPhase('success');
      setShowVocab(true);
    }
  }, [phase, playerInput, sequence]);

  const nextRound = useCallback(() => {
    setShowVocab(false);
    if (round >= SEQUENCES.length - 1) {
      setPhase('complete');
      onComplete();
    } else {
      setRound((r) => r + 1);
      setPhase('ready');
    }
  }, [round, onComplete]);

  const retry = useCallback(() => {
    setPlayerInput([]);
    setPhase('ready');
  }, []);

  // Cleanup
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: Z_TOOL,
      background: 'rgba(10,9,8,0.95)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif',
    }}>
      <p style={{ fontSize: '0.7rem', color: '#6a5a48', letterSpacing: '0.15em', margin: '0 0 0.3rem' }}>
        ORGAN PUZZLE
      </p>
      <p style={{ fontSize: '0.72rem', color: '#4a3a2e', margin: '0 0 0.8rem' }}>
        Round {round + 1}/{SEQUENCES.length} &middot; {sequence.length} notes
      </p>

      {phase === 'complete' ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{'🎹'}</p>
          <p style={{ fontSize: '1.1rem', color: '#c5a55a', margin: '0 0 0.5rem' }}>
            The door opens!
          </p>
          <p style={{ fontSize: '0.85rem', color: '#9a8a78', margin: '0 0 1rem' }}>
            You played the Phantom&apos;s melody perfectly.
          </p>
          <button onClick={onClose} style={btnStyle}>
            Continue
          </button>
        </div>
      ) : (
        <>
          {/* Organ keys */}
          <div style={{
            display: 'flex', gap: '0.3rem',
            marginBottom: '1rem',
          }}>
            {NOTES.map((note, i) => {
              const isHighlight = highlightIdx === i;
              return (
                <button
                  key={note.key}
                  onClick={() => pressKey(i)}
                  disabled={phase !== 'input'}
                  style={{
                    width: 50, height: 120,
                    background: isHighlight
                      ? `linear-gradient(to top, ${note.color}, ${note.color}88)`
                      : 'linear-gradient(to top, #2a2420, #1a1816)',
                    border: `1px solid ${isHighlight ? note.color : '#3a3228'}`,
                    borderRadius: '0 0 6px 6px',
                    cursor: phase === 'input' ? 'pointer' : 'default',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'flex-end',
                    padding: '0.5rem 0',
                    transition: 'background 0.15s',
                    boxShadow: isHighlight ? `0 0 20px ${note.color}40` : 'none',
                  }}
                >
                  <span style={{
                    fontSize: '0.7rem',
                    color: isHighlight ? '#0a0908' : '#6a5a48',
                    fontWeight: 'bold',
                  }}>
                    {note.key}
                  </span>
                  <span style={{
                    fontSize: '0.55rem',
                    color: isHighlight ? '#0a0908' : '#3a3228',
                  }}>
                    {note.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.8rem' }}>
            {sequence.map((_, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < playerInput.length
                  ? (playerInput[i] === sequence[i] ? '#8aafb0' : '#c87a6a')
                  : '#2a2420',
                border: '1px solid #3a3228',
              }} />
            ))}
          </div>

          {/* Phase messages */}
          {phase === 'ready' && (
            <button onClick={playSequence} style={btnStyle}>
              {'🎵'} Play Sequence
            </button>
          )}
          {phase === 'showing' && (
            <p style={{ fontSize: '0.85rem', color: '#c5a55a' }}>Watch and listen...</p>
          )}
          {phase === 'input' && (
            <p style={{ fontSize: '0.85rem', color: '#8aafb0' }}>
              Your turn! ({playerInput.length}/{sequence.length})
            </p>
          )}
          {phase === 'fail' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: '#c87a6a', margin: '0 0 0.5rem' }}>
                Wrong note! Try again.
              </p>
              <button onClick={retry} style={btnStyle}>Retry</button>
            </div>
          )}
          {phase === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', color: '#c5a55a', margin: '0 0 0.5rem' }}>
                {'✨'} Perfect!
              </p>
              {showVocab && (
                <div style={{
                  background: 'rgba(138,175,176,0.08)',
                  borderLeft: '3px solid #8aafb0',
                  borderRadius: '0 4px 4px 0',
                  padding: '0.5rem 0.8rem',
                  margin: '0 0 0.8rem',
                  textAlign: 'left',
                  maxWidth: 350,
                }}>
                  <p style={{ fontSize: '0.65rem', color: '#5a6a6a', letterSpacing: '0.1em', margin: '0 0 0.2rem' }}>
                    MUSIC VOCABULARY
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#8aafb0', margin: '0 0 0.2rem' }}>
                    <strong>{vocab.word}</strong> = {vocab.meaning}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6a5a48', fontStyle: 'italic', margin: 0 }}>
                    {vocab.sentence}
                  </p>
                </div>
              )}
              <button onClick={nextRound} style={btnStyle}>
                {round >= SEQUENCES.length - 1 ? 'Finish' : 'Next Round →'}
              </button>
            </div>
          )}

          <button onClick={onClose} style={{
            ...btnStyle, color: '#3a3228', borderColor: '#2a2420', marginTop: '0.8rem',
          }}>
            Close
          </button>
        </>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '0.85rem',
  padding: '0.5rem 1.5rem',
  background: 'transparent',
  border: '1px solid #3a3228',
  color: '#c5a55a',
  borderRadius: 4,
  cursor: 'pointer',
};
