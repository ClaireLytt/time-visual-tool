import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore } from '../core/store';
import { getAreasForAct } from '../core/constants';
import { Hotspot } from '../core/types';
import {
  drawDressingRoom, drawSpiralStairs, drawUndergroundTunnel, drawUndergroundLake,
  createAct2State,
} from './acts/Act2PhantomOfOpera';

const CANVAS_W = 1024;
const CANVAS_H = 576;
const VIEWPORT_W = 1024;

// ── Particle character ──
interface Particle {
  x: number; y: number; size: number; alpha: number;
  phase: number; speed: number;
  driftX: number; driftY: number;
}

function makeParticles(count: number, cx: number, cy: number, spread: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * spread * 300;
    out.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r - Math.random() * 120,
      size: 0.5 + Math.random() * 2,
      alpha: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      driftX: (Math.random() - 0.5) * 0.4,
      driftY: -Math.random() * 0.3,
    });
  }
  return out;
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  color: [number, number, number],
  time: number,
  offsetX: number
) {
  const [r, g, b] = color;
  for (const p of particles) {
    const wobbleX = Math.sin(time * p.speed + p.phase) * 1.5;
    const wobbleY = Math.cos(time * p.speed * 0.7 + p.phase) * 0.8;
    const px = p.x - offsetX + wobbleX + p.driftX * Math.sin(time * 0.5 + p.phase);
    const py = p.y + wobbleY + p.driftY * Math.cos(time * 0.3 + p.phase);
    const a = p.alpha * (0.7 + 0.3 * Math.sin(time * p.speed * 0.7 + p.phase));
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.fill();
  }
}

// ── Hotspot glow ──
function drawHotspotGlow(
  ctx: CanvasRenderingContext2D,
  hotspot: Hotspot,
  offsetX: number,
  time: number,
  collected: string[]
) {
  if (hotspot.type === 'collectible' && hotspot.collectibleId && collected.includes(hotspot.collectibleId)) {
    return; // already collected
  }
  const pulse = 0.3 + 0.15 * Math.sin(time * 2);
  const cx = hotspot.x + hotspot.width / 2 - offsetX;
  const cy = hotspot.y + hotspot.height / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, hotspot.width * 0.8);
  grad.addColorStop(0, `rgba(255,220,120,${pulse})`);
  grad.addColorStop(1, 'rgba(255,220,120,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, hotspot.width * 0.8, 0, Math.PI * 2);
  ctx.fill();
}

