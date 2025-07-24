import React from 'react';
import { EdgeProps } from 'reactflow';
interface DiffEdgeData {
    originalEdge: Error;
    diffState: 'added' | 'removed' | 'modified' | 'unchanged';
    changeDetails: Record<string, any>;
    side: 'source' | 'target';
    [key: string]: unknown;
}
export declare const DiffEdgeRenderer: React.NamedExoticComponent<EdgeProps<DiffEdgeData>>;
export {};
//# sourceMappingURL=DiffEdgeRenderer.d.ts.map