/**
 * Comprehensive parameter mapping system for text-to-image models
 */
export class ParameterMappingSystem {
    constructor() {
        this.ruleSets = new Map();
        /**
         * Convert aspect ratio to DALL-E size
         */
        this.aspectRatioToSize = (aspectRatio) => {
            const ratioMap = {
                '1:1': '1024x1024',
                '2:3': '1024x1792', // Portrait approximation
                '3:2': '1792x1024', // Landscape approximation
                '4:5': '1024x1792', // Portrait
                '5:4': '1792x1024', // Landscape
                '16:9': '1792x1024', // Widescreen
                '9:16': '1024x1792' // Vertical
            };
            return ratioMap[aspectRatio] || '1024x1024';
        };
        /**
         * Convert DALL-E size to aspect ratio
         */
        this.sizeToAspectRatio = (size) => {
            const sizeMap = {
                '256x256': '1:1',
                '512x512': '1:1',
                '1024x1024': '1:1',
                '1792x1024': '16:9',
                '1024x1792': '9:16'
            };
            return sizeMap[size] || '1:1';
        };
        this.initializeDefaultMappings();
    }
    /**
     * Register a mapping rule set
     */
    registerMappingRuleSet(ruleSet) {
        const key = `${ruleSet.fromPlatform}->${ruleSet.toPlatform}`;
        this.ruleSets.set(key, ruleSet);
    }
    /**
     * Map parameters from one platform to another
     */
    mapParameters(sourceParams, fromPlatform, toPlatform) {
        const key = `${fromPlatform}->${toPlatform}`;
        const ruleSet = this.ruleSets.get(key);
        if (!ruleSet) {
            return {
                mappedParameters: { ...sourceParams },
                warnings: [`No mapping rules defined for ${fromPlatform} -> ${toPlatform}`],
                incompatible: [],
                transformations: []
            };
        }
        const result = {
            mappedParameters: { ...ruleSet.defaultParameters },
            warnings: [],
            incompatible: [],
            transformations: []
        };
        // Apply mappings
        for (const [sourceParam, sourceValue] of Object.entries(sourceParams)) {
            const mapping = ruleSet.mappings.find(m => m.sourceParam === sourceParam);
            if (mapping) {
                // Check condition if present
                if (mapping.condition && !mapping.condition(sourceParams)) {
                    result.warnings.push(`Parameter ${sourceParam} mapping skipped due to condition`);
                    continue;
                }
                // Apply transformation
                let targetValue = sourceValue;
                let transformationDesc = 'Direct mapping';
                if (mapping.transform) {
                    try {
                        targetValue = mapping.transform(sourceValue);
                        transformationDesc = 'Custom transformation';
                    }
                    catch (error) {
                        result.warnings.push(`Failed to transform ${sourceParam}: ${error}`);
                        continue;
                    }
                }
                result.mappedParameters[mapping.targetParam] = targetValue;
                result.transformations.push({
                    sourceParam,
                    targetParam: mapping.targetParam,
                    sourceValue,
                    targetValue,
                    transformation: transformationDesc
                });
            }
            else if (ruleSet.incompatibleParameters?.includes(sourceParam)) {
                result.incompatible.push(sourceParam);
            }
            else {
                result.warnings.push(`No mapping found for parameter: ${sourceParam}`);
            }
        }
        return result;
    }
    /**
     * Get all available mapping rule sets
     */
    getAvailableMappings() {
        return Array.from(this.ruleSets.keys()).map(key => {
            const [from, to] = key.split('->');
            return { from, to };
        });
    }
    /**
     * Initialize default mapping rules
     */
    initializeDefaultMappings() {
        // Midjourney to DALL-E mappings
        this.registerMappingRuleSet({
            fromPlatform: 'midjourney',
            toPlatform: 'openai-dalle',
            mappings: [
                {
                    sourceParam: 'aspect_ratio',
                    targetParam: 'size',
                    transform: this.aspectRatioToSize,
                    description: 'Convert aspect ratio to DALL-E size format'
                },
                {
                    sourceParam: 'stylize',
                    targetParam: 'style',
                    transform: (value) => value > 500 ? 'vivid' : 'natural',
                    description: 'Map stylization level to DALL-E style'
                },
                {
                    sourceParam: 'quality',
                    targetParam: 'quality',
                    transform: (value) => value >= 1 ? 'hd' : 'standard',
                    description: 'Map quality level to DALL-E quality'
                },
                {
                    sourceParam: 'version',
                    targetParam: 'model',
                    transform: (value) => {
                        if (value === 'v6' || value === 'v5.2')
                            return 'dall-e-3';
                        return 'dall-e-2';
                    },
                    description: 'Map Midjourney version to DALL-E model'
                }
            ],
            defaultParameters: {
                model: 'dall-e-3',
                size: '1024x1024',
                quality: 'standard',
                style: 'vivid',
                n: 1
            },
            incompatibleParameters: ['chaos', 'weird', 'tile']
        });
        // DALL-E to Midjourney mappings
        this.registerMappingRuleSet({
            fromPlatform: 'openai-dalle',
            toPlatform: 'midjourney',
            mappings: [
                {
                    sourceParam: 'size',
                    targetParam: 'aspect_ratio',
                    transform: this.sizeToAspectRatio,
                    description: 'Convert DALL-E size to aspect ratio'
                },
                {
                    sourceParam: 'style',
                    targetParam: 'stylize',
                    transform: (value) => value === 'vivid' ? 200 : 100,
                    description: 'Map DALL-E style to stylization level'
                },
                {
                    sourceParam: 'quality',
                    targetParam: 'quality',
                    transform: (value) => value === 'hd' ? 2 : 1,
                    description: 'Map DALL-E quality to Midjourney quality'
                },
                {
                    sourceParam: 'model',
                    targetParam: 'version',
                    transform: (value) => value === 'dall-e-3' ? 'v6' : 'v5',
                    description: 'Map DALL-E model to Midjourney version'
                }
            ],
            defaultParameters: {
                aspect_ratio: '1:1',
                stylize: 100,
                quality: 1,
                version: 'v6'
            },
            incompatibleParameters: ['n', 'response_format']
        });
        // Universal text-to-image mappings
        this.registerMappingRuleSet({
            fromPlatform: 'custom',
            toPlatform: 'midjourney',
            mappings: [
                {
                    sourceParam: 'width',
                    targetParam: 'aspect_ratio',
                    transform: (value) => {
                        // This would need access to height parameter - simplified for now
                        return '1:1';
                    },
                    condition: (params) => 'height' in params,
                    description: 'Convert width/height to aspect ratio'
                },
                {
                    sourceParam: 'style_strength',
                    targetParam: 'stylize',
                    transform: (value) => Math.round(value * 1000),
                    description: 'Convert normalized style strength to Midjourney stylize'
                },
                {
                    sourceParam: 'detail_level',
                    targetParam: 'quality',
                    transform: (value) => Math.max(0.25, Math.min(2, value)),
                    description: 'Map detail level to quality parameter'
                }
            ],
            defaultParameters: {
                aspect_ratio: '1:1',
                stylize: 100,
                version: 'v6'
            }
        });
        this.registerMappingRuleSet({
            fromPlatform: 'custom',
            toPlatform: 'openai-dalle',
            mappings: [
                {
                    sourceParam: 'width',
                    targetParam: 'size',
                    transform: (value) => {
                        // This would need access to height parameter - simplified for now
                        return '1024x1024';
                    },
                    condition: (params) => 'height' in params,
                    description: 'Convert width/height to DALL-E size'
                },
                {
                    sourceParam: 'style_strength',
                    targetParam: 'style',
                    transform: (value) => value > 0.5 ? 'vivid' : 'natural',
                    description: 'Convert style strength to DALL-E style'
                },
                {
                    sourceParam: 'detail_level',
                    targetParam: 'quality',
                    transform: (value) => value > 0.5 ? 'hd' : 'standard',
                    description: 'Map detail level to quality'
                }
            ],
            defaultParameters: {
                model: 'dall-e-3',
                size: '1024x1024',
                quality: 'standard',
                style: 'vivid'
            }
        });
    }
    /**
     * Convert width/height dimensions to aspect ratio
     */
    dimensionsToAspectRatio(width, height) {
        const gcd = this.greatestCommonDivisor(width, height);
        const w = width / gcd;
        const h = height / gcd;
        // Round to common aspect ratios
        const ratio = w / h;
        if (Math.abs(ratio - 1) < 0.1)
            return '1:1';
        if (Math.abs(ratio - 16 / 9) < 0.1)
            return '16:9';
        if (Math.abs(ratio - 9 / 16) < 0.1)
            return '9:16';
        if (Math.abs(ratio - 4 / 3) < 0.1)
            return '4:3';
        if (Math.abs(ratio - 3 / 4) < 0.1)
            return '3:4';
        return `${w}:${h}`;
    }
    /**
     * Convert width/height dimensions to DALL-E size
     */
    dimensionsToSize(width, height) {
        const ratio = width / height;
        if (Math.abs(ratio - 1) < 0.1)
            return '1024x1024';
        if (ratio > 1.3)
            return '1792x1024'; // Landscape
        if (ratio < 0.7)
            return '1024x1792'; // Portrait
        return '1024x1024'; // Default square
    }
    /**
     * Calculate greatest common divisor
     */
    greatestCommonDivisor(a, b) {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }
}
/**
 * Global parameter mapping system instance
 */
export const parameterMappingSystem = new ParameterMappingSystem();
