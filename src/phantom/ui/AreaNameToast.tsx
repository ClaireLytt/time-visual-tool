/**
 * AreaNameToast — cinematic area name display when entering a new area.
 * Fades in with the area name in both Chinese and English.
 */
import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../core/store';

const AREA_NAMES_EN: Record<string, string> = {
  'theater-audience': 'The Auditorium',
  'theater-stage': 'The Stage',
  'theater-backstage': 'Backstage',
  'dressing-room': 'The Dressing Room',
  'spiral-stairs': 'Spiral Staircase',
  'underground-tunnel': 'Underground Tunnel',
  'underground-lake': 'The Underground Lake',
  'lair': 'The Phantom\'s Lair',
  'rooftop': 'The Rooftop',
  'theater-performance': 'The Performance',
  'final-lair': 'The Final Lair',
  'epilogue': 'Epilogue',
};

const AREA_NAMES_ZH: Record<string, string> = {
  'theater-audience': '观众席',
  'theater-stage': '舞台',
  'theater-backstage': '后台通道',
  'dressing-room': '化妆间',
  'spiral-stairs': '螺旋石梯',
  'underground-tunnel': '地下隧道',
  'underground-lake': '地下湖',
  'lair': '魅影的密室',
  'rooftop': '歌剧院屋顶',
  'theater-performance': '剧场（演出）',
  'final-lair': '地下湖密室',
  'epilogue': '终章',
};

export default function AreaNameToast() {
  const currentArea = useGameStore((s) => s.currentArea);
  const isPlaying = useGameStore((s) => s.isPlaying);
  const [visible, setVisible] = useState(false);
  const [displayArea, setDisplayArea] = useState('');
  const prevAreaRef = useRef(currentArea);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentArea !== prevAreaRef.current) {
      prevAreaRef.current = currentArea;
      setDisplayArea(currentArea);
      const show = requestAnimationFrame(() => setVisible(true));
      const hide = setTimeout(() => setVisible(false), 2500);
      return () => { cancelAnimationFrame(show); clearTimeout(hide); };
    }
  }, [currentArea, isPlaying]);

  if (!visible || !displayArea) return null;

  const nameZh = AREA_NAMES_ZH[displayArea] || displayArea;
  const nameEn = AREA_NAMES_EN[displayArea] || '';

  return (
    <div style={{
      position: 'fixed',
      top: '35%', left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 15,
      pointerEvents: 'none',
      textAlign: 'center',
      animation: 'areaToastIn 0.8s ease-out',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.5s ease',
    }}>
      <p style={{
        fontFamily: 'Georgia, serif',
        fontSize: '1.6rem',
        color: '#c5a55a',
        letterSpacing: '0.15em',
        margin: '0 0 0.3rem',
        textShadow: '0 2px 20px rgba(0,0,0,0.8)',
      }}>
        {nameZh}
      </p>
      {nameEn && (
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: '0.8rem',
          color: '#9a8a78',
          letterSpacing: '0.2em',
          margin: 0,
          textShadow: '0 1px 10px rgba(0,0,0,0.8)',
        }}>
          {nameEn}
        </p>
      )}

      <style>{`
        @keyframes areaToastIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
          30% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
