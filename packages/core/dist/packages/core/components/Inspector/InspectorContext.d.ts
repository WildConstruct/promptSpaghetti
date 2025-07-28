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
export declare const useInspectorContext: () => InspectorContextValue;
export {};
//# sourceMappingURL=InspectorContext.d.ts.map