/**
 * Toggle Resolution Algorithm (Epic 17)
 * 
 * DEPLOYMENT BLOCKER FIX: Intelligent algorithm for feature toggle resolution
 * with advanced optimization, dependency handling, conflict resolution, and
 * performance-aware evaluation strategies.
 * 
 * Features:
 * - Multi-tier resolution strategies
 * - Dependency graph resolution
 * - Conflict detection and handling
 * - Performance-optimized evaluation
 * - Cache-aware resolution
 * - Circuit breaker pattern
 * - Rollback capabilities
 * - A/B testing optimization
 */

import { EventEmitter } from 'events';
import { 
  FeatureToggle,
  ToggleType,
  ToggleEvaluationContext,
  ToggleEvaluationResult,
  ToggleDependency,
  DependencyAnalysis
} from '../database/feature-toggle-models';
import { FeatureToggleService } from '../services/feature-toggle-service';
import { FeatureToggleDAO } from '../database/feature-toggle-dao';

// Core Algorithm Interfaces
export interface ToggleResolutionRequest {
  toggleKeys: string[];
  context: ToggleEvaluationContext;
  strategy?: ResolutionStrategy;
  maxDepth?: number;
  timeout?: number;
  includeMetadata?: boolean;
  enableCaching?: boolean;
  enableOptimizations?: boolean;
}

export interface ToggleResolutionResult {
  resolutions: Record<string, ToggleEvaluationResult>;
  metadata: ResolutionMetadata;
  performance: PerformanceMetrics;
  warnings: ResolutionWarning[];
  conflicts: ConflictReport[];
  dependencyGraph?: DependencyGraphNode[];
}

export interface ResolutionMetadata {
  strategy: ResolutionStrategy;
  totalToggleCount: number;
  resolvedToggleCount: number;
  skippedToggleCount: number;
  cacheHitCount: number;
  dependencyCount: number;
  resolutionTime: number;
  optimizationsApplied: string[];
}

export interface PerformanceMetrics {
  totalEvaluationTime: number;
  averageToggleTime: number;
  cacheHitRate: number;
  dependencyResolutionTime: number;
  conflictResolutionTime: number;
  memoryUsage: number;
  cpuTime: number;
  networkRequests: number;
}

export interface ResolutionWarning {
  type: 'dependency_cycle' | 'performance_degradation' | 'cache_miss' | 'timeout_risk' | 'conflict_detected';
  message: string;
  toggleKey: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  metadata?: Record<string, any>;
}

export interface ConflictReport {
  type: 'mutual_exclusion' | 'dependency_conflict' | 'version_mismatch' | 'rule_contradiction';
  toggleKeys: string[];
  description: string;
  resolution: 'auto_resolved' | 'manual_required' | 'fallback_applied';
  fallbackValue?: any;
  metadata?: Record<string, any>;
}

export interface DependencyGraphNode {
  toggleKey: string;
  dependencies: string[];
  dependents: string[];
  depth: number;
  evaluationOrder: number;
  hasCycles: boolean;
  criticalPath: boolean;
}

export enum ResolutionStrategy {
  SEQUENTIAL = 'sequential',           // Evaluate toggles one by one
  PARALLEL = 'parallel',               // Evaluate all toggles in parallel
  DEPENDENCY_AWARE = 'dependency_aware', // Resolve dependencies first
  PERFORMANCE_OPTIMIZED = 'performance_optimized', // Optimize for speed
  CONFLICT_MINIMIZED = 'conflict_minimized',       // Minimize conflicts
  CACHE_FIRST = 'cache_first',         // Prioritize cached results
  FAILFAST = 'failfast',               // Fail quickly on errors
  EVENTUAL_CONSISTENCY = 'eventual_consistency' // Allow temporary inconsistencies
}

export enum TogglePriority {
  SYSTEM = 1,        // System-critical toggles
  BUSINESS = 2,      // Business-critical toggles  
  FEATURE = 3,       // Feature toggles
  EXPERIMENT = 4,    // A/B test toggles
  DEBUG = 5          // Debug/development toggles
}

export interface ToggleResolutionConfig {
  maxConcurrency: number;
  cacheTimeout: number;
  circuitBreakerThreshold: number;
  dependencyDepthLimit: number;
  performanceThreshold: number;
  enableMetrics: boolean;
  enableCircuitBreaker: boolean;
  enableOptimizations: boolean;
  fallbackValues: Record<string, any>;
}

