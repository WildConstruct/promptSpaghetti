/**
 * @fileoverview CustomNodeAdapter - Bridges custom nodes with PromptScape runtime
 * Wraps custom nodes to integrate with the AdvancedRuntimeNode system
 */

import {
  AdvancedRuntimeNode,
  AdvancedExecutionContext,
  AdvancedNodeConfig,
  ValidationResult
} from '@promptscape/core';
import {
  CustomNodeBase,
  CustomNodeConfig,
  CustomNodeRuntime,
  CustomNodeResult
} from '../types';
import { SecurityManager } from './SecurityManager';
import { ValidationEngine } from './ValidationEngine';

/**
 * Adapter that wraps a custom node to integrate with PromptScape's runtime system
 */
export class CustomNodeAdapter extends AdvancedRuntimeNode {
  private customNode: CustomNodeBase;
  private securityManager: SecurityManager;
  private validationEngine: ValidationEngine;
  private customConfig: CustomNodeConfig;

  constructor(
    id: string,
    customNode: CustomNodeBase,
    customConfig: CustomNodeConfig
  ) {
    // Convert CustomNodeConfig to AdvancedNodeConfig
    const advancedConfig: AdvancedNodeConfig = {
      deterministic: customConfig.deterministic ?? true,
      cacheable: customConfig.cacheable ?? true,
      stateful: customConfig.stateful ?? false,
      performanceHints: customConfig.performanceHints
    };

    super(id, advancedConfig);
    this.customNode = customNode;
    this.customConfig = customConfig;
    this.securityManager = new SecurityManager(customConfig.security);
    this.validationEngine = new ValidationEngine(customConfig.schema);
  }

