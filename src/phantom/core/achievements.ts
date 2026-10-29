/**
 * Achievement system — badges earned through gameplay and English learning.
 */

export interface Achievement {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  icon: string;
  /** Condition to unlock */
  condition: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  collectiblesFound: number;
  challengesCompleted: number;
  challengesPassed: number;
  totalScore: number;
  actsCompleted: number;
  dialoguesWatched: number;
  vocabLearned: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── Collectible achievements ──
  {
    id: 'first-clue',
    name: 'First Clue',
    nameZh: '第一条线索',
    description: 'Find your first collectible',
    icon: '🔍',
    condition: (s) => s.collectiblesFound >= 1,
  },
  {
    id: 'detective',
    name: 'Detective',
    nameZh: '侦探',
    description: 'Find 5 collectibles',
    icon: '🕵️',
    condition: (s) => s.collectiblesFound >= 5,
  },
  {
    id: 'archivist',
    name: 'Archivist',
    nameZh: '档案员',
    description: 'Find 10 collectibles',
    icon: '📚',
    condition: (s) => s.collectiblesFound >= 10,
  },
  {
    id: 'completionist',
    name: 'Completionist',
    nameZh: '全收集',
    description: 'Find all 15 collectibles',
    icon: '🏆',
    condition: (s) => s.collectiblesFound >= 15,
  },

  // ── English learning achievements ──
  {
    id: 'first-word',
    name: 'First Word',
    nameZh: '第一个单词',
    description: 'Complete your first English challenge',
    icon: '🌟',
    condition: (s) => s.challengesCompleted >= 1,
  },
  {
    id: 'linguist',
    name: 'Linguist',
    nameZh: '语言学家',
    description: 'Complete 6 English challenges',
    icon: '📝',
    condition: (s) => s.challengesCompleted >= 6,
  },
  {
    id: 'polyglot',
    name: 'Polyglot',
    nameZh: '多语达人',
    description: 'Complete all 12 English challenges',
    icon: '🌍',
    condition: (s) => s.challengesCompleted >= 12,
  },
  {
    id: 'perfect-score',
    name: 'Perfect Scholar',
    nameZh: '满分学者',
    description: 'Pass all challenges on first try (score 120+)',
    icon: '👑',
    condition: (s) => s.totalScore >= 120,
  },
  {
    id: 'vocabulary-50',
    name: 'Word Collector',
    nameZh: '单词收藏家',
    description: 'Learn 20+ vocabulary words',
    icon: '📖',
    condition: (s) => s.vocabLearned >= 20,
  },

  // ── Story achievements ──
  {
    id: 'act1-clear',
    name: 'Think of Me',
    nameZh: '想起我',
    description: 'Complete Act 1',
    icon: '🎭',
    condition: (s) => s.actsCompleted >= 1,
  },
  {
    id: 'act3-clear',
    name: 'Music of the Night',
    nameZh: '夜之音乐',
    description: 'Reach Act 3',
    icon: '🎹',
    condition: (s) => s.actsCompleted >= 3,
  },
  {
    id: 'act5-clear',
    name: 'Point of No Return',
    nameZh: '不归之点',
    description: 'Finish the game',
    icon: '🌹',
    condition: (s) => s.actsCompleted >= 5,
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    nameZh: '故事家',
    description: 'Watch 5 dialogue scenes',
    icon: '💬',
    condition: (s) => s.dialoguesWatched >= 5,
  },
];

/** Check which achievements are newly earned */
export function checkNewAchievements(
  stats: AchievementStats,
  alreadyEarned: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !alreadyEarned.includes(a.id) && a.condition(stats)
  );
}
