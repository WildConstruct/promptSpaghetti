export interface EnhancedPreviewConfig {
    maxResults?: number;
    enableProfessionalMetadata?: boolean;
    enableAutoSave?: boolean;
    enableVarianceAnalysis?: boolean;
    seedStrategy?: 'random' | 'sequential' | 'custom';
    customSeeds?: number;
}
export interface VarianceAnalysis {
    wordCountVariance: number;
    lengthDistribution: {
        min: number;
        max: number;
        avg: number;
        std: number;
    };
    averageSimilarity: number;
    uniquenessScore: number;
    diversityIndex: number;
    contentTypes: Record<string, number>;
    detectedThemes: string;
    toneVariation: number;
    creativityScore: number;
    professionalSuitability: number;
    genreConsistency: number;
}
export interface PreviewPerformanceStats {
    totalExecutionTime: number;
    averageExecutionTime: number;
    fastestExecution: number;
    slowestExecution: number;
    throughput: number;
    failureRate: number;
    cacheHitRate?: number;
}
export declare const useEnhancedPreviewResultManagement: () => void;
//# sourceMappingURL=useEnhancedPreview.d.ts.map