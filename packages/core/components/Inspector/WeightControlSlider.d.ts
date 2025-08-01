import React from 'react';
import { WeightPreset } from '../WeightControls/WeightPresets';

}
}
export interface WeightControlOption { id: string;
    text: string;
    weight: number;
    locked?: boolean }
}
}
interface WeightControlSliderProps { options: WeightControlOption[];
    onOptionsChange: (options: WeightControlOption[]) => void;
    onPreviewRequest?: (options: WeightControlOption[]) => void;
    visualization?: 'pie' | 'bar' | 'slider-only';
    showLegend?: boolean;
    enableDragReorder?: boolean;
    showPresets?: boolean;
    compactPresets?: boolean;
    customPresets?: WeightPreset[];
    onSaveCustomPreset?: (preset: Omit<WeightPreset, 'id'>) => void;
    className?: string;

export declare const WeightControlSlider: React.FC<WeightControlSliderProps>;
export declare const useWeightControlIntegration: (onPreviewRequest: (options: WeightControlOption[]) => void) => {
    handleOptionsChange: (newOptions: WeightControlOption[]) => void;
    lastUpdateTime: number }
}
};
export default WeightControlSlider;
//# sourceMappingURL=WeightControlSlider.d.ts.map