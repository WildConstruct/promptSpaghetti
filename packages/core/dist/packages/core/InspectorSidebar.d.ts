import React from 'react';
import { ZodSchema } from 'zod';
/**
 * InspectorSidebar
 * Renders a dynamic form for the selected node using a provided Zod schema.
 * Props:
 * - node: The selected node object (or null if none selected)
 * - schema: Zod schema describing the form fields for this node type
 * - onChange: Callback when form values change (debounced)
 */
interface NodeData {
    id: string;
    type: string;
    data: Record<string, unknown>;
}
export interface InspectorSidebarProps {
    node: NodeData | null;
    schema: ZodSchema<Record<string, unknown>> | null;
    onChange: (partial: Record<string, unknown>) => void;
}
export declare const InspectorSidebar: React.FC<InspectorSidebarProps>;
export {};
//# sourceMappingURL=InspectorSidebar.d.ts.map