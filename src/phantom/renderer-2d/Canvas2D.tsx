import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useGameStore } from '../core/store';
import { getAreasForAct } from '../core/constants';
import { getEnvHotspotsForArea } from '../core/environment-descriptions';
import { getNPCsForArea } from '../core/npcs';
import { Hotspot } from '../core/types';
import { createAct3State } from './acts/Act3MusicOfNight';
import { drawCollectibleFx } from './collectible-fx';
import { getCharactersForArea, drawCharacters } from './characters';
import {
  createStoryEventState, updateBackdropFall, drawBackdropFall,
  updateChristineBloom, updateUnmasking, drawUnmasking,
  updateDuetMerge, updateFarewell, drawFarewell,
  triggerBackdropFall, triggerUnmasking, triggerFarewell,
  determineEnding,
} from './story-events';
import { createAct4State } from './acts/Act4AllIAskOfYou';
import { createAct5State } from './acts/Act5PointOfNoReturn';
import { renderParallaxScene, ParallaxScene } from './parallax';
import { theaterAudienceScene, theaterStageScene, backstageScene } from './scenes/theater-parallax';
import { dressingRoomScene, spiralStairsScene, tunnelScene, lakeScene } from './scenes/act2-parallax';
import { lairScene } from './scenes/act3-parallax';
import { rooftopScene } from './scenes/act4-parallax';
import { performanceScene, finalLairScene, epilogueScene } from './scenes/act5-parallax';

