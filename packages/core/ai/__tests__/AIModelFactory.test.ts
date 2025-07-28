/**
 * AI Model Factory Tests
 * Epic 35.1.1 - Multi-Model Infrastructure
 * 
 * Comprehensive test suite for the AI model factory and adapters
 */
import { AIModelFactory, FactoryConfig, ModelRegistration } from '../AIModelFactory';
import { BaseAIModel, AIModelType, AIModelProvider, ModelConfiguration, AIModelStatus } from '../BaseAIModel';
import OpenAIAdapter from '../adapters/OpenAIAdapter';
import AnthropicAdapter from '../adapters/AnthropicAdapter';
import LocalModelAdapter from '../adapters/LocalModelAdapter';
import GenericHTTPAdapter from '../adapters/GenericHTTPAdapter';

// Mock fetch globally
global.fetch = jest.fn();
describe('AIModelFactory', () => {
  let factory: AIModelFactory;
  let mockFetch: jest.MockedFunction<typeof fetch>;
  beforeEach(() => {
    factory = new AIModelFactory();
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();
  });
  afterEach(() => {
    factory.destroyAllModels();
  });
  describe('Factory Configuration', () => {
    test('should create factory with default configuration', () => {
      const config = factory.getFactoryConfig();
      expect(config.defaultTimeout).toBe(30000);
      expect(config.defaultRetries).toBe(3);
      expect(config.enableLogging).toBe(true);
      expect(config.logLevel).toBe('info');
    });
    test('should create factory with custom configuration', () => {
      const customConfig: FactoryConfig = {
        defaultTimeout: 60000,
        defaultRetries: 5,
        enableLogging: false,
        logLevel: 'error',
      };
      const customFactory = new AIModelFactory(customConfig);
      const config = customFactory.getFactoryConfig();
      expect(config.defaultTimeout).toBe(60000);
      expect(config.defaultRetries).toBe(5);
      expect(config.enableLogging).toBe(false);
      expect(config.logLevel).toBe('error');
    });
    test('should update factory configuration', () => {
      factory.updateFactoryConfig({ defaultTimeout: 45000, logLevel: 'debug' });
      const config = factory.getFactoryConfig();
      expect(config.defaultTimeout).toBe(45000);
      expect(config.logLevel).toBe('debug');
      expect(config.defaultRetries).toBe(3); // Should keep original value
    });
  });
  describe('Supported Types and Default Configurations', () => {
    test('should return all supported AI model types', () => {
      const types = factory.getSupportedTypes();
      expect(types).toEqual([)
        AIModelType.TEXT,
        AIModelType.IMAGE,
        AIModelType.AUDIO,
        AIModelType.VIDEO,
        AIModelType.MULTIMODAL
      ]);
    });
    test('should provide default configuration for text models', () => {
      const config = factory.getDefaultConfiguration(AIModelType.TEXT);
      expect(config.type).toBe(AIModelType.TEXT);
      expect(config.provider).toBe(AIModelProvider.OPENAI);
      expect(config.modelName).toBe('gpt-3.5-turbo');
      expect(config.parameters?.temperature).toBe(1);
    });
    test('should provide default configuration for image models', () => {
      const config = factory.getDefaultConfiguration(AIModelType.IMAGE);
      expect(config.type).toBe(AIModelType.IMAGE);
      expect(config.provider).toBe(AIModelProvider.OPENAI);
      expect(config.modelName).toBe('dall-e-3');
      expect(config.parameters?.size).toBe('1024x1024');
    });
    test('should provide default configuration for audio models', () => {
      const config = factory.getDefaultConfiguration(AIModelType.AUDIO);
      expect(config.type).toBe(AIModelType.AUDIO);
      expect(config.provider).toBe(AIModelProvider.OPENAI);
      expect(config.modelName).toBe('tts-1');
      expect(config.parameters?.voice).toBe('alloy');
    });
    test('should provide default configuration for multimodal models', () => {
      const config = factory.getDefaultConfiguration(AIModelType.MULTIMODAL);
      expect(config.type).toBe(AIModelType.MULTIMODAL);
      expect(config.provider).toBe(AIModelProvider.OPENAI);
      expect(config.modelName).toBe('gpt-4-vision-preview');
    });
  });
  describe('OpenAI Model Creation', () => {
    beforeEach(() => {
      // Mock successful OpenAI API responses
      mockFetch.mockImplementation((url: string | URL | Request) => {
        const urlString = url.toString();
        if (urlString.includes('/models')) {
          return Promise.resolve({)
            ok: true,
            json: () => Promise.resolve({ data: [{ id: 'gpt-3.5-turbo' }] })
          } as Response);
        }
        return Promise.resolve({)
          ok: true,
          json: () => Promise.resolve({),
            id: 'chatcmpl-test',
            object: 'chat.completion',
            created: Date.now(),
            model: 'gpt-3.5-turbo',
            choices: [{,
              index: 0,
              message: { role: 'assistant', content: 'Hello!' },
              finish_reason: 'stop',
            }],
            usage: { prompt_tokens: 5, completion_tokens: 1, total_tokens: 6 }
          })
        } as Response);
      });
    });
    test('should create OpenAI model successfully', async () => {
      const config: ModelConfiguration = {
        id: 'test-openai',
        type: AIModelType.TEXT,
        provider: AIModelProvider.OPENAI,
        modelName: 'gpt-3.5-turbo',
        apiKey: 'test-key',
      };
      const model = await factory.createModel(config);
      expect(model).toBeInstanceOf(OpenAIAdapter);
      expect(model.id).toBe('test-openai');
      expect(model.metadata.provider).toBe(AIModelProvider.OPENAI);
      expect(model.status).toBe(AIModelStatus.READY);
    });
    test('should fail to create OpenAI model without API key', async () => {
      const config: ModelConfiguration = {
        id: 'test-openai-no-key',
        type: AIModelType.TEXT,
        provider: AIModelProvider.OPENAI,
        modelName: 'gpt-3.5-turbo',
      };
      await expect(factory.createModel(config)).rejects.toThrow('OpenAI API key is required');
    });
  });
  describe('Anthropic Model Creation', () => {
    beforeEach(() => {
      // Mock successful Anthropic API response
      mockFetch.mockImplementation(() => 
        Promise.resolve({)
          ok: true,
          json: () => Promise.resolve({),
            id: 'msg_test',
            type: 'message',
            role: 'assistant',
            content: [{ type: 'text', text: 'Hello!' }],
            model: 'claude-3-sonnet-20240229',
            stop_reason: 'end_turn',
            usage: { input_tokens: 5, output_tokens: 1 }
          })
        } as Response)
      );
    });
    test('should create Anthropic model successfully', async () => {
      const config: ModelConfiguration = {
        id: 'test-anthropic',
        type: AIModelType.TEXT,
        provider: AIModelProvider.ANTHROPIC,
        modelName: 'claude-3-sonnet-20240229',
        apiKey: 'test-key',
      };
      const model = await factory.createModel(config);
      expect(model).toBeInstanceOf(AnthropicAdapter);
      expect(model.id).toBe('test-anthropic');
      expect(model.metadata.provider).toBe(AIModelProvider.ANTHROPIC);
      expect(model.status).toBe(AIModelStatus.READY);
    });
  });
  describe('Local Model Creation', () => {
    beforeEach(() => {
      // Mock successful Ollama API responses
      mockFetch.mockImplementation((url: string | URL | Request) => {
        const urlString = url.toString();
        if (urlString.includes('/api/tags')) {
          return Promise.resolve({)
            ok: true,
            json: () => Promise.resolve({ models: [{ name: 'llama2' }] })
          } as Response);
        }
        if (urlString.includes('/api/show')) {
          return Promise.resolve({)
            ok: true,
            json: () => Promise.resolve({),
              modelfile: 'FROM llama2',
              parameters: { num_ctx: 4096 },
              details: { family: 'llama' }
            })
          } as Response);
        }
        return Promise.resolve({)
          ok: true,
          json: () => Promise.resolve({),
            model: 'llama2',
            created_at: new Date().toISOString(),
            message: { role: 'assistant', content: 'Hello!' },
            done: true,
          })
        } as Response);
      });
    });
    test('should create local model successfully', async () => {
      const config: ModelConfiguration = {
        id: 'test-local',
        type: AIModelType.TEXT,
        provider: AIModelProvider.LOCAL,
        modelName: 'llama2',
        endpoint: 'http://localhost:11434',
      };
      const model = await factory.createModel(config);
      expect(model).toBeInstanceOf(LocalModelAdapter);
      expect(model.id).toBe('test-local');
      expect(model.metadata.provider).toBe(AIModelProvider.LOCAL);
      expect(model.status).toBe(AIModelStatus.READY);
    });
  });
  describe('Custom HTTP Model Creation', () => {
    beforeEach(() => {
      // Mock successful custom API response
      mockFetch.mockImplementation(() => 
        Promise.resolve({)
          ok: true,
          json: () => Promise.resolve({),
            output: 'Generated text response',
            usage: { tokens: 10 },
            status: 'success',
          })
        } as Response)
      );
    });
    test('should create custom HTTP model successfully', async () => {
      const registration: ModelRegistration = {
        id: 'test-custom',
        provider: AIModelProvider.CUSTOM,
        modelName: 'custom-model',
        config: {,
          baseURL: 'https://api.example.com',
          apiKey: 'test-key',
        },
        requestMapping: {,
          inputPath: 'prompt',
          outputPath: 'output',
          usagePath: 'usage',
        }
      };
      factory.registerModel(registration);
      const config: ModelConfiguration = {
        id: 'test-custom',
        type: AIModelType.TEXT,
        provider: AIModelProvider.CUSTOM,
        endpoint: 'https://api.example.com',
        apiKey: 'test-key',
      };
      const model = await factory.createModel(config);
      expect(model).toBeInstanceOf(GenericHTTPAdapter);
      expect(model.id).toBe('test-custom');
      expect(model.metadata.provider).toBe(AIModelProvider.CUSTOM);
    });
  });
  describe('Model Registration and Management', () => {
    test('should register and retrieve model', () => {
      const registration: ModelRegistration = {
        id: 'registered-model',
        provider: AIModelProvider.CUSTOM,
        modelName: 'test-model',
        config: { baseURL: 'https://api.test.com' }
      };
      factory.registerModel(registration);
      const registrations = factory.getRegisteredModels();
      expect(registrations).toHaveLength(1);
      expect(registrations[0].id).toBe('registered-model');
    });
    test('should unregister model', () => {
      const registration: ModelRegistration = {
        id: 'temp-model',
        provider: AIModelProvider.CUSTOM,
        modelName: 'temp',
        config: {}
      };
      factory.registerModel(registration);
      expect(factory.getRegisteredModels()).toHaveLength(1);
      factory.unregisterModel('temp-model');
      expect(factory.getRegisteredModels()).toHaveLength(0);
    });
    test('should get model by ID', async () => {
      // Mock for model creation
      mockFetch.mockResolvedValue({)
        ok: true,
        json: () => Promise.resolve({ data: [] })
      } as Response);
      const config: ModelConfiguration = {
        id: 'cached-model',
        type: AIModelType.TEXT,
        provider: AIModelProvider.OPENAI,
        apiKey: 'test-key',
      };
      const model1 = await factory.createModel(config);
      const model2 = await factory.getModel('cached-model');
      expect(model1).toBe(model2); // Should return same instance
    });
    test('should return null for non-existent model', async () => {
      const model = await factory.getModel('non-existent');
      expect(model).toBeNull();
    });
  });
  describe('Batch Operations', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({)
        ok: true,
        json: () => Promise.resolve({ data: [] })
      } as Response);
    });
    test('should create multiple models', async () => {
      const configs: ModelConfiguration[] = [
        {
          id: 'batch-1',
          type: AIModelType.TEXT,
          provider: AIModelProvider.OPENAI,
          apiKey: 'key1',
        },
        {
          id: 'batch-2',
          type: AIModelType.TEXT,
          provider: AIModelProvider.OPENAI,
          apiKey: 'key2',
        }
      ];
      const models = await factory.createModels(configs);
      expect(models).toHaveLength(2);
      expect(models[0].id).toBe('batch-1');
      expect(models[1].id).toBe('batch-2');
    });
    test('should test all models', async () => {
      // Create test models first
      const config: ModelConfiguration = {
        id: 'test-health',
        type: AIModelType.TEXT,
        provider: AIModelProvider.OPENAI,
        apiKey: 'test-key',
      };
      await factory.createModel(config);
      const results = await factory.testAllModels();
      expect(results['test-health']).toBe(true);
    });
  });
  describe('Statistics and Monitoring', () => {
    test('should provide factory statistics', async () => {
      // Mock for model creation
      mockFetch.mockResolvedValue({)
        ok: true,
        json: () => Promise.resolve({ data: [] })
      } as Response);
      const config: ModelConfiguration = {
        id: 'stats-model',
        type: AIModelType.TEXT,
        provider: AIModelProvider.OPENAI,
        apiKey: 'test-key',
      };
      await factory.createModel(config);
      const stats = factory.getStatistics();
      expect(stats.totalModels).toBe(1);
      expect(stats.providerCounts[AIModelProvider.OPENAI]).toBe(1);
      expect(stats.factoryConfig).toBeDefined();
    });
    test('should get model metadata', async () => {
      // Mock for model creation
      mockFetch.mockResolvedValue({)
        ok: true,
        json: () => Promise.resolve({ data: [] })
      } as Response);
      const config: ModelConfiguration = {
        id: 'metadata-model',
        type: AIModelType.TEXT,
        provider: AIModelProvider.OPENAI,
        apiKey: 'test-key',
      };
      await factory.createModel(config);
      const metadata = factory.getModelMetadata('metadata-model');
      expect(metadata).toBeDefined();
      expect(metadata?.provider).toBe(AIModelProvider.OPENAI);
    });
  });
  describe('Error Handling', () => {
    test('should handle unsupported provider', async () => {
      const config: ModelConfiguration = {
        id: 'unsupported',
        type: AIModelType.TEXT,
        provider: 'unknown' as AIModelProvider,
        apiKey: 'test-key',
      };
      await expect(factory.createModel(config)).rejects.toThrow('Unsupported provider: unknown');
    });
    test('should handle network errors during model creation', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const config: ModelConfiguration = {
        id: 'network-error',
        type: AIModelType.TEXT,
        provider: AIModelProvider.OPENAI,
        apiKey: 'test-key',
      };
      await expect(factory.createModel(config)).rejects.toThrow();
    });
    test('should handle API errors during model creation', async () => {
      mockFetch.mockResolvedValue({)
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Invalid API key' })
      } as Response);
      const config: ModelConfiguration = {
        id: 'api-error',
        type: AIModelType.TEXT,
        provider: AIModelProvider.OPENAI,
        apiKey: 'invalid-key',
      };
      await expect(factory.createModel(config)).rejects.toThrow();
    });
  });
  describe('Model Lifecycle', () => {
    test('should destroy individual model', async () => {
      mockFetch.mockResolvedValue({)
        ok: true,
        json: () => Promise.resolve({ data: [] })
      } as Response);
      const config: ModelConfiguration = {
        id: 'destroy-test',
        type: AIModelType.TEXT,
        provider: AIModelProvider.OPENAI,
        apiKey: 'test-key',
      };
      await factory.createModel(config);
      expect(factory.getStatistics().totalModels).toBe(1);
      await factory.destroyModel('destroy-test');
      expect(factory.getStatistics().totalModels).toBe(0);
    });
    test('should destroy all models', async () => {
      mockFetch.mockResolvedValue({)
        ok: true,
        json: () => Promise.resolve({ data: [] })
      } as Response);
      const configs: ModelConfiguration[] = [
        {
          id: 'destroy-all-1',
          type: AIModelType.TEXT,
          provider: AIModelProvider.OPENAI,
          apiKey: 'key1',
        },
        {
          id: 'destroy-all-2',
          type: AIModelType.TEXT,
          provider: AIModelProvider.OPENAI,
          apiKey: 'key2',
        }
      ];
      await factory.createModels(configs);
      expect(factory.getStatistics().totalModels).toBe(2);
      await factory.destroyAllModels();
      expect(factory.getStatistics().totalModels).toBe(0);
    });
  });
});