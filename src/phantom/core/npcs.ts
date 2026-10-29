/**
 * NPC dialogue trees — characters the player can freely talk to.
 * Each NPC has multiple topics that unlock based on story progress.
 */
import { NPCConfig } from './types';

export const NPCS: NPCConfig[] = [
  {
    id: 'madame-giry',
    name: '吉里夫人',
    nameEn: 'Madame Giry',
    icon: '🩰',
    areaIds: ['theater-audience', 'theater-backstage', 'dressing-room'],
    positions: {
      'theater-audience': { x: 150, y: 400 },
      'theater-backstage': { x: 300, y: 350 },
      'dressing-room': { x: 700, y: 380 },
    },
    greeting: '孩子，你想知道什么？',
    greetingEn: 'Child, what do you wish to know?',
    topics: [
      {
        id: 'giry-phantom-origin',
        label: '魅影是谁？',
        labelEn: 'Who is the Phantom?',
        response: [
          { speaker: 'Madame Giry', text: '他的名字是埃里克。我在马戏团第一次见到他时，他还是个孩子。', textEn: 'His name is Erik. When I first saw him in the circus, he was just a child.', mood: 'sad' },
          { speaker: 'Madame Giry', text: 'They called him the "living corpse." He was kept in a cage.', textEn: 'They called him the "living corpse." He was kept in a cage.', mood: 'sad' },
          { speaker: 'Madame Giry', text: '我帮他逃了出来。带他来到了这座歌剧院。这是我一生做过的最正确的事。', textEn: 'I helped him escape. Brought him to this opera house. It was the most right thing I have ever done.', mood: 'tender' },
        ],
        vocabWord: 'circus',
        vocabMeaning: '马戏团',
      },
      {
        id: 'giry-box-five',
        label: '五号包厢的规矩',
        labelEn: 'The rules of Box Five',
        response: [
          { speaker: 'Madame Giry', text: '五号包厢必须始终空置。这是他的条件。', textEn: 'Box Five must always remain empty. That is his condition.', mood: 'neutral' },
          { speaker: 'Madame Giry', text: 'He also requires a salary of twenty thousand francs a month. The managers think it is extortion. I think it is rent.', textEn: 'He also requires a salary of twenty thousand francs a month. The managers think it is extortion. I think it is rent.', mood: 'neutral' },
        ],
        vocabWord: 'extortion',
        vocabMeaning: '勒索，敲诈',
      },
      {
        id: 'giry-christine',
        label: '你对克里斯汀怎么看？',
        labelEn: 'What do you think of Christine?',
        requireTriggers: ['think-of-me-start'],
        response: [
          { speaker: 'Madame Giry', text: '她有天赋。但天赋是一把双刃剑。', textEn: 'She has talent. But talent is a double-edged sword.', mood: 'neutral' },
          { speaker: 'Madame Giry', text: 'Erik gave her a voice. But he also gave her a cage made of music.', textEn: 'Erik gave her a voice. But he also gave her a cage made of music.', mood: 'sad' },
        ],
        vocabWord: 'double-edged',
        vocabMeaning: '双刃的，有利有弊的',
      },
      {
        id: 'giry-advice',
        label: '有什么建议？',
        labelEn: 'Any advice?',
        response: [
          { speaker: 'Madame Giry', text: 'Be careful what doors you open. Some lead to wonders. Others lead to places from which you cannot return.', textEn: 'Be careful what doors you open. Some lead to wonders. Others lead to places from which you cannot return.', mood: 'neutral' },
          { speaker: 'Madame Giry', text: '而有些门——两者兼而有之。', textEn: 'And some doors... are both.', mood: 'neutral' },
        ],
        vocabWord: 'wonder',
        vocabMeaning: '奇迹，奇观',
      },
    ],
  },
  {
    id: 'manager-andre',
    name: '安德烈经理',
    nameEn: 'Manager André',
    icon: '🧑‍💼',
    areaIds: ['theater-audience'],
    positions: {
      'theater-audience': { x: 600, y: 420 },
    },
    greeting: '又是什么事？我很忙！',
    greetingEn: 'What is it now? I\'m very busy!',
    topics: [
      {
        id: 'andre-ghost',
        label: '你相信歌剧鬼魂吗？',
        labelEn: 'Do you believe in the Opera Ghost?',
        response: [
          { speaker: 'Manager', text: 'Ghost? Nonsense! There is no ghost!', textEn: 'Ghost? Nonsense! There is no ghost!', mood: 'angry' },
          { speaker: 'Manager', text: '只是…为什么每个月都要付两万法郎给一个不存在的人，我就不明白了。', textEn: 'It\'s just... why we pay twenty thousand francs a month to someone who doesn\'t exist, I will never understand.', mood: 'fearful' },
        ],
        vocabWord: 'nonsense',
        vocabMeaning: '胡说，废话',
      },
      {
        id: 'andre-carlotta',
        label: '卡洛塔怎么了？',
        labelEn: 'What happened to Carlotta?',
        requireTriggers: ['think-of-me-start'],
        response: [
          { speaker: 'Manager', text: '卡洛塔夫人拒绝再演唱。她说这里闹鬼。她的合同里可没写闹鬼这一条！', textEn: 'Carlotta refuses to sing. She says the place is haunted. Her contract says nothing about ghosts!', mood: 'angry' },
        ],
        vocabWord: 'haunted',
        vocabMeaning: '闹鬼的，有幽灵的',
      },
    ],
  },
  {
    id: 'stagehand',
    name: '舞台工人约瑟夫',
    nameEn: 'Joseph Buquet',
    icon: '🛠️',
    areaIds: ['theater-stage', 'theater-backstage'],
    positions: {
      'theater-stage': { x: 200, y: 350 },
      'theater-backstage': { x: 800, y: 300 },
    },
    greeting: '嘿，小声点。他可能在听。',
    greetingEn: 'Shh, keep your voice down. He might be listening.',
    topics: [
      {
        id: 'buquet-seen',
        label: '你见过魅影吗？',
        labelEn: 'Have you ever seen the Phantom?',
        response: [
          { speaker: 'Joseph', text: '见过。一次。在后台的阴影里。', textEn: 'Once. In the shadows backstage.', mood: 'fearful' },
          { speaker: 'Joseph', text: 'He has no nose. His eyes glow like embers in the dark. And he moves without making a sound — like smoke.', textEn: 'He has no nose. His eyes glow like embers in the dark. And he moves without making a sound — like smoke.', mood: 'fearful' },
          { speaker: 'Joseph', text: '我建议你不要去找他。但我知道你会去的。', textEn: 'I suggest you don\'t go looking for him. But I know you will.', mood: 'neutral' },
        ],
        vocabWord: 'ember',
        vocabMeaning: '余烬，火星',
      },
      {
        id: 'buquet-rope',
        label: '绳索是怎么断的？',
        labelEn: 'How did the rope break?',
        requireTriggers: ['think-of-me-start'],
        response: [
          { speaker: 'Joseph', text: 'Cut clean. A blade, not wear. Someone who knows knots — and knows how to untie them forever.', textEn: 'Cut clean. A blade, not wear. Someone who knows knots — and knows how to untie them forever.', mood: 'fearful' },
          { speaker: 'Joseph', text: '我检查过所有的绳索。只有那一根被割断了。这不是意外——这是一条信息。', textEn: 'I checked every rope. Only that one was cut. This wasn\'t an accident — it was a message.', mood: 'neutral' },
        ],
        vocabWord: 'blade',
        vocabMeaning: '刀刃',
      },
    ],
  },
  // ── Act 3-5 NPCs ──
  {
    id: 'phantom-npc',
    name: '魅影',
    nameEn: 'The Phantom',
    icon: '🎭',
    areaIds: ['lair', 'final-lair'],
    positions: {
      'lair': { x: 1100, y: 320 },
      'final-lair': { x: 900, y: 350 },
    },
    greeting: '...you should not be here.',
    greetingEn: '...you should not be here.',
    topics: [
      {
        id: 'phantom-music',
        label: '你的音乐很美',
        labelEn: 'Your music is beautiful',
        response: [
          { speaker: 'Phantom', text: 'Music is the only language I was ever fluent in.', textEn: 'Music is the only language I was ever fluent in.', mood: 'sad' as const },
          { speaker: 'Phantom', text: '人们听到我的音乐时会哭泣。但看到我的脸时也会哭泣——出于不同的原因。', textEn: 'People weep when they hear my music. They also weep when they see my face — for different reasons.', mood: 'sad' as const },
        ],
        vocabWord: 'fluent',
        vocabMeaning: '流利的',
      },
      {
        id: 'phantom-don-juan',
        label: '《唐璐的胜利》是什么？',
        labelEn: 'What is Don Juan Triumphant?',
        requireTriggers: ['music-of-night-start'],
        response: [
          { speaker: 'Phantom', text: 'It is my life\'s work. Every note is a confession. Every chord is a memory.', textEn: 'It is my life\'s work. Every note is a confession. Every chord is a memory.', mood: 'tender' as const },
          { speaker: 'Phantom', text: '当它终于上演的那天，世界会听到我的声音。不是作为鬼魂，而是作为作曲家。', textEn: 'When it is finally performed, the world will hear my voice. Not as a ghost, but as a composer.', mood: 'triumphant' as const },
        ],
        vocabWord: 'confession',
        vocabMeaning: '忨悔/告白',
      },
    ],
  },
  {
    id: 'christine-npc',
    name: '克里斯汀',
    nameEn: 'Christine',
    icon: '🎵',
    areaIds: ['rooftop', 'theater-performance'],
    positions: {
      'rooftop': { x: 800, y: 350 },
      'theater-performance': { x: 700, y: 380 },
    },
    greeting: '你也来这里了…',
    greetingEn: 'You\'re here too...',
    topics: [
      {
        id: 'christine-angel',
        label: '音乐天使是真的吗？',
        labelEn: 'Is the Angel of Music real?',
        response: [
          { speaker: 'Christine', text: '我父亲说，当我准备好的时候，天使会来。', textEn: 'My father said when I was ready, the Angel would come.', mood: 'sad' as const },
          { speaker: 'Christine', text: 'He came. But angels don\'t live in darkness. Angels don\'t weep.', textEn: 'He came. But angels don\'t live in darkness. Angels don\'t weep.', mood: 'sad' as const },
        ],
        vocabWord: 'guardian',
        vocabMeaning: '守护者',
      },
      {
        id: 'christine-choice',
        label: '你会选择谁？',
        labelEn: 'Who will you choose?',
        requireTriggers: ['all-i-ask-start'],
        response: [
          { speaker: 'Christine', text: 'I don\'t choose between them. I choose between two worlds — the light above and the music below.', textEn: 'I don\'t choose between them. I choose between two worlds — the light above and the music below.', mood: 'tender' as const },
          { speaker: 'Christine', text: '有时候，最残忍的选择是在两个你都爱的事物之间。', textEn: 'Sometimes the cruelest choice is between two things you love.', mood: 'sad' as const },
        ],
        vocabWord: 'dilemma',
        vocabMeaning: '困境/两难',
      },
    ],
  },
  {
    id: 'raoul-npc',
    name: '拉乌尔',
    nameEn: 'Raoul',
    icon: '⚔️',
    areaIds: ['rooftop'],
    positions: {
      'rooftop': { x: 500, y: 330 },
    },
    greeting: 'We must be careful. He is always watching.',
    greetingEn: 'We must be careful. He is always watching.',
    topics: [
      {
        id: 'raoul-plan',
        label: '你有什么计划？',
        labelEn: 'What is your plan?',
        response: [
          { speaker: 'Raoul', text: 'We perform his opera. We lure him out. And then — we end this.', textEn: 'We perform his opera. We lure him out. And then — we end this.', mood: 'neutral' as const },
          { speaker: 'Raoul', text: '我不怕他。我只怕失去她。', textEn: 'I\'m not afraid of him. I\'m only afraid of losing her.', mood: 'tender' as const },
        ],
        vocabWord: 'lure',
        vocabMeaning: '引诱/诱饵',
      },
    ],
  },
];

/** Get NPCs available in a specific area */
export function getNPCsForArea(areaId: string): NPCConfig[] {
  return NPCS.filter((npc) => npc.areaIds.includes(areaId));
}

/** Get available topics based on triggered events */
export function getAvailableTopics(
  npc: NPCConfig,
  triggeredEvents: string[]
): NPCConfig['topics'] {
  return npc.topics.filter((t) => {
    if (!t.requireTriggers || t.requireTriggers.length === 0) return true;
    return t.requireTriggers.every((tr) => triggeredEvents.includes('evt-' + tr));
  });
}
