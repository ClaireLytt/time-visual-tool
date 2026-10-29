/**
 * useOverlays — centralizes all overlay open/close state for PhantomGame.
 * Reduces PhantomGame from 31 useState calls to ~13 by grouping 18
 * overlay toggles into a single Record.
 */
import { useState, useCallback } from 'react';

export type OverlayName =
  | 'inventory' | 'flashcards' | 'scramble' | 'sentence'
  | 'profiles' | 'map' | 'reading' | 'idioms' | 'timeline'
  | 'quiz' | 'help' | 'pronunciation' | 'writing'
  | 'memory' | 'dictation' | 'stats' | 'export' | 'cert' | 'secret' | 'grammar';

export function useOverlays() {
  const [openOverlay, setOpenOverlay] = useState<OverlayName | null>(null);

  const open = useCallback((name: OverlayName) => setOpenOverlay(name), []);
  const close = useCallback(() => setOpenOverlay(null), []);
  const isOpen = useCallback((name: OverlayName) => openOverlay === name, [openOverlay]);

  return { openOverlay, open, close, isOpen };
}
