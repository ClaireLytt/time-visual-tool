/**
 * Story event animations — scripted visual sequences triggered at key moments.
 * Each event is a self-contained animation that draws on top of the scene.
 */
import { TAU, srand } from './draw-utils';

export interface StoryEventState {
  // Act 1
  backdropFalling: boolean;
  backdropFallY: number;
  backdropShake: number;
  christineBloom: number;         // 0-1, how "bright" Christine is (gradual bloom)

  // Act 3
  unmaskingPhase: 'none' | 'reaching' | 'flash' | 'dark' | 'cold-relight';
  unmaskTimer: number;
  maskDropY: number;

  // Act 5
  duetMerge: number;              // 0-1, how merged the duet particles are
  farewellPhase: 'none' | 'kiss-glow' | 'departure' | 'alone' | 'final-notes' | 'blow-candle';
  farewellTimer: number;
  departureX: number;             // Christine+Raoul moving offscreen

  // Multi-ending
  endingType: 'full' | 'standard' | 'minimal';
}

export function createStoryEventState(): StoryEventState {
  return {
    backdropFalling: false, backdropFallY: 0, backdropShake: 0,
    christineBloom: 0,
    unmaskingPhase: 'none', unmaskTimer: 0, maskDropY: 0,
    duetMerge: 0,
    farewellPhase: 'none', farewellTimer: 0, departureX: 0,
    endingType: 'standard',
  };
}

/** Trigger the backdrop fall sequence (Act 1) */
export function triggerBackdropFall(state: StoryEventState) {
  state.backdropFalling = true;
  state.backdropFallY = 0;
  state.backdropShake = 0;
}

/** Update backdrop fall physics each frame */
export function updateBackdropFall(state: StoryEventState, dt: number) {
  if (!state.backdropFalling) return;
  if (state.backdropFallY < 350) {
    state.backdropFallY += dt * 600; // gravity acceleration
    if (state.backdropFallY >= 350) {
      state.backdropShake = 1;
    }
  } else {
    state.backdropShake *= 0.93;
  }
}

/** Draw the falling backdrop + shake + debris */
export function drawBackdropFall(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  cam: number, time: number, state: StoryEventState
) {
  if (!state.backdropFalling) return;

  // Apply screen shake
  if (state.backdropShake > 0.01) {
    ctx.save();
    ctx.translate(
      Math.sin(time * 40) * state.backdropShake * 6,
      Math.cos(time * 35) * state.backdropShake * 4
    );
  }

  const fallY = Math.min(state.backdropFallY, 350);
  const bx = 800 - cam;

  if (fallY < 350) {
    // Falling backdrop panel
    ctx.fillStyle = '#3a2a1e';
    ctx.fillRect(bx - 40, fallY - 60, 80, 60);
    // Rope trailing above
    ctx.strokeStyle = 'rgba(160,140,100,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx, 0);
    ctx.lineTo(bx, fallY - 60);
    ctx.stroke();
  } else {
    // Impact debris
    for (let i = 0; i < 15; i++) {
      const angle = srand(i * 5.3) * TAU;
      const dist = srand(i * 3.7) * 80 * state.backdropShake;
      const dx = bx + Math.cos(angle) * dist;
      const dy = 350 + Math.sin(angle) * dist * 0.4 - 20;
      ctx.fillStyle = `rgba(80,60,40,${0.3 * state.backdropShake})`;
      ctx.beginPath();
      ctx.arc(dx, dy, 2 + srand(i) * 3, 0, TAU);
      ctx.fill();
    }
    // Dust cloud
    const dustG = ctx.createRadialGradient(bx, 340, 0, bx, 340, 60 * state.backdropShake);
    dustG.addColorStop(0, `rgba(140,120,90,${0.12 * state.backdropShake})`);
    dustG.addColorStop(1, 'rgba(140,120,90,0)');
    ctx.fillStyle = dustG;
    ctx.beginPath();
    ctx.arc(bx, 340, 60, 0, TAU);
    ctx.fill();
  }

  if (state.backdropShake > 0.01) {
    ctx.restore();
  }
}

