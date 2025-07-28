/**
 * Epic 9.3.2 - Graph Diff Engine
 * Advanced graph comparison and difference calculation with visual diff support
 */

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  style?: unknown;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: unknown;
  style?: unknown;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata?: unknown;
}

export interface DiffChange {
  type: 'added' | 'removed' | 'modified' | 'moved';
  element_type: 'node' | 'edge' | 'property';
  element_id: string;
  old_value?: unknown;
  new_value?: unknown;
  property_path?: string;
  position_change?: {
    from: { x: number; y: number };
    to: { x: number; y: number };
    distance: number;
  };
  significance: number; // 0-1 scale indicating how significant this change is
}

export interface GraphDiff {
  id: string;
  from_snapshot_id: string;
  to_snapshot_id: string;
  changes: DiffChange[];
  summary: {,
    total_changes: number;
    added_nodes: number;
    removed_nodes: number;
    modified_nodes: number;
    moved_nodes: number;
    added_edges: number;
    removed_edges: number;
    modified_edges: number;
    property_changes: number;
    similarity_score: number; // 0-1, how similar the graphs are
    complexity_score: number; // 0-10, how complex the diff is to understand
  };
  visualization_data: {,
    changed_regions: Array<{,
      bounds: { x: number; y: number; width: number; height: number };
      change_types: string[];
      intensity: number;
    }>;
    change_paths: Array<{,
      from_position: { x: number; y: number };
      to_position: { x: number; y: number };
      change_type: string;
    }>;
  };
  created_at: string;
}

