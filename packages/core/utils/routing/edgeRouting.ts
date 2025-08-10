/**
 * Edge routing utilities with performance optimization
 * Story 1.28: Advanced Edge Routing
 * Integrated with Story 0.1: Performance Infrastructure
 */

import { Edge, Node, XYPosition } from 'reactflow';
import {
  IEdgeRoutingManager,
  EdgeRoutingConfig,
  PathCalculationResult,
  ControlPoint,
  AutoRoutingConfig,
  EdgeRoutingAlgorithm,
  RoutedEdge,
  EdgeRoutingWorkerTask,
  EdgeRoutingWorkerResult
} from '../../types/edgeRouting';
import { RoutingAlgorithmFactory } from './algorithms';
import { getPerformanceInfrastructure } from '../performance';

/**
 * Edge routing manager with caching and worker support
 */
export class EdgeRoutingManager implements IEdgeRoutingManager {
  private routingConfigs: Map<string, EdgeRoutingConfig> = new Map();
  private pathCache: Map<string, PathCalculationResult> = new Map();
  private autoRoutingConfig?: AutoRoutingConfig;
  private routingQueue: Set<string> = new Set();
  private cacheVersion = 0;

  // Performance metrics
  private metrics = {
    totalCalculations: 0,
    cacheHits: 0,
    totalCalculationTime: 0,
    workerCalculations: 0
  };

  constructor() {
    // Initialize with performance infrastructure
    const { cache } = getPerformanceInfrastructure();
    if (cache) {
      // Load cached paths from persistent storage
      this.loadCachedPaths();
    }
  }

  /**
   * Set routing configuration for an edge
   */
  setRoutingConfig(edgeId: string, config: EdgeRoutingConfig): void {
    this.routingConfigs.set(edgeId, config);
    // Invalidate cache for this edge
    this.invalidateEdgeCache(edgeId);
  }

  /**
   * Get routing configuration for an edge
   */
  getRoutingConfig(edgeId: string): EdgeRoutingConfig | null {
    return this.routingConfigs.get(edgeId) || null;
  }

  /**
   * Calculate path for a single edge with caching
   */
  async calculatePath(
    edge: Edge,
    nodes: Node[]
  ): Promise<PathCalculationResult> {
    const startTime = performance.now();
    const { cache, workerPool, perfMonitor } = getPerformanceInfrastructure();

    // Generate cache key
    const cacheKey = this.generateCacheKey(edge, nodes);

    // Check cache first
    if (cache) {
      const cached = await cache.get<PathCalculationResult>(cacheKey);
      if (cached) {
        this.metrics.cacheHits++;
        return {
          ...cached,
          performance: {
            ...cached.performance,
            cacheHit: true,
            calculationTime: performance.now() - startTime
          }
        };
      }
    }

    // Get routing configuration
    const config = this.routingConfigs.get(edge.id) || {
      algorithm: 'straight' as EdgeRoutingAlgorithm,
      controlPoints: [],
      style: {}
    };

    // Determine if we should use worker
    const shouldUseWorker =
      config.performance?.useWorkers !== false &&
      workerPool &&
      (nodes.length > 50 || config.algorithm === 'orthogonal');

    let result: PathCalculationResult;

    if (shouldUseWorker) {
      // Calculate in worker for complex paths
      result = await this.calculateInWorker(edge, nodes, config);
      this.metrics.workerCalculations++;
    } else {
      // Calculate inline for simple paths
      result = await this.calculateInline(edge, nodes, config);
    }

    // Update metrics
    const calculationTime = performance.now() - startTime;
    this.metrics.totalCalculations++;
    this.metrics.totalCalculationTime += calculationTime;

    result.performance.calculationTime = calculationTime;

    // Cache the result
    if (cache && config.performance?.useCaching !== false) {
      await cache.set(cacheKey, result, { ttl: 60000 }); // 1 minute TTL
    }

    // Store in local cache
    this.pathCache.set(edge.id, result);

    // Track performance
    perfMonitor?.record('edge:path:calculation', calculationTime);

    return result;
  }

  /**
   * Calculate paths for multiple edges in parallel
   */
  async calculateAllPaths(
    edges: Edge[],
    nodes: Node[]
  ): Promise<Map<string, PathCalculationResult>> {
    const { perfMonitor } = getPerformanceInfrastructure();
    const startTime = performance.now();

    perfMonitor?.mark('edge:batch:start');

    // Process edges in parallel batches
    const batchSize = 10;
    const results = new Map<string, PathCalculationResult>();

    for (let i = 0; i < edges.length; i += batchSize) {
      const batch = edges.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(edge => this.calculatePath(edge, nodes))
      );

      batch.forEach((edge, index) => {
        results.set(edge.id, batchResults[index]);
      });
    }

    perfMonitor?.measureMarks('edge:batch:start', 'edge:batch:end');
    perfMonitor?.record('edge:batch:size', edges.length);
    perfMonitor?.record('edge:batch:time', performance.now() - startTime);

