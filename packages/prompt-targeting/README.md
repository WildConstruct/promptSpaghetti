# Prompt Targeting System

**Epic 10 - Cross-platform prompt translation for AI models**

The Prompt Targeting System enables users to create prompts once and target multiple AI platforms automatically, with platform-specific optimizations and compatibility checking.

## Features

- 🎯 **Cross-Platform Translation**: Convert graph-based prompts to platform-specific formats
- 🔧 **Adaptor Framework**: Extensible plugin system for different AI platforms
- ✅ **Validation & Compatibility**: Check prompt compatibility before translation
- ⚡ **Performance Optimized**: Redis caching and concurrent processing
- 🎨 **Style Mapping**: Intelligent style translation between platforms
- 📊 **Analytics Ready**: Built-in metrics and performance tracking

## Supported Platforms

- **OpenAI GPT** - Text-to-text generation (GPT-3.5, GPT-4)
- **Midjourney** - Text-to-image generation with style controls
- **DALL-E** - _(Coming soon)_
- **Stable Diffusion** - _(Coming soon)_

## Quick Start

### Installation

```bash
npm install @prompt-graph/targeting
```

### Basic Usage

```typescript
import { createBasicPromptTargetingSystem, OpenAIAdaptor, MidjourneyAdaptor } from '@prompt-graph/targeting';

// Create the system
const system = createBasicPromptTargetingSystem();

// Create and register adaptors
const openaiAdaptor = new OpenAIAdaptor();
const midjourneyAdaptor = new MidjourneyAdaptor();

await openaiAdaptor.initialize({
  openai: { apiKey: 'your-api-key', model: 'gpt-4' },
});

await midjourneyAdaptor.initialize();

await system.registry.register(openaiAdaptor);
await system.registry.register(midjourneyAdaptor);

// Define your prompt graph
const promptGraph = {
  nodes: [
    {
      id: '1',
      type: 'output',
      data: { text: 'Create a story about a time traveler' },
    },
  ],
  edges: [],
};

// Translate to different platforms
const openaiResult = await system.engine.translate(promptGraph, 'openai');
const midjourneyResult = await system.engine.translate(promptGraph, 'midjourney');

console.log('OpenAI:', openaiResult.prompt);
console.log('Midjourney:', midjourneyResult.prompt);
```

### Production Setup with Redis Cache

```typescript
import { createProductionPromptTargetingSystem } from '@prompt-graph/targeting';

const system = await createProductionPromptTargetingSystem(
  { url: 'redis://localhost:6379' }, // Redis config
  { maxConcurrency: 20, enableLogging: true } // Mapping config
);
```

## Architecture

### Core Components

1. **Adaptor Registry** - Manages platform adaptors with versioning and discovery
2. **Mapping Engine** - Executes translation pipeline with caching and validation
3. **Base Adaptor** - Abstract class providing common functionality
4. **Translation Cache** - Redis-based caching for performance optimization

### Adaptor Interface

```typescript
interface ModelAdaptor {
  readonly id: string;
  readonly version: string;
  readonly platforms: string[];

  capabilities(): Promise<PlatformCapabilities>;
  validate(graph: PromptGraph, config?: AdaptorConfig): Promise<ValidationResult>;
  transform(graph: PromptGraph, config?: AdaptorConfig): Promise<PlatformPrompt>;
}
```

## Translation Examples

### Text-to-Text (OpenAI)

```typescript
const graph = {
  nodes: [
    { id: '1', type: 'system', data: { text: 'You are a helpful assistant' } },
    { id: '2', type: 'output', data: { text: 'Explain quantum computing' } },
  ],
  edges: [{ source: '1', target: '2' }],
};

const result = await system.engine.translate(graph, 'openai', {
  qualityPreference: 0.8, // Lower temperature for focused responses
  enableOptimizations: true,
});

// Result:
// {
//   platform: 'openai',
//   prompt: 'Explain quantum computing',
//   parameters: {
//     model: 'gpt-4',
//     temperature: 0.2,
//     system: 'You are a helpful assistant'
//   }
// }
```

### Text-to-Image (Midjourney)

