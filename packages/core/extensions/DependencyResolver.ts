/**
 * Dependency Resolver for Plugin Loader
 * 
 * Handles dependency graph construction, topological sorting, circular dependency
 * detection, and version conflict resolution for plugin loading.
 * 
 * Task: T-1752989144373-766 - Build plugin loader with version & dependency resolution
 */
import { ExtensionManifest, ExtensionVersionManager } from './ExtensionLifecycleManager';
import * as semver from 'semver';

export interface DependencyNode {
  id: string;
  version: string;
  dependencies: string[];
  dependents: string[];
  resolved: boolean;
  optional: boolean;
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  edges: Array<{ from: string; to: string; optional: boolean }>;
  resolved: boolean;
  conflicts: DependencyConflict[];
  circularDependencies: CircularDependency[];
}

export interface DependencyConflict {
  packageId: string;
  requiredVersions: Array<{,
    requiredBy: string;
    versionRange: string;
  }>;
  resolution?: {
    selectedVersion: string;
    strategy: 'latest' | 'maxSatisfying' | 'manual';
  };
}

export interface CircularDependency {
  cycle: string[];
  breakable: boolean;
  suggestions: string[];
}

export type LoadOrder = string[];

export interface DependencyResolutionOptions {
  allowOptionalDependencies: boolean;
  strictVersionMatching: boolean;
  allowPrerelease: boolean;
  maxDepth: number;
  resolutionStrategy: 'latest' | 'maxSatisfying' | 'conservative';
  allowCircularDependencies: boolean;
}

