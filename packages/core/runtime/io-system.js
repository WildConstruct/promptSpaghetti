"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedInputs = exports.IOSpecBuilder = exports.AdvancedIOHandler = void 0;
class AdvancedIOHandler {
    constructor(spec) {
        this.spec = spec;
    }
    validateInputs(inputs) {
        const errors = [];
        const warnings = [];
        for (const inputDef of this.spec.inputs) {
            const value = inputs.get(inputDef.id);
            if (inputDef.required && (value === undefined || value === null)) {
                if (inputDef.defaultValue === undefined) {
                    errors.push(`Required input '${inputDef.label}' (${inputDef.id}) is missing`);
                    continue;
                }
            }
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
    resolveInputs(connectedInputs, nodeId) {
        const values = new Map();
        const metadata = new Map();
        for (const inputDef of this.spec.inputs) {
            const connectedValue = connectedInputs.get(inputDef.id);
            if (connectedValue !== undefined) {
                const { value, coercion, warnings } = this.coerceValue(connectedValue, inputDef.dataType);
                values.set(inputDef.id, value);
                metadata.set(inputDef.id, {
                    source: 'connection',
                    sourceNodeId: 'unknown',
                    typeCoercion: coercion,
                    warnings
                });
            }
            else if (inputDef.defaultValue !== undefined) {
                values.set(inputDef.id, inputDef.defaultValue);
                metadata.set(inputDef.id, {
                    source: 'default',
                    warnings: []
                });
            }
            else if (inputDef.required) {
                metadata.set(inputDef.id, {
                    source: 'default',
                    warnings: [`Missing required input: ${inputDef.label}`]
                });
            }
        }
        return { values, metadata };
    }
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
    getInputSpec() {
        return [...this.spec.inputs];
    }
    getOutputSpec() {
        return [...this.spec.outputs];
    }
    validateValue(value, portDef) {
        const errors = [];
        const warnings = [];
        if (!this.isValidType(value, portDef.dataType)) {
            errors.push(`Invalid type for ${portDef.label}: expected ${portDef.dataType}, got ${typeof value}`);
            return { valid: false, errors, warnings };
        }
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
    validateConstraints(value, constraints) {
        const errors = [];
        const warnings = [];
        if (typeof value === 'number') {
            if (constraints.min !== undefined && value < constraints.min) {
                errors.push(`Value ${value} is below minimum ${constraints.min}`);
            }
            if (constraints.max !== undefined && value > constraints.max) {
                errors.push(`Value ${value} is above maximum ${constraints.max}`);
            }
        }
        if (typeof value === 'string' || Array.isArray(value)) {
            const length = value.length;
            if (constraints.minLength !== undefined && length < constraints.minLength) {
                errors.push(`Length ${length} is below minimum ${constraints.minLength}`);
            }
            if (constraints.maxLength !== undefined && length > constraints.maxLength) {
                errors.push(`Length ${length} is above maximum ${constraints.maxLength}`);
            }
        }
        if (typeof value === 'string' && constraints.pattern) {
            const regex = new RegExp(constraints.pattern);
            if (!regex.test(value)) {
                errors.push(`Value does not match required pattern: ${constraints.pattern}`);
            }
        }
        if (constraints.allowedValues && !constraints.allowedValues.includes(value)) {
            errors.push(`Value '${value}' is not in allowed values: ${constraints.allowedValues.join(', ')}`);
        }
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
    coerceValue(value, targetType) {
        const warnings = [];
        const originalType = this.getValueType(value);
        if (originalType === targetType || targetType === 'any') {
            return { value, warnings };
        }
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
exports.AdvancedIOHandler = AdvancedIOHandler;
class IOSpecBuilder {
    constructor() {
        this.inputs = [];
        this.outputs = [];
    }
    addInput(definition) {
        this.inputs.push(definition);
        return this;
    }
    addOutput(definition) {
        this.outputs.push(definition);
        return this;
    }
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
    addTextOutput(id, label) {
        return this.addOutput({
            id,
            label,
            dataType: 'string',
            required: true,
            description: `Text output for ${label.toLowerCase()}`
        });
    }
    build() {
        return {
            inputs: [...this.inputs],
            outputs: [...this.outputs]
        };
    }
    static createSimple(inputLabel = 'Input', outputLabel = 'Output') {
        return new IOSpecBuilder()
            .addTextInput('input', inputLabel, false, '')
            .addTextOutput('output', outputLabel)
            .build();
    }
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
exports.IOSpecBuilder = IOSpecBuilder;
class TypedInputs {
    constructor(inputs) {
        this.inputs = inputs;
    }
    getString(portId, defaultValue = '') {
        const value = this.inputs.values.get(portId);
        return typeof value === 'string' ? value : String(value ?? defaultValue);
    }
    getNumber(portId, defaultValue = 0) {
        const value = this.inputs.values.get(portId);
        return typeof value === 'number' ? value : Number(value ?? defaultValue);
    }
    getBoolean(portId, defaultValue = false) {
        const value = this.inputs.values.get(portId);
        return typeof value === 'boolean' ? value : Boolean(value ?? defaultValue);
    }
    getArray(portId, defaultValue = []) {
        const value = this.inputs.values.get(portId);
        return Array.isArray(value) ? value : defaultValue;
    }
    getStringArray(portId, defaultValue = []) {
        const value = this.inputs.values.get(portId);
        if (Array.isArray(value)) {
            return value.map(v => String(v));
        }
        return defaultValue;
    }
    getMetadata(portId) {
        return this.inputs.metadata.get(portId);
    }
    hasWarnings(portId) {
        const metadata = this.getMetadata(portId);
        return metadata ? metadata.warnings.length > 0 : false;
    }
    getWarnings(portId) {
        const metadata = this.getMetadata(portId);
        return metadata ? metadata.warnings : [];
    }
}
exports.TypedInputs = TypedInputs;
//# sourceMappingURL=io-system.js.map