```typescript
const graph = {
  nodes: [
    { id: '1', type: 'subject', data: { text: 'A dragon flying over mountains' } },
    { id: '2', type: 'style', data: { style: 'fantasy' } },
    { id: '3', type: 'aspectRatio', data: { aspectRatio: 'landscape' } },
  ],
  edges: [
    { source: '1', target: '2' },
    { source: '2', target: '3' },
  ],
};

const result = await system.engine.translate(graph, 'midjourney', {
  qualityPreference: 0.9,
  stylePreference: 'artistic',
});

// Result:
// {
//   platform: 'midjourney',
//   prompt: '/imagine prompt: A dragon flying over mountains, fantasy, magical, ethereal --ar 16:9 --q 1.5 --s 250',
//   parameters: {
//     aspect: '16:9',
//     quality: 1.5,
//     stylize: 250
//   }
// }
```

## Configuration

### Adaptor Configuration

```typescript
interface AdaptorConfig {
  qualityPreference?: number; // 0-1, higher = more quality-focused
  stylePreference?: 'default' | 'artistic' | 'photorealistic' | 'minimal';
  platformOverrides?: Record<string, unknown>;
  enableOptimizations?: boolean;
  customMappings?: Record<string, unknown>;
}
```

### Platform-Specific Overrides

```typescript
const config = {
  qualityPreference: 0.8,
  platformOverrides: {
    openai: {
      model: 'gpt-4-turbo',
      max_tokens: 2000,
    },
    midjourney: {
      version: '6',
      chaos: 25,
    },
  },
};
```

## Validation

The system provides comprehensive validation with compatibility scoring:

```typescript
const validation = await system.engine.validateTranslation(graph, 'midjourney');

console.log(validation.valid); // true/false
console.log(validation.compatibilityScore); // 0-1 score
console.log(validation.errors); // Array of errors
console.log(validation.warnings); // Array of warnings
```

## Performance Features

### Caching

- **Redis-based caching** for translation results
- **Configurable TTL** (time-to-live)
- **Cache key generation** based on graph + platform + config
- **Cache statistics** and monitoring

### Concurrent Processing

- **Batch translation** to multiple platforms
- **Configurable concurrency limits**
- **Timeout handling** for individual translations
- **Graceful error handling** in batch operations

## Creating Custom Adaptors

```typescript
import { BaseAdaptor, PlatformCapabilities, ValidationResult, PlatformPrompt } from '@prompt-graph/targeting';

class CustomAdaptor extends BaseAdaptor {
  public readonly id = 'custom-platform';
  public readonly version = '1.0.0';
  public readonly name = 'Custom Platform';
  public readonly platforms = ['custom'];

  async capabilities(): Promise<PlatformCapabilities> {
    return {
      platform: 'custom',
      version: this.version,
      maxTokens: 8000,
      features: ['text-generation', 'custom-feature'],
      styleSupport: true,
      negativePromptSupport: false,
      parameterRanges: {
        temperature: [0, 1],
      },
    };
  }

  protected async performPlatformValidation(graph: any): Promise<ValidationResult> {
    // Custom validation logic
    return { valid: true, errors: [], warnings: [], compatibilityScore: 1.0 };
  }

  protected async performTransformation(graph: any): Promise<Omit<PlatformPrompt, 'metadata'>> {
    // Custom transformation logic
    return {
      platform: 'custom',
      prompt: this.extractTextContent(graph),
      parameters: {},
    };
  }
}
```

## API Reference

### Factory Functions

- `createBasicPromptTargetingSystem()` - Basic system without cache
- `createProductionPromptTargetingSystem(redisConfig, mappingConfig)` - Production system with Redis
- `createPromptTargetingSystem(config)` - Customizable system setup

### Core Classes

- `DefaultAdaptorRegistry` - Manages adaptor registration and discovery
- `DefaultMappingEngine` - Executes translation pipeline
- `RedisTranslationCache` - Redis-based caching implementation
- `BaseAdaptor` - Abstract base class for adaptors

### Platform Adaptors

- `OpenAIAdaptor` - OpenAI GPT models
- `MidjourneyAdaptor` - Midjourney image generation

## Examples

Run the demo to see the system in action:

```bash
npm run demo
```

Or run specific examples:

```typescript
import { runDemo } from '@prompt-graph/targeting/examples/demo';
await runDemo();
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Roadmap

- [ ] DALL-E 3 adaptor
- [ ] Stable Diffusion adaptor
- [ ] Claude adaptor
- [ ] Memory cache implementation
- [ ] WebSocket real-time updates
- [ ] A/B testing framework
- [ ] Visual compatibility indicators
- [ ] Marketplace for custom adaptors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
