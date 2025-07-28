/**
 * Image Generation Workflow Nodes
 * Epic 35.1.2 - Text-to-Image Integration
 * 
 * Workflow nodes for image generation and processing
 */
import { AdvancedRuntimeNode, AdvancedExecutionContext, NodeExecutionResult } from '../advanced';
import { IOSpecBuilder, TypedInputs } from '../io-system';
import { AIModelFactory, DALLEAdapter, MidjourneyAdapter, StableDiffusionAdapter } from '../../ai';

export interface ImageGenerationConfig {
  provider: 'dalle' | 'midjourney' | 'stable-diffusion';
  model?: string;
  apiKey?: string;
  endpoint?: string;
  defaultParameters?: Record<string, any>;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  model: string;
  provider: string;
  generationTime: number;
  cost: number;
  seed?: number;
  prompt: string;
  negativePrompt?: string;
}

export interface GeneratedImage {
  url?: string;
  base64?: string;
  metadata: ImageMetadata;
}

export class ImageGenerationNode extends AdvancedRuntimeNode {
  private modelFactory: AIModelFactory;
  private adapters: Map<string, any> = new Map();
  constructor(nodeId: string, config: ImageGenerationConfig) {
    const ioSpec = new IOSpecBuilder();
      .input('prompt', 'string', 'Image description prompt')
      .input('negative_prompt', 'string', 'Negative prompt (optional)', { required: false })
      .input('width', 'number', 'Image width', { required: false, default: 1024 })
      .input('height', 'number', 'Image height', { required: false, default: 1024 })
      .input('style', 'string', 'Image style', { required: false })
      .input('quality', 'string', 'Image quality', { required: false, default: 'standard' })
      .input('seed', 'number', 'Random seed', { required: false })
      .output('images', 'array', 'Generated images')
      .output('metadata', 'object', 'Generation metadata')
      .output('cost', 'number', 'Generation cost')
      .build();
    super(nodeId, 'image_generation', ioSpec);
    this.modelFactory = new AIModelFactory();
    this._initializeAdapter(config);
  }
  async executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult> {
    try {
      const prompt = inputs.getString('prompt');
      const negativePrompt = inputs.getString('negative_prompt', '');
      const width = inputs.getNumber('width', 1024);
      const height = inputs.getNumber('height', 1024);
      const style = inputs.getString('style', '');
      const quality = inputs.getString('quality', 'standard');
      const seed = inputs.getNumber('seed');
      // Validate inputs
      if (!prompt) {
        throw new Error('Prompt is required for image generation');
      }
      const provider = this._getConfiguredProvider();
      const adapter = this.adapters.get(provider);
      if (!adapter) {
        throw new Error(`No adapter configured for provider: ${provider}`);}
      }
      // Prepare generation options based on provider
      const options = this._buildGenerationOptions(provider, {)
        prompt,
        negativePrompt,
        width,
        height,
        style,
        quality,
        seed
      });
      // Generate images
      const startTime = Date.now();
      const result = await adapter.process(prompt, options);
      const generationTime = Date.now() - startTime;
      // Process results
      const images: GeneratedImage[] = result.images.map((img: unknown) => ({)
        url: img.url,
        base64: img.base64,
        metadata: {,
          width: img.metadata?.size?.split('x')[0] || width,
          height: img.metadata?.size?.split('x')[1] || height,
          format: 'png',
          model: img.metadata?.model || adapter.metadata.name,
          provider,
          generationTime,
          cost: result.usage?.totalCost || result.usage?.estimatedCost || 0,
          seed: img.seed || seed,
          prompt,
          negativePrompt: negativePrompt || undefined
        }
      }));
      const totalCost = images.reduce((sum, img) => sum + img.metadata.cost, 0);
      const metadata = {
        provider,
        model: adapter.metadata.name,
        generationTime,
        imageCount: images.length,
        totalCost,
        parameters: options,
      };
      return {
        outputs: {,
          images,
          metadata,
          cost: totalCost,
        },
        executionTime: generationTime,
        tokensUsed: { input: 0, output: 0 },
        cost: totalCost,
      };
    } catch (error) {
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);}
    }
  }
  async validateInputs(inputs: Record<string, any>): Promise<string[]> {
    const errors: string[] = [];
    if (!inputs.prompt || typeof inputs.prompt !== 'string') {
      errors.push('Prompt must be a non-empty string');
    }
    if (inputs.width && (typeof inputs.width !== 'number' || inputs.width < 64 || inputs.width > 2048)) {
      errors.push('Width must be a number between 64 and 2048');
    }
    if (inputs.height && (typeof inputs.height !== 'number' || inputs.height < 64 || inputs.height > 2048)) {
      errors.push('Height must be a number between 64 and 2048');
    }
    if (inputs.seed && (typeof inputs.seed !== 'number' || inputs.seed < 0)) {
      errors.push('Seed must be a positive number');
    }
    return errors;
  }
  private async _initializeAdapter(config: ImageGenerationConfig): Promise<void> {
    try {
      let adapter: unknown;
      switch (config.provider) {
        case 'dalle':
          adapter = new DALLEAdapter()
            `dalle-${this.nodeId}`,}
            {
              apiKey: config.apiKey || '',
              baseURL: config.endpoint,
            },
            config.model || 'dall-e-3'
          );
          break;
        case 'midjourney':
          adapter = new MidjourneyAdapter()
            `midjourney-${this.nodeId}`,}
            {
              serverUrl: config.endpoint || 'http://localhost:8062',
              apiKey: config.apiKey,
            }
          );
          break;
        case 'stable-diffusion':
          adapter = new StableDiffusionAdapter()
            `sd-${this.nodeId}`,}
            {
              endpoint: config.endpoint || 'http://localhost:7860',
              apiType: 'automatic1111',
              apiKey: config.apiKey,
            }
          );
          break;
        default:
          throw new Error(`Unsupported image generation provider: ${config.provider}`);}
      }
      await adapter.initialize();
      this.adapters.set(config.provider, adapter);
    } catch (error) {
      console.warn(`Failed to initialize ${config.provider} adapter:`, error);}
    }
  }
  private _getConfiguredProvider(): string {
    return Array.from(this.adapters.keys())[0] || 'dalle';
  }
  private _buildGenerationOptions(provider: string, params: unknown): unknown {
    const { prompt, negativePrompt, width, height, style, quality, seed } = params;
    switch (provider) {
      case 'dalle':
        return {
          size: `${width}x${height}`,}
          quality: quality === 'hd' ? 'hd' : 'standard',
          style: style === 'natural' ? 'natural' : 'vivid',
          ...(seed && { seed })
        };
      case 'midjourney':
        return {
          aspectRatio: this._calculateAspectRatio(width, height),
          quality: quality === 'hd' ? 2 : 1,
          stylize: style ? this._mapStyleToStylize(style) : 100,
          ...(seed && { seed })
        };
      case 'stable-diffusion':
        return {
          width,
          height,
          negative_prompt: negativePrompt,
          quality: quality === 'hd' ? 'hd' : 'standard',
          ...(seed && { seed }),
          ...(style && { style_preset: style })
        };
      default:
        return params;
    }
  }
  private _calculateAspectRatio(width: number, height: number): string {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const aspectWidth = width / divisor;
    const aspectHeight = height / divisor;
    // Map to common aspect ratios
    const ratio = `${aspectWidth}:${aspectHeight}`;}
    const commonRatios = ['1:1', '2:3', '3:2', '4:5', '5:4', '9:16', '16:9'];
    if (commonRatios.includes(ratio)) {
      return ratio;
    }
    // Default to closest common ratio
    return width >= height ? '3:2' : '2:3';
  }
  private _mapStyleToStylize(style: string): number {
    const styleMap: Record<string, number> = {
      'minimal': 50,
      'natural': 100,
      'artistic': 250,
      'dramatic': 500,
      'experimental': 750
    };
    return styleMap[style.toLowerCase()] || 100;
  }
}

