/**
 * MetricsGrid - KPI cards layout component
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides consistent grid layout for dashboard metrics
 */
import React from 'react';
import './MetricsGrid.css';
export interface MetricsGridProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto';
    gap?: 'small' | 'medium' | 'large';
    minCardWidth?: string;
    className?: string;
}
export declare const MetricsGrid: React.FC<MetricsGridProps>;
export default MetricsGrid;
//# sourceMappingURL=MetricsGrid.d.ts.map