import { create } from 'zustand';
import { ActId, GameState, PhantomTier } from './types';
import { PHANTOM_TIER_THRESHOLDS } from './constants';

interface GameActions {
  /** Move camera to x position */
  setCameraX: (x: number) => void;
  /** Collect an item */
  collectItem: (itemId: string) => void;
  /** Mark a story event as triggered */
  triggerEvent: (eventId: string) => void;
  /** Change current area */
  setArea: (areaId: string) => void;
  /** Advance to next act */
  setAct: (act: ActId) => void;
  /** Pause / resume */
  togglePause: () => void;
  /** Start the game */
  startGame: () => void;
  /** Reset to initial state */
  resetGame: () => void;
  /** Save to localStorage */
  saveGame: () => void;
  /** Load from localStorage */
  loadGame: () => boolean;
}

const SAVE_KEY = 'phantom-save';

const initialState: GameState = {
  currentAct: 1,
  currentArea: 'theater-audience',
  cameraX: 0,
  collectedItems: [],
  triggeredEvents: [],
  phantomTier: 'ambient',
  musicLayers: 1,
  isPlaying: false,
  isPaused: false,
};

function computeTier(count: number): PhantomTier {
  const tier = PHANTOM_TIER_THRESHOLDS[Math.min(count, 6)];
  return (tier as PhantomTier) || 'ambient';
}

function computeMusicLayers(count: number): number {
  if (count >= 5) return 4;
  if (count >= 3) return 3;
  if (count >= 1) return 2;
  return 1;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  setCameraX: (x) => set({ cameraX: x }),

  collectItem: (itemId) => {
    const state = get();
    if (state.collectedItems.includes(itemId)) return;
    const next = [...state.collectedItems, itemId];
    const count = next.length;
    set({
      collectedItems: next,
      phantomTier: computeTier(count),
      musicLayers: computeMusicLayers(count),
    });
  },

  triggerEvent: (eventId) => {
    const state = get();
    if (state.triggeredEvents.includes(eventId)) return;
    set({ triggeredEvents: [...state.triggeredEvents, eventId] });
  },

  setArea: (areaId) => set({ currentArea: areaId, cameraX: 0 }),

  setAct: (act) => set({ currentAct: act }),

  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),

  startGame: () => set({ isPlaying: true }),

  resetGame: () => set({ ...initialState }),

  saveGame: () => {
    const full = get();
    const state: GameState = {
      currentAct: full.currentAct,
      currentArea: full.currentArea,
      cameraX: full.cameraX,
      collectedItems: full.collectedItems,
      triggeredEvents: full.triggeredEvents,
      phantomTier: full.phantomTier,
      musicLayers: full.musicLayers,
      isPlaying: full.isPlaying,
      isPaused: full.isPaused,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      // localStorage unavailable — silently skip
    }
  },

  loadGame: () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw) as Partial<GameState>;
      if (saved.currentAct !== undefined) {
        set({ ...saved } as GameState);
        return true;
      }
    } catch {
      // corrupted or unavailable
    }
    return false;
  },
}));
