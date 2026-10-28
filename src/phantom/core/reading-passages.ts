/**
 * Reading Passages — longer English texts about the Phantom of the Opera,
 * unlocked by collecting items across acts. Each passage teaches reading
 * comprehension with key vocabulary highlighted.
 */

export interface ReadingPassage {
  id: string;
  title: string;
  titleZh: string;
  /** How many collectibles needed to unlock */
  unlockAt: number;
  /** The English text */
  textEn: string;
  /** Chinese translation */
  textZh: string;
  /** Key words to highlight (with definitions) */
  keywords: { word: string; meaning: string }[];
  /** Reading comprehension question */
  question: string;
  questionZh: string;
  answer: string;
}

export const READING_PASSAGES: ReadingPassage[] = [
  {
    id: 'passage-1',
    title: 'The Paris Opera House',
    titleZh: '巴黎歌剧院',
    unlockAt: 1,
    textEn: 'The Palais Garnier, also known as the Paris Opera House, was built between 1861 and 1875. It was designed by architect Charles Garnier in the Beaux-Arts style. The building features a grand staircase, a magnificent auditorium with a painted ceiling, and — most famously — an underground lake beneath its foundations. This lake, created during construction to deal with underground water, became the inspiration for Gaston Leroux\'s novel "The Phantom of the Opera," published in 1910.',
    textZh: '加尼叶宫，也被称为巴黎歌剧院，建于1861年至1875年间。它由建筑师查尔斯·加尼叶以布杂艺术风格设计。建筑特色包括宏伟的楼梯、带有彩绘天花板的壮观观众席，以及——最著名的——地基下的一个地下湖。这个湖是在施工期间为处理地下水而建造的，后来成为加斯顿·勒鲁的小说《歌剧魅影》的灵感来源，该小说于1910年出版。',
    keywords: [
      { word: 'architect', meaning: '建筑师' },
      { word: 'magnificent', meaning: '壮观的' },
      { word: 'foundations', meaning: '地基' },
      { word: 'inspiration', meaning: '灵感' },
    ],
    question: 'What real feature of the Paris Opera House inspired the Phantom story?',
    questionZh: '巴黎歌剧院的哪个真实特征启发了魅影的故事？',
    answer: 'The underground lake beneath the opera house.',
  },
  {
    id: 'passage-2',
    title: 'The Chandelier Incident',
    titleZh: '吐灯事件',
    unlockAt: 3,
    textEn: 'On May 20, 1896, one of the counterweights for the grand chandelier of the Palais Garnier fell, killing a concierge. This real incident was woven into Leroux\'s novel as one of the Phantom\'s most dramatic acts of terror. In the story, the Phantom causes the chandelier to crash into the audience during a performance, creating chaos and panic. The real chandelier weighs approximately 7 tons and holds 340 lights.',
    textZh: '1896年5月20日，加尼叶宫大吐灯的一个配重块坠落，砸死了一名看门人。这个真实事件被勒鲁写入小说，成为魅影最具戏剧性的恐怖行为之一。在故事中，魅影让吐灯在演出期间坠入观众席，制造了混乱和恐慌。真实的吐灯重约7吨，带有340盏灯。',
    keywords: [
      { word: 'counterweight', meaning: '配重块' },
      { word: 'incident', meaning: '事件' },
      { word: 'dramatic', meaning: '戏剧性的' },
      { word: 'approximately', meaning: '大约' },
    ],
    question: 'How heavy is the real chandelier at the Palais Garnier?',
    questionZh: '加尼叶宫的真实吐灯有多重？',
    answer: 'Approximately 7 tons.',
  },
  {
    id: 'passage-3',
    title: 'Andrew Lloyd Webber\'s Musical',
    titleZh: '韦伯的音乐剧',
    unlockAt: 6,
    textEn: 'Andrew Lloyd Webber\'s musical adaptation of "The Phantom of the Opera" premiered in London in 1986 and on Broadway in 1988. It became the longest-running show in Broadway history, with over 13,000 performances before closing in April 2023. The musical transformed the story from a horror novel into a tragic love story, emphasizing the Phantom\'s humanity and his desperate desire to be loved. Songs like "The Music of the Night" and "All I Ask of You" have become iconic.',
    textZh: '安德鲁·劳埃德·韦伯的音乐剧《歌剧魅影》于1986年在伦敦首演，1988年登上百老汇。它成为百老汇历史上演出时间最长的剧目，在 2023年4月停演前共演出超13000场。这部音乐剧将故事从恐怖小说转变为悲剧爱情故事，强调了魅影的人性和他被爱的绝望渴望。《夜之音乐》和《我对你唯一的要求》等歌曲已成为经典。',
    keywords: [
      { word: 'adaptation', meaning: '改编' },
      { word: 'premiered', meaning: '首演' },
      { word: 'tragic', meaning: '悲剧的' },
      { word: 'iconic', meaning: '标志性的' },
    ],
    question: 'How many performances did the Broadway show have before closing?',
    questionZh: '百老汇演出在停演前共演出了多少场？',
    answer: 'Over 13,000 performances.',
  },
  {
    id: 'passage-4',
    title: 'The Real Erik',
    titleZh: '真实的埃里克',
    unlockAt: 10,
    textEn: 'In Leroux\'s original novel, the Phantom\'s real name is Erik. He was born with a severely disfigured face and was rejected by his own mother. He traveled with a circus as a young man, where he was displayed as a "living corpse." Erik was a polymath — a brilliant architect, musician, ventriloquist, and magician. He helped build the Paris Opera House, and secretly constructed a hidden home beside an underground lake. His tragedy is not villainy but isolation: a genius driven mad by a world that could never see past his face.',
    textZh: '在勒鲁的原著小说中，魅影的真名是埃里克。他生来就有严重的面部畸形，被亲生母亲拒绝。年轻时他跟随马戏团旅行，被当作“活尸”展示。埃里克是一个多才多艺的人——才华横溢的建筑师、音乐家、口技表演者和魔术师。他参与了巴黎歌剧院的建造，并秘密地在地下湖旁建造了一个藏身之所。他的悲剧不是邪恶，而是孤立：一个天才被一个永远无法看透他外表的世界逆疯。',
    keywords: [
      { word: 'disfigured', meaning: '畸形的' },
      { word: 'polymath', meaning: '博学之人' },
      { word: 'ventriloquist', meaning: '口技表演者' },
      { word: 'isolation', meaning: '孤立' },
    ],
    question: 'What was Erik\'s tragedy according to the passage?',
    questionZh: '根据文章，埃里克的悲剧是什么？',
    answer: 'Not villainy but isolation — a genius driven mad by a world that could never see past his face.',
  },
  {
    id: 'passage-5',
    title: 'The Power of Music',
    titleZh: '音乐的力量',
    unlockAt: 14,
    textEn: 'Throughout the story, music serves as both a bridge and a barrier. It is the language through which the Phantom communicates his deepest emotions — love, longing, rage, and despair. When he teaches Christine to sing, he gives her a gift that transforms her from chorus girl to prima donna. Yet this same music becomes his chain: he cannot express himself any other way. The Phantom\'s tragedy is that his greatest strength — his musical genius — is also his prison. He can create beauty that moves audiences to tears, but he cannot simply say "I love you" and be heard as a man, not a monster.',
    textZh: '在整个故事中，音乐既是桥梁也是屏障。它是魅影表达最深层情感的语言——爱、渴望、愤怒和绝望。当他教克里斯汀唱歌时，他给了她一份礼物，将她从合唱团女孩变成了首席女高音。然而这同样的音乐也成为了他的锁链：他无法用任何其他方式表达自己。魅影的悲剧在于他最大的优势——音乐天赋——也是他的监狱。他能创造出让观众落泪的美，但他无法简单地说“我爱你”并被当作一个人而非怪物来倾听。',
    keywords: [
      { word: 'barrier', meaning: '屏障' },
      { word: 'longing', meaning: '渴望' },
      { word: 'transforms', meaning: '转变' },
      { word: 'prison', meaning: '监狱' },
    ],
    question: 'Why is the Phantom\'s musical genius also his prison?',
    questionZh: '为什么魅影的音乐天赋也是他的监狱？',
    answer: 'Because he cannot express himself any other way — he can create beauty but cannot simply say "I love you" and be heard as a man.',
  },
];

/** Get passages unlocked by current collectible count */
export function getUnlockedPassages(collectibleCount: number): ReadingPassage[] {
  return READING_PASSAGES.filter((p) => collectibleCount >= p.unlockAt);
}
