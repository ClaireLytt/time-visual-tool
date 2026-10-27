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

// ── Act 3: Music of the Night ──

export const ACT3_AREAS: Area[] = [
  {
    id: 'lair',
    actId: 3,
    name: '魅影的密室',
    background: '/phantom/assets/backgrounds/act3-lair.png',
    width: 2560,
    hotspots: [
      {
        id: 'organ',
        x: 1000, y: 250,
        width: 200, height: 180,
        type: 'trigger',
        label: '管风琴',
        triggerKey: 'music-of-night-start',
      },
      {
        id: 'manuscript',
        x: 1150, y: 280,
        width: 60, height: 40,
        type: 'collectible',
        label: '乐谱架上的手稿',
        collectibleId: 'act3-manuscript',
      },
      {
        id: 'diary',
        x: 400, y: 380,
        width: 50, height: 40,
        type: 'collectible',
        label: '蜡烛旁的日记',
        collectibleId: 'act3-diary',
      },
      {
        id: 'fallen-mask',
        x: 1300, y: 460,
        width: 50, height: 30,
        type: 'collectible',
        label: '掉落的面具',
        collectibleId: 'act3-mask',
      },
      {
        id: 'secret-door',
        x: 2300, y: 280,
        width: 100, height: 200,
        type: 'trigger',
        label: '暗门',
        triggerKey: 'act3-end',
      },
    ],
  },
];

export const ACT3_COLLECTIBLES: Collectible[] = [
  {
    id: 'act3-manuscript',
    actId: 3,
    name: '《唐璜的胜利》手稿',
    description: '管风琴乐谱架上的一部未完成歌剧。',
    contentZh: '第三幕，第二场——唐璜的胜利\n\n"过了那个点，就再也回不了头了……"\n\n最后一页是空白的。墨水瓶倒在一旁，仿佛写到这里时，作者的手突然停住了。',
    areaId: 'lair',
  },
  {
    id: 'act3-diary',
    actId: 3,
    name: '魅影的日记',
    description: '桌上蜡烛旁的一本皮面日记，页面泛黄。',
    contentZh: '"他们叫我怪物。但怪物不会流泪。怪物不会在夜里独自坐在管风琴前，为一个永远不会属于自己的声音写下旋律。"\n\n"母亲把我卖给了马戏团。父亲甚至没有看我一眼。这座歌剧院是我唯一的家。"\n\n后面的页面被泪水浸透，字迹模糊不清。',
    areaId: 'lair',
  },
  {
    id: 'act3-mask',
    actId: 3,
    name: '掉落的面具',
    description: '揭面之后落在地上的白色瓷质半面具。',
    contentZh: '白色瓷质半面具。拿在手里——还是温热的，仿佛一张脸刚刚离开它。\n\n内侧光滑得不可思议，外侧有细密的裂纹，像是被戴过成千上万次。这不仅是一个面具，这是他唯一敢面对世界的方式。',
    areaId: 'lair',
  },
];

// ── Act 4: All I Ask of You ──

export const ACT4_AREAS: Area[] = [
  {
    id: 'rooftop',
    actId: 4,
    name: '歌剧院屋顶',
    background: '/phantom/assets/backgrounds/act4-rooftop.png',
    width: 2048,
    hotspots: [
      {
        id: 'bouquet',
        x: 300, y: 420,
        width: 50, height: 40,
        type: 'collectible',
        label: '拉乌尔的花束',
        collectibleId: 'act4-bouquet',
      },
      {
        id: 'scarf',
        x: 1500, y: 350,
        width: 60, height: 30,
        type: 'collectible',
        label: '栏杆上的围巾',
        collectibleId: 'act4-scarf',
      },
      {
        id: 'angel-statue',
        x: 1800, y: 200,
        width: 100, height: 150,
        type: 'collectible',
        label: '天使雕像上的刻痕',
        collectibleId: 'act4-carving',
      },
      {
        id: 'love-duet-spot',
        x: 900, y: 300,
        width: 150, height: 150,
        type: 'trigger',
        label: '屋顶边缘',
        triggerKey: 'all-i-ask-start',
      },
      {
        id: 'act4-exit',
        x: 500, y: 480,
        width: 100, height: 60,
        type: 'trigger',
        label: '走下屋顶',
        triggerKey: 'act4-end',
      },
    ],
  },
];

export const ACT4_COLLECTIBLES: Collectible[] = [
  {
    id: 'act4-bouquet',
    actId: 4,
    name: '拉乌尔的花束',
    description: '屋顶角落的一束白玫瑰，丝带上绣着首字母。',
    contentZh: '一束白玫瑰，花瓣上还沾着露水。丝带上用金线绣着字母 "C"。\n\n花束被小心地放在一个避风的角落，像是有人特意选了这个位置，不让风吹散花瓣。',
    areaId: 'rooftop',
  },
  {
    id: 'act4-scarf',
    actId: 4,
    name: '克里斯汀的围巾',
    description: '栏杆上遗留的一条丝质围巾。',
    contentZh: '丝质围巾，淡淡的茉莉花香混合着舞台灰尘的味道。\n\n围巾的一角被风吹得飘起来，像是在向什么人挥手告别。',
    areaId: 'rooftop',
  },
  {
    id: 'act4-carving',
    actId: 4,
    name: '天使雕像上的刻痕',
    description: '天使雕像底座上刻着的字。',
    contentZh: '"我在这里聆听。永远。"\n\n字迹刻得很浅，要凑近才能看清。但每个字母都被反复描过，像是在漫长的夜晚里一遍遍加深这句话的重量。',
    areaId: 'rooftop',
  },
];

