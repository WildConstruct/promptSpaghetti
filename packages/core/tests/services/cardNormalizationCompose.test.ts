import {
  composeCard,
  composeScene,
  figureHeightPx,
  toScenePlacements,
  recomputeDerived,
  type CardNormalization,
  type SceneLayout
} from '../../services/cardNormalization/index';

function card(
  assetId: string,
  headHeight: number,
  overrides: Partial<CardNormalization> = {}
): CardNormalization {
  const headWidth = headHeight * 0.9;
  return recomputeDerived({
    version: 'card-norm/1',
    assetId,
    imageWidth: 512,
    imageHeight: 768,
    head: {
      centerX: 256,
      centerY: 40 + headHeight / 2,
      width: headWidth,
      height: headHeight,
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
      confidence: 0.9
    },
    pivot: { x: 256, y: 720, uv: { u: 0.5, v: 0.96 }, lockToGround: true },
    crop: { x: 64, y: 24, width: 384, height: 720, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    observedHeadCount: 0,
    canonicalHeadCount: 7.5,
    archetype: 'adult-male-racegoer',
    poseClass: 'standing-relaxed',
    targetHeightM: 1.75,
    confidence: { mask: 0.9, pose: 0.9, head: 0.9, ground: 0.9, overall: 0.9 },
    status: 'approved',
    updatedAt: '2026-06-16T00:00:00.000Z',
    ...overrides
  });
}

const LAYOUT: SceneLayout = {
  width: 1920,
  height: 1080,
  groundY: 980,
  targetHeadPx: 120
};

describe('scene composition (the normalization payoff)', () => {
  it('renders cards with different head units at the SAME on-screen head height', () => {
    const big = composeCard({ normalization: card('big', 96), centerX: 400 }, LAYOUT);
    const small = composeCard({ normalization: card('small', 60), centerX: 800 }, LAYOUT);
    expect(big.headHeightPx).toBeCloseTo(120, 5);
    expect(small.headHeightPx).toBeCloseTo(120, 5);
    // different source head sizes → different scales to reach the same target
    expect(big.scale).not.toBeCloseTo(small.scale, 3);
  });

  it('plants every pivot on the ground line at its requested x', () => {
    const inst = { normalization: card('c', 88), centerX: 640 };
    const c = composeCard(inst, LAYOUT);
    // pivot maps to (centerX, groundY)
    expect(c.drawX + inst.normalization.pivot.x * c.scale).toBeCloseTo(640, 5);
    expect(c.footY).toBe(980);
    expect(c.drawY + inst.normalization.pivot.y * c.scale).toBeCloseTo(980, 5);
  });

  it('uses real-world scale when metresPerPixel + targetHeightM are given', () => {
    const mpp = 0.01; // 1px = 1cm → 1.75m figure = 175px tall
    const n = card('rw', 88);
    const c = composeCard(
      { normalization: n, centerX: 100 },
      { width: 800, height: 600, groundY: 560, metresPerPixel: mpp }
    );
    const onScreenFigure = c.footY - c.headTopY;
    expect(onScreenFigure).toBeCloseTo(1.75 / mpp, 4);
  });

  it('applies depth scaling for crowd perspective', () => {
    const near = composeCard({ normalization: card('n', 88), centerX: 100, depthScale: 1 }, LAYOUT);
    const far = composeCard({ normalization: card('f', 88), centerX: 700, depthScale: 0.5 }, LAYOUT);
    expect(far.headHeightPx).toBeCloseTo(near.headHeightPx / 2, 5);
  });

  it('figureHeightPx measures head-top to ground in source space', () => {
    const n = card('m', 80); // headTop = 40, ground = 720
    expect(figureHeightPx(n)).toBeCloseTo(680, 5);
  });

  it('maps to PSG scene placements with positive scale', () => {
    const placements = toScenePlacements(
      [{ normalization: card('p', 88), centerX: 300 }],
      LAYOUT
    );
    expect(placements).toHaveLength(1);
    expect(placements[0]).toMatchObject({ assetId: 'p', x: 300, y: 980 });
    expect(placements[0].scale).toBeGreaterThan(0);
  });

  it('composeScene maps every instance', () => {
    const out = composeScene(
      [
        { normalization: card('a', 70), centerX: 100 },
        { normalization: card('b', 90), centerX: 200 }
      ],
      LAYOUT
    );
    expect(out.map(c => c.assetId)).toEqual(['a', 'b']);
    out.forEach(c => expect(c.headHeightPx).toBeCloseTo(120, 5));
  });
});
