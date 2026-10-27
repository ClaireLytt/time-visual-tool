/** Act 3: Music of the Night — Phantom's Lair */

import { TAU } from '../draw-utils';

export interface Act3State {
  candleWaveProgress: number;  // 0-1, how far the candle-wave has spread
  unmasked: boolean;           // whether the unmasking has happened
  coldLighting: boolean;       // post-unmasking cold tones
}

export function createAct3State(): Act3State {
  return { candleWaveProgress: 0, unmasked: false, coldLighting: false };
}

export function drawLair(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  cam: number, time: number, state: Act3State
) {
  // Cave background
  const warm = state.coldLighting ? 0.3 : 1;
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, state.coldLighting ? '#080a10' : '#100c08');
  bg.addColorStop(1, state.coldLighting ? '#060810' : '#0c0a06');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Rocky cave walls
  for (let i = 0; i < 30; i++) {
    const wx = i * 90 - cam * 0.2;
    const wy = Math.sin(i * 1.3) * 40;
    const shade = state.coldLighting ? 18 : 28;
    ctx.fillStyle = `rgba(${shade + 5},${shade},${shade - 5},0.5)`;
    ctx.beginPath();
    ctx.ellipse(wx, wy + 30, 50, 35, 0, 0, TAU);
    ctx.fill();
  }

  // Cave floor
  ctx.fillStyle = state.coldLighting ? '#0a0c12' : '#1a1610';
  ctx.fillRect(0, h * 0.8, w, h * 0.2);

  // ── Organ (center of the lair) ──
  const organX = 1000 - cam;

  // Organ pipes
  const pipeHeights = [120, 150, 180, 160, 140, 170, 130, 155, 145];
  for (let i = 0; i < pipeHeights.length; i++) {
    const px = organX + i * 22 - 90;
    const ph = pipeHeights[i];
    ctx.fillStyle = `rgba(${state.coldLighting ? '60,65,80' : '80,70,55'},0.8)`;
    ctx.fillRect(px, h * 0.5 - ph, 18, ph);
    // Pipe top cap
    ctx.fillStyle = `rgba(${state.coldLighting ? '70,75,90' : '100,85,65'},0.6)`;
    ctx.fillRect(px - 2, h * 0.5 - ph - 5, 22, 8);
  }

  // Organ body
  ctx.fillStyle = state.coldLighting ? '#1a1c24' : '#2a2218';
  ctx.fillRect(organX - 100, h * 0.5, 200, 60);
  // Keyboard (white keys)
  for (let i = 0; i < 15; i++) {
    const kx = organX - 90 + i * 12;
    const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
    if (!isBlack) {
      ctx.fillStyle = '#e8e0d4';
      ctx.fillRect(kx, h * 0.5 + 5, 10, 25);
    }
  }
  // Black keys
  for (let i = 0; i < 15; i++) {
    const kx = organX - 90 + i * 12;
    const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
    if (isBlack) {
      ctx.fillStyle = '#1a1818';
      ctx.fillRect(kx, h * 0.5 + 5, 8, 16);
    }
  }

  // Key highlights (animated, following music)
  const activeKey = Math.floor((time * 3) % 15);
  const kx = organX - 90 + activeKey * 12;
  const keyGlow = ctx.createRadialGradient(kx + 5, h * 0.5 + 15, 0, kx + 5, h * 0.5 + 15, 15);
  keyGlow.addColorStop(0, `rgba(255,200,100,${0.3 * warm})`);
  keyGlow.addColorStop(1, 'rgba(255,200,100,0)');
  ctx.fillStyle = keyGlow;
  ctx.beginPath();
  ctx.arc(kx + 5, h * 0.5 + 15, 15, 0, TAU);
  ctx.fill();

  // ── Candles (wave-lighting from organ outward) ──
  const candlePositions: Array<[number, number]> = [];
  for (let i = 0; i < 50; i++) {
    const angle = i * 0.43;
    const radius = 100 + i * 15 + Math.sin(i * 2.1) * 30;
    candlePositions.push([
      organX + Math.cos(angle) * radius,
      h * 0.65 + Math.sin(angle) * radius * 0.3 - 40
    ]);
  }

  for (let i = 0; i < candlePositions.length; i++) {
    const [cx, cy] = candlePositions[i];
    const dist = Math.abs(cx + cam - 1000);
    const litTime = state.candleWaveProgress * 800 - dist;
    if (litTime <= 0) continue;
    const brightness = Math.min(1, litTime * 0.005) * warm;

    // Candle
    ctx.fillStyle = '#e8dcc4';
    ctx.fillRect(cx - 1.5, cy, 3, 10);
    // Flame
    const fl = Math.sin(time * 7 + i * 1.3) * 0.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 4 + fl * 0.2);
    ctx.bezierCurveTo(cx + 2, cy - 1, cx + 2, cy, cx, cy + 1);
    ctx.bezierCurveTo(cx - 2, cy, cx - 2, cy - 1, cx, cy - 4 + fl * 0.2);
    ctx.fillStyle = `rgba(255,190,70,${brightness})`;
    ctx.fill();
    // Glow
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
    g.addColorStop(0, `rgba(255,170,60,${0.08 * brightness})`);
    g.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, TAU);
    ctx.fill();
  }

  // ── Portraits on wall ──
  const portraitX = 500 - cam;
  ctx.strokeStyle = '#8a7a50';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(portraitX, h * 0.25, 80, 100);
  ctx.stroke();
  ctx.fillStyle = 'rgba(197,165,90,0.05)';
  ctx.fillRect(portraitX + 2, h * 0.25 + 2, 76, 96);
  // "C" silhouette in portrait
  ctx.fillStyle = 'rgba(197,165,90,0.1)';
  ctx.beginPath();
  ctx.ellipse(portraitX + 40, h * 0.25 + 35, 15, 18, 0, 0, TAU);
  ctx.fill();

  // ── Wax figure in corner (creepy wedding dress mannequin) ──
  const mannequinX = 2000 - cam;
  ctx.fillStyle = 'rgba(200,195,185,0.12)';
  // Dress shape
  ctx.beginPath();
  ctx.moveTo(mannequinX, h * 0.4);
  ctx.lineTo(mannequinX - 25, h * 0.8);
  ctx.lineTo(mannequinX + 25, h * 0.8);
  ctx.closePath();
  ctx.fill();
  // Head
  ctx.beginPath();
  ctx.arc(mannequinX, h * 0.35, 12, 0, TAU);
  ctx.fill();

  // ── Fallen mask on ground (visible after unmasking) ──
  if (state.unmasked) {
    const maskX = 1300 - cam;
    const maskY = h * 0.82;
    ctx.fillStyle = '#f5f0e8';
    ctx.beginPath();
    ctx.ellipse(maskX, maskY, 15, 10, 0.2, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,170,155,0.5)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Mask glow
    const mg = ctx.createRadialGradient(maskX, maskY, 0, maskX, maskY, 30);
    mg.addColorStop(0, 'rgba(255,240,200,0.08)');
    mg.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(maskX, maskY, 30, 0, TAU);
    ctx.fill();
  }
}
