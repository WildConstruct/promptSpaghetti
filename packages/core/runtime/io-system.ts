// packages/core/runtime/io-system.ts
// Standardized Input/Output handling system for Epic 7 advanced nodes

import { z } from 'zod';
import { ValidationResult, ValidationHelpers } from './advanced';

/**
 * Supported input/output data types for advanced nodes
 */
export type IODataType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'array' 
  | 'object' 
  | 'any'
  | 'stringArray'
  | 'numberArray'
  | 'choice'
  | 'conditional';

/**
 * Input/Output port definition for advanced nodes
 */
export interface IOPortDefinition {
  /** Unique identifier for this port */
  id: string;
  /** Human-readable label */
  label: string;
  /** Data type this port accepts/produces */
  dataType: IODataType;
  /** Whether this port is required */
  required: boolean;
  /** Default value if not connected */
  defaultValue?: any;
  /** Validation constraints */
  constraints?: IOConstraints;
  /** Human-readable description */
  description?: string;
  /** Whether this port supports multiple connections */
  multiple?: boolean;
}

/**
 * Validation constraints for I/O ports
 */
export interface IOConstraints {
  /** Minimum value (for numbers) */
  min?: number;
  /** Maximum value (for numbers) */
  max?: number;
  /** Minimum length (for strings/arrays) */
  minLength?: number;
  /** Maximum length (for strings/arrays) */
  maxLength?: number;
  /** Regular expression pattern (for strings) */
  pattern?: string;
  /** Allowed values (for enums/choices) */
  allowedValues?: any[];
  /** Custom validation function */
  customValidator?: (value: any) => ValidationResult;
}

/**
 * Input/Output port specification for a node type
 */
export interface IOSpec {
  /** Input port definitions */
  inputs: IOPortDefinition[];
  /** Output port definitions */
  outputs: IOPortDefinition[];
}

/**
 * Resolved input values for node execution
 */
export interface ResolvedInputs {
  /** Direct input values by port ID */
  values: Map<string, any>;
  /** Metadata about input resolution */
  metadata: Map<string, IOResolutionMetadata>;
}

/**
 * Metadata about how an input was resolved
 */
export interface IOResolutionMetadata {
  /** Whether the value came from a connection or default */
  source: 'connection' | 'default' | 'computed';
  /** Original connected node ID (if from connection) */
  sourceNodeId?: string;
  /** Type coercion performed */
  typeCoercion?: {
    from: IODataType;
    to: IODataType;
  };
  /** Validation warnings */
  warnings: string[];
}

/**
 * Advanced Input/Output handler for Epic 7 nodes
 */
export class AdvancedIOHandler {
  constructor(private spec: IOSpec) {}