  /**
   * Validate the custom node configuration
   */
  validate(): ValidationResult {
    try {
      // Validate the custom node itself
      const customValidation = this.customNode.validate();
      if (!customValidation.valid) {
        return customValidation;
      }

      // Validate the schema
      const schemaValidation = this.validationEngine.validateSchema();
      if (!schemaValidation.valid) {
        return schemaValidation;
      }

      // Validate security configuration
      const securityValidation = this.securityManager.validateConfiguration();
      if (!securityValidation.valid) {
        return securityValidation;
      }

      return {
        valid: true,
        errors: [],
        warnings: []
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Validation failed: ${(error as Error).message}`],
        warnings: []
      };
    }
  }

  /**
   * Execute the custom node within PromptScape's runtime context
   */
  async run(ctx: AdvancedExecutionContext): Promise<unknown> {
    const startTime = Date.now();

    try {
      // Security check
      await this.securityManager.checkExecution(ctx);

      // Extract and validate inputs
      const inputs = this.extractInputs(ctx);
      const inputValidation = this.validationEngine.validateInputs(inputs);

      if (!inputValidation.valid) {
        throw new Error(
          `Input validation failed: ${inputValidation.errors.join(', ')}`
        );
      }

      // Create runtime context for the custom node
      const runtime: CustomNodeRuntime = this.createCustomRuntime(ctx, inputs);

      // Call lifecycle hook
      if (this.customNode.beforeExecute) {
        await this.customNode.beforeExecute(runtime);
      }

      // Execute the custom node
      const result = await this.customNode.execute(runtime);

      // Validate outputs
      const outputValidation = this.validationEngine.validateOutputs(
        result.outputs
      );
      if (!outputValidation.valid) {
        throw new Error(
          `Output validation failed: ${outputValidation.errors.join(', ')}`
        );
      }

      // Call lifecycle hook
      if (this.customNode.afterExecute) {
        await this.customNode.afterExecute(runtime, result);
      }

      // Update execution metadata
      const executionTime = Date.now() - startTime;
      this.updateExecutionStats(ctx, executionTime, result.metadata);

      // Return the primary output or all outputs
      return this.formatOutput(result.outputs);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logExecutionError(ctx, error as Error, executionTime);
      throw error;
    }
  }

  /**
   * Extract inputs from the execution context based on the node's schema
   */
  private extractInputs(ctx: AdvancedExecutionContext): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};
    const schema = this.customConfig.schema;

    for (const [inputName, inputSpec] of Object.entries(schema.inputs)) {
      // Get value from context variables
      const value = ctx.variables[inputName];

      if (value !== undefined) {
        inputs[inputName] = value;
      } else if (inputSpec.required && inputSpec.default === undefined) {
        throw new Error(`Required input '${inputName}' is missing`);
      } else if (inputSpec.default !== undefined) {
        inputs[inputName] = inputSpec.default;
      }
    }

    return inputs;
  }

  /**
   * Create a CustomNodeRuntime instance for the custom node
   */
  private createCustomRuntime(
    ctx: AdvancedExecutionContext,
    inputs: Record<string, unknown>
  ): CustomNodeRuntime {
    const nodeId = this.id;

    return {
      context: ctx,
      inputs,
      utils: {
        random: () => (ctx.prng ? ctx.prng() : Math.random()),
        log: (level, message, data) => {
          console[level](`[${nodeId}] ${message}`, data || '');
        },
        validate: (data, schema) =>
          this.validationEngine.validateData(data, schema),
        getState: <T = unknown>(): T | undefined =>
          ctx.nodeStates.get(nodeId) as T | undefined,
        setState: state => ctx.nodeStates.set(nodeId, state)
      }
    };
  }

  /**
   * Format the output according to PromptScape conventions
   */
  private formatOutput(outputs: Record<string, unknown>): unknown {
    const outputSchema = this.customConfig.schema.outputs;
    const outputKeys = Object.keys(outputSchema);

    // If there's only one output, return it directly
    if (outputKeys.length === 1) {
      return outputs[outputKeys[0]];
    }

    // If there's a 'result' output, return it as primary
    if (outputs.result !== undefined) {
      return outputs.result;
    }

    // Otherwise return all outputs as an object
    return outputs;
  }

  /**
   * Update execution statistics in the context
   */
  private updateExecutionStats(
    ctx: AdvancedExecutionContext,
    executionTime: number,
    metadata?: CustomNodeResult['metadata']
  ): void {
    // Store execution stats in performance metrics if available
    if (ctx.performanceMetrics) {
      const metrics = ctx.performanceMetrics.get(this.id) || {
        startTime: Date.now() - executionTime
      };
      metrics.endTime = Date.now();
      ctx.performanceMetrics.set(this.id, metrics);
    }

    // Store custom metrics in outputs if needed
    if (metadata && ctx.outputs) {
      ctx.outputs[`${this.id}_metrics`] = {
        executionTime,
        memoryUsed: metadata.memoryUsed || 0,
        customMetrics: metadata.metrics || {}
      };
    }
  }

  /**
   * Log execution errors with context
   */
  private logExecutionError(
    ctx: AdvancedExecutionContext,
    error: Error,
    executionTime: number
  ): void {
    console.error(
      `[${this.id}] Execution failed after ${executionTime}ms:`,
      error
    );

    // Store error information in outputs if available
    if (ctx.outputs) {
      if (!ctx.outputs['_errors']) {
        ctx.outputs['_errors'] = [];
      }

      (ctx.outputs['_errors'] as unknown[]).push({
        nodeId: this.id,
        error: error.message,
        timestamp: new Date().toISOString(),
        executionTime
      });
    }
  }

  /**
   * Dispose of the custom node and clean up resources
   */
  async dispose(): Promise<void> {
    if (this.customNode.dispose) {
      await this.customNode.dispose();
    }
  }

  /**
   * Get the custom node metadata for debugging
   */
  getCustomMetadata() {
    return this.customConfig.metadata;
  }

  /**
   * Serialize the node's complete state for persistence/export
   */
  serialize() {
    return {
      id: this.id,
      type: this.customConfig.metadata?.type || 'custom',
      config: this.config,
      data: {
        customConfig: this.customConfig,
        customNodeType: this.customNode.constructor.name,
        metadata: this.customConfig.metadata
      },
      metadata: {
        version: this.customConfig.metadata?.version || '1.0.0',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };
  }
}
