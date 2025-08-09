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
  version: string; // e.g., "1.0"
  kind: "graph";
  meta: {
    id: string;
    name: string;
    description?: string;
    tags?: string[];
    createdAt: string; // ISO8601
    updatedAt: string; // ISO8601
    author?: { id?: string; name?: string };
  };
  graph: Graph;
  extras?: {
    previewUrl?: string;
    thumbSeed?: string;
    [k: string]: unknown;
  };
};
