/**
 * Idiom Collection — English idioms encountered through the story.
 * Each idiom is tied to a story moment and teaches figurative language.
 */

export interface Idiom {
  id: string;
  idiom: string;
  meaning: string;
  meaningZh: string;
  /** Literal translation that shows why it's figurative */
  literal: string;
  literalZh: string;
  /** Example in story context */
  storyContext: string;
  storyContextZh: string;
  /** How it's unlocked */
  unlockSource: string;
  /** Collectible or trigger that unlocks it */
  unlockId: string;
}

export const IDIOMS: Idiom[] = [
  {
    id: 'idiom-1',
    idiom: 'behind the curtain',
    meaning: 'Hidden from public view; the secret truth',
    meaningZh: '隐藏在公众视线之外；秘密的真相',
    literal: 'Literally: behind the fabric that covers the stage',
    literalZh: '字面意思：在覆盖舞台的布幕后面',
    storyContext: 'The Phantom controls the opera from behind the curtain — both literally and figuratively.',
    storyContextZh: '魅影从幕后操控歌剧——既是字面意义，也是比喻意义。',
    unlockSource: 'Act 1 — Theater',
    unlockId: 'act1-memo',
  },
  {
    id: 'idiom-2',
    idiom: 'pull the strings',
    meaning: 'To secretly control a situation or other people',
    meaningZh: '在幕后操纵，暗中控制',
    literal: 'Literally: pulling puppet strings to make them move',
    literalZh: '字面意思：拉动提线木偶的线',
    storyContext: 'The Phantom pulls the strings at the Opera House, controlling who sings and who falls.',
    storyContextZh: '魅影在歌剧院幕后操纵一切，控制谁能演唱，谁会坠落。',
    unlockSource: 'Act 1 — Rope',
    unlockId: 'act1-rope',
  },
  {
    id: 'idiom-3',
    idiom: 'wear a mask',
    meaning: 'To hide your true feelings or identity',
    meaningZh: '隐藏真实的感受或身份',
    literal: 'Literally: to put a physical mask on your face',
    literalZh: '字面意思：在脸上戴一个真实的面具',
    storyContext: 'Everyone in this story wears a mask — the Phantom hides his face, Christine hides her fear, Raoul hides his jealousy.',
    storyContextZh: '故事中的每个人都戴着面具——魅影藏起他的脸，克里斯汀藏起她的恐惧，拉乌尔藏起他的嫉妒。',
    unlockSource: 'Act 3 — Mask',
    unlockId: 'act3-mask',
  },
  {
    id: 'idiom-4',
    idiom: 'point of no return',
    meaning: 'The moment after which you cannot go back to how things were',
    meaningZh: '不归之点；无法回头的时刻',
    literal: 'Literally: a point in a journey where returning costs more than continuing',
    literalZh: '字面意思：旅程中回头比继续前进代价更大的点',
    storyContext: 'The Phantom\'s opera is called "The Point of No Return" — once he reveals himself on stage, there is no going back.',
    storyContextZh: '魅影的歌剧叫做《不归之点》——一旦他在舞台上暴露自己，就再也回不了头。',
    unlockSource: 'Act 5 — Program',
    unlockId: 'act5-program',
  },
  {
    id: 'idiom-5',
    idiom: 'steal the show',
    meaning: 'To attract the most attention or praise at an event',
    meaningZh: '抢尽风头；成为全场焦点',
    literal: 'Literally: to take ownership of a theatrical performance',
    literalZh: '字面意思：偷走了整场演出',
    storyContext: 'Christine stole the show when she replaced Carlotta — the audience was mesmerized.',
    storyContextZh: '克里斯汀替代卡洛塔时抢尽了风头——观众被深深迷住。',
    unlockSource: 'Act 1 — Note',
    unlockId: 'act1-note',
  },
  {
    id: 'idiom-6',
    idiom: 'in the spotlight',
    meaning: 'Receiving a lot of public attention',
    meaningZh: '处于聚光灯下；备受关注',
    literal: 'Literally: standing in the beam of a theater spotlight',
    literalZh: '字面意思：站在剧场聚光灯的光束中',
    storyContext: 'The Phantom never wanted to be in the spotlight — he wanted Christine there instead.',
    storyContextZh: '魅影从不想处于聚光灯下——他想让克里斯汀站在那里。',
    unlockSource: 'Act 2 — Score',
    unlockId: 'act2-score',
  },
  {
    id: 'idiom-7',
    idiom: 'a swan song',
    meaning: 'A final performance or activity before retirement or death',
    meaningZh: '天鹅之歌；最后的演出',
    literal: 'From the myth that swans sing beautifully just before they die',
    literalZh: '来自天鹅在死前会美丽歌唱的神话',
    storyContext: 'Don Juan Triumphant was the Phantom\'s swan song — his final masterpiece before the end.',
    storyContextZh: '《唐璐的胜利》是魅影的天鹅之歌——结束前的最后杰作。',
    unlockSource: 'Act 5 — Music Box',
    unlockId: 'act5-musicbox',
  },
  {
    id: 'idiom-8',
    idiom: 'the show must go on',
    meaning: 'Things must continue despite difficulties or setbacks',
    meaningZh: '演出必须继续；不管发生什么都要坚持下去',
    literal: 'Literally: a theatrical performance cannot be cancelled once the audience is seated',
    literalZh: '字面意思：观众已经就座，演出不能取消',
    storyContext: 'Even after the chandelier fell and the Phantom terrorized the cast, the managers insisted: the show must go on.',
    storyContextZh: '即使吐灯坠落、魅影恐吓演员之后，经理们仍然坚持：演出必须继续。',
    unlockSource: 'Act 3 — Manuscript',
    unlockId: 'act3-manuscript',
  },
];

/** Get idioms unlocked by collected items */
export function getUnlockedIdioms(collectedItems: string[]): Idiom[] {
  return IDIOMS.filter((idiom) => collectedItems.includes(idiom.unlockId));
}
