/**
 * Auto-routing engine with collision detection
 * Story 1.28: Advanced Edge Routing
 * Integrated with Story 0.1: Performance Infrastructure
 */

import { Edge, Node, XYPosition } from 'reactflow';
import {
  AutoRoutingConfig,
  EdgeRoutingAlgorithm,
  EdgeRoutingConfig
} from '../../types/edgeRouting';
import { getEdgeRoutingManager } from './edgeRouting';
import { getPerformanceInfrastructure } from '../performance';

interface EdgeData {
  calculatedPath?: {
    bends?: number;
    length?: number;
  };
}

interface RouteOptimizationResult {
  edges: Edge[];
  totalCrossings: number;
  totalBends: number;
  totalLength: number;
  optimizationTime: number;
}

/**
 * Auto-routing engine for automatic edge path optimization
 */
export class AutoRouter {
  private config: AutoRoutingConfig;
  private isRunning = false;
  private routingInterval?: NodeJS.Timeout;
  private lastOptimizationTime = 0;

  constructor(config: AutoRoutingConfig) {
    this.config = config;
  }

  /**
   * Start auto-routing
   */
  start(edges: Edge[], nodes: Node[]): void {
    if (this.isRunning) {return;}

    this.isRunning = true;
    const interval = this.config.updateInterval || 1000;

    // Initial routing
    this.optimizeRoutes(edges, nodes);

    // Set up periodic optimization
    this.routingInterval = setInterval(() => {
      if (this.isRunning) {
        this.optimizeRoutes(edges, nodes);
      }
    }, interval);
  }

  /**
   * Stop auto-routing
   */
  stop(): void {
    this.isRunning = false;
    if (this.routingInterval) {
      clearInterval(this.routingInterval);
      this.routingInterval = undefined;
    }
  }

  /**
   * Optimize routes for all edges
   */
  async optimizeRoutes(
    edges: Edge[],
    nodes: Node[]
  ): Promise<RouteOptimizationResult> {
    const startTime = performance.now();
    const { perfMonitor, workerPool } = getPerformanceInfrastructure();

    perfMonitor?.mark('autoroute:optimize:start');

    // Analyze current layout
    const analysis = await this.analyzeLayout(edges, nodes);

    // Determine which edges need optimization
    const edgesToOptimize = this.selectEdgesForOptimization(edges, analysis);

    // Use worker for large graphs
    if (workerPool && edges.length > 20) {
      return this.optimizeInWorker(edgesToOptimize, nodes);
    }

    // Optimize each edge
    const optimizedEdges = await this.optimizeEdgePaths(
      edgesToOptimize,
      nodes,
      analysis
    );

    // Calculate metrics
    const metrics = this.calculateMetrics(optimizedEdges, nodes);

    const optimizationTime = performance.now() - startTime;
    this.lastOptimizationTime = optimizationTime;

    perfMonitor?.measureMarks(
      'autoroute:optimize:start',
      'autoroute:optimize:end'
    );
    perfMonitor?.record('autoroute:edges:optimized', edgesToOptimize.length);
    perfMonitor?.record('autoroute:time', optimizationTime);

    return {
      edges: optimizedEdges,
      ...metrics,
      optimizationTime
    };
  }

  /**
   * Analyze layout for optimization opportunities
   */
  private async analyzeLayout(
    edges: Edge[],
    nodes: Node[]
  ): Promise<LayoutAnalysis> {
    const crossings = this.detectCrossings(edges, nodes);
    const congestion = this.detectCongestion(edges, nodes);
    const nodeProximity = this.analyzeNodeProximity(nodes);

    return {
      crossings,
      congestion,
      nodeProximity,
      edgeDensity: edges.length / nodes.length
    };
  }

  /**
   * Select edges that need optimization
   */
  private selectEdgesForOptimization(
    edges: Edge[],
    analysis: LayoutAnalysis
  ): Edge[] {
    const needsOptimization: Edge[] = [];

    edges.forEach(edge => {
      // Check if edge has crossings
      const hasCrossings = analysis.crossings.some(
        c => c.edge1 === edge.id || c.edge2 === edge.id
      );

      // Check if edge is in congested area
      const inCongestedArea = analysis.congestion.some(() =>
        this.isEdgeInArea()
      );

      if (hasCrossings || inCongestedArea) {
        needsOptimization.push(edge);
      }
    });

    return needsOptimization;
  }

