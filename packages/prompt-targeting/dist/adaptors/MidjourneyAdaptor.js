/**
 * Midjourney adaptor implementation
 * Epic 10.1.3 - Mapping Strategy Development
 */
import { BaseAdaptor } from './BaseAdaptor';
/**
 * Midjourney style mappings for common artistic terms
 */
const STYLE_MAPPINGS = {
    'photorealistic': 'photorealistic, ultra detailed, 8k',
    'artistic': 'artistic, painterly, expressive',
    'minimal': 'minimal, clean, simple',
    'abstract': 'abstract, conceptual, non-representational',
    'vintage': 'vintage, retro, aged',
    'modern': 'modern, contemporary, sleek',
    'fantasy': 'fantasy, magical, ethereal',
    'sci-fi': 'sci-fi, futuristic, high-tech',
    'cartoon': 'cartoon style, animated, stylized',
    'anime': 'anime style, manga, Japanese animation',
    'oil-painting': 'oil painting, traditional art, brush strokes',
    'watercolor': 'watercolor, flowing, transparent',
    'pencil': 'pencil drawing, sketch, graphite',
    'digital-art': 'digital art, cgi, rendered'
};
/**
 * Aspect ratio mappings
 */
const ASPECT_RATIOS = {
    'square': '1:1',
    'landscape': '16:9',
    'portrait': '9:16',
    'wide': '21:9',
    'ultrawide': '32:9',
    'tall': '9:21',
    'classic': '4:3',
    'cinema': '2.39:1'
};
/**
 * Midjourney adaptor for text-to-image generation
 */
