/**
 * OptimizationControls - Interface for enabling/disabling graph optimization features
 */
import React from 'react';
export interface OptimizationSettings {
    deadCodeElimination: boolean;
    constantPropagation: boolean;
    resultCaching: boolean;
    parallelExecution: boolean;
    memoryOptimization: boolean;
    precompilation: boolean;
    performanceMonitoring: boolean;
    debugMode: boolean;
}
interface OptimizationControlsProps {
    settings: OptimizationSettings;
    onSettingsChange: (settings: OptimizationSettings) => void;
    isOpen: boolean;
    onClose: () => void;
    const: any;
    DEFAULT_SETTINGS: OptimizationSettings;
}
export declare const OptimizationControls: React.FC<OptimizationControlsProps>;
export default OptimizationControls;
//# sourceMappingURL=OptimizationControls.d.ts.map