/** Act 2 — The Phantom of the Opera: 4 areas with parallax */
import { ParallaxScene } from '../parallax';
import { TAU, srand } from '../draw-utils';

// ── Dressing Room ──
export const dressingRoomScene: ParallaxScene = {
  layers: [
    // Far: wallpaper pattern
    {
      depth: 0.15,
      draw(ctx, w, h, ox, oy) {
        ctx.fillStyle = '#1a1412';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(80,60,45,0.06)';
        for (let row = 0; row < 14; row++) {
          for (let col = 0; col < 22; col++) {
            const px = col * 80 + (row % 2) * 40 - ox;
            const py = row * 45 - oy;
            ctx.beginPath();
            ctx.ellipse(px, py, 10, 16, 0, 0, TAU);
            ctx.fill();
          }
        }
      },
    },
    // Mid: furniture + flowers
    {
      depth: 0.5,
      draw(ctx, _w, h, ox, oy, time) {
        // Vanity table
        const tx = 300 - ox;
        const ty = h * 0.55 - oy;
        ctx.fillStyle = '#3a2a1e';
        ctx.fillRect(tx, ty, 250, 14);
        ctx.fillRect(tx + 10, ty + 14, 8, h * 0.22);
        ctx.fillRect(tx + 232, ty + 14, 8, h * 0.22);
        // Vanity mirror on table
        ctx.strokeStyle = 'rgba(160,140,80,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(tx + 125, ty - 60, 40, 55, 0, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = 'rgba(160,180,200,0.06)';
        ctx.beginPath();
        ctx.ellipse(tx + 125, ty - 60, 38, 53, 0, 0, TAU);
        ctx.fill();
        // Flowers
        for (let i = 0; i < 6; i++) {
          const fx = tx + 60 + i * 28;
          const fy = ty - 15 - i * 6;
          ctx.fillStyle = `rgba(220,200,${160 + i * 12},0.5)`;
          ctx.beginPath();
          ctx.arc(fx, fy, 5, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = 'rgba(60,90,50,0.4)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(fx, fy + 5);
          ctx.lineTo(fx + (i - 3) * 2, ty);
          ctx.stroke();
        }
        // Table candles
        for (const cx of [tx + 25, tx + 225]) {
          ctx.fillStyle = '#f0e8d8';
          ctx.fillRect(cx - 2, ty - 28, 4, 28);
          const fl = Math.sin(time * 7 + cx) * 1;
          const fg = ctx.createRadialGradient(cx + fl * 0.3, ty - 32, 0, cx, ty - 32, 22);
          fg.addColorStop(0, 'rgba(255,200,100,0.25)');
          fg.addColorStop(1, 'rgba(255,200,100,0)');
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.arc(cx + fl * 0.3, ty - 32, 22, 0, TAU);
          ctx.fill();
        }
      },
    },
    // Main: the full-length mirror (key interactive element)
    {
      depth: 0.85,
      draw(ctx, _w, h, ox, oy, time) {
        const mirrorX = 1100 - ox;
        const mirrorY = h * 0.22 - oy;
        const mw = 100, mh = 230;
        // Gold frame
        ctx.strokeStyle = '#b89a50';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.rect(mirrorX - 10, mirrorY - 10, mw + 20, mh + 20);
        ctx.stroke();
        // Frame ornament top
        ctx.fillStyle = 'rgba(180,150,70,0.2)';
        ctx.beginPath();
        ctx.ellipse(mirrorX + mw / 2, mirrorY - 15, 25, 10, 0, 0, TAU);
        ctx.fill();
        // Mirror surface
        const mg = ctx.createLinearGradient(mirrorX, mirrorY, mirrorX + mw, mirrorY + mh);
        mg.addColorStop(0, 'rgba(160,180,200,0.18)');
        mg.addColorStop(0.5, 'rgba(180,200,220,0.22)');
        mg.addColorStop(1, 'rgba(150,170,190,0.15)');
        ctx.fillStyle = mg;
        ctx.fillRect(mirrorX, mirrorY, mw, mh);
        // Shimmer
        const shimmer = 0.05 + 0.03 * Math.sin(time * 1.2);
        ctx.fillStyle = `rgba(200,220,255,${shimmer})`;
        ctx.fillRect(mirrorX + 5, mirrorY + 5, mw - 10, mh - 10);
      },
    },
    // Foreground: floor + doorframe
    {
      depth: 1.3,
      draw(ctx, w, h, ox, oy) {
        ctx.fillStyle = '#1e1610';
        ctx.fillRect(0, h * 0.78 - oy, w, h * 0.22);
        // Carpet
        ctx.fillStyle = 'rgba(80,30,35,0.12)';
        ctx.fillRect(100 - ox, h * 0.78 - oy, 400, h * 0.22);
      },
    },
  ],
};

// ── Spiral Stairs ──
export const spiralStairsScene: ParallaxScene = {
  layers: [
    // Far: deep stone void
    {
      depth: 0.1,
      draw(ctx, w, h) {
        ctx.fillStyle = '#060504';
        ctx.fillRect(0, 0, w, h);
      },
    },
    // Mid: stone walls
    {
      depth: 0.4,
      draw(ctx, _w, _h, ox, oy) {
        for (let row = 0; row < 26; row++) {
          for (let col = 0; col < 16; col++) {
            const bx = col * 72 + (row % 2) * 36 - ox;
            const by = row * 24 - oy;
            const shade = 22 + Math.sin(row * 3.7 + col * 2.1) * 6;
            ctx.fillStyle = `rgba(${shade + 8},${shade + 3},${shade},0.65)`;
            ctx.fillRect(bx, by, 69, 21);
          }
        }
      },
    },
    // Main: steps + candles
    {
      depth: 0.8,
      draw(ctx, _w, h, ox, oy, time) {
        // Spiral steps receding
        for (let i = 0; i < 14; i++) {
          const sx = 300 + i * 28 - ox;
          const sy = 120 + i * 32 - oy;
          const sw = 320 - i * 18;
          const shade = 38 - i * 2;
          ctx.fillStyle = `rgba(${shade + 8},${shade + 3},${shade},0.85)`;
          ctx.fillRect(sx, sy, sw, 12);
          ctx.fillStyle = `rgba(${shade + 25},${shade + 20},${shade + 15},0.25)`;
          ctx.fillRect(sx, sy, sw, 2);
        }
        // Candles along wall
        for (let i = 0; i < 7; i++) {
          const cx = 180 + i * 115 - ox;
          const cy = 110 + i * 28 - oy;
          const lit = Math.min(1, Math.max(0, time * 0.5 - i * 0.25));
          if (lit <= 0) continue;
          ctx.fillStyle = '#f0e8d8';
          ctx.fillRect(cx - 2, cy, 4, 14);
          const fl = Math.sin(time * 7 + i * 2) * 0.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 5 + fl * 0.2);
          ctx.bezierCurveTo(cx + 2.5, cy - 2, cx + 2.5, cy, cx, cy + 1);
          ctx.bezierCurveTo(cx - 2.5, cy, cx - 2.5, cy - 2, cx, cy - 5 + fl * 0.2);
          ctx.fillStyle = `rgba(255,190,70,${lit})`;
          ctx.fill();
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
          g.addColorStop(0, `rgba(255,170,60,${0.1 * lit})`);
          g.addColorStop(1, 'rgba(255,170,60,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, 35, 0, TAU);
          ctx.fill();
        }
        // Dripping water
        for (let i = 0; i < 3; i++) {
          const dx = 280 + i * 220 - ox;
          const dy = ((time * 55 + i * 200) % h);
          ctx.fillStyle = `rgba(130,160,190,${0.25 - dy / h * 0.2})`;
          ctx.beginPath();
          ctx.ellipse(dx, dy, 1.2, 2.5, 0, 0, TAU);
          ctx.fill();
        }
      },
    },
    // Foreground: iron railing
    {
      depth: 1.4,
      draw(ctx, _w, h, ox) {
        ctx.strokeStyle = 'rgba(70,60,45,0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(200 - ox, h);
        ctx.bezierCurveTo(250 - ox, h * 0.5, 400 - ox, h * 0.3, 600 - ox, 0);
        ctx.stroke();
        // Railing verticals
        for (let i = 0; i < 8; i++) {
          const rx = 220 + i * 50 - ox;
          const ry = h - i * 70;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx, ry - 40);
          ctx.stroke();
        }
      },
    },
  ],
};

