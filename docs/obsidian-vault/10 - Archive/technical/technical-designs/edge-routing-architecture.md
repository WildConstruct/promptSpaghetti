# Edge Routing with Caching Architecture

## Executive Summary

This document defines a comprehensive edge routing architecture with mandatory caching for the prompt-spaghetti graph editor. The solution implements intelligent path calculation, Worker thread processing, and progressive enhancement to achieve smooth edge routing for 1000+ nodes with sub-50ms response times.

**Key Performance Targets:**
- Edge routing calculation: <50ms for 500+ edges
- Cache hit ratio: >85% for typical workflows
- Memory usage: <100MB for edge caching
- Visual smoothness: 60fps during node manipulation

## Current Edge Routing Challenges

### Performance Bottlenecks
```typescript
// Current implementation analysis from Epic1GraphEditor.tsx
const currentEdgeIssues = {
  calculations: 'O(n²) complexity for obstacle avoidance',
  caching: 'No caching of calculated paths',
  threading: 'All calculations on main thread',
  updates: 'Full recalculation on any node movement',
  memory: 'Path objects created/destroyed frequently'
};

// Example of current expensive operation (lines 259-289)
const convertToRuntimeGraph = useCallback((flowNodes: Node[], flowEdges: Edge[]) => {
  // This runs on every graph change without caching
  const runtimeNodes = new Map();
  
  for (const node of flowNodes) {
    const runtimeNode = nodeDataToRuntimeNode(node);
    if (runtimeNode) {
      runtimeNodes.set(node.id, runtimeNode);
    }
  }
  // ... expensive path calculations
}, []);
```

### Current Limitations
1. **No Path Caching**: Recalculates identical paths repeatedly
2. **Synchronous Processing**: Blocks UI during complex routing
3. **Memory Inefficiency**: Creates new path objects on every update
4. **Poor Scalability**: Performance degrades linearly with node count

## Mandatory Caching Layer Design

### Multi-Level Cache Architecture
```typescript
// packages/core/routing/EdgeRoutingCache.ts
interface EdgePath {
  id: string;
  points: Point[];
  distance: number;
  obstacles: string[]; // Node IDs that affect this path
  timestamp: number;
  hitCount: number;
  complexity: 'simple' | 'moderate' | 'complex';
}

export class EdgeRoutingCache {
  private L1Cache = new Map<string, EdgePath>(); // Hot paths (64 entries)
  private L2Cache = new Map<string, EdgePath>(); // Warm paths (512 entries)  
  private L3Cache = new Map<string, EdgePath>(); // Cold paths (2048 entries)
  private persistentCache: PersistentPathCache;
  
  constructor() {
    this.persistentCache = new PersistentPathCache();
    this.loadPersistedPaths();
  }
  
  generateCacheKey(edge: Edge, obstacles: ObstacleMap, viewport: Viewport): string {
    // Create deterministic cache key
    const obstacleHash = this.hashObstacles(obstacles);
    const viewportHash = this.hashViewport(viewport);
    const edgeHash = `${edge.source}-${edge.target}`;
    
    return `${edgeHash}:${obstacleHash}:${viewportHash}`;
  }
  
  getCachedPath(key: string): EdgePath | null {
    // Check L1 cache first (fastest)
    let path = this.L1Cache.get(key);
    if (path) {
      path.hitCount++;
      return this.validateCachedPath(path);
    }
    
    // Check L2 cache
    path = this.L2Cache.get(key);
    if (path) {
      this.promoteToL1(key, path);
      return this.validateCachedPath(path);
    }
    
    // Check L3 cache
    path = this.L3Cache.get(key);
    if (path) {
      this.promoteToL2(key, path);
      return this.validateCachedPath(path);
    }
    
    // Check persistent cache
    return this.persistentCache.get(key);
  }
  
  setCachedPath(key: string, path: EdgePath): void {
    // Always store in L1 first
    this.L1Cache.set(key, path);
    
    // Manage cache size
    this.evictOldestIfNeeded();
    
    // Persist complex paths for next session
    if (path.complexity === 'complex') {
      this.persistentCache.set(key, path);
    }
  }
  
  private validateCachedPath(path: EdgePath): EdgePath | null {
    // Check if path is still valid (obstacles haven't moved)
    const maxAge = this.getMaxAgeForComplexity(path.complexity);
    if (Date.now() - path.timestamp > maxAge) {
      this.invalidatePath(path.id);
      return null;
    }
    
    return path;
  }
  
  invalidatePathsForNode(nodeId: string): void {
    // Invalidate all cached paths that involve this node
    const keysToInvalidate: string[] = [];
    
    [this.L1Cache, this.L2Cache, this.L3Cache].forEach(cache => {
      cache.forEach((path, key) => {
        if (path.obstacles.includes(nodeId) || 
            key.includes(nodeId)) {
          keysToInvalidate.push(key);
        }
      });
    });
    
    keysToInvalidate.forEach(key => this.invalidatePath(key));
  }
}
```

