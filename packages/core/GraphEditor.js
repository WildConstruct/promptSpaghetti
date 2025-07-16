import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState, useMemo, useRef } from "react";
import { ReactFlowProvider, addEdge, Background, Controls, MiniMap, ReactFlow, ConnectionLineType, useReactFlow } from "reactflow";
import { InspectorPanel } from "./components/Inspector";
import { NodeRenderer } from "./components/NodeRenderer";
import { StatusBar } from "./components/StatusBar";
import { RestorePrompt } from "./components/RestorePrompt";
import { nodeSchemas } from "./nodeSchemas";
import { Palette } from "./Palette";
import { useGraphStore } from "./graphStore";
import { PreviewModal } from "./PreviewModal";
import { usePreviewSeeds } from "./usePreviewSeeds";
import { ResponsiveCorrectionsPanel } from "./ResponsiveCorrectionsPanel";
import { useCorrectionsEnabled } from "./correctionsStore";
import { useValidation } from "./hooks/useValidation";
import { useAutosave } from "./hooks/useAutosave";
import { useNodeUtils } from "./hooks/useNodeUtils";
import { WeightedChoiceIcon, ConcatIcon, OutputIcon, IncludeIcon, SetVariableIcon, GetVariableIcon, } from "./icons";
const NODE_TYPES = [
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
// Inner component that has access to React Flow instance
const GraphEditorInner = ({ initialNodes, initialEdges, validateConnection, }) => {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [statusMessage, setStatusMessage] = useState("");
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [paletteCollapsed, setPaletteCollapsed] = useState(false);
    const [correctionsOpen, setCorrectionsOpen] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [dragPreview, setDragPreview] = useState(null);
    const correctionsEnabled = useCorrectionsEnabled();
    const reactFlowInstance = useReactFlow();
    // Custom hooks
    const { getNodeMeta, getCategoryColor } = useNodeUtils({ nodeTypes: NODE_TYPES });
    const { showRestorePrompt, restoreDraft, setShowRestorePrompt, setRestoreDraft } = useAutosave({ nodes, edges });
    // Highlighted nodes & edges from preview result hover
    const [highlightNodeIds, setHighlightNodeIds] = useState(new Set());
    const [highlightEdgeIds, setHighlightEdgeIds] = useState(new Set());
    const { errors, styledEdges, styledNodes } = useValidation({
        edges,
        nodes,
        highlightNodeIds,
        highlightEdgeIds,
        validateConnection,
    });
    // Memoized node render component using modular NodeRenderer
    const NodeRender = useMemo(() => (props) => (_jsx(NodeRenderer, { id: props.id, data: props.data, selected: selectedNodeId === props.id, onSelect: setSelectedNodeId, getNodeMeta: getNodeMeta, getCategoryColor: getCategoryColor })), [selectedNodeId, getNodeMeta, getCategoryColor]);
    // Node types mapping - SIMPLIFIED to prevent infinite loops
    const nodeTypes = useMemo(() => {
        // Force everything to use default to prevent React Flow errors
        return { default: NodeRender };
    }, [NodeRender]);
    // Preview-5 modal state
    const [previewOpen, setPreviewOpen] = useState(false);
    const { loading: previewLoading, error: previewError, results: previewResults, runPreview, cancelPreview } = usePreviewSeeds();
    const lastChangeRef = useRef(Date.now());
    const previewTimeoutRef = useRef(null);
    // Selected node & schema for inspector
    const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
    const selectedSchema = selectedNode && selectedNode.data?.nodeType ? nodeSchemas[selectedNode.data.nodeType] ?? null : null;
    const handleInspectorChange = (partial) => {
        if (!selectedNode)
            return;
        // Update the graph store
        updateNode(selectedNode.id, partial);
        // Also update local React state immediately for UI responsiveness
        setNodes(prev => prev.map(n => n.id === selectedNode.id
            ? { ...n, data: { ...n.data, ...partial } }
            : n));
    };
    // Edge drag handler
    const onConnect = useCallback((connection) => {
        setEdges((eds) => addEdge(connection, eds));
    }, []);
    // Handle node drag from palette
    const handlePaletteDragStart = (nodeId) => {
        // No-op: drag data set in Palette, handled on drop
    };
    // Handle drop on canvas: create node of given type at position
    const { addNode, updateNode } = useGraphStore();
    const handleDrop = useCallback((event) => {
        event.preventDefault();
        const nodeType = event.dataTransfer.getData('application/node-type');
        if (!nodeType || !(nodeType in nodeSchemas))
            return;
        // Use React Flow's screenToFlowPosition for accurate positioning
        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });
        // Use Zod schema to get default params
        const schema = nodeSchemas[nodeType];
        const params = schema.parse({});
        const newNode = {
            id: `${nodeType}-${Date.now()}`,
            type: "default",
            position,
            data: { ...params, nodeType: nodeType },
            selected: false,
        };
        addNode(newNode);
        setNodes((prev) => [...prev, newNode]);
    }, [reactFlowInstance, addNode]);
    // Allow drop on canvas
    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }, []);
    // Node click handler
    const onNodeClick = useCallback((event, node) => {
        setSelectedNodeId(node.id);
    }, []);
    // Autosave and restore logic handled by useAutosave hook
    // Nodes/edges change handlers (validation handled by useValidation hook)
    const onNodesChange = useCallback((changes) => {
        setNodes((nds) => {
            return nds.map((node) => {
                const change = changes.find((c) => 'id' in c && c.id === node.id);
                // Show drag preview for drag operations
                if (change && 'position' in change && change.dragging) {
                    setDragPreview({ node: { ...node, ...change }, position: change.position || node.position });
                }
                else if (change && 'dragging' in change && !change.dragging) {
                    setDragPreview(null);
                }
                return change ? { ...node, ...change } : node;
            });
        });
    }, []);
    const onEdgesChange = useCallback((changes) => {
        setEdges((eds) => {
            return eds.map((edge) => {
                const change = changes.find((c) => 'id' in c && c.id === edge.id);
                return change ? { ...edge, ...change } : edge;
            });
        });
    }, []);
    return (_jsxs("div", { style: { position: "relative", width: "100%", height: "100%" }, children: [_jsx(RestorePrompt, { show: showRestorePrompt, draft: restoreDraft, onRestore: (nodes, edges) => {
                    setNodes(nodes);
                    setEdges(edges);
                    setShowRestorePrompt(false);
                    setStatusMessage('Draft Restored');
                    setTimeout(() => setStatusMessage(''), 3000);
                }, onDismiss: () => {
                    setShowRestorePrompt(false);
                    localStorage.removeItem('graphDraft');
                } }), _jsxs("div", { style: { display: 'flex', height: '100%' }, children: [_jsx(Palette, { nodes: NODE_TYPES, collapsed: paletteCollapsed, onToggle: () => setPaletteCollapsed((c) => !c), onDragStart: handlePaletteDragStart }), _jsxs("div", { style: { flex: 1, position: 'relative', overflow: 'visible' }, "data-testid": "react-flow-canvas-wrapper", children: [_jsxs(ReactFlow, { nodes: styledNodes, edges: styledEdges, "data-testid": "react-flow-canvas", onNodesChange: (changes) => {
                                    lastChangeRef.current = Date.now();
                                    onNodesChange(changes);
                                }, onEdgesChange: (changes) => {
                                    lastChangeRef.current = Date.now();
                                    onEdgesChange(changes);
                                }, onConnect: onConnect, onNodeClick: onNodeClick, fitView: true, style: { background: '#1a202c', height: '100%' }, nodeTypes: nodeTypes, onDrop: handleDrop, onDragOver: handleDragOver, 
                                // Node interaction
                                nodesDraggable: true, nodesConnectable: true, elementsSelectable: true, 
                                // Standard 3D-style mouse controls
                                panOnScroll: false, zoomOnScroll: true, panOnDrag: [1, 2], selectionOnDrag: false, zoomOnDoubleClick: false, 
                                // Keyboard shortcuts - completely disable all keyboard handling
                                deleteKeyCode: null, multiSelectionKeyCode: null, zoomActivationKeyCode: null, 
                                // Disable all keyboard event capturing
                                onKeyDown: (e) => {
                                    // Check if the event target is inside an input or textarea
                                    const target = e.target;
                                    const isFormElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
                                    const isInInspector = target.closest('aside') !== null;
                                    if (isFormElement || isInInspector) {
                                        // Don't capture keyboard events for form elements or inspector
                                        return;
                                    }
                                    // Only handle keyboard events for canvas interaction
                                    e.stopPropagation();
                                }, 
                                // Connection line style - Clean 90-degree lines
                                connectionLineStyle: { stroke: '#4a5568', strokeWidth: 2 }, connectionLineType: ConnectionLineType.Step, 
                                // Default edge options for clean 90-degree connections
                                defaultEdgeOptions: {
                                    type: 'step',
                                    style: { stroke: '#666', strokeWidth: 2 },
                                    markerEnd: { type: 'arrowclosed', color: '#666' }
                                }, 
                                // Default zoom/pan settings
                                minZoom: 0.1, maxZoom: 4, defaultViewport: { x: 0, y: 0, zoom: 1 }, children: [_jsx(Background, { color: "#2d3748", gap: 16 }), _jsx(MiniMap, { nodeColor: () => '#363a45', maskColor: "#181b21BB" }), _jsx(Controls, {})] }), _jsxs("div", { style: {
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
                                }, onClick: () => setShowControls(!showControls), children: [_jsxs("div", { style: { fontWeight: 600, marginBottom: 4, color: '#e2e8f0' }, children: ["\uD83D\uDDB1\uFE0F Controls ", showControls ? '▼' : '▶'] }), showControls && (_jsxs("div", { style: { marginTop: 8, lineHeight: 1.6 }, children: [_jsxs("div", { children: [_jsx("b", { children: "Pan:" }), " Left-click + drag on canvas"] }), _jsxs("div", { children: [_jsx("b", { children: "Zoom:" }), " Mouse wheel / trackpad scroll"] }), _jsxs("div", { children: [_jsx("b", { children: "Select:" }), " Click node"] }), _jsxs("div", { children: [_jsx("b", { children: "Multi-select:" }), " Shift/Ctrl + Click"] }), _jsxs("div", { children: [_jsx("b", { children: "Connect:" }), " Drag from output port"] }), _jsxs("div", { children: [_jsx("b", { children: "Delete:" }), " Select + Delete/Backspace"] }), _jsxs("div", { children: [_jsx("b", { children: "Alternative Pan:" }), " Middle-click + drag"] })] }))] })] }), _jsx(InspectorPanel, { node: selectedNode, schema: selectedSchema, onChange: handleInspectorChange })] }), _jsx(StatusBar, { statusMessage: statusMessage, errors: errors, onPreview: () => {
                    const now = Date.now();
                    const sinceChange = now - lastChangeRef.current;
                    const run = () => {
                        runPreview({ nodes, edges });
                        setPreviewOpen(true);
                    };
                    if (sinceChange < 500) {
                        if (previewTimeoutRef.current)
                            clearTimeout(previewTimeoutRef.current);
                        previewTimeoutRef.current = setTimeout(run, 500 - sinceChange);
                    }
                    else {
                        run();
                    }
                }, onSaveJson: () => {
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
                }, onCorrections: () => setCorrectionsOpen(true), correctionsEnabled: correctionsEnabled, correctionsOpen: correctionsOpen }), _jsx(PreviewModal, { open: previewOpen, loading: previewLoading, error: previewError, results: previewResults, onClose: () => {
                    cancelPreview();
                    setPreviewOpen(false);
                    setHighlightEdgeIds(new Set());
                    setHighlightNodeIds(new Set());
                }, onCancel: cancelPreview, onResultHover: (idx) => {
                    const res = previewResults[idx];
                    if (res?.usedEdgeIds) {
                        setHighlightEdgeIds(new Set(res.usedEdgeIds));
                    }
                    else {
                        setHighlightEdgeIds(new Set());
                    }
                    if (res?.usedNodeIds) {
                        setHighlightNodeIds(new Set(res.usedNodeIds));
                    }
                    else {
                        setHighlightNodeIds(new Set());
                    }
                } }), _jsx(ResponsiveCorrectionsPanel, { isOpen: correctionsOpen, onClose: () => setCorrectionsOpen(false) })] }));
};
// Wrapper component with ReactFlowProvider
export const GraphEditor = (props) => {
    return (_jsx(ReactFlowProvider, { children: _jsx(GraphEditorInner, { ...props }) }));
};
export default GraphEditor;
