import { useState, useCallback, useEffect } from 'react';
import { useGameStore } from './core/store';
import Canvas2D from './renderer-2d/Canvas2D';
import ParchmentOverlay from './ui/ParchmentOverlay';

export default function PhantomGame() {
  const {
    isPlaying, isPaused, startGame, togglePause,
    collectedItems, currentArea, currentAct,
  } = useGameStore();

  const [viewingItem, setViewingItem] = useState<string | null>(null);
  const [lastCollectedCount, setLastCollectedCount] = useState(0);

  // Show parchment when a new item is collected
  useEffect(() => {
    if (collectedItems.length > lastCollectedCount) {
      const newest = collectedItems[collectedItems.length - 1];
      setViewingItem(newest);
      setLastCollectedCount(collectedItems.length);
    }
  }, [collectedItems, lastCollectedCount]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') togglePause();
    if (e.key === 'Tab') {
      e.preventDefault();
      // TODO: open inventory
    }
  }, [togglePause]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Title screen ──
  if (!isPlaying) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0908',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: '#e0d8cc',
        fontFamily: 'Georgia, serif',
        gap: '1.5rem',
      }}>
        <h1 style={{
          fontSize: '2.2rem',
          letterSpacing: '0.12em',
          textShadow: '0 2px 12px rgba(0,0,0,0.8)',
          margin: 0,
        }}>
          THE PHANTOM
        </h1>
        <p style={{
          fontSize: '1rem',
          letterSpacing: '0.2em',
          color: '#9a8a78',
          margin: 0,
        }}>
          OF THE OPERA
        </p>
        <div style={{ width: 60, height: 1, background: '#4a3a2e', margin: '0.5rem 0' }} />
        <button
          onClick={() => startGame()}
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1rem',
            padding: '0.7rem 2.5rem',
            background: 'transparent',
            border: '1px solid #4a3a2e',
            color: '#c5a55a',
            borderRadius: '4px',
            cursor: 'pointer',
            letterSpacing: '0.1em',
            transition: 'border-color 0.3s, color 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#c5a55a';
            e.currentTarget.style.color = '#e0c870';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#4a3a2e';
            e.currentTarget.style.color = '#c5a55a';
          }}
        >
          开始游戏
        </button>
        <p style={{ fontSize: '0.7rem', color: '#4a3a2e', marginTop: '2rem' }}>
          第一幕 · Think of Me
        </p>
      </div>
    );
  }

  // ── Game screen ──
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0908',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      {/* HUD */}
      <div style={{
        position: 'absolute',
        top: 16, left: 16, right: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: 'Georgia, serif',
          fontSize: '0.8rem',
          color: '#9a8a78',
          letterSpacing: '0.08em',
        }}>
          第{currentAct}幕 · {currentArea === 'theater-audience' ? '观众席' :
            currentArea === 'theater-stage' ? '舞台' : '后台通道'}
        </span>
        <span style={{
          fontFamily: 'Georgia, serif',
          fontSize: '0.8rem',
          color: '#c5a55a',
        }}>
          📜 {collectedItems.length} / 3
        </span>
      </div>

      {/* Canvas */}
      <Canvas2D />

      {/* Hint bar */}
      <p style={{
        fontFamily: 'sans-serif',
        fontSize: '0.7rem',
        color: '#4a3a2e',
        marginTop: '0.8rem',
        textAlign: 'center',
      }}>
        点击场景移动视角 · 点击发光物品互动 · ESC 暂停
      </p>

      {/* Parchment overlay */}
      <ParchmentOverlay
        itemId={viewingItem}
        onClose={() => setViewingItem(null)}
      />

      {/* Pause overlay */}
      {isPaused && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 200,
          gap: '1rem',
        }}>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            color: '#e0d8cc',
            fontSize: '1.5rem',
            margin: 0,
          }}>
            暂停
          </h2>
          <button
            onClick={() => togglePause()}
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '0.9rem',
              padding: '0.5rem 2rem',
              background: 'transparent',
              border: '1px solid #4a3a2e',
              color: '#c5a55a',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            继续游戏
          </button>
        </div>
      )}
    </div>
  );
}
