/**
 * ConcatNode - A node that concatenates inputs with configurable separator
 * Supports trimming inputs and custom separators with inline editing
 */
import { BaseInlineEditableNode } from './BaseInlineEditableNode';
/**
 * Concat node implementation with inline editing support
 */
export class ConcatNode extends BaseInlineEditableNode {
    inputs = [];
    constructor(id, initialConfig = { separator: ' ', trimInputs: true }, config = {}) {
        super(id, initialConfig, config);
    }
    /**
     * Set the inputs to concatenate
     * This would typically be called by the graph execution engine
     */
    setInputs(inputs) {
        this.inputs = inputs;
    }
    /**
     * Execute the node - concatenate inputs with separator
     */
    async run(ctx) {
        const config = this.getCurrentValue();
        // Process inputs based on configuration
        const processedInputs = this.inputs
            .map(input => {
            // Convert to string if needed
            const str = String(input || '');
            // Trim if configured
            return config.trimInputs ? str.trim() : str;
        })
            .filter(input => {
            // Filter out empty strings if trimming is enabled
            return !config.trimInputs || input.length > 0;
        });
        // Join with separator
        return processedInputs.join(config.separator);
    }
    /**
     * Clone the configuration value
     */
    cloneValue(value) {
        return { ...value };
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
        // Validate separator
        if (typeof value.separator !== 'string') {
            errors.push('Separator must be a string');
        }
        // Validate trimInputs
        if (typeof value.trimInputs !== 'boolean') {
            errors.push('trimInputs must be a boolean');
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
        return 'Concat';
    }
    /**
     * Update separator
     */
    setSeparator(separator) {
        const config = this.getCurrentValue();
        const updated = { ...config, separator };
        if (this.isEditing()) {
            this.updateEditBuffer(updated);
        }
        else {
            this.data.value = updated;
        }
    }
    /**
     * Get current separator
     */
    getSeparator() {
        return this.getCurrentValue().separator;
    }
    /**
     * Update trim inputs setting
     */
    setTrimInputs(trimInputs) {
        const config = this.getCurrentValue();
        const updated = { ...config, trimInputs };
        if (this.isEditing()) {
            this.updateEditBuffer(updated);
        }
        else {
            this.data.value = updated;
        }
    }
    /**
     * Get trim inputs setting
     */
    getTrimInputs() {
        return this.getCurrentValue().trimInputs;
    }
    /**
     * Get common separator presets
     */
    static getSeparatorPresets() {
        return [
            { label: 'Space', value: ' ' },
            { label: 'Comma', value: ', ' },
            { label: 'Newline', value: '\n' },
            { label: 'Tab', value: '\t' },
            { label: 'Pipe', value: ' | ' },
            { label: 'Dash', value: ' - ' },
            { label: 'None', value: '' }
        ];
    }
    /**
     * Preview the concatenation result with sample inputs
     */
    preview(sampleInputs) {
        const config = this.getCurrentValue();
        const processed = sampleInputs
            .map(input => {
            const str = String(input || '');
            return config.trimInputs ? str.trim() : str;
        })
            .filter(input => {
            return !config.trimInputs || input.length > 0;
        });
        return processed.join(config.separator);
    }
    /**
     * Get the current input count
     */
    getInputCount() {
        return this.inputs.length;
    }
    /**
     * Clear all inputs
     */
    clearInputs() {
        this.inputs = [];
    }
    /**
     * Enhanced serialization
     */
    serialize() {
        const base = super.serialize();
        return {
            ...base,
            metadata: {
                inputCount: this.inputs.length,
                separatorLength: this.data.value.separator.length,
                separatorDisplay: this.getSeparatorDisplay()
            }
        };
    }
    /**
     * Get a display-friendly representation of the separator
     */
    getSeparatorDisplay() {
        const sep = this.data.value.separator;
        // Handle special characters
        switch (sep) {
            case ' ':
                return 'Space';
            case '\n':
                return 'Newline';
            case '\t':
                return 'Tab';
            case '':
                return 'None';
            default:
                // Show the separator with quotes if it contains whitespace
                return /^\s*$/.test(sep) ? `"${sep}"` : sep;
        }
    }
}
