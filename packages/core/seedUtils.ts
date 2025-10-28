// packages/core/seedUtils.ts

import seedrandom, { type PRNG } from 'seedrandom';

/**
 * Returns a deterministic pseudo-random number generator initialised with the provided seed.
 *
 * Usage:
 * ```ts
 * const rng = createRNG('123');
 * const value = rng(); // 0 ≤ value < 1
 * ```
 */
export type RNG = PRNG;

export function createRNG(seed: string | number): RNG {
  return seedrandom(String(seed));
}
