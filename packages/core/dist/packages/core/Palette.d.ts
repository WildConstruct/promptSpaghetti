import React from 'react';
export interface NodeMeta {
    id: string;
    label: string;
    icon: React.ReactNode;
    category?: string;
    tooltip: string;
}
export interface PaletteProps {
    nodes: NodeMeta[];
    collapsed: boolean;
    onToggle: () => void;
    onDragStart?: (nodeId: string) => void;
}
export declare const Palette: React.FC<PaletteProps>;
//# sourceMappingURL=Palette.d.ts.map