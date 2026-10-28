/**
 * Dialogue scenes — scripted conversations triggered at story moments.
 * Each scene can optionally chain into an English learning challenge.
 */
import { DialogueScene } from './types';

export const DIALOGUE_SCENES: DialogueScene[] = [
  // ── Act 1: Think of Me ──
  {
    id: 'dlg-think-of-me',
    actId: 1,
    triggerKey: 'think-of-me-start',
    lines: [
      { speaker: 'Carlotta', text: 'These things do happen!', textEn: 'These things do happen!', mood: 'angry' },
      { speaker: 'Carlotta', text: '我受够了！这种事情总是发生！', mood: 'angry' },
      { speaker: 'Manager', text: '卡洛塔夫人，求求您——', mood: 'fearful' },
      { speaker: 'Carlotta', text: '不！我再也不唱了！让那个所谓的“音乐天使”去找别人吧！', textEn: 'No! I will not sing anymore! Let that so-called "Angel of Music" find someone else!', mood: 'angry' },
      { speaker: 'Madame Giry', text: '我认识一个女孩。克里斯汀·达埃。她可以唱。', textEn: 'I know a girl. Christine Daaé. She can sing.', mood: 'neutral' },
      { speaker: 'Manager', text: '一个合唱团女孩？你在开玩笑！', mood: 'fearful' },
      { speaker: 'Christine', text: '...父亲说过，他会派音乐天使来保护我。', textEn: '...Father said he would send the Angel of Music to protect me.', mood: 'sad' },
      { speaker: 'Christine', text: 'Think of me, think of me fondly...', textEn: 'Think of me, think of me fondly, when we\'ve said goodbye...', mood: 'neutral' },
      { speaker: 'Narrator', text: '全场鸦雀无声。星辰升起。', mood: 'neutral' },
    ],
    challengeId: 'en-act1-note',
  },

  // ── Act 1 End: Mirror scene ──
  {
    id: 'dlg-act1-mirror',
    actId: 1,
    triggerKey: 'act1-end',
    lines: [
      { speaker: 'Phantom', text: 'I am your Angel of Music. Come to me, Angel of Music...', textEn: 'I am your Angel of Music. Come to me, Angel of Music...', mood: 'tender' },
      { speaker: 'Christine', text: '天使…是你吗？你的声音如此美丽…', textEn: 'Angel... is that you? Your voice is so beautiful...', mood: 'fearful' },
      { speaker: 'Phantom', text: '跟我来。跟着音乐走。', textEn: 'Come with me. Follow the music.', mood: 'tender' },
      { speaker: 'Narrator', text: '镜子缓缓向两侧滑开，露出一条幽暗的通道。烛火在远处闪烁。', mood: 'neutral' },
    ],
  },

  // ── Act 2: Mirror opens ──
  {
    id: 'dlg-mirror-open',
    actId: 2,
    triggerKey: 'mirror-open',
    lines: [
      { speaker: 'Phantom', text: 'In sleep he sang to me, in dreams he came...', textEn: 'In sleep he sang to me, in dreams he came...', mood: 'tender' },
      { speaker: 'Christine', text: '那个声音…又来了…它从镜子后面传来…', textEn: 'That voice... again... it comes from behind the mirror...', mood: 'fearful' },
      { speaker: 'Phantom', text: '不要害怕。我是你的老师，你的引导者。', textEn: 'Do not be afraid. I am your teacher, your guide.', mood: 'tender' },
      { speaker: 'Christine', text: 'Those who have seen your face draw back in fear...', textEn: 'Those who have seen your face draw back in fear...', mood: 'fearful' },
      { speaker: 'Phantom', text: '跟我来，到音乐的国度去。', textEn: 'Come with me, to the kingdom of music.', mood: 'tender' },
      { speaker: 'Narrator', text: '他们沿着螺旋石梯向下走去，越来越深，越来越暗。', mood: 'neutral' },
    ],
    challengeId: 'en-act2-score',
  },

  // ── Act 2 End: Arrival at lair ──
  {
    id: 'dlg-act2-end',
    actId: 2,
    triggerKey: 'act2-end',
    lines: [
      { speaker: 'Phantom', text: 'Sing once again with me, our strange duet...', textEn: 'Sing once again with me, our strange duet...', mood: 'tender' },
      { speaker: 'Christine', text: '这里是哪里？烛光…音乐…水上的倒影…', textEn: 'Where is this place? Candlelight... music... reflections on water...', mood: 'fearful' },
      { speaker: 'Phantom', text: '欢迎来到我的音乐之宫。', textEn: 'Welcome to my palace of music.', mood: 'triumphant' },
      { speaker: 'Narrator', text: '地下湖面倒映着千百支纯火，如满天星辰。管风琴声回荡在石壁间。', mood: 'neutral' },
    ],
  },

  // ── Act 3: Music of the Night ──
  {
    id: 'dlg-music-of-night',
    actId: 3,
    triggerKey: 'music-of-night-start',
    lines: [
      { speaker: 'Phantom', text: 'Night-time sharpens, heightens each sensation...', textEn: 'Night-time sharpens, heightens each sensation...', mood: 'tender' },
      { speaker: 'Phantom', text: '夜晚让一切感官变得更加敏锐…', textEn: 'The night sharpens every sense...', mood: 'tender' },
      { speaker: 'Phantom', text: 'Softly, deftly, music shall caress you...', textEn: 'Softly, deftly, music shall caress you...', mood: 'tender' },
      { speaker: 'Phantom', text: '音乐是我唯一的语言。我不会说漂亮的情话，但我可以为你写一首歌。', textEn: 'Music is my only language. I cannot speak pretty words of love, but I can write you a song.', mood: 'sad' },
      { speaker: 'Christine', text: '…好美…这音乐…像在梁上。', textEn: '...so beautiful... this music... it lingers...', mood: 'tender' },
      { speaker: 'Narrator', text: '管风琴的旋律充满了整个密室，像一双无形的手缠绕在心头。', mood: 'neutral' },
    ],
    challengeId: 'en-act3-manuscript',
  },

  // ── Act 3 End: Secret door ──
  {
    id: 'dlg-act3-end',
    actId: 3,
    triggerKey: 'act3-end',
    lines: [
      { speaker: 'Christine', text: '我必须离开这里。拉乌尔在等我。', textEn: 'I must leave this place. Raoul is waiting for me.', mood: 'desperate' },
      { speaker: 'Phantom', text: '你要走？你怎么可以走？我为你做了一切！', textEn: 'You\'re leaving? How can you leave? I have done everything for you!', mood: 'desperate' },
      { speaker: 'Christine', text: '你是我的老师，不是我的囚禁。', textEn: 'You are my teacher, not my captor.', mood: 'sad' },
      { speaker: 'Phantom', text: '...go then. But remember — the Angel of Music is always listening.', textEn: '...go then. But remember — the Angel of Music is always listening.', mood: 'sad' },
      { speaker: 'Narrator', text: '暗门开启，露出一条通往屋顶的马道。冷风突然灌入。', mood: 'neutral' },
    ],
  },

  // ── Act 4: Rooftop love duet ──
  {
    id: 'dlg-all-i-ask',
    actId: 4,
    triggerKey: 'all-i-ask-start',
    lines: [
      { speaker: 'Christine', text: 'Raoul, I\'ve been there, to his world of unending night...', textEn: 'Raoul, I\'ve been there, to his world of unending night...', mood: 'fearful' },
      { speaker: 'Raoul', text: 'Christine, I\'ll protect you. I swear it.', textEn: 'Christine, I\'ll protect you. I swear it.', mood: 'tender' },
      { speaker: 'Christine', text: '他的音乐很美，但他的世界太黑暗了…', textEn: 'His music is beautiful, but his world is too dark...', mood: 'sad' },
      { speaker: 'Raoul', text: 'Say you\'ll share with me one love, one lifetime...', textEn: 'Say you\'ll share with me one love, one lifetime...', mood: 'tender' },
      { speaker: 'Christine', text: 'Say the word and I will follow you...', textEn: 'Say the word and I will follow you...', mood: 'tender' },
      { speaker: 'Narrator', text: '他们相拥在屋顶的月光下。但在阴影中，一个身影正在监视。', mood: 'neutral' },
      { speaker: 'Phantom', text: '...you will curse the day you did not do all that the Phantom asked of you!', textEn: '...you will curse the day you did not do all that the Phantom asked of you!', mood: 'angry' },
    ],
    challengeId: 'en-act4-bouquet',
  },

  // ── Act 4 End ──
  {
    id: 'dlg-act4-end',
    actId: 4,
    triggerKey: 'act4-end',
    lines: [
      { speaker: 'Phantom', text: '你们会后悔的。你们都会后悔的。', textEn: 'You will regret this. You will all regret this.', mood: 'angry' },
      { speaker: 'Narrator', text: '一声悲愤的哭号回荡在歌剧院的屖顶之上，然后消失在夜色中。', mood: 'neutral' },
    ],
  },

  // ── Act 5: Point of No Return ──
  {
    id: 'dlg-point-of-no-return',
    actId: 5,
    triggerKey: 'point-of-no-return-start',
    lines: [
      { speaker: 'Phantom', text: 'You have come here, in pursuit of your deepest urge...', textEn: 'You have come here, in pursuit of your deepest urge...', mood: 'tender' },
      { speaker: 'Phantom', text: 'Past the point of no return, no backward glances...', textEn: 'Past the point of no return, no backward glances...', mood: 'desperate' },
      { speaker: 'Christine', text: 'You have brought me to that moment where words run dry...', textEn: 'You have brought me to that moment where words run dry...', mood: 'tender' },
      { speaker: 'Narrator', text: '观众屏住呼吸。这不是唐璐——这是魅影本人在舞台上。', mood: 'neutral' },
      { speaker: 'Christine', text: '…是你。一直都是你。', textEn: '...it\'s you. It was always you.', mood: 'sad' },
    ],
    challengeId: 'en-act5-program',
  },

  // ── Act 5: Kiss / Final confrontation ──
  {
    id: 'dlg-kiss-scene',
    actId: 5,
    triggerKey: 'kiss-scene',
    lines: [
      { speaker: 'Phantom', text: '你必须做出选择。他的命运在你手中。', textEn: 'You must make your choice. His fate is in your hands.', mood: 'desperate' },
      { speaker: 'Christine', text: '你不是我的天使。你是一个人。一个孤独的、悲伤的、希望被爱的人。', textEn: 'You are not my angel. You are a man. A lonely, sad man who wished to be loved.', mood: 'sad' },
      { speaker: 'Phantom', text: '...Christine...', mood: 'sad' },
      { speaker: 'Narrator', text: '她吻了他。不是因为爱情，而是因为慈悲。因为理解。因为在那一刻，她看见了他。', mood: 'neutral' },
      { speaker: 'Phantom', text: '走吧。带他走。忘了我。', textEn: 'Go. Take him and go. Forget me.', mood: 'sad' },
      { speaker: 'Phantom', text: '…但有时候，请想想我。', textEn: '...but sometimes, think of me.', mood: 'sad' },
      { speaker: 'Narrator', text: '他用披风盖住了所有的镜子，然后消失在黑暗中。只留下一个面具。', mood: 'neutral' },
    ],
    challengeId: 'en-act5-mask',
  },
];

/** Find a dialogue scene by trigger key */
export function getDialogueForTrigger(triggerKey: string): DialogueScene | undefined {
  return DIALOGUE_SCENES.find((d) => d.triggerKey === triggerKey);
}
