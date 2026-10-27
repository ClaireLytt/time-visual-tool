/**
 * Adaptive music engine using Tone.js.
 * 5 layers that activate as collectibles are found.
 * Each area has its own organ base variation.
 */
import * as Tone from 'tone';

type AreaKey = string;

// Per-area organ base notes (different mood per location)
const AREA_ORGAN_NOTES: Record<AreaKey, string[]> = {
  // Act 1
  'theater-audience': ['C3', 'E3', 'G3'],       // C major — stately
  'theater-stage':    ['C3', 'E3', 'G3', 'C4'],
  'theater-backstage':['A2', 'C3', 'E3'],        // A minor — darker
  // Act 2
  'dressing-room':    ['F3', 'A3', 'C4'],         // F major — warm
  'spiral-stairs':    ['D3', 'F3', 'A3'],          // D minor — descending
  'underground-tunnel':['D3', 'F3', 'Ab3'],        // Diminished — tense
  'underground-lake': ['Bb2', 'D3', 'F3'],         // Bb major — expansive
  // Act 3
  'lair':             ['A2', 'E3', 'A3'],          // A minor — intimate
  // Act 4
  'rooftop':          ['Eb3', 'G3', 'Bb3'],        // Eb major — romantic
  // Act 5
  'theater-performance':['C3', 'Eb3', 'G3'],      // C minor — dramatic
  'final-lair':       ['F#2', 'A2', 'C3'],         // Tritone — tension
  'epilogue':         ['A2', 'C3', 'E3'],          // A minor — melancholic
};

let initialized = false;
let organSynth: Tone.PolySynth | undefined;
let stringSynth: Tone.PolySynth | undefined;
let harpSynth: Tone.Synth | undefined;
let choirSynth: Tone.PolySynth | undefined;

let organGain: Tone.Gain | undefined;
let stringGain: Tone.Gain | undefined;
let harpGain: Tone.Gain | undefined;
let choirGain: Tone.Gain | undefined;

let organLoop: Tone.Loop | undefined;
let harpLoop: Tone.Loop | undefined;

let currentArea: AreaKey = '';
let activeLayerCount = 1;

// Reverb for cathedral-like space
let reverb: Tone.Reverb | undefined;

export async function initAudio() {
  if (initialized) return;
  await Tone.start();

  reverb = new Tone.Reverb({ decay: 4, wet: 0.4 }).toDestination();

  // Layer 1: Organ drone (always on)
  organGain = new Tone.Gain(0.3).connect(reverb);
  organSynth = new Tone.PolySynth(Tone.FMSynth, {
    volume: -12,
    envelope: { attack: 2, decay: 1, sustain: 0.8, release: 3 },
    modulationIndex: 2,
  }).connect(organGain);

  // Layer 2: Strings (sustained pad)
  stringGain = new Tone.Gain(0).connect(reverb);
  stringSynth = new Tone.PolySynth(Tone.AMSynth, {
    volume: -15,
    envelope: { attack: 3, decay: 2, sustain: 0.7, release: 4 },
  }).connect(stringGain);

  // Layer 3: Harp arpeggios
  harpGain = new Tone.Gain(0).connect(reverb);
  harpSynth = new Tone.Synth({
    volume: -18,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.8, sustain: 0, release: 1.2 },
  }).connect(harpGain);

  // Layer 4: Choir pad
  choirGain = new Tone.Gain(0).connect(reverb);
  choirSynth = new Tone.PolySynth(Tone.Synth, {
    volume: -16,
    oscillator: { type: 'sine' },
    envelope: { attack: 4, decay: 2, sustain: 0.6, release: 5 },
  }).connect(choirGain);

  initialized = true;
}

