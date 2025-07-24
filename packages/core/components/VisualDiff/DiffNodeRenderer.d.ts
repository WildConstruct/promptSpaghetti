import React from 'react';
import { NodeProps } from 'reactflow';
interface DiffNodeData {
    originalNode: Error;
    diffState: 'added' | 'removed' | 'modified' | 'unchanged';
    changeDetails: Record<string, any>;
    showMetadata: boolean;
    side: 'source' | 'target';
    [key: string]: unknown;
}
export declare const DiffNodeRenderer: React.NamedExoticComponent<NodeProps<DiffNodeData>>;
export {};
//# sourceMappingURL=DiffNodeRenderer.d.ts.map