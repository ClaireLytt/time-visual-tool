/**
 * Z-index constants for all phantom UI layers.
 *
 * RULE: Every overlay z-index must come from here. Never use a raw number.
 * This prevents overlays rendering behind each other (e.g. FlashcardReview
 * at 190 behind PauseMenu at 200 — caught in issue #5).
 *
 * Layers are ordered lowest → highest. When adding a new layer, slot it in
 * at the right position. The pause menu is the dividing line: game overlays
 * go below it, learning tools go above it.
 */

// ── Game HUD (always visible during gameplay) ──
export const Z_HUD = 10;
export const Z_AREA_TOAST = 15;

// ── Game overlays (below pause) ──
export const Z_PARCHMENT = 100;
export const Z_ENV_DESCRIPTION = 100;
export const Z_DIALOGUE = 120;
export const Z_ENGLISH_CHALLENGE = 150;
export const Z_ACT_RECAP = 160;

// ── Pause menu ──
export const Z_PAUSE = 200;

// ── Learning tools (above pause, opened from pause menu) ──
export const Z_TOOL = 210;

// ── Achievement toast (above everything except ending) ──
export const Z_TOAST = 250;

// ── Game ending / certificate (topmost) ──
export const Z_ENDING = 300;
