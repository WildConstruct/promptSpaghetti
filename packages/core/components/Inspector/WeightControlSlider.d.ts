import React from 'react';
export interface WeightControlOption {
    id: string;
    text: string;
    weight: number;
    locked?: boolean;
}
export type WeightPreset = 'equal' | 'linear-decrease' | 'exponential' | 'bell-curve' | 'first-heavy' | 'last-heavy' | 'custom';
interface WeightControlSliderProps {
    options: WeightControlOption[];
    onOptionsChange: (options: WeightControlOption[]) => void;
    onPreviewRequest?: (options: WeightControlOption[]) => void;
    className?: string;
}
export declare const WeightControlSlider: React.FC<WeightControlSliderProps>;
export default WeightControlSlider;
//# sourceMappingURL=WeightControlSlider.d.ts.map