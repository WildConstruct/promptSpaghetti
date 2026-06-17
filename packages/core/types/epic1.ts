export interface WeightedOption {
  id: string;
  text: string;
  weight: number;
  color?: string;
  hasBranch?: boolean;
  /**
   * "Fixed DNA": when set, this option is always selected, bypassing weighted
   * randomness. At most one option per node should be locked.
   */
  locked?: boolean;
}

/**
 * Optional weight-reshaping applied to a WeightedChoice before selection.
 * Absent or `linear` == the historical flat-proportional behavior (no change).
 * Mined from the parked `WeightedAdvanced` tier — see
 * docs/parked-implementations/README.md.
 */
export type WeightDistributionType = 'linear' | 'exponential' | 'gaussian';

export interface WeightDistribution {
  type: WeightDistributionType;
  /**
   * - exponential: `factor` (default 2). >1 sharpens toward heavy options, <1 flattens.
   * - gaussian: `mean` (default 0.5) / `std` (default 0.2). Biases by option POSITION.
   */
  parameters?: { factor?: number; mean?: number; std?: number };
  /** Optional floor applied to each weight after the transform. */
  minWeight?: number;
}
