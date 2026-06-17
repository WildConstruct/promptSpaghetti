import {
  groundYAt,
  recomputeDerived,
  getArchetypeOrDefault,
  type CardNormalization
} from '@promptscape/core/services/cardNormalization';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * Recompute every dependent field after a geometry edit: ground contacts follow
 * the tilted plane, the pivot locks to the ground and re-derives its UV inside
 * the crop, and the core helper refreshes head count + overall confidence.
 */
export function finalize(n: CardNormalization): CardNormalization {
  const leftContact = {
    x: n.ground.leftContact.x,
    y: groundYAt(n.ground, n.ground.leftContact.x)
  };
  const rightContact = {
    x: n.ground.rightContact.x,
    y: groundYAt(n.ground, n.ground.rightContact.x)
  };
  const ground = {
    ...n.ground,
    leftContact,
    rightContact,
    supportWidth: Math.abs(rightContact.x - leftContact.x)
  };
  const py = n.pivot.lockToGround ? groundYAt(ground, n.pivot.x) : n.pivot.y;
  const pivot = {
    ...n.pivot,
    y: py,
    uv: {
      u: clamp((n.pivot.x - n.crop.x) / n.crop.width, 0, 1),
      v: clamp((py - n.crop.y) / n.crop.height, 0, 1)
    }
  };
  return recomputeDerived({ ...n, ground, pivot });
}

/** Apply a new archetype: adopt its canonical head count target. */
export function applyArchetype(
  n: CardNormalization,
  archetypeId: string
): CardNormalization {
  const spec = getArchetypeOrDefault(archetypeId);
  return finalize({
    ...n,
    archetype: spec.id,
    canonicalHeadCount: spec.canonicalHeadCount,
    targetHeightM: spec.targetHeightM
  });
}

/**
 * Heuristic auto-solve (placeholder until the M4 vision backend): size the head
 * so the observed count hits the archetype canonical, level the ground, center
 * the figure and pivot, zero rotation, and raise confidence.
 */
export function heuristicSolve(n: CardNormalization): CardNormalization {
  const canonical = n.canonicalHeadCount;
  const centerX = n.imageWidth / 2;
  // Keep the head near the top of the figure (where heads actually sit), then
  // size it so the figure reads exactly `canonical` heads down to the ground,
  // re-centre, and level. Clamping head-top to the upper region snaps a head
  // that was dragged too far down back into place.
  const headTop = clamp(n.head.centerY - n.head.height / 2, 16, n.ground.y * 0.28);
  const targetHeight = clamp((n.ground.y - headTop) / canonical, 40, 220);
  const ratio = targetHeight / n.head.height;
  const head = {
    ...n.head,
    centerX,
    height: targetHeight,
    width: n.head.width * ratio,
    centerY: headTop + targetHeight / 2,
    rotation: 0,
    confidence: 0.97
  };
  const ground = {
    ...n.ground,
    angle: 0,
    confidence: 0.97
  };
  const pivot = { ...n.pivot, x: centerX };
  return finalize({
    ...n,
    head,
    ground,
    pivot,
    status: 'auto',
    confidence: { ...n.confidence, head: 0.97, ground: 0.97 }
  });
}
