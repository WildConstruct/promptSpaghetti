import { 
  VFXExportFormat,
  VFXExporter,
  VFXExportOptions,
  VFXValidationResult,
  VFXPromptVariant
} from '../types/VFXExport';
import { Node, Edge } from 'reactflow';
export declare class WildConstructVFXExporter implements VFXExporter {
    private static instance;
    private exportHistory;
    static getInstance(): WildConstructVFXExporter;
    /**
     * Export graph to VFX-ready format
     */
    exportGraph(graph: {)
        nodes: Node[];
        edges: Edge[];
    }, executionResults?: {
        finalPrompt: string;
        variables: Record<string, string>;
        executionTime: number;
        nodePerformance?: Record<string, number>;
        variants?: VFXPromptVariant[];
    }, options?: VFXExportOptions): Promise<VFXExportFormat>;
    private buildMetadata;
    private buildPromptData;
    private analyzePromptComponents;
    private extractByCategory;
    private buildVariableData;
    private generateVariableAlternatives;
    private generateNegativePrompt;
    private buildGraphStructure;
    private categorizeNode;
    private getNodePurpose;
    private getNodeDependencies;
    private getNodeTargets;
    private calculateCriticalPath;
    private analyzeComplexity;
    private calculateVariabilityScore;
    private calculateDeterminismScore;
    private calculatePerformanceScore;
    private buildExecutionData;
    private buildNodePerformance;
    private buildExtensions;
    private buildRenderingData;
    private extractNumberFromVariables;
    private extractFromVariables;
    private calculateAspectRatio;
    /**
     * Validate export data with enhanced reproducibility checks
     */
    validateExport(exportData: VFXExportFormat): VFXValidationResult;
    /**
     * Generate human-readable documentation
     */
    generateDocumentation(exportData: VFXExportFormat): string;
    private generateExportId;
    private generateProjectId;
    /**
     * Get export history for debugging
     */
    getExportHistory(): VFXExportFormat[];
    /**
     * Clear export history
     */
    clearHistory(): void;
    /**
     * Build complete reproducibility data for exact reconstruction
     */
    private buildReproducibilityData;
    /**
     * Serialize RNG state for reproducibility
     */
    private serializeRngState;
    /**
     * Generate deterministic hash for reproducibility validation
     */
    private generateHash;
    /**
     * Validate reproducibility of an export
     */
    validateReproducibility(exportData: VFXExportFormat): {
        canReproduce: boolean;
        confidence: 'exact' | 'approximate' | 'uncertain';
        issues: string[];
        requirements: string[];
    };
    /**
     * Reproduce execution from VFX export data
     */
    reproduceFromExport(exportData: VFXExportFormat, graph?: {)
        nodes: Node[];
        edges: Edge[];
    }): Promise<{
        success: boolean;
        reproductionResult?: {
            finalPrompt: string;
            variables: Record<string, string>;
            executionTime: number;
            matchesOriginal: boolean;
        };
        error?: string;
    }>;
    /**
     * Preserve complete node configuration including all weight settings
     */
    private preserveNodeConfiguration;
    /**
     * Calculate weight distribution for WeightedChoice analysis
     */
    private calculateWeightDistribution;
    /**
     * Normalize weights to sum to 1.0
     */
    private normalizeWeights;
}
export declare export declare //# sourceMappingURL=VFXExporter.d.ts.map