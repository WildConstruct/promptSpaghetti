/**
 * Execution Path Visualization Component
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 2: Execution Path Visualization
 */
import React from 'react';
import { PreviewResultWithPath, ExecutionVisualizationConfig } from '../types/ExecutionPath';
interface ExecutionPathVisualizationProps {
    results: PreviewResultWithPath[];
    onNodeHighlight?: (nodeIds: string[]) => void;
    config?: Partial<ExecutionVisualizationConfig>;
    className?: string;
}
export declare const ExecutionPathVisualization: React.FC<ExecutionPathVisualizationProps>;
export default ExecutionPathVisualization;
//# sourceMappingURL=ExecutionPathVisualization.d.ts.map