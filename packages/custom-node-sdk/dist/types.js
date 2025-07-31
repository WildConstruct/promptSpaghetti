/**
 * @fileoverview Core types and interfaces for Custom Node SDK
 * Defines the contract for creating custom nodes and extensions
 */
/**
 * Base abstract class that all custom nodes must extend
 */
export class CustomNodeBase {
  config;
  nodeId;
  constructor(id, config) {
    this.nodeId = id;
    this.config = config;
  }
  /**
   * Get the node's metadata
   */
  getMetadata() {
    return this.config.metadata;
  }
  /**
   * Get the node's I/O schema
   */
  getSchema() {
    return this.config.schema;
  }
}
//# sourceMappingURL=types.js.map
