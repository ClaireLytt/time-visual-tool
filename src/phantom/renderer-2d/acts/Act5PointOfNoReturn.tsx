/** Act 5: The Point of No Return + Finale */

const TAU = Math.PI * 2;

export interface Act5State {
  chandelierFallen: boolean;
  chandelierY: number;        // 0 = top, increases as it falls
  screenShake: number;        // shake intensity (decays)
  kissHappened: boolean;
  finalFade: number;          // 0-1, fade to black for epilogue
}

export function createAct5State(): Act5State {
  return { chandelierFallen: false, chandelierY: 0, screenShake: 0, kissHappened: false, finalFade: 0 };
}

function srand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ── Theater Performance ──
export function drawTheaterPerformance(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  cam: number, time: number, state: Act5State
) {
  // Apply screen shake
  if (state.screenShake > 0.01) {
    ctx.save();
    const sx = (Math.sin(time * 40) * state.screenShake * 8);
    const sy = (Math.cos(time * 35) * state.screenShake * 5);
    ctx.translate(sx, sy);
  }

  // Theater background — lit up, full house
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#1a1014');
  bg.addColorStop(0.4, '#201418');
  bg.addColorStop(1, '#181210');
  ctx.fillStyle = bg;
  ctx.fillRect(-10, -10, w + 20, h + 20);

  // Curtains
  for (let i = 0; i < 4; i++) {
    for (const side of [-1, 1]) {
      const x = side === -1 ? i * 15 : w - 60 + i * 15;
      ctx.fillStyle = `rgba(80,25,35,${0.7 - i * 0.12})`;
      ctx.fillRect(x - cam * 0.05, 0, 18, h);
    }
  }

  // Full audience (ghost silhouettes, many rows)
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 16; col++) {
      const sx = 80 + col * 60 - cam * 0.3;
      const sy = 350 + row * 35;
      // Seat
      ctx.fillStyle = `rgba(60,20,25,${0.5 - row * 0.06})`;
      ctx.fillRect(sx, sy, 30, 18);
      // Ghost audience member
      const a = 0.08 + srand(row * 16 + col) * 0.06;
      ctx.fillStyle = `rgba(200,195,185,${a})`;
      ctx.beginPath();
      ctx.ellipse(sx + 15, sy - 8, 8, 12, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + 15, sy - 22, 5, 0, TAU);
      ctx.fill();
    }
  }

  // Stage
  ctx.fillStyle = '#2a1e16';
  ctx.fillRect(200 - cam, 280, 600, 70);
  // Stage footlights
  for (let i = 0; i < 6; i++) {
    const fx = 250 + i * 90 - cam;
    const glow = ctx.createRadialGradient(fx, 280, 0, fx, 280, 25);
    glow.addColorStop(0, `rgba(255,200,100,${0.25 + 0.08 * Math.sin(time * 3 + i)})`);
    glow.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fx, 280, 25, 0, TAU);
    ctx.fill();
  }

  // Two figures on stage (duet)
  const stageCenter = 500 - cam;
  // Phantom/Don Juan (dark)
  drawStageFigure(ctx, stageCenter - 40, 240, [60, 58, 55], time);
  // Christine (golden)
  drawStageFigure(ctx, stageCenter + 40, 245, [197, 165, 90], time);

  // ── Chandelier ──
  const chandelierX = 500 - cam * 0.3;
  const chandelierBaseY = 30;
  const chandelierCurrentY = chandelierBaseY + state.chandelierY;

  if (!state.chandelierFallen || state.chandelierY < 250) {
    // Chain
    if (!state.chandelierFallen) {
      ctx.strokeStyle = '#8a7a50';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(chandelierX, 0);
      ctx.lineTo(chandelierX, chandelierCurrentY);
      ctx.stroke();
    }

    // Chandelier body
    ctx.fillStyle = '#c8b880';
    ctx.beginPath();
    ctx.moveTo(chandelierX - 30, chandelierCurrentY);
    ctx.lineTo(chandelierX + 30, chandelierCurrentY);
    ctx.lineTo(chandelierX + 20, chandelierCurrentY + 25);
    ctx.lineTo(chandelierX - 20, chandelierCurrentY + 25);
    ctx.fill();
    // Chandelier glow
    const cGlow = ctx.createRadialGradient(chandelierX, chandelierCurrentY + 10, 0, chandelierX, chandelierCurrentY + 10, 60);
    cGlow.addColorStop(0, 'rgba(255,220,150,0.15)');
    cGlow.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = cGlow;
    ctx.beginPath();
    ctx.arc(chandelierX, chandelierCurrentY + 10, 60, 0, TAU);
    ctx.fill();
    // Crystal pendants
    for (let i = 0; i < 7; i++) {
      const cx = chandelierX - 18 + i * 6;
      const cy = chandelierCurrentY + 22 + Math.sin(i * 1.5 + time * 2) * 2;
      ctx.fillStyle = 'rgba(220,215,200,0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 1.5, 4, 0, 0, TAU);
      ctx.fill();
    }
  }

  // ── Impact debris (after chandelier falls) ──
  if (state.chandelierFallen && state.screenShake > 0.01) {
    for (let i = 0; i < 30; i++) {
      const angle = srand(i * 3.7) * TAU;
      const speed = srand(i * 5.1) * 200 * state.screenShake;
      const dx = chandelierX + Math.cos(angle) * speed;
      const dy = 290 + Math.sin(angle) * speed * 0.5 - 50;
      const a = state.screenShake * (0.3 + srand(i * 2.3) * 0.3);
      ctx.fillStyle = `rgba(220,210,180,${a})`;
      ctx.beginPath();
      ctx.arc(dx, dy, 1 + srand(i) * 2, 0, TAU);
      ctx.fill();
    }
    // Dust cloud
    const dustGrad = ctx.createRadialGradient(chandelierX, 290, 0, chandelierX, 290, 150 * state.screenShake);
    dustGrad.addColorStop(0, `rgba(180,170,150,${0.15 * state.screenShake})`);
    dustGrad.addColorStop(1, 'rgba(180,170,150,0)');
    ctx.fillStyle = dustGrad;
    ctx.beginPath();
    ctx.arc(chandelierX, 290, 150 * state.screenShake, 0, TAU);
    ctx.fill();
  }

  if (state.screenShake > 0.01) {
    ctx.restore();
  }
}

