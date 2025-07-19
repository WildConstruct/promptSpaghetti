"use strict";
// packages/core/runtime/io-system.ts
// Standardized Input/Output handling system for Epic 7 advanced nodes
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedInputs = exports.IOSpecBuilder = exports.AdvancedIOHandler = void 0;
/**
 * Advanced Input/Output handler for Epic 7 nodes
 */
var AdvancedIOHandler = /** @class */ (function () {
    function AdvancedIOHandler(spec) {
        this.spec = spec;
    }
    /**
     * Validate that all required inputs are available and valid
     */
    AdvancedIOHandler.prototype.validateInputs = function (inputs) {
        var errors = [];
        var warnings = [];
        for (var _i = 0, _a = this.spec.inputs; _i < _a.length; _i++) {
            var inputDef = _a[_i];
            var value = inputs.get(inputDef.id);
            // Check required inputs
            if (inputDef.required && (value === undefined || value === null)) {
                if (inputDef.defaultValue === undefined) {
                    errors.push("Required input '".concat(inputDef.label, "' (").concat(inputDef.id, ") is missing"));
                    continue;
                }
            }
            // Validate input value if present
            if (value !== undefined && value !== null) {
                var validationResult = this.validateValue(value, inputDef);
                errors.push.apply(errors, validationResult.errors);
                warnings.push.apply(warnings, validationResult.warnings);
            }
        }
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    };
    /**
     * Resolve inputs from connected nodes and apply defaults
     */
    AdvancedIOHandler.prototype.resolveInputs = function (connectedInputs, nodeId) {
        var values = new Map();
        var metadata = new Map();
        for (var _i = 0, _a = this.spec.inputs; _i < _a.length; _i++) {
            var inputDef = _a[_i];
            var connectedValue = connectedInputs.get(inputDef.id);
            if (connectedValue !== undefined) {
                // Use connected value with potential type coercion
                var _b = this.coerceValue(connectedValue, inputDef.dataType), value = _b.value, coercion = _b.coercion, warnings = _b.warnings;
                values.set(inputDef.id, value);
                metadata.set(inputDef.id, {
                    source: 'connection',
                    sourceNodeId: 'unknown', // Would be resolved by engine
                    typeCoercion: coercion,
                    warnings: warnings
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
                    warnings: ["Missing required input: ".concat(inputDef.label)]
                });
            }
        }
        return { values: values, metadata: metadata };
    };
    /**
     * Validate and format output values according to output specification
     */
    AdvancedIOHandler.prototype.validateOutputs = function (outputs) {
        var errors = [];
        var warnings = [];
        for (var _i = 0, _a = this.spec.outputs; _i < _a.length; _i++) {
            var outputDef = _a[_i];
            var value = outputs.get(outputDef.id);
            if (value !== undefined && value !== null) {
                var validationResult = this.validateValue(value, outputDef);
                errors.push.apply(errors, validationResult.errors);
                warnings.push.apply(warnings, validationResult.warnings);
            }
        }
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    };
    /**
     * Get input specification
     */
    AdvancedIOHandler.prototype.getInputSpec = function () {
        return __spreadArray([], this.spec.inputs, true);
    };
    /**
     * Get output specification
     */
    AdvancedIOHandler.prototype.getOutputSpec = function () {
        return __spreadArray([], this.spec.outputs, true);
    };
    /**
     * Validate a value against a port definition
     */
    AdvancedIOHandler.prototype.validateValue = function (value, portDef) {
        var errors = [];
        var warnings = [];
        // Type validation
        if (!this.isValidType(value, portDef.dataType)) {
            errors.push("Invalid type for ".concat(portDef.label, ": expected ").concat(portDef.dataType, ", got ").concat(typeof value));
            return { valid: false, errors: errors, warnings: warnings };
        }
        // Constraint validation
        if (portDef.constraints) {
            var constraintResult = this.validateConstraints(value, portDef.constraints);
            errors.push.apply(errors, constraintResult.errors);
            warnings.push.apply(warnings, constraintResult.warnings);
        }
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    };
    /**
     * Check if value matches expected data type
     */
    AdvancedIOHandler.prototype.isValidType = function (value, dataType) {
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
                return Array.isArray(value) && value.every(function (v) { return typeof v === 'string'; });
            case 'numberArray':
                return Array.isArray(value) && value.every(function (v) { return typeof v === 'number'; });
            case 'any':
                return true;
            case 'choice':
                return typeof value === 'string' || typeof value === 'number';
            case 'conditional':
                return typeof value === 'boolean' || typeof value === 'string';
            default:
                return false;
        }
    };
    /**
     * Validate value against constraints
     */
    AdvancedIOHandler.prototype.validateConstraints = function (value, constraints) {
        var errors = [];
        var warnings = [];
        // Numeric constraints
        if (typeof value === 'number') {
            if (constraints.min !== undefined && value < constraints.min) {
                errors.push("Value ".concat(value, " is below minimum ").concat(constraints.min));
            }
            if (constraints.max !== undefined && value > constraints.max) {
                errors.push("Value ".concat(value, " is above maximum ").concat(constraints.max));
            }
        }
        // Length constraints
        if (typeof value === 'string' || Array.isArray(value)) {
            var length_1 = value.length;
            if (constraints.minLength !== undefined && length_1 < constraints.minLength) {
                errors.push("Length ".concat(length_1, " is below minimum ").concat(constraints.minLength));
            }
            if (constraints.maxLength !== undefined && length_1 > constraints.maxLength) {
                errors.push("Length ".concat(length_1, " is above maximum ").concat(constraints.maxLength));
            }
        }
        // Pattern constraints (for strings)
        if (typeof value === 'string' && constraints.pattern) {
            var regex = new RegExp(constraints.pattern);
            if (!regex.test(value)) {
                errors.push("Value does not match required pattern: ".concat(constraints.pattern));
            }
        }
        // Allowed values constraints
        if (constraints.allowedValues && !constraints.allowedValues.includes(value)) {
            errors.push("Value '".concat(value, "' is not in allowed values: ").concat(constraints.allowedValues.join(', ')));
        }
        // Custom validation
        if (constraints.customValidator) {
            var customResult = constraints.customValidator(value);
            errors.push.apply(errors, customResult.errors);
            warnings.push.apply(warnings, customResult.warnings);
        }
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    };
    /**
     * Coerce value to target data type with warnings
     */
    AdvancedIOHandler.prototype.coerceValue = function (value, targetType) {
        var warnings = [];
        var originalType = this.getValueType(value);
        // No coercion needed if types match
        if (originalType === targetType || targetType === 'any') {
            return { value: value, warnings: warnings };
        }
        // Attempt type coercion
        try {
            var coercedValue = this.performCoercion(value, originalType, targetType);
            return {
                value: coercedValue,
                coercion: { from: originalType, to: targetType },
                warnings: ["Type coerced from ".concat(originalType, " to ").concat(targetType)]
            };
        }
        catch (error) {
            var errorMessage = error instanceof Error ? error.message : String(error);
            warnings.push("Type coercion failed: ".concat(errorMessage));
            return { value: value, warnings: warnings };
        }
    };
    /**
     * Get the IODataType for a value
     */
    AdvancedIOHandler.prototype.getValueType = function (value) {
        if (typeof value === 'string')
            return 'string';
        if (typeof value === 'number')
            return 'number';
        if (typeof value === 'boolean')
            return 'boolean';
        if (Array.isArray(value)) {
            if (value.every(function (v) { return typeof v === 'string'; }))
                return 'stringArray';
            if (value.every(function (v) { return typeof v === 'number'; }))
                return 'numberArray';
            return 'array';
        }
        if (typeof value === 'object' && value !== null)
            return 'object';
        return 'any';
    };
    /**
     * Perform actual type coercion
     */
    AdvancedIOHandler.prototype.performCoercion = function (value, from, to) {
        switch (to) {
            case 'string':
                return String(value);
            case 'number':
                var num = Number(value);
                if (isNaN(num))
                    throw new Error("Cannot convert ".concat(value, " to number"));
                return num;
            case 'boolean':
                if (typeof value === 'string') {
                    return value.toLowerCase() === 'true' || value === '1';
                }
                return Boolean(value);
            case 'array':
                return Array.isArray(value) ? value : [value];
            case 'stringArray':
                var arr = Array.isArray(value) ? value : [value];
                return arr.map(function (v) { return String(v); });
            case 'numberArray':
                var numArr = Array.isArray(value) ? value : [value];
                return numArr.map(function (v) {
                    var n = Number(v);
                    if (isNaN(n))
                        throw new Error("Cannot convert ".concat(v, " to number"));
                    return n;
                });
            default:
                throw new Error("Cannot coerce to type ".concat(to));
        }
    };
    return AdvancedIOHandler;
}());
exports.AdvancedIOHandler = AdvancedIOHandler;
/**
 * Helper function to create common I/O specifications for advanced nodes
 */
