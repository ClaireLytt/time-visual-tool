/**
 * Shared UI styles for phantom game components.
 * Single source of truth — prevents copy-paste drift across 29 UI files.
 */
import { Z_TOOL } from '../core/z-index';

/** Standard menu/action button */
export const menuBtnStyle: React.CSSProperties = {
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

/** Small action button inside overlays */
export const actionBtnStyle: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '0.82rem',
  padding: '0.5rem 1.4rem',
  background: 'transparent',
  border: '1px solid #3a3228',
  color: '#c5a55a',
  borderRadius: 4,
  cursor: 'pointer',
  letterSpacing: '0.06em',
};

/** Full-screen overlay backdrop */
export const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10,9,8,0.94)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: Z_TOOL,
  fontFamily: 'Georgia, serif',
};

/** Dark card container inside overlays */
export const cardStyle: React.CSSProperties = {
  width: '92%',
  maxWidth: 520,
  maxHeight: '85vh',
  overflowY: 'auto',
  background: 'linear-gradient(135deg, #1a1816, #221f1c)',
  border: '1px solid #2a2420',
  borderRadius: 8,
  padding: '1.5rem',
  fontFamily: 'Georgia, serif',
};

/** Section header text */
export const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  color: '#4a3a2e',
  letterSpacing: '0.15em',
  margin: '0 0 0.8rem',
  textAlign: 'center',
};
