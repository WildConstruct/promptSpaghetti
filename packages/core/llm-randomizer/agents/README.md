# LLM Agent System Documentation

## Overview

The LLM Agent System provides specialized graph generation agents for OpenAI, Anthropic, and Google models. Each agent is optimized for its respective model's capabilities and constraints.

## Quick Start

```typescript
import { generateGraph, generateGraphWithOpenAI } from './agents';

// Universal interface (automatically routes to best agent)
const result = await generateGraph({
  purpose: "Create a personalized greeting system",
  complexity: "simple",
  nodeCount: 5,
  nodeTypes: ["WeightedChoice", "Concat", "Output"],
  style: "friendly"
});

// Model-specific interface
const openaiResult = await generateGraphWithOpenAI({
  purpose: "Generate story content",
  complexity: "moderate", 
  nodeCount: 15,
  specificRequirements: ["Multiple story paths", "Character development"]
});
```

## Agent Capabilities

### OpenAI Agent (`openai-agent.ts`)
- **Models**: GPT-4, GPT-3.5-turbo
- **Features**: JSON mode support, structured output, retry logic
- **Optimizations**: Temperature control, token efficiency
- **Best For**: Consistent structured output, large graphs

```typescript
const config = {
  model: 'gpt-4',
  temperature: 0.7,
  useJsonMode: true,
  maxRetries: 3
};
```

### Anthropic Agent (`anthropic-agent.ts`)
- **Models**: Claude-3 (Sonnet, Opus, Haiku)
- **Features**: XML formatting, reasoning chains, context awareness
- **Optimizations**: Structured prompts, safety considerations
- **Best For**: Complex logic, reasoning-heavy graphs

```typescript
const config = {
  model: 'claude-3-sonnet-20240229',
  temperature: 0.7,
  useXmlFormatting: true,
  maxRetries: 3
};
```

### Gemini Agent (`gemini-agent.ts`)
- **Models**: Gemini-1.5-Pro, Gemini-1.0-Pro
- **Features**: Safety filters, structured output, multimodal support
- **Optimizations**: Content filtering, safety compliance
- **Best For**: Safe content generation, educational applications

```typescript
const config = {
  model: 'gemini-1.5-pro',
  temperature: 0.7,
  useStructuredOutput: true,
  safetySettings: [...]
};
```

## Request Parameters

### Core Parameters (All Agents)
- `purpose`: Clear description of graph's intended function
- `complexity`: "simple" (3-8 nodes) | "moderate" (8-20) | "complex" (20-50)
- `nodeCount`: Target number of nodes
- `nodeTypes`: Preferred node types to use
- `style`: "creative" | "logical" | "balanced"

### Advanced Parameters
- `specificRequirements`: Detailed constraints and features
- `focusAreas`: Areas of emphasis (e.g., "performance", "creativity")
- `domain`: Application domain (e.g., "education", "entertainment")

### Model-Specific Extensions
- **Claude**: `userContext` for additional context
- **Gemini**: `constraints` and `examples` for safety and guidance

## Response Structure

All agents return consistent response structures:

```typescript
interface GenerationResult {
  success: boolean;
  graph?: string;        // Generated graph in serialization format
  errors?: string[];     // Validation or generation errors  
  warnings?: string[];   // Non-critical issues
  attempts: number;      // Number of generation attempts
  metadata: {
    model: string;
    temperature: number;
    tokenCount: number;
    generationTime: number;
  };
}
```

## Error Handling and Retry Logic

### Automatic Retry Strategy
1. **Format Validation**: Check output against serialization spec
2. **Temperature Reduction**: Lower temperature on retry for better consistency  
3. **Error Feedback**: Provide specific validation errors to model
4. **Fallback Templates**: Use known-good templates as last resort

### Common Error Types
- **Format Violations**: Invalid YAML, missing sections
- **Reference Errors**: Non-existent node references
- **Cycle Detection**: Circular dependencies in graph
- **Property Validation**: Missing required node properties

## Testing and Validation

### Cross-Model Testing
```typescript
import { runCrossModelTests, generateTestReport } from './agents';

const results = await runCrossModelTests();
const report = generateTestReport(results);
console.log(report);
```

### Individual Agent Testing
```typescript
import { testCases, CrossModelTester } from './agents';

const tester = new CrossModelTester();
const result = await tester.testAllModels(testCases.simpleGreeting);
```

## Best Practices

### Request Design
1. **Clear Purpose**: Specific, actionable goals
2. **Appropriate Complexity**: Match complexity to actual needs
3. **Node Type Guidance**: Suggest relevant node types
4. **Realistic Constraints**: Achievable requirements

### Model Selection
- **OpenAI**: General-purpose, consistent output
- **Claude**: Complex reasoning, safety-conscious
- **Gemini**: Educational content, safety-critical applications

### Performance Optimization
- **Batch Requests**: Group related generations
- **Cache Results**: Store successful patterns
- **Monitor Metrics**: Track success rates and performance
- **Temperature Tuning**: Adjust for consistency vs creativity

## Configuration Examples

### Development Configuration
```typescript
const devConfig = {
  temperature: 0.3,      // Lower for consistency
  maxRetries: 1,         // Faster iteration
  maxTokens: 1000       // Smaller outputs
};
```

### Production Configuration
```typescript
const prodConfig = {
  temperature: 0.7,      // Balanced creativity
  maxRetries: 3,         // Robust error handling
  maxTokens: 2000,      // Full-featured graphs
  useJsonMode: true     // Structured output
};
```

## Integration Patterns

### Simple Integration
```typescript
// Basic graph generation
const graph = await generateGraph({
  purpose: "User onboarding flow",
  complexity: "moderate",
  nodeCount: 12
});
```

### Advanced Integration
```typescript
// Multi-model comparison
const requests = [
  { provider: 'openai' as const, config: openaiConfig },
  { provider: 'claude' as const, config: claudeConfig },
  { provider: 'gemini' as const, config: geminiConfig }
];

const results = await Promise.all(
  requests.map(({ provider, config }) =>
    generateGraph(baseRequest, provider, config)
  )
);
```

### Error Recovery
```typescript
async function robustGeneration(request: UniversalAgentRequest) {
  const providers = ['openai', 'claude', 'gemini'] as const;
  
  for (const provider of providers) {
    try {
      const result = await generateGraph(request, provider);
      if (result.success) return result;
    } catch (error) {
      console.warn(`${provider} failed:`, error);
    }
  }
  
  throw new Error('All providers failed');
}
```

## Monitoring and Analytics

### Success Rate Tracking
```typescript
const metrics = {
  totalRequests: 0,
  successfulGenerations: 0,
  averageAttempts: 0,
  modelPerformance: {
    openai: { success: 0, total: 0 },
    claude: { success: 0, total: 0 },
    gemini: { success: 0, total: 0 }
  }
};
```

### Performance Monitoring
- Track generation time by complexity
- Monitor retry rates by model
- Analyze failure patterns
- Measure consistency across models

This documentation provides comprehensive guidance for using the LLM Agent System effectively across different use cases and deployment scenarios.