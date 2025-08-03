import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Dependency Graph Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - Dependency Visualization UI
 */
import { useState, useRef } from 'react';
onGenerateGraph: () => void ;
selectedDomain: string;
onDomainChange: (domain) => void ;
export const DependencyGraphPanel = ({
    dependencyGraph,
    onGenerateGraph,
    selectedDomain });
onDomainChange;
{
    const [layout, setLayout] = useState('hierarchical');
    const [filters, setFilters] = useState({});
    includeComponents: true,
        includeSelectors;
    true,
        includeCrossDomainLinks;
    true,
        showLabels;
    true,
        showMetrics;
    false;
}
;
const [selectedNode, setSelectedNode] = useState(null);
const [zoom, setZoom] = useState(1);
const svgRef = useRef(null);
const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
};
const handleNodeClick = (nodeId) => { setSelectedNode(selectedNode === nodeId ? null : nodeId); };
const handleZoomIn = () => { setZoom(prev => Math.min(prev * 1.2, 5)); };
const handleZoomOut = () => { setZoom(prev => Math.max(prev / 1.2, 0.1)); };
const handleResetZoom = () => { setZoom(1); };
const getNodeColor = (type) => {
    switch (type) {
        case 'state': return '#61dafb';
        case 'component': return '#98c379';
        case 'selector': return '#d19a66';
        case 'middleware': return '#c678dd';
        case 'domain': return '#f39c12';
        default: return '#95a5a6';
    }
    ;
    const getNodeSize = (node) => {
        if (!filters.showMetrics)
            return 20;
        const baseSize = 15;
        const metricFactor = Math.log(node.metadata.accessCount + 1) * 2;
        return Math.min(baseSize + metricFactor, 40);
    };
    const formatPerformanceMetric = (metric, unit = 'ms') => {
        if (metric < 1)
            return `${(metric * 1000).toFixed(0)}μs`;
    };
    if (metric < 1000)
        return `${metric.toFixed(1)}${unit}`;
};
return `${(metric / 1000).toFixed(1)}s`;
;
const renderGraph = () => {
    if (!dependencyGraph || dependencyGraph.nodes.length === 0) {
        return;
        _jsxs("div", { className: "empty-graph", children: [_jsx("span", { children: "\uD83D\uDD17" }), _jsx("p", { children: "No dependency graph generated" }), _jsx("button", { className: "generate-btn", onClick: onGenerateGraph, children: "Generate Graph" })] });
    }
};
;
const { nodes, edges } = dependencyGraph;
const filteredNodes = nodes.filter(node => { });
if (!filters.includeComponents && node.type === 'component')
    return false;
if (!filters.includeSelectors && node.type === 'selector')
    return false;
return true;
;
const filteredEdges = edges.filter(edge => { });
const fromNode = filteredNodes.find(n => n.id === edge.from);
const toNode = filteredNodes.find(n => n.id === edge.to);
if (!fromNode || !toNode)
    return false;
if (!filters.includeCrossDomainLinks && fromNode.domain !== toNode.domain)
    return false;