// ── Underground Tunnel ──
export const tunnelScene: ParallaxScene = {
  layers: [
    // Far: deep void + arch silhouette
    {
      depth: 0.1,
      draw(ctx, w, h, ox) {
        ctx.fillStyle = '#050403';
        ctx.fillRect(0, 0, w, h);
        // Distant arched opening
        ctx.fillStyle = 'rgba(15,12,10,0.5)';
        ctx.beginPath();
        ctx.arc(w * 0.5 - ox * 0.2, h * 0.4, 120, Math.PI, TAU);
        ctx.fillRect(w * 0.5 - 120 - ox * 0.2, h * 0.4, 240, h * 0.6);
        ctx.fill();
      },
    },
    // Mid: arched ceiling + iron gates
    {
      depth: 0.45,
      draw(ctx, _w, h, ox, oy) {
        // Arched ceiling
        ctx.fillStyle = '#0c0a08';
        ctx.beginPath();
        ctx.moveTo(-50 - ox, h * 0.6);
        for (let x = 0; x < 2600; x += 6) {
          const archH = 75 + Math.sin(x * 0.004) * 25;
          ctx.lineTo(x - ox, archH - oy);
        }
        ctx.lineTo(2600 - ox, 0);
        ctx.lineTo(-50 - ox, 0);
        ctx.fill();
        // Iron gate arches
        for (let i = 0; i < 5; i++) {
          const gx = 280 + i * 480 - ox;
          ctx.strokeStyle = 'rgba(70,60,45,0.35)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(gx, h * 0.75 - oy);
          ctx.lineTo(gx, 115 - oy);
          ctx.arc(gx + 38, 115 - oy, 38, Math.PI, 0);
          ctx.lineTo(gx + 76, h * 0.75 - oy);
          ctx.stroke();
          for (let b = 0; b < 3; b++) {
            ctx.beginPath();
            ctx.moveTo(gx + 18 + b * 19, 125 - oy);
            ctx.lineTo(gx + 18 + b * 19, h * 0.75 - oy);
            ctx.stroke();
          }
        }
      },
    },
    // Main: candles + score graffiti + wet floor
    {
      depth: 0.8,
      draw(ctx, w, h, ox, oy, time) {
        // Wet stone floor
        ctx.fillStyle = '#100e0a';
        ctx.fillRect(0, h * 0.75 - oy, w, h * 0.25);
        // Wet reflections
        for (let i = 0; i < 20; i++) {
          const rx = i * 125 - ox + Math.sin(time * 0.3 + i) * 4;
          ctx.fillStyle = 'rgba(90,105,120,0.035)';
          ctx.fillRect(rx, h * 0.78 - oy, 55, 2);
        }
        // Progressive candles
        for (let i = 0; i < 25; i++) {
          const cx = 90 + i * 100 - ox;
          const cy = 95 + Math.sin(i * 0.7) * 25 - oy;
          if (cx < -30 || cx > w + 30) continue;
          ctx.fillStyle = '#ede5d0';
          ctx.fillRect(cx - 1.5, cy, 3, 11);
          const fl = Math.sin(time * 7 + i * 1.7) * 0.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 4 + fl * 0.2);
          ctx.bezierCurveTo(cx + 2, cy - 1, cx + 2, cy, cx, cy + 1);
          ctx.bezierCurveTo(cx - 2, cy, cx - 2, cy - 1, cx, cy - 4 + fl * 0.2);
          ctx.fillStyle = 'rgba(255,185,65,0.8)';
          ctx.fill();
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
          g.addColorStop(0, 'rgba(255,165,55,0.09)');
          g.addColorStop(1, 'rgba(255,165,55,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, 35, 0, TAU);
          ctx.fill();
        }
        // Score graffiti
        const scoreX = 1200 - ox;
        if (scoreX > -80 && scoreX < w + 80) {
          ctx.strokeStyle = 'rgba(190,170,130,0.18)';
          ctx.lineWidth = 1;
          for (let l = 0; l < 5; l++) {
            ctx.beginPath();
            ctx.moveTo(scoreX, 265 + l * 8 - oy);
            ctx.lineTo(scoreX + 65, 265 + l * 8 - oy);
            ctx.stroke();
          }
          const notes: ReadonlyArray<readonly [number, number]> = [[12, 269], [28, 277], [42, 273], [56, 285]];
          for (const [nx, ny] of notes) {
            ctx.fillStyle = 'rgba(190,170,130,0.2)';
            ctx.beginPath();
            ctx.ellipse(scoreX + nx, ny - oy, 3.5, 2.5, -0.2, 0, TAU);
            ctx.fill();
          }
        }
      },
    },
    // Foreground: dripping water + edge shadow
    {
      depth: 1.3,
      draw(ctx, w, h, ox, _oy, time) {
        for (let i = 0; i < 5; i++) {
          const dx = 190 + i * 480 - ox;
          const dy = ((time * 38 + i * 280) % (h * 0.7));
          ctx.fillStyle = `rgba(110,140,170,${0.22 - dy / h * 0.18})`;
          ctx.beginPath();
          ctx.ellipse(dx, dy + 75, 1, 2.5, 0, 0, TAU);
          ctx.fill();
        }
        // Edge vignette
        const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.6);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);
      },
    },
  ],
};

