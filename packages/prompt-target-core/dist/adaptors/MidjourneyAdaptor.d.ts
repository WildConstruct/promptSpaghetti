import { Capabilities, PromptGraph, ValidationResult, TargetPrompt, TransformOptions, PluginContext } from '../types/index.js';
import { BaseAdaptor } from './BaseAdaptor.js';
/**
 * Midjourney adaptor for text-to-image prompt translation
 * Supports Midjourney v6 syntax and parameters
 */
export declare class MidjourneyAdaptor extends BaseAdaptor {
    private readonly supportedAspectRatios;
    private readonly supportedVersions;
    constructor(context: PluginContext);
    capabilities(): Promise<Capabilities>;
    protected doValidate(graph: PromptGraph): Promise<ValidationResult[]>;
    protected doTransform(graph: PromptGraph, options?: TransformOptions): Promise<TargetPrompt>;
    /**
     * Process the graph to extract content and build prompt
     */
    private processGraph;
    /**
     * Process a single node and its dependencies
     */
    private processNode;
    /**
     * Build parameter string for Midjourney format
     */
    private buildParameterString;
    /**
     * Optimize prompt text for Midjourney
     */
    private optimizeForMidjourney;
    /**
     * Check if node has image context
     */
    private hasImageContext;
    /**
     * Estimate final prompt length
     */
    private estimatePromptLength;
    /**
     * Extract version-specific parameter conflicts
     */
    private extractVersionSpecificParams;
    /**
     * Select weighted option (simplified implementation)
     */
    private selectWeightedOption;
    /**
     * Validate a parameter value against its specification
     */
    private validateParameter;
    /**
     * Normalize parameter value according to its specification
     */
    private normalizeParameter;
    /**
     * Extract parameters from graph nodes
     */
    private extractParameters;
    /**
     * Generate a unique translation ID
     */
    private generateTranslationId;
}
