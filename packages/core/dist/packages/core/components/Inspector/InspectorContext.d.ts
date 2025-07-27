import React, { ReactNode } from 'react';
import { Node } from 'reactflow';
import { ZodSchema } from 'zod';
interface InspectorState {
    selectedNode: Node | null;
    selectedSchema: ZodSchema<unknown> | null;
    panelWidth: number;
    panelCollapsed: boolean;
    panelVisible: boolean;
}
interface InspectorActions {
    setSelectedNode: (node: Node | null) => void;
    setSelectedSchema: (schema: ZodSchema<unknown> | null) => void;
    setPanelWidth: (width: number) => void;
    setPanelCollapsed: (collapsed: boolean) => void;
    setPanelVisible: (visible: boolean) => void;
    updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
}
interface InspectorContextValue extends InspectorState, InspectorActions {
}
interface InspectorProviderProps {
    children: ReactNode;
    onNodeUpdate?: (nodeId: string, data: Record<string, unknown>) => void;
    initialWidth?: number;
    initialCollapsed?: boolean;
    initialVisible?: boolean;
}
export declare const InspectorProvider: React.FC<InspectorProviderProps>;
export declare const useInspectorContext: () => InspectorContextValue;
export {};
//# sourceMappingURL=InspectorContext.d.ts.map