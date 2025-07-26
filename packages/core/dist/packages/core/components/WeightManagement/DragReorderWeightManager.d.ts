/**
 * Drag-to-Reorder Weight Manager
 * Epic 8.3 Task 3 - Drag-to-Reorder Interface (E8.3-3-drag-reorder)
 *
 * Intuitive weight management with drag-and-drop reordering for Wild Construct demo
 * Migrated from react-beautiful-dnd to @dnd-kit for modern React 18+ support
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
    medianWeight: number;
    maxWeight: number;
    minWeight: number;
    standardDeviation: number;
    entropyScore: number;
    weightDistribution: 'uniform' | 'skewed' | 'bimodal' | 'concentrated';
}
export declare const DragReorderWeightManager: React.FC<DragReorderProps>;
export default DragReorderWeightManager;
//# sourceMappingURL=DragReorderWeightManager.d.ts.map