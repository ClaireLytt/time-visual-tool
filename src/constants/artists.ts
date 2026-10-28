export interface ArtistBio {
  name: string
  born: string
  died: string
  nationality: string
  bio: { zh: string; en: string }
}

export const ARTISTS: Record<string, ArtistBio> = {
  'Johannes Vermeer': {
    name: 'Johannes Vermeer',
    born: '1632', died: '1675', nationality: 'Dutch',
    bio: {
      zh: '维米尔一生只留下约35幅画作，生前默默无闻，死后200年才被重新发现。他是光影大师，擅长用窗户透入的柔和自然光照亮室内场景。',
      en: 'Vermeer left only ~35 paintings, died in obscurity, and was rediscovered 200 years later. A master of light, he specialized in soft natural light streaming through windows to illuminate interior scenes.',
    },
  },
  'Rembrandt': {
    name: 'Rembrandt van Rijn',
    born: '1606', died: '1669', nationality: 'Dutch',
    bio: {
      zh: '伦勃朗是巴洛克时期最伟大的画家之一，以戏剧性的明暗对比闻名。他画了近100幅自画像，记录了从意气风发到破产潦倒的一生。',
      en: 'Rembrandt was one of the greatest Baroque painters, known for dramatic chiaroscuro. He painted nearly 100 self-portraits, documenting his life from youthful ambition to bankruptcy.',
    },
  },
  'Vincent van Gogh': {
    name: 'Vincent van Gogh',
    born: '1853', died: '1890', nationality: 'Dutch',
    bio: {
      zh: '梵高生前只卖出一幅画，37岁去世。他在生命最后两年创作了大部分杰作，用旋转的笔触和浓烈的色彩表达内心的狂热与孤独。',
      en: 'Van Gogh sold only one painting in his lifetime, dying at 37. He created most of his masterpieces in the last two years, expressing inner fervor and loneliness through swirling brushstrokes and intense color.',
    },
  },
  'Claude Monet': {
    name: 'Claude Monet',
    born: '1840', died: '1926', nationality: 'French',
    bio: {
      zh: '莫奈是印象派的创始人之一，终其一生追求"瞬间的光影"。晚年他在吉维尼的花园里度过，几乎失明的他画出了最大胆的睡莲系列。',
      en: 'Monet co-founded Impressionism, spending his life chasing "the moment of light." In his later years at Giverny, nearly blind, he produced his boldest Water Lilies series.',
    },
  },
  'Leonardo da Vinci': {
    name: 'Leonardo da Vinci',
    born: '1452', died: '1519', nationality: 'Italian',
    bio: {
      zh: '达芬奇是文艺复兴的完美代表——画家、雕塑家、建筑师、科学家、工程师、解剖学家。他的笔记本里有直升机、坦克和太阳能的早期设计。',
      en: 'Da Vinci embodied the Renaissance ideal — painter, sculptor, architect, scientist, engineer, anatomist. His notebooks contain early designs for helicopters, tanks, and solar power.',
    },
  },
  'Sandro Botticelli': {
    name: 'Sandro Botticelli',
    born: '1445', died: '1510', nationality: 'Italian',
    bio: {
      zh: '波提切利是佛罗伦萨文艺复兴的核心人物，以优美的线条和神话题材闻名。晚年他受萨沃纳罗拉的宗教狂热影响，烧毁了自己的许多画作。',
      en: 'Botticelli was a central figure of the Florentine Renaissance, known for elegant lines and mythological subjects. Late in life, influenced by Savonarola\'s religious fervor, he burned many of his own works.',
    },
  },
  'Michelangelo': {
    name: 'Michelangelo Buonarroti',
    born: '1475', died: '1564', nationality: 'Italian',
    bio: {
      zh: '米开朗基罗自认是雕塑家而非画家——他是被迫画西斯廷教堂天顶的。但这个"被迫"的作品成为了人类艺术史上最伟大的壁画。',
      en: 'Michelangelo considered himself a sculptor, not a painter — he was forced to paint the Sistine Chapel ceiling. Yet this "forced" work became the greatest mural in human art history.',
    },
  },
  'Pablo Picasso': {
    name: 'Pablo Picasso',
    born: '1881', died: '1973', nationality: 'Spanish',
    bio: {
      zh: '毕加索是20世纪最多产的艺术家，一生创作了约5万件作品。他与布拉克共同创立了立体主义，彻底打破了自文艺复兴以来的透视规则。',
      en: 'Picasso was the most prolific artist of the 20th century, creating ~50,000 works. He co-founded Cubism with Braque, shattering perspective rules that had stood since the Renaissance.',
    },
  },
  'Salvador Dalí': {
    name: 'Salvador Dalí',
    born: '1904', died: '1989', nationality: 'Spanish',
    bio: {
      zh: '达利把自己的艺术称为"偏执狂批判法"——用清醒的疯狂来创作。他标志性的翘胡子和古怪行为让他成为超现实主义最著名的代言人。',
      en: 'Dalí called his art the "paranoiac-critical method" — creating through lucid madness. His iconic upturned mustache and eccentric behavior made him Surrealism\'s most famous ambassador.',
    },
  },
  'Piet Mondrian': {
    name: 'Piet Mondrian',
    born: '1872', died: '1944', nationality: 'Dutch',
    bio: {
      zh: '蒙德里安从风景画起步，逐步简化到只剩直线和原色。他在纽约度过了最后几年，爵士乐的节奏启发了他最后的杰作《百老汇爵士乐》。',
      en: 'Mondrian started with landscapes, progressively simplifying to just lines and primary colors. He spent his final years in New York, where jazz rhythms inspired his last masterpiece, Broadway Boogie Woogie.',
    },
  },
  '葛飾北斎 Hokusai': {
    name: 'Katsushika Hokusai',
    born: '1760', died: '1849', nationality: 'Japanese',
    bio: {
      zh: '北斋一生改名30多次，搬家93次。他在70岁时创作了《富岳三十六景》系列，包括那幅著名的《神奈川冲浪里》。他说"到110岁，我画的每一点每一线都将栩栩如生"。',
      en: 'Hokusai changed his name 30+ times and moved 93 times. At 70 he created Thirty-six Views of Mount Fuji, including the famous Great Wave. He said "at 110, every dot and line I draw will be alive."',
    },
  },
  '齐白石 Qi Baishi': {
    name: 'Qi Baishi',
    born: '1864', died: '1957', nationality: 'Chinese',
    bio: {
      zh: '齐白石原是木匠，27岁才开始学画。他最擅长画虾、蟹、鸡等日常之物，用最朴素的题材达到了最高的艺术境界。1953年获"人民艺术家"称号。',
      en: 'Qi Baishi was a carpenter who began painting at 27. He excelled at everyday subjects — shrimp, crabs, chickens — achieving the highest artistry through the simplest themes. Named "People\'s Artist" in 1953.',
    },
  },
  '张大千 Zhang Daqian': {
    name: 'Zhang Daqian',
    born: '1899', died: '1983', nationality: 'Chinese',
    bio: {
      zh: '张大千被毕加索称为"东方最杰出的画家"。他早年以临摹古画闻名，晚年发明泼墨泼彩法，融合东西方技法，创造了独特的现代水墨风格。',
      en: 'Zhang Daqian was called "the most distinguished Eastern painter" by Picasso. Known for copying ancient masters in his youth, he later invented splash-ink technique, blending Eastern and Western methods.',
    },
  },
}
