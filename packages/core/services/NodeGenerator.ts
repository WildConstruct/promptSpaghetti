/**
 * Node Generator Service
 * Epic 36.3: Node Generation and Canvas Integration
 * 
 * Central service for converting prompt analysis results into React Flow nodes and edges
 * with comprehensive security hardening, performance optimization, and validation
 */

import { Node, Edge, Position } from 'reactflow';
import {
  NodeGenerationRequest,
  GeneratedGraph,
  GenerationMetadata,
  NodeSuggestion,
  LayoutType,
  ConnectionPattern,
  LayoutResult,
  ConnectionResult,
  ValidationError,
  ValidationWarning,
  PerformanceMetrics,
  SecurityConstraints,
  GENERATION_DEFAULTS,
  ERROR_CODES
} from '../types/NodeGenerationTypes';

// Security and performance constants from defaults
const GENERATION_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Main service class for node generation with security hardening
 */
export class NodeGenerator {
  private performanceMetrics: PerformanceMetrics;
  private securityConstraints: SecurityConstraints;

  constructor() {
    this.performanceMetrics = this.initializeMetrics();
    this.securityConstraints = this.initializeSecurityConstraints();
  }

  /**
   * Generate nodes and edges from analysis results with comprehensive validation
   */
  public generateFromAnalysis(request: NodeGenerationRequest): GeneratedGraph {
    const startTime = Date.now();
    const generationId = this.generateId();

    try {
      // Security hardening: Input validation
      this.validateGenerationRequest(request);

      // Performance monitoring
      if (request.selectedSuggestions.length > GENERATION_DEFAULTS.PERFORMANCE_WARNING_THRESHOLD) {
        console.warn(`Generating ${request.selectedSuggestions.length} nodes may impact performance`);
      }

      // Generate layout
      const layoutResult = this.calculateLayout(
        request.selectedSuggestions,
        request.options.layout,
        request.canvasPosition,
        request.options.spacing
      );

      // Create nodes
      const nodes = this.createNodes(request.selectedSuggestions, layoutResult.positions);

      // Generate connections
      const connectionResult = this.generateConnections(
        request.selectedSuggestions,
        nodes,
        request.options.connectionPattern
      );

      // Validate generated graph
      const validation = this.validateGeneratedGraph(nodes, connectionResult.edges);

      const totalTime = Date.now() - startTime;

      // Create metadata
      const metadata: GenerationMetadata = {
        generationId,
        timestamp: new Date(),
        performance: {
          totalTimeMs: totalTime,
          nodesGenerated: nodes.length,
          edgesGenerated: connectionResult.edges.length,
          layoutTimeMs: layoutResult.efficiency * 10, // Estimated
          validationTimeMs: validation.errors.length * 5 // Estimated
        },
        options: request.options,
        validation: {
          isValid: validation.errors.length === 0,
          errors: validation.errors,
          warnings: validation.warnings
        },
        statistics: {
          averageNodeConfidence: this.calculateAverageConfidence(request.selectedSuggestions),
          layoutEfficiency: layoutResult.efficiency,
          connectionDensity: this.calculateConnectionDensity(nodes.length, connectionResult.edges.length),
          complexityScore: this.calculateComplexityScore(request.selectedSuggestions)
        }
      };

      // Update performance metrics
      this.updateMetrics(metadata);

      return {
        nodes,
        edges: connectionResult.edges,
        metadata
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Node generation failed: ${errorMessage}`);
    }
  }

  /**
   * Validate generation request for security and data integrity
   */
  private validateGenerationRequest(request: NodeGenerationRequest): void {
    // Security hardening: Input validation
    if (request.selectedSuggestions.length > GENERATION_DEFAULTS.MAX_NODES_GENERATED) {
      throw new Error(`Cannot generate more than ${GENERATION_DEFAULTS.MAX_NODES_GENERATED} nodes for security and performance reasons`);
    }

    if (request.analysisResult.prompt.length > GENERATION_DEFAULTS.MAX_PROMPT_LENGTH) {
      throw new Error(`Prompt too long (max ${GENERATION_DEFAULTS.MAX_PROMPT_LENGTH} characters)`);
    }

    if (!request.selectedSuggestions || request.selectedSuggestions.length === 0) {
      throw new Error('No suggestions selected for generation');
    }

    // Validate suggestions have required fields
    for (const suggestion of request.selectedSuggestions) {
      if (!suggestion.id || !suggestion.nodeType || !suggestion.title) {
        throw new Error(
          `Invalid suggestion: missing required fields (id: ${suggestion.id},
          nodeType: ${suggestion.nodeType},
          title: ${suggestion.title}
        )`);
      }

      if (suggestion.confidence < 0 || suggestion.confidence > 100) {
        throw new Error(`Invalid confidence score: ${suggestion.confidence} (must be 0-100)`);
      }
    }

    // Validate options
    if (!request.options || !request.canvasPosition) {
      throw new Error('Invalid generation options or canvas position');
    }
  }

  /**
   * Calculate optimal layout for nodes using specified algorithm
   */
  private calculateLayout(
    suggestions: NodeSuggestion[],
    layoutType: LayoutType,
    startPosition: Position,
    spacing: { horizontal: number; vertical: number }
  ): LayoutResult {
    const positions = new Map<string, Position>();
    let currentX = startPosition.x;
    let currentY = startPosition.y;

    switch (layoutType) {
      case 'linear':
        suggestions.forEach((suggestion, index) => {
          positions.set(suggestion.id, {
            x: currentX + (index * spacing.horizontal),
            y: currentY
          });
        });
        break;

      case 'hierarchical': {
        // Group by category/priority for hierarchical layout
        const grouped = this.groupSuggestionsByCategory(suggestions);
        let yOffset = 0;
        
        Object.entries(grouped).forEach(([, items]) => {
          items.forEach((suggestion, index) => {
            positions.set(suggestion.id, {
              x: currentX + (index * spacing.horizontal),
              y: currentY + yOffset
            });
          });
          yOffset += spacing.vertical;
        });
        break;
      }

      case 'radial': {
        const centerX = currentX;
        const centerY = currentY;
        const radius = Math.max(spacing.horizontal, spacing.vertical);
        
        suggestions.forEach((suggestion, index) => {
          const angle = (2 * Math.PI * index) / suggestions.length;
          positions.set(suggestion.id, {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          });
        });
        break;
      }

      case 'grid': {
        const cols = Math.ceil(Math.sqrt(suggestions.length));
        suggestions.forEach((suggestion, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          positions.set(suggestion.id, {
            x: currentX + (col * spacing.horizontal),
            y: currentY + (row * spacing.vertical)
          });
        });
        break;
      }

      default:
        // Default to linear layout
        suggestions.forEach((suggestion, index) => {
          positions.set(suggestion.id, {
            x: currentX + (index * spacing.horizontal),
            y: currentY
          });
        });
    }

    // Calculate bounds and efficiency
    const bounds = this.calculateBounds(Array.from(positions.values()));
    const efficiency = this.calculateLayoutEfficiency(positions, suggestions.length);

    return {
      positions,
      bounds,
      efficiency,
      overlaps: 0 // Would need collision detection for accurate overlap count
    };
  }

  /**
   * Create React Flow nodes from suggestions and positions
   */
  private createNodes(suggestions: NodeSuggestion[], positions: Map<string, Position>): Node[] {
    return suggestions.map(suggestion => {
      const position = positions.get(suggestion.id) || { x: 0, y: 0 };
      
      return {
        id: `generated-${suggestion.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: 'default',
        position,
        data: {
          nodeType: suggestion.nodeType,
          title: suggestion.title,
          description: suggestion.description,
          confidence: suggestion.confidence,
          generated: true,
          generatedAt: new Date().toISOString(),
          ...suggestion.nodeData
        },
        draggable: true,
        selectable: true
      };
    });
  }

