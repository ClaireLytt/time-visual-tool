import { useState, useMemo } from 'react';
import { useGameStore } from '../core/store';
import { getAllCollectibles, getCollectiblesForAct } from '../core/constants';
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

export default function InventoryJournal({ open, onClose }: Props) {
  const collectedItems = useGameStore((s) => s.collectedItems);
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
        position: 'fixed', inset: 0, zIndex: 180,
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
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#c5a55a', letterSpacing: '0.08em' }}>
            📖 收集日记
          </h3>

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
        </div>

        {/* Right page: selected item content */}
        <div style={{
          flex: 1, padding: '1.5rem',
          display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(145deg, rgba(232,220,200,0.04), rgba(216,204,180,0.02))',
        }}>
          {selected ? (
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
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}
