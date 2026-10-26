import { Area, Collectible, CharacterConfig, MusicLayer, StoryEvent } from './types';

// ── Act 1: Think of Me ──

export const ACT1_AREAS: Area[] = [
  {
    id: 'theater-audience',
    actId: 1,
    name: '观众席',
    background: '/phantom/assets/backgrounds/act1-theater.png',
    width: 2048,
    hotspots: [
      {
        id: 'memo-seat',
        x: 350, y: 420,
        width: 60, height: 40,
        type: 'collectible',
        label: '座椅上的备忘录',
        collectibleId: 'act1-memo',
      },
      {
        id: 'box5',
        x: 1680, y: 180,
        width: 100, height: 120,
        type: 'collectible',
        label: '五号包厢',
        collectibleId: 'act1-note',
      },
      {
        id: 'to-stage',
        x: 900, y: 300,
        width: 200, height: 250,
        type: 'passage',
        label: '走向舞台',
        targetArea: 'theater-stage',
      },
    ],
    exitRight: 'theater-backstage',
  },
  {
    id: 'theater-stage',
    actId: 1,
    name: '舞台',
    background: '/phantom/assets/backgrounds/act1-stage.png',
    width: 2048,
    hotspots: [
      {
        id: 'rope',
        x: 780, y: 120,
        width: 50, height: 80,
        type: 'collectible',
        label: '被砍断的绳索',
        collectibleId: 'act1-rope',
      },
      {
        id: 'christine-spot',
        x: 1000, y: 380,
        width: 120, height: 160,
        type: 'trigger',
        label: '克里斯汀',
        triggerKey: 'think-of-me-start',
      },
      {
        id: 'to-audience',
        x: 1000, y: 550,
        width: 200, height: 60,
        type: 'passage',
        label: '回到观众席',
        targetArea: 'theater-audience',
      },
    ],
  },
  {
    id: 'theater-backstage',
    actId: 1,
    name: '后台通道',
    background: '/phantom/assets/backgrounds/act1-backstage.png',
    width: 1536,
    hotspots: [
      {
        id: 'mirror-door',
        x: 1200, y: 280,
        width: 100, height: 200,
        type: 'trigger',
        label: '化妆间的镜子',
        triggerKey: 'act1-end',
      },
    ],
    exitLeft: 'theater-audience',
  },
];

export const ACT1_COLLECTIBLES: Collectible[] = [
  {
    id: 'act1-rope',
    actId: 1,
    name: '被砍断的绳索',
    description: '舞台上方坠落布景板的绳索——被利刃割断，不是自然磨损。',
    contentZh: '这根绳索被一把极其锋利的刀整齐切断。切面光滑，没有任何磨损或撕裂的痕迹。这不是意外——是有人故意为之。',
    contentEn: 'The rope was severed cleanly, not frayed. The cut is smooth, without any sign of wear or tearing. This was no accident — it was deliberate.',
    areaId: 'theater-stage',
  },
  {
    id: 'act1-memo',
    actId: 1,
    name: '经理的备忘录',
    description: '前排座椅上遗留的一张纸条，写着关于五号包厢的指示。',
    contentZh: '"五号包厢绝不可出售给任何人。这是命令。"\n——署名：O.G.\n\n纸张的边缘有火漆封印的痕迹，印章图案是一个骷髅。',
    contentEn: '"Box Five is to remain empty at ALL times. This is not a request."\n— Signed: O.G.\n\nThe edge of the paper bears the trace of a wax seal — a skull.',
    areaId: 'theater-audience',
  },
  {
    id: 'act1-note',
    actId: 1,
    name: '魅影的纸条',
    description: '五号包厢椅背后发现的纸条，笔迹优雅但力道极重。',
    contentZh: '"她已经准备好了。音乐天使已经开口。"\n\n笔迹优雅流畅，但每一笔都深深刻入纸面，仿佛写下这些字的人用尽了全部力量。',
    contentEn: '"She is ready. The Angel of Music has spoken."\n\nThe handwriting is elegant and flowing, yet each stroke cuts deep into the paper, as though the writer poured all their strength into every word.',
    areaId: 'theater-audience',
  },
];

export const CHARACTERS: Record<string, CharacterConfig> = {
  phantom: {
    id: 'phantom',
    name: '魅影',
    color: [100, 100, 140],
    particleCount: 600,
    spread: 0.04,
  },
  christine: {
    id: 'christine',
    name: '克里斯汀',
    color: [197, 165, 90],
    particleCount: 800,
    spread: 0.03,
  },
  raoul: {
    id: 'raoul',
    name: '拉乌尔',
    color: [139, 175, 196],
    particleCount: 500,
    spread: 0.028,
  },
  carlotta: {
    id: 'carlotta',
    name: '卡洛塔',
    color: [180, 80, 80],
    particleCount: 500,
    spread: 0.035,
  },
};

export const MUSIC_LAYERS: MusicLayer[] = [
  { id: 1, instrument: 'organ', threshold: 0, active: true },
  { id: 2, instrument: 'strings', threshold: 1, active: false },
  { id: 3, instrument: 'harp', threshold: 2, active: false },
  { id: 4, instrument: 'choir', threshold: 3, active: false },
  { id: 5, instrument: 'full-orchestra', threshold: -1, active: false }, // climax only
];

export const ACT1_EVENTS: StoryEvent[] = [
  {
    id: 'evt-backdrop-fall',
    actId: 1,
    conditions: { areaId: 'theater-stage' },
    action: 'animation',
    payload: { animation: 'backdrop-fall', delay: 2000 },
  },
  {
    id: 'evt-think-of-me',
    actId: 1,
    conditions: { triggerKey: 'think-of-me-start' },
    action: 'music_change',
    payload: { track: 'think-of-me', fadeIn: 3000 },
  },
  {
    id: 'evt-ghost-audience',
    actId: 1,
    conditions: { triggerKey: 'think-of-me-start' },
    action: 'animation',
    payload: { animation: 'ghost-audience-appear', delay: 8000 },
  },
  {
    id: 'evt-phantom-box5',
    actId: 1,
    conditions: { triggerKey: 'think-of-me-start' },
    action: 'animation',
    payload: { animation: 'phantom-silhouette-box5', delay: 15000 },
  },
  {
    id: 'evt-act1-end',
    actId: 1,
    conditions: { triggerKey: 'act1-end', collectiblesFound: 3 },
    action: 'transition',
    payload: { nextAct: 2, transition: 'mirror-portal' },
  },
];

export const PHANTOM_TIER_THRESHOLDS: Record<number, string> = {
  0: 'ambient',
  1: 'stirring',
  2: 'stirring',
  3: 'watching',
  4: 'watching',
  5: 'stalking',
  6: 'stalking',
};
