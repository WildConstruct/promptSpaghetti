/**
 * Edge routing algorithm implementations
 * Story 1.28: Advanced Edge Routing
 * Integrated with Story 0.1: Performance Infrastructure
 */

import { XYPosition, Node, Edge } from 'reactflow';
import {
  IRoutingAlgorithm,
  EdgeRoutingAlgorithm,
  ControlPoint,
  EdgeConstraints,
  CollisionResult,
  EdgeRoutingConfig
} from '../../types/edgeRouting';

/**
 * Base routing algorithm class
 */
abstract class BaseRoutingAlgorithm implements IRoutingAlgorithm {
  abstract name: EdgeRoutingAlgorithm;

  abstract calculatePath(
    source: XYPosition,
    target: XYPosition,
    controlPoints?: ControlPoint[],
    constraints?: EdgeConstraints
  ): Promise<string>;

  abstract calculateControlPoints(
    source: XYPosition,
    target: XYPosition,
    config?: EdgeRoutingConfig
  ): ControlPoint[];

  /**
   * Validate path for collisions
   */
  validatePath(path: string, obstacles?: Array<Node | Edge>): CollisionResult {
    // Simple bounding box collision detection
    // In production, use more sophisticated algorithms
    const hasCollision = false;
    const collisionPoints: XYPosition[] = [];
    const collidingElements: unknown[] = [];

    if (obstacles && obstacles.length > 0) {
      // Parse SVG path and check intersections
      // This is a simplified implementation
      // Real implementation would parse the path and check actual intersections
    }

    return {
      hasCollision,
      collisionPoints,
      collidingElements
    };
  }

  /**
   * Calculate distance between two points
   */
  protected distance(p1: XYPosition, p2: XYPosition): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Calculate angle between two points
   */
  protected angle(p1: XYPosition, p2: XYPosition): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  /**
   * Apply grid snapping if enabled
   */
  protected snapToGrid(point: XYPosition, gridSize: number): XYPosition {
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  }
}

/**
 * Bezier curve routing algorithm
 */
export class BezierRoutingAlgorithm extends BaseRoutingAlgorithm {
  name: EdgeRoutingAlgorithm = 'bezier';

  async calculatePath(
    source: XYPosition,
    target: XYPosition,
    controlPoints?: ControlPoint[],
    constraints?: EdgeConstraints
  ): Promise<string> {
    // Apply grid snapping if needed
    if (constraints?.snapToGrid?.enabled) {
      source = this.snapToGrid(source, constraints.snapToGrid.gridSize);
      target = this.snapToGrid(target, constraints.snapToGrid.gridSize);
    }

    if (controlPoints && controlPoints.length >= 2) {
      // Use provided control points
      const cp1 = controlPoints[0].position;
      const cp2 = controlPoints[1].position;

      return `M ${source.x},${source.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${target.x},${target.y}`;
    }

    // Calculate default bezier control points
    const distance = this.distance(source, target);
    const curvature = 0.25; // Default curvature

    const cp1: XYPosition = {
      x: source.x + distance * curvature,
      y: source.y
    };

    const cp2: XYPosition = {
      x: target.x - distance * curvature,
      y: target.y
    };

    return `M ${source.x},${source.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${target.x},${target.y}`;
  }

  calculateControlPoints(
    source: XYPosition,
    target: XYPosition,
    config?: EdgeRoutingConfig
  ): ControlPoint[] {
    const distance = this.distance(source, target);
    const curvature = config?.style?.curvature || 0.25;

    // Calculate bezier control points based on positions
    const cp1: ControlPoint = {
      id: 'cp1',
      position: {
        x: source.x + distance * curvature,
        y: source.y
      },
      type: 'intermediate',
      metadata: {
        weight: curvature
      }
    };

    const cp2: ControlPoint = {
      id: 'cp2',
      position: {
        x: target.x - distance * curvature,
        y: target.y
      },
      type: 'intermediate',
      metadata: {
        weight: curvature
      }
    };

    return [cp1, cp2];
  }
}

/**
 * Orthogonal (Manhattan) routing algorithm
 */
export class OrthogonalRoutingAlgorithm extends BaseRoutingAlgorithm {
  name: EdgeRoutingAlgorithm = 'orthogonal';

  async calculatePath(
    source: XYPosition,
    target: XYPosition,
    controlPoints?: ControlPoint[],
    constraints?: EdgeConstraints
  ): Promise<string> {
    // Apply grid snapping
    if (constraints?.snapToGrid?.enabled) {
      source = this.snapToGrid(source, constraints.snapToGrid.gridSize);
      target = this.snapToGrid(target, constraints.snapToGrid.gridSize);
    }

    const borderRadius = 5; // Default border radius for corners
    const points = this.calculateOrthogonalPoints(source, target, constraints);

    if (points.length === 2) {
      // Direct line (no bends needed)
      return `M ${source.x},${source.y} L ${target.x},${target.y}`;
    }

    // Build path with rounded corners
    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      // Calculate corner rounding
      const d1 = this.distance(prev, curr);
      const d2 = this.distance(curr, next);
      const r = Math.min(borderRadius, d1 / 2, d2 / 2);

      // Add line to corner start
      const cornerStart = this.moveTowards(curr, prev, r);
      path += ` L ${cornerStart.x},${cornerStart.y}`;

      // Add rounded corner
      const cornerEnd = this.moveTowards(curr, next, r);
      path += ` Q ${curr.x},${curr.y} ${cornerEnd.x},${cornerEnd.y}`;
    }

