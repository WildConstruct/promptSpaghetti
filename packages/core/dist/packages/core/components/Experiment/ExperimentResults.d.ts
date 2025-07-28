/**
 * Epic 14 Story 14.3 - Results Analysis & Visualization
 * Experiment Results Dashboard Component
 */
import React from 'react';
import { ExperimentResults as ExperimentResultsType, Experiment } from '../../types/experiment';
export interface ExperimentResultsProps {
    experiment: Experiment;
    results: ExperimentResultsType;
    onRefresh: () => Promise<void>;
    onExport: (format: 'csv' | 'json' | 'pdf') => Promise<void>;
    onStopExperiment: () => Promise<void>;
    onImplementWinner: (variantId: string) => Promise<void>;
    className?: string;
}
export declare const ExperimentResults: React.FC<ExperimentResultsProps>;
export default ExperimentResults;
//# sourceMappingURL=ExperimentResults.d.ts.map