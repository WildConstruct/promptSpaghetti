/**
 * VariableNode - A node that stores and retrieves variables with inline editing
 * Can act as both setter and getter depending on configuration
 */

import { ExecutionContext } from '../../types';
import {
  BaseInlineEditableNode,
  InlineEditableConfig
} from './BaseInlineEditableNode';

// Simple security validation for variable names
const SecurityValidation = {
  validateVariableName(name: string): boolean {
    // Allow alphanumeric, underscores, max 64 chars
    return /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(name);
  }
};

/**
 * Variable node modes
 */
export type VariableMode = 'set' | 'get' | 'both';

/**
 * Variable value types
 */
export type VariableType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'any';

/**
 * Configuration value for Variable nodes
 */
export interface VariableConfig {
  /** Variable name */
  name: string;
  /** Default value when getting and variable doesn't exist */
  defaultValue?: any;
  /** Current value when setting */
  currentValue?: any;
}

/**
 * Merge modes for data inlet (Story 1.5)
 */
export type MergeMode = 'override' | 'template' | 'append';

/**
 * Extended configuration for Variable nodes
 */
export interface VariableNodeConfig extends InlineEditableConfig {
  /** Variable type for validation */
  variableType?: VariableType;
  /** Variable scope */
  scope?: 'local' | 'global';
  /** Mode of operation */
  mode?: VariableMode;
  /** Merge mode for data inlet (Story 1.5) */
  mergeMode?: MergeMode;
  /** Whether this node has a data inlet (Story 1.5) */
  hasDataInlet?: boolean;
}

/**
 * Variable node implementation with inline editing support
 */
export class VariableNode extends BaseInlineEditableNode<VariableConfig, any> {
  private nodeConfig: VariableNodeConfig;
  private input: any = undefined;
  private dataInlet: any = undefined;
  private dataSource: 'inlet' | 'input' | 'default' = 'default';

  constructor(
    id: string,
    initialConfig: VariableConfig = { name: 'unnamed' },
    config: VariableNodeConfig = {}
  ) {
    super(id, initialConfig, config);
    this.nodeConfig = {
      variableType: 'any',
      scope: 'local',
      mode: 'both',
      mergeMode: 'override',
      hasDataInlet: true, // Enable by default for Story 1.5
      ...config
    };
  }

  /**
   * Set the input value for setter mode
   */
  setInput(value: any): void {
    this.input = value;
  }

  /**
   * Set the data inlet value (Story 1.5)
   */
  setDataInlet(value: any): void {
    this.dataInlet = value;
  }

  /**
   * Execute the node - get or set variable based on mode
   * Story 1.5: Implements data resolution priority
   */
  async run(ctx: ExecutionContext): Promise<any> {
    const config = this.getCurrentValue();
    const mode = this.nodeConfig.mode || 'both';

    // Validate variable name
    if (!SecurityValidation.validateVariableName(config.name)) {
      throw new Error(`Invalid variable name: ${config.name}`);
    }

    // Story 1.5: Data resolution priority
    let resolvedValue: any;

    // Priority 1: Data inlet (if connected and has value)
    if (this.dataInlet !== undefined && this.nodeConfig.hasDataInlet) {
      resolvedValue = this.mergeData(this.dataInlet, this.input);
      this.dataSource = 'inlet';
    }
    // Priority 2: Input connection (if connected and has value)
    else if (this.input !== undefined) {
      resolvedValue = this.input;
      this.dataSource = 'input';
    }
    // Priority 3: Current value (if set in node configuration)
    else if (config.currentValue !== undefined) {
      resolvedValue = config.currentValue;
      this.dataSource = 'default';
    }
    // Priority 4: Default value (fallback)
    else {
      resolvedValue = config.defaultValue;
      this.dataSource = 'default';
    }

    if (mode === 'set' || mode === 'both') {
      // Set variable mode
      if (resolvedValue !== undefined) {
        // Validate type if configured
        if (
          this.nodeConfig.variableType !== 'any' &&
          !this.validateType(resolvedValue)
        ) {
          throw new Error(
            `Type mismatch: expected ${this.nodeConfig.variableType}, got ${typeof resolvedValue}`
          );
        }

        // Store the value
        ctx.variables[config.name] = this.sanitizeValue(resolvedValue);
      }
    }

    if (mode === 'get' || mode === 'both') {
      // Get variable mode
      if (Object.prototype.hasOwnProperty.call(ctx.variables, config.name)) {
        return ctx.variables[config.name];
      } else {
        return resolvedValue ?? config.defaultValue;
      }
    }

    // For set-only mode, return the resolved value
    return resolvedValue;
  }

