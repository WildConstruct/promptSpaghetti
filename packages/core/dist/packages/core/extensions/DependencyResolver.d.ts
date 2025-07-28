/**
 * Dependency Resolver for Plugin Loader
 *
 * Handles dependency graph construction, topological sorting, circular dependency
 * detection, and version conflict resolution for plugin loading.
 *
 * Task: T-1752989144373-766 - Build plugin loader with version & dependency resolution
 */
import { ExtensionVersionManager } from './ExtensionLifecycleManager';
export interface DependencyNode {
    id: string;
    version: string;
    dependencies: string;
    dependents: string;
    resolved: boolean;
    optional: boolean;
}
export interface DependencyGraph {
    nodes: Map<string, DependencyNode>;
    edges: Array<{
        from: string;
        to: string;
        optional: boolean;
    }>;
    resolved: boolean;
    conflicts: DependencyConflict;
    circularDependencies: CircularDependency;
}
export interface DependencyConflict {
    packageId: string;
    requiredVersions: Array<{}, requiredBy>;
    string: any;
    versionRange: string;
}
export interface CircularDependency {
    cycle: string;
    breakable: boolean;
    suggestions: string;
}
export type LoadOrder = string;
export interface DependencyResolutionOptions {
    allowOptionalDependencies: boolean;
    strictVersionMatching: boolean;
    allowPrerelease: boolean;
    maxDepth: number;
    resolutionStrategy: 'latest' | 'maxSatisfying' | 'conservative';
    allowCircularDependencies: boolean;
}
export declare class DependencyResolver {
    private versionManager;
    private options;
    private lastDependencyGraph?;
    private lastLoadOrder?;
    constructor();
    versionManager: ExtensionVersionManager;
    options: Partial<DependencyResolutionOptions>;
}
//# sourceMappingURL=DependencyResolver.d.ts.map