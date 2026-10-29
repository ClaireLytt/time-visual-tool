import { Z_ACT_RECAP } from '../core/z-index';
/**
 * ActRecap — summary screen shown between acts.
 * Shows: story recap, words learned, collectibles found, achievements earned.
 */
import { useMemo } from 'react';
import { ActId } from '../core/types';
import { getCollectiblesForAct } from '../core/constants';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { useGameStore } from '../core/store';

interface Props {
  completedAct: ActId;
  onContinue: () => void;
}

const ACT_TITLES: Record<number, string> = {
  1: 'Think of Me',
  2: 'The Phantom of the Opera',
  3: 'Music of the Night',
  4: 'All I Ask of You',
  5: 'The Point of No Return',
};

const ACT_RECAPS_ZH: Record<number, string> = {
  1: '在巴黎歌剧院，一场意外让卡洛塔拒绝演唱。年轻的克里斯汀登上舞台，全场震惊。化妆间的镜子背后，一个神秘的声音在呼唤她…',
  2: '魅影带着克里斯汀穿过镜子，沿着螺旋石梯深入地下。在烛光照亮的地下湖上，她看到了他的世界——一个由音乐和黑暗织成的国度。',
  3: '在魅影的密室里，管风琴的旋律充满了每一个角落。克里斯汀揭开了他的面具，看到了他的真实面容。但她必须离开——拉乌尔在等她。',
  4: '在歌剧院的屋顶，克里斯汀和拉乌尔在月光下许下诺言。但在阴影中，魅影听到了一切。他的悲伤变成了愤怒。',
  5: '最后的演出。魅影亲自登台，与克里斯汀唱出了他写了一生的歌剧。在最后的对峳中，一个吻改变了一切。他放手了。',
};

const ACT_RECAPS_EN: Record<number, string> = {
  1: 'At the Paris Opera, an accident silenced Carlotta. Young Christine took the stage and stunned the audience. Behind the dressing room mirror, a mysterious voice called to her...',
  2: 'The Phantom led Christine through the mirror, down spiral stairs into the depths. On the candlelit underground lake, she saw his world — a kingdom of music and darkness.',
  3: 'In the Phantom\'s lair, the organ\'s melody filled every corner. Christine removed his mask and saw his true face. But she had to leave — Raoul was waiting.',
  4: 'On the opera house rooftop, Christine and Raoul made promises under the moonlight. But in the shadows, the Phantom heard everything. His sorrow turned to rage.',
  5: 'The final performance. The Phantom took the stage himself, singing the opera he spent a lifetime writing. In the final confrontation, a kiss changed everything. He let go.',
};

export default function ActRecap({ completedAct, onContinue }: Props) {
  const collectedItems = useGameStore((s) => s.collectedItems);
  const learning = useGameStore((s) => s.learning);

  const actCollectibles = useMemo(() => getCollectiblesForAct(completedAct), [completedAct]);
  const foundInAct = actCollectibles.filter((c) => collectedItems.includes(c.id));

  const actChallenges = useMemo(() => {
    return ENGLISH_CHALLENGES.filter((ch) => ch.triggerId.startsWith(`act${completedAct}-`));
  }, [completedAct]);
  const completedInAct = actChallenges.filter((ch) => learning.completedChallenges.includes(ch.id));

  const wordsLearned = completedInAct.flatMap((ch) => ch.vocab);

  const btnStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif', fontSize: '0.9rem',
    padding: '0.6rem 2rem', background: 'transparent',
    border: '1px solid #4a3a2e', color: '#c5a55a',
    borderRadius: 4, cursor: 'pointer', letterSpacing: '0.08em',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(to bottom, #0a0908, #1a1816)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: Z_ACT_RECAP, fontFamily: 'Georgia, serif',
      animation: 'recapFadeIn 1s ease-out',
    }}>
      <div style={{
        maxWidth: 520, width: '90%', maxHeight: '85vh',
        overflowY: 'auto', padding: '2rem',
      }}>
        {/* Act title */}
        <p style={{
          fontSize: '0.7rem', color: '#4a3a2e',
          letterSpacing: '0.2em', margin: '0 0 0.3rem',
          textAlign: 'center',
        }}>
          ACT {completedAct} COMPLETE
        </p>
        <h2 style={{
          fontSize: '1.5rem', color: '#c5a55a',
          textAlign: 'center', margin: '0 0 0.3rem',
          letterSpacing: '0.1em',
        }}>
          {ACT_TITLES[completedAct]}
        </h2>
        <div style={{
          width: 40, height: 1, background: '#3a3228',
          margin: '0.8rem auto',
        }} />

        {/* Story recap */}
        <p style={{
          fontSize: '0.88rem', color: '#d8ccb4',
          lineHeight: 1.8, margin: '0 0 0.5rem',
          textAlign: 'center',
        }}>
          {ACT_RECAPS_ZH[completedAct]}
        </p>
        <p style={{
          fontSize: '0.78rem', color: '#7a7a6a',
          fontStyle: 'italic', lineHeight: 1.6,
          margin: '0 0 1.5rem', textAlign: 'center',
        }}>
          {ACT_RECAPS_EN[completedAct]}
        </p>

        {/* Stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '0.6rem', marginBottom: '1.2rem',
        }}>
          <div style={statCardStyle}>
            <span style={{ fontSize: '1.3rem' }}>📜</span>
            <span style={{ fontSize: '1.2rem', color: '#c5a55a', fontWeight: 'bold' }}>
              {foundInAct.length}/{actCollectibles.length}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#6a5a48' }}>Collectibles</span>
          </div>
          <div style={statCardStyle}>
            <span style={{ fontSize: '1.3rem' }}>🎓</span>
            <span style={{ fontSize: '1.2rem', color: '#8aafb0', fontWeight: 'bold' }}>
              {completedInAct.length}/{actChallenges.length}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#6a5a48' }}>Challenges</span>
          </div>
        </div>

        {/* Words learned */}
        {wordsLearned.length > 0 && (
          <div style={{ marginBottom: '1.2rem' }}>
            <p style={{
              fontSize: '0.72rem', color: '#6a5a48',
              letterSpacing: '0.12em', margin: '0 0 0.5rem',
              textAlign: 'center',
            }}>
              WORDS LEARNED
            </p>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
              justifyContent: 'center',
            }}>
              {wordsLearned.map((v) => (
                <span key={v.word} style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.6rem',
                  background: 'rgba(138,175,176,0.1)',
                  border: '1px solid rgba(138,175,176,0.2)',
                  borderRadius: 4, color: '#8aafb0',
                }}>
                  {v.word} — {v.meaning}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Continue button */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={onContinue} style={btnStyle}>
            {completedAct < 5 ? `Continue to Act ${completedAct + 1} →` : 'View Ending →'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes recapFadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}

const statCardStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', gap: '0.2rem',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(100,80,60,0.15)',
  borderRadius: 6, padding: '0.8rem',
};
