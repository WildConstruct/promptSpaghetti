/**
 * DevTools Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - React UI Components
 *
 * Main DevTools panel with tabs for different debugging features
 */
import React from 'react';
import { StateDevTools, DependencyGraph, PerformanceReport } from '../StateDevTools';
import { TimeTravel, TimeTravelState } from '../TimeTravel';
import { PerformanceProfiler, PerformanceAlert } from '../PerformanceProfiler';
export interface DevToolsPanelProps {
    devTools: StateDevTools;
    timeTravel: TimeTravel;
    performanceProfiler: PerformanceProfiler;
    isOpen?: boolean;
    onClose?: () => void;
    defaultTab?: string;
    position?: 'bottom' | 'right' | 'floating';
    theme?: 'light' | 'dark' | 'auto';
}
export interface DevToolsState {
    activeTab: string;
    isRecording: boolean;
    timeTravelState: TimeTravelState | null;
    performanceAlerts: PerformanceAlert[];
    selectedDomain: string;
    dependencyGraph: DependencyGraph | null;
    performanceReport: PerformanceReport | null;
}
export declare const DevToolsPanel: React.FC<DevToolsPanelProps>;
//# sourceMappingURL=DevToolsPanel.d.ts.map