### Persistent Cache Layer
```typescript
// packages/core/routing/PersistentPathCache.ts
export class PersistentPathCache {
  private dbName = 'EdgeRoutingCache';
  private version = 1;
  private db: IDBDatabase | null = null;
  
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create paths store
        const pathStore = db.createObjectStore('paths', { keyPath: 'key' });
        pathStore.createIndex('timestamp', 'timestamp');
        pathStore.createIndex('complexity', 'complexity');
        pathStore.createIndex('hitCount', 'hitCount');
      };
    });
  }
  
  async get(key: string): Promise<EdgePath | null> {
    if (!this.db) return null;
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['paths'], 'readonly');
      const store = transaction.objectStore('paths');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.path : null);
      };
      
      request.onerror = () => resolve(null);
    });
  }
  
  async set(key: string, path: EdgePath): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['paths'], 'readwrite');
    const store = transaction.objectStore('paths');
    
    store.put({
      key,
      path,
      timestamp: Date.now()
    });
  }
  
  async cleanup(): Promise<void> {
    // Remove paths older than 7 days
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const transaction = this.db!.transaction(['paths'], 'readwrite');
    const store = transaction.objectStore('paths');
    const index = store.index('timestamp');
    
    const range = IDBKeyRange.upperBound(cutoff);
    index.openCursor(range).onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }
}
```

## Path Calculation Strategies

