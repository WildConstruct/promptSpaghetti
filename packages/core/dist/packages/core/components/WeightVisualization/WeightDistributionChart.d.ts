/**
 * Weight Distribution Visualization Chart
 * Epic 8.3 Task 2: Professional weight distribution visualization with pie chart and bar graph
 *
 * Professional SVG-based weight visualization for creative professionals
 */
import React from 'react';
import { WeightControlOption } from '../Inspector/WeightControlSlider';
export type ChartType = 'pie' | 'bar' | 'donut';
export interface WeightDistributionChartProps {
    options: WeightControlOption[];
    type?: ChartType;
    width?: number;
    height?: number;
    showLabels?: boolean;
    showPercentages?: boolean;
    showLegend?: boolean;
    colorScheme?: 'professional' | 'cinema4d' | 'warm' | 'cool';
    animationDuration?: number;
    onOptionHover?: (option: WeightControlOption | null) => void;
    onOptionClick?: (option: WeightControlOption) => void;
}
export declare const WeightDistributionChart: React.FC<WeightDistributionChartProps>;
export default WeightDistributionChart;
//# sourceMappingURL=WeightDistributionChart.d.ts.map