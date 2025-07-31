/**
 * Automated documentation generator for adaptors
 */
export class DocumentationGenerator {
  constructor(logger) {
    this.logger = logger;
  }
  /**
   * Generate comprehensive documentation for an adaptor
   */
  async generateAdaptorDocumentation(adaptor, testResults, options = {}) {
    this.logger.info('Generating adaptor documentation', {
      adaptorId: adaptor.id,
      platform: adaptor.platform,
    });
    try {
      const capabilities = await adaptor.capabilities();
      const documentation = {
        metadata: {
          adaptorId: adaptor.id,
          version: adaptor.version,
          platform: adaptor.platform,
          name: adaptor.name || adaptor.id,
          description: adaptor.description || 'No description provided',
          generatedAt: new Date(),
          generatorVersion: '1.0.0',
        },
        overview: this.generateOverview(adaptor, capabilities),
        capabilities: this.generateCapabilitiesDocumentation(capabilities),
        parameters: this.generateParametersDocumentation(capabilities.parameters),
        features: this.generateFeaturesDocumentation(capabilities.features),
        limitations: this.generateLimitationsDocumentation(capabilities.limitations),
        examples: await this.generateExamples(adaptor, options),
        apiReference: this.generateAPIReference(adaptor),
        troubleshooting: this.generateTroubleshooting(adaptor, capabilities),
        testResults: testResults ? this.generateTestDocumentation(testResults) : undefined,
        changelog: options.changelog || [],
      };
      // Generate different formats
      const formats = {
        markdown: this.generateMarkdown(documentation),
        html: this.generateHTML(documentation),
        json: JSON.stringify(documentation, null, 2),
      };
      return {
        ...documentation,
        formats,
      };
    } catch (error) {
      this.logger.error('Documentation generation failed', {
        adaptorId: adaptor.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
  /**
   * Generate overview section
   */
  generateOverview(adaptor, capabilities) {
    return {
      summary: adaptor.description || 'No description provided',
      platformInfo: {
        platform: adaptor.platform,
        version: adaptor.version,
        supportedFormats: capabilities.supportedFormats,
      },
      keyFeatures: capabilities.features
        .filter(f => f.supported)
        .slice(0, 5)
        .map(f => f.name),
      quickStart: this.generateQuickStart(adaptor),
    };
  }
  /**
   * Generate capabilities documentation
   */
  generateCapabilitiesDocumentation(capabilities) {
    return {
      supportedNodeTypes: capabilities.supportedNodeTypes.map(type => ({
        type,
        description: this.getNodeTypeDescription(type),
        examples: this.getNodeTypeExamples(type),
      })),
      maxNodes: capabilities.maxNodes,
      maxPromptLength: capabilities.maxPromptLength,
      supportedFormats: capabilities.supportedFormats.map(format => ({
        format,
        description: this.getFormatDescription(format),
        mimeType: this.getFormatMimeType(format),
      })),
    };
  }
  /**
   * Generate parameters documentation
   */
  generateParametersDocumentation(parameters) {
    return {
      summary: `This adaptor supports ${parameters.length} configuration parameters`,
      parameters: parameters.map(param => ({
        ...param,
        examples: this.generateParameterExamples(param),
        validation: this.generateParameterValidation(param),
      })),
    };
  }
  /**
   * Generate features documentation
   */
  generateFeaturesDocumentation(features) {
    const supported = features.filter(f => f.supported);
    const unsupported = features.filter(f => !f.supported);
    return {
      supported: supported.map(feature => ({
        ...feature,
        usageExample: this.generateFeatureExample(feature),
      })),
      unsupported: unsupported.map(feature => ({
        ...feature,
        workarounds: feature.alternatives || [],
      })),
      summary: `${supported.length} supported features, ${unsupported.length} unsupported`,
    };
  }
  /**
   * Generate limitations documentation
   */
  generateLimitationsDocumentation(limitations) {
    const byType = limitations.reduce((acc, limitation) => {
      if (!acc[limitation.type]) {
        acc[limitation.type] = [];
      }
      acc[limitation.type].push(limitation);
      return acc;
    }, {});
    return {
      byType,
      summary: limitations.map(l => l.description),
      workarounds: limitations
        .filter(l => l.severity !== 'error')
        .map(l => ({
          limitation: l.description,
          workaround: this.generateWorkaround(l),
        })),
    };
  }
  /**
   * Generate usage examples
   */
  async generateExamples(adaptor, options) {
    const examples = [];
    // Basic example
    examples.push({
      title: 'Basic Usage',
      description: 'Simple prompt translation example',
      code: this.generateBasicExample(adaptor),
      output: 'Example output would appear here',
    });
    // Advanced example
    examples.push({
      title: 'Advanced Configuration',
      description: 'Using custom parameters and options',
      code: this.generateAdvancedExample(adaptor),
      output: 'Advanced output would appear here',
    });
    // Error handling example
    examples.push({
      title: 'Error Handling',
      description: 'Handling validation errors and recovery',
      code: this.generateErrorExample(adaptor),
      output: 'Error handling demonstration',
    });
    return {
      examples,
      tutorials: options.includeTutorials ? this.generateTutorials(adaptor) : [],
    };
  }
  /**
   * Generate API reference
   */
  generateAPIReference(adaptor) {
    return {
      methods: [
        {
          name: 'capabilities',
          signature: 'capabilities(): Promise<Capabilities>',
          description: 'Returns the capabilities of this adaptor',
          parameters: [],
          returns: 'Promise<Capabilities>',
          examples: ['const caps = await adaptor.capabilities();'],
        },
        {
          name: 'validate',
          signature: 'validate(graph: PromptGraph): Promise<ValidationResult[]>',
          description: 'Validates a prompt graph for this platform',
          parameters: [
            {
              name: 'graph',
              type: 'PromptGraph',
              description: 'The prompt graph to validate',
            },
          ],
          returns: 'Promise<ValidationResult[]>',
          examples: ['const results = await adaptor.validate(graph);'],
        },
        {
          name: 'transform',
          signature: 'transform(graph: PromptGraph, options?: TransformOptions): Promise<TargetPrompt>',
          description: 'Transforms a prompt graph to platform-specific format',
          parameters: [
            {
              name: 'graph',
              type: 'PromptGraph',
              description: 'The prompt graph to transform',
            },
            {
              name: 'options',
              type: 'TransformOptions',
              description: 'Optional transformation options',
              optional: true,
            },
          ],
          returns: 'Promise<TargetPrompt>',
          examples: ['const result = await adaptor.transform(graph, { optimize: true });'],
        },
        {
          name: 'estimateQuality',
          signature: 'estimateQuality(graph: PromptGraph): Promise<QualityScore>',
          description: 'Estimates the quality of translation for a graph',
          parameters: [
            {
              name: 'graph',
              type: 'PromptGraph',
              description: 'The prompt graph to evaluate',
            },
          ],
          returns: 'Promise<QualityScore>',
          examples: ['const quality = await adaptor.estimateQuality(graph);'],
        },
      ],
      types: this.generateTypeDocumentation(),
    };
  }
  /**
   * Generate troubleshooting guide
   */
  generateTroubleshooting(adaptor, capabilities) {
    return {
      commonIssues: [
        {
          issue: 'Validation errors with unsupported node types',
          cause: `This adaptor only supports: ${capabilities.supportedNodeTypes.join(', ')}`,
          solution: 'Use supported node types or choose a different adaptor',
          code: 'Check validation results for specific unsupported nodes',
        },
        {
          issue: 'Transformation fails with parameter errors',
          cause: 'Invalid parameter values for this platform',
          solution: 'Check parameter specifications and use valid values',
          code: 'const caps = await adaptor.capabilities(); // Check caps.parameters',
        },
        {
          issue: 'Poor quality scores',
          cause: 'Graph structure not optimized for this platform',
          solution: 'Simplify graph or use platform-specific features',
          code: 'const quality = await adaptor.estimateQuality(graph);',
        },
      ],
      debugging: {
        enableLogging: 'Set log level to debug for detailed information',
        validateFirst: 'Always validate graphs before transformation',
        checkCapabilities: 'Review adaptor capabilities for compatibility',
      },
      support: {
        documentation: 'Check the API reference for detailed method documentation',
        examples: 'Review usage examples for common patterns',
        community: 'Search existing issues or create new ones for help',
      },
    };
  }
  /**
   * Generate test results documentation
   */
  generateTestDocumentation(testResults) {
    return {
      summary: {
        passed: testResults.overall.passed,
        score: testResults.overall.score,
        description: testResults.overall.summary,
      },
      compliance: {
        interfaceCompliance: testResults.compliance.interfaceCompliance,
        lifecycleCompliance: testResults.compliance.lifecycleCompliance,
        validationCompliance: testResults.compliance.validationCompliance,
        transformationCompliance: testResults.compliance.transformationCompliance,
        errors: testResults.compliance.errors,
      },
      performance: {
        validationTime: `${testResults.performance.validationTime.toFixed(2)}ms`,
        transformationTime: `${testResults.performance.transformationTime.toFixed(2)}ms`,
        memoryUsage: `${Math.round(testResults.performance.memoryUsage / 1024 / 1024)}MB`,
        cacheEfficiency: `${testResults.performance.cacheEfficiency.toFixed(1)}%`,
        errors: testResults.performance.errors,
      },
      functionality: {
        basicFunctionality: testResults.functionality.basicFunctionality,
        errorHandling: testResults.functionality.errorHandling,
        edgeCases: testResults.functionality.edgeCases,
        qualityScoring: testResults.functionality.qualityScoring,
        errors: testResults.functionality.errors,
      },
    };
  }
  /**
   * Generate markdown format
   */
  generateMarkdown(doc) {
    const md = [];
    // Header
    md.push(`# ${doc.metadata.name} Adaptor`);
    md.push(`\n**Platform:** ${doc.metadata.platform}`);
    md.push(`**Version:** ${doc.metadata.version}`);
    md.push(`**Generated:** ${doc.metadata.generatedAt.toISOString()}\n`);
    // Overview
    md.push('## Overview\n');
    md.push(doc.overview.summary);
    md.push('\n### Key Features\n');
    doc.overview.keyFeatures.forEach(feature => {
      md.push(`- ${feature}`);
    });
    // Quick Start
    md.push('\n### Quick Start\n');
    md.push('```typescript');
    md.push(doc.overview.quickStart);
    md.push('```\n');
    // Parameters
    md.push('## Parameters\n');
    md.push(doc.parameters.summary);
    md.push('\n| Parameter | Type | Required | Default | Description |');
    md.push('|-----------|------|----------|---------|-------------|');
    doc.parameters.parameters.forEach(param => {
      md.push(
        `| ${param.name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.default || 'N/A'} | ${param.description} |`
      );
    });
    // Features
    md.push('\n## Supported Features\n');
    doc.features.supported.forEach(feature => {
      md.push(`### ${feature.name}`);
      md.push(feature.description);
      if (feature.usageExample) {
        md.push('\n```typescript');
        md.push(feature.usageExample);
        md.push('```\n');
      }
    });
    // Limitations
    if (doc.limitations.summary.length > 0) {
      md.push('\n## Limitations\n');
      doc.limitations.summary.forEach(limitation => {
        md.push(`- ${limitation}`);
      });
    }
    // Examples
    md.push('\n## Examples\n');
    doc.examples.examples.forEach(example => {
      md.push(`### ${example.title}`);
      md.push(example.description);
      md.push('\n```typescript');
      md.push(example.code);
      md.push('```\n');
    });
    // API Reference
    md.push('\n## API Reference\n');
    doc.apiReference.methods.forEach(method => {
      md.push(`### ${method.name}`);
      md.push(method.description);
      md.push(`\n**Signature:** \`${method.signature}\``);
      md.push(`\n**Returns:** ${method.returns}\n`);
      if (method.examples.length > 0) {
        md.push('**Example:**');
        md.push('```typescript');
        md.push(method.examples[0]);
        md.push('```\n');
      }
    });
    // Test Results
    if (doc.testResults) {
      md.push('\n## Test Results\n');
      md.push(`**Overall Score:** ${doc.testResults.summary.score}/100`);
      md.push(`**Status:** ${doc.testResults.summary.passed ? 'PASSED' : 'FAILED'}`);
      md.push(`**Summary:** ${doc.testResults.summary.description}\n`);
    }
    return md.join('\n');
  }
  /**
   * Generate HTML format
   */
  generateHTML(doc) {
    const html = [];
    html.push('<!DOCTYPE html>');
    html.push('<html lang="en">');
    html.push('<head>');
    html.push(`<title>${doc.metadata.name} Adaptor Documentation</title>`);
    html.push('<meta charset="UTF-8">');
    html.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    html.push('<style>');
    html.push(this.getDocumentationCSS());
    html.push('</style>');
    html.push('</head>');
    html.push('<body>');
    // Convert markdown to basic HTML structure
    const markdownContent = this.generateMarkdown(doc);
    const htmlContent = this.convertMarkdownToHTML(markdownContent);
    html.push(htmlContent);
    html.push('</body>');
    html.push('</html>');
    return html.join('\n');
  }
  // Helper methods for generating content
  generateQuickStart(adaptor) {
    return `import { ${adaptor.constructor.name} } from '@promptscape/prompt-target-core';
import { ConsoleLogger, MemoryCache, MemoryMetrics } from '@promptscape/prompt-target-core';

// Create context
const context = {
  logger: new ConsoleLogger(),
  cache: new MemoryCache(), 
  metrics: new MemoryMetrics(),
  config: {}
};

// Initialize adaptor
const adaptor = new ${adaptor.constructor.name}(context);
await adaptor.initialize(context);

// Use adaptor
const capabilities = await adaptor.capabilities();
const results = await adaptor.validate(graph);
const output = await adaptor.transform(graph);`;
  }
  generateBasicExample(adaptor) {
    return `const graph = {
  id: 'example',
  nodes: [{ id: 'text', type: 'text', data: { content: 'Hello world' } }],
  edges: [],
  metadata: { created: new Date(), modified: new Date(), version: '1.0' }
};

const result = await adaptor.transform(graph);
console.log(result.content);`;
  }
  generateAdvancedExample(adaptor) {
    return `const graph = createComplexGraph();
const options = { optimize: true, targetQuality: 'high' };

const result = await adaptor.transform(graph, options);
const quality = await adaptor.estimateQuality(graph);

console.log('Quality score:', quality.overall);
console.log('Generated prompt:', result.content);`;
  }
  generateErrorExample(adaptor) {
    return `try {
  const results = await adaptor.validate(graph);
  const errors = results.filter(r => r.type === 'error');
  
  if (errors.length > 0) {
    console.log('Validation errors:', errors);
    // Handle errors...
  } else {
    const output = await adaptor.transform(graph);
    console.log('Success:', output);
  }
} catch (error) {
  console.error('Adaptor error:', error.message);
}`;
  }
  generateTutorials(adaptor) {
    return [
      {
        title: 'Getting Started',
        steps: [
          'Install the prompt targeting core package',
          'Import the adaptor class',
          'Create a plugin context',
          'Initialize the adaptor',
          'Create your first prompt graph',
          'Validate and transform the graph',
        ],
        code: this.generateQuickStart(adaptor),
      },
    ];
  }
  getNodeTypeDescription(type) {
    const descriptions = {
      text: 'Basic text content node',
      image: 'Image reference or description node',
      style: 'Style and formatting modifiers',
      concat: 'Concatenates multiple inputs',
      conditional: 'Conditional branching logic',
      weighted: 'Weighted random selection',
      output: 'Final output node',
    };
    return descriptions[type] || 'Custom node type';
  }
  getNodeTypeExamples(type) {
    const examples = {
      text: ['{ type: "text", data: { content: "Hello world" } }'],
      image: ['{ type: "image", data: { url: "https://example.com/image.jpg" } }'],
      style: ['{ type: "style", data: { style: "photorealistic, 8k" } }'],
    };
    return examples[type] || [];
  }
  getFormatDescription(format) {
    const descriptions = {
      chat_completion: 'OpenAI chat completion format',
      midjourney_prompt: 'Midjourney command-line format',
      text_completion: 'Simple text completion format',
    };
    return descriptions[format] || 'Custom format';
  }
  getFormatMimeType(format) {
    const mimeTypes = {
      chat_completion: 'application/json',
      midjourney_prompt: 'text/plain',
      text_completion: 'text/plain',
    };
    return mimeTypes[format] || 'text/plain';
  }
  generateParameterExamples(param) {
    const examples = [];
    if (param.type === 'number' && param.min !== undefined && param.max !== undefined) {
      examples.push(`${param.min} (minimum)`);
      examples.push(`${param.max} (maximum)`);
      if (param.default !== undefined) {
        examples.push(`${param.default} (default)`);
      }
    } else if (param.type === 'enum' && param.options) {
      examples.push(...param.options.slice(0, 3));
    } else if (param.default !== undefined) {
      examples.push(String(param.default));
    }
    return examples;
  }
  generateParameterValidation(param) {
    const validations = [];
    if (param.required) validations.push('Required');
    if (param.type === 'number' && param.min !== undefined) {
      validations.push(`Minimum: ${param.min}`);
    }
    if (param.type === 'number' && param.max !== undefined) {
      validations.push(`Maximum: ${param.max}`);
    }
    if (param.type === 'enum' && param.options) {
      validations.push(`Options: ${param.options.join(', ')}`);
    }
    return validations.join(', ');
  }
  generateFeatureExample(feature) {
    return `// ${feature.description}
// Feature: ${feature.name}
// Status: ${feature.supported ? 'Supported' : 'Not supported'}`;
  }
  generateWorkaround(limitation) {
    const workarounds = {
      prompt_length: 'Split long prompts into smaller chunks',
      node_count: 'Simplify graph structure or use fewer nodes',
      feature: 'Use alternative approaches or different adaptor',
    };
    return workarounds[limitation.type] || 'No known workaround';
  }
  generateTypeDocumentation() {
    return [
      {
        name: 'PromptGraph',
        description: 'Graph structure representing a prompt',
        properties: [
          { name: 'id', type: 'string', description: 'Unique identifier' },
          { name: 'nodes', type: 'PromptNode[]', description: 'Array of nodes' },
          { name: 'edges', type: 'PromptEdge[]', description: 'Array of edges' },
          { name: 'metadata', type: 'GraphMetadata', description: 'Graph metadata' },
        ],
      },
      {
        name: 'ValidationResult',
        description: 'Result of graph validation',
        properties: [
          { name: 'id', type: 'string', description: 'Unique result identifier' },
          { name: 'type', type: '"error" | "warning" | "info"', description: 'Result type' },
          { name: 'severity', type: '"critical" | "high" | "medium" | "low"', description: 'Issue severity' },
          { name: 'message', type: 'string', description: 'Human-readable message' },
        ],
      },
    ];
  }
  getDocumentationCSS() {
    return `
      body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
      h1, h2, h3 { color: #333; }
      h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
      h2 { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px; }
      code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
      pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
      table { border-collapse: collapse; width: 100%; margin: 20px 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f5f5f5; }
      .status-passed { color: #28a745; font-weight: bold; }
      .status-failed { color: #dc3545; font-weight: bold; }
    `;
  }
  convertMarkdownToHTML(markdown) {
    return markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.*)$/gm, '<p>$1</p>')
      .replace(/<p><li>/g, '<ul><li>')
      .replace(/<\/li><\/p>/g, '</li></ul>');
  }
}
