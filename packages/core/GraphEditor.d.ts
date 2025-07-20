import React from "react";
import { Edge, Node } from "reactflow";
import { ValidationError } from "./validation";
interface GraphEditorProps {
    initialNodes: Node[];
    initialEdges: Edge[];
    validateConnection?: (edges: Edge[], nodes: Node[]) => ValidationError[];
}
export declare const GraphEditor: React.FC<GraphEditorProps>;
export default GraphEditor;
//# sourceMappingURL=GraphEditor.d.ts.map