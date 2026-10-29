/**
 * Sound effects — one-shot sounds triggered by game events.
 * All synthesized via Tone.js (no audio files needed).
 */
import * as Tone from 'tone';

let reverb: Tone.Reverb | undefined;
let initialized = false;

async function ensureInit() {
  if (initialized) return;
  await Tone.start();
  reverb = new Tone.Reverb({ decay: 3, wet: 0.3 }).toDestination();
  initialized = true;
}

/** Item pickup — bright ascending chime */
export async function playPickup() {
  await ensureInit();
  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.5 },
    volume: -10,
  }).connect(reverb!);
  synth.triggerAttackRelease('E5', '8n');
  setTimeout(() => synth.triggerAttackRelease('G5', '8n'), 120);
  setTimeout(() => synth.triggerAttackRelease('B5', '8n'), 240);
  setTimeout(() => synth.dispose(), 2000);
}

/** Footstep on stone/marble */
export async function playFootstep() {
  await ensureInit();
  const noise = new Tone.NoiseSynth({
    volume: -25,
    noise: { type: 'brown' },
    envelope: { attack: 0.005, decay: 0.08, sustain: 0, release: 0.05 },
  }).toDestination();
  noise.triggerAttackRelease('32n');
  setTimeout(() => noise.dispose(), 500);
}

/** Water drip */
export async function playDrip() {
  await ensureInit();
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.3 },
    volume: -22,
  }).connect(reverb!);
  const pitch = 800 + Math.random() * 400;
  synth.triggerAttackRelease(pitch, '32n');
  setTimeout(() => synth.dispose(), 1000);
}

/** Chandelier crash — dramatic impact */
export async function playCrash() {
  await ensureInit();
  // Metal impact
  const metal = new Tone.MetalSynth({
    volume: -6,
    envelope: { attack: 0.001, decay: 1.5, release: 0.8 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  }).connect(reverb!);
  metal.triggerAttackRelease('16n', Tone.now());
  // Low boom
  const boom = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 2, sustain: 0, release: 1 },
    volume: -4,
  }).toDestination();
  boom.triggerAttackRelease('C1', '2n');
  // Crystal shatter (noise burst)
  const shatter = new Tone.NoiseSynth({
    volume: -8,
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.5, sustain: 0.1, release: 0.8 },
  }).connect(reverb!);
  shatter.triggerAttackRelease('4n');
  setTimeout(() => { metal.dispose(); boom.dispose(); shatter.dispose(); }, 5000);
}

/** Phantom whisper — eerie breathy sound */
export async function playWhisper() {
  await ensureInit();
  const filter = new Tone.Filter(800, 'lowpass').connect(reverb!);
  const noise = new Tone.NoiseSynth({
    volume: -20,
    noise: { type: 'pink' },
    envelope: { attack: 0.5, decay: 0.3, sustain: 0.2, release: 1.5 },
  }).connect(filter);
  noise.triggerAttackRelease('1n');
  setTimeout(() => { noise.dispose(); filter.dispose(); }, 4000);
}

/** Lightning thunder */
export async function playThunder() {
  await ensureInit();
  const noise = new Tone.NoiseSynth({
    volume: -6,
    noise: { type: 'brown' },
    envelope: { attack: 0.01, decay: 1.5, sustain: 0.2, release: 2 },
  }).connect(reverb!);
  noise.triggerAttackRelease('2n');
  setTimeout(() => noise.dispose(), 5000);
}

/** Phantom laugh — low reverberant */
export async function playLaugh() {
  await ensureInit();
  const synth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 1 },
    volume: -12,
  }).connect(reverb!);
  const notes = ['E3', 'G3', 'E3', 'C3', 'E3'];
  notes.forEach((n, i) => {
    setTimeout(() => synth.triggerAttackRelease(n, '8n'), i * 180);
  });
  setTimeout(() => synth.dispose(), 3000);
}

/** Door creak */
export async function playCreak() {
  await ensureInit();
  const filter = new Tone.Filter(400, 'bandpass', -12).connect(reverb!);
  const noise = new Tone.NoiseSynth({
    volume: -18,
    noise: { type: 'pink' },
    envelope: { attack: 0.3, decay: 0.5, sustain: 0.3, release: 0.8 },
  }).connect(filter);
  noise.triggerAttackRelease('2n');
  setTimeout(() => { noise.dispose(); filter.dispose(); }, 3000);
}
