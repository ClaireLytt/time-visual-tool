/** Shared drawing utilities for all act renderers */

export const TAU = Math.PI * 2;

/** Deterministic pseudo-random from a seed (no Math.random in render loop) */
export function srand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
