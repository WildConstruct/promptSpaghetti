import React, { useCallback, useState, useMemo, memo } from "react";
import { Edge, Node, ReactFlowProvider, addEdge, Background, Controls, MiniMap, ReactFlow, Connection, OnConnect, OnEdgesChange, OnNodesChange, EdgeChange, NodeChange } from "reactflow";
import "reactflow/dist/style.css";
import { InspectorPanel } from "./components/Inspector";
import { nodeSchemas } from "./nodeSchemas";

import { Palette, NodeMeta } from "./Palette";
import { validateConnection as coreValidateConnection, ValidationError as ConnError } from "./validation";
import { useGraphStore } from "./graphStore";
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
import { usePreviewSeeds } from "./usePreviewSeeds";
import { CorrectionsPanel } from "./CorrectionsPanel";
import { useCorrectionsEnabled } from "./correctionsStore";

const NODE_TYPES: NodeMeta[] = [
  // Text Node Types
  {
    id: "Subject",
    label: "Subject",
    icon: "👤",
    tooltip: "Text subject with grammatical forms",
    category: "text",
  },
  {
    id: "Connector",
    label: "Connector",
    icon: "🔗",
    tooltip: "Grammar connector between elements",
    category: "text",
  },
  {
    id: "Attribute",
    label: "Attribute",
    icon: "🏷️",
    tooltip: "Descriptive attribute for nouns",
    category: "text",
  },
  {
    id: "Action",
    label: "Action",
    icon: "⚡",
    tooltip: "Action verb with tense options",
    category: "text",
  },
  // Original Node Types
  {
    id: "WeightedChoice",
    label: "WeightedChoice",
    icon: WeightedChoiceIcon,
    tooltip: "Branch with weighted options",
    category: "logic",
  },
  {
    id: "Concat",
    label: "Concat",
    icon: ConcatIcon,
    tooltip: "Concatenate child prompts",
    category: "logic",
  },
  {
    id: "Output",
    label: "Output",
    icon: OutputIcon,
    tooltip: "Final output node",
    category: "output",
  },
  {
    id: "Include",
    label: "Include",
    icon: IncludeIcon,
    tooltip: "Include another bundle",
    category: "logic",
  },
  {
    id: "SetVariable",
    label: "SetVariable",
    icon: SetVariableIcon,
    tooltip: "Set a variable",
    category: "variable",
  },
  {
    id: "GetVariable",
    label: "GetVariable",
    icon: GetVariableIcon,
    tooltip: "Read a variable",
    category: "variable",
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
  const [restoreDraft, setRestoreDraft] = useState<{ nodes: Node[]; edges: Edge[]; } | null>(null);
  const [errors, setErrors] = useState<ConnError[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Palette collapsed state
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  
  // Corrections panel state
  const [correctionsOpen, setCorrectionsOpen] = useState(false);
  const correctionsEnabled = useCorrectionsEnabled();

  // Memoized node render component for performance
  const NodeRender = useMemo(() => memo<any>((props) => {
    const hasVariations = props.data?.variations && props.data.variations.length > 0;
    
    return (
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
          position: 'relative',
        }}
        aria-label={(() => {
          const label = props.data?.label ?? props.id;
          const summary = Object.entries(props.data || {})
            .filter(([k]) => k !== 'label' && k !== 'variations')
            .map(([k, v]) => `${k}: ${String(v)}`)
            .join(', ');
          return summary ? `${label}. ${summary}` : label;
        })()}
      >
        {hasVariations && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 16,
              height: 16,
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 'bold',
              color: '#fff',
              border: '2px solid #23272f',
            }}
            title={`${props.data.variations.length} variations`}
          >
            {props.data.variations.length}
          </div>
        )}
        <div style={{ fontWeight: 600 }}>{props.data?.label ?? props.id}</div>
        <div style={{ fontSize: 12, color: '#ccc', marginTop: 2 }}>
          {Object.entries(props.data || {})
            .filter(([k]) => k !== 'label' && k !== 'variations')
            .map(([k, v]) => (
              <span key={k} style={{ marginRight: 8 }}>{k}: {String(v)}</span>
            ))}
        </div>
      </div>
    );
  }), []);

  // Node types mapping (stable)
  const nodeTypes = useMemo(() => {
    const map: Record<string, any> = { default: NodeRender };
    NODE_TYPES.forEach((t) => {
      map[t.id] = NodeRender;
      map[t.id.toLowerCase()] = NodeRender;
    });
    return map;
  }, [NodeRender]);

  // Preview-5 modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const { loading: previewLoading, error: previewError, results: previewResults, runPreview, cancelPreview } = usePreviewSeeds();
  // Debounce management: track last graph change time
  const lastChangeRef = React.useRef<number>(Date.now());
  const previewTimeoutRef = React.useRef<number | null>(null);

  // Highlighted nodes & edges from preview result hover
  const [highlightNodeIds, setHighlightNodeIds] = useState<Set<string>>(new Set());
  const [highlightEdgeIds, setHighlightEdgeIds] = useState<Set<string>>(new Set());
  // usePreviewSeeds now exposes aggregateError via error field per-seed; keep as is for compatibility


  // Recompute validation errors when edges or nodes change
  React.useEffect(() => {
    const errs = coreValidateConnection(edges, nodes);
    setErrors(errs);
  }, [edges, nodes]);

  // Derive styled edges and error count for rendering
  // Apply highlight styles
  const styledNodes = React.useMemo(
    () =>
      nodes.map((n) => {
        const highlight = highlightNodeIds.has(n.id)
          ? { border: '2px solid #ffd700' }
          : {};
        return { ...n, style: { ...n.style, ...highlight } };
      }),
    [nodes, highlightNodeIds]
  );

  const styledEdges = React.useMemo(
    () =>
      edges.map((e) => {
        const base = errors.find((err) => err.edgeId === e.id)
          ? { stroke: 'red', strokeWidth: 2 }
          : {};
        const highlight = highlightEdgeIds.has(e.id)
          ? { stroke: '#ffd700', strokeWidth: 3 }
          : {};
        return { ...e, style: { ...e.style, ...base, ...highlight } };
      }),
    [edges, errors, highlightEdgeIds]
  );
  const errorCount = errors.length;

  // Selected node & schema for inspector
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedSchema = selectedNode && selectedNode.type ? nodeSchemas[selectedNode.type as keyof typeof nodeSchemas] ?? null : null;

  const handleInspectorChange = (partial: Record<string, unknown>) => {
    if (!selectedNode) return;
    updateNode(selectedNode.id, partial);
  };

  // Edge drag handler
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    []
  );

  // Handle node drag from palette
  const handlePaletteDragStart = (nodeId: string) => {
    // No-op: drag data set in Palette, handled on drop
  };

  // Handle drop on canvas: create node of given type at position
  const { addNode, updateNode } = useGraphStore();

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
      addNode(newNode);
      setNodes((prev) => [...prev, newNode]);
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
      } catch { }
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
            <ReactFlow
              nodes={styledNodes}
              edges={styledEdges}
              data-testid="react-flow-canvas"
              onNodesChange={(changes) => {
                lastChangeRef.current = Date.now();
                onNodesChange(changes);
              }}
              onEdgesChange={(changes) => {
                lastChangeRef.current = Date.now();
                onEdgesChange(changes);
              }}
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
                const now = Date.now();
                const sinceChange = now - lastChangeRef.current;
                const run = () => {
                  runPreview({ nodes, edges });
                  setPreviewOpen(true);
                };
                if (sinceChange < 500) {
                  if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
                  previewTimeoutRef.current = setTimeout(run, 500 - sinceChange);
                } else {
                  run();
                }
              }}
              style={{ marginRight: 16, padding: '6px 16px', background: '#eee', color: '#23272f', border: '1px solid #ccc', borderRadius: 4, fontWeight: 500, cursor: 'pointer' }}
            >
              Preview
            </button>
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
            {correctionsEnabled && (
              <button
                onClick={() => setCorrectionsOpen(true)}
                style={{ 
                  marginRight: 16, 
                  padding: '6px 16px', 
                  background: correctionsOpen ? '#4a5568' : '#eee', 
                  color: correctionsOpen ? '#fff' : '#23272f', 
                  border: '1px solid #ccc', 
                  borderRadius: 4, 
                  fontWeight: 500, 
                  cursor: 'pointer' 
                }}
              >
                Corrections
              </button>
            )}
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
        <InspectorPanel
          node={selectedNode}
          schema={selectedSchema}
          onChange={handleInspectorChange}
        />
        <PreviewModal
          open={previewOpen}
          loading={previewLoading}
          error={previewError}
          results={previewResults}
          onClose={() => {
            cancelPreview();
            setPreviewOpen(false);
            setHighlightEdgeIds(new Set());
            setHighlightNodeIds(new Set());
          }}
          onCancel={cancelPreview}
          onResultHover={(idx) => {
            const res = previewResults[idx];
            if (res?.usedEdgeIds) {
              setHighlightEdgeIds(new Set(res.usedEdgeIds));
            } else {
              setHighlightEdgeIds(new Set());
            }
            if (res?.usedNodeIds) {
              setHighlightNodeIds(new Set(res.usedNodeIds));
            } else {
              setHighlightNodeIds(new Set());
            }
          }}
        />
        <CorrectionsPanel
          isOpen={correctionsOpen}
          onClose={() => setCorrectionsOpen(false)}
        />
      </div>
    </ReactFlowProvider>
  );
};

export default GraphEditor;