import { createRNG } from '../seedUtils';

describe('createRNG', () => {
  it('returns deterministic numbers for same seed', () => {
    const rng1 = createRNG('hello');
    const rng2 = createRNG('hello');

    // generate several numbers to ensure sequence matches
    for (let i = 0; i < 5; i++) {
      expect(rng1()).toBeCloseTo(rng2());

  });

  it('returns different sequences for different seeds', () => {
    const rng1 = createRNG('a');
    const rng2 = createRNG('b');

    // it's extremely unlikely first value matches
    expect(rng1()).not.toBeCloseTo(rng2());
  });

  it('values are within [0,1)', () => {
    const rng = createRNG(123);
    const value = rng();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });
});
