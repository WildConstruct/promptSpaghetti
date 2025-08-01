// Epic 12 - LLM Agent Randomizer System
// Story 12.4 - Randomizer Generator Implementation
// Parameter schema and validation system
import { z } from 'zod';

export const ComplexityLevel = z.enum(['simple', 'moderate', 'complex']);
export const StylePreference = z.enum(['creative', 'logical', 'balanced']);
export const LLMProvider = z.enum(['openai', 'claude', 'gemini']);

export const NodeTypePreference = z.object({ )
  nodeType: z.string(),
  weight: z.number().min(0).max(1),
  required: z.boolean().default(false) }
});

export const RandomizerParametersSchema = z.object({ )
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
  includeExplanation: z.boolean().default(false) }
});

export type RandomizerParameters = z.infer<typeof RandomizerParametersSchema>;

export const ParameterPresetSchema = z.object({ )
  id: z.string()
  name: z.string()
  description: z.string()
  category: z.string()
  parameters: RandomizerParametersSchema
  tags: z.array(z.string()).default([])
  isDefault: z.boolean().default(false)
  createdAt: z.string().datetime()
  updatedAt: z.string().datetime() }
});

export type ParameterPreset = z.infer<typeof ParameterPresetSchema>;

export const ValidationResultSchema = z.object({ )
  isValid: z.boolean()
  errors: z.array(z.object({)
  field: z.string()
  message: z.string()
  code: z.string() }
}))
  warnings: z.array(z.object({ )
  field: z.string()
  message: z.string()
  suggestion: z.string().optional() }
}))
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;
/**
 * Parameter validation class
 */
