/**
 * SecretRooms — shows discoverable hidden areas with unlock conditions.
 * Players can enter unlocked secret rooms from this menu.
 */
import { useMemo } from 'react';
import { useGameStore } from '../core/store';
import { SECRET_AREAS, isSecretUnlocked } from '../core/constants';
import { Z_TOOL } from '../core/z-index';
import { Area } from '../core/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onEnterRoom: (areaId: string) => void;
}

export default function SecretRooms({ open, onClose, onEnterRoom }: Props) {
  const collectedItems = useGameStore((s) => s.collectedItems);
  const triggeredEvents = useGameStore((s) => s.triggeredEvents);

  const rooms = useMemo(() => {
    return SECRET_AREAS.map((area) => ({
      area,
      unlocked: isSecretUnlocked(area, collectedItems, triggeredEvents),
    }));
  }, [collectedItems, triggeredEvents]);

  const unlockedCount = rooms.filter((r) => r.unlocked).length;

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        zIndex: Z_TOOL,
        background: 'rgba(10,9,8,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 480, maxHeight: '85vh',
          background: 'linear-gradient(135deg, #1a1816, #221f1c)',
          border: '1px solid #2a2420',
          borderRadius: 8,
          padding: '1.5rem',
          overflowY: 'auto',
        }}
      >
        <p style={{
          fontSize: '0.65rem', color: '#c5a55a',
          letterSpacing: '0.15em', margin: '0 0 0.3rem',
          textAlign: 'center',
        }}>
          SECRET ROOMS
        </p>
        <p style={{
          fontSize: '0.72rem', color: '#4a3a2e',
          textAlign: 'center', margin: '0 0 1rem',
        }}>
          {unlockedCount}/{SECRET_AREAS.length} discovered
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {rooms.map(({ area, unlocked }) => (
            <RoomCard
              key={area.id}
              area={area}
              unlocked={unlocked}
              onEnter={() => { onEnterRoom(area.id); onClose(); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RoomCard({ area, unlocked, onEnter }: { area: Area; unlocked: boolean; onEnter: () => void }) {
  return (
    <div style={{
      background: unlocked ? 'rgba(197,165,90,0.06)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${unlocked ? 'rgba(197,165,90,0.2)' : '#2a2420'}`,
      borderRadius: 6,
      padding: '0.8rem 1rem',
      opacity: unlocked ? 1 : 0.5,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{
            fontSize: '0.9rem', color: unlocked ? '#c5a55a' : '#4a3a2e',
            fontWeight: 'bold', margin: '0 0 0.2rem',
          }}>
            {unlocked ? '🔓' : '🔒'} {unlocked ? area.name : '???'}
          </p>
          <p style={{
            fontSize: '0.72rem', color: '#6a5a48',
            fontStyle: 'italic', margin: 0,
          }}>
            {unlocked
              ? `${area.hotspots.filter((h) => h.type === 'collectible').length} collectibles`
              : (area.secret?.lockedHintEn || 'Locked')}
          </p>
          {!unlocked && area.secret?.lockedHint && (
            <p style={{ fontSize: '0.68rem', color: '#4a3a2e', margin: '0.2rem 0 0' }}>
              {area.secret.lockedHint}
            </p>
          )}
        </div>
        {unlocked && (
          <button
            onClick={onEnter}
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '0.78rem',
              padding: '0.4rem 1rem',
              background: 'rgba(197,165,90,0.1)',
              border: '1px solid rgba(197,165,90,0.3)',
              borderRadius: 4,
              color: '#c5a55a',
              cursor: 'pointer',
            }}
          >
            Enter
          </button>
        )}
      </div>
    </div>
  );
}
