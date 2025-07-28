/**
 * Result Export Service
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 4: Result Export System
 *
 * Handles individual and batch export of preview results with comprehensive
 * format support and metadata inclusion.
 */
import { PreviewResultWithPath } from '../types/ExecutionPath';
export interface ResultExportOptions {
    format: ExportFormat;
    includeMetadata: boolean;
    includeExecutionPaths: boolean;
    includeDebugInfo: boolean;
    filename?: string;
    filmOptions?: {
        includeDirectorNotes?: boolean;
        sceneNumbering?: boolean;
        shotBreakdown?: boolean;
        timingNotes?: boolean;
    };
    vfxOptions?: {
        controlNetCompatible?: boolean;
        sceneDataIntegration?: boolean;
        cameraMetadata?: boolean;
        lightingData?: boolean;
    };
    analysisOptions?: {
        varianceAnalysis?: boolean;
        performanceBreakdown?: boolean;
        creativityMetrics?: boolean;
        comparisonMatrix?: boolean;
    };
}
export type ExportFormat = 'plain-text' | 'json-simple' | 'json-complete' | 'csv-analysis' | 'fountain-script' | 'final-draft' | 'controlnet-json' | 'stable-diffusion' | 'professional-report' | 'creative-brief' | 'mars-framework' | 'zada-natural' | 'hybrid-prompting' | 'execution-timeline' | 'variance-report' | 'batch-summary';
export interface IndividualExportData {
    result: PreviewResultWithPath;
    index: number;
    totalResults: number;
    exportedAt: string;
    sourceGraph?: any;
}
export interface BatchExportData {
    results: PreviewResultWithPath;
    selectedIndices: number;
    aggregateStats: {
        totalResults: number;
        averageExecutionTime: number;
        uniqueSeeds: number;
        varianceScore: number;
        commonElements: string;
    };
    exportedAt: string;
    sourceGraph?: any;
}
export declare class ResultExportService {
    /**
    * Export a single preview result in the specified format
    */
    exportIndividualResult(result: PreviewResultWithPath): any;
    resultIndex: number;
    totalResults: number;
    options: ResultExportOptions;
    sourceGraph?: any;
    Promise<ExportResult>(): any;
    content: any;
    '=': any;
    repeat(: any): any;
}
//# sourceMappingURL=ResultExportService.d.ts.map