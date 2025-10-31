# Plugin Manifest Specification

## Overview

The Plugin Manifest defines the structure and requirements for PromptSpaghetti plugins, enabling third-party developers to create custom nodes, themes, and extensions without modifying core code.

## Manifest Structure

### plugin.manifest.json

```json
{
  "manifestVersion": "1.0.0",
  "plugin": {
    "id": "com.example.custom-nodes",
    "name": "Custom Node Pack",
    "version": "2.1.0",
    "description": "Advanced custom nodes for specialized workflows",
    "author": {
      "name": "Example Corp",
      "email": "support@example.com",
      "url": "https://example.com"
    },
    "license": "MIT",
    "homepage": "https://github.com/example/custom-nodes",
    "repository": {
      "type": "git",
      "url": "https://github.com/example/custom-nodes.git"
    },
    "bugs": {
      "url": "https://github.com/example/custom-nodes/issues"
    }
  },

  "compatibility": {
    "minVersion": "1.0.0",
    "maxVersion": "2.*",
    "platforms": ["browser", "electron", "vscode"],
    "nodeEngineVersion": ">=16.0.0"
  },

  "assets": {
    "icon": "assets/icon.png",
    "banner": "assets/banner.jpg",
    "screenshots": ["assets/screenshot1.png", "assets/screenshot2.png"],
    "readme": "README.md",
    "changelog": "CHANGELOG.md"
  },

  "entryPoints": {
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "styles": "dist/styles.css",
    "worker": "dist/worker.js"
  },

  "nodeTypes": [
    {
      "id": "customNode1",
      "displayName": "Custom Node 1",
      "category": "custom",
      "description": "A specialized node for X",
      "version": "1.0.0",
      "icon": "assets/nodes/custom1.svg",
      "component": "nodes/CustomNode1",
      "runtime": "runtime/CustomNode1Runtime",
      "schema": "schemas/customNode1.json",
      "examples": "examples/customNode1.json",
      "documentation": "docs/customNode1.md"
    }
  ],

  "themes": [
    {
      "id": "dark-purple",
      "name": "Dark Purple Theme",
      "type": "color-scheme",
      "styles": "themes/dark-purple.css",
      "preview": "themes/dark-purple-preview.png"
    }
  ],

  "extensions": [
    {
      "id": "export-handler",
      "type": "exporter",
      "name": "Custom Export Format",
      "fileExtension": ".custom",
      "handler": "extensions/CustomExporter",
      "mimeType": "application/x-custom"
    }
  ],

  "permissions": {
    "required": ["node:create", "node:execute", "storage:read"],
    "optional": ["network:fetch", "storage:write", "clipboard:write"]
  },

  "dependencies": {
    "runtime": {
      "react": "^18.0.0",
      "reactflow": "^11.0.0"
    },
    "peer": {
      "@promptspaghetti/core": "^1.0.0"
    },
    "optional": {
      "lodash": "^4.17.0"
    }
  },

  "configuration": {
    "schema": "config/schema.json",
    "defaults": "config/defaults.json",
    "ui": "config/ui.json"
  },

  "localization": {
    "defaultLocale": "en",
    "locales": ["en", "es", "fr", "de", "ja"],
    "translations": "i18n/"
  },

  "marketplace": {
    "price": 0,
    "currency": "USD",
    "category": "productivity",
    "tags": ["automation", "workflow", "custom-nodes"],
    "featured": false,
    "verified": true,
    "downloads": 1250,
    "rating": 4.5,
    "reviews": 23
  },

  "telemetry": {
    "enabled": false,
    "endpoint": "https://telemetry.example.com",
    "events": ["install", "activate", "error"]
  },

  "security": {
    "contentSecurityPolicy": "default-src 'self'",
    "sandboxed": true,
    "isolation": "context",
    "audit": {
      "lastAudit": "2025-01-15",
      "auditedBy": "SecurityFirm Inc",
      "report": "audit/report.pdf"
    }
  }
}
```

## Node Type Definition

### Node Schema (schemas/customNode.json)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique node instance ID"
    },
    "type": {
      "type": "string",
      "const": "customNode1"
    },
    "data": {
      "type": "object",
      "properties": {
        "config": {
          "$ref": "#/definitions/customNodeConfig"
        }
      }
    }
  },
  "definitions": {
    "customNodeConfig": {
      "type": "object",
      "properties": {
        "mode": {
          "type": "string",
          "enum": ["simple", "advanced", "expert"],
          "default": "simple"
        },
        "threshold": {
          "type": "number",
          "minimum": 0,
          "maximum": 100,
          "default": 50
        },
        "features": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "required": ["mode"]
    }
  }
}
```

## Plugin API Interface

### TypeScript Definition

```typescript
// Plugin Interface
export interface IPlugin {
  manifest: PluginManifest;

