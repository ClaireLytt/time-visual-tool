/**
 * Character rendering — particle silhouette figures for each scene.
 * Each character is a cluster of colored particles with animations.
 */
import { TAU, srand } from './draw-utils';

type AnimState = 'idle' | 'singing' | 'walking' | 'fleeing' | 'reaching' | 'sitting';

interface CharacterInstance {
  id: string;
  color: [number, number, number];
  x: number;
  y: number;
  scale: number;
  anim: AnimState;
  particleCount: number;
  /** Seed offset so each character's particles look different */
  seedBase: number;
}

/**
 * Get the characters that should be visible in a given area + story state.
 */
export function getCharactersForArea(
  areaId: string,
  triggeredEvents: string[]
): CharacterInstance[] {
  const chars: CharacterInstance[] = [];

  // Act 1 — Theater
  if (areaId === 'theater-stage') {
    // Carlotta (before Think of Me triggers)
    if (!triggeredEvents.includes('evt-think-of-me-start')) {
      chars.push({
        id: 'carlotta', color: [180, 80, 80], x: 900, y: 350,
        scale: 0.9, anim: 'singing', particleCount: 35, seedBase: 100,
      });
      // Managers in front row
      chars.push({
        id: 'manager1', color: [120, 115, 105], x: 600, y: 460,
        scale: 0.5, anim: 'sitting', particleCount: 15, seedBase: 200,
      });
      chars.push({
        id: 'manager2', color: [110, 108, 100], x: 680, y: 460,
        scale: 0.5, anim: 'sitting', particleCount: 15, seedBase: 210,
      });
    }
    // Christine (after Think of Me triggers)
    if (triggeredEvents.includes('evt-think-of-me-start')) {
      chars.push({
        id: 'christine', color: [197, 165, 90], x: 1000, y: 360,
        scale: 1.0, anim: 'singing', particleCount: 50, seedBase: 300,
      });
    }
  }

  if (areaId === 'theater-audience' && triggeredEvents.includes('evt-think-of-me-start')) {
    // Phantom silhouette in Box 5 — appears intermittently
    chars.push({
      id: 'phantom-box5', color: [60, 58, 55], x: 1700, y: 210,
      scale: 0.7, anim: 'idle', particleCount: 25, seedBase: 400,
    });
  }

  // Act 2 — Underground Lake
  if (areaId === 'underground-lake') {
    chars.push({
      id: 'phantom-boat', color: [60, 58, 55], x: 400, y: 270,
      scale: 0.6, anim: 'idle', particleCount: 25, seedBase: 500,
    });
    chars.push({
      id: 'christine-boat', color: [197, 165, 90], x: 430, y: 275,
      scale: 0.55, anim: 'idle', particleCount: 22, seedBase: 510,
    });
  }

  // Act 3 — Lair
  if (areaId === 'lair') {
    // Phantom at organ
    chars.push({
      id: 'phantom-organ', color: [60, 58, 55], x: 1000, y: 230,
      scale: 0.9, anim: triggeredEvents.includes('evt-music-of-night-start') ? 'singing' : 'sitting',
      particleCount: 40, seedBase: 600,
    });
    // Christine watching
    if (triggeredEvents.includes('evt-music-of-night-start')) {
      chars.push({
        id: 'christine-lair', color: [197, 165, 90], x: 1100, y: 260,
        scale: 0.8, anim: 'idle', particleCount: 35, seedBase: 610,
      });
    }
  }

  // Act 4 — Rooftop
  if (areaId === 'rooftop') {
    if (triggeredEvents.includes('evt-all-i-ask-start')) {
      chars.push({
        id: 'christine-roof', color: [197, 165, 90], x: 850, y: 310,
        scale: 0.8, anim: 'singing', particleCount: 35, seedBase: 700,
      });
      chars.push({
        id: 'raoul-roof', color: [139, 175, 196], x: 950, y: 315,
        scale: 0.8, anim: 'idle', particleCount: 30, seedBase: 710,
      });
    }
    // Phantom behind angel statue (always present, lurking)
    chars.push({
      id: 'phantom-roof', color: [60, 58, 55], x: 1825, y: 340,
      scale: 0.6, anim: 'idle', particleCount: 20, seedBase: 720,
    });
  }

  // Act 5 — Performance
  if (areaId === 'theater-performance') {
    chars.push({
      id: 'phantom-stage', color: [60, 58, 55], x: 460, y: 250,
      scale: 0.8, anim: 'singing', particleCount: 35, seedBase: 800,
    });
    chars.push({
      id: 'christine-stage', color: [197, 165, 90], x: 540, y: 255,
      scale: 0.8, anim: 'singing', particleCount: 35, seedBase: 810,
    });
  }

  // Act 5 — Final Lair
  if (areaId === 'final-lair') {
    chars.push({
      id: 'phantom-final', color: [60, 58, 55], x: 900, y: 250,
      scale: 0.9, anim: 'idle', particleCount: 40, seedBase: 900,
    });
    chars.push({
      id: 'christine-final', color: [197, 165, 90], x: 1050, y: 260,
      scale: 0.8, anim: 'idle', particleCount: 35, seedBase: 910,
    });
    chars.push({
      id: 'raoul-final', color: [139, 175, 196], x: 750, y: 270,
      scale: 0.7, anim: 'idle', particleCount: 25, seedBase: 920,
    });
  }

  return chars;
}

