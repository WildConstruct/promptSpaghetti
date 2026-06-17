import type { PsgAssetRef } from '@promptscape/core/services/psg';
import {
  recomputeDerived,
  type CardNormalization
} from '@promptscape/core/services/cardNormalization';
import {
  CARD_IMAGE_WIDTH,
  CARD_IMAGE_HEIGHT,
  FIGURE_PALETTES,
  FIGURE_HEAD_TOP,
  FIGURE_HEAD_UNIT,
  figureFeetY
} from './figures';

/**
 * Seed card library for the normalization demo. These stand in for EraCrowd
 * render outputs (PsgAssetRef kind 'render-output') until that pipeline is
 * wired up. Each card is a person of a DIFFERENT real height (different head
 * count) — that's the whole point: the head is a fixed-size ruler, so head
 * count extrapolates to real height. A few cards are intentionally mis-measured
 * so the editor (and a later Auto-solve) has something to correct.
 */

export interface SeedCard {
  asset: PsgAssetRef;
  paletteIndex: number;
  /** True rendered height of the figure, in head units. */
  heads: number;
  /** Real image (data URL) for imported cards; absent → drawn placeholder. */
  imageUri?: string;
}

const SEED_DATE = '2026-06-16T00:00:00.000Z';

// Varied real heights (head units). ~6.8–8.1 ≈ 1.59–1.89 m for this archetype.
const HEADS = [7.5, 8.0, 7.1, 7.85, 6.85, 7.35, 7.95, 7.0, 8.05, 7.6, 6.95, 7.7];

function baseNormalization(assetId: string, heads: number): CardNormalization {
  const headTop = FIGURE_HEAD_TOP;
  const groundY = figureFeetY(heads);
  return {
    version: 'card-norm/1',
    assetId,
    imageWidth: CARD_IMAGE_WIDTH,
    imageHeight: CARD_IMAGE_HEIGHT,
    head: {
      centerX: 256,
      centerY: headTop + FIGURE_HEAD_UNIT / 2,
      width: 80,
      height: FIGURE_HEAD_UNIT,
      rotation: 0,
      mode: 'visual-oval',
      includesHeadwear: true,
      confidence: 0.9
    },
    ground: {
      y: groundY,
      angle: 0,
      leftContact: { x: 232, y: groundY },
      rightContact: { x: 280, y: groundY },
      supportWidth: 48,
      confidence: 0.92
    },
    pivot: { x: 256, y: groundY, uv: { u: 0.5, v: 0.96 }, lockToGround: true },
    crop: {
      x: 64,
      y: 24,
      width: 384,
      height: 720,
      padding: { top: 6, right: 10, bottom: 2, left: 10 }
    },
    observedHeadCount: heads,
    canonicalHeadCount: 7.5,
    archetype: 'adult-male-racegoer',
    poseClass: 'standing-relaxed',
    targetHeightM: 1.75,
    confidence: { mask: 0.96, pose: 0.88, head: 0.9, ground: 0.92, overall: 0.91 },
    status: 'approved',
    updatedAt: SEED_DATE
  };
}

// Some cards arrive mis-measured (head box off, ground off) so there's work to do.
const VARIANTS: Array<(n: CardNormalization) => CardNormalization> = [
  n => ({ ...n, status: 'approved' }),
  n => ({
    ...n,
    head: { ...n.head, height: n.head.height * 0.86, width: n.head.width * 0.86, confidence: 0.72 },
    confidence: { ...n.confidence, head: 0.72 },
    status: 'unsolved'
  }),
  n => ({
    ...n,
    ground: { ...n.ground, y: n.ground.y - 26, angle: 3, confidence: 0.8 },
    confidence: { ...n.confidence, ground: 0.8 },
    status: 'edited'
  }),
  n => ({
    ...n,
    head: { ...n.head, centerX: 242, rotation: -4, confidence: 0.83 },
    pivot: { ...n.pivot, x: 240 },
    confidence: { ...n.confidence, head: 0.83 },
    status: 'edited'
  })
];

/**
 * Real EraCrowd test renders served from client/public/eracrowd/. The canvas
 * draws these in place of the vector placeholder; the overlay geometry seeds a
 * roughly-right head/ground that the operator fine-tunes live.
 */
const DEMO_IMAGE_COUNT = 14;

function buildCard(index: number): SeedCard {
  const num = String(40 + index).padStart(3, '0');
  const assetId = `ICR_1960s_RG_${num}_A001`;
  const paletteIndex = index % FIGURE_PALETTES.length;
  const heads = HEADS[index % HEADS.length];
  const normalization = recomputeDerived(
    VARIANTS[index % VARIANTS.length](baseNormalization(assetId, heads))
  );
  const imageUri =
    index < DEMO_IMAGE_COUNT
      ? `/eracrowd/card-${String(index + 1).padStart(2, '0')}.png`
      : undefined;
  const asset: PsgAssetRef = {
    id: assetId,
    kind: 'render-output',
    role: 'crowd-card',
    storage: {
      provider: 'local',
      uri: imageUri ?? `local://eracrowd/${assetId}.png`
    },
    provenance: { source: 'generated', vendor: 'EraCrowd' },
    tags: ['eracrowd', 'racegoer', '1960s'],
    metadata: { paletteIndex, heads, normalization }
  };
  return { asset, paletteIndex, heads, imageUri };
}

export const SEED_CARDS: SeedCard[] = Array.from(
  { length: DEMO_IMAGE_COUNT },
  (_, i) => buildCard(i)
);

export const SEED_TOTAL = 842;
