/**
 * Dependency Graph Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - Dependency Visualization UI
 */
import React, { useState, useRef, useEffect } from 'react';
import { DependencyGraph } from '../StateDevTools';

export interface DependencyGraphPanelProps {
  dependencyGraph: DependencyGraph | null;
  onGenerateGraph: () => void;
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
}

export const DependencyGraphPanel: React.FC<DependencyGraphPanelProps> = ({)
  dependencyGraph,
  onGenerateGraph,
  selectedDomain,
  onDomainChange
}) => {
  const [layout, setLayout] = useState<'hierarchical' | 'force' | 'circular'>('hierarchical');
  const [filters, setFilters] = useState({)
    includeComponents: true,
    includeSelectors: true,
    includeCrossDomainLinks: true,
    showLabels: true,
    showMetrics: false,
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const handleFilterChange = (key: keyof typeof filters, value: boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };
  const handleResetZoom = () => {
    setZoom(1);
  };
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'state': return '#61dafb';
      case 'component': return '#98c379';
      case 'selector': return '#d19a66';
      case 'middleware': return '#c678dd';
      case 'domain': return '#f39c12';
      default: return '#95a5a6';
    }
  };
  const getNodeSize = (node: any) => {
    if (!filters.showMetrics) return 20;
    const baseSize = 15;
    const metricFactor = Math.log(node.metadata.accessCount + 1) * 2;
    return Math.min(baseSize + metricFactor, 40);
  };
  const formatPerformanceMetric = (metric: number, unit: string = 'ms') => {
    if (metric < 1) return `${(metric * 1000).toFixed(0)}μs`;}
    if (metric < 1000) return `${metric.toFixed(1)}${unit}`;}
    return `${(metric / 1000).toFixed(1)}s`;}
  };
  const renderGraph = () => {
    if (!dependencyGraph || dependencyGraph.nodes.length === 0) {
      return ()
        <div className="empty-graph">
          <span>🔗</span>
          <p>No dependency graph generated</p>
          <button className="generate-btn" onClick={onGenerateGraph}>
            Generate Graph
          </button>
        </div>
      );
    }
    const { nodes, edges } = dependencyGraph;
    const filteredNodes = nodes.filter(node => {)
      if (!filters.includeComponents && node.type === 'component') return false;
      if (!filters.includeSelectors && node.type === 'selector') return false;
      return true;
    });
    const filteredEdges = edges.filter(edge => {)
      const fromNode = filteredNodes.find(n => n.id === edge.from);
      const toNode = filteredNodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return false;
      if (!filters.includeCrossDomainLinks && fromNode.domain !== toNode.domain) return false;
      return true;
    });
    const svgWidth = 800;
    const svgHeight = 600;
    return ()
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ transform: `scale(${zoom})` }}
        className="dependency-graph-svg"
      >
        {/* Background */}
        <rect width={svgWidth} height={svgHeight} fill="var(--devtools-bg, #1e1e1e)" />
        {/* Grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--devtools-border, #333)" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />
        {/* Edges */}
        <g className="edges">
          {filteredEdges.map(edge => {)
            const fromNode = filteredNodes.find(n => n.id === edge.from);
            const toNode = filteredNodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            const isDifferentDomain = fromNode.domain !== toNode.domain;
            const strokeWidth = Math.max(1, edge.weight * 3);
            const strokeColor = isDifferentDomain ? '#f39c12' : '#61dafb';
            const opacity = isDifferentDomain ? 0.6 : 0.8;
            return ()
              <g key={edge.id}>
                <line
                  x1={fromNode.position.x}
                  y1={fromNode.position.y}
                  x2={toNode.position.x}
                  y2={toNode.position.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  markerEnd="url(#arrowhead)"
                />
                {filters.showLabels && edge.label && ()
                  <text
                    x={(fromNode.position.x + toNode.position.x) / 2}
                    y={(fromNode.position.y + toNode.position.y) / 2}
                    fill="var(--devtools-text-secondary, #aaa)"
                    fontSize="10"
                    textAnchor="middle"
                    className="edge-label"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
        {/* Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#61dafb" />
          </marker>
        </defs>
        {/* Nodes */}
        <g className="nodes">
          {filteredNodes.map(node => {)
            const nodeSize = getNodeSize(node);
            const nodeColor = getNodeColor(node.type);
            const isSelected = selectedNode === node.id;
            const strokeWidth = isSelected ? 3 : 1;
            const strokeColor = isSelected ? '#fff' : nodeColor;
            return ()
              <g key={node.id} className="node" onClick={() => handleNodeClick(node.id)}>
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={nodeSize}
                  fill={nodeColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  opacity={0.9}
                  className="node-circle"
                />
                {filters.showLabels && ()
                  <text
                    x={node.position.x}
                    y={node.position.y + nodeSize + 15}
                    fill="var(--devtools-text, #fff)"
                    fontSize="10"
                    textAnchor="middle"
                    className="node-label"
                  >
                    {node.label}
                  </text>
                )}
                {filters.showMetrics && ()
                  <text
                    x={node.position.x}
                    y={node.position.y - nodeSize - 5}
                    fill="var(--devtools-text-secondary, #aaa)"
                    fontSize="8"
                    textAnchor="middle"
                    className="node-metric"
                  >
                    {node.metadata.accessCount}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    );
  };
  const selectedNodeData = selectedNode && dependencyGraph?.nodes.find(n => n.id === selectedNode);
  return ()
    <div className="dependency-graph-panel">
      {/* Controls */}
      <div className="graph-controls">
        <div className="control-group">
          <label>
            Domain:
            <select value={selectedDomain} onChange={(e) => onDomainChange(e.target.value)}>
              <option value="all">All Domains</option>
              {dependencyGraph?.nodes && 
                [...new Set(dependencyGraph.nodes.map(node => node.domain))].map(domain => ()
                  <option key={domain} value={domain}>{domain}</option>
                ))
              }
            </select>
          </label>
        </div>
        <div className="control-group">
          <label>
            Layout:
            <select value={layout} onChange={(e) => setLayout(e.target.value as any)}>
              <option value="hierarchical">Hierarchical</option>
              <option value="force">Force-directed</option>
              <option value="circular">Circular</option>
            </select>
          </label>
        </div>
        <div className="control-group">
          <span>Filters:</span>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.includeComponents}
              onChange={(e) => handleFilterChange('includeComponents', e.target.checked)}
            />
            Components
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.includeSelectors}
              onChange={(e) => handleFilterChange('includeSelectors', e.target.checked)}
            />
            Selectors
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.includeCrossDomainLinks}
              onChange={(e) => handleFilterChange('includeCrossDomainLinks', e.target.checked)}
            />
            Cross-domain
          </label>
        </div>
        <div className="control-group">
          <span>Display:</span>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.showLabels}
              onChange={(e) => handleFilterChange('showLabels', e.target.checked)}
            />
            Labels
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.showMetrics}
              onChange={(e) => handleFilterChange('showMetrics', e.target.checked)}
            />
            Metrics
          </label>
        </div>
        <div className="control-group">
          <span>Zoom:</span>
          <button className="zoom-btn" onClick={handleZoomOut}>−</button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button className="zoom-btn" onClick={handleZoomIn}>+</button>
          <button className="zoom-btn" onClick={handleResetZoom}>Reset</button>
        </div>
        <button className="regenerate-btn" onClick={onGenerateGraph}>
          Regenerate
        </button>
      </div>
      <div className="graph-content">
        {/* Graph Viewer */}
        <div className="graph-viewer">
          {renderGraph()}
        </div>
        {/* Node Details */}
        {selectedNodeData && ()
          <div className="node-details">
            <h4>Node Details</h4>
            <div className="detail-section">
              <h5>Basic Info</h5>
              <div className="detail-item">
                <span className="detail-label">ID:</span>
                <span className="detail-value">{selectedNodeData.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value" style={{ color: getNodeColor(selectedNodeData.type) }}>
                  {selectedNodeData.type}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Domain:</span>
                <span className="detail-value">{selectedNodeData.domain}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Label:</span>
                <span className="detail-value">{selectedNodeData.label}</span>
              </div>
            </div>
            <div className="detail-section">
              <h5>Dependencies</h5>
              <div className="detail-item">
                <span className="detail-label">Dependencies:</span>
                <span className="detail-value">{selectedNodeData.metadata.dependencies.length}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Dependents:</span>
                <span className="detail-value">{selectedNodeData.metadata.dependents.length}</span>
              </div>
            </div>
            <div className="detail-section">
              <h5>Performance</h5>
              <div className="detail-item">
                <span className="detail-label">Access Count:</span>
                <span className="detail-value">{selectedNodeData.metadata.accessCount}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Avg Execution:</span>
                <span className="detail-value">
                  {formatPerformanceMetric(selectedNodeData.metadata.performance.averageExecutionTime)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Executions:</span>
                <span className="detail-value">{selectedNodeData.metadata.performance.totalExecutions}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Error Count:</span>
                <span className="detail-value error-count">
                  {selectedNodeData.metadata.performance.errorCount}
                </span>
              </div>
            </div>
            <div className="detail-section">
              <h5>Relationships</h5>
              <div className="relationship-list">
                {selectedNodeData.metadata.dependencies.map(depId => ()
                  <div key={depId} className="relationship-item dependency">
                    <span className="relationship-arrow">←</span>
                    <span className="relationship-id">{depId}</span>
                  </div>
                ))}
                {selectedNodeData.metadata.dependents.map(depId => ()
                  <div key={depId} className="relationship-item dependent">
                    <span className="relationship-arrow">→</span>
                    <span className="relationship-id">{depId}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Graph Statistics */}
      {dependencyGraph && ()
        <div className="graph-stats">
          <div className="stat-item">
            <span className="stat-label">Nodes:</span>
            <span className="stat-value">{dependencyGraph.metadata.totalNodes}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Edges:</span>
            <span className="stat-value">{dependencyGraph.metadata.totalEdges}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Complexity:</span>
            <span className="stat-value">{dependencyGraph.metadata.complexity}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Circular Dependencies:</span>
            <span className="stat-value circular-deps">
              {dependencyGraph.metadata.circularDependencies.length}
            </span>
          </div>
        </div>
      )}
      <style jsx>{`
        .dependency-graph-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--devtools-bg, #1e1e1e);
        }
        .graph-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          background: var(--devtools-section-bg, #252525);
          flex-wrap: wrap;
        }
        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--devtools-text, #fff);
        }
        .control-group select {
          background: var(--devtools-input-bg, #2a2a2a);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }
        .checkbox-label input[type="checkbox"] {
          margin: 0;
        }
        .zoom-btn {
          background: var(--devtools-btn-bg, #2a2a2a);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          min-width: 30px;
        }
        .zoom-btn:hover {
          background: var(--devtools-hover, #404040);
        }
        .zoom-level {
          min-width: 50px;
          text-align: center;
          font-size: 11px;
          color: var(--devtools-text-secondary, #aaa);
        }
        .regenerate-btn {
          background: var(--devtools-active, #61dafb);
          border: none;
          color: #000;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        }
        .graph-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .graph-viewer {
          flex: 1;
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--devtools-graph-bg, #1a1a1a);
        }
        .dependency-graph-svg {
          border: 1px solid var(--devtools-border, #333);
          border-radius: 4px;
          background: var(--devtools-bg, #1e1e1e);
        }
        .empty-graph {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: var(--devtools-text-secondary, #aaa);
          text-align: center;
        }
        .empty-graph span {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .generate-btn {
          background: var(--devtools-active, #61dafb);
          border: none;
          color: #000;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 16px;
        }
        .node-circle {
          cursor: pointer;
          transition: all 0.2s;
        }
        .node-circle:hover {
          stroke-width: 2;
          filter: brightness(1.2);
        }
        .node-label,
        .node-metric,
        .edge-label {
          pointer-events: none;
          user-select: none;
        }
        .node-details {
          width: 300px;
          border-left: 1px solid var(--devtools-border, #333);
          background: var(--devtools-section-bg, #252525);
          padding: 16px;
          overflow-y: auto;
        }
        .node-details h4 {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: var(--devtools-text, #fff);
          border-bottom: 1px solid var(--devtools-border, #333);
          padding-bottom: 8px;
        }
        .detail-section {
          margin-bottom: 16px;
        }
        .detail-section h5 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: var(--devtools-text, #fff);
          text-transform: uppercase;
        }
        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 11px;
        }
        .detail-label {
          color: var(--devtools-text-secondary, #aaa);
        }
        .detail-value {
          color: var(--devtools-text, #fff);
          font-weight: 500;
        }
        .error-count {
          color: #e74c3c !important;
        }
        .relationship-list {
          max-height: 150px;
          overflow-y: auto;
        }
        .relationship-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          font-size: 11px;
        }
        .relationship-item.dependency {
          color: #61dafb;
        }
        .relationship-item.dependent {
          color: #98c379;
        }
        .relationship-arrow {
          font-weight: bold;
        }
        .relationship-id {
          color: var(--devtools-text, #fff);
          font-family: monospace;
        }
        .graph-stats {
          display: flex;
          gap: 24px;
          padding: 12px;
          border-top: 1px solid var(--devtools-border, #333);
          background: var(--devtools-section-bg, #252525);
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .stat-label {
          font-size: 10px;
          color: var(--devtools-text-secondary, #aaa);
          text-transform: uppercase;
        }
        .stat-value {
          font-size: 14px;
          color: var(--devtools-text, #fff);
          font-weight: 600;
        }
        .circular-deps {
          color: #e74c3c !important;
        }
      `}</style>
    </div>
  );
};