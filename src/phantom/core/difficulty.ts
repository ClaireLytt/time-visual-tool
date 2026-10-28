/**
 * Difficulty settings — affects challenge behavior across all learning tools.
 * Persisted in localStorage.
 */

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  /** Challenge: number of attempts before showing answer */
  maxAttempts: number;
  /** Challenge: show hints immediately? */
  showHintsEarly: boolean;
  /** Word scramble: time limit in seconds */
  scrambleTime: number;
  /** Review quiz: time limit in seconds */
  quizTime: number;
  /** Sentence builder: show word count hint? */
  showWordCount: boolean;
  /** Listening dictation: allow slow speed? */
  allowSlowSpeed: boolean;
  /** Memory match: grid size (pairs) */
  memoryPairs: number;
  /** Label for UI */
  label: string;
  labelZh: string;
  icon: string;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    maxAttempts: 5,
    showHintsEarly: true,
    scrambleTime: 45,
    quizTime: 90,
    showWordCount: true,
    allowSlowSpeed: true,
    memoryPairs: 4,
    label: 'Easy',
    labelZh: '简单',
    icon: '🌟',
  },
  normal: {
    maxAttempts: 3,
    showHintsEarly: false,
    scrambleTime: 30,
    quizTime: 60,
    showWordCount: true,
    allowSlowSpeed: true,
    memoryPairs: 6,
    label: 'Normal',
    labelZh: '普通',
    icon: '⭐',
  },
  hard: {
    maxAttempts: 2,
    showHintsEarly: false,
    scrambleTime: 20,
    quizTime: 40,
    showWordCount: false,
    allowSlowSpeed: false,
    memoryPairs: 8,
    label: 'Hard',
    labelZh: '困难',
    icon: '🔥',
  },
};

const SAVE_KEY = 'phantom-difficulty';

export function getDifficulty(): Difficulty {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw && (raw === 'easy' || raw === 'normal' || raw === 'hard')) return raw;
  } catch { /* ignore */ }
  return 'normal';
}

export function setDifficulty(d: Difficulty) {
  try { localStorage.setItem(SAVE_KEY, d); } catch { /* ignore */ }
}

export function getConfig(): DifficultyConfig {
  return DIFFICULTY_CONFIGS[getDifficulty()];
}