### Intelligent Path Selection
```typescript
// packages/core/routing/PathCalculationStrategies.ts
export enum PathComplexity {
  SIMPLE = 'simple',     // Direct line, no obstacles
  MODERATE = 'moderate', // Few obstacles, simple routing
  COMPLEX = 'complex'    // Many obstacles, advanced algorithms needed
}

export class IntelligentPathCalculator {
  private cache: EdgeRoutingCache;
  private spatialIndex: SpatialIndex;
  
  constructor(cache: EdgeRoutingCache, spatialIndex: SpatialIndex) {
    this.cache = cache;
    this.spatialIndex = spatialIndex;
  }
  
  async calculatePath(
    edge: Edge,
    obstacles: ObstacleMap,
    viewport: Viewport
  ): Promise<EdgePath> {
    
    const cacheKey = this.cache.generateCacheKey(edge, obstacles, viewport);
    
    // Try cache first
    const cachedPath = this.cache.getCachedPath(cacheKey);
    if (cachedPath) {
      return cachedPath;
    }
    
    // Determine complexity
    const complexity = this.analyzePathComplexity(edge, obstacles);
    
    // Calculate based on complexity
    let path: EdgePath;
    switch (complexity) {
      case PathComplexity.SIMPLE:
        path = this.calculateDirectPath(edge);
        break;
      case PathComplexity.MODERATE:
        path = this.calculateBezierPath(edge, obstacles);
        break;
      case PathComplexity.COMPLEX:
        path = await this.calculateAStarPath(edge, obstacles);
        break;
    }
    
    // Cache the result
    this.cache.setCachedPath(cacheKey, path);
    
    return path;
  }
  
  private analyzePathComplexity(edge: Edge, obstacles: ObstacleMap): PathComplexity {
    const sourcePos = this.getNodePosition(edge.source);
    const targetPos = this.getNodePosition(edge.target);
    
    // Check for obstacles in direct path
    const pathBounds = this.calculatePathBounds(sourcePos, targetPos, 50);
    const obstaclesInPath = this.spatialIndex.findObstaclesInBounds(pathBounds);
    
    if (obstaclesInPath.length === 0) {
      return PathComplexity.SIMPLE;
    } else if (obstaclesInPath.length <= 3) {
      return PathComplexity.MODERATE;  
    } else {
      return PathComplexity.COMPLEX;
    }
  }
  
  private calculateDirectPath(edge: Edge): EdgePath {
    const source = this.getNodePosition(edge.source);
    const target = this.getNodePosition(edge.target);
    
    return {
      id: edge.id,
      points: [source, target],
      distance: this.calculateDistance(source, target),
      obstacles: [],
      timestamp: Date.now(),
      hitCount: 1,
      complexity: PathComplexity.SIMPLE
    };
  }
  
  private calculateBezierPath(edge: Edge, obstacles: ObstacleMap): EdgePath {
    const source = this.getNodePosition(edge.source);
    const target = this.getNodePosition(edge.target);
    
    // Find control points to avoid obstacles
    const controlPoints = this.findBezierControlPoints(source, target, obstacles);
    
    const points = this.generateBezierCurve(source, target, controlPoints);
    
    return {
      id: edge.id,
      points,
      distance: this.calculateCurveDistance(points),
      obstacles: Array.from(obstacles.keys()),
      timestamp: Date.now(),
      hitCount: 1,
      complexity: PathComplexity.MODERATE
    };
  }
  
  private async calculateAStarPath(edge: Edge, obstacles: ObstacleMap): Promise<EdgePath> {
    // Use Web Worker for complex calculations
    const worker = await this.getWorkerFromPool();
    
    const result = await new Promise<Point[]>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Path calculation timeout')), 5000);
      
      worker.postMessage({
        type: 'astar',
        source: this.getNodePosition(edge.source),
        target: this.getNodePosition(edge.target),
        obstacles: Array.from(obstacles.values())
      });
      
      worker.onmessage = (event) => {
        clearTimeout(timeout);
        resolve(event.data.path);
      };
    });
    
    this.returnWorkerToPool(worker);
    
    return {
      id: edge.id,
      points: result,
      distance: this.calculatePathDistance(result),
      obstacles: Array.from(obstacles.keys()),
      timestamp: Date.now(),
      hitCount: 1,
      complexity: PathComplexity.COMPLEX
    };
  }
}
```

## Worker Thread Implementation

