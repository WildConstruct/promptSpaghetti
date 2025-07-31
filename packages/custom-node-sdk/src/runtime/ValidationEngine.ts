/**
 * @fileoverview ValidationEngine - Validates inputs, outputs, and schemas for custom nodes
 * Provides comprehensive validation using Zod schemas and custom rules
 */

import { ValidationResult } from '@prompt-spaghetti/graph-core';
import { NodeIOSchema } from '../types';
import { z } from 'zod';

/**
 * Validation engine for custom node inputs, outputs, and schemas
 */
export class ValidationEngine {
  private schema: NodeIOSchema;
  private inputValidators: Map<string, z.ZodSchema>;
  private outputValidators: Map<string, z.ZodSchema>;

  constructor(schema: NodeIOSchema) {
    this.schema = schema;
    this.inputValidators = new Map();
    this.outputValidators = new Map();

    // Build Zod validators from schema
    this.buildValidators();
  }

  /**
   * Validate the node's I/O schema definition
   */
  validateSchema(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate input specifications
      for (const [inputName, inputSpec] of Object.entries(this.schema.inputs)) {
        if (!this.isValidType(inputSpec.type)) {
          errors.push(`Input '${inputName}' has invalid type: ${inputSpec.type}`);
        }

        if (inputSpec.validation) {
          const validationErrors = this.validateValidationRules(inputName, inputSpec.validation, inputSpec.type);
          errors.push(...validationErrors);
        }

        // Check for default value type compatibility
        if (inputSpec.default !== undefined) {
          const defaultValidation = this.validateValueType(inputSpec.default, inputSpec.type);
          if (!defaultValidation.valid) {
            errors.push(`Input '${inputName}' default value doesn't match specified type`);
          }
        }
      }

      // Validate output specifications
      for (const [outputName, outputSpec] of Object.entries(this.schema.outputs)) {
        if (!this.isValidType(outputSpec.type)) {
          errors.push(`Output '${outputName}' has invalid type: ${outputSpec.type}`);
        }
      }

      // Check for common issues
      if (Object.keys(this.schema.inputs).length === 0) {
        warnings.push('Node has no inputs - consider if this is intentional');
      }

      if (Object.keys(this.schema.outputs).length === 0) {
        errors.push('Node must have at least one output');
      }

      // Check for reserved names
      const reservedNames = ['id', 'type', 'config', 'metadata'];
      for (const inputName of Object.keys(this.schema.inputs)) {
        if (reservedNames.includes(inputName)) {
          warnings.push(`Input name '${inputName}' is reserved and may cause conflicts`);
        }
      }

      for (const outputName of Object.keys(this.schema.outputs)) {
        if (reservedNames.includes(outputName)) {
          warnings.push(`Output name '${outputName}' is reserved and may cause conflicts`);
        }
      }
    } catch (error) {
      errors.push(`Schema validation failed: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate input values against the schema
   */
  validateInputs(inputs: Record<string, any>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for required inputs
      for (const [inputName, inputSpec] of Object.entries(this.schema.inputs)) {
        if (inputSpec.required && inputs[inputName] === undefined) {
          errors.push(`Required input '${inputName}' is missing`);
          continue;
        }

        // Validate provided inputs
        if (inputs[inputName] !== undefined) {
          const validator = this.inputValidators.get(inputName);
          if (validator) {
            try {
              validator.parse(inputs[inputName]);
            } catch (validationError) {
              if (validationError instanceof z.ZodError) {
                const messages = validationError.errors.map(err => err.message).join(', ');
                errors.push(`Input '${inputName}' validation failed: ${messages}`);
              } else {
                errors.push(`Input '${inputName}' validation failed: ${validationError.message}`);
              }
            }
          }
        }
      }

      // Check for unexpected inputs
      for (const inputName of Object.keys(inputs)) {
        if (!this.schema.inputs[inputName]) {
          warnings.push(`Unexpected input '${inputName}' provided`);
        }
      }
    } catch (error) {
      errors.push(`Input validation failed: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate output values against the schema
   */
  validateOutputs(outputs: Record<string, any>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate provided outputs
      for (const [outputName, outputValue] of Object.entries(outputs)) {
        if (!this.schema.outputs[outputName]) {
          warnings.push(`Unexpected output '${outputName}' provided`);
          continue;
        }

        const validator = this.outputValidators.get(outputName);
        if (validator) {
          try {
            validator.parse(outputValue);
          } catch (validationError) {
            if (validationError instanceof z.ZodError) {
              const messages = validationError.errors.map(err => err.message).join(', ');
              errors.push(`Output '${outputName}' validation failed: ${messages}`);
            } else {
              errors.push(`Output '${outputName}' validation failed: ${validationError.message}`);
            }
          }
        }
      }

      // Check for missing outputs (all outputs are considered required)
      for (const outputName of Object.keys(this.schema.outputs)) {
        if (outputs[outputName] === undefined) {
          errors.push(`Required output '${outputName}' is missing`);
        }
      }
    } catch (error) {
      errors.push(`Output validation failed: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate arbitrary data against a custom schema
   */
  validateData(data: any, schema: any): ValidationResult {
    try {
      if (schema && typeof schema.parse === 'function') {
        // Zod schema
        schema.parse(data);
        return { valid: true, errors: [], warnings: [] };
      } else {
        // Simple type check
        return this.validateValueType(data, schema);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(err => err.message);
        return { valid: false, errors: messages, warnings: [] };
      } else {
        return { valid: false, errors: [error.message], warnings: [] };
      }
    }
  }

  /**
   * Build Zod validators from the schema
   */
  private buildValidators(): void {
    // Build input validators
    for (const [inputName, inputSpec] of Object.entries(this.schema.inputs)) {
      const validator = this.buildZodSchema(inputSpec.type, inputSpec.validation, inputSpec.required);
      this.inputValidators.set(inputName, validator);
    }

    // Build output validators
    for (const [outputName, outputSpec] of Object.entries(this.schema.outputs)) {
      const validator = this.buildZodSchema(outputSpec.type, undefined, true);
      this.outputValidators.set(outputName, validator);
    }
  }

  /**
   * Build a Zod schema from type and validation specifications
   */
  private buildZodSchema(type: string, validation?: any, required: boolean = true): z.ZodSchema {
    let schema: z.ZodSchema;

    // Base schema based on type
    switch (type) {
      case 'string':
        schema = z.string();
        if (validation?.minLength) schema = (schema as z.ZodString).min(validation.minLength);
        if (validation?.maxLength) schema = (schema as z.ZodString).max(validation.maxLength);
        if (validation?.pattern) schema = (schema as z.ZodString).regex(new RegExp(validation.pattern));
        if (validation?.enum) schema = z.enum(validation.enum);
        break;

      case 'number':
        schema = z.number();
        if (validation?.min !== undefined) schema = (schema as z.ZodNumber).min(validation.min);
        if (validation?.max !== undefined) schema = (schema as z.ZodNumber).max(validation.max);
        break;

      case 'boolean':
        schema = z.boolean();
        break;

      case 'array':
        schema = z.array(z.any());
        if (validation?.minLength) schema = (schema as z.ZodArray<any>).min(validation.minLength);
        if (validation?.maxLength) schema = (schema as z.ZodArray<any>).max(validation.maxLength);
        break;

      case 'object':
        schema = z.object({}).passthrough();
        break;

      case 'any':
      default:
        schema = z.any();
        break;
    }

    // Make optional if not required
    if (!required) {
      schema = schema.optional();
    }

    return schema;
  }

  /**
   * Check if a type string is valid
   */
  private isValidType(type: string): boolean {
    const validTypes = ['string', 'number', 'boolean', 'array', 'object', 'any'];
    return validTypes.includes(type);
  }

  /**
   * Validate validation rules for consistency
   */
  private validateValidationRules(inputName: string, validation: any, type: string): string[] {
    const errors: string[] = [];

    if (type === 'string') {
      if (validation.min !== undefined || validation.max !== undefined) {
        errors.push(`Input '${inputName}': use minLength/maxLength for strings, not min/max`);
      }
    } else if (type === 'number') {
      if (validation.minLength !== undefined || validation.maxLength !== undefined) {
        errors.push(`Input '${inputName}': use min/max for numbers, not minLength/maxLength`);
      }
      if (validation.pattern) {
        errors.push(`Input '${inputName}': pattern validation is only valid for strings`);
      }
    } else if (type === 'array') {
      if (validation.min !== undefined || validation.max !== undefined) {
        errors.push(`Input '${inputName}': use minLength/maxLength for arrays, not min/max`);
      }
    }

    return errors;
  }

  /**
   * Validate a value against a simple type
   */
  private validateValueType(value: any, type: string): ValidationResult {
    let valid = true;
    const errors: string[] = [];

    switch (type) {
      case 'string':
        valid = typeof value === 'string';
        break;
      case 'number':
        valid = typeof value === 'number' && !isNaN(value);
        break;
      case 'boolean':
        valid = typeof value === 'boolean';
        break;
      case 'array':
        valid = Array.isArray(value);
        break;
      case 'object':
        valid = typeof value === 'object' && value !== null && !Array.isArray(value);
        break;
      case 'any':
        valid = true; // Any type is always valid
        break;
      default:
        valid = false;
        errors.push(`Unknown type: ${type}`);
    }

    if (!valid && errors.length === 0) {
      errors.push(`Expected ${type}, got ${typeof value}`);
    }

    return { valid, errors, warnings: [] };
  }
}