    return results;
  }

  /**
   * Add control point to edge
   */
  addControlPoint(edgeId: string, point: ControlPoint): void {
    const config = this.routingConfigs.get(edgeId);
    if (config) {
      config.controlPoints.push(point);
      this.invalidateEdgeCache(edgeId);
    }
  }

  /**
   * Update control point position
   */
  updateControlPoint(
    edgeId: string,
    pointId: string,
    position: XYPosition
  ): void {
    const config = this.routingConfigs.get(edgeId);
    if (config) {
      const point = config.controlPoints.find(cp => cp.id === pointId);
      if (point) {
        point.position = position;
        this.invalidateEdgeCache(edgeId);
      }
    }
  }

  /**
   * Remove control point
   */
  removeControlPoint(edgeId: string, pointId: string): void {
    const config = this.routingConfigs.get(edgeId);
    if (config) {
      config.controlPoints = config.controlPoints.filter(
        cp => cp.id !== pointId
      );
      this.invalidateEdgeCache(edgeId);
    }
  }

  /**
   * Enable auto-routing
   */
  enableAutoRouting(config: AutoRoutingConfig): void {
    this.autoRoutingConfig = config;
    if (config.enabled) {
      this.startAutoRouting();
    }
  }

  /**
   * Disable auto-routing
   */
  disableAutoRouting(): void {
    if (this.autoRoutingConfig) {
      this.autoRoutingConfig.enabled = false;
    }
  }

  /**
   * Recalculate routes for specified edges
   */
  async recalculateRoutes(edgeIds?: string[]): Promise<void> {
    if (edgeIds) {
      edgeIds.forEach(id => this.routingQueue.add(id));
    } else {
      // Recalculate all edges
      this.pathCache.clear();
      this.cacheVersion++;
    }

    // Process routing queue
    await this.processRoutingQueue();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const hitRate =
      this.metrics.totalCalculations > 0
        ? (this.metrics.cacheHits / this.metrics.totalCalculations) * 100
        : 0;

    const avgCalculationTime =
      this.metrics.totalCalculations > 0
        ? this.metrics.totalCalculationTime / this.metrics.totalCalculations
        : 0;

    return {
      size: this.pathCache.size,
      hitRate,
      avgCalculationTime
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.pathCache.clear();
    this.cacheVersion++;
    const { cache } = getPerformanceInfrastructure();
    if (cache) {
      cache.invalidatePattern('edge:path:*');
    }
  }

  /**
   * Calculate path inline (non-worker)
   */
  private async calculateInline(
    edge: Edge,
    nodes: Node[],
    config: EdgeRoutingConfig
  ): Promise<PathCalculationResult> {
    const algorithm = RoutingAlgorithmFactory.getAlgorithm(config.algorithm);

    // Get source and target positions
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      throw new Error(`Cannot find source or target node for edge ${edge.id}`);
    }

    const sourcePos = this.getEdgePosition(sourceNode, edge.sourceHandle);
    const targetPos = this.getEdgePosition(targetNode, edge.targetHandle);

    // Calculate path
    const path = await algorithm.calculatePath(
      sourcePos,
      targetPos,
      config.controlPoints,
      config.constraints
    );

    // Calculate control points if not provided
    const controlPoints =
      config.controlPoints.length > 0
        ? config.controlPoints
        : algorithm.calculateControlPoints(sourcePos, targetPos, config);

    // Validate path for collisions if needed
    const collision =
      config.constraints?.avoidNodes || config.constraints?.avoidEdges
        ? algorithm.validatePath(path, nodes)
        : undefined;

    return {
      path,
      controlPoints,
      length: this.calculatePathLength(path),
      bends: controlPoints.filter(cp => cp.type === 'intermediate').length,
      collision,
      performance: {
        calculationTime: 0, // Will be set by caller
        cacheHit: false,
        workerUsed: false
      }
    };
  }

  /**
   * Calculate path in worker
   */
  private async calculateInWorker(
    edge: Edge,
    nodes: Node[],
    config: EdgeRoutingConfig
  ): Promise<PathCalculationResult> {
    const { workerPool } = getPerformanceInfrastructure();

    if (!workerPool) {
      // Fallback to inline calculation
      return this.calculateInline(edge, nodes, config);
    }

    const task: EdgeRoutingWorkerTask = {
      type: 'CALCULATE_EDGE_PATH',
      data: {
        edge,
        nodes: nodes.map(n => ({
          id: n.id,
          position: n.position,
          width: n.width,
          height: n.height
        })),
        algorithm: config.algorithm,
        config
      }
    };

    const result = await workerPool.execute<EdgeRoutingWorkerResult>(task);

    return {
      path: result.path,
      controlPoints: result.controlPoints,
      length: this.calculatePathLength(result.path),
      bends: result.controlPoints.filter(cp => cp.type === 'intermediate')
        .length,
      collision: result.collision,
      performance: {
        calculationTime: result.calculationTime,
        cacheHit: false,
        workerUsed: true
      }
    };
  }

  /**
   * Get edge connection position on node
   */
  private getEdgePosition(node: Node, handle?: string | null): XYPosition {
    // Simple center position for now
    // In production, calculate based on handle position
    return {
      x: node.position.x + (node.width || 100) / 2,
      y: node.position.y + (node.height || 50) / 2
    };
  }

  /**
   * Calculate SVG path length
   */
  private calculatePathLength(pathString: string): number {
    // Simple approximation - in production use proper SVG path parsing
    const segments = pathString.match(/[ML]\s*[\d.]+,[\d.]+/g) || [];
    let length = 0;
    let lastPoint: XYPosition | null = null;

    segments.forEach(segment => {
      const coords = segment.match(/[\d.]+/g);
      if (coords && coords.length === 2) {
        const point: XYPosition = {
          x: parseFloat(coords[0]),
          y: parseFloat(coords[1])
        };

        if (lastPoint) {
          length += Math.sqrt(
            Math.pow(point.x - lastPoint.x, 2) +
              Math.pow(point.y - lastPoint.y, 2)
          );
        }

        lastPoint = point;
      }
    });

    return length;
  }

  /**
   * Generate cache key for edge path
   */
  private generateCacheKey(edge: Edge, nodes: Node[]): string {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    const config = this.routingConfigs.get(edge.id);

    return `edge:path:${edge.id}:${sourceNode?.position.x},${sourceNode?.position.y}:${targetNode?.position.x},${targetNode?.position.y}:${config?.algorithm || 'straight'}:v${this.cacheVersion}`;
  }

  /**
   * Invalidate cache for specific edge
   */
  private invalidateEdgeCache(edgeId: string): void {
    this.pathCache.delete(edgeId);
    const { cache } = getPerformanceInfrastructure();
    if (cache) {
      cache.invalidatePattern(`edge:path:${edgeId}:*`);
    }
  }

  /**
   * Start auto-routing process
   */
  private startAutoRouting(): void {
    if (!this.autoRoutingConfig?.enabled) return;

    const interval = this.autoRoutingConfig.updateInterval || 1000;

    const autoRoute = async () => {
      if (this.autoRoutingConfig?.enabled && this.routingQueue.size > 0) {
        await this.processRoutingQueue();
      }

      if (this.autoRoutingConfig?.enabled) {
        setTimeout(autoRoute, interval);
      }
    };

    setTimeout(autoRoute, interval);
  }

  /**
   * Process routing queue
   */
  private async processRoutingQueue(): Promise<void> {
    if (this.routingQueue.size === 0) return;

    const edgeIds = Array.from(this.routingQueue);
    this.routingQueue.clear();

    // Process in batches
    const batchSize = 5;
    for (let i = 0; i < edgeIds.length; i += batchSize) {
      const batch = edgeIds.slice(i, i + batchSize);
      // Note: This would need access to edges and nodes from the graph
      // In practice, this would be called with proper context
    }
  }

  /**
   * Load cached paths from persistent storage
   */
  private async loadCachedPaths(): Promise<void> {
    const { cache } = getPerformanceInfrastructure();
    if (!cache) return;

    // Load previously cached paths
    // This would iterate through known edge IDs and load their cached paths
  }
}

