import { Z_PAUSE } from '../core/z-index';
import { useState, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

const LINES = [
  '1881年',
  '巴黎歌剧院',
  '',
  '一场注定改变一切的演出',
  '即将开始。',
];

/**
 * Opening text sequence — gold text fades in line by line on black,
 * then fades out before revealing the game.
 */
export default function IntroText({ onComplete }: Props) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show each line with 1s delay
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i <= LINES.length; i++) {
      timers.push(setTimeout(() => setVisibleLines(i + 1), i * 1000));
    }
    // After all lines shown, wait 1.5s then fade out
    timers.push(setTimeout(() => setFadeOut(true), LINES.length * 1000 + 1500));
    // After fade, complete
    timers.push(setTimeout(() => onComplete(), LINES.length * 1000 + 3000));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      onClick={() => onComplete()}
      style={{
        position: 'fixed', inset: 0, zIndex: Z_PAUSE,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '0.6rem',
        cursor: 'pointer',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 1.2s ease-in-out',
      }}
    >
      {LINES.map((line, i) => (
        <span
          key={i}
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: line === '' ? '0' : i < 2 ? '1.6rem' : '1rem',
            color: i < 2 ? '#c5a55a' : '#9a8a78',
            letterSpacing: '0.12em',
            opacity: i < visibleLines ? 1 : 0,
            transform: i < visibleLines ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            height: line === '' ? '1rem' : 'auto',
          }}
        >
          {line}
        </span>
      ))}
      <span style={{
        position: 'absolute', bottom: '2rem',
        fontSize: '0.7rem', color: '#3a3530',
        opacity: visibleLines > LINES.length ? 0.6 : 0,
        transition: 'opacity 0.5s',
      }}>
        点击跳过
      </span>
    </div>
  );
}
