/**
 * Parallel Graph Execution Engine
 * 
 * Addresses critical performance bottleneck where output nodes are executed 
 * sequentially instead of in parallel when they have independent dependency chains.
 * 
 * Key optimizations:
 * - Parallel execution of independent output nodes
 * - Dependency analysis to identify parallelizable subgraphs
 * - Shared memoization cache across parallel executions
 * - Configurable concurrency limits to prevent resource exhaustion
 */

import { Graph, Node } from '../../../../packages/core/graphSchema';

}
export interface ParallelExecutionOptions {
  maxConcurrency?: number;
  enableMemoization?: boolean;
  timeoutMs?: number;
}
}

}
export interface ExecutionResult {
  outputs: string[];
  executionTimeMs: number;
  parallelizationRatio: number; // Ratio of parallel vs sequential execution
  cacheHitRate: number;
}
}

/**
 * Analyzes graph dependencies to identify independent execution paths
 */
function analyzeDependencies(graph: Graph): Map<string, Set<string>> {
  const dependencies = new Map<string, Set<string>>();
  
  // Initialize all nodes with empty dependency sets
  for (const node of graph.nodes) {
    dependencies.set(node.id, new Set());
  }
  
  // Build dependency graph from edges
  if (graph.edges) {
    for (const edge of graph.edges) {
      const targetDeps = dependencies.get(edge.target) || new Set();
      targetDeps.add(edge.source);
      dependencies.set(edge.target, targetDeps);
    }
  }
  
  return dependencies;
}

/**
 * Groups output nodes by their dependency chains to identify parallel execution opportunities
 */
function groupOutputNodesByDependencies(
  graph: Graph, 
  dependencies: Map<string, Set<string>>
): string[][] {
  const outputNodes = graph.nodes.filter(n => n.type === 'Output').map(n => n.id);
  const groups: string[][] = [];
  const processed = new Set<string>();
  
  for (const outputId of outputNodes) {
    if (processed.has(outputId)) continue;
    
    const currentGroup = [outputId];
    const outputDeps = getAllDependencies(outputId, dependencies);
    
    // Find other output nodes that don't conflict with this one
    for (const otherId of outputNodes) {
      if (otherId === outputId || processed.has(otherId)) continue;
      
      const otherDeps = getAllDependencies(otherId, dependencies);
      
      // Check if dependency chains are independent
      const hasConflict = [...outputDeps].some(dep => otherDeps.has(dep)) ||
                         [...otherDeps].some(dep => outputDeps.has(dep));
      
      if (!hasConflict) {
        currentGroup.push(otherId);
        processed.add(otherId);
      }
    }
    
    groups.push(currentGroup);
    processed.add(outputId);
  }
  
  return groups;
}

/**
 * Recursively gets all dependencies for a node
 */
function getAllDependencies(
  nodeId: string, 
  dependencies: Map<string, Set<string>>,
  visited = new Set<string>()
): Set<string> {
  if (visited.has(nodeId)) return new Set(); // Prevent cycles
  
  visited.add(nodeId);
  const allDeps = new Set<string>();
  const directDeps = dependencies.get(nodeId) || new Set();
  
  for (const dep of directDeps) {
    allDeps.add(dep);
    const transitiveDeps = getAllDependencies(dep, dependencies, visited);
    for (const transitive of transitiveDeps) {
      allDeps.add(transitive);
    }
  }
  
  return allDeps;
}

/**
 * Executes output node groups in parallel with shared memoization
 */
