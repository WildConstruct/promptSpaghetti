/**
 * Worker Pool Manager for offloading heavy computations
 * Part of Story 0.1: Performance Infrastructure
 */

export interface WorkerTask<T = unknown> {
  id?: string;
  type: string;
  data: T;
  priority?: number;
}

export interface WorkerResult<T = unknown> {
  id: string;
  type: string;
  data: T;
  error?: string;
}

interface QueueItem<T = unknown> {
  task: WorkerTask<T>;
  resolve: (value: WorkerResult<T>) => void;
  reject: (error: Error) => void;
  priority: number;
  timestamp: number;
}

interface WorkerInfo {
  worker: Worker;
  busy: boolean;
  currentTask?: string;
}

/**
 * Edge data interface for path calculation
 */
interface EdgeData {
  edge: {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  };
}

/**
 * Path calculation result interface
 */
interface PathResult {
  path: string;
  length: number;
}

/**
 * Group data interface for bounds calculation
 */
interface GroupData {
  group: {
    nodeIds: string[];
  };
  nodes: Array<{
    id: string;
    position: { x: number; y: number };
  }>;
}

/**
 * Group bounds result interface
 */
interface GroupBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class WorkerPool<T = unknown> {
  private static instance: WorkerPool<unknown>;
  private workers: WorkerInfo[] = [];
  private queue: QueueItem<T>[] = [];
  private maxWorkers: number;
  private workerScript: string | null = null;
  private fallbackMode = false;
  private stats = {
    tasksProcessed: 0,
    tasksQueued: 0,
    errors: 0,
    averageTime: 0,
    totalTime: 0
  };

