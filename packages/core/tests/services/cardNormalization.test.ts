import type { PsgAssetRef } from '../../services/psg/contracts';
import {
  CardNormalizationSchema,
  type CardNormalization,
  computeObservedHeadCount,
  computeOverallConfidence,
  groundYAt,
  isHeadCountInRange,
  recomputeDerived,
  readNormalization,
  writeNormalization,
  isAssetApproved,
  getArchetype,
  getArchetypeOrDefault,
  CONFIDENCE_WEIGHTS
} from '../../services/cardNormalization/index';

function makeNormalization(
  overrides: Partial<CardNormalization> = {}
): CardNormalization {
  const base: CardNormalization = {
    version: 'card-norm/1',
    assetId: 'ICR_1960s_RG_042',
    imageWidth: 512,
    imageHeight: 768,
    head: {
      centerX: 270,
      centerY: 72,
      width: 58,
      height: 64,
      rotation: 0,
      mode: 'visual-oval',
      includesHeadwear: true,
      confidence: 0.91
    },
    ground: {
      y: 515,
      angle: 0,
      leftContact: { x: 246, y: 515 },
      rightContact: { x: 294, y: 515 },
      supportWidth: 48,
      confidence: 0.96
    },
    pivot: {
      x: 270,
      y: 515,
      uv: { u: 0.5, v: 0.98 },
      lockToGround: true
    },
    crop: {
      x: 96,
      y: 24,
      width: 416,
      height: 536,
      padding: { top: 6, right: 10, bottom: 2, left: 10 }
    },
    observedHeadCount: 7.42,
    canonicalHeadCount: 7.5,
    archetype: 'adult-male-racegoer',
    poseClass: 'standing-relaxed',
    targetHeightM: 1.75,
    confidence: { mask: 0.98, pose: 0.88, head: 0.91, ground: 0.96, overall: 0.93 },
    status: 'approved',
    updatedAt: '2026-06-16T00:00:00.000Z'
  };
  return { ...base, ...overrides };
}

function makeAsset(overrides: Partial<PsgAssetRef> = {}): PsgAssetRef {
  return {
    id: 'ICR_1960s_RG_042',
    kind: 'render-output',
    storage: { provider: 'local', uri: 'file://ICR_1960s_RG_042.png' },
    provenance: { source: 'generated' },
    ...overrides
  };
}

describe('cardNormalization contracts', () => {
  it('validates a well-formed record and applies defaults', () => {
    const parsed = CardNormalizationSchema.parse(makeNormalization());
    expect(parsed.head.mode).toBe('visual-oval');
    expect(parsed.canonicalHeadCount).toBe(7.5);
    expect(parsed.version).toBe('card-norm/1');
  });

  it('rejects a non-positive head height', () => {
    const bad = makeNormalization({
      head: { ...makeNormalization().head, height: 0 }
    });
    expect(CardNormalizationSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects unknown extra keys (strict)', () => {
    const bad = { ...makeNormalization(), surprise: true } as unknown;
    expect(CardNormalizationSchema.safeParse(bad).success).toBe(false);
  });
});

describe('geometry helpers', () => {
  it('measures observed head count from head top to ground (level plane)', () => {
    const n = makeNormalization();
    expect(computeObservedHeadCount(n.head, n.ground)).toBeCloseTo(7.42, 2);
  });

  it('returns 0 head count when head height is degenerate', () => {
    const n = makeNormalization();
    expect(computeObservedHeadCount({ ...n.head, height: 0 }, n.ground)).toBe(0);
  });

  it('accounts for ground tilt in groundYAt', () => {
    const n = makeNormalization({
      ground: {
        ...makeNormalization().ground,
        angle: 45,
        leftContact: { x: 240, y: 515 },
        rightContact: { x: 300, y: 515 }
      }
    });
    expect(groundYAt(n.ground, 370)).toBeCloseTo(615, 5);
    expect(groundYAt(n.ground, 270)).toBeCloseTo(515, 5);
  });

  it('rolls up overall confidence by the documented weights', () => {
    const c = { mask: 1, pose: 0, head: 0, ground: 0 };
    expect(computeOverallConfidence(c)).toBeCloseTo(CONFIDENCE_WEIGHTS.mask, 6);
    const full = { mask: 0.98, pose: 0.88, head: 0.91, ground: 0.96 };
    expect(computeOverallConfidence(full)).toBeCloseTo(
      0.98 * 0.25 + 0.88 * 0.2 + 0.91 * 0.25 + 0.96 * 0.3,
      6
    );
  });

  it('recomputes derived fields from geometry', () => {
    const n = makeNormalization({ observedHeadCount: 0 });
    const out = recomputeDerived(n);
    expect(out.observedHeadCount).toBeCloseTo(7.42, 2);
    expect(out.confidence.overall).toBeCloseTo(
      computeOverallConfidence(n.confidence),
      6
    );
  });
});

describe('archetypes', () => {
  it('looks up known archetypes and falls back to default', () => {
    expect(getArchetype('adult-male-racegoer')?.canonicalHeadCount).toBe(7.5);
    expect(getArchetype('nope')).toBeUndefined();
    expect(getArchetypeOrDefault('nope').id).toBe('adult-male-racegoer');
  });

  it('checks observed head count against the archetype range', () => {
    expect(isHeadCountInRange(7.42, 'adult-male-racegoer')).toBe(true);
    expect(isHeadCountInRange(9.0, 'adult-male-racegoer')).toBe(false);
    expect(isHeadCountInRange(6.0, 'child')).toBe(true);
  });
});

describe('persistence accessors', () => {
  it('round-trips through PsgAssetRef.metadata without mutating the input', () => {
    const asset = makeAsset();
    const n = makeNormalization();
    const next = writeNormalization(asset, n);

    expect(asset.metadata).toBeUndefined();
    expect(next).not.toBe(asset);
    const read = readNormalization(next);
    expect(read?.assetId).toBe('ICR_1960s_RG_042');
    expect(read?.observedHeadCount).toBeCloseTo(7.42, 2);
    expect(isAssetApproved(next)).toBe(true);
  });

  it('returns null when normalization is absent or invalid', () => {
    expect(readNormalization(makeAsset())).toBeNull();
    expect(
      readNormalization(makeAsset({ metadata: { normalization: { bogus: 1 } } }))
    ).toBeNull();
  });

  it('preserves other metadata keys when writing', () => {
    const asset = makeAsset({ metadata: { keepMe: 'yes' } });
    const next = writeNormalization(asset, makeNormalization());
    expect(next.metadata?.keepMe).toBe('yes');
    expect(readNormalization(next)).not.toBeNull();
  });
});
