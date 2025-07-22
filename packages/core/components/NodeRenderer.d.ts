import React from 'react';
import { NodeMeta } from '../Palette';
interface NodeRendererProps {
    id: string;
    data: any;
    selected?: boolean;
    onSelect: (nodeId: string) => void;
    getNodeMeta: (nodeType: string) => NodeMeta;
    getCategoryColor: (category: string) => string;
}
export declare const NodeRenderer: React.NamedExoticComponent<NodeRendererProps>;
export {};
//# sourceMappingURL=NodeRenderer.d.ts.map