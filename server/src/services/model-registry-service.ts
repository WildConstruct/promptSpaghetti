/**
 * Epic 26.1 - Model Registry & Versioning Service
 * Service for managing AI model registration, versioning, metadata, and search capabilities
 * 
 * Provides comprehensive model lifecycle management including model registration, 
 * version control, performance tracking, lineage management, and search functionality.
 * 
 * Enhanced with CI evaluation triggering (Epic 26.3) - automatically triggers
 * evaluation workflows when models are uploaded or updated.
 */

import { z } from 'zod';
import { ModelEvaluationTriggerService, ModelEvaluationTriggerRequest } from './ModelEvaluationTriggerService';

// Model registry types and schemas
const ModelMetadataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  modelType: z.enum(
    ['language_model',
    'vision_model',
    'multimodal',
    'embedding_model',
    'classification',
    'regression']
  ),
  framework: z.enum(['pytorch', 'tensorflow', 'jax', 'onnx', 'huggingface', 'custom']),
  version: z.string(),
  status: z.enum(['training', 'ready', 'deprecated', 'archived']),
  tags: z.array(z.string()).default([]),
  owner: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  size: z.number().positive().optional(), // Size in bytes
  performanceMetrics: z.object({
    accuracy: z.number().min(0).max(1).optional(),
    precision: z.number().min(0).max(1).optional(),
    recall: z.number().min(0).max(1).optional(),
    f1Score: z.number().min(0).max(1).optional(),
    loss: z.number().optional(),
    inferenceTime: z.number().positive().optional(), // milliseconds
    memoryUsage: z.number().positive().optional(), // MB
    throughput: z.number().positive().optional() // requests/sec
  }).optional(),
  artifactPath: z.string().url().optional(),
  configPath: z.string().url().optional(),
  checkpointPath: z.string().url().optional(),
  metadata: z.record(z.unknown()).default({})
});

const ModelVersionSchema = z.object({
  id: z.string().uuid(),
  modelId: z.string().uuid(),
  version: z.string(),
  parentVersionId: z.string().uuid().optional(),
  changes: z.array(z.object({
    type: z.enum(['architecture', 'hyperparameters', 'training_data', 'fine_tuning', 'evaluation']),
    description: z.string(),
    details: z.record(z.unknown()).optional()
  })).default([]),
  performanceComparison: z.object({
    improvements: z.array(z.string()),
    regressions: z.array(z.string()),
    metricDeltas: z.record(z.number())
  }).optional(),
  createdAt: z.string(),
  isActive: z.boolean().default(true),
  deploymentStatus: z.enum(['not_deployed', 'staging', 'production', 'rolled_back']).default('not_deployed')
});

const ModelLineageSchema = z.object({
  modelId: z.string().uuid(),
  parentModels: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    version: z.string(),
    relationship: z.enum(['base_model', 'fine_tuned_from', 'ensemble_component', 'distilled_from'])
  })).default([]),
  childModels: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    version: z.string(),
    relationship: z.enum(['fine_tuned_to', 'distilled_to', 'ensemble_parent', 'derived_from'])
  })).default([]),
  trainingDatasets: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    version: z.string(),
    size: z.number().int()
  })).default([])
});

// Type definitions
type ModelMetadata = z.infer<typeof ModelMetadataSchema>;
type ModelVersion = z.infer<typeof ModelVersionSchema>;
type ModelLineage = z.infer<typeof ModelLineageSchema>;

interface ModelRegistrationRequest {
  name: string;
  description?: string;
  modelType: ModelMetadata['modelType'];
  framework: ModelMetadata['framework'];
  version: string;
  tags?: string[];
  owner: string;
  performanceMetrics?: ModelMetadata['performanceMetrics'];
  artifactPath?: string;
  configPath?: string;
  metadata?: Record<string, unknown>;
}

interface ModelUpdateRequest {
  name?: string;
  description?: string;
  status?: ModelMetadata['status'];
  tags?: string[];
  performanceMetrics?: ModelMetadata['performanceMetrics'];
  metadata?: Record<string, unknown>;
}

