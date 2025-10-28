// Model Selection and Fallback Chain Logic

import { ModelConfig } from './types';

export class ModelSelector {
  private models: ModelConfig[] = [
    {
      id: 'deepseek/deepseek-r1:free',
      name: 'DeepSeek R1 Free',
      provider: 'deepseek',
      costPerMillion: 0,
      maxTokens: 8192,
      isFree: true,
      priority: 1
    },
    {
      id: 'mistral/mistral-medium-3.1:free',
      name: 'Mistral Medium Free',
      provider: 'mistral',
      costPerMillion: 0,
      maxTokens: 4096,
      isFree: true,
      priority: 2
    },
    {
      id: 'qwen/qwen-262k:free',
      name: 'Qwen 262K Free',
      provider: 'qwen',
      costPerMillion: 0,
      maxTokens: 262144,
      isFree: true,
      priority: 3
    },
    {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      costPerMillion: 0.05,
      maxTokens: 16384,
      isFree: false,
      priority: 4
    }
  ];

  private failedModels: Set<string> = new Set();
  private taskModelMap: Map<string, string> = new Map([
    ['metadata', 'mistral/mistral-medium-3.1:free'],
    ['suggestion', 'deepseek/deepseek-r1:free'],
    ['refinement', 'deepseek/deepseek-r1:free'],
    ['general', 'deepseek/deepseek-r1:free']
  ]);

  getModelsForTask(taskType?: string): ModelConfig[] {
    // Get task-specific model if specified
    if (taskType && this.taskModelMap.has(taskType)) {
      const preferredModelId = this.taskModelMap.get(taskType)!;
      const preferredModel = this.models.find(m => m.id === preferredModelId);

      if (preferredModel && !this.failedModels.has(preferredModel.id)) {
        // Return preferred model first, then fallbacks
        const otherModels = this.models
          .filter(
            m => m.id !== preferredModelId && !this.failedModels.has(m.id)
          )
          .sort((a, b) => a.priority - b.priority);

        return [preferredModel, ...otherModels];
      }
    }

    // Return all available models sorted by priority
    return this.models
      .filter(m => !this.failedModels.has(m.id))
      .sort((a, b) => a.priority - b.priority);
  }

  markModelFailed(modelId: string): void {
    this.failedModels.add(modelId);

    // Clear failed models after 5 minutes
    setTimeout(
      () => {
        this.failedModels.delete(modelId);
      },
      5 * 60 * 1000
    );
  }

  resetFailedModels(): void {
    this.failedModels.clear();
  }

  getModelById(modelId: string): ModelConfig | undefined {
    return this.models.find(m => m.id === modelId);
  }

  calculateCost(modelId: string, tokensIn: number, tokensOut: number): number {
    const model = this.getModelById(modelId);
    if (!model) return 0;

    const totalTokens = tokensIn + tokensOut;
    return (totalTokens / 1_000_000) * model.costPerMillion;
  }

  getFreeModels(): ModelConfig[] {
    return this.models
      .filter(m => m.isFree && !this.failedModels.has(m.id))
      .sort((a, b) => a.priority - b.priority);
  }

  getPaidModels(): ModelConfig[] {
    return this.models
      .filter(m => !m.isFree && !this.failedModels.has(m.id))
      .sort((a, b) => a.priority - b.priority);
  }
}
