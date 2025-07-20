import React from "react";
import { ZodSchema } from "zod";
/**
 * InspectorSidebar
 * Renders a dynamic form for the selected node using a provided Zod schema.
 * Props:
 * - node: The selected node object (or null if none selected)
 * - schema: Zod schema describing the form fields for this node type
 * - onChange: Callback when form values change (debounced)
 */
export interface InspectorSidebarProps {
    node: any | null;
    schema: ZodSchema<any> | null;
    onChange: (partial: Record<string, unknown>) => void;
}
export declare const InspectorSidebar: React.FC<InspectorSidebarProps>;
//# sourceMappingURL=InspectorSidebar.d.ts.map