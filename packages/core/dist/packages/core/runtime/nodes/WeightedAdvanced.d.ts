import { AdvancedRuntimeNode, AdvancedNodeConfig } from '../advanced';
/**
 * Weight distribution types for advanced weighted selection
 */
export type WeightDistributionType = 'linear' | 'exponential' | 'gaussian' | 'custom';
/**
 * A weighted choice with value and weight
 */
export interface WeightedChoice {
    value: string;
    weight: number;
}
export interface WeightDistributionConfig {
    type: WeightDistributionType;
    /** Parameters for distribution (e.g., exponential factor, gaussian mean/std) */
    parameters?: Record<string, number>;
    /** Normalization settings */
    normalize?: boolean;
    /** Minimum weight threshold */
    minWeight?: number;
}
export declare class WeightedAdvancedNode extends AdvancedRuntimeNode<string> {
    private ioHandler;
    private choices;
    private distributionConfig;
    constructor();
    id: string;
    choices: WeightedChoice;
    distributionConfig: WeightDistributionConfig;
    const config: AdvancedNodeConfig;
    id: 'weights';
    label: 'Choice Weights';
    dataType: 'numberArray';
    required: false;
    defaultValue: [];
    constraints: {
        min: 0;
        customValidator: (weights: number) => {
            if(weights: any, some: any): any;
            (w: any, w: any, : any, : any): any;
        };
    };
}
//# sourceMappingURL=WeightedAdvanced.d.ts.map