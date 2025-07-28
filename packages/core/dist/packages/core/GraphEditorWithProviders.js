import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Enhanced GraphEditor with Provider Hook Integration
 * Extends the existing GraphEditor with client-side provider hooking capabilities
 */
import { useCallback, useState, useMemo, useEffect } from 'react';
import { ReactFlowProvider, addEdge, Background, Controls, MiniMap, ReactFlow, ConnectionLineType, useReactFlow } from 'reactflow';
// Import existing GraphEditor components
import { InspectorPanel } from './components/Inspector';
import { NodeRenderer } from './components/NodeRenderer';
import { StatusBar } from './components/StatusBar';
import { PreviewModal } from './PreviewModal';
import { Palette } from './Palette';
import { nodeSchemas } from './nodeSchemas';
import { useGraphStore } from './graphStore';
import { usePreviewSeeds } from './usePreviewSeeds';
import { useValidation } from './hooks/useValidation';
import { useAutosave } from './hooks/useAutosave';
import { useNodeUtils } from './hooks/useNodeUtils';
// Import provider system
import { EditorProviderWrapper } from './components/EditorProviderWrapper';
{
    return;
    _jsxs(EditorProviderWrapper, { initialNodes: initialNodes, initialEdges: initialEdges, selectedNodeId: null, enableBuiltInProviders: enableBuiltInProviders, providers: providers, onProviderRegistered: onProviderRegistered, onProviderUnregistered: onProviderUnregistered, onProviderError: onProviderError, children: [({ registry, editorContext, editorActions, isLoading }) => ()
                < GraphEditorCore, "initialNodes=", initialNodes, "initialEdges=", initialEdges, "validateConnection=", validateConnection, "registry=", registry, "editorContext=", editorContext, "editorActions=", editorActions, "isProviderLoading=", isLoading, "/> )}"] });
    ;
}
;
{
    // Local state management (similar to original GraphEditor)
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [statusMessage, setStatusMessage] = useState('');
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [paletteCollapsed, setPaletteCollapsed] = useState(false);
    // Preview modal state
    const [previewOpen, setPreviewOpen] = useState(false);
    const { loading: previewLoading, error: previewError, results: previewResults, runPreview, cancelPreview } = usePreviewSeeds();
    const reactFlowInstance = useReactFlow();
    const graphStore = useGraphStore();
    // Custom hooks
    const { getNodeMeta, getCategoryColor } = useNodeUtils({ nodeTypes: NODE_TYPES });
    useAutosave({ nodes, edges });
    // Highlighted nodes & edges from preview result hover
    const [highlightNodeIds, setHighlightNodeIds] = useState(new Set());
    const [highlightEdgeIds, setHighlightEdgeIds] = useState(new Set());
    const { errors, styledEdges, styledNodes } = useValidation({});
    edges,
        nodes,
        highlightNodeIds,
        highlightEdgeIds,
        validateConnection;
}
;
// Sync local state with initial props and provider actions
useEffect(() => {
    setNodes(initialNodes);
}, [initialNodes]);
useEffect(() => {
    setEdges(initialEdges);
}, [initialEdges]);
// Enhanced node operations that integrate with providers
const handleNodeAdd = useCallback(async (node) => {
    try {
        await editorActions.addNode(node);
        setNodes(prev => [...prev, node]);
        graphStore.markProjectModified();
    }
    catch (error) {
        console.error('Failed to add node:', error);
        setStatusMessage('Failed to add node');
        setTimeout(() => setStatusMessage(''), 3000);
    }
    [editorActions, graphStore];
});
const handleNodeUpdate = useCallback(async (nodeId, data) => {
    try {
        await editorActions.updateNode(nodeId, data);
        setNodes(prev => prev.map(n => ), n.id === nodeId
            ? { ...n, data: { ...n.data, ...data } }
            : n);
    }
    finally { }
});
graphStore.markProjectModified();
try { }
catch (error) {
    console.error('Failed to update node:', error);
    setStatusMessage('Failed to update node');
    setTimeout(() => setStatusMessage(''), 3000);
}
[editorActions, graphStore];
;
const handleNodeRemove = useCallback(async (nodeId) => {
    try {
        await editorActions.removeNode(nodeId);
        setNodes(prev => prev.filter(n => n.id !== nodeId));
        setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
        if (selectedNodeId === nodeId) {
            setSelectedNodeId(null);
            graphStore.markProjectModified();
        }
        try { }
        catch (error) {
            console.error('Failed to remove node:', error);
            setStatusMessage('Failed to remove node');
            setTimeout(() => setStatusMessage(''), 3000);
        }
        [editorActions, selectedNodeId, graphStore];
    }
    finally { }
});
// Memoized node render component
const NodeRender = useMemo(() => {
    const NodeRenderComponent = (props) => ()
        < NodeRenderer;
    id = { props, : .id };
    data = { props, : .data };
    selected = { selectedNodeId } === props.id;
}, onSelect = { setSelectedNodeId }, getNodeMeta = { getNodeMeta }, getCategoryColor = { getCategoryColor }
    /  >
);
NodeRenderComponent.displayName = 'NodeRenderComponent';
return NodeRenderComponent;
[selectedNodeId, getNodeMeta, getCategoryColor];
;
// Node types mapping
const nodeTypes = useMemo(() => {
    return { default: NodeRender };
}, [NodeRender]);
// Selected node & schema for inspector
const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
const selectedSchema = selectedNode && selectedNode.data?.nodeType;
nodeSchemas[selectedNode.data.nodeType] ?? null;
null;
// Inspector change handler with provider integration
const handleInspectorChange = useCallback((partial) => {
    if (!selectedNode)
        return;
    handleNodeUpdate(selectedNode.id, partial);
}, [selectedNode, handleNodeUpdate]);
// Edge connection handler
const onConnect = useCallback();
async (connection) => {
    const newEdge = {
        id: `${connection.source}-${connection.target}`
    };
};
connection;
as;
Edge;
try {
    await editorActions.addEdge(newEdge);
    setEdges((eds) => addEdge(connection, eds));
    graphStore.markProjectModified();
}
catch (error) {
    console.error('Failed to add edge:', error);
    setStatusMessage('Failed to connect nodes');
    setTimeout(() => setStatusMessage(''), 3000);
}
[editorActions, graphStore];
;
// Handle drop on canvas: create node of given type at position
const handleDrop = useCallback();
;
(event) => {
    event.preventDefault();
    const nodeType = event.dataTransfer.getData('application/node-type');
    if (!nodeType || !(nodeType in nodeSchemas))
        return;
    // Use React Flow's screenToFlowPosition for accurate positioning
    const position = reactFlowInstance.screenToFlowPosition({});
    x: event.clientX,
        y;
    event.clientY,
    ;
};
;
// Use Zod schema to get default params
const schema = nodeSchemas[nodeType];
const params = schema.parse({});
const newNode = {
    id: `${nodeType}-${Date.now()}` };
