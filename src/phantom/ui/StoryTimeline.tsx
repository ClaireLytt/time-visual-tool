/**
 * StoryTimeline — visual chronological timeline of the Phantom story.
 * Fills in as the player progresses through acts. Bilingual.
 */
import { useMemo } from 'react';
import { useGameStore } from '../core/store';

interface TimelineEvent {
  actId: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  triggerKey: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    actId: 1, icon: '🎭',
    title: '幕开', titleEn: 'The Curtain Rises',
    description: '巴黎歌剧院，一场“意外”让卡洛塔拒绝演唱。',
    descriptionEn: 'At the Paris Opera, an "accident" silences Carlotta.',
    triggerKey: 'evt-think-of-me-start',
  },
  {
    actId: 1, icon: '⭐',
    title: '星辰升起', titleEn: 'A Star is Born',
    description: '克里斯汀登台，全场震惊。音乐天使的学生大放异彩。',
    descriptionEn: 'Christine takes the stage. The Angel\'s student shines.',
    triggerKey: 'evt-think-of-me-start',
  },
  {
    actId: 1, icon: '🪞',
    title: '镜中之声', titleEn: 'Voice in the Mirror',
    description: '化妆间的镜子背后，一个神秘的声音在呼唤。',
    descriptionEn: 'Behind the dressing room mirror, a mysterious voice calls.',
    triggerKey: 'evt-act1-end',
  },
  {
    actId: 2, icon: '🕯️',
    title: '地下世界', titleEn: 'The World Below',
    description: '螺旋石梯、地下隧道、烛光照亮的湖面。',
    descriptionEn: 'Spiral stairs, underground tunnels, a candlelit lake.',
    triggerKey: 'evt-mirror-open',
  },
  {
    actId: 2, icon: '🎹',
    title: '音乐之宫', titleEn: 'Palace of Music',
    description: '魅影的密室——管风琴、蜡烛、地下湖的倒影。',
    descriptionEn: 'The Phantom\'s lair — organ, candles, reflections on water.',
    triggerKey: 'evt-act2-end',
  },
  {
    actId: 3, icon: '🌙',
    title: '夜之音乐', titleEn: 'Music of the Night',
    description: '管风琴的旋律充满整个密室。他为她演奏了一生的作品。',
    descriptionEn: 'The organ fills the chamber. He plays his life\'s work for her.',
    triggerKey: 'evt-music-of-night-start',
  },
  {
    actId: 3, icon: '😱',
    title: '揭面', titleEn: 'Unmasked',
    description: '克里斯汀揭开了他的面具。光亮的瞬间，真相显露。',
    descriptionEn: 'Christine removes his mask. In a flash of light, the truth is revealed.',
    triggerKey: 'evt-act3-end',
  },
  {
    actId: 4, icon: '🌙',
    title: '月光下的诺言', titleEn: 'Promises Under Moonlight',
    description: '屋顶上，克里斯汀和拉乌尔许下爱的诺言。',
    descriptionEn: 'On the rooftop, Christine and Raoul pledge their love.',
    triggerKey: 'evt-all-i-ask-start',
  },
  {
    actId: 4, icon: '💢',
    title: '愤怒的哭号', titleEn: 'A Cry of Rage',
    description: '魅影在阴影中听到了一切。悲伤变成了愤怒。',
    descriptionEn: 'The Phantom hears everything. Sorrow becomes rage.',
    triggerKey: 'evt-act4-end',
  },
  {
    actId: 5, icon: '🎶',
    title: '最后的演出', titleEn: 'The Final Performance',
    description: '魅影亲自登台，与克里斯汀唱出他的歌剧。',
    descriptionEn: 'The Phantom takes the stage, singing his opera with Christine.',
    triggerKey: 'evt-point-of-no-return-start',
  },
  {
    actId: 5, icon: '💋',
    title: '一个吻', titleEn: 'A Kiss',
    description: '不是因为爱情，而是因为慈悲。因为理解。',
    descriptionEn: 'Not from love, but from compassion. From understanding.',
    triggerKey: 'evt-kiss-scene',
  },
  {
    actId: 5, icon: '🎭',
    title: '只留下一个面具', titleEn: 'Only a Mask Remains',
    description: '他消失在黑暗中。只留下音乐和一个白色面具。',
    descriptionEn: 'He vanishes into darkness. Only music and a white mask remain.',
    triggerKey: 'evt-kiss-scene',
  },
];

const ACT_COLORS: Record<number, string> = {
  1: '#c5a55a', 2: '#8aafb0', 3: '#b07070', 4: '#9a8a78', 5: '#a08a6a',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function StoryTimeline({ open, onClose }: Props) {
  const triggeredEvents = useGameStore((s) => s.triggeredEvents);

  const unlockedEvents = useMemo(() => {
    return TIMELINE_EVENTS.filter((e) => triggeredEvents.includes(e.triggerKey));
  }, [triggeredEvents]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 210,
        background: 'rgba(10,9,8,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 500, maxHeight: '85vh',
          background: 'linear-gradient(135deg, #1a1816, #221f1c)',
          border: '1px solid #2a2420',
          borderRadius: 8,
          padding: '1.5rem',
          overflowY: 'auto',
        }}
      >
        <p style={{
          fontSize: '0.65rem', color: '#4a3a2e',
          letterSpacing: '0.15em', margin: '0 0 1rem',
          textAlign: 'center',
        }}>
          STORY TIMELINE ({unlockedEvents.length}/{TIMELINE_EVENTS.length})
        </p>

        {/* Timeline */}
        <div style={{ position: 'relative', paddingLeft: 30 }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: 12, top: 0, bottom: 0,
            width: 2, background: '#2a2420',
          }} />

          {TIMELINE_EVENTS.map((evt, i) => {
            const isUnlocked = triggeredEvents.includes(evt.triggerKey);
            const color = ACT_COLORS[evt.actId] || '#6a5a48';
            return (
              <div key={i} style={{
                position: 'relative',
                marginBottom: '1rem',
                opacity: isUnlocked ? 1 : 0.25,
              }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute', left: -22, top: 4,
                  width: 12, height: 12,
                  borderRadius: '50%',
                  background: isUnlocked ? color : '#1a1816',
                  border: `2px solid ${isUnlocked ? color : '#2a2420'}`,
                }} />

                {/* Content */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{isUnlocked ? evt.icon : '❓'}</span>
                    <span style={{ fontSize: '0.85rem', color: isUnlocked ? color : '#3a3228', fontWeight: 'bold' }}>
                      {isUnlocked ? evt.title : '???'}
                    </span>
                    <span style={{ fontSize: '0.6rem', color: '#3a3228' }}>
                      Act {evt.actId}
                    </span>
                  </div>
                  {isUnlocked && (
                    <>
                      <p style={{ fontSize: '0.78rem', color: '#9a8a78', margin: '0 0 0.1rem' }}>
                        {evt.description}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: '#5a5a50', fontStyle: 'italic', margin: 0 }}>
                        {evt.descriptionEn}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
