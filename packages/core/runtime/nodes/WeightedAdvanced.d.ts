import { AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeData, ValidationResult } from '../advanced';
export type WeightDistributionType = 'linear' | 'exponential' | 'gaussian' | 'custom';
export interface WeightedChoice {
    value: string;
    weight: number;
}
export interface WeightDistributionConfig {
    type: WeightDistributionType;
    parameters?: Record<string, number>;
    normalize?: boolean;
    minWeight?: number;
}
export declare class WeightedAdvancedNode extends AdvancedRuntimeNode<string> {
    private ioHandler;
    private choices;
    private distributionConfig;
    constructor(id: string, choices?: WeightedChoice[], distributionConfig?: WeightDistributionConfig);
    run(ctx: AdvancedExecutionContext): string;
    validate(): ValidationResult;
    serialize(): AdvancedNodeData;
    private getEffectiveChoices;
    private applyDistribution;
    private applyLinearDistribution;
    private applyExponentialDistribution;
    private applyGaussianDistribution;
    private applyCustomDistribution;
    private selectFromDistribution;
}
export declare function createWeightedAdvancedNode(id: string, choices: WeightedChoice[], distributionConfig?: WeightDistributionConfig): WeightedAdvancedNode;
export declare const DistributionPresets: {
    linear: {
        type: "linear";
        normalize: true;
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