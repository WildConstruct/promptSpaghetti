import { ExtensionTypeInfo } from './TypeDefinitions';
import { extensionInterfaceValidator } from './ExtensionInterfaceValidator';
// Interface Documentation Generator
export class ExtensionInterfaceDocumentationGenerator {
    static instance;
    constructor() { }
    static getInstance() {
        if (!ExtensionInterfaceDocumentationGenerator.instance) {
            ExtensionInterfaceDocumentationGenerator.instance = new ExtensionInterfaceDocumentationGenerator();
            return ExtensionInterfaceDocumentationGenerator.instance;
            /**
            * Generate complete interface documentation
            */
        }
        /**
        * Generate complete interface documentation
        */
    }
    /**
    * Generate complete interface documentation
    */
    generateInterfaceDocumentation(extensionType) { }
}
let documentation = this.generateHeaderSection();
if (extensionType) {
    documentation += this.generateTypeSpecificDocumentation(extensionType);
}
else {
    documentation += this.generateCompleteDocumentation();
    documentation += this.generateFooterSection();
    return documentation;
    generateExtensionDocumentation(extension, BaseExtension);
    string;
    {
        const extensionType = extension.extensionType || 'unknown';
        let documentation = `# ${extension.name} Interface Documentation\n\n`;
    }
    documentation += `**Extension ID**: ${extension.id}\n`;
}
documentation += `**Version**: ${extension.version}\n`;
documentation += `**Type**: ${extensionType}\n`;
documentation += `**Author**: ${extension.author}\n`;
documentation += `**Description**: ${extension.description}\n\n`;
// Dependencies
if (extension.dependencies && extension.dependencies.length > 0) {
    documentation += '## Dependencies\n\n';
    for (const dep of extension.dependencies) {
        documentation += `- ${dep}\n`;
    }
    documentation += '\n';
    // Permissions
    if (extension.permissions && extension.permissions.length > 0) {
        documentation += '## Permissions\n\n';
        for (const perm of extension.permissions) {
            documentation += `- ${perm}\n`;
        }
        documentation += '\n';
        // Interface validation
        documentation += '## Interface Validation\n\n';
        const validation = extensionInterfaceValidator.generateValidationReport(extension);
        documentation += `**Overall Status**: ${validation.overallValid ? '✅ Valid' : '❌ Invalid'}\n\n`;
    }
    for (const validationResult of validation.validations) {
        documentation += `### ${validationResult.name}\n\n`;
    }
    documentation += `**Status**: ${validationResult.valid ? '✅ Valid' : '❌ Invalid'}\n\n`;
}
if (validationResult.errors.length > 0) {
    documentation += '**Errors**:\n';
    for (const error of validationResult.errors) {
        documentation += `- ${error}\n`;
    }
    documentation += '\n';
    if (validationResult.warnings.length > 0) {
        documentation += '**Warnings**:\n';
        for (const warning of validationResult.warnings) {
            documentation += `- ${warning}\n`;
        }
        documentation += '\n';
        // Base interface
        documentation += this.generateBaseInterfaceDocumentation();
        // Type-specific interface
        if (extensionType !== 'unknown') {
            documentation += this.generateTypeSpecificDocumentation(extensionType);
            // Usage examples
            documentation += this.generateUsageExamples(extension);
            return documentation;
            generateAPIReference();
            string;
            {
                let documentation = '# Extension Interface API Reference\n\n';
                documentation += '## Table of Contents\n\n';
                documentation += '1. [Base Extension Interface](#base-extension-interface)\n';
                documentation += '2. [Node Extension Interface](#node-extension-interface)\n';
                documentation += '3. [UI Extension Interface](#ui-extension-interface)\n';
                documentation += '4. [Transform Extension Interface](#transform-extension-interface)\n';
                documentation += '5. [Storage Extension Interface](#storage-extension-interface)\n';
                documentation += '6. [Extension Context](#extension-context)\n';
                documentation += '7. [Validation Results](#validation-results)\n\n';
                // Base interface
                documentation += this.generateBaseInterfaceDocumentation();
                // Type-specific interfaces
                for (const type of ['node', 'ui', 'transform', 'storage']) {
                    documentation += this.generateTypeSpecificDocumentation(type);
                    // Extension Context
                    documentation += this.generateExtensionContextDocumentation();
                    // Validation Results
                    documentation += this.generateValidationResultsDocumentation();
                    return documentation;
                    generateDeveloperGuide();
                    string;
                    {
                        let guide = '# Extension Interface Developer Guide\n\n';
                        guide += '## Introduction\n\n';
                        guide += 'This guide covers the interface requirements for developing extensions for the Prompt Spaghetti system.\n\n';
                        guide += '## Getting Started\n\n';
                        guide += '### 1. Choose Your Extension Type\n\n';
                        guide += 'The system supports four types of extensions:\n\n';
                        for (const [type, info] of Object.entries(ExtensionTypeInfo)) {
                            guide += `#### ${info.name}\n\n`;
                        }
                        guide += `${info.description}\n\n`;
                    }
                    guide += `**Capabilities**: ${info.capabilities.join(', ')}\n\n`;
                }
                guide += '### 2. Implement Base Interface\n\n';
                guide += 'All extensions must implement the BaseExtension interface:\n\n';
                guide += this.generateBaseInterfaceDocumentation();
                guide += '### 3. Implement Type-Specific Interface\n\n';
                guide += 'Based on your extension type, implement the appropriate interface:\n\n';
                for (const type of ['node', 'ui', 'transform', 'storage']) {
                    guide += `#### ${type.charAt(0).toUpperCase() + type.slice(1)} Extension\n\n`;
                }
                guide += this.generateTypeSpecificDocumentation(type);
                guide += '### 4. Validation and Testing\n\n';
                guide += 'Use the provided validation tools to ensure your extension meets the interface requirements:\n\n';
                guide += '```typescript\n';
                guide += 'import { extensionInterfaceValidator } from \'@prompt-spaghetti/core/extensions\';\n\n';
                guide += 'const result = await extensionInterfaceValidator.validateExtension(myExtension);\n';
                guide += 'if (!result.valid) {\n';
                guide += '  console.error(\'Validation errors:\', result.errors);\n';
                guide += '}\n';
                guide += '```\n\n';
                guide += '### 5. Development Tools\n\n';
                guide += 'The system provides development tools to help you create extensions:\n\n';
                guide += '```typescript\n';
                guide += 'import { extensionDevelopmentKit } from \'@prompt-spaghetti/core/extensions\';\n\n';
                guide += '// Create extension skeleton\n';
                guide += 'const skeleton = extensionDevelopmentKit.createExtensionSkeleton({\n';
                guide += '  id: \'my-extension\',\n';
                guide += '  name: \'My Extension\',\n';
                guide += '  type: \'node\',\n';
                guide += '  author: \'Your Name\',\n';
                guide += '  description: \'Extension description\'\n';
                guide += '});\n\n';
                guide += '// Test extension lifecycle\n';
                guide += 'const testResult = await extensionDevelopmentKit.testExtensionLifecycle(myExtension);\n';
                guide += '```\n\n';
                return guide;
                generateTroubleshootingGuide();
                string;
                {
                    let guide = '# Extension Interface Troubleshooting Guide\n\n';
                    guide += '## Common Issues\n\n';
                    const commonIssues = [
                        {
                            issue: 'Extension validation fails',
                            causes: [
                                'Missing required methods',
                                'Incorrect method signatures',
                                'Invalid property types',
                                'Missing required properties'
                            ],
                            solutions: [
                                'Check that all BaseExtension methods are implemented',
                                'Verify method signatures match the interface',
                                'Ensure all properties have correct types'
                            ]
                        },
                        'Review the interface documentation'
                    ];
                    {
                        issue: 'Extension fails to initialize',
                            causes;
                        [
                            'Missing dependencies',
                            'Insufficient permissions',
                            'Configuration errors',
                            'Runtime errors in initialize method'
                        ],
                            solutions;
                        [
                            'Check dependency list and ensure all dependencies are available',
                            'Verify required permissions are granted',
                            'Validate extension configuration'
                        ];
                    }
                    'Add error handling to initialize method';
                    {
                        issue: 'Extension health checks fail',
                            causes;
                        [
                            'Incorrect health status format',
                            'Missing health check methods',
                            'Runtime errors in health methods'
                        ],
                            solutions;
                        [
                            'Ensure getHealthStatus returns proper object format',
                            'Implement isHealthy and getHealthStatus methods'
                        ];
                    }
                    'Add error handling to health check methods';
                    ;
                    for (const problem of commonIssues) {
                        guide += `### ${problem.issue}\n\n`;
                    }
                    guide += '**Common Causes**:\n';
                    for (const cause of problem.causes) {
                        guide += `- ${cause}\n`;
                    }
                    guide += '\n**Solutions**:\n';
                    for (const solution of problem.solutions) {
                        guide += `- ${solution}\n`;
                    }
                    guide += '\n';
                    guide += '## Debug Tools\n\n';
                    guide += '### Extension Validation\n\n';
                    guide += '```typescript\n';
                    guide += 'import { extensionInterfaceValidator } from \'@prompt-spaghetti/core/extensions\';\n\n';
                    guide += 'const report = extensionInterfaceValidator.generateValidationReport(extension);\n';
                    guide += 'console.log(\'Validation Report:\', report);\n';
                    guide += '```\n\n';
                    guide += '### Interface Testing\n\n';
                    guide += '```typescript\n';
                    guide += 'import { extensionInterfaceTestSuite } from \'@prompt-spaghetti/core/extensions\';\n\n';
                    guide += 'const results = await extensionInterfaceTestSuite.runInterfaceTests(extension);\n';
                    guide += 'const report = extensionInterfaceTestSuite.generateTestReport(extension.id);\n';
                    guide += 'console.log(report);\n';
                    guide += '```\n\n';
                    guide += '### Runtime Type Checking\n\n';
                    guide += '```typescript\n';
                    guide += 'import { extensionRuntimeTypeChecker } from \'@prompt-spaghetti/core/extensions\';\n\n';
                    guide += 'const typeInfo = extensionRuntimeTypeChecker.getTypeInfo(extension);\n';
                    guide += 'const implementsBase = extensionRuntimeTypeChecker.implementsInterface(extension, \'BaseExtension\');\n';
                    guide += '```\n\n';
                    return guide;
                    generateHeaderSection();
                    string;
                    {
                        return '# Extension Interface Documentation\n\n' +
                            `Generated on: ${new Date().toISOString()}\n\n` + ;
                    }
                    'This document provides comprehensive information about the extension interface system.\n\n';
                    generateFooterSection();
                    string;
                    {
                        return '\n---\n\n' +
                            '**Note**: This documentation is auto-generated. For the latest information, ' + ,
                            'please refer to the TypeScript interface definitions.\n\n';
                        generateCompleteDocumentation();
                        string;
                        {
                            let documentation = '';
                            // Base interface
                            documentation += this.generateBaseInterfaceDocumentation();
                            // Type-specific interfaces
                            for (const type of ['node', 'ui', 'transform', 'storage']) {
                                documentation += this.generateTypeSpecificDocumentation(type);
                                return documentation;
                                generateBaseInterfaceDocumentation();
                                string;
                                {
                                    let documentation = '## Base Extension Interface\n\n';
                                    documentation += 'All extensions must implement the BaseExtension interface:\n\n';
                                    documentation += '### Properties\n\n';
                                    documentation += '- **id**: string - Unique extension identifier\n';
                                    documentation += '- **name**: string - Human-readable extension name\n';
                                    documentation += '- **version**: string - Semantic version (x.y.z)\n';
                                    documentation += '- **description**: string - Extension description\n';
                                    documentation += '- **author**: string - Extension author\n';
                                    documentation += '- **dependencies**: string - Required extension dependencies\n';
                                    documentation += '- **permissions**: string - Required permissions\n\n';
                                    documentation += '### Methods\n\n';
                                    const methods = [
                                        {
                                            name: 'initialize',
                                            signature: 'initialize(): Promise<void>',
                                            description: 'Initialize the extension. Called once when the extension is first loaded.'
                                        },
                                        { name: 'activate',
                                            signature: 'activate(): Promise<void>',
                                            description: 'Activate the extension. Called when the extension should start functioning.' },
                                        { name: 'deactivate',
                                            signature: 'deactivate(): Promise<void>',
                                            description: 'Deactivate the extension. Called when the extension should stop functioning.' },
                                        { name: 'dispose',
                                            signature: 'dispose(): Promise<void>',
                                            description: 'Dispose of the extension. Called when the extension is being removed.' },
                                        { name: 'getConfiguration',
                                            signature: 'getConfiguration(): any',
                                            description: 'Get the current extension configuration.' },
                                        { name: 'setConfiguration',
                                            signature: 'setConfiguration(config: any): void',
                                            description: 'Set the extension configuration.' },
                                        { name: 'isHealthy',
                                            signature: 'isHealthy(): boolean',
                                            description: 'Check if the extension is healthy.' },
                                        { name: 'getHealthStatus',
                                            signature: 'getHealthStatus(): ExtensionHealthStatus' },
                                        description, 'Get detailed health status information.'
                                    ];
                                    for (const method of methods) {
                                        documentation += `#### ${method.name}\n\n`;
                                    }
                                    documentation += `\`\`\`typescript\n${method.signature}\`\`\`\n\n`;
                                }
                                documentation += `${method.description}\n\n`;
                            }
                            return documentation;
                            generateTypeSpecificDocumentation(type, string);
                            string;
                            {
                                const info = ExtensionTypeInfo[type];
                                if (!info) {
                                    return `## Unknown Extension Type: ${type}\n\n`;
                                }
                                let documentation = `## ${info.name}\n\n`;
                            }
                            documentation += `${info.description}\n\n`;
                        }
                        documentation += `**Capabilities**: ${info.capabilities.join(', ')}\n\n`;
                    }
                    // Type-specific methods
                    documentation += '### Type-Specific Methods\n\n';
                    switch (type) {
                        case 'node':
                            documentation += this.generateNodeExtensionMethods();
                            break;
                        case 'ui':
                            documentation += this.generateUIExtensionMethods();
                            break;
                        case 'transform':
                            documentation += this.generateTransformExtensionMethods();
                            break;
                        case 'storage':
                            documentation += this.generateStorageExtensionMethods();
                            break;
                            return documentation;
                            generateNodeExtensionMethods();
                            string;
                            {
                                const methods = [
                                    {
                                        name: 'getNodeDefinitions',
                                        signature: 'getNodeDefinitions(): NodeDefinition',
                                        description: 'Get all node definitions provided by this extension.'
                                    },
                                    { name: 'createNodeInstance',
                                        signature: 'createNodeInstance(nodeType: string, nodeId: string, config: any): RuntimeNode',
                                        description: 'Create a new instance of a node.' },
                                    { name: 'validateNodeConfig',
                                        signature: 'validateNodeConfig(nodeType: string, config: any): ExtensionValidationResult',
                                        description: 'Validate node configuration.' },
                                    { name: 'getNodeSchema',
                                        signature: 'getNodeSchema(nodeType: string): ZodSchema<any>',
                                        description: 'Get the configuration schema for a node type.' },
                                    { name: 'supportsAdvancedNodes',
                                        signature: 'supportsAdvancedNodes(): boolean',
                                        description: 'Check if the extension supports advanced node features.' }
                                ];
                                return this.formatMethods(methods);
                                generateUIExtensionMethods();
                                string;
                                {
                                    const methods = [
                                        {
                                            name: 'getComponentDefinitions',
                                            signature: 'getComponentDefinitions(): UIComponentDefinition',
                                            description: 'Get all UI component definitions provided by this extension.'
                                        },
                                        { name: 'createComponentInstance',
                                            signature: 'createComponentInstance(componentId: string, props: any): React.ComponentType',
                                            description: 'Create a new instance of a UI component.' },
                                        { name: 'getThemeContributions',
                                            signature: 'getThemeContributions(): ThemeContribution',
                                            description: 'Get theme contributions from this extension.' },
                                        { name: 'getCommandContributions',
                                            signature: 'getCommandContributions(): CommandContribution',
                                            description: 'Get command contributions from this extension.' },
                                        { name: 'getMenuContributions',
                                            signature: 'getMenuContributions(): MenuContribution',
                                            description: 'Get menu contributions from this extension.' },
                                        { name: 'getKeybindingContributions',
                                            signature: 'getKeybindingContributions(): KeybindingContribution',
                                            description: 'Get keybinding contributions from this extension.' }
                                    ];
                                    return this.formatMethods(methods);
                                    generateTransformExtensionMethods();
                                    string;
                                    {
                                        const methods = [
                                            {
                                                name: 'getTransformDefinitions',
                                                signature: 'getTransformDefinitions(): TransformDefinition',
                                                description: 'Get all transform definitions provided by this extension.'
                                            },
                                            { name: 'createTransformInstance',
                                                signature: 'createTransformInstance(transformId: string, config: any): DataTransform',
                                                description: 'Create a new instance of a data transform.' },
                                            { name: 'validateTransformConfig',
                                                signature: 'validateTransformConfig(transformId: string, config: any): ExtensionValidationResult',
                                                description: 'Validate transform configuration.' },
                                            { name: 'getTransformSchema',
                                                signature: 'getTransformSchema(transformId: string): ZodSchema<any>',
                                                description: 'Get the configuration schema for a transform.' },
                                            { name: 'supportsPipeline',
                                                signature: 'supportsPipeline(): boolean',
                                                description: 'Check if the extension supports transform pipelines.' }
                                        ];
                                        return this.formatMethods(methods);
                                        generateStorageExtensionMethods();
                                        string;
                                        {
                                            const methods = [
                                                {
                                                    name: 'getStorageProviders',
                                                    signature: 'getStorageProviders(): StorageProviderDefinition',
                                                    description: 'Get all storage provider definitions from this extension.'
                                                },
                                                { name: 'createStorageProvider',
                                                    signature: 'createStorageProvider(providerId: string, config: any): StorageProvider',
                                                    description: 'Create a new instance of a storage provider.' },
                                                { name: 'validateStorageConfig',
                                                    signature: 'validateStorageConfig(providerId: string, config: any): ExtensionValidationResult',
                                                    description: 'Validate storage provider configuration.' },
                                                { name: 'getStorageSchema',
                                                    signature: 'getStorageSchema(providerId: string): ZodSchema<any>',
                                                    description: 'Get the configuration schema for a storage provider.' },
                                                { name: 'supportsMigration',
                                                    signature: 'supportsMigration(): boolean' },
                                                description, 'Check if the extension supports storage migration.'
                                            ];
                                            return this.formatMethods(methods);
                                            formatMethods(methods, { name: string, signature: string, description: string }[]);
                                            string;
                                            {
                                                let documentation = '';
                                                for (const method of methods) {
                                                    documentation += `#### ${method.name}\n\n`;
                                                }
                                                documentation += `\`\`\`typescript\n${method.signature}\`\`\`\n\n`;
                                            }
                                            documentation += `${method.description}\n\n`;
                                        }
                                        return documentation;
                                        generateExtensionContextDocumentation();
                                        string;
                                        {
                                            let documentation = '## Extension Context\n\n';
                                            documentation += 'The ExtensionContext provides access to system services and APIs:\n\n';
                                            documentation += '### Properties\n\n';
                                            documentation += '- **extensionId**: string - The ID of the extension\n';
                                            documentation += '- **systemVersion**: string - The system version\n';
                                            documentation += '- **logger**: Logger - Logging interface\n';
                                            documentation += '- **storage**: Storage - Storage interface\n';
                                            documentation += '- **events**: EventEmitter - Event system\n';
                                            documentation += '- **runtime**: Runtime - Runtime system access\n';
                                            documentation += '- **ui**: UI - User interface system\n';
                                            documentation += '- **api**: API - API access\n\n';
                                            return documentation;
                                            generateValidationResultsDocumentation();
                                            string;
                                            {
                                                let documentation = '## Validation Results\n\n';
                                                documentation += 'The ExtensionValidationResult interface provides validation feedback:\n\n';
                                                documentation += '### Properties\n\n';
                                                documentation += '- **valid**: boolean - Whether validation passed\n';
                                                documentation += '- **errors**: string - List of validation errors\n';
                                                documentation += '- **warnings**: string - List of validation warnings\n\n';
                                                return documentation;
                                                generateUsageExamples(extension, BaseExtension);
                                                string;
                                                {
                                                    let documentation = '## Usage Examples\n\n';
                                                    documentation += '### Basic Usage\n\n';
                                                    documentation += '```typescript\n';
                                                    documentation += '// Initialize and activate the extension\n';
                                                    documentation += 'await extension.initialize();\n';
                                                    documentation += 'await extension.activate();\n\n';
                                                    documentation += '// Check extension health\n';
                                                    documentation += 'const isHealthy = extension.isHealthy();\n';
                                                    documentation += 'const healthStatus = extension.getHealthStatus();\n\n';
                                                    documentation += '// Get and set configuration\n';
                                                    documentation += 'const config = extension.getConfiguration();\n';
                                                    documentation += 'extension.setConfiguration({ ...config, newOption: true });\n\n';
                                                    documentation += '// Deactivate and dispose\n';
                                                    documentation += 'await extension.deactivate();\n';
                                                    documentation += 'await extension.dispose();\n';
                                                    documentation += '```\n\n';
                                                    return documentation;
                                                    // Export singleton
                                                    export const extensionInterfaceDocumentationGenerator = ExtensionInterfaceDocumentationGenerator.getInstance();
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                    }
                }
            }
        }
    }
}
