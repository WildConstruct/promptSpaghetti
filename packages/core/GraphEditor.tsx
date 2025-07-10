import React, { useCallback, useState } from "react";
import { Edge, Node, ReactFlowProvider, addEdge, Background, Controls, MiniMap, ReactFlow, Connection, OnConnect, OnEdgesChange, OnNodesChange, EdgeChange, NodeChange } from "reactflow";
import "reactflow/dist/style.css";
import { InspectorSidebar } from "./InspectorSidebar";
import { nodeSchemas } from "./nodeSchemas";
import { z } from "zod";


// Types for node and edge validation errors
interface ValidationError {
  edgeId: string;
  message: string;
}

interface GraphEditorProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  validateConnection?: (edges: Edge[], nodes: Node[]) => ValidationError[];
}

const defaultValidateConnection = (edges: Edge[], nodes: Node[]): ValidationError[] => {
  // Example: mark all edges as valid (no errors)
  return [];
};

import { PreviewModal } from "./PreviewModal";

export const GraphEditor: React.FC<GraphEditorProps> = ({
  initialNodes,
  initialEdges,
  validateConnection = defaultValidateConnection,
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Preview-5 modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewResults, setPreviewResults] = useState<{ output: string; seed: number }[]>([]);


  // Edge drag handler
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge(connection, eds);
        return newEdges;
      });
    },
    []
  );

  // Node click handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Run validation on edge or node change
  const runValidation = useCallback(
    (edges: Edge[], nodes: Node[]) => {
      const errs = validateConnection(edges, nodes);
      setErrors(errs);
    },
    [validateConnection]
  );

  // Nodes/edges change handlers
  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const newNodes = nds.map((node) => {
          const change = changes.find((c) => 'id' in c && c.id === node.id);
          return change ? { ...node, ...change } : node;
        });
        runValidation(edges, newNodes);
        return newNodes;
      });
    },
    [edges, runValidation]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const newEdges = eds.map((edge) => {
          const change = changes.find((c) => 'id' in c && c.id === edge.id);
          return change ? { ...edge, ...change } : edge;
        });
        runValidation(newEdges, nodes);
        return newEdges;
      });
    },
    [nodes, runValidation]
  );

  // Run validation on initial mount
  React.useEffect(() => {
    runValidation(edges, nodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Highlight invalid edges
  const getEdgeStyle = (edge: Edge) => {
    const error = errors.find((e) => e.edgeId === edge.id);
    return error ? { stroke: "#f00", strokeWidth: 2 } : {};
  };

  // Status bar with error count
  const errorCount = errors.length;

  // Find selected node and schema
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedSchema = selectedNode && selectedNode.type ? nodeSchemas[selectedNode.type] ?? null : null;

  // Debounced form change handler
  const debounceTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleInspectorChange = (partial: Record<string, unknown>) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, ...partial } }
          : n
      )
    );
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      runValidation(edges, nodes.map((n) =>
        n.id === selectedNode.id ? { ...n, data: { ...n.data, ...partial } } : n
      ));
    }, 300);
  };

  return (
    <ReactFlowProvider>
      <div style={{ height: 600, width: "100%", position: "relative", display: "flex" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges.map((edge) => ({ ...edge, style: getEdgeStyle(edge) }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eee", padding: 8, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {errorCount === 0 ? "No errors" : `${errorCount} error${errorCount > 1 ? "s" : ""}`}
              {errorCount > 0 && (
                <span style={{ marginLeft: 16 }}>
                  {errors.map((err) => (
                    <span key={err.edgeId} style={{ color: "#f00", marginRight: 8 }} title={err.message}>
                      {err.message}
                    </span>
                  ))}
                </span>
              )}
            </div>
            <button
              onClick={async () => {
                setPreviewOpen(true);
                setPreviewLoading(true);
                setPreviewError(null);
                setPreviewResults([]);
                try {
                  // Example payload: send current nodes/edges
                  const res = await fetch("/server/preview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nodes, edges, count: 5 })
                  });
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  const data = await res.json();
                  // Expect: { results: Array<{ output: string, seed: number }> }
                  setPreviewResults(data.results || []);
                } catch (err: any) {
                  setPreviewError(err.message || "Failed to fetch preview");
                  setPreviewResults([
                    { output: "[Mock output 1]", seed: 123 },
                    { output: "[Mock output 2]", seed: 124 },
                    { output: "[Mock output 3]", seed: 125 },
                    { output: "[Mock output 4]", seed: 126 },
                    { output: "[Mock output 5]", seed: 127 },
                  ]);
                } finally {
                  setPreviewLoading(false);
                }
              }}
              style={{ marginLeft: 16, padding: '6px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 500, cursor: 'pointer' }}
            >
              Preview 5
            </button>
          </div>
        </div>
        <InspectorSidebar
          node={selectedNode}
          schema={selectedSchema}
          onChange={handleInspectorChange}
        />
        <PreviewModal
          open={previewOpen}
          loading={previewLoading}
          error={previewError}
          results={previewResults}
          onClose={() => setPreviewOpen(false)}
        />
      </div>
    </ReactFlowProvider>
  );
};

export default GraphEditor;
