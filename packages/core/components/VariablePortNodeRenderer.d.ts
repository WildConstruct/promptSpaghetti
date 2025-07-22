import React from 'react';
import { NodeMeta } from '../Palette';
interface VariablePortNodeRendererProps {
    id: string;
    data: any;
    selected?: boolean;
    onSelect: (nodeId: string) => void;
    getNodeMeta: (nodeType: string) => NodeMeta;
    getCategoryColor: (category: string) => string;
}
export declare const VariablePortNodeRenderer: React.NamedExoticComponent<VariablePortNodeRendererProps>;
export {};
//# sourceMappingURL=VariablePortNodeRenderer.d.ts.map