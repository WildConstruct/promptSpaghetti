# Plugin Architecture Specification v1.0.0

## Overview

The Plugin Architecture enables developers to extend the PromptScape Randomizer Graph system with custom node types without modifying core code. This ensures maintainability, extensibility, and community contribution support.

## Architecture Design

### Plugin Interface

```typescript
interface INodePlugin {
  // Identification
  id: string; // Unique plugin ID
  name: string; // Display name
  version: string; // Semantic version
  author: string; // Plugin author
  description: string; // Plugin description

  // Compatibility
  engineVersion: string; // Required engine version
  dependencies?: string[]; // Other plugin dependencies

  // Node Types
  nodeTypes: INodeType[]; // Node types provided by plugin

  // Lifecycle
  initialize(): Promise<void>; // Plugin initialization
  activate(): Promise<void>; // Plugin activation
  deactivate(): Promise<void>; // Plugin deactivation
  validate(): boolean; // Validate plugin integrity

  // Optional hooks
  onGraphLoad?: (graph: any) => void;
  onGraphSave?: (graph: any) => void;
  onNodeCreate?: (node: any) => void;
  onNodeDelete?: (node: any) => void;
}
```

### Plugin Manifest

Every plugin must include a `plugin.json` manifest file:

```json
{
  "id": "my-custom-nodes",
  "name": "My Custom Nodes",
  "version": "1.0.0",
  "author": "Developer Name",
  "description": "Adds custom node types for specific use case",
  "license": "MIT",
  "engineVersion": "^1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": [],
  "permissions": ["node:create", "node:execute"],
  "nodeTypes": [
    {
      "id": "customNode",
      "displayName": "Custom Node",
      "category": "custom"
    }
  ],
  "scripts": {
    "install": "npm install",
    "build": "tsc",
    "test": "jest"
  }
}
```

## Plugin Loading System

### Plugin Manager

```typescript
class PluginManager {
  private plugins: Map<string, INodePlugin> = new Map();
  private loadedPlugins: Set<string> = new Set();
  private pluginPaths: string[] = [];

  constructor(config: PluginConfig) {
    this.pluginPaths = config.pluginPaths || [
      './plugins',
      '~/.promptscape/plugins',
      './node_modules/@promptscape'
    ];
  }

  async loadPlugin(pluginPath: string): Promise<void> {
    // 1. Read manifest
    const manifest = await this.readManifest(pluginPath);

    // 2. Validate manifest
    if (!this.validateManifest(manifest)) {
      throw new Error(`Invalid plugin manifest: ${pluginPath}`);
    }

    // 3. Check compatibility
    if (!this.checkCompatibility(manifest)) {
      throw new Error(`Incompatible plugin version: ${manifest.engineVersion}`);
    }

    // 4. Load plugin module
    const PluginClass = await import(path.join(pluginPath, manifest.main));
    const plugin = new PluginClass.default(manifest);

    // 5. Validate plugin
    if (!plugin.validate()) {
      throw new Error(`Plugin validation failed: ${manifest.id}`);
    }

    // 6. Initialize plugin
    await plugin.initialize();

    // 7. Register node types
    plugin.nodeTypes.forEach(nodeType => {
      nodeRegistry.register(nodeType);
    });

    // 8. Store plugin
    this.plugins.set(manifest.id, plugin);
    this.loadedPlugins.add(manifest.id);

    // 9. Activate plugin
    await plugin.activate();
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    // 1. Deactivate plugin
    await plugin.deactivate();

    // 2. Unregister node types
    // Note: This needs careful handling of existing nodes

    // 3. Remove from registry
    this.plugins.delete(pluginId);
    this.loadedPlugins.delete(pluginId);
  }

  async discoverPlugins(): Promise<PluginManifest[]> {
    const plugins: PluginManifest[] = [];

    for (const pluginPath of this.pluginPaths) {
      if (await fs.exists(pluginPath)) {
        const dirs = await fs.readdir(pluginPath);
        for (const dir of dirs) {
          const manifestPath = path.join(pluginPath, dir, 'plugin.json');
          if (await fs.exists(manifestPath)) {
            const manifest = await this.readManifest(
              path.join(pluginPath, dir)
            );
            plugins.push(manifest);
          }
        }
      }
    }

    return plugins;
  }
}
```

## Plugin Development

### Plugin Template

