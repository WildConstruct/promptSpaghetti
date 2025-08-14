/**
 * TextBlockNode - A simple text content node with inline editing support
 * This node stores and outputs text content, supporting multiline text and length constraints
 */
import { BaseInlineEditableNode } from './BaseInlineEditableNode';
/**
 * TextBlock node implementation with inline editing support
 */
export class TextBlockNode extends BaseInlineEditableNode {
    config;
    constructor(id, initialValue = '', config = {}) {
        super(id, initialValue, config);
        this.config = config;
    }
    /**
     * Execute the node - simply returns the text content
     */
    async run(ctx) {
        // For text blocks, we simply return the current value
        // If in edit mode with auto preview, return the edit buffer
        const value = this.getCurrentValue();
        // Process any variable substitutions if needed
        // This allows for {{variable}} syntax in text blocks
        return this.processVariables(value, ctx);
    }
    /**
     * Process variable substitutions in the text
     */
    processVariables(text, ctx) {
        // Simple variable substitution using {{variableName}} syntax
        return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            const value = ctx.variables[varName];
            return value !== undefined ? String(value) : match;
        });
    }
    /**
     * Clone the string value
     */
    cloneValue(value) {
        return value;
    }
    /**
     * Validate the text value
     */
    async validateValue(value) {
        const errors = [];
        // Check if value is a string
        if (typeof value !== 'string') {
            errors.push('Value must be a string');
            return { valid: false, errors };
        }
        // Check max length if configured
        if (this.config.maxLength && value.length > this.config.maxLength) {
            errors.push(`Text exceeds maximum length of ${this.config.maxLength} characters`);
        }
        // Check multiline constraint
        if (!this.config.multiline && value.includes('\n')) {
            errors.push('Multiline text is not allowed');
        }
        // Check for dangerous content (basic XSS prevention)
        if (this.containsDangerousContent(value)) {
            errors.push('Text contains potentially dangerous content');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Check for dangerous content patterns
     */
    containsDangerousContent(text) {
        // Basic patterns that might indicate script injection attempts
        const dangerousPatterns = [
            /<script[^>]*>/i,
            /<\/script>/i,
            /javascript:/i,
            /on\w+\s*=/i, // Event handlers like onclick=
            /<iframe/i,
            /<object/i,
            /<embed/i
        ];
        return dangerousPatterns.some(pattern => pattern.test(text));
    }
    /**
     * Get the node type
     */
    getNodeType() {
        return 'TextBlock';
    }
    /**
     * Get text-specific configuration
     */
    getTextConfig() {
        return { ...this.config };
    }
    /**
     * Set placeholder text
     */
    setPlaceholder(placeholder) {
        this.config.placeholder = placeholder;
    }
    /**
     * Get placeholder text
     */
    getPlaceholder() {
        return this.config.placeholder;
    }
    /**
     * Enable/disable multiline support
     */
    setMultiline(multiline) {
        this.config.multiline = multiline;
        // If disabling multiline, validate current content
        if (!multiline && this.data.value.includes('\n')) {
            this.data.isValid = false;
            this.data.validationMessage =
                'Content contains newlines but multiline is disabled';
        }
    }
    /**
     * Set maximum length
     */
    setMaxLength(maxLength) {
        this.config.maxLength = maxLength;
        // Validate current content against new constraint
        if (maxLength && this.data.value.length > maxLength) {
            this.data.isValid = false;
            this.data.validationMessage = `Content exceeds new maximum length of ${maxLength}`;
        }
    }
    /**
     * Get a preview of the text (useful for UI display)
     */
    getPreview(maxLength = 50) {
        const value = this.getCurrentValue();
        if (value.length <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength - 3) + '...';
    }
    /**
     * Get word count
     */
    getWordCount() {
        const value = this.getCurrentValue();
        return value
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0).length;
    }
    /**
     * Get character count
     */
    getCharacterCount() {
        return this.getCurrentValue().length;
    }
    /**
     * Enhanced serialization with text-specific config
     */
    serialize() {
        const base = super.serialize();
        return {
            ...base,
            config: this.config,
            metadata: {
                wordCount: this.getWordCount(),
                characterCount: this.getCharacterCount()
            }
        };
    }
}