### Routing Worker Pool
```typescript
// packages/core/routing/RoutingWorkerPool.ts
export class RoutingWorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: RoutingTask[] = [];
  private poolSize: number;
  
  constructor(poolSize = navigator.hardwareConcurrency || 4) {
    this.poolSize = Math.min(poolSize, 8); // Cap at 8 workers
    this.initializeWorkers();
  }
  
  private initializeWorkers(): void {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker('/routing.worker.js');
      worker.onerror = this.handleWorkerError.bind(this);
      worker.onmessage = this.handleWorkerMessage.bind(this);
      
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }
  
  async calculatePaths(requests: PathCalculationRequest[]): Promise<EdgePath[]> {
    // Batch similar requests
    const batches = this.batchRequests(requests);
    
    const promises = batches.map(batch => this.processBatch(batch));
    const results = await Promise.all(promises);
    
    return results.flat();
  }
  
  private async processBatch(batch: PathCalculationRequest[]): Promise<EdgePath[]> {
    return new Promise((resolve, reject) => {
      const worker = this.getAvailableWorker();
      if (!worker) {
        // Queue for later processing
        this.taskQueue.push({ batch, resolve, reject });
        return;
      }
      
      const taskId = `batch-${Date.now()}-${Math.random()}`;
      
      worker.postMessage({
        taskId,
        type: 'calculateBatch',
        requests: batch
      });
      
      const timeout = setTimeout(() => {
        reject(new Error('Worker timeout'));
        this.returnWorker(worker);
      }, 10000);
      
      worker.onmessage = (event) => {
        if (event.data.taskId === taskId) {
          clearTimeout(timeout);
          resolve(event.data.paths);
          this.returnWorker(worker);
        }
      };
    });
  }
  
  private batchRequests(requests: PathCalculationRequest[]): PathCalculationRequest[][] {
    // Group by complexity and proximity
    const simple: PathCalculationRequest[] = [];
    const moderate: PathCalculationRequest[] = [];
    const complex: PathCalculationRequest[] = [];
    
    requests.forEach(req => {
      switch (req.complexity) {
        case PathComplexity.SIMPLE:
          simple.push(req);
          break;
        case PathComplexity.MODERATE:
          moderate.push(req);
          break;
        case PathComplexity.COMPLEX:
          complex.push(req);
          break;
      }
    });
    
    // Create optimal batch sizes
    const batches: PathCalculationRequest[][] = [];
    batches.push(...this.createBatches(simple, 50));    // Simple paths in large batches
    batches.push(...this.createBatches(moderate, 20));  // Moderate paths in medium batches  
    batches.push(...this.createBatches(complex, 5));    // Complex paths in small batches
    
    return batches;
  }
}
```

### Routing Worker Implementation
```javascript
// public/routing.worker.js
importScripts('/algorithms/astar.js', '/algorithms/bezier.js');

self.onmessage = function(event) {
  const { taskId, type, requests } = event.data;
  
  try {
    let results;
    
    switch (type) {
      case 'calculateBatch':
        results = calculatePathBatch(requests);
        break;
      case 'astar':
        results = calculateAStarPath(event.data.source, event.data.target, event.data.obstacles);
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
    
    self.postMessage({
      taskId,
      paths: results,
      performance: getPerformanceMetrics()
    });
    
  } catch (error) {
    self.postMessage({
      taskId,
      error: error.message
    });
  }
};

function calculatePathBatch(requests) {
  const startTime = performance.now();
  const results = [];
  
  for (const request of requests) {
    let path;
    
    switch (request.complexity) {
      case 'simple':
        path = calculateDirectPath(request.source, request.target);
        break;
      case 'moderate':
        path = calculateBezierPath(request.source, request.target, request.obstacles);
        break;
      case 'complex':
        path = calculateAStarPath(request.source, request.target, request.obstacles);
        break;
    }
    
    results.push({
      id: request.edgeId,
      points: path,
      distance: calculateDistance(path),
      timestamp: Date.now(),
      complexity: request.complexity,
      obstacles: request.obstacles.map(o => o.id)
    });
  }
  
  return results;
}

function calculateAStarPath(source, target, obstacles) {
  // Implementation of A* pathfinding algorithm
  const grid = createGrid(source, target, obstacles);
  const openSet = [{ ...source, f: 0, g: 0, h: heuristic(source, target) }];
  const closedSet = [];
  const cameFrom = new Map();
  
  while (openSet.length > 0) {
    // Find node with lowest f score
    const current = openSet.reduce((min, node) => 
      node.f < min.f ? node : min
    );
    
    if (isEqual(current, target)) {
      return reconstructPath(cameFrom, current);
    }
    
    openSet.splice(openSet.indexOf(current), 1);
    closedSet.push(current);
    
    const neighbors = getNeighbors(current, grid);
    
    for (const neighbor of neighbors) {
      if (closedSet.some(node => isEqual(node, neighbor))) {
        continue;
      }
      
      const tentativeG = current.g + distance(current, neighbor);
      
      if (!openSet.some(node => isEqual(node, neighbor))) {
        neighbor.g = tentativeG;
        neighbor.h = heuristic(neighbor, target);
        neighbor.f = neighbor.g + neighbor.h;
        cameFrom.set(neighbor, current);
        openSet.push(neighbor);
      } else if (tentativeG < neighbor.g) {
        neighbor.g = tentativeG;
        neighbor.f = neighbor.g + neighbor.h;
        cameFrom.set(neighbor, current);
      }
    }
  }
  
  // No path found, return direct line
  return [source, target];
}
```