/**
 * Global edge routing manager instance
 */
let edgeRoutingManager: EdgeRoutingManager | null = null;

/**
 * Get or create edge routing manager
 */
export function getEdgeRoutingManager(): EdgeRoutingManager {
  if (!edgeRoutingManager) {
    edgeRoutingManager = new EdgeRoutingManager();
  }
  return edgeRoutingManager;
}

/**
 * Apply routing to edges
 */
export async function applyRoutingToEdges(
  edges: Edge[],
  nodes: Node[],
  routingConfigs?: Map<string, EdgeRoutingConfig>
): Promise<RoutedEdge[]> {
  const manager = getEdgeRoutingManager();

  // Set routing configurations
  if (routingConfigs) {
    routingConfigs.forEach((config, edgeId) => {
      manager.setRoutingConfig(edgeId, config);
    });
  }

  // Calculate paths for all edges
  const paths = await manager.calculateAllPaths(edges, nodes);

  // Apply calculated paths to edges
  return edges.map(edge => ({
    ...edge,
    routing: manager.getRoutingConfig(edge.id) || undefined,
    calculatedPath: paths.get(edge.id)
  }));
}

/**
 * Invalidate edge routing caches
 */
export async function invalidateEdgeRoutingCaches(
  pattern?: string
): Promise<number> {
  const manager = getEdgeRoutingManager();

  if (pattern) {
    // Invalidate specific pattern
    const { cache } = getPerformanceInfrastructure();
    if (cache) {
      return cache.invalidatePattern(pattern);
    }
  } else {
    // Clear all caches
    manager.clearCache();
  }

  return 0;
}
