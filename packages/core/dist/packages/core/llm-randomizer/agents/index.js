// Epic 12 - LLM Agent Randomizer System
// Story 12.2 - LLM Agent Script Development
// Public API exports for LLM agent system
import { generateGraphWithOpenAI } from './scripts/openai-agent';
import { generateGraphWithClaude } from './scripts/anthropic-agent';
import { generateGraphWithGemini } from './scripts/gemini-agent';
// OpenAI Agent
export { OpenAIGraphAgent, defaultOpenAIConfig, generateGraphWithOpenAI } from './scripts/openai-agent';
// Anthropic Agent
export { AnthropicGraphAgent, defaultAnthropicConfig, generateGraphWithClaude } from './scripts/anthropic-agent';
// Gemini Agent
export { GeminiGraphAgent, defaultGeminiConfig, generateGraphWithGemini } from './scripts/gemini-agent';
// Cross-Model Testing
export { CrossModelTester, testCases, runCrossModelTests, generateTestReport } from './examples/cross-model-examples';
/**
 * Universal generation function that routes to appropriate agent
 */
export async function generateGraph(request, provider = 'openai', config = {}) {
    switch (provider) {
        case 'openai':
            return generateGraphWithOpenAI(request, config);
        case 'claude':
            return generateGraphWithClaude(request, config);
        case 'gemini':
            return generateGraphWithGemini(request, config);
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}