```typescript
import { INodePlugin, INodeType } from '@promptscape/core';

export default class MyPlugin implements INodePlugin {
  id = 'my-plugin';
  name = 'My Plugin';
  version = '1.0.0';
  author = 'Developer';
  description = 'My custom plugin';
  engineVersion = '^1.0.0';

  nodeTypes: INodeType[] = [
    {
      id: 'myCustomNode',
      displayName: 'My Custom Node',
      category: 'custom',
      version: '1.0.0',
      psgType: 'MyCustomNode',
      reactFlowType: 'myCustomNode',
      className: 'MyCustomNode',
      description: 'A custom node that does something special',
      inputs: [
        { id: 'input', label: 'Input', type: 'input', dataType: 'string' }
      ],
      outputs: [
        { id: 'output', label: 'Output', type: 'output', dataType: 'string' }
      ],
      isExecutable: true,
      tags: ['custom', 'special']
    }
  ];

  async initialize(): Promise<void> {
    // Load resources, connect to services, etc.
    console.log(`Initializing ${this.name}`);
  }

  async activate(): Promise<void> {
    // Start plugin functionality
    console.log(`Activating ${this.name}`);
  }

  async deactivate(): Promise<void> {
    // Clean up resources
    console.log(`Deactivating ${this.name}`);
  }

  validate(): boolean {
    // Validate plugin integrity
    return true;
  }
}
```

### Custom Node Implementation

```typescript
import { BaseNode } from '@promptscape/core';

export class MyCustomNode extends BaseNode {
  constructor(id: string, config: any) {
    super(id);
    this.config = config;
  }

  async execute(
    inputs: Map<string, any>,
    context: ExecutionContext
  ): Promise<any> {
    // Custom execution logic
    const input = inputs.get('input') || '';

    // Do something special
    const result = this.processInput(input);

    return result;
  }

  private processInput(input: string): string {
    // Custom processing
    return `Processed: ${input}`;
  }

  serialize(): object {
    return {
      id: this.id,
      type: 'myCustomNode',
      config: this.config
    };
  }

  static deserialize(data: any): MyCustomNode {
    return new MyCustomNode(data.id, data.config);
  }
}
```

## Security Model

### Sandboxing

Plugins run in a sandboxed environment with restricted access:

```typescript
class PluginSandbox {
  private vm: VM;
  private permissions: Set<string>;

  constructor(permissions: string[]) {
    this.permissions = new Set(permissions);
    this.vm = new VM({
      timeout: 5000, // 5 second timeout
      sandbox: this.createSandbox()
    });
  }

  private createSandbox(): object {
    return {
      console: {
        log: (...args) => console.log('[Plugin]', ...args),
        error: (...args) => console.error('[Plugin]', ...args)
      },
      setTimeout: undefined, // Restricted
      setInterval: undefined, // Restricted
      fetch: this.createRestrictedFetch(),
      require: this.createRestrictedRequire()
    };
  }

  private createRestrictedFetch() {
    return async (url: string, options?: any) => {
      if (!this.permissions.has('network:fetch')) {
        throw new Error('Network access denied');
      }

      // Only allow specific domains
      const allowedDomains = ['api.promptscape.com'];
      const urlObj = new URL(url);

      if (!allowedDomains.includes(urlObj.hostname)) {
        throw new Error(`Access to ${urlObj.hostname} denied`);
      }

      return fetch(url, options);
    };
  }

  executePlugin(code: string): any {
    return this.vm.run(code);
  }
}
```

### Permission System

```typescript
enum PluginPermission {
  // Node operations
  NODE_CREATE = 'node:create',
  NODE_DELETE = 'node:delete',
  NODE_EXECUTE = 'node:execute',

  // Graph operations
  GRAPH_READ = 'graph:read',
  GRAPH_WRITE = 'graph:write',

  // File system
  FS_READ = 'fs:read',
  FS_WRITE = 'fs:write',

  // Network
  NETWORK_FETCH = 'network:fetch',

  // UI
  UI_DIALOG = 'ui:dialog',
  UI_NOTIFICATION = 'ui:notification'
}
```

## Plugin Distribution

### Plugin Registry

