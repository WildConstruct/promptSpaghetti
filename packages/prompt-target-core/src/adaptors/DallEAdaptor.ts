import {
  Capabilities,
  PromptGraph,
  PromptNode,
  ValidationResult,
  TargetPrompt,
  TransformOptions,
  ParameterSpec,
  Feature,
  PluginContext,
  TransformationLog
} from '../types/index.js';
import { BaseAdaptor } from './BaseAdaptor.js';

/**
 * DALL-E adaptor for text-to-image prompt translation
 * Supports DALL-E 3 and DALL-E 2 API parameters
 */
export class DallEAdaptor extends BaseAdaptor {
  private readonly supportedSizes = [
    '256x256', '512x512', '1024x1024', // DALL-E 2
    '1024x1024', '1792x1024', '1024x1792' // DALL-E 3
  ];

  private readonly supportedQualities = ['standard', 'hd'];
  private readonly supportedStyles = ['vivid', 'natural'];
  private readonly supportedModels = ['dall-e-2', 'dall-e-3'];

  constructor(context: PluginContext) {
    super(
      'dall-e',
      '1.0.0',
      'openai-dalle',
      'DALL-E Image Generator',
      'Adaptor for OpenAI DALL-E text-to-image generation',
      context
    );
  }

  async capabilities(): Promise<Capabilities> {
    return {
      supportedNodeTypes: [
        'text',
        'image', // For image references/editing
        'style',
        'conditional',
        'weighted',
        'concat',
        'output'
      ],
      parameters: [
        {
          name: 'model',
          type: 'enum',
          required: false,
          default: 'dall-e-3',
          options: this.supportedModels,
          description: 'DALL-E model version to use'
        },
        {
          name: 'size',
          type: 'enum',
          required: false,
          default: '1024x1024',
          options: this.supportedSizes,
          description: 'Image dimensions'
        },
        {
          name: 'quality',
          type: 'enum',
          required: false,
          default: 'standard',
          options: this.supportedQualities,
          description: 'Image quality (DALL-E 3 only)'
        },
        {
          name: 'style',
          type: 'enum',
          required: false,
          default: 'vivid',
          options: this.supportedStyles,
          description: 'Image style (DALL-E 3 only)'
        },
        {
          name: 'n',
          type: 'number',
          required: false,
          default: 1,
          min: 1,
          max: 4,
          description: 'Number of images to generate (DALL-E 2: 1-10, DALL-E 3: 1)'
        },
        {
          name: 'response_format',
          type: 'enum',
          required: false,
          default: 'url',
          options: ['url', 'b64_json'],
          description: 'Response format for generated images'
        }
      ],
      limitations: [
        {
          type: 'prompt_length',
          description: 'Maximum prompt length 4000 characters',
          severity: 'error',
          impact: 'Prompts exceeding 4000 characters will be rejected'
        },
        {
          type: 'feature',
          description: 'OpenAI content policy restrictions apply',
          severity: 'warning',
          impact: 'Images violating content policy will be rejected'
        },
        {
          type: 'feature',
          description: 'DALL-E 3 limited to 1 image per request',
          severity: 'info',
          impact: 'Multiple image generation requires separate API calls'
        }
      ],
      features: [
        {
          name: 'high_resolution',
          supported: true,
          description: 'Supports HD quality images (DALL-E 3)'
        },
        {
          name: 'style_control',
          supported: true,
          description: 'Vivid and natural style options (DALL-E 3)'
        },
        {
          name: 'image_editing',
          supported: true,
          description: 'Edit and variation capabilities'
        },
        {
          name: 'multiple_images',
          supported: true,
          description: 'Generate multiple variations (DALL-E 2)'
        },
        {
          name: 'custom_sizes',
          supported: false,
          description: 'Limited to predefined sizes only',
          alternatives: ['Choose from supported size options']
        }
      ],
      maxNodes: 15,
      maxPromptLength: 4000,
      supportedFormats: ['openai_dalle_prompt']
    };
  }

