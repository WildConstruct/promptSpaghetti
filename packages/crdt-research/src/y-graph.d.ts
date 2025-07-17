import * as Y from 'yjs';
import { CRDTNode, CRDTEdge, GraphOperation } from './types';
export declare class YGraph extends Y.AbstractType<any> {
    nodes: Y.Map<CRDTNode>;
    edges: Y.Map<CRDTEdge>;
    constructor();
    get _name(): string;
    _copy(): YGraph;
    _write(encoder: any): void;
    addNode(node: CRDTNode): void;
    updateNode(nodeId: string, updates: Partial<CRDTNode>): void;
    deleteNode(nodeId: string): void;
    addEdge(edge: CRDTEdge): void;
    updateEdge(edgeId: string, updates: Partial<CRDTEdge>): void;
    deleteEdge(edgeId: string): void;
    getNodes(): CRDTNode[];
    getEdges(): CRDTEdge[];
    getNode(nodeId: string): CRDTNode | undefined;
    getEdge(edgeId: string): CRDTEdge | undefined;
    applyOperation(operation: GraphOperation): void;
    private _applyNodeOperation;
    private _applyEdgeOperation;
    toJSON(): {
        nodes: CRDTNode[];
        edges: CRDTEdge[];
    };
    fromJSON(data: {
        nodes: CRDTNode[];
        edges: CRDTEdge[];
    }): void;
    observe(callback: (event: Y.YEvent<any>) => void): void;
    unobserve(callback: (event: Y.YEvent<any>) => void): void;
}
export declare function registerYGraphType(): void;
//# sourceMappingURL=y-graph.d.ts.map