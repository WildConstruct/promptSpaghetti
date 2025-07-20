import React from "react";
import { ZodSchema } from "zod";
interface NodeEditorRouterProps {
    node: any;
    schema: ZodSchema<any>;
    onChange: (partial: Record<string, unknown>) => void;
}
export declare const NodeEditorRouter: React.FC<NodeEditorRouterProps>;
export {};
//# sourceMappingURL=NodeEditorRouter.d.ts.map