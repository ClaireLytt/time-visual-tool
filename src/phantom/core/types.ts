// ── Domain types for Phantom of the Opera game ──

export type ActId = 1 | 2 | 3 | 4 | 5;

export interface Area {
  id: string;
  actId: ActId;
  name: string;
  /** Background image path (relative to /phantom/assets/) */
  background: string;
  /** Width of the scrollable scene in px */
  width: number;
  /** Interactive hotspots in this area */
  hotspots: Hotspot[];
  /** Passage to next area (null = no exit that direction) */
  exitRight?: string;
  exitLeft?: string;
}

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'collectible' | 'clue' | 'passage' | 'character' | 'trigger';
  label: string;
  /** Collectible ID if type=collectible */
  collectibleId?: string;
  /** Area ID to transition to if type=passage */
  targetArea?: string;
  /** Story trigger key if type=trigger */
  triggerKey?: string;
}

export interface Collectible {
  id: string;
  actId: ActId;
  name: string;
  description: string;
  /** Full document text (Chinese) */
  contentZh: string;
  /** Full document text (English, used by learn module) */
  contentEn?: string;
  /** Area where this item is found */
  areaId: string;
  /** Icon/thumbnail path */
  icon?: string;
}

export type PhantomTier = 'ambient' | 'stirring' | 'watching' | 'stalking' | 'climax';

export interface CharacterConfig {
  id: string;
  name: string;
  color: [number, number, number];
  particleCount: number;
  spread: number;
}

export interface StoryEvent {
  id: string;
  actId: ActId;
  /** Conditions to trigger this event */
  conditions: {
    areaId?: string;
    collectiblesFound?: number;
    triggerKey?: string;
  };
  /** What happens */
  action: 'dialogue' | 'animation' | 'transition' | 'music_change' | 'climax';
  /** Payload depends on action type */
  payload: Record<string, unknown>;
}

export interface GameState {
  currentAct: ActId;
  currentArea: string;
  cameraX: number;
  collectedItems: string[];
  triggeredEvents: string[];
  phantomTier: PhantomTier;
  musicLayers: number;
  isPlaying: boolean;
  isPaused: boolean;
}

export interface MusicLayer {
  id: number;
  instrument: string;
  /** Collectible count threshold to activate */
  threshold: number;
  active: boolean;
}