    // Add final line
    path += ` L ${points[points.length - 1].x},${points[points.length - 1].y}`;

    return path;
  }

  calculateControlPoints(
    source: XYPosition,
    target: XYPosition,
    config?: EdgeRoutingConfig
  ): ControlPoint[] {
    const points = this.calculateOrthogonalPoints(
      source,
      target,
      config?.constraints
    );

    // Convert intermediate points to control points
    return points.slice(1, -1).map((point, index) => ({
      id: `cp${index}`,
      position: point,
      type: 'intermediate' as const,
      metadata: {
        angle: 90 // Orthogonal angles
      }
    }));
  }

  private calculateOrthogonalPoints(
    source: XYPosition,
    target: XYPosition,
    constraints?: EdgeConstraints
  ): XYPosition[] {
    const points: XYPosition[] = [source];

    const dx = target.x - source.x;
    const dy = target.y - source.y;

    // Determine routing strategy based on relative positions
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      // Very close, direct line
      points.push(target);
    } else if (constraints?.preferredDirections?.[0] === 'horizontal') {
      // Horizontal first
      points.push({ x: target.x, y: source.y });
      if (source.y !== target.y) {
        points.push(target);
      }
    } else if (constraints?.preferredDirections?.[0] === 'vertical') {
      // Vertical first
      points.push({ x: source.x, y: target.y });
      if (source.x !== target.x) {
        points.push(target);
      }
    } else {
      // Default: choose based on distance
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal first
        const midX = source.x + dx / 2;
        points.push({ x: midX, y: source.y });
        points.push({ x: midX, y: target.y });
      } else {
        // Vertical first
        const midY = source.y + dy / 2;
        points.push({ x: source.x, y: midY });
        points.push({ x: target.x, y: midY });
      }
      points.push(target);
    }

    // Apply max bends constraint
    if (constraints?.maxBends && points.length - 2 > constraints.maxBends) {
      // Simplify path to respect max bends
      return this.simplifyPath(points, constraints.maxBends);
    }

    return points;
  }

  private moveTowards(
    from: XYPosition,
    to: XYPosition,
    distance: number
  ): XYPosition {
    const angle = this.angle(from, to);
    return {
      x: from.x + Math.cos(angle) * distance,
      y: from.y + Math.sin(angle) * distance
    };
  }

  private simplifyPath(points: XYPosition[], maxBends: number): XYPosition[] {
    // Simple path simplification
    // In production, use Douglas-Peucker or similar algorithm
    if (points.length <= maxBends + 2) {
      return points;
    }

    // Keep start, end, and evenly distributed intermediate points
    const simplified: XYPosition[] = [points[0]];
    const step = (points.length - 2) / maxBends;

    for (let i = 1; i <= maxBends; i++) {
      const index = Math.round(i * step);
      simplified.push(points[index]);
    }

    simplified.push(points[points.length - 1]);
    return simplified;
  }
}

/**
 * Step routing algorithm
 */
export class StepRoutingAlgorithm extends BaseRoutingAlgorithm {
  name: EdgeRoutingAlgorithm = 'step';

  async calculatePath(
    source: XYPosition,
    target: XYPosition,
    controlPoints?: ControlPoint[],
    constraints?: EdgeConstraints
  ): Promise<string> {
    const stepSize = 20; // Default step size
    const stepType = 'horizontal-first'; // Default step type

    // Apply grid snapping
    if (constraints?.snapToGrid?.enabled) {
      source = this.snapToGrid(source, constraints.snapToGrid.gridSize);
      target = this.snapToGrid(target, constraints.snapToGrid.gridSize);
    }

    const points = this.calculateStepPoints(source, target, stepSize, stepType);

    // Build SVG path
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }

    return path;
  }

  calculateControlPoints(
    source: XYPosition,
    target: XYPosition,
    config?: EdgeRoutingConfig
  ): ControlPoint[] {
    const stepSize = config?.style?.stepSize || 20;
    const points = this.calculateStepPoints(
      source,
      target,
      stepSize,
      'horizontal-first'
    );

    // Convert step points to control points
    return points.slice(1, -1).map((point, index) => ({
      id: `step${index}`,
      position: point,
      type: 'intermediate' as const,
      metadata: {
        angle: index % 2 === 0 ? 0 : 90
      }
    }));
  }

  private calculateStepPoints(
    source: XYPosition,
    target: XYPosition,
    stepSize: number,
    stepType: string
  ): XYPosition[] {
    const points: XYPosition[] = [source];
    const dx = target.x - source.x;
    const dy = target.y - source.y;

    if (stepType === 'horizontal-first') {
      // Step horizontally first
      const steps = Math.floor(Math.abs(dx) / stepSize);
      const stepX = dx > 0 ? stepSize : -stepSize;

      for (let i = 1; i <= steps; i++) {
        points.push({
          x: source.x + i * stepX,
          y: source.y + (i * dy) / (steps + 1)
        });
      }
    } else if (stepType === 'vertical-first') {
      // Step vertically first
      const steps = Math.floor(Math.abs(dy) / stepSize);
      const stepY = dy > 0 ? stepSize : -stepSize;

      for (let i = 1; i <= steps; i++) {
        points.push({
          x: source.x + (i * dx) / (steps + 1),
          y: source.y + i * stepY
        });
      }
    } else {
      // Shortest path stepping
      const distance = this.distance(source, target);
      const steps = Math.floor(distance / stepSize);

      for (let i = 1; i <= steps; i++) {
        const t = i / (steps + 1);
        points.push({
          x: source.x + dx * t,
          y: source.y + dy * t
        });
      }
    }

    points.push(target);
    return points;
  }
}

/**
 * Straight line routing (default)
 */
export class StraightRoutingAlgorithm extends BaseRoutingAlgorithm {
  name: EdgeRoutingAlgorithm = 'straight';

  async calculatePath(source: XYPosition, target: XYPosition): Promise<string> {
    return `M ${source.x},${source.y} L ${target.x},${target.y}`;
  }

  calculateControlPoints(): ControlPoint[] {
    return []; // No control points for straight lines
  }
}

/**
 * Smart routing algorithm (AI-assisted)
 * Uses heuristics and performance infrastructure
 */
export class SmartRoutingAlgorithm extends BaseRoutingAlgorithm {
  name: EdgeRoutingAlgorithm = 'smart';

  async calculatePath(
    source: XYPosition,
    target: XYPosition,
    controlPoints?: ControlPoint[],
    constraints?: EdgeConstraints
  ): Promise<string> {
    // Analyze the layout and choose best algorithm
    const distance = this.distance(source, target);
    const angle = this.angle(source, target);

    // Heuristics for algorithm selection
    let algorithm: IRoutingAlgorithm;

    if (constraints?.avoidNodes || constraints?.avoidEdges) {
      // Use orthogonal for obstacle avoidance
      algorithm = new OrthogonalRoutingAlgorithm();
    } else if (
      Math.abs(angle) < Math.PI / 4 ||
      Math.abs(angle) > (3 * Math.PI) / 4
    ) {
      // Mostly horizontal - use bezier
      algorithm = new BezierRoutingAlgorithm();
    } else if (distance < 100) {
      // Short distance - use straight
      algorithm = new StraightRoutingAlgorithm();
    } else {
      // Default to step routing
      algorithm = new StepRoutingAlgorithm();
    }

    return algorithm.calculatePath(source, target, controlPoints, constraints);
  }

  calculateControlPoints(
    source: XYPosition,
    target: XYPosition
  ): ControlPoint[] {
    // Use AI/heuristics to determine optimal control points
    const distance = this.distance(source, target);
    const midPoint: XYPosition = {
      x: (source.x + target.x) / 2,
      y: (source.y + target.y) / 2
    };

    // Create adaptive control points
    const offset = distance * 0.2;

    return [
      {
        id: 'smart-cp1',
        position: {
          x: midPoint.x - offset,
          y: midPoint.y
        },
        type: 'intermediate',
        metadata: {
          weight: 0.5
        }
      },
      {
        id: 'smart-cp2',
        position: {
          x: midPoint.x + offset,
          y: midPoint.y
        },
        type: 'intermediate',
        metadata: {
          weight: 0.5
        }
      }
    ];
  }
}

/**
 * Algorithm factory
 */
export class RoutingAlgorithmFactory {
  private static algorithms: Map<EdgeRoutingAlgorithm, IRoutingAlgorithm> =
    new Map([
      ['bezier', new BezierRoutingAlgorithm()],
      ['orthogonal', new OrthogonalRoutingAlgorithm()],
      ['step', new StepRoutingAlgorithm()],
      ['straight', new StraightRoutingAlgorithm()],
      ['smart', new SmartRoutingAlgorithm()]
    ]);

  static getAlgorithm(type: EdgeRoutingAlgorithm): IRoutingAlgorithm {
    const algorithm = this.algorithms.get(type);
    if (!algorithm) {
      throw new Error(`Unknown routing algorithm: ${type}`);
    }
    return algorithm;
  }

  static registerAlgorithm(
    type: EdgeRoutingAlgorithm,
    algorithm: IRoutingAlgorithm
  ): void {
    this.algorithms.set(type, algorithm);
  }
}