  protected async doValidate(graph: PromptGraph): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const capabilities = await this.capabilities();

    // Check prompt length
    const estimatedPromptLength = this.estimatePromptLength(graph);
    if (estimatedPromptLength > capabilities.maxPromptLength!) {
      results.push(this.createValidationResult(
        'prompt-too-long',
        'error',
        'high',
        'Prompt exceeds DALL-E maximum length',
        {
          description: `Estimated length ${estimatedPromptLength} exceeds maximum ${capabilities.maxPromptLength}`,
          autoFixable: false,
          suggestions: [{
            type: 'fix',
            description: 'Simplify prompt or reduce content length'
          }]
        }
      ));
    }

    // Validate model-specific parameters
    const extractedParams = this.extractParameters(graph);
    const model = extractedParams.model || 'dall-e-3';

    // DALL-E 3 specific validations
    if (model === 'dall-e-3') {
      if (extractedParams.n && extractedParams.n > 1) {
        results.push(this.createValidationResult(
          'dalle3-multiple-images',
          'error',
          'medium',
          'DALL-E 3 only supports single image generation',
          {
            description: 'Parameter "n" must be 1 for DALL-E 3',
            autoFixable: true,
            suggestions: [{
              type: 'fix',
              description: 'Set n=1 or use DALL-E 2 for multiple images'
            }]
          }
        ));
      }

      // Check size compatibility
      if (extractedParams.size && !['1024x1024', '1792x1024', '1024x1792'].includes(extractedParams.size)) {
        results.push(this.createValidationResult(
          'dalle3-invalid-size',
          'warning',
          'medium',
          'Size not optimized for DALL-E 3',
          {
            description: `Size "${extractedParams.size}" may not be supported. Recommended: 1024x1024, 1792x1024, 1024x1792`,
            autoFixable: true,
            suggestions: [{
              type: 'fix',
              description: 'Use DALL-E 3 optimized sizes for best results'
            }]
          }
        ));
      }
    }

    // DALL-E 2 specific validations
    if (model === 'dall-e-2') {
      if (extractedParams.quality && extractedParams.quality !== 'standard') {
        results.push(this.createValidationResult(
          'dalle2-quality-not-supported',
          'warning',
          'low',
          'Quality parameter not supported in DALL-E 2',
          {
            description: 'Quality parameter is ignored for DALL-E 2',
            autoFixable: true,
            suggestions: [{
              type: 'fix',
              description: 'Remove quality parameter or upgrade to DALL-E 3'
            }]
          }
        ));
      }

      if (extractedParams.style && extractedParams.style !== 'vivid') {
        results.push(this.createValidationResult(
          'dalle2-style-not-supported',
          'warning',
          'low',
          'Style parameter not supported in DALL-E 2',
          {
            description: 'Style parameter is ignored for DALL-E 2',
            autoFixable: true,
            suggestions: [{
              type: 'fix',
              description: 'Remove style parameter or upgrade to DALL-E 3'
            }]
          }
        ));
      }
    }

    // Validate individual parameters
    graph.nodes.forEach(node => {
      if (node.data.parameters) {
        Object.entries(node.data.parameters).forEach(([key, value]) => {
          const paramSpec = capabilities.parameters.find(p => p.name === key);
          if (paramSpec) {
            const validation = this.validateParameter(key, value, paramSpec);
            if (validation) {
              results.push({
                ...validation,
                nodeId: node.id
              });
            }
          }
        });
      }
    });

    // Content policy checks (basic)
    const contentWarnings = this.checkContentPolicy(graph);
    results.push(...contentWarnings);

