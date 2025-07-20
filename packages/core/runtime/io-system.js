// packages/core/runtime/io-system.ts
// Standardized Input/Output handling system for Epic 7 advanced nodes
/**
 * Advanced Input/Output handler for Epic 7 nodes
 */
export class AdvancedIOHandler {
    spec;
    constructor(spec) {
        this.spec = spec;
    }
    /**
     * Validate that all required inputs are available and valid
     */
    validateInputs(inputs) {
        const errors = [];
        const warnings = [];
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
    resolveInputs(connectedInputs, nodeId) {
        const values = new Map();
        const metadata = new Map();
        for (const inputDef of this.spec.inputs) {
            const connectedValue = connectedInputs.get(inputDef.id);
            if (connectedValue !== undefined) {
                // Use connected value with potential type coercion
                const { value, coercion, warnings } = this.coerceValue(connectedValue, inputDef.dataType);
                values.set(inputDef.id, value);
                metadata.set(inputDef.id, {
                    source: 'connection',
                    sourceNodeId: 'unknown', // Would be resolved by engine
                    typeCoercion: coercion,
                    warnings
                });
            }
            else if (inputDef.defaultValue !== undefined) {
                // Use default value
                values.set(inputDef.id, inputDef.defaultValue);
                metadata.set(inputDef.id, {
                    source: 'default',
                    warnings: []
                });
            }
            else if (inputDef.required) {
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
    validateOutputs(outputs) {
        const errors = [];
        const warnings = [];
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
    getInputSpec() {
        return [...this.spec.inputs];
    }
    /**
     * Get output specification
     */
    getOutputSpec() {
        return [...this.spec.outputs];
    }
    /**
     * Validate a value against a port definition
     */
    validateValue(value, portDef) {
        const errors = [];
        const warnings = [];
        // Type validation
        if (!this.isValidType(value, portDef.dataType)) {
            errors.push(`Invalid type for ${portDef.label}: expected ${portDef.dataType}, got ${typeof value}`);
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
    isValidType(value, dataType) {
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
    validateConstraints(value, constraints) {
        const errors = [];
        const warnings = [];
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
    coerceValue(value, targetType) {
        const warnings = [];
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            warnings.push(`Type coercion failed: ${errorMessage}`);
            return { value, warnings };
        }
    }
    /**
     * Get the IODataType for a value
     */
    getValueType(value) {
        if (typeof value === 'string')
            return 'string';
        if (typeof value === 'number')
            return 'number';
        if (typeof value === 'boolean')
            return 'boolean';
        if (Array.isArray(value)) {
            if (value.every(v => typeof v === 'string'))
                return 'stringArray';
            if (value.every(v => typeof v === 'number'))
                return 'numberArray';
            return 'array';
        }
        if (typeof value === 'object' && value !== null)
            return 'object';
        return 'any';
    }
    /**
     * Perform actual type coercion
     */
    performCoercion(value, from, to) {
        switch (to) {
            case 'string':
                return String(value);
            case 'number':
                const num = Number(value);
                if (isNaN(num))
                    throw new Error(`Cannot convert ${value} to number`);
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
                    if (isNaN(n))
                        throw new Error(`Cannot convert ${v} to number`);
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
    inputs = [];
    outputs = [];
    /**
     * Add an input port
     */
    addInput(definition) {
        this.inputs.push(definition);
        return this;
    }
    /**
     * Add an output port
     */
    addOutput(definition) {
        this.outputs.push(definition);
        return this;
    }
    /**
     * Add a standard text input
     */
    addTextInput(id, label, required = false, defaultValue) {
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
    addNumberInput(id, label, required = false, min, max, defaultValue) {
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
    addChoiceInput(id, label, allowedValues, required = false, defaultValue) {
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
    addTextOutput(id, label) {
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
    build() {
        return {
            inputs: [...this.inputs],
            outputs: [...this.outputs]
        };
    }
    /**
     * Create a basic single-input, single-output spec
     */
    static createSimple(inputLabel = 'Input', outputLabel = 'Output') {
        return new IOSpecBuilder()
            .addTextInput('input', inputLabel, false, '')
            .addTextOutput('output', outputLabel)
            .build();
    }
    /**
     * Create a multi-input, single-output spec
     */
    static createMultiInput(inputLabels, outputLabel = 'Output') {
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
    inputs;
    constructor(inputs) {
        this.inputs = inputs;
    }
    /**
     * Get a string input value
     */
    getString(portId, defaultValue = '') {
        const value = this.inputs.values.get(portId);
        return typeof value === 'string' ? value : String(value ?? defaultValue);
    }
    /**
     * Get a number input value
     */
    getNumber(portId, defaultValue = 0) {
        const value = this.inputs.values.get(portId);
        return typeof value === 'number' ? value : Number(value ?? defaultValue);
    }
    /**
     * Get a boolean input value
     */
    getBoolean(portId, defaultValue = false) {
        const value = this.inputs.values.get(portId);
        return typeof value === 'boolean' ? value : Boolean(value ?? defaultValue);
    }
    /**
     * Get an array input value
     */
    getArray(portId, defaultValue = []) {
        const value = this.inputs.values.get(portId);
        return Array.isArray(value) ? value : defaultValue;
    }
    /**
     * Get a string array input value
     */
    getStringArray(portId, defaultValue = []) {
        const value = this.inputs.values.get(portId);
        if (Array.isArray(value)) {
            return value.map(v => String(v));
        }
        return defaultValue;
    }
    /**
     * Get input metadata
     */
    getMetadata(portId) {
        return this.inputs.metadata.get(portId);
    }
    /**
     * Check if input has warnings
     */
    hasWarnings(portId) {
        const metadata = this.getMetadata(portId);
        return metadata ? metadata.warnings.length > 0 : false;
    }
    /**
     * Get all warnings for an input
     */
    getWarnings(portId) {
        const metadata = this.getMetadata(portId);
        return metadata ? metadata.warnings : [];
    }
}
