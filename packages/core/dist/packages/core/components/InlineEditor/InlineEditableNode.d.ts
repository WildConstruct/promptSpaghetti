import React from 'react';
import { NodeProps } from 'reactflow';
import { NodeData } from '../../types/NodeTypes';
export interface InlineEditableNodeProps extends NodeProps<NodeData> {
    onDoubleClick?: (nodeId: string, event: React.MouseEvent) => void;
    showEditHint?: boolean;
    theme?: 'light' | 'dark' | 'cinema';
    export const: any;
    InlineEditableNode: React.FC<InlineEditableNodeProps>;
}
//# sourceMappingURL=InlineEditableNode.d.ts.map