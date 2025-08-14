/**
 * OutputNode - A special node that represents the final output of a graph
 * Typically locked and used to display execution results with inline preview
 */
import { BaseInlineEditableNode } from './BaseInlineEditableNode';
/**
 * Output node implementation with inline editing support
 * Usually locked and used for displaying results
 */
export class OutputNode extends BaseInlineEditableNode {
    input = '';
    constructor(id, initialValue = '', config = {
        isLocked: true,
        lockReason: 'Output nodes are read-only',
        previewMode: 'live'
    }) {
        super(id, initialValue, config);
    }
    /**
     * Set the input value
     * This would typically be called by the graph execution engine
     */
    setInput(value) {
        this.input = String(value || '');
        // Update the display value
        this.data.value = this.input;
        this.data.lastPreviewUpdate = new Date().toISOString();
    }
    /**
     * Execute the node - simply returns the input
     */
    async run(ctx) {
        // For output nodes, we return the input value
        return this.input;
    }
    /**
     * Clone the string value
     */
    cloneValue(value) {
        return value;
    }
    /**
     * Validate the value (output nodes accept any string)
     */
    async validateValue(value) {
        // Output nodes accept any string value
        return {
            valid: true,
            errors: []
        };
    }
    /**
     * Get the node type
     */
    getNodeType() {
        return 'Output';
    }
    /**
     * Override to prevent unlocking (output nodes should remain locked)
     */
    unlock() {
        // Do nothing - output nodes should remain locked
        console.warn('Output nodes cannot be unlocked');
    }
    /**
     * Get the current output value
     */
    getOutput() {
        return this.data.value;
    }
    /**
     * Clear the output
     */
    clearOutput() {
        this.input = '';
        this.data.value = '';
        this.data.lastPreviewUpdate = new Date().toISOString();
    }
    /**
     * Get execution statistics
     */
    getStats() {
        const value = this.data.value;
        const isEmpty = value.trim().length === 0;
        return {
            isEmpty,
            length: value.length,
            wordCount: isEmpty ? 0 : value.trim().split(/\s+/).length,
            lineCount: isEmpty ? 0 : value.split('\n').length,
            lastUpdated: this.data.lastPreviewUpdate
        };
    }
    /**
     * Get a preview of the output
     */
    getPreview(maxLength = 100) {
        const value = this.data.value;
        if (value.length <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength - 3) + '...';
    }
    /**
     * Format output for display (with optional syntax highlighting hints)
     */
    getFormattedOutput() {
        const value = this.data.value;
        // Try to detect format
        let format = 'plain';
        // Check for JSON
        if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
            try {
                JSON.parse(value);
                format = 'json';
            }
            catch {
                // Not valid JSON
            }
        }
        // Check for markdown indicators
        else if (value.includes('```') ||
            value.includes('##') ||
            value.includes('**')) {
            format = 'markdown';
        }
        // Check for code indicators
        else if (value.includes('function') ||
            value.includes('const') ||
            value.includes('class')) {
            format = 'code';
        }
        return {
            content: value,
            format
        };
    }
    /**
     * Enhanced serialization
     */
    serialize() {
        const base = super.serialize();
        const stats = this.getStats();
        return {
            ...base,
            metadata: {
                ...stats,
                format: this.getFormattedOutput().format
            }
        };
    }
}
