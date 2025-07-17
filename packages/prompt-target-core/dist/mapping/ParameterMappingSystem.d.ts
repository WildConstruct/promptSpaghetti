import { Platform } from '../types/index.js';
/**
 * Parameter mapping definition for cross-platform parameter translation
 */
export interface ParameterMapping {
    sourceParam: string;
    targetParam: string;
    transform?: (value: any) => any;
    condition?: (sourceParams: Record<string, any>) => boolean;
    description: string;
}
/**
 * Mapping rule set for a specific platform pair
 */
export interface MappingRuleSet {
    fromPlatform: Platform;
    toPlatform: Platform;
    mappings: ParameterMapping[];
    defaultParameters?: Record<string, any>;
    incompatibleParameters?: string[];
}
/**
 * Parameter mapping result
 */
export interface MappingResult {
    mappedParameters: Record<string, any>;
    warnings: string[];
    incompatible: string[];
    transformations: Array<{
        sourceParam: string;
        targetParam: string;
        sourceValue: any;
        targetValue: any;
        transformation: string;
    }>;
}
/**
 * Comprehensive parameter mapping system for text-to-image models
 */
export declare class ParameterMappingSystem {
    private ruleSets;
    constructor();
    /**
     * Register a mapping rule set
     */
    registerMappingRuleSet(ruleSet: MappingRuleSet): void;
    /**
     * Map parameters from one platform to another
     */
    mapParameters(sourceParams: Record<string, any>, fromPlatform: Platform, toPlatform: Platform): MappingResult;
    /**
     * Get all available mapping rule sets
     */
    getAvailableMappings(): Array<{
        from: Platform;
        to: Platform;
    }>;
    /**
     * Initialize default mapping rules
     */
    private initializeDefaultMappings;
    /**
     * Convert aspect ratio to DALL-E size
     */
    private aspectRatioToSize;
    /**
     * Convert DALL-E size to aspect ratio
     */
    private sizeToAspectRatio;
    /**
     * Convert width/height dimensions to aspect ratio
     */
    private dimensionsToAspectRatio;
    /**
     * Convert width/height dimensions to DALL-E size
     */
    private dimensionsToSize;
    /**
     * Calculate greatest common divisor
     */
    private greatestCommonDivisor;
}
/**
 * Global parameter mapping system instance
 */
export declare const parameterMappingSystem: ParameterMappingSystem;