  private constructor(maxWorkers?: number) {
    this.maxWorkers =
      maxWorkers ||
      (typeof navigator !== 'undefined'
        ? navigator.hardwareConcurrency || 4
        : 4);

    // Check if Workers are available
    if (typeof Worker === 'undefined') {
      console.warn('Web Workers not available, using fallback mode');
      this.fallbackMode = true;
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(maxWorkers?: number): WorkerPool {
    if (!WorkerPool.instance) {
      WorkerPool.instance = new WorkerPool(maxWorkers);
    }
    return WorkerPool.instance;
  }

  /**
   * Initialize the worker pool with a worker script
   */
  async initialize(workerScriptUrl?: string): Promise<void> {
    if (this.fallbackMode) {return;}

    // Use provided URL or create inline worker
    this.workerScript = workerScriptUrl || this.createInlineWorkerScript();

    // Create initial workers (start with half capacity)
    const initialWorkers = Math.ceil(this.maxWorkers / 2);
    for (let i = 0; i < initialWorkers; i++) {
      this.createWorker();
    }
  }

  /**
   * Execute a task in the worker pool
   */
  async execute(task: WorkerTask<T>): Promise<T> {
    // Generate task ID if not provided
    if (!task.id) {
      task.id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Fallback mode - execute synchronously
    if (this.fallbackMode) {
      return this.executeFallback(task);
    }

    return new Promise((resolve, reject) => {
      const queueItem: QueueItem = {
        task,
        resolve,
        reject,
        priority: task.priority || 0,
        timestamp: Date.now()
      };

      // Add to queue
      this.enqueue(queueItem);
      this.stats.tasksQueued++;

      // Try to process immediately
      this.processQueue();
    });
  }

  /**
   * Add task to priority queue
   */
  private enqueue(item: QueueItem): void {
    // Insert based on priority (higher priority first)
    let inserted = false;
    for (let i = 0; i < this.queue.length; i++) {
      if (item.priority > this.queue[i].priority) {
        this.queue.splice(i, 0, item);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this.queue.push(item);
    }
  }

  /**
   * Process queued tasks
   */
  private processQueue(): void {
    if (this.queue.length === 0) {return;}

    // Find available worker
    let availableWorker = this.workers.find(w => !w.busy);

    // Create new worker if needed and under limit
    if (!availableWorker && this.workers.length < this.maxWorkers) {
      availableWorker = this.createWorker();
    }

    if (!availableWorker) {return;}

    // Get next task from queue
    const queueItem = this.queue.shift();
    if (!queueItem) {return;}

    // Mark worker as busy
    availableWorker.busy = true;
    availableWorker.currentTask = queueItem.task.id;

    const startTime = Date.now();

    // Set up message handler
    const messageHandler = (event: MessageEvent) => {
      if (event.data.id !== queueItem.task.id) {return;}

      // Clean up
      availableWorker.worker.removeEventListener('message', messageHandler);
      availableWorker.worker.removeEventListener('error', errorHandler);
      availableWorker.busy = false;
      availableWorker.currentTask = undefined;

      // Update stats
      const duration = Date.now() - startTime;
      this.updateStats(duration, false);

      // Resolve promise
      if (event.data.error) {
        queueItem.reject(new Error(event.data.error));
      } else {
        queueItem.resolve(event.data.data);
      }

      // Process next item in queue
      this.processQueue();
    };

    const errorHandler = (error: ErrorEvent) => {
      // Clean up
      availableWorker.worker.removeEventListener('message', messageHandler);
      availableWorker.worker.removeEventListener('error', errorHandler);
      availableWorker.busy = false;
      availableWorker.currentTask = undefined;

      // Update stats
      this.updateStats(Date.now() - startTime, true);

      // Reject promise
      queueItem.reject(error);

      // Process next item in queue
      this.processQueue();
    };

    // Set up handlers
    availableWorker.worker.addEventListener('message', messageHandler);
    availableWorker.worker.addEventListener('error', errorHandler);

    // Send task to worker
    availableWorker.worker.postMessage(queueItem.task);
  }

  /**
   * Create a new worker
   */
  private createWorker(): WorkerInfo {
    if (!this.workerScript) {
      this.workerScript = this.createInlineWorkerScript();
    }

    const worker = new Worker(this.workerScript);
    const workerInfo: WorkerInfo = {
      worker,
      busy: false
    };

    this.workers.push(workerInfo);
    return workerInfo;
  }

  /**
   * Create inline worker script
   */
  private createInlineWorkerScript(): string {
    const workerCode = `
      // Generic worker for graph calculations
      self.addEventListener('message', async (event) => {
        const { id, type, data } = event.data;
        
        try {
          let result;
          
          switch (type) {
            case 'CALCULATE_PATH':
              result = calculatePath(data);
              break;
              
            case 'CALCULATE_GROUP_BOUNDS':
              result = calculateGroupBounds(data);
              break;
              
            case 'VALIDATE_GROUP_HIERARCHY':
              result = validateGroupHierarchy(data);
              break;
              
            case 'CALCULATE_GROUPED_NODES':
              result = calculateGroupedNodes(data);
              break;
              
            case 'OPTIMIZE_EDGE_ROUTING':
              result = optimizeEdgeRouting(data);
              break;
              
            default:
              throw new Error('Unknown task type: ' + type);
          }
          
          self.postMessage({ id, type, data: result });
        } catch (error) {
          self.postMessage({ id, type, error: error.message });
        }
      });

      // Path calculation for edges
      function calculatePath(data) {
        const { edge, controlPoints } = data;
        
        if (!controlPoints || controlPoints.length === 0) {
          // Simple path
          return {
            path: \`M \${edge.sourceX},\${edge.sourceY} L \${edge.targetX},\${edge.targetY}\`,
            length: Math.sqrt(
              Math.pow(edge.targetX - edge.sourceX, 2) + 
              Math.pow(edge.targetY - edge.sourceY, 2)
            )
          };
        }
        
        // Complex bezier path
        let path = \`M \${edge.sourceX},\${edge.sourceY}\`;
        const points = [
          { x: edge.sourceX, y: edge.sourceY },
          ...controlPoints,
          { x: edge.targetX, y: edge.targetY }
        ];
        
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const next = points[i + 1];
          
          if (next) {
            const cp1x = prev.x + (curr.x - prev.x) * 0.5;
            const cp1y = prev.y + (curr.y - prev.y) * 0.5;
            const cp2x = curr.x + (next.x - curr.x) * 0.5;
            const cp2y = curr.y + (next.y - curr.y) * 0.5;
            
            path += \` C \${cp1x},\${cp1y} \${cp2x},\${cp2y} \${curr.x},\${curr.y}\`;
          } else {
            path += \` L \${curr.x},\${curr.y}\`;
          }
        }
        
        return { path, length: calculatePathLength(points) };
      }

      // Calculate group bounds
      function calculateGroupBounds(data) {
        const { group, nodes } = data;
        const groupNodes = nodes.filter(n => group.nodeIds.includes(n.id));
        
        if (groupNodes.length === 0) {
          return { x: 0, y: 0, width: 0, height: 0 };
        }
        
        const xs = groupNodes.map(n => n.position.x);
        const ys = groupNodes.map(n => n.position.y);
        const rights = groupNodes.map(n => n.position.x + (n.width || 150));
        const bottoms = groupNodes.map(n => n.position.y + (n.height || 50));
        
        return {
          x: Math.min(...xs) - 20,
          y: Math.min(...ys) - 40,
          width: Math.max(...rights) - Math.min(...xs) + 40,
          height: Math.max(...bottoms) - Math.min(...ys) + 60
        };
      }

      // Validate group hierarchy
      function validateGroupHierarchy(data) {
        const { groups, maxDepth } = data;
        const groupMap = new Map(groups);
        const errors = [];
        const warnings = [];
        
        // Check for circular dependencies
        for (const [id, group] of groupMap) {
          const visited = new Set();
          let current = group;
          let depth = 0;
          
          while (current.parentGroupId) {
            if (visited.has(current.parentGroupId)) {
              errors.push(\`Circular dependency detected: \${id}\`);
              break;
            }
            
            visited.add(current.parentGroupId);
            current = groupMap.get(current.parentGroupId);
            depth++;
            
            if (depth > maxDepth) {
              errors.push(\`Group \${id} exceeds max depth of \${maxDepth}\`);
              break;
            }
            
            if (!current) {
              warnings.push(\`Orphaned group: \${id} references non-existent parent\`);
              break;
            }
          }
        }
        
        return { valid: errors.length === 0, errors, warnings };
      }

      // Calculate grouped nodes
      function calculateGroupedNodes(data) {
        const { nodes, groups } = data;
        const groupMap = new Map(groups);
        const visibleNodes = [];
        const hiddenNodeIds = new Set();
        
        // Find collapsed groups and their nodes
        for (const [id, group] of groupMap) {
          if (group.collapsed) {
            group.nodeIds.forEach(nodeId => hiddenNodeIds.add(nodeId));
            
            // Create collapsed group node
            const bounds = calculateGroupBounds({ group, nodes });
            visibleNodes.push({
              id: \`group-\${id}\`,
              type: 'groupNode',
              position: { x: bounds.x, y: bounds.y },
              data: { group, nodeCount: group.nodeIds.length },
              style: { width: Math.min(bounds.width, 300), height: 80 }
            });
          }
        }
        
        // Add non-hidden nodes
        for (const node of nodes) {
          if (!hiddenNodeIds.has(node.id)) {
            visibleNodes.push(node);
          }
        }
        
        return visibleNodes;
      }

      // Optimize edge routing
      function optimizeEdgeRouting(data) {
        const { edges, nodes } = data;
        const obstacles = nodes.map(node => ({
          x: node.position.x,
          y: node.position.y,
          width: node.width || 150,
          height: node.height || 50
        }));
        
        return edges.map(edge => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          
          if (!source || !target) return edge;
          
          // Simple A* pathfinding (simplified for demo)
          const path = findPath(source.position, target.position, obstacles);
          
          return {
            ...edge,
            controlPoints: path.slice(1, -1).map((point, i) => ({
              id: \`cp-\${i}\`,
              x: point.x,
              y: point.y,
              type: 'sharp'
            }))
          };
        });
      }

      // Helper functions
      function calculatePathLength(points) {
        let length = 0;
        for (let i = 1; i < points.length; i++) {
          const dx = points[i].x - points[i - 1].x;
          const dy = points[i].y - points[i - 1].y;
          length += Math.sqrt(dx * dx + dy * dy);
        }
        return length;
      }

      function findPath(start, end, obstacles) {
        // Simplified pathfinding - just returns direct path with midpoint
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        return [
          start,
          { x: midX, y: start.y },
          { x: midX, y: end.y },
          end
        ];
      }
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
  }

  /**
   * Fallback execution when Workers are not available
   */
  private async executeFallback<T>(task: WorkerTask): Promise<T> {
    // Simulate async execution
    await new Promise(resolve => setTimeout(resolve, 0));

    // Simple fallback implementations
    switch (task.type) {
      case 'CALCULATE_PATH':
        return this.calculatePathFallback(task.data) as T;

      case 'CALCULATE_GROUP_BOUNDS':
        return this.calculateGroupBoundsFallback(task.data) as T;

      default:
        throw new Error(`No worker fallback is registered for task type: ${task.type}`);
    }
  }

  private calculatePathFallback(data: EdgeData): PathResult {
    const { edge } = data;
    return {
      path: `M ${edge.sourceX},${edge.sourceY} L ${edge.targetX},${edge.targetY}`,
      length: Math.sqrt(
        Math.pow(edge.targetX - edge.sourceX, 2) +
          Math.pow(edge.targetY - edge.sourceY, 2)
      )
    };
  }

  private calculateGroupBoundsFallback(data: GroupData): GroupBounds {
    const { group, nodes } = data;
    const groupNodes = nodes.filter((n) => group.nodeIds.includes(n.id));

    if (groupNodes.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const xs = groupNodes.map((n) => n.position.x);
    const ys = groupNodes.map((n) => n.position.y);

    return {
      x: Math.min(...xs) - 20,
      y: Math.min(...ys) - 40,
      width: Math.max(...xs) - Math.min(...xs) + 40,
      height: Math.max(...ys) - Math.min(...ys) + 60
    };
  }

  /**
   * Update statistics
   */
  private updateStats(duration: number, error: boolean): void {
    if (error) {
      this.stats.errors++;
    } else {
      this.stats.tasksProcessed++;
      this.stats.totalTime += duration;
      this.stats.averageTime = this.stats.totalTime / this.stats.tasksProcessed;
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      ...this.stats,
      queueLength: this.queue.length,
      workerCount: this.workers.length,
      busyWorkers: this.workers.filter(w => w.busy).length,
      idleWorkers: this.workers.filter(w => !w.busy).length,
      maxWorkers: this.maxWorkers,
      fallbackMode: this.fallbackMode
    };
  }

  /**
   * Terminate all workers and clean up
   */
  terminate(): void {
    // Clear queue
    this.queue.forEach(item => {
      item.reject(new Error('Worker pool terminated'));
    });
    this.queue = [];

    // Terminate workers
    this.workers.forEach(workerInfo => {
      workerInfo.worker.terminate();
    });
    this.workers = [];

    // Clean up blob URL if created
    if (this.workerScript && this.workerScript.startsWith('blob:')) {
      URL.revokeObjectURL(this.workerScript);
    }
    this.workerScript = null;
  }

  /**
   * Get current queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Get number of busy workers
   */
  getBusyWorkers(): number {
    return this.workers.filter(w => w.busy).length;
  }
}
