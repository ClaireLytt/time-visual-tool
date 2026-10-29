/**
 * Environmental storytelling — clickable non-collectible objects that add
 * atmosphere and teach English phrases casually (no quiz required).
 */
import { Hotspot } from './types';

export interface EnvDescription {
  id: string;
  areaId: string;
  textZh: string;
  textEn: string;
  /** A casual English phrase the player picks up */
  phrase: string;
  phraseZh: string;
}

/**
 * Extra hotspots to merge into each area's hotspot list.
 * type = 'clue' so Canvas2D can distinguish them from collectibles/triggers.
 */
export const ENV_HOTSPOTS: Record<string, Hotspot[]> = {
  'theater-audience': [
    {
      id: 'env-chandelier',
      x: 520, y: 130, width: 80, height: 60,
      type: 'clue', label: '吐灯',
    },
    {
      id: 'env-curtain',
      x: 30, y: 180, width: 50, height: 200,
      type: 'clue', label: '红色帷幕',
    },
  ],
  'theater-stage': [
    {
      id: 'env-footlights',
      x: 100, y: 520, width: 300, height: 30,
      type: 'clue', label: '脚灯',
    },
    {
      id: 'env-score-stand',
      x: 600, y: 350, width: 40, height: 60,
      type: 'clue', label: '乐谱架',
    },
  ],
  'theater-backstage': [
    {
      id: 'env-costumes',
      x: 400, y: 300, width: 80, height: 120,
      type: 'clue', label: '演出服装',
    },
  ],
  'dressing-room': [
    {
      id: 'env-roses',
      x: 300, y: 300, width: 50, height: 50,
      type: 'clue', label: '白玫瑰',
    },
    {
      id: 'env-candles',
      x: 200, y: 250, width: 40, height: 50,
      type: 'clue', label: '梯形烛台',
    },
  ],
  'underground-tunnel': [
    {
      id: 'env-scratches',
      x: 800, y: 200, width: 60, height: 80,
      type: 'clue', label: '墙上的抓痕',
    },
  ],
  'underground-lake': [
    {
      id: 'env-boat',
      x: 1800, y: 400, width: 120, height: 60,
      type: 'clue', label: '小船',
    },
  ],
  'lair': [
    {
      id: 'env-candelabra',
      x: 200, y: 250, width: 50, height: 80,
      type: 'clue', label: '枝形烛台',
    },
    {
      id: 'env-mirror-lair',
      x: 1800, y: 300, width: 60, height: 120,
      type: 'clue', label: '破碎的镜子',
    },
  ],
  'rooftop': [
    {
      id: 'env-gargoyle',
      x: 100, y: 200, width: 60, height: 80,
      type: 'clue', label: '石像鬼',
    },
    {
      id: 'env-moonlight',
      x: 1200, y: 50, width: 100, height: 80,
      type: 'clue', label: '月光',
    },
  ],
  'theater-performance': [
    {
      id: 'env-orchestra-pit',
      x: 400, y: 500, width: 200, height: 40,
      type: 'clue', label: '乐池',
    },
  ],
  'final-lair': [
    {
      id: 'env-broken-organ',
      x: 600, y: 250, width: 100, height: 80,
      type: 'clue', label: '损坏的管风琴',
    },
  ],
  'epilogue': [
    {
      id: 'env-empty-chair',
      x: 300, y: 420, width: 60, height: 50,
      type: 'clue', label: '空椅子',
    },
  ],
};