var IOSpecBuilder = /** @class */ (function () {
    function IOSpecBuilder() {
        this.inputs = [];
        this.outputs = [];
    }
    /**
     * Add an input port
     */
    IOSpecBuilder.prototype.addInput = function (definition) {
        this.inputs.push(definition);
        return this;
    };
    /**
     * Add an output port
     */
    IOSpecBuilder.prototype.addOutput = function (definition) {
        this.outputs.push(definition);
        return this;
    };
    /**
     * Add a standard text input
     */
    IOSpecBuilder.prototype.addTextInput = function (id, label, required, defaultValue) {
        if (required === void 0) { required = false; }
        return this.addInput({
            id: id,
            label: label,
            dataType: 'string',
            required: required,
            defaultValue: defaultValue,
            description: "Text input for ".concat(label.toLowerCase())
        });
    };
    /**
     * Add a standard number input
     */
    IOSpecBuilder.prototype.addNumberInput = function (id, label, required, min, max, defaultValue) {
        if (required === void 0) { required = false; }
        return this.addInput({
            id: id,
            label: label,
            dataType: 'number',
            required: required,
            defaultValue: defaultValue,
            constraints: { min: min, max: max },
            description: "Numeric input for ".concat(label.toLowerCase())
        });
    };
    /**
     * Add a standard choice input
     */
    IOSpecBuilder.prototype.addChoiceInput = function (id, label, allowedValues, required, defaultValue) {
        if (required === void 0) { required = false; }
        return this.addInput({
            id: id,
            label: label,
            dataType: 'choice',
            required: required,
            defaultValue: defaultValue,
            constraints: { allowedValues: allowedValues },
            description: "Choice input for ".concat(label.toLowerCase())
        });
    };
    /**
     * Add a standard text output
     */
    IOSpecBuilder.prototype.addTextOutput = function (id, label) {
        return this.addOutput({
            id: id,
            label: label,
            dataType: 'string',
            required: true,
            description: "Text output for ".concat(label.toLowerCase())
        });
    };
    /**
     * Build the final I/O specification
     */
    IOSpecBuilder.prototype.build = function () {
        return {
            inputs: __spreadArray([], this.inputs, true),
            outputs: __spreadArray([], this.outputs, true)
        };
    };
    /**
     * Create a basic single-input, single-output spec
     */
    IOSpecBuilder.createSimple = function (inputLabel, outputLabel) {
        if (inputLabel === void 0) { inputLabel = 'Input'; }
        if (outputLabel === void 0) { outputLabel = 'Output'; }
        return new IOSpecBuilder()
            .addTextInput('input', inputLabel, false, '')
            .addTextOutput('output', outputLabel)
            .build();
    };
    /**
     * Create a multi-input, single-output spec
     */
    IOSpecBuilder.createMultiInput = function (inputLabels, outputLabel) {
        if (outputLabel === void 0) { outputLabel = 'Output'; }
        var builder = new IOSpecBuilder();
        inputLabels.forEach(function (label, index) {
            builder.addTextInput("input".concat(index), label, false, '');
        });
        return builder
            .addTextOutput('output', outputLabel)
            .build();
    };
    return IOSpecBuilder;
}());
exports.IOSpecBuilder = IOSpecBuilder;
/**
 * Type-safe input getter for advanced nodes
 */
