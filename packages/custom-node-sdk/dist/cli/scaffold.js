#!/usr/bin/env node
/**
 * @fileoverview Scaffold command for creating new custom nodes
 * Interactive CLI tool for generating custom node boilerplate
 */
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';
const program = new Command();
program
    .name('pnpm-scaffold-node')
    .description('Scaffold a new custom node for PromptScape')
    .version('0.1.0')
    .option('-o, --output <directory>', 'Output directory', '.')
    .option('-t, --template <template>', 'Template to use', 'basic')
    .option('-y, --yes', 'Skip prompts and use defaults')
    .action(async (options) => {
    try {
        console.log(chalk.blue('🚀 PromptScape Custom Node Scaffold'));
        console.log(chalk.gray('Creating a new custom node...\n'));
        const config = options.yes ? getDefaultConfig() : await promptForConfig();
        const outputDir = path.resolve(options.output);
        await scaffoldNode(config, outputDir);
        console.log(chalk.green('\n✅ Custom node scaffolded successfully!'));
        console.log(chalk.gray(`📁 Location: ${outputDir}`));
        console.log(chalk.gray('\n📖 Next steps:'));
        console.log(chalk.gray('  1. cd ' + path.relative(process.cwd(), outputDir)));
        console.log(chalk.gray('  2. npm install'));
        console.log(chalk.gray('  3. npm test'));
        console.log(chalk.gray('  4. Edit the generated files to implement your node logic'));
    }
    catch (error) {
        console.error(chalk.red('❌ Error:'), error.message);
        process.exit(1);
    }
});
async function promptForConfig() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Node type identifier (e.g., my-company.text-processor):',
            validate: (input) => {
                if (!input.trim())
                    return 'Name is required';
                if (!/^[a-zA-Z0-9.-]+$/.test(input))
                    return 'Name must contain only alphanumeric characters, dots, and hyphens';
                return true;
            }
        },
        {
            type: 'input',
            name: 'displayName',
            message: 'Display name:',
            validate: (input) => input.trim() ? true : 'Display name is required'
        },
        {
            type: 'input',
            name: 'description',
            message: 'Description:',
            validate: (input) => input.trim() ? true : 'Description is required'
        },
        {
            type: 'list',
            name: 'category',
            message: 'Category:',
            choices: [
                'Text Processing',
                'Data Transformation',
                'Logic & Control',
                'External APIs',
                'Math & Computation',
                'Utilities',
                'Custom'
            ]
        },
        {
            type: 'input',
            name: 'author',
            message: 'Author name:',
            validate: (input) => input.trim() ? true : 'Author name is required'
        },
        {
            type: 'input',
            name: 'email',
            message: 'Author email (optional):'
        },
        {
            type: 'confirm',
            name: 'stateful',
            message: 'Does this node maintain state between executions?',
            default: false
        },
        {
            type: 'confirm',
            name: 'cacheable',
            message: 'Can results be cached for performance?',
            default: true
        },
        {
            type: 'confirm',
            name: 'allowFileAccess',
            message: 'Does this node need file system access?',
            default: false
        },
        {
            type: 'confirm',
            name: 'allowNetworkAccess',
            message: 'Does this node need network access?',
            default: false
        }
    ]);
    // Prompt for inputs
    const inputs = [];
    let addingInputs = true;
    while (addingInputs) {
        const inputConfig = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Input name (leave empty to stop adding inputs):'
            }
        ]);
        if (!inputConfig.name.trim()) {
            addingInputs = false;
            continue;
        }
        const inputDetails = await inquirer.prompt([
            {
                type: 'list',
                name: 'type',
                message: 'Input type:',
                choices: ['string', 'number', 'boolean', 'array', 'object', 'any']
            },
            {
                type: 'confirm',
                name: 'required',
                message: 'Is this input required?',
                default: true
            },
            {
                type: 'input',
                name: 'description',
                message: 'Input description (optional):'
            }
        ]);
        inputs.push({
            name: inputConfig.name,
            type: inputDetails.type,
            required: inputDetails.required,
            description: inputDetails.description || undefined
        });
    }
    // Prompt for outputs
    const outputs = [];
    let addingOutputs = true;
    while (addingOutputs) {
        const outputConfig = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Output name (leave empty to stop adding outputs):'
            }
        ]);
        if (!outputConfig.name.trim()) {
            addingOutputs = false;
            continue;
        }
        const outputDetails = await inquirer.prompt([
            {
                type: 'list',
                name: 'type',
                message: 'Output type:',
                choices: ['string', 'number', 'boolean', 'array', 'object', 'any']
            },
            {
                type: 'input',
                name: 'description',
                message: 'Output description (optional):'
            }
        ]);
        outputs.push({
            name: outputConfig.name,
            type: outputDetails.type,
            description: outputDetails.description || undefined
        });
    }
    if (inputs.length === 0) {
        inputs.push({ name: 'input', type: 'any', required: true, description: 'Main input' });
    }
    if (outputs.length === 0) {
        outputs.push({ name: 'result', type: 'any', description: 'Main output' });
    }
    return {
        name: answers.name,
        displayName: answers.displayName,
        description: answers.description,
        category: answers.category,
        author: answers.author,
        email: answers.email || undefined,
        inputs,
        outputs,
        stateful: answers.stateful,
        cacheable: answers.cacheable,
        security: {
            allowFileAccess: answers.allowFileAccess,
            allowNetworkAccess: answers.allowNetworkAccess
        }
    };
}
function getDefaultConfig() {
    return {
        name: 'example.custom-node',
        displayName: 'Example Custom Node',
        description: 'An example custom node implementation',
        category: 'Utilities',
        author: 'Developer',
        inputs: [{ name: 'input', type: 'any', required: true, description: 'Main input' }],
        outputs: [{ name: 'result', type: 'any', description: 'Main output' }],
        stateful: false,
        cacheable: true,
        security: {
            allowFileAccess: false,
            allowNetworkAccess: false
        }
    };
}
async function scaffoldNode(config, outputDir) {
    // Create directory
    await fs.mkdir(outputDir, { recursive: true });
    // Generate files
    await generatePackageJson(config, outputDir);
    await generateNodeImplementation(config, outputDir);
    await generateTests(config, outputDir);
    await generateReadme(config, outputDir);
    await generateTsConfig(outputDir);
    await generateJestConfig(outputDir);
}
async function generatePackageJson(config, outputDir) {
    const packageJson = {
        name: config.name.replace(/\./g, '-'),
        version: '1.0.0',
        description: config.description,
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
            build: 'tsc',
            test: 'jest',
            'test:watch': 'jest --watch',
            dev: 'tsc --watch'
        },
        dependencies: {
            '@prompt-spaghetti/custom-node-sdk': '^0.1.0'
        },
        devDependencies: {
            '@types/jest': '^29.0.0',
            '@types/node': '^20.0.0',
            jest: '^29.0.0',
            'ts-jest': '^29.0.0',
            typescript: '^5.0.0'
        },
        author: config.email ? `${config.author} <${config.email}>` : config.author,
        keywords: ['promptscape', 'custom-node', config.category.toLowerCase().replace(/\s+/g, '-')]
    };
    await fs.writeFile(path.join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));
}
async function generateNodeImplementation(config, outputDir) {
    const className = config.displayName.replace(/[^a-zA-Z0-9]/g, '');
    const content = `import {
  CustomNodeBase,
  CustomNodeConfig,
  CustomNodeRuntime,
  CustomNodeResult,
  ValidationResult
} from '@prompt-spaghetti/custom-node-sdk';

/**
 * ${config.description}
 */
export class ${className} extends CustomNodeBase {
  constructor(id: string, config: CustomNodeConfig) {
    super(id, config);
  }

  validate(): ValidationResult {
    // Add custom validation logic here
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }

  async execute(runtime: CustomNodeRuntime): Promise<CustomNodeResult> {
    const { inputs, utils } = runtime;

    try {
      // Extract inputs
      ${config.inputs.map(input => `const ${input.name} = inputs.${input.name};`).join('\n      ')}

      // TODO: Implement your custom node logic here
      ${config.outputs.length === 1 && config.outputs[0].name === 'result'
        ? `const result = inputs.input; // Replace with actual logic`
        : config.outputs.map(output => `const ${output.name} = undefined; // TODO: Implement logic for ${output.name}`).join('\n      ')}

      return {
        outputs: {
          ${config.outputs.map(output => `${output.name}`).join(',\n          ')}
        }
      };
    } catch (error) {
      utils.log('error', 'Node execution failed', { error: error.message });
      throw error;
    }
  }
}

