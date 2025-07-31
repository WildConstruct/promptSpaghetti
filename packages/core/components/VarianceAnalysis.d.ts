/**
 * Variance Analysis Component
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 5: Creative Variance Analysis
 *
 * Displays creative variance metrics, diversity indicators, and suggestions
 * for improving or optimizing the creative range of generated results.
 */
import React from 'react';
import { PreviewResultWithPath } from '../types/ExecutionPath';
import { VarianceSuggestion } from '../services/VarianceAnalysisService';

}
interface VarianceAnalysisProps {
    results: PreviewResultWithPath[];
    onSuggestionClick?: (suggestion: VarianceSuggestion) => void;
    compact?: boolean;

export declare const VarianceAnalysis: React.FC<VarianceAnalysisProps>;
}
export {};
//# sourceMappingURL=VarianceAnalysis.d.ts.map