// Epic 12 - LLM Agent Randomizer System
// Story 12.2 - LLM Agent Script Development
// Public API exports for LLM agent system

// OpenAI Agent
export {
  OpenAIGraphAgent,
  OpenAIAgentConfig,
  GraphGenerationRequest,
  GenerationResult,
  defaultOpenAIConfig,
  generateGraphWithOpenAI
} from './scripts/openai-agent';

// Anthropic Agent
export {
  AnthropicGraphAgent,
  AnthropicAgentConfig,
  ClaudeGenerationRequest,
  ClaudeGenerationResult,
  defaultAnthropicConfig,
  generateGraphWithClaude
} from './scripts/anthropic-agent';

// Gemini Agent
export {
  GeminiGraphAgent,
  GeminiAgentConfig,
  GeminiGenerationRequest,
  GeminiGenerationResult,
  defaultGeminiConfig,
  generateGraphWithGemini
} from './scripts/gemini-agent';

// Cross-Model Testing
export {
  CrossModelTester,
  CrossModelTestResult,
  testCases,
  runCrossModelTests,
  generateTestReport
} from './examples/cross-model-examples';

// Agent Types for Union Types
export type AnyAgentConfig = OpenAIAgentConfig | AnthropicAgentConfig | GeminiAgentConfig;
export type AnyGenerationRequest = GraphGenerationRequest | ClaudeGenerationRequest | GeminiGenerationRequest;
export type AnyGenerationResult = GenerationResult | ClaudeGenerationResult | GeminiGenerationResult;

/**
 * Universal agent interface for consistent usage across models
 */
export interface UniversalAgentRequest {
  purpose: string;
  complexity: 'simple' | 'moderate' | 'complex';
  nodeCount: number;
  nodeTypes?: string[];
  specificRequirements?: string[];
  focusAreas?: string[];
  style?: 'creative' | 'logical' | 'balanced';
  domain?: string;
  
  // Model-specific extensions
  userContext?: string; // For Claude
  constraints?: string[]; // For Gemini
  examples?: string[]; // For Gemini
}

/**
 * Universal generation function that routes to appropriate agent
 */
export async function generateGraph(
  request: UniversalAgentRequest,
  provider: 'openai' | 'claude' | 'gemini' = 'openai',
  config: Partial<AnyAgentConfig> = {}
): Promise<AnyGenerationResult> {
  switch (provider) {
    case 'openai':
      return generateGraphWithOpenAI(request as GraphGenerationRequest, config as Partial<OpenAIAgentConfig>);
    
    case 'claude':
      return generateGraphWithClaude(request as ClaudeGenerationRequest, config as Partial<AnthropicAgentConfig>);
    
    case 'gemini':
      return generateGraphWithGemini(request as GeminiGenerationRequest, config as Partial<GeminiAgentConfig>);
    
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}