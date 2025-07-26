import seedrandom from 'seedrandom';
/**
 * Returns a deterministic pseudo-random number generator initialised with the provided seed.
 * Usage:
 *   const rng = createRNG('123');
 *   const value = rng(); // 0 ≤ value < 1
 */
export declare function createRNG(seed: string | number): seedrandom.prng;
//# sourceMappingURL=seedUtils.d.ts.map