/**
 * Draw all characters for the current scene.
 */
export function drawCharacters(
  ctx: CanvasRenderingContext2D,
  characters: CharacterInstance[],
  cam: number,
  time: number
) {
  for (const ch of characters) {
    const screenX = ch.x - cam;
    // Skip if offscreen
    if (screenX < -60 || screenX > 1100) continue;

    // Phantom in box5 only flashes intermittently
    if (ch.id === 'phantom-box5') {
      if (Math.sin(time * 0.3) < 0.85) continue;
    }

    drawParticleFigure(ctx, screenX, ch.y, ch.color, ch.scale, ch.anim, ch.particleCount, ch.seedBase, time);
  }
}

function drawParticleFigure(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  color: [number, number, number],
  scale: number,
  anim: AnimState,
  count: number,
  seedBase: number,
  time: number
) {
  const [r, g, b] = color;
  const sc = scale;

  // Animation offsets
  let headBob = 0;
  let armSwing = 0;
  let bodySway = 0;

  switch (anim) {
    case 'singing':
      headBob = Math.sin(time * 2) * 2 * sc;
      armSwing = Math.sin(time * 1.2) * 6 * sc;
      bodySway = Math.sin(time * 0.8) * 1.5 * sc;
      break;
    case 'walking':
      headBob = Math.abs(Math.sin(time * 4)) * 2 * sc;
      bodySway = Math.sin(time * 3) * 3 * sc;
      break;
    case 'fleeing':
      bodySway = Math.sin(time * 6) * 5 * sc;
      headBob = Math.abs(Math.sin(time * 5)) * 3 * sc;
      break;
    case 'reaching':
      armSwing = 8 * sc;
      break;
    case 'sitting':
      bodySway = Math.sin(time * 0.5) * 0.5 * sc;
      break;
    default: // idle
      bodySway = Math.sin(time * 0.7) * 1 * sc;
      headBob = Math.sin(time * 1.2) * 0.8 * sc;
  }

  // Head particles
  const headY = y - 15 * sc + headBob;
  const headCount = Math.max(5, Math.floor(count * 0.35));
  for (let i = 0; i < headCount; i++) {
    const s = seedBase + i * 7.3;
    const angle = srand(s) * TAU;
    const rad = srand(s + 1) * 8 * sc;
    const px = x + bodySway + Math.cos(angle + time * 0.4) * rad;
    const py = headY + Math.sin(angle + time * 0.3) * rad * 0.7;
    const a = 0.25 + srand(s + 2) * 0.3;
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.beginPath();
    ctx.arc(px, py, (1 + srand(s + 3)) * sc, 0, TAU);
    ctx.fill();
  }

  // Body particles
  const bodyCount = count - headCount;
  for (let i = 0; i < bodyCount; i++) {
    const s = seedBase + 500 + i * 13.7;
    const bx = x + bodySway + (srand(s) - 0.5) * 16 * sc;
    const by = y + 2 * sc + srand(s + 1) * 28 * sc;
    const wobble = Math.sin(time * 1 + i * 0.7) * 1 * sc;
    // Arms extend outward when singing/reaching
    let armOff = 0;
    if ((anim === 'singing' || anim === 'reaching') && srand(s + 4) > 0.7) {
      armOff = armSwing * (srand(s + 5) > 0.5 ? 1 : -1);
    }
    const a = 0.2 + srand(s + 2) * 0.25;
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.beginPath();
    ctx.arc(bx + wobble + armOff, by, (0.8 + srand(s + 3) * 0.7) * sc, 0, TAU);
    ctx.fill();
  }
}