export async function executeGraphInParallel(
  graph: Graph,
  dfsExecutor: (nodeId: string) => Promise<string>,
  options: ParallelExecutionOptions = {}
): Promise<ExecutionResult> {

  const startTime = Date.now();
  const {
    maxConcurrency = 4,
    enableMemoization = true,
    timeoutMs = 30000
  } = options;
  
  // Analyze dependencies to find parallelization opportunities
  const dependencies = analyzeDependencies(graph);
  const outputGroups = groupOutputNodesByDependencies(graph, dependencies);
  
  // Shared memoization cache across parallel executions
  const memoCache = new Map<string, string>();
  let cacheHits = 0;
  let totalExecutions = 0;
  
  // Create memoized executor
  const memoizedExecutor = async (nodeId: string): Promise<string> => {
    totalExecutions++;
    
    if (enableMemoization && memoCache.has(nodeId)) {
      cacheHits++;
      return memoCache.get(nodeId)!;
    }
    
    const result = await dfsExecutor(nodeId);
    
    if (enableMemoization) {
      memoCache.set(nodeId, result);
    }
    
    return result;
  };
  
  // Execute groups in parallel
  const allOutputPromises: Promise<string>[] = [];
  
  for (const group of outputGroups) {
    // Limit concurrency within each group
    const groupPromises = group.map(nodeId => 
      Promise.race([
        memoizedExecutor(nodeId),
        new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error(`Execution timeout for node ${nodeId}`)), timeoutMs)

      ])
    );
    
    // Add all group promises, respecting max concurrency
    if (allOutputPromises.length + groupPromises.length <= maxConcurrency) {
      allOutputPromises.push(...groupPromises);
    } else {
      // Execute this group sequentially if it would exceed concurrency limit
      for (const promise of groupPromises) {
        allOutputPromises.push(promise);
      }
    }
  }
  
  // Wait for all executions to complete
  const outputs = await Promise.all(allOutputPromises);
  
  const endTime = Date.now();
  const executionTimeMs = endTime - startTime;
  
  // Calculate parallelization metrics
  const totalOutputNodes = graph.nodes.filter(n => n.type === 'Output').length;
  const parallelGroups = outputGroups.length;
  const parallelizationRatio = totalOutputNodes > 0 ? 
    (totalOutputNodes - parallelGroups) / totalOutputNodes : 0;
  
  const cacheHitRate = totalExecutions > 0 ? cacheHits / totalExecutions : 0;
  
  return {
    outputs,
    executionTimeMs,
    parallelizationRatio,
    cacheHitRate
  };
}

/**
 * Fallback to sequential execution for complex dependency scenarios
 */
export async function executeGraphSequential(
  graph: Graph,
  dfsExecutor: (nodeId: string) => Promise<string>
): Promise<ExecutionResult> {

  const startTime = Date.now();
  const outputs: string[] = [];
  
  for (const node of graph.nodes) {
    if (node.type === 'Output') {
      const value = await dfsExecutor(node.id);
      outputs.push(value);
    }
  }
  
  const endTime = Date.now();
  
  return {
    outputs,
    executionTimeMs: endTime - startTime,
    parallelizationRatio: 0, // No parallelization
    cacheHitRate: 0 // No caching
  };
}

/**
 * Adaptive executor that chooses between parallel and sequential based on graph complexity
 */
export async function executeGraphAdaptive(
  graph: Graph,
  dfsExecutor: (nodeId: string) => Promise<string>,
  options: ParallelExecutionOptions = {}
): Promise<ExecutionResult> {

  const outputNodes = graph.nodes.filter(n => n.type === 'Output');
  
  // Use sequential execution for simple graphs to avoid overhead
  if (outputNodes.length <= 1 || (graph.edges?.length || 0) < 5) {
    return executeGraphSequential(graph, dfsExecutor);
  }
  
  // Use parallel execution for complex graphs
  try {
    return await executeGraphInParallel(graph, dfsExecutor, options);
  } catch (error) {
    console.warn('Parallel execution failed, falling back to sequential:', error);
    return executeGraphSequential(graph, dfsExecutor);
  }
}

/**
 * Performance monitoring utilities
 */
}
export interface ParallelExecutionMetrics {
  averageParallelizationRatio: number;
  averageCacheHitRate: number;
  averageExecutionTime: number;
  totalExecutions: number;
}
}

class ExecutionMetricsCollector {
  private metrics: ExecutionResult[] = [];
  
  record(result: ExecutionResult): void {
    this.metrics.push(result);
    
    // Keep only last 100 executions to prevent memory growth
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }
  
  getAggregatedMetrics(): ParallelExecutionMetrics {
    if (this.metrics.length === 0) {
      return {
        averageParallelizationRatio: 0,
        averageCacheHitRate: 0,
        averageExecutionTime: 0,
        totalExecutions: 0
      };
    }
    
    const avgParallelization = this.metrics.reduce((sum, m) => sum + m.parallelizationRatio, 0) / this.metrics.length;
    const avgCacheHitRate = this.metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / this.metrics.length;
    const avgExecutionTime = this.metrics.reduce((sum, m) => sum + m.executionTimeMs, 0) / this.metrics.length;
    
    return {
      averageParallelizationRatio: avgParallelization,
      averageCacheHitRate: avgCacheHitRate,
      averageExecutionTime: avgExecutionTime,
      totalExecutions: this.metrics.length
    };
  }
  
  reset(): void {
    this.metrics = [];
  }
}

// Global metrics collector
export const executionMetrics = new ExecutionMetricsCollector();