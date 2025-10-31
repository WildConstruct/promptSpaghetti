# Performance Infrastructure Technical Design

## Executive Summary

This document outlines a comprehensive performance infrastructure for the prompt-spaghetti graph editor, addressing critical performance bottlenecks with 1000+ nodes. The solution implements LRU caching, Web Worker pools, spatial indexing, and memory optimization strategies to achieve sub-100ms interactions.

**Key Performance Targets:**

- Node rendering: <16ms (60fps)
- Edge calculations: <50ms for 1000+ edges
- Memory usage: <200MB for 5000 nodes
- Initial load time: <2s

## Current Performance Challenges

### Identified Bottlenecks

1. **React Flow Re-renders**: Each node update triggers full graph recalculation
2. **Edge Path Calculations**: O(n²) complexity for edge routing with obstacles
3. **Memory Leaks**: Preview engine and worker pools not properly disposed
4. **Synchronous Operations**: Heavy computations blocking UI thread

### Performance Baseline

```typescript
// Current performance metrics from Epic1GraphEditor.tsx
const currentMetrics = {
  nodeRenderTime: 150, // ms for 100 nodes
  edgeCalculationTime: 800, // ms for 500 edges
  memoryUsage: 450, // MB for 1000 nodes
  frameDrops: 15 // per second during interactions
};
```

## Performance Infrastructure Architecture

### 1. LRU Cache Implementation

#### Path Calculation Cache

```typescript
// packages/core/performance/PathCalculationCache.ts
interface CacheEntry {
  path: PathSegment[];
  obstacles: ObstacleMap;
  timestamp: number;
  hitCount: number;
}

export class LRUPathCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000;
  private maxAge = 5 * 60 * 1000; // 5 minutes

  generateCacheKey(
    source: Position,
    target: Position,
    obstacles: ObstacleMap
  ): string {
    const obstacleHash = this.hashObstacles(obstacles);
    return `${source.x},${source.y}-${target.x},${target.y}-${obstacleHash}`;
  }

  get(key: string): PathSegment[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check expiration
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count and move to end (most recently used)
    entry.hitCount++;
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.path;
  }

  set(key: string, path: PathSegment[], obstacles: ObstacleMap): void {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      path,
      obstacles,
      timestamp: Date.now(),
      hitCount: 1
    });
  }

  private hashObstacles(obstacles: ObstacleMap): string {
    // Fast hash of obstacle positions for cache key
    const positions = obstacles.getAllPositions();
    return positions
      .map(p => `${Math.round(p.x / 10)},${Math.round(p.y / 10)}`)
      .sort()
      .join('|');
  }
}
```

#### Component Render Cache

```typescript
// packages/core/performance/ComponentCache.ts
export class ComponentMemoCache {
  private nodeCache = new Map<string, React.MemoExoticComponent<any>>();
  private renderCache = new Map<string, VirtualNode>();

  getMemoizedNode(nodeType: string, baseComponent: React.FC<any>) {
    if (!this.nodeCache.has(nodeType)) {
      const MemoizedComponent = React.memo(
        baseComponent,
        (prevProps, nextProps) => {
          // Custom comparison for optimal re-rendering
          return (
            prevProps.data?.value === nextProps.data?.value &&
            prevProps.selected === nextProps.selected &&
            prevProps.dragging === nextProps.dragging &&
            JSON.stringify(prevProps.position) ===
              JSON.stringify(nextProps.position)
          );
        }
      );
      this.nodeCache.set(nodeType, MemoizedComponent);
    }
    return this.nodeCache.get(nodeType)!;
  }
}
```

### 2. Web Worker Pool for Heavy Computation

#### Worker Pool Manager

