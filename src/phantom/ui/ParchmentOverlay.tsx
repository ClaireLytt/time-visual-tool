import { Z_PARCHMENT } from '../core/z-index';
import { useCallback, useMemo } from 'react';
import { getAllCollectibles } from '../core/constants';
import { useGameStore } from '../core/store';

interface Props {
  itemId: string | null;
  onClose: () => void;
}

export default function ParchmentOverlay({ itemId, onClose }: Props) {
  const handleClick = useCallback(() => onClose(), [onClose]);
  const allItems = useMemo(() => getAllCollectibles(), []);
  const collectedItems = useGameStore((s) => s.collectedItems);
  const item = useMemo(
    () => (itemId ? allItems.find((c) => c.id === itemId) : undefined),
    [itemId, allItems]
  );

  // Find related items that player has already collected
  const relatedItems = useMemo(() => {
    if (!item?.relatedIds) return [];
    return item.relatedIds
      .filter((rid) => collectedItems.includes(rid))
      .map((rid) => allItems.find((c) => c.id === rid))
      .filter(Boolean);
  }, [item, collectedItems, allItems]);

  if (!itemId || !item) return null;

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: Z_PARCHMENT, cursor: 'pointer',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
          background: 'linear-gradient(145deg, #e8dcc8, #d8ccb4, #e0d4c0)',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          fontFamily: 'Georgia, serif',
          color: '#3a2a1e',
          cursor: 'default',
          animation: 'scaleIn 0.3s ease-out',
        }}
      >
        <h3 style={{
          margin: '0 0 0.5rem',
          fontSize: '1.2rem',
          borderBottom: '1px solid rgba(100,80,60,0.3)',
          paddingBottom: '0.5rem',
        }}>
          📜 {item.name}
        </h3>
        <p style={{
          fontSize: '0.85rem',
          color: '#6a5a48',
          margin: '0 0 1rem',
          fontStyle: 'italic',
        }}>
          {item.description}
        </p>
        <div style={{
          fontSize: '0.95rem',
          lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
        }}>
          {item.contentZh}
        </div>

        {/* Cross-references to related collectibles */}
        {relatedItems.length > 0 && (
          <div style={{
            marginTop: '1rem',
            paddingTop: '0.8rem',
            borderTop: '1px solid rgba(100,80,60,0.2)',
          }}>
            <p style={{ fontSize: '0.72rem', color: '#8a7a68', margin: '0 0 0.4rem' }}>
              🔗 关联线索：
            </p>
            {relatedItems.map((ri) => ri && (
              <p key={ri.id} style={{
                fontSize: '0.78rem', color: '#6a5a48',
                margin: '0.2rem 0', fontStyle: 'italic',
              }}>
                📜 {ri.name}（第{ri.actId}幕）
              </p>
            ))}
          </div>
        )}

        <p style={{
          marginTop: '1rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#9a8a78',
        }}>
          点击任意处关闭
        </p>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </div>
  );
}
