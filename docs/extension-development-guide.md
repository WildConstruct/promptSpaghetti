# Extension Development Guide

This comprehensive guide will help you develop extensions for the PromptSpaghetti extension system. Whether you're creating your first extension or building complex integrations, this guide covers everything you need to know.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Extension Types](#extension-types)
3. [Creating Your First Extension](#creating-your-first-extension)
4. [Extension Manifest](#extension-manifest)
5. [API Reference](#api-reference)
6. [Best Practices](#best-practices)
7. [Testing & Debugging](#testing--debugging)
8. [Publishing](#publishing)
9. [Advanced Topics](#advanced-topics)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- TypeScript knowledge (recommended)
- Basic understanding of the PromptSpaghetti architecture
- Code editor with TypeScript support

### Development Environment Setup

1. **Clone the extension template:**

```bash
npx create-prompt-extension my-extension
cd my-extension
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start development mode:**

```bash
npm run dev
```

### Extension System Overview

The PromptSpaghetti extension system supports four types of extensions:

- **Node Extensions**: Add new node types to the graph editor
- **UI Extensions**: Customize the user interface and add themes
- **Transform Extensions**: Process and transform data
- **Storage Extensions**: Connect to external storage systems

## Extension Types

### Node Extensions

Node extensions add new node types to the graph editor with custom functionality.

**Use cases:**

- Custom data processing nodes
- Integration with external APIs
- Specialized computation nodes
- Advanced node behaviors

**Key interfaces:**

- `NodeExtension`
- `AdvancedRuntimeNode`
- `IOSpecBuilder`

### UI Extensions

UI extensions customize the user interface, add themes, and provide new UI components.

**Use cases:**

- Custom themes and styling
- New UI components
- Layout modifications
- Accessibility enhancements

**Key interfaces:**

- `UIExtension`
- `ThemeProvider`
- `ComponentRegistry`

### Transform Extensions

Transform extensions process and transform data within the application.

**Use cases:**

- Text processing pipelines
- Data format conversions
- Content validation
- Custom transformations

**Key interfaces:**

- `TransformExtension`
- `DataProcessor`
- `ValidationHelpers`

### Storage Extensions

Storage extensions connect to external storage systems and services.

**Use cases:**

- Database integrations
- Cloud storage connections
- API integrations
- Data synchronization

**Key interfaces:**

- `StorageExtension`
- `StorageProvider`
- `DataConnector`

## Creating Your First Extension

Let's create a simple Node extension that adds a "Text Uppercase" node.

### Step 1: Initialize Extension

```bash
npx create-prompt-extension text-uppercase-extension
cd text-uppercase-extension
```

### Step 2: Create the Manifest

Create `manifest.json`:

```json
{
  "manifest_version": "1.0",
  "id": "text-uppercase",
  "name": "Text Uppercase Extension",
  "version": "1.0.0",
  "description": "Adds a node that converts text to uppercase",
  "author": "Your Name",
  "extension_type": "node",
  "capabilities": {
    "provides": ["text-transform"],
    "requires": ["runtime-nodes"]
  },
  "dependencies": {
    "system_version": "^1.0.0"
  },
  "permissions": ["data-processing"],
  "runtime": {
    "entry_point": "dist/index.js",
    "node_types": ["TextUppercase"]
  }
}
```

### Step 3: Implement the Node

Create `src/TextUppercaseNode.ts`:

```typescript
import { AdvancedRuntimeNode, IOSpecBuilder, ValidationHelpers } from '@prompt-spaghetti/core';

export class TextUppercaseNode extends AdvancedRuntimeNode {
  protected getIOSpec() {
    return new IOSpecBuilder()
      .input('text', 'string')
      .required()
      .description('Text to convert to uppercase')
      .output('result', 'string')
      .description('Uppercase text')
      .build();
  }

  protected async executeImplementation(inputs: any): Promise<any> {
    const text = inputs.text as string;

    // Validate input
    if (!ValidationHelpers.isString(text)) {
      throw new Error('Input must be a string');
    }

    // Transform to uppercase
    const result = text.toUpperCase();

    return { result };
  }

  // Node metadata
  static getNodeInfo() {
    return {
      type: 'TextUppercase',
      displayName: 'Text Uppercase',
      description: 'Converts input text to uppercase',
      category: 'Text Processing',
      icon: '🔤',
    };
  }
}
```

### Step 4: Create the Extension Entry Point

Create `src/index.ts`:

```typescript
import { NodeExtension, ExtensionLifecycleManager } from '@prompt-spaghetti/core';
import { TextUppercaseNode } from './TextUppercaseNode';

export class TextUppercaseExtension implements NodeExtension {
  readonly id = 'text-uppercase';
  readonly name = 'Text Uppercase Extension';
  readonly version = '1.0.0';
  readonly extensionType = 'node' as const;

  async initialize(): Promise<void> {
    console.log('Initializing Text Uppercase Extension');
  }

  async activate(): Promise<void> {
    // Register the node type
    this.registerNodeType(TextUppercaseNode);
    console.log('Text Uppercase Extension activated');
  }

  async deactivate(): Promise<void> {
    console.log('Text Uppercase Extension deactivated');
  }

  async dispose(): Promise<void> {
    console.log('Text Uppercase Extension disposed');
  }

  private registerNodeType(nodeClass: any) {
    // Registration logic would be implemented here
    // This integrates with the main application's node registry
  }
}

// Export the extension for loading
export default TextUppercaseExtension;
```

### Step 5: Build and Test

```bash
npm run build
npm run test
```

### Step 6: Install for Development

```bash
# Copy to extensions directory
cp -r dist/ ~/.prompt-spaghetti/extensions/text-uppercase/

# Or use the CLI
prompt-extensions install ./dist/manifest.json --dev
```

## Extension Manifest

The manifest file is the heart of your extension. It defines metadata, dependencies, permissions, and configuration.

### Manifest Structure

```typescript
interface ExtensionManifest {
  manifest_version: '1.0';
  id: string; // Unique identifier
  name: string; // Display name
  version: string; // Semantic version
  description?: string; // Description
  author?: string; // Author name
  extension_type: ExtensionType; // "node" | "ui" | "transform" | "storage"

  // Capabilities
  capabilities?: {
    provides?: string[]; // What this extension provides
    requires?: string[]; // What this extension requires
  };

  // Dependencies
  dependencies?: {
    system_version?: string; // Required system version
    extensions?: Record<string, string>; // Extension dependencies
  };

  // Permissions
  permissions?: string[]; // Required permissions

  // Runtime configuration (for node/transform extensions)
  runtime?: {
    entry_point: string; // Main file
    node_types?: string[]; // Node types (for node extensions)
    storage_providers?: string[]; // Storage providers (for storage extensions)
  };

  // UI configuration (for UI extensions)
  ui?: {
    themes?: string[]; // Available themes
    components?: string[]; // UI components
  };

  // Security settings
  security?: {
    sandbox?: {
      enabled: boolean;
    };
    content_security_policy?: string;
    trusted_domains?: string[];
  };

  // Compatibility
  compatibility?: {
    min_system_version?: string;
    max_system_version?: string;
    platforms?: string[];
    browsers?: Record<string, string>;
    deprecated?: boolean;
    deprecationMessage?: string;
  };

  // Development settings
  development?: {
    path?: string; // Development path
    auto_reload?: boolean; // Auto-reload on changes
  };
}
```

### Common Manifest Examples

#### Node Extension Manifest

```json
{
  "manifest_version": "1.0",
  "id": "my-nodes",
  "name": "My Custom Nodes",
  "version": "1.0.0",
  "extension_type": "node",
  "capabilities": {
    "provides": ["custom-nodes", "data-processing"],
    "requires": ["runtime-nodes"]
  },
  "permissions": ["data-processing"],
  "runtime": {
    "entry_point": "dist/index.js",
    "node_types": ["CustomNode1", "CustomNode2"]
  }
}
```

#### UI Extension Manifest

```json
{
  "manifest_version": "1.0",
  "id": "my-theme",
  "name": "My Custom Theme",
  "version": "1.0.0",
  "extension_type": "ui",
  "capabilities": {
    "provides": ["themes", "ui-components"],
    "requires": ["ui-components"]
  },
  "permissions": ["ui-components"],
  "ui": {
    "themes": ["dark-pro", "light-minimal"],
    "components": ["ThemeSelector", "CustomButton"]
  }
}
```

## API Reference

### Core Interfaces

#### BaseExtension

All extensions must implement the `BaseExtension` interface:

```typescript
interface BaseExtension {
  readonly id: string;
  readonly name: string;
  readonly version: string;

  initialize(): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  dispose(): Promise<void>;
}
```

#### NodeExtension

For creating node extensions:

```typescript
interface NodeExtension extends BaseExtension {
  readonly extensionType: 'node';

  // Node-specific methods
  registerNodeTypes(): Promise<void>;
  getNodeTypes(): NodeTypeInfo[];
}
```

#### AdvancedRuntimeNode

Base class for creating custom nodes:

```typescript
abstract class AdvancedRuntimeNode {
  // Define inputs and outputs
  protected abstract getIOSpec(): IOSpec;

  // Main execution logic
  protected abstract executeImplementation(inputs: any): Promise<any>;

  // Validation (optional)
  protected validateInputs(inputs: any): ValidationResult;
  protected validateOutputs(outputs: any): ValidationResult;

  // State management (optional)
  protected initializeState(): NodeState;
  protected updateState(newState: Partial<NodeState>): void;

  // Performance tracking
  protected measureExecution<T>(operation: () => T): T;
}
```

#### IOSpecBuilder

Builder for defining node inputs and outputs:

```typescript
class IOSpecBuilder {
  // Input definition
  input(name: string, type: IOType): InputBuilder;

  // Output definition
  output(name: string, type: IOType): OutputBuilder;

  // Build the specification
  build(): IOSpec;
}

class InputBuilder {
  required(): InputBuilder;
  optional(): InputBuilder;
  defaultValue(value: any): InputBuilder;
  description(desc: string): InputBuilder;
  constraint(constraint: ValidationConstraint): InputBuilder;
}
```

### Utility Functions

#### ValidationHelpers

```typescript
class ValidationHelpers {
  // Type checking
  static isString(value: any): boolean;
  static isNumber(value: any): boolean;
  static isBoolean(value: any): boolean;
  static isArray(value: any): boolean;
  static isObject(value: any): boolean;

  // Validation constraints
  static lengthConstraint(min?: number, max?: number): ValidationConstraint;
  static rangeConstraint(min?: number, max?: number): ValidationConstraint;
  static patternConstraint(pattern: RegExp): ValidationConstraint;
  static customConstraint(validator: (value: any) => boolean): ValidationConstraint;
}
```

#### SerializationHelpers

```typescript
class SerializationHelpers {
  // Serialize node data
  static serialize(data: any): string;
  static deserialize(serialized: string): any;

  // Handle complex types
  static serializeWithTypes(data: any): SerializedData;
  static deserializeWithTypes(data: SerializedData): any;
}
```

### Extension Manager API

#### Installing Extensions

```typescript
// Programmatic installation
import { extensionManager } from '@prompt-spaghetti/core';

await extensionManager.install('path/to/extension');
await extensionManager.installFromUrl('https://example.com/extension.json');
await extensionManager.installFromManifest(manifest);
```

#### Managing Extensions

```typescript
// Enable/disable extensions
await extensionManager.enable('extension-id');
await extensionManager.disable('extension-id');

// Get extension info
const extension = extensionManager.getExtension('extension-id');
const status = extensionManager.getStatus('extension-id');

// List extensions
const installed = extensionManager.getInstalledExtensions();
const available = extensionManager.getAvailableExtensions();
```

## Best Practices

### 1. Extension Design

**Keep it focused:**

- Each extension should have a single, clear purpose
- Avoid creating monolithic extensions
- Split complex functionality into multiple extensions

**Use semantic versioning:**

- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Document breaking changes clearly
- Provide migration guides for major versions

**Design for compatibility:**

- Use the extension API instead of internal APIs
- Test with multiple system versions
- Handle missing dependencies gracefully

### 2. Performance

**Optimize execution:**

```typescript
// Use async operations appropriately
async executeImplementation(inputs: any): Promise<any> {
  // Avoid blocking operations
  const result = await this.processAsync(inputs.data);
  return { result };
}

// Cache expensive computations
private cache = new Map();

protected executeImplementation(inputs: any): Promise<any> {
  const cacheKey = this.getCacheKey(inputs);
  if (this.cache.has(cacheKey)) {
    return Promise.resolve(this.cache.get(cacheKey));
  }

  const result = this.computeExpensiveOperation(inputs);
  this.cache.set(cacheKey, result);
  return Promise.resolve(result);
}
```

**Memory management:**

```typescript
// Clean up resources
async dispose(): Promise<void> {
  // Clear caches
  this.cache.clear();

  // Remove event listeners
  this.eventEmitter.removeAllListeners();

  // Clean up timers
  clearInterval(this.refreshTimer);
}
```

### 3. Error Handling

**Provide clear error messages:**

```typescript
protected validateInputs(inputs: any): ValidationResult {
  if (!inputs.text) {
    return {
      valid: false,
      errors: ['Text input is required']
    };
  }

  if (typeof inputs.text !== 'string') {
    return {
      valid: false,
      errors: ['Text input must be a string, received: ' + typeof inputs.text]
    };
  }

  return { valid: true, errors: [] };
}
```

**Handle edge cases:**

```typescript
protected async executeImplementation(inputs: any): Promise<any> {
  try {
    // Main logic
    const result = await this.processData(inputs);
    return { result };
  } catch (error) {
    // Log error for debugging
    console.error('Extension execution failed:', error);

    // Return user-friendly error
    throw new Error(`Processing failed: ${error.message}`);
  }
}
```

### 4. Security

**Validate all inputs:**

```typescript
// Never trust user input
protected validateInputs(inputs: any): ValidationResult {
  // Sanitize strings
  if (typeof inputs.url === 'string') {
    inputs.url = this.sanitizeUrl(inputs.url);
  }

  // Validate file paths
  if (inputs.filePath && !this.isValidPath(inputs.filePath)) {
    return { valid: false, errors: ['Invalid file path'] };
  }

  return { valid: true, errors: [] };
}
```

**Use minimal permissions:**

```json
{
  "permissions": [
    "data-processing"
    // Don't request unnecessary permissions
  ]
}
```

**Implement sandboxing:**

```json
{
  "security": {
    "sandbox": {
      "enabled": true
    },
    "content_security_policy": "default-src 'self'"
  }
}
```

### 5. Testing

**Write comprehensive tests:**

```typescript
import { describe, it, expect } from '@jest/globals';
import { TextUppercaseNode } from '../src/TextUppercaseNode';

describe('TextUppercaseNode', () => {
  let node: TextUppercaseNode;

  beforeEach(() => {
    node = new TextUppercaseNode('test-node', {});
  });

  it('should convert text to uppercase', async () => {
    const inputs = { text: 'hello world' };
    const result = await node.execute(inputs, {});

    expect(result.result).toBe('HELLO WORLD');
  });

  it('should handle empty strings', async () => {
    const inputs = { text: '' };
    const result = await node.execute(inputs, {});

    expect(result.result).toBe('');
  });

  it('should throw error for non-string input', async () => {
    const inputs = { text: 123 };

    await expect(node.execute(inputs, {})).rejects.toThrow();
  });
});
```

**Test with real data:**

```typescript
it('should handle real-world text', async () => {
  const inputs = {
    text: 'The quick brown fox jumps over the lazy dog. 123!@#',
  };
  const result = await node.execute(inputs, {});

  expect(result.result).toBe('THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG. 123!@#');
});
```

## Testing & Debugging

### Development Testing

**Use the development mode:**

```bash
# Install in development mode
prompt-extensions install ./manifest.json --dev

# Enable auto-reload
npm run dev
```

**Enable debug logging:**

```typescript
// In your extension
if (process.env.NODE_ENV === 'development') {
  console.log('Debug: Processing input:', inputs);
}
```

**Test with the Extension Tester:**

```bash
# Test extension without installing
prompt-extensions test ./manifest.json

# Run specific test scenarios
prompt-extensions test ./manifest.json --scenario performance
```

### Debugging Tools

**Use the Extension Inspector:**

```typescript
// Add debug information
export class MyExtension implements NodeExtension {
  getDebugInfo() {
    return {
      state: this.currentState,
      performance: this.performanceMetrics,
      lastError: this.lastError,
    };
  }
}
```

**Performance profiling:**

```typescript
protected async executeImplementation(inputs: any): Promise<any> {
  const startTime = performance.now();

  try {
    const result = await this.processData(inputs);

    const duration = performance.now() - startTime;
    this.recordPerformance(duration);

    return result;
  } catch (error) {
    this.recordError(error);
    throw error;
  }
}
```

### Integration Testing

**Test with different system versions:**

```bash
# Test compatibility
prompt-extensions test ./manifest.json --system-version 1.0.0
prompt-extensions test ./manifest.json --system-version 1.1.0
```

**Test with other extensions:**

```bash
# Test with dependencies
prompt-extensions test ./manifest.json --with-extension other-extension
```

## Publishing

### Preparation

1. **Update version:**

```bash
npm version patch  # or minor/major
```

2. **Run full test suite:**

```bash
npm run test
npm run lint
npm run build
```

3. **Update documentation:**

```bash
npm run docs
```

### Package Creation

**Create distribution package:**

```bash
# Build for distribution
npm run build:dist

# Create package
prompt-extensions package ./dist/

# Verify package
prompt-extensions verify ./my-extension-1.0.0.pext
```

### Publishing to Registry

**Publish to extension registry:**

```bash
# Login to registry
prompt-extensions login

# Publish extension
prompt-extensions publish ./my-extension-1.0.0.pext

# Tag version
prompt-extensions tag my-extension@1.0.0 latest
```

### Documentation

**Include comprehensive README:**

```markdown
# My Extension

## Description

Brief description of what your extension does.

## Installation

\`\`\`bash
prompt-extensions install my-extension
\`\`\`

## Usage

How to use your extension...

## Configuration

Available configuration options...

## API

If your extension provides an API...

## Examples

Usage examples...

## Contributing

How others can contribute...

## License

License information...
```

## Advanced Topics

### Custom UI Components

**Creating UI extensions:**

```typescript
import { UIExtension, ComponentRegistry } from '@prompt-spaghetti/core';

export class MyUIExtension implements UIExtension {
  readonly extensionType = 'ui' as const;

  async activate(): Promise<void> {
    ComponentRegistry.register('MyButton', MyButtonComponent);
    ComponentRegistry.register('MyDialog', MyDialogComponent);
  }
}
```

**React component example:**

```typescript
import React from 'react';
import { ExtensionComponent } from '@prompt-spaghetti/ui';

export const MyButtonComponent: ExtensionComponent = ({ config, onAction }) => {
  return (
    <button
      onClick={() => onAction('click', config.data)}
      className={config.theme?.buttonClass}
    >
      {config.label || 'My Button'}
    </button>
  );
};
```

### Complex Node Behaviors

**Stateful nodes:**

```typescript
export class StatefulNode extends AdvancedRuntimeNode {
  private state: NodeState = {
    counter: 0,
    history: [],
  };

  protected initializeState(): NodeState {
    return {
      counter: 0,
      history: [],
    };
  }

  protected async executeImplementation(inputs: any): Promise<any> {
    // Update state
    this.updateState({
      counter: this.state.counter + 1,
      history: [...this.state.history, inputs.data],
    });

    return {
      count: this.state.counter,
      lastItems: this.state.history.slice(-5),
    };
  }
}
```

**Conditional execution:**

```typescript
export class ConditionalNode extends AdvancedRuntimeNode {
  protected getIOSpec() {
    return new IOSpecBuilder()
      .input('condition', 'boolean')
      .input('trueValue', 'any')
      .input('falseValue', 'any')
      .output('result', 'any')
      .build();
  }

  protected async executeImplementation(inputs: any): Promise<any> {
    const result = inputs.condition ? inputs.trueValue : inputs.falseValue;
    return { result };
  }
}
```

### Storage Extensions

**Creating storage providers:**

```typescript
import { StorageExtension, StorageProvider } from '@prompt-spaghetti/core';

export class CloudStorageExtension implements StorageExtension {
  readonly extensionType = 'storage' as const;

  async activate(): Promise<void> {
    const provider = new CloudStorageProvider(this.config);
    StorageRegistry.register('cloud-storage', provider);
  }
}

class CloudStorageProvider implements StorageProvider {
  async save(key: string, data: any): Promise<void> {
    // Implement cloud save
  }

  async load(key: string): Promise<any> {
    // Implement cloud load
  }

  async delete(key: string): Promise<void> {
    // Implement cloud delete
  }

  async list(): Promise<string[]> {
    // Implement listing
  }
}
```

### Extension Communication

**Inter-extension communication:**

```typescript
import { ExtensionMessaging } from '@prompt-spaghetti/core';

// Send message to another extension
ExtensionMessaging.send('other-extension-id', {
  type: 'data-request',
  payload: { query: 'user data' },
});

// Listen for messages
ExtensionMessaging.onMessage((message, sender) => {
  if (message.type === 'data-request') {
    // Handle request
    const response = this.handleDataRequest(message.payload);
    return response;
  }
});
```

**Shared services:**

```typescript
import { ServiceRegistry } from '@prompt-spaghetti/core';

// Register a service
export class DataProcessingService {
  async processData(data: any): Promise<any> {
    // Implementation
  }
}

// In extension activation
ServiceRegistry.register('data-processing', new DataProcessingService());

// In another extension
const dataService = ServiceRegistry.get<DataProcessingService>('data-processing');
const result = await dataService.processData(myData);
```

## Troubleshooting

### Common Issues

#### Extension Won't Load

**Check manifest syntax:**

```bash
# Validate manifest
prompt-extensions validate ./manifest.json

# Common issues:
# - Invalid JSON syntax
# - Missing required fields
# - Invalid version format
# - Incorrect file paths
```

**Check dependencies:**

```bash
# Verify all dependencies are available
prompt-extensions deps-check ./manifest.json

# Install missing dependencies
npm install missing-dependency
```

#### Runtime Errors

**Check permissions:**

```json
{
  "permissions": [
    "data-processing", // Required for data operations
    "file-system-read", // Required for file access
    "network" // Required for network requests
  ]
}
```

**Check compatibility:**

```bash
# Test compatibility
prompt-extensions compat-check ./manifest.json

# Update system requirements if needed
```

#### Performance Issues

**Profile extension performance:**

```typescript
// Add performance monitoring
protected async executeImplementation(inputs: any): Promise<any> {
  const metrics = performance.mark('start');

  try {
    const result = await this.processData(inputs);

    performance.mark('end');
    const measure = performance.measure('execution', 'start', 'end');

    if (measure.duration > 1000) {
      console.warn('Slow execution detected:', measure.duration + 'ms');
    }

    return result;
  } finally {
    performance.clearMarks();
  }
}
```

**Optimize common bottlenecks:**

```typescript
// Cache expensive operations
private cache = new LRUCache<string, any>(100);

// Use batch processing
async processBatch(items: any[]): Promise<any[]> {
  const batchSize = 10;
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => this.processItem(item))
    );
    results.push(...batchResults);
  }

  return results;
}
```

### Getting Help

**Community resources:**

- Extension Development Forum
- GitHub Discussions
- Discord #extension-dev channel

**Documentation:**

- API Reference: `/docs/api/`
- Examples Repository: `/examples/`
- Video Tutorials: `/docs/tutorials/`

**Debugging tools:**

```bash
# Enable debug mode
export DEBUG=prompt-extensions:*

# Run with verbose logging
prompt-extensions install ./manifest.json --verbose

# Generate debug report
prompt-extensions debug-report
```

**Submit bug reports:**

```bash
# Create bug report with system info
prompt-extensions bug-report --extension my-extension
```

---

This guide provides a comprehensive foundation for developing extensions. For the latest updates and additional examples, visit the [official documentation](https://docs.prompt-spaghetti.dev/extensions/).

Happy extending! 🚀
