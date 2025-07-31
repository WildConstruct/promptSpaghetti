import { BaseAdaptor } from './BaseAdaptor.js';
/**
 * OpenAI GPT adaptor for text-to-text prompt translation
 * Supports GPT-3.5 and GPT-4 models with chat completion format
 */
export class OpenAIGPTAdaptor extends BaseAdaptor {
  constructor(context) {
    super(
      'openai-gpt',
      '1.0.0',
      'openai-gpt',
      'OpenAI GPT Models',
      'Adaptor for OpenAI GPT-3.5 and GPT-4 text generation models',
      context
    );
  }
  async capabilities() {
    return {
      supportedNodeTypes: ['text', 'conditional', 'weighted', 'concat', 'output'],
      parameters: [
        {
          name: 'temperature',
          type: 'number',
          required: false,
          default: 0.7,
          min: 0.0,
          max: 2.0,
          description: 'Controls randomness in generation (0.0 = deterministic, 2.0 = very random)',
        },
        {
          name: 'max_tokens',
          type: 'number',
          required: false,
          default: 1000,
          min: 1,
          max: 4096,
          description: 'Maximum number of tokens to generate',
        },
        {
          name: 'top_p',
          type: 'number',
          required: false,
          default: 1.0,
          min: 0.0,
          max: 1.0,
          description: 'Nucleus sampling parameter',
        },
        {
          name: 'frequency_penalty',
          type: 'number',
          required: false,
          default: 0.0,
          min: -2.0,
          max: 2.0,
          description: 'Reduces repetition of frequent tokens',
        },
        {
          name: 'presence_penalty',
          type: 'number',
          required: false,
          default: 0.0,
          min: -2.0,
          max: 2.0,
          description: 'Encourages discussion of new topics',
        },
        {
          name: 'model',
          type: 'enum',
          required: false,
          default: 'gpt-3.5-turbo',
          options: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'],
          description: 'OpenAI model to use',
        },
      ],
      limitations: [
        {
          type: 'prompt_length',
          description: 'Maximum context length varies by model (4K-128K tokens)',
          severity: 'warning',
          impact: 'Long prompts may be truncated',
        },
        {
          type: 'feature',
          description: 'No direct image generation support',
          severity: 'error',
          impact: 'Image nodes will be converted to descriptive text',
        },
      ],
      features: [
        {
          name: 'chat_completion',
          supported: true,
          description: 'Supports system/user/assistant message format',
        },
        {
          name: 'function_calling',
          supported: true,
          description: 'Supports function calling and tool use',
        },
        {
          name: 'streaming',
          supported: true,
          description: 'Supports streaming responses',
        },
        {
          name: 'image_analysis',
          supported: false,
          description: 'Image input not supported in this adaptor',
          alternatives: ['Use OpenAI Vision adaptor for image analysis'],
        },
      ],
      maxNodes: 50,
      maxPromptLength: 32000,
      supportedFormats: ['chat_completion', 'text_completion'],
    };
  }
  async doValidate(graph) {
    const results = [];
    const capabilities = await this.capabilities();
    // Check for image nodes (not supported)
    const imageNodes = graph.nodes.filter(node => node.type === 'image');
    imageNodes.forEach(node => {
      results.push(
        this.createValidationResult(`unsupported-image-${node.id}`, 'warning', 'medium', 'Image node not supported', {
          description: 'Image nodes will be converted to text descriptions',
          nodeId: node.id,
          autoFixable: true,
          suggestions: [
            {
              type: 'workaround',
              description: 'Replace image node with descriptive text',
            },
          ],
        })
      );
    });
    // Check node count
    if (graph.nodes.length > capabilities.maxNodes) {
      results.push(
        this.createValidationResult('too-many-nodes', 'error', 'high', 'Too many nodes in graph', {
          description: `Graph has ${graph.nodes.length} nodes, maximum is ${capabilities.maxNodes}`,
          autoFixable: false,
          suggestions: [
            {
              type: 'fix',
              description: 'Reduce the number of nodes or split into multiple graphs',
            },
          ],
        })
      );
    }
    // Validate parameters
    graph.nodes.forEach(node => {
      if (node.data.parameters) {
        Object.entries(node.data.parameters).forEach(([key, value]) => {
          const paramSpec = capabilities.parameters.find(p => p.name === key);
          if (paramSpec) {
            const validation = this.validateParameter(key, value, paramSpec);
            if (validation) {
              results.push({
                ...validation,
                nodeId: node.id,
              });
            }
          }
        });
      }
    });
    return results;
  }
  async doTransform(graph, options) {
    const transformations = [];
    const capabilities = await this.capabilities();
    // Build the chat completion format
    const messages = [];
    const parameters = {};
    // Process the graph to build messages
    const processedContent = await this.processGraph(graph, transformations);
    // Default system message if none provided
    if (!processedContent.systemMessage) {
      messages.push({
        role: 'system',
        content: 'You are a helpful assistant.',
      });
      transformations.push({
        step: 'add_default_system_message',
        action: 'Added default system message',
      });
    } else {
      messages.push({
        role: 'system',
        content: processedContent.systemMessage,
      });
    }
    // Add user message
    messages.push({
      role: 'user',
      content: processedContent.userMessage,
    });
    // Extract and normalize parameters
    const extractedParams = this.extractParameters(graph);
    Object.entries(extractedParams).forEach(([key, value]) => {
      const paramSpec = capabilities.parameters.find(p => p.name === key);
      if (paramSpec) {
        parameters[key] = this.normalizeParameter(value, paramSpec);
      }
    });
    // Apply default parameters
    capabilities.parameters.forEach(param => {
      if (param.default !== undefined && !(param.name in parameters)) {
        parameters[param.name] = param.default;
      }
    });
    // Calculate quality score
    const validationResults = await this.doValidate(graph);
    const quality = this.calculateQualityScore(graph, capabilities, validationResults);
    const targetPrompt = {
      platform: this.platform,
      content: {
        messages,
        ...parameters,
      },
      parameters,
      format: 'chat_completion',
      metadata: {
        originalGraphId: graph.id,
        translationId: this.generateTranslationId(),
        timestamp: new Date(),
        adaptorVersion: this.version,
        quality,
        warnings: validationResults.filter(r => r.type === 'warning'),
        transformations,
      },
    };
    return targetPrompt;
  }
  /**
   * Process the graph to extract content and build messages
   */
  async processGraph(graph, transformations) {
    let systemMessage;
    let userMessage = '';
    // Find output nodes (these define the final prompt structure)
    const outputNodes = graph.nodes.filter(node => node.type === 'output');
    if (outputNodes.length === 0) {
      // No output nodes - concatenate all text nodes
      const textNodes = graph.nodes.filter(node => node.type === 'text' && node.data.content);
      userMessage = textNodes
        .map(node => node.data.content)
        .filter(Boolean)
        .join(' ');
      transformations.push({
        step: 'concatenate_text_nodes',
        action: 'Concatenated all text nodes as no output nodes found',
        details: { nodeCount: textNodes.length },
      });
    } else {
      // Process output nodes
      for (const outputNode of outputNodes) {
        const content = await this.processNode(outputNode, graph, transformations);
        if (outputNode.data.role === 'system') {
          systemMessage = content;
        } else {
          userMessage += (userMessage ? '\n' : '') + content;
        }
      }
    }
    // Handle image nodes by converting to text descriptions
    const imageNodes = graph.nodes.filter(node => node.type === 'image');
    for (const imageNode of imageNodes) {
      const description =
        imageNode.data.description || imageNode.data.content || `[Image: ${imageNode.data.label || 'untitled'}]`;
      userMessage += (userMessage ? '\n' : '') + `Image description: ${description}`;
      transformations.push({
        step: 'convert_image_to_text',
        sourceNodeId: imageNode.id,
        action: 'Converted image node to text description',
        details: { description },
      });
    }
    return { systemMessage, userMessage };
  }
  /**
   * Process a single node and its dependencies
   */
  async processNode(node, graph, transformations, visited = new Set()) {
    if (visited.has(node.id)) {
      return ''; // Avoid infinite loops
    }
    visited.add(node.id);
    let content = '';
    // Get input edges for this node
    const inputEdges = graph.edges.filter(edge => edge.target === node.id);
    if (inputEdges.length > 0) {
      // Process input nodes first
      for (const edge of inputEdges) {
        const sourceNode = graph.nodes.find(n => n.id === edge.source);
        if (sourceNode) {
          const sourceContent = await this.processNode(sourceNode, graph, transformations, visited);
          content += (content ? ' ' : '') + sourceContent;
        }
      }
    }
    // Process current node content
    switch (node.type) {
      case 'text':
        content += (content ? ' ' : '') + (node.data.content || '');
        break;
      case 'concat':
        // Content already processed from inputs
        transformations.push({
          step: 'process_concat',
          sourceNodeId: node.id,
          action: 'Concatenated input nodes',
        });
        break;
      case 'weighted':
        // For simplicity, take the first option (could be enhanced with actual weighting)
        if (node.data.options && node.data.options.length > 0) {
          content += (content ? ' ' : '') + node.data.options[0].text;
          transformations.push({
            step: 'process_weighted',
            sourceNodeId: node.id,
            action: 'Selected first weighted option',
            details: { selectedOption: 0 },
          });
        }
        break;
      case 'conditional':
        // For simplicity, take the 'true' branch (could be enhanced with condition evaluation)
        if (node.data.trueBranch) {
          content += (content ? ' ' : '') + node.data.trueBranch;
          transformations.push({
            step: 'process_conditional',
            sourceNodeId: node.id,
            action: 'Selected true branch',
            details: { condition: node.data.condition },
          });
        }
        break;
      case 'output':
        // Content already processed from inputs
        transformations.push({
          step: 'process_output',
          sourceNodeId: node.id,
          action: 'Processed output node',
        });
        break;
      default:
        // For unsupported node types, try to extract any text content
        if (node.data.content) {
          content += (content ? ' ' : '') + node.data.content;
          transformations.push({
            step: 'process_fallback',
            sourceNodeId: node.id,
            action: `Processed unsupported node type: ${node.type}`,
            details: { nodeType: node.type },
          });
        }
    }
    return content.trim();
  }
  /**
   * Extract parameters from graph nodes
   */
  extractParameters(graph) {
    const parameters = {};
    graph.nodes.forEach(node => {
      if (node.data.parameters) {
        Object.assign(parameters, node.data.parameters);
      }
    });
    return parameters;
  }
  /**
   * Validate a parameter value against its specification
   */
  validateParameter(name, value, spec) {
    if (spec.type === 'number') {
      if (typeof value !== 'number' || isNaN(value)) {
        return this.createValidationResult(
          `invalid-param-${name}`,
          'error',
          'medium',
          `Invalid number value for parameter "${name}"`,
          {
            description: `Expected number, got ${typeof value}`,
            autoFixable: true,
          }
        );
      }
      if (spec.min !== undefined && value < spec.min) {
        return this.createValidationResult(
          `param-too-low-${name}`,
          'warning',
          'low',
          `Parameter "${name}" value too low`,
          {
            description: `Value ${value} is below minimum ${spec.min}`,
            autoFixable: true,
          }
        );
      }
      if (spec.max !== undefined && value > spec.max) {
        return this.createValidationResult(
          `param-too-high-${name}`,
          'warning',
          'low',
          `Parameter "${name}" value too high`,
          {
            description: `Value ${value} is above maximum ${spec.max}`,
            autoFixable: true,
          }
        );
      }
    }
    if (spec.type === 'enum' && spec.options) {
      if (!spec.options.includes(value)) {
        return this.createValidationResult(
          `invalid-enum-${name}`,
          'error',
          'medium',
          `Invalid enum value for parameter "${name}"`,
          {
            description: `Value "${value}" not in allowed options: ${spec.options.join(', ')}`,
            autoFixable: true,
          }
        );
      }
    }
    return null;
  }
  /**
   * Normalize parameter value according to its specification
   */
  normalizeParameter(value, spec) {
    if (spec.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) return spec.default;
      if (spec.min !== undefined) return Math.max(spec.min, num);
      if (spec.max !== undefined) return Math.min(spec.max, num);
      return num;
    }
    if (spec.type === 'enum' && spec.options) {
      return spec.options.includes(value) ? value : spec.default;
    }
    return value;
  }
  /**
   * Generate a unique translation ID
   */
  generateTranslationId() {
    return `${this.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