```typescript
interface PluginRegistryEntry {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  downloads: number;
  rating: number;
  verified: boolean;
  homepage: string;
  repository: string;
  downloadUrl: string;
  checksum: string;
}

class PluginRegistry {
  private registryUrl = 'https://registry.promptscape.com';

  async search(query: string): Promise<PluginRegistryEntry[]> {
    const response = await fetch(`${this.registryUrl}/search?q=${query}`);
    return response.json();
  }

  async getPlugin(id: string): Promise<PluginRegistryEntry> {
    const response = await fetch(`${this.registryUrl}/plugins/${id}`);
    return response.json();
  }

  async installPlugin(id: string): Promise<void> {
    const entry = await this.getPlugin(id);

    // Download plugin
    const response = await fetch(entry.downloadUrl);
    const buffer = await response.arrayBuffer();

    // Verify checksum
    const checksum = await this.calculateChecksum(buffer);
    if (checksum !== entry.checksum) {
      throw new Error('Plugin checksum mismatch');
    }

    // Extract and install
    await this.extractPlugin(buffer);
  }
}
```

### Plugin Package Structure

```
my-plugin/
├── plugin.json           # Manifest file
├── package.json          # NPM package file
├── README.md            # Documentation
├── LICENSE              # License file
├── src/                 # Source code
│   ├── index.ts        # Main plugin file
│   ├── nodes/          # Node implementations
│   └── utils/          # Utilities
├── dist/               # Compiled code
├── assets/             # Plugin assets
│   ├── icons/         # Node icons
│   └── templates/     # Templates
└── tests/             # Tests
```

## Plugin Lifecycle

### Installation

1. Download plugin package
2. Verify integrity (checksum/signature)
3. Extract to plugins directory
4. Install dependencies
5. Build plugin if needed
6. Register in plugin database

### Loading

1. Discover available plugins
2. Read manifests
3. Check compatibility
4. Load plugin modules
5. Initialize plugins
6. Register node types
7. Activate plugins

### Execution

1. Plugin nodes appear in palette
2. User adds plugin node to graph
3. Node is instantiated with plugin's class
4. During execution, plugin code runs in sandbox
5. Results are returned to main execution context

### Unloading

1. Deactivate plugin
2. Clean up resources
3. Unregister node types
4. Handle existing nodes gracefully
5. Remove from loaded plugins

## Best Practices

### For Plugin Developers

1. **Version Management**: Use semantic versioning
2. **Dependencies**: Minimize external dependencies
3. **Performance**: Optimize for fast execution
4. **Error Handling**: Gracefully handle errors
5. **Documentation**: Provide clear documentation
6. **Testing**: Include comprehensive tests
7. **Security**: Follow security best practices

### For Plugin Users

1. **Trust**: Only install plugins from trusted sources
2. **Permissions**: Review required permissions
3. **Updates**: Keep plugins updated
4. **Compatibility**: Check engine version compatibility
5. **Backup**: Backup graphs before installing new plugins

## Example Plugins

### Math Operations Plugin

```typescript
export default class MathPlugin implements INodePlugin {
  nodeTypes = [
    {
      id: 'mathAdd',
      displayName: 'Add',
      execute: async inputs => {
        const a = inputs.get('a') || 0;
        const b = inputs.get('b') || 0;
        return a + b;
      }
    },
    {
      id: 'mathMultiply',
      displayName: 'Multiply',
      execute: async inputs => {
        const a = inputs.get('a') || 0;
        const b = inputs.get('b') || 0;
        return a * b;
      }
    }
  ];
}
```

### API Integration Plugin

```typescript
export default class APIPlugin implements INodePlugin {
  nodeTypes = [
    {
      id: 'apiCall',
      displayName: 'API Call',
      configOptions: [
        { id: 'url', label: 'URL', type: 'text' },
        {
          id: 'method',
          label: 'Method',
          type: 'select',
          options: ['GET', 'POST']
        }
      ],
      execute: async (inputs, config) => {
        const response = await fetch(config.url, {
          method: config.method,
          body: inputs.get('body')
        });
        return response.json();
      }
    }
  ];
}
```

## Future Enhancements

1. **Hot Reload**: Support plugin hot reloading during development
2. **Plugin Store**: In-app plugin marketplace
3. **Plugin Analytics**: Usage tracking and analytics
4. **Plugin Sync**: Sync plugins across devices
5. **Plugin Profiles**: Different plugin sets for different use cases
6. **Plugin Presets**: Bundled plugin configurations
7. **Visual Plugin Editor**: GUI for creating simple plugins
