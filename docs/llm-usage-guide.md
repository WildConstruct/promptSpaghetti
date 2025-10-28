# LLM Usage Guide for Developers

## Quick Start

This guide covers integrating and optimizing LLM features in the Wild Construct/Prompt Spaghetti application using OpenRouter for multi-model access.

## Setup

### 1. Environment Configuration

```bash
# .env.development
OPENROUTER_API_KEY=sk-or-v1-xxxxx
LLM_MODE=development
LLM_CACHE_ENABLED=true
LLM_DAILY_LIMIT=100

# .env.production
LLM_PROXY_URL=https://api.yourapp.com/llm
LLM_MODE=production
LLM_DAILY_LIMIT=1000
```

### 2. Install Dependencies

```bash
npm install openai  # OpenRouter uses OpenAI SDK format
```

### 3. Initialize Service

```typescript
import { LLMService } from '@/packages/core/services/llm/LLMService';

const llmService = new LLMService({
  apiKey: process.env.OPENROUTER_API_KEY,
  mode: process.env.LLM_MODE,
  dailyLimit: parseInt(process.env.LLM_DAILY_LIMIT)
});
```

## Model Selection Strategy

### Free Models (Priority 1)

Use these first to minimize costs:

| Model                             | Best For            | Token Limit | Rate Limit |
| --------------------------------- | ------------------- | ----------- | ---------- |
| `deepseek/deepseek-r1:free`       | Reasoning, metadata | 128K        | 50/day     |
| `mistral/mistral-medium-3.1:free` | Quick generation    | 32K         | 100/day    |
| `qwen/qwen-262k:free`             | Long context        | 262K        | 50/day     |
| `anthropic/claude-haiku`          | Classification      | 200K        | 100/day    |

### Paid Fallbacks (Priority 2)

Only when free models unavailable:

| Model                         | Cost       | Use Case          |
| ----------------------------- | ---------- | ----------------- |
| `openai/gpt-4o-mini`          | $0.05/M in | Refinement        |
| `anthropic/claude-3.5-sonnet` | $3/M in    | Complex reasoning |

### Model Selection Code

```typescript
const MODEL_CHAIN = {
  populateChoices: ['deepseek/deepseek-r1:free', 'openai/gpt-4o-mini'],
  extractMetadata: [
    'anthropic/claude-haiku',
    'mistral/mistral-medium-3.1:free'
  ],
  optimizeWeights: ['deepseek/deepseek-r1:free'],
  refineText: ['openai/gpt-4o-mini', 'mistral/mistral-medium-3.1:free']
};
```

## Token Optimization Tips

### 1. Input Optimization

```typescript
// BAD: Sending full context
const response = await llmService.call({
  prompt: entireDocument, // 5000 tokens!
  maxTokens: 200
});

// GOOD: Send only relevant context
const response = await llmService.call({
  prompt: relevantSection.slice(0, 500), // 100 tokens
  maxTokens: 200
});
```

### 2. Prompt Engineering

```javascript
// CONCISE SYSTEM PROMPTS (Save 50+ tokens)

// BAD: Verbose
"You are an AI assistant that helps with generating variations of text.
Please analyze the given text and create 5-10 different variations that
maintain the same meaning but vary in style and wording..."

// GOOD: Direct
"Generate 5-10 variations of: {text}
Output JSON: {choices: [{text: string, weight: 1-10}]}"
```

### 3. Caching Strategy

```typescript
class CachedLLMService {
  private cache = new Map();

  async call(prompt: string): Promise<any> {
    const cacheKey = hash(prompt);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await llmService.call(prompt);
    this.cache.set(cacheKey, result);

    // TTL: 5 minutes for suggestions, 60 for metadata
    setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);

    return result;
  }
}
```

## Admin Panel Usage

### Accessing the Panel

Navigate to `/admin/llm` (requires admin role)

### Key Metrics to Monitor

1. **Daily Usage Graph**
   - Green zone: <50% quota
   - Yellow zone: 50-80% quota
   - Red zone: >80% quota

2. **Cost Forecast Widget**
   - Shows 7-day projection
   - Alert if trending over budget
   - Example: "$0.07/day → $2.10/month"

3. **Model Distribution**
   - Aim for >80% free model usage
   - Investigate if paid usage >20%

4. **Cache Hit Rate**
   - Target: >40% after warm-up
   - Low rate = optimize caching

### Quota Management

```typescript
// Set user quotas programmatically
await adminService.setUserQuota('user_123', {
  dailyLimit: 200, // Calls
  costLimit: 0.5, // USD
  allowedModels: ['free'] // Restrict to free only
});
```

### Offline Mode

The admin panel caches 24 hours of data for offline viewing:

- Stats update from localStorage
- "Offline" badge appears
- Auto-reconnects every 30 seconds

## Common Integration Patterns

### 1. Populate Choices (WeightedChoice Node)

