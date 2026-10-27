/**
 * Per-collectible proximity effects.
 * Each collectible has a unique visual cue when the player is nearby,
 * beyond the generic golden glow.
 */
import { TAU, srand } from './draw-utils';

interface CollectibleFxConfig {
  type: 'rope-swing' | 'paper-curl' | 'candle-flicker' | 'petal-trail' |
        'shimmer-text' | 'organ-glow' | 'scarf-wave' | 'music-box-spin' |
        'mask-pulse' | 'generic';
}

// Map collectible IDs to their special effect
const FX_MAP: Record<string, CollectibleFxConfig> = {
  // Act 1
  'act1-rope':  { type: 'rope-swing' },
  'act1-memo':  { type: 'paper-curl' },
  'act1-note':  { type: 'candle-flicker' },
  // Act 2
  'act2-card':  { type: 'paper-curl' },
  'act2-score': { type: 'shimmer-text' },
  'act2-carving':{ type: 'candle-flicker' },
  // Act 3
  'act3-manuscript': { type: 'organ-glow' },
  'act3-diary': { type: 'candle-flicker' },
  'act3-mask':  { type: 'mask-pulse' },
  // Act 4
  'act4-bouquet': { type: 'petal-trail' },
  'act4-scarf': { type: 'scarf-wave' },
  'act4-carving': { type: 'shimmer-text' },
  // Act 5
  'act5-program': { type: 'paper-curl' },
  'act5-musicbox': { type: 'music-box-spin' },
  'act5-mask':  { type: 'mask-pulse' },
};

/**
 * Draw the special proximity effect for a collectible.
 * Called when player is within hotspot range and item not yet collected.
 */
export function drawCollectibleFx(
  ctx: CanvasRenderingContext2D,
  collectibleId: string,
  cx: number, cy: number,
  time: number
) {
  const config = FX_MAP[collectibleId];
  if (!config) return drawGenericDust(ctx, cx, cy, time);

  switch (config.type) {
    case 'rope-swing':
      drawRopeSwing(ctx, cx, cy, time);
      break;
    case 'paper-curl':
      drawPaperCurl(ctx, cx, cy, time);
      break;
    case 'candle-flicker':
      drawCandleFlicker(ctx, cx, cy, time);
      break;
    case 'petal-trail':
      drawPetalTrail(ctx, cx, cy, time);
      break;
    case 'shimmer-text':
      drawShimmerText(ctx, cx, cy, time);
      break;
    case 'organ-glow':
      drawOrganGlow(ctx, cx, cy, time);
      break;
    case 'scarf-wave':
      drawScarfWave(ctx, cx, cy, time);
      break;
    case 'music-box-spin':
      drawMusicBoxSpin(ctx, cx, cy, time);
      break;
    case 'mask-pulse':
      drawMaskPulse(ctx, cx, cy, time);
      break;
    default:
      drawGenericDust(ctx, cx, cy, time);
  }
}

// ── Effects ──

/** Rope gently swinging back and forth */
function drawRopeSwing(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  const swing = Math.sin(time * 1.5) * 8;
  ctx.strokeStyle = 'rgba(160,140,100,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 40);
  ctx.bezierCurveTo(cx + swing * 0.3, cy - 25, cx + swing * 0.7, cy - 10, cx + swing, cy + 10);
  ctx.stroke();
  // Frayed end
  for (let i = 0; i < 4; i++) {
    const s = i * 3.7;
    ctx.strokeStyle = `rgba(160,140,100,${0.2 + srand(s) * 0.15})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + swing, cy + 10);
    ctx.lineTo(cx + swing + (srand(s + 1) - 0.5) * 10, cy + 18 + srand(s + 2) * 6);
    ctx.stroke();
  }
}

/** Paper corner curling up and down */
function drawPaperCurl(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  const curl = Math.sin(time * 2) * 4;
  // Paper edge
  ctx.fillStyle = 'rgba(220,210,190,0.15)';
  ctx.beginPath();
  ctx.moveTo(cx + 15, cy + 10);
  ctx.lineTo(cx + 22, cy + 10 + curl);
  ctx.lineTo(cx + 22, cy + 2 + curl);
  ctx.lineTo(cx + 15, cy + 2);
  ctx.fill();
  // Shadow under curl
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath();
  ctx.ellipse(cx + 18, cy + 12, 6, 2, 0, 0, TAU);
  ctx.fill();
}

/** Nearby candle flickering intensely */
function drawCandleFlicker(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  const fl = Math.sin(time * 9) * 2 + Math.sin(time * 13) * 1.5;
  const intensity = 0.2 + 0.15 * Math.sin(time * 4);
  // Erratic flame glow
  const g = ctx.createRadialGradient(cx + fl, cy - 15, 0, cx, cy - 10, 35);
  g.addColorStop(0, `rgba(255,180,80,${intensity})`);
  g.addColorStop(1, 'rgba(255,180,80,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx + fl * 0.5, cy - 10, 35, 0, TAU);
  ctx.fill();
  // Sparks
  for (let i = 0; i < 3; i++) {
    const sx = cx + fl + srand(time * 10 + i) * 8 - 4;
    const sy = cy - 20 - srand(time * 10 + i + 5) * 15;
    ctx.fillStyle = `rgba(255,200,100,${0.3 + srand(i + time) * 0.2})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.8, 0, TAU);
    ctx.fill();
  }
}

