import { ValidationResult } from './advanced';
/**
 * Supported input/output data types for advanced nodes
 */
export type IODataType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any' | 'stringArray' | 'numberArray' | 'choice' | 'conditional';
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
    defaultValue?: unknown;
    /** Validation constraints */
    constraints?: IOConstraints;
    /** Human-readable description */
    description?: string;
    /** Whether this port supports multiple connections */
    multiple?: boolean;
}
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
    allowedValues?: unknown;
    /** Custom validation function */
    customValidator?: (value: unknown) => ValidationResult;
}
export interface IOSpec {
    /** Input port definitions */
    inputs: IOPortDefinition;
    /** Output port definitions */
    outputs: IOPortDefinition;
}
export interface ResolvedInputs {
    /** Direct input values by port ID */
    values: Map<string, any>;
    /** Metadata about input resolution */
    metadata: Map<string, IOResolutionMetadata>;
}
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
    warnings: string;
}
export declare class AdvancedIOHandler {
    private spec;
    constructor(spec: IOSpec);
    /**
     * Validate that all required inputs are available and valid
     */
    validateInputs(inputs: Map<string, any>): ValidationResult;
    /**
     * Validate a value against a port definition
     */
    private validateValue;
    /**
     * Check if value matches expected data type
     */
    private isValidType;
    /**
     * Validate value against constraints
     */
    private validateConstraints;
    /**
     * Coerce value to target data type with warnings
     */
    private coerceValue;
}
//# sourceMappingURL=io-system.d.ts.map