```typescript
// packages/core/performance/WorkerPool.ts
interface WorkerTask {
  id: string;
  type: 'pathCalculation' | 'graphValidation' | 'previewGeneration';
  data: any;
  resolve: (result: any) => void;
  reject: (error: any) => void;
}

export class PerformanceWorkerPool {
  private workers: Worker[] = [];
  private queue: WorkerTask[] = [];
  private activeJobs = new Map<string, WorkerTask>();
  private readonly poolSize = navigator.hardwareConcurrency || 4;

  constructor() {
    this.initializeWorkers();
  }

  private initializeWorkers() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker('/performance.worker.js');
      worker.onmessage = this.handleWorkerMessage.bind(this);
      worker.onerror = this.handleWorkerError.bind(this);
      this.workers.push(worker);
    }
  }

  async calculatePaths(pathRequests: PathRequest[]): Promise<PathResult[]> {
    return new Promise((resolve, reject) => {
      const taskId = `path-${Date.now()}-${Math.random()}`;
      const task: WorkerTask = {
        id: taskId,
        type: 'pathCalculation',
        data: { pathRequests },
        resolve,
        reject
      };

      this.enqueueTask(task);
    });
  }

  private enqueueTask(task: WorkerTask) {
    this.queue.push(task);
    this.processQueue();
  }

  private processQueue() {
    if (this.queue.length === 0) return;

    const availableWorker = this.workers.find(w => !this.isWorkerBusy(w));
    if (!availableWorker) return;

    const task = this.queue.shift()!;
    this.activeJobs.set(task.id, task);

    availableWorker.postMessage({
      taskId: task.id,
      type: task.type,
      data: task.data
    });
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { taskId, result, error } = event.data;
    const task = this.activeJobs.get(taskId);

    if (!task) return;

    this.activeJobs.delete(taskId);

    if (error) {
      task.reject(new Error(error));
    } else {
      task.resolve(result);
    }

    // Process next task in queue
    this.processQueue();
  }
}
```

#### Performance Worker Implementation

```javascript
// public/performance.worker.js
self.onmessage = function (event) {
  const { taskId, type, data } = event.data;

  try {
    let result;

    switch (type) {
      case 'pathCalculation':
        result = calculateOptimalPaths(data.pathRequests);
        break;
      case 'graphValidation':
        result = validateGraphIntegrity(data.graph);
        break;
      case 'previewGeneration':
        result = generatePreviewData(data.nodes, data.edges);
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    self.postMessage({ taskId, result });
  } catch (error) {
    self.postMessage({ taskId, error: error.message });
  }
};

function calculateOptimalPaths(pathRequests) {
  // Implement A* pathfinding with obstacle avoidance
  return pathRequests.map(request => {
    const path = findOptimalPath(
      request.source,
      request.target,
      request.obstacles
    );
    return {
      id: request.id,
      path: path,
      distance: calculatePathDistance(path),
      performance: getPathPerformanceMetrics()
    };
  });
}
```

### 3. Spatial Indexing (R-Tree) for Collision Detection

```typescript
// packages/core/performance/SpatialIndex.ts
interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export class RTreeSpatialIndex {
  private tree = new RTree();
  private nodeBoxes = new Map<string, BoundingBox>();

  updateNodePosition(
    nodeId: string,
    position: Position,
    dimensions: Dimensions
  ) {
    // Remove old bounding box
    if (this.nodeBoxes.has(nodeId)) {
      this.tree.remove(this.nodeBoxes.get(nodeId)!);
    }

    // Add new bounding box
    const boundingBox = {
      minX: position.x,
      minY: position.y,
      maxX: position.x + dimensions.width,
      maxY: position.y + dimensions.height,
      nodeId
    };

    this.tree.insert(boundingBox);
    this.nodeBoxes.set(nodeId, boundingBox);
  }

  findNodesInRegion(region: BoundingBox): string[] {
    return this.tree.search(region).map(item => item.nodeId);
  }

  findNearestNodes(position: Position, radius: number): string[] {
    const searchArea = {
      minX: position.x - radius,
      minY: position.y - radius,
      maxX: position.x + radius,
      maxY: position.y + radius
    };

    return this.tree
      .search(searchArea)
      .filter(item => this.calculateDistance(position, item) <= radius)
      .map(item => item.nodeId);
  }

  getObstaclesForPath(
    source: Position,
    target: Position,
    buffer: number = 50
  ): BoundingBox[] {
    // Find obstacles in the path corridor
    const pathBounds = {
      minX: Math.min(source.x, target.x) - buffer,
      minY: Math.min(source.y, target.y) - buffer,
      maxX: Math.max(source.x, target.x) + buffer,
      maxY: Math.max(source.y, target.y) + buffer
    };

    return this.tree.search(pathBounds);
  }
}
```

### 4. State Normalization Patterns

