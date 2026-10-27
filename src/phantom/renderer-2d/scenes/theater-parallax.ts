/**
 * Act 1 — Theater Audience parallax scene.
 * 5 layers: ceiling/chandelier → balconies → seats → collectible plane → curtain foreground
 */
import { ParallaxScene } from '../parallax';
import { TAU } from '../draw-utils';

export const theaterAudienceScene: ParallaxScene = {
  layers: [
    // ── Layer 0: Ceiling + chandelier (far, slow) ──
    {
      depth: 0.15,
      draw(ctx, w, h, ox, oy, time) {
        // Dark ornate ceiling
        ctx.fillStyle = '#0c0808';
        ctx.fillRect(0, 0, w, h * 0.35);

        // Ceiling molding pattern
        ctx.strokeStyle = 'rgba(120,100,70,0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 12; i++) {
          const mx = i * 100 - ox * 0.5 + 20;
          ctx.beginPath();
          ctx.arc(mx, 0, 45, 0, Math.PI);
          ctx.stroke();
        }

        // Grand chandelier (the star of the ceiling)
        const chanX = w * 0.5 - ox;
        const chanY = 35 - oy * 0.3;
        // Chain
        ctx.strokeStyle = 'rgba(180,160,100,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(chanX, 0);
        ctx.lineTo(chanX, chanY);
        ctx.stroke();
        // Body
        ctx.fillStyle = '#a08840';
        ctx.beginPath();
        ctx.moveTo(chanX - 35, chanY + 5);
        ctx.lineTo(chanX + 35, chanY + 5);
        ctx.lineTo(chanX + 22, chanY + 30);
        ctx.lineTo(chanX - 22, chanY + 30);
        ctx.fill();
        // Crystal drops
        for (let i = 0; i < 9; i++) {
          const cx = chanX - 20 + i * 5;
          const cy = chanY + 28 + Math.sin(i * 1.5 + time * 1.5) * 2;
          ctx.fillStyle = 'rgba(230,225,210,0.35)';
          ctx.beginPath();
          ctx.ellipse(cx, cy, 1.5, 4.5, 0, 0, TAU);
          ctx.fill();
        }
        // Warm glow
        const glow = ctx.createRadialGradient(chanX, chanY + 15, 0, chanX, chanY + 15, 100);
        glow.addColorStop(0, 'rgba(255,210,130,0.1)');
        glow.addColorStop(1, 'rgba(255,210,130,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(chanX, chanY + 15, 100, 0, TAU);
        ctx.fill();
      },
    },

    // ── Layer 1: Balconies + Box 5 (mid-far) ──
    {
      depth: 0.35,
      draw(ctx, w, h, ox, oy) {
        // Balcony tiers on sides
        for (let tier = 0; tier < 3; tier++) {
          for (const side of [-1, 1]) {
            const bx = side === -1 ? -20 - ox : w - 110 - ox;
            const by = 100 + tier * 65 - oy * 0.5;
            // Balcony front
            ctx.fillStyle = `rgba(50,25,30,${0.7 - tier * 0.1})`;
            ctx.fillRect(bx, by, 130, 55);
            // Gold railing
            ctx.strokeStyle = 'rgba(160,140,80,0.25)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + 130, by);
            ctx.stroke();
            // Ornamental dots along railing
            for (let d = 0; d < 6; d++) {
              ctx.fillStyle = 'rgba(180,155,80,0.15)';
              ctx.beginPath();
              ctx.arc(bx + 15 + d * 20, by - 3, 2, 0, TAU);
              ctx.fill();
            }
          }
        }

        // Box 5 (special — slightly different color)
        const boxX = w - 130 - ox;
        const boxY = 100 - oy * 0.5;
        ctx.fillStyle = 'rgba(35,15,18,0.8)';
        ctx.fillRect(boxX, boxY, 130, 55);
        ctx.strokeStyle = 'rgba(180,155,80,0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(boxX, boxY);
        ctx.lineTo(boxX + 130, boxY);
        ctx.stroke();
        // "V" label
        ctx.fillStyle = 'rgba(200,180,130,0.25)';
        ctx.font = '16px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('V', boxX + 65, boxY + 35);
      },
    },

    // ── Layer 2: Seats + stage (main layer, 1:1 with camera) ──
    {
      depth: 0.7,
      draw(ctx, w, h, ox, oy, time) {
        // Stage area (top of visible area)
        const stageY = h * 0.35 - oy;
        ctx.fillStyle = '#1e1610';
        ctx.fillRect(-ox, stageY, 2048, 15);

        // Stage floor
        const stageGrad = ctx.createLinearGradient(0, stageY - 60, 0, stageY);
        stageGrad.addColorStop(0, '#2a1e15');
        stageGrad.addColorStop(1, '#221a12');
        ctx.fillStyle = stageGrad;
        ctx.fillRect(-ox, stageY - 60, 2048, 60);

        // Footlights along stage edge
        for (let i = 0; i < 12; i++) {
          const fx = 150 + i * 80 - ox;
          const fy = stageY;
          const flicker = 0.2 + 0.08 * Math.sin(time * 3 + i * 1.1);
          const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 18);
          fg.addColorStop(0, `rgba(255,200,100,${flicker})`);
          fg.addColorStop(1, 'rgba(255,200,100,0)');
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.arc(fx, fy, 18, 0, TAU);
          ctx.fill();
        }

        // Rows of seats
        const seatStartY = stageY + 30;
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 20; col++) {
            const sx = 60 + col * 95 - ox;
            const sy = seatStartY + row * 32 - oy * 0.3;
            if (sx < -40 || sx > w + 40) continue;

            // Seat back
            ctx.fillStyle = `rgba(${70 - row * 3},${18 - row},${22 - row},${0.65 - row * 0.04})`;
            ctx.beginPath();
            ctx.ellipse(sx, sy, 16, 10, 0, Math.PI, TAU);
            ctx.fill();
            // Seat cushion
            ctx.fillStyle = `rgba(${60 - row * 2},${15 - row},${18 - row},${0.55 - row * 0.04})`;
            ctx.fillRect(sx - 14, sy, 28, 8);
          }
        }

        // Aisle carpet runner (center)
        const aisleX = w * 0.5 - ox;
        ctx.fillStyle = 'rgba(80,25,25,0.1)';
        ctx.fillRect(aisleX - 20, seatStartY, 40, 8 * 32);
      },
    },

    // ── Layer 3: Floor + near details (slightly forward) ──
    {
      depth: 1.0,
      draw(ctx, w, h, ox, oy) {
        // Floor at bottom
        const floorY = h * 0.82 - oy;
        const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
        floorGrad.addColorStop(0, '#181210');
        floorGrad.addColorStop(1, '#100c08');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, floorY, w, h - floorY);

        // Floor pattern (tile lines)
        ctx.strokeStyle = 'rgba(80,65,50,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 15; i++) {
          const lx = i * 80 - ox * 0.3;
          ctx.beginPath();
          ctx.moveTo(lx, floorY);
          ctx.lineTo(lx, h);
          ctx.stroke();
        }
      },
    },

    // ── Layer 4: Curtains (foreground, fastest) ──
    {
      depth: 1.4,
      draw(ctx, w, h, ox, oy, time) {
        // Left curtain drapes
        for (let i = 0; i < 4; i++) {
          const cx = i * 16 - 5 - ox;
          const drapeWidth = 20;
          const grad = ctx.createLinearGradient(cx, 0, cx + drapeWidth, 0);
          grad.addColorStop(0, `rgba(90,30,40,${0.7 - i * 0.12})`);
          grad.addColorStop(0.4, `rgba(110,38,48,${0.6 - i * 0.1})`);
          grad.addColorStop(1, `rgba(70,22,30,${0.7 - i * 0.12})`);
          ctx.fillStyle = grad;
          // Draped shape with slight wave
          ctx.beginPath();
          ctx.moveTo(cx, 0);
          ctx.bezierCurveTo(cx + 8, 40 + Math.sin(time * 0.3 + i) * 3, cx + 12, 30, cx + drapeWidth, 0);
          ctx.lineTo(cx + drapeWidth, h);
          ctx.lineTo(cx, h);
          ctx.fill();
        }

        // Right curtain drapes
        for (let i = 0; i < 4; i++) {
          const cx = w - 60 + i * 16 - ox;
          const drapeWidth = 20;
          const grad = ctx.createLinearGradient(cx, 0, cx + drapeWidth, 0);
          grad.addColorStop(0, `rgba(70,22,30,${0.7 - i * 0.12})`);
          grad.addColorStop(0.6, `rgba(110,38,48,${0.6 - i * 0.1})`);
          grad.addColorStop(1, `rgba(90,30,40,${0.7 - i * 0.12})`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(cx, 0);
          ctx.bezierCurveTo(cx + 8, 40 + Math.sin(time * 0.3 + i + 2) * 3, cx + 12, 30, cx + drapeWidth, 0);
          ctx.lineTo(cx + drapeWidth, h);
          ctx.lineTo(cx, h);
          ctx.fill();
        }

        // Gold tassel/trim on curtain edge
        ctx.fillStyle = 'rgba(180,150,70,0.12)';
        ctx.fillRect(60 - ox, 0, 2, h);
        ctx.fillRect(w - 62 - ox, 0, 2, h);
      },
    },
  ],
};

