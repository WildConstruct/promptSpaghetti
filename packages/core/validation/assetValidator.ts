/**
 * Asset File Validation Pipeline
 * Validates PSG and PSGLib files before they are added to the library
 */

import { PSGFileSchema } from '../fileFormats/psg';
import {
  PSGLibFileSchema
} from '../fileFormats/psglib';
import { nodeRegistry } from '../runtime/nodeRegistry';

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  metadata?: {
    format: 'psg' | 'psglib';
    version: string;
    nodeCount: number;
    edgeCount: number;
    nodeTypes: string[];
  };
}

/**
 * Validation error - blocks asset from being added
 */
export interface ValidationError {
  code: string;
  message: string;
  path?: string;
  details?: unknown;
}

/**
 * Validation warning - non-blocking issues
 */
export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
  details?: unknown;
}

/**
 * Validation suggestion - improvements
 */
export interface ValidationSuggestion {
  code: string;
  message: string;
  path?: string;
  recommendation: string;
}

/**
 * Error codes for validation
 */
export enum ValidationErrorCode {
  // JSON errors
  INVALID_JSON = 'INVALID_JSON',

  // Schema errors
  INVALID_SCHEMA = 'INVALID_SCHEMA',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_TYPE = 'INVALID_FIELD_TYPE',

  // Version errors
  UNSUPPORTED_VERSION = 'UNSUPPORTED_VERSION',
  VERSION_TOO_OLD = 'VERSION_TOO_OLD',
  VERSION_TOO_NEW = 'VERSION_TOO_NEW',

  // Node errors
  UNKNOWN_NODE_TYPE = 'UNKNOWN_NODE_TYPE',
  INVALID_NODE_ID = 'INVALID_NODE_ID',
  DUPLICATE_NODE_ID = 'DUPLICATE_NODE_ID',
  OUTPUT_IN_FRAGMENT = 'OUTPUT_IN_FRAGMENT',

  // Edge errors
  INVALID_EDGE_SOURCE = 'INVALID_EDGE_SOURCE',
  INVALID_EDGE_TARGET = 'INVALID_EDGE_TARGET',
  DUPLICATE_EDGE_ID = 'DUPLICATE_EDGE_ID',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',

  // Region errors
  INVALID_REGION_NODES = 'INVALID_REGION_NODES',
  EMPTY_REGION = 'EMPTY_REGION',

  // Port errors
  INVALID_PORT_DIRECTION = 'INVALID_PORT_DIRECTION',
  DUPLICATE_PORT_ID = 'DUPLICATE_PORT_ID'
}

/**
 * Warning codes
 */
export enum ValidationWarningCode {
  DEPRECATED_NODE_TYPE = 'DEPRECATED_NODE_TYPE',
  MISSING_DESCRIPTION = 'MISSING_DESCRIPTION',
  MISSING_AUTHOR = 'MISSING_AUTHOR',
  DISCONNECTED_NODE = 'DISCONNECTED_NODE',
  UNUSED_VARIABLE = 'UNUSED_VARIABLE',
  LARGE_FILE_SIZE = 'LARGE_FILE_SIZE',
  MIXED_NAMING_CONVENTION = 'MIXED_NAMING_CONVENTION'
}

/**
 * Main asset validator class
 */
export class AssetValidator {
  private nodeRegistry = nodeRegistry;

  /**
   * Validate an asset file (auto-detects format)
   */
  async validate(content: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Step 1: Parse JSON
    let data: unknown;
    try {
      data = JSON.parse(content);
    } catch (e) {
      errors.push({
        code: ValidationErrorCode.INVALID_JSON,
        message: 'Invalid JSON format',
        details: e
      });
      return { valid: false, errors, warnings, suggestions };
    }

    // Step 2: Detect format
    const format = this.detectFormat(data);
    if (!format) {
      errors.push({
        code: ValidationErrorCode.INVALID_SCHEMA,
        message: 'Unknown file format - not PSG or PSGLib'
      });
      return { valid: false, errors, warnings, suggestions };
    }

    // Step 3: Validate based on format
    if (format === 'psglib') {
      return this.validatePSGLib(data);
    } else {
      return this.validatePSG(data);
    }
  }

