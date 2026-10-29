export interface Achievement {
  id: string
  icon: string
  titleZh: string
  titleEn: string
  descZh: string
  descEn: string
  check: (stats: AchievementStats) => boolean
}

export interface AchievementStats {
  roomsVisited: string[]
  favorites: string[]
  notesWritten: number
  quizCorrect: number
  paintingsViewed: string[]
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'wanderer',
    icon: '🚶',
    titleZh: '漫步者', titleEn: 'Wanderer',
    descZh: '浏览全部5个展厅', descEn: 'Visit all 5 rooms',
    check: (s) => s.roomsVisited.length >= 5,
  },
  {
    id: 'collector',
    icon: '⭐',
    titleZh: '收藏家', titleEn: 'Collector',
    descZh: '收藏5幅画作', descEn: 'Favorite 5 paintings',
    check: (s) => s.favorites.length >= 5,
  },
  {
    id: 'critic',
    icon: '✏️',
    titleZh: '评论家', titleEn: 'Critic',
    descZh: '写3条画作笔记', descEn: 'Write 3 painting notes',
    check: (s) => s.notesWritten >= 3,
  },
  {
    id: 'connoisseur',
    icon: '🎓',
    titleZh: '鉴赏家', titleEn: 'Connoisseur',
    descZh: '查看全部15幅画作详情', descEn: 'View all 15 painting details',
    check: (s) => s.paintingsViewed.length >= 15,
  },
  {
    id: 'quizmaster',
    icon: '🎯',
    titleZh: '答题王', titleEn: 'Quiz Master',
    descZh: '猜画连续答对5题', descEn: 'Get 5 quiz answers right',
    check: (s) => s.quizCorrect >= 5,
  },
  {
    id: 'devoted',
    icon: '💎',
    titleZh: '艺术痴迷者', titleEn: 'Art Devotee',
    descZh: '解锁全部成就', descEn: 'Unlock all other achievements',
    check: (s) => {
      const others = ACHIEVEMENTS.filter(a => a.id !== 'devoted')
      return others.every(a => a.check(s))
    },
  },
]
