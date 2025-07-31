# @promptscape/prompt-target-core

Core prompt targeting and translation system for cross-platform AI model support.

## Overview

This package provides the foundational components for translating graph-based prompts into platform-specific formats while preserving intent and optimizing for each model's capabilities.

## Features

- **Multi-Platform Support**: Translate prompts for OpenAI GPT, DALL-E, Midjourney, Stable Diffusion, Claude
- **Graph Processing**: Handle complex prompt graphs with multiple nodes and connections
- **Parameter Mapping**: Normalize and translate parameters across platforms
- **Validation**: Pre and post-translation validation with quality scoring
- **Caching**: Efficient caching to improve performance
- **Extensibility**: Plugin system for adding new platform adaptors

## Architecture

### Core Components

1. **MappingEngine** - Orchestrates prompt translations
2. **ValidationEngine** - Comprehensive validation for prompt graphs
3. **BaseAdaptor** - Abstract base class for platform adaptors
4. **Adaptors** - Platform-specific implementations (OpenAI GPT, etc.)

### Key Interfaces

- `ModelAdaptor` - Interface for platform adaptors
- `PromptGraph` - Graph representation of prompts
- `ValidationResult` - Validation issue reporting
- `TargetPrompt` - Platform-specific output format

## Usage

### Basic Translation

```typescript
import {
  MappingEngine,
  OpenAIGPTAdaptor,
  ConsoleLogger,
  MemoryCache,
  MemoryMetrics,
} from '@promptscape/prompt-target-core';

// Create dependencies
const logger = new ConsoleLogger();
const cache = new MemoryCache();
const metrics = new MemoryMetrics();

// Create engine and register adaptors
const engine = new MappingEngine(logger, cache, metrics);
const gptAdaptor = new OpenAIGPTAdaptor({ logger, cache, metrics, config: {} });
engine.registerAdaptor('openai-gpt', gptAdaptor);

// Translate a graph
const request = {
  graph: myPromptGraph,
  targetPlatform: 'openai-gpt' as Platform,
};

const response = await engine.translate(request);
if (response.success) {
  console.log('Translation successful:', response.targetPrompt);
}
```

### Creating Custom Adaptors

```typescript
import { BaseAdaptor, Capabilities, PromptGraph } from '@promptscape/prompt-target-core';

class MyCustomAdaptor extends BaseAdaptor {
  async capabilities(): Promise<Capabilities> {
    return {
      supportedNodeTypes: ['text', 'concat'],
      parameters: [
        /* parameter specs */
      ],
      limitations: [
        /* limitations */
      ],
      features: [
        /* features */
      ],
      supportedFormats: ['custom_format'],
    };
  }

  protected async doValidate(graph: PromptGraph): Promise<ValidationResult[]> {
    // Custom validation logic
    return [];
  }

  protected async doTransform(graph: PromptGraph): Promise<TargetPrompt> {
    // Custom transformation logic
    return {
      platform: this.platform,
      content: 'transformed prompt',
      parameters: {},
      format: 'custom_format',
      metadata: {
        /* metadata */
      },
    };
  }
}
```

### Validation

```typescript
import { ValidationEngine } from '@promptscape/prompt-target-core';

const validator = new ValidationEngine(logger, metrics);
const report = await validator.validateGraph(graph, [gptAdaptor]);

console.log('Validation report:', {
  valid: report.overallValid,
  issues: report.totalIssues,
  autoFixSuggestions: report.autoFixSuggestions.length,
});
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Development

### Project Structure

```
src/
├── adaptors/          # Platform adaptors
│   ├── BaseAdaptor.ts
│   └── OpenAIGPTAdaptor.ts
├── engine/            # Core engines
│   └── MappingEngine.ts
├── validation/        # Validation system
│   └── ValidationEngine.ts
├── types/             # TypeScript types
│   └── index.ts
├── utils/             # Utilities
│   ├── logger.ts
│   ├── cache.ts
│   └── metrics.ts
└── index.ts           # Main entry point
```

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## API Reference

### Core Classes

#### MappingEngine

The central orchestrator for prompt translations.

**Methods:**

- `registerAdaptor(platform, adaptor)` - Register a platform adaptor
- `translate(request)` - Translate a prompt graph
- `getStats()` - Get engine statistics

#### ValidationEngine

Comprehensive validation for prompt graphs.

**Methods:**

- `validateGraph(graph, adaptors, options)` - Validate a graph
- `addCustomRule(rule)` - Add custom validation rule

#### BaseAdaptor

Abstract base class for platform adaptors.

**Abstract Methods:**

- `capabilities()` - Return platform capabilities
- `doValidate(graph)` - Validate graph for platform
- `doTransform(graph, options)` - Transform graph to platform format

### Types

See `src/types/index.ts` for complete type definitions.

## License

Private - Part of PromptScape Graph system
