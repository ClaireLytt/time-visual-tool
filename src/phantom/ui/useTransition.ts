import { useState, useCallback } from 'react';

export type TransitionType = 'fade' | 'mirror-portal' | 'curtain-rise';

export interface TransitionState {
  active: boolean;
  type: TransitionType;
  phase: 'out' | 'in';
}

export function useTransition() {
  const [transition, setTransition] = useState<TransitionState | undefined>(undefined);

  const startTransition = useCallback((
    type: TransitionType,
    onMidpoint: () => void,
    duration: number = 1500
  ) => {
    setTransition({ active: true, type, phase: 'out' });
    setTimeout(() => {
      onMidpoint();
      setTransition({ active: true, type, phase: 'in' });
    }, duration / 2);
    setTimeout(() => setTransition(undefined), duration);
  }, []);

  return { transition, startTransition };
}
