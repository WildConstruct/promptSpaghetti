/**
 * Weight Visualization Panel
 * Epic 8.3 Task 2: Professional weight visualization panel with multiple chart types
 *
 * Comprehensive visualization panel for creative weight management
 */
import React from 'react';
import { ChartType } from './WeightDistributionChart';
import { WeightControlOption } from '../Inspector/WeightControlSlider';

export interface WeightVisualizationPanelProps {
    options: WeightControlOption[];
    title?: string;
    defaultChartType?: ChartType;
    showChartControls?: boolean;
    showStatistics?: boolean;
    collapsed?: boolean;
    onCollapseChange?: (collapsed: boolean) => void;
    onOptionHover?: (option: WeightControlOption | null) => void;
    onOptionClick?: (option: WeightControlOption) => void;
    className?: string;
    style?: React.CSSProperties;

export declare const WeightVisualizationPanel: React.FC<WeightVisualizationPanelProps>;
export default WeightVisualizationPanel;
//# sourceMappingURL=WeightVisualizationPanel.d.ts.map