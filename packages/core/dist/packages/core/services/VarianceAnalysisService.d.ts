/**
 * Variance Analysis Service
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 5: Creative Variance Analysis
 *
 * Analyzes creative variance and diversity in generated results to provide
 * insights about the creative range and consistency of prompt outputs.
 */
import { PreviewResultWithPath } from '../types/ExecutionPath';
export interface VarianceMetrics {
    overallVariance: 'low' | 'medium' | 'high';
    varianceScore: number;
    diversityMetrics: {
        outputLengthVariance: number;
        vocabularyDiversity: number;
        structuralDiversity: number;
        executionPathDiversity: number;
    };
    creativeRange: {
        uniqueElements: string;
        commonElements: string;
        repetitionRate: number;
        creativityScore: number;
    };
    suggestions: VarianceSuggestion;
}
export interface VarianceSuggestion {
    type: 'increase' | 'decrease' | 'optimize';
    category: 'weights' | 'structure' | 'content' | 'execution';
    message: string;
    impact: 'low' | 'medium' | 'high';
    actionable: boolean;
}
export interface DiversityIndicator {
    metric: string;
    value: number;
    level: 'low' | 'medium' | 'high';
    description: string;
    color: string;
}
export declare class VarianceAnalysisService {
    /**
    * Analyzes variance across multiple preview results
    */
    analyzeVariance(results: PreviewResultWithPath): VarianceMetrics;
    if(metrics: any, diversityMetrics: any, executionPathDiversity: any): any;
}
//# sourceMappingURL=VarianceAnalysisService.d.ts.map