export class ParameterValidator { /**
  * Validate parameters against schema
  */
  static validate(parameters: Partial<RandomizerParameters>): ValidationResult { }
  const result = RandomizerParametersSchema.safeParse(parameters);
  if (result.success) { // Additional business logic validation
  return this.validateBusinessRules(result.data) } else { console.log('Schema validation failed:', result.error.errors);
  return {
  isValid: false
  errors: result.error.errors.map(err => ({)
  field: err.path.join('.')
  message: err.message
  code: err.code }
}))
        warnings: [];
  };
  /**
   * Validate business rules beyond schema
   */
  private static validateBusinessRules(parameters: RandomizerParameters): ValidationResult {
    console.log('validateBusinessRules called with parameters:', parameters);
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];
    // Node count vs complexity validation
    const complexityNodeRanges = {
      simple: { min: 3, max: 8 }
      moderate: { min: 8, max: 20 }
      complex: { min: 20, max: 100 }
    };
    const range = complexityNodeRanges[parameters.complexity];
    if (parameters.nodeCount < range.min || parameters.nodeCount > range.max) { warnings.push({)
  field: 'nodeCount' }
        message: `Node count ${parameters.nodeCount} may not match ${parameters.complexity} complexity`}
},
  suggestion: `Consider ${range.min}-${range.max} nodes for ${parameters.complexity} complexity`}
      });
    // Purpose length validation
    if (parameters.purpose.length < 20) { warnings.push({)
  field: 'purpose',
  message: 'Purpose description is quite brief',
  suggestion: 'Provide more detailed purpose for better graph generation' }
});
    // Purpose-complexity mismatch validation
    const purposeLower = parameters.purpose.toLowerCase();
    console.log('Purpose text (lowercase):', purposeLower);
    console.log('Complexity setting:', parameters.complexity);
    const complexityKeywords = { complex: ['complex', 'advanced', 'sophisticated', 'intricate', 'elaborate'],
  moderate: ['moderate', 'medium', 'balanced', 'standard'],
  simple: ['simple', 'basic', 'minimal', 'straightforward', 'easy'] }
};
    // Check if purpose suggests higher complexity than setting
    const hasComplexKeywords = complexityKeywords.complex.some(keyword => purposeLower.includes(keyword));
    console.log('Has complex keywords:', hasComplexKeywords);
    console.log('Is complexity simple:', parameters.complexity === 'simple');
    if (parameters.complexity === 'simple' && hasComplexKeywords) { console.log('Adding complexity warning!');
  warnings.push({)
  field: 'complexity',
  message: 'Purpose suggests complex requirements but complexity is set to simple',
  suggestion: 'Consider setting complexity to "moderate" or "complex" for better results' }
});
 else if (parameters.complexity === 'moderate' && )
               complexityKeywords.complex.some(keyword => purposeLower.includes(keyword))) { warnings.push({)
  field: 'complexity',
  message: 'Purpose suggests complex requirements but complexity is set to moderate',
  suggestion: 'Consider setting complexity to "complex" for better results' }
});
    // Node type requirements validation
    const requiredNodeTypes = parameters.nodeTypes.filter(nt => nt.required);
    if (requiredNodeTypes.length > Math.floor(parameters.nodeCount / 2)) { errors.push({)
  field: 'nodeTypes',
  message: 'Too many required node types for target node count',
  code: 'TOO_MANY_REQUIRED_TYPES' }
});
    // Temperature validation for provider
    if (parameters.provider === 'openai' && parameters.temperature > 1.5) { warnings.push({)
  field: 'temperature',
  message: 'High temperature may reduce output quality for OpenAI models',
  suggestion: 'Consider temperature 0.3-1.0 for structured output' }
});
    return { isValid: errors.length === 0,
  errors }
  warnings
};
  /**
   * Get parameter suggestions based on input
   */
  static getSuggestions(parameters: Partial<RandomizerParameters>): {
    nodeCount?: number;
    nodeTypes?: string;
    temperature?: number;
    focusAreas?: string;
    const suggestions: any = {};
    // Suggest node count based on complexity
    if (parameters.complexity && !parameters.nodeCount) { const counts = {
  simple: 5
  moderate: 12
  complex: 25 }
};
      suggestions.nodeCount = counts[parameters.complexity];
    // Suggest node types based on purpose
    if (parameters.purpose && (!parameters.nodeTypes || parameters.nodeTypes.length === 0)) { suggestions.nodeTypes = this.suggestNodeTypes(parameters.purpose);
  // Suggest temperature based on style
  if (parameters.style && !parameters.temperature) {
  const temperatures = {
  creative: 0.8
  logical: 0.3
  balanced: 0.7 }
};
      suggestions.temperature = temperatures[parameters.style];
    // Suggest focus areas based on domain
    if (parameters.domain && (!parameters.focusAreas || parameters.focusAreas.length === 0)) { suggestions.focusAreas = this.suggestFocusAreas(parameters.domain);
  return suggestions;
  /**
  * Suggest appropriate node types based on purpose
  */
  static suggestNodeTypes(purpose: string): string {
  const lower = purpose.toLowerCase();
  const nodeTypes: string = [];
  // Check each pattern and add appropriate node types
  if (lower.includes('content') || lower.includes('text') || lower.includes('writing')) {
  nodeTypes.push('WeightedChoice', 'Concat', 'Sequential');
  if (lower.includes('decision') || lower.includes('choice') || lower.includes('branch')) {
  nodeTypes.push('Conditional', 'WeightedChoice');
  if (lower.includes('data') || lower.includes('process') || lower.includes('transform')) {
  nodeTypes.push('PythonTransform', 'Conditional', 'Sequential');
  if (lower.includes('interactive') || lower.includes('user') || lower.includes('response')) {
  nodeTypes.push('GetVariable', 'SetVariable', 'Conditional');
  if (lower.includes('story') || lower.includes('narrative') || lower.includes('plot')) {
  nodeTypes.push('Markov', 'Sequential', 'WeightedChoice');
  // Always add Output
  nodeTypes.push('Output');
  // Remove duplicates and return
  return Array.from(new Set(nodeTypes));
  /**
  * Suggest focus areas based on domain
  */
  private static suggestFocusAreas(domain: string): string { }
  const domainLower = domain.toLowerCase();
  const suggestions: string = [];
  if (domainLower.includes('education')) { suggestions.push('learning objectives', 'student engagement', 'assessment') } else if (domainLower.includes('entertainment')) { suggestions.push('user engagement', 'narrative flow', 'interactivity') } else if (domainLower.includes('business')) { suggestions.push('efficiency', 'scalability', 'user experience') } else if (domainLower.includes('creative')) { suggestions.push('originality', 'artistic expression', 'innovation') } else if (domainLower.includes('technical')) { suggestions.push('accuracy', 'performance', 'maintainability') } else { suggestions.push('functionality', 'usability', 'reliability');
  return suggestions;
  /**
  * Default parameter presets
  */
  export const defaultPresets: ParameterPreset = [
  {
  id: 'simple-greeting'
  name: 'Simple Greeting Generator'
  description: 'A basic greeting system that personalizes messages for users'
  category: 'Getting Started'
  parameters: {
  purpose: 'Create a personalized greeting system for users'
  complexity: 'simple'
  nodeCount: 3
  style: 'balanced'
  provider: 'openai'
  temperature: 0.7
  maxRetries: 3
  nodeTypes: []
  specificRequirements: ['Include user name', 'Time-based greetings']
  constraints: ['Keep messages under 50 characters']
  focusAreas: ['personalization']
  includeMetadata: true
  validateOutput: true
  enablePreview: true
  preferredPatterns: []
  avoidPatterns: []
  qualityLevel: 'standard'
  diversityScore: 0.5
  outputFormat: 'both'
  includeExplanation: false }

  tags: ['beginner', 'greeting', 'simple']
    isDefault: true
    createdAt: new Date().toISOString()
    updatedAt: new Date().toISOString();

  { id: 'creative-storyteller'
  name: 'Creative Storyteller'
  description: 'Generate dynamic story elements with creative branching'
  category: 'Creative Writing'
  parameters: {
  purpose: 'Create dynamic story generation with multiple plot branches'
  complexity: 'moderate'
  nodeCount: 8
  style: 'creative'
  provider: 'openai'
  temperature: 0.9
  maxRetries: 3
  nodeTypes: []
  specificRequirements: ['Character development', 'Plot twists', 'Multiple endings']
  constraints: ['Family-friendly content', 'Maximum 500 words per branch']
  focusAreas: ['narrative', 'creativity']
  includeMetadata: true
  validateOutput: true
  enablePreview: true
  preferredPatterns: []
  avoidPatterns: []
  qualityLevel: 'standard'
  diversityScore: 0.5
  outputFormat: 'both'
  includeExplanation: true }

  tags: ['creative', 'storytelling', 'branching']
    isDefault: true
    createdAt: new Date().toISOString()
    updatedAt: new Date().toISOString();

  { id: 'technical-docs'
  name: 'Technical Documentation'
  description: 'Generate structured technical documentation with precise formatting'
  category: 'Professional'
  parameters: {
  purpose: 'Create comprehensive technical documentation with structured format'
  complexity: 'complex'
  nodeCount: 12
  style: 'logical'
  provider: 'openai'
  temperature: 0.3
  maxRetries: 3
  nodeTypes: []
  specificRequirements: ['Code examples', 'Step-by-step instructions', 'Error handling']
  constraints: ['Technical accuracy', 'Consistent formatting', 'Clear structure']
  focusAreas: ['documentation', 'technical-writing']
  includeMetadata: true
  validateOutput: true
  enablePreview: true
  preferredPatterns: []
  avoidPatterns: []
  qualityLevel: 'high'
  diversityScore: 0.3
  outputFormat: 'both'
  includeExplanation: true }

  tags: ['technical', 'documentation', 'structured']
    isDefault: true
    createdAt: new Date().toISOString()
    updatedAt: new Date().toISOString()];