// ── Stage scene (when viewing the stage) ──
export const theaterStageScene: ParallaxScene = {
  layers: [
    // Far: stage backdrop (painted scene)
    {
      depth: 0.1,
      draw(ctx, w, h, ox, oy) {
        // Dark backdrop with faint painted scene
        ctx.fillStyle = '#0a0808';
        ctx.fillRect(0, 0, w, h * 0.6);
        // Painted clouds/scene
        ctx.fillStyle = 'rgba(40,35,50,0.3)';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.ellipse(200 + i * 180 - ox, 120 - oy, 80, 30, 0, 0, TAU);
          ctx.fill();
        }
      },
    },
    // Mid: stage floor + wings
    {
      depth: 0.6,
      draw(ctx, w, h, ox, oy, time) {
        // Stage floor — polished wood
        const floorY = h * 0.55 - oy;
        const woodGrad = ctx.createLinearGradient(0, floorY, 0, h);
        woodGrad.addColorStop(0, '#3a2a1a');
        woodGrad.addColorStop(0.3, '#2e2014');
        woodGrad.addColorStop(1, '#221810');
        ctx.fillStyle = woodGrad;
        ctx.fillRect(0, floorY, w, h - floorY);

        // Wood grain lines
        ctx.strokeStyle = 'rgba(60,45,30,0.15)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 25; i++) {
          const lx = i * 45 - ox * 0.3;
          ctx.beginPath();
          ctx.moveTo(lx, floorY);
          ctx.lineTo(lx, h);
          ctx.stroke();
        }

        // Footlights
        for (let i = 0; i < 10; i++) {
          const fx = 100 + i * 90 - ox;
          const fg = ctx.createRadialGradient(fx, h * 0.96, 0, fx, h * 0.96, 25);
          fg.addColorStop(0, `rgba(255,200,100,${0.25 + 0.06 * Math.sin(time * 3 + i)})`);
          fg.addColorStop(1, 'rgba(255,200,100,0)');
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.arc(fx, h * 0.96, 25, 0, TAU);
          ctx.fill();
        }
      },
    },
    // Main: props and set pieces
    {
      depth: 1.0,
      draw(ctx, w, h, ox) {
        // Stage wings (dark flats on sides)
        for (const side of [-1, 1]) {
          for (let i = 0; i < 3; i++) {
            const wx = side === -1 ? i * 30 - 20 - ox : w - 70 + i * 30 - ox;
            ctx.fillStyle = `rgba(15,12,10,${0.8 - i * 0.15})`;
            ctx.fillRect(wx, 0, 35, h);
          }
        }
      },
    },
    // Foreground: curtain frame
    {
      depth: 1.5,
      draw(ctx, w, h, ox, oy) {
        // Proscenium arch — the ornate frame
        ctx.strokeStyle = 'rgba(160,130,70,0.2)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-10 - ox, h);
        ctx.lineTo(-10 - ox, 40 - oy);
        ctx.bezierCurveTo(w * 0.3 - ox, -10 - oy, w * 0.7 - ox, -10 - oy, w + 10 - ox, 40 - oy);
        ctx.lineTo(w + 10 - ox, h);
        ctx.stroke();
      },
    },
  ],
};

