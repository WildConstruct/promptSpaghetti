// Graph Comparison Service - Core comparison algorithm implementation
// Story 9.3.2 - Visual Diff Tool

import {
  GraphComparison,
  GraphComparisonSnapshot,
  NodeChange,
  EdgeChange,
  GraphData,
  ComparisonConfig,
  DetailedComparison,
  NodeMatchResult,
  EdgeMatchResult,
  ChangeSummary,
  MatchType
} from '../database/comparison-models.js';

export class GraphComparisonService {
  private config: ComparisonConfig;

  constructor(config: ComparisonConfig) {
    this.config = config;
  }

  /**
   * Main comparison algorithm - compares two graph versions
   */
  async compareGraphs(
    sourceData: GraphData,
    targetData: GraphData,
    comparisonType: 'structural' | 'semantic' | 'visual' = 'structural'
  ): Promise<DetailedComparison> {
    const startTime = Date.now();
    const algorithmSteps: string[] = [];

    try {
      // Step 1: Create comparison snapshots
      algorithmSteps.push('Creating comparison snapshots');
      const sourceSnapshot = this.createSnapshot(sourceData);
      const targetSnapshot = this.createSnapshot(targetData);

      // Step 2: Quick hash comparison for identical graphs
      algorithmSteps.push('Performing quick hash comparison');
      if (sourceSnapshot.structure_hash === targetSnapshot.structure_hash) {
        return this.createIdenticalComparison(sourceData, targetData, algorithmSteps, startTime);
      }

      // Step 3: Node matching algorithm
      algorithmSteps.push('Executing node matching algorithm');
      const nodeMatches = await this.matchNodes(sourceData.nodes, targetData.nodes, comparisonType);

      // Step 4: Edge matching algorithm
      algorithmSteps.push('Executing edge matching algorithm');
      const edgeMatches = await this.matchEdges(sourceData.edges, targetData.edges, nodeMatches);

      // Step 5: Calculate changes and similarity
      algorithmSteps.push('Calculating changes and similarity score');
      const changes = this.calculateChanges(nodeMatches, edgeMatches, sourceData, targetData);
      const similarity = this.calculateSimilarity(changes, sourceSnapshot, targetSnapshot);

      // Step 6: Generate detailed comparison result
      algorithmSteps.push('Generating detailed comparison result');
      const comparison = this.buildComparisonResult(
        sourceData,
        targetData,
        nodeMatches,
        edgeMatches,
        changes,
        similarity,
        comparisonType,
        algorithmSteps,
        startTime
      );

      return comparison;

    } catch (error) {
      algorithmSteps.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`Graph comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a normalized snapshot of graph data for comparison
   */
  private createSnapshot(graphData: GraphData): GraphComparisonSnapshot {
    const nodesIndex: Record<string, any> = {};
    const edgesIndex: Record<string, any> = {};
    const propertiesIndex: Record<string, any> = {};

    // Index nodes by ID with normalized data
    graphData.nodes.forEach(node => {
      nodesIndex[node.id] = {
        type: node.type,
        position: node.position,
        properties: this.extractNodeProperties(node)
      };
      
      // Index properties for quick lookup
      Object.keys(node.data || {}).forEach(key => {
        if (!propertiesIndex[key]) propertiesIndex[key] = new Set();
        propertiesIndex[key].add(node.data![key]);
      });
    });

    // Index edges by ID with normalized data
    graphData.edges.forEach(edge => {
      edgesIndex[edge.id] = {
        source: edge.source,
        target: edge.target,
        properties: edge.data || {}
      };
    });

    // Calculate hashes
    const nodesHash = this.calculateHash(JSON.stringify(nodesIndex));
    const edgesHash = this.calculateHash(JSON.stringify(edgesIndex));
    const structureHash = this.calculateHash(nodesHash + edgesHash);

    // Calculate complexity score
    const complexityScore = this.calculateComplexityScore(graphData);

    return {
      id: '',
      graph_id: graphData.id,
      version_id: '',
      nodes_hash: nodesHash,
      edges_hash: edgesHash,
      structure_hash: structureHash,
      nodes_index: nodesIndex,
      edges_index: edgesIndex,
      properties_index: propertiesIndex,
      node_count: graphData.nodes.length,
      edge_count: graphData.edges.length,
      complexity_score: complexityScore,
      created_at: new Date()
    };
  }

  /**
   * Advanced node matching algorithm using multiple similarity metrics
   */
  private async matchNodes(
    sourceNodes: GraphData['nodes'],
    targetNodes: GraphData['nodes'],
    comparisonType: string
  ): Promise<NodeMatchResult[]> {
    const matches: NodeMatchResult[] = [];
    const sourceMap = new Map(sourceNodes.map(n => [n.id, n]));
    const targetMap = new Map(targetNodes.map(n => [n.id, n]));
    const matchedTargets = new Set<string>();

    // Phase 1: Exact ID matches
    for (const sourceNode of sourceNodes) {
      const targetNode = targetMap.get(sourceNode.id);
      if (targetNode) {
        const similarity = this.calculateNodeSimilarity(sourceNode, targetNode, comparisonType);
        const matchType: MatchType = similarity === 1 ? 'exact' : 'modified';
        
        matches.push({
          id: '',
          comparison_id: '',
          source_node_id: sourceNode.id,
          target_node_id: targetNode.id,
          match_type: matchType,
          confidence_score: similarity,
          match_criteria: { method: 'id_match', similarity },
          property_changes: this.getNodePropertyChanges(sourceNode, targetNode),
          position_changed: this.hasPositionChanged(sourceNode, targetNode),
          visual_changes: this.getVisualChanges(sourceNode, targetNode),
          created_at: new Date()
        });
        
        matchedTargets.add(targetNode.id);
      }
    }

    // Phase 2: Similarity-based matching for unmatched nodes
    const unmatchedSource = sourceNodes.filter(n => !targetMap.has(n.id));
    const unmatchedTarget = targetNodes.filter(n => !sourceMap.has(n.id) && !matchedTargets.has(n.id));

    for (const sourceNode of unmatchedSource) {
      let bestMatch: { node: any; score: number } | null = null;

      for (const targetNode of unmatchedTarget) {
        if (matchedTargets.has(targetNode.id)) continue;

        const similarity = this.calculateNodeSimilarity(sourceNode, targetNode, comparisonType);
        if (similarity >= this.config.node_similarity_threshold && 
            (!bestMatch || similarity > bestMatch.score)) {
          bestMatch = { node: targetNode, score: similarity };
        }
      }

      if (bestMatch) {
        matches.push({
          id: '',
          comparison_id: '',
          source_node_id: sourceNode.id,
          target_node_id: bestMatch.node.id,
          match_type: 'similar',
          confidence_score: bestMatch.score,
          match_criteria: { method: 'similarity_match', similarity: bestMatch.score },
          property_changes: this.getNodePropertyChanges(sourceNode, bestMatch.node),
          position_changed: this.hasPositionChanged(sourceNode, bestMatch.node),
          visual_changes: this.getVisualChanges(sourceNode, bestMatch.node),
          created_at: new Date()
        });
        
        matchedTargets.add(bestMatch.node.id);
      } else {
        // Mark as removed
        matches.push({
          id: '',
          comparison_id: '',
          source_node_id: sourceNode.id,
          target_node_id: undefined,
          match_type: 'removed',
          confidence_score: 1.0,
          match_criteria: { method: 'removal_detection' },
          property_changes: {},
          position_changed: false,
          visual_changes: {},
          created_at: new Date()
        });
      }
    }

    // Phase 3: Mark unmatched target nodes as added
    for (const targetNode of unmatchedTarget) {
      if (!matchedTargets.has(targetNode.id)) {
        matches.push({
          id: '',
          comparison_id: '',
          source_node_id: undefined,
          target_node_id: targetNode.id,
          match_type: 'added',
          confidence_score: 1.0,
          match_criteria: { method: 'addition_detection' },
          property_changes: {},
          position_changed: false,
          visual_changes: {},
          created_at: new Date()
        });
      }
    }

    return matches;
  }

  /**
   * Edge matching algorithm based on node matches and edge properties
   */
  private async matchEdges(
    sourceEdges: GraphData['edges'],
    targetEdges: GraphData['edges'],
    nodeMatches: NodeMatchResult[]
  ): Promise<EdgeMatchResult[]> {
    const matches: EdgeMatchResult[] = [];
    const nodeIdMap = new Map<string, string>();

    // Build node ID mapping from node matches
    nodeMatches.forEach(match => {
      if (match.source_node_id && match.target_node_id) {
        nodeIdMap.set(match.source_node_id, match.target_node_id);
      }
    });

    const sourceMap = new Map(sourceEdges.map(e => [e.id, e]));
    const targetMap = new Map(targetEdges.map(e => [e.id, e]));
    const matchedTargets = new Set<string>();

    // Phase 1: Exact ID matches
    for (const sourceEdge of sourceEdges) {
      const targetEdge = targetMap.get(sourceEdge.id);
      if (targetEdge) {
        const similarity = this.calculateEdgeSimilarity(sourceEdge, targetEdge, nodeIdMap);
        const matchType: MatchType = similarity === 1 ? 'exact' : 'modified';
        
        matches.push({
          id: '',
          comparison_id: '',
          source_edge_id: sourceEdge.id,
          target_edge_id: targetEdge.id,
          match_type: matchType,
          source_from_node: sourceEdge.source,
          source_to_node: sourceEdge.target,
          target_from_node: targetEdge.source,
          target_to_node: targetEdge.target,
          confidence_score: similarity,
          property_changes: this.getEdgePropertyChanges(sourceEdge, targetEdge),
          created_at: new Date()
        });
        
        matchedTargets.add(targetEdge.id);
      }
    }

    // Phase 2: Connection-based matching
    const unmatchedSource = sourceEdges.filter(e => !targetMap.has(e.id));
    const unmatchedTarget = targetEdges.filter(e => !sourceMap.has(e.id) && !matchedTargets.has(e.id));

    for (const sourceEdge of unmatchedSource) {
      let bestMatch: { edge: any; score: number } | null = null;

      for (const targetEdge of unmatchedTarget) {
        if (matchedTargets.has(targetEdge.id)) continue;

        const similarity = this.calculateEdgeSimilarity(sourceEdge, targetEdge, nodeIdMap);
        if (similarity >= this.config.edge_similarity_threshold && 
            (!bestMatch || similarity > bestMatch.score)) {
          bestMatch = { edge: targetEdge, score: similarity };
        }
      }

      if (bestMatch) {
        matches.push({
          id: '',
          comparison_id: '',
          source_edge_id: sourceEdge.id,
          target_edge_id: bestMatch.edge.id,
          match_type: 'similar',
          source_from_node: sourceEdge.source,
          source_to_node: sourceEdge.target,
          target_from_node: bestMatch.edge.source,
          target_to_node: bestMatch.edge.target,
          confidence_score: bestMatch.score,
          property_changes: this.getEdgePropertyChanges(sourceEdge, bestMatch.edge),
          created_at: new Date()
        });
        
        matchedTargets.add(bestMatch.edge.id);
      } else {
        matches.push({
          id: '',
          comparison_id: '',
          source_edge_id: sourceEdge.id,
          target_edge_id: undefined,
          match_type: 'removed',
          source_from_node: sourceEdge.source,
          source_to_node: sourceEdge.target,
          target_from_node: undefined,
          target_to_node: undefined,
          confidence_score: 1.0,
          property_changes: {},
          created_at: new Date()
        });
      }
    }

    // Phase 3: Mark unmatched target edges as added
    for (const targetEdge of unmatchedTarget) {
      if (!matchedTargets.has(targetEdge.id)) {
        matches.push({
          id: '',
          comparison_id: '',
          source_edge_id: undefined,
          target_edge_id: targetEdge.id,
          match_type: 'added',
          source_from_node: undefined,
          source_to_node: undefined,
          target_from_node: targetEdge.source,
          target_to_node: targetEdge.target,
          confidence_score: 1.0,
          property_changes: {},
          created_at: new Date()
        });
      }
    }

    return matches;
  }

  /**
   * Calculate similarity between two nodes based on comparison type
   */
  private calculateNodeSimilarity(
    sourceNode: any,
    targetNode: any,
    comparisonType: string
  ): number {
    const weights = {
      structural: this.config.structural_weight,
      semantic: this.config.semantic_weight,
      visual: this.config.visual_weight
    };

    let score = 0;
    let totalWeight = 0;

    // Type similarity (always important)
    if (sourceNode.type === targetNode.type) {
      score += 0.4;
    }
    totalWeight += 0.4;

    // Property similarity
    const propSimilarity = this.calculatePropertySimilarity(
      sourceNode.data || {},
      targetNode.data || {}
    );
    score += propSimilarity * 0.4;
    totalWeight += 0.4;

    // Position similarity (for visual comparison)
    if (comparisonType === 'visual' && sourceNode.position && targetNode.position) {
      const positionSimilarity = this.calculatePositionSimilarity(
        sourceNode.position,
        targetNode.position
      );
      score += positionSimilarity * 0.2;
      totalWeight += 0.2;
    } else {
      totalWeight += 0.2;
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  /**
   * Calculate similarity between two edges
   */
  private calculateEdgeSimilarity(
    sourceEdge: any,
    targetEdge: any,
    nodeIdMap: Map<string, string>
  ): number {
    let score = 0;

    // Connection similarity (most important for edges)
    const sourceFrom = nodeIdMap.get(sourceEdge.source) || sourceEdge.source;
    const sourceTo = nodeIdMap.get(sourceEdge.target) || sourceEdge.target;
    
    if (sourceFrom === targetEdge.source && sourceTo === targetEdge.target) {
      score += 0.7;
    } else if (sourceFrom === targetEdge.target && sourceTo === targetEdge.source) {
      // Reversed connection
      score += 0.5;
    }

    // Property similarity
    const propSimilarity = this.calculatePropertySimilarity(
      sourceEdge.data || {},
      targetEdge.data || {}
    );
    score += propSimilarity * 0.3;

    return score;
  }

  /**
   * Calculate property similarity between two objects
   */
  private calculatePropertySimilarity(obj1: Record<string, any>, obj2: Record<string, any>): number {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = new Set([...keys1, ...keys2]);

    if (allKeys.size === 0) return 1; // Both empty

    let matches = 0;
    for (const key of allKeys) {
      if (key in obj1 && key in obj2) {
        if (this.deepEqual(obj1[key], obj2[key])) {
          matches++;
        } else {
          // Partial credit for different values of same key
          matches += 0.3;
        }
      }
      // No credit for missing keys
    }

    return matches / allKeys.size;
  }

  /**
   * Calculate position similarity for visual comparisons
   */
  private calculatePositionSimilarity(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
    const distance = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    const maxDistance = 1000; // Assume viewport is roughly 1000x1000
    return Math.max(0, 1 - (distance / maxDistance));
  }

  /**
   * Calculate overall graph similarity score
   */
  private calculateSimilarity(
    changes: ChangeSummary,
    sourceSnapshot: GraphComparisonSnapshot,
    targetSnapshot: GraphComparisonSnapshot
  ): number {
    const totalItems = Math.max(
      sourceSnapshot.node_count + sourceSnapshot.edge_count,
      targetSnapshot.node_count + targetSnapshot.edge_count,
      1
    );

    const unchangedItems = totalItems - changes.total_changes;
    return Math.max(0, unchangedItems / totalItems);
  }

  /**
   * Extract node properties for comparison
   */
  private extractNodeProperties(node: any): Record<string, any> {
    const { id, type, position, ...properties } = node;
    return { ...properties, ...(node.data || {}) };
  }

  /**
   * Get property changes between two nodes
   */
  private getNodePropertyChanges(sourceNode: any, targetNode: any): Record<string, any> {
    const changes: Record<string, any> = {};
    const sourceProps = this.extractNodeProperties(sourceNode);
    const targetProps = this.extractNodeProperties(targetNode);
    
    const allKeys = new Set([...Object.keys(sourceProps), ...Object.keys(targetProps)]);
    
    for (const key of allKeys) {
      if (!(key in sourceProps)) {
        changes[key] = { type: 'added', value: targetProps[key] };
      } else if (!(key in targetProps)) {
        changes[key] = { type: 'removed', value: sourceProps[key] };
      } else if (!this.deepEqual(sourceProps[key], targetProps[key])) {
        changes[key] = { 
          type: 'modified', 
          old_value: sourceProps[key], 
          new_value: targetProps[key] 
        };
      }
    }
    
    return changes;
  }

  /**
   * Get property changes between two edges
   */
  private getEdgePropertyChanges(sourceEdge: any, targetEdge: any): Record<string, any> {
    const changes: Record<string, any> = {};
    const sourceProps = sourceEdge.data || {};
    const targetProps = targetEdge.data || {};
    
    const allKeys = new Set([...Object.keys(sourceProps), ...Object.keys(targetProps)]);
    
    for (const key of allKeys) {
      if (!(key in sourceProps)) {
        changes[key] = { type: 'added', value: targetProps[key] };
      } else if (!(key in targetProps)) {
        changes[key] = { type: 'removed', value: sourceProps[key] };
      } else if (!this.deepEqual(sourceProps[key], targetProps[key])) {
        changes[key] = { 
          type: 'modified', 
          old_value: sourceProps[key], 
          new_value: targetProps[key] 
        };
      }
    }
    
    return changes;
  }

  /**
   * Check if node position has changed
   */
  private hasPositionChanged(sourceNode: any, targetNode: any): boolean {
    if (!sourceNode.position || !targetNode.position) return false;
    return sourceNode.position.x !== targetNode.position.x || 
           sourceNode.position.y !== targetNode.position.y;
  }

  /**
   * Get visual changes between nodes
   */
  private getVisualChanges(sourceNode: any, targetNode: any): Record<string, any> {
    const changes: Record<string, any> = {};
    
    if (this.hasPositionChanged(sourceNode, targetNode)) {
      changes.position = {
        old: sourceNode.position,
        new: targetNode.position
      };
    }
    
    // Add other visual properties as needed
    return changes;
  }

  /**
   * Calculate changes summary from matches
   */
  private calculateChanges(
    nodeMatches: NodeMatchResult[],
    edgeMatches: EdgeMatchResult[],
    sourceData: GraphData,
    targetData: GraphData
  ): ChangeSummary {
    const summary: ChangeSummary = {
      total_changes: 0,
      nodes_added: 0,
      nodes_removed: 0,
      nodes_modified: 0,
      edges_added: 0,
      edges_removed: 0,
      edges_modified: 0,
      properties_changed: 0
    };

    // Count node changes
    nodeMatches.forEach(match => {
      switch (match.match_type) {
        case 'added':
          summary.nodes_added++;
          break;
        case 'removed':
          summary.nodes_removed++;
          break;
        case 'modified':
        case 'similar':
          summary.nodes_modified++;
          summary.properties_changed += Object.keys(match.property_changes).length;
          break;
      }
    });

    // Count edge changes
    edgeMatches.forEach(match => {
      switch (match.match_type) {
        case 'added':
          summary.edges_added++;
          break;
        case 'removed':
          summary.edges_removed++;
          break;
        case 'modified':
        case 'similar':
          summary.edges_modified++;
          summary.properties_changed += Object.keys(match.property_changes).length;
          break;
      }
    });

    summary.total_changes = summary.nodes_added + summary.nodes_removed + summary.nodes_modified +
                          summary.edges_added + summary.edges_removed + summary.edges_modified;

    return summary;
  }

  /**
   * Calculate graph complexity score
   */
  private calculateComplexityScore(graphData: GraphData): number {
    const nodeCount = graphData.nodes.length;
    const edgeCount = graphData.edges.length;
    const avgDegree = nodeCount > 0 ? (edgeCount * 2) / nodeCount : 0;
    
    // Complexity factors
    const sizeComplexity = Math.log(nodeCount + 1);
    const connectivityComplexity = avgDegree;
    const typeComplexity = new Set(graphData.nodes.map(n => n.type)).size;
    
    return sizeComplexity + connectivityComplexity + typeComplexity;
  }

  /**
   * Build the complete comparison result
   */
  private buildComparisonResult(
    sourceData: GraphData,
    targetData: GraphData,
    nodeMatches: NodeMatchResult[],
    edgeMatches: EdgeMatchResult[],
    changes: ChangeSummary,
    similarity: number,
    comparisonType: string,
    algorithmSteps: string[],
    startTime: number
  ): DetailedComparison {
    const endTime = Date.now();
    
    // Separate changes by type
    const addedNodes = nodeMatches.filter(m => m.match_type === 'added').map(this.nodeMatchToChange);
    const removedNodes = nodeMatches.filter(m => m.match_type === 'removed').map(this.nodeMatchToChange);
    const modifiedNodes = nodeMatches.filter(m => m.match_type === 'modified' || m.match_type === 'similar').map(this.nodeMatchToChange);
    
    const addedEdges = edgeMatches.filter(m => m.match_type === 'added').map(this.edgeMatchToChange);
    const removedEdges = edgeMatches.filter(m => m.match_type === 'removed').map(this.edgeMatchToChange);
    const modifiedEdges = edgeMatches.filter(m => m.match_type === 'modified' || m.match_type === 'similar').map(this.edgeMatchToChange);

    return {
      id: '',
      source_version_id: '',
      target_version_id: '',
      comparison_type: comparisonType as any,
      similarity_score: similarity,
      changes_summary: changes,
      added_nodes: addedNodes,
      removed_nodes: removedNodes,
      modified_nodes: modifiedNodes,
      added_edges: addedEdges,
      removed_edges: removedEdges,
      modified_edges: modifiedEdges,
      node_diffs: {},
      edge_diffs: {},
      property_diffs: {},
      comparison_duration_ms: endTime - startTime,
      created_by: undefined,
      created_at: new Date(),
      
      // Additional fields for DetailedComparison
      source_data: sourceData,
      target_data: targetData,
      node_matches: nodeMatches,
      edge_matches: edgeMatches,
      algorithm_metadata: {
        steps_executed: algorithmSteps,
        performance_metrics: {
          total_duration_ms: endTime - startTime,
          node_match_count: nodeMatches.length,
          edge_match_count: edgeMatches.length,
          similarity_score: similarity
        },
        confidence_distribution: this.calculateConfidenceDistribution(nodeMatches, edgeMatches)
      }
    };
  }

  /**
   * Convert node match to node change format
   */
  private nodeMatchToChange(match: NodeMatchResult): NodeChange {
    return {
      id: match.target_node_id || match.source_node_id || '',
      type: '',
      change_type: match.match_type,
      property_changes: [],
      position_changed: match.position_changed,
      visual_changes: match.visual_changes
    };
  }

  /**
   * Convert edge match to edge change format
   */
  private edgeMatchToChange(match: EdgeMatchResult): EdgeChange {
    return {
      id: match.target_edge_id || match.source_edge_id || '',
      source: match.target_from_node || match.source_from_node || '',
      target: match.target_to_node || match.source_to_node || '',
      change_type: match.match_type,
      property_changes: [],
      connection_changed: false
    };
  }

  /**
   * Create comparison result for identical graphs
   */
  private createIdenticalComparison(
    sourceData: GraphData,
    targetData: GraphData,
    algorithmSteps: string[],
    startTime: number
  ): DetailedComparison {
    const endTime = Date.now();
    const nodeMatches: NodeMatchResult[] = sourceData.nodes.map(node => ({
      id: '',
      comparison_id: '',
      source_node_id: node.id,
      target_node_id: node.id,
      match_type: 'exact',
      confidence_score: 1.0,
      match_criteria: { method: 'hash_match' },
      property_changes: {},
      position_changed: false,
      visual_changes: {},
      created_at: new Date()
    }));

    const edgeMatches: EdgeMatchResult[] = sourceData.edges.map(edge => ({
      id: '',
      comparison_id: '',
      source_edge_id: edge.id,
      target_edge_id: edge.id,
      match_type: 'exact',
      source_from_node: edge.source,
      source_to_node: edge.target,
      target_from_node: edge.source,
      target_to_node: edge.target,
      confidence_score: 1.0,
      property_changes: {},
      created_at: new Date()
    }));

    const changes: ChangeSummary = {
      total_changes: 0,
      nodes_added: 0,
      nodes_removed: 0,
      nodes_modified: 0,
      edges_added: 0,
      edges_removed: 0,
      edges_modified: 0,
      properties_changed: 0
    };

    return this.buildComparisonResult(
      sourceData,
      targetData,
      nodeMatches,
      edgeMatches,
      changes,
      1.0,
      'structural',
      algorithmSteps,
      startTime
    );
  }

  /**
   * Calculate confidence distribution for algorithm metadata
   */
  private calculateConfidenceDistribution(
    nodeMatches: NodeMatchResult[],
    edgeMatches: EdgeMatchResult[]
  ): Record<string, number> {
    const allMatches = [...nodeMatches, ...edgeMatches];
    const distribution: Record<string, number> = {
      high: 0, // > 0.8
      medium: 0, // 0.5 - 0.8
      low: 0 // < 0.5
    };

    allMatches.forEach(match => {
      if (match.confidence_score > 0.8) {
        distribution.high++;
      } else if (match.confidence_score >= 0.5) {
        distribution.medium++;
      } else {
        distribution.low++;
      }
    });

    return distribution;
  }

  /**
   * Utility functions
   */
  private calculateHash(input: string): string {
    // Simple hash function - in production, use crypto.createHash
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  private deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) return false;
      
      for (const key of keys1) {
        if (!keys2.includes(key) || !this.deepEqual(obj1[key], obj2[key])) {
          return false;
        }
      }
      return true;
    }
    
    return false;
  }
}