// Circuit Breaker for Resilience
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half_open' = 'closed';

  constructor(
    private threshold: number,
    private timeout: number
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half_open';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      if (this.state === 'half_open') {
        this.state = 'closed';
        this.failures = 0;
      }
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.threshold) {
        this.state = 'open';
      }
      
      throw error;
    }
  }

  getState(): string {
    return this.state;
  }
}

// Main Toggle Resolution Algorithm
export class ToggleResolutionAlgorithm extends EventEmitter {
  private circuitBreaker: CircuitBreaker;
  private performanceCache = new Map<string, PerformanceMetrics>();
  private dependencyCache = new Map<string, DependencyGraphNode[]>();
  
  constructor(
    private toggleService: FeatureToggleService,
    private toggleDAO: FeatureToggleDAO,
    private config: ToggleResolutionConfig = {
      maxConcurrency: 10,
      cacheTimeout: 300,
      circuitBreakerThreshold: 5,
      dependencyDepthLimit: 10,
      performanceThreshold: 1000,
      enableMetrics: true,
      enableCircuitBreaker: true,
      enableOptimizations: true,
      fallbackValues: {}
    }
  ) {
    super();
    this.circuitBreaker = new CircuitBreaker(
      config.circuitBreakerThreshold,
      30000 // 30 second timeout
    );
  }

  /**
   * Main resolution method - intelligently resolves multiple toggles
   */
  async resolveToggles(request: ToggleResolutionRequest): Promise<ToggleResolutionResult> {
    const startTime = Date.now();
    const strategy = request.strategy || ResolutionStrategy.DEPENDENCY_AWARE;
    
    try {
      // Initialize result structure
      const result: ToggleResolutionResult = {
        resolutions: {},
        metadata: {
          strategy,
          totalToggleCount: request.toggleKeys.length,
          resolvedToggleCount: 0,
          skippedToggleCount: 0,
          cacheHitCount: 0,
          dependencyCount: 0,
          resolutionTime: 0,
          optimizationsApplied: []
        },
        performance: {
          totalEvaluationTime: 0,
          averageToggleTime: 0,
          cacheHitRate: 0,
          dependencyResolutionTime: 0,
          conflictResolutionTime: 0,
          memoryUsage: 0,
          cpuTime: 0,
          networkRequests: 0
        },
        warnings: [],
        conflicts: []
      };

      // Build dependency graph if needed
      let dependencyGraph: DependencyGraphNode[] = [];
      if (strategy === ResolutionStrategy.DEPENDENCY_AWARE || request.includeMetadata) {
        const depStartTime = Date.now();
        dependencyGraph = await this.buildDependencyGraph(request.toggleKeys);
        result.performance.dependencyResolutionTime = Date.now() - depStartTime;
        result.dependencyGraph = dependencyGraph;
        result.metadata.dependencyCount = dependencyGraph.length;
      }

      // Detect conflicts
      const conflictStartTime = Date.now();
      const conflicts = await this.detectConflicts(request.toggleKeys, request.context);
      result.conflicts = conflicts;
      result.performance.conflictResolutionTime = Date.now() - conflictStartTime;

      // Apply resolution strategy
      const resolutions = await this.executeResolutionStrategy(
        request,
        dependencyGraph,
        conflicts,
        result
      );

      result.resolutions = resolutions;
      result.metadata.resolvedToggleCount = Object.keys(resolutions).length;
      result.metadata.skippedToggleCount = request.toggleKeys.length - result.metadata.resolvedToggleCount;
      result.metadata.resolutionTime = Date.now() - startTime;

      // Calculate performance metrics
      this.calculatePerformanceMetrics(result);

      // Generate warnings
      this.generateWarnings(request, result);

      // Emit events for monitoring
      this.emit('resolution_complete', {
        strategy,
        toggleCount: request.toggleKeys.length,
        duration: result.metadata.resolutionTime,
        cacheHitRate: result.performance.cacheHitRate
      });

      return result;

    } catch (error) {
      this.emit('resolution_error', {
        error: error.message,
        strategy,
        toggleKeys: request.toggleKeys
      });
      
      // Apply fallback strategy
      return this.applyFallbackStrategy(request, error);
    }
  }