export class DependencyResolver {
  private versionManager: ExtensionVersionManager;
  private options: DependencyResolutionOptions;
  private lastDependencyGraph?: DependencyGraph;
  private lastLoadOrder?: LoadOrder;
  constructor();
    versionManager: ExtensionVersionManager,
    options: Partial<DependencyResolutionOptions> = {}
    this.versionManager = versionManager;
    this.options = {
      allowOptionalDependencies: true,
      strictVersionMatching: false,
      allowPrerelease: false,
      maxDepth: 10,
      resolutionStrategy: 'maxSatisfying',
      allowCircularDependencies: false,
      ...options
    };
  }
  /**
   * Build dependency graph from plugin manifests
   */
  buildDependencyGraph(manifests: ExtensionManifest[]): DependencyGraph {
    const graph: DependencyGraph = {
      nodes: new Map(),
      edges: [],
      resolved: false,
      conflicts: [],
      circularDependencies: [],
    };
    // Create nodes for all plugins
    for (const manifest of manifests) {
      const node: DependencyNode = {
        id: manifest.id,
        version: manifest.version,
        dependencies: [],
        dependents: [],
        resolved: false,
        optional: false,
      };
      // Add dependencies
      if (manifest.dependencies) {
        for (const [depId, versionRange] of Object.entries(manifest.dependencies)) {
          node.dependencies.push(depId);
          graph.edges.push({)
            from: manifest.id,
            to: depId,
            optional: false,
          });
        }
      }
      // Add optional dependencies
      if (manifest.optionalDependencies && this.options.allowOptionalDependencies) {
        for (const [depId, versionRange] of Object.entries(manifest.optionalDependencies)) {
          node.dependencies.push(depId);
          graph.edges.push({)
            from: manifest.id,
            to: depId,
            optional: true,
          });
        }
      }
      graph.nodes.set(manifest.id, node);
    }
    // Build dependents list
    for (const [nodeId, node] of graph.nodes) {
      for (const depId of node.dependencies) {
        const depNode = graph.nodes.get(depId);
        if (depNode) {
          depNode.dependents.push(nodeId);
        }
      }
    }
    // Detect circular dependencies
    graph.circularDependencies = this.detectCircularDependencies(graph);
    // Detect version conflicts
    graph.conflicts = this.detectVersionConflicts(manifests);
    // Resolve conflicts if possible
    this.resolveConflicts(graph, manifests);
    graph.resolved = graph.conflicts.length === 0 && 
                    (graph.circularDependencies.length === 0 || this.options.allowCircularDependencies);
    this.lastDependencyGraph = graph;
    return graph;
  }
  /**
   * Resolve load order using topological sorting
   */
  resolveLoadOrder(graph: DependencyGraph): LoadOrder {
    if (!graph.resolved) {
      throw new Error('Cannot resolve load order for unresolved dependency graph');
    }
    const loadOrder: LoadOrder = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const visit = (nodeId: string): void => {
      if (visited.has(nodeId)) {
        return;
      }
      if (visiting.has(nodeId)) {
        // Circular dependency - handle based on options
        if (!this.options.allowCircularDependencies) {
          throw new Error(`Circular dependency detected involving ${nodeId}`);}
        }
        return;
      }
      visiting.add(nodeId);
      const node = graph.nodes.get(nodeId);
      if (node) {
        // Visit dependencies first
        for (const depId of node.dependencies) {
          const depNode = graph.nodes.get(depId);
          if (depNode) {
            visit(depId);
          } else if (!this.isOptionalEdge(graph, nodeId, depId)) {
            throw new Error(`Missing dependency: ${depId} required by ${nodeId}`);}
          }
        }
        visiting.delete(nodeId);
        visited.add(nodeId);
        loadOrder.push(nodeId);
      }
    };
    // Start with nodes that have no dependents (leaf nodes in reverse dependency tree)
    const startNodes = Array.from(graph.nodes.keys()).filter(id => {)
      const node = graph.nodes.get(id)!;
      return node.dependencies.length === 0;
    });
    // If no leaf nodes, start with any unvisited node
    if (startNodes.length === 0) {
      startNodes.push(...graph.nodes.keys());
    }
    for (const nodeId of startNodes) {
      visit(nodeId);
    }
    // Visit any remaining unvisited nodes
    for (const nodeId of graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    }
    this.lastLoadOrder = loadOrder;
    return loadOrder;
  }
  /**
   * Detect circular dependencies in the graph
   */
  detectCircularDependencies(graph: DependencyGraph): CircularDependency[] {
    const circularDependencies: CircularDependency[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];
    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        // Found a cycle
        const cycleStart = path.indexOf(nodeId);
        const cycle = path.slice(cycleStart).concat([nodeId]);
        // Check if cycle is breakable (has optional dependencies)
        const breakable = this.isCycleBreakable(graph, cycle);
        circularDependencies.push({)
          cycle,
          breakable,
          suggestions: this.generateCircularDependencySuggestions(cycle),
        });
        return true;
      }
      if (visited.has(nodeId)) {
        return false;
      }
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);
      const node = graph.nodes.get(nodeId);
      if (node) {
        for (const depId of node.dependencies) {
          if (graph.nodes.has(depId)) {
            if (dfs(depId)) {
              return true; // Propagate cycle detection
            }
          }
        }
      }
      recursionStack.delete(nodeId);
      path.pop();
      return false;
    };
    for (const nodeId of graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId);
      }
    }
    return circularDependencies;
  }
  /**
   * Detect version conflicts between dependencies
   */
  detectVersionConflicts(manifests: ExtensionManifest[]): DependencyConflict[] {
    const conflicts: DependencyConflict[] = [];
    const dependencyVersions = new Map<string, Array<{
      requiredBy: string;
      versionRange: string;
    }>>();
    // Collect all version requirements
    for (const manifest of manifests) {
      if (manifest.dependencies) {
        for (const [depId, versionRange] of Object.entries(manifest.dependencies)) {
          if (!dependencyVersions.has(depId)) {
            dependencyVersions.set(depId, []);
          }
          dependencyVersions.get(depId)!.push({)
            requiredBy: manifest.id,
            versionRange
          });
        }
      }
    }
    // Check for conflicts
    for (const [depId, requirements] of dependencyVersions) {
      if (requirements.length > 1) {
        // Check if all version ranges are compatible
        const ranges = requirements.map(r => r.versionRange);
        if (!this.areVersionRangesCompatible(ranges)) {
          conflicts.push({)
            packageId: depId,
            requiredVersions: requirements,
          });
        }
      }
    }
    return conflicts;
  }
  /**
   * Resolve version conflicts using specified strategy
   */
  resolveConflicts(graph: DependencyGraph, manifests: ExtensionManifest[]): void {
    for (const conflict of graph.conflicts) {
      const resolution = this.resolveVersionConflict(conflict, manifests);
      if (resolution) {
        conflict.resolution = resolution;
      }
    }
  }
  /**
   * Get the last resolved dependency graph
   */
  getLastDependencyGraph(): DependencyGraph {
    return this.lastDependencyGraph || {
      nodes: new Map(),
      edges: [],
      resolved: false,
      conflicts: [],
      circularDependencies: [],
    };
  }
  /**
   * Get the last resolved load order
   */
  getLastLoadOrder(): LoadOrder {
    return this.lastLoadOrder || [];
  }
  /**
   * Check if two version ranges are compatible
   */
  private areVersionRangesCompatible(ranges: string[]): boolean {
    if (ranges.length <= 1) return true;
    try {
      // Find intersection of all ranges
      let intersection = ranges[0];
      for (let i = 1; i < ranges.length; i++) {
        intersection = this.intersectVersionRanges(intersection, ranges[i]);
        if (!intersection) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Find intersection of two version ranges
   */
  private intersectVersionRanges(range1: string, range2: string): string | null {
    try {
      // This is a simplified implementation
      // A full implementation would use a proper semver range intersection library
      const r1 = new semver.Range(range1);
      const r2 = new semver.Range(range2);
      // Check if ranges overlap by testing with common versions
      const testVersions = ['1.0.0', '2.0.0', '3.0.0', '1.1.0', '1.2.0'];
      const commonVersions = testVersions.filter(v => r1.test(v) && r2.test(v));
      if (commonVersions.length > 0) {
        // Return the more restrictive range (simple heuristic)
        return range1.length > range2.length ? range1 : range2;
      }
      return null;
    } catch {
      return null;
    }
  }
  /**
   * Resolve a specific version conflict
   */
  private resolveVersionConflict()
    conflict: DependencyConflict, 
    manifests: ExtensionManifest[],
  ): DependencyConflict['resolution'] | null {
    const availableVersions = this.getAvailableVersions(conflict.packageId);
    if (availableVersions.length === 0) {
      return null;
    }
    const ranges = conflict.requiredVersions.map(r => r.versionRange);
    let selectedVersion: string | null = null;
    switch (this.options.resolutionStrategy) {
    case 'latest':
      selectedVersion = availableVersions
        .filter(v => ranges.every(r => semver.satisfies(v, r)))
        .sort(semver.rcompare)[0] || null;
      break;
    case 'maxSatisfying':
      for (const range of ranges) {
        const maxSat = semver.maxSatisfying(availableVersions, range);
        if (maxSat && ranges.every(r => semver.satisfies(maxSat, r))) {
          selectedVersion = maxSat;
          break;
        }
      }
      break;
    case 'conservative':
      selectedVersion = availableVersions
        .filter(v => ranges.every(r => semver.satisfies(v, r)))
        .sort(semver.compare)[0] || null;
      break;
    }
    if (selectedVersion) {
      return {
        selectedVersion,
        strategy: this.options.resolutionStrategy,
      };
    }
    return null;
  }
  /**
   * Check if a cycle can be broken by removing optional dependencies
   */
  private isCycleBreakable(graph: DependencyGraph, cycle: string[]): boolean {
    for (let i = 0; i < cycle.length - 1; i++) {
      const from = cycle[i];
      const to = cycle[i + 1];
      if (this.isOptionalEdge(graph, from, to)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Check if an edge is optional
   */
  private isOptionalEdge(graph: DependencyGraph, from: string, to: string): boolean {
    return graph.edges.some(edge => )
      edge.from === from && edge.to === to && edge.optional
    );
  }
  /**
   * Generate suggestions for resolving circular dependencies
   */
  private generateCircularDependencySuggestions(cycle: string[]): string[] {
    const suggestions: string[] = [];
    suggestions.push(`Consider making one of the dependencies optional: ${cycle.join(' -> ')}`);}
    suggestions.push('Use dependency injection or event-based communication to break the cycle');
    suggestions.push('Refactor shared functionality into a separate module');
    return suggestions;
  }
  /**
   * Get available versions for a package
   * In a real implementation, this would query npm registry or plugin registry
   */
  private getAvailableVersions(packageId: string): string[] {
    // Simplified implementation - would normally query registries
    return ['1.0.0', '1.1.0', '1.2.0', '2.0.0', '2.1.0'];
  }
}