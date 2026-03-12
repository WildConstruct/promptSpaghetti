/**
 * @fileoverview ValidationEngine - Validates inputs, outputs, and schemas for custom nodes
 * Provides comprehensive validation using Zod schemas and custom rules
 */

import { NodeIOSchema, ValidationResult } from '../types';
import { z } from 'zod';

type PrimitiveValidationRule = {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  enum?: unknown[];
};

type LiteralPrimitive = string | number | boolean | null | undefined;

const isLiteralPrimitive = (value: unknown): value is LiteralPrimitive =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean' ||
  value === null ||
  typeof value === 'undefined';

const valueMatchesDeclaredType = (value: unknown, type: string): boolean => {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !Number.isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return (
        typeof value === 'object' && value !== null && !Array.isArray(value)
      );
    case 'any':
      return true;
    default:
      return false;
  }
};

const tryCreateRegExp = (pattern: string): RegExp | null => {
  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
};

const isZodSchema = (value: unknown): value is z.ZodTypeAny =>
  typeof value === 'object' &&
  value !== null &&
  'parse' in value &&
  typeof (value as z.ZodTypeAny).parse === 'function';

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
          errors.push(
            `Input '${inputName}' has invalid type: ${inputSpec.type}`
          );
        }

        if (inputSpec.validation) {
          const validationErrors = this.validateValidationRules(
            inputName,
            inputSpec.validation,
            inputSpec.type
          );
          errors.push(...validationErrors);
        }

        // Check for default value type compatibility
        if (inputSpec.default !== undefined) {
          const validator = this.inputValidators.get(inputName);

          if (validator) {
            try {
              validator.parse(inputSpec.default);
            } catch {
              errors.push(
                `Input '${inputName}' default value violates its validation rules`
              );
            }
          } else {
            const defaultValidation = this.validateValueType(
              inputSpec.default,
              inputSpec.type
            );
            if (!defaultValidation.valid) {
              errors.push(
                `Input '${inputName}' default value doesn't match specified type`
              );
            }
          }
        }
      }

      // Validate output specifications
      for (const [outputName, outputSpec] of Object.entries(
        this.schema.outputs
      )) {
        if (!this.isValidType(outputSpec.type)) {
          errors.push(
            `Output '${outputName}' has invalid type: ${outputSpec.type}`
          );
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
          warnings.push(
            `Input name '${inputName}' is reserved and may cause conflicts`
          );
        }
      }

      for (const outputName of Object.keys(this.schema.outputs)) {
        if (reservedNames.includes(outputName)) {
          warnings.push(
            `Output name '${outputName}' is reserved and may cause conflicts`
          );
        }
      }
    } catch (error) {
      errors.push(
        `Schema validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate input values against the schema
   */
  validateInputs(inputs: Record<string, unknown>): ValidationResult {
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
                const messages = validationError.errors
                  .map(err => err.message)
                  .join(', ');
                errors.push(
                  `Input '${inputName}' validation failed: ${messages}`
                );
              } else {
                errors.push(
                  `Input '${inputName}' validation failed: ${validationError instanceof Error ? validationError.message : String(validationError)}`
                );
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
      errors.push(
        `Input validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate output values against the schema
   */
  validateOutputs(outputs: Record<string, unknown>): ValidationResult {
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
              const messages = validationError.errors
                .map(err => err.message)
                .join(', ');
              errors.push(
                `Output '${outputName}' validation failed: ${messages}`
              );
            } else {
              errors.push(
                `Output '${outputName}' validation failed: ${validationError instanceof Error ? validationError.message : String(validationError)}`
              );
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
      errors.push(
        `Output validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate arbitrary data against a custom schema
   */
  validateData(data: unknown, schema: unknown): ValidationResult {
    try {
      if (isZodSchema(schema)) {
        schema.parse(data);
        return { valid: true, errors: [], warnings: [] };
      } else {
        // Simple type check
        return this.validateValueType(data, schema as string);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(err => err.message);
        return { valid: false, errors: messages, warnings: [] };
      } else {
        return {
          valid: false,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: []
        };
      }
    }
  }

  /**
   * Build Zod validators from the schema
   */
  private buildValidators(): void {
    // Build input validators
    for (const [inputName, inputSpec] of Object.entries(this.schema.inputs)) {
      const validator = this.buildZodSchema(
        inputSpec.type,
        inputSpec.validation,
        inputSpec.required
      );
      this.inputValidators.set(inputName, validator);
    }

    // Build output validators
    for (const [outputName, outputSpec] of Object.entries(
      this.schema.outputs
    )) {
      const validator = this.buildZodSchema(outputSpec.type, undefined, true);
      this.outputValidators.set(outputName, validator);
    }
  }

  /**
   * Build a Zod schema from type and validation specifications
   */
  private buildZodSchema(
    type: string,
    validationRule?: unknown,
    required: boolean = true
  ): z.ZodSchema {
    let schema: z.ZodSchema;

    // Base schema based on type
    switch (type) {
      case 'string': {
        schema = z.string();
        const validation = validationRule as
          | PrimitiveValidationRule
          | undefined;
        if (validation?.minLength !== undefined) {
          schema = (schema as z.ZodString).min(validation.minLength);
        }
        if (validation?.maxLength !== undefined) {
          schema = (schema as z.ZodString).max(validation.maxLength);
        }
        if (validation?.pattern) {
          const regex = tryCreateRegExp(validation.pattern);
          if (regex) {
            schema = (schema as z.ZodString).regex(regex);
          }
        }
        break;
      }

      case 'number': {
        schema = z.number();
        const validation = validationRule as
          | PrimitiveValidationRule
          | undefined;
        if (validation?.min !== undefined) {
          schema = (schema as z.ZodNumber).gte(validation.min);
        }
        if (validation?.max !== undefined) {
          schema = (schema as z.ZodNumber).lte(validation.max);
        }
        break;
      }

      case 'boolean': {
        schema = z.boolean();
        break;
      }

      case 'array': {
        schema = z.array(z.unknown());
        const validation = validationRule as
          | PrimitiveValidationRule
          | undefined;
        if (validation?.minLength !== undefined) {
          schema = (schema as z.ZodArray<z.ZodUnknown>).min(
            validation.minLength
          );
        }
        if (validation?.maxLength !== undefined) {
          schema = (schema as z.ZodArray<z.ZodUnknown>).max(
            validation.maxLength
          );
        }
        break;
      }

      case 'object': {
        schema = z.object({}).passthrough();
        break;
      }

      case 'any':
      default: {
        schema = z.unknown();
        break;
      }
    }

    const enumValues = Array.isArray(
      (validationRule as PrimitiveValidationRule | undefined)?.enum
    )
      ? (validationRule as PrimitiveValidationRule).enum?.filter(value =>
          isLiteralPrimitive(value)
        )
      : undefined;

    if (enumValues && enumValues.length > 0) {
      const literals = enumValues.map(value => z.literal(value));
      schema =
        literals.length === 1
          ? literals[0]
          : z.union(
              literals as [
                z.ZodLiteral<unknown>,
                z.ZodLiteral<unknown>,
                ...z.ZodLiteral<unknown>[]
              ]
            );
    }

    return required ? schema : schema.optional();
  }

  /**
   * Check if a type string is valid
   */
  private isValidType(type: string): boolean {
    const validTypes = [
      'string',
      'number',
      'boolean',
      'array',
      'object',
      'any'
    ];
    return validTypes.includes(type);
  }

  /**
   * Validate validation rules for consistency
   */
  private validateValidationRules(
    inputName: string,
    validation: unknown,
    type: string
  ): string[] {
    const errors: string[] = [];
    const val = validation as PrimitiveValidationRule | undefined;

    if (type === 'string') {
      if (val?.minLength !== undefined && val.minLength < 0) {
        errors.push(`Input '${inputName}': minLength cannot be negative`);
      }
      if (val?.maxLength !== undefined && val.maxLength < 0) {
        errors.push(`Input '${inputName}': maxLength cannot be negative`);
      }
      if (
        val?.minLength !== undefined &&
        val?.maxLength !== undefined &&
        val.minLength > val.maxLength
      ) {
        errors.push(
          `Input '${inputName}': minLength cannot be greater than maxLength`
        );
      }
      if (val?.min !== undefined || val?.max !== undefined) {
        errors.push(
          `Input '${inputName}': use minLength/maxLength for strings, not min/max`
        );
      }
      if (val?.pattern) {
        if (!tryCreateRegExp(val.pattern)) {
          errors.push(
            `Input '${inputName}': pattern must be a valid regular expression`
          );
        }
      }
    } else if (type === 'number') {
      if (
        val?.min !== undefined &&
        val?.max !== undefined &&
        val.min > val.max
      ) {
        errors.push(`Input '${inputName}': min cannot be greater than max`);
      }
      if (val?.minLength !== undefined || val?.maxLength !== undefined) {
        errors.push(
          `Input '${inputName}': use min/max for numbers, not minLength/maxLength`
        );
      }
      if (val?.pattern) {
        errors.push(
          `Input '${inputName}': pattern validation is only valid for strings`
        );
      }
    } else if (type === 'array') {
      if (val?.minLength !== undefined && val.minLength < 0) {
        errors.push(`Input '${inputName}': minLength cannot be negative`);
      }
      if (val?.maxLength !== undefined && val.maxLength < 0) {
        errors.push(`Input '${inputName}': maxLength cannot be negative`);
      }
      if (
        val?.minLength !== undefined &&
        val?.maxLength !== undefined &&
        val.minLength > val.maxLength
      ) {
        errors.push(
          `Input '${inputName}': minLength cannot be greater than maxLength`
        );
      }
      if (val?.min !== undefined || val?.max !== undefined) {
        errors.push(
          `Input '${inputName}': use minLength/maxLength for arrays, not min/max`
        );
      }
      if (val?.pattern) {
        errors.push(
          `Input '${inputName}': pattern validation is only valid for strings`
        );
      }
    }

    const enumValues = val && Array.isArray(val.enum) ? val.enum : undefined;

    if (enumValues) {
      const invalidEnumValues = enumValues.filter(
        enumValue => !valueMatchesDeclaredType(enumValue, type)
      );

      if (invalidEnumValues.length > 0) {
        errors.push(
          `Input '${inputName}': enum values must match the declared ${type} type`
        );
      }
    }

    return errors;
  }

  /**
   * Validate a value against a simple type
   */
  private validateValueType(value: unknown, type: string): ValidationResult {
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
        valid =
          typeof value === 'object' && value !== null && !Array.isArray(value);
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
