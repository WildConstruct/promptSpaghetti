import type { ImageBootstrapSelectionSummary } from './imageBootstrapSelection';

export type PlacementSurface = 'wall' | 'floor';

const SURFACE_KEYWORDS: Record<PlacementSurface, string[]> = {
  wall: ['wall', 'poster', 'sign', 'neon', 'frame', 'sconce', 'mural', 'banner'],
  floor: ['floor', 'chair', 'crate', 'stool', 'table', 'plant', 'lamp', 'rug', 'box']
};

export function scoreComparableLabelForSurface(
  label: string | undefined,
  surface: PlacementSurface
): number {
  if (!label) {
    return 0;
  }

  const normalized = label.toLowerCase();
  return SURFACE_KEYWORDS[surface].reduce(
    (score, keyword) => score + (normalized.includes(keyword) ? 1 : 0),
    0
  );
}

export function getSurfaceBiasedComparablePool(
  summary: ImageBootstrapSelectionSummary,
  surface: PlacementSurface
): string[] {
  const ranked = [...summary.preferredComparableRefs]
    .map((ref, refIndex) => ({
      ref,
      score: scoreComparableLabelForSurface(ref.label, surface),
      fallbackDistance: refIndex
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.fallbackDistance - right.fallbackDistance;
    });

  const labels = ranked
    .map(entry => entry.ref.label)
    .filter((label): label is string => typeof label === 'string' && label.length > 0);

  if (labels.length <= 1) {
    return labels;
  }

  return labels.slice(0, 2);
}

export function getSurfaceBiasedComparableLabel(
  summary: ImageBootstrapSelectionSummary,
  surface: PlacementSurface,
  index: number
): string | undefined {
  const pool = getSurfaceBiasedComparablePool(summary, surface);
  if (pool.length === 0) {
    return undefined;
  }

  return pool[index % pool.length];
}