export class ImageVariationNode extends AdvancedRuntimeNode {
  private modelFactory: AIModelFactory;
  constructor(nodeId: string, config: ImageGenerationConfig) {
    const ioSpec = new IOSpecBuilder();
      .input('source_image', 'string', 'Source image URL or base64')
      .input('variation_prompt', 'string', 'Variation description', { required: false })
      .input('strength', 'number', 'Variation strength (0-1)', { required: false, default: 0.75 })
      .input('count', 'number', 'Number of variations', { required: false, default: 1 })
      .output('variations', 'array', 'Generated variations')
      .output('metadata', 'object', 'Generation metadata')
      .build();
    super(nodeId, 'image_variation', ioSpec);
    this.modelFactory = new AIModelFactory();
  }
  async executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult> {
    try {
      const sourceImage = inputs.getString('source_image');
      const variationPrompt = inputs.getString('variation_prompt', '');
      const strength = inputs.getNumber('strength', 0.75);
      const count = inputs.getNumber('count', 1);
      if (!sourceImage) {
        throw new Error('Source image is required for variations');
      }
      // For now, use DALL-E 2 for variations (DALL-E 3 doesn't support variations)
      // In the future, could use Stable Diffusion img2img or other providers
      const variations: unknown[] = [];
      for (let i = 0; i < count; i++) {
        // Simulate variation generation
        variations.push({)
          url: sourceImage, // Placeholder - would be actual variation
          metadata: {,
            sourceImage,
            variationPrompt,
            strength,
            index: i,
          }
        });
      }
      return {
        outputs: {,
          variations,
          metadata: {,
            sourceImage,
            variationPrompt,
            strength,
            count: variations.length,
          }
        },
        executionTime: 5000,
        tokensUsed: { input: 0, output: 0 },
        cost: 0.02 * count
      };
    } catch (error) {
      throw new Error(`Image variation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);}
    }
  }
  async validateInputs(inputs: Record<string, any>): Promise<string[]> {
    const errors: string[] = [];
    if (!inputs.source_image || typeof inputs.source_image !== 'string') {
      errors.push('Source image must be provided as URL or base64 string');
    }
    if (inputs.strength && (typeof inputs.strength !== 'number' || inputs.strength < 0 || inputs.strength > 1)) {
      errors.push('Strength must be a number between 0 and 1');
    }
    if (inputs.count && (typeof inputs.count !== 'number' || inputs.count < 1 || inputs.count > 10)) {
      errors.push('Count must be a number between 1 and 10');
    }
    return errors;
  }
}

export class ImageUpscaleNode extends AdvancedRuntimeNode {
  constructor(nodeId: string, config: Record<string, any> = {}) {
    const ioSpec = new IOSpecBuilder();
      .input('image', 'string', 'Image to upscale (URL or base64)')
      .input('scale_factor', 'number', 'Scale factor (2-4)', { required: false, default: 2 })
      .input('method', 'string', 'Upscaling method', { required: false, default: 'esrgan' })
      .output('upscaled_image', 'string', 'Upscaled image')
      .output('metadata', 'object', 'Upscaling metadata')
      .build();
    super(nodeId, 'image_upscale', ioSpec);
  }
  async executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult> {
    try {
      const image = inputs.getString('image');
      const scaleFactor = inputs.getNumber('scale_factor', 2);
      const method = inputs.getString('method', 'esrgan');
      if (!image) {
        throw new Error('Image is required for upscaling');
      }
      // Simulate upscaling process
      const upscaledImage = image; // Placeholder - would be actual upscaled image;
      const metadata = {
        originalImage: image,
        scaleFactor,
        method,
        processedAt: new Date()
      };
      return {
        outputs: {,
          upscaled_image: upscaledImage,
          metadata
        },
        executionTime: 8000,
        tokensUsed: { input: 0, output: 0 },
        cost: 0.01 * scaleFactor
      };
    } catch (error) {
      throw new Error(`Image upscaling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);}
    }
  }
  async validateInputs(inputs: Record<string, any>): Promise<string[]> {
    const errors: string[] = [];
    if (!inputs.image || typeof inputs.image !== 'string') {
      errors.push('Image must be provided as URL or base64 string');
    }
    if (inputs.scale_factor && (typeof inputs.scale_factor !== 'number' || inputs.scale_factor < 1 || inputs.scale_factor > 8)) {
      errors.push('Scale factor must be a number between 1 and 8');
    }
    return errors;
  }
}

