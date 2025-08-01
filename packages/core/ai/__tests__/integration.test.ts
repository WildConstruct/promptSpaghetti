/**
 * AI Multi-Model Integration Tests
 * Epic 35.1.1 - Multi-Model Infrastructure
 * 
 * End-to-end integration tests for the complete AI model system
 */
import { AIModelFactory, ModelManager, ConfigurationManager } from '../index';
import { AIModelType, AIModelProvider, AIModelStatus, AIRequest } from '../BaseAIModel';
import { ModelRegistration } from '../AIModelFactory';

// Mock fetch globally
global.fetch = jest.fn();
describe('AI Multi-Model Integration', () => { let factory: AIModelFactory;
  let manager: ModelManager;
  let configManager: ConfigurationManager;
  let mockFetch: jest.MockedFunction<typeof fetch>;
  beforeEach(() => {
    factory = new AIModelFactory();
    manager = new ModelManager();
    configManager = new ConfigurationManager();
    mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();
    // Mock successful API responses
    mockFetch.mockImplementation((url: string | URL | Request) => {
      const urlString = url.toString();
      if (urlString.includes('openai.com')) {
        if (urlString.includes('/models')) {
          return Promise.resolve({)
  ok: true }
            json: () => Promise.resolve({ data: [{ id: 'gpt-3.5-turbo' }] })
 as Response);
        return Promise.resolve({ )
  ok: true
          json: () => Promise.resolve({);
  id: 'chatcmpl-test'
            object: 'chat.completion'
            created: Date.now()
            model: 'gpt-3.5-turbo'
            choices: [{
  index: 0 }
              message: { role: 'assistant', content: 'Hello from OpenAI!' }
              finish_reason: 'stop';
]
            usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 }

 as Response);
      if (urlString.includes('anthropic.com')) { return Promise.resolve({)
  ok: true
          json: () => Promise.resolve({);
  id: 'msg_test'
            type: 'message'
            role: 'assistant' }
            content: [{ type: 'text', text: 'Hello from Anthropic!' }]
            model: 'claude-3-sonnet-20240229'
            stop_reason: 'end_turn'
            usage: { input_tokens: 5, output_tokens: 3 }

 as Response);
      if (urlString.includes('localhost:11434')) { if (urlString.includes('/api/tags')) {
          return Promise.resolve({)
  ok: true }
            json: () => Promise.resolve({ models: [{ name: 'llama2' }] })
 as Response);
        return Promise.resolve({ )
  ok: true
          json: () => Promise.resolve({);
  model: 'llama2'
            created_at: new Date().toISOString() }
            message: { role: 'assistant', content: 'Hello from Local!' }
            done: true
            eval_count: 3
            prompt_eval_count: 5;

 as Response);
      return Promise.resolve({ )
  ok: true }
        json: () => Promise.resolve({})
 as Response);
    });
  });
  afterEach(async () => { await manager.destroy();
    await factory.destroyAllModels() });
  describe('Configuration-Driven Model Creation', () => { test('should create models from configuration manager', async () => {
      // Add model configurations to the configuration manager
      configManager.addModelConfig({)
  id: 'test-openai'
        type: AIModelType.TEXT
        provider: AIModelProvider.OPENAI
        modelName: 'gpt-3.5-turbo'
        apiKey: 'test-key-openai' }
        parameters: { temperature: 0.7 }
      });
      configManager.addModelConfig({ )
  id: 'test-anthropic'
        type: AIModelType.TEXT
        provider: AIModelProvider.ANTHROPIC
        modelName: 'claude-3-sonnet-20240229'
        apiKey: 'test-key-anthropic' }
        parameters: { temperature: 0.8 }
      });
      // Generate registrations from configuration
      const registrations = configManager.generateRegistrations();
      expect(registrations).toHaveLength(2);
      // Create models using factory
      for (const registration of registrations) { factory.registerModel(registration);
      const openaiModel = await factory.getModel('test-openai');
      const anthropicModel = await factory.getModel('test-anthropic');
      expect(openaiModel).toBeDefined();
      expect(anthropicModel).toBeDefined();
      expect(openaiModel!.status).toBe(AIModelStatus.READY);
      expect(anthropicModel!.status).toBe(AIModelStatus.READY) });
    test('should validate configuration before model creation', () => { // Test invalid configuration
  expect(() => {
  configManager.addModelConfig({)
  id: ''
  type: AIModelType.TEXT
  provider: AIModelProvider.OPENAI }
});
      }).toThrow('Invalid model configuration');
      // Test valid configuration
      expect(() => { configManager.addModelConfig({)
  id: 'valid-config'
  type: AIModelType.TEXT
  provider: AIModelProvider.OPENAI
  modelName: 'gpt-3.5-turbo'
  apiKey: 'valid-api-key' }
});
      }).not.toThrow();
    });
  });
  describe('Model Pool Management', () => { test('should create and manage model pools', async () => {
      const registrations: ModelRegistration = [
        {
          id: 'pool-openai-1'
          provider: AIModelProvider.OPENAI
          modelName: 'gpt-3.5-turbo' }
          config: { apiKey: 'key1' }

        { id: 'pool-openai-2'
          provider: AIModelProvider.OPENAI
          modelName: 'gpt-4' }
          config: { apiKey: 'key2' }

        { id: 'pool-anthropic-1'
          provider: AIModelProvider.ANTHROPIC
          modelName: 'claude-3-sonnet-20240229' }
          config: { apiKey: 'key3' }
      ];
      const pool = await manager.createModelPool('mixed-pool', registrations);
      expect(pool.id).toBe('mixed-pool');
      expect(pool.models).toHaveLength(3);
      expect(pool.loadBalancer).toBeDefined();
      expect(pool.healthMonitor).toBeDefined();
      // Test pool statistics
      const stats = manager.getPoolStats('mixed-pool');
      expect(stats.id).toBe('mixed-pool');
      expect(stats.modelCount).toBe(3);
    });
    test('should process requests through load balancer', async () => { const registrations: ModelRegistration = [
        {
          id: 'lb-test-1'
          provider: AIModelProvider.OPENAI
          modelName: 'gpt-3.5-turbo' }
          config: { apiKey: 'key1' }

        { id: 'lb-test-2'
          provider: AIModelProvider.ANTHROPIC
          modelName: 'claude-3-sonnet-20240229' }
          config: { apiKey: 'key2' }
      ];
      await manager.createModelPool('lb-pool', registrations);
      const request: AIRequest = { 
  id: 'test-request'
        input: 'Hello, world!' }
        options: { max_tokens: 50 }
        createdAt: new Date();
  };
      const response = await manager.processRequest('lb-pool', request);
      expect(response).toBeDefined();
      expect(response.output).toBeDefined();
      expect(response.requestId).toBe('test-request');
      // Verify load balancer metrics were updated
      const stats = manager.getPoolStats('lb-pool');
      const metrics = stats.loadBalancerMetrics;
      expect(metrics).toBeDefined();
      expect(metrics.length).toBeGreaterThan(0);
    });
    test('should estimate request costs', async () => { const registrations: ModelRegistration = [
        {
          id: 'cost-test'
          provider: AIModelProvider.OPENAI
          modelName: 'gpt-3.5-turbo' }
          config: { apiKey: 'test-key' }
      ];
      await manager.createModelPool('cost-pool', registrations);
      const request: AIRequest = { 
  id: 'cost-estimate'
        input: 'Estimate the cost of this request' }
        options: { max_tokens: 100 }
        createdAt: new Date();
  };
      const estimate = await manager.estimateRequest('cost-pool', request);
      expect(estimate).toBeDefined();
      expect(estimate.estimatedCost).toBeGreaterThanOrEqual(0);
      expect(estimate.currency).toBe('USD');
      expect(estimate.confidence).toBeGreaterThan(0);
    });
  });
  describe('Environment-Specific Configuration', () => { test('should manage different environment configurations', () => {
      // Test default environments
      expect(configManager.getCurrentEnvironment()).toBe('development');
      const devConfig = configManager.getEnvironmentConfig('development');
      const prodConfig = configManager.getEnvironmentConfig('production');
      expect(devConfig.features.enableLoadBalancing).toBe(false);
      expect(prodConfig.features.enableLoadBalancing).toBe(true);
      // Switch environments
      configManager.setEnvironment('production');
      expect(configManager.getCurrentEnvironment()).toBe('production') });
    test('should create custom environments', () => { const customEnv = {
  name: 'Testing'
  description: 'Custom testing environment'
  models: []
  defaults: {
  timeout: 5000
  retries: 1
  rateLimit: {
  requestsPerMinute: 50
  tokensPerMinute: 5000 }

  features: { 
  enableCaching: false
  enableLoadBalancing: false
  enableHealthChecks: false
  enableMetrics: true }
};
      configManager.createEnvironment('testing', customEnv);
      const retrievedConfig = configManager.getEnvironmentConfig('testing');
      expect(retrievedConfig.name).toBe('Testing');
      expect(retrievedConfig.defaults.timeout).toBe(5000);
    });
  });
  describe('Template-Based Configuration', () => { test('should use model templates', () => {
  // Create custom template
  configManager.createTemplate('custom-openai', {)
  provider: AIModelProvider.OPENAI
  type: AIModelType.TEXT
  parameters: {
  temperature: 0.5
  max_tokens: 2000 }

  capabilities: { 
  inputTypes: ['text']
  outputTypes: ['text']
  supportsStreaming: true }
});
      // Apply template to create model configuration
      const modelConfig = configManager.applyTemplate('my-custom-model', 'custom-openai', { )
  modelName: 'gpt-4'
  apiKey: 'my-api-key' }
});
      expect(modelConfig.id).toBe('my-custom-model');
      expect(modelConfig.provider).toBe(AIModelProvider.OPENAI);
      expect(modelConfig.modelName).toBe('gpt-4');
      expect(modelConfig.parameters?.temperature).toBe(0.5);
      expect(modelConfig.apiKey).toBe('my-api-key');
    });
  });
  describe('Configuration Export/Import', () => { test('should export and import configurations', () => {
  // Add a model to the current environment
  configManager.addModelConfig({)
  id: 'export-test'
  type: AIModelType.TEXT
  provider: AIModelProvider.OPENAI
  modelName: 'gpt-3.5-turbo'
  apiKey: 'test-key' }
});
      // Export configuration
      const exported = configManager.exportConfiguration('development');
      expect(exported).toContain('export-test');
      // Create new manager and import
      const newConfigManager = new ConfigurationManager();
      newConfigManager.importConfiguration(exported, 'development');
      const importedConfig = newConfigManager.getModelConfig('export-test', 'development');
      expect(importedConfig).toBeDefined();
      expect(importedConfig?.id).toBe('export-test');
    });
  });
  describe('Configuration History and Rollback', () => { test('should track configuration history', () => {
  // Make some configuration changes
  configManager.addModelConfig({)
  id: 'history-test-1'
  type: AIModelType.TEXT
  provider: AIModelProvider.OPENAI
  apiKey: 'key1' }
});
      configManager.addModelConfig({ )
  id: 'history-test-2'
  type: AIModelType.TEXT
  provider: AIModelProvider.ANTHROPIC
  apiKey: 'key2' }
});
      const history = configManager.getHistory();
      expect(history.updates.length).toBeGreaterThan(0);
      expect(history.snapshots.length).toBeGreaterThan(0);
      // Create a snapshot
      configManager.createSnapshot('After adding test models');
      const newHistory = configManager.getHistory();
      expect(newHistory.snapshots.length).toBe(history.snapshots.length + 1);
    });
  });
  describe('Error Handling and Resilience', () => { test('should handle model failures gracefully', async () => {
      // Mock network failure for one provider
      mockFetch.mockImplementation((url: string | URL | Request) => {
        const urlString = url.toString();
        if (urlString.includes('openai.com')) {
          return Promise.reject(new Error('Network error'));
        if (urlString.includes('anthropic.com')) {
          return Promise.resolve({)
  ok: true
            json: () => Promise.resolve({);
  id: 'msg_test'
              type: 'message'
              role: 'assistant' }
              content: [{ type: 'text', text: 'Backup response' }]
              model: 'claude-3-sonnet-20240229'
              stop_reason: 'end_turn'
              usage: { input_tokens: 5, output_tokens: 2 }

 as Response);
        return Promise.reject(new Error('Unknown provider'));
      });
      const registrations: ModelRegistration = [
        { id: 'failing-openai'
          provider: AIModelProvider.OPENAI
          modelName: 'gpt-3.5-turbo' }
          config: { apiKey: 'key1' }

        { id: 'working-anthropic'
          provider: AIModelProvider.ANTHROPIC
          modelName: 'claude-3-sonnet-20240229' }
          config: { apiKey: 'key2' }
      ];
      // Should create pool with only working models
      const pool = await manager.createModelPool('resilient-pool', registrations);
      // Pool should have fewer models than requested due to failures
      expect(pool.models.length).toBeLessThan(registrations.length);
      // But should still be able to process requests with working models
      const request: AIRequest = { 
  id: 'resilience-test'
  input: 'Test resilience'
  createdAt: new Date() }
};
      const response = await manager.processRequest('resilient-pool', request);
      expect(response.output.content).toBe('Backup response');
    });
    test('should validate configurations and prevent invalid setups', () => { // Test configuration validation
  const validation = configManager.validateCurrentConfiguration();
  expect(validation.valid).toBe(true);
  // Test invalid model configuration
  expect(() => {
  configManager.addModelConfig({)
  id: 'invalid'
  type: AIModelType.TEXT
  provider: AIModelProvider.OPENAI }
  // Missing required fields like apiKey
});
      }).toThrow();
    });
  });
  describe('Performance and Metrics', () => { test('should collect performance metrics', async () => {
      const registrations: ModelRegistration = [
        {
          id: 'metrics-test'
          provider: AIModelProvider.OPENAI
          modelName: 'gpt-3.5-turbo' }
          config: { apiKey: 'test-key' }
      ];
      await manager.createModelPool('metrics-pool', registrations);
      // Process multiple requests to generate metrics
      for (let i = 0; i < 3; i++) { const request: AIRequest = { }
  id: `metrics-request-${i}`}
},
  input: `Test request ${i}`}
},
  createdAt: new Date();
  };
        await manager.processRequest('metrics-pool', request);
      const stats = manager.getPoolStats('metrics-pool');
      const metrics = stats.loadBalancerMetrics;
      expect(metrics).toBeDefined();
      expect(metrics.length).toBeGreaterThan(0);
      const modelMetrics = metrics[0];
      expect(modelMetrics.totalRequests).toBe(3);
      expect(modelMetrics.averageLatency).toBeGreaterThan(0);
    });
    test('should provide comprehensive system statistics', async () => { // Create some models and pools
  configManager.addModelConfig({)
  id: 'stats-model',
  type: AIModelType.TEXT,
  provider: AIModelProvider.OPENAI,
  apiKey: 'test-key' }
});
      const registrations = configManager.generateRegistrations();
      await manager.createModelPool('stats-pool', registrations);
      // Get comprehensive statistics
      const allStats = manager.getAllStats();
      expect(allStats.totalPools).toBe(1);
      expect(allStats.cacheStats).toBeDefined();
      expect(allStats.factoryStats).toBeDefined();
      expect(allStats.pools).toHaveLength(1);
    });
  });
});