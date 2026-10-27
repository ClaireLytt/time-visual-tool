/**
 * Act 2 scene renderer: The Phantom of the Opera
 * 4 areas: Dressing Room → Mirror Portal → Spiral Stairs → Underground Tunnel → Underground Lake
 */

const TAU = Math.PI * 2;

interface Act2State {
  mirrorRipple: number;      // 0-1 ripple intensity
  candlesLit: number;        // how many tunnel candles are lit
  boatX: number;             // auto-scroll position on the lake
  boatActive: boolean;       // whether the boat is moving
}

export function createAct2State(): Act2State {
  return { mirrorRipple: 0, candlesLit: 0, boatX: 0, boatActive: false };
}

// ── Dressing Room ──
export function drawDressingRoom(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  cam: number, time: number, state: Act2State
) {
  // Warm interior background
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#1a1412');
  bg.addColorStop(0.5, '#201816');
  bg.addColorStop(1, '#181210');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Wallpaper pattern (subtle damask)
  ctx.fillStyle = 'rgba(80,60,45,0.08)';
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 20; col++) {
      const px = col * 90 + (row % 2) * 45 - cam * 0.3;
      const py = row * 50;
      ctx.beginPath();
      ctx.ellipse(px, py, 12, 18, 0, 0, TAU);
      ctx.fill();
    }
  }

  // Floor
  ctx.fillStyle = '#1e1610';
  ctx.fillRect(0, h * 0.78, w, h * 0.22);

  // Vanity table
  const tableX = 300 - cam;
  ctx.fillStyle = '#3a2a1e';
  ctx.fillRect(tableX, h * 0.55, 250, 15);
  // Table legs
  ctx.fillRect(tableX + 10, h * 0.565, 8, h * 0.22);
  ctx.fillRect(tableX + 232, h * 0.565, 8, h * 0.22);

  // Flowers on table
  for (let i = 0; i < 5; i++) {
    const fx = tableX + 80 + i * 25;
    const fy = h * 0.5 - i * 8;
    ctx.fillStyle = `rgba(200,180,${150 + i * 15},0.6)`;
    ctx.beginPath();
    ctx.arc(fx, fy, 6, 0, TAU);
    ctx.fill();
    // Stems
    ctx.strokeStyle = 'rgba(60,90,50,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 6);
    ctx.lineTo(fx + (i - 2) * 2, h * 0.55);
    ctx.stroke();
  }

  // Candles on table
  for (const cx of [tableX + 30, tableX + 220]) {
    ctx.fillStyle = '#f0e8d8';
    ctx.fillRect(cx - 3, h * 0.48, 6, 30);
    // Flame
    const flicker = Math.sin(time * 8 + cx) * 1.2;
    const fg = ctx.createRadialGradient(cx + flicker * 0.3, h * 0.47, 0, cx, h * 0.47, 20);
    fg.addColorStop(0, 'rgba(255,200,100,0.3)');
    fg.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(cx + flicker * 0.3, h * 0.47, 20, 0, TAU);
    ctx.fill();
    // Flame core
    ctx.beginPath();
    ctx.moveTo(cx, h * 0.45 + flicker * 0.2);
    ctx.bezierCurveTo(cx + 3, h * 0.46, cx + 3, h * 0.48, cx, h * 0.485);
    ctx.bezierCurveTo(cx - 3, h * 0.48, cx - 3, h * 0.46, cx, h * 0.45 + flicker * 0.2);
    ctx.fillStyle = '#ffcc44';
    ctx.fill();
  }

  // Mirror (the key interactive element)
  const mirrorX = 1100 - cam;
  const mirrorW = 100;
  const mirrorH = 220;
  const mirrorY = h * 0.25;

  // Mirror frame (ornate gold)
  ctx.strokeStyle = '#b89a50';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(mirrorX - 8, mirrorY - 8, mirrorW + 16, mirrorH + 16, 6);
  ctx.stroke();

  // Mirror surface
  const mirrorGrad = ctx.createLinearGradient(mirrorX, mirrorY, mirrorX + mirrorW, mirrorY + mirrorH);
  mirrorGrad.addColorStop(0, 'rgba(160,180,200,0.2)');
  mirrorGrad.addColorStop(0.5, 'rgba(180,200,220,0.25)');
  mirrorGrad.addColorStop(1, 'rgba(150,170,190,0.18)');
  ctx.fillStyle = mirrorGrad;
  ctx.fillRect(mirrorX, mirrorY, mirrorW, mirrorH);

  // Mirror ripple effect (when triggered)
  if (state.mirrorRipple > 0) {
    const ripple = state.mirrorRipple;
    for (let ring = 0; ring < 4; ring++) {
      const r = ripple * (30 + ring * 25);
      const a = Math.max(0, 0.3 - ring * 0.08) * (1 - ripple * 0.3);
      ctx.strokeStyle = `rgba(200,220,255,${a})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mirrorX + mirrorW / 2, mirrorY + mirrorH / 2, r, 0, TAU);
      ctx.stroke();
    }
    // White glow center
    const glowGrad = ctx.createRadialGradient(
      mirrorX + mirrorW / 2, mirrorY + mirrorH / 2, 0,
      mirrorX + mirrorW / 2, mirrorY + mirrorH / 2, ripple * 80
    );
    glowGrad.addColorStop(0, `rgba(255,255,255,${0.4 * ripple})`);
    glowGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(mirrorX + mirrorW / 2, mirrorY + mirrorH / 2, ripple * 80, 0, TAU);
    ctx.fill();
  }

  // Shimmer on mirror surface
  const shimmer = 0.06 + 0.03 * Math.sin(time * 1.2);
  ctx.fillStyle = `rgba(200,220,255,${shimmer})`;
  ctx.fillRect(mirrorX + 5, mirrorY + 5, mirrorW - 10, mirrorH - 10);
}

// ── Spiral Stairs ──
export function drawSpiralStairs(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  cam: number, time: number
) {
  // Dark stone background
  ctx.fillStyle = '#0c0a08';
  ctx.fillRect(0, 0, w, h);

  // Stone walls
  for (let row = 0; row < 25; row++) {
    for (let col = 0; col < 15; col++) {
      const bx = col * 75 + (row % 2) * 37 - cam;
      const by = row * 25;
      const shade = 25 + Math.sin(row * 3.7 + col * 2.1) * 8;
      ctx.fillStyle = `rgba(${shade + 10},${shade + 5},${shade},0.7)`;
      ctx.fillRect(bx, by, 72, 22);
    }
  }

  // Spiral staircase steps (receding into depth)
  for (let i = 0; i < 12; i++) {
    const sx = 350 + i * 30 - cam;
    const sy = 150 + i * 30;
    const sw = 300 - i * 15;
    const shade = 40 - i * 2;
    ctx.fillStyle = `rgba(${shade + 10},${shade + 5},${shade},0.9)`;
    ctx.fillRect(sx, sy, sw, 12);
    // Step edge highlight
    ctx.fillStyle = `rgba(${shade + 30},${shade + 25},${shade + 20},0.3)`;
    ctx.fillRect(sx, sy, sw, 2);
  }

  // Candles along the wall (auto-lighting as you enter)
  for (let i = 0; i < 6; i++) {
    const cx = 200 + i * 120 - cam;
    const cy = 130 + i * 25;
    const litProgress = Math.min(1, Math.max(0, (time * 0.5 - i * 0.3)));

    if (litProgress > 0) {
      // Candle body
      ctx.fillStyle = '#f0e8d8';
      ctx.fillRect(cx - 2, cy, 4, 15);
      // Flame
      const fl = Math.sin(time * 7 + i * 2) * 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 6 + fl * 0.3);
      ctx.bezierCurveTo(cx + 3, cy - 3, cx + 3, cy, cx, cy + 1);
      ctx.bezierCurveTo(cx - 3, cy, cx - 3, cy - 3, cx, cy - 6 + fl * 0.3);
      ctx.fillStyle = `rgba(255,200,80,${litProgress})`;
      ctx.fill();
      // Glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
      g.addColorStop(0, `rgba(255,180,80,${0.15 * litProgress})`);
      g.addColorStop(1, 'rgba(255,180,80,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, TAU);
      ctx.fill();
    }
  }

  // Dripping water particles
  for (let i = 0; i < 3; i++) {
    const dx = 300 + i * 200 - cam;
    const dropY = ((time * 60 + i * 200) % h);
    ctx.fillStyle = `rgba(150,180,200,${0.3 - dropY / h * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(dx, dropY, 1.5, 3, 0, 0, TAU);
    ctx.fill();
  }
}

// ── Underground Tunnel ──
export function drawUndergroundTunnel(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  cam: number, time: number
) {
  // Very dark background
  ctx.fillStyle = '#080605';
  ctx.fillRect(0, 0, w, h);

  // Arched ceiling
  ctx.fillStyle = '#0e0c0a';
  ctx.beginPath();
  ctx.moveTo(-cam, h * 0.6);
  for (let x = 0; x < 2560; x += 5) {
    const archHeight = 80 + Math.sin(x * 0.005) * 30;
    ctx.lineTo(x - cam, archHeight);
  }
  ctx.lineTo(2560 - cam, 0);
  ctx.lineTo(-cam, 0);
  ctx.fill();

  // Stone floor
  ctx.fillStyle = '#12100c';
  ctx.fillRect(0, h * 0.75, w, h * 0.25);

  // Wet floor reflections
  for (let i = 0; i < 20; i++) {
    const rx = i * 130 - cam + Math.sin(time * 0.3 + i) * 5;
    const ry = h * 0.78 + Math.sin(i * 1.7) * 10;
    ctx.fillStyle = 'rgba(100,120,140,0.04)';
    ctx.fillRect(rx, ry, 60, 2);
  }

  // Iron gates/arches along the tunnel
  for (let i = 0; i < 5; i++) {
    const gx = 300 + i * 500 - cam;
    ctx.strokeStyle = 'rgba(80,70,55,0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(gx, h * 0.75);
    ctx.lineTo(gx, 120);
    ctx.arc(gx + 40, 120, 40, Math.PI, 0);
    ctx.lineTo(gx + 80, h * 0.75);
    ctx.stroke();
    // Vertical bars
    for (let b = 0; b < 3; b++) {
      ctx.beginPath();
      ctx.moveTo(gx + 20 + b * 20, 130);
      ctx.lineTo(gx + 20 + b * 20, h * 0.75);
      ctx.stroke();
    }
  }

  // Candles that light up as you progress (based on camera position)
  const totalCandles = 25;
  for (let i = 0; i < totalCandles; i++) {
    const cx = 100 + i * 100;
    const cy = 100 + Math.sin(i * 0.7) * 30;
    const screenX = cx - cam;

    // Light candles based on how far camera has scrolled
    const lit = cam + w * 0.3 > cx;
    if (!lit) continue;

    const litTime = Math.max(0, (cam + w * 0.3 - cx) * 0.01);
    const brightness = Math.min(1, litTime);

    // Candle
    ctx.fillStyle = '#f0e8d8';
    ctx.fillRect(screenX - 2, cy, 4, 12);

    // Flame
    const fl = Math.sin(time * 8 + i * 1.7) * 1;
    ctx.beginPath();
    ctx.moveTo(screenX, cy - 5 + fl * 0.2);
    ctx.bezierCurveTo(screenX + 2.5, cy - 2, screenX + 2.5, cy, screenX, cy + 1);
    ctx.bezierCurveTo(screenX - 2.5, cy, screenX - 2.5, cy - 2, screenX, cy - 5 + fl * 0.2);
    ctx.fillStyle = `rgba(255,190,70,${brightness})`;
    ctx.fill();

    // Glow
    const g = ctx.createRadialGradient(screenX, cy, 0, screenX, cy, 50);
    g.addColorStop(0, `rgba(255,170,60,${0.12 * brightness})`);
    g.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(screenX, cy, 50, 0, TAU);
    ctx.fill();
  }

  // Score graffiti on wall (near collectible)
  const scoreX = 1200 - cam;
  if (scoreX > -100 && scoreX < w + 100) {
    ctx.strokeStyle = 'rgba(200,180,140,0.2)';
    ctx.lineWidth = 1;
    // Staff lines
    for (let l = 0; l < 5; l++) {
      ctx.beginPath();
      ctx.moveTo(scoreX, 270 + l * 8);
      ctx.lineTo(scoreX + 70, 270 + l * 8);
      ctx.stroke();
    }
    // Notes (crude circles)
    for (const [nx, ny] of [[15, 274], [30, 282], [45, 278], [60, 290]] as const) {
      ctx.fillStyle = 'rgba(200,180,140,0.25)';
      ctx.beginPath();
      ctx.ellipse(scoreX + nx, ny, 4, 3, -0.2, 0, TAU);
      ctx.fill();
    }
  }

  // Dripping water
  for (let i = 0; i < 5; i++) {
    const dx = 200 + i * 500 - cam;
    const dropY = ((time * 40 + i * 300) % (h * 0.7));
    ctx.fillStyle = `rgba(120,150,180,${0.25 - dropY / h * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(dx, dropY + 80, 1, 2.5, 0, 0, TAU);
    ctx.fill();
  }
}

// ── Underground Lake ──
export function drawUndergroundLake(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  cam: number, time: number, state: Act2State
) {
  // Deep dark blue-black
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#08070a');
  bg.addColorStop(0.4, '#0a090c');
  bg.addColorStop(1, '#06050a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Water surface line
  const waterY = h * 0.55;

  // Water below surface
  const waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
  waterGrad.addColorStop(0, 'rgba(20,25,40,0.8)');
  waterGrad.addColorStop(1, 'rgba(10,12,20,0.95)');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, waterY, w, h - waterY);

  // Water surface ripples
  ctx.strokeStyle = 'rgba(100,120,160,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    for (let x = 0; x < w; x += 3) {
      const waveY = waterY + 2 + Math.sin((x + cam) * 0.02 + time * 0.8 + i * 0.5) * (2 + i * 0.5);
      if (x === 0) ctx.moveTo(x, waveY);
      else ctx.lineTo(x, waveY);
    }
    ctx.stroke();
  }

  // Candles rising from water (the iconic image)
  const candleCount = 40;
  for (let i = 0; i < candleCount; i++) {
    const cx = 200 + i * 70 + Math.sin(i * 3.1) * 30 - cam;
    if (cx < -30 || cx > w + 30) continue;

    const baseY = waterY - 5 + Math.sin(time * 0.5 + i) * 2;
    const candleH = 20 + Math.sin(i * 2.3) * 8;

    // Candle body (in water, partially submerged)
    ctx.fillStyle = '#e8dcc4';
    ctx.fillRect(cx - 2, baseY - candleH, 4, candleH);

    // Flame
    const fl = Math.sin(time * 6 + i * 1.3) * 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, baseY - candleH - 7 + fl * 0.3);
    ctx.bezierCurveTo(cx + 3, baseY - candleH - 3, cx + 3, baseY - candleH, cx, baseY - candleH + 1);
    ctx.bezierCurveTo(cx - 3, baseY - candleH, cx - 3, baseY - candleH - 3, cx, baseY - candleH - 7 + fl * 0.3);
    ctx.fillStyle = '#ffcc44';
    ctx.fill();

    // Glow
    const g = ctx.createRadialGradient(cx, baseY - candleH, 0, cx, baseY - candleH, 35);
    g.addColorStop(0, 'rgba(255,180,70,0.12)');
    g.addColorStop(1, 'rgba(255,180,70,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, baseY - candleH, 35, 0, TAU);
    ctx.fill();

    // Reflection in water
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#e8dcc4';
    ctx.fillRect(cx - 2, baseY + 5, 4, candleH * 0.6);
    // Flame reflection
    const rg = ctx.createRadialGradient(cx, baseY + 10, 0, cx, baseY + 10, 20);
    rg.addColorStop(0, 'rgba(255,180,70,0.15)');
    rg.addColorStop(1, 'rgba(255,180,70,0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(cx, baseY + 10, 20, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Fog/mist above water
  for (let i = 0; i < 12; i++) {
    const fx = (i * 250 + time * 8 + Math.sin(i * 2) * 100) % (w + 200) - 100;
    const fy = waterY - 15 + Math.sin(time * 0.2 + i) * 10;
    const fogGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 60 + Math.sin(i) * 20);
    fogGrad.addColorStop(0, 'rgba(180,190,210,0.05)');
    fogGrad.addColorStop(1, 'rgba(180,190,210,0)');
    ctx.fillStyle = fogGrad;
    ctx.beginPath();
    ctx.arc(fx, fy, 60 + Math.sin(i) * 20, 0, TAU);
    ctx.fill();
  }

  // Boat with Christine and Phantom silhouettes (if boat is active)
  if (state.boatActive) {
    const boatScreenX = w * 0.4; // boat stays centered-ish
    const boatY = waterY - 8 + Math.sin(time * 0.8) * 2;

    // Boat hull
    ctx.fillStyle = '#2a2018';
    ctx.beginPath();
    ctx.moveTo(boatScreenX - 35, boatY);
    ctx.bezierCurveTo(boatScreenX - 40, boatY + 12, boatScreenX + 40, boatY + 12, boatScreenX + 35, boatY);
    ctx.closePath();
    ctx.fill();

    // Phantom silhouette (dark, at back of boat)
    drawGhostFigure(ctx, boatScreenX - 15, boatY - 40, [60, 58, 55], time, 0.6);

    // Christine silhouette (golden, at front)
    drawGhostFigure(ctx, boatScreenX + 15, boatY - 35, [197, 165, 90], time, 0.5);
  }

  // Cave ceiling stalactites
  for (let i = 0; i < 15; i++) {
    const sx = i * 200 + Math.sin(i * 4.1) * 50 - cam;
    const sl = 30 + Math.sin(i * 2.7) * 20;
    ctx.fillStyle = 'rgba(30,28,25,0.8)';
    ctx.beginPath();
    ctx.moveTo(sx - 8, 0);
    ctx.lineTo(sx, sl);
    ctx.lineTo(sx + 8, 0);
    ctx.fill();
  }
}

/** Simple ghost figure for boat scene — a small cluster of colored particles */
function drawGhostFigure(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  color: [number, number, number],
  time: number, scale: number
) {
  const [r, g, b] = color;
  // Head
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * TAU;
    const rad = Math.random() * 6 * scale;
    const px = x + Math.cos(angle + time * 0.5) * rad;
    const py = y + Math.sin(angle + time * 0.3) * rad * 0.8;
    const a = 0.3 + Math.random() * 0.3;
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.beginPath();
    ctx.arc(px, py, 1 + Math.random(), 0, TAU);
    ctx.fill();
  }
  // Body
  for (let i = 0; i < 25; i++) {
    const px = x + (Math.random() - 0.5) * 14 * scale;
    const py = y + 8 + Math.random() * 25 * scale;
    const wobble = Math.sin(time * 1.2 + i) * 1;
    const a = 0.2 + Math.random() * 0.25;
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.beginPath();
    ctx.arc(px + wobble, py, 1 + Math.random() * 0.8, 0, TAU);
    ctx.fill();
  }
}
