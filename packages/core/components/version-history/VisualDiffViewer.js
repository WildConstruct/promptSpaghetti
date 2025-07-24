import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.3.2 - Visual Diff Viewer Component
 * Advanced visual comparison of graph versions with side-by-side and overlay views
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { GraphDiffEngine } from './GraphDiffEngine.js';
export const VisualDiffViewer = ({ fromGraphData, toGraphData, diff: externalDiff, isOpen, onClose, onApplyChange, onRejectChange, className = '' }) => {
    const [diff, setDiff] = useState(externalDiff || null);
    const [viewMode, setViewMode] = useState('side-by-side');
    const [filterMode, setFilterMode] = useState('all');
    const [selectedChange, setSelectedChange] = useState(null);
    const [highlightSimilar, setHighlightSimilar] = useState(false);
    const [showRegions, setShowRegions] = useState(true);
    const [showPaths, setShowPaths] = useState(true);
    const [loading, setLoading] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const diffEngine = useRef(new GraphDiffEngine({
        ignore_position_changes: false,
        ignore_style_changes: false,
        deep_property_comparison: true
    }));
    useEffect(() => {
        if (isOpen && !diff) {
            computeDiff();
        }
    }, [isOpen, fromGraphData, toGraphData]);
    const computeDiff = async () => {
        try {
            setLoading(true);
            const computedDiff = await diffEngine.current.computeDiff(fromGraphData, toGraphData);
            setDiff(computedDiff);
        }
        catch (error) {
            console.error('Failed to compute diff:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const filteredChanges = useMemo(() => {
        if (!diff)
            return [];
        switch (filterMode) {
            case 'structural':
                return GraphDiffEngine.filterChanges(diff, {
                    change_types: ['added', 'removed'],
                    element_types: ['node', 'edge']
                });
            case 'properties':
                return GraphDiffEngine.filterChanges(diff, {
                    element_types: ['property']
                });
            case 'positions':
                return GraphDiffEngine.filterChanges(diff, {
                    change_types: ['moved']
                });
            case 'significant':
                return GraphDiffEngine.getSignificantChanges(diff, 0.6);
            default:
                return diff.changes;
        }
    }, [diff, filterMode]);
    const getChangeColor = (change) => {
        switch (change.type) {
            case 'added': return '#10B981'; // green
            case 'removed': return '#EF4444'; // red
            case 'modified': return '#F59E0B'; // yellow
            case 'moved': return '#8B5CF6'; // purple
            default: return '#6B7280'; // gray
        }
    };
    const getChangeIcon = (change) => {
        switch (change.type) {
            case 'added': return '+';
            case 'removed': return '−';
            case 'modified': return '~';
            case 'moved': return '↔';
            default: return '?';
        }
    };
    const getSignificanceLevel = (significance) => {
        if (significance >= 0.8)
            return 'High';
        if (significance >= 0.5)
            return 'Medium';
        if (significance >= 0.2)
            return 'Low';
        return 'Minimal';
    };
    const getSignificanceColor = (significance) => {
        if (significance >= 0.8)
            return 'text-red-600';
        if (significance >= 0.5)
            return 'text-orange-600';
        if (significance >= 0.2)
            return 'text-yellow-600';
        return 'text-gray-600';
    };
    const handleChangeClick = (changeId) => {
        setSelectedChange(selectedChange === changeId ? null : changeId);
        if (highlightSimilar && diff) {
            // Highlight similar changes
            const selectedChangeData = diff.changes.find(c => c.element_id === changeId);
            if (selectedChangeData) {
                // Find and highlight similar changes (same type, similar element)
                // This would integrate with the graph visualization
            }
        }
    };
    const renderChangesList = () => (_jsxs("div", { className: "h-full flex flex-col", children: [_jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Changes" }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs("span", { className: "text-sm text-gray-500", children: [filteredChanges.length, " of ", diff?.changes.length || 0] }) })] }), _jsx("div", { className: "flex flex-wrap gap-2 mb-3", children: [
                            { key: 'all', label: 'All Changes', count: diff?.changes.length || 0 },
                            { key: 'structural', label: 'Structural', count: diff?.summary.added_nodes + diff?.summary.removed_nodes + diff?.summary.added_edges + diff?.summary.removed_edges || 0 },
                            { key: 'properties', label: 'Properties', count: diff?.summary.property_changes || 0 },
                            { key: 'positions', label: 'Positions', count: diff?.summary.moved_nodes || 0 },
                            { key: 'significant', label: 'Significant', count: GraphDiffEngine.getSignificantChanges(diff || { changes: [] }, 0.6).length }
                        ].map(filter => (_jsxs("button", { onClick: () => setFilterMode(filter.key), className: `px-3 py-1 text-xs rounded-full transition-colors ${filterMode === filter.key
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: [filter.label, " (", filter.count, ")"] }, filter.key))) }), _jsxs("div", { className: "flex items-center space-x-4 text-sm", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: highlightSimilar, onChange: (e) => setHighlightSimilar(e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" }), "Highlight similar"] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: showRegions, onChange: (e) => setShowRegions(e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" }), "Show regions"] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: showPaths, onChange: (e) => setShowPaths(e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" }), "Show paths"] })] })] }), _jsx("div", { className: "flex-1 overflow-y-auto", children: loading ? (_jsx("div", { className: "flex justify-center items-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" }) })) : filteredChanges.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx("div", { className: "text-4xl mb-2", children: "\uD83D\uDD0D" }), _jsx("h4", { className: "font-medium text-gray-900 mb-1", children: "No changes found" }), _jsx("p", { className: "text-sm", children: "Try adjusting your filters to see different types of changes." })] })) : (_jsx("div", { className: "divide-y divide-gray-100", children: filteredChanges.map((change, index) => (_jsx(ChangeItem, { change: change, isSelected: selectedChange === change.element_id, onClick: () => handleChangeClick(change.element_id), onApply: onApplyChange ? () => onApplyChange(change.element_id) : undefined, onReject: onRejectChange ? () => onRejectChange(change.element_id) : undefined, getChangeColor: getChangeColor, getChangeIcon: getChangeIcon, getSignificanceLevel: getSignificanceLevel, getSignificanceColor: getSignificanceColor }, `${change.element_id}-${index}`))) })) })] }));
    const renderSummaryStats = () => {
        if (!diff)
            return null;
        const stats = [
            { label: 'Similarity', value: `${Math.round(diff.summary.similarity_score * 100)}%`, color: 'text-green-600' },
            { label: 'Complexity', value: `${diff.summary.complexity_score.toFixed(1)}/10`, color: 'text-blue-600' },
            { label: 'Total Changes', value: diff.summary.total_changes.toString(), color: 'text-gray-900' },
            { label: 'Nodes Added', value: diff.summary.added_nodes.toString(), color: 'text-green-600' },
            { label: 'Nodes Removed', value: diff.summary.removed_nodes.toString(), color: 'text-red-600' },
            { label: 'Nodes Modified', value: diff.summary.modified_nodes.toString(), color: 'text-orange-600' },
            { label: 'Nodes Moved', value: diff.summary.moved_nodes.toString(), color: 'text-purple-600' },
            { label: 'Edges Added', value: diff.summary.added_edges.toString(), color: 'text-green-600' },
            { label: 'Edges Removed', value: diff.summary.removed_edges.toString(), color: 'text-red-600' },
            { label: 'Properties Changed', value: diff.summary.property_changes.toString(), color: 'text-blue-600' }
        ];
        return (_jsx("div", { className: "grid grid-cols-2 gap-3 p-4 bg-gray-50 border-b border-gray-200", children: stats.map(stat => (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: `text-lg font-semibold ${stat.color}`, children: stat.value }), _jsx("div", { className: "text-xs text-gray-600", children: stat.label })] }, stat.label))) }));
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: `visual-diff-viewer ${className} fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`, children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col", children: [_jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Visual Diff Viewer" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-500 transition-colors", children: _jsx("svg", { className: "h-6 w-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("div", { className: "flex space-x-1 bg-gray-100 rounded-lg p-1", children: [
                                { key: 'side-by-side', label: 'Side by Side', icon: '⫸' },
                                { key: 'overlay', label: 'Overlay', icon: '⬚' },
                                { key: 'changes-only', label: 'Changes Only', icon: '📝' }
                            ].map(mode => (_jsxs("button", { onClick: () => setViewMode(mode.key), className: `flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded transition-colors ${viewMode === mode.key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'}`, children: [_jsx("span", { className: "mr-2", children: mode.icon }), mode.label] }, mode.key))) })] }), renderSummaryStats(), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [_jsx("div", { className: "w-80 border-r border-gray-200 bg-white", children: renderChangesList() }), _jsxs("div", { className: "flex-1 bg-gray-50 relative", children: [viewMode === 'side-by-side' && (_jsx(SideBySideView, { fromGraph: fromGraphData, toGraph: toGraphData, diff: diff, selectedChange: selectedChange, showRegions: showRegions, showPaths: showPaths, zoom: zoom, pan: pan, onZoomChange: setZoom, onPanChange: setPan })), viewMode === 'overlay' && (_jsx(OverlayView, { fromGraph: fromGraphData, toGraph: toGraphData, diff: diff, selectedChange: selectedChange, showRegions: showRegions, showPaths: showPaths, zoom: zoom, pan: pan, onZoomChange: setZoom, onPanChange: setPan })), viewMode === 'changes-only' && (_jsx(ChangesOnlyView, { diff: diff, filteredChanges: filteredChanges, selectedChange: selectedChange, getChangeColor: getChangeColor, getChangeIcon: getChangeIcon })), _jsxs("div", { className: "absolute bottom-4 right-4 flex flex-col space-y-2", children: [_jsx("button", { onClick: () => setZoom(prev => Math.min(3, prev * 1.2)), className: "bg-white border border-gray-300 rounded p-2 hover:bg-gray-50 transition-colors", children: _jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }) }), _jsx("button", { onClick: () => setZoom(prev => Math.max(0.2, prev / 1.2)), className: "bg-white border border-gray-300 rounded p-2 hover:bg-gray-50 transition-colors", children: _jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 12H4" }) }) }), _jsx("button", { onClick: () => { setZoom(1); setPan({ x: 0, y: 0 }); }, className: "bg-white border border-gray-300 rounded p-2 hover:bg-gray-50 transition-colors text-xs", children: "Reset" })] })] })] })] }) }));
};
const ChangeItem = ({ change, isSelected, onClick, onApply, onReject, getChangeColor, getChangeIcon, getSignificanceLevel, getSignificanceColor }) => {
    const renderChangeDescription = () => {
        const baseDesc = `${change.type} ${change.element_type}`;
        if (change.property_path) {
            return `${baseDesc}: ${change.property_path}`;
        }
        if (change.type === 'moved' && change.position_change) {
            return `${baseDesc} (moved ${Math.round(change.position_change.distance)}px)`;
        }
        return baseDesc;
    };
    return (_jsx("div", { className: `p-3 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}`, onClick: onClick, children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium", style: { backgroundColor: getChangeColor(change) }, children: getChangeIcon(change) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 truncate", children: change.element_id }), _jsx("span", { className: `text-xs ${getSignificanceColor(change.significance)}`, children: getSignificanceLevel(change.significance) })] }), _jsx("p", { className: "text-xs text-gray-600 mb-2", children: renderChangeDescription() }), change.old_value !== undefined && change.new_value !== undefined && (_jsxs("div", { className: "text-xs space-y-1", children: [_jsxs("div", { className: "text-red-600", children: ["\u2212 ", JSON.stringify(change.old_value).slice(0, 50)] }), _jsxs("div", { className: "text-green-600", children: ["+ ", JSON.stringify(change.new_value).slice(0, 50)] })] })), (onApply || onReject) && isSelected && (_jsxs("div", { className: "flex space-x-2 mt-2", children: [onApply && (_jsx("button", { onClick: (e) => { e.stopPropagation(); onApply(); }, className: "text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors", children: "Apply" })), onReject && (_jsx("button", { onClick: (e) => { e.stopPropagation(); onReject(); }, className: "text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors", children: "Reject" }))] }))] })] }) }));
};
// Placeholder components for different view modes
const SideBySideView = ({ _____fromGraph, _____toGraph, _____diff, _____selectedChange, _____showRegions, _____showPaths, _____zoom, _____pan, _____onZoomChange, _____onPanChange }) => (_jsxs("div", { className: "h-full flex", children: [_jsxs("div", { className: "flex-1 border-r border-gray-300 bg-white", children: [_jsx("div", { className: "h-8 bg-gray-100 border-b border-gray-300 flex items-center px-3 text-sm font-medium text-gray-700", children: "Original Version" }), _jsx("div", { className: "h-full bg-gray-50 flex items-center justify-center text-gray-500", children: "Graph Visualization (Original)" })] }), _jsxs("div", { className: "flex-1 bg-white", children: [_jsx("div", { className: "h-8 bg-gray-100 border-b border-gray-300 flex items-center px-3 text-sm font-medium text-gray-700", children: "New Version" }), _jsx("div", { className: "h-full bg-gray-50 flex items-center justify-center text-gray-500", children: "Graph Visualization (New)" })] })] }));
const OverlayView = ({ _____fromGraph, _____toGraph, _____diff, _____selectedChange, _____showRegions, _____showPaths, _____zoom, _____pan, _____onZoomChange, _____onPanChange }) => (_jsxs("div", { className: "h-full bg-white", children: [_jsx("div", { className: "h-8 bg-gray-100 border-b border-gray-300 flex items-center px-3 text-sm font-medium text-gray-700", children: "Overlay View" }), _jsx("div", { className: "h-full bg-gray-50 flex items-center justify-center text-gray-500", children: "Graph Visualization (Overlay with Changes)" })] }));
const ChangesOnlyView = ({ _____diff, filteredChanges, _____selectedChange, getChangeColor, getChangeIcon }) => (_jsxs("div", { className: "h-full bg-white p-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Changes Summary" }), _jsx("div", { className: "space-y-4", children: filteredChanges.map((change, index) => (_jsx("div", { className: "border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center text-white font-medium", style: { backgroundColor: getChangeColor(change) }, children: getChangeIcon(change) }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: change.element_id }), _jsxs("p", { className: "text-sm text-gray-600", children: [change.type, " ", change.element_type] })] })] }) }, index))) })] }));