return true;
;
const svgWidth = 800;
const svgHeight = 600;
return;
_jsxs("svg", { ref: svgRef, width: svgWidth, height: svgHeight, viewBox: `0 0 ${svgWidth} ${svgHeight}`, style: { transform: `scale(${zoom})` }, className: "dependency-graph-svg", children: [_jsx("rect", { width: svgWidth, height: svgHeight, fill: "var(--devtools-bg, #1e1e1e)" }), _jsx("defs", { children: _jsx("pattern", { id: "grid", width: "20", height: "20", patternUnits: "userSpaceOnUse", children: _jsx("path", { d: "M 20 0 L 0 0 0 20", fill: "none", stroke: "var(--devtools-border, #333)", strokeWidth: "0.5", opacity: "0.3" }) }) }), _jsx("rect", { width: svgWidth, height: svgHeight, fill: "url(#grid)" }), _jsxs("g", { className: "edges", children: [filteredEdges.map(edge => { }), "const fromNode = filteredNodes.find(n => n.id === edge.from); const toNode = filteredNodes.find(n => n.id === edge.to); if (!fromNode || !toNode) return null; const isDifferentDomain = fromNode.domain !== toNode.domain; const strokeWidth = Math.max(1, edge.weight * 3); const strokeColor = isDifferentDomain ? '#f39c12' : '#61dafb'; const opacity = isDifferentDomain ? 0.6 : 0.8; return;", _jsxs("g", { children: [_jsx("line", { x1: fromNode.position.x, y1: fromNode.position.y, x2: toNode.position.x, y2: toNode.position.y, stroke: strokeColor, strokeWidth: strokeWidth, opacity: opacity, markerEnd: "url(#arrowhead)" }), filters.showLabels && edge.label && ()
                            < text, "x=", (fromNode.position.x + toNode.position.x) / 2, "y=", (fromNode.position.y + toNode.position.y) / 2, "fill=\"var(--devtools-text-secondary, #aaa)\" fontSize=\"10\" textAnchor=\"middle\" className=\"edge-label\" >", edge.label] }, edge.id), ")}"] }), "); })}"] });
{ /* Arrow marker */ }
_jsx("defs", { children: _jsx("marker", { id: "arrowhead", markerWidth: "10", markerHeight: "7", refX: "9", refY: "3.5", orient: "auto", children: _jsx("polygon", { points: "0 0, 10 3.5, 0 7", fill: "#61dafb" }) }) });
{ /* Nodes */ }
_jsxs("g", { className: "nodes", children: [filteredNodes.map(node => { }), "const nodeSize = getNodeSize(node); const nodeColor = getNodeColor(node.type); const isSelected = selectedNode === node.id; const strokeWidth = isSelected ? 3 : 1; const strokeColor = isSelected ? '#fff' : nodeColor; return;", _jsxs("g", { className: "node", onClick: () => handleNodeClick(node.id), children: [_jsx("circle", { cx: node.position.x, cy: node.position.y, r: nodeSize, fill: nodeColor, stroke: strokeColor, strokeWidth: strokeWidth, opacity: 0.9, className: "node-circle" }), filters.showLabels && ()
                    < text, "x=", node.position.x, "y=", node.position.y + nodeSize + 15, "fill=\"var(--devtools-text, #fff)\" fontSize=\"10\" textAnchor=\"middle\" className=\"node-label\" >", node.label] }, node.id), ")}", filters.showMetrics && ()
            < text, "x=", node.position.x, "y=", node.position.y - nodeSize - 5, "fill=\"var(--devtools-text-secondary, #aaa)\" fontSize=\"8\" textAnchor=\"middle\" className=\"node-metric\" >", node.metadata.accessCount] });
