import { Z_TRANSITION } from '../core/z-index';
import { TransitionState } from './useTransition';

interface Props {
  transition: TransitionState | null;
}

export default function Transition({ transition }: Props) {
  if (!transition) return null;

  const fadingOut = transition.phase === 'out';

  if (transition.type === 'mirror-portal') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: Z_TRANSITION, pointerEvents: 'none',
        background: fadingOut
          ? 'radial-gradient(circle at 70% 50%, rgba(200,220,255,0.5) 0%, rgba(0,0,0,0.9) 60%)'
          : 'radial-gradient(circle at 70% 50%, rgba(200,220,255,0.1) 0%, rgba(0,0,0,0.2) 80%)',
        opacity: fadingOut ? 1 : 0,
        transition: 'opacity 0.7s ease-in-out',
      }} />
    );
  }

  if (transition.type === 'curtain-rise') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: Z_TRANSITION, pointerEvents: 'none',
        display: 'flex', overflow: 'hidden',
      }}>
        <div style={{
          flex: 1, background: '#6a1a25',
          transform: fadingOut ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 1.2s ease-in-out',
        }} />
        <div style={{
          flex: 1, background: '#6a1a25',
          transform: fadingOut ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 1.2s ease-in-out',
        }} />
        {fadingOut && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}>
            <span style={{
              fontFamily: 'Georgia, serif', fontSize: '1.8rem',
              color: '#c5a55a', letterSpacing: '0.12em',
            }}>
              THE PHANTOM OF THE OPERA
            </span>
            <span style={{
              fontFamily: 'Georgia, serif', fontSize: '0.9rem',
              color: '#9a8a78', letterSpacing: '0.15em',
            }}>
              第一幕 · Think of Me
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default: fade to/from black
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: Z_TRANSITION, pointerEvents: 'none',
      background: '#000',
      opacity: fadingOut ? 1 : 0,
      transition: 'opacity 0.7s ease-in-out',
    }} />
  );
}