// ── Final Lair (confrontation + kiss) ──
export function drawFinalLair(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  cam: number, time: number, state: Act5State
) {
  // Dark cave — same as Act 3 but more somber
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#0a0808');
  bg.addColorStop(1, '#080606');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Water at bottom
  const waterY = h * 0.7;
  ctx.fillStyle = 'rgba(15,18,30,0.8)';
  ctx.fillRect(0, waterY, w, h - waterY);
  // Ripples
  ctx.strokeStyle = 'rgba(80,90,120,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    for (let x = 0; x < w; x += 3) {
      const wy = waterY + 5 + Math.sin((x + cam) * 0.015 + time * 0.6 + i * 0.7) * (1.5 + i * 0.5);
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }

  // Sparse candles
  for (let i = 0; i < 15; i++) {
    const cx = 100 + i * 130 - cam;
    const cy = h * 0.55 + Math.sin(i * 2.1) * 20;
    ctx.fillStyle = '#e8dcc4';
    ctx.fillRect(cx - 1.5, cy, 3, 10);
    const fl = Math.sin(time * 6 + i) * 0.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 4 + fl * 0.2);
    ctx.bezierCurveTo(cx + 2, cy - 1, cx + 2, cy, cx, cy + 1);
    ctx.bezierCurveTo(cx - 2, cy, cx - 2, cy - 1, cx, cy - 4 + fl * 0.2);
    ctx.fillStyle = state.kissHappened ? 'rgba(255,220,150,0.8)' : 'rgba(255,190,70,0.6)';
    ctx.fill();
  }

  // Three figures: Phantom, Christine, Raoul
  if (!state.kissHappened) {
    // Confrontation: three figures apart
    drawStageFigure(ctx, 900 - cam, h * 0.45, [60, 58, 55], time);      // Phantom center
    drawStageFigure(ctx, 1100 - cam, h * 0.48, [197, 165, 90], time);    // Christine right
    drawStageFigure(ctx, 700 - cam, h * 0.5, [139, 175, 196], time);     // Raoul left, bound
  } else {
    // After kiss: Christine and Phantom close, warm light
    drawStageFigure(ctx, 950 - cam, h * 0.45, [60, 58, 55], time);
    drawStageFigure(ctx, 970 - cam, h * 0.45, [197, 165, 90], time);
    // Warm glow where they meet
    const kissGlow = ctx.createRadialGradient(960 - cam, h * 0.45, 0, 960 - cam, h * 0.45, 60);
    kissGlow.addColorStop(0, 'rgba(255,220,170,0.12)');
    kissGlow.addColorStop(1, 'rgba(255,220,170,0)');
    ctx.fillStyle = kissGlow;
    ctx.beginPath();
    ctx.arc(960 - cam, h * 0.45, 60, 0, TAU);
    ctx.fill();
  }

  // Music box on ground (collectible)
  const mbx = 800 - cam;
  ctx.fillStyle = '#8a7050';
  ctx.fillRect(mbx, h * 0.68, 16, 10);
  ctx.fillStyle = '#a08860';
  ctx.fillRect(mbx + 1, h * 0.68 + 1, 14, 3);
}