  /**
   * Merge data based on configured merge mode (Story 1.5)
   */
  private mergeData(dataInlet: any, input: any): any {
    const mergeMode = this.nodeConfig.mergeMode || 'override';

    switch (mergeMode) {
      case 'override':
        // Data inlet completely replaces input
        return dataInlet;

      case 'template':
        // Input acts as template, data fills placeholders
        if (typeof input === 'string' && typeof dataInlet === 'object') {
          let result = input;
          for (const [key, value] of Object.entries(dataInlet)) {
            const placeholder = `{${key}}`;
            result = result.replace(
              new RegExp(placeholder, 'g'),
              String(value)
            );
          }
          return result;
        }
        return dataInlet;

      case 'append':
        // Combine both values
        if (Array.isArray(dataInlet) && Array.isArray(input)) {
          return [...input, ...dataInlet];
        }
        if (typeof dataInlet === 'string' && typeof input === 'string') {
          return input + dataInlet;
        }
        if (typeof dataInlet === 'object' && typeof input === 'object') {
          return { ...input, ...dataInlet };
        }
        return dataInlet;

      default:
        return dataInlet;
    }
  }

  /**
   * Clone the configuration value
   */
  protected cloneValue(value: VariableConfig): VariableConfig {
    return {
      name: value.name,
      defaultValue: this.cloneAny(value.defaultValue),
      currentValue: this.cloneAny(value.currentValue)
    };
  }

  /**
   * Deep clone any value
   */
  private cloneAny(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value !== 'object') {
      return value;
    }

