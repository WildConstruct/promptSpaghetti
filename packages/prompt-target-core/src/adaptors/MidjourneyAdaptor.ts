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
 * Midjourney adaptor for text-to-image prompt translation
 * Supports Midjourney v6 syntax and parameters
 */
export class MidjourneyAdaptor extends BaseAdaptor {
  private readonly supportedAspectRatios = [
    '1:1', '2:3', '3:2', '4:5', '5:4', '16:9', '9:16'
  ];

  private readonly supportedVersions = [
    'v6', 'v5.2', 'v5.1', 'v5', 'v4'
  ];

  constructor(context: PluginContext) {
    super(
      'midjourney',
      '1.0.0',
      'midjourney',
      'Midjourney Image Generator',
      'Adaptor for Midjourney text-to-image generation',
      context
    );
  }

  async capabilities(): Promise<Capabilities> {
    return {
      supportedNodeTypes: [
        'text',
        'image', // For image references/descriptions
        'style',
        'conditional',
        'weighted',
        'concat',
        'output'
      ],
      parameters: [
        {
          name: 'aspect_ratio',
          type: 'enum',
          required: false,
          default: '1:1',
          options: this.supportedAspectRatios,
          description: 'Image aspect ratio (e.g., 16:9, 4:3)'
        },
        {
          name: 'stylize',
          type: 'number',
          required: false,
          default: 100,
          min: 0,
          max: 1000,
          description: 'Stylization level (0-1000, default 100)'
        },
        {
          name: 'quality',
          type: 'number',
          required: false,
          default: 1,
          min: 0.25,
          max: 2,
          description: 'Image quality (0.25, 0.5, 1, 2)'
        },
        {
          name: 'chaos',
          type: 'number',
          required: false,
          default: 0,
          min: 0,
          max: 100,
          description: 'Variation amount (0-100)'
        },
        {
          name: 'version',
          type: 'enum',
          required: false,
          default: 'v6',
          options: this.supportedVersions,
          description: 'Midjourney version to use'
        },
        {
          name: 'weird',
          type: 'number',
          required: false,
          min: 0,
          max: 3000,
          description: 'Weirdness level (0-3000, v6 only)'
        },
        {
          name: 'tile',
          type: 'boolean',
          required: false,
          default: false,
          description: 'Generate tileable images'
        }
      ],
      limitations: [
        {
          type: 'prompt_length',
          description: 'Maximum prompt length ~6000 characters',
          severity: 'warning',
          impact: 'Long prompts may be truncated'
        },
        {
          type: 'feature',
          description: 'No direct text generation support',
          severity: 'error',
          impact: 'Text-only nodes will be converted to image descriptions'
        },
        {
          type: 'parameter',
          description: 'Some parameters are version-specific',
          severity: 'info',
          impact: 'Parameters may be ignored on older versions'
        }
      ],
      features: [
        {
          name: 'aspect_ratios',
          supported: true,
          description: 'Supports custom aspect ratios'
        },
        {
          name: 'stylization',
          supported: true,
          description: 'Adjustable stylization levels'
        },
        {
          name: 'variations',
          supported: true,
          description: 'Generate variations with chaos parameter'
        },
        {
          name: 'image_references',
          supported: true,
          description: 'Use image URLs as references'
        },
        {
          name: 'style_references',
          supported: true,
          description: 'Use style reference images'
        },
        {
          name: 'blend_mode',
          supported: false,
          description: 'Blend mode not supported in this adaptor version',
          alternatives: ['Use image references for similar effects']
        }
      ],
      maxNodes: 20,
      maxPromptLength: 6000,
      supportedFormats: ['midjourney_prompt']
    };
  }

  protected async doValidate(graph: PromptGraph): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const capabilities = await this.capabilities();

    // Check for pure text nodes (should have image context)
    const textOnlyNodes = graph.nodes.filter(node => 
      node.type === 'text' && 
      !this.hasImageContext(node, graph)
    );

    if (textOnlyNodes.length === graph.nodes.length && textOnlyNodes.length > 0) {
      results.push(this.createValidationResult(
        'text-only-graph',
        'warning',
        'medium',
        'Graph contains only text nodes',
        {
          description: 'Midjourney works best with visual descriptions. Consider adding style or image context.',
          autoFixable: true,
          suggestions: [{
            type: 'workaround',
            description: 'Add visual descriptors or style keywords to improve image generation'
          }]
        }
      ));
    }

