import React from "react";
export interface VariationListProps {
    nodeId: string;
    variations: string[];
    onAdd?: (variation: string) => void;
    onRemove?: (index: number) => void;
    onUpdate?: (index: number, newValue: string) => void;
    onReorder?: (fromIndex: number, toIndex: number) => void;
    maxVariations?: number;
    placeholder?: string;
    allowQuickEntry?: boolean;
}
export declare const VariationList: React.FC<VariationListProps>;
//# sourceMappingURL=VariationList.d.ts.map