export class ImageEditNode extends AdvancedRuntimeNode {
  constructor(nodeId: string, config: Record<string, any> = {}) {
    const ioSpec = new IOSpecBuilder();
      .input('image', 'string', 'Source image to edit')
      .input('mask', 'string', 'Edit mask (optional)', { required: false })
      .input('edit_prompt', 'string', 'Description of desired edit')
      .input('strength', 'number', 'Edit strength (0-1)', { required: false, default: 0.8 })
      .output('edited_image', 'string', 'Edited image')
      .output('metadata', 'object', 'Edit metadata')
      .build();
    super(nodeId, 'image_edit', ioSpec);
  }
  async executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult> {
    try {
      const image = inputs.getString('image');
      const mask = inputs.getString('mask', '');
      const editPrompt = inputs.getString('edit_prompt');
      const strength = inputs.getNumber('strength', 0.8);
      if (!image || !editPrompt) {
        throw new Error('Image and edit prompt are required');
      }
      // Simulate image editing process
      const editedImage = image; // Placeholder - would be actual edited image;
      const metadata = {
        originalImage: image,
        mask,
        editPrompt,
        strength,
        processedAt: new Date()
      };
      return {
        outputs: {,
          edited_image: editedImage,
          metadata
        },
        executionTime: 15000,
        tokensUsed: { input: 0, output: 0 },
        cost: 0.04,
      };
    } catch (error) {
      throw new Error(`Image editing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);}
    }
  }
  async validateInputs(inputs: Record<string, any>): Promise<string[]> {
    const errors: string[] = [];
    if (!inputs.image || typeof inputs.image !== 'string') {
      errors.push('Source image must be provided as URL or base64 string');
    }
    if (!inputs.edit_prompt || typeof inputs.edit_prompt !== 'string') {
      errors.push('Edit prompt must be a non-empty string');
    }
    if (inputs.strength && (typeof inputs.strength !== 'number' || inputs.strength < 0 || inputs.strength > 1)) {
      errors.push('Strength must be a number between 0 and 1');
    }
    return errors;
  }
}