// ── Backstage corridor ──
export const backstageScene: ParallaxScene = {
  layers: [
    // Far: pipes and ducts on ceiling
    {
      depth: 0.2,
      draw(ctx, w, h, ox, oy) {
        ctx.fillStyle = '#080606';
        ctx.fillRect(0, 0, w, h);
        // Pipes
        ctx.strokeStyle = 'rgba(70,55,40,0.3)';
        ctx.lineWidth = 4;
        for (let i = 0; i < 5; i++) {
          const py = 30 + i * 15 - oy * 0.3;
          ctx.beginPath();
          ctx.moveTo(0, py);
          ctx.lineTo(w, py);
          ctx.stroke();
        }
      },
    },
    // Mid: brick walls
    {
      depth: 0.6,
      draw(ctx, w, h, ox, oy) {
        for (let row = 0; row < 22; row++) {
          for (let col = 0; col < 30; col++) {
            const bx = col * 55 + (row % 2) * 27 - ox;
            const by = row * 28 - oy * 0.5;
            if (bx < -55 || bx > w + 10) continue;
            const shade = 45 + Math.sin(row * 3.7 + col * 2.1) * 12;
            ctx.fillStyle = `rgba(${shade + 15},${shade - 5},${shade - 12},0.6)`;
            ctx.fillRect(bx, by, 52, 25);
          }
        }
      },
    },
    // Main: doors and gas lamps
    {
      depth: 1.0,
      draw(ctx, w, h, ox, oy, time) {
        // Doors along the wall
        for (let i = 0; i < 4; i++) {
          const dx = 200 + i * 300 - ox;
          if (dx < -80 || dx > w + 10) continue;
          ctx.fillStyle = '#2a1e14';
          ctx.fillRect(dx, h * 0.3 - oy, 60, h * 0.5);
          // Door frame
          ctx.strokeStyle = 'rgba(100,80,55,0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(dx - 3, h * 0.3 - 3 - oy, 66, h * 0.5 + 6);
          ctx.stroke();
          // Doorknob
          ctx.fillStyle = 'rgba(160,140,80,0.3)';
          ctx.beginPath();
          ctx.arc(dx + 50, h * 0.55 - oy, 3, 0, TAU);
          ctx.fill();
        }
        // Gas lamps
        for (let i = 0; i < 6; i++) {
          const lx = 150 + i * 220 - ox;
          if (lx < -30 || lx > w + 30) continue;
          const ly = h * 0.22 - oy;
          // Bracket
          ctx.fillStyle = 'rgba(100,80,55,0.4)';
          ctx.fillRect(lx - 1, ly, 2, 15);
          // Flame
          const fl = Math.sin(time * 8 + i * 2.3) * 1;
          const fg = ctx.createRadialGradient(lx + fl * 0.3, ly, 0, lx, ly, 30);
          fg.addColorStop(0, `rgba(255,160,60,${0.12 + 0.04 * Math.sin(time * 5 + i)})`);
          fg.addColorStop(1, 'rgba(255,160,60,0)');
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.arc(lx + fl * 0.3, ly, 30, 0, TAU);
          ctx.fill();
        }
      },
    },
    // Foreground: floor and shadows
    {
      depth: 1.3,
      draw(ctx, w, h, ox, oy) {
        // Dark floor
        ctx.fillStyle = '#0e0a08';
        ctx.fillRect(0, h * 0.82 - oy, w, h * 0.2);
        // Puddle reflections
        ctx.fillStyle = 'rgba(60,70,80,0.04)';
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.ellipse(180 + i * 200 - ox, h * 0.85 - oy, 30, 5, 0, 0, TAU);
          ctx.fill();
        }
      },
    },
  ],
};
