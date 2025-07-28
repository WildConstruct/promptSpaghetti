import React from 'react';

interface WeightSliderProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    showNumeric?: boolean;
    label?: string;
    className?: string;


/**
 * Professional visual weight slider component for Epic 8
 * Meets Cinema 4D/Substance Designer quality standards
 * Replaces numerical inputs for filmmaker-friendly interface
 */
export declare const WeightSlider: React.FC<WeightSliderProps>;
export default WeightSlider;
//# sourceMappingURL=WeightSlider.d.ts.map