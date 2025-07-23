'use strict';
// Epic 12 - LLM Agent Randomizer System
// Story 12.4 - Randomizer Generator Implementation
// Parameter schema and validation system
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, '__esModule', { value: true });
exports.defaultPresets = exports.ParameterValidator = exports.ValidationResultSchema = exports.ParameterPresetSchema = exports.RandomizerParametersSchema = exports.NodeTypePreference = exports.LLMProvider = exports.StylePreference = exports.ComplexityLevel = void 0;
var zod_1 = require('zod');
exports.ComplexityLevel = zod_1.z.enum(['simple', 'moderate', 'complex']);
exports.StylePreference = zod_1.z.enum(['creative', 'logical', 'balanced']);
exports.LLMProvider = zod_1.z.enum(['openai', 'claude', 'gemini']);
exports.NodeTypePreference = zod_1.z.object({
  nodeType: zod_1.z.string(),
  weight: zod_1.z.number().min(0).max(1),
  required: zod_1.z.boolean().default(false)
});
exports.RandomizerParametersSchema = zod_1.z.object({
  // Core Generation Parameters
  purpose: zod_1.z.string().min(10).max(500),
  complexity: exports.ComplexityLevel,
  nodeCount: zod_1.z.number().int().min(3).max(100),
  style: exports.StylePreference,
  // Domain and Context
  domain: zod_1.z.string().optional(),
  userContext: zod_1.z.string().optional(),
  // Node Type Preferences
  nodeTypes: zod_1.z.array(exports.NodeTypePreference).default([]),
  // Requirements and Constraints
  specificRequirements: zod_1.z.array(zod_1.z.string()).default([]),
  constraints: zod_1.z.array(zod_1.z.string()).default([]),
  focusAreas: zod_1.z.array(zod_1.z.string()).default([]),
  // LLM Configuration
  provider: exports.LLMProvider.default('openai'),
  temperature: zod_1.z.number().min(0).max(2).default(0.7),
  maxRetries: zod_1.z.number().int().min(1).max(10).default(3),
  // Advanced Options
  includeMetadata: zod_1.z.boolean().default(true),
  validateOutput: zod_1.z.boolean().default(true),
  enablePreview: zod_1.z.boolean().default(true),
  // Generation Preferences
  preferredPatterns: zod_1.z.array(zod_1.z.string()).default([]),
  avoidPatterns: zod_1.z.array(zod_1.z.string()).default([]),
  // Quality Settings
  qualityLevel: zod_1.z.enum(['draft', 'standard', 'high']).default('standard'),
  diversityScore: zod_1.z.number().min(0).max(1).default(0.5),
  // Output Configuration
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
/**
 * Parameter validation class
 */
var ParameterValidator = /** @class */ (function () {
  function ParameterValidator() {
  }
  /**
     * Validate parameters against schema
     */
  ParameterValidator.validate = function (parameters) {
    var result = exports.RandomizerParametersSchema.safeParse(parameters);
    if (result.success) {
      // Additional business logic validation
      return this.validateBusinessRules(result.data);
    }
    else {
      console.log('Schema validation failed:', result.error.errors);
      return {
        isValid: false,
        errors: result.error.errors.map(function (err) { return ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }); }),
        warnings: []
      };
    }
  };
  /**
     * Validate business rules beyond schema
     */
  ParameterValidator.validateBusinessRules = function (parameters) {
    console.log('validateBusinessRules called with parameters:', parameters);
    var errors = [];
    var warnings = [];
    // Node count vs complexity validation
    var complexityNodeRanges = {
      simple: { min: 3, max: 8 },
      moderate: { min: 8, max: 20 },
      complex: { min: 20, max: 100 }
    };
    var range = complexityNodeRanges[parameters.complexity];
    if (parameters.nodeCount < range.min || parameters.nodeCount > range.max) {
      warnings.push({
        field: 'nodeCount',
        message: 'Node count '.concat(parameters.nodeCount, ' may not match ').concat(parameters.complexity, ' complexity'),
        suggestion: 'Consider '.concat(range.min, '-').concat(range.max, ' nodes for ').concat(parameters.complexity, ' complexity')
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
    // Purpose-complexity mismatch validation
    var purposeLower = parameters.purpose.toLowerCase();
    console.log('Purpose text (lowercase):', purposeLower);
    console.log('Complexity setting:', parameters.complexity);
    var complexityKeywords = {
      complex: ['complex', 'advanced', 'sophisticated', 'intricate', 'elaborate'],
      moderate: ['moderate', 'medium', 'balanced', 'standard'],
      simple: ['simple', 'basic', 'minimal', 'straightforward', 'easy']
    };
    // Check if purpose suggests higher complexity than setting
    var hasComplexKeywords = complexityKeywords.complex.some(function (keyword) { return purposeLower.includes(keyword); });
    console.log('Has complex keywords:', hasComplexKeywords);
    console.log('Is complexity simple:', parameters.complexity === 'simple');
    if (parameters.complexity === 'simple' && hasComplexKeywords) {
      console.log('Adding complexity warning!');
      warnings.push({
        field: 'complexity',
        message: 'Purpose suggests complex requirements but complexity is set to simple',
        suggestion: 'Consider setting complexity to "moderate" or "complex" for better results'
      });
    }
    else if (parameters.complexity === 'moderate' &&
            complexityKeywords.complex.some(function (keyword) { return purposeLower.includes(keyword); })) {
      warnings.push({
        field: 'complexity',
        message: 'Purpose suggests complex requirements but complexity is set to moderate',
        suggestion: 'Consider setting complexity to "complex" for better results'
      });
    }
    // Node type requirements validation
    var requiredNodeTypes = parameters.nodeTypes.filter(function (nt) { return nt.required; });
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
      errors: errors,
      warnings: warnings
    };
  };
  /**
     * Get parameter suggestions based on input
     */
  ParameterValidator.getSuggestions = function (parameters) {
    console.log('getSuggestions called with parameters:', parameters);
    var suggestions = {};
    // Suggest node count based on complexity
    if (parameters.complexity && !parameters.nodeCount) {
      var counts = {
        simple: 5,
        moderate: 12,
        complex: 25
      };
      suggestions.nodeCount = counts[parameters.complexity];
    }
    // Suggest node types based on purpose
    if (parameters.purpose && (!parameters.nodeTypes || parameters.nodeTypes.length === 0)) {
      console.log('About to call suggestNodeTypes with purpose:', parameters.purpose);
      suggestions.nodeTypes = this.suggestNodeTypes(parameters.purpose);
      console.log('suggestNodeTypes returned:', suggestions.nodeTypes);
    }
    else {
      console.log('Skipping nodeTypes suggestion. purpose:', parameters.purpose, 'nodeTypes:', parameters.nodeTypes);
    }
    // Suggest temperature based on style
    if (parameters.style && !parameters.temperature) {
      var temperatures = {
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
    console.log('Final suggestions:', suggestions);
    return suggestions;
  };
  /**
     * Suggest appropriate node types based on purpose
     */
  ParameterValidator.suggestNodeTypes = function (purpose) {
    var purposeLower = purpose.toLowerCase();
    var suggestions = [];
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
    return __spreadArray([], new Set(suggestions), true); // Remove duplicates
  };
  /**
     * Suggest focus areas based on domain
     */
  ParameterValidator.suggestFocusAreas = function (domain) {
    var domainLower = domain.toLowerCase();
    var suggestions = [];
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
  };
  return ParameterValidator;
}());
exports.ParameterValidator = ParameterValidator;
/**
 * Default parameter presets
 */
exports.defaultPresets = [
  {
    id: 'simple-greeting',
    name: 'Simple Greeting Generator',
    description: 'A basic greeting system that personalizes messages for users',
    category: 'Getting Started',
    parameters: {
      purpose: 'Create a personalized greeting system for users',
      complexity: 'simple',
      nodeCount: 3,
      style: 'balanced',
      provider: 'openai',
      temperature: 0.7,
      maxRetries: 3,
      nodeTypes: [],
      specificRequirements: ['Include user name', 'Time-based greetings'],
      constraints: ['Keep messages under 50 characters'],
      focusAreas: ['personalization'],
      includeMetadata: true,
      validateOutput: true,
      enablePreview: true,
      preferredPatterns: [],
      avoidPatterns: [],
      qualityLevel: 'standard',
      diversityScore: 0.5,
      outputFormat: 'both',
      includeExplanation: false
    },
    tags: ['beginner', 'greeting', 'simple'],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'creative-storyteller',
    name: 'Creative Storyteller',
    description: 'Generate dynamic story elements with creative branching',
    category: 'Creative Writing',
    parameters: {
      purpose: 'Create dynamic story generation with multiple plot branches',
      complexity: 'moderate',
      nodeCount: 8,
      style: 'creative',
      provider: 'openai',
      temperature: 0.9,
      maxRetries: 3,
      nodeTypes: [],
      specificRequirements: ['Character development', 'Plot twists', 'Multiple endings'],
      constraints: ['Family-friendly content', 'Maximum 500 words per branch'],
      focusAreas: ['narrative', 'creativity'],
      includeMetadata: true,
      validateOutput: true,
      enablePreview: true,
      preferredPatterns: [],
      avoidPatterns: [],
      qualityLevel: 'standard',
      diversityScore: 0.5,
      outputFormat: 'both',
      includeExplanation: true
    },
    tags: ['creative', 'storytelling', 'branching'],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'technical-docs',
    name: 'Technical Documentation',
    description: 'Generate structured technical documentation with precise formatting',
    category: 'Professional',
    parameters: {
      purpose: 'Create comprehensive technical documentation with structured format',
      complexity: 'complex',
      nodeCount: 12,
      style: 'logical',
      provider: 'openai',
      temperature: 0.3,
      maxRetries: 3,
      nodeTypes: [],
      specificRequirements: ['Code examples', 'Step-by-step instructions', 'Error handling'],
      constraints: ['Technical accuracy', 'Consistent formatting', 'Clear structure'],
      focusAreas: ['documentation', 'technical-writing'],
      includeMetadata: true,
      validateOutput: true,
      enablePreview: true,
      preferredPatterns: [],
      avoidPatterns: [],
      qualityLevel: 'high',
      diversityScore: 0.3,
      outputFormat: 'both',
      includeExplanation: true
    },
    tags: ['technical', 'documentation', 'structured'],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
//# sourceMappingURL=parameter-schema.js.map