interface ModelSearchOptions {
  query?: string;
  modelType?: string;
  framework?: string;
  status?: string;
  owner?: string;
  tags?: string[];
  minAccuracy?: number;
  maxInferenceTime?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'accuracy' | 'size';
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}

interface ModelComparisonRequest {
  modelIds: string[];
  metrics: string[];
  includeLineage?: boolean;
}

interface ModelComparisonResult {
  models: Array<{
    id: string;
    name: string;
    version: string;
    metrics: Record<string, number | undefined>;
  }>;
  bestPerforming: Record<string, string>; // metric -> modelId
  recommendations: string[];
}

interface ModelStatistics {
  totalModels: number;
  modelsByType: Record<string, number>;
  modelsByFramework: Record<string, number>;
  modelsByStatus: Record<string, number>;
  averageAccuracy: number;
  averageInferenceTime: number;
  popularTags: Array<{ tag: string; count: number }>;
  recentActivity: Array<{
    type: 'registration' | 'version_update' | 'status_change';
    modelId: string;
    modelName: string;
    timestamp: string;
  }>;
}

export class ModelRegistryService {
  private models: Map<string, ModelMetadata>;
  private versions: Map<string, ModelVersion[]>;
  private lineages: Map<string, ModelLineage>;
  private searchIndex: Map<string, Set<string>>; // term -> Set of model IDs
  private evaluationTriggerService?: ModelEvaluationTriggerService;

  constructor(
    initializeSampleData: boolean = true,
    evaluationTriggerService?: ModelEvaluationTriggerService
  ) {
    this.models = new Map();
    this.versions = new Map();
    this.lineages = new Map();
    this.searchIndex = new Map();
    this.evaluationTriggerService = evaluationTriggerService;
    if (initializeSampleData) {
      this.initializeSampleData();
    }
  }

  /**
   * Clear all data - useful for testing
   */
  clearAllData(): void {
    this.models.clear();
    this.versions.clear();
    this.lineages.clear();
    this.searchIndex.clear();
  }

