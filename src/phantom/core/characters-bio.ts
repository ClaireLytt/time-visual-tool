/**
 * Character profiles — unlockable bios with bilingual descriptions.
 * Unlock conditions based on story progress.
 */

export interface CharacterBio {
  id: string;
  name: string;
  nameEn: string;
  title: string;
  titleEn: string;
  bioZh: string;
  bioEn: string;
  /** Trigger keys that unlock this bio (any one suffices) */
  unlockTriggers: string[];
  /** Character's signature quote */
  quoteEn: string;
  quoteZh: string;
  /** Morandi-safe color for the profile card */
  color: string;
  icon: string;
}

export const CHARACTER_BIOS: CharacterBio[] = [
  {
    id: 'phantom',
    name: '魅影',
    nameEn: 'The Phantom',
    title: '歌剧鬼魂',
    titleEn: 'The Opera Ghost',
    bioZh: '真名埃里克（Erik）。天才音乐家、建筑师、魔术师。因天生面容畸形而被母亲抛弃，在马戏团长大。后来在巴黎歌剧院的地下湖旁建造了自己的密室，以“歌剧鬼魂”的身份操控歌剧院。他爱上了克里斯汀，成为她的“音乐天使”。',
    bioEn: 'Real name Erik. A genius musician, architect, and magician. Abandoned by his mother for his disfigured face, he grew up in a traveling circus. He later built a hidden lair beside the underground lake beneath the Paris Opera House, controlling the theater as the "Opera Ghost." He fell in love with Christine, becoming her "Angel of Music."',
    unlockTriggers: ['think-of-me-start', 'act1-end'],
    quoteEn: 'I am your Angel of Music.',
    quoteZh: '我是你的音乐天使。',
    color: '#9a8a78',
    icon: '🎭',
  },
  {
    id: 'christine',
    name: '克里斯汀·达埃',
    nameEn: 'Christine Daaé',
    title: '女高音',
    titleEn: 'The Soprano',
    bioZh: '年轻的瑞典女高音歌手。父亲是一位著名的小提琴家，在他去世前讲过“音乐天使”的故事。克里斯汀相信魅影就是父亲所说的天使。她在爱与恐惧之间挣扎，最终选择了拉乌尔。',
    bioEn: 'A young Swedish soprano. Her father was a renowned violinist who told her stories of the "Angel of Music" before his death. Christine believed the Phantom was the angel her father promised. Torn between love and fear, she ultimately chose Raoul.',
    unlockTriggers: ['think-of-me-start'],
    quoteEn: 'Think of me, think of me fondly.',
    quoteZh: '想起我，温柔地想起我。',
    color: '#c5a55a',
    icon: '🎵',
  },
  {
    id: 'raoul',
    name: '拉乌尔·德·夏尼',
    nameEn: 'Raoul de Chagny',
    title: '子爵',
    titleEn: 'The Viscount',
    bioZh: '夏尼子爵，克里斯汀的童年朋友。在克里斯汀登台演唱后重连。他纯真、勇敢，但无法理解魅影对音乐的执着。他试图保护克里斯汀，却也在无意中加速了悲剧的到来。',
    bioEn: 'The Viscount de Chagny, Christine\'s childhood friend. They reconnected after her debut performance. Innocent and brave, but unable to understand the Phantom\'s obsession with music. He tried to protect Christine, but inadvertently hastened the tragedy.',
    unlockTriggers: ['all-i-ask-start', 'mirror-open'],
    quoteEn: 'Say you\'ll share with me one love, one lifetime.',
    quoteZh: '说你会与我分享一份爱，一生。',
    color: '#8aafb0',
    icon: '⚔️',
  },
  {
    id: 'carlotta',
    name: '卡洛塔',
    nameEn: 'Carlotta Giudicelli',
    title: '首席女高音',
    titleEn: 'The Prima Donna',
    bioZh: '歌剧院的首席女高音，娇纵任性但才华横溢。魅影对她的威胁让她无法安心演唱。当吐灯坠落时，她拒绝再登台，为克里斯汀让出了舞台。',
    bioEn: 'The Opera House\'s leading soprano — temperamental but genuinely talented. The Phantom\'s threats made it impossible for her to perform in peace. When the chandelier fell, she refused to take the stage again, making way for Christine.',
    unlockTriggers: ['think-of-me-start'],
    quoteEn: 'These things do happen!',
    quoteZh: '这种事情总是发生！',
    color: '#b07070',
    icon: '👑',
  },
  {
    id: 'madame-giry',
    name: '吉里夫人',
    nameEn: 'Madame Giry',
    title: '芙蕾教师',
    titleEn: 'The Ballet Mistress',
    bioZh: '歌剧院的芙蕾教师，魅影的唯一盟友。她年轻时在马戏团见过他，帮助他逃到歌剧院。她是魅影与外界之间的桥梁，传递他的信件和命令。',
    bioEn: 'The ballet mistress of the Opera House and the Phantom\'s only ally. She saw him as a young man in the traveling circus and helped him escape to the opera house. She serves as the bridge between the Phantom and the outside world, delivering his letters and orders.',
    unlockTriggers: ['think-of-me-start'],
    quoteEn: 'I know a girl. Christine Daaé. She can sing.',
    quoteZh: '我认识一个女孩。克里斯汀·达埃。她可以唱。',
    color: '#8a8a7a',
    icon: '🩰',
  },
];

/** Get bios unlocked by triggered events */
export function getUnlockedBios(triggeredEvents: string[]): CharacterBio[] {
  return CHARACTER_BIOS.filter((bio) =>
    bio.unlockTriggers.some((t) => triggeredEvents.includes('evt-' + t))
  );
}
