#!/usr/bin/env node

/**
 * Extension Scaffolding Tool - Epic 8.4 Story 8.4.6
 * CLI tool for creating new extension projects
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Extension templates
const EXTENSION_TYPES = {
  node: 'Node Extension',
  ui: 'UI Extension', 
  transform: 'Transform Extension',
  storage: 'Storage Extension'
};

class ExtensionScaffolder {
  constructor() {
    this.templates = this.loadTemplates();
  }

  async createExtension(name, type, options = {}) {
    console.log(`🚀 Creating ${EXTENSION_TYPES[type]}: ${name}`);
    
    // Validate inputs
    this.validateInputs(name, type);
    
    // Create project directory
    const projectDir = this.createProjectDirectory(name);
    
    // Generate files from templates
    await this.generateFromTemplate(projectDir, type, {
      name,
      ...options
    });
    
    // Initialize npm project
    this.initializeNpmProject(projectDir, name, type);
    
    // Install dependencies
    this.installDependencies(projectDir, type);
    
    console.log(`✅ Extension created successfully at: ${projectDir}`);
    console.log(`\nNext steps:`);
    console.log(`  cd ${name}`);
    console.log(`  npm run dev`);
    
    return projectDir;
  }

  validateInputs(name, type) {
    if (!name || typeof name !== 'string') {
      throw new Error('Extension name is required');
    }
    
    if (!/^[a-z0-9-]+$/.test(name)) {
      throw new Error('Extension name must contain only lowercase letters, numbers, and hyphens');
    }
    
    if (!EXTENSION_TYPES[type]) {
      throw new Error(`Invalid extension type: ${type}. Valid types: ${Object.keys(EXTENSION_TYPES).join(', ')}`);
    }
  }

  createProjectDirectory(name) {
    const projectDir = path.resolve(process.cwd(), name);
    
    if (fs.existsSync(projectDir)) {
      throw new Error(`Directory ${name} already exists`);
    }
    
    fs.mkdirSync(projectDir, { recursive: true });
    return projectDir;
  }

  async generateFromTemplate(projectDir, type, variables) {
    const template = this.templates[type];
    
    for (const [filePath, content] of Object.entries(template)) {
      const fullPath = path.join(projectDir, filePath);
      const dir = path.dirname(fullPath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Process template variables
      const processedContent = this.processTemplate(content, variables);
      
      // Write file
      fs.writeFileSync(fullPath, processedContent, 'utf8');
    }
  }

  processTemplate(content, variables) {
    let processed = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value);
    }
    
    return processed;
  }

  initializeNpmProject(projectDir, name, type) {
    const packageJson = {
      name: name,
      version: '1.0.0',
      description: `${EXTENSION_TYPES[type]} for PromptSpaghetti`,
      main: 'dist/index.js',
      scripts: {
        build: 'tsc',
        dev: 'tsc --watch',
        test: 'jest',
        lint: 'eslint src/**/*.ts',
        'test:watch': 'jest --watch'
      },
      keywords: ['prompt-spaghetti', 'extension', type],
      author: '',
      license: 'MIT',
      devDependencies: {
        '@types/jest': '^29.0.0',
        '@types/node': '^18.0.0',
        '@typescript-eslint/eslint-plugin': '^5.0.0',
        '@typescript-eslint/parser': '^5.0.0',
        'eslint': '^8.0.0',
        'jest': '^29.0.0',
        'ts-jest': '^29.0.0',
        'typescript': '^4.8.0'
      },
      dependencies: {
        '@prompt-spaghetti/core': '^1.0.0'
      }
    };
    
    fs.writeFileSync(
      path.join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2),
      'utf8'
    );
  }

  installDependencies(projectDir, type) {
    console.log('📦 Installing dependencies...');
    
    try {
      execSync('npm install', {
        cwd: projectDir,
        stdio: 'inherit'
      });
    } catch (error) {
      console.warn('⚠️ Failed to install dependencies automatically. Run "npm install" manually.');
    }
  }

  loadTemplates() {
    return {
      node: this.getNodeExtensionTemplate(),
      ui: this.getUIExtensionTemplate(),
      transform: this.getTransformExtensionTemplate(),
      storage: this.getStorageExtensionTemplate()
    };
  }

  getNodeExtensionTemplate() {
    return {
      'manifest.json': JSON.stringify({
        manifest_version: '1.0',
        id: '{{name}}',
        name: '{{name}}',
        version: '1.0.0',
        description: 'A custom node extension',
        author: 'Your Name',
        extension_type: 'node',
        capabilities: {
          provides: ['custom-nodes'],
          requires: ['runtime-nodes']
        },
        dependencies: {
          system_version: '^1.0.0'
        },
        permissions: ['data-processing'],
        runtime: {
          entry_point: 'dist/index.js',
          node_types: ['{{name}}Node']
        }
      }, null, 2),

      'src/index.ts': `import { NodeExtension } from '@prompt-spaghetti/core';
import { {{name}}Node } from './{{name}}Node';

export class {{name}}Extension implements NodeExtension {
  readonly id = '{{name}}';
  readonly name = '{{name}}';
  readonly version = '1.0.0';
  readonly extensionType = 'node' as const;

  async initialize(): Promise<void> {
    console.log('Initializing {{name}} Extension');
  }

  async activate(): Promise<void> {
    // Register node types
    this.registerNodeType({{name}}Node);
    console.log('{{name}} Extension activated');
  }

  async deactivate(): Promise<void> {
    console.log('{{name}} Extension deactivated');
  }

  async dispose(): Promise<void> {
    console.log('{{name}} Extension disposed');
  }

  private registerNodeType(nodeClass: any) {
    // Node registration logic
  }
}

export default {{name}}Extension;`,

      'src/{{name}}Node.ts': `import { AdvancedRuntimeNode, IOSpecBuilder, ValidationHelpers } from '@prompt-spaghetti/core';

export class {{name}}Node extends AdvancedRuntimeNode {
  protected getIOSpec() {
    return new IOSpecBuilder()
      .input('input', 'string')
        .required()
        .description('Input data to process')
      .output('result', 'string')
        .description('Processed result')
      .build();
  }

  protected async executeImplementation(inputs: any): Promise<any> {
    const input = inputs.input as string;
    
    // Validate input
    if (!ValidationHelpers.isString(input)) {
      throw new Error('Input must be a string');
    }

    // Your processing logic here
    const result = input.toUpperCase();

    return { result };
  }

  static getNodeInfo() {
    return {
      type: '{{name}}Node',
      displayName: '{{name}} Node',
      description: 'Processes input data',
      category: 'Custom',
      icon: '🔧'
    };
  }
}`,

      'src/__tests__/{{name}}Node.test.ts': `import { {{name}}Node } from '../{{name}}Node';

describe('{{name}}Node', () => {
  let node: {{name}}Node;

  beforeEach(() => {
    node = new {{name}}Node('test-node', {});
  });

  it('should process input correctly', async () => {
    const inputs = { input: 'hello world' };
    const result = await node.execute(inputs, {});
    
    expect(result.result).toBe('HELLO WORLD');
  });

  it('should handle empty input', async () => {
    const inputs = { input: '' };
    const result = await node.execute(inputs, {});
    
    expect(result.result).toBe('');
  });

  it('should throw error for invalid input', async () => {
    const inputs = { input: 123 };
    
    await expect(node.execute(inputs, {})).rejects.toThrow();
  });
});`,

      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          module: 'commonjs',
          lib: ['ES2020'],
          outDir: './dist',
          rootDir: './src',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          declaration: true,
          declarationMap: true,
          sourceMap: true
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist', '**/*.test.ts']
      }, null, 2),

      'jest.config.js': `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};`,

      '.eslintrc.js': `module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};`,

      'README.md': `# {{name}}

A custom node extension for PromptSpaghetti.

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## Building

\`\`\`bash
npm run build
\`\`\`

## Usage

Describe how to use your extension here.
`
    };
  }

  getUIExtensionTemplate() {
    return {
      'manifest.json': JSON.stringify({
        manifest_version: '1.0',
        id: '{{name}}',
        name: '{{name}}',
        version: '1.0.0',
        description: 'A custom UI extension',
        author: 'Your Name',
        extension_type: 'ui',
        capabilities: {
          provides: ['ui-components', 'themes'],
          requires: ['ui-components']
        },
        dependencies: {
          system_version: '^1.0.0'
        },
        permissions: ['ui-components'],
        ui: {
          themes: ['{{name}}-theme'],
          components: ['{{name}}Component']
        }
      }, null, 2),

      'src/index.ts': `import { UIExtension } from '@prompt-spaghetti/core';
import { {{name}}Component } from './components/{{name}}Component';
import { {{name}}Theme } from './themes/{{name}}Theme';

export class {{name}}Extension implements UIExtension {
  readonly id = '{{name}}';
  readonly name = '{{name}}';
  readonly version = '1.0.0';
  readonly extensionType = 'ui' as const;

  async initialize(): Promise<void> {
    console.log('Initializing {{name}} UI Extension');
  }

  async activate(): Promise<void> {
    // Register components and themes
    this.registerComponent('{{name}}Component', {{name}}Component);
    this.registerTheme('{{name}}-theme', {{name}}Theme);
    console.log('{{name}} UI Extension activated');
  }

  async deactivate(): Promise<void> {
    console.log('{{name}} UI Extension deactivated');
  }

  async dispose(): Promise<void> {
    console.log('{{name}} UI Extension disposed');
  }

  private registerComponent(name: string, component: any) {
    // Component registration logic
  }

  private registerTheme(name: string, theme: any) {
    // Theme registration logic
  }
}

export default {{name}}Extension;`,

      'src/components/{{name}}Component.tsx': `import React from 'react';

export interface {{name}}ComponentProps {
  config?: any;
  onAction?: (action: string, data?: any) => void;
}

export const {{name}}Component: React.FC<{{name}}ComponentProps> = ({
  config,
  onAction
}) => {
  const handleClick = () => {
    onAction?.('click', { message: 'Hello from {{name}}!' });
  };

  return (
    <div className="{{name}}-component">
      <h3>{{name}} Component</h3>
      <button onClick={handleClick}>
        Click me
      </button>
    </div>
  );
};`,

      'src/themes/{{name}}Theme.ts': `export const {{name}}Theme = {
  name: '{{name}}-theme',
  displayName: '{{name}} Theme',
  colors: {
    primary: '#007acc',
    secondary: '#f0f0f0',
    background: '#ffffff',
    text: '#333333',
    border: '#e1e5e9'
  },
  fonts: {
    primary: 'system-ui, sans-serif',
    mono: 'Monaco, monospace'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  }
};`,

      'src/styles/{{name}}.css': `.{{name}}-component {
  padding: 16px;
  border: 1px solid var(--border-color, #e1e5e9);
  border-radius: 8px;
  background: var(--background-color, #ffffff);
}

.{{name}}-component h3 {
  margin: 0 0 12px 0;
  color: var(--text-color, #333333);
}

.{{name}}-component button {
  padding: 8px 16px;
  border: none;
  background: var(--primary-color, #007acc);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.{{name}}-component button:hover {
  background: var(--primary-hover, #005a99);
}`,

      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          module: 'commonjs',
          lib: ['ES2020', 'DOM'],
          outDir: './dist',
          rootDir: './src',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          declaration: true,
          declarationMap: true,
          sourceMap: true,
          jsx: 'react'
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.test.tsx']
      }, null, 2),

      'README.md': `# {{name}}

A custom UI extension for PromptSpaghetti.

## Features

- Custom UI components
- Theme support
- Responsive design

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`
`
    };
  }

  getTransformExtensionTemplate() {
    return {
      'manifest.json': JSON.stringify({
        manifest_version: '1.0',
        id: '{{name}}',
        name: '{{name}}',
        version: '1.0.0',
        description: 'A custom transform extension',
        author: 'Your Name',
        extension_type: 'transform',
        capabilities: {
          provides: ['data-transform'],
          requires: ['data-processing']
        },
        dependencies: {
          system_version: '^1.0.0'
        },
        permissions: ['data-processing'],
        runtime: {
          entry_point: 'dist/index.js'
        }
      }, null, 2),

      'src/index.ts': `import { TransformExtension } from '@prompt-spaghetti/core';
import { {{name}}Processor } from './{{name}}Processor';

export class {{name}}Extension implements TransformExtension {
  readonly id = '{{name}}';
  readonly name = '{{name}}';
  readonly version = '1.0.0';
  readonly extensionType = 'transform' as const;

  private processor = new {{name}}Processor();

  async initialize(): Promise<void> {
    console.log('Initializing {{name}} Transform Extension');
  }

  async activate(): Promise<void> {
    // Register transform processors
    this.registerProcessor('{{name}}', this.processor);
    console.log('{{name}} Transform Extension activated');
  }

  async deactivate(): Promise<void> {
    console.log('{{name}} Transform Extension deactivated');
  }

  async dispose(): Promise<void> {
    console.log('{{name}} Transform Extension disposed');
  }

  async transform(data: any, options?: any): Promise<any> {
    return this.processor.process(data, options);
  }

  private registerProcessor(name: string, processor: any) {
    // Processor registration logic
  }
}

export default {{name}}Extension;`,

      'src/{{name}}Processor.ts': `export class {{name}}Processor {
  async process(data: any, options: any = {}): Promise<any> {
    // Validate input
    if (!data) {
      throw new Error('Input data is required');
    }

    // Your transformation logic here
    const result = this.transformData(data, options);

    return result;
  }

  private transformData(data: any, options: any): any {
    // Example transformation: convert to uppercase if string
    if (typeof data === 'string') {
      return data.toUpperCase();
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.transformData(item, options));
    }

    // Handle objects
    if (typeof data === 'object' && data !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = this.transformData(value, options);
      }
      return result;
    }

    // Return as-is for other types
    return data;
  }
}`,

      'README.md': `# {{name}}

A custom transform extension for PromptSpaghetti.

## Features

- Data transformation
- Configurable processing options
- Support for various data types

## Usage

\`\`\`typescript
const result = await extension.transform(inputData, options);
\`\`\`
`
    };
  }

  getStorageExtensionTemplate() {
    return {
      'manifest.json': JSON.stringify({
        manifest_version: '1.0',
        id: '{{name}}',
        name: '{{name}}',
        version: '1.0.0',
        description: 'A custom storage extension',
        author: 'Your Name',
        extension_type: 'storage',
        capabilities: {
          provides: ['data-storage'],
          requires: ['data-storage']
        },
        dependencies: {
          system_version: '^1.0.0'
        },
        permissions: ['data-storage', 'network'],
        runtime: {
          entry_point: 'dist/index.js',
          storage_providers: ['{{name}}Provider']
        }
      }, null, 2),

      'src/index.ts': `import { StorageExtension } from '@prompt-spaghetti/core';
import { {{name}}Provider } from './{{name}}Provider';

export class {{name}}Extension implements StorageExtension {
  readonly id = '{{name}}';
  readonly name = '{{name}}';
  readonly version = '1.0.0';
  readonly extensionType = 'storage' as const;

  private provider = new {{name}}Provider();

  async initialize(): Promise<void> {
    console.log('Initializing {{name}} Storage Extension');
    await this.provider.initialize();
  }

  async activate(): Promise<void> {
    // Register storage provider
    this.registerProvider('{{name}}', this.provider);
    console.log('{{name}} Storage Extension activated');
  }

  async deactivate(): Promise<void> {
    await this.provider.disconnect();
    console.log('{{name}} Storage Extension deactivated');
  }

  async dispose(): Promise<void> {
    console.log('{{name}} Storage Extension disposed');
  }

  private registerProvider(name: string, provider: any) {
    // Provider registration logic
  }
}

export default {{name}}Extension;`,

      'src/{{name}}Provider.ts': `import { StorageProvider } from '@prompt-spaghetti/core';

export class {{name}}Provider implements StorageProvider {
  private connected = false;

  async initialize(): Promise<void> {
    // Initialize connection to storage service
    console.log('Initializing {{name}} provider');
    this.connected = true;
  }

  async save(key: string, data: any): Promise<void> {
    this.ensureConnected();
    
    // Your save implementation here
    console.log(\`Saving data to key: \${key}\`);
    
    // Example: Save to localStorage (replace with your storage logic)
    localStorage.setItem(\`{{name}}:\${key}\`, JSON.stringify(data));
  }

  async load(key: string): Promise<any> {
    this.ensureConnected();
    
    // Your load implementation here
    console.log(\`Loading data from key: \${key}\`);
    
    // Example: Load from localStorage (replace with your storage logic)
    const data = localStorage.getItem(\`{{name}}:\${key}\`);
    return data ? JSON.parse(data) : null;
  }

  async delete(key: string): Promise<void> {
    this.ensureConnected();
    
    // Your delete implementation here
    console.log(\`Deleting data for key: \${key}\`);
    
    // Example: Delete from localStorage (replace with your storage logic)
    localStorage.removeItem(\`{{name}}:\${key}\`);
  }

  async list(): Promise<string[]> {
    this.ensureConnected();
    
    // Your list implementation here
    console.log('Listing all keys');
    
    // Example: List from localStorage (replace with your storage logic)
    const keys = [];
    const prefix = \`{{name}}:\`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key.substring(prefix.length));
      }
    }
    return keys;
  }

  async disconnect(): Promise<void> {
    // Clean up connections
    console.log('Disconnecting {{name}} provider');
    this.connected = false;
  }

  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error('{{name}} provider not connected');
    }
  }
}`,

      'README.md': `# {{name}}

A custom storage extension for PromptSpaghetti.

## Features

- Data persistence
- Key-value storage
- Connection management

## Configuration

Configure your storage connection settings in the extension configuration.
`
    };
  }
}

// CLI Implementation
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showUsage();
    return;
  }

  const command = args[0];
  
  switch (command) {
    case 'create':
      handleCreate(args.slice(1));
      break;
    case 'list-types':
      listExtensionTypes();
      break;
    case 'help':
      showUsage();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showUsage();
      process.exit(1);
  }
}

function handleCreate(args) {
  if (args.length < 2) {
    console.error('Usage: create-prompt-extension create <name> <type> [options]');
    process.exit(1);
  }

  const [name, type] = args;
  const scaffolder = new ExtensionScaffolder();

  try {
    scaffolder.createExtension(name, type);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function listExtensionTypes() {
  console.log('Available extension types:');
  for (const [type, description] of Object.entries(EXTENSION_TYPES)) {
    console.log(`  ${type.padEnd(10)} - ${description}`);
  }
}

function showUsage() {
  console.log(`
🚀 PromptSpaghetti Extension Scaffolder

Usage:
  create-prompt-extension create <name> <type>
  create-prompt-extension list-types
  create-prompt-extension help

Commands:
  create <name> <type>  Create a new extension project
  list-types           Show available extension types
  help                 Show this help message

Extension Types:
  node                 Create nodes for the graph editor
  ui                   Create UI components and themes
  transform            Create data transformation processors
  storage              Create storage providers and connectors

Examples:
  create-prompt-extension create my-node-extension node
  create-prompt-extension create my-theme ui
  create-prompt-extension create text-processor transform
  create-prompt-extension create cloud-storage storage

For more information, visit: https://docs.prompt-spaghetti.dev/extensions/
`);
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { ExtensionScaffolder, EXTENSION_TYPES };