import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState, useMemo, useEffect } from 'react';
import ReactFlow, { Background, Controls, ConnectionMode, Panel, ReactFlowProvider, } from 'reactflow';
import 'reactflow/dist/style.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// Import hooks
import { useGraphState, useKeyboardHandlers, usePreviewEngine, useDragDropHandlers, useContextMenu, } from './hooks';
// Import services
import { NodeFactory } from './services';
// Import components
import { epic1NodeTypes } from './nodes';
import { droppableEpic1NodeTypes } from './nodes/droppableNodes';
import { CustomMinimap } from './CustomMinimap';
import { ConnectionFeedback, useConnectionValidation } from './ConnectionFeedback';
import { ConnectionToast, useToast } from './ConnectionToast';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { PanZoomControls } from './PanZoomControls';
import { TabbedSidePanel } from './TabbedSidePanel';
import { NodeToolbar } from './NodeToolbar';
import { NodePalette } from './NodePalette';
import { NodeContextMenu } from './nodes/NodeContextMenu';
import { SaveAsPresetDialog } from './asset-library/SaveAsPresetDialog';
import { SafeReactFlowWrapper } from './SafeReactFlowWrapper';
import { edgeTypes } from './EdgeRenderingFix';
import { useNodeInteractions } from './interactions/NodeInteractionEnhancer';
import { useMicroInteractions } from './animations/MicroInteractions';
import { PromptParser } from '../../runtime/nodes/epic1/PromptParser';
// Import styles
import './ReactFlowOverrides.css';
import './Epic1GraphEditor.css';
import './KeyboardShortcuts.css';
import './PanZoomControls.css';
/**
 * Refactored Epic 1 Graph Editor - now ~400 lines instead of 1100+
 * Uses extracted hooks and services for better maintainability
 */