  /**
   * Execute the chosen resolution strategy
   */
  private async executeResolutionStrategy(
    request: ToggleResolutionRequest,
    dependencyGraph: DependencyGraphNode[],
    conflicts: ConflictReport[],
    result: ToggleResolutionResult
  ): Promise<Record<string, ToggleEvaluationResult>> {
    switch (request.strategy || ResolutionStrategy.DEPENDENCY_AWARE) {
    case ResolutionStrategy.SEQUENTIAL:
      return this.sequentialResolution(request, result);

    case ResolutionStrategy.PARALLEL:
      return this.parallelResolution(request, result);

    case ResolutionStrategy.DEPENDENCY_AWARE:
      return this.dependencyAwareResolution(request, dependencyGraph, result);

    case ResolutionStrategy.PERFORMANCE_OPTIMIZED:
      return this.performanceOptimizedResolution(request, result);

    case ResolutionStrategy.CONFLICT_MINIMIZED:
      return this.conflictMinimizedResolution(request, conflicts, result);

    case ResolutionStrategy.CACHE_FIRST:
      return this.cacheFirstResolution(request, result);

    case ResolutionStrategy.FAILFAST:
      return this.failfastResolution(request, result);

    case ResolutionStrategy.EVENTUAL_CONSISTENCY:
      return this.eventualConsistencyResolution(request, result);

    default:
      return this.dependencyAwareResolution(request, dependencyGraph, result);
    }
  }

  /**
   * Sequential resolution - evaluate toggles one by one
   */
  private async sequentialResolution(
    request: ToggleResolutionRequest,
    result: ToggleResolutionResult
  ): Promise<Record<string, ToggleEvaluationResult>> {
    const resolutions: Record<string, ToggleEvaluationResult> = {};
    
    for (const toggleKey of request.toggleKeys) {
      try {
        const evaluation = await this.circuitBreaker.execute(() =>
          this.toggleService.evaluateToggle(toggleKey, request.context)
        );
        
        resolutions[toggleKey] = evaluation;
        
        if (evaluation.metadata?.cached) {
          result.metadata.cacheHitCount++;
        }
      } catch (error) {
        resolutions[toggleKey] = this.createErrorResult(toggleKey, error);
      }
    }

    return resolutions;
  }

  /**
   * Parallel resolution - evaluate all toggles concurrently
   */
  private async parallelResolution(
    request: ToggleResolutionRequest,
    result: ToggleResolutionResult
  ): Promise<Record<string, ToggleEvaluationResult>> {
    const resolutions: Record<string, ToggleEvaluationResult> = {};
    
    // Limit concurrency
    const batches = this.createBatches(request.toggleKeys, this.config.maxConcurrency);
    
    for (const batch of batches) {
      const promises = batch.map(async toggleKey => {
        try {
          const evaluation = await this.circuitBreaker.execute(() =>
            this.toggleService.evaluateToggle(toggleKey, request.context)
          );
          
          if (evaluation.metadata?.cached) {
            result.metadata.cacheHitCount++;
          }
          
          return { toggleKey, evaluation };
        } catch (error) {
          return { 
            toggleKey, 
            evaluation: this.createErrorResult(toggleKey, error)
          };
        }
      });
      
      const batchResults = await Promise.all(promises);
      for (const { toggleKey, evaluation } of batchResults) {
        resolutions[toggleKey] = evaluation;
      }
    }

    result.metadata.optimizationsApplied.push('parallel_execution');
    return resolutions;
  }

  /**
   * Dependency-aware resolution - resolve dependencies first
   */
  private async dependencyAwareResolution(
    request: ToggleResolutionRequest,
    dependencyGraph: DependencyGraphNode[],
    result: ToggleResolutionResult
  ): Promise<Record<string, ToggleEvaluationResult>> {
    const resolutions: Record<string, ToggleEvaluationResult> = {};
    
    // Sort by evaluation order (dependency resolution)
    const sortedNodes = [...dependencyGraph].sort((a, b) => a.evaluationOrder - b.evaluationOrder);
    
    // Group by depth for batch processing
    const depthGroups = new Map<number, DependencyGraphNode[]>();
    for (const node of sortedNodes) {
      if (!depthGroups.has(node.depth)) {
        depthGroups.set(node.depth, []);
      }
      depthGroups.get(node.depth)!.push(node);
    }

    // Process each depth level
    for (const [depth, nodes] of depthGroups) {
      const promises = nodes.map(async node => {
        try {
          // Check if dependencies are satisfied
          const dependenciesSatisfied = await this.checkDependenciesSatisfied(
            node.dependencies, 
            resolutions
          );

          if (!dependenciesSatisfied) {
            return {
              toggleKey: node.toggleKey,
              evaluation: this.createDependencyFailureResult(node.toggleKey, node.dependencies)
            };
          }

          const evaluation = await this.circuitBreaker.execute(() =>
            this.toggleService.evaluateToggle(node.toggleKey, request.context)
          );
          
          if (evaluation.metadata?.cached) {
            result.metadata.cacheHitCount++;
          }
          
          return { toggleKey: node.toggleKey, evaluation };
        } catch (error) {
          return { 
            toggleKey: node.toggleKey, 
            evaluation: this.createErrorResult(node.toggleKey, error)
          };
        }
      });
      
      const depthResults = await Promise.all(promises);
      for (const { toggleKey, evaluation } of depthResults) {
        resolutions[toggleKey] = evaluation;
      }
    }

    result.metadata.optimizationsApplied.push('dependency_resolution');
    return resolutions;
  }

