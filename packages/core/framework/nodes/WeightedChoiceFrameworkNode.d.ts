/**
 * WeightedChoice Framework Node
 * Epic 18 - Implement Node Framework (E18-1753114562067-331CC8)
 *
 * Framework-integrated WeightedChoice node with enhanced lifecycle and monitoring
 */
import { FrameworkNode, NodeDefinition } from '../NodeFramework';
import { AdvancedNodeConfig, AdvancedExecutionContext } from '../../runtime/advanced';
export interface WeightedChoiceData {
    choices: string[];
    weights: number[];
    normalizeWeights?: boolean;
    seedOverride?: string;
}
/**
 * Framework-integrated WeightedChoice node
 */
export declare class WeightedChoiceFrameworkNode extends FrameworkNode {
    private data;
    private normalizedWeights;
    private totalWeight;
    constructor(id: string, config: AdvancedNodeConfig, data: WeightedChoiceData);
    getType(): string;
    getDefinition(): Partial<NodeDefinition>;
    protected onInitialize(): Promise<void>;
    protected executeNode(context: AdvancedExecutionContext): Promise<any>;
    protected onDestroy(): Promise<void>;
    protected getData(): WeightedChoiceData;
    /**
     * Update node data (framework-specific method)
     */
    updateData(newData: Partial<WeightedChoiceData>): void;
    /**
     * Get current choice statistics
     */
    getChoiceStatistics(): {
        totalChoices: number;
        totalWeight: number;
        averageWeight: number;
        choiceDistribution: Array<{
            choice: string;
            weight: number;
            normalizedWeight: number;
            percentage: number;
        }>;
    };
    /**
     * Simulate multiple selections for testing
     */
    simulate(iterations: number, seed?: number): {
        results: Record<string, number>;
        percentages: Record<string, number>;
        expectedVsActual: Array<{
            choice: string;
            expected: number;
            actual: number;
            deviation: number;
        }>;
    };
    private validateChoicesAndWeights;
    private calculateNormalizedWeights;
    private selectWeightedIndex;
    private createSeededRandom;
    private updatePerformanceMetrics;
    private estimateMemoryUsage;
}
export default WeightedChoiceFrameworkNode;
//# sourceMappingURL=WeightedChoiceFrameworkNode.d.ts.map