g >
;
;
g >
;
svg >
;
;
;
const selectedNodeData = selectedNode && dependencyGraph?.nodes.find(n => n.id === selectedNode);
return;
_jsxs("div", { className: "dependency-graph-panel", children: [_jsx("div", { className: "graph-controls", children: _jsx("div", { className: "control-group", children: _jsxs("label", { children: ["Domain:", _jsxs("select", { value: selectedDomain, onChange: (e) => onDomainChange(e.target.value), children: [_jsx("option", { value: "all", children: "All Domains" }), dependencyGraph?.nodes &&
                                    [...new Set(dependencyGraph.nodes.map(node => node.domain))].map(domain => ()
                                        < option, key = { domain }, value = { domain } > { domain })] }), "))"] }) }) }), _jsx("div", { className: "control-group", children: _jsxs("label", { children: ["Layout:", _jsxs("select", { value: layout, onChange: (e) => setLayout(e.target.value), children: [_jsx("option", { value: "hierarchical", children: "Hierarchical" }), _jsx("option", { value: "force", children: "Force-directed" }), _jsx("option", { value: "circular", children: "Circular" })] })] }) }), _jsxs("div", { className: "control-group", children: [_jsx("span", { children: "Filters:" }), _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: filters.includeComponents, onChange: (e) => handleFilterChange('includeComponents', e.target.checked) }), "Components"] }), _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: filters.includeSelectors, onChange: (e) => handleFilterChange('includeSelectors', e.target.checked) }), "Selectors"] }), _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: filters.includeCrossDomainLinks, onChange: (e) => handleFilterChange('includeCrossDomainLinks', e.target.checked) }), "Cross-domain"] })] }), _jsxs("div", { className: "control-group", children: [_jsx("span", { children: "Display:" }), _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: filters.showLabels, onChange: (e) => handleFilterChange('showLabels', e.target.checked) }), "Labels"] }), _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: filters.showMetrics, onChange: (e) => handleFilterChange('showMetrics', e.target.checked) }), "Metrics"] })] }), _jsxs("div", { className: "control-group", children: [_jsx("span", { children: "Zoom:" }), _jsx("button", { className: "zoom-btn", onClick: handleZoomOut, children: "\u2212" }), _jsxs("span", { className: "zoom-level", children: [Math.round(zoom * 100), "%"] }), _jsx("button", { className: "zoom-btn", onClick: handleZoomIn, children: "+" }), _jsx("button", { className: "zoom-btn", onClick: handleResetZoom, children: "Reset" })] }), _jsx("button", { className: "regenerate-btn", onClick: onGenerateGraph, children: "Regenerate" })] })
    ,
        _jsxs("div", { className: "graph-content", children: [_jsx("div", { className: "graph-viewer", children: renderGraph() }), selectedNodeData && ()
                    < div, " className=\"node-details\">", _jsx("h4", { children: "Node Details" }), _jsxs("div", { className: "detail-section", children: [_jsx("h5", { children: "Basic Info" }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "ID:" }), _jsx("span", { className: "detail-value", children: selectedNodeData.id })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Type:" }), _jsx("span", { className: "detail-value", style: { color: getNodeColor(selectedNodeData.type) }, children: selectedNodeData.type })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Domain:" }), _jsx("span", { className: "detail-value", children: selectedNodeData.domain })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Label:" }), _jsx("span", { className: "detail-value", children: selectedNodeData.label })] })] }), _jsxs("div", { className: "detail-section", children: [_jsx("h5", { children: "Dependencies" }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Dependencies:" }), _jsx("span", { className: "detail-value", children: selectedNodeData.metadata.dependencies.length })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Dependents:" }), _jsx("span", { className: "detail-value", children: selectedNodeData.metadata.dependents.length })] })] }), _jsxs("div", { className: "detail-section", children: [_jsx("h5", { children: "Performance" }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Access Count:" }), _jsx("span", { className: "detail-value", children: selectedNodeData.metadata.accessCount })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Avg Execution:" }), _jsx("span", { className: "detail-value", children: formatPerformanceMetric(selectedNodeData.metadata.performance.averageExecutionTime) })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Total Executions:" }), _jsx("span", { className: "detail-value", children: selectedNodeData.metadata.performance.totalExecutions })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Error Count:" }), _jsx("span", { className: "detail-value error-count", children: selectedNodeData.metadata.performance.errorCount })] })] }), _jsxs("div", { className: "detail-section", children: [_jsx("h5", { children: "Relationships" }), _jsx("div", { className: "relationship-list", children: selectedNodeData.metadata.dependencies.map(depId => ()
                                < div, key = { depId }, className = "relationship-item dependency" >
                                (_jsx("span", { className: "relationship-arrow", children: "\u2190" })
                                    ,
                                        _jsx("span", { className: "relationship-id", children: depId }))) }), "))}", selectedNodeData.metadata.dependents.map(depId => ()
                            < div, key = { depId }, className = "relationship-item dependent" >
                            (_jsx("span", { className: "relationship-arrow", children: "\u2192" })
                                ,
                                    _jsx("span", { className: "relationship-id", children: depId })))] }), "))}"] });