// ── Act 5: The Point of No Return ──

export const ACT5_AREAS: Area[] = [
  {
    id: 'theater-performance',
    actId: 5,
    name: '剧场（演出）',
    background: '/phantom/assets/backgrounds/act5-performance.png',
    width: 2048,
    hotspots: [
      {
        id: 'program',
        x: 350, y: 430,
        width: 50, height: 40,
        type: 'collectible',
        label: '座椅上的节目单',
        collectibleId: 'act5-program',
      },
      {
        id: 'stage-center',
        x: 900, y: 300,
        width: 200, height: 180,
        type: 'trigger',
        label: '舞台中央',
        triggerKey: 'point-of-no-return-start',
      },
    ],
    exitRight: 'final-lair',
  },
  {
    id: 'final-lair',
    actId: 5,
    name: '地下湖密室',
    background: '/phantom/assets/backgrounds/act5-final-lair.png',
    width: 2048,
    hotspots: [
      {
        id: 'music-box',
        x: 800, y: 400,
        width: 50, height: 40,
        type: 'collectible',
        label: '音乐盒',
        collectibleId: 'act5-musicbox',
      },
      {
        id: 'confrontation-spot',
        x: 1000, y: 300,
        width: 150, height: 150,
        type: 'trigger',
        label: '对峙',
        triggerKey: 'kiss-scene',
      },
    ],
    exitRight: 'epilogue',
  },
  {
    id: 'epilogue',
    actId: 5,
    name: '终章',
    background: '/phantom/assets/backgrounds/act5-epilogue.png',
    width: 1024,
    hotspots: [
      {
        id: 'final-mask',
        x: 480, y: 400,
        width: 60, height: 40,
        type: 'collectible',
        label: '面具',
        collectibleId: 'act5-mask',
      },
    ],
  },
];

export const ACT5_COLLECTIBLES: Collectible[] = [
  {
    id: 'act5-program',
    actId: 5,
    name: '《唐璜的胜利》节目单',
    description: '今晚演出的节目单。',
    contentZh: '巴黎歌剧院\n今晚演出：《唐璜的胜利》\n\n唐璜一角的演员名字被黑墨水涂掉了。在涂抹的痕迹旁，用红墨水写着："我来了。"\n\n节目单的背面有一滴蜡油——来自地下的蜡烛。',
    areaId: 'theater-performance',
  },
  {
    id: 'act5-musicbox',
    actId: 5,
    name: '魅影的音乐盒',
    description: '克里斯汀离开后掉落在地上的小音乐盒。',
    contentZh: '一个精致的铜质音乐盒，表面刻着一只猴子弹钹的图案。\n\n旋转发条——三个音符响起，然后沉默。只有三个音符，像是一首永远无法完成的歌。',
    areaId: 'final-lair',
  },
  {
    id: 'act5-mask',
    actId: 5,
    name: '魅影的面具',
    description: '全游戏的最后一件收集品——他留在世上的唯一痕迹。',
    contentZh: '这就是全部了。\n\n一个面具。一段记忆。一首歌。\n\n白色瓷面在光束中缓缓旋转，像是在等待一张永远不会回来的脸。\n\n他的音乐永远回荡在这座歌剧院里。',
    areaId: 'epilogue',
  },
];

// ── All acts data lookup ──

const AREAS_BY_ACT: Record<number, Area[]> = {
  1: ACT1_AREAS, 2: ACT2_AREAS, 3: ACT3_AREAS, 4: ACT4_AREAS, 5: ACT5_AREAS,
};
const COLLECTIBLES_BY_ACT: Record<number, Collectible[]> = {
  1: ACT1_COLLECTIBLES, 2: ACT2_COLLECTIBLES, 3: ACT3_COLLECTIBLES,
  4: ACT4_COLLECTIBLES, 5: ACT5_COLLECTIBLES,
};

export function getAreasForAct(act: number): Area[] {
  return AREAS_BY_ACT[act] || [];
}

export function getCollectiblesForAct(act: number): Collectible[] {
  return COLLECTIBLES_BY_ACT[act] || [];
}

export function getAllCollectibles(): Collectible[] {
  return Object.values(COLLECTIBLES_BY_ACT).flat();
}

export const PHANTOM_TIER_THRESHOLDS: Record<number, string> = {
  0: 'ambient',
  1: 'stirring',
  2: 'watching',
  3: 'climax',
};
