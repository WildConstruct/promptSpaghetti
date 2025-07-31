import { AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeData, ValidationResult } from '../advanced';
/**
 * Weight distribution types for advanced weighted selection
 */
export type WeightDistributionType = 'linear' | 'exponential' | 'gaussian' | 'custom';
/**
 * A weighted choice with value and weight
 */

}
export interface WeightedChoice {
    value: string;
    weight: number;
/**
 * Configuration for weight distribution algorithms
 */

}
export interface WeightDistributionConfig {
    type: WeightDistributionType;
    /** Parameters for distribution (e.g., exponential factor, gaussian mean/std) */
    parameters?: Record<string, number>;
    /** Normalization settings */
    normalize?: boolean;
    /** Minimum weight threshold */
    minWeight?: number;
/**
 * Advanced weighted choice node with support for complex weight distributions
 * Extends basic WeightedChoice with:
 * - Multiple distribution algorithms (linear, exponential, gaussian, custom)
 * - Dynamic weight adjustment
 * - Performance optimization with caching
 * - Comprehensive validation
 */
export declare class WeightedAdvancedNode extends AdvancedRuntimeNode<string> {
    private ioHandler;
    private choices;
    private distributionConfig;
    constructor(id: string, choices?: WeightedChoice[], distributionConfig?: WeightDistributionConfig);
    /**
     * Execute weighted selection using advanced distribution algorithm
     */
    run(ctx: AdvancedExecutionContext): string;
    /**
     * Comprehensive validation of node configuration
     */
    validate(): ValidationResult;
    /**
     * Serialize node data for persistence
     */
    serialize(): AdvancedNodeData;
    /**
     * Get effective choices from constructor data or dynamic inputs
     */
    private getEffectiveChoices;
    /**
     * Apply the configured distribution algorithm to choice weights
     */
    private applyDistribution;
    /**
     * Linear distribution (no transformation - use original weights)
     */
    private applyLinearDistribution;
    /**
     * Exponential distribution - weights transformed by exponential function
     */
    private applyExponentialDistribution;
    /**
     * Gaussian distribution - weights adjusted based on normal distribution
     */
    private applyGaussianDistribution;
    /**
     * Custom distribution - apply user-defined transformation
     */
    private applyCustomDistribution;
    /**
     * Perform weighted selection from distributed weights using seeded random
     */
    private selectFromDistribution;
/**
 * Factory function for creating WeightedAdvanced nodes
 */
export declare function createWeightedAdvancedNode(id: string)
  choices: WeightedChoice[],
  distributionConfig?: WeightDistributionConfig
): WeightedAdvancedNode;
/**
 * Default distribution configurations for common use cases
 */
export declare const DistributionPresets: {
    linear: {
        type: "linear";
        normalize: true;
}
    };
    exponential: {
        type: "exponential";
        parameters: {
            factor: number;
        };
        normalize: true;
    };
    gaussian: {
        type: "gaussian";
        parameters: {
            mean: number;
            std: number;
        };
        normalize: true;
    };
    uniform: {
        type: "linear";
        normalize: true;
        minWeight: number;
    };
};
//# sourceMappingURL=WeightedAdvanced.d.ts.map