  /**
   * Optimize paths for selected edges
   */
  private async optimizeEdgePaths(
    edges: Edge[],
    nodes: Node[],
    analysis: LayoutAnalysis
  ): Promise<Edge[]> {
    const manager = getEdgeRoutingManager();
    const optimizedEdges: Edge[] = [];

    for (const edge of edges) {
      // Determine best algorithm based on layout
      const algorithm = this.selectBestAlgorithm(edge, nodes, analysis);

      // Create routing configuration
      const config: EdgeRoutingConfig = {
        algorithm,
        controlPoints: [],
        style: {},
        constraints: {
          avoidNodes: this.config.collisionDetection,
          avoidEdges: this.config.optimization.minimizeCrossings,
          minDistance: this.config.optimization.distributionSpacing || 20,
          maxBends: this.config.optimization.minimizeBends ? 3 : undefined
        },
        performance: {
          useCaching: true,
          useWorkers: true,
          maxCalculationTime: 100
        }
      };

      // Set routing configuration
      manager.setRoutingConfig(edge.id, config);

      // Calculate optimized path
      const result = await manager.calculatePath(edge, nodes);

      // Apply result to edge
      const optimizedEdge = {
        ...edge,
        data: {
          ...edge.data,
          routing: config,
          calculatedPath: result
        }
      };

      optimizedEdges.push(optimizedEdge);
    }

    return optimizedEdges;
  }

  /**
   * Select best routing algorithm based on layout analysis
   */
  private selectBestAlgorithm(
    edge: Edge,
    nodes: Node[],
    analysis: LayoutAnalysis
  ): EdgeRoutingAlgorithm {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      return 'straight';
    }

    const dx = Math.abs(targetNode.position.x - sourceNode.position.x);
    const dy = Math.abs(targetNode.position.y - sourceNode.position.y);

    // Check for obstacles between nodes
    const hasObstacles = this.hasObstaclesBetween(
      sourceNode,
      targetNode,
      nodes
    );