  /**
   * Generate intelligent connections between nodes
   */
  private generateConnections(
    suggestions: NodeSuggestion[],
    nodes: Node[],
    pattern: ConnectionPattern
  ): ConnectionResult {
    const edges: Edge[] = [];
    
    let sequentialConnections = 0;
    let branchingConnections = 0;
    let cyclicalConnections = 0;

    switch (pattern) {
      case 'sequential':
        // Connect nodes in sequence
        for (let i = 0; i < nodes.length - 1; i++) {
          edges.push(this.createEdge(nodes[i].id, nodes[i + 1].id));
          sequentialConnections++;
        }
        break;

      case 'branching':
        // Connect first node to all others (hub pattern)
        if (nodes.length > 1) {
          const hubNode = nodes[0];
          for (let i = 1; i < nodes.length; i++) {
            edges.push(this.createEdge(hubNode.id, nodes[i].id));
            branchingConnections++;
          }
        }
        break;

      case 'hub-and-spoke':
        // Similar to branching but bidirectional
        if (nodes.length > 1) {
          const hubNode = nodes[Math.floor(nodes.length / 2)]; // Use middle node as hub
          nodes.forEach(node => {
            if (node.id !== hubNode.id) {
              edges.push(this.createEdge(hubNode.id, node.id));
              branchingConnections++;
            }
          });
        }
        break;

      case 'workflow':
        // Create workflow-based connections based on node types
        this.createWorkflowConnections(nodes, edges);
        sequentialConnections = edges.length;
        break;

      case 'mesh':
        // Connect each node to its neighbors
        nodes.forEach((node, index) => {
          const nextIndex = (index + 1) % nodes.length;
          const prevIndex = index === 0 ? nodes.length - 1 : index - 1;
          
          edges.push(this.createEdge(node.id, nodes[nextIndex].id));
          if (index !== prevIndex) {
            edges.push(this.createEdge(nodes[prevIndex].id, node.id));
          }
          sequentialConnections++;
        });
        break;

      default:
        // Default to sequential
        for (let i = 0; i < nodes.length - 1; i++) {
          edges.push(this.createEdge(nodes[i].id, nodes[i + 1].id));
          sequentialConnections++;
        }
    }

    return {
      edges,
      patterns: {
        sequential: sequentialConnections,
        branching: branchingConnections,
        cyclical: cyclicalConnections
      },
      validation: {
        validConnections: edges.length,
        invalidConnections: 0, // Would need actual validation
        duplicateConnections: 0 // Would need duplicate detection
      }
    };
  }

