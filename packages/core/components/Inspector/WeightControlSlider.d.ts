import React from 'react';
export interface WeightControlOption {
    id: string;
    text: string;
    weight: number;
    locked?: boolean;
}
export type WeightPreset = 'equal' | 'linear-decrease' | 'exponential' | 'bell-curve' | 'first-heavy' | 'last-heavy' | 'mars-focal' | 'historical-authentic' | 'scene-efficiency' | 'custom';
export interface WeightPresetPattern {
    id: WeightPreset;
    name: string;
    description: string;
    icon: string;
    calculate: (count: number) => number[];
}
export interface WeightControlSliderProps {
    options: WeightControlOption[];
    onOptionsChange: (options: WeightControlOption[]) => void;
    onPreviewRequest?: (options: WeightControlOption[]) => void;
    className?: string;
    disabled?: boolean;
    showPreview?: boolean;
    previewDebounceMs?: number;
    showPresets?: boolean;
    allowCustomPresets?: boolean;
}
export declare const WEIGHT_PRESET_PATTERNS: WeightPresetPattern[];
export declare const isDragging: string | null, setIsDragging: React.Dispatch<React.SetStateAction<string | null>>;
export declare const handleOptionsChange: (newOptions: WeightControlOption[]) => void;
//# sourceMappingURL=WeightControlSlider.d.ts.map