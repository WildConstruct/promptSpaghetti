import React, { useCallback, useState, useMemo, useRef } from "react";
import { Edge, Node, ReactFlowProvider, addEdge, Background, Controls, MiniMap, ReactFlow, Connection, OnConnect, OnEdgesChange, OnNodesChange, EdgeChange, NodeChange, ConnectionLineType } from "reactflow";
import { InspectorPanel } from "./components/Inspector";
import { NodeRenderer } from "./components/NodeRenderer";
import { StatusBar } from "./components/StatusBar";
import { RestorePrompt } from "./components/RestorePrompt";
import { nodeSchemas } from "./nodeSchemas";
import { Palette, NodeMeta } from "./Palette";
import { useGraphStore } from "./graphStore";
import { PreviewModal } from "./PreviewModal";
import { usePreviewSeeds } from "./usePreviewSeeds";
import { CorrectionsPanel } from "./CorrectionsPanel";
import { useCorrectionsEnabled } from "./correctionsStore";
import { useValidation } from "./hooks/useValidation";
import { useAutosave } from "./hooks/useAutosave";
import { useNodeUtils } from "./hooks/useNodeUtils";
import { ValidationError } from "./validation";
import {
  WeightedChoiceIcon,
  ConcatIcon,
  OutputIcon,
  IncludeIcon,
  SetVariableIcon,
  GetVariableIcon,
} from "./icons";

interface GraphEditorProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  validateConnection?: (edges: Edge[], nodes: Node[]) => ValidationError[];
}


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
  validateConnection,
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [correctionsOpen, setCorrectionsOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  const correctionsEnabled = useCorrectionsEnabled();

  // Custom hooks
  const { getNodeMeta, getCategoryColor } = useNodeUtils({ nodeTypes: NODE_TYPES });
  const { showRestorePrompt, restoreDraft, setShowRestorePrompt, setRestoreDraft } = useAutosave({ nodes, edges });
  
  // Highlighted nodes & edges from preview result hover
  const [highlightNodeIds, setHighlightNodeIds] = useState<Set<string>>(new Set());
  const [highlightEdgeIds, setHighlightEdgeIds] = useState<Set<string>>(new Set());
  
  const { errors, styledEdges, styledNodes } = useValidation({
    edges,
    nodes,
    highlightNodeIds,
    highlightEdgeIds,
    validateConnection,
  });

  // Memoized node render component using modular NodeRenderer
  const NodeRender = useMemo(() => (props: any) => (
    <NodeRenderer
      id={props.id}
      data={props.data}
      selected={selectedNodeId === props.id}
      onSelect={setSelectedNodeId}
      getNodeMeta={getNodeMeta}
      getCategoryColor={getCategoryColor}
    />
  ), [selectedNodeId, getNodeMeta, getCategoryColor]);

  // Node types mapping - SIMPLIFIED to prevent infinite loops
  const nodeTypes = useMemo(() => {
    // Force everything to use default to prevent React Flow errors
    return { default: NodeRender };
  }, [NodeRender]);

  // Preview-5 modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const { loading: previewLoading, error: previewError, results: previewResults, runPreview, cancelPreview } = usePreviewSeeds();
  const lastChangeRef = useRef<number>(Date.now());
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Selected node & schema for inspector
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedSchema = selectedNode && selectedNode.data?.nodeType ? nodeSchemas[selectedNode.data.nodeType as keyof typeof nodeSchemas] ?? null : null;

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
        data: { ...params, nodeType: nodeType },
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

  // Autosave and restore logic handled by useAutosave hook

  // Nodes/edges change handlers (validation handled by useValidation hook)
  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        return nds.map((node) => {
          const change = changes.find((c) => 'id' in c && c.id === node.id);
          return change ? { ...node, ...change } : node;
        });
      });
    },
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        return eds.map((edge) => {
          const change = changes.find((c) => 'id' in c && c.id === edge.id);
          return change ? { ...edge, ...change } : edge;
        });
      });
    },
    []
  );





  return (
    <ReactFlowProvider>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <RestorePrompt
          show={showRestorePrompt}
          draft={restoreDraft}
          onRestore={(nodes, edges) => {
            setNodes(nodes);
            setEdges(edges);
            setShowRestorePrompt(false);
            setStatusMessage('Draft Restored');
            setTimeout(() => setStatusMessage(''), 3000);
          }}
          onDismiss={() => {
            setShowRestorePrompt(false);
            localStorage.removeItem('graphDraft');
          }}
        />
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
              style={{ background: '#1a202c', height: '100%' }}
              nodeTypes={nodeTypes}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              // Node interaction
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={true}
              // Standard 3D-style mouse controls
              panOnScroll={false} // Disable scroll to pan
              zoomOnScroll={true} // Enable scroll to zoom (standard 3D behavior)
              panOnDrag={[1, 2]} // Pan with left or middle mouse button
              selectionOnDrag={false} // Disable box selection on drag
              zoomOnDoubleClick={false} // Disable double-click zoom
              // Keyboard shortcuts
              deleteKeyCode={["Delete", "Backspace"]} // Delete selected nodes
              multiSelectionKeyCode={["Shift", "Control", "Meta"]} // Multi-select with Shift/Ctrl/Cmd
              zoomActivationKeyCode={["Control", "Meta"]} // Zoom with Ctrl/Cmd + scroll
              // Connection line style
              connectionLineStyle={{ stroke: '#4a5568', strokeWidth: 2 }}
              connectionLineType={ConnectionLineType.SmoothStep}
              // Default zoom/pan settings
              minZoom={0.1}
              maxZoom={4}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            >
              <Background color="#2d3748" gap={16} />
              <MiniMap nodeColor={() => '#363a45'} maskColor="#181b21BB" />
              <Controls />
            </ReactFlow>
            
            {/* Mouse Controls Help Overlay */}
            <div style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              background: 'rgba(42, 42, 42, 0.9)',
              border: '1px solid #444',
              borderRadius: 4,
              padding: 8,
              fontSize: 11,
              color: '#a0aec0',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => setShowControls(!showControls)}
            >
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#e2e8f0' }}>
                🖱️ Controls {showControls ? '▼' : '▶'}
              </div>
              {showControls && (
                <div style={{ marginTop: 8, lineHeight: 1.6 }}>
                  <div><b>Pan:</b> Left-click + drag on canvas</div>
                  <div><b>Zoom:</b> Mouse wheel / trackpad scroll</div>
                  <div><b>Select:</b> Click node</div>
                  <div><b>Multi-select:</b> Shift/Ctrl + Click</div>
                  <div><b>Connect:</b> Drag from output port</div>
                  <div><b>Delete:</b> Select + Delete/Backspace</div>
                  <div><b>Alternative Pan:</b> Middle-click + drag</div>
                </div>
              )}
            </div>
          </div>
          <InspectorPanel
            node={selectedNode}
            schema={selectedSchema}
            onChange={handleInspectorChange}
          />
        </div>
        <StatusBar
          statusMessage={statusMessage}
          errors={errors}
          onPreview={() => {
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
          onSaveJson={() => {
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
          onCorrections={() => setCorrectionsOpen(true)}
          correctionsEnabled={correctionsEnabled}
          correctionsOpen={correctionsOpen}
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