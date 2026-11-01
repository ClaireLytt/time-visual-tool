/**
 * Grammar exercises — dedicated practice for tenses, voice, clauses.
 * Each exercise group covers one grammar topic with multiple questions.
 */

export interface GrammarQuestion {
  question: string;
  questionZh: string;
  options: string[];
  correctIdx: number;
  explanation: string;
  explanationZh: string;
}

export interface GrammarExercise {
  id: string;
  topic: string;
  topicZh: string;
  icon: string;
  /** Brief rule explanation shown before questions */
  rule: string;
  ruleZh: string;
  questions: GrammarQuestion[];
}

export const GRAMMAR_EXERCISES: GrammarExercise[] = [
  {
    id: 'gr-past-simple',
    topic: 'Past Simple Tense',
    topicZh: '一般过去时',
    icon: '⏰',
    rule: 'Past simple describes completed actions. Regular verbs add -ed; irregular verbs change form (sing→sang, go→went).',
    ruleZh: '一般过去时描述已完成的动作。规则动词加-ed；不规则动词变形。',
    questions: [
      {
        question: 'Christine _____ beautifully on the stage last night.',
        questionZh: '克里斯汀昨晚在舞台上唱得很动听。',
        options: ['sing', 'sang', 'sung', 'sings'],
        correctIdx: 1,
        explanation: '"Sang" is the past simple of "sing" (sing→sang→sung). "Last night" signals past tense.',
        explanationZh: 'sang是sing的过去式。"last night"表明是过去时。',
      },
      {
        question: 'The chandelier _____ from the ceiling during the performance.',
        questionZh: '吐灯在演出期间从天花板上坠落。',
        options: ['falls', 'fell', 'fallen', 'falling'],
        correctIdx: 1,
        explanation: '"Fell" is the past simple of "fall" (fall→fell→fallen). The performance is a completed event.',
        explanationZh: 'fell是fall的过去式。演出是已完成的事件。',
      },
      {
        question: 'The Phantom _____ in the shadows for years.',
        questionZh: '魅影在阴影中生活了很多年。',
        options: ['live', 'lived', 'living', 'lives'],
        correctIdx: 1,
        explanation: '"Lived" is regular past simple (live + d). "For years" describes a completed duration.',
        explanationZh: 'lived是规则动词过去式(live+d)。"for years"描述已经结束的时段。',
      },
    ],
  },
  {
    id: 'gr-passive-voice',
    topic: 'Passive Voice',
    topicZh: '被动语态',
    icon: '🔄',
    rule: 'Passive voice: subject receives the action. Form: be + past participle. Use when the doer is unknown or unimportant.',
    ruleZh: '被动语态：主语接受动作。结构：be + 过去分词。当执行者未知或不重要时使用。',
    questions: [
      {
        question: 'Box Five must _____ empty at all times.',
        questionZh: '五号包厢必须始终保持空置。',
        options: ['keep', 'be kept', 'keeping', 'kept'],
        correctIdx: 1,
        explanation: '"Must be kept" is passive: the box receives the action of being kept empty. Subject = Box Five.',
        explanationZh: '"must be kept"是被动：包厢接受“被保持空置”的动作。',
      },
      {
        question: 'The rope _____ by a sharp blade.',
        questionZh: '绳索被一把锋利的刀割断了。',
        options: ['cut', 'was cut', 'cutting', 'has cut'],
        correctIdx: 1,
        explanation: '"Was cut" is past passive. The rope didn\'t cut itself — someone cut it.',
        explanationZh: '"was cut"是过去被动。绳索不是自己断的——是被人割断的。',
      },
      {
        question: 'The opera _____ by the Phantom himself.',
        questionZh: '这部歌剧是魅影亲自写的。',
        options: ['wrote', 'was written', 'writing', 'written'],
        correctIdx: 1,
        explanation: '"Was written" is past passive. "By the Phantom" tells us who did it.',
        explanationZh: '"was written"是过去被动。"by the Phantom"告诉我们执行者。',
      },
    ],
  },
  {
    id: 'gr-conditionals',
    topic: 'Conditional Sentences',
    topicZh: '条件句',
    icon: '🔀',
    rule: 'If + past simple, would + base verb (Second conditional: unreal/hypothetical situations). "If I were..." is formal.',
    ruleZh: '第二条件句：If + 过去式, would + 原形（表示不真实/假设情况）。"If I were..."是正式用法。',
    questions: [
      {
        question: 'If Christine _____ behind the mirror, she would see another world.',
        questionZh: '如果克里斯汀看到镜子后面，她会看到另一个世界。',
        options: ['looks', 'looked', 'looking', 'will look'],
        correctIdx: 1,
        explanation: 'Second conditional: "If + past simple (looked), would + base verb." Describes a hypothetical.',
        explanationZh: '第二条件句：If + 过去式(looked), would + 原形。描述假设情况。',
      },
      {
        question: 'If the Phantom _____ not disfigured, his life would have been different.',
        questionZh: '如果魅影没有畸形，他的生活会不同。',
        options: ['is', 'was', 'were', 'be'],
        correctIdx: 2,
        explanation: '"If I/he/she were..." uses "were" for all subjects in formal conditional. This is the subjunctive mood.',
        explanationZh: '正式条件句中所有主语都用were（虚拟语气）。',
      },
      {
        question: 'She would never have sung if Carlotta _____ not refused.',
        questionZh: '如果卡洛塔没有拒绝，她永远不会上台演唱。',
        options: ['has', 'had', 'have', 'having'],
        correctIdx: 1,
        explanation: 'Third conditional (past unreal): "If + had + past participle, would have + past participle."',
        explanationZh: '第三条件句（过去不真实）：If + had + 过去分词, would have + 过去分词。',
      },
    ],
  },
  {
    id: 'gr-relative-clauses',
    topic: 'Relative Clauses',
    topicZh: '定语从句',
    icon: '🔗',
    rule: 'Who (people), which (things), that (both), where (places), whose (possession). They add information about a noun.',
    ruleZh: 'who(人), which(物), that(两者), where(地点), whose(所有格)。用来补充名词的信息。',
    questions: [
      {
        question: 'The man _____ lived beneath the opera house was a genius.',
        questionZh: '住在歌剧院下方的那个人是个天才。',
        options: ['which', 'who', 'where', 'whom'],
        correctIdx: 1,
        explanation: '"Who" refers to people. "The man who lived..." — "who" connects the person to the action.',
        explanationZh: 'who指代人。"The man who lived..." — who把人和动作连接起来。',
      },
      {
        question: 'The mask _____ he wore hid half his face.',
        questionZh: '他戴的那个面具遮住了他半张脸。',
        options: ['who', 'where', 'that', 'whose'],
        correctIdx: 2,
        explanation: '"That" can refer to things. "The mask that he wore" — "that" connects the mask to the wearing.',
        explanationZh: 'that可以指代物。"The mask that he wore" — that把面具和戴的动作连接。',
      },
      {
        question: 'The underground lake _____ he built his lair was dark and cold.',
        questionZh: '他建造密室的地下湖又黑又冷。',
        options: ['who', 'which', 'where', 'that'],
        correctIdx: 2,
        explanation: '"Where" refers to places. "The lake where he built..." — "where" = in which place.',
        explanationZh: 'where指代地点。"The lake where he built..." — where = 在那个地方。',
      },
    ],
  },
  {
    id: 'gr-comparatives',
    topic: 'Comparatives & Superlatives',
    topicZh: '比较级与最高级',
    icon: '📈',
    rule: 'Short adjectives: -er/-est (tall→taller→tallest). Long adjectives: more/most (beautiful→more beautiful→most beautiful).',
    ruleZh: '短形容词加-er/-est；长形容词用more/most。',
    questions: [
      {
        question: 'Christine\'s voice was _____ than Carlotta\'s.',
        questionZh: '克里斯汀的声音比卡洛塔的更美。',
        options: ['beautiful', 'more beautiful', 'most beautiful', 'beautifuler'],
        correctIdx: 1,
        explanation: '"Beautiful" is a long adjective (3+ syllables), so use "more beautiful" for comparison.',
        explanationZh: 'beautiful是长形容词(3个音节以上)，所以用more beautiful比较。',
      },
      {
        question: 'The Phantom was the _____ musician in all of Paris.',
        questionZh: '魅影是整个巴黎最伟大的音乐家。',
        options: ['greater', 'most great', 'greatest', 'more great'],
        correctIdx: 2,
        explanation: '"Great" is a short adjective. Superlative = "the greatest." Irregular: good→best, bad→worst.',
        explanationZh: 'great是短形容词。最高级 = the greatest。不规则: good→best, bad→worst。',
      },
      {
        question: 'His music was _____ haunting than any I had ever heard.',
        questionZh: '他的音乐比我听过的任何音乐都更动人心魄。',
        options: ['more', 'most', 'much', 'very'],
        correctIdx: 0,
        explanation: '"More haunting than" — "haunting" is a long adjective, so use "more" for comparative.',
        explanationZh: '"more haunting than" — haunting是长形容词，所以用more比较。',
      },
    ],
  },
];
