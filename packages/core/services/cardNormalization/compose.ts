import type { CardNormalization } from './contracts';

/**
 * Scene composition — the payoff of normalization.
 *
 * Given normalized cards, derive each card's on-screen scale and draw position
 * so every figure shares a head-unit height and its pivot (feet) lands on the
 * scene ground line. This is the pure, deterministic core that the server-side
 * `assembleScene` will call to fill in `PsgScenePlacement.scale` / x / y.
 */

export interface SceneLayout {
  width: number;
  height: number;
  /** Scene ground line (px from top). */
  groundY: number;
  /** Target on-screen head-unit height (px). One of targetHeadPx / metresPerPixel. */
  targetHeadPx?: number;
  /** Real-world scale; uses each card's targetHeightM. */
  metresPerPixel?: number;
}

export interface SceneCardInstance {
  normalization: CardNormalization;
  /** Horizontal position of the card's pivot on the ground line (px). */
  centerX: number;
  /** Depth multiplier for crowd perspective (default 1). */
  depthScale?: number;
}

export interface ComposedCard {
  assetId: string;
  /** Multiply the source image by this to reach scene scale. */
  scale: number;
  /** Where the source image's (0,0) maps to in scene space. */
  drawX: number;
  drawY: number;
  headTopY: number;
  footY: number;
  /** On-screen head-unit height — equal across normalized cards. */
  headHeightPx: number;
}

/** Source-space figure height (head top → ground), independent of rounding. */
export function figureHeightPx(n: CardNormalization): number {
  const headTop = n.head.centerY - n.head.height / 2;
  return n.ground.y - headTop;
}

function scaleFor(n: CardNormalization, layout: SceneLayout): number {
  if (typeof layout.targetHeadPx === 'number') {
    return layout.targetHeadPx / n.head.height;
  }
  if (typeof layout.metresPerPixel === 'number' && typeof n.targetHeightM === 'number') {
    const targetFigurePx = n.targetHeightM / layout.metresPerPixel;
    return targetFigurePx / figureHeightPx(n);
  }
  // Fallback: make the head unit ~12% of the scene height.
  return (layout.height * 0.12) / n.head.height;
}

export function composeCard(
  instance: SceneCardInstance,
  layout: SceneLayout
): ComposedCard {
  const n = instance.normalization;
  const scale = scaleFor(n, layout) * (instance.depthScale ?? 1);
  const drawX = instance.centerX - n.pivot.x * scale;
  const drawY = layout.groundY - n.pivot.y * scale;
  const headTop = n.head.centerY - n.head.height / 2;
  return {
    assetId: n.assetId,
    scale,
    drawX,
    drawY,
    headTopY: drawY + headTop * scale,
    footY: layout.groundY,
    headHeightPx: n.head.height * scale
  };
}

export function composeScene(
  instances: SceneCardInstance[],
  layout: SceneLayout
): ComposedCard[] {
  return instances.map(instance => composeCard(instance, layout));
}

/**
 * Map composed cards onto the PSG scene-placement shape so this can feed
 * `PsgSceneAssemblyPlan.placements`. (id/zone/depthLayer are left to the caller.)
 */
export function toScenePlacements(
  instances: SceneCardInstance[],
  layout: SceneLayout
): Array<{ assetId: string; x: number; y: number; scale: number }> {
  return instances.map(instance => {
    const composed = composeCard(instance, layout);
    return {
      assetId: composed.assetId,
      x: instance.centerX,
      y: layout.groundY,
      scale: composed.scale
    };
  });
}
