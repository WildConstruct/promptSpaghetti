import { UINode, ExtractedVariable } from './ui-schema';
import { Node as InternalNode } from './graphSchema';
export declare class NodeAdapter {
    /**
     * Convert internal node to UI representation
     * Hides all technical fields from users
     */
    static toUI(internal: InternalNode): UINode;
    /**
     * Convert UI node to internal representation
     * Generates all technical fields automatically
     */
    static toInternal(ui: UINode, existingId?: string): InternalNode;
    /**
     * Extract variables from template string
     * Finds {variableName} patterns and returns metadata
     */
    static extractVariables(template: string): ExtractedVariable[];
    /**
     * Validate template syntax
     */
    static validateTemplate(template: string): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Preview template with variable substitution
     */
    static previewTemplate(template: string, variables: Record<string, string>): string;
    private static extractUserFriendlyName;
    private static extractDescription;
    private static extractChoices;
    private static extractSeparator;
    private static extractTemplate;
    private static extractDefaultValue;
    private static extractConditions;
    private static extractDefaultOutput;
    private static extractSequenceItems;
    private static extractSequenceMode;
    private static mapSequenceMode;
}
/**
 * Template utilities for working with variable-based templates
 */
export declare class TemplateUtils {
    /**
     * Generate a user-friendly preview of what a template will produce
     */
    static generatePreview(template: string, sampleVariables?: Record<string, string>): string;
    /**
     * Generate sample values for variables to show in previews
     */
    static generateSampleVariables(variables: ExtractedVariable[]): Record<string, string>;
    private static getSampleValue;
}
//# sourceMappingURL=node-adapter.d.ts.map