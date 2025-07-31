/**
 * useDebounce hook for Epic 8.5 Task 6: Real-Time Weight Integration
 * Provides debounced execution to prevent excessive preview regeneration
 * when weight controls change rapidly.
 */
export declare function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number): T;
/**
 * useWeightChangeDebounce - Specialized debounce for weight control changes
 * Epic 8.5 Task 6: Optimized for preview system integration
 */
export declare function useWeightChangeDebounce(
  onWeightChange: (weights: any[]) => void,
  delay?: number
): (newWeights: any[]) => void;
//# sourceMappingURL=useDebounce.d.ts.map