/** Rose petals drifting near the collectible */
function drawPetalTrail(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  for (let i = 0; i < 8; i++) {
    const s = i * 7.3;
    const px = cx + Math.sin(time * 0.5 + srand(s) * TAU) * 25;
    const py = cy - 10 + ((time * 15 + srand(s + 1) * 100) % 50) - 25;
    const rot = time * 0.8 + srand(s + 2) * TAU;
    const a = 0.25 + srand(s + 3) * 0.15;
    ctx.fillStyle = `rgba(160,40,50,${a})`;
    ctx.beginPath();
    ctx.ellipse(px, py, 3.5, 1.8, rot, 0, TAU);
    ctx.fill();
  }
}

/** Musical notes or text shimmering on a surface */
function drawShimmerText(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  // Shimmering highlight that sweeps across
  const sweepX = cx - 30 + ((time * 40) % 80);
  const g = ctx.createRadialGradient(sweepX, cy, 0, sweepX, cy, 20);
  g.addColorStop(0, 'rgba(200,180,140,0.2)');
  g.addColorStop(1, 'rgba(200,180,140,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(sweepX, cy, 20, 0, TAU);
  ctx.fill();
  // Tiny glinting particles
  for (let i = 0; i < 4; i++) {
    const gx = cx - 15 + i * 10 + Math.sin(time * 3 + i) * 3;
    const gy = cy - 5 + Math.cos(time * 2 + i * 2) * 4;
    const ga = 0.15 + 0.15 * Math.sin(time * 4 + i * 1.5);
    ctx.fillStyle = `rgba(220,200,150,${ga})`;
    ctx.beginPath();
    ctx.arc(gx, gy, 1, 0, TAU);
    ctx.fill();
  }
}

/** Organ pipes emitting a subtle glow + vibration lines */
function drawOrganGlow(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  // Vibration lines emanating from organ
  ctx.strokeStyle = `rgba(200,180,130,${0.08 + 0.04 * Math.sin(time * 3)})`;
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 5; i++) {
    const r = 15 + i * 8 + Math.sin(time * 2 + i) * 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -0.3 + i * 0.1, 0.3 + i * 0.1);
    ctx.stroke();
  }
  // Warm upward glow
  const g = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy, 40);
  g.addColorStop(0, `rgba(255,200,100,${0.06 + 0.03 * Math.sin(time * 1.5)})`);
  g.addColorStop(1, 'rgba(255,200,100,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy - 10, 40, 0, TAU);
  ctx.fill();
}

/** Scarf gently waving in the wind */
function drawScarfWave(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  ctx.strokeStyle = 'rgba(200,195,185,0.25)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 15, cy);
  for (let x = 0; x < 30; x += 2) {
    const wave = Math.sin(time * 3 + x * 0.3) * (3 + x * 0.1);
    ctx.lineTo(cx - 15 + x, cy + wave);
  }
  ctx.stroke();
  // Fabric end fluttering
  const endX = cx + 15 + Math.sin(time * 4) * 5;
  const endY = cy + Math.sin(time * 3 + 9) * 4;
  ctx.strokeStyle = 'rgba(200,195,185,0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx + 13, cy + Math.sin(time * 3 + 9) * 3);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}

/** Music box with slowly rotating top */
function drawMusicBoxSpin(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  // Rotating glint on music box
  const angle = time * 0.5;
  const glintX = cx + Math.cos(angle) * 6;
  const glintY = cy - 3 + Math.sin(angle) * 3;
  ctx.fillStyle = `rgba(220,200,140,${0.2 + 0.1 * Math.sin(time * 2)})`;
  ctx.beginPath();
  ctx.arc(glintX, glintY, 2, 0, TAU);
  ctx.fill();
  // Musical note particles floating up
  for (let i = 0; i < 3; i++) {
    const ny = cy - 15 - ((time * 20 + i * 30) % 40);
    const nx = cx + Math.sin(time * 1.5 + i * 2) * 8;
    const na = Math.max(0, 0.25 - ((time * 20 + i * 30) % 40) / 60);
    ctx.fillStyle = `rgba(200,180,130,${na})`;
    ctx.font = '8px Georgia, serif';
    ctx.fillText('♪', nx, ny);
  }
}

/** Mask with pulsing ethereal glow */
function drawMaskPulse(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 1.5);
  // Outer ring pulse
  ctx.strokeStyle = `rgba(240,235,220,${0.08 * pulse})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 20 + pulse * 10, 0, TAU);
  ctx.stroke();
  // Inner warm glow
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
  g.addColorStop(0, `rgba(255,245,230,${0.1 * pulse})`);
  g.addColorStop(1, 'rgba(255,245,230,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, 25, 0, TAU);
  ctx.fill();
  // Ghost-like white shimmer
  ctx.fillStyle = `rgba(255,250,240,${0.04 + 0.03 * pulse})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 12, 8, Math.sin(time * 0.3) * 0.1, 0, TAU);
  ctx.fill();
}

/** Generic dust motes (fallback) */
function drawGenericDust(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  for (let i = 0; i < 6; i++) {
    const s = i * 5.7 + 0.5;
    const angle = srand(s) * TAU + time * 0.3;
    const r = 8 + srand(s + 1) * 15;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r - time * 5 % 20;
    const a = 0.15 + 0.1 * Math.sin(time * 2 + i);
    ctx.fillStyle = `rgba(255,220,130,${a})`;
    ctx.beginPath();
    ctx.arc(px, py, 1, 0, TAU);
    ctx.fill();
  }
}