  /**
   * Validate that all required inputs are available and valid
   */
  validateInputs(inputs: Map<string, any>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const inputDef of this.spec.inputs) {
      const value = inputs.get(inputDef.id);
      
      // Check required inputs
      if (inputDef.required && (value === undefined || value === null)) {
        if (inputDef.defaultValue === undefined) {
          errors.push(`Required input '${inputDef.label}' (${inputDef.id}) is missing`);
          continue;
        }
      }

      // Validate input value if present
      if (value !== undefined && value !== null) {
        const validationResult = this.validateValue(value, inputDef);
        errors.push(...validationResult.errors);
        warnings.push(...validationResult.warnings);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Resolve inputs from connected nodes and apply defaults
   */
  resolveInputs(
    connectedInputs: Map<string, any>,
    nodeId: string
  ): ResolvedInputs {
    const values = new Map<string, any>();
    const metadata = new Map<string, IOResolutionMetadata>();

    for (const inputDef of this.spec.inputs) {
      const connectedValue = connectedInputs.get(inputDef.id);
      
      if (connectedValue !== undefined) {
        // Use connected value with potential type coercion
        const { value, coercion, warnings } = this.coerceValue(
          connectedValue, 
          inputDef.dataType
        );
        
        values.set(inputDef.id, value);
        metadata.set(inputDef.id, {
          source: 'connection',
          sourceNodeId: 'unknown', // Would be resolved by engine
          typeCoercion: coercion,
          warnings
        });
      } else if (inputDef.defaultValue !== undefined) {
        // Use default value
        values.set(inputDef.id, inputDef.defaultValue);
        metadata.set(inputDef.id, {
          source: 'default',
          warnings: []
        });
      } else if (inputDef.required) {
        // Missing required input - this should be caught by validation
        metadata.set(inputDef.id, {
          source: 'default',
          warnings: [`Missing required input: ${inputDef.label}`]
        });
      }
    }

    return { values, metadata };
  }

  /**
   * Validate and format output values according to output specification
   */
  validateOutputs(outputs: Map<string, any>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const outputDef of this.spec.outputs) {
      const value = outputs.get(outputDef.id);
      
      if (value !== undefined && value !== null) {
        const validationResult = this.validateValue(value, outputDef);
        errors.push(...validationResult.errors);
        warnings.push(...validationResult.warnings);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get input specification
   */
  getInputSpec(): IOPortDefinition[] {
    return [...this.spec.inputs];
  }

  /**
   * Get output specification  
   */
  getOutputSpec(): IOPortDefinition[] {
    return [...this.spec.outputs];
  }

  /**
   * Validate a value against a port definition
   */
  private validateValue(value: any, portDef: IOPortDefinition): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Type validation
    if (!this.isValidType(value, portDef.dataType)) {
      errors.push(
        `Invalid type for ${portDef.label}: expected ${portDef.dataType}, got ${typeof value}`
      );
      return { valid: false, errors, warnings };
    }

    // Constraint validation
    if (portDef.constraints) {
      const constraintResult = this.validateConstraints(value, portDef.constraints);
      errors.push(...constraintResult.errors);
      warnings.push(...constraintResult.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if value matches expected data type
   */
  private isValidType(value: any, dataType: IODataType): boolean {
    switch (dataType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'stringArray':
      return Array.isArray(value) && value.every(v => typeof v === 'string');
    case 'numberArray':
      return Array.isArray(value) && value.every(v => typeof v === 'number');
    case 'any':
      return true;
    case 'choice':
      return typeof value === 'string' || typeof value === 'number';
    case 'conditional':
      return typeof value === 'boolean' || typeof value === 'string';
    default:
      return false;
    }
  }

  /**
   * Validate value against constraints
   */
  private validateConstraints(value: any, constraints: IOConstraints): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Numeric constraints
    if (typeof value === 'number') {
      if (constraints.min !== undefined && value < constraints.min) {
        errors.push(`Value ${value} is below minimum ${constraints.min}`);
      }
      if (constraints.max !== undefined && value > constraints.max) {
        errors.push(`Value ${value} is above maximum ${constraints.max}`);
      }
    }

    // Length constraints
    if (typeof value === 'string' || Array.isArray(value)) {
      const length = value.length;
      if (constraints.minLength !== undefined && length < constraints.minLength) {
        errors.push(`Length ${length} is below minimum ${constraints.minLength}`);
      }
      if (constraints.maxLength !== undefined && length > constraints.maxLength) {
        errors.push(`Length ${length} is above maximum ${constraints.maxLength}`);
      }
    }

    // Pattern constraints (for strings)
    if (typeof value === 'string' && constraints.pattern) {
      const regex = new RegExp(constraints.pattern);
      if (!regex.test(value)) {
        errors.push(`Value does not match required pattern: ${constraints.pattern}`);
      }
    }

    // Allowed values constraints
    if (constraints.allowedValues && !constraints.allowedValues.includes(value)) {
      errors.push(`Value '${value}' is not in allowed values: ${constraints.allowedValues.join(', ')}`);
    }

    // Custom validation
    if (constraints.customValidator) {
      const customResult = constraints.customValidator(value);
      errors.push(...customResult.errors);
      warnings.push(...customResult.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Coerce value to target data type with warnings
   */
  private coerceValue(
    value: any, 
    targetType: IODataType
  ): { 
    value: any; 
    coercion?: { from: IODataType; to: IODataType }; 
    warnings: string[] 
  } {
    const warnings: string[] = [];
    const originalType = this.getValueType(value);

    // No coercion needed if types match
    if (originalType === targetType || targetType === 'any') {
      return { value, warnings };
    }

    // Attempt type coercion
    try {
      const coercedValue = this.performCoercion(value, originalType, targetType);
      return {
        value: coercedValue,
        coercion: { from: originalType, to: targetType },
        warnings: [`Type coerced from ${originalType} to ${targetType}`]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      warnings.push(`Type coercion failed: ${errorMessage}`);
      return { value, warnings };
    }
  }

  /**
   * Get the IODataType for a value
   */
  private getValueType(value: any): IODataType {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) {
      if (value.every(v => typeof v === 'string')) return 'stringArray';
      if (value.every(v => typeof v === 'number')) return 'numberArray';
      return 'array';
    }
    if (typeof value === 'object' && value !== null) return 'object';
    return 'any';
  }

  /**
   * Perform actual type coercion
   */
  private performCoercion(value: any, from: IODataType, to: IODataType): any {
    switch (to) {
    case 'string':
      return String(value);
    case 'number':
      const num = Number(value);
      if (isNaN(num)) throw new Error(`Cannot convert ${value} to number`);
      return num;
    case 'boolean':
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return Boolean(value);
    case 'array':
      return Array.isArray(value) ? value : [value];
    case 'stringArray':
      const arr = Array.isArray(value) ? value : [value];
      return arr.map(v => String(v));
    case 'numberArray':
      const numArr = Array.isArray(value) ? value : [value];
      return numArr.map(v => {
        const n = Number(v);
        if (isNaN(n)) throw new Error(`Cannot convert ${v} to number`);
        return n;
      });
    default:
      throw new Error(`Cannot coerce to type ${to}`);
    }
  }
}

/**
 * Helper function to create common I/O specifications for advanced nodes
 */
export class IOSpecBuilder {
  private inputs: IOPortDefinition[] = [];
  private outputs: IOPortDefinition[] = [];

  /**
   * Add an input port
   */
  addInput(definition: Omit<IOPortDefinition, 'id'> & { id: string }): IOSpecBuilder {
    this.inputs.push(definition);
    return this;
  }

  /**
   * Add an output port
   */
  addOutput(definition: Omit<IOPortDefinition, 'id'> & { id: string }): IOSpecBuilder {
    this.outputs.push(definition);
    return this;
  }

  /**
   * Add a standard text input
   */
  addTextInput(
    id: string, 
    label: string, 
    required: boolean = false, 
    defaultValue?: string
  ): IOSpecBuilder {
    return this.addInput({
      id,
      label,
      dataType: 'string',
      required,
      defaultValue,
      description: `Text input for ${label.toLowerCase()}`
    });
  }

  /**
   * Add a standard number input
   */
  addNumberInput(
    id: string, 
    label: string, 
    required: boolean = false, 
    min?: number, 
    max?: number,
    defaultValue?: number
  ): IOSpecBuilder {
    return this.addInput({
      id,
      label,
      dataType: 'number',
      required,
      defaultValue,
      constraints: { min, max },
      description: `Numeric input for ${label.toLowerCase()}`
    });
  }

  /**
   * Add a standard choice input
   */
  addChoiceInput(
    id: string, 
    label: string, 
    allowedValues: any[], 
    required: boolean = false,
    defaultValue?: any
  ): IOSpecBuilder {
    return this.addInput({
      id,
      label,
      dataType: 'choice',
      required,
      defaultValue,
      constraints: { allowedValues },
      description: `Choice input for ${label.toLowerCase()}`
    });
  }

  /**
   * Add a standard text output
   */
  addTextOutput(id: string, label: string): IOSpecBuilder {
    return this.addOutput({
      id,
      label,
      dataType: 'string',
      required: true,
      description: `Text output for ${label.toLowerCase()}`
    });
  }

  /**
   * Build the final I/O specification
   */
  build(): IOSpec {
    return {
      inputs: [...this.inputs],
      outputs: [...this.outputs]
    };
  }

  /**
   * Create a basic single-input, single-output spec
   */
  static createSimple(
    inputLabel: string = 'Input',
    outputLabel: string = 'Output'
  ): IOSpec {
    return new IOSpecBuilder()
      .addTextInput('input', inputLabel, false, '')
      .addTextOutput('output', outputLabel)
      .build();
  }

  /**
   * Create a multi-input, single-output spec
   */
  static createMultiInput(
    inputLabels: string[],
    outputLabel: string = 'Output'
  ): IOSpec {
    const builder = new IOSpecBuilder();
    
    inputLabels.forEach((label, index) => {
      builder.addTextInput(`input${index}`, label, false, '');
    });
    
    return builder
      .addTextOutput('output', outputLabel)
      .build();
  }
}

/**
 * Type-safe input getter for advanced nodes
 */
export class TypedInputs {
  constructor(private inputs: ResolvedInputs) {}

  /**
   * Get a string input value
   */
  getString(portId: string, defaultValue: string = ''): string {
    const value = this.inputs.values.get(portId);
    return typeof value === 'string' ? value : String(value ?? defaultValue);
  }

  /**
   * Get a number input value
   */
  getNumber(portId: string, defaultValue: number = 0): number {
    const value = this.inputs.values.get(portId);
    return typeof value === 'number' ? value : Number(value ?? defaultValue);
  }

  /**
   * Get a boolean input value
   */
  getBoolean(portId: string, defaultValue: boolean = false): boolean {
    const value = this.inputs.values.get(portId);
    return typeof value === 'boolean' ? value : Boolean(value ?? defaultValue);
  }

  /**
   * Get an array input value
   */
  getArray<T = any>(portId: string, defaultValue: T[] = []): T[] {
    const value = this.inputs.values.get(portId);
    return Array.isArray(value) ? value : defaultValue;
  }

  /**
   * Get a string array input value
   */
  getStringArray(portId: string, defaultValue: string[] = []): string[] {
    const value = this.inputs.values.get(portId);
    if (Array.isArray(value)) {
      return value.map(v => String(v));
    }
    return defaultValue;
  }

  /**
   * Get input metadata
   */
  getMetadata(portId: string): IOResolutionMetadata | undefined {
    return this.inputs.metadata.get(portId);
  }

  /**
   * Check if input has warnings
   */
  hasWarnings(portId: string): boolean {
    const metadata = this.getMetadata(portId);
    return metadata ? metadata.warnings.length > 0 : false;
  }

  /**
   * Get all warnings for an input
   */
  getWarnings(portId: string): string[] {
    const metadata = this.getMetadata(portId);
    return metadata ? metadata.warnings : [];
  }
}