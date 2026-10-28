/**
 * AchievementToast — slide-in notification when a new achievement is earned.
 */
import { useState, useEffect } from 'react';
import { Achievement } from '../core/achievements';
import { playAchievement } from '../audio/ui-sfx';

interface Props {
  achievement: Achievement | null;
  onDone: () => void;
}

export default function AchievementToast({ achievement, onDone }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!achievement) return;
    const show = requestAnimationFrame(() => { setVisible(true); playAchievement(); });
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 500);
    }, 3500);
    return () => { cancelAnimationFrame(show); clearTimeout(t); };
  }, [achievement, onDone]);

  if (!achievement) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 60,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '-80px'})`,
      opacity: visible ? 1 : 0,
      transition: 'transform 0.5s ease, opacity 0.5s ease',
      zIndex: 250,
      pointerEvents: 'none',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.8rem',
        background: 'linear-gradient(135deg, rgba(50,44,36,0.95), rgba(40,34,28,0.95))',
        border: '1px solid rgba(197,165,90,0.4)',
        borderRadius: 8,
        padding: '0.8rem 1.5rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 40px rgba(197,165,90,0.1)',
        fontFamily: 'Georgia, serif',
      }}>
        <span style={{ fontSize: '1.8rem' }}>{achievement.icon}</span>
        <div>
          <p style={{
            fontSize: '0.65rem', color: '#6a5a48',
            letterSpacing: '0.15em', margin: '0 0 0.2rem',
          }}>
            ACHIEVEMENT UNLOCKED
          </p>
          <p style={{
            fontSize: '0.95rem', color: '#c5a55a', margin: '0 0 0.1rem',
            fontWeight: 'bold',
          }}>
            {achievement.name}
          </p>
          <p style={{ fontSize: '0.72rem', color: '#9a8a78', margin: 0 }}>
            {achievement.nameZh} — {achievement.description}
          </p>
        </div>
      </div>
    </div>
  );
}
