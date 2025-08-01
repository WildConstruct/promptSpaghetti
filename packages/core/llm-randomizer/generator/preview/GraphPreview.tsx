// Epic 12 - LLM Agent Randomizer System
// Story 12.4 - Randomizer Generator Implementation
// Real-time graph preview with visualization
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Graph, Node } from '../../../graphSchema';


interface GraphPreviewProps { graph?: Graph;
  isGenerating?: boolean;
  onNodeSelect?: (nodeId: string) => void;
  onEdgeSelect?: (sourceId: string, targetId: string) => void;
  className?: string;
  showStats?: boolean;
  interactive?: boolean;
  interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  nodeTypes: Record<string, number>;
  complexity: 'simple' | 'moderate' | 'complex';
  hasOutput: boolean;
  hasAdvancedNodes: boolean;
  averageConnections: number;
  maxDepth: number;
  interface VisualNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  level: number;
  connections: number;
  isSelected: boolean;
  interface VisualEdge {
  id: string;
  source: string;
  target: string;
  isSelected: boolean;
  /**
  * Graph preview component with interactive visualization
  */
  export const GraphPreview: React.FC<GraphPreviewProps> = ({);
  graph;
  isGenerating = false;
  onNodeSelect;
  onEdgeSelect;
  className = '';
  showStats = true }
  interactive = true


}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<{ source: string; target: string } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // Calculate graph statistics
  const stats = useMemo((): GraphStats | null => {
    if (!graph) return null;
    const nodeCount = graph.nodes.length;
    const nodeTypes: Record<string, number> = {};
    let edgeCount = 0;
    let hasOutput = false;
    let hasAdvancedNodes = false;
    // Build edge map and count edges
    const edgeMap = new Map<string, Set<string>>();
    graph.nodes.forEach(node => { )
  // Count node types
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
      // Check for special node types
      if (node.type === 'Output') hasOutput = true;
      if (['WeightedAdvanced', 'Conditional', 'Sequential', 'Markov', 'PythonTransform'].includes(node.type)) {
        hasAdvancedNodes = true;
      // Count edges from inputs
      if (node.inputs) {
        node.inputs.forEach(inputId => {)
  if (!edgeMap.has(inputId)) {
            edgeMap.set(inputId, new Set());
          edgeMap.get(inputId)!.add(node.id);
          edgeCount++ });
    });
    // Calculate complexity
    let complexity: 'simple' | 'moderate' | 'complex';
    if (nodeCount <= 8) complexity = 'simple';
    else if (nodeCount <= 20) complexity = 'moderate';
    else complexity = 'complex';
    // Calculate average connections
    const totalConnections = Array.from(edgeMap.values());
      .reduce((sum, targets) => sum + targets.size, 0);
    const averageConnections = nodeCount > 0 ? totalConnections / nodeCount : 0;
    // Calculate max depth using BFS
    const maxDepth = calculateMaxDepth(graph.nodes, edgeMap);
    return { nodeCount,
      edgeCount,
      nodeTypes,
      complexity,
      hasOutput,
      hasAdvancedNodes,
      averageConnections }
      maxDepth
    };
  }, [graph]);
  // Generate visual layout
  const { visualNodes, visualEdges } = useMemo(() => {
    if (!graph) {
      return { visualNodes: [], visualEdges: [] };
    return generateLayout(graph, selectedNodeId, selectedEdge);
  }, [graph, selectedNodeId, selectedEdge]);
  // Handle node click
  const handleNodeClick = useCallback((nodeId: string) => { if (!interactive) return;
  setSelectedNodeId(prev => prev === nodeId ? null : nodeId);
  setSelectedEdge(null);
  onNodeSelect?.(nodeId) }, [interactive, onNodeSelect]);
  // Handle edge click
  const handleEdgeClick = useCallback((source: string, target: string) => {
    if (!interactive) return;
    setSelectedEdge(prev => )
      prev?.source === source && prev?.target === target 
        ? null 
        : { source, target }
    );
    setSelectedNodeId(null);
    onEdgeSelect?.(source, target);
  }, [interactive, onEdgeSelect]);
  // Handle zoom
  const handleWheel = useCallback((e: React.WheelEvent) => { if (!interactive) return;
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  setScale(prev => Math.max(0.2, Math.min(3, prev * delta))) }, [interactive]);
  // Handle pan start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }, [interactive, offset]);
  // Handle pan move
  const handleMouseMove = useCallback((e: React.MouseEvent) => { if (!isDragging || !interactive) return;
  setOffset({)
  x: e.clientX - dragStart.x,
  y: e.clientY - dragStart.y }
});
  }, [isDragging, interactive, dragStart]);
  // Handle pan end
  const handleMouseUp = useCallback(() => { setIsDragging(false) }, []);
  // Reset view
  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setSelectedNodeId(null);
    setSelectedEdge(null);
  }, []);
  if (isGenerating) {
    return;
      <div className={`graph-preview ${className} generating`}>}
        <div className="generating-overlay">
          <div className="spinner"></div>
          <p>Generating graph...</p>
        </div>
      </div>
    );
  if (!graph || !stats) {
    return;
      <div className={`graph-preview ${className} empty`}>}
        <div className="empty-state">
          <p>No graph to preview</p>
          <small>Generate a graph to see the visualization</small>
        </div>
      </div>
    );
  return;
    <div className={`graph-preview ${className}`}>}
      {/* Header with stats and controls */}
      <div className="preview-header">
        <div className="preview-title">Graph Preview</div>
        <div className="preview-controls">
          {interactive && ()
            <>
              <button onClick={() => setScale(prev => prev * 1.2)} title="Zoom In">+</button>
              <button onClick={() => setScale(prev => prev * 0.8)} title="Zoom Out">-</button>
              <button onClick={resetView} title="Reset View">⌂</button>
            </>
          )}
        </div>
      </div>
      {/* Statistics panel */}
      {showStats && ()
        <div className="stats-panel">
          <div className="stat-item">
            <span className="stat-label">Nodes:</span>
            <span className="stat-value">{stats.nodeCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Edges:</span>
            <span className="stat-value">{stats.edgeCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Complexity:</span>
            <span className={`stat-value complexity-${stats.complexity}`}>}
              {stats.complexity}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Depth:</span>
            <span className="stat-value">{stats.maxDepth}</span>
          </div>
          {!stats.hasOutput && ()
            <div className="stat-warning">⚠️ No Output nodes</div>
          )}
        </div>
      )}
      {/* Node type legend */}
      <div className="node-legend">
        {Object.entries(stats.nodeTypes).map(([type, count]) => ()
          <div key={type} className={`legend-item node-type-${type.toLowerCase()}`}>}
            <span className="legend-color"></span>
            <span className="legend-label">{type} ({count})</span>
          </div>
        ))}
      </div>
      {/* Graph visualization */}
      <div 
        className="graph-canvas"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <svg 
          width="100%" 
          height="100%"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`}

        >
          <defs>
            {/* Arrow marker for edges */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
            </marker>
          </defs>
          {/* Render edges */}
          <g className="edges">
            {visualEdges.map(edge => ()
              <line
                key={edge.id}
                x1={visualNodes.find(n => n.id === edge.source)?.x || 0}
                y1={visualNodes.find(n => n.id === edge.source)?.y || 0}
                x2={visualNodes.find(n => n.id === edge.target)?.x || 0}
                y2={visualNodes.find(n => n.id === edge.target)?.y || 0}
                stroke={edge.isSelected ? '#007bff' : '#666'}
                strokeWidth={edge.isSelected ? 3 : 2}
                markerEnd="url(#arrowhead)"
                className={`edge ${edge.isSelected ? 'selected' : ''}`}
                onClick={() => handleEdgeClick(edge.source, edge.target)}
                style={{ cursor: interactive ? 'pointer' : 'default' }}
              />
            ))}
          </g>
          {/* Render nodes */}
          <g className="nodes">
            {visualNodes.map(node => ()
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>}
                <circle
                  r={Math.max(20, Math.min(40, 15 + node.connections * 3))}
                  fill={getNodeColor(node.type)}
                  stroke={node.isSelected ? '#007bff' : '#333'}
                  strokeWidth={node.isSelected ? 3 : 2}
                  className={`node node-type-${node.type.toLowerCase()} ${node.isSelected ? 'selected' : ''}`}
                  onClick={() => handleNodeClick(node.id)}
                  style={{ cursor: interactive ? 'pointer' : 'default' }}
                />
                <text
                  textAnchor="middle"
                  dy="0.3em"
                  fontSize="12"
                  fill="#333"
                  pointerEvents="none"
                  className="node-label"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
      {/* Selected node info */}
      {selectedNodeId && ()
        <div className="node-info">
          {(() => {
            const node = graph.nodes.find(n => n.id === selectedNodeId);
            if (!node) return null;
            return;
              <div className="info-panel">
                <h4>{node.id}</h4>
                <p><strong>Type:</strong> {node.type}</p>
                {node.inputs && ()
                  <p><strong>Inputs:</strong> {node.inputs.join(', ')}</p>
                )}
                {/* Show type-specific properties */}
                {node.type === 'WeightedChoice' && 'choices' in node && ()
                  <div>
                    <strong>Choices:</strong>
                    <ul>
                      {(node as any).choices.map((choice: any, idx: number) => ()
                        <li key={idx}>{choice.value} ({choice.weight})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
/**
 * Calculate maximum depth of the graph
 */
function calculateMaxDepth(nodes: Node, edgeMap: Map<string, Set<string>>): number { // Find root nodes (no incoming edges)
  const nodeIds = new Set(nodes.map(n => n.id));
  const hasIncoming = new Set<string>();
  edgeMap.forEach(targets => {)
  targets.forEach(target => hasIncoming.add(target)) });
  const roots = Array.from(nodeIds).filter(id => !hasIncoming.has(id));
  if (roots.length === 0) return 0;
  // BFS to find maximum depth
  let maxDepth = 0;
  const queue: Array<{ nodeId: string; depth: number }> = roots.map(id => ({ nodeId: id, depth: 0 }));
  const visited = new Set<string>();
  while (queue.length > 0) {
    const { nodeId, depth } = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    maxDepth = Math.max(maxDepth, depth);
    const targets = edgeMap.get(nodeId);
    if (targets) {
      targets.forEach(target => {)
  if (!visited.has(target)) {
          queue.push({ nodeId: target, depth: depth + 1 });
      });
  return maxDepth;
/**
 * Generate layout for visual nodes and edges
 */
function generateLayout(graph: Graph, (
    selectedNodeId: string | null
    selectedEdge: { source: string; target: string } | null
  ): { visualNodes: VisualNode; visualEdges: VisualEdge } { const nodes = graph.nodes;
  const visualNodes: VisualNode = [];
  const visualEdges: VisualEdge = [];
  // Build edge map
  const edgeMap = new Map<string, Set<string>>();
  const incomingMap = new Map<string, Set<string>>();
  nodes.forEach(node => {)
  if (node.inputs) {
  node.inputs.forEach(inputId => {)
  if (!edgeMap.has(inputId)) {
  edgeMap.set(inputId, new Set());
  edgeMap.get(inputId)!.add(node.id);
  if (!incomingMap.has(node.id)) {
  incomingMap.set(node.id, new Set());
  incomingMap.get(node.id)!.add(inputId) });
  });
  // Calculate levels using topological sort
  const levels = new Map<string, number>();
  const queue = nodes.filter(node => !incomingMap.has(node.id)).map(n => n.id);
  let currentLevel = 0;
  while (queue.length > 0) { const levelNodes = [...queue];
    queue.length = 0;
    levelNodes.forEach(nodeId => {)
  levels.set(nodeId, currentLevel);
      const targets = edgeMap.get(nodeId);
      if (targets) {
        targets.forEach(target => {)
  const incoming = incomingMap.get(target);
          if (incoming) {
            incoming.delete(nodeId);
            if (incoming.size === 0) {
              queue.push(target) });
    });
    currentLevel++;
  // Handle remaining nodes (cycles)
  nodes.forEach(node => { )
  if (!levels.has(node.id)) {
      levels.set(node.id, currentLevel) });
  // Generate positions
  const levelGroups = new Map<number, string>();
  levels.forEach((level, nodeId) => { if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    levelGroups.get(level)!.push(nodeId) });
  const width = 800;
  const height = 600;
  const levelHeight = height / Math.max(1, levelGroups.size);
  levelGroups.forEach((nodeIds, level) => { const levelWidth = width / Math.max(1, nodeIds.length);
  nodeIds.forEach((nodeId, index) => {
  const node = nodes.find(n => n.id === nodeId)!;
  const connections = (edgeMap.get(nodeId)?.size || 0) + (incomingMap.get(nodeId)?.size || 0);
  visualNodes.push({)
  id: nodeId
  type: node.type
  label: nodeId.length > 10 ? nodeId.substring(0, 10) + '...' : nodeId
  x: (index + 0.5) * levelWidth
  y: (level + 0.5) * levelHeight
  level
  connections
  isSelected: nodeId === selectedNodeId }
});
    });
  });
  // Generate edges
  edgeMap.forEach((targets, source) => {
    targets.forEach(target => {)
  visualEdges.push({)
  id: `${source}-${target}`}

        source
        target
        isSelected: selectedEdge?.source === source && selectedEdge?.target === target;
  });
    });
  });
  return { visualNodes, visualEdges };
/**
 * Get color for node type
 */
function getNodeColor(nodeType: string): string { const colors: Record<string, string> = {
  'WeightedChoice': '#ff6b6b'
  'WeightedAdvanced': '#ee5a52'
  'Conditional': '#4ecdc4'
  'Sequential': '#45b7d1'
  'Markov': '#96ceb4'
  'Concat': '#feca57'
  'Output': '#ff9ff3'
  'SetVariable': '#54a0ff'
  'GetVariable': '#5f27cd'
  'Include': '#00d2d3'
  'PythonTransform': '#ff6348' }
};
  return colors[nodeType] || '#ddd';