/** Update Christine's bloom (gradual brightening during Think of Me) */
export function updateChristineBloom(state: StoryEventState, dt: number, active: boolean) {
  if (active && state.christineBloom < 1) {
    state.christineBloom = Math.min(1, state.christineBloom + dt * 0.05); // ~20s to full
  }
}

/** Get Christine's current visual intensity (0=dim, 1=full) */
export function getChristineIntensity(state: StoryEventState): number {
  return 0.3 + state.christineBloom * 0.7;
}

/** Trigger the unmasking sequence (Act 3) */
export function triggerUnmasking(state: StoryEventState) {
  state.unmaskingPhase = 'reaching';
  state.unmaskTimer = 0;
}

/** Update unmasking animation */
export function updateUnmasking(state: StoryEventState, dt: number) {
  if (state.unmaskingPhase === 'none') return;
  state.unmaskTimer += dt;

  if (state.unmaskingPhase === 'reaching' && state.unmaskTimer > 2) {
    state.unmaskingPhase = 'flash';
    state.unmaskTimer = 0;
  } else if (state.unmaskingPhase === 'flash' && state.unmaskTimer > 0.1) {
    state.unmaskingPhase = 'dark';
    state.unmaskTimer = 0;
  } else if (state.unmaskingPhase === 'dark' && state.unmaskTimer > 1.5) {
    state.unmaskingPhase = 'cold-relight';
    state.unmaskTimer = 0;
    state.maskDropY = 0;
  } else if (state.unmaskingPhase === 'cold-relight') {
    // Mask falls
    if (state.maskDropY < 80) {
      state.maskDropY += dt * 200;
    }
  }
}