  /**
   * Performance-optimized resolution - prioritize speed
   */
  private async performanceOptimizedResolution(
    request: ToggleResolutionRequest,
    result: ToggleResolutionResult
  ): Promise<Record<string, ToggleEvaluationResult>> {
    const resolutions: Record<string, ToggleEvaluationResult> = {};
    
    // Sort by performance characteristics
    const togglePerformance = await this.getTogglePerformanceData(request.toggleKeys);
    const sortedToggles = request.toggleKeys.sort((a, b) => {
      const perfA = togglePerformance.get(a) || { avgTime: 1000 };
      const perfB = togglePerformance.get(b) || { avgTime: 1000 };
      return perfA.avgTime - perfB.avgTime;
    });

    // Process fast toggles first, slower ones with higher concurrency
    const fastToggles = sortedToggles.filter(key => {
      const perf = togglePerformance.get(key);
      return (perf?.avgTime || 1000) < this.config.performanceThreshold;
    });

    const slowToggles = sortedToggles.filter(key => {
      const perf = togglePerformance.get(key);
      return (perf?.avgTime || 1000) >= this.config.performanceThreshold;
    });

    // Process fast toggles with high concurrency
    if (fastToggles.length > 0) {
      const fastResults = await this.parallelEvaluateWithConcurrency(
        fastToggles,
        request.context,
        this.config.maxConcurrency
      );
      Object.assign(resolutions, fastResults);
      
      result.metadata.cacheHitCount += Object.values(fastResults)
        .filter(r => r.metadata?.cached).length;
    }

    // Process slow toggles with lower concurrency but timeout protection
    if (slowToggles.length > 0) {
      const slowResults = await this.parallelEvaluateWithTimeout(
        slowToggles,
        request.context,
        request.timeout || 5000
      );
      Object.assign(resolutions, slowResults);
      
      result.metadata.cacheHitCount += Object.values(slowResults)
        .filter(r => r.metadata?.cached).length;
    }

    result.metadata.optimizationsApplied.push('performance_prioritization');
    return resolutions;
  }

  /**
   * Conflict-minimized resolution - handle conflicts intelligently
   */
  private async conflictMinimizedResolution(
    request: ToggleResolutionRequest,
    conflicts: ConflictReport[],
    result: ToggleResolutionResult
  ): Promise<Record<string, ToggleEvaluationResult>> {
    const resolutions: Record<string, ToggleEvaluationResult> = {};
    
    // Identify conflicted and non-conflicted toggles
    const conflictedKeys = new Set<string>();
    for (const conflict of conflicts) {
      conflict.toggleKeys.forEach(key => conflictedKeys.add(key));
    }

    const nonConflictedKeys = request.toggleKeys.filter(key => !conflictedKeys.has(key));
    const conflictedToggleKeys = Array.from(conflictedKeys);

    // Resolve non-conflicted toggles first in parallel
    if (nonConflictedKeys.length > 0) {
      const nonConflictedResults = await this.parallelEvaluateWithConcurrency(
        nonConflictedKeys,
        request.context,
        this.config.maxConcurrency
      );
      Object.assign(resolutions, nonConflictedResults);
    }

    // Handle conflicted toggles with resolution strategies
    for (const conflict of conflicts) {
      const conflictResolution = await this.resolveConflict(conflict, request.context);
      for (const [toggleKey, evaluation] of Object.entries(conflictResolution)) {
        resolutions[toggleKey] = evaluation;
      }
    }

    result.metadata.optimizationsApplied.push('conflict_resolution');
    return resolutions;
  }