div >
;
div >
;
div >
    { /* Graph Statistics */};
{
    dependencyGraph && ()
        < div;
    className = "graph-stats" >
        (_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Nodes:" }), _jsx("span", { className: "stat-value", children: dependencyGraph.metadata.totalNodes })] })
            ,
                _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Edges:" }), _jsx("span", { className: "stat-value", children: dependencyGraph.metadata.totalEdges })] })
                    ,
                        _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Complexity:" }), _jsx("span", { className: "stat-value", children: dependencyGraph.metadata.complexity })] })
                            ,
                                _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Circular Dependencies:" }), _jsx("span", { className: "stat-value circular-deps", children: dependencyGraph.metadata.circularDependencies.length })] }));
    div >
    ;
}
_jsx("style", { jsx: true, children: `
        .dependency-graph-panel {
          height: 100%
  display: flex;
          flex-direction: column;
  background: var(--devtools-bg, #1e1e1e);
        .graph-controls {
          display: flex;
          align-items: center;
  gap: 16px;
          padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          background: var(--devtools-section-bg, #252525);
          flex-wrap: wrap;
        .control-group {
          display: flex;
          align-items: center;
  gap: 8px;
          font-size: 12px;
  color: var(--devtools-text, #fff);
        .control-group select {
          background: var(--devtools-input-bg, #2a2a2a);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        .checkbox-label {
          display: flex;
          align-items: center;
  gap: 4px;
          cursor: pointer;
        .checkbox-label input[type="checkbox"] {
          margin: 0;
        .zoom-btn {
          background: var(--devtools-btn-bg, #2a2a2a);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          padding: 4px 8px;
          border-radius: 4px;
  cursor: pointer;
          font-size: 12px;
          min-width: 30px;
        .zoom-btn:hover {
  background: var(--devtools-hover, #404040);
        .zoom-level {
          min-width: 50px;
          text-align: center;
          font-size: 11px;
  color: var(--devtools-text-secondary, #aaa);
        .regenerate-btn {
          background: var(--devtools-active, #61dafb);
          border: none;
  color: #000;
          padding: 6px 12px;
          border-radius: 4px;
  cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        .graph-content {
          flex: 1;
  display: flex;
          overflow: hidden;
        .graph-viewer {
          flex: 1;
  overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
  background: var(--devtools-graph-bg, #1a1a1a);
        .dependency-graph-svg {
          border: 1px solid var(--devtools-border, #333);
          border-radius: 4px;
  background: var(--devtools-bg, #1e1e1e);
        .empty-graph {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
  height: 400px;
          color: var(--devtools-text-secondary, #aaa);
          text-align: center;
        .empty-graph span {
          font-size: 48px;
          margin-bottom: 16px;
        .generate-btn {
          background: var(--devtools-active, #61dafb);
          border: none;
  color: #000;
          padding: 8px 16px;
          border-radius: 4px;
  cursor: pointer;
          font-size: 14px;
          margin-top: 16px;
        .node-circle {
          cursor: pointer;
  transition: all 0.2s;
        .node-circle:hover {
          stroke-width: 2;
  filter: brightness(1.2);
        .node-label
        .node-metric }
        .edge-label {
          pointer-events: none;
          user-select: none;
        .node-details {
          width: 300px;
          border-left: 1px solid var(--devtools-border, #333);
          background: var(--devtools-section-bg, #252525);
          padding: 16px;
          overflow-y: auto;
        .node-details h4 {
          margin: 0 0 16px 0;
          font-size: 14px;
  color: var(--devtools-text, #fff);
          border-bottom: 1px solid var(--devtools-border, #333);
          padding-bottom: 8px;
        .detail-section {
          margin-bottom: 16px;
        .detail-section h5 {
          margin: 0 0 8px 0;
          font-size: 12px;
  color: var(--devtools-text, #fff);
          text-transform: uppercase;
        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 11px;
        .detail-label {
          color: var(--devtools-text-secondary, #aaa);
        .detail-value {
          color: var(--devtools-text, #fff);
          font-weight: 500;
        .error-count {
          color: #e74c3c !important;
        .relationship-list {
          max-height: 150px;
          overflow-y: auto;
        .relationship-item {
          display: flex;
          align-items: center;
  gap: 8px;
          margin-bottom: 4px;
          font-size: 11px;
        .relationship-item.dependency {
          color: #61dafb;
        .relationship-item.dependent {
          color: #98c379;
        .relationship-arrow {
          font-weight: bold;
        .relationship-id {
          color: var(--devtools-text, #fff);
          font-family: monospace;
        .graph-stats {
          display: flex;
  gap: 24px;
          padding: 12px;
          border-top: 1px solid var(--devtools-border, #333);
          background: var(--devtools-section-bg, #252525);
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
  gap: 4px;
        .stat-label {
          font-size: 10px;
  color: var(--devtools-text-secondary, #aaa);
          text-transform: uppercase;
        .stat-value {
          font-size: 14px;
  color: var(--devtools-text, #fff);
          font-weight: 600;
        .circular-deps {
          color: #e74c3c !important;
      ` });
div >
;
;
;