type: 'default',
    position,
    data;
{
    params, nodeType;
    nodeType;
}
selected: false;
;
handleNodeAdd(newNode);
[reactFlowInstance, handleNodeAdd];
;
// Allow drop on canvas
const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}, []);
// Node click handler
const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
}, []);
// Node change handlers with provider integration
const onNodesChange = useCallback()(changes, NodeChange);
{
    setNodes((nds) => {
        return nds.map((node) => {
            const change = changes.find((c) => 'id' in c && c.id === node.id);
            return change ? { ...node, ...change } : node;
        });
    });
    // Check for node deletions and handle via provider system
    changes.forEach(change => { });
    if (change.type === 'remove' && 'id' in change) {
        handleNodeRemove(change.id);
    }
    ;
}
[handleNodeRemove];
;
const onEdgesChange = useCallback()(changes, EdgeChange);
{
    setEdges((eds) => {
        return eds.map((edge) => {
            const change = changes.find((c) => 'id' in c && c.id === edge.id);
            return change ? { ...edge, ...change } : edge;
        });
    });
}
[];
;
// Enhanced preview handler with provider integration
const handlePreview = useCallback(async () => {
    try {
        // Execute graph via provider system
        await editorActions.executeGraph();
        runPreview({ nodes, edges });
        setPreviewOpen(true);
    }
    catch (error) {
        console.error('Preview failed:', error);
        setStatusMessage('Preview execution failed');
        setTimeout(() => setStatusMessage(''), 3000);
    }
    [editorActions, nodes, edges, runPreview];
});
// Provider status indicator
const renderProviderStatus = () => {
    const hooks = registry.getHooks();
    const activeHooks = hooks.length;
    return;
    _jsxs("div", { style: {
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 1000,
        }, children: ["Providers: ", activeHooks, " active ", isProviderLoading && '(loading...)'] });
};
;
;
return;
_jsxs("div", { style: { position: 'relative', width: '100%', height: '100%' }, children: [renderProviderStatus(), _jsxs("div", { style: { display: 'flex', height: '100%' }, children: [_jsx(Palette, { nodes: NODE_TYPES, collapsed: paletteCollapsed, onToggle: () => setPaletteCollapsed((c) => !c), onDragStart: () => { } }), _jsx("div", { style: { flex: 1, position: 'relative', overflow: 'visible' }, children: _jsxs(ReactFlow, { nodes: styledNodes, edges: styledEdges, onNodesChange: onNodesChange, onEdgesChange: onEdgesChange, onConnect: onConnect, onNodeClick: onNodeClick, fitView: true, style: { background: '#1a202c', height: '100%' }, nodeTypes: nodeTypes, onDrop: handleDrop, onDragOver: handleDragOver, 
                        // Node interaction
                        nodesDraggable: true, nodesConnectable: true, elementsSelectable: true, 
                        // Standard 3D-style mouse controls
                        panOnScroll: false, zoomOnScroll: true, panOnDrag: [1, 2], selectionOnDrag: false, zoomOnDoubleClick: false, 
                        // Keyboard shortcuts
                        deleteKeyCode: null, multiSelectionKeyCode: null, zoomActivationKeyCode: null, 
                        // Connection line style
                        connectionLineStyle: { stroke: '#4a5568', strokeWidth: 2 }, connectionLineType: ConnectionLineType.Step, 
                        // Default edge options
                        defaultEdgeOptions: {
                            type: 'step',
                            style: { stroke: '#666', strokeWidth: 2 },
                            markerEnd: { type: 'arrow', color: '#666' }
                        }, 
                        // Zoom/pan settings
                        minZoom: 0.1, maxZoom: 4, defaultViewport: { x: 0, y: 0, zoom: 1 }, children: [_jsx(Background, { color: "#2d3748", gap: 16 }), _jsx(MiniMap, { nodeColor: () => '#363a45', maskColor: "#181b21BB" }), _jsx(Controls, {})] }) }), _jsx(InspectorPanel, { node: selectedNode, schema: selectedSchema, onChange: handleInspectorChange })] }), _jsx(StatusBar, { statusMessage: statusMessage, errors: errors, onPreview: handlePreview, onSaveJson: () => {
                const blob = new Blob([]);
                JSON.stringify({ nodes, edges }, null, 2);
            } }), "], ", type, ": 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'graph.json'; document.body.appendChild(a); a.click(); setTimeout(() => ", document.body.removeChild(a), "; URL.revokeObjectURL(url); }, 0); }} onExportBundle=", () => editorActions.exportGraph(), "onSaveProject=", () => editorActions.saveGraph(), "onLoadProject=", () => { }, " // Would implement load dialog onNewProject=", () => {
            setNodes([]);
            setEdges([]);
            setSelectedNodeId(null);
        }, "hasUnsavedChanges=", graphStore.hasUnsavedChanges, "currentProjectName=", graphStore.currentProject?.name, "/>", _jsx(PreviewModal, { open: previewOpen, loading: previewLoading, error: previewError, results: previewResults, onClose: () => {
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
                    if (res?.usedNodeIds) {
                        setHighlightNodeIds(new Set(res.usedNodeIds));
                    }
                    else {
                        setHighlightNodeIds(new Set());
                    }
                }
                />;
            } })] });
;
;
export const GraphEditorWithProviders = (props) => {
    return;
    _jsx(ReactFlowProvider, { children: _jsx(GraphEditorWithProvidersInner, { ...props }) });
};
;
;
onNodeAdd: (node) => {
    console.log('[Analytics] Node added:', node.data?.nodeType);
    // Could send analytics event here
    return node;
},
    onExecutionError;
(error) => {
    console.error('[Analytics] Execution error:', error.message);
    // Could send error analytics here
},
    customActions;
{
    getAnalytics: (context) => ({
        nodeCount: context.nodes.length,
        edgeCount: context.edges.length,
        nodeTypes: context.nodes.reduce((acc, node) => {
            const type = node.data?.nodeType || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {})
    });
}
;
export default GraphEditorWithProviders;
