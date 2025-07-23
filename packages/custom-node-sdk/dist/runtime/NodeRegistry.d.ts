/**
 * @fileoverview NodeRegistry - Manages registration and discovery of custom node types
 * Thread-safe registry for custom nodes with validation and lifecycle management
 */
import { CustomNodeRegistry, CustomNodeRegistration } from '../types';
/**
 * Default implementation of the CustomNodeRegistry interface
 * Provides thread-safe registration and discovery of custom node types
 */
export declare class DefaultNodeRegistry implements CustomNodeRegistry {
    private nodes;
    private readonly mutex;
    /**
     * Register a new custom node type
     * @param registration The node registration information
     * @throws Error if node type is already registered or invalid
     */
    register(registration: CustomNodeRegistration): void;
    /**
     * Get a registered node type
     * @param nodeType The node type identifier
     * @returns The registration information or undefined if not found
     */
    get(nodeType: string): CustomNodeRegistration | undefined;
    /**
     * Get all registered node types
     * @returns Array of all registrations
     */
    getAll(): CustomNodeRegistration[];
    /**
     * Check if a node type is registered
     * @param nodeType The node type identifier
     * @returns True if the node type is registered
     */
    has(nodeType: string): boolean;
    /**
     * Unregister a node type
     * @param nodeType The node type identifier
     * @returns True if the node was unregistered, false if not found
     */
    unregister(nodeType: string): boolean;
    /**
     * Get nodes by category
     * @param category The node category to filter by
     * @returns Array of registrations in the specified category
     */
    getByCategory(category: string): CustomNodeRegistration[];
    /**
     * Get nodes by author
     * @param authorName The author name to filter by
     * @returns Array of registrations by the specified author
     */
    getByAuthor(authorName: string): CustomNodeRegistration[];
    /**
     * Search nodes by tags
     * @param tags Array of tags to search for
     * @param matchAll If true, node must have all tags; if false, any tag matches
     * @returns Array of registrations matching the tag criteria
     */
    searchByTags(tags: string[], matchAll?: boolean): CustomNodeRegistration[];
    /**
     * Get registry statistics
     * @returns Statistics about the registered nodes
     */
    getStats(): {
        totalNodes: number;
        categoriesCount: number;
        authorsCount: number;
        categories: Record<string, number>;
        authors: Record<string, number>;
    };
    /**
     * Bulk register multiple node types
     * @param registrations Array of registration information
     * @returns Array of successfully registered node types
     */
    registerBulk(registrations: CustomNodeRegistration[]): string[];
    /**
     * Clear all registered nodes (primarily for testing)
     */
    clear(): void;
    /**
     * Validate a node registration before adding it to the registry
     * @param registration The registration to validate
     * @throws Error if the registration is invalid
     */
    private validateRegistration;
}
/**
 * Global registry instance
 * Applications can use this default instance or create their own
 */
export declare const globalNodeRegistry: DefaultNodeRegistry;
//# sourceMappingURL=NodeRegistry.d.ts.map