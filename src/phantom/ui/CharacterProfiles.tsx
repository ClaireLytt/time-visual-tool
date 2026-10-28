/**
 * CharacterProfiles — unlockable character bios with bilingual descriptions.
 */
import { useState, useMemo } from 'react';
import { useGameStore } from '../core/store';
import { CHARACTER_BIOS, getUnlockedBios, CharacterBio } from '../core/characters-bio';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CharacterProfiles({ open, onClose }: Props) {
  const triggeredEvents = useGameStore((s) => s.triggeredEvents);
  const unlocked = useMemo(() => getUnlockedBios(triggeredEvents), [triggeredEvents]);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedBio = useMemo(
    () => unlocked.find((b) => b.id === selected),
    [selected, unlocked]
  );

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 210,
        background: 'rgba(10,9,8,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Georgia, serif',
        animation: 'cpFadeIn 0.3s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 700, height: '80vh', maxHeight: 500,
          display: 'flex',
          background: 'linear-gradient(135deg, #1a1816, #221f1c)',
          border: '1px solid #2a2420',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {/* Left: character list */}
        <div style={{
          width: 200, minWidth: 160,
          borderRight: '1px solid #2a2420',
          display: 'flex', flexDirection: 'column',
          padding: '1rem 0',
          overflowY: 'auto',
        }}>
          <p style={{
            fontSize: '0.7rem', color: '#6a5a48',
            letterSpacing: '0.12em', padding: '0 1rem',
            margin: '0 0 0.8rem',
          }}>
            CHARACTERS ({unlocked.length}/{CHARACTER_BIOS.length})
          </p>

          {CHARACTER_BIOS.map((bio) => {
            const isUnlocked = unlocked.some((u) => u.id === bio.id);
            const isSelected = selected === bio.id;
            return (
              <button
                key={bio.id}
                onClick={() => isUnlocked ? setSelected(bio.id) : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1rem',
                  background: isSelected ? 'rgba(197,165,90,0.1)' : 'transparent',
                  border: 'none',
                  borderLeft: isSelected ? '3px solid ' + bio.color : '3px solid transparent',
                  cursor: isUnlocked ? 'pointer' : 'default',
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.82rem',
                  color: isUnlocked ? '#d8ccb4' : '#3a3228',
                  textAlign: 'left',
                  opacity: isUnlocked ? 1 : 0.4,
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{isUnlocked ? bio.icon : '❓'}</span>
                <span>{isUnlocked ? bio.name : '???'}</span>
              </button>
            );
          })}
        </div>

        {/* Right: bio details */}
        <div style={{
          flex: 1, padding: '1.5rem',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          {selectedBio ? (
            <BioDetail bio={selectedBio} />
          ) : (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '0.5rem',
            }}>
              <span style={{ fontSize: '2rem' }}>{'🎭'}</span>
              <p style={{ fontSize: '0.85rem', color: '#4a3a2e', fontStyle: 'italic' }}>
                {unlocked.length === 0
                  ? 'Play the game to unlock character profiles!'
                  : 'Select a character to read their story.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes cpFadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}

function BioDetail({ bio }: { bio: CharacterBio }) {
  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
        <span style={{ fontSize: '2rem' }}>{bio.icon}</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: bio.color }}>
            {bio.name}
          </h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#6a5a48' }}>
            {bio.nameEn} — {bio.titleEn}
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height: 1, background: '#2a2420', margin: '0 0 0.8rem' }} />

      {/* Chinese bio */}
      <p style={{
        fontSize: '0.88rem', color: '#d8ccb4',
        lineHeight: 1.8, margin: '0 0 0.8rem',
      }}>
        {bio.bioZh}
      </p>

      {/* English bio */}
      <p style={{
        fontSize: '0.82rem', color: '#7a7a6a',
        lineHeight: 1.7, fontStyle: 'italic',
        margin: '0 0 1rem',
      }}>
        {bio.bioEn}
      </p>

      {/* Signature quote */}
      <div style={{
        background: 'rgba(197,165,90,0.06)',
        borderLeft: `3px solid ${bio.color}`,
        borderRadius: '0 4px 4px 0',
        padding: '0.6rem 0.8rem',
        marginTop: 'auto',
      }}>
        <p style={{
          fontSize: '0.85rem', color: bio.color,
          fontStyle: 'italic', margin: '0 0 0.2rem',
        }}>
          &ldquo;{bio.quoteEn}&rdquo;
        </p>
        <p style={{ fontSize: '0.72rem', color: '#5a5a50', margin: 0 }}>
          {bio.quoteZh}
        </p>
      </div>
    </>
  );
}
