export type GraphNode = {
    id: string;
    type: string;
    label?: string;
    data?: Record<string, unknown>;
};
export type GraphEdge = {
    id: string;
    source: string;
    target: string;
    label?: string;
    data?: Record<string, unknown>;
};
export type Graph = {
    nodes: GraphNode[];
    edges: GraphEdge[];
    layout?: Record<string, unknown>;
    settings?: Record<string, unknown>;
};
export type PSGFile = {
    version: string;
    kind: "graph";
    meta: {
        id: string;
        name: string;
        description?: string;
        tags?: string[];
        createdAt: string;
        updatedAt: string;
        author?: {
            id?: string;
            name?: string;
        };
    };
    graph: Graph;
    extras?: {
        previewUrl?: string;
        thumbSeed?: string;
        [k: string]: unknown;
    };
};
//# sourceMappingURL=graph.d.ts.map