import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from './core/store';
import Canvas2D from './renderer-2d/Canvas2D';
import ParchmentOverlay from './ui/ParchmentOverlay';
import Transition from './ui/Transition';
import { useTransition } from './ui/useTransition';
import IntroText from './ui/IntroText';
import InventoryJournal from './ui/InventoryJournal';
import { initAudio, setArea as setMusicArea, setLayerCount, stopAudio } from './audio/MusicEngine';
import { playPickup } from './audio/sfx';
import { ActId } from './core/types';

const AREA_NAMES: Record<string, string> = {
  'theater-audience': '观众席', 'theater-stage': '舞台', 'theater-backstage': '后台通道',
  'dressing-room': '化妆间', 'spiral-stairs': '螺旋石梯',
  'underground-tunnel': '地下隧道', 'underground-lake': '地下湖',
  'lair': '魅影的密室', 'rooftop': '歌剧院屋顶',
  'theater-performance': '剧场（演出）', 'final-lair': '地下湖密室', 'epilogue': '终章',
};

const ACT_START_AREAS: Record<number, string> = {
  1: 'theater-audience', 2: 'dressing-room', 3: 'lair',
  4: 'rooftop', 5: 'theater-performance',
};

const menuBtnStyle: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '0.9rem',
  padding: '0.6rem 2.2rem',
  background: 'transparent',
  border: '1px solid #4a3a2e',
  color: '#c5a55a',
  borderRadius: '4px',
  cursor: 'pointer',
  letterSpacing: '0.08em',
  width: '200px',
  textAlign: 'center',
};

