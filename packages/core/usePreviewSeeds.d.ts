import { VarianceMetrics } from './services/VarianceAnalysisService';
interface PreviewResult {
    seed: number;
    output?: string;
    error?: string;
    usedNodeIds?: string[];
    usedEdgeIds?: string[];
    executionTimeMs?: number;
    executionPath?: {
        steps: unknown[];
        randomizationPoints: unknown[];
    };
    weightChoices?: Array<{
        nodeId: string;
        selectedOption: unknown;
        availableOptions: unknown[];
        weights?: number[];
        selectionProbability?: number;
    }>;
    locked?: boolean;
    lockedAt?: number;
    lockedNote?: string;
}
export declare const usePreviewSeeds: () => {
    loading: boolean;
    error: string | null;
    results: PreviewResult[];
    runPreview: (graph: unknown, specificSeed?: number, resultIndex?: number) => Promise<void>;
    cancelPreview: () => void;
    performanceStats: {
        totalTime: number;
        averageTime: number;
    } | null;
    aggregateError: string | null;
    lockedResults: number[];
    regeneratingResults: number[];
    lockResult: (index: number, note?: string) => void;
    unlockResult: (index: number) => void;
    regenerateResult: (index: number) => Promise<void>;
    varianceMetrics: VarianceMetrics | null;
};
export {};
//# sourceMappingURL=usePreviewSeeds.d.ts.map