// ── Underground Lake ──
export const lakeScene: ParallaxScene = {
  layers: [
    // Far: cave ceiling + stalactites
    {
      depth: 0.1,
      draw(ctx, w, h, ox) {
        ctx.fillStyle = '#06050a';
        ctx.fillRect(0, 0, w, h);
        // Stalactites
        for (let i = 0; i < 18; i++) {
          const sx = i * 180 + Math.sin(i * 4.1) * 45 - ox;
          const sl = 25 + Math.sin(i * 2.7) * 18;
          ctx.fillStyle = 'rgba(28,25,22,0.75)';
          ctx.beginPath();
          ctx.moveTo(sx - 7, 0);
          ctx.lineTo(sx, sl);
          ctx.lineTo(sx + 7, 0);
          ctx.fill();
        }
      },
    },
    // Mid-far: fog + distant candle glow
    {
      depth: 0.3,
      draw(ctx, w, h, _ox, oy, time) {
        // Fog bands
        for (let i = 0; i < 10; i++) {
          const fx = (i * 280 + time * 6) % (w + 200) - 100;
          const fy = h * 0.48 + Math.sin(time * 0.2 + i) * 12 - oy;
          const r = 55 + Math.sin(i * 1.7) * 18;
          const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, r);
          fg.addColorStop(0, 'rgba(170,180,200,0.04)');
          fg.addColorStop(1, 'rgba(170,180,200,0)');
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.arc(fx, fy, r, 0, TAU);
          ctx.fill();
        }
      },
    },
    // Main: water surface + candles rising from water
    {
      depth: 0.7,
      draw(ctx, w, h, ox, oy, time) {
        const waterY = h * 0.53 - oy;
        // Water body
        const wg = ctx.createLinearGradient(0, waterY, 0, h);
        wg.addColorStop(0, 'rgba(18,22,38,0.75)');
        wg.addColorStop(1, 'rgba(8,10,18,0.9)');
        ctx.fillStyle = wg;
        ctx.fillRect(0, waterY, w, h - waterY);
        // Ripple lines
        ctx.strokeStyle = 'rgba(90,110,150,0.06)';
        ctx.lineWidth = 1;
        for (let r = 0; r < 6; r++) {
          ctx.beginPath();
          for (let x = 0; x < w; x += 3) {
            const wy = waterY + 3 + Math.sin((x + ox) * 0.018 + time * 0.7 + r * 0.5) * (2 + r * 0.4);
            if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
          }
          ctx.stroke();
        }
        // Candles rising from water (40 candles)
        for (let i = 0; i < 40; i++) {
          const cx = 180 + i * 68 + Math.sin(i * 3.1) * 28 - ox;
          if (cx < -25 || cx > w + 25) continue;
          const baseY = waterY - 4 + Math.sin(time * 0.5 + i) * 1.5;
          const ch = 18 + Math.sin(i * 2.3) * 7;
          // Body
          ctx.fillStyle = '#e5d8c0';
          ctx.fillRect(cx - 1.5, baseY - ch, 3, ch);
          // Flame
          const fl = Math.sin(time * 6 + i * 1.3) * 1;
          ctx.beginPath();
          ctx.moveTo(cx, baseY - ch - 6 + fl * 0.3);
          ctx.bezierCurveTo(cx + 2.5, baseY - ch - 2, cx + 2.5, baseY - ch, cx, baseY - ch + 1);
          ctx.bezierCurveTo(cx - 2.5, baseY - ch, cx - 2.5, baseY - ch - 2, cx, baseY - ch - 6 + fl * 0.3);
          ctx.fillStyle = '#ffcc44';
          ctx.fill();
          // Glow
          const g = ctx.createRadialGradient(cx, baseY - ch, 0, cx, baseY - ch, 30);
          g.addColorStop(0, 'rgba(255,175,65,0.1)');
          g.addColorStop(1, 'rgba(255,175,65,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, baseY - ch, 30, 0, TAU);
          ctx.fill();
          // Reflection
          ctx.globalAlpha = 0.12;
          ctx.fillStyle = '#e5d8c0';
          ctx.fillRect(cx - 1.5, baseY + 4, 3, ch * 0.5);
          ctx.globalAlpha = 1;
        }
      },
    },
    // Foreground: boat silhouettes + near fog
    {
      depth: 1.2,
      draw(ctx, w, h, ox, oy, time) {
        const waterY = h * 0.53 - oy;
        // Boat
        const bx = w * 0.4 - ox * 0.3;
        const by = waterY - 6 + Math.sin(time * 0.8) * 1.5;
        ctx.fillStyle = '#28201a';
        ctx.beginPath();
        ctx.moveTo(bx - 32, by);
        ctx.bezierCurveTo(bx - 36, by + 10, bx + 36, by + 10, bx + 32, by);
        ctx.closePath();
        ctx.fill();
        // Ghost figures on boat (deterministic)
        for (const [figX, figColor, count] of [
          [bx - 12, [55, 53, 50], 20] as const,
          [bx + 12, [190, 160, 85], 18] as const,
        ]) {
          const [cr, cg, cb] = figColor;
          for (let i = 0; i < count; i++) {
            const s = i * 7.3 + figX;
            const px = figX + (srand(s) - 0.5) * 12;
            const py = by - 10 - srand(s + 1) * 28 + Math.sin(time * 0.8 + i) * 0.5;
            ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.2 + srand(s + 2) * 0.2})`;
            ctx.beginPath();
            ctx.arc(px, py, 0.8 + srand(s + 3) * 0.8, 0, TAU);
            ctx.fill();
          }
        }
        // Near fog wisps
        for (let i = 0; i < 5; i++) {
          const fx = (i * 220 + time * 10) % (w + 100) - 50;
          const fy = waterY - 20 + Math.sin(time * 0.15 + i * 2) * 8;
          const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 50);
          fg.addColorStop(0, 'rgba(160,170,190,0.035)');
          fg.addColorStop(1, 'rgba(160,170,190,0)');
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.arc(fx, fy, 50, 0, TAU);
          ctx.fill();
        }
      },
    },
  ],
};
