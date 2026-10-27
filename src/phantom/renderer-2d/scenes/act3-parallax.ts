/** Act 3 — Music of the Night: Phantom's Lair parallax */
import { ParallaxScene } from '../parallax';
import { TAU } from '../draw-utils';

export const lairScene: ParallaxScene = {
  layers: [
    // Far: rocky cave walls
    {
      depth: 0.12,
      draw(ctx, w, h, ox, oy) {
        ctx.fillStyle = '#0e0a06';
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 35; i++) {
          const wx = i * 85 - ox;
          const wy = Math.sin(i * 1.3) * 35 - oy;
          ctx.fillStyle = 'rgba(25,22,18,0.45)';
          ctx.beginPath();
          ctx.ellipse(wx, wy + 25, 48, 32, 0, 0, TAU);
          ctx.fill();
        }
      },
    },
    // Mid: candles (wave-lit) + portraits
    {
      depth: 0.45,
      draw(ctx, w, h, ox, oy, time) {
        // Candles radiating from organ center (x=1000 in scene space)
        const organCenter = 1000;
        for (let i = 0; i < 45; i++) {
          const angle = i * 0.45;
          const radius = 90 + i * 14 + Math.sin(i * 2.1) * 25;
          const cx = organCenter + Math.cos(angle) * radius - ox;
          const cy = h * 0.6 + Math.sin(angle) * radius * 0.28 - 35 - oy;
          if (cx < -20 || cx > w + 20) continue;
          ctx.fillStyle = '#e5d8c0';
          ctx.fillRect(cx - 1.2, cy, 2.4, 9);
          const fl = Math.sin(time * 6.5 + i * 1.3) * 0.7;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 4 + fl * 0.2);
          ctx.bezierCurveTo(cx + 2, cy - 1, cx + 2, cy, cx, cy + 1);
          ctx.bezierCurveTo(cx - 2, cy, cx - 2, cy - 1, cx, cy - 4 + fl * 0.2);
          ctx.fillStyle = 'rgba(255,185,65,0.75)';
          ctx.fill();
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
          g.addColorStop(0, 'rgba(255,165,55,0.07)');
          g.addColorStop(1, 'rgba(255,165,55,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, 22, 0, TAU);
          ctx.fill();
        }
        // Portrait on wall
        const px = 480 - ox;
        ctx.strokeStyle = 'rgba(140,120,70,0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(px, h * 0.22 - oy, 75, 95);
        ctx.stroke();
        ctx.fillStyle = 'rgba(197,165,90,0.04)';
        ctx.fillRect(px + 2, h * 0.22 + 2 - oy, 71, 91);
        // Christine silhouette in portrait
        ctx.fillStyle = 'rgba(197,165,90,0.08)';
        ctx.beginPath();
        ctx.ellipse(px + 38, h * 0.22 + 32 - oy, 14, 17, 0, 0, TAU);
        ctx.fill();
      },
    },
    // Main: organ + keyboard + music stand
    {
      depth: 0.8,
      draw(ctx, w, h, ox, oy, time) {
        const orgX = 1000 - ox;
        // Organ pipes
        const pipes = [115, 145, 175, 155, 135, 165, 125, 150, 140];
        for (let i = 0; i < pipes.length; i++) {
          const px = orgX + i * 21 - 85;
          const ph = pipes[i];
          ctx.fillStyle = 'rgba(75,65,50,0.75)';
          ctx.fillRect(px, h * 0.48 - ph - oy, 17, ph);
          ctx.fillStyle = 'rgba(95,80,60,0.5)';
          ctx.fillRect(px - 2, h * 0.48 - ph - 5 - oy, 21, 7);
        }
        // Organ body
        ctx.fillStyle = '#28201a';
        ctx.fillRect(orgX - 95, h * 0.48 - oy, 190, 55);
        // Keyboard (white keys)
        for (let i = 0; i < 14; i++) {
          const kx = orgX - 85 + i * 12;
          const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
          if (!isBlack) {
            ctx.fillStyle = '#e5ddd0';
            ctx.fillRect(kx, h * 0.48 + 5 - oy, 10, 22);
          }
        }
        for (let i = 0; i < 14; i++) {
          const kx = orgX - 85 + i * 12;
          const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
          if (isBlack) {
            ctx.fillStyle = '#181614';
            ctx.fillRect(kx, h * 0.48 + 5 - oy, 8, 14);
          }
        }
        // Active key glow
        const activeKey = Math.floor((time * 3) % 14);
        const kx = orgX - 85 + activeKey * 12;
        const kg = ctx.createRadialGradient(kx + 5, h * 0.48 + 14 - oy, 0, kx + 5, h * 0.48 + 14 - oy, 14);
        kg.addColorStop(0, 'rgba(255,200,100,0.25)');
        kg.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.fillStyle = kg;
        ctx.beginPath();
        ctx.arc(kx + 5, h * 0.48 + 14 - oy, 14, 0, TAU);
        ctx.fill();
        // Music stand with manuscript
        ctx.fillStyle = 'rgba(60,50,35,0.6)';
        ctx.fillRect(orgX + 100 - 5, h * 0.38 - oy, 55, 40);
        ctx.fillStyle = 'rgba(220,210,190,0.12)';
        ctx.fillRect(orgX + 100, h * 0.38 + 3 - oy, 45, 34);
        // Wax mannequin in corner
        const mx = 1950 - ox;
        ctx.fillStyle = 'rgba(195,188,178,0.1)';
        ctx.beginPath();
        ctx.moveTo(mx, h * 0.38 - oy);
        ctx.lineTo(mx - 22, h * 0.78 - oy);
        ctx.lineTo(mx + 22, h * 0.78 - oy);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mx, h * 0.33 - oy, 10, 0, TAU);
        ctx.fill();
      },
    },
    // Foreground: cave floor + mask glow
    {
      depth: 1.3,
      draw(ctx, w, h, ox, oy) {
        ctx.fillStyle = '#141008';
        ctx.fillRect(0, h * 0.78 - oy, w, h * 0.22);
        // Fallen mask (always visible as a hint)
        const mkx = 1300 - ox;
        ctx.fillStyle = '#f0eae0';
        ctx.beginPath();
        ctx.ellipse(mkx, h * 0.82 - oy, 13, 8, 0.15, 0, TAU);
        ctx.fill();
        const mg = ctx.createRadialGradient(mkx, h * 0.82 - oy, 0, mkx, h * 0.82 - oy, 25);
        mg.addColorStop(0, 'rgba(255,240,200,0.06)');
        mg.addColorStop(1, 'rgba(255,240,200,0)');
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(mkx, h * 0.82 - oy, 25, 0, TAU);
        ctx.fill();
      },
    },
  ],
};
