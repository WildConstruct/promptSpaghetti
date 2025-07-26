import React from 'react';
import { NodeMeta } from '../Palette';
export interface TabbedPaletteProps {
    nodes: NodeMeta[];
    collapsed: boolean;
    onToggle: () => void;
    onDragStart?: (nodeId: string) => void;
    defaultActiveTab?: string;
    showSearch?: boolean;
    showFavorites?: boolean;
    maxSearchResults?: number;
}
/**
 * Enhanced tabbed palette with search and favorites
 */
export declare const TabbedPalette: React.FC<TabbedPaletteProps>;
//# sourceMappingURL=TabbedPalette.d.ts.map