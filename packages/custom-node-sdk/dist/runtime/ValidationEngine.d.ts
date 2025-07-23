/**
 * @fileoverview ValidationEngine - Validates inputs, outputs, and schemas for custom nodes
 * Provides comprehensive validation using Zod schemas and custom rules
 */
import { ValidationResult } from '@prompt-spaghetti/graph-core';
import { NodeIOSchema } from '../types';
/**
 * Validation engine for custom node inputs, outputs, and schemas
 */
export declare class ValidationEngine {
    private schema;
    private inputValidators;
    private outputValidators;
    constructor(schema: NodeIOSchema);
    /**
     * Validate the node's I/O schema definition
     */
    validateSchema(): ValidationResult;
    /**
     * Validate input values against the schema
     */
    validateInputs(inputs: Record<string, any>): ValidationResult;
    /**
     * Validate output values against the schema
     */
    validateOutputs(outputs: Record<string, any>): ValidationResult;
    /**
     * Validate arbitrary data against a custom schema
     */
    validateData(data: any, schema: any): ValidationResult;
    /**
     * Build Zod validators from the schema
     */
    private buildValidators;
    /**
     * Build a Zod schema from type and validation specifications
     */
    private buildZodSchema;
    /**
     * Check if a type string is valid
     */
    private isValidType;
    /**
     * Validate validation rules for consistency
     */
    private validateValidationRules;
    /**
     * Validate a value against a simple type
     */
    private validateValueType;
}
//# sourceMappingURL=ValidationEngine.d.ts.map