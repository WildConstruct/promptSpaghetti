import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Comparison Tools (Epic 16)
 *
 * DEPLOYMENT BLOCKER FIX: Advanced comparison tools for analyzing differences
 * between graph versions, content variations, and system configurations.
 * Provides intelligent diff algorithms, visual comparison interfaces,
 * and comprehensive analysis capabilities.
 *
 * Features:
 * - Multi-level comparison (structural, semantic, visual)
 * - Side-by-side diff viewer
 * - Unified diff display
 * - Change timeline visualization
 * - Merge conflict resolution
 * - Export comparison reports
 * - Performance impact analysis
 * - Batch comparison processing
 */
import { useState, useCallback, useMemo } from 'react';
import { GitBranch, FileText, BarChart3, Download, Search, Filter, Eye, ArrowLeftRight, ZoomIn, ZoomOut, RotateCcw, Clock, CheckCircle, Layers, Code, Calendar, Plus, X, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
;
author ?  : string;
searchQuery ?  : string;
position ?  : { x: number, y: number };
;
breakingChanges: number;
deprecations: number;
newFeatures: number;
;
timeline: Array;
exportFormats: ('pdf' | 'html' | 'json' | 'csv')[];
export const ComparisonTools = ({
    sessions,
    activeSessionId,
    onSessionSelect,
    onSessionCreate,
    onSessionUpdate,
    onSessionDelete,
    onExportReport,
    className = ''
});
{
    const [selectedSessions, setSelectedSessions] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('date');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, _____setFilters] = useState({});
    types: [],
        dateRange;
    null,
        authors;
    [],
        bookmarkedOnly;
    false;
}
;
const filteredSessions = useMemo(() => {
    return sessions.filter(session => { });
    // Search filter
    if (searchQuery && !session.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !session.sourceItem.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !session.targetItem.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
        // Type filter
        if (filters.types.length > 0 && !filters.types.includes(session.comparisonType)) {
            return false;
            // Bookmarked filter
            if (filters.bookmarkedOnly && !session.isBookmarked) {
                return false;
                // Date range filter
                if (filters.dateRange) {
                    if (session.createdAt < filters.dateRange.start || session.createdAt > filters.dateRange.end) {
                        return false;
                        return true;
                    }
                }
            }
        }
    }
});
[sessions, searchQuery, filters];
;
const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'date':
                return b.createdAt.getTime() - a.createdAt.getTime();
            case 'similarity':
                // Would need comparison results to sort by similarity
                return 0;
            case 'changes':
                // Would need change count to sort by changes
                return 0;
            default:
                return 0;
        }
    });
}, [filteredSessions, sortBy]);
return;
_jsxs("div", { className: `comparison-tools ${className}`, children: ["}", _jsxs(Card, { className: "comparison-tools-card", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "comparison-tools-header", children: [_jsxs(CardTitle, { className: "comparison-tools-title", children: [_jsx(GitBranch, { size: 18 }), "Comparison Tools"] }), _jsxs("div", { className: "comparison-tools-actions", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => { }, children: [_jsx(Plus, { size: 14 }), "New Comparison"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => { }, disabled: selectedSessions.length < 2, children: [_jsx(BarChart3, { size: 14 }), "Batch Compare"] })] })] }), _jsxs("div", { className: "comparison-tools-controls", children: [_jsxs("div", { className: "search-and-filter", children: [_jsxs("div", { className: "search-container", children: [_jsx(Search, { size: 14, className: "search-icon" }), _jsx("input", { type: "text", placeholder: "Search comparisons...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "search-input" })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => { }, children: [_jsx(Filter, { size: 14 }), "Filters"] })] }), _jsxs("div", { className: "view-controls", children: [_jsxs("div", { className: "view-mode-selector", children: [_jsx(Button, { variant: viewMode === 'grid' ? 'primary' : 'ghost', size: "sm", onClick: () => setViewMode('grid'), children: _jsx(Layers, { size: 14 }) }), _jsx(Button, { variant: viewMode === 'list' ? 'primary' : 'ghost', size: "sm", onClick: () => setViewMode('list'), children: _jsx(FileText, { size: 14 }) }), _jsx(Button, { variant: viewMode === 'timeline' ? 'primary' : 'ghost', size: "sm", onClick: () => setViewMode('timeline'), children: _jsx(Clock, { size: 14 }) })] }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "sort-select", children: [_jsx("option", { value: "date", children: "Sort by Date" }), _jsx("option", { value: "name", children: "Sort by Name" }), _jsx("option", { value: "similarity", children: "Sort by Similarity" }), _jsx("option", { value: "changes", children: "Sort by Changes" })] })] })] })] }), _jsxs(CardContent, { className: "comparison-tools-content", children: [viewMode === 'grid' && ()
                            < div, " className=\"comparison-grid\">", sortedSessions.map(session => ()
                            < ComparisonSessionCard, key = { session, : .id }, session = { session }, isActive = { session, : .id === activeSessionId }, isSelected = { selectedSessions, : .includes(session.id) }, onSelect = {}()), " => onSessionSelect(session.id)} onToggleSelection=", (selected) => {
                            setSelectedSessions(prev => );
                            selected
                                ? [...prev, session.id]
                                : prev.filter(id => id !== session.id);
                        }, "); }} onUpdate=", (updates) => onSessionUpdate(session.id, updates), "onDelete=", () => onSessionDelete(session.id), "onExport=", (format) => onExportReport(session.id, format), "/> ))}"] }), ")}", viewMode === 'list' && ()
                    < div, " className=\"comparison-list\">", sortedSessions.map(session => ()
                    < ComparisonSessionRow, key = { session, : .id }, session = { session }, isActive = { session, : .id === activeSessionId }, isSelected = { selectedSessions, : .includes(session.id) }, onSelect = {}()), " => onSessionSelect(session.id)} onToggleSelection=", (selected) => {
                    setSelectedSessions(prev => );
                    selected
                        ? [...prev, session.id]
                        : prev.filter(id => id !== session.id);
                }, "); }} onUpdate=", (updates) => onSessionUpdate(session.id, updates), "onDelete=", () => onSessionDelete(session.id), "/> ))}"] })] });
{
    viewMode === 'timeline' && ()
        < ComparisonTimeline;
    sessions = { sortedSessions };
    activeSessionId = { activeSessionId };
    onSessionSelect = { onSessionSelect }
        /  >
    ;
}
CardContent >
;
Card >
;
div >
;
;
;
{
    const [showActions, setShowActions] = useState(false);
    return;
    _jsxs("div", { className: `comparison-session-card ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`, onClick: onSelect, onMouseEnter: () => setShowActions(true), onMouseLeave: () => setShowActions(false), children: [_jsxs("div", { className: "session-card-header", children: [_jsx("input", { type: "checkbox", checked: isSelected, onChange: (e) => {
                            e.stopPropagation();
                            onToggleSelection(e.target.checked);
                        }, className: "session-checkbox" }), _jsx("h3", { className: "session-name", children: session.name }), _jsxs("div", { className: `session-actions ${showActions ? 'visible' : ''}`, children: ["}", _jsx(Button, { variant: "ghost", size: "icon", onClick: (e) => {
                                    e.stopPropagation();
                                    onUpdate({ isBookmarked: !session.isBookmarked });
                                }, title: session.isBookmarked ? 'Remove bookmark' : 'Add bookmark', children: session.isBookmarked ? _jsx(CheckCircle, { size: 14 }) : _jsx(Plus, { size: 14 }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: (e) => {
                                    e.stopPropagation();
                                    onExport('pdf');
                                }, title: "Export report", children: _jsx(Download, { size: 14 }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: (e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }, title: "Delete comparison", children: _jsx(X, { size: 14 }) })] })] }), _jsx("div", { className: "session-comparison", children: _jsxs("div", { className: "comparison-items", children: [_jsxs("div", { className: "comparison-item source", children: [_jsx("div", { className: "item-icon", children: _jsx(FileText, { size: 16 }) }), _jsxs("div", { className: "item-details", children: [_jsx("div", { className: "item-name", children: session.sourceItem.name }), _jsxs("div", { className: "item-version", children: ["v", session.sourceItem.version] })] })] }), _jsx("div", { className: "comparison-arrow", children: _jsx(ArrowLeftRight, { size: 14 }) }), _jsxs("div", { className: "comparison-item target", children: [_jsx("div", { className: "item-icon", children: _jsx(FileText, { size: 16 }) }), _jsxs("div", { className: "item-details", children: [_jsx("div", { className: "item-name", children: session.targetItem.name }), _jsxs("div", { className: "item-version", children: ["v", session.targetItem.version] })] })] })] }) }), _jsxs("div", { className: "session-meta", children: [_jsxs("div", { className: "session-badges", children: [_jsx(Badge, { variant: (session.comparisonType === 'structural' ? 'secondary' : ,
                                    session.comparisonType === 'semantic' ? 'default' : 'destructive',
                                ), children: session.comparisonType }), _jsx(Badge, { variant: "outline", children: session.viewMode })] }), _jsxs("div", { className: "session-date", children: [_jsx(Clock, { size: 12 }), session.lastAccessed.toLocaleDateString()] })] }), _jsxs("div", { className: "session-stats", children: [_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Annotations" }), _jsx("span", { className: "stat-value", children: session.annotations.length })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Type" }), _jsx("span", { className: "stat-value", children: session.sourceItem.type })] })] })] });
    ;
}
;
{
    return;
    _jsxs("div", { className: `comparison-session-row ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`, onClick: onSelect, children: [_jsx("div", { className: "row-checkbox", children: _jsx("input", { type: "checkbox", checked: isSelected, onChange: (e) => {
                        e.stopPropagation();
                        onToggleSelection(e.target.checked);
                    } }) }), _jsxs("div", { className: "row-content", children: [_jsxs("div", { className: "row-main", children: [_jsxs("div", { className: "session-info", children: [_jsx("h3", { className: "session-name", children: session.name }), _jsxs("div", { className: "session-items", children: [_jsxs("span", { className: "source-item", children: [session.sourceItem.name, " v", session.sourceItem.version] }), _jsx(ArrowLeftRight, { size: 12, className: "comparison-arrow" }), _jsxs("span", { className: "target-item", children: [session.targetItem.name, " v", session.targetItem.version] })] })] }), _jsxs("div", { className: "session-badges", children: [_jsx(Badge, { variant: "secondary", children: session.comparisonType }), _jsx(Badge, { variant: "outline", children: session.sourceItem.type }), session.isBookmarked && _jsx(Badge, { variant: "default", children: "Bookmarked" })] })] }), _jsxs("div", { className: "row-meta", children: [_jsxs("div", { className: "meta-item", children: [_jsx(Calendar, { size: 12 }), _jsx("span", { children: session.createdAt.toLocaleDateString() })] }), _jsxs("div", { className: "meta-item", children: [_jsx(Clock, { size: 12 }), _jsx("span", { children: session.lastAccessed.toLocaleDateString() })] }), _jsxs("div", { className: "meta-item", children: [_jsx(Info, { size: 12 }), _jsxs("span", { children: [session.annotations.length, " annotations"] })] })] })] }), _jsxs("div", { className: "row-actions", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: (e) => {
                            e.stopPropagation();
                            onUpdate({ isBookmarked: !session.isBookmarked });
                        }, children: session.isBookmarked ? _jsx(CheckCircle, { size: 14 }) : _jsx(Plus, { size: 14 }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: (e) => {
                            e.stopPropagation();
                            onDelete();
                        }, children: _jsx(X, { size: 14 }) })] })] });
    ;
}
;
{
    const groupedSessions = useMemo(() => {
        const groups = {};
        sessions.forEach(session => { });
        const dateKey = session.createdAt.toDateString();
        if (!groups[dateKey]) {
            groups[dateKey] = [];
            groups[dateKey].push(session);
        }
    });
    return Object.entries(groups)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .map(([date, sessions]) => ({}), date, new Date(date), sessions, sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
}
;
[sessions];
;
return;
_jsxs("div", { className: "comparison-timeline", children: [groupedSessions.map(({ date, sessions }) => ()
            < div, key = { date, : .toDateString() }, className = "timeline-group" >
            (_jsxs("div", { className: "timeline-date", children: [_jsxs("h3", { children: [date.toLocaleDateString('en-US', {}), "weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' ; })}"] }), _jsxs("div", { className: "session-count", children: [sessions.length, " comparisons"] })] })
                ,
                    _jsxs("div", { className: "timeline-sessions", children: [sessions.map(session => ()
                                < div, key = { session, : .id }, className = {} `timeline-session ${session.id === activeSessionId ? 'active' : ''}`), "onClick=", () => onSessionSelect(session.id), ">", _jsx("div", { className: "timeline-marker" }), _jsxs("div", { className: "session-content", children: [_jsxs("div", { className: "session-header", children: [_jsx("h4", { className: "session-name", children: session.name }), _jsxs("div", { className: "session-time", children: [session.createdAt.toLocaleTimeString([], {}), "hour: '2-digit', minute: '2-digit' ; })}"] })] }), _jsxs("div", { className: "session-details", children: [_jsxs("div", { className: "comparison-summary", children: [_jsx("span", { className: "source", children: session.sourceItem.name }), _jsx(ArrowLeftRight, { size: 12 }), _jsx("span", { className: "target", children: session.targetItem.name })] }), _jsxs("div", { className: "session-badges", children: [_jsx(Badge, { variant: "outline", size: "sm", children: session.comparisonType }), _jsx(Badge, { variant: "outline", size: "sm", children: session.sourceItem.type })] })] })] })] }))), ")}"] });
div >
;
div >
;
;
;
export const AdvancedDiffViewer = ({
    comparison,
    session,
    onSessionUpdate,
    onAnnotationAdd,
    onAnnotationUpdate,
    onAnnotationDelete,
    className = ''
});
{
    const [selectedNode, setSelectedNode] = useState(null);
    const [showAnnotations, setShowAnnotations] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const handleViewModeChange = useCallback((viewMode) => {
        onSessionUpdate({ viewMode });
    }, [onSessionUpdate]);
    const handleHighlightModeChange = useCallback((highlightMode) => {
        onSessionUpdate({ highlightMode });
    }, [onSessionUpdate]);
    const handleFiltersChange = useCallback((filters) => {
        onSessionUpdate({});
        filters: { }
    }, ...session.filters, ...filters);
}
;
[session.filters, onSessionUpdate];
;
return;
_jsxs("div", { className: `advanced-diff-viewer ${className}`, children: ["}", _jsxs("div", { className: "diff-viewer-header", children: [_jsxs("div", { className: "diff-viewer-title", children: [_jsx("h2", { children: session.name }), _jsxs("div", { className: "comparison-info", children: [_jsxs("span", { className: "source-info", children: [session.sourceItem.name, " v", session.sourceItem.version] }), _jsx(ArrowLeftRight, { size: 16 }), _jsxs("span", { className: "target-info", children: [session.targetItem.name, " v", session.targetItem.version] })] })] }), _jsx("div", { className: "diff-viewer-controls", children: _jsx(DiffViewerToolbar, { session: session, comparison: comparison, onViewModeChange: handleViewModeChange, onHighlightModeChange: handleHighlightModeChange, onFiltersChange: handleFiltersChange, zoomLevel: zoomLevel, onZoomChange: setZoomLevel, showAnnotations: showAnnotations, onToggleAnnotations: setShowAnnotations }) })] }), _jsxs("div", { className: "diff-viewer-content", children: [_jsx("div", { className: "diff-visualization", children: _jsx(DiffVisualization, { comparison: comparison, session: session, zoomLevel: zoomLevel, panOffset: panOffset, onPanChange: setPanOffset, selectedNode: selectedNode, onNodeSelect: setSelectedNode, showAnnotations: showAnnotations, annotations: session.annotations, onAnnotationAdd: onAnnotationAdd }) }), _jsx("div", { className: "diff-sidebar", children: _jsx(DiffInspector, { comparison: comparison, session: session, selectedNode: selectedNode, annotations: session.annotations, onAnnotationAdd: onAnnotationAdd, onAnnotationUpdate: onAnnotationUpdate, onAnnotationDelete: onAnnotationDelete }) })] })] });
;
;
{
    return;
    _jsxs("div", { className: "diff-viewer-toolbar", children: [_jsxs("div", { className: "toolbar-section", children: [_jsx("label", { children: "View Mode:" }), _jsxs("select", { value: session.viewMode, onChange: (e) => onViewModeChange(e.target.value), children: [_jsx("option", { value: "side-by-side", children: "Side by Side" }), _jsx("option", { value: "overlay", children: "Overlay" }), _jsx("option", { value: "unified", children: "Unified" })] })] }), _jsxs("div", { className: "toolbar-section", children: [_jsx("label", { children: "Highlight:" }), _jsxs("select", { value: session.highlightMode, onChange: (e) => onHighlightModeChange(e.target.value), children: [_jsx("option", { value: "changes", children: "All Changes" }), _jsx("option", { value: "additions", children: "Additions" }), _jsx("option", { value: "deletions", children: "Deletions" }), _jsx("option", { value: "all", children: "Show All" })] })] }), _jsxs("div", { className: "toolbar-section", children: [_jsxs(Button, { variant: session.filters.showUnchanged ? 'primary' : 'outline', size: "sm", onClick: () => onFiltersChange({ showUnchanged: !session.filters.showUnchanged }), children: [_jsx(Eye, { size: 14 }), "Unchanged"] }), _jsxs(Button, { variant: session.filters.showMetadata ? 'primary' : 'outline', size: "sm", onClick: () => onFiltersChange({ showMetadata: !session.filters.showMetadata }), children: [_jsx(Code, { size: 14 }), "Metadata"] }), _jsxs(Button, { variant: showAnnotations ? 'primary' : 'outline', size: "sm", onClick: () => onToggleAnnotations(!showAnnotations), children: [_jsx(Info, { size: 14 }), "Annotations"] })] }), _jsxs("div", { className: "toolbar-section zoom-controls", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => onZoomChange(Math.max(0.1, zoomLevel - 0.1)), children: _jsx(ZoomOut, { size: 14 }) }), _jsxs("span", { className: "zoom-level", children: [Math.round(zoomLevel * 100), "%"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => onZoomChange(Math.min(5, zoomLevel + 0.1)), children: _jsx(ZoomIn, { size: 14 }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => onZoomChange(1), children: _jsx(RotateCcw, { size: 14 }) })] })] });
    ;
}
;
// Placeholder components for visualization and inspector
const DiffVisualization = () => _jsx("div", { className: "diff-visualization-placeholder", children: "Diff Visualization Area" });
const DiffInspector = () => _jsx("div", { className: "diff-inspector-placeholder", children: "Diff Inspector Panel" });
export default {
    ComparisonTools,
    AdvancedDiffViewer,
    ComparisonSessionCard,
    ComparisonSessionRow,
    ComparisonTimeline
};
