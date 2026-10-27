import { Area, Collectible, CharacterConfig, MusicLayer } from './types';

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
    areaId: 'theater-stage',
  },
  {
    id: 'act1-memo',
    actId: 1,
    name: '经理的备忘录',
    description: '前排座椅上遗留的一张纸条，写着关于五号包厢的指示。',
    contentZh: '"五号包厢绝不可出售给任何人。这是命令。"\n——署名：O.G.\n\n纸张的边缘有火漆封印的痕迹，印章图案是一个骷髅。',
    areaId: 'theater-audience',
  },
  {
    id: 'act1-note',
    actId: 1,
    name: '魅影的纸条',
    description: '五号包厢椅背后发现的纸条，笔迹优雅但力道极重。',
    contentZh: '"她已经准备好了。音乐天使已经开口。"\n\n笔迹优雅流畅，但每一笔都深深刻入纸面，仿佛写下这些字的人用尽了全部力量。',
    areaId: 'theater-audience',
  },
];

export const CHARACTERS: Record<string, CharacterConfig> = {
  phantom: {
    id: 'phantom',
    name: '魅影',
    color: [60, 58, 55],  // desaturated dark smoke — avoids banned hue 235-265
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

// ── Act 2: The Phantom of the Opera ──

export const ACT2_AREAS: Area[] = [
  {
    id: 'dressing-room',
    actId: 2,
    name: '化妆间',
    background: '/phantom/assets/backgrounds/act2-dressing.png',
    width: 1536,
    hotspots: [
      {
        id: 'raoul-card',
        x: 400, y: 350,
        width: 50, height: 40,
        type: 'collectible',
        label: '拉乌尔的贺卡',
        collectibleId: 'act2-card',
      },
      {
        id: 'mirror',
        x: 1100, y: 200,
        width: 120, height: 250,
        type: 'trigger',
        label: '全身镜',
        triggerKey: 'mirror-open',
      },
    ],
  },
  {
    id: 'spiral-stairs',
    actId: 2,
    name: '螺旋石梯',
    background: '/phantom/assets/backgrounds/act2-stairs.png',
    width: 1024,
    hotspots: [
      {
        id: 'to-tunnel',
        x: 500, y: 450,
        width: 150, height: 80,
        type: 'passage',
        label: '继续向下',
        targetArea: 'underground-tunnel',
      },
    ],
  },
  {
    id: 'underground-tunnel',
    actId: 2,
    name: '地下隧道',
    background: '/phantom/assets/backgrounds/act2-tunnel.png',
    width: 2560,
    hotspots: [
      {
        id: 'wall-score',
        x: 1200, y: 280,
        width: 80, height: 60,
        type: 'collectible',
        label: '墙上的乐谱涂鸦',
        collectibleId: 'act2-score',
      },
      {
        id: 'to-lake',
        x: 2400, y: 350,
        width: 120, height: 150,
        type: 'passage',
        label: '走向湖边',
        targetArea: 'underground-lake',
      },
    ],
  },
  {
    id: 'underground-lake',
    actId: 2,
    name: '地下湖',
    background: '/phantom/assets/backgrounds/act2-lake.png',
    width: 3072,
    hotspots: [
      {
        id: 'candle-carving',
        x: 2800, y: 400,
        width: 60, height: 50,
        type: 'collectible',
        label: '蜡烛台上的刻字',
        collectibleId: 'act2-carving',
      },
      {
        id: 'lair-entrance',
        x: 2900, y: 300,
        width: 100, height: 180,
        type: 'trigger',
        label: '密室入口',
        triggerKey: 'act2-end',
      },
    ],
  },
];

export const ACT2_COLLECTIBLES: Collectible[] = [
  {
    id: 'act2-card',
    actId: 2,
    name: '拉乌尔的贺卡',
    description: '化妆间桌上的一张贺卡，附在一束白玫瑰旁。',
    contentZh: '"今夜你是最闪耀的星——你的老朋友 R"\n\n字迹工整但略显紧张，仿佛写了很多遍才满意。卡片边角有淡淡的古龙水香味。',
    areaId: 'dressing-room',
  },
  {
    id: 'act2-score',
    actId: 2,
    name: '墙上的乐谱涂鸦',
    description: '地下隧道石壁上用炭笔画的五线谱和音符。',
    contentZh: '一段未完成的旋律，写在D小调上，标注着"柔板，为管风琴与人声而作"。\n\n笔迹与五号包厢纸条上的完全一致。这些音符刻得很深，像是被反复描画过。',
    areaId: 'underground-tunnel',
  },
  {
    id: 'act2-carving',
    actId: 2,
    name: '蜡烛台上的刻字',
    description: '地下湖岸边一个铜质蜡烛台的底座上刻着图案。',
    contentZh: '一个心形图案，里面刻着字母 "C"。\n\n刻痕很浅，像是用指甲一点点刻上去的。蜡烛台的铜面被摸得发亮，显然有人经常抚摸这个字母。',
    areaId: 'underground-lake',
  },
];

// ── All acts data lookup ──

export function getAreasForAct(act: number): Area[] {
  if (act === 1) return ACT1_AREAS;
  if (act === 2) return ACT2_AREAS;
  return [];
}

export function getCollectiblesForAct(act: number): Collectible[] {
  if (act === 1) return ACT1_COLLECTIBLES;
  if (act === 2) return ACT2_COLLECTIBLES;
  return [];
}

export function getAllCollectibles(): Collectible[] {
  return [...ACT1_COLLECTIBLES, ...ACT2_COLLECTIBLES];
}

export const PHANTOM_TIER_THRESHOLDS: Record<number, string> = {
  0: 'ambient',
  1: 'stirring',
  2: 'watching',
  3: 'climax',
};
