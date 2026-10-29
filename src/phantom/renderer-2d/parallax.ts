/**
 * 2.5D Parallax system — renders layered scenes with depth via mouse + camera offset.
 *
 * Each scene has 4-5 layers at different depth factors:
 *   far background (0.2x) → mid background (0.5x) → main (1.0x) → foreground (1.3x)
 *
 * Layers are drawn back-to-front. Each layer is a procedural drawing function
 * that receives the parallax-adjusted offset.
 */

export interface ParallaxLayer {
  /** Depth factor: 0 = fixed, 0.5 = half speed, 1 = normal, 1.3 = foreground */
  depth: number;
  /** Draw function: receives ctx, canvas size, adjusted offset, and time */
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, offsetX: number, offsetY: number, time: number) => void;
}

export interface ParallaxScene {
  layers: ParallaxLayer[];
}

/**
 * Render a parallax scene. Call each frame.
 * @param mouseX - normalized mouse X (-1 to 1, 0 = center)
 * @param mouseY - normalized mouse Y (-1 to 1, 0 = center)
 * @param cameraX - horizontal scroll position
 */
export function renderParallaxScene(
  ctx: CanvasRenderingContext2D,
  scene: ParallaxScene,
  w: number, h: number,
  cameraX: number,
  mouseX: number, mouseY: number,
  time: number
) {
  // Mouse parallax range (pixels of offset at depth=1)
  const MOUSE_RANGE_X = 20;
  const MOUSE_RANGE_Y = 12;

  for (const layer of scene.layers) {
    const ox = cameraX * layer.depth + mouseX * MOUSE_RANGE_X * layer.depth;
    const oy = mouseY * MOUSE_RANGE_Y * layer.depth;
    layer.draw(ctx, w, h, ox, oy, time);
  }
}