  // Lifecycle hooks
  onInstall?: () => Promise<void>;
  onActivate?: (context: PluginContext) => Promise<void>;
  onDeactivate?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onUpdate?: (previousVersion: string) => Promise<void>;

  // Node registration
  registerNodes?: () => NodeTypeDefinition[];

  // Theme registration
  registerThemes?: () => ThemeDefinition[];

  // Extension registration
  registerExtensions?: () => ExtensionDefinition[];

  // Configuration
  getConfiguration?: () => PluginConfiguration;
  onConfigurationChange?: (config: PluginConfiguration) => void;
}

// Plugin Context
export interface PluginContext {
  // Core APIs
  nodeRegistry: INodeRegistry;
  eventBus: IEventBus;
  storage: IStorage;
  ui: IUIRegistry;

  // Plugin info
  pluginId: string;
  pluginPath: string;
  dataPath: string;

  // Utilities
  logger: ILogger;
  http: IHttpClient;

  // Permissions
  permissions: Permission[];
}

// Node Type Definition
export interface NodeTypeDefinition {
  id: string;
  version: string;

  // Factory
  createNode: (id: string, data: any) => INode;

  // UI Component
  component: React.ComponentType<NodeProps>;

  // Runtime
  runtime: {
    execute: (context: ExecutionContext) => Promise<any>;
    validate: (data: any) => ValidationResult;
    serialize: (node: INode) => any;
    deserialize: (data: any) => INode;
  };

  // Metadata
  metadata: {
    displayName: string;
    category: string;
    description: string;
    icon?: string | React.ComponentType;
    tags?: string[];
    deprecated?: boolean;
  };

  // Configuration
  configSchema?: JSONSchema;
  defaultConfig?: any;

  // Ports
  inputs?: PortDefinition[];
  outputs?: PortDefinition[];
}
```

## Plugin Loader

### Loading Process

```typescript
class PluginLoader {
  private plugins: Map<string, IPlugin> = new Map();
  private manifests: Map<string, PluginManifest> = new Map();

  async loadPlugin(manifestPath: string): Promise<void> {
    // 1. Load and validate manifest
    const manifest = await this.loadManifest(manifestPath);
    this.validateManifest(manifest);

    // 2. Check compatibility
    if (!this.checkCompatibility(manifest)) {
      throw new Error(`Plugin ${manifest.plugin.id} is not compatible`);
    }

    // 3. Check permissions
    await this.requestPermissions(manifest.permissions);

    // 4. Load plugin code
    const pluginModule = await this.loadModule(manifest.entryPoints.main);

    // 5. Create sandbox
    const sandbox = this.createSandbox(manifest);

    // 6. Initialize plugin
    const plugin = await this.initializePlugin(pluginModule, sandbox);

    // 7. Register plugin
    await this.registerPlugin(manifest.plugin.id, plugin, manifest);

    // 8. Activate plugin
    await plugin.onActivate?.(this.createContext(manifest));
  }

  private createSandbox(manifest: PluginManifest): Sandbox {
    return new Sandbox({
      permissions: manifest.permissions,
      csp: manifest.security.contentSecurityPolicy,
      isolation: manifest.security.isolation
    });
  }

  private async validateManifest(manifest: any): Promise<void> {
    const schema = await loadSchema('plugin-manifest.schema.json');
    const valid = validateAgainstSchema(manifest, schema);

    if (!valid) {
      throw new Error('Invalid plugin manifest');
    }
  }
}
```

## Permission System

### Permission Types

```typescript
enum PermissionType {
  // Node permissions
  NODE_CREATE = 'node:create',
  NODE_READ = 'node:read',
  NODE_UPDATE = 'node:update',
  NODE_DELETE = 'node:delete',
  NODE_EXECUTE = 'node:execute',

  // Storage permissions
  STORAGE_READ = 'storage:read',
  STORAGE_WRITE = 'storage:write',
  STORAGE_DELETE = 'storage:delete',

  // Network permissions
  NETWORK_FETCH = 'network:fetch',
  NETWORK_WEBSOCKET = 'network:websocket',

  // UI permissions
  UI_MODAL = 'ui:modal',
  UI_NOTIFICATION = 'ui:notification',
  UI_MENU = 'ui:menu',
  UI_TOOLBAR = 'ui:toolbar',

  // System permissions
  SYSTEM_CLIPBOARD = 'system:clipboard',
  SYSTEM_FILE = 'system:file',
  SYSTEM_SHELL = 'system:shell',

  // Advanced permissions
  ADVANCED_CRYPTO = 'advanced:crypto',
  ADVANCED_WASM = 'advanced:wasm',
  ADVANCED_WORKER = 'advanced:worker'
}