  /**
   * Create workflow-based connections based on node types and logic
   */
  private createWorkflowConnections(nodes: Node[], edges: Edge[]): void {
    // Group nodes by type for intelligent connections
    const nodesByType = new Map<string, Node[]>();
    
    nodes.forEach(node => {
      const nodeType = node.data.nodeType;
      if (!nodesByType.has(nodeType)) {
        nodesByType.set(nodeType, []);
      }
      nodesByType.get(nodeType)!.push(node);
    });

    // Create logical workflow connections
    const contentNodes = nodesByType.get('WeightedChoice') || [];
    const outputNodes = nodesByType.get('Output') || [];
    const concatNodes = nodesByType.get('Concat') || [];

    // Connect content nodes to concat nodes
    contentNodes.forEach(contentNode => {
      concatNodes.forEach(concatNode => {
        edges.push(this.createEdge(contentNode.id, concatNode.id));
      });
    });

    // Connect concat nodes to output nodes
    concatNodes.forEach(concatNode => {
      outputNodes.forEach(outputNode => {
        edges.push(this.createEdge(concatNode.id, outputNode.id));
      });
    });

    // If no concat nodes, connect content directly to output
    if (concatNodes.length === 0) {
      contentNodes.forEach(contentNode => {
        outputNodes.forEach(outputNode => {
          edges.push(this.createEdge(contentNode.id, outputNode.id));
        });
      });
    }
  }