    // Check prompt length
    const estimatedPromptLength = this.estimatePromptLength(graph);
    if (estimatedPromptLength > capabilities.maxPromptLength!) {
      results.push(this.createValidationResult(
        'prompt-too-long',
        'warning',
        'high',
        'Prompt may be too long',
        {
          description: `Estimated length ${estimatedPromptLength} exceeds recommended ${capabilities.maxPromptLength}`,
          autoFixable: false,
          suggestions: [{
            type: 'fix',
            description: 'Simplify prompt or split into multiple generations'
          }]
        }
      ));
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
                nodeId: node.id
              });
            }
          }
        });
      }
    });

    // Check for conflicting parameters
    const versionParams = this.extractVersionSpecificParams(graph);
    if (versionParams.conflicts.length > 0) {
      versionParams.conflicts.forEach(conflict => {
        results.push(this.createValidationResult(
          `version-conflict-${conflict.param}`,
          'warning',
          'medium',
          'Version-specific parameter conflict',
          {
            description: `Parameter "${conflict.param}" is not supported in version ${conflict.version}`,
            autoFixable: true,
            suggestions: [{
              type: 'fix',
              description: `Remove parameter or upgrade to compatible version`
            }]
          }
        ));
      });
    }

    return results;
  }

  protected async doTransform(graph: PromptGraph, options?: TransformOptions): Promise<TargetPrompt> {
    const transformations: TransformationLog[] = [];
    const capabilities = await this.capabilities();

    // Build the Midjourney prompt
    let promptText = '';
    const parameters: Record<string, any> = {};

    // Process the graph to build prompt text
    const processedContent = await this.processGraph(graph, transformations);
    promptText = processedContent.mainPrompt;

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

    // Build parameter string for Midjourney
    const paramString = this.buildParameterString(parameters, transformations);
    
    // Combine prompt text with parameters
    const finalPrompt = `${promptText}${paramString}`.trim();

    // Calculate quality score
    const validationResults = await this.doValidate(graph);
    const quality = this.calculateQualityScore(graph, capabilities, validationResults);

    const targetPrompt: TargetPrompt = {
      platform: this.platform,
      content: finalPrompt,
      parameters,
      format: 'midjourney_prompt',
      metadata: {
        originalGraphId: graph.id,
        translationId: this.generateTranslationId(),
        timestamp: new Date(),
        adaptorVersion: this.version,
        quality,
        warnings: validationResults.filter(r => r.type === 'warning'),
        transformations
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

    // Join elements with appropriate separators
    mainPrompt = processedElements.join(', ').trim();

    // Enhance with Midjourney-specific optimizations
    mainPrompt = this.optimizeForMidjourney(mainPrompt, transformations);

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
          // Add style modifiers
          content = content ? `${content}, ${styleContent}` : styleContent;
          transformations.push({
            step: 'process_style',
            sourceNodeId: node.id,
            action: 'Added style modifiers',
            details: { style: styleContent }
          });
        }
        break;
        
      case 'image':
        const imageRef = node.data.url || node.data.content;
        const imageDesc = node.data.description || node.data.alt || '';
        
        if (imageRef && imageRef.startsWith('http')) {
          // Image URL reference
          content = content ? `${content} ${imageRef}` : imageRef;
          transformations.push({
            step: 'process_image_reference',
            sourceNodeId: node.id,
            action: 'Added image URL reference',
            details: { url: imageRef }
          });
        } else if (imageDesc) {
          // Image description
          content = content ? `${content}, ${imageDesc}` : imageDesc;
          transformations.push({
            step: 'process_image_description',
            sourceNodeId: node.id,
            action: 'Added image description',
            details: { description: imageDesc }
          });
        }
        break;
        
      case 'concat':
        // Content already processed from inputs
        transformations.push({
          step: 'process_concat',
          sourceNodeId: node.id,
          action: 'Concatenated input nodes'
        });
        break;
        
      case 'weighted':
        // Select based on weights (simplified - could be enhanced)
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
        // For simplicity, take the 'true' branch (could be enhanced with condition evaluation)
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
        
      case 'output':
        // Content already processed from inputs
        transformations.push({
          step: 'process_output',
          sourceNodeId: node.id,
          action: 'Processed output node'
        });
        break;
        
      default:
        // For unsupported node types, try to extract any text content
        if (node.data.content) {
          content = content ? `${content} ${node.data.content}` : node.data.content;
          transformations.push({
            step: 'process_fallback',
            sourceNodeId: node.id,
            action: `Processed unsupported node type: ${node.type}`,
            details: { nodeType: node.type }
          });
        }
    }

    return content.trim();
  }

  /**
   * Build parameter string for Midjourney format
   */
  private buildParameterString(
    parameters: Record<string, any>,
    transformations: TransformationLog[]
  ): string {
    const paramParts: string[] = [];

    // Aspect ratio
    if (parameters.aspect_ratio && parameters.aspect_ratio !== '1:1') {
      paramParts.push(`--ar ${parameters.aspect_ratio}`);
    }

    // Stylize
    if (parameters.stylize && parameters.stylize !== 100) {
      paramParts.push(`--s ${parameters.stylize}`);
    }

    // Quality
    if (parameters.quality && parameters.quality !== 1) {
      paramParts.push(`--q ${parameters.quality}`);
    }

    // Chaos
    if (parameters.chaos && parameters.chaos > 0) {
      paramParts.push(`--c ${parameters.chaos}`);
    }

    // Version
    if (parameters.version && parameters.version !== 'v6') {
      paramParts.push(`--${parameters.version}`);
    }

    // Weird (v6 only)
    if (parameters.weird && parameters.weird > 0) {
      if (parameters.version === 'v6' || !parameters.version) {
        paramParts.push(`--weird ${parameters.weird}`);
      } else {
        transformations.push({
          step: 'skip_incompatible_param',
          action: 'Skipped --weird parameter (not supported in selected version)',
          details: { version: parameters.version }
        });
      }
    }

    // Tile
    if (parameters.tile) {
      paramParts.push('--tile');
    }

    return paramParts.length > 0 ? ` ${paramParts.join(' ')}` : '';
  }

  /**
   * Optimize prompt text for Midjourney
   */
  private optimizeForMidjourney(prompt: string, transformations: TransformationLog[]): string {
    let optimized = prompt;

    // Add common quality modifiers if not present
    const qualityKeywords = [
      'highly detailed', 'professional', 'masterpiece', '8k', '4k',
      'photorealistic', 'cinematic', 'studio lighting'
    ];

    const hasQualityModifiers = qualityKeywords.some(keyword => 
      optimized.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!hasQualityModifiers && optimized.length < 4000) {
      optimized += ', highly detailed, professional quality';
      transformations.push({
        step: 'add_quality_modifiers',
        action: 'Added default quality modifiers',
        details: { added: 'highly detailed, professional quality' }
      });
    }

    // Clean up common issues
    optimized = optimized
      .replace(/\s+/g, ' ') // Multiple spaces
      .replace(/,\s*,/g, ',') // Double commas
      .replace(/^\s*,\s*/, '') // Leading comma
      .replace(/\s*,\s*$/, '') // Trailing comma
      .trim();

    return optimized;
  }

  /**
   * Check if node has image context
   */
  private hasImageContext(node: PromptNode, graph: PromptGraph): boolean {
    // Check if the text contains visual descriptors
    const visualKeywords = [
      'image', 'photo', 'picture', 'art', 'painting', 'drawing', 'sketch',
      'render', 'illustration', 'design', 'style', 'color', 'lighting',
      'composition', 'visual', 'aesthetic', 'cinematic', 'landscape',
      'portrait', 'character', 'scene', 'environment', 'background'
    ];

    const content = (node.data.content || '').toLowerCase();
    const hasVisualWords = visualKeywords.some(keyword => content.includes(keyword));

    if (hasVisualWords) return true;

    // Check if connected to style or image nodes
    const connectedEdges = graph.edges.filter(edge => 
      edge.source === node.id || edge.target === node.id
    );

    for (const edge of connectedEdges) {
      const otherNodeId = edge.source === node.id ? edge.target : edge.source;
      const otherNode = graph.nodes.find(n => n.id === otherNodeId);
      if (otherNode && ['style', 'image'].includes(otherNode.type)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Estimate final prompt length
   */
  private estimatePromptLength(graph: PromptGraph): number {
    let totalLength = 0;

    graph.nodes.forEach(node => {
      if (node.data.content) {
        totalLength += node.data.content.length;
      }
      if (node.data.description) {
        totalLength += node.data.description.length;
      }
      if (node.data.style) {
        totalLength += node.data.style.length;
      }
    });

    // Add estimated parameter length
    totalLength += 100; // Rough estimate for parameters

    return totalLength;
  }

  /**
   * Extract version-specific parameter conflicts
   */
  private extractVersionSpecificParams(graph: PromptGraph): {
    version: string;
    conflicts: Array<{ param: string; version: string }>;
  } {
    const extractedParams = this.extractParameters(graph);
    const version = extractedParams.version || 'v6';
    const conflicts: Array<{ param: string; version: string }> = [];

    // Check for version-specific conflicts
    if (version !== 'v6' && extractedParams.weird) {
      conflicts.push({ param: 'weird', version });
    }

    return { version, conflicts };
  }

  /**
   * Select weighted option (simplified implementation)
   */
  private selectWeightedOption(options: any[]): { text: string; index: number; weight: number } {
    if (!options || options.length === 0) {
      return { text: '', index: -1, weight: 0 };
    }

    // For now, just select the first option
    // Could be enhanced with actual weighted random selection
    const selected = options[0];
    return {
      text: selected.text || selected.content || '',
      index: 0,
      weight: selected.weight || 1
    };
  }

  /**
   * Validate a parameter value against its specification
   */
  private validateParameter(
    name: string,
    value: any,
    spec: ParameterSpec
  ): ValidationResult | null {
    // Implement parameter validation logic
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
   * Normalize parameter value according to its specification
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
   * Generate a unique translation ID
   */
  private generateTranslationId(): string {
    return `${this.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}