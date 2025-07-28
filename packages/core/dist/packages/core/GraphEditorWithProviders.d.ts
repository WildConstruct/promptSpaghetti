/**
 * Enhanced GraphEditor with Provider Hook Integration
 * Extends the existing GraphEditor with client-side provider hooking capabilities
 */
import React from 'react';
import { Edge, Node } from 'reactflow';
import { NodeMeta } from './Palette';
import { ValidationError } from './validation';
import { ProviderHook } from './hooks/useEditorProviders';
export interface GraphEditorWithProvidersProps {
    initialNodes: Node;
    initialEdges: Edge;
    validateConnection?: (edges: Edge, nodes: Node) => ValidationError;
    enableBuiltInProviders?: {
        consoleLogger?: boolean;
        autoSave?: boolean | {
            interval?: number;
        };
        validation?: boolean;
    };
    providers?: ProviderHook;
    onProviderRegistered?: (hook: ProviderHook) => void;
    onProviderUnregistered?: (hookId: string) => void;
    onProviderError?: (error: Error, hookId: string) => void;
    const: any;
    NODE_TYPES: NodeMeta;
    const: any;
    GraphEditorWithProvidersInner: React.FC<GraphEditorWithProvidersProps>;
}
export declare const GraphEditorWithProviders: React.FC<GraphEditorWithProvidersProps>;
export default GraphEditorWithProviders;
//# sourceMappingURL=GraphEditorWithProviders.d.ts.map