/** Start the organ drone loop for the current area */
function startOrganLoop(area: AreaKey) {
  if (!organSynth) return;
  const notes = AREA_ORGAN_NOTES[area] || AREA_ORGAN_NOTES['theater-audience'];

  // Stop previous loop
  if (organLoop) {
    organLoop.stop();
    organLoop.dispose();
  }

  organLoop = new Tone.Loop((time) => {
    organSynth?.triggerAttackRelease(notes, '2m', time);
  }, '2m');
  organLoop.start(0);

  if (Tone.getTransport().state !== 'started') {
    Tone.getTransport().start();
  }
}

/** Start harp arpeggio loop */
function startHarpLoop(area: AreaKey) {
  if (!harpSynth) return;
  const baseNotes = AREA_ORGAN_NOTES[area] || ['C4', 'E4', 'G4'];
  // Transpose up an octave for harp
  const harpNotes = baseNotes.map(n => {
    const match = n.match(/^([A-G]#?b?)(\d)$/);
    if (!match) return n;
    return match[1] + (parseInt(match[2]) + 1);
  });

  if (harpLoop) {
    harpLoop.stop();
    harpLoop.dispose();
  }

  let noteIndex = 0;
  harpLoop = new Tone.Loop((time) => {
    const note = harpNotes[noteIndex % harpNotes.length];
    harpSynth?.triggerAttackRelease(note, '8n', time);
    noteIndex++;
  }, '4n');
  harpLoop.start(0);
}

/** Change the active area — crossfade organ to new key */
export function setArea(area: AreaKey) {
  if (area === currentArea || !initialized) return;
  currentArea = area;

  // Crossfade organ
  if (organGain) {
    organGain.gain.rampTo(0, 1.5);
    setTimeout(() => {
      startOrganLoop(area);
      organGain?.gain.rampTo(0.3, 2);
    }, 1500);
  }

  // Update harp if active
  if (activeLayerCount >= 3) {
    startHarpLoop(area);
  }

  // Update strings
  if (activeLayerCount >= 2 && stringSynth) {
    const notes = AREA_ORGAN_NOTES[area] || ['C3', 'E3', 'G3'];
    stringSynth.releaseAll();
    setTimeout(() => {
      stringSynth?.triggerAttack(notes);
    }, 2000);
  }
}

/** Update the number of active music layers based on collectible count */
export function setLayerCount(count: number) {
  if (!initialized) return;
  const newLayers = count >= 5 ? 4 : count >= 3 ? 3 : count >= 1 ? 2 : 1;
  if (newLayers <= activeLayerCount) return;

  // Activate new layer with 4-second fade-in
  if (newLayers >= 2 && activeLayerCount < 2) {
    stringGain?.gain.rampTo(0.25, 4);
    const notes = AREA_ORGAN_NOTES[currentArea] || ['C3', 'E3', 'G3'];
    stringSynth?.triggerAttack(notes);
  }
  if (newLayers >= 3 && activeLayerCount < 3) {
    harpGain?.gain.rampTo(0.2, 4);
    startHarpLoop(currentArea);
  }
  if (newLayers >= 4 && activeLayerCount < 4) {
    choirGain?.gain.rampTo(0.2, 4);
    const notes = AREA_ORGAN_NOTES[currentArea] || ['C3', 'E3', 'G3'];
    choirSynth?.triggerAttack(notes);
  }

  activeLayerCount = newLayers;
}

/** Stop all audio */
export function stopAudio() {
  if (!initialized) return;
  organLoop?.stop();
  harpLoop?.stop();
  organSynth?.releaseAll();
  stringSynth?.releaseAll();
  choirSynth?.releaseAll();
  Tone.getTransport().stop();
}

/** Dispose all audio resources */
export function disposeAudio() {
  stopAudio();
  organSynth?.dispose();
  stringSynth?.dispose();
  harpSynth?.dispose();
  choirSynth?.dispose();
  organGain?.dispose();
  stringGain?.dispose();
  harpGain?.dispose();
  choirGain?.dispose();
  reverb?.dispose();
  organLoop?.dispose();
  harpLoop?.dispose();
  initialized = false;
}
