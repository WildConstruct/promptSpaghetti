import { ModelSelector } from '../../../services/llm/ModelSelector';

describe('ModelSelector', () => {
  it('returns preferred model first for task type', () => {
    const selector = new ModelSelector();

    const models = selector.getModelsForTask('metadata');

    expect(models[0].id).toBe('mistral/mistral-medium-3.1:free');
    const remainingIds = models.slice(1).map(model => model.id);
    expect(remainingIds).toEqual(
      expect.arrayContaining([
        'deepseek/deepseek-r1:free',
        'qwen/qwen-262k:free',
        'openai/gpt-4o-mini'
      ])
    );
  });

  it('temporarily excludes failed models and recovers after timeout', () => {
    jest.useFakeTimers();
    const selector = new ModelSelector();
    const target = 'deepseek/deepseek-r1:free';

    selector.markModelFailed(target);
    const afterFailure = selector.getModelsForTask();
    expect(afterFailure.find(m => m.id === target)).toBeUndefined();

    jest.advanceTimersByTime(5 * 60 * 1000 + 10);
    const restored = selector.getModelsForTask();
    expect(restored.find(m => m.id === target)).toBeDefined();
    jest.useRealTimers();
  });

  it('calculates usage cost based on tokens', () => {
    const selector = new ModelSelector();
    const cost = selector.calculateCost('openai/gpt-4o-mini', 500, 500);
    expect(cost).toBeCloseTo(0.00005, 6);
  });

  it('returns free and paid model lists without failed ones', () => {
    const selector = new ModelSelector();
    selector.markModelFailed('mistral/mistral-medium-3.1:free');

    const freeModels = selector.getFreeModels();
    expect(freeModels.every(model => model.isFree)).toBe(true);
    expect(freeModels.find(m => m.id === 'mistral/mistral-medium-3.1:free')).toBeUndefined();

    const paidModels = selector.getPaidModels();
    expect(paidModels.every(model => !model.isFree)).toBe(true);

    selector.resetFailedModels();
    const restored = selector.getFreeModels();
    expect(restored.find(m => m.id === 'mistral/mistral-medium-3.1:free')).toBeDefined();
  });
});
