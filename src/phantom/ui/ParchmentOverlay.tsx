import { useCallback, useMemo } from 'react';
import { getAllCollectibles } from '../core/constants';

interface Props {
  itemId: string | null;
  onClose: () => void;
}

export default function ParchmentOverlay({ itemId, onClose }: Props) {
  // Hooks must run before any early return
  const handleClick = useCallback(() => onClose(), [onClose]);
  const item = useMemo(
    () => (itemId ? getAllCollectibles().find((c) => c.id === itemId) : undefined),
    [itemId]
  );

  if (!itemId || !item) return null;

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, cursor: 'pointer',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '500px', width: '90%',
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
        <p style={{
          marginTop: '1.5rem',
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