```typescript
// packages/core/performance/StateNormalizer.ts
interface NormalizedGraphState {
  nodes: Record<string, NormalizedNode>;
  edges: Record<string, NormalizedEdge>;
  spatial: SpatialIndex;
  cache: CacheLayer;
}

export class GraphStateNormalizer {
  normalize(nodes: Node[], edges: Edge[]): NormalizedGraphState {
    const normalizedNodes: Record<string, NormalizedNode> = {};
    const normalizedEdges: Record<string, NormalizedEdge> = {};

    // Normalize nodes with computed properties
    nodes.forEach(node => {
      normalizedNodes[node.id] = {
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
        // Computed properties for performance
        boundingBox: this.calculateBoundingBox(node),
        connections: this.getNodeConnections(node.id, edges),
        renderHash: this.calculateRenderHash(node)
      };
    });

    // Normalize edges with path calculations
    edges.forEach(edge => {
      normalizedEdges[edge.id] = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        // Pre-computed path for performance
        path: this.calculateEdgePath(edge, normalizedNodes),
        style: edge.style || {},
        animated: edge.animated || false
      };
    });

    return {
      nodes: normalizedNodes,
      edges: normalizedEdges,
      spatial: this.buildSpatialIndex(normalizedNodes),
      cache: new CacheLayer()
    };
  }

  private calculateRenderHash(node: Node): string {
    // Generate hash of properties that affect rendering
    return btoa(
      JSON.stringify({
        type: node.type,
        data: node.data,
        selected: node.selected,
        position: {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y)
        }
      })
    );
  }
}
```

### 5. Memory Management Strategies

```typescript
// packages/core/performance/MemoryManager.ts
export class PerformanceMemoryManager {
  private disposables: Disposable[] = [];
  private memoryMonitor: MemoryMonitor;
  private gcScheduler: GCScheduler;

  constructor() {
    this.memoryMonitor = new MemoryMonitor();
    this.gcScheduler = new GCScheduler();
    this.setupMemoryPressureHandling();
  }

  private setupMemoryPressureHandling() {
    // Monitor memory usage
    setInterval(() => {
      const usage = this.memoryMonitor.getCurrentUsage();
      if (usage.heapUsed > 150 * 1024 * 1024) { // 150MB
        this.handleMemoryPressure();
      }
    }, 10000);
  }

  private handleMemoryPressure() {
    // Clear non-essential caches
    this.clearPreviewCache();
    this.clearOldPathCache();

    // Dispose unused workers
    this.gcScheduler.scheduleCollection();

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  trackDisposable(disposable: Disposable) {
    this.disposables.push(disposable);
  }

  dispose() {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }
}

// Memory-efficient React Flow integration
export class MemoryEfficientGraphEditor extends React.Component {
  private memoryManager = new PerformanceMemoryManager();
  private virtualizer = new VirtualizedRenderer();

  componentDidMount() {
    // Track all disposables
    this.memoryManager.trackDisposable(this.virtualizer);
  }

  componentWillUnmount() {
    this.memoryManager.dispose();
  }

  render() {
    // Only render visible nodes
    const visibleNodes = this.virtualizer.getVisibleNodes(
      this.props.nodes,
      this.state.viewport
    );

    return (
      <ReactFlow
        nodes={visibleNodes}
        // ... other props
      />
    );
  }
}
```

### 6. Performance Monitoring and Metrics

```typescript
// packages/core/performance/PerformanceMonitor.ts
export class PerformanceMetrics {
  private metrics: Map<string, MetricHistory> = new Map();
  private alerts: PerformanceAlert[] = [];

  startOperation(operationName: string): PerformanceTracker {
    return {
      operationName,
      startTime: performance.now(),
      startMemory: (performance as any).memory?.usedJSHeapSize || 0,

      end: () => {
        const endTime = performance.now();
        const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

        this.recordMetric(operationName, {
          duration: endTime - this.startTime,
          memoryDelta: endMemory - this.startMemory,
          timestamp: Date.now()
        });
      }
    };
  }

  recordMetric(name: string, metric: PerformanceData) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        samples: [],
        thresholds: this.getThresholds(name)
      });
    }

    const history = this.metrics.get(name)!;
    history.samples.push(metric);

    // Keep only recent samples
    if (history.samples.length > 1000) {
      history.samples = history.samples.slice(-500);
    }

    // Check for performance degradation
    this.checkThresholds(name, metric, history.thresholds);
  }

  private checkThresholds(
    name: string,
    metric: PerformanceData,
    thresholds: Thresholds
  ) {
    if (metric.duration > thresholds.maxDuration) {
      this.alerts.push({
        type: 'duration',
        operation: name,
        value: metric.duration,
        threshold: thresholds.maxDuration,
        timestamp: Date.now()
      });
    }
  }

  getPerformanceReport(): PerformanceReport {
    const report: PerformanceReport = {
      operations: {},
      alerts: this.alerts,
      summary: {
        avgNodeRenderTime: 0,
        avgEdgeCalculationTime: 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      }
    };

    this.metrics.forEach((history, name) => {
      const samples = history.samples;
      report.operations[name] = {
        count: samples.length,
        avgDuration:
          samples.reduce((sum, s) => sum + s.duration, 0) / samples.length,
        maxDuration: Math.max(...samples.map(s => s.duration)),
        p95Duration: this.calculatePercentile(
          samples.map(s => s.duration),
          0.95
        )
      };
    });

    return report;
  }
}
```

