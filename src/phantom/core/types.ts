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
  /** Related collectible IDs for cross-reference */
  relatedIds?: string[];
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

// ── English Learning System ──

export interface EnglishVocab {
  word: string;
  phonetic: string;
  meaning: string;
  /** Example sentence from the opera context */
  example: string;
  exampleZh: string;
  /** Word origin/etymology (optional) */
  etymology?: string;
}

export type ChallengeType = 'translate' | 'fill-blank' | 'match';

export interface EnglishChallenge {
  id: string;
  /** Which collectible or trigger activates this */
  triggerId: string;
  /** Opera quote in English */
  quote: string;
  quoteZh: string;
  /** Source context */
  source: string;
  /** Challenge type */
  type: ChallengeType;
  /** Vocabulary words to learn */
  vocab: EnglishVocab[];
  /** The challenge question */
  question: string;
  /** Correct answer(s) */
  answers: string[];
  /** Hint shown after first wrong attempt */
  hint: string;
  /** Optional grammar note */
  grammarNote?: string;
  grammarNoteZh?: string;
}

export interface LearningProgress {
  completedChallenges: string[];
  vocabReviewed: Record<string, number>;
  totalScore: number;
  /** Environment phrase IDs the player has seen */
  phrasesCollected: string[];
}

// ── Dialogue System ──

export interface DialogueChoice {
  label: string;
  labelEn: string;
  /** Lines to show after this choice */
  response: DialogueLine[];
  /** Optional: different challenge if this choice is picked */
  challengeId?: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  textEn?: string;
  mood?: 'neutral' | 'angry' | 'sad' | 'fearful' | 'tender' | 'desperate' | 'triumphant';
  /** If set, show choices instead of advancing to next line */
  choices?: DialogueChoice[];
}

export interface DialogueScene {
  id: string;
  actId: ActId;
  triggerKey: string;
  lines: DialogueLine[];
  challengeId?: string;
}
