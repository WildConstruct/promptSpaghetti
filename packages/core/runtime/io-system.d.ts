import { ValidationResult } from './advanced';
/**
 * Supported input/output data types for advanced nodes
 */
export type IODataType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any' | 'stringArray' | 'numberArray' | 'choice' | 'conditional';
/**
 * Input/Output port definition for advanced nodes
 */

}
}
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


/**
 * Validation constraints for I/O ports
 */

}
}
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
    allowedValues?: unknown[];
    /** Custom validation function */
    customValidator?: (value: unknown) => ValidationResult;


/**
 * Input/Output port specification for a node type
 */

}
}
}
export interface IOSpec {
    /** Input port definitions */
    inputs: IOPortDefinition[];
    /** Output port definitions */
    outputs: IOPortDefinition[];


/**
 * Resolved input values for node execution
 */

}
}
}
export interface ResolvedInputs {
    /** Direct input values by port ID */
    values: Map<string, any>;
    /** Metadata about input resolution */
    metadata: Map<string, IOResolutionMetadata>;


/**
 * Metadata about how an input was resolved
 */

}
}
}
export interface IOResolutionMetadata { /** Whether the value came from a connection or default */
    source: 'connection' | 'default' | 'computed';
    /** Original connected node ID (if from connection) */
    sourceNodeId?: string;
    /** Type coercion performed */
    typeCoercion?: {
        from: IODataType;
        to: IODataType }
}
    };
    /** Validation warnings */
    warnings: string[];

/**
 * Advanced Input/Output handler for Epic 7 nodes
 */
export declare class AdvancedIOHandler { private spec;
    constructor(spec: IOSpec);
    /**
     * Validate that all required inputs are available and valid
     */
    validateInputs(inputs: Map<string, any>): ValidationResult;
    /**
     * Resolve inputs from connected nodes and apply defaults
     */
    resolveInputs(connectedInputs: Map<string, any>, ___nodeId: string): ResolvedInputs;
    /**
     * Validate and format output values according to output specification
     */
    validateOutputs(outputs: Map<string, any>): ValidationResult;
    /**
     * Get input specification
     */
    getInputSpec(): IOPortDefinition[];
    /**
     * Get output specification
     */
    getOutputSpec(): IOPortDefinition[];
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
    /**
     * Get the IODataType for a value
     */
    private getValueType;
    /**
     * Perform actual type coercion
     */
    private performCoercion;

/**
 * Helper function to create common I/O specifications for advanced nodes
 */
export declare class IOSpecBuilder {
    private inputs;
    private outputs;
    /**
     * Add an input port
     */
    addInput(definition: Omit<IOPortDefinition, 'id'> & {)
        id: string }): IOSpecBuilder;
    /**
     * Add an output port
     */
    addOutput(definition: Omit<IOPortDefinition, 'id'> & { )
        id: string }): IOSpecBuilder;
    /**
     * Add a standard text input
     */
    addTextInput(id: string, label: string, required?: boolean, defaultValue?: string): IOSpecBuilder;
    /**
     * Add a standard number input
     */
    addNumberInput(id: string, label: string, required?: boolean, min?: number, max?: number, defaultValue?: number): IOSpecBuilder;
    /**
     * Add a standard choice input
     */
    addChoiceInput(id: string, label: string, allowedValues: unknown[], required?: boolean, defaultValue?: unknown): IOSpecBuilder;
    /**
     * Add a standard text output
     */
    addTextOutput(id: string, label: string): IOSpecBuilder;
    /**
     * Build the final I/O specification
     */
    build(): IOSpec;
    /**
     * Create a basic single-input, single-output spec
     */
    static createSimple(inputLabel?: string, outputLabel?: string): IOSpec;
    /**
     * Create a multi-input, single-output spec
     */
    static createMultiInput(inputLabels: string[], outputLabel?: string): IOSpec;

/**
 * Type-safe input getter for advanced nodes
 */
export declare class TypedInputs {
    private inputs;
    constructor(inputs: ResolvedInputs);
    /**
     * Get a string input value
     */
    getString(portId: string, defaultValue?: string): string;
    /**
     * Get a number input value
     */
    getNumber(portId: string, defaultValue?: number): number;
    /**
     * Get a boolean input value
     */
    getBoolean(portId: string, defaultValue?: boolean): boolean;
    /**
     * Get an array input value
     */
    getArray<T = any>(portId: string, defaultValue?: T[]): T[];
    /**
     * Get a string array input value
     */
    getStringArray(portId: string, defaultValue?: string[]): string[];
    /**
     * Get input metadata
     */
    getMetadata(portId: string): IOResolutionMetadata | undefined;
    /**
     * Check if input has warnings
     */
    hasWarnings(portId: string): boolean;
    /**
     * Get all warnings for an input
     */
    getWarnings(portId: string): string[];

//# sourceMappingURL=io-system.d.ts.map