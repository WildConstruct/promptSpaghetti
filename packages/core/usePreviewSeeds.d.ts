interface PreviewResult {
    seed: number;
    output?: string;
    error?: string;
    usedNodeIds?: string[];
    usedEdgeIds?: string[];
    executionTimeMs?: number;
    executionPath?: any;
    weightChoices?: Array<{
        nodeId: string;
        selectedOption: any;
        availableOptions: any[];
        weights?: number[];
        selectionProbability?: number;
    }>;
}
export declare const usePreviewSeeds: () => {
    loading: boolean;
    error: string | null;
    results: PreviewResult[];
    runPreview: (graph: unknown) => Promise<void>;
    cancelPreview: () => void;
    performanceStats: {
        totalTime: number;
        averageTime: number;
    } | null;
    aggregateError: string | null;
};
export {};
//# sourceMappingURL=usePreviewSeeds.d.ts.map