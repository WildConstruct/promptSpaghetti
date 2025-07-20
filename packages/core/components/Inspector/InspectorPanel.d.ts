import React from "react";
import { ZodSchema } from "zod";
export interface InspectorPanelProps {
    node: any | null;
    schema: ZodSchema<any> | null;
    onChange: (partial: Record<string, unknown>) => void;
    onClose?: () => void;
    initialWidth?: number;
    minWidth?: number;
    maxWidth?: number;
}
export declare const InspectorPanel: React.FC<InspectorPanelProps>;
//# sourceMappingURL=InspectorPanel.d.ts.map