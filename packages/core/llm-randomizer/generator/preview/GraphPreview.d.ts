import React from 'react';
import { Graph } from '../../../graphSchema';

}
interface GraphPreviewProps {
    graph?: Graph;
    isGenerating?: boolean;
    onNodeSelect?: (nodeId: string) => void;
    onEdgeSelect?: (sourceId: string, targetId: string) => void;
    className?: string;
    showStats?: boolean;
    interactive?: boolean;


/**
 * Graph preview component with interactive visualization
 */
export declare const GraphPreview: React.FC<GraphPreviewProps>;
}
export {};
//# sourceMappingURL=GraphPreview.d.ts.map