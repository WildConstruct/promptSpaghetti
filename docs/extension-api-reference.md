# Extension API Reference

This document provides a comprehensive reference for all APIs available to extension developers in the PromptSpaghetti extension system.

## Table of Contents

1. [Core Interfaces](#core-interfaces)
2. [Node Extension API](#node-extension-api)
3. [UI Extension API](#ui-extension-api)
4. [Transform Extension API](#transform-extension-api)
5. [Storage Extension API](#storage-extension-api)
6. [Utility APIs](#utility-apis)
7. [Extension Manager API](#extension-manager-api)
8. [Type Definitions](#type-definitions)

## Core Interfaces

### BaseExtension

All extensions must implement the `BaseExtension` interface.

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

#### Properties

- **`id`** - Unique identifier for the extension (must match manifest)
- **`name`** - Human-readable name of the extension
- **`version`** - Semantic version string (e.g., "1.0.0")

#### Methods

- **`initialize()`** - Called when the extension is first loaded. Use for one-time setup.
- **`activate()`** - Called when the extension is enabled. Register components here.
- **`deactivate()`** - Called when the extension is disabled. Clean up active components.
- **`dispose()`** - Called when the extension is uninstalled. Clean up all resources.

### ExtensionLifecycleManager

Manages the lifecycle of extensions.

```typescript
class ExtensionLifecycleManager {
  static registerExtension(extension: BaseExtension): Promise<void>;
  static unregisterExtension(extensionId: string): Promise<void>;
  static getExtension(extensionId: string): BaseExtension | null;
  static getActiveExtensions(): BaseExtension[];
}
```

## Node Extension API

### NodeExtension

Interface for creating node extensions.

```typescript
interface NodeExtension extends BaseExtension {
  readonly extensionType: 'node';

  registerNodeTypes(): Promise<void>;
  getNodeTypes(): NodeTypeInfo[];
}
```

### AdvancedRuntimeNode

Base class for creating custom nodes with advanced features.

```typescript
abstract class AdvancedRuntimeNode {
  constructor(id: string, config: NodeConfig);

  // Abstract methods (must be implemented)
  protected abstract getIOSpec(): IOSpec;
  protected abstract executeImplementation(inputs: any): Promise<any>;

  // Virtual methods (can be overridden)
  protected validateInputs(inputs: any): ValidationResult;
  protected validateOutputs(outputs: any): ValidationResult;
  protected initializeState(): NodeState;
  protected updateState(newState: Partial<NodeState>): void;
  protected onStateChange(newState: NodeState, oldState: NodeState): void;

  // Final methods (cannot be overridden)
  public async execute(inputs: any, context: ExecutionContext): Promise<any>;
  public getConfiguration(): NodeConfig;
  public getPerformanceMetrics(): PerformanceMetrics;
}
```

#### Constructor Parameters

- **`id`** - Unique identifier for this node instance
- **`config`** - Configuration object for the node

#### Abstract Methods

##### `getIOSpec(): IOSpec`

Define the inputs and outputs for your node.

```typescript
protected getIOSpec(): IOSpec {
  return new IOSpecBuilder()
    .input('text', 'string')
      .required()
      .description('Input text to process')
    .output('result', 'string')
      .description('Processed text')
    .build();
}
```

##### `executeImplementation(inputs: any): Promise<any>`

Implement the main logic of your node.

```typescript
protected async executeImplementation(inputs: any): Promise<any> {
  const text = inputs.text as string;
  const result = text.toUpperCase();
  return { result };
}
```

#### Virtual Methods

##### `validateInputs(inputs: any): ValidationResult`

Validate input data before execution.

```typescript
protected validateInputs(inputs: any): ValidationResult {
  if (!inputs.text || typeof inputs.text !== 'string') {
    return {
      valid: false,
      errors: ['Text input is required and must be a string']
    };
  }
  return { valid: true, errors: [] };
}
```

##### `initializeState(): NodeState`

Initialize the node's internal state.

```typescript
protected initializeState(): NodeState {
  return {
    counter: 0,
    history: []
  };
}
```

### IOSpecBuilder

Builder for defining node inputs and outputs.

```typescript
class IOSpecBuilder {
  input(name: string, type: IOType): InputBuilder;
  output(name: string, type: IOType): OutputBuilder;
  build(): IOSpec;
}
```

#### Input Builder

```typescript
class InputBuilder {
  required(): InputBuilder;
  optional(): InputBuilder;
  defaultValue(value: any): InputBuilder;
  description(desc: string): InputBuilder;
  constraint(constraint: ValidationConstraint): InputBuilder;
}
```

#### Output Builder

```typescript
class OutputBuilder {
  description(desc: string): OutputBuilder;
  constraint(constraint: ValidationConstraint): OutputBuilder;
}
```

#### Example Usage

```typescript
protected getIOSpec(): IOSpec {
  return new IOSpecBuilder()
    .input('text', 'string')
      .required()
      .description('Input text to process')
      .constraint(ValidationHelpers.lengthConstraint(1, 1000))
    .input('options', 'object')
      .optional()
      .defaultValue({})
      .description('Processing options')
    .output('result', 'string')
      .description('Processed text')
    .output('metadata', 'object')
      .description('Processing metadata')
    .build();
}
```

### ValidationHelpers

Utility functions for input validation.

```typescript
class ValidationHelpers {
  // Type checking
  static isString(value: any): boolean;
  static isNumber(value: any): boolean;
  static isBoolean(value: any): boolean;
  static isArray(value: any): boolean;
  static isObject(value: any): boolean;

  // Constraint builders
  static lengthConstraint(min?: number, max?: number): ValidationConstraint;
  static rangeConstraint(min?: number, max?: number): ValidationConstraint;
  static patternConstraint(pattern: RegExp): ValidationConstraint;
  static customConstraint(
    validator: (value: any) => boolean
  ): ValidationConstraint;
}
```

#### Example Usage

```typescript
protected validateInputs(inputs: any): ValidationResult {
  const errors: string[] = [];

  if (!ValidationHelpers.isString(inputs.text)) {
    errors.push('Text must be a string');
  }

  if (inputs.text && inputs.text.length > 1000) {
    errors.push('Text must be less than 1000 characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

## UI Extension API

### UIExtension

Interface for creating UI extensions.

```typescript
interface UIExtension extends BaseExtension {
  readonly extensionType: 'ui';

  registerComponents(): Promise<void>;
  registerThemes(): Promise<void>;
  getComponents(): ComponentInfo[];
  getThemes(): ThemeInfo[];
}
```

### ComponentRegistry

Registry for UI components.

```typescript
class ComponentRegistry {
  static register(name: string, component: ExtensionComponent): void;
  static unregister(name: string): void;
  static get(name: string): ExtensionComponent | null;
  static getAll(): Map<string, ExtensionComponent>;
}
```

### ExtensionComponent

Base interface for extension components.

```typescript
interface ExtensionComponent {
  (props: ExtensionComponentProps): React.ReactElement;
}

interface ExtensionComponentProps {
  config?: any;
  children?: React.ReactNode;
  onAction?: (action: string, data?: any) => void;
  theme?: ThemeConfig;
}
```

#### Example Component

```typescript
export const MyCustomButton: ExtensionComponent = ({ config, onAction }) => {
  const handleClick = () => {
    onAction?.('click', { message: 'Button clicked!' });
  };

  return (
    <button
      onClick={handleClick}
      className={config?.className}
      style={config?.style}
    >
      {config?.label || 'Click me'}
    </button>
  );
};
```

### ThemeRegistry

Registry for themes.

```typescript
class ThemeRegistry {
  static register(name: string, theme: ThemeConfig): void;
  static unregister(name: string): void;
  static get(name: string): ThemeConfig | null;
  static getAll(): Map<string, ThemeConfig>;
  static setActive(name: string): void;
  static getActive(): ThemeConfig;
}
```

### ThemeConfig

Configuration object for themes.

```typescript
interface ThemeConfig {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
    [key: string]: string;
  };
  fonts: {
    primary: string;
    mono: string;
    [key: string]: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    [key: string]: string;
  };
}
```

## Transform Extension API

### TransformExtension

Interface for creating transform extensions.

```typescript
interface TransformExtension extends BaseExtension {
  readonly extensionType: 'transform';

  transform(data: any, options?: any): Promise<any>;
  getTransformInfo(): TransformInfo;
}
```

### DataProcessor

Base class for data processors.

```typescript
abstract class DataProcessor {
  constructor(config: ProcessorConfig);

  abstract process(data: any, options?: any): Promise<any>;

  // Virtual methods
  protected validateInput(data: any): ValidationResult;
  protected validateOutput(data: any): ValidationResult;
  protected preprocessData(data: any, options?: any): any;
  protected postprocessData(data: any, options?: any): any;
}
```

#### Example Transform

```typescript
export class TextTransformExtension implements TransformExtension {
  readonly extensionType = 'transform' as const;

  async transform(data: any, options: any = {}): Promise<any> {
    if (typeof data === 'string') {
      switch (options.mode) {
        case 'uppercase':
          return data.toUpperCase();
        case 'lowercase':
          return data.toLowerCase();
        case 'reverse':
          return data.split('').reverse().join('');
        default:
          return data;
      }
    }

    if (Array.isArray(data)) {
      return Promise.all(data.map(item => this.transform(item, options)));
    }

    return data;
  }

  getTransformInfo(): TransformInfo {
    return {
      name: 'Text Transform',
      description: 'Transform text data',
      supportedTypes: ['string', 'array'],
      options: [
        {
          name: 'mode',
          type: 'string',
          values: ['uppercase', 'lowercase', 'reverse']
        }
      ]
    };
  }
}
```

## Storage Extension API

### StorageExtension

Interface for creating storage extensions.

```typescript
interface StorageExtension extends BaseExtension {
  readonly extensionType: 'storage';

  getStorageProvider(): StorageProvider;
}
```

### StorageProvider

Interface for storage providers.

```typescript
interface StorageProvider {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
  exists(key: string): Promise<boolean>;

  // Optional methods
  backup?(): Promise<void>;
  restore?(backupId: string): Promise<void>;
  getMetadata?(key: string): Promise<StorageMetadata>;
}
```

#### Example Storage Provider

```typescript
export class FileStorageProvider implements StorageProvider {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async save(key: string, data: any): Promise<void> {
    const filePath = path.join(this.basePath, `${key}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async load(key: string): Promise<any> {
    const filePath = path.join(this.basePath, `${key}.json`);
    const content = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(content);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.basePath, `${key}.json`);
    await fs.promises.unlink(filePath);
  }

  async list(): Promise<string[]> {
    const files = await fs.promises.readdir(this.basePath);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.basePath, `${key}.json`);
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
```

## Utility APIs

### SerializationHelpers

Utilities for serializing and deserializing data.

```typescript
class SerializationHelpers {
  static serialize(data: any): string;
  static deserialize(serialized: string): any;
  static serializeWithTypes(data: any): SerializedData;
  static deserializeWithTypes(data: SerializedData): any;
}
```

### ExtensionMessaging

Inter-extension communication system.

```typescript
class ExtensionMessaging {
  static send(
    targetExtensionId: string,
    message: ExtensionMessage
  ): Promise<any>;
  static onMessage(handler: MessageHandler): void;
  static removeMessageHandler(handler: MessageHandler): void;
  static broadcast(message: ExtensionMessage): void;
}

interface ExtensionMessage {
  type: string;
  payload?: any;
  sourceExtensionId?: string;
  timestamp?: number;
}

type MessageHandler = (message: ExtensionMessage, sender: string) => any;
```

#### Example Usage

```typescript
// Send a message to another extension
const response = await ExtensionMessaging.send('other-extension', {
  type: 'data-request',
  payload: { query: 'user-data' }
});

// Listen for messages
ExtensionMessaging.onMessage((message, sender) => {
  if (message.type === 'data-request') {
    return { data: this.getUserData(message.payload.query) };
  }
});
```

### ServiceRegistry

Registry for shared services between extensions.

```typescript
class ServiceRegistry {
  static register<T>(name: string, service: T): void;
  static unregister(name: string): void;
  static get<T>(name: string): T | null;
  static getAll(): Map<string, any>;
}
```

#### Example Usage

```typescript
// Register a service
ServiceRegistry.register('logger', new LoggingService());

// Use a service from another extension
const logger = ServiceRegistry.get<LoggingService>('logger');
if (logger) {
  logger.log('Extension activated');
}
```

## Extension Manager API

### ExtensionManager

Main interface for managing extensions.

```typescript
class ExtensionManager {
  // Installation
  static install(manifestPath: string): Promise<void>;
  static installFromUrl(url: string): Promise<void>;
  static installFromManifest(manifest: ExtensionManifest): Promise<void>;

  // Management
  static enable(extensionId: string): Promise<void>;
  static disable(extensionId: string): Promise<void>;
  static uninstall(extensionId: string): Promise<void>;
  static update(extensionId: string): Promise<void>;

  // Information
  static getExtension(extensionId: string): ExtensionInfo | null;
  static getInstalledExtensions(): ExtensionInfo[];
  static getAvailableExtensions(): ExtensionInfo[];
  static getStatus(extensionId: string): ExtensionStatus;

  // Events
  static onExtensionInstalled(handler: (extensionId: string) => void): void;
  static onExtensionEnabled(handler: (extensionId: string) => void): void;
  static onExtensionDisabled(handler: (extensionId: string) => void): void;
  static onExtensionUninstalled(handler: (extensionId: string) => void): void;
}
```

### ExtensionInfo

Information about an extension.

```typescript
interface ExtensionInfo {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  extensionType: ExtensionType;
  manifest: ExtensionManifest;
  status: ExtensionStatus;
  installPath: string;
  installedAt: Date;
}
```

### ExtensionStatus

Status information for an extension.

```typescript
interface ExtensionStatus {
  enabled: boolean;
  loaded: boolean;
  hasErrors: boolean;
  lastError?: string;
  version: string;
  updateAvailable: boolean;
  availableVersion?: string;
}
```

## Type Definitions

### Common Types

```typescript
type ExtensionType = 'node' | 'ui' | 'transform' | 'storage';

type IOType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface ValidationConstraint {
  type: 'length' | 'range' | 'pattern' | 'custom';
  parameters: any;
  message?: string;
}

interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  totalExecutions: number;
}

interface NodeState {
  [key: string]: any;
}

interface ExecutionContext {
  seed: number;
  variables: Map<string, any>;
  depth: number;
  nodeStates: Map<string, NodeState>;
  cache: Map<string, any>;
}
```

### Error Types

```typescript
class ExtensionError extends Error {
  constructor(message: string, public extensionId: string, public code?: string);
}

class ValidationError extends ExtensionError {
  constructor(message: string, public field: string, extensionId: string);
}

class CompatibilityError extends ExtensionError {
  constructor(message: string, public requirement: string, extensionId: string);
}
```

### Configuration Types

```typescript
interface NodeConfig {
  [key: string]: any;
}

interface ProcessorConfig {
  [key: string]: any;
}

interface ThemeConfig {
  name: string;
  displayName: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
}
```

## Version Compatibility

### API Versioning

The extension API follows semantic versioning:

- **Major version changes** (1.x.x → 2.x.x): Breaking changes
- **Minor version changes** (1.1.x → 1.2.x): New features, backward compatible
- **Patch version changes** (1.1.1 → 1.1.2): Bug fixes, backward compatible

### Compatibility Matrix

| Extension API | System Version | Support Level |
| ------------- | -------------- | ------------- |
| 1.0.x         | 1.0.x          | ✅ Full       |
| 1.0.x         | 1.1.x          | ✅ Full       |
| 1.1.x         | 1.0.x          | ⚠️ Limited    |
| 1.1.x         | 1.1.x          | ✅ Full       |

### Deprecation Policy

- APIs marked as deprecated will be supported for at least 2 minor versions
- Breaking changes will be announced in advance
- Migration guides will be provided for breaking changes

## Best Practices

### Performance

1. **Use async/await** for all I/O operations
2. **Cache expensive computations** using the built-in caching system
3. **Validate inputs early** to avoid unnecessary processing
4. **Use proper cleanup** in dispose methods

### Security

1. **Validate all inputs** from external sources
2. **Use minimal permissions** in your manifest
3. **Sanitize user-provided data** before processing
4. **Enable sandboxing** when possible

### Error Handling

1. **Provide clear error messages** with actionable information
2. **Use appropriate error types** (ValidationError, CompatibilityError, etc.)
3. **Handle edge cases gracefully** with fallback behavior
4. **Log errors appropriately** for debugging

### Testing

1. **Write unit tests** for all public methods
2. **Test with different input types** and edge cases
3. **Use the extension test framework** for integration testing
4. **Validate performance** under load

---

For more examples and tutorials, see the [Extension Development Guide](./extension-development-guide.md).

For the latest API updates, visit the [official documentation](https://docs.prompt-spaghetti.dev/extensions/api/).
