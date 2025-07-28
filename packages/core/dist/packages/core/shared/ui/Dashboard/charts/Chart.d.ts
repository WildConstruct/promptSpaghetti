/**
 * Chart - Multi-type chart component for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides consistent chart visualization across all dashboards
 */
import React from 'react';
import './Chart.css';
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'donut';
export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
    metadata?: Record<string, any>;
}
export interface ChartSeries {
    name: string;
    data: ChartDataPoint;
    color?: string;
    type?: ChartType;
}
export interface ChartProps {
    series: ChartSeries;
    type?: ChartType;
    height?: number;
    width?: number | string;
    aspectRatio?: string;
    variant?: 'default' | 'minimal' | 'detailed';
    colorScheme?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'custom';
    showLegend?: boolean;
    showGrid?: boolean;
    showAxes?: boolean;
    interactive?: boolean;
    onDataPointClick?: (point: ChartDataPoint, series: ChartSeries) => void;
    onDataPointHover?: (point: ChartDataPoint | null, series: ChartSeries | null) => void;
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    valueFormatter?: (value: number) => string;
    loading?: boolean;
    error?: string;
    className?: string;
}
export declare const Chart: React.FC<ChartProps>;
export default Chart;
//# sourceMappingURL=Chart.d.ts.map