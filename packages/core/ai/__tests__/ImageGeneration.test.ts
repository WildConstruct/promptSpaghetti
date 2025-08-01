/**
 * Image Generation Integration Tests
 * Epic 35.1.2 - Text-to-Image Integration
 * 
 * Comprehensive test suite for image generation adapters and workflow nodes
 */
import { DALLEAdapter, MidjourneyAdapter, StableDiffusionAdapter, ImageProcessor } from '../index';
import { ImageGenerationNode, ImageVariationNode, ImageUpscaleNode, ImageEditNode } from '../../runtime/nodes/ImageGenerationNode';
import { AIModelStatus } from '../BaseAIModel';

// Mock fetch globally
global.fetch = jest.fn();
describe('Image Generation System', () => { let mockFetch: jest.MockedFunction<typeof fetch>;
  beforeEach(() => {
  mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  mockFetch.mockClear() });
  describe('DALL-E Adapter', () => { let dalleAdapter: DALLEAdapter;
  beforeEach(() => {
  dalleAdapter = new DALLEAdapter('test-dalle', {)
  apiKey: 'test-key' }
});
      // Mock OpenAI API responses
      mockFetch.mockImplementation((url: string | URL | Request) => { const urlString = url.toString();
        if (urlString.includes('/models')) {
          return Promise.resolve({)
  ok: true }
            json: () => Promise.resolve({ data: [{ id: 'dall-e-3' }] })
 as Response);
        if (urlString.includes('/images/generations')) { return Promise.resolve({)
  ok: true,
  json: () => Promise.resolve({),
  created: Date.now(),
  data: [{,
  url: 'https://example.com/generated-image.png',
  revised_prompt: 'A beautiful landscape with mountains' }
]

 as Response);
        return Promise.resolve({ )
  ok: true }
          json: () => Promise.resolve({})
 as Response);
      });
    });
    test('should initialize DALL-E adapter successfully', async () => { await dalleAdapter.initialize();
      expect(dalleAdapter.status).toBe(AIModelStatus.READY);
      expect(dalleAdapter.metadata.provider).toBe('openai');
      expect(dalleAdapter.metadata.type).toBe('image') });
    test('should generate image with DALL-E', async () => { await dalleAdapter.initialize();
  const result = await dalleAdapter.process('A beautiful sunset over mountains', {)
  size: '1024x1024',
  quality: 'standard',
  style: 'vivid' }
});
      expect(result.images).toHaveLength(1);
      expect(result.images[0].url).toBe('https://example.com/generated-image.png');
      expect(result.images[0].revisedPrompt).toBe('A beautiful landscape with mountains');
      expect(result.originalPrompt).toBe('A beautiful sunset over mountains');
      expect(result.usage.totalCost).toBeGreaterThan(0);
    });
    test('should estimate costs correctly', async () => { await dalleAdapter.initialize();
  const estimate = await dalleAdapter.estimate('Test prompt', {)
  size: '1024x1024',
  quality: 'hd',
  n: 1 }
});
      expect(estimate.estimatedCost).toBeGreaterThan(0);
      expect(estimate.currency).toBe('USD');
      expect(estimate.confidence).toBeGreaterThan(0.5);
    });
    test('should handle API errors gracefully', async () => { mockFetch.mockImplementation(() => 
        Promise.resolve({)
  ok: false,
          status: 401,
          statusText: 'Unauthorized' }
          json: () => Promise.resolve({ error: 'Invalid API key' })
 as Response)
      );
      await expect(dalleAdapter.initialize()).rejects.toThrow();
    });
  });
  describe('Midjourney Adapter', () => { let midjourneyAdapter: MidjourneyAdapter;
  beforeEach(() => {
  midjourneyAdapter = new MidjourneyAdapter('test-midjourney', {)
  serverUrl: 'http://localhost:8062' }
});
      // Mock Midjourney API responses
      mockFetch.mockImplementation((url: string | URL | Request) => { const urlString = url.toString();
        if (urlString.includes('/health')) {
          return Promise.resolve({)
  ok: true }
            json: () => Promise.resolve({ status: 'healthy' })
 as Response);
        if (urlString.includes('/generate')) { return Promise.resolve({)
  ok: true,
  json: () => Promise.resolve({),
  success: true,
  jobId: 'job-123',
  status: 'submitted' }

 as Response);
        if (urlString.includes('/job/job-123/status')) { return Promise.resolve({)
  ok: true,
  json: () => Promise.resolve({),
  jobId: 'job-123',
  status: 'completed',
  progress: 100,
  imageUrl: 'https://cdn.midjourney.com/generated.png',
  prompt: 'A cyberpunk cityscape --ar 16:9 --v 6' }

 as Response);
        return Promise.resolve({ )
  ok: true }
          json: () => Promise.resolve({})
 as Response);
      });
    });
    test('should initialize Midjourney adapter successfully', async () => { await midjourneyAdapter.initialize();
      expect(midjourneyAdapter.status).toBe(AIModelStatus.READY);
      expect(midjourneyAdapter.metadata.provider).toBe('midjourney') });
    test('should generate image with Midjourney', async () => { await midjourneyAdapter.initialize();
  const result = await midjourneyAdapter.process('A cyberpunk cityscape', {)
  aspectRatio: '16:9',
  version: 'v6',
  stylize: 250 }
});
      expect(result.jobId).toBe('job-123');
      expect(result.status).toBe('completed');
      expect(result.images).toHaveLength(1);
      expect(result.images[0].url).toBe('https://cdn.midjourney.com/generated.png');
      expect(result.metadata.aspectRatio).toBe('16:9');
      expect(result.metadata.stylize).toBe(250);
    });
    test('should handle prompt templating correctly', async () => { await midjourneyAdapter.initialize();
  const templater = (midjourneyAdapter as any).promptTemplater;
  const processedPrompt = templater.buildPrompt('A beautiful landscape', {)
  aspectRatio: '2:3',
  stylize: 500,
  chaos: 25,
  quality: 2 }
});
      expect(processedPrompt).toContain('--ar 2:3');
      expect(processedPrompt).toContain('--s 500');
      expect(processedPrompt).toContain('--c 25');
      expect(processedPrompt).toContain('--q 2');
    });
  });
  describe('Stable Diffusion Adapter', () => { let stableDiffusionAdapter: StableDiffusionAdapter;
  beforeEach(() => {
  stableDiffusionAdapter = new StableDiffusionAdapter('test-sd', {)
  endpoint: 'http://localhost:7860',
  apiType: 'automatic1111' }
});
      // Mock Automatic1111 API responses
      mockFetch.mockImplementation((url: string | URL | Request) => { const urlString = url.toString();
        if (urlString.includes('/sdapi/v1/options')) {
          return Promise.resolve({)
  ok: true }
            json: () => Promise.resolve({ sd_model_checkpoint: 'v1-5-pruned.ckpt' })
 as Response);
        if (urlString.includes('/sdapi/v1/sd-models')) { return Promise.resolve({)
  ok: true,
            json: () => Promise.resolve([) }
              { title: 'Stable Diffusion v1.5', filename: 'v1-5-pruned.ckpt' },
              { title: 'Stable Diffusion XL', filename: 'sdxl-base.ckpt' }
            ])
 as Response);
        if (urlString.includes('/sdapi/v1/samplers')) { return Promise.resolve({)
  ok: true,
            json: () => Promise.resolve([) }
              { name: 'Euler a' },
              { name: 'DPM++ 2M Karras' },
              { name: 'DDIM' }
            ])
 as Response);
        if (urlString.includes('/sdapi/v1/txt2img')) { return Promise.resolve({)
  ok: true,
  json: () => Promise.resolve({),
  images: ['iVBORw0KGgoAAAANS...'], // Base64 image data,
  parameters: {,
  prompt: 'A serene lake at sunset',
  steps: 20,
  cfg_scale: 7 }
},
  info: JSON.stringify({ seed: 12345 })

 as Response);
        return Promise.resolve({ )
  ok: true }
          json: () => Promise.resolve({})
 as Response);
      });
    });
    test('should initialize Stable Diffusion adapter successfully', async () => { await stableDiffusionAdapter.initialize();
      expect(stableDiffusionAdapter.status).toBe(AIModelStatus.READY);
      expect(stableDiffusionAdapter.metadata.provider).toBe('local') });
    test('should load available models and samplers', async () => { await stableDiffusionAdapter.initialize();
      const models = await stableDiffusionAdapter.getAvailableModels();
      const samplers = await stableDiffusionAdapter.getAvailableSamplers();
      expect(models).toHaveLength(2);
      expect(models[0].name).toBe('Stable Diffusion v1.5');
      expect(samplers).toContain('Euler a');
      expect(samplers).toContain('DPM++ 2M Karras') });
    test('should generate image with Stable Diffusion', async () => { await stableDiffusionAdapter.initialize();
  const result = await stableDiffusionAdapter.process('A serene lake at sunset', {)
  width: 512,
  height: 512,
  steps: 20,
  cfg_scale: 7,
  sampler_name: 'Euler a' }
});
      expect(result.images).toHaveLength(1);
      expect(result.images[0].base64).toBe('iVBORw0KGgoAAAANS...');
      expect(result.images[0].seed).toBe(12345);
      expect(result.originalPrompt).toBe('A serene lake at sunset');
      expect(result.generationTime).toBeGreaterThan(0);
    });
    test('should support img2img generation', async () => { await stableDiffusionAdapter.initialize();
  const result = await stableDiffusionAdapter.img2img(;);
  'data:image/png;base64,iVBORw0KGgo...',
  'Transform this into a cyberpunk scene',
  {
  denoising_strength: 0.7 }
  steps: 30);
  expect(result.images).toBeDefined();
  expect(result.originalPrompt).toBe('Transform this into a cyberpunk scene');
});
  });
  describe('Image Processing Utilities', () => { let imageProcessor: ImageProcessor;
  beforeEach(() => {
  imageProcessor = new ImageProcessor();
  // Mock canvas and image APIs
  global.HTMLCanvasElement = jest.fn().mockImplementation(() => ({)
  getContext: jest.fn().mockReturnValue({),
  drawImage: jest.fn(),
  getImageData: jest.fn().mockReturnValue({),
  data: new Uint8ClampedArray(64 * 64 * 4).fill(128) }
}),
          putImageData: jest.fn(),
          clearRect: jest.fn(),
          fillText: jest.fn(),
          strokeText: jest.fn(),
          measureText: jest.fn().mockReturnValue({ width: 100 })
        }),
        toDataURL: jest.fn().mockReturnValue('data:image/png;base64,iVBORw0KGgo...'),
        width: 512,
        height: 512;
  })) as any;
      global.Image = jest.fn().mockImplementation(() => ({ )
  onload: null,
  onerror: null,
  src: '',
  width: 512,
  height: 512,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn() }
})) as any;
    });
    test('should extract metadata from data URL', async () => { const testDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  const metadata = await imageProcessor.extractMetadata(testDataURL);
  expect(metadata.format).toBe('png');
  expect(metadata.size).toBeGreaterThan(0);
  expect(metadata.width).toBeDefined();
  expect(metadata.height).toBeDefined() });
    test('should convert image format', async () => { const testDataURL = 'data:image/png;base64,test';
  // Mock Image loading
  setTimeout(() => {
  const mockImage = new Image() as any;
  mockImage.onload() }, 0);
      const result = await imageProcessor.convertFormat(testDataURL, { )
  format: 'jpeg',
  quality: 80,
  width: 256,
  height: 256 }
});
      expect(result.data).toBeDefined();
      expect(result.metadata.format).toBe('jpeg');
      expect(result.metadata.width).toBe(256);
      expect(result.metadata.height).toBe(256);
    });
    test('should compress images', async () => { const testDataURL = 'data:image/png;base64,test';
  setTimeout(() => {
  const mockImage = new Image() as any;
  mockImage.onload() }, 0);
      const result = await imageProcessor.compress(testDataURL, 60, 'jpeg');
      expect(result.data).toBeDefined();
      expect(result.compressionRatio).toBeGreaterThan(0);
      expect(result.originalSize).toBeGreaterThan(0);
      expect(result.compressedSize).toBeGreaterThan(0);
    });
    test('should process image batches', async () => { const testImages = [
  'data:image/png;base64,test1' }
  'data:image/png;base64,test2'];
  // Mock Image loading for all images
  testImages.forEach((_, index) => { setTimeout(() => {
  const mockImage = new Image() as any;
  mockImage.onload() }, index * 10);
      });
      const results = await imageProcessor.processBatch(testImages, { )
  outputFormat: 'jpeg',
        quality: 80 }
        resize: { width: 256, height: 256 }
      });
      expect(results).toHaveLength(2);
      expect(results[0].processed).toBeDefined();
      expect(results[0].metadata).toBeDefined();
    });
    test('should compare image similarity', async () => { const image1 = 'data:image/png;base64,test1';
  const image2 = 'data:image/png;base64,test2';
  // Mock Image loading
  setTimeout(() => {
  const mockImage1 = new Image() as any;
  const mockImage2 = new Image() as any;
  mockImage1.onload();
  mockImage2.onload() }, 0);
      const comparison = await imageProcessor.compareImages(image1, image2);
      expect(comparison.similarity).toBeGreaterThanOrEqual(0);
      expect(comparison.similarity).toBeLessThanOrEqual(1);
      expect(comparison.differences.colorDifference).toBeDefined();
      expect(comparison.differences.structuralDifference).toBeDefined();
    });
  });
  describe('Image Generation Workflow Nodes', () => { test('should create and execute ImageGenerationNode', async () => {
  const node = new ImageGenerationNode('test-node', {)
  provider: 'dalle',
  apiKey: 'test-key' }
});
      // Mock the adapter initialization
      const mockAdapter = { initialize: jest.fn(),
        process: jest.fn().mockResolvedValue({),
  images: [{,
  url: 'https://example.com/generated.png' }
            metadata: { size: '1024x1024', model: 'dall-e-3' }
],
          usage: { totalCost: 0.04 }
        }),
        metadata: { name: 'dall-e-3' }
      };
      (node as any).adapters.set('dalle', mockAdapter);
      const inputs = { getString: jest.fn().mockImplementation((key, defaultValue) => {,
  const values: Record<string, string> = {
  prompt: 'A beautiful landscape'
  negative_prompt: ''
  style: 'vivid'
  quality: 'standard' }
};
          return values[key] || defaultValue || '';
        })
        getNumber: jest.fn().mockImplementation((key, defaultValue) => { const values: Record<string, number> = {
  width: 1024
  height: 1024
  seed: 12345 }
};
          return values[key] || defaultValue || 0;

      };
      const context = {} as any;
      const result = await node.executeAdvanced(inputs as any, context);
      expect(result.outputs.images).toHaveLength(1);
      expect(result.outputs.cost).toBe(0.04);
      expect(result.outputs.metadata).toBeDefined();
    });
    test('should validate image generation inputs', async () => { const node = new ImageGenerationNode('test-node', {)
  provider: 'dalle'
  apiKey: 'test-key' }
});
      const validInputs = { prompt: 'A beautiful sunset'
  width: 1024
  height: 1024
  seed: 12345 }
};
      const invalidInputs = { prompt: '', // Empty prompt
  width: 5000, // Too large
  height: -100, // Negative
  seed: -1 // Negative seed }
};
      const validErrors = await node.validateInputs(validInputs);
      const invalidErrors = await node.validateInputs(invalidInputs);
      expect(validErrors).toHaveLength(0);
      expect(invalidErrors.length).toBeGreaterThan(0);
      expect(invalidErrors.some(error => error.includes('Prompt'))).toBe(true);
      expect(invalidErrors.some(error => error.includes('Width'))).toBe(true);
    });
    test('should create and execute ImageVariationNode', async () => { const node = new ImageVariationNode('test-variation', {)
  provider: 'dalle'
  apiKey: 'test-key' }
});
      const inputs = { getString: jest.fn().mockImplementation((key, defaultValue) => {
  const values: Record<string, string> = {
  source_image: 'https://example.com/source.png'
  variation_prompt: 'Make it more colorful' }
};
          return values[key] || defaultValue || '';
        })
        getNumber: jest.fn().mockImplementation((key, defaultValue) => { const values: Record<string, number> = {
  strength: 0.75
  count: 2 }
};
          return values[key] || defaultValue || 0;

      };
      const context = {} as any;
      const result = await node.executeAdvanced(inputs as any, context);
      expect(result.outputs.variations).toHaveLength(2);
      expect(result.outputs.metadata).toBeDefined();
    });
    test('should create and execute ImageUpscaleNode', async () => { const node = new ImageUpscaleNode('test-upscale');
  const inputs = {
  getString: jest.fn().mockImplementation((key, defaultValue) => {
  const values: Record<string, string> = {
  image: 'https://example.com/small.png'
  method: 'esrgan' }
};
          return values[key] || defaultValue || '';
        })
        getNumber: jest.fn().mockImplementation((key, defaultValue) => { const values: Record<string, number> = {
  scale_factor: 2 }
};
          return values[key] || defaultValue || 0;

      };
      const context = {} as any;
      const result = await node.executeAdvanced(inputs as any, context);
      expect(result.outputs.upscaled_image).toBeDefined();
      expect(result.outputs.metadata.scaleFactor).toBe(2);
    });
  });
  describe('Error Handling and Edge Cases', () => { test('should handle network timeouts gracefully', async () => {
  const adapter = new DALLEAdapter('timeout-test', {)
  apiKey: 'test-key'
  timeout: 100 // Very short timeout }
});
      mockFetch.mockImplementation(() => 
        new Promise((resolve) => { setTimeout(() => resolve({)
  ok: true }
            json: () => Promise.resolve({})
 as Response), 200); // Longer than timeout
  }
      );
      await expect(adapter.initialize()).rejects.toThrow();
    });
    test('should handle invalid image data', async () => { const processor = new ImageProcessor();
      await expect()
        processor.extractMetadata('invalid-data')
      ).rejects.toThrow() });
    test('should validate configuration parameters', () => {
      // Test invalid DALL-E configuration
      expect(() => {
        new DALLEAdapter('invalid', { apiKey: '' });
      }).not.toThrow(); // Constructor shouldn't throw, initialization should
      // Test invalid Stable Diffusion configuration
      expect(() => { new StableDiffusionAdapter('invalid', {)
  endpoint: ''
  apiType: 'automatic1111' }
});
      }).not.toThrow(); // Constructor shouldn't throw, initialization should
    });
  });
});