/** Act 4: All I Ask of You — Opera House Rooftop */

const TAU = Math.PI * 2;

export interface Act4State {
  petalsActive: boolean;      // flower petals falling
  repriseActive: boolean;     // reprise mode: dark, stormy
  lightning: number;          // 0-1 flash intensity
}

export function createAct4State(): Act4State {
  return { petalsActive: false, repriseActive: false, lightning: 0 };
}

/** Seeded random for deterministic petal positions */
function srand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function drawRooftop(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  cam: number, time: number, state: Act4State
) {
  // Sky — shifts from warm to cold during reprise
  const isStorm = state.repriseActive;
  const bg = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  if (isStorm) {
    bg.addColorStop(0, '#0a0c14');
    bg.addColorStop(1, '#141828');
  } else {
    bg.addColorStop(0, '#0c1020');
    bg.addColorStop(1, '#1a2040');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Stars
  if (!isStorm) {
    for (let i = 0; i < 60; i++) {
      const sx = srand(i * 3.7) * w;
      const sy = srand(i * 5.3) * h * 0.4;
      const twinkle = 0.3 + 0.4 * Math.sin(time * (0.5 + srand(i * 2.1)) + i);
      ctx.fillStyle = `rgba(255,255,240,${twinkle})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8 + srand(i * 1.1) * 0.8, 0, TAU);
      ctx.fill();
    }
  }

  // Moon
  if (!isStorm) {
    const moonX = w * 0.75;
    const moonY = h * 0.12;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 80);
    moonGlow.addColorStop(0, 'rgba(220,230,255,0.15)');
    moonGlow.addColorStop(1, 'rgba(220,230,255,0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 80, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#e8e4d8';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 18, 0, TAU);
    ctx.fill();
  }

  // Paris skyline (dark silhouettes)
  ctx.fillStyle = isStorm ? '#08080e' : '#0e1018';
  // Buildings
  const buildings = [
    [50, 0.55, 40, 0.15], [120, 0.48, 35, 0.22], [200, 0.52, 50, 0.18],
    [300, 0.45, 30, 0.25], [380, 0.5, 45, 0.2], [480, 0.42, 25, 0.28],
    [550, 0.53, 55, 0.17], [650, 0.47, 38, 0.23], [750, 0.44, 32, 0.26],
  ];
  for (const [bx, heightFrac, bw] of buildings) {
    const screenX = (bx as number) - cam * 0.15;
    const bh = h * (heightFrac as number);
    ctx.fillRect(screenX, bh, bw as number, h - bh);
    // Random lit windows
    for (let wy = 0; wy < 5; wy++) {
      for (let wx = 0; wx < 3; wx++) {
        if (srand(bx + wy * 7 + wx * 13) > 0.5) {
          const winX = screenX + 5 + wx * ((bw as number) - 10) / 3;
          const winY = bh + 8 + wy * 15;
          ctx.fillStyle = `rgba(255,200,100,${isStorm ? 0.05 : 0.15 + srand(bx + wy + wx) * 0.1})`;
          ctx.fillRect(winX, winY, 4, 5);
        }
      }
    }
    ctx.fillStyle = isStorm ? '#08080e' : '#0e1018';
  }

  // Rooftop floor
  ctx.fillStyle = isStorm ? '#12141a' : '#1a1c20';
  ctx.fillRect(0, h * 0.75, w, h * 0.25);

  // Stone railing
  ctx.fillStyle = '#2a2c30';
  ctx.fillRect(0 - cam * 0.1, h * 0.73, w + 200, 8);
  // Balusters
  for (let i = 0; i < 20; i++) {
    const bx = 50 + i * 100 - cam * 0.1;
    ctx.fillRect(bx, h * 0.68, 6, h * 0.05 + 8);
  }

  // Angel statue (right side)
  const angelX = 1800 - cam;
  ctx.fillStyle = '#3a3c40';
  // Body
  ctx.beginPath();
  ctx.moveTo(angelX, h * 0.4);
  ctx.lineTo(angelX - 20, h * 0.73);
  ctx.lineTo(angelX + 20, h * 0.73);
  ctx.closePath();
  ctx.fill();
  // Head
  ctx.beginPath();
  ctx.arc(angelX, h * 0.36, 12, 0, TAU);
  ctx.fill();
  // Wings
  if (!isStorm) {
    ctx.beginPath();
    ctx.moveTo(angelX - 5, h * 0.42);
    ctx.bezierCurveTo(angelX - 50, h * 0.3, angelX - 55, h * 0.25, angelX - 30, h * 0.2);
    ctx.fillStyle = 'rgba(58,60,64,0.7)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(angelX + 5, h * 0.42);
    ctx.bezierCurveTo(angelX + 50, h * 0.3, angelX + 55, h * 0.25, angelX + 30, h * 0.2);
    ctx.fill();
  } else {
    // Broken wing (post-lightning)
    ctx.beginPath();
    ctx.moveTo(angelX - 5, h * 0.42);
    ctx.bezierCurveTo(angelX - 40, h * 0.35, angelX - 35, h * 0.32, angelX - 20, h * 0.3);
    ctx.fillStyle = 'rgba(58,60,64,0.5)';
    ctx.fill();
  }

  // ── Lightning flash ──
  if (state.lightning > 0) {
    ctx.fillStyle = `rgba(200,210,255,${state.lightning * 0.6})`;
    ctx.fillRect(0, 0, w, h);
  }

  // ── Falling petals / ashes ──
  if (state.petalsActive) {
    for (let i = 0; i < 40; i++) {
      const seed = i * 7.3;
      const px = (srand(seed) * w * 1.5 + time * 15) % (w + 50) - 25;
      const py = (srand(seed + 1) * h + time * 25 + i * 40) % (h + 20) - 10;
      const rot = time * 0.5 + srand(seed + 2) * TAU;

      if (isStorm) {
        // Ashes (gray)
        const a = 0.15 + srand(seed + 3) * 0.1;
        ctx.fillStyle = `rgba(120,115,110,${a})`;
      } else {
        // White petals
        const a = 0.25 + srand(seed + 3) * 0.15;
        ctx.fillStyle = `rgba(240,235,225,${a})`;
      }
      ctx.beginPath();
      ctx.ellipse(px, py, 4, 2, rot, 0, TAU);
      ctx.fill();
    }
  }

  // ── Phantom shadow behind angel (visible in reprise) ──
  if (isStorm) {
    const phantomX = angelX + 25;
    ctx.fillStyle = 'rgba(30,28,25,0.5)';
    // Cloak shape
    ctx.beginPath();
    ctx.moveTo(phantomX, h * 0.38);
    ctx.bezierCurveTo(phantomX - 15, h * 0.5, phantomX - 20, h * 0.65, phantomX - 12, h * 0.73);
    ctx.lineTo(phantomX + 12, h * 0.73);
    ctx.bezierCurveTo(phantomX + 20, h * 0.65, phantomX + 15, h * 0.5, phantomX, h * 0.38);
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.arc(phantomX, h * 0.35, 8, 0, TAU);
    ctx.fill();
    // Glowing eyes
    const eyeAlpha = 0.4 + 0.3 * Math.sin(time * 2);
    ctx.fillStyle = `rgba(180,200,220,${eyeAlpha})`;
    ctx.beginPath();
    ctx.arc(phantomX - 3, h * 0.35, 1.5, 0, TAU);
    ctx.arc(phantomX + 3, h * 0.35, 1.5, 0, TAU);
    ctx.fill();
  }
}
