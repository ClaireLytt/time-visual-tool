/** Act 5 — The Point of No Return + Finale parallax scenes */
import { ParallaxScene } from '../parallax';
import { TAU, srand } from '../draw-utils';

// ── Theater Performance (full house) ──
export const performanceScene: ParallaxScene = {
  layers: [
    // Far: ceiling + chandelier
    {
      depth: 0.15,
      draw(ctx, w, h, ox, oy, time) {
        ctx.fillStyle = '#0c0808';
        ctx.fillRect(0, 0, w, h * 0.3);
        // Chandelier (prominent, center)
        const cx = w * 0.5 - ox;
        const cy = 30 - oy;
        ctx.strokeStyle = 'rgba(170,150,90,0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.fillStyle = '#a08840';
        ctx.beginPath();
        ctx.moveTo(cx - 40, cy + 5);
        ctx.lineTo(cx + 40, cy + 5);
        ctx.lineTo(cx + 25, cy + 32);
        ctx.lineTo(cx - 25, cy + 32);
        ctx.fill();
        for (let i = 0; i < 11; i++) {
          const px = cx - 24 + i * 5;
          const py = cy + 30 + Math.sin(i * 1.5 + time * 1.5) * 2;
          ctx.fillStyle = 'rgba(225,220,205,0.3)';
          ctx.beginPath();
          ctx.ellipse(px, py, 1.5, 4.5, 0, 0, TAU);
          ctx.fill();
        }
        const g = ctx.createRadialGradient(cx, cy + 15, 0, cx, cy + 15, 90);
        g.addColorStop(0, 'rgba(255,210,130,0.1)');
        g.addColorStop(1, 'rgba(255,210,130,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy + 15, 90, 0, TAU);
        ctx.fill();
      },
    },
    // Mid: balconies
    {
      depth: 0.35,
      draw(ctx, w, h, ox, oy) {
        for (let tier = 0; tier < 3; tier++) {
          for (const side of [-1, 1]) {
            const bx = side === -1 ? -15 - ox : w - 105 - ox;
            const by = 95 + tier * 60 - oy;
            ctx.fillStyle = `rgba(48,22,28,${0.65 - tier * 0.08})`;
            ctx.fillRect(bx, by, 125, 50);
            ctx.strokeStyle = 'rgba(155,135,75,0.2)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + 125, by);
            ctx.stroke();
          }
        }
      },
    },
    // Main: stage + audience
    {
      depth: 0.7,
      draw(ctx, w, h, ox, oy, time) {
        // Stage
        ctx.fillStyle = '#2a1e14';
        const stageY = h * 0.42 - oy;
        ctx.fillRect(180 - ox, stageY, 650, 12);
        // Stage floor
        const sf = ctx.createLinearGradient(0, stageY - 55, 0, stageY);
        sf.addColorStop(0, '#2e2216');
        sf.addColorStop(1, '#241a10');
        ctx.fillStyle = sf;
        ctx.fillRect(180 - ox, stageY - 55, 650, 55);
        // Footlights
        for (let i = 0; i < 7; i++) {
          const fx = 230 + i * 85 - ox;
          const fg = ctx.createRadialGradient(fx, stageY, 0, fx, stageY, 18);
          fg.addColorStop(0, `rgba(255,200,100,${0.22 + 0.06 * Math.sin(time * 3 + i)})`);
          fg.addColorStop(1, 'rgba(255,200,100,0)');
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.arc(fx, stageY, 18, 0, TAU);
          ctx.fill();
        }
        // Ghost audience (packed house)
        const seatStart = stageY + 25;
        for (let row = 0; row < 7; row++) {
          for (let col = 0; col < 18; col++) {
            const sx = 55 + col * 55 - ox * 0.3;
            const sy = seatStart + row * 30 - oy * 0.2;
            if (sx < -30 || sx > w + 30) continue;
            ctx.fillStyle = `rgba(55,18,22,${0.5 - row * 0.05})`;
            ctx.beginPath();
            ctx.ellipse(sx, sy, 14, 8, 0, Math.PI, TAU);
            ctx.fill();
            // Ghost figure
            const a = 0.06 + srand(row * 18 + col) * 0.04;
            ctx.fillStyle = `rgba(195,190,180,${a})`;
            ctx.beginPath();
            ctx.ellipse(sx, sy - 7, 7, 10, 0, 0, TAU);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(sx, sy - 19, 4.5, 0, TAU);
            ctx.fill();
          }
        }
      },
    },
    // Foreground: curtains
    {
      depth: 1.4,
      draw(ctx, w, h, ox, _oy, time) {
        for (let i = 0; i < 3; i++) {
          for (const side of [-1, 1]) {
            const x = side === -1 ? i * 15 - ox : w - 45 + i * 15 - ox;
            const grad = ctx.createLinearGradient(x, 0, x + 18, 0);
            grad.addColorStop(0, `rgba(85,28,38,${0.65 - i * 0.1})`);
            grad.addColorStop(0.5, `rgba(105,35,45,${0.55 - i * 0.08})`);
            grad.addColorStop(1, `rgba(65,20,28,${0.65 - i * 0.1})`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.bezierCurveTo(x + 6, 35 + Math.sin(time * 0.3 + i) * 2, x + 12, 28, x + 18, 0);
            ctx.lineTo(x + 18, h);
            ctx.lineTo(x, h);
            ctx.fill();
          }
        }
      },
    },
  ],
};

// ── Final Lair (confrontation) ──
export const finalLairScene: ParallaxScene = {
  layers: [
    // Far: deep cave
    { depth: 0.1, draw(ctx, w, h) { ctx.fillStyle = '#060504'; ctx.fillRect(0, 0, w, h); } },
    // Mid: cave walls + sparse candles
    {
      depth: 0.4,
      draw(ctx, w, h, ox, oy, time) {
        for (let i = 0; i < 30; i++) {
          ctx.fillStyle = 'rgba(20,18,14,0.4)';
          ctx.beginPath();
          ctx.ellipse(i * 80 - ox, Math.sin(i * 1.5) * 30 + 20 - oy, 42, 28, 0, 0, TAU);
          ctx.fill();
        }
        // Sparse candles
        for (let i = 0; i < 12; i++) {
          const cx = 90 + i * 155 - ox;
          const cy = h * 0.5 + Math.sin(i * 2) * 18 - oy;
          if (cx < -20 || cx > w + 20) continue;
          ctx.fillStyle = '#e5d8c0';
          ctx.fillRect(cx - 1.2, cy, 2.4, 9);
          const fl = Math.sin(time * 6 + i) * 0.7;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 3.5 + fl * 0.2);
          ctx.bezierCurveTo(cx + 2, cy - 1, cx + 2, cy, cx, cy + 1);
          ctx.bezierCurveTo(cx - 2, cy, cx - 2, cy - 1, cx, cy - 3.5 + fl * 0.2);
          ctx.fillStyle = 'rgba(255,185,65,0.6)';
          ctx.fill();
        }
      },
    },
    // Main: water + music box
    {
      depth: 0.75,
      draw(ctx, w, h, ox, oy, time) {
        const waterY = h * 0.68 - oy;
        ctx.fillStyle = 'rgba(12,15,28,0.75)';
        ctx.fillRect(0, waterY, w, h - waterY);
        ctx.strokeStyle = 'rgba(75,85,115,0.05)';
        ctx.lineWidth = 1;
        for (let r = 0; r < 4; r++) {
          ctx.beginPath();
          for (let x = 0; x < w; x += 3) {
            const wy = waterY + 4 + Math.sin((x + ox) * 0.015 + time * 0.6 + r * 0.6) * (1.5 + r * 0.4);
            if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
          }
          ctx.stroke();
        }
        // Music box on ground
        const mbx = 800 - ox;
        ctx.fillStyle = '#7a6545';
        ctx.fillRect(mbx, h * 0.66 - oy, 14, 9);
        ctx.fillStyle = '#9a8058';
        ctx.fillRect(mbx + 1, h * 0.66 + 1 - oy, 12, 3);
      },
    },
    // Foreground: edge shadow
    {
      depth: 1.2,
      draw(ctx, w, h) {
        const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.22, w / 2, h / 2, w * 0.55);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);
      },
    },
  ],
};

