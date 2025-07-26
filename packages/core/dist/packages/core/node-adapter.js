// packages/core/node-adapter.ts
// Adapter layer between UI schema and internal schema
// Handles conversion, ID generation, and abstraction
import { v4 as uuidv4 } from 'uuid';
export class NodeAdapter {
    /**
     * Convert internal node to UI representation
     * Hides all technical fields from users
     */
    static toUI(internal) {
        const baseUI = {
            name: this.extractUserFriendlyName(internal),
            description: this.extractDescription(internal)
        };
        switch (internal.type) {
            case 'WeightedChoice':
                return {
                    ...baseUI,
                    type: 'WeightedChoice',
                    choices: this.extractChoices(internal)
                };
            case 'Concat':
                return {
                    ...baseUI,
                    type: 'Concat',
                    separator: this.extractSeparator(internal)
                };
            case 'Output':
                return {
                    ...baseUI,
                    type: 'Output',
                    template: this.extractTemplate(internal)
                };
            case 'SetVariable':
                return {
                    ...baseUI,
                    type: 'SetVariable',
                    variableName: internal.key || '',
                    value: internal.value || ''
                };
            case 'GetVariable':
                return {
                    ...baseUI,
                    type: 'GetVariable',
                    variableName: internal.key || '',
                    defaultValue: this.extractDefaultValue(internal)
                };
            case 'Conditional':
                return {
                    ...baseUI,
                    type: 'Conditional',
                    conditions: this.extractConditions(internal),
                    otherwise: this.extractDefaultOutput(internal)
                };
            case 'Sequential':
                return {
                    ...baseUI,
                    type: 'Sequential',
                    items: this.extractSequenceItems(internal),
                    mode: this.extractSequenceMode(internal)
                };
            default:
                throw new Error(`Unsupported node type for UI conversion: ${internal.type}`);
        }
    }
    /**
     * Convert UI node to internal representation
     * Generates all technical fields automatically
     */
    static toInternal(ui, existingId) {
        const baseInternal = {
            id: existingId || uuidv4(),
            inputs: [] // Will be set by graph connection logic
        };
        switch (ui.type) {
            case 'WeightedChoice':
                return {
                    ...baseInternal,
                    type: 'WeightedChoice',
                    choices: ui.choices.map(choice => ({
                        value: choice,
                        weight: 1 // Default equal weights
                    }))
                };
            case 'Concat':
                return {
                    ...baseInternal,
                    type: 'Concat'
                    // Internal concat nodes don't need additional config
                };
            case 'Output':
                return {
                    ...baseInternal,
                    type: 'Output'
                    // Internal output nodes don't need additional config
                };
            case 'SetVariable':
                return {
                    ...baseInternal,
                    type: 'SetVariable',
                    key: ui.variableName,
                    value: ui.value
                };
            case 'GetVariable':
                return {
                    ...baseInternal,
                    type: 'GetVariable',
                    key: ui.variableName
                };
            case 'Conditional':
                return {
                    ...baseInternal,
                    type: 'Conditional',
                    branches: ui.conditions.map(condition => ({
                        condition: condition.when,
                        output: condition.then,
                        label: condition.label
                    })),
                    defaultOutput: ui.otherwise
                };
            case 'Sequential':
                return {
                    ...baseInternal,
                    type: 'Sequential',
                    sequence: ui.items,
                    pattern: {
                        type: this.mapSequenceMode(ui.mode)
                    }
                };
            default:
                throw new Error(`Unsupported UI node type: ${ui.type}`);
        }
    }
    /**
     * Extract variables from template string
     * Finds {variableName} patterns and returns metadata
     */
    static extractVariables(template) {
        const variableRegex = /\{(\w+)\}/g;
        const variables = [];
        let match;
        while ((match = variableRegex.exec(template)) !== null) {
            variables.push({
                name: match[1],
                placeholder: match[0],
                position: match.index
            });
        }
        return variables;
    }
    /**
     * Validate template syntax
     */
    static validateTemplate(template) {
        const errors = [];
        // Check for unmatched braces
        const openBraces = (template.match(/\{/g) || []).length;
        const closeBraces = (template.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
            errors.push('Unmatched braces in template');
        }
        // Check for empty variable names
        if (template.includes('{}')) {
            errors.push('Empty variable names not allowed');
        }
        // Check for nested braces
        if (template.includes('{{') || template.includes('}}')) {
            errors.push('Nested braces not supported');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Preview template with variable substitution
     */
    static previewTemplate(template, variables) {
        let result = template;
        Object.entries(variables).forEach(([name, value]) => {
            const placeholder = `{${name}}`;
            result = result.replace(new RegExp(placeholder, 'g'), value || `{${name}}`);
        });
        return result;
    }
    // Private helper methods for extraction
    static extractUserFriendlyName(internal) {
        // Try to find user-set name from various possible fields
        return internal.name || internal.label || undefined;
    }
    static extractDescription(internal) {
        return internal.description || undefined;
    }
    static extractChoices(internal) {
        const choices = internal.choices || [];
        return choices.map((choice) => choice.value || choice.toString());
    }
    static extractSeparator(internal) {
        return internal.separator || ' ';
    }
    static extractTemplate(internal) {
        return internal.template || undefined;
    }
    static extractDefaultValue(internal) {
        return internal.defaultValue || undefined;
    }
    static extractConditions(internal) {
        const branches = internal.branches || [];
        return branches.map((branch) => ({
            when: branch.condition || '',
            then: branch.output || '',
            label: branch.label
        }));
    }
    static extractDefaultOutput(internal) {
        return internal.defaultOutput || undefined;
    }
    static extractSequenceItems(internal) {
        return internal.sequence || [];
    }
    static extractSequenceMode(internal) {
        const pattern = internal.pattern;
        const type = pattern?.type || 'linear';
        switch (type) {
            case 'linear': return 'in-order';
            case 'cyclical': return 'cycle';
            case 'random': return 'random';
            default: return 'in-order';
        }
    }
    static mapSequenceMode(mode) {
        switch (mode) {
            case 'in-order': return 'linear';
            case 'cycle': return 'cyclical';
            case 'random': return 'random';
            default: return 'linear';
        }
    }
}
/**
 * Template utilities for working with variable-based templates
 */
export class TemplateUtils {
    /**
     * Generate a user-friendly preview of what a template will produce
     */
    static generatePreview(template, sampleVariables) {
        const variables = NodeAdapter.extractVariables(template);
        const samples = sampleVariables || this.generateSampleVariables(variables);
        return NodeAdapter.previewTemplate(template, samples);
    }
    /**
     * Generate sample values for variables to show in previews
     */
    static generateSampleVariables(variables) {
        const samples = {};
        variables.forEach(variable => {
            // Generate contextual sample values based on variable names
            samples[variable.name] = this.getSampleValue(variable.name);
        });
        return samples;
    }
    static getSampleValue(variableName) {
        const lowerName = variableName.toLowerCase();
        // Contextual samples based on common variable names
        if (lowerName.includes('creature') || lowerName.includes('animal')) {
            return 'dragon';
        }
        if (lowerName.includes('color')) {
            return 'crimson';
        }
        if (lowerName.includes('setting') || lowerName.includes('location')) {
            return 'enchanted forest';
        }
        if (lowerName.includes('character') || lowerName.includes('person')) {
            return 'warrior';
        }
        if (lowerName.includes('time') || lowerName.includes('when')) {
            return 'at sunset';
        }
        if (lowerName.includes('weather')) {
            return 'stormy';
        }
        // Default sample
        return `sample ${variableName}`;
    }
}
