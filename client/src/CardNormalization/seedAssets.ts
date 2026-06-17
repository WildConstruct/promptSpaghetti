import type { PsgAssetRef } from '@promptscape/core/services/psg';
import {
  recomputeDerived,
  type CardNormalization
} from '@promptscape/core/services/cardNormalization';
import { CARD_IMAGE_WIDTH, CARD_IMAGE_HEIGHT, FIGURE_PALETTES } from './figures';

/**
 * Seed card library for the normalization demo. These stand in for EraCrowd
 * render outputs (PsgAssetRef kind 'render-output') until that pipeline is
 * wired up. A few assets are intentionally un-normalized so the editor (and a
 * later Auto-solve) has something to correct.
 */

export interface SeedCard {
  asset: PsgAssetRef;
  paletteIndex: number;
}

const SEED_DATE = '2026-06-16T00:00:00.000Z';

function baseNormalization(assetId: string): CardNormalization {
  return {
    version: 'card-norm/1',
    assetId,
    imageWidth: CARD_IMAGE_WIDTH,
    imageHeight: CARD_IMAGE_HEIGHT,
    head: {
      centerX: 256,
      centerY: 104,
      width: 80,
      height: 88,
      rotation: 0,
      mode: 'visual-oval',
      includesHeadwear: true,
      confidence: 0.9
    },
    ground: {
      y: 720,
      angle: 0,
      leftContact: { x: 232, y: 720 },
      rightContact: { x: 280, y: 720 },
      supportWidth: 48,
      confidence: 0.92
    },
    pivot: { x: 256, y: 720, uv: { u: 0.5, v: 0.96 }, lockToGround: true },
    crop: {
      x: 64,
      y: 24,
      width: 384,
      height: 720,
      padding: { top: 6, right: 10, bottom: 2, left: 10 }
    },
    observedHeadCount: 7.5,
    canonicalHeadCount: 7.5,
    archetype: 'adult-male-racegoer',
    poseClass: 'standing-relaxed',
    targetHeightM: 1.75,
    confidence: { mask: 0.96, pose: 0.88, head: 0.9, ground: 0.92, overall: 0.91 },
    status: 'approved',
    updatedAt: SEED_DATE
  };
}

const VARIANTS: Array<(n: CardNormalization) => CardNormalization> = [
  n => ({ ...n, status: 'approved' }),
  n => ({
    ...n,
    head: { ...n.head, height: 76, width: 72, confidence: 0.72 },
    confidence: { ...n.confidence, head: 0.72 },
    status: 'unsolved'
  }),
  n => ({
    ...n,
    ground: {
      ...n.ground,
      angle: 3,
      rightContact: { x: 280, y: 727 },
      confidence: 0.8
    },
    confidence: { ...n.confidence, ground: 0.8 },
    status: 'edited'
  }),
  n => ({
    ...n,
    head: { ...n.head, centerX: 242, rotation: -4, confidence: 0.83 },
    pivot: { ...n.pivot, x: 240, uv: { u: 0.47, v: 0.96 } },
    confidence: { ...n.confidence, head: 0.83 },
    status: 'edited'
  })
];

function buildCard(index: number): SeedCard {
  const num = String(40 + index).padStart(3, '0');
  const assetId = `ICR_1960s_RG_${num}_A001`;
  const paletteIndex = index % FIGURE_PALETTES.length;
  const normalization = recomputeDerived(
    VARIANTS[index % VARIANTS.length](baseNormalization(assetId))
  );
  const asset: PsgAssetRef = {
    id: assetId,
    kind: 'render-output',
    role: 'crowd-card',
    storage: { provider: 'local', uri: `local://eracrowd/${assetId}.png` },
    provenance: { source: 'generated', vendor: 'EraCrowd' },
    tags: ['eracrowd', 'racegoer', '1960s'],
    metadata: { paletteIndex, normalization }
  };
  return { asset, paletteIndex };
}

export const SEED_CARDS: SeedCard[] = Array.from({ length: 12 }, (_, i) =>
  buildCard(i)
);

export const SEED_TOTAL = 842;
