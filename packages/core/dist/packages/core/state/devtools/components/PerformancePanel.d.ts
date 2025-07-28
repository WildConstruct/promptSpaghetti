/**
 * Performance Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - Performance Analysis UI
 */
import React from 'react';
import { PerformanceProfiler, PerformanceAlert, PerformanceReport } from '../PerformanceProfiler';
export interface PerformancePanelProps {
    performanceProfiler: PerformanceProfiler;
    alerts: PerformanceAlert;
    report: PerformanceReport | null;
    onGenerateReport: () => void;
}
export declare const PerformancePanel: React.FC<PerformancePanelProps>;
//# sourceMappingURL=PerformancePanel.d.ts.map