/** Draw unmasking overlays */
export function drawUnmasking(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  state: StoryEventState
) {
  if (state.unmaskingPhase === 'none') return;

  if (state.unmaskingPhase === 'flash') {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(0, 0, w, h);
  } else if (state.unmaskingPhase === 'dark') {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(1, state.unmaskTimer * 2)})`;
    ctx.fillRect(0, 0, w, h);
  } else if (state.unmaskingPhase === 'cold-relight') {
    // Cold blue tint over the scene
    const opacity = Math.max(0, 0.15 - state.unmaskTimer * 0.01);
    ctx.fillStyle = `rgba(100,120,180,${opacity})`;
    ctx.fillRect(0, 0, w, h);

    // Falling mask animation
    if (state.maskDropY < 80) {
      const mkx = w * 0.55;
      const mky = h * 0.35 + state.maskDropY;
      const rot = state.maskDropY * 0.02;
      ctx.save();
      ctx.translate(mkx, mky);
      ctx.rotate(rot);
      ctx.fillStyle = '#f0ebe3';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 8, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }
}

/** Update the duet particle merge (Act 5 performance) */
export function updateDuetMerge(state: StoryEventState, dt: number, active: boolean) {
  if (active && state.duetMerge < 1) {
    state.duetMerge = Math.min(1, state.duetMerge + dt * 0.03); // ~33s to full merge
  }
}

/** Trigger the farewell sequence (Act 5, after kiss) */
export function triggerFarewell(state: StoryEventState) {
  state.farewellPhase = 'kiss-glow';
  state.farewellTimer = 0;
}

/** Update farewell sequence */
export function updateFarewell(state: StoryEventState, dt: number) {
  if (state.farewellPhase === 'none') return;
  state.farewellTimer += dt;

  if (state.farewellPhase === 'kiss-glow' && state.farewellTimer > 3) {
    state.farewellPhase = 'departure';
    state.farewellTimer = 0;
    state.departureX = 0;
  } else if (state.farewellPhase === 'departure') {
    state.departureX += dt * 30;
    if (state.farewellTimer > 4) {
      state.farewellPhase = 'alone';
      state.farewellTimer = 0;
    }
  } else if (state.farewellPhase === 'alone' && state.farewellTimer > 3) {
    state.farewellPhase = 'final-notes';
    state.farewellTimer = 0;
  } else if (state.farewellPhase === 'final-notes' && state.farewellTimer > 4) {
    state.farewellPhase = 'blow-candle';
    state.farewellTimer = 0;
  }
}

/** Draw farewell overlays (departing figures, lone phantom, candle blow) */
export function drawFarewell(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  cam: number, time: number, state: StoryEventState
) {
  if (state.farewellPhase === 'none') return;

  if (state.farewellPhase === 'kiss-glow') {
    // Warm glow expanding from center
    const r = state.farewellTimer * 40;
    const g = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, r);
    g.addColorStop(0, `rgba(255,220,170,${0.1 - state.farewellTimer * 0.02})`);
    g.addColorStop(1, 'rgba(255,220,170,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.45, r, 0, TAU);
    ctx.fill();
  }

  if (state.farewellPhase === 'departure') {
    // Christine + Raoul walking away (golden + silver particles fading left)
    const depX = w * 0.4 - state.departureX - cam;
    const fade = Math.max(0, 1 - state.farewellTimer * 0.25);
    // Christine departing
    for (let i = 0; i < 15; i++) {
      const s = i * 7.3 + 1000;
      const px = depX + (srand(s) - 0.5) * 12;
      const py = h * 0.45 + srand(s + 1) * 25;
      ctx.fillStyle = `rgba(197,165,90,${fade * (0.15 + srand(s + 2) * 0.15)})`;
      ctx.beginPath();
      ctx.arc(px, py, 1 + srand(s + 3) * 0.8, 0, TAU);
      ctx.fill();
    }
    // Raoul departing
    for (let i = 0; i < 12; i++) {
      const s = i * 7.3 + 2000;
      const px = depX - 20 + (srand(s) - 0.5) * 10;
      const py = h * 0.46 + srand(s + 1) * 22;
      ctx.fillStyle = `rgba(139,175,196,${fade * (0.12 + srand(s + 2) * 0.12)})`;
      ctx.beginPath();
      ctx.arc(px, py, 0.8 + srand(s + 3) * 0.7, 0, TAU);
      ctx.fill();
    }
  }

  if (state.farewellPhase === 'alone') {
    // Phantom alone — walks to organ position, subtle sorrow
    const phantomX = w * 0.5 + Math.sin(state.farewellTimer * 0.3) * 5 - cam;
    for (let i = 0; i < 20; i++) {
      const s = i * 7.3 + 3000;
      const px = phantomX + (srand(s) - 0.5) * 14;
      const py = h * 0.42 + srand(s + 1) * 28;
      const wobble = Math.sin(time * 0.5 + i * 0.7) * 1;
      ctx.fillStyle = `rgba(60,58,55,${0.2 + srand(s + 2) * 0.15})`;
      ctx.beginPath();
      ctx.arc(px + wobble, py, 1 + srand(s + 3) * 0.7, 0, TAU);
      ctx.fill();
    }
  }

  if (state.farewellPhase === 'blow-candle') {
    // Fade to black as the last candle goes out
    const fade = Math.min(1, state.farewellTimer * 0.3);
    ctx.fillStyle = `rgba(0,0,0,${fade})`;
    ctx.fillRect(0, 0, w, h);
  }
}

/** Determine ending type based on collectible count */
export function determineEnding(collectedCount: number): 'full' | 'standard' | 'minimal' {
  if (collectedCount >= 15) return 'full';
  if (collectedCount >= 10) return 'standard';
  return 'minimal';
}

/** Get ending text */
export function getEndingText(type: 'full' | 'standard' | 'minimal'): string[] {
  if (type === 'full') {
    return [
      '他的音乐永远回荡在这座歌剧院里。',
      '',
      '"也许在另一个故事里，',
      '她会留下来。',
      '也许在另一个故事里，',
      '他不再需要面具。"',
      '',
      '你收集了全部 15 件遗物。',
      '你听到了他完整的故事。',
    ];
  }
  if (type === 'standard') {
    return [
      '他的音乐永远回荡在这座歌剧院里。',
      '',
      '但还有一些故事碎片散落在歌剧院的角落……',
    ];
  }
  return [
    '他的音乐永远回荡在这座歌剧院里。',
  ];
}
