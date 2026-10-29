import { Z_ENV_DESCRIPTION } from '../core/z-index';
/**
 * EnvDescriptionOverlay — atmospheric text + English phrase when clicking
 * non-collectible environment objects. Light learning, no quiz required.
 */
import { EnvDescription } from '../core/environment-descriptions';

interface Props {
  desc: EnvDescription | null;
  onClose: () => void;
}

export default function EnvDescriptionOverlay({ desc, onClose }: Props) {
  if (!desc) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: Z_ENV_DESCRIPTION, cursor: 'pointer',
        animation: 'envFadeIn 0.3s ease-out',
        paddingBottom: '10vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 480, width: '90%',
          background: 'linear-gradient(145deg, rgba(30,26,22,0.95), rgba(20,18,16,0.95))',
          border: '1px solid #2a2420',
          borderRadius: 8,
          padding: '1.2rem 1.5rem',
          fontFamily: 'Georgia, serif',
          cursor: 'default',
          animation: 'envSlideUp 0.4s ease-out',
        }}
      >
        {/* Chinese description */}
        <p style={{
          fontSize: '0.9rem', color: '#d8ccb4',
          lineHeight: 1.7, margin: '0 0 0.6rem',
        }}>
          {desc.textZh}
        </p>

        {/* English description */}
        <p style={{
          fontSize: '0.8rem', color: '#7a7a6a',
          fontStyle: 'italic', lineHeight: 1.6,
          margin: '0 0 0.8rem',
        }}>
          {desc.textEn}
        </p>

        {/* Featured phrase */}
        <div style={{
          background: 'rgba(138,175,176,0.08)',
          borderLeft: '3px solid #8aafb0',
          borderRadius: '0 4px 4px 0',
          padding: '0.6rem 0.8rem',
        }}>
          <p style={{
            fontSize: '0.85rem', color: '#8aafb0',
            fontWeight: 'bold', fontStyle: 'italic',
            margin: '0 0 0.2rem',
          }}>
            {desc.phrase}
          </p>
          <p style={{
            fontSize: '0.72rem', color: '#5a6a6a', margin: 0,
          }}>
            {desc.phraseZh}
          </p>
        </div>

        <p style={{
          fontSize: '0.65rem', color: '#3a3028',
          textAlign: 'center', margin: '0.6rem 0 0',
        }}>
          click anywhere to close
        </p>
      </div>

      <style>{`
        @keyframes envFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes envSlideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