## Progressive Enhancement Approach

### Fallback Strategy
```typescript
// packages/core/routing/ProgressiveRouting.ts
export class ProgressiveEdgeRouter {
  private cache: EdgeRoutingCache;
  private workerPool: RoutingWorkerPool;
  private fallbackCalculator: SynchronousPathCalculator;
  private capabilities: BrowserCapabilities;
  
  constructor() {
    this.capabilities = this.detectCapabilities();
    this.initializeComponents();
  }
  
  private detectCapabilities(): BrowserCapabilities {
    return {
      webWorkers: typeof Worker !== 'undefined',
      indexedDB: 'indexedDB' in window,
      webAssembly: 'WebAssembly' in window,
      performanceAPI: 'performance' in window,
      requestIdleCallback: 'requestIdleCallback' in window
    };
  }
  
  async calculateEdgePaths(edges: Edge[], obstacles: ObstacleMap): Promise<EdgePathMap> {
    const strategy = this.selectOptimalStrategy(edges.length);
    
    switch (strategy) {
      case RoutingStrategy.WORKER_POOL:
        return this.calculateWithWorkers(edges, obstacles);
        
      case RoutingStrategy.CACHED_SYNC:
        return this.calculateWithCache(edges, obstacles);
        
      case RoutingStrategy.SIMPLE_FALLBACK:
        return this.calculateSimpleFallback(edges, obstacles);
        
      default:
        return this.calculateBasicPaths(edges);
    }
  }
  
  private selectOptimalStrategy(edgeCount: number): RoutingStrategy {
    if (!this.capabilities.webWorkers) {
      return RoutingStrategy.SIMPLE_FALLBACK;
    }
    
    if (edgeCount > 100 && this.capabilities.indexedDB) {
      return RoutingStrategy.WORKER_POOL;
    }
    
    if (edgeCount > 20) {
      return RoutingStrategy.CACHED_SYNC;
    }
    
    return RoutingStrategy.SIMPLE_FALLBACK;
  }
  
  private async calculateWithWorkers(
    edges: Edge[], 
    obstacles: ObstacleMap
  ): Promise<EdgePathMap> {
    
    const requests = edges.map(edge => ({
      edgeId: edge.id,
      source: this.getNodePosition(edge.source),
      target: this.getNodePosition(edge.target),
      obstacles: this.getRelevantObstacles(edge, obstacles),
      complexity: this.analyzeComplexity(edge, obstacles)
    }));
    
    // Use worker pool for heavy lifting
    const paths = await this.workerPool.calculatePaths(requests);
    
    // Convert to map for fast lookup
    const pathMap = new Map<string, EdgePath>();
    paths.forEach(path => pathMap.set(path.id, path));
    
    return pathMap;
  }
}
```

