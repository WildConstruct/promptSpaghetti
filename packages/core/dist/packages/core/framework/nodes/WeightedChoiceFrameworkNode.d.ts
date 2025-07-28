/**
 * WeightedChoice Framework Node
 * Epic 18 - Implement Node Framework (E18-1753114562067-331CC8)
 *
 * Framework-integrated WeightedChoice node with enhanced lifecycle and monitoring
 */
import { FrameworkNode } from '../NodeFramework';
import { AdvancedNodeConfig } from '../../runtime/advanced';
export interface WeightedChoiceData {
    choices: string;
    weights: number;
    normalizeWeights?: boolean;
    seedOverride?: string;
}
export declare class WeightedChoiceFrameworkNode extends FrameworkNode {
    private data;
    private normalizedWeights;
    private totalWeight;
    constructor(id: string, config: AdvancedNodeConfig, data: WeightedChoiceData);
}
//# sourceMappingURL=WeightedChoiceFrameworkNode.d.ts.map