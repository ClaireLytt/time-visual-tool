/** Extra data per painting: first-person quote, museum, value, fun facts */
export interface PaintingExtra {
  /** First-person narration as if the artist is speaking */
  quote: { zh: string; en: string }
  /** Current museum/location */
  museum: string
  /** Estimated value or notable sale info */
  value?: string
  /** Creation duration */
  duration?: string
  /** Times stolen or damaged */
  incidents?: string
  /** CSS animation class for the painting on the wall */
  animClass?: string
}

export const PAINTING_EXTRAS: Record<string, PaintingExtra> = {
  'girl-pearl': {
    quote: {
      zh: '她回头看了我一眼，就那一眼，我用了一辈子去画。珍珠不是重点——重点是她嘴唇上那一点光。',
      en: 'She glanced back at me, just that one glance, and I spent a lifetime painting it. The pearl is not the point — the gleam on her lip is.',
    },
    museum: 'Mauritshuis, The Hague',
    value: 'Priceless (national treasure)',
    duration: 'Unknown, c. 1665',
    incidents: 'Survived WWII hidden in a sand dune',
  },
  'night-watch': {
    quote: {
      zh: '他们付钱让我画群像，我却画了一出戏。每个人都想站在最亮的地方——但光只能照亮一个方向。',
      en: 'They paid me to paint a group portrait. I painted a drama instead. Everyone wanted to stand in the brightest spot — but light only shines one way.',
    },
    museum: 'Rijksmuseum, Amsterdam',
    value: 'Priceless (national treasure)',
    duration: '~2 years (1640-1642)',
    incidents: 'Slashed 3 times, acid attack in 1990',
  },
  'milkmaid': {
    quote: {
      zh: '我画的不是牛奶，是光穿过窗户落在白色液体上那一刻的安静。世界上最美的东西都是安静的。',
      en: 'I did not paint milk. I painted the quiet moment when light falls through a window onto white liquid. The most beautiful things in the world are quiet.',
    },
    museum: 'Rijksmuseum, Amsterdam',
    value: 'Priceless',
    duration: 'c. 1658-1661',
  },
  'starry-night': {
    quote: {
      zh: '我常常觉得夜晚比白天更有生命力，色彩更丰富。你看那些星星——它们不是在发光，它们在呼吸。',
      en: 'I often think the night is more alive and richly colored than the day. Look at those stars — they are not shining, they are breathing.',
    },
    museum: 'MoMA, New York',
    value: '$100M+ (estimated)',
    duration: 'June 1889 (one sitting)',
    incidents: 'Painted from asylum window',
    animClass: 'animate-starry',
  },
  'water-lilies': {
    quote: {
      zh: '我花了很长时间才明白我的睡莲。我种了它们，并不打算画它们——然后突然间，我看到了启示。',
      en: 'It took me a long time to understand my water lilies. I planted them for pleasure, not to paint — then suddenly, I had the revelation.',
    },
    museum: 'Art Institute of Chicago',
    value: '$80M+ (series)',
    duration: '30 years of water lilies (1897-1926)',
    animClass: 'animate-ripple',
  },
  'impression-sunrise': {
    quote: {
      zh: '一位评论家用"印象"这个词嘲笑我。他不知道，他给了我们一个名字，也给了艺术一个新的方向。',
      en: 'A critic used the word "impression" to mock me. He did not know he gave us a name, and gave art a new direction.',
    },
    museum: 'Musée Marmottan Monet, Paris',
    value: 'Priceless',
    duration: 'November 1872',
    incidents: 'Stolen in 1985, recovered 1990',
  },
  'mona-lisa': {
    quote: {
      zh: '她的微笑？那是我故意的。当你直视她的嘴，微笑就消失了。你必须用余光去看——就像真正的幸福一样。',
      en: 'Her smile? That was deliberate. When you look directly at her mouth, the smile vanishes. You must see it with peripheral vision — like real happiness.',
    },
    museum: 'Louvre, Paris',
    value: '$860M (2024 estimate)',
    duration: '~16 years (1503-1519)',
    incidents: 'Stolen 1911, acid attack 1956, rock thrown 2009',
  },
  'birth-venus': {
    quote: {
      zh: '我画的不是女神，是美本身从混沌中诞生的那一刻。看那风——它不是在吹，它是在歌唱。',
      en: 'I did not paint a goddess. I painted the moment beauty itself was born from chaos. See the wind — it does not blow, it sings.',
    },
    museum: 'Uffizi Gallery, Florence',
    value: 'Priceless',
    duration: 'c. 1484-1486',
    incidents: 'Nearly burned in Bonfire of the Vanities',
  },
  'creation-adam': {
    quote: {
      zh: '教皇让我画天花板，我说我是雕塑家。他坚持。于是我躺在18米高的架子上，仰着头画了四年——用疼痛换来了永恒。',
      en: 'The Pope asked me to paint the ceiling. I said I am a sculptor. He insisted. So I lay on scaffolding 18 meters high, painting upward for four years — trading pain for eternity.',
    },
    museum: 'Sistine Chapel, Vatican',
    value: 'Priceless',
    duration: '4 years (1508-1512)',
  },
  'guernica': {
    quote: {
      zh: '绘画不是用来装饰公寓的。它是战争中的进攻和防御武器。',
      en: 'Painting is not made to decorate apartments. It is an instrument of war for attack and defense.',
    },
    museum: 'Museo Reina Sofía, Madrid',
    value: '$200M+ (estimated)',
    duration: '35 days (May-June 1937)',
    incidents: 'Refused to return to Spain until democracy restored (1981)',
  },
  'persistence-memory': {
    quote: {
      zh: '人们问我那些融化的钟表是什么意思。我说：如果我能解释它，我就不需要画它了。',
      en: 'People ask what the melting watches mean. I say: if I could explain it, I would not need to paint it.',
    },
    museum: 'MoMA, New York',
    value: '$150M+ (estimated)',
    duration: 'A few hours',
  },
  'composition-ii': {
    quote: {
      zh: '我剥离了一切——曲线、混合色、阴影。只剩下真理：水平、垂直、三原色。宇宙的语法就是这么简单。',
      en: 'I stripped away everything — curves, blended colors, shadows. Only truth remains: horizontal, vertical, three primary colors. The grammar of the universe is that simple.',
    },
    museum: 'Kunsthaus Zürich',
    value: '$50M+ (similar works)',
    duration: 'c. 1929-1930',
  },
  'great-wave': {
    quote: {
      zh: '到七十三岁，我才稍微理解了动物和植物的本质。到一百一十岁，每一个点、每一条线都将有自己的生命。',
      en: 'At 73, I barely understood the essence of animals and plants. At 110, every dot and every line will have its own life.',
    },
    museum: 'Multiple collections worldwide',
    value: '$2.8M (one print sold 2024)',
    duration: 'c. 1829-1833',
    animClass: 'animate-wave',
  },
  'shrimp': {
    quote: {
      zh: '画虾画了四十年，才知道该去掉什么。一笔下去，要有骨头，有肉，有透明的壳，还有游动的神气。',
      en: 'I painted shrimp for 40 years before knowing what to leave out. One stroke must have bone, flesh, a transparent shell, and the spirit of swimming.',
    },
    museum: 'Beijing Palace Museum',
    value: '$65M (record auction 2017)',
    duration: 'c. 1945',
  },
  'erta-mountain': {
    quote: {
      zh: '不是我在泼墨，是墨自己在流。我只是听水的声音，顺着它走。',
      en: 'I do not splash the ink — the ink flows on its own. I simply listen to the sound of water and follow.',
    },
    museum: 'National Palace Museum, Taipei',
    value: '$35M+ (similar works)',
    duration: 'c. 1947',
  },
}