    // Decision logic
    if (hasObstacles) {
      // Use orthogonal for obstacle avoidance
      return 'orthogonal';
    } else if (analysis.congestion.length > 5) {
      // Use step routing in congested layouts
      return 'step';
    } else if (dx > dy * 2 || dy > dx * 2) {
      // Use bezier for predominantly horizontal/vertical connections
      return 'bezier';
    } else {
      // Use smart routing for complex cases
      return 'smart';
    }
  }

  /**
   * Detect edge crossings
   */
  private detectCrossings(edges: Edge[], nodes: Node[]): EdgeCrossing[] {
    const crossings: EdgeCrossing[] = [];

    // Simple O(n²) crossing detection
    // In production, use more efficient algorithms
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        if (this.edgesIntersect(edges[i], edges[j], nodes)) {
          crossings.push({
            edge1: edges[i].id,
            edge2: edges[j].id,
            point: { x: 0, y: 0 } // Simplified
          });
        }
      }
    }

    return crossings;
  }

  /**
   * Detect congested areas
   */
  private detectCongestion(edges: Edge[], nodes: Node[]): CongestionArea[] {
    const areas: CongestionArea[] = [];
    const gridSize = 100;
    const grid: Map<string, number> = new Map();

    // Count edges in each grid cell
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        // Sample points along the edge
        const samples = 10;
        for (let i = 0; i <= samples; i++) {
          const t = i / samples;
          const x =
            sourceNode.position.x +
            (targetNode.position.x - sourceNode.position.x) * t;
          const y =
            sourceNode.position.y +
            (targetNode.position.y - sourceNode.position.y) * t;

          const gridX = Math.floor(x / gridSize);
          const gridY = Math.floor(y / gridSize);
          const key = `${gridX},${gridY}`;

          grid.set(key, (grid.get(key) || 0) + 1);
        }
      }
    });

    // Find congested cells
    grid.forEach((count, key) => {
      if (count > 5) {
        // Threshold for congestion
        const [gridX, gridY] = key.split(',').map(Number);
        areas.push({
          x: gridX * gridSize,
          y: gridY * gridSize,
          width: gridSize,
          height: gridSize,
          density: count
        });
      }
    });

    return areas;
  }

  /**
   * Analyze node proximity
   */
  private analyzeNodeProximity(nodes: Node[]): Map<string, number> {
    const proximity = new Map<string, number>();

    nodes.forEach(node1 => {
      let minDistance = Infinity;

      nodes.forEach(node2 => {
        if (node1.id !== node2.id) {
          const distance = Math.sqrt(
            Math.pow(node2.position.x - node1.position.x, 2) +
              Math.pow(node2.position.y - node1.position.y, 2)
          );
          minDistance = Math.min(minDistance, distance);
        }
      });

      proximity.set(node1.id, minDistance);
    });

    return proximity;
  }

  /**
   * Check if two edges intersect
   */
  private edgesIntersect(edge1: Edge, edge2: Edge, nodes: Node[]): boolean {
    // Simplified intersection check
    // In production, use proper line intersection algorithms
    const e1Source = nodes.find(n => n.id === edge1.source);
    const e1Target = nodes.find(n => n.id === edge1.target);
    const e2Source = nodes.find(n => n.id === edge2.source);
    const e2Target = nodes.find(n => n.id === edge2.target);

    if (!e1Source || !e1Target || !e2Source || !e2Target) {
      return false;
    }

    // Skip if edges share a node
    if (
      edge1.source === edge2.source ||
      edge1.source === edge2.target ||
      edge1.target === edge2.source ||
      edge1.target === edge2.target
    ) {
      return false;
    }

    // Simple bounding box check
    const e1MinX = Math.min(e1Source.position.x, e1Target.position.x);
    const e1MaxX = Math.max(e1Source.position.x, e1Target.position.x);
    const e1MinY = Math.min(e1Source.position.y, e1Target.position.y);
    const e1MaxY = Math.max(e1Source.position.y, e1Target.position.y);

    const e2MinX = Math.min(e2Source.position.x, e2Target.position.x);
    const e2MaxX = Math.max(e2Source.position.x, e2Target.position.x);
    const e2MinY = Math.min(e2Source.position.y, e2Target.position.y);
    const e2MaxY = Math.max(e2Source.position.y, e2Target.position.y);

    return !(
      e1MaxX < e2MinX ||
      e2MaxX < e1MinX ||
      e1MaxY < e2MinY ||
      e2MaxY < e1MinY
    );
  }

  /**
   * Check if edge is in area
   */
  private isEdgeInArea(): boolean {
    // Simplified check - would need actual edge path in production
    return false;
  }

  /**
   * Check for obstacles between two nodes
   */
  private hasObstaclesBetween(
    node1: Node,
    node2: Node,
    allNodes: Node[]
  ): boolean {
    const margin = 20;

    // Check if any other node is between these two
    return allNodes.some(node => {
      if (node.id === node1.id || node.id === node2.id) {
        return false;
      }

      // Simple rectangle intersection check
      const nodeLeft = node.position.x - margin;
      const nodeRight = node.position.x + (node.width || 100) + margin;
      const nodeTop = node.position.y - margin;
      const nodeBottom = node.position.y + (node.height || 50) + margin;

      const lineLeft = Math.min(node1.position.x, node2.position.x);
      const lineRight = Math.max(node1.position.x, node2.position.x);
      const lineTop = Math.min(node1.position.y, node2.position.y);
      const lineBottom = Math.max(node1.position.y, node2.position.y);

      return !(
        nodeRight < lineLeft ||
        nodeLeft > lineRight ||
        nodeBottom < lineTop ||
        nodeTop > lineBottom
      );
    });
  }

  /**
   * Calculate optimization metrics
   */
  private calculateMetrics(
    edges: Edge[],
    nodes: Node[]
  ): {
    totalCrossings: number;
    totalBends: number;
    totalLength: number;
  } {
    const crossings = this.detectCrossings(edges, nodes);

    let totalBends = 0;
    let totalLength = 0;

    edges.forEach(edge => {
      const edgeData = edge.data as EdgeData;
      if (edgeData?.calculatedPath) {
        totalBends += edgeData.calculatedPath.bends || 0;
        totalLength += edgeData.calculatedPath.length || 0;
      }
    });

    return {
      totalCrossings: crossings.length,
      totalBends,
      totalLength
    };
  }

  /**
   * Optimize routes using worker
   */
  private async optimizeInWorker(
    edges: Edge[],
    nodes: Node[]
  ): Promise<RouteOptimizationResult> {
    const { workerPool } = getPerformanceInfrastructure();

    if (!workerPool) {
      // Fallback to inline optimization
      return this.optimizeRoutes(edges, nodes);
    }

    const result = await workerPool.execute({
      type: 'OPTIMIZE_ROUTES',
      data: { edges, nodes, config: this.config }
    });

    return result as RouteOptimizationResult;
  }
}

// Type definitions for internal use
interface LayoutAnalysis {
  crossings: EdgeCrossing[];
  congestion: CongestionArea[];
  nodeProximity: Map<string, number>;
  edgeDensity: number;
}

interface EdgeCrossing {
  edge1: string;
  edge2: string;
  point: XYPosition;
}

interface CongestionArea {
  x: number;
  y: number;
  width: number;
  height: number;
  density: number;
}

/**
 * Create and configure auto-router
 */
export function createAutoRouter(
  config?: Partial<AutoRoutingConfig>
): AutoRouter {
  const defaultConfig: AutoRoutingConfig = {
    enabled: true,
    algorithm: 'smart',
    updateInterval: 1000,
    collisionDetection: true,
    optimization: {
      minimizeCrossings: true,
      minimizeBends: true,
      minimizeLength: false,
      distributionSpacing: 20
    }
  };

  return new AutoRouter({
    ...defaultConfig,
    ...config
  });
}