## Progressive Enhancement Approach

### Phase 1: Critical Path Optimization (Week 1)

```typescript
// Immediate performance wins
const phase1Optimizations = {
  'React.memo for nodes': 'Prevent unnecessary re-renders',
  'Debounced preview updates': 'Reduce computation during typing',
  'Virtual scrolling': 'Handle large node counts',
  'Edge path caching': 'Cache expensive calculations'
};
```

### Phase 2: Worker Integration (Week 2)

```typescript
// Offload heavy computations
const phase2Optimizations = {
  'Path calculation workers': 'Non-blocking edge routing',
  'Preview generation workers': 'Background preview updates',
  'Graph validation workers': 'Async validation'
};
```

### Phase 3: Advanced Optimizations (Week 3)

```typescript
// Sophisticated performance enhancements
const phase3Optimizations = {
  'R-Tree spatial indexing': 'O(log n) collision detection',
  'State normalization': 'Efficient data structures',
  'Memory pressure handling': 'Automatic cleanup'
};
```

## Implementation Timeline

### Week 1: Foundation

- [ ] Implement LRU cache for path calculations
- [ ] Add React.memo to all node components
- [ ] Implement debounced preview updates
- [ ] Add basic performance monitoring

### Week 2: Worker Integration

- [ ] Create worker pool infrastructure
- [ ] Move path calculations to workers
- [ ] Implement preview generation workers
- [ ] Add worker fallback for unsupported browsers

### Week 3: Advanced Features

- [ ] Implement R-Tree spatial indexing
- [ ] Add state normalization layer
- [ ] Implement memory management
- [ ] Add performance alerting

### Week 4: Testing & Optimization

- [ ] Performance benchmark suite
- [ ] Load testing with 5000+ nodes
- [ ] Memory leak detection
- [ ] Cross-browser compatibility testing

## Testing Strategy

### Performance Benchmarks

```typescript
describe('Performance Infrastructure', () => {
  test('Node rendering under 16ms for 1000 nodes', async () => {
    const graph = generateLargeGraph(1000);
    const startTime = performance.now();

    render(<Epic1GraphEditor nodes={graph.nodes} edges={graph.edges} />);

    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(16);
  });

  test('Edge calculation under 50ms for 1000 edges', async () => {
    const pathCalculator = new OptimizedPathCalculator();
    const edges = generateComplexEdges(1000);

    const startTime = performance.now();
    await pathCalculator.calculateAllPaths(edges);
    const calculationTime = performance.now() - startTime;

    expect(calculationTime).toBeLessThan(50);
  });
});
```

### Memory Testing

```typescript
test('Memory usage under 200MB for 5000 nodes', () => {
  const memoryBefore = (performance as any).memory.usedJSHeapSize;
  const graph = generateLargeGraph(5000);

  render(<Epic1GraphEditor nodes={graph.nodes} edges={graph.edges} />);

  const memoryAfter = (performance as any).memory.usedJSHeapSize;
  const memoryDelta = memoryAfter - memoryBefore;

  expect(memoryDelta).toBeLessThan(200 * 1024 * 1024);
});
```

## Monitoring and Metrics

### Key Performance Indicators

```typescript
const performanceKPIs = {
  nodeRenderTime: { target: '<16ms', alert: '>25ms' },
  edgeCalculationTime: { target: '<50ms', alert: '>100ms' },
  memoryUsage: { target: '<200MB', alert: '>400MB' },
  frameRate: { target: '60fps', alert: '<45fps' },
  initialLoadTime: { target: '<2s', alert: '>3s' }
};
```

### Real-time Dashboard

- Performance metrics visualization
- Memory usage graphs
- Frame rate monitoring
- Alert system for performance degradation

## Risk Assessment

### High-Risk Areas

1. **Worker Compatibility**: Fallback required for older browsers
2. **Memory Management**: Complex lifecycle management needed
3. **Cache Invalidation**: Risk of stale cached data

### Mitigation Strategies

1. **Feature Detection**: Progressive enhancement based on browser capabilities
2. **Graceful Degradation**: Fallback to synchronous operations
3. **Comprehensive Testing**: Memory leak detection and performance regression tests

## Conclusion

This performance infrastructure provides a comprehensive solution for handling large-scale graph editing with optimal user experience. The phased implementation approach ensures manageable development while delivering immediate performance improvements.

**Expected Performance Gains:**

- 80% reduction in node render time
- 70% reduction in edge calculation time
- 60% reduction in memory usage
- 90% improvement in frame rate stability