interface Permission {
  type: PermissionType;
  scope?: string;
  reason?: string;
}
```

## Security Sandboxing

### Sandbox Implementation

```typescript
class PluginSandbox {
  private iframe: HTMLIFrameElement;
  private worker: Worker;
  private permissions: Set<PermissionType>;

  constructor(config: SandboxConfig) {
    this.permissions = new Set(config.permissions.required);

    if (config.isolation === 'iframe') {
      this.iframe = this.createIframeSandbox(config);
    } else if (config.isolation === 'worker') {
      this.worker = this.createWorkerSandbox(config);
    }
  }

  private createIframeSandbox(config: SandboxConfig): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts');
    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Content-Security-Policy" content="${config.csp}">
        </head>
        <body>
          <script>
            // Plugin execution context
            window.addEventListener('message', (event) => {
              // Handle plugin messages
            });
          </script>
        </body>
      </html>
    `;
    return iframe;
  }

  async execute(code: string, context: any): Promise<any> {
    // Check permissions
    this.validatePermissions(context.requiredPermissions);

    // Execute in sandbox
    return this.sandboxedEval(code, context);
  }

  private sandboxedEval(code: string, context: any): any {
    // Create restricted global scope
    const restrictedGlobal = {
      console: this.createRestrictedConsole(),
      fetch: this.createRestrictedFetch(),
      setTimeout: undefined,
      setInterval: undefined,
      eval: undefined,
      Function: undefined
      // ... other restrictions
    };

    // Execute with restricted scope
    return new Function('context', 'global', code)(context, restrictedGlobal);
  }
}
```

## Plugin Distribution

### Package Structure

```
custom-nodes-plugin/
├── plugin.manifest.json
├── package.json
├── README.md
├── LICENSE
├── CHANGELOG.md
├── dist/
│   ├── index.js
│   ├── index.d.ts
│   ├── styles.css
│   └── worker.js
├── assets/
│   ├── icon.png
│   ├── banner.jpg
│   └── nodes/
│       └── *.svg
├── schemas/
│   └── *.json
├── examples/
│   └── *.json
├── docs/
│   └── *.md
├── i18n/
│   ├── en.json
│   └── *.json
└── config/
    ├── schema.json
    └── defaults.json
```

### Publishing Process

```bash
# Validate plugin
npm run validate

# Build plugin
npm run build

# Package plugin
npm run package

# Creates: custom-nodes-plugin-2.1.0.psgplugin
```

### Installation Methods

```bash
# From marketplace
promptspaghetti install com.example.custom-nodes

# From file
promptspaghetti install ./custom-nodes-plugin-2.1.0.psgplugin

# From URL
promptspaghetti install https://example.com/plugins/custom-nodes.psgplugin

# From npm
npm install @example/promptspaghetti-custom-nodes
```

## Marketplace Integration

### Submission Requirements

1. Valid manifest with all required fields
2. Security audit report (for verified badge)
3. Comprehensive documentation
4. Working examples
5. Test coverage > 80%
6. No malicious code
7. Appropriate licensing

### Marketplace API

```typescript
interface MarketplaceAPI {
  // Discovery
  search(query: string, filters?: MarketplaceFilters): Promise<Plugin[]>;
  getFeatured(): Promise<Plugin[]>;
  getCategories(): Promise<Category[]>;

  // Plugin details
  getPlugin(id: string): Promise<PluginDetails>;
  getReviews(pluginId: string): Promise<Review[]>;
  getVersions(pluginId: string): Promise<Version[]>;

  // Installation
  install(pluginId: string, version?: string): Promise<void>;
  uninstall(pluginId: string): Promise<void>;
  update(pluginId: string, version: string): Promise<void>;

  // Publishing
  publish(plugin: PluginPackage): Promise<void>;
  unpublish(pluginId: string): Promise<void>;

  // Reviews
  submitReview(pluginId: string, review: Review): Promise<void>;
}
```

## Version Management

### Semantic Versioning

```json
{
  "version": "MAJOR.MINOR.PATCH",
  "migrations": {
    "1.0.0->2.0.0": "migrations/v1to2.js",
    "2.0.0->2.1.0": "migrations/v2.0to2.1.js"
  }
}
```

### Migration Script

```typescript
export async function migrate(
  fromVersion: string,
  toVersion: string,
  data: any
): Promise<any> {
  // Version-specific migration logic
  if (fromVersion === '1.0.0' && toVersion === '2.0.0') {
    return {
      ...data,
      newField: 'default',
      renamedField: data.oldField,
      oldField: undefined
    };
  }

  return data;
}
```

## Testing Requirements

### Plugin Validation Tests

```typescript
describe('Plugin Validation', () => {
  it('should have valid manifest');
  it('should export required interfaces');
  it('should handle lifecycle methods');
  it('should register nodes correctly');
  it('should respect permissions');
  it('should work in sandbox');
  it('should handle errors gracefully');
});
```
