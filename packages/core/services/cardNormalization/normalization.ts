import type { PsgAssetRef } from '../psg/contracts';
import {
  CardNormalizationSchema,
  type CardNormalization,
  type GroundPlane,
  type HeadUnit,
  type NormalizationConfidence
} from './contracts';
import { getArchetypeOrDefault } from './archetypes';

/**
 * Pure derivation helpers + persistence accessors for card normalization.
 * The geometry mirrors the interaction prototype: head count is figure height
 * (head top → ground) measured in head-unit heights.
 */

/** Weights for the overall confidence rollup (must sum to 1). */
export const CONFIDENCE_WEIGHTS = {
  mask: 0.25,
  pose: 0.2,
  head: 0.25,
  ground: 0.3
} as const;

const NORMALIZATION_KEY = 'normalization';

/** Ground-plane Y at an arbitrary x, accounting for the plane's tilt. */
export function groundYAt(ground: GroundPlane, x: number): number {
  const midX = (ground.leftContact.x + ground.rightContact.x) / 2;
  return ground.y + (x - midX) * Math.tan((ground.angle * Math.PI) / 180);
}

/**
 * Observed head count: how many head-unit heights tall the figure is, measured
 * from the head's top edge down to the ground beneath the head center.
 */
export function computeObservedHeadCount(
  head: HeadUnit,
  ground: GroundPlane
): number {
  if (head.height <= 0) {
    return 0;
  }
  const headTop = head.centerY - head.height / 2;
  return (groundYAt(ground, head.centerX) - headTop) / head.height;
}

/** Weighted rollup of the four sub-confidences into an overall score (0..1). */
export function computeOverallConfidence(
  c: Pick<NormalizationConfidence, 'mask' | 'pose' | 'head' | 'ground'>
): number {
  return (
    c.mask * CONFIDENCE_WEIGHTS.mask +
    c.pose * CONFIDENCE_WEIGHTS.pose +
    c.head * CONFIDENCE_WEIGHTS.head +
    c.ground * CONFIDENCE_WEIGHTS.ground
  );
}

/**
 * Real-world height of one head unit for an archetype (metres), i.e. the known
 * "ruler": canonical target height divided by canonical head count.
 */
export function headHeightMetres(archetypeId: string): number {
  const a = getArchetypeOrDefault(archetypeId);
  return a.targetHeightM / a.canonicalHeadCount;
}

/**
 * Estimated real-world height extrapolated from the observed head count — the
 * core payoff: head size is a known ruler, so head count → metres.
 */
export function estimatedHeightM(n: CardNormalization): number {
  return n.observedHeadCount * headHeightMetres(n.archetype);
}

/** Format metres as feet/inches, e.g. 1.78 → "5′10″". */
export function formatFeetInches(metres: number): string {
  const totalInches = metres / 0.0254;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return `${feet}′${inches}″`;
}

/** Whether an observed head count sits within the archetype's acceptable range. */
export function isHeadCountInRange(
  observedHeadCount: number,
  archetypeId: string
): boolean {
  const [min, max] = getArchetypeOrDefault(archetypeId).headCountRange;
  return observedHeadCount >= min && observedHeadCount <= max;
}

/**
 * Return a copy with the derived fields recomputed from current geometry:
 * observed head count and the overall confidence rollup. Call after any edit.
 */
export function recomputeDerived(n: CardNormalization): CardNormalization {
  return {
    ...n,
    observedHeadCount: computeObservedHeadCount(n.head, n.ground),
    confidence: {
      ...n.confidence,
      overall: computeOverallConfidence(n.confidence)
    }
  };
}

/**
 * Read a validated normalization record off an asset's metadata, or null if it
 * is absent or fails validation.
 */
export function readNormalization(asset: PsgAssetRef): CardNormalization | null {
  const raw = asset.metadata?.[NORMALIZATION_KEY];
  if (raw === undefined || raw === null) {
    return null;
  }
  const parsed = CardNormalizationSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/**
 * Return a new asset with a validated normalization record written to its
 * metadata. Does not mutate the input asset.
 */
export function writeNormalization(
  asset: PsgAssetRef,
  normalization: CardNormalization
): PsgAssetRef {
  const validated = CardNormalizationSchema.parse(normalization);
  return {
    ...asset,
    metadata: {
      ...(asset.metadata ?? {}),
      [NORMALIZATION_KEY]: validated
    }
  };
}

/** Convenience: does this asset carry an approved normalization? */
export function isAssetApproved(asset: PsgAssetRef): boolean {
  return readNormalization(asset)?.status === 'approved';
}