const CANVAS_W = 1024;
const CANVAS_H = 576;
const VIEWPORT_W = 1024;


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
  const cx = hotspot.x + hotspot.width / 2 - offsetX;
  const cy = hotspot.y + hotspot.height / 2;

  if (hotspot.type === 'clue') {
    // Softer teal glow for environment objects
    const pulse = 0.12 + 0.06 * Math.sin(time * 1.5);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, hotspot.width * 0.6);
    grad.addColorStop(0, `rgba(138,175,176,${pulse})`);
    grad.addColorStop(1, 'rgba(138,175,176,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, hotspot.width * 0.6, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (hotspot.type === 'character') {
    // Warm muted glow for NPCs
    const pulse = 0.15 + 0.08 * Math.sin(time * 1.2 + 1);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, hotspot.width * 0.7);
    grad.addColorStop(0, `rgba(176,144,144,${pulse})`);
    grad.addColorStop(1, 'rgba(176,144,144,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, hotspot.width * 0.7, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const pulse = 0.3 + 0.15 * Math.sin(time * 2);
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
interface Canvas2DProps {
  onTransition?: (type: 'fade' | 'mirror-portal', midpointFn: () => void) => void;
  onTriggerFired?: (triggerKey: string) => void;
  onClueClick?: (hotspotId: string) => void;
  onNPCClick?: (npcId: string) => void;
}

export default function Canvas2D({ onTransition, onTriggerFired, onClueClick, onNPCClick }: Canvas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const cameraTargetRef = useRef(0);
  const camPosRef = useRef(0);
  const pickupBurstRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [ghostOpacity, setGhostOpacity] = useState(0);
  const [showThinkOfMe, setShowThinkOfMe] = useState(false);

  // Per-act state refs (mutable from triggers, read in draw loop)
  const act3Ref = useRef(createAct3State());
  const act4Ref = useRef(createAct4State());
  const act5Ref = useRef(createAct5State());

  // Mouse position for parallax (normalized -1 to 1)
  const mouseRef = useRef({ x: 0, y: 0 });
  const storyRef = useRef(createStoryEventState());

  const {
    currentArea, cameraX, setCameraX, collectedItems, collectItem,
    triggeredEvents, triggerEvent, setArea, isPaused,
  } = useGameStore();

  const currentAct = useGameStore((s) => s.currentAct);
  const areas = getAreasForAct(currentAct);
  // Sync camera target when area changes
  useEffect(() => { cameraTargetRef.current = 0; camPosRef.current = 0; }, [currentArea]);

  const baseArea = areas.find((a) => a.id === currentArea);
  // Merge environment hotspots + NPC hotspots into the area
  const area = useMemo(() => {
    if (!baseArea) return undefined;
    const envHotspots = getEnvHotspotsForArea(baseArea.id);
    const npcHotspots: Hotspot[] = getNPCsForArea(baseArea.id).map((npc) => {
      const pos = npc.positions[baseArea.id] || { x: 500, y: 400 };
      return {
        id: 'npc-' + npc.id,
        x: pos.x, y: pos.y,
        width: 60, height: 80,
        type: 'character' as const,
        label: npc.name,
      };
    });
    const extra = [...envHotspots, ...npcHotspots];
    if (extra.length === 0) return baseArea;
    return { ...baseArea, hotspots: [...baseArea.hotspots, ...extra] };
  }, [baseArea]);

  /** Convert a mouse event to scene-space coordinates (accounts for canvas scale + camera offset) */
  const toSceneCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (CANVAS_W / rect.width) + camPosRef.current,
      y: (e.clientY - rect.top) * (CANVAS_H / rect.height),
    };
  }, []);

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
            pickupBurstRef.current = {
              x: hs.x + hs.width / 2,
              y: hs.y + hs.height / 2,
              t: performance.now() / 1000,
            };
          }
        } else if (hs.type === 'clue') {
          onClueClick?.(hs.id);
          return;
        } else if (hs.type === 'character' && hs.id.startsWith('npc-')) {
          onNPCClick?.(hs.id.replace('npc-', ''));
          return;
        } else if (hs.type === 'passage' && hs.targetArea) {
          setArea(hs.targetArea);
        } else if (hs.type === 'trigger' && hs.triggerKey) {
          if (!triggeredEvents.includes('evt-' + hs.triggerKey)) {
            triggerEvent('evt-' + hs.triggerKey);
            onTriggerFired?.(hs.triggerKey);
            if (hs.triggerKey === 'think-of-me-start') {
              // Backdrop falls first, then Christine appears
              triggerBackdropFall(storyRef.current);
              setTimeout(() => {
                setShowThinkOfMe(true);
                setTimeout(() => setGhostOpacity(1), 5000);
              }, 3000); // Christine enters 3s after backdrop crash
            } else if (hs.triggerKey === 'act1-end') {
              const doIt = () => { useGameStore.getState().setAct(2); setArea('dressing-room'); };
              if (onTransition) { onTransition('fade', doIt); } else { doIt(); }
            } else if (hs.triggerKey === 'mirror-open') {
              const doIt = () => setArea('spiral-stairs');
              if (onTransition) { onTransition('mirror-portal', doIt); } else { setTimeout(doIt, 1500); }
            } else if (hs.triggerKey === 'act2-end') {
              const doIt = () => { useGameStore.getState().setAct(3); setArea('lair'); };
              if (onTransition) { onTransition('fade', doIt); } else { doIt(); }
            } else if (hs.triggerKey === 'music-of-night-start') {
              act3Ref.current.candleWaveProgress = 0;
              // Animate candle wave over 3 seconds
              const start = performance.now();
              const animWave = () => {
                const p = Math.min(1, (performance.now() - start) / 3000);
                act3Ref.current.candleWaveProgress = p;
                if (p < 1) requestAnimationFrame(animWave);
              };
              requestAnimationFrame(animWave);
            } else if (hs.triggerKey === 'act3-end') {
              // Unmasking sequence: reaching → flash → dark → cold relight → transition
              triggerUnmasking(storyRef.current);
              act3Ref.current.unmasked = true;
              act3Ref.current.coldLighting = true;
              const doIt = () => { useGameStore.getState().setAct(4); setArea('rooftop'); };
              setTimeout(() => { if (onTransition) { onTransition('fade', doIt); } else { doIt(); } }, 5000);
            } else if (hs.triggerKey === 'all-i-ask-start') {
              act4Ref.current.petalsActive = true;
              // After 10s simulate reprise
              setTimeout(() => {
                act4Ref.current.repriseActive = true;
                act4Ref.current.lightning = 0.8;
                setTimeout(() => { act4Ref.current.lightning = 0; }, 300);
              }, 10000);
            } else if (hs.triggerKey === 'act4-end') {
              const doIt = () => { useGameStore.getState().setAct(5); setArea('theater-performance'); };
              if (onTransition) { onTransition('fade', doIt); } else { doIt(); }
            } else if (hs.triggerKey === 'point-of-no-return-start') {
              // Chandelier falls after 8s
              setTimeout(() => {
                act5Ref.current.chandelierFallen = true;
                act5Ref.current.screenShake = 1;
                const decayShake = () => {
                  act5Ref.current.screenShake *= 0.95;
                  if (act5Ref.current.screenShake > 0.01) requestAnimationFrame(decayShake);
                };
                requestAnimationFrame(decayShake);
                // Transition to final lair after shake
                const goLair = () => setArea('final-lair');
                setTimeout(() => { if (onTransition) { onTransition('fade', goLair); } else { goLair(); } }, 3000);
              }, 8000);
            } else if (hs.triggerKey === 'kiss-scene') {
              act5Ref.current.kissHappened = true;
              // Trigger farewell sequence (kiss glow → departure → alone → final notes → blow candle)
              triggerFarewell(storyRef.current);
              // Determine ending type based on collectibles
              storyRef.current.endingType = determineEnding(useGameStore.getState().collectedItems.length);
              // After farewell sequence plays out, transition to epilogue
              const goEpilogue = () => setArea('epilogue');
              setTimeout(() => { if (onTransition) { onTransition('fade', goEpilogue); } else { goEpilogue(); } }, 18000);
              // Epilogue fade
              setTimeout(() => {
                const fadeStart = performance.now();
                const animFade = () => {
                  const p = Math.min(1, (performance.now() - fadeStart) / 4000);
                  act5Ref.current.finalFade = p;
                  if (p < 1) requestAnimationFrame(animFade);
                };
                requestAnimationFrame(animFade);
              }, 8000);
            } else if (hs.triggerKey === 'eriks-mother' || hs.triggerKey === 'stargazing') {
              // Secret area triggers — handled by PhantomGame dialogue system
            }
          }
        }
        return;
      }
    }

    // Move camera toward click (smooth lerp via target ref)
    const targetX = Math.max(0, Math.min(clickX - VIEWPORT_W / 2, area.width - VIEWPORT_W));
    cameraTargetRef.current = targetX;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, toSceneCoords, collectedItems, collectItem, triggeredEvents, triggerEvent, setArea, setCameraX, isPaused, onTriggerFired, onClueClick, onNPCClick]);

  // Mouse move for hover detection
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Update parallax mouse position (normalized -1 to 1)
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }

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
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    const ctx: CanvasRenderingContext2D = maybeCtx;



    const startTime = performance.now();

    function draw(now: number) {
      const t = (now - startTime) / 1000;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Smooth camera lerp (use ref to avoid per-frame React re-renders)
      const target = cameraTargetRef.current;
      if (Math.abs(camPosRef.current - target) > 1) {
        camPosRef.current += (target - camPosRef.current) * 0.12;
      } else {
        camPosRef.current = target;
      }
      // Sync to zustand only when settled (not every frame)
      if (Math.abs(cameraX - camPosRef.current) > 5) {
        setCameraX(Math.round(camPosRef.current));
      }

      const cam = camPosRef.current;

      // ── Act 1 areas (2.5D parallax) ──
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      if (currentArea === 'theater-audience') {
        renderParallaxScene(ctx, theaterAudienceScene, CANVAS_W, CANVAS_H, cam, mx, my, t);
        // Ghost audience overlay (on top of parallax)
        drawGhostAudience(ctx, t, cam, ghostOpacity);
      } else if (currentArea === 'theater-stage') {
        renderParallaxScene(ctx, theaterStageScene, CANVAS_W, CANVAS_H, cam, mx, my, t);
      } else if (currentArea === 'theater-backstage') {
        renderParallaxScene(ctx, backstageScene, CANVAS_W, CANVAS_H, cam, mx, my, t);
      }

      // ── Acts 2-5: parallax scenes ──
      const parallaxScenes: Record<string, ParallaxScene> = {
        'dressing-room': dressingRoomScene,
        'spiral-stairs': spiralStairsScene,
        'underground-tunnel': tunnelScene,
        'underground-lake': lakeScene,
        'lair': lairScene,
        'rooftop': rooftopScene,
        'theater-performance': performanceScene,
        'final-lair': finalLairScene,
        'epilogue': epilogueScene,
      };
      const pScene = parallaxScenes[currentArea];
      if (pScene) {
        renderParallaxScene(ctx, pScene, CANVAS_W, CANVAS_H, cam, mx, my, t);
      }

      // ── Characters (data-driven) ──
      const triggered = useGameStore.getState().triggeredEvents;
      const sceneChars = getCharactersForArea(currentArea, triggered);
      drawCharacters(ctx, sceneChars, cam, t);

      // ── Hotspot glows + collectible-specific FX ──
      if (area) {
        for (const hs of area.hotspots) {
          drawHotspotGlow(ctx, hs, cam, t, collectedItems);
          // Draw special proximity effect for uncollected collectibles
          if (hs.type === 'collectible' && hs.collectibleId && !collectedItems.includes(hs.collectibleId)) {
            const fxX = hs.x + hs.width / 2 - cam;
            const fxY = hs.y + hs.height / 2;
            drawCollectibleFx(ctx, hs.collectibleId, fxX, fxY, t);
          }
        }
      }

      // ── Pickup burst particles ──
      if (pickupBurstRef.current) {
        const burst = pickupBurstRef.current;
        const age = t - burst.t;
        if (age < 1.2) {
          const bx = burst.x - cam;
          const by = burst.y;
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const dist = age * 80 + Math.sin(i * 2.7) * 20;
            const px = bx + Math.cos(angle) * dist;
            const py = by + Math.sin(angle) * dist - age * 30;
            const alpha = Math.max(0, 1 - age / 1.2) * 0.6;
            const size = (1 - age / 1.2) * 3;
            ctx.fillStyle = `rgba(197,165,90,${alpha})`;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          pickupBurstRef.current = null;
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

      // ── Story events update + draw ──
      const dt = 1 / 60; // approximate frame delta
      const story = storyRef.current;
      updateBackdropFall(story, dt);
      updateChristineBloom(story, dt, showThinkOfMe);
      updateUnmasking(story, dt);
      updateDuetMerge(story, dt, currentArea === 'theater-performance');
      updateFarewell(story, dt);

      drawBackdropFall(ctx, CANVAS_W, CANVAS_H, cam, t, story);
      drawUnmasking(ctx, CANVAS_W, CANVAS_H, story);
      drawFarewell(ctx, CANVAS_W, CANVAS_H, cam, t, story);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
