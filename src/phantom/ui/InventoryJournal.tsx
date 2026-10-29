import { Z_PAUSE } from '../core/z-index';
import { useState, useMemo } from 'react';
import { useGameStore } from '../core/store';
import { getAllCollectibles, getCollectiblesForAct } from '../core/constants';
import { ENGLISH_CHALLENGES } from '../core/english-challenges';
import { ActId } from '../core/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ACT_NAMES: Record<number, string> = {
  1: 'Think of Me',
  2: 'The Phantom of the Opera',
  3: 'Music of the Night',
  4: 'All I Ask of You',
  5: 'The Point of No Return',
};

type JournalTab = 'items' | 'vocab';

export default function InventoryJournal({ open, onClose }: Props) {
  const collectedItems = useGameStore((s) => s.collectedItems);
  const learning = useGameStore((s) => s.learning);
  const [tab, setTab] = useState<JournalTab>('items');
  const [selectedAct, setSelectedAct] = useState<ActId>(1);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const actCollectibles = useMemo(
    () => getCollectiblesForAct(selectedAct),
    [selectedAct]
  );

  const allCollectibles = useMemo(() => getAllCollectibles(), []);
  const totalCollected = collectedItems.length;

  const selected = useMemo(
    () => (selectedItem ? allCollectibles.find((c) => c.id === selectedItem) : undefined),
    [selectedItem, allCollectibles]
  );

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: Z_PAUSE,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%', maxWidth: '700px', height: '80vh', maxHeight: '500px',
          display: 'flex',
          background: 'linear-gradient(135deg, #3a2a1a, #2e2014, #3a2a1a)',
          borderRadius: '8px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(200,180,140,0.1)',
          overflow: 'hidden',
          fontFamily: 'Georgia, serif',
          color: '#d8ccb4',
        }}
      >
        {/* Left page: act tabs + item list */}
        <div style={{
          flex: 1, padding: '1.5rem',
          borderRight: '1px solid rgba(100,80,60,0.3)',
          display: 'flex', flexDirection: 'column', gap: '0.8rem',
          overflowY: 'auto',
        }}>
          {/* Journal tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setTab('items')}
              style={{
                fontFamily: 'Georgia, serif', fontSize: '0.9rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: tab === 'items' ? '#c5a55a' : '#6a5a48',
                borderBottom: tab === 'items' ? '2px solid #c5a55a' : '2px solid transparent',
                padding: '0.2rem 0',
              }}
            >
              📖 收集日记
            </button>
            <button
              onClick={() => setTab('vocab')}
              style={{
                fontFamily: 'Georgia, serif', fontSize: '0.9rem',
                background: 'none', border: 'none', cursor: 'pointer',
                color: tab === 'vocab' ? '#8aafb0' : '#6a5a48',
                borderBottom: tab === 'vocab' ? '2px solid #8aafb0' : '2px solid transparent',
                padding: '0.2rem 0',
              }}
            >
              🎓 词汇本
            </button>
            {learning.totalScore > 0 && (
              <span style={{ fontSize: '0.7rem', color: '#6a5a48', marginLeft: 'auto' }}>
                Score: {learning.totalScore}
              </span>
            )}
          </div>

          {tab === 'items' ? (
            <>
              {/* Act tabs */}
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {([1, 2, 3, 4, 5] as ActId[]).map((act) => {
                  const actItems = getCollectiblesForAct(act);
                  const actCollectedCount = actItems.filter((c) => collectedItems.includes(c.id)).length;
                  return (
                    <button
                      key={act}
                      onClick={() => { setSelectedAct(act); setSelectedItem(null); }}
                      style={{
                        padding: '0.25rem 0.6rem',
                        fontSize: '0.7rem',
                        fontFamily: 'Georgia, serif',
                        background: selectedAct === act ? 'rgba(197,165,90,0.15)' : 'transparent',
                        border: `1px solid ${selectedAct === act ? '#c5a55a' : 'rgba(100,80,60,0.3)'}`,
                        borderRadius: '3px',
                        color: selectedAct === act ? '#c5a55a' : '#9a8a78',
                        cursor: 'pointer',
                      }}
                    >
                      第{act}幕 ({actCollectedCount}/{actItems.length})
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.72rem', color: '#6a5a48', fontStyle: 'italic' }}>
                {ACT_NAMES[selectedAct]}
              </div>

              {/* Item list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {actCollectibles.map((item) => {
                  const collected = collectedItems.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => collected ? setSelectedItem(item.id) : undefined}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.6rem',
                        background: selectedItem === item.id
                          ? 'rgba(197,165,90,0.1)'
                          : 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(100,80,60,0.15)',
                        borderRadius: '4px',
                        cursor: collected ? 'pointer' : 'default',
                        fontFamily: 'Georgia, serif',
                        fontSize: '0.82rem',
                        color: collected ? '#d8ccb4' : '#4a3a2e',
                        textAlign: 'left',
                        opacity: collected ? 1 : 0.5,
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>{collected ? '📜' : '❓'}</span>
                      <span>{collected ? item.name : '???'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Total count */}
              <div style={{
                marginTop: 'auto', paddingTop: '0.5rem',
                borderTop: '1px solid rgba(100,80,60,0.2)',
                fontSize: '0.75rem', color: '#6a5a48',
              }}>
                总进度: {totalCollected} / {allCollectibles.length}
              </div>
            </>
          ) : (
            /* Vocabulary tab */
            <>
              <div style={{ fontSize: '0.78rem', color: '#8aafb0', margin: '0 0 0.3rem' }}>
                已完成 {learning.completedChallenges.length} / {ENGLISH_CHALLENGES.length} 个挑战
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1 }}>
                {ENGLISH_CHALLENGES.filter((ch) => learning.completedChallenges.includes(ch.id)).map((ch) => (
                  <div key={ch.id} style={{
                    padding: '0.5rem',
                    background: 'rgba(138,175,176,0.06)',
                    border: '1px solid rgba(138,175,176,0.15)',
                    borderRadius: 4,
                  }}>
                    <p style={{ fontSize: '0.75rem', color: '#8aafb0', margin: '0 0 0.3rem' }}>
                      {ch.source}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: '#c5a55a', fontStyle: 'italic', margin: '0 0 0.2rem' }}>
                      {'"'}{ch.quote}{'"'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                      {ch.vocab.map((v) => (
                        <span key={v.word} style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.4rem',
                          background: 'rgba(197,165,90,0.1)',
                          border: '1px solid rgba(197,165,90,0.2)',
                          borderRadius: 3,
                          color: '#d8ccb4',
                        }}>
                          {v.word} — {v.meaning}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {learning.completedChallenges.length === 0 && (
                  <p style={{ fontSize: '0.82rem', color: '#4a3a2e', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>
                    探索场景，收集物品来解锁英语挑战！
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right page: selected item content or vocab summary */}
        <div style={{
          flex: 1, padding: '1.5rem',
          display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(145deg, rgba(232,220,200,0.04), rgba(216,204,180,0.02))',
        }}>
          {tab === 'items' ? (
            selected ? (
              <>
                <h4 style={{
                  margin: '0 0 0.3rem', fontSize: '1rem',
                  color: '#c5a55a',
                  borderBottom: '1px solid rgba(100,80,60,0.2)',
                  paddingBottom: '0.4rem',
                }}>
                  📜 {selected.name}
                </h4>
                <p style={{
                  fontSize: '0.78rem', color: '#8a7a68',
                  margin: '0 0 0.8rem', fontStyle: 'italic',
                }}>
                  {selected.description}
                </p>
                <div style={{
                  fontSize: '0.88rem', lineHeight: 1.8,
                  whiteSpace: 'pre-wrap', flex: 1,
                  overflowY: 'auto',
                }}>
                  {selected.contentZh}
                </div>
              </>
            ) : (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#4a3a2e', fontSize: '0.85rem', fontStyle: 'italic',
              }}>
                选择左侧物品查看详情
              </div>
            )
          ) : (
            /* Vocab summary panel */
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#8aafb0' }}>
                🎓 学习统计
              </h4>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '0.6rem', marginBottom: '1rem',
              }}>
                <div style={{
                  background: 'rgba(197,165,90,0.08)', borderRadius: 6,
                  padding: '0.6rem', textAlign: 'center',
                }}>
                  <p style={{ fontSize: '1.5rem', margin: 0, color: '#c5a55a' }}>
                    {learning.totalScore}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#6a5a48', margin: 0 }}>总分</p>
                </div>
                <div style={{
                  background: 'rgba(138,175,176,0.08)', borderRadius: 6,
                  padding: '0.6rem', textAlign: 'center',
                }}>
                  <p style={{ fontSize: '1.5rem', margin: 0, color: '#8aafb0' }}>
                    {learning.completedChallenges.length}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#6a5a48', margin: 0 }}>已完成</p>
                </div>
              </div>
              <h4 style={{ fontSize: '0.85rem', color: '#9a8a78', margin: '0 0 0.4rem' }}>
                已学单词
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {ENGLISH_CHALLENGES
                  .filter((ch) => learning.completedChallenges.includes(ch.id))
                  .flatMap((ch) => ch.vocab)
                  .map((v, i) => (
                    <span key={`${v.word}-${i}`} style={{
                      fontSize: '0.72rem',
                      padding: '0.2rem 0.5rem',
                      background: 'rgba(197,165,90,0.08)',
                      borderRadius: 3,
                      color: '#c5a55a',
                    }}>
                      {v.word}
                    </span>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}
