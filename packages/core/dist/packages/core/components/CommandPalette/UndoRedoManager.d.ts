import { Node, Edge } from 'reactflow';
export interface GraphState {
    nodes: Node;
    edges: Edge;
    timestamp: number;
    description: string;
    id: string;
}
export interface UndoRedoManagerProps {
    onStateChange: (state: GraphState) => void;
    maxHistorySize?: number;
    theme?: 'light' | 'dark' | 'cinema';
}
export declare class UndoRedoSystem {
    private history;
    private currentIndex;
    private maxSize;
    private listeners;
    constructor(maxSize?: number);
}
export default UndoRedoManager;
//# sourceMappingURL=UndoRedoManager.d.ts.map