/**
 * Dependency Resolver for Plugin Loader
 *
 * Handles dependency graph construction, topological sorting, circular dependency
 * detection, and version conflict resolution for plugin loading.
 *
 * Task: T-1752989144373-766 - Build plugin loader with version & dependency resolution
 */
import { ExtensionManifest, ExtensionVersionManager } from './ExtensionLifecycleManager';

}
}
export interface DependencyNode { id: string;
    version: string;
    dependencies: string[];
    dependents: string[];
    resolved: boolean;
    optional: boolean }
}
}
export interface DependencyGraph { nodes: Map<string, DependencyNode>;
    edges: Array<{
        from: string;
        to: string;
        optional: boolean }
}
    }>;
    resolved: boolean;
    conflicts: DependencyConflict[];
    circularDependencies: CircularDependency[];

}
}
export interface DependencyConflict { packageId: string;
    requiredVersions: Array<{
        requiredBy: string;
        versionRange: string }
}
    }>;
    resolution?: {
        selectedVersion: string;
        strategy: 'latest' | 'maxSatisfying' | 'manual'
  };

}
}
export interface CircularDependency { cycle: string[];
    breakable: boolean;
    suggestions: string[];

export type LoadOrder = string[] }
}
}
export interface DependencyResolutionOptions {
    allowOptionalDependencies: boolean;
    strictVersionMatching: boolean;
    allowPrerelease: boolean;
    maxDepth: number;
    resolutionStrategy: 'latest' | 'maxSatisfying' | 'conservative';
    allowCircularDependencies: boolean;

export declare class DependencyResolver {
    private versionManager;
    private options;
    private lastDependencyGraph?;
    private lastLoadOrder?;
    constructor(versionManager: ExtensionVersionManager, options?: Partial<DependencyResolutionOptions>);
    /**
     * Build dependency graph from plugin manifests
     */
    buildDependencyGraph(manifests: ExtensionManifest[]): DependencyGraph;
    /**
     * Resolve load order using topological sorting
     */
    resolveLoadOrder(graph: DependencyGraph): LoadOrder;
    /**
     * Detect circular dependencies in the graph
     */
    detectCircularDependencies(graph: DependencyGraph): CircularDependency[];
    /**
     * Detect version conflicts between dependencies
     */
    detectVersionConflicts(manifests: ExtensionManifest[]): DependencyConflict[];
    /**
     * Resolve version conflicts using specified strategy
     */
    resolveConflicts(graph: DependencyGraph, manifests: ExtensionManifest[]): void;
    /**
     * Get the last resolved dependency graph
     */
    getLastDependencyGraph(): DependencyGraph;
    /**
     * Get the last resolved load order
     */
    getLastLoadOrder(): LoadOrder;
    /**
     * Check if two version ranges are compatible
     */
    private areVersionRangesCompatible;
    /**
     * Find intersection of two version ranges
     */
    private intersectVersionRanges;
    /**
     * Resolve a specific version conflict
     */
    private resolveVersionConflict;
    /**
     * Check if a cycle can be broken by removing optional dependencies
     */
    private isCycleBreakable;
    /**
     * Check if an edge is optional
     */
    private isOptionalEdge;
    /**
     * Generate suggestions for resolving circular dependencies
     */
    private generateCircularDependencySuggestions;
    /**
     * Get available versions for a package
     * In a real implementation, this would query npm registry or plugin registry
     */
    private getAvailableVersions;

//# sourceMappingURL=DependencyResolver.d.ts.map
}
}