    return results;
  }

  protected async doTransform(graph: PromptGraph, options?: TransformOptions): Promise<TargetPrompt> {
    const transformations: TransformationLog[] = [];
    const capabilities = await this.capabilities();

    // Extract and normalize parameters
    const extractedParams = this.extractParameters(graph);
    const parameters: Record<string, any> = {};

    // Normalize parameters according to capabilities
    Object.entries(extractedParams).forEach(([key, value]) => {
      const paramSpec = capabilities.parameters.find(p => p.name === key);
      if (paramSpec) {
        parameters[key] = this.normalizeParameter(value, paramSpec);
      }
    });

    // Apply defaults for missing parameters
    capabilities.parameters.forEach(param => {
      if (param.default !== undefined && !(param.name in parameters)) {
        parameters[param.name] = param.default;
      }
    });

    // Process the graph to build prompt text
    const processedContent = await this.processGraph(graph, transformations);
    let promptText = processedContent.mainPrompt;

    // Apply DALL-E specific optimizations
    promptText = this.optimizeForDallE(promptText, parameters, transformations);

    // Ensure prompt length compliance
    if (promptText.length > capabilities.maxPromptLength!) {
      const truncated = promptText.substring(0, capabilities.maxPromptLength! - 3) + '...';
      transformations.push({
        step: 'truncate_prompt',
        action: 'Truncated prompt to fit length limit',
        details: {
          originalLength: promptText.length,
          truncatedLength: truncated.length,
          maxLength: capabilities.maxPromptLength
        }
      });
      promptText = truncated;
    }

    // Calculate quality score
    const validationResults = await this.doValidate(graph);
    const quality = this.calculateQualityScore(graph, capabilities, validationResults);

    const targetPrompt: TargetPrompt = {
      platform: this.platform,
      content: promptText,
      parameters,
      format: 'openai_dalle_prompt',
      metadata: {
        originalGraphId: graph.id,
        translationId: this.generateTranslationId(),
        timestamp: new Date(),
        adaptorVersion: this.version,
        quality,
        warnings: validationResults.filter(r => r.type === 'warning'),
        transformations,
        apiParameters: this.buildApiParameters(parameters)
      }
    };

    return targetPrompt;
  }

  /**
   * Process the graph to extract content and build prompt
   */
  private async processGraph(graph: PromptGraph, transformations: TransformationLog[]): Promise<{
    mainPrompt: string;
  }> {
    let mainPrompt = '';
    const processedElements: string[] = [];

    // Find output nodes first
    const outputNodes = graph.nodes.filter(node => node.type === 'output');
    
    if (outputNodes.length === 0) {
      // No output nodes - process all content nodes
      const contentNodes = graph.nodes.filter(node => 
        ['text', 'style', 'image'].includes(node.type) && 
        (node.data.content || node.data.description)
      );
      
      for (const node of contentNodes) {
        const content = await this.processNode(node, graph, transformations);
        if (content) {
          processedElements.push(content);
        }
      }
      
      transformations.push({
        step: 'process_all_content_nodes',
        action: 'Processed all content nodes as no output nodes found',
        details: { nodeCount: contentNodes.length }
      });
    } else {
      // Process output nodes
      for (const outputNode of outputNodes) {
        const content = await this.processNode(outputNode, graph, transformations);
        if (content) {
          processedElements.push(content);
        }
      }
    }

    // Join elements with natural language flow
    mainPrompt = processedElements.join('. ').trim();
    
    // Clean up formatting
    mainPrompt = mainPrompt
      .replace(/\.\s*\./g, '.') // Remove double periods
      .replace(/\s+/g, ' ') // Multiple spaces
      .trim();

    return { mainPrompt };
  }

  /**
   * Process a single node and its dependencies
   */
  private async processNode(
    node: PromptNode,
    graph: PromptGraph,
    transformations: TransformationLog[],
    visited: Set<string> = new Set()
  ): Promise<string> {
    if (visited.has(node.id)) {
      return '';
    }
    visited.add(node.id);

    let content = '';

    // Get input edges for this node
    const inputEdges = graph.edges.filter(edge => edge.target === node.id);
    
    if (inputEdges.length > 0) {
      // Process input nodes first
      const inputContents: string[] = [];
      for (const edge of inputEdges) {
        const sourceNode = graph.nodes.find(n => n.id === edge.source);
        if (sourceNode) {
          const sourceContent = await this.processNode(sourceNode, graph, transformations, visited);
          if (sourceContent) {
            inputContents.push(sourceContent);
          }
        }
      }
      content = inputContents.join(' ');
    }

    // Process current node content
    switch (node.type) {
      case 'text':
        const textContent = node.data.content || '';
        content = content ? `${content} ${textContent}` : textContent;
        break;
        
      case 'style':
        const styleContent = node.data.style || node.data.content || '';
        if (styleContent) {
          content = content ? `${content}, in ${styleContent} style` : `in ${styleContent} style`;
          transformations.push({
            step: 'process_style',
            sourceNodeId: node.id,
            action: 'Added style descriptor',
            details: { style: styleContent }
          });
        }
        break;
        
      case 'image':
        const imageDesc = node.data.description || node.data.content || '';
        if (imageDesc) {
          content = content ? `${content}, inspired by ${imageDesc}` : `inspired by ${imageDesc}`;
          transformations.push({
            step: 'process_image_reference',
            sourceNodeId: node.id,
            action: 'Added image inspiration',
            details: { description: imageDesc }
          });
        }
        break;
        
      case 'weighted':
        if (node.data.options && node.data.options.length > 0) {
          const selectedOption = this.selectWeightedOption(node.data.options);
          content = content ? `${content} ${selectedOption.text}` : selectedOption.text;
          transformations.push({
            step: 'process_weighted',
            sourceNodeId: node.id,
            action: 'Selected weighted option',
            details: { selectedIndex: selectedOption.index, weight: selectedOption.weight }
          });
        }
        break;
        
      case 'conditional':
        if (node.data.trueBranch) {
          content = content ? `${content} ${node.data.trueBranch}` : node.data.trueBranch;
          transformations.push({
            step: 'process_conditional',
            sourceNodeId: node.id,
            action: 'Selected true branch',
            details: { condition: node.data.condition }
          });
        }
        break;
        
      default:
        if (node.data.content) {
          content = content ? `${content} ${node.data.content}` : node.data.content;
        }
    }

    return content.trim();
  }

  /**
   * Optimize prompt for DALL-E
   */
  private optimizeForDallE(
    prompt: string,
    parameters: Record<string, any>,
    transformations: TransformationLog[]
  ): string {
    let optimized = prompt;

    // Add descriptive elements if prompt is too simple
    if (optimized.length < 50) {
      optimized = `A detailed image of ${optimized}`;
      transformations.push({
        step: 'enhance_simple_prompt',
        action: 'Enhanced short prompt with descriptive prefix',
        details: { originalLength: prompt.length }
      });
    }

    // Add quality descriptors for HD mode
    if (parameters.quality === 'hd') {
      const hasQualityDescriptors = /\b(detailed|sharp|clear|crisp|high.?quality|professional)\b/i.test(optimized);
      if (!hasQualityDescriptors) {
        optimized += ', highly detailed and sharp';
        transformations.push({
          step: 'add_hd_descriptors',
          action: 'Added quality descriptors for HD mode',
          details: { added: 'highly detailed and sharp' }
        });
      }
    }

    // Style-specific optimizations
    if (parameters.style === 'vivid') {
      const hasColorDescriptors = /\b(vibrant|bright|colorful|vivid|bold)\b/i.test(optimized);
      if (!hasColorDescriptors && optimized.length < 3500) {
        optimized += ', with vibrant colors';
        transformations.push({
          step: 'add_vivid_descriptors',
          action: 'Added color descriptors for vivid style',
          details: { added: 'with vibrant colors' }
        });
      }
    }

    return optimized.trim();
  }

  /**
   * Check for potential content policy issues
   */
  private checkContentPolicy(graph: PromptGraph): ValidationResult[] {
    const results: ValidationResult[] = [];
    const flaggedTerms = [
      'violent', 'gore', 'blood', 'weapon', 'gun', 'knife',
      'nude', 'naked', 'sexual', 'erotic', 'porn',
      'hate', 'racist', 'discriminatory'
    ];

    graph.nodes.forEach(node => {
      const content = (node.data.content || '').toLowerCase();
      const flaggedWords = flaggedTerms.filter(term => content.includes(term));
      
      if (flaggedWords.length > 0) {
        results.push(this.createValidationResult(
          `content-policy-${node.id}`,
          'warning',
          'high',
          'Potential content policy issue',
          {
            description: `Content may violate OpenAI policy. Flagged terms: ${flaggedWords.join(', ')}`,
            autoFixable: false,
            nodeId: node.id,
            suggestions: [{
              type: 'workaround',
              description: 'Review content for policy compliance before generation'
            }]
          }
        ));
      }
    });

    return results;
  }

  /**
   * Build API parameters for OpenAI DALL-E API
   */
  private buildApiParameters(parameters: Record<string, any>): Record<string, any> {
    const apiParams: Record<string, any> = {};

    // Map internal parameters to API parameters
    if (parameters.model) apiParams.model = parameters.model;
    if (parameters.size) apiParams.size = parameters.size;
    if (parameters.quality && parameters.model === 'dall-e-3') {
      apiParams.quality = parameters.quality;
    }
    if (parameters.style && parameters.model === 'dall-e-3') {
      apiParams.style = parameters.style;
    }
    if (parameters.n) {
      // DALL-E 3 only supports n=1
      apiParams.n = parameters.model === 'dall-e-3' ? 1 : parameters.n;
    }
    if (parameters.response_format) {
      apiParams.response_format = parameters.response_format;
    }

    return apiParams;
  }

  /**
   * Estimate prompt length
   */
  private estimatePromptLength(graph: PromptGraph): number {
    let totalLength = 0;

    graph.nodes.forEach(node => {
      if (node.data.content) totalLength += node.data.content.length;
      if (node.data.description) totalLength += node.data.description.length;
      if (node.data.style) totalLength += node.data.style.length;
    });

    return totalLength;
  }

  /**
   * Extract parameters from graph nodes
   */
  private extractParameters(graph: PromptGraph): Record<string, any> {
    const parameters: Record<string, any> = {};
    
    graph.nodes.forEach(node => {
      if (node.data.parameters) {
        Object.assign(parameters, node.data.parameters);
      }
    });
    
    return parameters;
  }

  /**
   * Select weighted option (simplified implementation)
   */
  private selectWeightedOption(options: any[]): { text: string; index: number; weight: number } {
    if (!options || options.length === 0) {
      return { text: '', index: -1, weight: 0 };
    }

    const selected = options[0];
    return {
      text: selected.text || selected.content || '',
      index: 0,
      weight: selected.weight || 1
    };
  }

  /**
   * Generate a unique translation ID
   */
  private generateTranslationId(): string {
    return `${this.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate parameter value against specification
   */
  private validateParameter(
    name: string,
    value: any,
    spec: ParameterSpec
  ): ValidationResult | null {
    if (spec.type === 'number') {
      if (typeof value !== 'number' || isNaN(value)) {
        return this.createValidationResult(
          `invalid-param-${name}`,
          'error',
          'medium',
          `Invalid number value for parameter "${name}"`,
          {
            description: `Expected number, got ${typeof value}`,
            autoFixable: true
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
            autoFixable: true
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
            autoFixable: true
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
            autoFixable: true
          }
        );
      }
    }
    
    return null;
  }

  /**
   * Normalize parameter value according to specification
   */
  private normalizeParameter(value: any, spec: ParameterSpec): any {
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
}