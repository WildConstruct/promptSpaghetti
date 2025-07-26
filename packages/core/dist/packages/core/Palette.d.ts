import React from 'react';
export interface NodeMeta {
    id: string;
    label: string;
    icon: React.ReactNode;
    category?: string;
    tooltip: string;
}
interface PaletteProps {
    nodes: NodeMeta[];
    collapsed: boolean;
    onToggle: () => void;
    onDragStart?: (nodeId: string) => void;
}
export declare const Palette: React.FC<PaletteProps>;
export {};
//# sourceMappingURL=Palette.d.ts.map