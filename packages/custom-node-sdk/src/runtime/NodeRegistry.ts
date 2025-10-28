/**
 * @fileoverview NodeRegistry - Manages registration and discovery of custom node types
 * Thread-safe registry for custom nodes with validation and lifecycle management
 */

import {
  CustomNodeRegistry,
  CustomNodeRegistration,
  CustomNodeMetadata
} from '../types';

/**
 * Default implementation of the CustomNodeRegistry interface
 * Provides thread-safe registration and discovery of custom node types
 */
export class DefaultNodeRegistry implements CustomNodeRegistry {
  private nodes = new Map<string, CustomNodeRegistration>();
  private readonly mutex = new Map<string, Promise<void>>();

  /**
   * Register a new custom node type
   * @param registration The node registration information
   * @throws Error if node type is already registered or invalid
   */
  register(registration: CustomNodeRegistration): void {
    const nodeType = registration.metadata.type;

    // Validate the registration
    this.validateRegistration(registration);

    // Check for conflicts
    if (this.nodes.has(nodeType)) {
      throw new Error(`Node type '${nodeType}' is already registered`);
    }

    // Register the node
    this.nodes.set(nodeType, registration);

    console.debug(
      `Registered custom node type: ${nodeType} v${registration.metadata.version}`
    );
  }

  /**
   * Get a registered node type
   * @param nodeType The node type identifier
   * @returns The registration information or undefined if not found
   */
  get(nodeType: string): CustomNodeRegistration | undefined {
    return this.nodes.get(nodeType);
  }

  /**
   * Get all registered node types
   * @returns Array of all registrations
   */
  getAll(): CustomNodeRegistration[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Check if a node type is registered
   * @param nodeType The node type identifier
   * @returns True if the node type is registered
   */
  has(nodeType: string): boolean {
    return this.nodes.has(nodeType);
  }

  /**
   * Unregister a node type
   * @param nodeType The node type identifier
   * @returns True if the node was unregistered, false if not found
   */
  unregister(nodeType: string): boolean {
    const existed = this.nodes.has(nodeType);
    if (existed) {
      this.nodes.delete(nodeType);
      console.debug(`Unregistered custom node type: ${nodeType}`);
    }
    return existed;
  }

  /**
   * Get nodes by category
   * @param category The node category to filter by
   * @returns Array of registrations in the specified category
   */
  getByCategory(category: string): CustomNodeRegistration[] {
    return this.getAll().filter(reg => reg.metadata.category === category);
  }

  /**
   * Get nodes by author
   * @param authorName The author name to filter by
   * @returns Array of registrations by the specified author
   */
  getByAuthor(authorName: string): CustomNodeRegistration[] {
    return this.getAll().filter(reg => reg.metadata.author.name === authorName);
  }

  /**
   * Search nodes by tags
   * @param tags Array of tags to search for
   * @param matchAll If true, node must have all tags; if false, any tag matches
   * @returns Array of registrations matching the tag criteria
   */
  searchByTags(tags: string[], matchAll = false): CustomNodeRegistration[] {
    return this.getAll().filter(reg => {
      if (!reg.metadata.tags) return false;

      if (matchAll) {
        return tags.every(tag => reg.metadata.tags!.includes(tag));
      } else {
        return tags.some(tag => reg.metadata.tags!.includes(tag));
      }
    });
  }

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
  } {
    const registrations = this.getAll();
    const categories = new Map<string, number>();
    const authors = new Map<string, number>();

    for (const reg of registrations) {
      // Count categories
      const category = reg.metadata.category;
      categories.set(category, (categories.get(category) || 0) + 1);

      // Count authors
      const author = reg.metadata.author.name;
      authors.set(author, (authors.get(author) || 0) + 1);
    }

    return {
      totalNodes: registrations.length,
      categoriesCount: categories.size,
      authorsCount: authors.size,
      categories: Object.fromEntries(categories),
      authors: Object.fromEntries(authors)
    };
  }

  /**
   * Bulk register multiple node types
   * @param registrations Array of registration information
   * @returns Array of successfully registered node types
   */
  registerBulk(registrations: CustomNodeRegistration[]): string[] {
    const registered: string[] = [];
    const errors: string[] = [];

    for (const registration of registrations) {
      try {
        this.register(registration);
        registered.push(registration.metadata.type);
      } catch (error) {
        errors.push(
          `${registration.metadata.type}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    if (errors.length > 0) {
      console.warn('Failed to register some node types:', errors);
    }

    return registered;
  }

  /**
   * Clear all registered nodes (primarily for testing)
   */
  clear(): void {
    this.nodes.clear();
    console.debug('Cleared all registered custom node types');
  }

  /**
   * Validate a node registration before adding it to the registry
   * @param registration The registration to validate
   * @throws Error if the registration is invalid
   */
  private validateRegistration(registration: CustomNodeRegistration): void {
    const { metadata, nodeClass, schema } = registration;

    // Validate metadata
    if (!metadata.type || typeof metadata.type !== 'string') {
      throw new Error('Node type must be a non-empty string');
    }

    if (!/^[a-zA-Z0-9.-]+$/.test(metadata.type)) {
      throw new Error(
        'Node type must contain only alphanumeric characters, dots, and hyphens'
      );
    }

    if (!metadata.displayName || typeof metadata.displayName !== 'string') {
      throw new Error('Display name must be a non-empty string');
    }

    if (!metadata.version || typeof metadata.version !== 'string') {
      throw new Error('Version must be a non-empty string');
    }

    if (!metadata.author || !metadata.author.name) {
      throw new Error('Author name is required');
    }

    if (!metadata.category || typeof metadata.category !== 'string') {
      throw new Error('Category must be a non-empty string');
    }

    // Validate node class
    if (typeof nodeClass !== 'function') {
      throw new Error('Node class must be a constructor function');
    }

    // Validate schema
    if (!schema || typeof schema !== 'object') {
      throw new Error('Schema is required and must be an object');
    }

    if (!schema.inputs || typeof schema.inputs !== 'object') {
      throw new Error('Schema must define inputs');
    }

    if (!schema.outputs || typeof schema.outputs !== 'object') {
      throw new Error('Schema must define outputs');
    }

    // Validate input specifications
    for (const [inputName, inputSpec] of Object.entries(schema.inputs)) {
      if (!inputSpec.type) {
        throw new Error(`Input '${inputName}' must specify a type`);
      }

      if (typeof inputSpec.required !== 'boolean') {
        throw new Error(`Input '${inputName}' must specify if it's required`);
      }
    }

    // Validate output specifications
    for (const [outputName, outputSpec] of Object.entries(schema.outputs)) {
      if (!outputSpec.type) {
        throw new Error(`Output '${outputName}' must specify a type`);
      }
    }
  }
}

/**
 * Global registry instance
 * Applications can use this default instance or create their own
 */
export const globalNodeRegistry = new DefaultNodeRegistry();
