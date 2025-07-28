import React from 'react';
import { WeightControlOption } from '../Inspector/WeightControlSlider';
export interface WeightPreset {
    id: string;
    name: string;
    description: string;
    category: 'basic' | 'creative' | 'advanced' | 'custom';
    pattern: (options: WeightControlOption) => number;
    icon?: string;
    preview?: string;
}
export interface WeightPresetsProps {
    options: WeightControlOption;
    onApplyPreset: (newWeights: number) => void;
    onSaveCustomPreset?: (preset: Omit<WeightPreset, 'id'>) => void;
    customPresets?: WeightPreset;
    className?: string;
    showCategories?: boolean;
    compact?: boolean;
}
export declare const BUILT_IN_PRESETS: WeightPreset;
export declare const WeightPresets: React.FC<WeightPresetsProps>;
export default WeightPresets;
//# sourceMappingURL=WeightPresets.d.ts.map