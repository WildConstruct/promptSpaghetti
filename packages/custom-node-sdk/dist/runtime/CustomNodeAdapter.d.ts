/**
 * @fileoverview CustomNodeAdapter - Bridges custom nodes with PromptScape runtime
 * Wraps custom nodes to integrate with the AdvancedRuntimeNode system
 */
import { AdvancedRuntimeNode, AdvancedExecutionContext } from '@promptscape/core';
import { CustomNodeBase, CustomNodeConfig } from '../types';
/**
 * Adapter that wraps a custom node to integrate with PromptScape's runtime system
 */
export declare class CustomNodeAdapter extends AdvancedRuntimeNode {
    private customNode;
    private securityManager;
    private validationEngine;
    private customConfig;
    constructor(id: string, customNode: CustomNodeBase, customConfig: CustomNodeConfig);
    /**
     * Validate the custom node configuration
     */
    validate(): ValidationResult;
    /**
     * Execute the custom node within PromptScape's runtime context
     */
    run(ctx: AdvancedExecutionContext): Promise<unknown>;
    /**
     * Extract inputs from the execution context based on the node's schema
     */
    private extractInputs;
    /**
     * Create a CustomNodeRuntime instance for the custom node
     */
    private createCustomRuntime;
    /**
     * Format the output according to PromptScape conventions
     */
    private formatOutput;
    /**
     * Update execution statistics in the context
     */
    private updateExecutionStats;
    /**
     * Log execution errors with context
     */
    private logExecutionError;
    /**
     * Dispose of the custom node and clean up resources
     */
    dispose(): Promise<void>;
    /**
     * Get the custom node metadata for debugging
     */
    getCustomMetadata(): import("..").CustomNodeMetadata;
}
//# sourceMappingURL=CustomNodeAdapter.d.ts.map