// ── Epilogue ──
export function drawEpilogue(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  _cam: number, time: number, state: Act5State
) {
  // Pure black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // Single spotlight beam
  const spotX = w / 2;
  const spotY = h * 0.7;
  const spotGrad = ctx.createRadialGradient(spotX, spotY - 100, 0, spotX, spotY, 120);
  spotGrad.addColorStop(0, 'rgba(255,240,200,0.08)');
  spotGrad.addColorStop(0.5, 'rgba(255,240,200,0.04)');
  spotGrad.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = spotGrad;
  ctx.beginPath();
  ctx.arc(spotX, spotY - 20, 120, 0, TAU);
  ctx.fill();

  // Light cone from above
  ctx.fillStyle = 'rgba(255,240,200,0.02)';
  ctx.beginPath();
  ctx.moveTo(spotX - 5, 0);
  ctx.lineTo(spotX - 80, spotY);
  ctx.lineTo(spotX + 80, spotY);
  ctx.lineTo(spotX + 5, 0);
  ctx.fill();

  // The mask — slowly rotating, the final image
  const maskRotation = time * 0.08;
  ctx.save();
  ctx.translate(spotX, spotY);
  ctx.rotate(Math.sin(maskRotation) * 0.15);

  // Mask shape
  ctx.fillStyle = '#f5f0e8';
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 14, 0, 0, TAU);
  ctx.fill();
  // Eye hole
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(6, -2, 5, 3.5, 0.1, 0, TAU);
  ctx.fill();
  // Mask edge highlight
  ctx.strokeStyle = 'rgba(200,190,175,0.4)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 14, 0, 0, TAU);
  ctx.stroke();
  // Specular
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(-6, -6, 6, 3, -0.3, 0, TAU);
  ctx.fill();

  ctx.restore();

  // Golden dust motes around mask
  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * TAU + time * 0.15;
    const r = 50 + Math.sin(time * 0.4 + i * 1.3) * 20;
    const mx = spotX + Math.cos(angle) * r;
    const my = spotY - 20 + Math.sin(angle) * r * 0.4;
    const a = 0.1 + 0.06 * Math.sin(time * 0.8 + i * 2);
    ctx.fillStyle = `rgba(197,165,90,${a})`;
    ctx.beginPath();
    ctx.arc(mx, my, 1, 0, TAU);
    ctx.fill();
  }

  // Fade to black overlay
  if (state.finalFade > 0) {
    ctx.fillStyle = `rgba(0,0,0,${state.finalFade})`;
    ctx.fillRect(0, 0, w, h);

    // End title text (appears as fade progresses)
    if (state.finalFade > 0.5) {
      const textAlpha = Math.min(1, (state.finalFade - 0.5) * 2);
      ctx.fillStyle = `rgba(197,165,90,${textAlpha})`;
      ctx.font = '20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('他的音乐永远回荡在这座歌剧院里。', w / 2, h / 2);
      ctx.font = '12px Georgia, serif';
      ctx.fillStyle = `rgba(154,138,120,${textAlpha * 0.7})`;
      ctx.fillText('THE PHANTOM OF THE OPERA', w / 2, h / 2 + 30);
    }
  }
}

/** Simple particle stage figure (shared across Act 5 scenes) */
function drawStageFigure(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  color: [number, number, number],
  time: number
) {
  const [r, g, b] = color;
  // Head
  for (let i = 0; i < 12; i++) {
    const seed = i * 7.3;
    const angle = srand(seed) * TAU;
    const rad = srand(seed + 1) * 8;
    const px = x + Math.cos(angle + time * 0.4) * rad;
    const py = y + Math.sin(angle + time * 0.3) * rad * 0.7;
    ctx.fillStyle = `rgba(${r},${g},${b},${0.3 + srand(seed + 2) * 0.3})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.2 + srand(seed + 3), 0, TAU);
    ctx.fill();
  }
  // Body
  for (let i = 0; i < 20; i++) {
    const seed = i * 13.7 + 100;
    const px = x + (srand(seed) - 0.5) * 16;
    const py = y + 10 + srand(seed + 1) * 30;
    const wobble = Math.sin(time * 1 + i * 0.7) * 1;
    ctx.fillStyle = `rgba(${r},${g},${b},${0.2 + srand(seed + 2) * 0.2})`;
    ctx.beginPath();
    ctx.arc(px + wobble, py, 1 + srand(seed + 3) * 0.7, 0, TAU);
    ctx.fill();
  }
}