// Export node metadata
export const nodeMetadata = {
  type: '${config.name}',
  displayName: '${config.displayName}',
  description: '${config.description}',
  category: '${config.category}',
  version: '1.0.0',
  author: {
    name: '${config.author}'${config.email ? `,\n    email: '${config.email}'` : ''}
  }
};

// Export node schema
export const nodeSchema = {
  inputs: {
    ${config.inputs.map(input => `${input.name}: {
      type: '${input.type}',
      required: ${input.required}${input.description ? `,\n      description: '${input.description}'` : ''}
    }`).join(',\n    ')}
  },
  outputs: {
    ${config.outputs.map(output => `${output.name}: {
      type: '${output.type}'${output.description ? `,\n      description: '${output.description}'` : ''}
    }`).join(',\n    ')}
  }
};
`;
    await fs.writeFile(path.join(outputDir, 'index.ts'), content);
}
async function generateTests(config, outputDir) {
    const className = config.displayName.replace(/[^a-zA-Z0-9]/g, '');
    const content = `import { ${className}, nodeMetadata, nodeSchema } from './index';
import { MockContextFactory } from '@prompt-spaghetti/custom-node-sdk/testing';
import { CustomNodeConfig } from '@prompt-spaghetti/custom-node-sdk';

describe('${className}', () => {
  let node: ${className};
  let config: CustomNodeConfig;

  beforeEach(() => {
    config = {
      metadata: nodeMetadata,
      schema: nodeSchema,
      deterministic: true,
      cacheable: ${config.cacheable},
      stateful: ${config.stateful},
      security: {
        allowFileAccess: ${config.security.allowFileAccess},
        allowNetworkAccess: ${config.security.allowNetworkAccess}
      }
    };

    node = new ${className}('test-node', config);
  });

  describe('validation', () => {
    it('should pass validation with valid configuration', () => {
      const result = node.validate();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('execution', () => {
    it('should execute successfully with valid inputs', async () => {
      const context = MockContextFactory.create({
        variables: {
          ${config.inputs.map(input => `${input.name}: ${getTestValue(input.type)}`).join(',\n          ')}
        }
      });

      const runtime = {
        context,
        inputs: {
          ${config.inputs.map(input => `${input.name}: ${getTestValue(input.type)}`).join(',\n          ')}
        },
        utils: {
          random: () => 0.5,
          log: jest.fn<unknown[], unknown>(),
          validate: jest.fn(() => ({ valid: true, errors: [], warnings: [] })),
          getState: jest.fn<unknown[], unknown>(),
          setState: jest.fn<unknown[], unknown>()
        }
      };

      const result = await node.execute(runtime);
      
      expect(result).toBeDefined();
      expect(result.outputs).toBeDefined();
      ${config.outputs.map(output => `expect(result.outputs.${output.name}).toBeDefined();`).join('\n      ')}
    });

    ${config.inputs.filter(input => input.required).map(input => `
    it('should throw error when required input "${input.name}" is missing', async () => {
      const context = MockContextFactory.create();
      const runtime = {
        context,
        inputs: {
          ${config.inputs.filter(i => i !== input).map(i => `${i.name}: ${getTestValue(i.type)}`).join(',\n          ')}
        },
        utils: {
          random: () => 0.5,
          log: jest.fn<unknown[], unknown>(),
          validate: jest.fn(() => ({ valid: true, errors: [], warnings: [] })),
          getState: jest.fn<unknown[], unknown>(),
          setState: jest.fn<unknown[], unknown>()
        }
      };

      await expect(node.execute(runtime)).rejects.toThrow();
    });`).join('\n')}
  });
});

function getTestValue(type: string): any {
  switch (type) {
    case 'string': return "'test string'";
    case 'number': return "42";
    case 'boolean': return "true";
    case 'array': return "[1, 2, 3]";
    case 'object': return "{ key: 'value' }";
    default: return "'test value'";
  }
}`;
    function getTestValue(type) {
        switch (type) {
            case 'string': return "'test string'";
            case 'number': return "42";
            case 'boolean': return "true";
            case 'array': return "[1, 2, 3]";
            case 'object': return "{ key: 'value' }";
            default: return "'test value'";
        }
    }
    await fs.writeFile(path.join(outputDir, 'index.test.ts'), content);
}
async function generateReadme(config, outputDir) {
    const content = `# ${config.displayName}

${config.description}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`typescript
import { ${config.displayName.replace(/[^a-zA-Z0-9]/g, '')}, nodeMetadata, nodeSchema } from './index';

// Create node instance
const node = new ${config.displayName.replace(/[^a-zA-Z0-9]/g, '')}('my-node', {
  metadata: nodeMetadata,
  schema: nodeSchema,
  deterministic: true,
  cacheable: ${config.cacheable},
  stateful: ${config.stateful}
});

// Use in your PromptScape application
// ... register with runtime ...
\`\`\`

## Inputs

${config.inputs.map(input => `- **${input.name}** (${input.type}${input.required ? ', required' : ', optional'}): ${input.description || 'No description'}`).join('\n')}

## Outputs

${config.outputs.map(output => `- **${output.name}** (${output.type}): ${output.description || 'No description'}`).join('\n')}

## Development

\`\`\`bash
# Build
npm run build

# Test
npm test

# Watch mode
npm run dev
\`\`\`

## Security

${config.security.allowFileAccess ? '⚠️ This node requires file system access.' : '✅ This node does not require file system access.'}
${config.security.allowNetworkAccess ? '⚠️ This node requires network access.' : '✅ This node does not require network access.'}

## Author

${config.author}${config.email ? ` <${config.email}>` : ''}
`;
    await fs.writeFile(path.join(outputDir, 'README.md'), content);
}
async function generateTsConfig(outputDir) {
    const tsConfig = {
        compilerOptions: {
            target: 'ES2020',
            module: 'ESNext',
            moduleResolution: 'bundler',
            outDir: 'dist',
            rootDir: '.',
            declaration: true,
            declarationMap: true,
            sourceMap: true,
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true
        },
        include: ['*.ts'],
        exclude: ['dist', 'node_modules', '**/*.test.ts']
    };
    await fs.writeFile(path.join(outputDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
}
async function generateJestConfig(outputDir) {
    const jestConfig = `/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }]
  }
};`;
    await fs.writeFile(path.join(outputDir, 'jest.config.cjs'), jestConfig);
}
if (require.main === module) {
    program.parse();
}
export { program };
//# sourceMappingURL=scaffold.js.map