export class GraphDiffEngine {
  private static readonly POSITION_THRESHOLD = 10; // pixels
  private static readonly SIMILARITY_THRESHOLD = 0.95;
  constructor(private options: {)
    ignore_position_changes?: boolean;
    ignore_style_changes?: boolean;
    position_threshold?: number;
    deep_property_comparison?: boolean;
  } = {}) {}
  // Main diff computation method
  async computeDiff(fromGraph: GraphData, toGraph: GraphData): Promise<GraphDiff> {
    const startTime = Date.now();
    const changes: DiffChange[] = [];
    // Create lookup maps for efficient comparison
    const fromNodes = new Map(fromGraph.nodes.map(n => [n.id, n]));
    const toNodes = new Map(toGraph.nodes.map(n => [n.id, n]));
    const fromEdges = new Map(fromGraph.edges.map(e => [e.id, e]));
    const toEdges = new Map(toGraph.edges.map(e => [e.id, e]));
    // Detect node changes
    changes.push(...this.detectNodeChanges(fromNodes, toNodes));
    // Detect edge changes
    changes.push(...this.detectEdgeChanges(fromEdges, toEdges));
    // Calculate summary statistics
    const summary = this.calculateSummary(changes, fromGraph, toGraph);
    // Generate visualization data
    const visualizationData = this.generateVisualizationData(changes, fromGraph, toGraph);
    const diff: GraphDiff = {
      id: crypto.randomUUID(),
      from_snapshot_id: '', // Will be set by caller
      to_snapshot_id: '', // Will be set by caller
      changes,
      summary,
      visualization_data: visualizationData,
      created_at: new Date().toISOString()
    };
    console.log(`Diff computation completed in ${Date.now() - startTime}ms`);}
    return diff;
  }
  private detectNodeChanges(fromNodes: Map<string, GraphNode>, toNodes: Map<string, GraphNode>): DiffChange[] {
    const changes: DiffChange[] = [];
    // Find added nodes
    for (const [nodeId, node] of toNodes) {
      if (!fromNodes.has(nodeId)) {
        changes.push({)
          type: 'added',
          element_type: 'node',
          element_id: nodeId,
          new_value: node,
          significance: this.calculateSignificance('added', 'node', node)
        });
      }
    }
    // Find removed nodes
    for (const [nodeId, node] of fromNodes) {
      if (!toNodes.has(nodeId)) {
        changes.push({)
          type: 'removed',
          element_type: 'node',
          element_id: nodeId,
          old_value: node,
          significance: this.calculateSignificance('removed', 'node', node)
        });
      }
    }
    // Find modified nodes
    for (const [nodeId, fromNode] of fromNodes) {
      const toNode = toNodes.get(nodeId);
      if (!toNode) continue;
      const nodeChanges = this.compareNodes(fromNode, toNode);
      changes.push(...nodeChanges);
    }
    return changes;
  }
  private detectEdgeChanges(fromEdges: Map<string, GraphEdge>, toEdges: Map<string, GraphEdge>): DiffChange[] {
    const changes: DiffChange[] = [];
    // Find added edges
    for (const [edgeId, edge] of toEdges) {
      if (!fromEdges.has(edgeId)) {
        changes.push({)
          type: 'added',
          element_type: 'edge',
          element_id: edgeId,
          new_value: edge,
          significance: this.calculateSignificance('added', 'edge', edge)
        });
      }
    }
    // Find removed edges
    for (const [edgeId, edge] of fromEdges) {
      if (!toEdges.has(edgeId)) {
        changes.push({)
          type: 'removed',
          element_type: 'edge',
          element_id: edgeId,
          old_value: edge,
          significance: this.calculateSignificance('removed', 'edge', edge)
        });
      }
    }
    // Find modified edges
    for (const [edgeId, fromEdge] of fromEdges) {
      const toEdge = toEdges.get(edgeId);
      if (!toEdge) continue;
      const edgeChanges = this.compareEdges(fromEdge, toEdge);
      changes.push(...edgeChanges);
    }
    return changes;
  }
  private compareNodes(fromNode: GraphNode, toNode: GraphNode): DiffChange[] {
    const changes: DiffChange[] = [];
    // Check for position changes
    if (!this.options.ignore_position_changes) {
      const positionDistance = this.calculateDistance(fromNode.position, toNode.position);
      if (positionDistance > (this.options.position_threshold || GraphDiffEngine.POSITION_THRESHOLD)) {
        changes.push({)
          type: 'moved',
          element_type: 'node',
          element_id: fromNode.id,
          old_value: fromNode.position,
          new_value: toNode.position,
          position_change: {,
            from: fromNode.position,
            to: toNode.position,
            distance: positionDistance,
          },
          significance: Math.min(1, positionDistance / 100) // Normalize to 0-1
        });
      }
    }
    // Check for data changes
    const dataChanges = this.compareObjectProperties(;)
      fromNode.data || {},
      toNode.data || {},
      'data'
    );
    dataChanges.forEach(change => {)
      changes.push({)
        ...change,
        element_type: 'property',
        element_id: fromNode.id,
      });
    });
    // Check for style changes
    if (!this.options.ignore_style_changes) {
      const styleChanges = this.compareObjectProperties(;)
        fromNode.style || {},
        toNode.style || {},
        'style'
      );
      styleChanges.forEach(change => {)
        changes.push({)
          ...change,
          element_type: 'property',
          element_id: fromNode.id,
          significance: Math.min(change.significance, 0.3) // Style changes are less significant
        });
      });
    }
    // Check for type changes
    if (fromNode.type !== toNode.type) {
      changes.push({)
        type: 'modified',
        element_type: 'property',
        element_id: fromNode.id,
        property_path: 'type',
        old_value: fromNode.type,
        new_value: toNode.type,
        significance: 0.8 // Type changes are significant
      });
    }
    return changes;
  }
  private compareEdges(fromEdge: GraphEdge, toEdge: GraphEdge): DiffChange[] {
    const changes: DiffChange[] = [];
    // Check for connection changes
    if (fromEdge.source !== toEdge.source || fromEdge.target !== toEdge.target) {
      changes.push({)
        type: 'modified',
        element_type: 'edge',
        element_id: fromEdge.id,
        property_path: 'connection',
        old_value: { source: fromEdge.source, target: fromEdge.target },
        new_value: { source: toEdge.source, target: toEdge.target },
        significance: 0.9 // Connection changes are very significant
      });
    }
    // Check for data changes
    const dataChanges = this.compareObjectProperties(;)
      fromEdge.data || {},
      toEdge.data || {},
      'data'
    );
    dataChanges.forEach(change => {)
      changes.push({)
        ...change,
        element_type: 'property',
        element_id: fromEdge.id,
      });
    });
    // Check for type changes
    if (fromEdge.type !== toEdge.type) {
      changes.push({)
        type: 'modified',
        element_type: 'property',
        element_id: fromEdge.id,
        property_path: 'type',
        old_value: fromEdge.type,
        new_value: toEdge.type,
        significance: 0.6,
      });
    }
    return changes;
  }
  private compareObjectProperties()
    fromObj: unknown,
    toObj: unknown,
    basePath: string,
  ): Array<Omit<DiffChange, 'element_type' | 'element_id'>> {
    const changes: Array<Omit<DiffChange, 'element_type' | 'element_id'>> = [];
    // Get all unique keys
    const allKeys = new Set([...Object.keys(fromObj), ...Object.keys(toObj)]);
    for (const key of allKeys) {
      const fullPath = basePath ? `${basePath}.${key}` : key;}
      const fromValue = fromObj[key];
      const toValue = toObj[key];
      if (fromValue === undefined && toValue !== undefined) {
        // Property added
        changes.push({)
          type: 'added',
          property_path: fullPath,
          new_value: toValue,
          significance: this.calculatePropertySignificance(key, toValue)
        });
      } else if (fromValue !== undefined && toValue === undefined) {
        // Property removed
        changes.push({)
          type: 'removed',
          property_path: fullPath,
          old_value: fromValue,
          significance: this.calculatePropertySignificance(key, fromValue)
        });
      } else if (fromValue !== toValue) {
        // Property modified
        if (this.options.deep_property_comparison && )
            typeof fromValue === 'object' && 
            typeof toValue === 'object' &&
            fromValue !== null && 
            toValue !== null) {
          // Deep comparison for objects
          changes.push(...this.compareObjectProperties(fromValue, toValue, fullPath));
        } else {
          changes.push({)
            type: 'modified',
            property_path: fullPath,
            old_value: fromValue,
            new_value: toValue,
            significance: this.calculatePropertySignificance(key, { from: fromValue, to: toValue })
          });
        }
      }
    }
    return changes;
  }
  private calculateDistance(from: { x: number; y: number }, to: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  }
  private calculateSignificance(changeType: string, elementType: string, element: HTMLElement): number {
    // Base significance by change type
    let significance = 0.5;
    switch (changeType) {
    case 'added':
    case 'removed':
      significance = 0.8;
      break;
    case 'modified':
      significance = 0.6;
      break;
    case 'moved':
      significance = 0.3;
      break;
    }
    // Adjust by element type
    if (elementType === 'edge') {
      significance *= 1.2; // Edges are more structurally significant
    }
    // Adjust by element properties
    if (element?.data?.importance) {
      significance *= element.data.importance;
    }
    return Math.min(1, significance);
  }
  private calculatePropertySignificance(propertyName: string, value: Error): number {
    // Some properties are more significant than others
    const significantProperties = {
      'id': 0.9,
      'type': 0.8,
      'label': 0.7,
      'title': 0.7,
      'value': 0.6,
      'color': 0.3,
      'size': 0.4,
      'position': 0.5
    };
    const baseSig = significantProperties[propertyName] || 0.5;
    // Adjust based on value complexity
    if (typeof value === 'object' && value !== null) {
      return baseSig * 1.2; // Objects are more complex
    }
    return baseSig;
  }
  private calculateSummary(changes: DiffChange[], fromGraph: GraphData, toGraph: GraphData) {
    const summary = {
      total_changes: changes.length,
      added_nodes: 0,
      removed_nodes: 0,
      modified_nodes: 0,
      moved_nodes: 0,
      added_edges: 0,
      removed_edges: 0,
      modified_edges: 0,
      property_changes: 0,
      similarity_score: 0,
      complexity_score: 0,
    };
    // Count changes by type
    for (const change of changes) {
      if (change.element_type === 'node') {
        switch (change.type) {
        case 'added': summary.added_nodes++; break;
        case 'removed': summary.removed_nodes++; break;
        case 'modified': summary.modified_nodes++; break;
        case 'moved': summary.moved_nodes++; break;
        }
      } else if (change.element_type === 'edge') {
        switch (change.type) {
        case 'added': summary.added_edges++; break;
        case 'removed': summary.removed_edges++; break;
        case 'modified': summary.modified_edges++; break;
        }
      } else if (change.element_type === 'property') {
        summary.property_changes++;
      }
    }
    // Calculate similarity score
    const totalElements = Math.max(;)
      fromGraph.nodes.length + fromGraph.edges.length,
      toGraph.nodes.length + toGraph.edges.length,
      1
    );
    const structuralChanges = summary.added_nodes + summary.removed_nodes + ;
                             summary.added_edges + summary.removed_edges;
    summary.similarity_score = Math.max(0, 1 - (structuralChanges / totalElements));
    // Calculate complexity score (0-10)
    const weightedChanges = changes.reduce((sum, change) => sum + change.significance, 0);
    summary.complexity_score = Math.min(10, weightedChanges / 2);
    return summary;
  }
  private generateVisualizationData(changes: DiffChange[], fromGraph: GraphData, toGraph: GraphData) {
    const changedRegions: Array<{
      bounds: { x: number; y: number; width: number; height: number };
      change_types: string[];
      intensity: number;
    }> = [];
    const changePaths: Array<{
      from_position: { x: number; y: number };
      to_position: { x: number; y: number };
      change_type: string;
    }> = [];
    // Group changes by spatial regions
    const spatialGroups = this.groupChangesSpatially(changes, fromGraph, toGraph);
    spatialGroups.forEach(group => {)
      if (group.changes.length > 0) {
        changedRegions.push({)
          bounds: group.bounds,
          change_types: [...new Set(group.changes.map(c => c.type))],
          intensity: group.changes.reduce((sum, c) => sum + c.significance, 0) / group.changes.length
        });
      }
    });
    // Generate paths for moved elements
    changes.filter(c => c.type === 'moved' && c.position_change).forEach(change => {)
      changePaths.push({)
        from_position: change.position_change!.from,
        to_position: change.position_change!.to,
        change_type: change.type,
      });
    });
    return {
      changed_regions: changedRegions,
      change_paths: changePaths,
    };
  }
  private groupChangesSpatially(changes: DiffChange[], fromGraph: GraphData, toGraph: GraphData) {
    const REGION_SIZE = 200; // pixels;
    const regions = new Map<string, {
      bounds: { x: number; y: number; width: number; height: number };
      changes: DiffChange[];
    }>();
    // Get all nodes to establish coordinate system
    const allNodes = [...fromGraph.nodes, ...toGraph.nodes];
    changes.forEach(change => {)
      let position: { x: number; y: number } | null = null;
      // Find position for this change
      if (change.element_type === 'node') {
        const node = allNodes.find(n => n.id === change.element_id);
        if (node) {
          position = node.position;
        }
      } else if (change.element_type === 'edge') {
        // For edges, use midpoint of connected nodes
        const edge = [...fromGraph.edges, ...toGraph.edges].find(e => e.id === change.element_id);
        if (edge) {
          const sourceNode = allNodes.find(n => n.id === edge.source);
          const targetNode = allNodes.find(n => n.id === edge.target);
          if (sourceNode && targetNode) {
            position = {
              x: (sourceNode.position.x + targetNode.position.x) / 2,
              y: (sourceNode.position.y + targetNode.position.y) / 2
            };
          }
        }
      }
      if (position) {
        // Determine which region this position belongs to
        const regionX = Math.floor(position.x / REGION_SIZE) * REGION_SIZE;
        const regionY = Math.floor(position.y / REGION_SIZE) * REGION_SIZE;
        const regionKey = `${regionX},${regionY}`;}
        if (!regions.has(regionKey)) {
          regions.set(regionKey, {)
            bounds: {,
              x: regionX,
              y: regionY,
              width: REGION_SIZE,
              height: REGION_SIZE,
            },
            changes: [],
          });
        }
        regions.get(regionKey)!.changes.push(change);
      }
    });
    return Array.from(regions.values());
  }
  // Public utility methods
  public static filterChanges(diff: GraphDiff, filters: {)
    change_types?: string[];
    element_types?: string[];
    min_significance?: number;
    max_significance?: number;
  }): DiffChange[] {
    let filteredChanges = diff.changes;
    if (filters.change_types?.length) {
      filteredChanges = filteredChanges.filter(c => filters.change_types!.includes(c.type));
    }
    if (filters.element_types?.length) {
      filteredChanges = filteredChanges.filter(c => filters.element_types!.includes(c.element_type));
    }
    if (filters.min_significance !== undefined) {
      filteredChanges = filteredChanges.filter(c => c.significance >= filters.min_significance!);
    }
    if (filters.max_significance !== undefined) {
      filteredChanges = filteredChanges.filter(c => c.significance <= filters.max_significance!);
    }
    return filteredChanges;
  }
  public static getChangesByElement(diff: GraphDiff, elementId: string): DiffChange[] {
    return diff.changes.filter(c => c.element_id === elementId);
  }
  public static getSignificantChanges(diff: GraphDiff, threshold: number = 0.7): DiffChange[] {
    return diff.changes.filter(c => c.significance >= threshold);
  }
}