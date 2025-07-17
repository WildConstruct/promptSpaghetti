import { Edge, Node } from 'reactflow';
export interface GraphState {
    nodes: Node[];
    edges: Edge[];
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    addNode: (node: Node) => void;
    addEdge: (edge: Edge) => void;
    updateNode: (nodeId: string, partial: Record<string, unknown>) => void;
    addVariation: (nodeId: string, variation: string) => void;
    removeVariation: (nodeId: string, variationIndex: number) => void;
    updateVariation: (nodeId: string, variationIndex: number, newValue: string) => void;
    reorderVariations: (nodeId: string, fromIndex: number, toIndex: number) => void;
    duplicateNode: (nodeId: string) => void;
    deleteNode: (nodeId: string) => void;
}
export declare const useGraphStore: import("zustand").UseBoundStore<import("zustand").StoreApi<GraphState>>;
//# sourceMappingURL=graphStore.d.ts.map