/**
 * Weight-distribution transforms for WeightedChoice selection.
 *
 * Ported (and de-rotted) from the parked `WeightedAdvanced` tier so the live,
 * canonical WeightedChoiceNode can offer distribution-aware selection without
 * resurrecting the old `AdvancedRuntimeNode` runtime.
 * See docs/parked-implementations/README.md.
 *
 * Pure + deterministic: given options + a distribution it returns a new options
 * array with reshaped weights. It does NOT select — the caller's existing seeded
 * cumulative pick runs on the result. A `linear`/absent distribution is the
 * identity, so existing graphs are byte-for-byte unchanged.
 */

import type { WeightedOption, WeightDistribution } from '../../../types/epic1';

/**
 * Return `options` with each weight reshaped by `distribution`.
 * Text/id/order are preserved; only `weight` changes.
 */
export function applyWeightDistribution(
  options: WeightedOption[],
  distribution?: WeightDistribution
): WeightedOption[] {
  // Identity fast-path — preserves historical behavior exactly.
  if (!distribution || distribution.type === 'linear') {
    return options;
  }

  const { type, parameters = {}, minWeight = 0 } = distribution;
  let reshaped: WeightedOption[];

  switch (type) {
    case 'exponential': {
      const factor = parameters.factor ?? 2;
      reshaped = options.map(option => ({
        ...option,
        weight: Math.pow(Math.max(0, option.weight), factor)
      }));
      break;
    }

    case 'gaussian': {
      // NOTE: biases by option POSITION in the list, not by weight magnitude.
      // Faithful to the parked design; semantics flagged for product review.
      const mean = parameters.mean ?? 0.5;
      const std = parameters.std ?? 0.2;
      const denominator = options.length - 1 || 1;
      reshaped = options.map((option, index) => {
        const x = index / denominator; // normalized position in [0, 1]
        const gaussian = Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
        return { ...option, weight: option.weight * gaussian };
      });
      break;
    }

    default:
      return options;
  }

  if (minWeight > 0) {
    reshaped = reshaped.map(option => ({
      ...option,
      weight: Math.max(option.weight, minWeight)
    }));
  }

  return reshaped;
}