    // Use JSON for deep cloning (handles arrays and objects)
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value;
    }
  }

  /**
   * Sanitize value to prevent prototype pollution
   */
  private sanitizeValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    const type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean') {
      return value;
    }

    if (Array.isArray(value) || type === 'object') {
      // Deep clone to prevent reference pollution
      return JSON.parse(JSON.stringify(value));
    }

    // Reject functions and other dangerous types
    throw new Error('Functions and symbols are not allowed as variable values');
  }

  /**
   * Validate value type
   */
  private validateType(value: any): boolean {
    const type = this.nodeConfig.variableType;

    if (type === 'any') return true;

    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return (
          value !== null && typeof value === 'object' && !Array.isArray(value)
        );
      default:
        return false;
    }
  }

  /**
   * Validate the configuration
   */
  protected async validateValue(
    value: VariableConfig
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if value is an object
    if (!value || typeof value !== 'object') {
      errors.push('Configuration must be an object');
      return { valid: false, errors };
    }

    // Validate variable name
    if (typeof value.name !== 'string') {
      errors.push('Variable name must be a string');
    } else if (!SecurityValidation.validateVariableName(value.name)) {
      errors.push(
        'Invalid variable name: must be alphanumeric with underscores, max 64 chars'
      );
    }

    // Validate currentValue type if specified
    if (
      value.currentValue !== undefined &&
      this.nodeConfig.variableType !== 'any'
    ) {
      if (!this.validateType(value.currentValue)) {
        errors.push(
          `Current value type mismatch: expected ${this.nodeConfig.variableType}`
        );
      }
    }

    // Validate defaultValue type if specified
    if (
      value.defaultValue !== undefined &&
      this.nodeConfig.variableType !== 'any'
    ) {
      if (!this.validateType(value.defaultValue)) {
        errors.push(
          `Default value type mismatch: expected ${this.nodeConfig.variableType}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get the node type
   */
  getNodeType(): string {
    return 'Variable';
  }

  /**
   * Update variable name
   */
  setVariableName(name: string): void {
    const config = this.getCurrentValue();
    const updated = { ...config, name };

    if (this.isEditing()) {
      this.updateEditBuffer(updated);
    } else {
      this.data.value = updated;
    }
  }

  /**
   * Get variable name
   */
  getVariableName(): string {
    return this.getCurrentValue().name;
  }

  /**
   * Update default value
   */
  setDefaultValue(defaultValue: any): void {
    if (
      this.nodeConfig.variableType !== 'any' &&
      !this.validateType(defaultValue)
    ) {
      throw new Error(
        `Type mismatch: expected ${this.nodeConfig.variableType}`
      );
    }

    const config = this.getCurrentValue();
    const updated = { ...config, defaultValue };

    if (this.isEditing()) {
      this.updateEditBuffer(updated);
    } else {
      this.data.value = updated;
    }
  }

  /**
   * Get default value
   */
  getDefaultValue(): any {
    return this.getCurrentValue().defaultValue;
  }

  /**
   * Update current value
   */
  setCurrentValue(currentValue: any): void {
    if (
      this.nodeConfig.variableType !== 'any' &&
      !this.validateType(currentValue)
    ) {
      throw new Error(
        `Type mismatch: expected ${this.nodeConfig.variableType}`
      );
    }

    const config = this.getCurrentValue();
    const updated = { ...config, currentValue };

    if (this.isEditing()) {
      this.updateEditBuffer(updated);
    } else {
      this.data.value = updated;
    }
  }

  /**
   * Get current value
   */
  getCurrentValueData(): any {
    return this.getCurrentValue().currentValue;
  }

  /**
   * Set variable type
   */
  setVariableType(type: VariableType): void {
    this.nodeConfig.variableType = type;

    // Revalidate current values
    const config = this.getCurrentValue();
    const errors: string[] = [];

    if (
      config.currentValue !== undefined &&
      !this.validateType(config.currentValue)
    ) {
      errors.push('Current value does not match new type');
    }

    if (
      config.defaultValue !== undefined &&
      !this.validateType(config.defaultValue)
    ) {
      errors.push('Default value does not match new type');
    }

    if (errors.length > 0) {
      this.data.isValid = false;
      this.data.validationMessage = errors.join(', ');
    }
  }

  /**
   * Get variable type
   */
  getVariableType(): VariableType {
    return this.nodeConfig.variableType || 'any';
  }

  /**
   * Set operation mode
   */
  setMode(mode: VariableMode): void {
    this.nodeConfig.mode = mode;
  }

  /**
   * Get operation mode
   */
  getMode(): VariableMode {
    return this.nodeConfig.mode || 'both';
  }

  /**
   * Set variable scope
   */
  setScope(scope: 'local' | 'global'): void {
    this.nodeConfig.scope = scope;
  }

  /**
   * Get variable scope
   */
  getScope(): 'local' | 'global' {
    return this.nodeConfig.scope || 'local';
  }

  /**
   * Get node configuration
   */
  getNodeConfig(): VariableNodeConfig {
    return { ...this.nodeConfig };
  }

  /**
   * Set merge mode (Story 1.5)
   */
  setMergeMode(mode: MergeMode): void {
    this.nodeConfig.mergeMode = mode;
  }

  /**
   * Get merge mode (Story 1.5)
   */
  getMergeMode(): MergeMode {
    return this.nodeConfig.mergeMode || 'override';
  }

  /**
   * Get data source (Story 1.5)
   */
  getDataSource(): 'inlet' | 'input' | 'default' {
    return this.dataSource;
  }

  /**
   * Check if data inlet is connected (Story 1.5)
   */
  isDataInletConnected(): boolean {
    return this.dataInlet !== undefined;
  }

  /**
   * Get resolved value (Story 1.5)
   */
  getResolvedValue(): any {
    // Simulate resolution without executing
    if (this.dataInlet !== undefined && this.nodeConfig.hasDataInlet) {
      return this.mergeData(this.dataInlet, this.input);
    } else if (this.input !== undefined) {
      return this.input;
    } else {
      const config = this.getCurrentValue();
      return config.currentValue ?? config.defaultValue;
    }
  }

  /**
   * Enhanced serialization
   */
  serialize(): any {
    const base = super.serialize();
    return {
      ...base,
      nodeConfig: this.nodeConfig,
      metadata: {
        variableName: this.data.value.name,
        variableType: this.nodeConfig.variableType,
        mode: this.nodeConfig.mode,
        scope: this.nodeConfig.scope,
        hasDefaultValue: this.data.value.defaultValue !== undefined,
        hasCurrentValue: this.data.value.currentValue !== undefined
      }
    };
  }
}
