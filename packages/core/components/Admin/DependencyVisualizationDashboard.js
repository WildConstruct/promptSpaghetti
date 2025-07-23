import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 17 Dependency Visualization Dashboard
 *
 * Advanced dashboard for visualizing and managing feature toggle dependencies.
 * Provides comprehensive visualization, analysis, and management capabilities.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { DependencyType } from '../../services/FeatureToggleDependencyService';
export const DependencyVisualizationDashboard = ({ dependencyService, selectedToggles = [], onToggleSelect, onDependencyCreate, onConflictResolve }) => {
    // State management
    const [graph, setGraph] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState({
        mode: 'graph',
        layout: 'hierarchical',
        showMetadata: true,
        showConflicts: true,
        showCriticalPath: true,
        clusterView: false
    });
    const [filters, setFilters] = useState({
        toggleTypes: [],
        riskLevels: [],
        dependencyTypes: [],
        epics: [],
        stories: [],
        searchTerm: ''
    });
    const [selectedNode, setSelectedNode] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);
    const [impactAnalysis, setImpactAnalysis] = useState(null);
    // Load data
    useEffect(() => {
        loadDependencyData();
    }, [selectedToggles]);
    const loadDependencyData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [graphData, analysisData] = await Promise.all([
                dependencyService.generateDependencyGraph(selectedToggles.length > 0 ? selectedToggles : undefined),
                dependencyService.analyzeDependencies(selectedToggles.length > 0 ? selectedToggles : undefined)
            ]);
            setGraph(graphData);
            setAnalysis(analysisData);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dependency data');
        }
        finally {
            setLoading(false);
        }
    }, [dependencyService, selectedToggles]);
    // Filter nodes and edges based on current filters
    const filteredGraph = useMemo(() => {
        if (!graph)
            return null;
        let filteredNodes = graph.nodes;
        let filteredEdges = graph.edges;
        // Apply search filter
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filteredNodes = filteredNodes.filter(node => node.name.toLowerCase().includes(searchLower) ||
                node.toggleId.toLowerCase().includes(searchLower) ||
                node.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower)));
            const nodeIds = new Set(filteredNodes.map(n => n.id));
            filteredEdges = filteredEdges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
        }
        // Apply type filters
        if (filters.toggleTypes.length > 0) {
            filteredNodes = filteredNodes.filter(node => filters.toggleTypes.includes(node.type));
        }
        // Apply dependency type filters
        if (filters.dependencyTypes.length > 0) {
            filteredEdges = filteredEdges.filter(edge => filters.dependencyTypes.includes(edge.type));
            const connectedNodeIds = new Set([
                ...filteredEdges.map(e => e.source),
                ...filteredEdges.map(e => e.target)
            ]);
            filteredNodes = filteredNodes.filter(node => connectedNodeIds.has(node.id));
        }
        return {
            ...graph,
            nodes: filteredNodes,
            edges: filteredEdges
        };
    }, [graph, filters]);
    // Handle node selection
    const handleNodeClick = useCallback(async (nodeId) => {
        setSelectedNode(nodeId);
        onToggleSelect?.(nodeId);
        // Load impact analysis for selected node
        try {
            const impact = await dependencyService.getImpactAnalysis(nodeId, 'activate');
            setImpactAnalysis(impact);
        }
        catch (err) {
            console.error('Failed to load impact analysis:', err);
        }
    }, [dependencyService, onToggleSelect]);
    // Render conflict severity badge
    const renderSeverityBadge = (severity) => {
        const colors = {
            critical: 'bg-red-500 text-white',
            error: 'bg-red-400 text-white',
            warning: 'bg-yellow-400 text-gray-800',
            low: 'bg-gray-400 text-white'
        };
        return (_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${colors[severity] || colors.low}`, children: severity.toUpperCase() }));
    };
    // Render dependency type badge
    const renderDependencyTypeBadge = (type) => {
        const colors = {
            [DependencyType.REQUIRES]: 'bg-blue-100 text-blue-800',
            [DependencyType.BLOCKS]: 'bg-red-100 text-red-800',
            [DependencyType.CONFLICTS]: 'bg-purple-100 text-purple-800',
            [DependencyType.ENHANCES]: 'bg-green-100 text-green-800',
            [DependencyType.FOLLOWS]: 'bg-yellow-100 text-yellow-800',
            [DependencyType.PRECEDES]: 'bg-indigo-100 text-indigo-800'
        };
        return (_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${colors[type]}`, children: type.replace('_', ' ').toUpperCase() }));
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" }), _jsx("span", { className: "text-gray-600", children: "Loading dependency visualization..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error Loading Dependencies" }), _jsx("p", { className: "mt-1 text-sm text-red-700", children: error }), _jsx("button", { onClick: loadDependencyData, className: "mt-2 text-sm font-medium text-red-800 hover:text-red-600", children: "Try Again" })] })] }) }));
    }
    return (_jsxs("div", { className: "dependency-dashboard h-full flex flex-col", children: [_jsx("div", { className: "bg-white border-b border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Feature Toggle Dependencies" }), _jsx("p", { className: "text-sm text-gray-600", children: "Visualize and manage feature toggle relationships and conflicts" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: loadDependencyData, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50", children: "Refresh" }), _jsxs("select", { value: viewMode.mode, onChange: (e) => setViewMode({ ...viewMode, mode: e.target.value }), className: "px-3 py-2 text-sm border border-gray-300 rounded-md", children: [_jsx("option", { value: "graph", children: "Graph View" }), _jsx("option", { value: "tree", children: "Tree View" }), _jsx("option", { value: "matrix", children: "Matrix View" }), _jsx("option", { value: "analysis", children: "Analysis View" })] })] })] }) }), _jsxs("div", { className: "flex-1 flex", children: [_jsxs("div", { className: "w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto", children: [_jsxs("div", { className: "p-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "Filters" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search Toggles" }), _jsx("input", { type: "text", value: filters.searchTerm, onChange: (e) => setFilters({ ...filters, searchTerm: e.target.value }), placeholder: "Search by name or tag...", className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "View Options" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: viewMode.showMetadata, onChange: (e) => setViewMode({ ...viewMode, showMetadata: e.target.checked }), className: "h-4 w-4 text-blue-600" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Show Metadata" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: viewMode.showConflicts, onChange: (e) => setViewMode({ ...viewMode, showConflicts: e.target.checked }), className: "h-4 w-4 text-blue-600" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Highlight Conflicts" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: viewMode.showCriticalPath, onChange: (e) => setViewMode({ ...viewMode, showCriticalPath: e.target.checked }), className: "h-4 w-4 text-blue-600" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Show Critical Paths" })] })] })] })] }), graph && (_jsxs("div", { className: "p-4 border-t border-gray-200", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "Metrics" }), _jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [_jsxs("div", { className: "bg-white p-3 rounded-md border", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: graph.metrics.totalToggles }), _jsx("div", { className: "text-gray-600", children: "Total Toggles" })] }), _jsxs("div", { className: "bg-white p-3 rounded-md border", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: graph.metrics.totalDependencies }), _jsx("div", { className: "text-gray-600", children: "Dependencies" })] }), _jsxs("div", { className: "bg-white p-3 rounded-md border", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: graph.metrics.conflictCount }), _jsx("div", { className: "text-gray-600", children: "Conflicts" })] }), _jsxs("div", { className: "bg-white p-3 rounded-md border", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: graph.metrics.healthScore }), _jsx("div", { className: "text-gray-600", children: "Health Score" })] })] })] })), analysis && analysis.violations.length > 0 && (_jsxs("div", { className: "p-4 border-t border-gray-200", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "Active Conflicts" }), _jsx("div", { className: "space-y-2", children: analysis.violations.slice(0, 5).map((violation) => (_jsxs("div", { className: "bg-white p-3 rounded-md border", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: violation.type.replace('_', ' ').toUpperCase() }), renderSeverityBadge(violation.severity)] }), _jsx("p", { className: "text-xs text-gray-600", children: violation.description }), _jsx("div", { className: "mt-1", children: _jsxs("span", { className: "text-xs text-blue-600", children: ["Affects: ", violation.toggles.join(', ')] }) })] }, violation.id))) })] }))] }), _jsxs("div", { className: "flex-1 flex flex-col", children: [viewMode.mode === 'graph' && (_jsx(GraphVisualization, { graph: filteredGraph, viewMode: viewMode, selectedNode: selectedNode, hoveredNode: hoveredNode, onNodeClick: handleNodeClick, onNodeHover: setHoveredNode, onDependencyCreate: onDependencyCreate })), viewMode.mode === 'analysis' && analysis && (_jsx(AnalysisView, { analysis: analysis, onConflictResolve: onConflictResolve })), viewMode.mode === 'tree' && (_jsx(TreeVisualization, { graph: filteredGraph, selectedNode: selectedNode, onNodeClick: handleNodeClick })), viewMode.mode === 'matrix' && (_jsx(MatrixView, { graph: filteredGraph, selectedNode: selectedNode, onNodeClick: handleNodeClick }))] }), selectedNode && (_jsx("div", { className: "w-80 bg-white border-l border-gray-200 overflow-y-auto", children: _jsx(ToggleDetailsPanel, { toggleId: selectedNode, graph: filteredGraph, impactAnalysis: impactAnalysis, onClose: () => setSelectedNode(null) }) }))] })] }));
};
const GraphVisualization = ({ graph, viewMode, selectedNode, onNodeClick }) => {
    if (!graph) {
        return (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsx("div", { className: "text-gray-500", children: "No dependency data available" }) }));
    }
    return (_jsx("div", { className: "flex-1 p-6 bg-gray-50", children: _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 h-full p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Dependency Graph" }), _jsxs("div", { className: "text-sm text-gray-600", children: [graph.nodes.length, " nodes, ", graph.edges.length, " edges"] })] }), _jsx("div", { className: "h-full bg-gray-100 rounded-md flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-gray-400 mb-2", children: _jsx("svg", { className: "h-12 w-12 mx-auto", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }) }), _jsx("p", { className: "text-gray-500", children: "Interactive graph visualization would render here" }), _jsx("p", { className: "text-sm text-gray-400", children: "Integration with D3.js, vis.js, or similar library" })] }) })] }) }));
};
const AnalysisView = ({ analysis }) => {
    return (_jsx("div", { className: "flex-1 p-6 bg-gray-50 overflow-y-auto", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Dependency Violations" }), analysis.violations.length === 0 ? (_jsx("p", { className: "text-green-600", children: "No dependency violations detected." })) : (_jsx("div", { className: "space-y-3", children: analysis.violations.map((violation) => (_jsx("div", { className: "border border-red-200 rounded-md p-4 bg-red-50", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-sm font-medium text-red-800", children: violation.type.replace('_', ' ').toUpperCase() }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: violation.description }), _jsx("div", { className: "mt-2", children: _jsxs("span", { className: "text-xs text-red-600", children: ["Affected Toggles: ", violation.toggles.join(', ')] }) })] }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${violation.severity === 'critical' ? 'bg-red-500 text-white' :
                                                violation.severity === 'high' ? 'bg-red-400 text-white' :
                                                    violation.severity === 'medium' ? 'bg-yellow-400 text-gray-800' :
                                                        'bg-gray-400 text-white'}`, children: violation.severity.toUpperCase() })] }) }, violation.id))) }))] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Recommendations" }), analysis.recommendations.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "No recommendations available." })) : (_jsx("div", { className: "space-y-3", children: analysis.recommendations.map((rec) => (_jsx("div", { className: "border border-blue-200 rounded-md p-4 bg-blue-50", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "text-sm font-medium text-blue-800", children: rec.type.replace('_', ' ').toUpperCase() }), _jsx("p", { className: "text-sm text-blue-700 mt-1", children: rec.action }), _jsx("p", { className: "text-xs text-blue-600 mt-1", children: rec.rationale })] }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${rec.priority === 'urgent' ? 'bg-red-500 text-white' :
                                                rec.priority === 'high' ? 'bg-yellow-500 text-white' :
                                                    rec.priority === 'medium' ? 'bg-blue-500 text-white' :
                                                        'bg-gray-500 text-white'}`, children: rec.priority.toUpperCase() })] }) }, rec.id))) }))] })] }) }));
};
// Placeholder components
const TreeVisualization = () => (_jsx("div", { className: "flex-1 flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "text-center text-gray-500", children: [_jsx("p", { children: "Tree visualization would render here" }), _jsx("p", { className: "text-sm", children: "Hierarchical dependency tree view" })] }) }));
const MatrixView = () => (_jsx("div", { className: "flex-1 flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "text-center text-gray-500", children: [_jsx("p", { children: "Dependency matrix would render here" }), _jsx("p", { className: "text-sm", children: "Grid-based dependency relationships" })] }) }));
const ToggleDetailsPanel = ({ toggleId, onClose }) => (_jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Toggle Details" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("div", { className: "text-sm", children: [_jsx("p", { className: "font-medium", children: toggleId }), _jsx("p", { className: "text-gray-600 mt-1", children: "Detailed information would display here" })] })] }));
export default DependencyVisualizationDashboard;
