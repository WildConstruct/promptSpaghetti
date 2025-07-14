import React, { useCallback, useState, useMemo } from "react";
import { Edge, Node, ReactFlowProvider, addEdge, Background, Controls, MiniMap, ReactFlow, Connection, OnConnect, OnEdgesChange, OnNodesChange, EdgeChange, NodeChange } from "reactflow";
import "reactflow/dist/style.css";
import { InspectorSidebar } from "./InspectorSidebar";
import { nodeSchemas } from "./nodeSchemas";
import { z } from "zod";
import { Palette, NodeMeta } from "./Palette";
import {
  WeightedChoiceIcon,
  ConcatIcon,
  OutputIcon,
  IncludeIcon,
  SetVariableIcon,
  GetVariableIcon,
} from "./icons";


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

const NODE_TYPES: NodeMeta[] = [
  {
    id: "WeightedChoice",
    label: "WeightedChoice",
    icon: WeightedChoiceIcon,
    tooltip: "Branch with weighted options",
  },
  {
    id: "Concat",
    label: "Concat",
    icon: ConcatIcon,
    tooltip: "Concatenate child prompts",
  },
  {
    id: "Output",
    label: "Output",
    icon: OutputIcon,
    tooltip: "Final output node",
  },
  {
    id: "Include",
    label: "Include",
    icon: IncludeIcon,
    tooltip: "Include another bundle",
  },
  {
    id: "SetVariable",
    label: "SetVariable",
    icon: SetVariableIcon,
    tooltip: "Set a variable",
  },
  {
    id: "GetVariable",
    label: "GetVariable",
    icon: GetVariableIcon,
    tooltip: "Read a variable",
  },
];

export const GraphEditor: React.FC<GraphEditorProps> = ({
  initialNodes,
  initialEdges,
  validateConnection = defaultValidateConnection,
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [restoreDraft, setRestoreDraft] = useState<{nodes: Node[]; edges: Edge[];}|null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Palette collapsed state
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);

  // Node types mapping (stable)
  const nodeTypes = useMemo(() => {
    const NodeRender: React.FC<any> = (props) => (
      <div
        role="button"
        data-testid={`node-${props.id}`}

        tabIndex={0}
        onClick={() => setSelectedNodeId(props.id)}
        style={{
          cursor: 'pointer',
          background: '#23272f',
          color: '#fff',
          border: '1.5px solid #444',
          borderRadius: 8,
          padding: 8,
          minWidth: 80,
          minHeight: 40,
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        }}
        aria-label={(() => {
          const label = props.data?.label ?? props.id;
          const summary = Object.entries(props.data || {})
            .filter(([k]) => k !== 'label')
            .map(([k, v]) => `${k}: ${String(v)}`)
            .join(', ');
          return summary ? `${label}. ${summary}` : label;
        })()}
      >
        <div style={{ fontWeight: 600 }}>{props.data?.label ?? props.id}</div>
        <div style={{ fontSize: 12, color: '#ccc', marginTop: 2 }}>
          {Object.entries(props.data || {}).map(([k, v]) => (
            <span key={k} style={{ marginRight: 8 }}>{k}: {String(v)}</span>
          ))}
        </div>
      </div>
    );
    const map: Record<string, any> = { default: NodeRender };
    NODE_TYPES.forEach((t) => {
      map[t.id] = NodeRender;
      map[t.id.toLowerCase()] = NodeRender;
    });
    return map;
  }, []);

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

  // Handle node drag from palette
  const handlePaletteDragStart = (nodeId: string) => {
    // No-op: drag data set in Palette, handled on drop
  };

  // Handle drop on canvas: create node of given type at position
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/node-type');
      if (!nodeType || !(nodeType in nodeSchemas)) return;
      const reactFlowBounds = (event.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
      // Use Zod schema to get default params
      const schema = nodeSchemas[nodeType];
      const params = schema.parse({});
      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        type: "default",
        position,
        data: { ...params },
        selected: false,
      };
      setNodes((nds) => [...nds, newNode]);
    },
    []
  );

  // Allow drop on canvas
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Node click handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Autosave graph every 5s
  React.useEffect(() => {
    const save = () => {
      const draft = JSON.stringify({ nodes, edges });
      localStorage.setItem('graphDraft', draft);
    };
    const interval = setInterval(save, 5000);
    return () => clearInterval(interval);
  }, [nodes, edges]);

  // Prompt to restore draft on mount
  React.useEffect(() => {
    const draft = localStorage.getItem('graphDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
          setRestoreDraft(parsed);
          setShowRestorePrompt(true);
        }
      } catch {}
    }
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
    // run validation immediately so external validators update synchronously
    runValidation(edges, nodes.map((n) =>
      n.id === selectedNode.id ? { ...n, data: { ...n.data, ...partial } } : n
    ));
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      runValidation(edges, nodes.map((n) =>
        n.id === selectedNode.id ? { ...n, data: { ...n.data, ...partial } } : n
      ));
    }, 300);
  };

  return (
    <ReactFlowProvider>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {showRestorePrompt && restoreDraft && (
          <div style={{
            position: 'absolute',
            zIndex: 10,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(20,20,20,0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }} data-testid="restore-draft-modal">
            <div style={{ background: '#23262b', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px #0008' }}>
              <h3 style={{ color: '#fff', marginBottom: 12 }}>Restore unsaved graph draft?</h3>
              <p style={{ color: '#ccc', marginBottom: 24 }}>A saved graph draft was found. Restore it?</p>
              <button onClick={() => {
                setNodes(restoreDraft.nodes);
                setEdges(restoreDraft.edges);
                setShowRestorePrompt(false);
                setStatusMessage('Draft Restored');
                setTimeout(() => setStatusMessage(''), 3000);
              }} style={{ marginRight: 16 }}>Restore</button>
              <button onClick={() => {
                setShowRestorePrompt(false);
                localStorage.removeItem('graphDraft');
              }}>Dismiss</button>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', height: '100%' }}>
          <Palette
            nodes={NODE_TYPES}
            collapsed={paletteCollapsed}
            onToggle={() => setPaletteCollapsed((c) => !c)}
            onDragStart={handlePaletteDragStart}
          />
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }} data-testid="react-flow-canvas-wrapper">
            <ReactFlow data-testid="react-flow-canvas"
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              fitView
              style={{ background: '#20232a', height: '100%' }}
              nodeTypes={nodeTypes}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Background color="#333" gap={16} />
              <MiniMap nodeColor={() => '#363a45'} maskColor="#181b21BB" />
              <Controls />
            </ReactFlow>
          </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #eee", padding: 8, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div aria-live="polite">
            {statusMessage && <span style={{ marginRight: 16 }}>{statusMessage}</span>}
          <button
            onClick={() => {
              const blob = new Blob([
                JSON.stringify({ nodes, edges }, null, 2)
              ], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'graph.json';
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 0);
            }}
            style={{ marginRight: 16, padding: '6px 16px', background: '#eee', color: '#23272f', border: '1px solid #ccc', borderRadius: 4, fontWeight: 500, cursor: 'pointer' }}
          >
            Save as JSON
          </button>
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