// ── Epilogue (single spotlight + mask) ──
export const epilogueScene: ParallaxScene = {
  layers: [
    // Single layer: blackness + spotlight + mask + dust
    {
      depth: 0.5,
      draw(ctx, w, h, _ox, _oy, time) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
        // Spotlight cone
        const spotX = w / 2, spotY = h * 0.68;
        ctx.fillStyle = 'rgba(255,240,200,0.015)';
        ctx.beginPath();
        ctx.moveTo(spotX - 4, 0);
        ctx.lineTo(spotX - 75, spotY);
        ctx.lineTo(spotX + 75, spotY);
        ctx.lineTo(spotX + 4, 0);
        ctx.fill();
        // Spotlight pool
        const sg = ctx.createRadialGradient(spotX, spotY - 15, 0, spotX, spotY, 100);
        sg.addColorStop(0, 'rgba(255,240,200,0.07)');
        sg.addColorStop(0.5, 'rgba(255,240,200,0.03)');
        sg.addColorStop(1, 'rgba(255,240,200,0)');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(spotX, spotY - 15, 100, 0, TAU);
        ctx.fill();
        // Mask
        ctx.save();
        ctx.translate(spotX, spotY);
        ctx.rotate(Math.sin(time * 0.08) * 0.12);
        ctx.fillStyle = '#f2ede5';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 12, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(5, -2, 4.5, 3, 0.1, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(195,185,170,0.35)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 12, 0, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath();
        ctx.ellipse(-5, -5, 5, 2.5, -0.3, 0, TAU);
        ctx.fill();
        ctx.restore();
        // Golden dust motes
        for (let i = 0; i < 14; i++) {
          const angle = (i / 14) * TAU + time * 0.12;
          const r = 45 + Math.sin(time * 0.35 + i * 1.3) * 18;
          const mx = spotX + Math.cos(angle) * r;
          const my = spotY - 18 + Math.sin(angle) * r * 0.35;
          ctx.fillStyle = `rgba(197,165,90,${0.08 + 0.04 * Math.sin(time * 0.7 + i * 2)})`;
          ctx.beginPath();
          ctx.arc(mx, my, 0.8, 0, TAU);
          ctx.fill();
        }
      },
    },
  ],
};
