/**
 * WeeklyChallenge — rotating themed vocabulary pack that changes weekly.
 * Each week focuses on a theme (music, emotions, architecture, etc.)
 * with 5 themed questions.
 */
import { useState, useCallback } from 'react';
import { Z_TOOL } from '../core/z-index';
import { playCorrect, playWrong } from '../audio/ui-sfx';
import { recordActivity } from './LearningCalendar';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface WeeklyQuestion {
  question: string;
  questionZh: string;
  options: string[];
  correctIdx: number;
}

interface WeeklyPack {
  theme: string;
  themeZh: string;
  icon: string;
  words: { word: string; meaning: string }[];
  questions: WeeklyQuestion[];
}

const WEEKLY_PACKS: WeeklyPack[] = [
  {
    theme: 'Music & Performance',
    themeZh: '音乐与表演',
    icon: '🎵',
    words: [
      { word: 'aria', meaning: '咏叹调' },
      { word: 'libretto', meaning: '歌剧剧本' },
      { word: 'soprano', meaning: '女高音' },
      { word: 'crescendo', meaning: '渐强' },
      { word: 'encore', meaning: '返场/再来一次' },
    ],
    questions: [
      { question: 'A solo vocal piece in an opera is called an _____.',questionZh: '歌剧中的独唱曲叫做_____。', options: ['aria', 'libretto', 'encore', 'crescendo'], correctIdx: 0 },
      { question: 'The text/script of an opera is the _____.',questionZh: '歌剧的文本/剧本叫做_____。', options: ['soprano', 'libretto', 'aria', 'encore'], correctIdx: 1 },
      { question: 'A female singer with the highest voice range is a _____.',questionZh: '声音最高的女歌手叫做_____。', options: ['crescendo', 'encore', 'soprano', 'aria'], correctIdx: 2 },
      { question: 'Music gradually getting louder is called a _____.',questionZh: '音乐逐渐变强叫做_____。', options: ['aria', 'crescendo', 'libretto', 'soprano'], correctIdx: 1 },
      { question: 'When the audience demands another performance, they shout "_____!"',questionZh: '观众要求再演一次时大喊"_____！"', options: ['aria', 'soprano', 'crescendo', 'encore'], correctIdx: 3 },
    ],
  },
  {
    theme: 'Architecture & Places',
    themeZh: '建筑与地点',
    icon: '🏛️',
    words: [
      { word: 'facade', meaning: '外表/门面' },
      { word: 'corridor', meaning: '走廊' },
      { word: 'vault', meaning: '拱顶/地窖' },
      { word: 'labyrinth', meaning: '迷宫' },
      { word: 'balcony', meaning: '阳台/包厢' },
    ],
    questions: [
      { question: 'The front face of a building is its _____.',questionZh: '建筑的正面叫做_____。', options: ['vault', 'facade', 'corridor', 'balcony'], correctIdx: 1 },
      { question: 'A long narrow passageway is a _____.',questionZh: '一条狭长的通道叫做_____。', options: ['corridor', 'labyrinth', 'balcony', 'facade'], correctIdx: 0 },
      { question: 'An arched ceiling or underground chamber is a _____.',questionZh: '拱形天花板或地下室叫做_____。', options: ['balcony', 'facade', 'vault', 'corridor'], correctIdx: 2 },
      { question: 'A complex maze of passages is a _____.',questionZh: '复杂的通道迷宫叫做_____。', options: ['facade', 'labyrinth', 'vault', 'balcony'], correctIdx: 1 },
      { question: 'An elevated platform overlooking the stage is a _____.',questionZh: '俶瞰舞台的高台叫做_____。', options: ['corridor', 'vault', 'facade', 'balcony'], correctIdx: 3 },
    ],
  },
  {
    theme: 'Emotions & Feelings',
    themeZh: '情感与感受',
    icon: '❤️',
    words: [
      { word: 'anguish', meaning: '极度痛苦' },
      { word: 'yearning', meaning: '渴望' },
      { word: 'melancholy', meaning: '忧郁' },
      { word: 'ecstasy', meaning: '狂喜' },
      { word: 'remorse', meaning: '懊悔' },
    ],
    questions: [
      { question: 'Extreme mental suffering is _____.',questionZh: '极度的精神痛苦叫做_____。', options: ['ecstasy', 'anguish', 'yearning', 'melancholy'], correctIdx: 1 },
      { question: 'A deep longing for something is _____.',questionZh: '对某事物的深切渴望叫做_____。', options: ['remorse', 'melancholy', 'yearning', 'anguish'], correctIdx: 2 },
      { question: 'A gentle, persistent sadness is _____.',questionZh: '温和而持久的悲伤叫做_____。', options: ['melancholy', 'ecstasy', 'anguish', 'remorse'], correctIdx: 0 },
      { question: 'Overwhelming happiness or joy is _____.',questionZh: '压倒性的幸福或喜悦叫做_____。', options: ['yearning', 'remorse', 'anguish', 'ecstasy'], correctIdx: 3 },
      { question: 'Deep regret for wrongdoing is _____.',questionZh: '对错误行为的深切后悔叫做_____。', options: ['melancholy', 'yearning', 'remorse', 'ecstasy'], correctIdx: 2 },
    ],
  },
  {
    theme: 'Light & Darkness',
    themeZh: '光与暗',
    icon: '🌙',
    words: [
      { word: 'luminous', meaning: '发光的' },
      { word: 'obscure', meaning: '暗晦的/陊生的' },
      { word: 'glimmer', meaning: '微光' },
      { word: 'silhouette', meaning: '剔影' },
      { word: 'radiant', meaning: '光芒四射的' },
    ],
    questions: [
      { question: 'Something that gives off light is _____.',questionZh: '发出光的东西叫做_____。', options: ['obscure', 'luminous', 'silhouette', 'glimmer'], correctIdx: 1 },
      { question: 'Hidden in darkness or not well known means _____.',questionZh: '隐藏在黑暗中或不太知名叫做_____。', options: ['radiant', 'luminous', 'obscure', 'glimmer'], correctIdx: 2 },
      { question: 'A faint, unsteady light is a _____.',questionZh: '微弱不稳定的光叫做_____。', options: ['silhouette', 'glimmer', 'radiant', 'luminous'], correctIdx: 1 },
      { question: 'A dark outline against a lighter background is a _____.',questionZh: '明亮背景下的暗色轮廓叫做_____。', options: ['glimmer', 'obscure', 'luminous', 'silhouette'], correctIdx: 3 },
      { question: 'Shining brightly with joy or health means _____.',questionZh: '因快乐或健康而闪耀叫做_____。', options: ['radiant', 'obscure', 'glimmer', 'silhouette'], correctIdx: 0 },
    ],
  },
];

function getWeekIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.floor(((now.getTime() - start.getTime()) / 86400000 + start.getDay()) / 7);
}

export default function WeeklyChallenge({ open, onClose }: Props) {
  const weekIdx = getWeekIndex();
  const pack = WEEKLY_PACKS[weekIdx % WEEKLY_PACKS.length];

  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = pack.questions[qIdx];

  const selectAnswer = useCallback((idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === question.correctIdx) { setScore((s) => s + 1); playCorrect(); }
    else { playWrong(); }
    recordActivity('challenge');
    setTimeout(() => {
      setSelected(undefined);
      if (qIdx >= pack.questions.length - 1) setFinished(true);
      else setQIdx((i) => i + 1);
    }, 1200);
  }, [selected, question, qIdx, pack.questions.length]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: Z_TOOL,
      background: 'rgba(10,9,8,0.94)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{
        width: '92%', maxWidth: 480, maxHeight: '85vh',
        background: 'linear-gradient(135deg, #1a1816, #221f1c)',
        border: '1px solid #2a2420',
        borderRadius: 8,
        padding: '1.5rem',
        overflowY: 'auto',
      }}>
        <p style={{ fontSize: '0.65rem', color: '#c5a55a', letterSpacing: '0.15em', margin: '0 0 0.3rem', textAlign: 'center' }}>
          WEEKLY CHALLENGE
        </p>
        <p style={{ fontSize: '0.9rem', color: '#c5a55a', textAlign: 'center', margin: '0 0 0.2rem' }}>
          {pack.icon} {pack.theme}
        </p>
        <p style={{ fontSize: '0.72rem', color: '#6a5a48', textAlign: 'center', margin: '0 0 0.8rem' }}>
          {pack.themeZh}
        </p>

        {/* Word list */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: 'center', marginBottom: '1rem' }}>
          {pack.words.map((w) => (
            <span key={w.word} style={{
              fontSize: '0.7rem', padding: '0.2rem 0.5rem',
              background: 'rgba(138,175,176,0.08)', border: '1px solid rgba(138,175,176,0.15)',
              borderRadius: 3, color: '#8aafb0',
            }}>
              {w.word} = {w.meaning}
            </span>
          ))}
        </div>

        {finished ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', margin: '0 0 0.3rem' }}>
              {score >= 4 ? '🏆' : score >= 3 ? '⭐' : '📚'}
            </p>
            <p style={{ fontSize: '1.1rem', color: '#c5a55a', margin: '0 0 0.3rem' }}>
              {score}/{pack.questions.length}
            </p>
            <p style={{ fontSize: '0.82rem', color: '#9a8a78', margin: '0 0 1rem' }}>
              {score >= 4 ? 'Excellent!' : score >= 3 ? 'Good job!' : 'Keep studying!'}
            </p>
            <button onClick={onClose} style={btnStyle}>Close</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.6rem', color: '#4a3a2e', margin: '0 0 0.3rem' }}>
              Question {qIdx + 1}/{pack.questions.length}
            </p>
            <p style={{ fontSize: '0.88rem', color: '#e0d8cc', lineHeight: 1.6, margin: '0 0 0.3rem' }}>
              {question.question}
            </p>
            <p style={{ fontSize: '0.72rem', color: '#6a5a48', margin: '0 0 0.6rem' }}>
              {question.questionZh}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {question.options.map((opt, i) => {
                let bg = 'rgba(197,165,90,0.04)';
                let border = 'rgba(197,165,90,0.15)';
                let color = '#d8ccb4';
                if (selected !== null) {
                  if (i === question.correctIdx) { bg = 'rgba(100,160,100,0.15)'; border = 'rgba(100,160,100,0.4)'; color = '#a0c8a0'; }
                  else if (i === selected) { bg = 'rgba(180,100,100,0.15)'; border = 'rgba(180,100,100,0.4)'; color = '#c89090'; }
                }
                return (
                  <button key={i} onClick={() => selectAnswer(i)} disabled={selected !== null}
                    style={{ fontFamily: 'Georgia, serif', fontSize: '0.85rem', padding: '0.5rem 0.8rem',
                      background: bg, border: `1px solid ${border}`, borderRadius: 6, color,
                      cursor: selected !== null ? 'default' : 'pointer', textAlign: 'left' }}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <button onClick={onClose} style={{ ...btnStyle, color: '#3a3228', borderColor: '#2a2420', marginTop: '0.8rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
          Close
        </button>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  fontFamily: 'Georgia, serif', fontSize: '0.82rem',
  padding: '0.5rem 1.4rem', background: 'transparent',
  border: '1px solid #3a3228', color: '#c5a55a',
  borderRadius: 4, cursor: 'pointer',
};