### Adaptive Performance
```typescript
// packages/core/routing/AdaptivePerformance.ts
export class AdaptivePerformanceManager {
  private performanceHistory: PerformanceMetric[] = [];
  private currentStrategy: RoutingStrategy = RoutingStrategy.WORKER_POOL;
  private adaptationThreshold = 5; // Adapt after 5 poor performance samples
  
  recordPerformance(operation: string, duration: number, success: boolean) {
    this.performanceHistory.push({
      operation,
      duration,
      success,
      timestamp: Date.now(),
      strategy: this.currentStrategy
    });
    
    // Keep only recent history
    if (this.performanceHistory.length > 100) {
      this.performanceHistory = this.performanceHistory.slice(-50);
    }
    
    // Check if adaptation is needed
    this.checkForAdaptation();
  }
  
  private checkForAdaptation() {
    const recentMetrics = this.performanceHistory.slice(-this.adaptationThreshold);
    
    if (recentMetrics.length < this.adaptationThreshold) return;
    
    const avgDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
    const successRate = recentMetrics.filter(m => m.success).length / recentMetrics.length;
    
    // Adapt strategy based on performance
    if (avgDuration > 200 || successRate < 0.9) {
      this.adaptToLowerStrategy();
    } else if (avgDuration < 50 && successRate > 0.98) {
      this.adaptToHigherStrategy();
    }
  }
  
  private adaptToLowerStrategy() {
    switch (this.currentStrategy) {
      case RoutingStrategy.WORKER_POOL:
        this.currentStrategy = RoutingStrategy.CACHED_SYNC;
        break;
      case RoutingStrategy.CACHED_SYNC:
        this.currentStrategy = RoutingStrategy.SIMPLE_FALLBACK;
        break;
    }
    
    console.log(`Adapted to lower performance strategy: ${this.currentStrategy}`);
  }
  
  private adaptToHigherStrategy() {
    switch (this.currentStrategy) {
      case RoutingStrategy.SIMPLE_FALLBACK:
        this.currentStrategy = RoutingStrategy.CACHED_SYNC;
        break;
      case RoutingStrategy.CACHED_SYNC:
        this.currentStrategy = RoutingStrategy.WORKER_POOL;
        break;
    }
    
    console.log(`Adapted to higher performance strategy: ${this.currentStrategy}`);
  }
}
```

## Memory Optimization Techniques

### Smart Memory Management
```typescript
// packages/core/routing/MemoryOptimizedRouting.ts
export class MemoryOptimizedRouter {
  private pathPool: ObjectPool<EdgePath>;
  private pointPool: ObjectPool<Point>;
  private memoryPressureHandler: MemoryPressureHandler;
  
  constructor() {
    this.pathPool = new ObjectPool(() => this.createEmptyPath(), 1000);
    this.pointPool = new ObjectPool(() => ({ x: 0, y: 0 }), 10000);
    this.memoryPressureHandler = new MemoryPressureHandler();
    
    this.setupMemoryMonitoring();
  }
  
  private setupMemoryMonitoring() {
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      const memInfo = (performance as any).memory;
      if (memInfo && memInfo.usedJSHeapSize > 150 * 1024 * 1024) { // 150MB
        this.handleMemoryPressure();
      }
    }, 30000);
  }
  
  private handleMemoryPressure() {
    // Clear non-essential caches
    this.clearOldCacheEntries();
    
    // Return unused objects to pools
    this.pathPool.clear();
    this.pointPool.clear();
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }
  
  createOptimizedPath(points: Point[]): EdgePath {
    const path = this.pathPool.acquire();
    
    // Reuse pooled points
    path.points = points.map(p => {
      const pooledPoint = this.pointPool.acquire();
      pooledPoint.x = p.x;
      pooledPoint.y = p.y;
      return pooledPoint;
    });
    
    return path;
  }
  
  releasePath(path: EdgePath) {
    // Return points to pool
    path.points.forEach(point => this.pointPool.release(point));
    
    // Clear path data
    path.points = [];
    path.obstacles = [];
    
    // Return path to pool
    this.pathPool.release(path);
  }
}

class ObjectPool<T> {
  private objects: T[] = [];
  private createFn: () => T;
  private maxSize: number;
  
  constructor(createFn: () => T, maxSize: number = 1000) {
    this.createFn = createFn;
    this.maxSize = maxSize;
  }
  
  acquire(): T {
    return this.objects.pop() || this.createFn();
  }
  
  release(obj: T): void {
    if (this.objects.length < this.maxSize) {
      this.objects.push(obj);
    }
  }
  
  clear(): void {
    this.objects = [];
  }
}
```

## Performance Targets and Benchmarks

### Performance Requirements
```typescript
const performanceTargets = {
  routing: {
    simple: { target: '<5ms', max: '10ms' },
    moderate: { target: '<20ms', max: '50ms' },
    complex: { target: '<100ms', max: '200ms' }
  },
  
  caching: {
    hitRatio: { target: '>85%', minimum: '70%' },
    lookupTime: { target: '<1ms', max: '5ms' },
    memoryUsage: { target: '<100MB', max: '200MB' }
  },
  
  overall: {
    frameRate: { target: '60fps', minimum: '45fps' },
    loadTime: { target: '<2s', max: '5s' },
    memoryGrowth: { target: '<10MB/hour', max: '50MB/hour' }
  }
};
```