  /**
   * Cache-first resolution - prioritize cached results
   */
  private async cacheFirstResolution(
    request: ToggleResolutionRequest,
    result: ToggleResolutionResult
  ): Promise<Record<string, ToggleEvaluationResult>> {
    const resolutions: Record<string, ToggleEvaluationResult> = {};
    const uncachedKeys: string[] = [];

    // First pass: get cached results
    for (const toggleKey of request.toggleKeys) {
      try {
        const toggle = await this.toggleDAO.getToggleByKey(toggleKey, request.context.orgId);
        if (toggle) {
          const cacheKey = this.generateCacheKey(toggle.id, request.context);
          const cachedResult = await this.toggleDAO.getCachedEvaluation(toggle.id, cacheKey);
          
          if (cachedResult) {
            resolutions[toggleKey] = {
              ...cachedResult,
              reason: 'Cache hit',
              metadata: { ...cachedResult.metadata, cached: true }
            };
            result.metadata.cacheHitCount++;
          } else {
            uncachedKeys.push(toggleKey);
          }
        } else {
          uncachedKeys.push(toggleKey);
        }
      } catch (error) {
        uncachedKeys.push(toggleKey);
      }
    }

    // Second pass: evaluate uncached toggles
    if (uncachedKeys.length > 0) {
      const uncachedResults = await this.parallelEvaluateWithConcurrency(
        uncachedKeys,
        request.context,
        this.config.maxConcurrency
      );
      Object.assign(resolutions, uncachedResults);
    }

    result.metadata.optimizationsApplied.push('cache_optimization');
    return resolutions;
  }

  /**
   * Fail-fast resolution - fail quickly on errors
   */
  private async failfastResolution(
    request: ToggleResolutionRequest,
    result: ToggleResolutionResult
  ): Promise<Record<string, ToggleEvaluationResult>> {
    const resolutions: Record<string, ToggleEvaluationResult> = {};
    const timeout = request.timeout || 2000;

    try {
      const evaluationPromise = Promise.all(
        request.toggleKeys.map(async toggleKey => {
          const evaluation = await this.toggleService.evaluateToggle(toggleKey, request.context);
          return { toggleKey, evaluation };
        })
      );

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Resolution timeout')), timeout);
      });

      const results = await Promise.race([evaluationPromise, timeoutPromise]);
      