  /**
   * Register a new model in the registry
   */
  async registerModel(request: ModelRegistrationRequest): Promise<ModelMetadata> {
    try {
      const modelId = this.generateUUID();
      const now = new Date().toISOString();

      const model: ModelMetadata = {
        id: modelId,
        name: request.name,
        description: request.description,
        modelType: request.modelType,
        framework: request.framework,
        version: request.version,
        status: 'training',
        tags: request.tags || [],
        owner: request.owner,
        createdAt: now,
        updatedAt: now,
        performanceMetrics: request.performanceMetrics,
        artifactPath: request.artifactPath,
        configPath: request.configPath,
        metadata: request.metadata || {}
      };

      // Validate the model data
      const validatedModel = ModelMetadataSchema.parse(model);
      this.models.set(modelId, validatedModel);

      // Create initial version
      const initialVersion: ModelVersion = {
        id: this.generateUUID(),
        modelId,
        version: request.version,
        changes: [{
          type: 'architecture',
          description: 'Initial model registration'
        }],
        createdAt: now,
        isActive: true
      };

      this.versions.set(modelId, [initialVersion]);

      // Initialize lineage
      this.lineages.set(modelId, {
        modelId,
        parentModels: [],
        childModels: [],
        trainingDatasets: []
      });

      // Update search index
      this.updateSearchIndex(validatedModel);

      // Trigger evaluation if enabled
      await this.triggerEvaluationIfEnabled(validatedModel, 'model_upload');

      return validatedModel;
    } catch (error) {
      throw new Error(`Model registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get model by ID
   */
  async getModel(id: string): Promise<ModelMetadata | null> {
    return this.models.get(id) || null;
  }

  /**
   * Update existing model
   */
  async updateModel(id: string, updates: ModelUpdateRequest): Promise<ModelMetadata> {
    try {
      const existingModel = this.models.get(id);
      if (!existingModel) {
        throw new Error('Model not found');
      }

      const updatedModel: ModelMetadata = {
        ...existingModel,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const validatedModel = ModelMetadataSchema.parse(updatedModel);
      this.models.set(id, validatedModel);

      // Update search index
      this.updateSearchIndex(validatedModel);

      // Trigger evaluation if enabled and this is a significant update
      if (this.isSignificantUpdate(updates)) {
        await this.triggerEvaluationIfEnabled(validatedModel, 'model_update');
      }

      return validatedModel;
    } catch (error) {
      throw new Error(`Model update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create new model version
   */
  async createModelVersion(
    modelId: string, 
    version: string, 
    changes: ModelVersion['changes'], 
    parentVersionId?: string
  ): Promise<ModelVersion> {
    try {
      const model = this.models.get(modelId);
      if (!model) {
        throw new Error('Model not found');
      }

      const existingVersions = this.versions.get(modelId) || [];
      
      // Check for version conflicts
      const versionExists = existingVersions.some(v => v.version === version);
      if (versionExists) {
        throw new Error(`Version ${version} already exists for this model`);
      }

      // Deactivate previous versions if this is set as active
      existingVersions.forEach(v => v.isActive = false);

      const newVersion: ModelVersion = {
        id: this.generateUUID(),
        modelId,
        version,
        parentVersionId,
        changes: changes || [],
        createdAt: new Date().toISOString(),
        isActive: true
      };

      const validatedVersion = ModelVersionSchema.parse(newVersion);
      existingVersions.push(validatedVersion);
      this.versions.set(modelId, existingVersions);

      // Update model's current version
      await this.updateModel(modelId, { version });

      return validatedVersion;
    } catch (error) {
      throw new Error(`Version creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all versions for a model
   */
  async getModelVersions(modelId: string): Promise<ModelVersion[]> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error('Model not found');
    }

    return this.versions.get(modelId) || [];
  }

  /**
   * Get specific model version
   */
  async getModelVersion(modelId: string, versionId: string): Promise<ModelVersion | null> {
    const versions = this.versions.get(modelId) || [];
    return versions.find(v => v.id === versionId) || null;
  }

  /**
   * Search models with advanced filtering
   */
  async searchModels(options: ModelSearchOptions): Promise<{
    models: ModelMetadata[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let filteredModels = Array.from(this.models.values());

    // Apply text search
    if (options.query) {
      const query = options.query.toLowerCase();
      filteredModels = filteredModels.filter(model => 
        model.name.toLowerCase().includes(query) ||
        (model.description && model.description.toLowerCase().includes(query)) ||
        model.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (options.modelType) {
      filteredModels = filteredModels.filter(model => model.modelType === options.modelType);
    }

    if (options.framework) {
      filteredModels = filteredModels.filter(model => model.framework === options.framework);
    }

    if (options.status) {
      filteredModels = filteredModels.filter(model => model.status === options.status);
    }

    if (options.owner) {
      filteredModels = filteredModels.filter(model => model.owner === options.owner);
    }

    if (options.tags && options.tags.length > 0) {
      filteredModels = filteredModels.filter(model => 
        options.tags!.some(tag => model.tags.includes(tag))
      );
    }

    if (options.minAccuracy !== undefined) {
      filteredModels = filteredModels.filter(model => 
        model.performanceMetrics?.accuracy && model.performanceMetrics.accuracy >= options.minAccuracy!
      );
    }

    if (options.maxInferenceTime !== undefined) {
      filteredModels = filteredModels.filter(model => 
        model.performanceMetrics?.inferenceTime && model.performanceMetrics.inferenceTime <= options.maxInferenceTime!
      );
    }

    // Apply sorting
    if (options.sortBy) {
      filteredModels.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (options.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'updatedAt':
            aValue = new Date(a.updatedAt);
            bValue = new Date(b.updatedAt);
            break;
          case 'accuracy':
            aValue = a.performanceMetrics?.accuracy || 0;
            bValue = b.performanceMetrics?.accuracy || 0;
            break;
          case 'size':
            aValue = a.size || 0;
            bValue = b.size || 0;
            break;
          default:
            return 0;
        }

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    const total = filteredModels.length;
    const startIndex = (options.page - 1) * options.limit;
    const paginatedModels = filteredModels.slice(startIndex, startIndex + options.limit);

    return {
      models: paginatedModels,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit)
    };
  }

  /**
   * Compare multiple models
   */
  async compareModels(request: ModelComparisonRequest): Promise<ModelComparisonResult> {
    try {
      const models = request.modelIds.map(id => this.models.get(id)).filter(Boolean) as ModelMetadata[];
      
      if (models.length !== request.modelIds.length) {
        throw new Error('One or more models not found');
      }

      const result: ModelComparisonResult = {
        models: models.map(model => ({
          id: model.id,
          name: model.name,
          version: model.version,
          metrics: request.metrics.reduce((acc, metric) => {
            acc[metric] = (model.performanceMetrics as any)?.[metric];
            return acc;
          }, {} as Record<string, number | undefined>)
        })),
        bestPerforming: {},
        recommendations: []
      };

      // Determine best performing model for each metric
      request.metrics.forEach(metric => {
        const modelsWithMetric = models.filter(model => 
          (model.performanceMetrics as any)?.[metric] !== undefined
        );

        if (modelsWithMetric.length === 0) return;

        let bestModel = modelsWithMetric[0];
        let bestValue = (bestModel.performanceMetrics as any)[metric];

        modelsWithMetric.forEach(model => {
          const value = (model.performanceMetrics as any)[metric];
          // For inference time and similar metrics, lower is better
          const isLowerBetter = metric === 'inferenceTime' || metric === 'loss' || metric === 'memoryUsage';
          
          if (isLowerBetter ? value < bestValue : value > bestValue) {
            bestValue = value;
            bestModel = model;
          }
        });

        result.bestPerforming[metric] = bestModel.id;
      });

      // Generate recommendations
      result.recommendations = this.generateModelRecommendations(models, request.metrics);

      return result;
    } catch (error) {
      throw new Error(`Model comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get model lineage
   */
  async getModelLineage(modelId: string): Promise<ModelLineage | null> {
    const model = this.models.get(modelId);
    if (!model) {
      return null;
    }

    return this.lineages.get(modelId) || null;
  }

  /**
   * Update model lineage
   */
  async updateModelLineage(modelId: string, lineage: Partial<ModelLineage>): Promise<ModelLineage> {
    try {
      const model = this.models.get(modelId);
      if (!model) {
        throw new Error('Model not found');
      }

      const existingLineage = this.lineages.get(modelId) || {
        modelId,
        parentModels: [],
        childModels: [],
        trainingDatasets: []
      };

      const updatedLineage: ModelLineage = {
        ...existingLineage,
        ...lineage
      };

      const validatedLineage = ModelLineageSchema.parse(updatedLineage);
      this.lineages.set(modelId, validatedLineage);

      return validatedLineage;
    } catch (error) {
      throw new Error(`Lineage update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete model and all associated data
   */
  async deleteModel(id: string): Promise<void> {
    const model = this.models.get(id);
    if (!model) {
      throw new Error('Model not found');
    }

    // Remove from all data structures
    this.models.delete(id);
    this.versions.delete(id);
    this.lineages.delete(id);

    // Update search index
    this.removeFromSearchIndex(model);
  }

  /**
   * Get registry statistics
   */
  async getRegistryStatistics(): Promise<ModelStatistics> {
    const models = Array.from(this.models.values());
    
    const statistics: ModelStatistics = {
      totalModels: models.length,
      modelsByType: this.groupBy(models, 'modelType'),
      modelsByFramework: this.groupBy(models, 'framework'),
      modelsByStatus: this.groupBy(models, 'status'),
      averageAccuracy: this.calculateAverageMetric(models, 'accuracy'),
      averageInferenceTime: this.calculateAverageMetric(models, 'inferenceTime'),
      popularTags: this.getPopularTags(models),
      recentActivity: this.getRecentActivity(models)
    };

    return statistics;
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{ status: string; details?: Record<string, unknown> }> {
    try {
      return {
        status: 'healthy',
        details: {
          totalModels: this.models.size,
          totalVersions: Array.from(this.versions.values()).reduce((sum, versions) => sum + versions.length, 0),
          indexedTerms: this.searchIndex.size,
          lastActivity: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // Private helper methods

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private updateSearchIndex(model: ModelMetadata): void {
    // Index searchable terms
    const terms = [
      model.name.toLowerCase(),
      ...(model.description ? [model.description.toLowerCase()] : []),
      model.modelType,
      model.framework,
      model.status,
      model.owner.toLowerCase(),
      ...model.tags.map(tag => tag.toLowerCase())
    ];

    terms.forEach(term => {
      if (!this.searchIndex.has(term)) {
        this.searchIndex.set(term, new Set());
      }
      this.searchIndex.get(term)!.add(model.id);
    });
  }

  private removeFromSearchIndex(model: ModelMetadata): void {
    this.searchIndex.forEach((modelIds, term) => {
      modelIds.delete(model.id);
      if (modelIds.size === 0) {
        this.searchIndex.delete(term);
      }
    });
  }

  private groupBy(items: ModelMetadata[], key: keyof ModelMetadata): Record<string, number> {
    const result: Record<string, number> = {};
    items.forEach(item => {
      const value = String(item[key]);
      result[value] = (result[value] || 0) + 1;
    });
    return result;
  }

  private calculateAverageMetric(models: ModelMetadata[], metric: string): number {
    const values = models
      .map(model => (model.performanceMetrics as any)?.[metric])
      .filter(value => value !== undefined && value !== null) as number[];
    
    return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  }

  private getPopularTags(models: ModelMetadata[]): Array<{ tag: string; count: number }> {
    const tagCounts: Record<string, number> = {};
    
    models.forEach(model => {
      model.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getRecentActivity(models: ModelMetadata[]): ModelStatistics['recentActivity'] {
    return models
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(model => ({
        type: 'registration' as const,
        modelId: model.id,
        modelName: model.name,
        timestamp: model.updatedAt
      }));
  }

  private generateModelRecommendations(models: ModelMetadata[], metrics: string[]): string[] {
    const recommendations: string[] = [];

    // Generate recommendations based on model comparison
    if (models.length > 1) {
      const hasAccuracy = metrics.includes('accuracy');
      const hasInferenceTime = metrics.includes('inferenceTime');

      if (hasAccuracy) {
        const accuracies = models
          .map(m => m.performanceMetrics?.accuracy)
          .filter(a => a !== undefined) as number[];
        
        if (accuracies.length > 1) {
          const maxAccuracy = Math.max(...accuracies);
          const minAccuracy = Math.min(...accuracies);
          const delta = maxAccuracy - minAccuracy;
          
          if (delta > 0.05) {
            recommendations.push(`Consider using the model with ${(maxAccuracy * 100).toFixed(1)}% accuracy for production use`);
          }
        }
      }

      if (hasInferenceTime) {
        const inferenceTimes = models
          .map(m => m.performanceMetrics?.inferenceTime)
          .filter(t => t !== undefined) as number[];
        
        if (inferenceTimes.length > 1) {
          const minTime = Math.min(...inferenceTimes);
          const maxTime = Math.max(...inferenceTimes);
          
          if (maxTime > minTime * 2) {
            recommendations.push(`Consider the fastest model (${minTime}ms inference time) for latency-sensitive applications`);
          }
        }
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('All models show similar performance characteristics');
    }

    return recommendations;
  }

  /**
   * Trigger model evaluation if evaluation service is enabled
   */
  private async triggerEvaluationIfEnabled(
    model: ModelMetadata, 
    triggeredBy: 'model_upload' | 'model_update'
  ): Promise<void> {
    if (!this.evaluationTriggerService) {
      return; // No evaluation service configured
    }

    try {
      const evaluationRequest: ModelEvaluationTriggerRequest = {
        modelId: model.id,
        modelName: model.name,
        version: model.version,
        modelType: model.modelType,
        framework: model.framework,
        owner: model.owner,
        artifactPath: model.artifactPath,
        configPath: model.configPath,
        triggeredBy,
        evaluationSuite: this.selectEvaluationSuite(model),
        priority: this.determinePriority(model, triggeredBy)
      };

      await this.evaluationTriggerService.triggerEvaluation(evaluationRequest);

      console.log(`Evaluation triggered for model ${model.name} (${model.id}) version ${model.version}`);
    } catch (error) {
      // Don't fail the model registration/update if evaluation fails
      console.error(`Failed to trigger evaluation for model ${model.id}:`, error);
    }
  }

  /**
   * Determine if an update is significant enough to trigger evaluation
   */
  private isSignificantUpdate(updates: ModelUpdateRequest): boolean {
    // Trigger evaluation for performance metric updates, status changes to ready, or metadata changes
    return !!(
      updates.performanceMetrics ||
      updates.status === 'ready' ||
      (updates.metadata && Object.keys(updates.metadata).length > 0)
    );
  }

  /**
   * Select appropriate evaluation suite based on model characteristics
   */
  private selectEvaluationSuite(model: ModelMetadata): 'standard' | 'comprehensive' | 'security' | 'performance' {
    // Production models get comprehensive evaluation
    if (model.status === 'ready' && model.tags.includes('production')) {
      return 'comprehensive';
    }

    // Security-sensitive models get security-focused evaluation
    if (model.tags.some(tag => ['security', 'finance', 'healthcare', 'pii'].includes(tag))) {
      return 'security';
    }

    // Performance-critical models get performance-focused evaluation
    if (model.tags.some(tag => ['realtime', 'low-latency', 'high-throughput'].includes(tag))) {
      return 'performance';
    }

    // Default to standard evaluation
    return 'standard';
  }

  /**
   * Determine evaluation priority based on model and trigger context
   */
  private determinePriority(
    model: ModelMetadata, 
    triggeredBy: 'model_upload' | 'model_update'
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Production models get high priority
    if (model.status === 'ready' && model.tags.includes('production')) {
      return 'critical';
    }

    // Security or healthcare models get high priority
    if (model.tags.some(tag => ['security', 'healthcare', 'finance'].includes(tag))) {
      return 'high';
    }

    // New uploads get medium priority, updates get lower
    return triggeredBy === 'model_upload' ? 'medium' : 'low';
  }

  private initializeSampleData(): void {
    // Create sample models for demonstration
    const sampleModels: ModelMetadata[] = [
      {
        id: this.generateUUID(),
        name: 'GPT-4 Fine-tuned Customer Support',
        description: 'Fine-tuned GPT-4 model for customer support conversations',
        modelType: 'language_model',
        framework: 'huggingface',
        version: '1.2.3',
        status: 'ready',
        tags: ['nlp', 'customer-support', 'fine-tuned'],
        owner: 'ai-team@company.com',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        size: 7000000000, // 7GB
        performanceMetrics: {
          accuracy: 0.94,
          precision: 0.92,
          recall: 0.91,
          f1Score: 0.915,
          inferenceTime: 150,
          memoryUsage: 4096,
          throughput: 45
        },
        artifactPath: 'https://storage.example.com/models/gpt4-support/model.bin',
        configPath: 'https://storage.example.com/models/gpt4-support/config.json',
        metadata: { domain: 'customer_service', language: 'en' }
      },
      {
        id: this.generateUUID(),
        name: 'BERT Sentiment Classifier',
        description: 'BERT-based sentiment analysis model for social media content',
        modelType: 'classification',
        framework: 'pytorch',
        version: '2.0.1',
        status: 'ready',
        tags: ['nlp', 'sentiment', 'bert', 'social-media'],
        owner: 'data-science@company.com',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date().toISOString(),
        size: 440000000, // 440MB
        performanceMetrics: {
          accuracy: 0.89,
          precision: 0.87,
          recall: 0.88,
          f1Score: 0.875,
          inferenceTime: 45,
          memoryUsage: 512,
          throughput: 200
        },
        artifactPath: 'https://storage.example.com/models/bert-sentiment/model.pth',
        configPath: 'https://storage.example.com/models/bert-sentiment/config.json',
        metadata: { domain: 'social_media', classes: ['positive', 'negative', 'neutral'] }
      }
    ];

    sampleModels.forEach(model => {
      this.models.set(model.id, model);
      this.updateSearchIndex(model);
      
      // Create sample versions
      const sampleVersion: ModelVersion = {
        id: this.generateUUID(),
        modelId: model.id,
        version: model.version,
        changes: [{
          type: 'architecture',
          description: 'Initial model version'
        }],
        createdAt: model.createdAt,
        isActive: true
      };
      
      this.versions.set(model.id, [sampleVersion]);
      
      // Initialize lineage
      this.lineages.set(model.id, {
        modelId: model.id,
        parentModels: [],
        childModels: [],
        trainingDatasets: []
      });
    });
  }
}