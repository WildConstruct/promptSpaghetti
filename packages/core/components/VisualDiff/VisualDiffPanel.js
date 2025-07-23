import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Visual Diff Panel - Main component for visual graph comparison
// Story 9.3.2 - Visual Diff Tool
import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Controls, Background } from 'reactflow';
import { ComparisonToolbar } from './ComparisonToolbar';
import { DiffLegend } from './DiffLegend';
import { VersionSelector } from './VersionSelector';
import { ComparisonStats } from './ComparisonStats';
import { DiffNodeRenderer } from './DiffNodeRenderer';
import { DiffEdgeRenderer } from './DiffEdgeRenderer';
import { useDiffSession } from '../../hooks/useDiffSession';
import { useGraphVersions } from '../../hooks/useGraphVersions';
export const VisualDiffPanel = ({ graphId, initialSourceVersionId, initialTargetVersionId, onClose, className = '' }) => {
    // State
    const [sourceVersionId, setSourceVersionId] = useState(initialSourceVersionId || '');
    const [targetVersionId, setTargetVersionId] = useState(initialTargetVersionId || '');
    const [viewMode, setViewMode] = useState('side-by-side');
    const [highlightMode, setHighlightMode] = useState('changes');
    const [showUnchanged, setShowUnchanged] = useState(true);
    const [showMetadata, setShowMetadata] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1.0);
    // Hooks
    const { versions, loading: versionsLoading } = useGraphVersions(graphId);
    const { session, comparison, loading: sessionLoading, error: sessionError, createSession, updateSession } = useDiffSession();
    // Effects
    useEffect(() => {
        if (sourceVersionId && targetVersionId && sourceVersionId !== targetVersionId) {
            createSession({
                graph_id: graphId,
                source_version_id: sourceVersionId,
                target_version_id: targetVersionId,
                view_mode: viewMode,
                highlight_mode: highlightMode
            });
        }
    }, [sourceVersionId, targetVersionId, graphId]);
    useEffect(() => {
        if (session) {
            updateSession(session.id, {
                view_mode: viewMode,
                highlight_mode: highlightMode,
                show_unchanged: showUnchanged,
                show_metadata: showMetadata,
                zoom_level: zoomLevel
            });
        }
    }, [viewMode, highlightMode, showUnchanged, showMetadata, zoomLevel, session?.id]);
    // Handlers
    const handleVersionChange = useCallback((source, target) => {
        setSourceVersionId(source);
        setTargetVersionId(target);
    }, []);
    const handleViewModeChange = useCallback((mode) => {
        setViewMode(mode);
    }, []);
    const handleHighlightModeChange = useCallback((mode) => {
        setHighlightMode(mode);
    }, []);
    const handleZoomChange = useCallback((zoom) => {
        setZoomLevel(zoom);
    }, []);
    // Prepare nodes and edges for visualization
    const prepareVisualizationData = useCallback(() => {
        if (!comparison)
            return { sourceNodes: [], sourceEdges: [], targetNodes: [], targetEdges: [] };
        const sourceNodes = prepareNodes(comparison.source_data.nodes, comparison.node_matches, 'source');
        const sourceEdges = prepareEdges(comparison.source_data.edges, comparison.edge_matches, 'source');
        const targetNodes = prepareNodes(comparison.target_data.nodes, comparison.node_matches, 'target');
        const targetEdges = prepareEdges(comparison.target_data.edges, comparison.edge_matches, 'target');
        return { sourceNodes, sourceEdges, targetNodes, targetEdges };
    }, [comparison, highlightMode, showUnchanged]);
    const prepareNodes = useCallback((nodes, nodeMatches, side) => {
        if (!comparison)
            return [];
        return nodes.map(node => {
            const match = nodeMatches.find(m => side === 'source' ? m.source_node_id === node.id : m.target_node_id === node.id);
            let diffState = 'unchanged';
            let changeDetails = {};
            if (match) {
                switch (match.match_type) {
                    case 'added':
                        diffState = 'added';
                        break;
                    case 'removed':
                        diffState = 'removed';
                        break;
                    case 'modified':
                    case 'similar':
                        diffState = 'modified';
                        changeDetails = match.property_changes;
                        break;
                    case 'exact':
                        diffState = 'unchanged';
                        break;
                }
            }
            // Filter based on highlight mode and show unchanged setting
            if (!showUnchanged && diffState === 'unchanged') {
                return null;
            }
            if (highlightMode !== 'all') {
                switch (highlightMode) {
                    case 'changes':
                        if (diffState === 'unchanged')
                            return null;
                        break;
                    case 'additions':
                        if (diffState !== 'added')
                            return null;
                        break;
                    case 'deletions':
                        if (diffState !== 'removed')
                            return null;
                        break;
                }
            }
            return {
                id: node.id,
                type: 'diffNode',
                position: node.position || { x: 0, y: 0 },
                data: {
                    ...node.data,
                    originalNode: node,
                    diffState,
                    changeDetails,
                    showMetadata,
                    side
                },
                style: getDiffNodeStyle(diffState, highlightMode)
            };
        }).filter(Boolean);
    }, [comparison, highlightMode, showUnchanged, showMetadata]);
    const prepareEdges = useCallback((edges, edgeMatches, side) => {
        if (!comparison)
            return [];
        return edges.map(edge => {
            const match = edgeMatches.find(m => side === 'source' ? m.source_edge_id === edge.id : m.target_edge_id === edge.id);
            let diffState = 'unchanged';
            let changeDetails = {};
            if (match) {
                switch (match.match_type) {
                    case 'added':
                        diffState = 'added';
                        break;
                    case 'removed':
                        diffState = 'removed';
                        break;
                    case 'modified':
                    case 'similar':
                        diffState = 'modified';
                        changeDetails = match.property_changes;
                        break;
                    case 'exact':
                        diffState = 'unchanged';
                        break;
                }
            }
            // Filter based on highlight mode and show unchanged setting
            if (!showUnchanged && diffState === 'unchanged') {
                return null;
            }
            if (highlightMode !== 'all') {
                switch (highlightMode) {
                    case 'changes':
                        if (diffState === 'unchanged')
                            return null;
                        break;
                    case 'additions':
                        if (diffState !== 'added')
                            return null;
                        break;
                    case 'deletions':
                        if (diffState !== 'removed')
                            return null;
                        break;
                }
            }
            return {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: 'diffEdge',
                data: {
                    ...edge.data,
                    originalEdge: edge,
                    diffState,
                    changeDetails,
                    side
                },
                style: getDiffEdgeStyle(diffState, highlightMode)
            };
        }).filter(Boolean);
    }, [comparison, highlightMode, showUnchanged]);
    // Get node styling based on diff state
    const getDiffNodeStyle = (diffState, _____highlightMode) => {
        const baseStyle = {
            border: '2px solid',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
        };
        switch (diffState) {
            case 'added':
                return { ...baseStyle, borderColor: '#10b981', backgroundColor: '#ecfdf5' };
            case 'removed':
                return { ...baseStyle, borderColor: '#ef4444', backgroundColor: '#fef2f2', opacity: 0.7 };
            case 'modified':
                return { ...baseStyle, borderColor: '#f59e0b', backgroundColor: '#fffbeb' };
            default:
                return { ...baseStyle, borderColor: '#6b7280', backgroundColor: '#f9fafb' };
        }
    };
    // Get edge styling based on diff state
    const getDiffEdgeStyle = (diffState, _____highlightMode) => {
        const baseStyle = {
            strokeWidth: 2,
            transition: 'all 0.2s ease'
        };
        switch (diffState) {
            case 'added':
                return { ...baseStyle, stroke: '#10b981' };
            case 'removed':
                return { ...baseStyle, stroke: '#ef4444', opacity: 0.7, strokeDasharray: '5,5' };
            case 'modified':
                return { ...baseStyle, stroke: '#f59e0b' };
            default:
                return { ...baseStyle, stroke: '#6b7280' };
        }
    };
    // Render loading state
    if (versionsLoading || sessionLoading) {
        return (_jsx("div", { className: `visual-diff-panel ${className}`, children: _jsxs("div", { className: "flex items-center justify-center h-64", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }), _jsx("span", { className: "ml-2", children: "Loading comparison..." })] }) }));
    }
    // Render error state
    if (sessionError) {
        return (_jsx("div", { className: `visual-diff-panel ${className}`, children: _jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Comparison Error" }), _jsx("p", { className: "mt-1 text-sm text-red-700", children: sessionError })] })] }) }) }));
    }
    const { sourceNodes, sourceEdges, targetNodes, targetEdges } = prepareVisualizationData();
    // Custom node types
    const nodeTypes = {
        diffNode: DiffNodeRenderer
    };
    // Custom edge types
    const edgeTypes = {
        diffEdge: DiffEdgeRenderer
    };
    return (_jsxs("div", { className: `visual-diff-panel ${className}`, children: [_jsxs("div", { className: "border-b border-gray-200 bg-white px-4 py-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Visual Diff" }), onClose && (_jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 transition-colors", children: _jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] }), _jsx(VersionSelector, { graphId: graphId, versions: versions, sourceVersionId: sourceVersionId, targetVersionId: targetVersionId, onVersionChange: handleVersionChange, className: "mt-3" }), comparison && (_jsx(ComparisonStats, { comparison: comparison, className: "mt-3" }))] }), _jsx(ComparisonToolbar, { viewMode: viewMode, highlightMode: highlightMode, showUnchanged: showUnchanged, showMetadata: showMetadata, zoomLevel: zoomLevel, onViewModeChange: handleViewModeChange, onHighlightModeChange: handleHighlightModeChange, onShowUnchangedChange: setShowUnchanged, onShowMetadataChange: setShowMetadata, onZoomChange: handleZoomChange, className: "border-b border-gray-200" }), _jsxs("div", { className: "flex-1 relative", children: [viewMode === 'side-by-side' && (_jsxs("div", { className: "flex h-full", children: [_jsx("div", { className: "flex-1 border-r border-gray-200", children: _jsxs("div", { className: "h-full relative", children: [_jsx("div", { className: "absolute top-2 left-2 z-10 bg-white rounded px-2 py-1 shadow-sm text-sm font-medium text-gray-700", children: "Source Version" }), _jsxs(ReactFlow, { nodes: sourceNodes, edges: sourceEdges, nodeTypes: nodeTypes, edgeTypes: edgeTypes, fitView: true, zoomOnScroll: false, panOnScroll: true, defaultZoom: zoomLevel, children: [_jsx(Background, {}), _jsx(Controls, { showInteractive: false })] })] }) }), _jsx("div", { className: "flex-1", children: _jsxs("div", { className: "h-full relative", children: [_jsx("div", { className: "absolute top-2 left-2 z-10 bg-white rounded px-2 py-1 shadow-sm text-sm font-medium text-gray-700", children: "Target Version" }), _jsxs(ReactFlow, { nodes: targetNodes, edges: targetEdges, nodeTypes: nodeTypes, edgeTypes: edgeTypes, fitView: true, zoomOnScroll: false, panOnScroll: true, defaultZoom: zoomLevel, children: [_jsx(Background, {}), _jsx(Controls, { showInteractive: false })] })] }) })] })), viewMode === 'unified' && (_jsx("div", { className: "h-full", children: _jsxs(ReactFlow, { nodes: [...sourceNodes, ...targetNodes], edges: [...sourceEdges, ...targetEdges], nodeTypes: nodeTypes, edgeTypes: edgeTypes, fitView: true, zoomOnScroll: false, panOnScroll: true, defaultZoom: zoomLevel, children: [_jsx(Background, {}), _jsx(Controls, { showInteractive: false })] }) })), viewMode === 'overlay' && (_jsxs("div", { className: "h-full relative", children: [_jsx("div", { className: "absolute inset-0", children: _jsxs(ReactFlow, { nodes: sourceNodes, edges: sourceEdges, nodeTypes: nodeTypes, edgeTypes: edgeTypes, fitView: true, zoomOnScroll: false, panOnScroll: true, defaultZoom: zoomLevel, children: [_jsx(Background, {}), _jsx(Controls, { showInteractive: false })] }) }), _jsx("div", { className: "absolute inset-0 opacity-70", children: _jsx(ReactFlow, { nodes: targetNodes, edges: targetEdges, nodeTypes: nodeTypes, edgeTypes: edgeTypes, fitView: true, zoomOnScroll: false, panOnScroll: true, defaultZoom: zoomLevel, children: _jsx(Background, {}) }) })] })), _jsx(DiffLegend, { highlightMode: highlightMode, className: "absolute bottom-4 right-4 z-10" })] })] }));
};