// ── Ghost audience ──
function drawGhostAudience(ctx: CanvasRenderingContext2D, time: number, offsetX: number, opacity: number) {
  if (opacity <= 0) return;
  for (let i = 0; i < 30; i++) {
    const x = 200 + (i % 10) * 160 + Math.sin(i * 7.3) * 40 - offsetX;
    const y = 380 + Math.floor(i / 10) * 45 + Math.sin(i * 3.1) * 10;
    const a = opacity * (0.08 + 0.04 * Math.sin(time + i * 2));
    // Body
    ctx.fillStyle = `rgba(200,195,185,${a})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.arc(x, y - 22, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Main canvas component ──
export default function Canvas2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [ghostOpacity, setGhostOpacity] = useState(0);
  const [showThinkOfMe, setShowThinkOfMe] = useState(false);

  const {
    currentArea, cameraX, setCameraX, collectedItems, collectItem,
    triggeredEvents, triggerEvent, setArea, isPaused,
  } = useGameStore();

  const currentAct = useGameStore((s) => s.currentAct);
  const areas = getAreasForAct(currentAct);
  const area = areas.find((a) => a.id === currentArea);

  /** Convert a mouse event to scene-space coordinates (accounts for canvas scale + camera offset) */
  const toSceneCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CANVAS_W / rect.width) + cameraX,
      y: (e.clientY - rect.top) * (CANVAS_H / rect.height),
    };
  }, [cameraX]);

  // Click handler
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!area || isPaused) return;
    const coords = toSceneCoords(e);
    if (!coords) return;
    const { x: clickX, y: clickY } = coords;

    // Check hotspot hits
    for (const hs of area.hotspots) {
      if (
        clickX >= hs.x && clickX <= hs.x + hs.width &&
        clickY >= hs.y && clickY <= hs.y + hs.height
      ) {
        if (hs.type === 'collectible' && hs.collectibleId) {
          if (!collectedItems.includes(hs.collectibleId)) {
            collectItem(hs.collectibleId);
          }
        } else if (hs.type === 'passage' && hs.targetArea) {
          setArea(hs.targetArea);
        } else if (hs.type === 'trigger' && hs.triggerKey) {
          if (!triggeredEvents.includes('evt-' + hs.triggerKey)) {
            triggerEvent('evt-' + hs.triggerKey);
            if (hs.triggerKey === 'think-of-me-start') {
              setShowThinkOfMe(true);
              setTimeout(() => setGhostOpacity(1), 5000);
            } else if (hs.triggerKey === 'mirror-open') {
              // Transition to spiral stairs via mirror portal
              setTimeout(() => setArea('spiral-stairs'), 1500);
            } else if (hs.triggerKey === 'act2-end') {
              // End of Act 2 — would transition to Act 3
            }
          }
        }
        return;
      }
    }

    // Move camera toward click
    const targetX = Math.max(0, Math.min(clickX - VIEWPORT_W / 2, area.width - VIEWPORT_W));
    setCameraX(targetX);
  }, [area, toSceneCoords, collectedItems, collectItem, triggeredEvents, triggerEvent, setArea, setCameraX, isPaused]);

  // Mouse move for hover detection
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!area) return;
    const coords = toSceneCoords(e);
    if (!coords) return;
    const { x: mx, y: my } = coords;

    let found: Hotspot | null = null;
    for (const hs of area.hotspots) {
      if (mx >= hs.x && mx <= hs.x + hs.width && my >= hs.y && my <= hs.y + hs.height) {
        found = hs;
        break;
      }
    }
    setHoveredHotspot(found);
  }, [area, toSceneCoords]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Christine particles (on stage)
    const christineParticles = makeParticles(400, 1000, 380, 0.025);
    // Phantom silhouette particles (Box 5)
    const phantomParticles = makeParticles(200, 1700, 220, 0.02);

    // Act 2 state
    const act2State = createAct2State();
    if (currentArea === 'underground-lake') {
      act2State.boatActive = true;
    }

    const startTime = performance.now();

    function draw(now: number) {
      const t = (now - startTime) / 1000;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const cam = cameraX;

      // ── Background gradient (placeholder for AI-generated background) ──
      if (currentArea === 'theater-audience' || currentArea === 'theater-stage') {
        // Dark theater background
        const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        bg.addColorStop(0, '#0e0a0a');
        bg.addColorStop(0.3, '#1a1014');
        bg.addColorStop(0.7, '#1e1418');
        bg.addColorStop(1, '#12100e');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Curtain elements on sides
        for (let i = 0; i < 3; i++) {
          const lx = i * 15 - cam * 0.1;
          const rx = CANVAS_W - 45 + i * 15 + cam * 0.1;
          ctx.fillStyle = `rgba(80,30,40,${0.6 - i * 0.15})`;
          ctx.fillRect(lx, 0, 20, CANVAS_H);
          ctx.fillRect(rx, 0, 20, CANVAS_H);
        }

        // Stage area
        if (currentArea === 'theater-stage') {
          // Stage floor
          ctx.fillStyle = '#2a1e18';
          ctx.fillRect(0, 440, CANVAS_W, CANVAS_H - 440);
          // Footlights
          for (let i = 0; i < 8; i++) {
            const fx = 200 + i * 80 - cam;
            const glow = ctx.createRadialGradient(fx, 445, 0, fx, 445, 30);
            glow.addColorStop(0, `rgba(255,200,100,${0.3 + 0.1 * Math.sin(t * 3 + i)})`);
            glow.addColorStop(1, 'rgba(255,200,100,0)');
            ctx.fillStyle = glow;
            ctx.fillRect(fx - 30, 415, 60, 60);
          }
          // Spotlight on Christine position
          if (showThinkOfMe) {
            const spotGrad = ctx.createRadialGradient(1000 - cam, 300, 0, 1000 - cam, 300, 200);
            spotGrad.addColorStop(0, 'rgba(255,240,200,0.15)');
            spotGrad.addColorStop(1, 'rgba(255,240,200,0)');
            ctx.fillStyle = spotGrad;
            ctx.beginPath();
            ctx.arc(1000 - cam, 300, 200, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Audience seats (rows of dark shapes)
        if (currentArea === 'theater-audience') {
          for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 15; col++) {
              const sx = 100 + col * 120 - cam;
              const sy = 360 + row * 40;
              ctx.fillStyle = `rgba(60,20,25,${0.5 - row * 0.08})`;
              ctx.beginPath();
              ctx.roundRect(sx, sy, 40, 25, 4);
              ctx.fill();
            }
          }
          // Ghost audience
          drawGhostAudience(ctx, t, cam, ghostOpacity);
        }

        // Chandelier
        const chandelierX = 900 - cam * 0.5;
        const chandelierGlow = ctx.createRadialGradient(chandelierX, 40, 0, chandelierX, 40, 80);
        chandelierGlow.addColorStop(0, 'rgba(255,220,150,0.2)');
        chandelierGlow.addColorStop(1, 'rgba(255,220,150,0)');
        ctx.fillStyle = chandelierGlow;
        ctx.beginPath();
        ctx.arc(chandelierX, 40, 80, 0, Math.PI * 2);
        ctx.fill();
        // Chandelier body
        ctx.fillStyle = '#c8b880';
        ctx.beginPath();
        ctx.moveTo(chandelierX - 25, 30);
        ctx.lineTo(chandelierX + 25, 30);
        ctx.lineTo(chandelierX + 15, 55);
        ctx.lineTo(chandelierX - 15, 55);
        ctx.fill();

        // Box 5 area (upper right)
        if (currentArea === 'theater-audience') {
          const bx = 1680 - cam;
          ctx.fillStyle = 'rgba(40,15,20,0.7)';
          ctx.beginPath();
          ctx.roundRect(bx, 160, 120, 140, 6);
          ctx.fill();
          ctx.strokeStyle = '#8a7050';
          ctx.lineWidth = 1;
          ctx.stroke();
          // "5" label
          ctx.fillStyle = 'rgba(200,180,140,0.4)';
          ctx.font = '20px Georgia, serif';
          ctx.textAlign = 'center';
          ctx.fillText('V', bx + 60, 230);
        }

      } else if (currentArea === 'theater-backstage') {
        // Backstage: darker, narrower
        const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        bg.addColorStop(0, '#0a0808');
        bg.addColorStop(1, '#100c0a');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        // Brick walls
        for (let row = 0; row < 20; row++) {
          for (let col = 0; col < 30; col++) {
            const bx = col * 55 + (row % 2) * 27 - cam;
            const by = row * 30;
            ctx.fillStyle = `rgba(${70 + Math.sin(row + col) * 15},${35 + Math.sin(row * col) * 8},${25},0.6)`;
            ctx.fillRect(bx, by, 52, 27);
          }
        }
        // Mirror at end
        const mirrorX = 1200 - cam;
        ctx.fillStyle = 'rgba(180,200,220,0.15)';
        ctx.beginPath();
        ctx.roundRect(mirrorX, 260, 80, 180, 8);
        ctx.fill();
        ctx.strokeStyle = '#a09060';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(mirrorX - 4, 256, 88, 188, 10);
        ctx.stroke();
        // Mirror shimmer
        const shimmer = 0.08 + 0.05 * Math.sin(t * 1.5);
        ctx.fillStyle = `rgba(200,220,255,${shimmer})`;
        ctx.beginPath();
        ctx.roundRect(mirrorX + 5, 270, 70, 160, 4);
        ctx.fill();
      }

      // ── Act 2 areas ──
      if (currentArea === 'dressing-room') {
        drawDressingRoom(ctx, CANVAS_W, CANVAS_H, cam, t, act2State);
      } else if (currentArea === 'spiral-stairs') {
        drawSpiralStairs(ctx, CANVAS_W, CANVAS_H, cam, t);
      } else if (currentArea === 'underground-tunnel') {
        drawUndergroundTunnel(ctx, CANVAS_W, CANVAS_H, cam, t);
      } else if (currentArea === 'underground-lake') {
        drawUndergroundLake(ctx, CANVAS_W, CANVAS_H, cam, t, act2State);
      }

      // ── Characters ──
      if (currentArea === 'theater-stage' && showThinkOfMe) {
        drawParticles(ctx, christineParticles, [197, 165, 90], t, cam);
      }
      if (currentArea === 'theater-audience' && showThinkOfMe) {
        // Phantom in Box 5 — brief flash
        const phantomFlash = Math.sin(t * 0.3) > 0.9;
        if (phantomFlash) {
          drawParticles(ctx, phantomParticles, [60, 58, 55], t, cam);
        }
      }

      // ── Hotspot glows ──
      if (area) {
        for (const hs of area.hotspots) {
          drawHotspotGlow(ctx, hs, cam, t, collectedItems);
        }
      }

      // ── Hover tooltip ──
      if (hoveredHotspot) {
        const tx = hoveredHotspot.x + hoveredHotspot.width / 2 - cam;
        const ty = hoveredHotspot.y - 15;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        const tw = ctx.measureText(hoveredHotspot.label).width + 16;
        ctx.beginPath();
        ctx.roundRect(tx - tw / 2, ty - 20, tw, 24, 4);
        ctx.fill();
        ctx.fillStyle = '#e0d8cc';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(hoveredHotspot.label, tx, ty - 3);
      }

      // ── Phantom tier effects ──
      const tier = useGameStore.getState().phantomTier;
      if (tier === 'stirring' || tier === 'watching' || tier === 'stalking') {
        // Flicker: randomly dim the scene
        if (Math.sin(t * 8) > 0.97) {
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        }
      }
      if (tier === 'watching' || tier === 'stalking') {
        // Rose petals
        for (let i = 0; i < 8; i++) {
          const px = (200 + i * 130 + t * 20) % CANVAS_W;
          const py = 100 + Math.sin(t * 0.5 + i * 2) * 200;
          const pa = 0.2 + 0.1 * Math.sin(t + i);
          ctx.fillStyle = `rgba(140,30,40,${pa})`;
          ctx.beginPath();
          ctx.ellipse(px, py, 4, 2.5, t * 0.5 + i, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Vignette ──
      const vign = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.3, CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.7);
      vign.addColorStop(0, 'rgba(0,0,0,0)');
      vign.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vign;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [currentArea, cameraX, collectedItems, hoveredHotspot, ghostOpacity, showThinkOfMe, area]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      style={{
        width: '100%',
        maxWidth: '1024px',
        height: 'auto',
        cursor: hoveredHotspot ? 'pointer' : 'default',
        borderRadius: '8px',
        display: 'block',
      }}
    />
  );
}
