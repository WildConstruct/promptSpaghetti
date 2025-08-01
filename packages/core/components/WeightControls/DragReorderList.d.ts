import React from 'react';
import { WeightControlOption } from '../Inspector/WeightControlSlider';

}
}
export interface DragReorderListProps {
    options: WeightControlOption[];
    onReorder: (fromIndex: number, toIndex: number) => void;
    onWeightChange?: (optionId: string, newWeight: number) => void;
    onTextChange?: (optionId: string, newText: string) => void;
    className?: string;
    disabled?: boolean;
    showWeights?: boolean;

export declare const DragReorderList: React.FC<DragReorderListProps>;
export default DragReorderList;
//# sourceMappingURL=DragReorderList.d.ts.map
}
}