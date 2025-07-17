// Epic 12 - LLM Agent Randomizer System
// Story 12.4 - Randomizer Generator Implementation
// Parameter schema and validation system

import { z } from 'zod';

export const ComplexityLevel = z.enum(['simple', 'moderate', 'complex']);
export const StylePreference = z.enum(['creative', 'logical', 'balanced']);
export const LLMProvider = z.enum(['openai', 'claude', 'gemini']);

export const NodeTypePreference = z.object({
  nodeType: z.string(),
  weight: z.number().min(0).max(1),
  required: z.boolean().default(false)
});

export const RandomizerParametersSchema = z.object({
  // Core Generation Parameters
  purpose: z.string().min(10).max(500),
  complexity: ComplexityLevel,
  nodeCount: z.number().int().min(3).max(100),
  style: StylePreference,
  
  // Domain and Context
  domain: z.string().optional(),
  userContext: z.string().optional(),
  
  // Node Type Preferences
  nodeTypes: z.array(NodeTypePreference).default([]),
  
  // Requirements and Constraints
  specificRequirements: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  focusAreas: z.array(z.string()).default([]),
  
  // LLM Configuration
  provider: LLMProvider.default('openai'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxRetries: z.number().int().min(1).max(10).default(3),
  
  // Advanced Options
  includeMetadata: z.boolean().default(true),
  validateOutput: z.boolean().default(true),
  enablePreview: z.boolean().default(true),
  
  // Generation Preferences
  preferredPatterns: z.array(z.string()).default([]),
  avoidPatterns: z.array(z.string()).default([]),
  
  // Quality Settings
  qualityLevel: z.enum(['draft', 'standard', 'high']).default('standard'),
  diversityScore: z.number().min(0).max(1).default(0.5),
  
  // Output Configuration
  outputFormat: z.enum(['graph', 'serialized', 'both']).default('both'),
  includeExplanation: z.boolean().default(false)
});

export type RandomizerParameters = z.infer<typeof RandomizerParametersSchema>;

export const ParameterPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  parameters: RandomizerParametersSchema,
  tags: z.array(z.string()).default([]),
  isDefault: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type ParameterPreset = z.infer<typeof ParameterPresetSchema>;

export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
    code: z.string()
  })),
  warnings: z.array(z.object({
    field: z.string(),
    message: z.string(),
    suggestion: z.string().optional()
  }))
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

/**
 * Parameter validation class
 */
export class ParameterValidator {
  
  /**
   * Validate parameters against schema
   */
  static validate(parameters: Partial<RandomizerParameters>): ValidationResult {
    const result = RandomizerParametersSchema.safeParse(parameters);
    
    if (result.success) {
      // Additional business logic validation
      return this.validateBusinessRules(result.data);
    } else {
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

  /**
   * Validate business rules beyond schema
   */
  private static validateBusinessRules(parameters: RandomizerParameters): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    // Node count vs complexity validation
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

    // Purpose length validation
    if (parameters.purpose.length < 20) {
      warnings.push({
        field: 'purpose',
        message: 'Purpose description is quite brief',
        suggestion: 'Provide more detailed purpose for better graph generation'
      });
    }

    // Node type requirements validation
    const requiredNodeTypes = parameters.nodeTypes.filter(nt => nt.required);
    if (requiredNodeTypes.length > Math.floor(parameters.nodeCount / 2)) {
      errors.push({
        field: 'nodeTypes',
        message: 'Too many required node types for target node count',
        code: 'TOO_MANY_REQUIRED_TYPES'
      });
    }

    // Temperature validation for provider
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

  /**
   * Get parameter suggestions based on input
   */
  static getSuggestions(parameters: Partial<RandomizerParameters>): {
    nodeCount?: number;
    nodeTypes?: string[];
    temperature?: number;
    focusAreas?: string[];
  } {
    const suggestions: any = {};

    // Suggest node count based on complexity
    if (parameters.complexity && !parameters.nodeCount) {
      const counts = {
        simple: 5,
        moderate: 12,
        complex: 25
      };
      suggestions.nodeCount = counts[parameters.complexity];
    }

    // Suggest node types based on purpose
    if (parameters.purpose && (!parameters.nodeTypes || parameters.nodeTypes.length === 0)) {
      suggestions.nodeTypes = this.suggestNodeTypes(parameters.purpose);
    }

    // Suggest temperature based on style
    if (parameters.style && !parameters.temperature) {
      const temperatures = {
        creative: 0.8,
        logical: 0.3,
        balanced: 0.7
      };
      suggestions.temperature = temperatures[parameters.style];
    }

    // Suggest focus areas based on domain
    if (parameters.domain && (!parameters.focusAreas || parameters.focusAreas.length === 0)) {
      suggestions.focusAreas = this.suggestFocusAreas(parameters.domain);
    }

    return suggestions;
  }

  /**
   * Suggest appropriate node types based on purpose
   */
  private static suggestNodeTypes(purpose: string): string[] {
    const purposeLower = purpose.toLowerCase();
    const suggestions: string[] = [];

    // Content generation patterns
    if (purposeLower.includes('content') || purposeLower.includes('text') || purposeLower.includes('writing')) {
      suggestions.push('WeightedChoice', 'Concat', 'Sequential');
    }

    // Decision making patterns
    if (purposeLower.includes('decision') || purposeLower.includes('choice') || purposeLower.includes('branch')) {
      suggestions.push('Conditional', 'WeightedChoice');
    }

    // Data processing patterns
    if (purposeLower.includes('data') || purposeLower.includes('process') || purposeLower.includes('transform')) {
      suggestions.push('PythonTransform', 'Conditional', 'Sequential');
    }

    // Interactive patterns
    if (purposeLower.includes('interactive') || purposeLower.includes('user') || purposeLower.includes('response')) {
      suggestions.push('GetVariable', 'SetVariable', 'Conditional');
    }

    // Story/narrative patterns
    if (purposeLower.includes('story') || purposeLower.includes('narrative') || purposeLower.includes('plot')) {
      suggestions.push('Markov', 'Sequential', 'WeightedChoice');
    }

    // Always include Output for completeness
    suggestions.push('Output');

    return [...new Set(suggestions)]; // Remove duplicates
  }

  /**
   * Suggest focus areas based on domain
   */
  private static suggestFocusAreas(domain: string): string[] {
    const domainLower = domain.toLowerCase();
    const suggestions: string[] = [];

    if (domainLower.includes('education')) {
      suggestions.push('learning objectives', 'student engagement', 'assessment');
    } else if (domainLower.includes('entertainment')) {
      suggestions.push('user engagement', 'narrative flow', 'interactivity');
    } else if (domainLower.includes('business')) {
      suggestions.push('efficiency', 'scalability', 'user experience');
    } else if (domainLower.includes('creative')) {
      suggestions.push('originality', 'artistic expression', 'innovation');
    } else if (domainLower.includes('technical')) {
      suggestions.push('accuracy', 'performance', 'maintainability');
    } else {
      suggestions.push('functionality', 'usability', 'reliability');
    }

    return suggestions;
  }
}

/**
 * Default parameter presets
 */
export const defaultPresets: ParameterPreset[] = [
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