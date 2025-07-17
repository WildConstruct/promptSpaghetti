interface PreviewResult {
    seed: number;
    output?: string;
    error?: string;
    usedNodeIds?: string[];
    usedEdgeIds?: string[];
}
export declare const usePreviewSeeds: () => {
    loading: boolean;
    error: string | null;
    results: PreviewResult[];
    runPreview: (graph: unknown) => Promise<void>;
    cancelPreview: () => void;
};
export {};
//# sourceMappingURL=usePreviewSeeds.d.ts.map