export default function PhantomGame() {
  const {
    isPlaying, isPaused, startGame, togglePause, resetGame,
    collectedItems, currentArea, currentAct, setAct, setArea, loadGame, saveGame,
  } = useGameStore();

  const [viewingItem, setViewingItem] = useState<string | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const { transition, startTransition } = useTransition();
  const audioStarted = useRef(false);
  const [hasSave] = useState(() => {
    try { return localStorage.getItem('phantom-save') !== null; }
    catch { return false; }
  });

  // Subscribe to collectible changes
  useEffect(() => {
    let prevCount = useGameStore.getState().collectedItems.length;
    const unsub = useGameStore.subscribe((state) => {
      const count = state.collectedItems.length;
      if (count > prevCount) {
        prevCount = count;
        setViewingItem(state.collectedItems[count - 1]);
        playPickup();
        setLayerCount(count);
      }
    });
    return unsub;
  }, []);

  // Sync music area
  useEffect(() => {
    if (isPlaying && audioStarted.current) {
      setMusicArea(currentArea);
    }
  }, [currentArea, isPlaying]);

  // Auto-save on area change
  useEffect(() => {
    if (isPlaying) saveGame();
  }, [currentArea, isPlaying, saveGame]);

  useEffect(() => () => stopAudio(), []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (inventoryOpen) {
        setInventoryOpen(false);
      } else {
        togglePause();
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      setInventoryOpen((v) => !v);
    }
  }, [togglePause, inventoryOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const doStart = useCallback(async (act?: ActId, area?: string) => {
    await initAudio();
    audioStarted.current = true;
    if (act) {
      setAct(act);
      setArea(area || ACT_START_AREAS[act]);
    }
    setMusicArea(area || ACT_START_AREAS[act || 1]);
    startTransition('curtain-rise', () => startGame(), 3000);
  }, [setAct, setArea, startGame, startTransition]);

  // ── Intro text overlay ──
  if (showIntro) {
    return <IntroText onComplete={() => { setShowIntro(false); doStart(); }} />;
  }

  // ── Title screen ──
  if (!isPlaying) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0908',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: '#e0d8cc', fontFamily: 'Georgia, serif', gap: '1rem',
      }}>
        <h1 style={{
          fontSize: '2.4rem', letterSpacing: '0.12em', margin: 0,
          textShadow: '0 2px 16px rgba(0,0,0,0.8)',
        }}>
          THE PHANTOM
        </h1>
        <p style={{ fontSize: '1.1rem', letterSpacing: '0.2em', color: '#9a8a78', margin: 0 }}>
          OF THE OPERA
        </p>
        <div style={{ width: 60, height: 1, background: '#4a3a2e', margin: '0.8rem 0' }} />

        {/* New Game */}
        <button onClick={() => setShowIntro(true)} style={menuBtnStyle}>
          新游戏
        </button>

        {/* Continue (if save exists) */}
        {hasSave && (
          <button
            onClick={async () => {
              loadGame();
              await initAudio();
              audioStarted.current = true;
              const area = useGameStore.getState().currentArea;
              setMusicArea(area);
              startTransition('fade', () => startGame(), 1500);
            }}
            style={menuBtnStyle}
          >
            继续游戏
          </button>
        )}

        {/* Chapter select */}
        <div style={{
          marginTop: '0.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.4rem',
          alignItems: 'center',
        }}>
          <p style={{ fontSize: '0.72rem', color: '#4a3a2e', margin: '0.3rem 0' }}>
            ── 章节选择 ──
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {([1, 2, 3, 4, 5] as ActId[]).map((act) => (
              <button
                key={act}
                onClick={() => { resetGame(); doStart(act); }}
                style={{
                  ...menuBtnStyle,
                  width: 'auto',
                  padding: '0.35rem 1rem',
                  fontSize: '0.75rem',
                }}
              >
                第{act}幕
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '0.65rem', color: '#3a3028', marginTop: '1.5rem' }}>
          点击场景移动视角 · 点击发光物品互动 · Tab 背包 · ESC 暂停
        </p>

        <Transition transition={transition} />
      </div>
    );
  }

  // ── Game screen ──
  return (
    <div style={{
      minHeight: '100vh', background: '#0a0908',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      {/* HUD */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10, pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: 'Georgia, serif', fontSize: '0.8rem',
          color: '#9a8a78', letterSpacing: '0.08em',
        }}>
          第{currentAct}幕 · {AREA_NAMES[currentArea] || currentArea}
        </span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', pointerEvents: 'auto' }}>
          <button
            onClick={() => setInventoryOpen(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: '#c5a55a',
              padding: '0.2rem 0.5rem',
            }}
            title="背包 (Tab)"
          >
            📖 {collectedItems.length}/15
          </button>
        </div>
      </div>

      <Canvas2D onTransition={(type, fn) => startTransition(type, fn)} />

      <p style={{
        fontFamily: 'sans-serif', fontSize: '0.7rem', color: '#4a3a2e',
        marginTop: '0.8rem', textAlign: 'center',
      }}>
        点击场景移动 · 点击发光物品 · Tab 背包 · ESC 暂停
      </p>

      <ParchmentOverlay itemId={viewingItem} onClose={() => setViewingItem(null)} />
      <InventoryJournal open={inventoryOpen} onClose={() => setInventoryOpen(false)} />
      <Transition transition={transition} />

      {/* Pause overlay */}
      {isPaused && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 200, gap: '0.8rem',
        }}>
          <h2 style={{
            fontFamily: 'Georgia, serif', color: '#e0d8cc',
            fontSize: '1.5rem', margin: '0 0 0.5rem',
          }}>
            暂停
          </h2>
          <button onClick={() => togglePause()} style={menuBtnStyle}>
            继续游戏
          </button>
          <button onClick={() => setInventoryOpen(true)} style={menuBtnStyle}>
            📖 收集日记
          </button>
          <button
            onClick={() => { togglePause(); resetGame(); }}
            style={{ ...menuBtnStyle, color: '#8a6a5a', borderColor: '#3a2a22' }}
          >
            返回主菜单
          </button>
        </div>
      )}
    </div>
  );
}