```typescript
async function populateChoices(nodeText: string, context: string) {
  const prompt = `Given '${nodeText}' in context '${context}', 
    suggest 5-10 variations. Output JSON only: 
    {choices: [{text: string, weight: 1-10}]}`;

  try {
    const response = await llmService.call({
      systemPrompt: 'Be creative but appropriate. Preserve {variables}.',
      userPrompt: prompt,
      model: MODEL_CHAIN.populateChoices[0],
      maxTokens: 200
    });

    return JSON.parse(response).choices;
  } catch (error) {
    // Fallback to static suggestions
    return getStaticSuggestions(nodeText);
  }
}
```

### 2. Extract Metadata (Background)

```typescript
const extractMetadataDebounced = debounce(async segment => {
  const prompt = `Extract metadata from: ${segment.text}
    Output JSON: {subject: string, action: string, mood: string, tags: string[]}`;

  try {
    const metadata = await llmService.call({
      prompt,
      model: 'anthropic/claude-haiku',
      maxTokens: 100
    });

    segment.metadata = JSON.parse(metadata);
  } catch {
    // Silent failure - no user notification
    console.debug('Metadata extraction failed');
  }
}, 1000); // 1 second debounce
```

### 3. Offline Fallbacks

```typescript
function getOfflineSuggestions(type: string): any {
  const offlineData = {
    'drifting car': [
      { text: 'sliding sideways', weight: 8 },
      { text: 'power slide', weight: 7 },
      { text: 'spinning out', weight: 4 }
    ],
    'urban chaos': [
      { text: 'panicked crowds', weight: 9 },
      { text: 'debris flying', weight: 7 },
      { text: 'sirens wailing', weight: 6 }
    ]
  };

  return offlineData[type] || defaultSuggestions;
}
```

## Performance Optimization

### 1. Parallel Calls

```typescript
// Execute independent LLM calls in parallel
const [choices, metadata, weights] = await Promise.all([
  llmService.populateChoices(text),
  llmService.extractMetadata(text),
  llmService.optimizeWeights(existing)
]);
```

### 2. Debouncing

```typescript
// Prevent excessive calls during typing
const debouncedExtract = debounce(text => {
  llmService.extractMetadata(text);
}, 1000); // Wait 1 second after typing stops
```

### 3. Progressive Loading

```typescript
// Show partial results as they arrive
async function* streamSuggestions(text: string) {
  yield getCachedSuggestions(text); // Instant
  yield await getStaticSuggestions(text); // Fast
  yield await getLLMSuggestions(text); // Slower but best
}
```

## Troubleshooting

### Common Issues

| Issue                 | Cause                            | Solution                          |
| --------------------- | -------------------------------- | --------------------------------- |
| "Rate limit exceeded" | Too many calls to free model     | Switch to fallback model          |
| "Invalid API key"     | Key not set or expired           | Check .env file                   |
| "Timeout"             | Network slow or model overloaded | Increase timeout, use cache       |
| "Invalid JSON"        | LLM returned malformed response  | Add retry with schema enforcement |
| "Cost spike"          | Using expensive models           | Check model distribution in admin |

### Debug Mode

Enable verbose logging:

```typescript
llmService.setDebugMode(true);
// Logs all calls, responses, timing, costs
```

### Testing with Mock Data

```typescript
// For unit tests or offline development
llmService.useMockMode(true);
llmService.setMockResponse('populateChoices', [
  { text: 'mock choice 1', weight: 5 },
  { text: 'mock choice 2', weight: 8 }
]);
```

## Best Practices

1. **Always have offline fallbacks** - Never rely solely on LLM availability
2. **Cache aggressively** - Same inputs = same outputs for most cases
3. **Monitor costs daily** - Use admin panel to catch issues early
4. **Preserve variables** - Extract {variables} before LLM processing
5. **Use appropriate models** - Don't use GPT-4 for simple classification
6. **Batch when possible** - Combine related operations
7. **Set user expectations** - Show loading states, use "Offline mode" badges
8. **Test demo scenarios** - Pre-cache common demo data

## Quick Reference

### Cost Targets

- Per operation: <$0.001
- Per user per day: <$0.01
- Per 100 extras: <$0.50
- Monthly budget: <$10 for development

### Performance Targets

- LLM response: <2 seconds (P95)
- With cache: <50ms
- Metadata extraction: <500ms
- Bulk operations: <10 items/second

### Demo Preparation Checklist

- [ ] Pre-cache "urban chaos" metadata
- [ ] Pre-cache "desert scene" suggestions
- [ ] Set demo quota to 1000 calls
- [ ] Enable offline fallbacks
- [ ] Test without network connection
- [ ] Verify admin panel shows good metrics

## Support

- **OpenRouter Dashboard**: https://openrouter.ai/dashboard
- **Model Playground**: https://openrouter.ai/playground
- **Pricing**: https://openrouter.ai/models
- **API Docs**: https://openrouter.ai/docs

For issues, check the admin panel first (`/admin/llm`) for real-time diagnostics.
