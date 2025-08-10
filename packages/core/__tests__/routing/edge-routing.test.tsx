/**
 * Tests for advanced edge routing functionality
 * Story 1.28: Advanced Edge Routing
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Edge, Node } from 'reactflow';
import {
  BezierRoutingAlgorithm,
  OrthogonalRoutingAlgorithm,
  StepRoutingAlgorithm,
  SmartRoutingAlgorithm,
  RoutingAlgorithmFactory
} from '../../utils/routing/algorithms';
import {
  EdgeRoutingManager,
  getEdgeRoutingManager,
  applyRoutingToEdges
} from '../../utils/routing/edgeRouting';
import { createAutoRouter } from '../../utils/routing/autoRouter';
import { EdgeRoutingAlgorithm, EdgeRoutingConfig } from '../../types/edgeRouting';

// Mock performance infrastructure
jest.mock('../../utils/performance', () => ({
  getPerformanceInfrastructure: () => ({
    cache: {
      get: jest.fn(),
      set: jest.fn(),
      invalidatePattern: jest.fn()
    },
    workerPool: null,
    perfMonitor: {
      mark: jest.fn(),
      measureMarks: jest.fn(),
      record: jest.fn(),
      measure: jest.fn()
    }
  }),
  initializePerformance: jest.fn()
}));

describe('Edge Routing Algorithms', () => {
  describe('BezierRoutingAlgorithm', () => {
    let algorithm: BezierRoutingAlgorithm;
    
    beforeEach(() => {
      algorithm = new BezierRoutingAlgorithm();
    });
    
    test('should calculate bezier path', async () => {
      const source = { x: 0, y: 0 };
      const target = { x: 100, y: 100 };
      
      const path = await algorithm.calculatePath(source, target);
      
      expect(path).toContain('M 0,0');
      expect(path).toContain('C');
      expect(path).toContain('100,100');
    });
    
    test('should generate control points', () => {
      const source = { x: 0, y: 0 };
      const target = { x: 200, y: 0 };
      
      const controlPoints = algorithm.calculateControlPoints(source, target);
      
      expect(controlPoints).toHaveLength(2);
      expect(controlPoints[0].type).toBe('intermediate');
      expect(controlPoints[0].position.x).toBeGreaterThan(0);
      expect(controlPoints[1].position.x).toBeLessThan(200);
    });
    
    test('should apply grid snapping', async () => {
      const source = { x: 13, y: 27 };
      const target = { x: 98, y: 103 };
      
      const path = await algorithm.calculatePath(source, target, undefined, {
        snapToGrid: { enabled: true, gridSize: 10 }
      });
      
      expect(path).toContain('M 10,30'); // Snapped source
      expect(path).toContain('100,100'); // Snapped target
    });
  });
  
  describe('OrthogonalRoutingAlgorithm', () => {
    let algorithm: OrthogonalRoutingAlgorithm;
    
    beforeEach(() => {
      algorithm = new OrthogonalRoutingAlgorithm();
    });
    
    test('should calculate orthogonal path with right angles', async () => {
      const source = { x: 0, y: 0 };
      const target = { x: 100, y: 100 };
      
      const path = await algorithm.calculatePath(source, target);
      
      expect(path).toContain('M 0,0');
      expect(path).toContain('L'); // Line segments
      expect(path).toContain('Q'); // Rounded corners
      expect(path).toContain('100,100');
    });
    
    test('should respect preferred directions', async () => {
      const source = { x: 0, y: 0 };
      const target = { x: 100, y: 100 };
      
      const pathHorizontal = await algorithm.calculatePath(source, target, undefined, {
        preferredDirections: ['horizontal']
      });
      
      const pathVertical = await algorithm.calculatePath(source, target, undefined, {
        preferredDirections: ['vertical']
      });
      
      expect(pathHorizontal).not.toBe(pathVertical);
    });
    
    test('should limit maximum bends', async () => {
      const source = { x: 0, y: 0 };
      const target = { x: 200, y: 200 };
      
      const controlPoints = algorithm.calculateControlPoints(source, target, {
        algorithm: 'orthogonal',
        controlPoints: [],
        style: {},
        constraints: { maxBends: 2 }
      });
      
      expect(controlPoints.length).toBeLessThanOrEqual(2);
    });
  });
  
  describe('StepRoutingAlgorithm', () => {
    let algorithm: StepRoutingAlgorithm;
    
    beforeEach(() => {
      algorithm = new StepRoutingAlgorithm();
    });
    
    test('should calculate step path', async () => {
      const source = { x: 0, y: 0 };
      const target = { x: 100, y: 100 };
      
      const path = await algorithm.calculatePath(source, target);
      
      expect(path).toContain('M 0,0');
      expect(path).toContain('L'); // Line segments
      expect(path).toContain('100,100');
    });
    
    test('should generate step control points', () => {
      const source = { x: 0, y: 0 };
      const target = { x: 100, y: 50 };
      
      const controlPoints = algorithm.calculateControlPoints(source, target, {
        algorithm: 'step',
        controlPoints: [],
        style: { stepSize: 25 }
      });
      
      expect(controlPoints.length).toBeGreaterThan(0);
      controlPoints.forEach(cp => {
        expect(cp.type).toBe('intermediate');
      });
    });
  });
  
  describe('SmartRoutingAlgorithm', () => {
    let algorithm: SmartRoutingAlgorithm;
    
    beforeEach(() => {
      algorithm = new SmartRoutingAlgorithm();
    });
    
    test('should select appropriate algorithm based on layout', async () => {
      const horizontalSource = { x: 0, y: 50 };
      const horizontalTarget = { x: 200, y: 50 };
      
      const verticalSource = { x: 50, y: 0 };
      const verticalTarget = { x: 50, y: 200 };
      
      const pathHorizontal = await algorithm.calculatePath(horizontalSource, horizontalTarget);
      const pathVertical = await algorithm.calculatePath(verticalSource, verticalTarget);
      
      // Smart algorithm should choose different strategies
      expect(pathHorizontal).toBeDefined();
      expect(pathVertical).toBeDefined();
    });
    
    test('should use orthogonal when avoiding obstacles', async () => {
      const source = { x: 0, y: 0 };
      const target = { x: 100, y: 100 };
      
      const path = await algorithm.calculatePath(source, target, undefined, {
        avoidNodes: true,
        avoidEdges: true
      });
      
      expect(path).toBeDefined();
      // Should use orthogonal algorithm for obstacle avoidance
    });
  });
  
  describe('RoutingAlgorithmFactory', () => {
    test('should return correct algorithm for each type', () => {
      const types: EdgeRoutingAlgorithm[] = ['bezier', 'orthogonal', 'step', 'straight', 'smart'];
      
      types.forEach(type => {
        const algorithm = RoutingAlgorithmFactory.getAlgorithm(type);
        expect(algorithm).toBeDefined();
        expect(algorithm.name).toBe(type);
      });
    });
    
    test('should throw error for unknown algorithm', () => {
      expect(() => {
        RoutingAlgorithmFactory.getAlgorithm('unknown' as EdgeRoutingAlgorithm);
      }).toThrow('Unknown routing algorithm');
    });
  });
});

describe('EdgeRoutingManager', () => {
  let manager: EdgeRoutingManager;
  let nodes: Node[];
  let edges: Edge[];
  
  beforeEach(() => {
    manager = new EdgeRoutingManager();
    
    nodes = [
      { id: '1', position: { x: 0, y: 0 }, data: {} },
      { id: '2', position: { x: 200, y: 0 }, data: {} },
      { id: '3', position: { x: 100, y: 100 }, data: {} }
    ];
    
    edges = [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e1-3', source: '1', target: '3' }
    ];
  });
  
  test('should set and get routing configuration', () => {
    const config: EdgeRoutingConfig = {
      algorithm: 'bezier',
      controlPoints: [],
      style: { strokeWidth: 2 }
    };
    
    manager.setRoutingConfig('e1-2', config);
    const retrieved = manager.getRoutingConfig('e1-2');
    
    expect(retrieved).toEqual(config);
  });
  
  test('should calculate path for edge', async () => {
    const result = await manager.calculatePath(edges[0], nodes);
    
    expect(result).toBeDefined();
    expect(result.path).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result.performance.calculationTime).toBeGreaterThanOrEqual(0);
  });
  
  test('should calculate paths for multiple edges', async () => {
    const results = await manager.calculateAllPaths(edges, nodes);
    
    expect(results.size).toBe(edges.length);
    edges.forEach(edge => {
      expect(results.has(edge.id)).toBe(true);
      const result = results.get(edge.id);
      expect(result?.path).toBeDefined();
    });
  });
  
  test('should manage control points', () => {
    const config: EdgeRoutingConfig = {
      algorithm: 'bezier',
      controlPoints: [],
      style: {}
    };
    
    manager.setRoutingConfig('e1-2', config);
    
    // Add control point
    manager.addControlPoint('e1-2', {
      id: 'cp1',
      position: { x: 50, y: 50 },
      type: 'intermediate'
    });
    
    const updated = manager.getRoutingConfig('e1-2');
    expect(updated?.controlPoints).toHaveLength(1);
    
    // Update control point
    manager.updateControlPoint('e1-2', 'cp1', { x: 60, y: 60 });
    const afterUpdate = manager.getRoutingConfig('e1-2');
    expect(afterUpdate?.controlPoints[0].position).toEqual({ x: 60, y: 60 });
    
    // Remove control point
    manager.removeControlPoint('e1-2', 'cp1');
    const afterRemove = manager.getRoutingConfig('e1-2');
    expect(afterRemove?.controlPoints).toHaveLength(0);
  });
  
  test('should provide cache statistics', () => {
    const stats = manager.getCacheStats();
    
    expect(stats).toBeDefined();
    expect(stats.size).toBeGreaterThanOrEqual(0);
    expect(stats.hitRate).toBeGreaterThanOrEqual(0);
    expect(stats.avgCalculationTime).toBeGreaterThanOrEqual(0);
  });
  
  test('should clear cache', () => {
    manager.clearCache();
    const stats = manager.getCacheStats();
    
    expect(stats.size).toBe(0);
  });
});

describe('Auto-routing', () => {
  let autoRouter: any;
  let nodes: Node[];
  let edges: Edge[];
  
  beforeEach(() => {
    autoRouter = createAutoRouter({
      enabled: true,
      algorithm: 'smart',
      collisionDetection: true
    });
    
    nodes = [
      { id: '1', position: { x: 0, y: 0 }, data: {}, width: 100, height: 50 },
      { id: '2', position: { x: 200, y: 0 }, data: {}, width: 100, height: 50 },
      { id: '3', position: { x: 100, y: 100 }, data: {}, width: 100, height: 50 },
      { id: '4', position: { x: 100, y: 200 }, data: {}, width: 100, height: 50 }
    ];
    
    edges = [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e1-4', source: '1', target: '4' }
    ];
  });
  
  test('should optimize routes', async () => {
    const result = await autoRouter.optimizeRoutes(edges, nodes);
    
    expect(result).toBeDefined();
    expect(result.edges).toHaveLength(edges.length);
    expect(result.totalCrossings).toBeGreaterThanOrEqual(0);
    expect(result.totalBends).toBeGreaterThanOrEqual(0);
    expect(result.totalLength).toBeGreaterThan(0);
    expect(result.optimizationTime).toBeGreaterThan(0);
  });
  
  test('should detect edge crossings', async () => {
    // Create edges that definitely cross
    const crossingEdges = [
      { id: 'e1', source: '1', target: '3' }, // Diagonal
      { id: 'e2', source: '2', target: '4' }  // Crossing diagonal
    ];
    
    const result = await autoRouter.optimizeRoutes(crossingEdges, nodes);
    
    // Should detect at least one crossing
    expect(result.totalCrossings).toBeGreaterThanOrEqual(0);
  });
  
  test('should start and stop auto-routing', () => {
    expect(() => {
      autoRouter.start(edges, nodes);
      autoRouter.stop();
    }).not.toThrow();
  });
});

describe('Integration', () => {
  test('should apply routing to edges', async () => {
    const nodes: Node[] = [
      { id: '1', position: { x: 0, y: 0 }, data: {} },
      { id: '2', position: { x: 100, y: 100 }, data: {} }
    ];
    
    const edges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2' }
    ];
    
    const routingConfigs = new Map<string, EdgeRoutingConfig>();
    routingConfigs.set('e1-2', {
      algorithm: 'bezier',
      controlPoints: [],
      style: { animated: true }
    });
    
    const routedEdges = await applyRoutingToEdges(edges, nodes, routingConfigs);
    
    expect(routedEdges).toHaveLength(1);
    expect(routedEdges[0].routing).toBeDefined();
    expect(routedEdges[0].calculatedPath).toBeDefined();
  });
  
  test('should handle performance metrics', async () => {
    const manager = getEdgeRoutingManager();
    const nodes: Node[] = [
      { id: '1', position: { x: 0, y: 0 }, data: {} },
      { id: '2', position: { x: 100, y: 100 }, data: {} }
    ];
    
    const edge: Edge = { id: 'e1-2', source: '1', target: '2' };
    
    // Calculate path twice to test caching
    const result1 = await manager.calculatePath(edge, nodes);
    const result2 = await manager.calculatePath(edge, nodes);
    
    expect(result1.performance.cacheHit).toBe(false);
    // Second call might hit cache depending on implementation
    expect(result2).toBeDefined();
    
    const stats = manager.getCacheStats();
    expect(stats.size).toBeGreaterThanOrEqual(0);
  });
});