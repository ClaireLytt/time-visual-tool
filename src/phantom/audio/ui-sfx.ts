/**
 * UI sound effects — lightweight audio feedback for learning interactions.
 * Uses Web Audio API oscillator tones (no external files needed).
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Correct answer — ascending two-note chime */
export function playCorrect() {
  playTone(523.25, 0.15, 'sine', 0.12); // C5
  setTimeout(() => playTone(659.25, 0.2, 'sine', 0.12), 120); // E5
}

/** Wrong answer — low buzz */
export function playWrong() {
  playTone(220, 0.25, 'triangle', 0.1); // A3
}

/** Button click — subtle tick */
export function playClick() {
  playTone(800, 0.05, 'sine', 0.06);
}

/** Achievement unlocked — triumphant arpeggio */
export function playAchievement() {
  playTone(523.25, 0.15, 'sine', 0.1); // C5
  setTimeout(() => playTone(659.25, 0.15, 'sine', 0.1), 100); // E5
  setTimeout(() => playTone(783.99, 0.15, 'sine', 0.1), 200); // G5
  setTimeout(() => playTone(1046.5, 0.3, 'sine', 0.12), 300); // C6
}

/** Collect phrase — soft bell */
export function playPhrase() {
  playTone(880, 0.3, 'sine', 0.08); // A5
}