      for (const { toggleKey, evaluation } of results) {
        resolutions[toggleKey] = evaluation;
        if (evaluation.metadata?.cached) {
          result.metadata.cacheHitCount++;
        }
      }

    } catch (error) {
      // Apply fallback values for all toggles
      for (const toggleKey of request.toggleKeys) {
        resolutions[toggleKey] = {
          enabled: false,
          value: this.config.fallbackValues[toggleKey] || false,
          reason: `Failfast fallback: ${error.message}`,
          metadata: { fallback: true, error: error.message }
        };
      }
    }

    result.metadata.optimizationsApplied.push('failfast_evaluation');
    return resolutions;
  }

  /**
   * Eventual consistency resolution - allow temporary inconsistencies
   */
  private async eventualConsistencyResolution(
    request: ToggleResolutionRequest,
    result: ToggleResolutionResult
  ): Promise<Record<string, ToggleEvaluationResult>> {
    const resolutions: Record<string, ToggleEvaluationResult> = {};

    // Start all evaluations without waiting
    const evaluationPromises = request.toggleKeys.map(async toggleKey => {
      try {
        const evaluation = await this.toggleService.evaluateToggle(toggleKey, request.context);
        return { toggleKey, evaluation, success: true };
      } catch (error) {
        return { 
          toggleKey, 
          evaluation: this.createErrorResult(toggleKey, error),
          success: false
        };
      }
    });

    // Use allSettled to get all results regardless of individual failures
    const results = await Promise.allSettled(evaluationPromises);
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { toggleKey, evaluation } = result.value;
        resolutions[toggleKey] = evaluation;
        
        if (evaluation.metadata?.cached) {
          result.metadata.cacheHitCount++;
        }
      } else {
        // This shouldn't happen with our current setup, but handle gracefully
        console.error('Unexpected rejection in eventual consistency resolution:', result.reason);
      }
    }

    result.metadata.optimizationsApplied.push('eventual_consistency');
    return resolutions;
  }

  // Helper Methods

  private async buildDependencyGraph(toggleKeys: string[]): Promise<DependencyGraphNode[]> {
    const cacheKey = toggleKeys.sort().join(':');
    if (this.dependencyCache.has(cacheKey)) {
      return this.dependencyCache.get(cacheKey)!;
    }

    const nodes: DependencyGraphNode[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    for (const toggleKey of toggleKeys) {
      await this.buildDependencyNode(toggleKey, nodes, visited, visiting, 0);
    }

    // Calculate evaluation order
    this.calculateEvaluationOrder(nodes);

    this.dependencyCache.set(cacheKey, nodes);
    return nodes;
  }

  private async buildDependencyNode(
    toggleKey: string,
    nodes: DependencyGraphNode[],
    visited: Set<string>,
    visiting: Set<string>,
    depth: number
  ): Promise<void> {
    if (visited.has(toggleKey)) return;
    if (visiting.has(toggleKey)) {
      // Cycle detected
      const existingNode = nodes.find(n => n.toggleKey === toggleKey);
      if (existingNode) {
        existingNode.hasCycles = true;
      }
      return;
    }

    visiting.add(toggleKey);

    try {
      const dependencies = await this.toggleDAO.getToggleDependencies(toggleKey);
      const dependents = await this.toggleDAO.getToggleDependents(toggleKey);

      const node: DependencyGraphNode = {
        toggleKey,
        dependencies: dependencies.map(d => d.childToggleId),
        dependents: dependents.map(d => d.parentToggleId),
        depth,
        evaluationOrder: 0, // Will be calculated later
        hasCycles: false,
        criticalPath: false
      };

      nodes.push(node);

      // Recursively build dependency nodes
      for (const dep of node.dependencies) {
        await this.buildDependencyNode(dep, nodes, visited, visiting, depth + 1);
      }

    } catch (error) {
      // Handle missing toggle gracefully
      const node: DependencyGraphNode = {
        toggleKey,
        dependencies: [],
        dependents: [],
        depth,
        evaluationOrder: 0,
        hasCycles: false,
        criticalPath: false
      };
      nodes.push(node);
    }

    visiting.delete(toggleKey);
    visited.add(toggleKey);
  }

  private calculateEvaluationOrder(nodes: DependencyGraphNode[]): void {
    // Topological sort for evaluation order
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();

    // Initialize
    for (const node of nodes) {
      inDegree.set(node.toggleKey, 0);
      graph.set(node.toggleKey, []);
    }

    // Build graph and calculate in-degrees
    for (const node of nodes) {
      for (const dep of node.dependencies) {
        if (graph.has(dep)) {
          graph.get(dep)!.push(node.toggleKey);
          inDegree.set(node.toggleKey, (inDegree.get(node.toggleKey) || 0) + 1);
        }
      }
    }

    // Topological sort
    const queue: string[] = [];
    const order: string[] = [];

    for (const [toggleKey, degree] of inDegree) {
      if (degree === 0) {
        queue.push(toggleKey);
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      order.push(current);

      for (const neighbor of graph.get(current) || []) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Assign evaluation order
    for (let i = 0; i < order.length; i++) {
      const node = nodes.find(n => n.toggleKey === order[i]);
      if (node) {
        node.evaluationOrder = i;
      }
    }
  }

  private async detectConflicts(
    toggleKeys: string[],
    context: ToggleEvaluationContext
  ): Promise<ConflictReport[]> {
    const conflicts: ConflictReport[] = [];

    // Get all toggle definitions
    const toggles = await Promise.all(
      toggleKeys.map(key => this.toggleDAO.getToggleByKey(key, context.orgId))
    );

    // Check for mutual exclusions
    for (let i = 0; i < toggles.length; i++) {
      for (let j = i + 1; j < toggles.length; j++) {
        const toggle1 = toggles[i];
        const toggle2 = toggles[j];
        
        if (toggle1 && toggle2) {
          const conflict = await this.checkMutualExclusion(toggle1, toggle2);
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }
    }

    return conflicts;
  }

  private async checkMutualExclusion(
    toggle1: FeatureToggle,
    toggle2: FeatureToggle
  ): Promise<ConflictReport | null> {
    // Check for explicit mutual exclusion rules
    const dependencies1 = await this.toggleDAO.getToggleDependencies(toggle1.key);
    const dependencies2 = await this.toggleDAO.getToggleDependencies(toggle2.key);

    const conflictDep1 = dependencies1.find(
      d => d.childToggleId === toggle2.key && d.dependencyType === 'conflicts'
    );
    
    const conflictDep2 = dependencies2.find(
      d => d.childToggleId === toggle1.key && d.dependencyType === 'conflicts'
    );

    if (conflictDep1 || conflictDep2) {
      return {
        type: 'mutual_exclusion',
        toggleKeys: [toggle1.key, toggle2.key],
        description: `Toggles ${toggle1.key} and ${toggle2.key} are mutually exclusive`,
        resolution: 'manual_required'
      };
    }

    return null;
  }

  private async resolveConflict(
    conflict: ConflictReport,
    context: ToggleEvaluationContext
  ): Promise<Record<string, ToggleEvaluationResult>> {
    const resolutions: Record<string, ToggleEvaluationResult> = {};

    switch (conflict.type) {
    case 'mutual_exclusion':
      // Resolve based on priority or first-wins strategy
      for (let i = 0; i < conflict.toggleKeys.length; i++) {
        const toggleKey = conflict.toggleKeys[i];
        if (i === 0) {
          // First toggle wins
          resolutions[toggleKey] = await this.toggleService.evaluateToggle(toggleKey, context);
        } else {
          // Others are disabled
          resolutions[toggleKey] = {
            enabled: false,
            value: false,
            reason: `Disabled due to mutual exclusion with ${conflict.toggleKeys[0]}`,
            metadata: { conflictResolution: true }
          };
        }
      }
      break;

    default:
      // Default: evaluate all and let the first one win
      for (const toggleKey of conflict.toggleKeys) {
        resolutions[toggleKey] = await this.toggleService.evaluateToggle(toggleKey, context);
      }
    }

    return resolutions;
  }

  private async checkDependenciesSatisfied(
    dependencies: string[],
    resolutions: Record<string, ToggleEvaluationResult>
  ): Promise<boolean> {
    for (const dep of dependencies) {
      const resolution = resolutions[dep];
      if (!resolution || !resolution.enabled) {
        return false;
      }
    }
    return true;
  }

  private async getTogglePerformanceData(
    toggleKeys: string[]
  ): Promise<Map<string, { avgTime: number; cacheHitRate: number }>> {
    const performanceData = new Map();

    for (const toggleKey of toggleKeys) {
      // Get historical performance data
      const cached = this.performanceCache.get(toggleKey);
      if (cached) {
        performanceData.set(toggleKey, {
          avgTime: cached.averageToggleTime,
          cacheHitRate: cached.cacheHitRate
        });
      } else {
        // Default performance assumptions
        performanceData.set(toggleKey, {
          avgTime: 100,
          cacheHitRate: 0.5
        });
      }
    }

    return performanceData;
  }

  private async parallelEvaluateWithConcurrency(
    toggleKeys: string[],
    context: ToggleEvaluationContext,
    maxConcurrency: number
  ): Promise<Record<string, ToggleEvaluationResult>> {
    const resolutions: Record<string, ToggleEvaluationResult> = {};
    const batches = this.createBatches(toggleKeys, maxConcurrency);

    for (const batch of batches) {
      const promises = batch.map(async toggleKey => {
        try {
          const evaluation = await this.circuitBreaker.execute(() =>
            this.toggleService.evaluateToggle(toggleKey, context)
          );
          return { toggleKey, evaluation };
        } catch (error) {
          return { 
            toggleKey, 
            evaluation: this.createErrorResult(toggleKey, error)
          };
        }
      });

      const batchResults = await Promise.all(promises);
      for (const { toggleKey, evaluation } of batchResults) {
        resolutions[toggleKey] = evaluation;
      }
    }

    return resolutions;
  }

  private async parallelEvaluateWithTimeout(
    toggleKeys: string[],
    context: ToggleEvaluationContext,
    timeout: number
  ): Promise<Record<string, ToggleEvaluationResult>> {
    const resolutions: Record<string, ToggleEvaluationResult> = {};

    const evaluationPromise = this.parallelEvaluateWithConcurrency(
      toggleKeys,
      context,
      Math.min(3, this.config.maxConcurrency) // Lower concurrency for slow toggles
    );

    const timeoutPromise = new Promise<Record<string, ToggleEvaluationResult>>((resolve) => {
      setTimeout(() => {
        const timeoutResolutions: Record<string, ToggleEvaluationResult> = {};
        for (const toggleKey of toggleKeys) {
          timeoutResolutions[toggleKey] = {
            enabled: false,
            value: this.config.fallbackValues[toggleKey] || false,
            reason: 'Evaluation timeout',
            metadata: { timeout: true, timeoutMs: timeout }
          };
        }
        resolve(timeoutResolutions);
      }, timeout);
    });

    return Promise.race([evaluationPromise, timeoutPromise]);
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private generateCacheKey(toggleId: string, context: ToggleEvaluationContext): string {
    // This should match the cache key generation in the toggle service
    const keyParts = [
      toggleId,
      context.userId || 'no-user',
      context.orgId || 'no-org',
      context.experimentId || 'no-experiment'
    ];
    
    if (context.userAttributes) {
      const sortedAttrs = Object.keys(context.userAttributes).sort()
        .map(key => `${key}:${context.userAttributes![key]}`)
        .join('|');
      keyParts.push(require('crypto').createHash('md5').update(sortedAttrs).digest('hex').substring(0, 8));
    }
    
    return keyParts.join(':');
  }

  private createErrorResult(toggleKey: string, error: any): ToggleEvaluationResult {
    return {
      enabled: false,
      value: this.config.fallbackValues[toggleKey] || false,
      reason: `Evaluation error: ${error.message}`,
      metadata: { 
        error: true, 
        errorMessage: error.message,
        fallback: true
      }
    };
  }

  private createDependencyFailureResult(toggleKey: string, dependencies: string[]): ToggleEvaluationResult {
    return {
      enabled: false,
      value: false,
      reason: `Dependencies not satisfied: ${dependencies.join(', ')}`,
      metadata: { 
        dependencyFailure: true, 
        missingDependencies: dependencies
      }
    };
  }

  private async applyFallbackStrategy(
    request: ToggleResolutionRequest,
    error: any
  ): Promise<ToggleResolutionResult> {
    const resolutions: Record<string, ToggleEvaluationResult> = {};
    
    for (const toggleKey of request.toggleKeys) {
      resolutions[toggleKey] = {
        enabled: false,
        value: this.config.fallbackValues[toggleKey] || false,
        reason: `Fallback due to resolution failure: ${error.message}`,
        metadata: { fallback: true, originalError: error.message }
      };
    }

    return {
      resolutions,
      metadata: {
        strategy: request.strategy || ResolutionStrategy.SEQUENTIAL,
        totalToggleCount: request.toggleKeys.length,
        resolvedToggleCount: request.toggleKeys.length,
        skippedToggleCount: 0,
        cacheHitCount: 0,
        dependencyCount: 0,
        resolutionTime: 0,
        optimizationsApplied: ['fallback_strategy']
      },
      performance: {
        totalEvaluationTime: 0,
        averageToggleTime: 0,
        cacheHitRate: 0,
        dependencyResolutionTime: 0,
        conflictResolutionTime: 0,
        memoryUsage: 0,
        cpuTime: 0,
        networkRequests: 0
      },
      warnings: [{
        type: 'performance_degradation',
        message: 'Resolution failed, fallback strategy applied',
        toggleKey: 'all',
        severity: 'critical',
        recommendation: 'Check system health and toggle configurations',
        metadata: { originalError: error.message }
      }],
      conflicts: []
    };
  }

  private calculatePerformanceMetrics(result: ToggleResolutionResult): void {
    const resolvedCount = Object.keys(result.resolutions).length;
    
    if (resolvedCount > 0) {
      result.performance.averageToggleTime = result.metadata.resolutionTime / resolvedCount;
      result.performance.cacheHitRate = (result.metadata.cacheHitCount / resolvedCount) * 100;
      result.performance.totalEvaluationTime = result.metadata.resolutionTime;
    }

    // Estimate memory usage (rough approximation)
    const estimatedMemory = JSON.stringify(result.resolutions).length * 2; // bytes
    result.performance.memoryUsage = estimatedMemory;
  }

  private generateWarnings(
    request: ToggleResolutionRequest,
    result: ToggleResolutionResult
  ): void {
    // Performance warnings
    if (result.performance.averageToggleTime > this.config.performanceThreshold) {
      result.warnings.push({
        type: 'performance_degradation',
        message: `Average toggle evaluation time (${result.performance.averageToggleTime}ms) exceeds threshold (${this.config.performanceThreshold}ms)`,
        toggleKey: 'all',
        severity: 'medium',
        recommendation: 'Consider enabling caching or using performance-optimized resolution strategy'
      });
    }

    // Cache hit rate warnings
    if (result.performance.cacheHitRate < 50) {
      result.warnings.push({
        type: 'cache_miss',
        message: `Low cache hit rate (${result.performance.cacheHitRate.toFixed(1)}%)`,
        toggleKey: 'all',
        severity: 'low',
        recommendation: 'Review cache TTL settings and consider cache warming strategies'
      });
    }

    // Dependency cycle warnings
    if (result.dependencyGraph) {
      const cycledNodes = result.dependencyGraph.filter(n => n.hasCycles);
      if (cycledNodes.length > 0) {
        result.warnings.push({
          type: 'dependency_cycle',
          message: `Dependency cycles detected in ${cycledNodes.length} toggles`,
          toggleKey: cycledNodes.map(n => n.toggleKey).join(','),
          severity: 'high',
          recommendation: 'Review and resolve dependency cycles to improve resolution reliability'
        });
      }
    }

    // Conflict warnings
    if (result.conflicts.length > 0) {
      result.warnings.push({
        type: 'conflict_detected',
        message: `${result.conflicts.length} conflicts detected during resolution`,
        toggleKey: 'multiple',
        severity: 'medium',
        recommendation: 'Review toggle configurations to minimize conflicts'
      });
    }
  }
}

export default ToggleResolutionAlgorithm;