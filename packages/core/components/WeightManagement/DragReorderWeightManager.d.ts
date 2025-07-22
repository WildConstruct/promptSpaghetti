/**
 * Drag-to-Reorder Weight Manager
 * Epic 8.3 Task 3 - Drag-to-Reorder Interface (E8.3-3-drag-reorder)
 *
 * Intuitive weight management with drag-and-drop reordering for Wild Construct demo
 */
import React from 'react';
export interface WeightedOption {
    id: string;
    text: string;
    weight: number;
    locked?: boolean;
    color?: string;
    category?: string;
}
export interface DragReorderProps {
    options: WeightedOption[];
    onChange: (options: WeightedOption[]) => void;
    disabled?: boolean;
    showWeights?: boolean;
    showPercentages?: boolean;
    allowWeightEditing?: boolean;
    allowLocking?: boolean;
    minWeight?: number;
    maxWeight?: number;
    totalWeight?: number;
    onWeightChange?: (optionId: string, weight: number, percentage: number) => void;
    className?: string;
    style?: React.CSSProperties;
    theme?: 'light' | 'dark' | 'cinema';
    showVisualWeights?: boolean;
    animationDuration?: number;
    snapToGrid?: boolean;
    enableCategories?: boolean;
    enableBulkOperations?: boolean;
    enablePresets?: boolean;
    showStatistics?: boolean;
}
export interface WeightStatistics {
    totalWeight: number;
    averageWeight: number;
    minWeight: number;
    maxWeight: number;
    weightDistribution: 'even' | 'skewed' | 'concentrated';
    entropyScore: number;
}
/**
 * Professional drag-and-drop weight management component
 */
export declare const DragReorderWeightManager: React.FC<DragReorderProps>;
export default DragReorderWeightManager;
//# sourceMappingURL=DragReorderWeightManager.d.ts.map