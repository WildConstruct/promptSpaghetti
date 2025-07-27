import React from 'react';
import { WeightControlOption } from '../Inspector/WeightControlSlider';
export interface WeightVisualizationProps {
    options: WeightControlOption[];
    type: 'pie' | 'bar';
    width?: number;
    height?: number;
    showLabels?: boolean;
    showPercentages?: boolean;
    className?: string;
}
export declare const WEIGHT_OPTION_COLORS: string[];
export declare const getOptionColor: (index: number) => string;
export declare const WeightVisualization: React.FC<WeightVisualizationProps>;
export interface WeightLegendProps {
    options: WeightControlOption[];
    className?: string;
}
export default WeightVisualization;
//# sourceMappingURL=WeightVisualization.d.ts.map