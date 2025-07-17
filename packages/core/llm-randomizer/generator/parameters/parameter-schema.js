"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultPresets = exports.ParameterValidator = exports.ValidationResultSchema = exports.ParameterPresetSchema = exports.RandomizerParametersSchema = exports.NodeTypePreference = exports.LLMProvider = exports.StylePreference = exports.ComplexityLevel = void 0;
const zod_1 = require("zod");
exports.ComplexityLevel = zod_1.z.enum(['simple', 'moderate', 'complex']);
exports.StylePreference = zod_1.z.enum(['creative', 'logical', 'balanced']);
exports.LLMProvider = zod_1.z.enum(['openai', 'claude', 'gemini']);
exports.NodeTypePreference = zod_1.z.object({
    nodeType: zod_1.z.string(),
    weight: zod_1.z.number().min(0).max(1),
    required: zod_1.z.boolean().default(false)
});
exports.RandomizerParametersSchema = zod_1.z.object({
    purpose: zod_1.z.string().min(10).max(500),
    complexity: exports.ComplexityLevel,
    nodeCount: zod_1.z.number().int().min(3).max(100),
    style: exports.StylePreference,
    domain: zod_1.z.string().optional(),
    userContext: zod_1.z.string().optional(),
    nodeTypes: zod_1.z.array(exports.NodeTypePreference).default([]),
    specificRequirements: zod_1.z.array(zod_1.z.string()).default([]),
    constraints: zod_1.z.array(zod_1.z.string()).default([]),
    focusAreas: zod_1.z.array(zod_1.z.string()).default([]),
    provider: exports.LLMProvider.default('openai'),
    temperature: zod_1.z.number().min(0).max(2).default(0.7),
    maxRetries: zod_1.z.number().int().min(1).max(10).default(3),
    includeMetadata: zod_1.z.boolean().default(true),
    validateOutput: zod_1.z.boolean().default(true),
    enablePreview: zod_1.z.boolean().default(true),
    preferredPatterns: zod_1.z.array(zod_1.z.string()).default([]),
    avoidPatterns: zod_1.z.array(zod_1.z.string()).default([]),
    qualityLevel: zod_1.z.enum(['draft', 'standard', 'high']).default('standard'),
    diversityScore: zod_1.z.number().min(0).max(1).default(0.5),
    outputFormat: zod_1.z.enum(['graph', 'serialized', 'both']).default('both'),
    includeExplanation: zod_1.z.boolean().default(false)
});
exports.ParameterPresetSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    category: zod_1.z.string(),
    parameters: exports.RandomizerParametersSchema,
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    isDefault: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
exports.ValidationResultSchema = zod_1.z.object({
    isValid: zod_1.z.boolean(),
    errors: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        message: zod_1.z.string(),
        code: zod_1.z.string()
    })),
    warnings: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        message: zod_1.z.string(),
        suggestion: zod_1.z.string().optional()
    }))
});
class ParameterValidator {
    static validate(parameters) {
        const result = exports.RandomizerParametersSchema.safeParse(parameters);
        if (result.success) {
            return this.validateBusinessRules(result.data);
        }
        else {
            return {
                isValid: false,
                errors: result.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                })),
                warnings: []
            };
        }
    }
    static validateBusinessRules(parameters) {
        const errors = [];
        const warnings = [];
        const complexityNodeRanges = {
            simple: { min: 3, max: 8 },
            moderate: { min: 8, max: 20 },
            complex: { min: 20, max: 100 }
        };
        const range = complexityNodeRanges[parameters.complexity];
        if (parameters.nodeCount < range.min || parameters.nodeCount > range.max) {
            warnings.push({
                field: 'nodeCount',
                message: `Node count ${parameters.nodeCount} may not match ${parameters.complexity} complexity`,
                suggestion: `Consider ${range.min}-${range.max} nodes for ${parameters.complexity} complexity`
            });
        }
        if (parameters.purpose.length < 20) {
            warnings.push({
                field: 'purpose',
                message: 'Purpose description is quite brief',
                suggestion: 'Provide more detailed purpose for better graph generation'
            });
        }
        const requiredNodeTypes = parameters.nodeTypes.filter(nt => nt.required);
        if (requiredNodeTypes.length > Math.floor(parameters.nodeCount / 2)) {
            errors.push({
                field: 'nodeTypes',
                message: 'Too many required node types for target node count',
                code: 'TOO_MANY_REQUIRED_TYPES'
            });
        }
        if (parameters.provider === 'openai' && parameters.temperature > 1.5) {
            warnings.push({
                field: 'temperature',
                message: 'High temperature may reduce output quality for OpenAI models',
                suggestion: 'Consider temperature 0.3-1.0 for structured output'
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    static getSuggestions(parameters) {
        const suggestions = {};
        if (parameters.complexity && !parameters.nodeCount) {
            const counts = {
                simple: 5,
                moderate: 12,
                complex: 25
            };
            suggestions.nodeCount = counts[parameters.complexity];
        }
        if (parameters.purpose && (!parameters.nodeTypes || parameters.nodeTypes.length === 0)) {
            suggestions.nodeTypes = this.suggestNodeTypes(parameters.purpose);
        }
        if (parameters.style && !parameters.temperature) {
            const temperatures = {
                creative: 0.8,
                logical: 0.3,
                balanced: 0.7
            };
            suggestions.temperature = temperatures[parameters.style];
        }
        if (parameters.domain && (!parameters.focusAreas || parameters.focusAreas.length === 0)) {
            suggestions.focusAreas = this.suggestFocusAreas(parameters.domain);
        }
        return suggestions;
    }
    static suggestNodeTypes(purpose) {
        const purposeLower = purpose.toLowerCase();
        const suggestions = [];
        if (purposeLower.includes('content') || purposeLower.includes('text') || purposeLower.includes('writing')) {
            suggestions.push('WeightedChoice', 'Concat', 'Sequential');
        }
        if (purposeLower.includes('decision') || purposeLower.includes('choice') || purposeLower.includes('branch')) {
            suggestions.push('Conditional', 'WeightedChoice');
        }
        if (purposeLower.includes('data') || purposeLower.includes('process') || purposeLower.includes('transform')) {
            suggestions.push('PythonTransform', 'Conditional', 'Sequential');
        }
        if (purposeLower.includes('interactive') || purposeLower.includes('user') || purposeLower.includes('response')) {
            suggestions.push('GetVariable', 'SetVariable', 'Conditional');
        }
        if (purposeLower.includes('story') || purposeLower.includes('narrative') || purposeLower.includes('plot')) {
            suggestions.push('Markov', 'Sequential', 'WeightedChoice');
        }
        suggestions.push('Output');
        return [...new Set(suggestions)];
    }
    static suggestFocusAreas(domain) {
        const domainLower = domain.toLowerCase();
        const suggestions = [];
        if (domainLower.includes('education')) {
            suggestions.push('learning objectives', 'student engagement', 'assessment');
        }
        else if (domainLower.includes('entertainment')) {
            suggestions.push('user engagement', 'narrative flow', 'interactivity');
        }
        else if (domainLower.includes('business')) {
            suggestions.push('efficiency', 'scalability', 'user experience');
        }
        else if (domainLower.includes('creative')) {
            suggestions.push('originality', 'artistic expression', 'innovation');
        }
        else if (domainLower.includes('technical')) {
            suggestions.push('accuracy', 'performance', 'maintainability');
        }
        else {
            suggestions.push('functionality', 'usability', 'reliability');
        }
        return suggestions;
    }
}
exports.ParameterValidator = ParameterValidator;
exports.defaultPresets = [
    {
        id: 'simple-greeting',
        name: 'Simple Greeting Generator',
        description: 'Basic personalized greeting system',
        category: 'Getting Started',
        parameters: {
            purpose: 'Generate personalized greetings for users',
            complexity: 'simple',
            nodeCount: 5,
            style: 'creative',
            domain: 'social interaction',
            nodeTypes: [
                { nodeType: 'WeightedChoice', weight: 0.8, required: true },
                { nodeType: 'GetVariable', weight: 0.6, required: false },
                { nodeType: 'Concat', weight: 0.7, required: true },
                { nodeType: 'Output', weight: 1.0, required: true }
            ],
            provider: 'openai',
            temperature: 0.7,
            maxRetries: 3,
            includeMetadata: true,
            validateOutput: true,
            enablePreview: true,
            qualityLevel: 'standard',
            diversityScore: 0.6,
            outputFormat: 'both',
            includeExplanation: false,
            specificRequirements: ['Include user name', 'Multiple greeting options'],
            constraints: [],
            focusAreas: ['personalization', 'friendliness'],
            preferredPatterns: [],
            avoidPatterns: [],
            userContext: undefined
        },
        tags: ['beginner', 'greeting', 'simple'],
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'content-generator',
        name: 'Adaptive Content Generator',
        description: 'Content generation with user preference adaptation',
        category: 'Content Creation',
        parameters: {
            purpose: 'Create adaptive content based on user preferences and context',
            complexity: 'moderate',
            nodeCount: 15,
            style: 'balanced',
            domain: 'content creation',
            nodeTypes: [
                { nodeType: 'Conditional', weight: 0.8, required: true },
                { nodeType: 'WeightedChoice', weight: 0.7, required: false },
                { nodeType: 'Sequential', weight: 0.6, required: false },
                { nodeType: 'Concat', weight: 0.8, required: true }
            ],
            provider: 'claude',
            temperature: 0.6,
            maxRetries: 3,
            includeMetadata: true,
            validateOutput: true,
            enablePreview: true,
            qualityLevel: 'high',
            diversityScore: 0.7,
            outputFormat: 'both',
            includeExplanation: true,
            specificRequirements: [
                'Adapt to user experience level',
                'Support multiple content types',
                'Include personalization'
            ],
            constraints: [],
            focusAreas: ['personalization', 'content quality', 'user experience'],
            preferredPatterns: ['conditional branching', 'user adaptation'],
            avoidPatterns: ['static content'],
            userContext: undefined
        },
        tags: ['content', 'adaptive', 'moderate'],
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'interactive-tutor',
        name: 'Interactive Tutoring System',
        description: 'Complex adaptive tutoring with progress tracking',
        category: 'Education',
        parameters: {
            purpose: 'Build an adaptive tutoring system that adjusts to student responses and tracks progress',
            complexity: 'complex',
            nodeCount: 30,
            style: 'logical',
            domain: 'education technology',
            nodeTypes: [
                { nodeType: 'Conditional', weight: 0.9, required: true },
                { nodeType: 'Sequential', weight: 0.8, required: true },
                { nodeType: 'Markov', weight: 0.6, required: false },
                { nodeType: 'SetVariable', weight: 0.7, required: true },
                { nodeType: 'GetVariable', weight: 0.8, required: true }
            ],
            provider: 'gemini',
            temperature: 0.4,
            maxRetries: 5,
            includeMetadata: true,
            validateOutput: true,
            enablePreview: true,
            qualityLevel: 'high',
            diversityScore: 0.5,
            outputFormat: 'both',
            includeExplanation: true,
            specificRequirements: [
                'Track student progress dynamically',
                'Provide personalized feedback',
                'Adapt difficulty based on performance',
                'Include assessment paths'
            ],
            constraints: ['Educational content only', 'Age-appropriate language'],
            focusAreas: ['adaptive learning', 'feedback loops', 'progress tracking'],
            preferredPatterns: ['state tracking', 'conditional feedback'],
            avoidPatterns: ['static content', 'one-size-fits-all'],
            userContext: undefined
        },
        tags: ['education', 'adaptive', 'complex', 'tutoring'],
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];
//# sourceMappingURL=parameter-schema.js.map