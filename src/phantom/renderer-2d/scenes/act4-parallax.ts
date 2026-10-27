/** Act 4 — All I Ask of You: Rooftop parallax */
import { ParallaxScene } from '../parallax';
import { TAU, srand } from '../draw-utils';

export const rooftopScene: ParallaxScene = {
  layers: [
    // Far: night sky + stars + moon
    {
      depth: 0.05,
      draw(ctx, w, h) {
        const bg = ctx.createLinearGradient(0, 0, 0, h * 0.6);
        bg.addColorStop(0, '#0a0e1e');
        bg.addColorStop(1, '#161a30');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        // Stars
        for (let i = 0; i < 70; i++) {
          const sx = srand(i * 3.7) * w;
          const sy = srand(i * 5.3) * h * 0.4;
          ctx.fillStyle = `rgba(255,255,240,${0.25 + 0.35 * srand(i * 2.1)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 0.6 + srand(i * 1.1) * 0.7, 0, TAU);
          ctx.fill();
        }
        // Moon
        const moonX = w * 0.72, moonY = h * 0.1;
        const mg = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 75);
        mg.addColorStop(0, 'rgba(220,228,250,0.12)');
        mg.addColorStop(1, 'rgba(220,228,250,0)');
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 75, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#e5e0d5';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 16, 0, TAU);
        ctx.fill();
      },
    },
    // Mid-far: Paris skyline
    {
      depth: 0.2,
      draw(ctx, w, h, ox) {
        ctx.fillStyle = '#0c0e16';
        const bldgs: ReadonlyArray<readonly [number, number, number]> = [
          [40, 0.52, 38], [110, 0.45, 32], [190, 0.5, 48],
          [290, 0.42, 28], [370, 0.48, 42], [470, 0.4, 24],
          [540, 0.51, 52], [640, 0.44, 35], [740, 0.42, 30],
          [830, 0.47, 40], [920, 0.43, 33],
        ];
        for (const [bx, hf, bw] of bldgs) {
          const screenX = bx - ox;
          const bh = h * hf;
          ctx.fillRect(screenX, bh, bw, h - bh);
          // Lit windows
          for (let wy = 0; wy < 5; wy++) {
            for (let wx = 0; wx < 3; wx++) {
              if (srand(bx + wy * 7 + wx * 13) > 0.5) {
                ctx.fillStyle = `rgba(255,195,95,${0.1 + srand(bx + wy + wx) * 0.08})`;
                ctx.fillRect(screenX + 4 + wx * (bw - 8) / 3, bh + 7 + wy * 14, 3, 4);
                ctx.fillStyle = '#0c0e16';
              }
            }
          }
        }
      },
    },
    // Main: rooftop surface + railing + angel
    {
      depth: 0.7,
      draw(ctx, w, h, ox, oy) {
        // Rooftop floor
        ctx.fillStyle = '#181a1e';
        ctx.fillRect(0, h * 0.72 - oy, w, h * 0.28);
        // Lead/zinc roof tiles
        ctx.strokeStyle = 'rgba(60,65,70,0.08)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 30; i++) {
          const lx = i * 40 - ox * 0.3;
          ctx.beginPath();
          ctx.moveTo(lx, h * 0.72 - oy);
          ctx.lineTo(lx, h);
          ctx.stroke();
        }
        // Stone balustrade
        ctx.fillStyle = '#282a2e';
        ctx.fillRect(0 - ox * 0.1, h * 0.7 - oy, w + 100, 7);
        for (let i = 0; i < 22; i++) {
          const bx = 45 + i * 95 - ox * 0.1;
          ctx.fillRect(bx, h * 0.65 - oy, 5, h * 0.05 + 7);
        }
        // Angel statue
        const ax = 1800 - ox;
        const ay = h * 0.38 - oy;
        ctx.fillStyle = '#38393e';
        // Body
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 18, h * 0.7 - oy);
        ctx.lineTo(ax + 18, h * 0.7 - oy);
        ctx.closePath();
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(ax, ay - 5, 10, 0, TAU);
        ctx.fill();
        // Wings
        ctx.fillStyle = 'rgba(56,57,62,0.6)';
        ctx.beginPath();
        ctx.moveTo(ax - 4, ay + 8);
        ctx.bezierCurveTo(ax - 45, ay - 10, ax - 50, ay - 18, ax - 28, ay - 28);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(ax + 4, ay + 8);
        ctx.bezierCurveTo(ax + 45, ay - 10, ax + 50, ay - 18, ax + 28, ay - 28);
        ctx.fill();
      },
    },
    // Foreground: falling petals (always, gentle)
    {
      depth: 1.4,
      draw(ctx, w, h, _ox, _oy, time) {
        for (let i = 0; i < 25; i++) {
          const s = i * 7.3;
          const px = (srand(s) * w * 1.4 + time * 12) % (w + 40) - 20;
          const py = (srand(s + 1) * h + time * 20 + i * 35) % (h + 15) - 8;
          const rot = time * 0.4 + srand(s + 2) * TAU;
          ctx.fillStyle = `rgba(235,230,220,${0.18 + srand(s + 3) * 0.12})`;
          ctx.beginPath();
          ctx.ellipse(px, py, 3.5, 1.8, rot, 0, TAU);
          ctx.fill();
        }
      },
    },
  ],
};
