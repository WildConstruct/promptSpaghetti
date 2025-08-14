/**
 * VariableNode - A node that stores and retrieves variables with inline editing
 * Can act as both setter and getter depending on configuration
 */
import { BaseInlineEditableNode } from './BaseInlineEditableNode';
// Simple security validation for variable names
const SecurityValidation = {
    validateVariableName(name) {
        // Allow alphanumeric, underscores, max 64 chars
        return /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/.test(name);
    }
};
/**
 * Variable node implementation with inline editing support
 */
export class VariableNode extends BaseInlineEditableNode {
    nodeConfig;
    input = undefined;
    constructor(id, initialConfig = { name: 'unnamed' }, config = {}) {
        super(id, initialConfig, config);
        this.nodeConfig = {
            variableType: 'any',
            scope: 'local',
            mode: 'both',
            ...config
        };
    }
    /**
     * Set the input value for setter mode
     */
    setInput(value) {
        this.input = value;
    }
    /**
     * Execute the node - get or set variable based on mode
     */
    async run(ctx) {
        const config = this.getCurrentValue();
        const mode = this.nodeConfig.mode || 'both';
        // Validate variable name
        if (!SecurityValidation.validateVariableName(config.name)) {
            throw new Error(`Invalid variable name: ${config.name}`);
        }
        if (mode === 'set' || mode === 'both') {
            // Set variable mode
            const valueToSet = this.input !== undefined ? this.input : config.currentValue;
            if (valueToSet !== undefined) {
                // Validate type if configured
                if (this.nodeConfig.variableType !== 'any' &&
                    !this.validateType(valueToSet)) {
                    throw new Error(`Type mismatch: expected ${this.nodeConfig.variableType}, got ${typeof valueToSet}`);
                }
                // Store the value
                ctx.variables[config.name] = this.sanitizeValue(valueToSet);
            }
        }
        if (mode === 'get' || mode === 'both') {
            // Get variable mode
            if (Object.prototype.hasOwnProperty.call(ctx.variables, config.name)) {
                return ctx.variables[config.name];
            }
            else {
                return config.defaultValue;
            }
        }
        // For set-only mode, return the value that was set
        return this.input !== undefined ? this.input : config.currentValue;
    }
    /**
     * Clone the configuration value
     */
    cloneValue(value) {
        return {
            name: value.name,
            defaultValue: this.cloneAny(value.defaultValue),
            currentValue: this.cloneAny(value.currentValue)
        };
    }
    /**
     * Deep clone any value
     */
    cloneAny(value) {
        if (value === null || value === undefined) {
            return value;
        }
        if (typeof value !== 'object') {
            return value;
        }
        // Use JSON for deep cloning (handles arrays and objects)
        try {
            return JSON.parse(JSON.stringify(value));
        }
        catch {
            return value;
        }
    }
    /**
     * Sanitize value to prevent prototype pollution
     */
    sanitizeValue(value) {
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
    validateType(value) {
        const type = this.nodeConfig.variableType;
        if (type === 'any')
            return true;
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
                return (value !== null && typeof value === 'object' && !Array.isArray(value));
            default:
                return false;
        }
    }
    /**
     * Validate the configuration
     */
    async validateValue(value) {
        const errors = [];
        // Check if value is an object
        if (!value || typeof value !== 'object') {
            errors.push('Configuration must be an object');
            return { valid: false, errors };
        }
        // Validate variable name
        if (typeof value.name !== 'string') {
            errors.push('Variable name must be a string');
        }
        else if (!SecurityValidation.validateVariableName(value.name)) {
            errors.push('Invalid variable name: must be alphanumeric with underscores, max 64 chars');
        }
        // Validate currentValue type if specified
        if (value.currentValue !== undefined &&
            this.nodeConfig.variableType !== 'any') {
            if (!this.validateType(value.currentValue)) {
                errors.push(`Current value type mismatch: expected ${this.nodeConfig.variableType}`);
            }
        }
        // Validate defaultValue type if specified
        if (value.defaultValue !== undefined &&
            this.nodeConfig.variableType !== 'any') {
            if (!this.validateType(value.defaultValue)) {
                errors.push(`Default value type mismatch: expected ${this.nodeConfig.variableType}`);
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
    getNodeType() {
        return 'Variable';
    }
    /**
     * Update variable name
     */
    setVariableName(name) {
        const config = this.getCurrentValue();
        const updated = { ...config, name };
        if (this.isEditing()) {
            this.updateEditBuffer(updated);
        }
        else {
            this.data.value = updated;
        }
    }
    /**
     * Get variable name
     */
    getVariableName() {
        return this.getCurrentValue().name;
    }
    /**
     * Update default value
     */
    setDefaultValue(defaultValue) {
        if (this.nodeConfig.variableType !== 'any' &&
            !this.validateType(defaultValue)) {
            throw new Error(`Type mismatch: expected ${this.nodeConfig.variableType}`);
        }
        const config = this.getCurrentValue();
        const updated = { ...config, defaultValue };
        if (this.isEditing()) {
            this.updateEditBuffer(updated);
        }
        else {
            this.data.value = updated;
        }
    }
    /**
     * Get default value
     */
    getDefaultValue() {
        return this.getCurrentValue().defaultValue;
    }
    /**
     * Update current value
     */
    setCurrentValue(currentValue) {
        if (this.nodeConfig.variableType !== 'any' &&
            !this.validateType(currentValue)) {
            throw new Error(`Type mismatch: expected ${this.nodeConfig.variableType}`);
        }
        const config = this.getCurrentValue();
        const updated = { ...config, currentValue };
        if (this.isEditing()) {
            this.updateEditBuffer(updated);
        }
        else {
            this.data.value = updated;
        }
    }
    /**
     * Get current value
     */
    getCurrentValueData() {
        return this.getCurrentValue().currentValue;
    }
    /**
     * Set variable type
     */
    setVariableType(type) {
        this.nodeConfig.variableType = type;
        // Revalidate current values
        const config = this.getCurrentValue();
        const errors = [];
        if (config.currentValue !== undefined &&
            !this.validateType(config.currentValue)) {
            errors.push('Current value does not match new type');
        }
        if (config.defaultValue !== undefined &&
            !this.validateType(config.defaultValue)) {
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
    getVariableType() {
        return this.nodeConfig.variableType || 'any';
    }
    /**
     * Set operation mode
     */
    setMode(mode) {
        this.nodeConfig.mode = mode;
    }
    /**
     * Get operation mode
     */
    getMode() {
        return this.nodeConfig.mode || 'both';
    }
    /**
     * Set variable scope
     */
    setScope(scope) {
        this.nodeConfig.scope = scope;
    }
    /**
     * Get variable scope
     */
    getScope() {
        return this.nodeConfig.scope || 'local';
    }
    /**
     * Get node configuration
     */
    getNodeConfig() {
        return { ...this.nodeConfig };
    }
    /**
     * Enhanced serialization
     */
    serialize() {
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