export const ENV_DESCRIPTIONS: Record<string, EnvDescription> = {
  'env-chandelier': {
    id: 'env-chandelier',
    areaId: 'theater-audience',
    textZh: '巨大的水晶吐灯悬挂在观众席正上方，数千颗水晶折射出微弱的光芒。它看起来很重…如果掉下来…',
    textEn: 'The great chandelier hangs above, its crystals catching the faint light. It looks terribly heavy...',
    phrase: 'The chandelier hung like a threat.',
    phraseZh: '吐灯像一个威胁般悬挂着。',
  },
  'env-curtain': {
    id: 'env-curtain',
    areaId: 'theater-audience',
    textZh: '红色天鹅绒帷幕，厦实而沉重。边缘绣着金线，但布料已经有些褰旧。',
    textEn: 'Heavy crimson velvet curtains, trimmed with gold thread. The fabric is slightly worn with age.',
    phrase: 'Behind the curtain, secrets wait.',
    phraseZh: '帷幕背后，秘密在等待。',
  },
  'env-footlights': {
    id: 'env-footlights',
    areaId: 'theater-stage',
    textZh: '舞台前缘的脚灯排列整齐，照亮演员的脸，但把观众席投入黑暗。从舞台上看，观众只是一片虚无。',
    textEn: 'The footlights illuminate the performers\' faces while casting the audience into shadow. From the stage, you cannot see who watches.',
    phrase: 'All the world\'s a stage.',
    phraseZh: '世界是一个舞台。',
  },
  'env-score-stand': {
    id: 'env-score-stand',
    areaId: 'theater-stage',
    textZh: '乐谱架上放着一本打开的乐谱。有人用铅笔在边缘潦草地写了些注释。',
    textEn: 'A score lies open on the music stand. Someone has scrawled hasty notes in pencil along the margins.',
    phrase: 'The music speaks what words cannot.',
    phraseZh: '音乐说出文字无法表达的。',
  },
  'env-costumes': {
    id: 'env-costumes',
    areaId: 'theater-backstage',
    textZh: '演出服装挂在架子上，有的华丽耀眠，有的已经破旧。最后一件是一套黑色披风——似乎最近被人穿过。',
    textEn: 'Costumes hang on racks — some dazzling, some threadbare. The last one is a black cloak that looks recently worn.',
    phrase: 'We all wear masks, one way or another.',
    phraseZh: '我们都戴着面具，以不同的方式。',
  },
  'env-roses': {
    id: 'env-roses',
    areaId: 'dressing-room',
    textZh: '一束白玫瑰，花瓣完美无瑕。但每朵花的茎上都绑着一条黑色丝带，像是哀悼的标记。',
    textEn: 'White roses, each petal perfect. But every stem is tied with a black ribbon, like a mark of mourning.',
    phrase: 'A rose by any other name would smell as sweet.',
    phraseZh: '玫瑰不管叫什么名字，都一样芬芳。',
  },
  'env-candles': {
    id: 'env-candles',
    areaId: 'dressing-room',
    textZh: '化妆台前的烛台上插着三支燃烧的蜡烛。火焰在无风的房间里却微微摇动——像是有人在呼吸。',
    textEn: 'Three candles burn on the dressing table. The flames flicker in the still room — as if someone is breathing nearby.',
    phrase: 'Where there is light, there are shadows.',
    phraseZh: '有光的地方，就有影子。',
  },
  'env-scratches': {
    id: 'env-scratches',
    areaId: 'underground-tunnel',
    textZh: '石壁上有深深的抓痕，五条并排。有人试图从这里爬出去，但没有成功。抓痕已经很旧了。',
    textEn: 'Five deep scratches score the stone wall, side by side. Someone tried to claw their way out. The marks are old.',
    phrase: 'Desperation leaves its mark.',
    phraseZh: '绝望会留下印记。',
  },
  'env-boat': {
    id: 'env-boat',
    areaId: 'underground-lake',
    textZh: '一叶小船静静地停在湖边。船底有一层薄薄的水，船桦在水中留下微微的涠漪。他就是坐这船来的。',
    textEn: 'A small boat rests by the shore. Water seeps through its hull, and the oar leaves gentle ripples. This is how he travels.',
    phrase: 'Still waters run deep.',
    phraseZh: '静水流深。',
  },
  'env-candelabra': {
    id: 'env-candelabra',
    areaId: 'lair',
    textZh: '数十支蜡烛在架子上燃烧，照亮整个密室。蜡油在地板上堆积如山——它们燃烧了多少年？',
    textEn: 'Dozens of candles blaze on iron stands, lighting the chamber. Wax has pooled on the floor in mounds — how many years have they burned?',
    phrase: 'Even in darkness, he made light.',
    phraseZh: '即使在黑暗中，他也创造了光。',
  },
  'env-mirror-lair': {
    id: 'env-mirror-lair',
    areaId: 'lair',
    textZh: '一面破碎的全身镜，裂纹像蛛网一样展开。每一块碎片都映出不同角度的你——和他破碎的自我。',
    textEn: 'A shattered full-length mirror, cracks spreading like a web. Each shard reflects a different angle of you — and of his broken self.',
    phrase: 'He could not bear his own reflection.',
    phraseZh: '他无法忍受自己的倒影。',
  },
  'env-gargoyle': {
    id: 'env-gargoyle',
    areaId: 'rooftop',
    textZh: '一尊石像鬼蓸视着巴黎的夜空，表情既僲劁又悲伤。它在这里坐了多久？比魅影还久吗？',
    textEn: 'A gargoyle stares out over the Paris night, its expression caught between mockery and sorrow. How long has it sat here? Longer than the Phantom?',
    phrase: 'Stone guardians watch in silence.',
    phraseZh: '石头守护者沉默地注视。',
  },
  'env-moonlight': {
    id: 'env-moonlight',
    areaId: 'rooftop',
    textZh: '月光洒在屋顶上，把一切染成银色。这是巴黎最美的角度——也是最孤独的。',
    textEn: 'Moonlight washes over the rooftop, turning everything silver. The most beautiful view of Paris — and the loneliest.',
    phrase: 'The moon sees all but tells no one.',
    phraseZh: '月亮看见了一切，但不告诉任何人。',
  },
  'env-orchestra-pit': {
    id: 'env-orchestra-pit',
    areaId: 'theater-performance',
    textZh: '乐池里的乐器已经摆好，但乐手们还没到。一把小提琴的弦松了——像是有人刚弹过。',
    textEn: 'The instruments are set in the orchestra pit, but the musicians haven\'t arrived. One violin has a loose string — as if someone just played it.',
    phrase: 'The show must go on.',
    phraseZh: '演出必须继续。',
  },
  'env-broken-organ': {
    id: 'env-broken-organ',
    areaId: 'final-lair',
    textZh: '管风琴的几根琴管已经被砸毁，键盘上散落着碎纸。这是他最后的绝望——他砸毁了自己的音乐。',
    textEn: 'Several organ pipes have been smashed. Sheet music lies torn on the keys. This was his final despair — he destroyed his own music.',
    phrase: 'What we love most, we destroy.',
    phraseZh: '我们最爱的，往往亲手摧毁。',
  },
  'env-empty-chair': {
    id: 'env-empty-chair',
    areaId: 'epilogue',
    textZh: '一把空椅子在密室的正中间。坐垫已经磨损，印出一个人形。他在这里坐了多少个夜晚？',
    textEn: 'An empty chair sits in the center of the chamber. The cushion is worn into the shape of a person. How many nights did he sit here?',
    phrase: 'Absence speaks louder than presence.',
    phraseZh: '缺席比在场更响亮。',
  },
};

/** Get environment descriptions for a given area */
export function getEnvHotspotsForArea(areaId: string): Hotspot[] {
  return ENV_HOTSPOTS[areaId] || [];
}

/** Get the description for an env hotspot */
export function getEnvDescription(hotspotId: string): EnvDescription | undefined {
  return ENV_DESCRIPTIONS[hotspotId];
}