var TypedInputs = /** @class */ (function () {
    function TypedInputs(inputs) {
        this.inputs = inputs;
    }
    /**
     * Get a string input value
     */
    TypedInputs.prototype.getString = function (portId, defaultValue) {
        if (defaultValue === void 0) { defaultValue = ''; }
        var value = this.inputs.values.get(portId);
        return typeof value === 'string' ? value : String(value !== null && value !== void 0 ? value : defaultValue);
    };
    /**
     * Get a number input value
     */
    TypedInputs.prototype.getNumber = function (portId, defaultValue) {
        if (defaultValue === void 0) { defaultValue = 0; }
        var value = this.inputs.values.get(portId);
        return typeof value === 'number' ? value : Number(value !== null && value !== void 0 ? value : defaultValue);
    };
    /**
     * Get a boolean input value
     */
    TypedInputs.prototype.getBoolean = function (portId, defaultValue) {
        if (defaultValue === void 0) { defaultValue = false; }
        var value = this.inputs.values.get(portId);
        return typeof value === 'boolean' ? value : Boolean(value !== null && value !== void 0 ? value : defaultValue);
    };
    /**
     * Get an array input value
     */
    TypedInputs.prototype.getArray = function (portId, defaultValue) {
        if (defaultValue === void 0) { defaultValue = []; }
        var value = this.inputs.values.get(portId);
        return Array.isArray(value) ? value : defaultValue;
    };
    /**
     * Get a string array input value
     */
    TypedInputs.prototype.getStringArray = function (portId, defaultValue) {
        if (defaultValue === void 0) { defaultValue = []; }
        var value = this.inputs.values.get(portId);
        if (Array.isArray(value)) {
            return value.map(function (v) { return String(v); });
        }
        return defaultValue;
    };
    /**
     * Get input metadata
     */
    TypedInputs.prototype.getMetadata = function (portId) {
        return this.inputs.metadata.get(portId);
    };
    /**
     * Check if input has warnings
     */
    TypedInputs.prototype.hasWarnings = function (portId) {
        var metadata = this.getMetadata(portId);
        return metadata ? metadata.warnings.length > 0 : false;
    };
    /**
     * Get all warnings for an input
     */
    TypedInputs.prototype.getWarnings = function (portId) {
        var metadata = this.getMetadata(portId);
        return metadata ? metadata.warnings : [];
    };
    return TypedInputs;
}());
exports.TypedInputs = TypedInputs;
