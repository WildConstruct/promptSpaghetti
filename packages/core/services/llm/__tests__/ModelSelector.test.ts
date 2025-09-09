// Model Selector Tests

import { ModelSelector } from '../ModelSelector';

describe('ModelSelector', () => {
  let modelSelector: ModelSelector;

  beforeEach(() => {
    modelSelector = new ModelSelector();
  });

  describe('getModelsForTask', () => {
    it('should return models sorted by priority', () => {
      const models = modelSelector.getModelsForTask();
      expect(models).toHaveLength(4);
      expect(models[0].id).toBe('deepseek/deepseek-r1:free');
      expect(models[1].id).toBe('mistral/mistral-medium-3.1:free');
      expect(models[2].id).toBe('qwen/qwen-262k:free');
      expect(models[3].id).toBe('openai/gpt-4o-mini');
    });

    it('should return task-specific model first', () => {
      const models = modelSelector.getModelsForTask('metadata');
      expect(models[0].id).toBe('mistral/mistral-medium-3.1:free');
    });

    it('should filter out failed models', () => {
      modelSelector.markModelFailed('deepseek/deepseek-r1:free');
      const models = modelSelector.getModelsForTask();
      expect(models).not.toContainEqual(
        expect.objectContaining({ id: 'deepseek/deepseek-r1:free' })
      );
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost for free models', () => {
      const cost = modelSelector.calculateCost(
        'deepseek/deepseek-r1:free',
        1000,
        500
      );
      expect(cost).toBe(0);
    });

    it('should calculate cost for paid models', () => {
      const cost = modelSelector.calculateCost(
        'openai/gpt-4o-mini',
        245000,
        89000
      );
      // (245000 + 89000) / 1000000 * 0.05 = 0.0167
      expect(cost).toBeCloseTo(0.0167, 4);
    });

    it('should return 0 for unknown models', () => {
      const cost = modelSelector.calculateCost('unknown/model', 1000, 500);
      expect(cost).toBe(0);
    });
  });

  describe('getFreeModels', () => {
    it('should return only free models', () => {
      const models = modelSelector.getFreeModels();
      expect(models).toHaveLength(3);
      models.forEach(model => {
        expect(model.isFree).toBe(true);
      });
    });
  });

  describe('getPaidModels', () => {
    it('should return only paid models', () => {
      const models = modelSelector.getPaidModels();
      expect(models).toHaveLength(1);
      models.forEach(model => {
        expect(model.isFree).toBe(false);
      });
    });
  });

  describe('markModelFailed', () => {
    it('should mark model as failed temporarily', () => {
      const modelId = 'deepseek/deepseek-r1:free';
      modelSelector.markModelFailed(modelId);

      const models = modelSelector.getModelsForTask();
      expect(models).not.toContainEqual(
        expect.objectContaining({ id: modelId })
      );
    });

    it('should reset failed models', () => {
      const modelId = 'deepseek/deepseek-r1:free';
      modelSelector.markModelFailed(modelId);
      modelSelector.resetFailedModels();

      const models = modelSelector.getModelsForTask();
      expect(models).toContainEqual(expect.objectContaining({ id: modelId }));
    });
  });
});