const Epic1GraphEditorInner = ({ initialNodes = [], initialEdges = [], onNodesChange: onNodesChangeProp, onEdgesChange: onEdgesChangeProp, onExecute, showPreview = true, previewPosition = 'right', previewWidth = '400px', previewDebounceDelay = 300, previewSeeds, showAssetLibrary = true, assetLibraryPosition = 'left', }) => {
    const nodeTypes = showAssetLibrary ? droppableEpic1NodeTypes : epic1NodeTypes;
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(showPreview);
    const [nodePaletteCollapsed, setNodePaletteCollapsed] = useState(false);
    // Toast system
    const { toasts, showToast, dismissToast } = useToast();
    // Micro-interactions
    const { addNodeWithBounce, highlightConnection } = useNodeInteractions();
    const { interactions, trigger } = useMicroInteractions();
    // Use extracted hooks
    const { nodes, edges, activatedEdges, selectedNodeId, isDragging, isSelecting, setNodes, setEdges, setSelectedNodeId, setIsSelecting, onNodesChange, onEdgesChange, onConnect: baseOnConnect, handleNodeClick, handleEdgeClick, handlePaneClick, } = useGraphState({
        initialNodes,
        initialEdges,
        onNodesChangeProp,
        onEdgesChangeProp,
    });
    // Enhanced onConnect with toast
    const onConnect = useCallback((params) => {
        baseOnConnect(params);
        if (params.source && params.target) {
            highlightConnection(params.source, params.target);
            showToast('success', 'Connection created!');
        }
    }, [baseOnConnect, highlightConnection, showToast]);
    // Preview engine hook
    const { previewEngine, convertToRuntimeGraph, handlePreviewSeedChange, } = usePreviewEngine({
        previewDebounceDelay,
        previewSeeds,
        nodes,
        edges,
        isPreviewVisible,
        isDragging,
    });
    // Keyboard handlers hook
    const handleTogglePreview = useCallback(() => {
        setIsPreviewVisible(prev => !prev);
        showToast('info', `Preview ${!isPreviewVisible ? 'shown' : 'hidden'}`);
    }, [isPreviewVisible, showToast]);
    const { keyboardHandlers } = useKeyboardHandlers({
        nodes,
        edges,
        setNodes,
        setEdges,
        showToast,
        onTogglePreview: handleTogglePreview,
    });
    // Drag & Drop handlers
    const { onDragOver, onDrop, insertPresetByMeta } = useDragDropHandlers({
        setNodes,
        setEdges,
        reactFlowInstance,
        showToast,
        addNodeWithBounce,
    });
    // Context menu hook
    const { contextMenuPosition, contextMenuNodeId, saveAsPresetNodeId, saveAsPresetNode, setSaveAsPresetNodeId, setContextMenuPosition, handleSaveAsPreset, handleSavePreset, } = useContextMenu({ nodes, showToast });
    // Connection validation
    const { isValidConnection } = useConnectionValidation(nodes, edges, (error) => {
        showToast('error', error);
    });
    // Handle node data updates (from inline editing)
    const handleNodeEdit = useCallback((nodeId, newValue) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === nodeId) {
                return NodeFactory.updateNodeData(node, {
                    value: newValue,
                    text: newValue,
                    variableName: newValue,
                    separator: newValue,
                    label: newValue,
                    options: node.type === 'weightedChoice' ? JSON.parse(newValue) : node.data.options,
                });
            }
            return node;
        }));
    }, [setNodes]);
    // Create node data with edit handlers
    const createNodeData = useCallback((baseData, nodeId) => {
        return {
            ...baseData,
            onEdit: (newValue) => handleNodeEdit(nodeId, newValue),
            onEditStart: () => setSelectedNodeId(nodeId),
            onEditEnd: () => setSelectedNodeId(null),
            onContextMenu: (event) => {
                setContextMenuPosition({ x: event.clientX, y: event.clientY });
            },
        };
    }, [handleNodeEdit, setSelectedNodeId, setContextMenuPosition]);
    // Enhanced nodes with edit handlers
    const enhancedNodes = useMemo(() => {
        return nodes.map((node) => {
            const nodeData = createNodeData(node.data, node.id);
            return {
                ...node,
                type: node.type || 'textBlock',
                position: node.position || { x: 0, y: 0 },
                data: nodeData,
                selected: node.selected || node.id === selectedNodeId,
                width: node.width || undefined,
                height: node.height || undefined,
            };
        });
    }, [nodes, selectedNodeId, createNodeData]);
    // Execute button handler
    const handleExecute = () => {
        onExecute?.(enhancedNodes, edges);
    };
    // Handle ReactFlow initialization
    const onInit = useCallback((instance) => {
        setReactFlowInstance(instance);
        setTimeout(() => {
            instance.fitView({
                padding: 0.1,
                includeHiddenNodes: false,
                minZoom: 0.5,
                maxZoom: 1.5
            });
        }, 100);
    }, []);
    // Listen for prompt paste events from tutorial
    useEffect(() => {
        const handlePromptPasted = async (event) => {
            const { prompt } = event.detail;
            if (!prompt)
                return;
            try {
                const parser = new PromptParser();
                const parsed = parser.parse(prompt);
                // Create nodes from parsed prompt
                const newNodes = [];
                const newEdges = [];
                let xPos = 100;
                let yPos = 100;
                let lastNodeId = null;
                parsed.segments.forEach((segment, index) => {
                    const nodeId = `parsed-${Date.now()}-${index}`;
                    if (segment.type === 'text') {
                        newNodes.push(NodeFactory.createNode('textBlock', { x: xPos, y: yPos }, {
                            text: segment.content,
                            value: segment.content
                        }));
                    }
                    else if (segment.type === 'choice') {
                        const options = segment.options.map((opt, idx) => ({
                            id: `option-${idx + 1}`,
                            text: opt,
                            weight: Math.floor(100 / segment.options.length)
                        }));
                        newNodes.push(NodeFactory.createNode('weightedChoice', { x: xPos, y: yPos }, {
                            options,
                            value: JSON.stringify(options, null, 2)
                        }));
                    }
                    // Create edge from previous node
                    if (lastNodeId) {
                        newEdges.push({
                            id: `edge-${lastNodeId}-${nodeId}`,
                            source: lastNodeId,
                            target: nodeId
                        });
                    }
                    lastNodeId = nodeId;
                    xPos += 250;
                    if (xPos > 800) {
                        xPos = 100;
                        yPos += 150;
                    }
                });
                // Add output node at the end
                const outputNode = NodeFactory.createNode('output', { x: 400, y: yPos + 150 });
                newNodes.push(outputNode);
                if (lastNodeId) {
                    newEdges.push({
                        id: `edge-${lastNodeId}-${outputNode.id}`,
                        source: lastNodeId,
                        target: outputNode.id
                    });
                }
                setNodes(newNodes);
                setEdges(newEdges);
                if (reactFlowInstance) {
                    setTimeout(() => {
                        reactFlowInstance.fitView({ padding: 0.2 });
                    }, 100);
                }
                showToast('success', 'Prompt parsed and nodes created!');
            }
            catch (error) {
                console.error('Failed to parse prompt:', error);
                showToast('error', 'Failed to parse prompt');
            }
        };
        window.addEventListener('epic1:promptPasted', handlePromptPasted);
        return () => {
            window.removeEventListener('epic1:promptPasted', handlePromptPasted);
        };
    }, [setNodes, setEdges, reactFlowInstance, showToast]);
    // Notify parent of changes
    useEffect(() => {
        onNodesChangeProp?.(enhancedNodes);
    }, [enhancedNodes, onNodesChangeProp]);
    useEffect(() => {
        onEdgesChangeProp?.(edges);
    }, [edges, onEdgesChangeProp]);
    const editorStyle = useMemo(() => ({
        height: '100%',
        position: 'relative'
    }), []);
    return (_jsxs("div", { className: "epic1-graph-editor", style: editorStyle, onDrop: onDrop, onDragOver: onDragOver, children: [_jsxs(ReactFlow, { nodes: enhancedNodes, edges: edges.map(edge => ({
                    ...edge,
                    animated: activatedEdges.has(edge.id),
                    className: `${activatedEdges.has(edge.id) ? 'activated' : ''} ${edge.selected ? 'selected' : ''}`.trim()
                })), onNodesChange: onNodesChange, onEdgesChange: onEdgesChange, onConnect: onConnect, onPaneClick: handlePaneClick, onSelectionStart: () => setIsSelecting(true), onSelectionEnd: () => setIsSelecting(false), onNodeClick: handleNodeClick, onEdgeClick: handleEdgeClick, onInit: onInit, nodeTypes: nodeTypes, edgeTypes: edgeTypes, isValidConnection: isValidConnection, connectionMode: ConnectionMode.Loose, connectionLineType: "smoothstep", defaultEdgeOptions: {
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#9ca3af', strokeWidth: 3 }
                }, fitView: true, fitViewOptions: {
                    padding: 0.2,
                    includeHiddenNodes: false,
                    minZoom: 0.3,
                    maxZoom: 2
                }, defaultViewport: { x: 0, y: 0, zoom: 0.8 }, attributionPosition: "bottom-left", panOnScroll: false, zoomOnScroll: true, zoomOnPinch: true, panOnDrag: [1, 2], selectionOnDrag: true, panActivationKeyCode: "Space", selectionMode: "partial", nodesDraggable: true, nodesConnectable: true, elementsSelectable: true, selectNodesOnDrag: true, deleteKeyCode: ['Delete', 'Backspace'], multiSelectionKeyCode: "Shift", nodeDragThreshold: 5, children: [_jsx(Background, { variant: "dots", gap: 16, size: 1, color: "#333333" }), _jsx(Controls, {}), nodes.length > 0 && (_jsx(CustomMinimap, { nodes: nodes, edges: edges, style: {
                            left: nodePaletteCollapsed ? 50 : 210,
                            top: 70,
                            width: '200px',
                            height: '120px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            zIndex: 1000,
                            transition: 'left 0.3s ease-in-out'
                        } })), _jsx(Panel, { position: "top-right", children: _jsxs("div", { className: "epic1-controls", children: [_jsx("button", { className: "epic1-preview-toggle", onClick: handleTogglePreview, title: "Toggle preview (P)", children: isPreviewVisible ? '👁️' : '👁️‍🗨️' }), onExecute && (_jsx("button", { className: "epic1-execute-button", onClick: handleExecute, children: "Execute Graph" }))] }) }), _jsx(Panel, { position: "bottom-center", children: _jsx("div", { className: "epic1-instructions", children: "Click any node to edit \u2022 Tab/Shift+Tab to navigate \u2022 Enter to confirm \u2022 Escape to cancel \u2022 Press P for preview \u2022 Press ? for help" }) }), _jsx(ConnectionFeedback, { nodes: nodes, edges: edges }), _jsx(SafeReactFlowWrapper, { children: _jsx(PanZoomControls, { position: "bottom-right" }) })] }), _jsx(SafeReactFlowWrapper, { children: _jsx(KeyboardShortcuts, { ...keyboardHandlers }) }), toasts.map((toast) => (_jsx(ConnectionToast, { message: toast, onDismiss: () => dismissToast(toast.id) }, toast.id))), _jsx(NodePalette, { position: "left", defaultCollapsed: false, onCollapsedChange: setNodePaletteCollapsed }), _jsx(NodeToolbar, { position: "top" }), (showPreview || showAssetLibrary) && (_jsx(TabbedSidePanel, { previewEngine: previewEngine, onPresetDrag: (preset) => {
                    // TODO: Implement preset application to nodes
                }, onPresetSelect: (preset) => {
                    // TODO: Implement preset selection
                }, onInsert: (preset) => {
                    const pos = reactFlowInstance
                        ? reactFlowInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
                        : { x: 250, y: 250 };
                    void insertPresetByMeta(preset, pos);
                }, position: "right", defaultTab: showAssetLibrary ? 'assets' : isPreviewVisible ? 'preview' : null, showAssets: showAssetLibrary, showPreview: showPreview })), _jsx(NodeContextMenu, { nodeId: contextMenuNodeId || '', nodeType: nodes.find(n => n.id === contextMenuNodeId)?.type || 'textBlock', position: contextMenuPosition, onClose: () => setContextMenuPosition(null), onSaveAsPreset: handleSaveAsPreset }), _jsx(SaveAsPresetDialog, { isOpen: !!saveAsPresetNodeId, nodeData: saveAsPresetNode?.data || null, nodeType: saveAsPresetNode?.type || 'textBlock', onClose: () => setSaveAsPresetNodeId(null), onSave: handleSavePreset })] }));
};
// Export the main component
export const Epic1GraphEditorRefactored = (props) => {
    return (_jsx(ReactFlowProvider, { children: _jsx(DndProvider, { backend: HTML5Backend, children: _jsx(Epic1GraphEditorInner, { ...props }) }) }));
};
// Also export with provider for compatibility
export const Epic1GraphEditorWithProvider = Epic1GraphEditorRefactored;
