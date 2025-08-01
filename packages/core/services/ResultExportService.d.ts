/**
 * Result Export Service
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 4: Result Export System
 *
 * Handles individual and batch export of preview results with comprehensive
 * format support and metadata inclusion.
 */
import { PreviewResultWithPath } from '../types/ExecutionPath';
import { ExportResult } from '../../../server/src/exporter';

}
}
export interface ResultExportOptions { format: ExportFormat;
    includeMetadata: boolean;
    includeExecutionPaths: boolean;
    includeDebugInfo: boolean;
    filename?: string;
    filmOptions?: {
        includeDirectorNotes?: boolean;
        sceneNumbering?: boolean;
        shotBreakdown?: boolean;
        timingNotes?: boolean }
}
    };
    vfxOptions?: { controlNetCompatible?: boolean;
        sceneDataIntegration?: boolean;
        cameraMetadata?: boolean;
        lightingData?: boolean };
    analysisOptions?: { varianceAnalysis?: boolean;
        performanceBreakdown?: boolean;
        creativityMetrics?: boolean;
        comparisonMatrix?: boolean };

export type ExportFormat = 'plain-text' | 'json-simple' | 'json-complete' | 'csv-analysis' | 'fountain-script' | 'final-draft' | 'controlnet-json' | 'stable-diffusion' | 'professional-report' | 'creative-brief' | 'mars-framework' | 'zada-natural' | 'hybrid-prompting' | 'execution-timeline' | 'variance-report' | 'batch-summary';

}
}
export interface IndividualExportData { result: PreviewResultWithPath;
    index: number;
    totalResults: number;
    exportedAt: string;
    sourceGraph?: any }
}
}
export interface BatchExportData { results: PreviewResultWithPath[];
    selectedIndices: number[];
    aggregateStats: {
        totalResults: number;
        averageExecutionTime: number;
        uniqueSeeds: number[];
        varianceScore: number;
        commonElements: string[] }
}
    };
    exportedAt: string;
    sourceGraph?: any;

export declare class ResultExportService { /**
     * Export a single preview result in the specified format
     */
    exportIndividualResult();
      result: PreviewResultWithPath,
      resultIndex: number,
      totalResults: number,
      options: ResultExportOptions,
      sourceGraph?: any
    ): Promise<ExportResult>;
    /**
     * Export multiple selected results as a batch
     */
    exportBatchResults();
      results: PreviewResultWithPath[]
      selectedIndices: number[]
      options: ResultExportOptions
      sourceGraph?: any
    ): Promise<ExportResult>;
    /**
     * Export all results with comparison analysis
     */
    exportComparison();
      results: PreviewResultWithPath[]
      options: ResultExportOptions }
      sourceGraph?: any
    ): Promise<ExportResult>;
    /**
     * Get available export formats with descriptions
     */
    getAvailableFormats(): Array<{ format: ExportFormat;
        name: string;
        description: string;
        category: 'text' | 'data' | 'film' | 'vfx' | 'analysis';
        supportsIndividual: boolean;
        supportsBatch: boolean }>;
    /**
     * Validate export options for the given format
     */
    validateExportOptions(format: ExportFormat, options: ResultExportOptions): string[];
    /**
     * Estimate export size for UI feedback
     */
    estimateExportSize(results: PreviewResultWithPath[], format: ExportFormat, options: ResultExportOptions): { estimatedSize: number;
        unit: 'KB' | 'MB';
        warning?: string };
    /**
     * Private helper methods
     */
    private performExport;
    private mapToExistingFormat;
    private transformDataForExport;
    private transformOptionsForExport;
    private handleCustomExport;
    private exportPlainText;
    private exportExecutionTimeline;
    private exportVarianceReport;
    private exportBatchSummary;
    private generateFilename;
    private getFileExtension;
    private calculateAggregateStats;
    private calculateVarianceScore;
    private findCommonElements;
    private generateComparisonAnalysis;
    private getExecutionTimeSpread;
    private analyzeRandomization;
    private extractMetadata;
    private extractExecutionPaths;
    private extractDebugInfo;
    private transformVFXData;
    private generateAnalysis;
    private analyzeVarianceDistribution;
    private calculateVocabularyDiversity;
    private buildExecutionTimeline;
    private generateVarianceAnalysis;
    private findUniqueElements;
    private generateVarianceRecommendations;
    private generateBatchBreakdown;
    private groupByExecutionTime;
    private groupByOutputLength;
    private groupByRandomizationCount;

export declare const resultExportService: ResultExportService;
//# sourceMappingURL=ResultExportService.d.ts.map