export class MidjourneyAdaptor extends BaseAdaptor {
    id = 'midjourney-v6';
    version = '1.0.0';
    name = 'Midjourney';
    description = 'Midjourney AI image generation';
    platforms = ['midjourney', 'mj'];
    midjourneyConfig = {};
    /**
     * Initialize with Midjourney-specific configuration
     */
    async onInitialize() {
        this.midjourneyConfig = {
            version: '6',
            defaultAspectRatio: '1:1',
            defaultQuality: 1,
            defaultStylize: 100,
            ...this.config.midjourney
        };
    }
    /**
     * Get platform capabilities
     */
    async capabilities() {
        return {
            platform: 'midjourney',
            version: this.version,
            maxTokens: 4000, // Approximate character limit for prompts
            supportedAspectRatios: [
                '1:1', '5:4', '4:3', '3:2', '16:10', '16:9', '21:9',
                '1:2', '2:3', '3:4', '4:5', '9:16', '9:21'
            ],
            parameterRanges: {
                quality: [0.25, 2],
                stylize: [0, 1000],
                chaos: [0, 100],
                weird: [0, 3000],
                stop: [10, 100]
            },
            features: [
                'text-to-image',
                'style-transfer',
                'aspect-ratio-control',
                'quality-control',
                'chaos-variation',
                'stylization',
                'negative-prompts',
                'image-prompts',
                'multi-prompts',
                'permutations',
                'blend-mode',
                'describe-mode',
                'remix-mode'
            ],
            styleSupport: true,
            negativePromptSupport: true,
            customParameters: {
                version: this.midjourneyConfig.version,
                supportsVideo: true,
                supportsUpscaling: true,
                supportsVariations: true,
                supportsRemix: true
            }
        };
    }
    /**
     * Get image generation specific capabilities
     */
    async imageCapabilities() {
        return {
            maxPromptLength: 4000,
            supportedDimensions: [
                '1024x1024', '1152x896', '896x1152', '1216x832', '832x1216',
                '1344x768', '768x1344', '1536x640', '640x1536'
            ],
            supportedFormats: ['png', 'jpg', 'webp'],
            supportsNegativePrompts: true,
            supportsStyleTransfer: true,
            qualityRange: [0.25, 2],
            guidanceRange: [0, 1000] // Stylize parameter
        };
    }
    /**
     * Platform-specific validation
     */
    async performPlatformValidation(graph, config) {
        const errors = [];
        const warnings = [];
        // Extract and validate content
        const textContent = this.extractTextContent(graph);
        // Check prompt length
        if (textContent.length > 4000) {
            errors.push({
                code: 'PROMPT_TOO_LONG',
                message: `Prompt exceeds Midjourney limit (${textContent.length}/4000 characters)`,
                severity: 'error',
                suggestion: 'Reduce prompt length or split into multiple prompts'
            });
        }
        // Check for text-only content that might not work well with image generation
        if (this.detectTextOnlyContent(graph)) {
            warnings.push({
                code: 'TEXT_ONLY_CONTENT',
                message: 'Content appears to be text-focused rather than visual',
                optimization: 'Add visual descriptions, styles, or composition details'
            });
        }
        // Check for Midjourney-specific syntax issues
        const syntaxIssues = this.validateMidjourneyTax(textContent);
        errors.push(...syntaxIssues);
        // Validate aspect ratio
        const aspectRatio = this.extractAspectRatio(graph, config);
        if (aspectRatio && !this.isValidAspectRatio(aspectRatio)) {
            warnings.push({
                code: 'INVALID_ASPECT_RATIO',
                message: `Unsupported aspect ratio: ${aspectRatio}`,
                optimization: 'Use supported aspect ratios like 1:1, 16:9, 9:16, etc.'
            });
        }
        // Calculate compatibility score
        const totalIssues = errors.length + warnings.length * 0.5;
        const compatibilityScore = Math.max(0, 1 - (totalIssues * 0.15));
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            compatibilityScore
        };
    }
    /**
     * Transform graph to Midjourney format
     */
    async performTransformation(graph, config) {
        // Build main prompt
        const prompt = this.buildMidjourneyPrompt(graph, config);
        // Build negative prompt if supported
        const negativePrompt = this.buildNegativePrompt(graph);
        // Build parameters
        const parameters = this.buildMidjourneyParameters(graph, config);
        return {
            platform: 'midjourney',
            prompt,
            negativePrompt: negativePrompt || undefined,
            parameters
        };
    }
    /**
     * Build Midjourney-specific prompt from graph
     */
    buildMidjourneyPrompt(graph, config) {
        const components = [];
        if (!graph.nodes || !Array.isArray(graph.nodes)) {
            return '/imagine prompt: ';
        }
        // Collect visual descriptions
        const descriptions = [];
        const styles = [];
        const technical = [];
        for (const node of graph.nodes) {
            if (!node.data)
                continue;
            switch (node.type) {
                case 'subject':
                case 'description':
                case 'output':
                    if (node.data.text || node.data.content) {
                        descriptions.push(node.data.text || node.data.content);
                    }
                    break;
                case 'style':
                    if (node.data.style) {
                        const mappedStyle = this.mapStyleToMidjourney(node.data.style);
                        styles.push(mappedStyle);
                    }
                    break;
                case 'technical':
                case 'parameters':
                    if (node.data.text) {
                        technical.push(node.data.text);
                    }
                    break;
                case 'concat':
                    if (node.data.template) {
                        descriptions.push(node.data.template);
                    }
                    break;
                case 'weightedChoice':
                    // Use first choice for now
                    if (node.data.choices && node.data.choices.length > 0) {
                        descriptions.push(node.data.choices[0].text);
                    }
                    break;
            }
        }
        // Combine components in Midjourney-optimized order
        const mainDescription = descriptions.join(', ');
        const styleDescription = styles.join(', ');
        const technicalDetails = technical.join(', ');
        // Build final prompt with proper structure
        const promptParts = [mainDescription, styleDescription, technicalDetails]
            .filter(Boolean)
            .join(', ');
        // Add Midjourney parameters
        const mjParams = this.buildParameterString(graph, config);
        return `/imagine prompt: ${promptParts}${mjParams}`;
    }
    /**
     * Map generic style terms to Midjourney-specific descriptions
     */
    mapStyleToMidjourney(style) {
        const lowercaseStyle = style.toLowerCase();
        // Check for exact matches first
        if (STYLE_MAPPINGS[lowercaseStyle]) {
            return STYLE_MAPPINGS[lowercaseStyle];
        }
        // Check for partial matches
        for (const [key, value] of Object.entries(STYLE_MAPPINGS)) {
            if (lowercaseStyle.includes(key) || key.includes(lowercaseStyle)) {
                return value;
            }
        }
        // Return original style if no mapping found
        return style;
    }
    /**
     * Build negative prompt from graph
     */
    buildNegativePrompt(graph) {
        if (!graph.nodes)
            return null;
        const negativeElements = [];
        for (const node of graph.nodes) {
            if (node.type === 'negativePrompt' || node.data?.negative) {
                if (node.data.text || node.data.content) {
                    negativeElements.push(node.data.text || node.data.content);
                }
            }
        }
        return negativeElements.length > 0 ? negativeElements.join(', ') : null;
    }
    /**
     * Build Midjourney parameters
     */
    buildMidjourneyParameters(graph, config) {
        const parameters = {};
        // Apply quality preference
        if (config?.qualityPreference !== undefined) {
            parameters.quality = this.normalizeParameter(config.qualityPreference, [0, 1], [0.25, 2]);
        }
        else {
            parameters.quality = this.midjourneyConfig.defaultQuality || 1;
        }
        // Apply style preference
        if (config?.stylePreference) {
            switch (config.stylePreference) {
                case 'artistic':
                    parameters.stylize = 250;
                    break;
                case 'photorealistic':
                    parameters.stylize = 50;
                    break;
                case 'minimal':
                    parameters.stylize = 0;
                    break;
                default:
                    parameters.stylize = this.midjourneyConfig.defaultStylize || 100;
            }
        }
        // Extract aspect ratio
        const aspectRatio = this.extractAspectRatio(graph, config);
        if (aspectRatio) {
            parameters.aspect = aspectRatio;
        }
        // Apply platform overrides
        if (config?.platformOverrides?.midjourney) {
            const overrides = config.platformOverrides.midjourney;
            Object.assign(parameters, overrides);
        }
        return parameters;
    }
    /**
     * Build parameter string for Midjourney command
     */
    buildParameterString(graph, config) {
        const params = [];
        const parameters = this.buildMidjourneyParameters(graph, config);
        // Add aspect ratio
        if (parameters.aspect) {
            params.push(`--ar ${parameters.aspect}`);
        }
        // Add quality
        if (parameters.quality && parameters.quality !== 1) {
            params.push(`--q ${parameters.quality}`);
        }
        // Add stylize
        if (parameters.stylize && parameters.stylize !== 100) {
            params.push(`--s ${parameters.stylize}`);
        }
        // Add chaos
        if (parameters.chaos) {
            params.push(`--chaos ${parameters.chaos}`);
        }
        // Add version
        if (this.midjourneyConfig.version && this.midjourneyConfig.version !== '6') {
            params.push(`--v ${this.midjourneyConfig.version}`);
        }
        return params.length > 0 ? ' ' + params.join(' ') : '';
    }
    /**
     * Extract aspect ratio from graph or config
     */
    extractAspectRatio(graph, config) {
        // Check config first
        if (config?.platformOverrides?.midjourney?.aspect) {
            return config.platformOverrides.midjourney.aspect;
        }
        // Check graph nodes
        if (graph.nodes) {
            for (const node of graph.nodes) {
                if (node.type === 'aspectRatio' || node.data?.aspectRatio) {
                    const ratio = node.data.aspectRatio || node.data.text;
                    return this.normalizeAspectRatio(ratio);
                }
            }
        }
        return this.midjourneyConfig.defaultAspectRatio || null;
    }
    /**
     * Normalize aspect ratio to Midjourney format
     */
    normalizeAspectRatio(ratio) {
        const normalized = ratio.toLowerCase().trim();
        // Check for named ratios
        if (ASPECT_RATIOS[normalized]) {
            return ASPECT_RATIOS[normalized];
        }
        // Check if it's already in correct format (e.g., "16:9")
        if (/^\d+:\d+$/.test(ratio)) {
            return ratio;
        }
        // Try to parse decimal format (e.g., "1.77")
        const decimal = parseFloat(ratio);
        if (!isNaN(decimal)) {
            if (decimal > 1) {
                return `${Math.round(decimal * 10)}:10`;
            }
            else {
                return `10:${Math.round(10 / decimal)}`;
            }
        }
        return ratio;
    }
    /**
     * Validate aspect ratio format
     */
    isValidAspectRatio(ratio) {
        const capabilities = this.capabilities();
        return capabilities.then(cap => cap.supportedAspectRatios?.includes(ratio) || false).catch(() => false);
    }
    /**
     * Detect if content is primarily text-focused
     */
    detectTextOnlyContent(graph) {
        if (!graph.nodes)
            return false;
        const textKeywords = [
            'write', 'text', 'article', 'essay', 'story', 'paragraph',
            'sentence', 'word', 'letter', 'document', 'report'
        ];
        const visualKeywords = [
            'image', 'photo', 'picture', 'visual', 'color', 'light',
            'shadow', 'composition', 'style', 'artistic', 'painting'
        ];
        const allText = this.extractTextContent(graph).toLowerCase();
        const textScore = textKeywords.filter(keyword => allText.includes(keyword)).length;
        const visualScore = visualKeywords.filter(keyword => allText.includes(keyword)).length;
        return textScore > visualScore && visualScore === 0;
    }
    /**
     * Validate Midjourney-specific syntax
     */
    validateMidjourneyTax(text) {
        const errors = [];
        // Check for common syntax errors
        if (text.includes('--ar') && !/--ar \d+:\d+/.test(text)) {
            errors.push({
                code: 'INVALID_ASPECT_RATIO_SYNTAX',
                message: 'Invalid aspect ratio syntax. Use format: --ar 16:9',
                severity: 'error',
                suggestion: 'Correct aspect ratio format: --ar width:height'
            });
        }
        if (text.includes('--q') && !/--q [0-9.]+/.test(text)) {
            errors.push({
                code: 'INVALID_QUALITY_SYNTAX',
                message: 'Invalid quality syntax. Use format: --q 1',
                severity: 'error',
                suggestion: 'Quality should be a number between 0.25 and 2'
            });
        }
        return errors;
    }
    /**
     * Get platform-specific optimizations
     */
    async getPlatformOptimizations(graph, config) {
        const optimizations = [];
        // Style mapping optimization
        const styleInfo = this.extractStyleInfo(graph);
        if (Object.keys(styleInfo).length > 0) {
            optimizations.push('style-keyword-mapping');
        }
        // Aspect ratio optimization
        const hasAspectRatio = this.extractAspectRatio(graph, config);
        if (hasAspectRatio) {
            optimizations.push('aspect-ratio-normalization');
        }
        // Prompt structure optimization
        const textContent = this.extractTextContent(graph);
        if (textContent.length > 100) {
            optimizations.push('prompt-structure-optimization');
        }
        // Quality parameter optimization
        if (config?.qualityPreference !== undefined) {
            optimizations.push('quality-parameter-mapping');
        }
        return optimizations;
    }
}
//# sourceMappingURL=MidjourneyAdaptor.js.map