### Benchmarking Suite
```typescript
// packages/core/routing/__tests__/RoutingBenchmarks.test.ts
describe('Edge Routing Performance', () => {
  let router: ProgressiveEdgeRouter;
  let testGraphs: TestGraph[];
  
  beforeAll(() => {
    router = new ProgressiveEdgeRouter();
    testGraphs = generateTestGraphs([100, 500, 1000, 2000]);
  });
  
  test.each([100, 500, 1000, 2000])('Routes %i edges within performance targets', async (nodeCount) => {
    const graph = testGraphs.find(g => g.nodeCount === nodeCount)!;
    
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    const paths = await router.calculateEdgePaths(graph.edges, graph.obstacles);
    
    const duration = performance.now() - startTime;
    const memoryUsed = ((performance as any).memory?.usedJSHeapSize || 0) - startMemory;
    
    // Performance assertions
    expect(duration).toBeLessThan(getTargetTime(nodeCount));
    expect(memoryUsed).toBeLessThan(getTargetMemory(nodeCount));
    expect(paths.size).toBe(graph.edges.length);
    
    // Quality assertions
    paths.forEach(path => {
      expect(path.points.length).toBeGreaterThan(1);
      expect(path.distance).toBeGreaterThan(0);
    });
  });
  
  test('Cache hit ratio exceeds 85% for typical workflows', async () => {
    const workflow = generateTypicalWorkflow();
    const cache = new EdgeRoutingCache();
    
    let hits = 0;
    let misses = 0;
    
    for (const operation of workflow.operations) {
      const cached = cache.getCachedPath(operation.cacheKey);
      if (cached) {
        hits++;
      } else {
        misses++;
        // Simulate calculation and caching
        const path = await router.calculatePath(operation.edge, operation.obstacles);
        cache.setCachedPath(operation.cacheKey, path);
      }
    }
    
    const hitRatio = hits / (hits + misses);
    expect(hitRatio).toBeGreaterThan(0.85);
  });
});
```

## Implementation Timeline

### Phase 1: Cache Infrastructure (Week 1)
- [ ] Implement multi-level cache system
- [ ] Add persistent cache with IndexedDB
- [ ] Create cache invalidation logic
- [ ] Basic performance monitoring

### Phase 2: Worker Integration (Week 2)  
- [ ] Implement worker pool architecture
- [ ] Create routing algorithms in workers
- [ ] Add batch processing capabilities
- [ ] Implement fallback strategies

### Phase 3: Optimization (Week 3)
- [ ] Add memory optimization techniques
- [ ] Implement adaptive performance management
- [ ] Add comprehensive benchmarking
- [ ] Performance tuning and profiling

### Phase 4: Integration (Week 4)
- [ ] Integrate with Epic1GraphEditor
- [ ] Add monitoring dashboard
- [ ] Comprehensive testing
- [ ] Documentation and deployment

## Risk Assessment

### Technical Risks
1. **Browser Compatibility**: Worker support varies across browsers
2. **Memory Management**: Complex lifecycle management required  
3. **Cache Invalidation**: Risk of displaying stale paths

### Mitigation Strategies
1. **Progressive Enhancement**: Graceful degradation for unsupported features
2. **Comprehensive Testing**: Memory leak detection and cross-browser testing
3. **Smart Invalidation**: Conservative cache invalidation with validation

## Conclusion

This edge routing architecture with mandatory caching provides a comprehensive solution for high-performance graph editing. The multi-level caching strategy, worker thread processing, and adaptive performance management ensure optimal user experience across different scenarios and device capabilities.

**Expected Performance Improvements:**
- 80% reduction in edge calculation time
- 85%+ cache hit ratio for typical workflows  
- 60% reduction in memory usage
- Consistent 60fps performance during interactions