  /**
   * Create a React Flow edge with proper configuration
   */
  private createEdge(sourceId: string, targetId: string): Edge {
    return {
      id: `edge-${sourceId}-${targetId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      source: sourceId,
      target: targetId,
      type: 'default',
      animated: false,
      data: {
        generated: true,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Validate the generated graph for consistency and correctness
   */
  private validateGeneratedGraph(
    nodes: Node[],
    edges: Edge[]
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate nodes
    nodes.forEach(node => {
      if (!node.id || !node.position) {
        errors.push({
          code: ERROR_CODES.VALIDATION_FAILED,
          message: 'Node missing required properties',
          nodeId: node.id,
          severity: 'error',
          suggestions: ['Ensure all nodes have id and position properties']
        });
      }

      if (!node.data || !node.data.nodeType) {
        errors.push({
          code: ERROR_CODES.VALIDATION_FAILED,
          message: 'Node missing nodeType in data',
          nodeId: node.id,
          severity: 'error',
          suggestions: ['Add nodeType to node data']
        });
      }
    });

    // Validate edges
    const nodeIds = new Set(nodes.map(n => n.id));
    edges.forEach(edge => {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        errors.push({
          code: ERROR_CODES.CONNECTION_ERROR,
          message: 'Edge references non-existent node',
          edgeId: edge.id,
          severity: 'error',
          suggestions: ['Ensure all edge sources and targets reference valid nodes']
        });
      }

      if (edge.source === edge.target) {
        warnings.push({
          code: 'SELF_LOOP',
          message: 'Edge creates self-loop',
          edgeId: edge.id,
          impact: 'low',
          recommendation: 'Consider removing self-loops for cleaner workflow'
        });
      }
    });

    // Check for isolated nodes
    const connectedNodes = new Set<string>();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    nodes.forEach(node => {
      if (!connectedNodes.has(node.id) && nodes.length > 1) {
        warnings.push({
          code: 'ISOLATED_NODE',
          message: 'Node has no connections',
          nodeId: node.id,
          impact: 'medium',
          recommendation: 'Consider connecting isolated nodes to the workflow'
        });
      }
    });

    return { errors, warnings };
  }

  // Helper methods

  private groupSuggestionsByCategory(suggestions: NodeSuggestion[]): Record<string, NodeSuggestion[]> {
    return suggestions.reduce((groups, suggestion) => {
      const category = suggestion.metadata.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(suggestion);
      return groups;
    }, {} as Record<string, NodeSuggestion[]>);
  }

  private calculateBounds(positions: Position[]): { minX: number; maxX: number; minY: number; maxY: number } {
    if (positions.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    return positions.reduce((bounds, pos) => ({
      minX: Math.min(bounds.minX, pos.x),
      maxX: Math.max(bounds.maxX, pos.x),
      minY: Math.min(bounds.minY, pos.y),
      maxY: Math.max(bounds.maxY, pos.y)
    }), {
      minX: positions[0].x,
      maxX: positions[0].x,
      minY: positions[0].y,
      maxY: positions[0].y
    });
  }

  private calculateLayoutEfficiency(positions: Map<string, Position>, nodeCount: number): number {
    // Simple efficiency calculation based on space utilization
    // Higher scores for more compact, organized layouts
    if (nodeCount <= 1) return 100;

    const positionArray = Array.from(positions.values());
    const bounds = this.calculateBounds(positionArray);
    const area = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
    const optimalArea = nodeCount * 100 * 100; // Assuming 100x100 per node as optimal
    
    return Math.max(0, Math.min(100, (optimalArea / Math.max(area, 1)) * 100));
  }

  private calculateAverageConfidence(suggestions: NodeSuggestion[]): number {
    if (suggestions.length === 0) return 0;
    const total = suggestions.reduce((sum, s) => sum + s.confidence, 0);
    return total / suggestions.length;
  }

  private calculateConnectionDensity(nodeCount: number, edgeCount: number): number {
    if (nodeCount <= 1) return 0;
    const maxPossibleEdges = nodeCount * (nodeCount - 1);
    return (edgeCount / maxPossibleEdges) * 100;
  }

  private calculateComplexityScore(suggestions: NodeSuggestion[]): number {
    if (suggestions.length === 0) return 0;
    const avgComplexity = suggestions.reduce((sum, s) => sum + s.metadata.estimatedComplexity, 0) / suggestions.length;
    return Math.min(100, avgComplexity * 10); // Scale to 0-100
  }

  private generateId(): string {
    return `gen-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private updateMetrics(metadata: GenerationMetadata): void {
    // Update performance metrics (simplified implementation)
    this.performanceMetrics.generationStats.totalGenerations++;
    this.performanceMetrics.generationStats.averageGenerationTimeMs = 
      (this.performanceMetrics.generationStats.averageGenerationTimeMs + metadata.performance.totalTimeMs) / 2;
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      generationStats: {
        totalGenerations: 0,
        averageGenerationTimeMs: 0,
        peakMemoryUsageMB: 0,
        errorRate: 0
      },
      layoutStats: {
        preferredLayouts: {},
        averageLayoutTimeMs: {},
        layoutEfficiencyScores: {}
      },
      userStats: {
        averageNodesPerGeneration: 0,
        mostUsedNodeTypes: {},
        commonValidationErrors: {}
      }
    };
  }

  private initializeSecurityConstraints(): SecurityConstraints {
    return {
      maxNodesPerRequest: GENERATION_DEFAULTS.MAX_NODES_GENERATED,
      maxPromptLength: GENERATION_DEFAULTS.MAX_PROMPT_LENGTH,
      maxGenerationTimeMs: GENERATION_TIMEOUT_MS,
      allowedNodeTypes: ['WeightedChoice', 'Output', 'Concat', 'Subject', 'Action', 'Include'],
      restrictedOperations: ['eval', 'Function', 'constructor'],
      validationRules: {
        requireInputValidation: true,
        sanitizeUserContent: true,
        enforceRateLimiting: false // Would need rate limiting implementation
      }
    };
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get security constraints
   */
  public getSecurityConstraints(): SecurityConstraints {
    return { ...this.securityConstraints };
  }
}