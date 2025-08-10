/**
 * Type definitions for advanced edge routing
 * Story 1.28: Advanced Edge Routing
 * Integrated with Story 0.1: Performance Infrastructure
 */

import { Edge, Node, XYPosition } from 'reactflow';

/**
 * Edge routing algorithms
 */
export type EdgeRoutingAlgorithm = 
  | 'bezier'        // Smooth bezier curves
  | 'orthogonal'    // Right-angle routing (Manhattan)
  | 'step'          // Step function routing
  | 'straight'      // Direct line (default)
  | 'smart';        // AI-assisted routing

/**
 * Control point for edge manipulation
 */
export interface ControlPoint {
  id: string;
  position: XYPosition;
  type: 'source' | 'target' | 'intermediate';
  locked?: boolean;
  metadata?: {
    angle?: number;
    distance?: number;
    weight?: number;
  };
}

/**
 * Edge routing configuration
 */
export interface EdgeRoutingConfig {
  algorithm: EdgeRoutingAlgorithm;
  controlPoints: ControlPoint[];
  style: EdgeStyle;
  constraints?: EdgeConstraints;
  performance?: {
    useCaching: boolean;
    useWorkers: boolean;
    maxCalculationTime: number; // ms
  };
}

/**
 * Edge styling options
 */
export interface EdgeStyle {
  strokeWidth?: number;
  strokeColor?: string;
  strokeDasharray?: string;
  animated?: boolean;
  arrowHeadType?: 'arrow' | 'arrowclosed' | 'none';
  labelStyle?: {
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    backgroundColor?: string;
  };
  curvature?: number; // For bezier curves
  borderRadius?: number; // For orthogonal routing
  stepSize?: number; // For step routing
}

/**
 * Edge routing constraints
 */
export interface EdgeConstraints {
  avoidNodes?: boolean;
  avoidEdges?: boolean;
  minDistance?: number; // Minimum distance from obstacles
  maxBends?: number; // Maximum number of bends
  preferredDirections?: ('horizontal' | 'vertical')[];
  snapToGrid?: {
    enabled: boolean;
    gridSize: number;
  };
}

/**
 * Collision detection result
 */
export interface CollisionResult {
  hasCollision: boolean;
  collisionPoints: XYPosition[];
  collidingElements: {
    type: 'node' | 'edge';
    id: string;
    intersection: XYPosition;
  }[];
}

/**
 * Path calculation result with performance metrics
 */
export interface PathCalculationResult {
  path: string; // SVG path string
  controlPoints: ControlPoint[];
  length: number;
  bends: number;
  collision?: CollisionResult;
  performance: {
    calculationTime: number;
    cacheHit: boolean;
    workerUsed: boolean;
  };
}

/**
 * Auto-routing configuration
 */
export interface AutoRoutingConfig {
  enabled: boolean;
  algorithm: EdgeRoutingAlgorithm;
  updateInterval?: number; // ms between recalculations
  collisionDetection: boolean;
  optimization: {
    minimizeCrossings: boolean;
    minimizeBends: boolean;
    minimizeLength: boolean;
    distributionSpacing?: number;
  };
}

/**
 * Edge routing state (normalized for performance)
 */
export interface EdgeRoutingState {
  // Normalized storage for O(1) lookups
  routingById: Record<string, EdgeRoutingConfig>;
  allEdgeIds: string[];
  
  // Caching
  pathCache: Map<string, PathCalculationResult>;
  cacheVersion: number;
  
  // Auto-routing
  autoRouting?: AutoRoutingConfig;
  routingQueue: string[]; // Edges pending recalculation
  
  // Performance metrics
  metrics: {
    averageCalculationTime: number;
    cacheHitRate: number;
    totalRecalculations: number;
    lastUpdateTime: number;
  };
}

/**
 * Edge with routing information
 */
export interface RoutedEdge extends Edge {
  routing?: EdgeRoutingConfig;
  calculatedPath?: PathCalculationResult;
}

/**
 * Routing algorithm implementation interface
 */
export interface IRoutingAlgorithm {
  name: EdgeRoutingAlgorithm;
  
  /**
   * Calculate path between two points
   */
  calculatePath(
    source: XYPosition,
    target: XYPosition,
    controlPoints?: ControlPoint[],
    constraints?: EdgeConstraints
  ): Promise<string>;
  
  /**
   * Calculate control points for the algorithm
   */
  calculateControlPoints(
    source: XYPosition,
    target: XYPosition,
    config?: EdgeRoutingConfig
  ): ControlPoint[];
  
  /**
   * Validate if path is possible
   */
  validatePath(
    path: string,
    obstacles?: Array<Node | Edge>
  ): CollisionResult;
}

/**
 * Edge routing manager interface
 */
export interface IEdgeRoutingManager {
  // Configuration
  setRoutingConfig(edgeId: string, config: EdgeRoutingConfig): void;
  getRoutingConfig(edgeId: string): EdgeRoutingConfig | null;
  
  // Path calculation
  calculatePath(edge: Edge, nodes: Node[]): Promise<PathCalculationResult>;
  calculateAllPaths(edges: Edge[], nodes: Node[]): Promise<Map<string, PathCalculationResult>>;
  
  // Control points
  addControlPoint(edgeId: string, point: ControlPoint): void;
  updateControlPoint(edgeId: string, pointId: string, position: XYPosition): void;
  removeControlPoint(edgeId: string, pointId: string): void;
  
  // Auto-routing
  enableAutoRouting(config: AutoRoutingConfig): void;
  disableAutoRouting(): void;
  recalculateRoutes(edgeIds?: string[]): Promise<void>;
  
  // Performance
  getCacheStats(): {
    size: number;
    hitRate: number;
    avgCalculationTime: number;
  };
  clearCache(): void;
}

/**
 * Bezier curve calculation parameters
 */
export interface BezierParams {
  curvature?: number; // 0-1, how curved the line should be
  fromPosition?: 'top' | 'right' | 'bottom' | 'left';
  toPosition?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Orthogonal routing parameters
 */
export interface OrthogonalParams {
  borderRadius?: number;
  minSegmentLength?: number;
  preferredDirection?: 'horizontal' | 'vertical';
  padding?: number; // Distance from nodes
}

/**
 * Step routing parameters
 */
export interface StepParams {
  stepSize?: number;
  stepType?: 'horizontal-first' | 'vertical-first' | 'shortest';
  smoothing?: boolean;
}

/**
 * Worker task for edge routing calculation
 */
export interface EdgeRoutingWorkerTask {
  type: 'CALCULATE_EDGE_PATH';
  data: {
    edge: Edge;
    nodes: Array<{ id: string; position: XYPosition; width?: number; height?: number }>;
    algorithm: EdgeRoutingAlgorithm;
    config?: EdgeRoutingConfig;
  };
}

/**
 * Worker result for edge routing
 */
export interface EdgeRoutingWorkerResult {
  edgeId: string;
  path: string;
  controlPoints: ControlPoint[];
  collision?: CollisionResult;
  calculationTime: number;
}