  /**
   * Validate PSG format file
   */
  private validatePSG(data: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Schema validation
    const schemaResult = PSGFileSchema.safeParse(data);
    if (!schemaResult.success) {
      schemaResult.error.errors.forEach(err => {
        errors.push({
          code: ValidationErrorCode.INVALID_SCHEMA,
          message: err.message,
          path: err.path.join('.'),
          details: err
        });
      });
      return { valid: false, errors, warnings, suggestions };
    }

    const psgFile = schemaResult.data;

    // Version validation
    const versionErrors = this.validateVersion(psgFile.version, '1.0.0');
    errors.push(...versionErrors);

    // Node validation
    const nodeResults = this.validateNodes(
      psgFile.nodes,
      psgFile.metadata?.type === 'MULTI-ASPECT'
    );
    errors.push(...nodeResults.errors);
    warnings.push(...nodeResults.warnings);

    // Edge validation
    const edgeResults = this.validateEdges(psgFile.edges, psgFile.nodes);
    errors.push(...edgeResults.errors);
    warnings.push(...edgeResults.warnings);

    // Region validation
    if (psgFile.regions) {
      const regionResults = this.validateRegions(
        psgFile.regions,
        psgFile.nodes
      );
      errors.push(...regionResults.errors);
      warnings.push(...regionResults.warnings);
    }

    // Suggestions
    if (!psgFile.description) {
      suggestions.push({
        code: 'ADD_DESCRIPTION',
        message: 'Consider adding a description',
        recommendation:
          'Add a description field to help users understand this fragment'
      });
    }

    // Metadata
    const metadata = {
      format: 'psg' as const,
      version: psgFile.version,
      nodeCount: psgFile.nodes.length,
      edgeCount: psgFile.edges.length,
      nodeTypes: [...new Set(psgFile.nodes.map(n => n.type))]
    };

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      metadata
    };
  }

  /**
   * Validate PSGLib format file
   */
  private validatePSGLib(data: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Schema validation
    const schemaResult = PSGLibFileSchema.safeParse(data);
    if (!schemaResult.success) {
      schemaResult.error.errors.forEach(err => {
        errors.push({
          code: ValidationErrorCode.INVALID_SCHEMA,
          message: err.message,
          path: err.path.join('.'),
          details: err
        });
      });
      return { valid: false, errors, warnings, suggestions };
    }

    const psgLibFile = schemaResult.data;

    // Version validation
    const versionErrors = this.validateVersion(
      psgLibFile.formatVersion,
      '1.0.0'
    );
    errors.push(...versionErrors);

    // Node validation (PSGLib uses different format)
    const nodeResults = this.validatePSGLibNodes(
      psgLibFile.graph.nodes,
      psgLibFile.metadata.isFragment
    );
    errors.push(...nodeResults.errors);
    warnings.push(...nodeResults.warnings);

    // Edge validation
    const edgeResults = this.validatePSGLibEdges(
      psgLibFile.graph.edges,
      psgLibFile.graph.nodes
    );
    errors.push(...edgeResults.errors);
    warnings.push(...edgeResults.warnings);

    // Metadata validation
    if (
      !psgLibFile.metadata.author ||
      psgLibFile.metadata.author === 'Unknown'
    ) {
      warnings.push({
        code: ValidationWarningCode.MISSING_AUTHOR,
        message: 'Author field is missing or set to "Unknown"'
      });
    }

    // Suggestions
    if (psgLibFile.metadata.tags.length === 0) {
      suggestions.push({
        code: 'ADD_TAGS',
        message: 'Consider adding tags for better discoverability',
        recommendation: 'Add relevant tags to help users find this preset'
      });
    }

    // Metadata
    const metadata = {
      format: 'psglib' as const,
      version: psgLibFile.formatVersion,
      nodeCount: psgLibFile.graph.nodes.length,
      edgeCount: psgLibFile.graph.edges.length,
      nodeTypes: psgLibFile.metadata.nodeTypes
    };

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      metadata
    };
  }

  /**
   * Validate nodes (PSG format)
   */
  private validateNodes(
    nodes: unknown[],
    isFragment: boolean
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const nodeIds = new Set<string>();

    nodes.forEach((node, index) => {
      // Check for duplicate IDs
      if (nodeIds.has(node.id)) {
        errors.push({
          code: ValidationErrorCode.DUPLICATE_NODE_ID,
          message: `Duplicate node ID: ${node.id}`,
          path: `nodes[${index}]`
        });
      }
      nodeIds.add(node.id);

      // Check for Output nodes in fragments
      if (isFragment && node.type === 'Output') {
        errors.push({
          code: ValidationErrorCode.OUTPUT_IN_FRAGMENT,
          message: 'Fragments should not contain Output nodes',
          path: `nodes[${index}]`,
          details: { nodeId: node.id }
        });
      }

      // Validate node type exists in registry
      const nodeType = this.nodeRegistry.getByPsgType(node.type);
      if (!nodeType) {
        warnings.push({
          code: ValidationWarningCode.DEPRECATED_NODE_TYPE,
          message: `Unknown node type: ${node.type}. This may be a custom or future node type.`,
          path: `nodes[${index}]`,
          details: { nodeType: node.type }
        });
      } else if (nodeType.deprecated) {
        warnings.push({
          code: ValidationWarningCode.DEPRECATED_NODE_TYPE,
          message: `Node type ${node.type} is deprecated. Use ${nodeType.replacedBy} instead.`,
          path: `nodes[${index}]`
        });
      }

      // Check for valid coordinates
      if (typeof node.x !== 'number' || typeof node.y !== 'number') {
        errors.push({
          code: ValidationErrorCode.INVALID_FIELD_TYPE,
          message: 'Node must have numeric x and y coordinates',
          path: `nodes[${index}]`
        });
      }
    });

    return { errors, warnings };
  }

  /**
   * Validate nodes (PSGLib format)
   */
  private validatePSGLibNodes(
    nodes: unknown[],
    isFragment?: boolean
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const nodeIds = new Set<string>();

    nodes.forEach((node, index) => {
      // Check for duplicate IDs
      if (nodeIds.has(node.id)) {
        errors.push({
          code: ValidationErrorCode.DUPLICATE_NODE_ID,
          message: `Duplicate node ID: ${node.id}`,
          path: `graph.nodes[${index}]`
        });
      }
      nodeIds.add(node.id);

      // Check for Output nodes in fragments
      if (isFragment && node.type === 'output') {
        errors.push({
          code: ValidationErrorCode.OUTPUT_IN_FRAGMENT,
          message: 'Fragments should not contain Output nodes',
          path: `graph.nodes[${index}]`,
          details: { nodeId: node.id }
        });
      }

      // Validate node type exists in registry (PSGLib uses React Flow types)
      const nodeType = this.nodeRegistry.getByReactFlowType(node.type);
      if (!nodeType && node.type !== 'enhancedBoundingBox') {
        warnings.push({
          code: ValidationWarningCode.DEPRECATED_NODE_TYPE,
          message: `Unknown node type: ${node.type}. This may be a custom or future node type.`,
          path: `graph.nodes[${index}]`,
          details: { nodeType: node.type }
        });
      } else if (nodeType?.deprecated) {
        warnings.push({
          code: ValidationWarningCode.DEPRECATED_NODE_TYPE,
          message: `Node type ${node.type} is deprecated. Use ${nodeType.replacedBy} instead.`,
          path: `graph.nodes[${index}]`
        });
      }

      // Check for valid position
      if (
        !node.position ||
        typeof node.position.x !== 'number' ||
        typeof node.position.y !== 'number'
      ) {
        errors.push({
          code: ValidationErrorCode.INVALID_FIELD_TYPE,
          message: 'Node must have position object with numeric x and y',
          path: `graph.nodes[${index}]`
        });
      }
    });

    return { errors, warnings };
  }

  /**
   * Validate edges (PSG format)
   */
  private validateEdges(
    edges: unknown[],
    nodes: unknown[]
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const edgeIds = new Set<string>();
    const nodeIds = new Set(nodes.map(n => n.id));
    const connectedNodes = new Set<string>();

    edges.forEach((edge, index) => {
      // Check for duplicate IDs
      if (edgeIds.has(edge.id)) {
        errors.push({
          code: ValidationErrorCode.DUPLICATE_EDGE_ID,
          message: `Duplicate edge ID: ${edge.id}`,
          path: `edges[${index}]`
        });
      }
      edgeIds.add(edge.id);

      // Validate source exists
      if (!nodeIds.has(edge.source)) {
        errors.push({
          code: ValidationErrorCode.INVALID_EDGE_SOURCE,
          message: `Edge source node does not exist: ${edge.source}`,
          path: `edges[${index}]`
        });
      }

      // Validate target exists
      if (!nodeIds.has(edge.target)) {
        errors.push({
          code: ValidationErrorCode.INVALID_EDGE_TARGET,
          message: `Edge target node does not exist: ${edge.target}`,
          path: `edges[${index}]`
        });
      }

      // Track connected nodes
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    // Check for disconnected nodes
    nodes.forEach(node => {
      if (!connectedNodes.has(node.id) && node.type !== 'Output') {
        warnings.push({
          code: ValidationWarningCode.DISCONNECTED_NODE,
          message: `Node ${node.id} is not connected to any edges`,
          details: { nodeId: node.id }
        });
      }
    });

    // Check for circular dependencies
    const cycles = this.detectCycles(edges);
    if (cycles.length > 0) {
      errors.push({
        code: ValidationErrorCode.CIRCULAR_DEPENDENCY,
        message: 'Graph contains circular dependencies',
        details: { cycles }
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate edges (PSGLib format)
   */
  private validatePSGLibEdges(
    edges: unknown[],
    nodes: unknown[]
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    // Similar to validateEdges but with PSGLib path structure
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const nodeIds = new Set(nodes.map(n => n.id));

    edges.forEach((edge, index) => {
      if (!nodeIds.has(edge.source)) {
        errors.push({
          code: ValidationErrorCode.INVALID_EDGE_SOURCE,
          message: `Edge source node does not exist: ${edge.source}`,
          path: `graph.edges[${index}]`
        });
      }

      if (!nodeIds.has(edge.target)) {
        errors.push({
          code: ValidationErrorCode.INVALID_EDGE_TARGET,
          message: `Edge target node does not exist: ${edge.target}`,
          path: `graph.edges[${index}]`
        });
      }
    });

    return { errors, warnings };
  }

  /**
   * Validate regions
   */
  private validateRegions(
    regions: unknown[],
    nodes: unknown[]
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const nodeIds = new Set(nodes.map(n => n.id));

    regions.forEach((region, index) => {
      // Check if region is empty
      if (!region.nodes || region.nodes.length === 0) {
        warnings.push({
          code: ValidationWarningCode.DISCONNECTED_NODE,
          message: `Region ${region.name} contains no nodes`,
          path: `regions[${index}]`
        });
      }

      // Validate all nodes in region exist
      region.nodes?.forEach((nodeId: string) => {
        if (!nodeIds.has(nodeId)) {
          errors.push({
            code: ValidationErrorCode.INVALID_REGION_NODES,
            message: `Region references non-existent node: ${nodeId}`,
            path: `regions[${index}].nodes`
          });
        }
      });

      // Validate ports if present
      if (region.ports) {
        const portIds = new Set<string>();
        region.ports.forEach((port: unknown, portIndex: number) => {
          if (portIds.has(port.id)) {
            errors.push({
              code: ValidationErrorCode.DUPLICATE_PORT_ID,
              message: `Duplicate port ID in region: ${port.id}`,
              path: `regions[${index}].ports[${portIndex}]`
            });
          }
          portIds.add(port.id);

          if (port.direction !== 'input' && port.direction !== 'output') {
            errors.push({
              code: ValidationErrorCode.INVALID_PORT_DIRECTION,
              message: `Invalid port direction: ${port.direction}`,
              path: `regions[${index}].ports[${portIndex}]`
            });
          }
        });
      }
    });

    return { errors, warnings };
  }

  /**
   * Validate version compatibility
   */
  private validateVersion(
    version: string,
    currentVersion: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Parse versions
    const versionParts = version.split('.').map(Number);
    const currentParts = currentVersion.split('.').map(Number);

    if (versionParts.length !== 3) {
      errors.push({
        code: ValidationErrorCode.UNSUPPORTED_VERSION,
        message: `Invalid version format: ${version}. Expected semantic versioning (x.y.z)`
      });
      return errors;
    }

    const [major] = versionParts;
    const [currentMajor] = currentParts;

    // Check major version compatibility
    if (major > currentMajor) {
      errors.push({
        code: ValidationErrorCode.VERSION_TOO_NEW,
        message: `File version ${version} is newer than supported version ${currentVersion}`
      });
    } else if (major < currentMajor - 1) {
      errors.push({
        code: ValidationErrorCode.VERSION_TOO_OLD,
        message: `File version ${version} is too old. Minimum supported version is ${currentMajor - 1}.0.0`
      });
    }

    return errors;
  }

  /**
   * Detect format from data
   */
  private detectFormat(data: unknown): 'psg' | 'psglib' | null {
    if (data.fileType === 'psglib') {
      return 'psglib';
    }
    if (data.version && data.nodes && data.edges) {
      return 'psg';
    }
    return null;
  }

  /**
   * Detect circular dependencies in edges
   */
  private detectCycles(edges: unknown[]): string[][] {
    const adjacency = new Map<string, Set<string>>();

    // Build adjacency list
    edges.forEach(edge => {
      if (!adjacency.has(edge.source)) {
        adjacency.set(edge.source, new Set());
      }
      adjacency.get(edge.source)?.add(edge.target);
    });

    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack: string[] = [];

    function dfs(node: string): boolean {
      visited.add(node);
      recursionStack.push(node);

      const neighbors = adjacency.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            return true;
          }
        } else if (recursionStack.includes(neighbor)) {
          // Found a cycle
          const cycleStart = recursionStack.indexOf(neighbor);
          cycles.push(recursionStack.slice(cycleStart));
          return true;
        }
      }

      recursionStack.pop();
      return false;
    }

    // Check all nodes
    for (const [node] of adjacency) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }
}

// Export singleton validator
export const assetValidator = new AssetValidator();

/**
 * Validate an asset file
 */
export async function validateAsset(
  content: string
): Promise<ValidationResult> {
  return assetValidator.validate(content);
}

/**
 * Format validation result as readable message
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push('✅ Asset validation passed');
  } else {
    lines.push('❌ Asset validation failed');
  }

  if (result.metadata) {
    lines.push(
      `\nFormat: ${result.metadata.format.toUpperCase()} v${result.metadata.version}`
    );
    lines.push(
      `Nodes: ${result.metadata.nodeCount}, Edges: ${result.metadata.edgeCount}`
    );
    lines.push(`Node Types: ${result.metadata.nodeTypes.join(', ')}`);
  }

  if (result.errors.length > 0) {
    lines.push('\n🚫 Errors:');
    result.errors.forEach(error => {
      lines.push(`  - ${error.message} [${error.code}]`);
      if (error.path) {
        lines.push(`    at: ${error.path}`);
      }
    });
  }

  if (result.warnings.length > 0) {
    lines.push('\n⚠️  Warnings:');
    result.warnings.forEach(warning => {
      lines.push(`  - ${warning.message} [${warning.code}]`);
    });
  }

  if (result.suggestions.length > 0) {
    lines.push('\n💡 Suggestions:');
    result.suggestions.forEach(suggestion => {
      lines.push(`  - ${suggestion.message}`);
      lines.push(`    ${suggestion.recommendation}`);
    });
  }

  return lines.join('\n');
}
