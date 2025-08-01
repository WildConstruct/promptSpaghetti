/**
 * Epic 26.1 - Model Registry & Versioning Service Unit Tests
 * Comprehensive test suite for model registration, versioning, search, and management
 */

import { ModelRegistryService } from '../model-registry-service';

describe('ModelRegistryService', () => {
  let service: ModelRegistryService;

  beforeEach(() => {
    service = new ModelRegistryService(false); // Don't initialize sample data for tests
  });

  describe('Model Registration', () => {
    const validRegistrationRequest = {
      name: 'Test Model',
      description: 'A test model for unit testing',
      modelType: 'language_model' as const,
      framework: 'pytorch' as const,
      version: '1.0.0',
      owner: 'test-user@example.com',
      tags: ['test', 'nlp'],
      performanceMetrics: {
        accuracy: 0.95,
        inferenceTime: 100,
        memoryUsage: 1024

      metadata: { test: true }
    };

    it('should successfully register a new model', async () => {
      const model = await service.registerModel(validRegistrationRequest);

      expect(model).toBeDefined();
      expect(model.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(model.name).toBe(validRegistrationRequest.name);
      expect(model.description).toBe(validRegistrationRequest.description);
      expect(model.modelType).toBe(validRegistrationRequest.modelType);
      expect(model.framework).toBe(validRegistrationRequest.framework);
      expect(model.version).toBe(validRegistrationRequest.version);
      expect(model.status).toBe('training');
      expect(model.tags).toEqual(validRegistrationRequest.tags);
      expect(model.owner).toBe(validRegistrationRequest.owner);
      expect(model.performanceMetrics).toEqual(validRegistrationRequest.performanceMetrics);
      expect(model.metadata).toEqual(validRegistrationRequest.metadata);
      expect(model.createdAt).toBeDefined();
      expect(model.updatedAt).toBeDefined();
    });

    it('should create initial version when registering model', async () => {
      const model = await service.registerModel(validRegistrationRequest);
      const versions = await service.getModelVersions(model.id);

      expect(versions).toHaveLength(1);
      expect(versions[0].version).toBe(validRegistrationRequest.version);
      expect(versions[0].modelId).toBe(model.id);
      expect(versions[0].isActive).toBe(true);
      expect(versions[0].changes).toHaveLength(1);
      expect(versions[0].changes[0].type).toBe('architecture');
      expect(versions[0].changes[0].description).toBe('Initial model registration');
    });

    it('should initialize model lineage on registration', async () => {
      const model = await service.registerModel(validRegistrationRequest);
      const lineage = await service.getModelLineage(model.id);

      expect(lineage).toBeDefined();
      expect(lineage!.modelId).toBe(model.id);
      expect(lineage!.parentModels).toEqual([]);
      expect(lineage!.childModels).toEqual([]);
      expect(lineage!.trainingDatasets).toEqual([]);
    });

    it('should handle registration with minimal required fields', async () => {
      const minimalRequest = {
        name: 'Minimal Model',
        modelType: 'classification' as const,
        framework: 'tensorflow' as const,
        version: '1.0.0',
        owner: 'minimal-user@example.com'
      };

      const model = await service.registerModel(minimalRequest);

      expect(model).toBeDefined();
      expect(model.name).toBe(minimalRequest.name);
      expect(model.description).toBeUndefined();
      expect(model.tags).toEqual([]);
      expect(model.metadata).toEqual({});
    });

    it('should throw error for invalid registration data', async () => {
      const invalidRequest = {
        name: '', // Invalid: empty name
        modelType: 'language_model' as const,
        framework: 'pytorch' as const,
        version: '1.0.0',
        owner: 'test-user@example.com'
      };

      await expect(service.registerModel(invalidRequest)).rejects.toThrow('Model registration failed');
    });
  });

  describe('Model Retrieval and Updates', () => {
    let testModelId: string;

    beforeEach(async () => {
      const model = await service.registerModel({
        name: 'Test Retrieval Model',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'test-user@example.com'
      });
      testModelId = model.id;
    });

    it('should retrieve model by ID', async () => {
      const model = await service.getModel(testModelId);

      expect(model).toBeDefined();
      expect(model!.id).toBe(testModelId);
      expect(model!.name).toBe('Test Retrieval Model');
    });

    it('should return null for non-existent model', async () => {
      const model = await service.getModel('non-existent-id');
      expect(model).toBeNull();
    });

    it('should successfully update model', async () => {
      const originalModel = await service.getModel(testModelId);
      
      // Wait a small amount to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 5));
      
      const updates = {
        name: 'Updated Test Model',
        description: 'Updated description',
        status: 'ready' as const,
        tags: ['updated', 'test'],
        performanceMetrics: {
          accuracy: 0.98,
          inferenceTime: 50

      };

      const updatedModel = await service.updateModel(testModelId, updates);

      expect(updatedModel.name).toBe(updates.name);
      expect(updatedModel.description).toBe(updates.description);
      expect(updatedModel.status).toBe(updates.status);
      expect(updatedModel.tags).toEqual(updates.tags);
      expect(updatedModel.performanceMetrics).toEqual(updates.performanceMetrics);
      expect(new Date(updatedModel.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(originalModel!.createdAt).getTime()
      );
    });

    it('should throw error when updating non-existent model', async () => {
      await expect(service.updateModel('non-existent-id', { name: 'Updated' }))
        .rejects.toThrow('Model update failed');
    });
  });

  describe('Model Versioning', () => {
    let testModelId: string;

    beforeEach(async () => {
      const model = await service.registerModel({
        name: 'Versioning Test Model',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'test-user@example.com'
      });
      testModelId = model.id;
    });

    it('should create new model version', async () => {
      const changes = [
        {
          type: 'hyperparameters' as const,
          description: 'Updated learning rate to 0.001'

        {
          type: 'training_data' as const,
          description: 'Added 10k new training samples'

      ];

      const newVersion = await service.createModelVersion(testModelId, '1.1.0', changes);

      expect(newVersion).toBeDefined();
      expect(newVersion.version).toBe('1.1.0');
      expect(newVersion.modelId).toBe(testModelId);
      expect(newVersion.changes).toEqual(changes);
      expect(newVersion.isActive).toBe(true);
    });

    it('should deactivate previous versions when creating new version', async () => {
      await service.createModelVersion(testModelId, '1.1.0', []);
      await service.createModelVersion(testModelId, '1.2.0', []);

      const versions = await service.getModelVersions(testModelId);
      const activeVersions = versions.filter(v => v.isActive);

      expect(versions).toHaveLength(3); // Initial + 2 new versions
      expect(activeVersions).toHaveLength(1);
      expect(activeVersions[0].version).toBe('1.2.0');
    });

    it('should prevent duplicate version numbers', async () => {
      await service.createModelVersion(testModelId, '1.1.0', []);
      
      await expect(service.createModelVersion(testModelId, '1.1.0', []))
        .rejects.toThrow('Version 1.1.0 already exists for this model');
    });

    it('should support parent version relationships', async () => {
      const version1 = await service.createModelVersion(testModelId, '1.1.0', []);
      const version2 = await service.createModelVersion(testModelId, '1.2.0', [], version1.id);

      expect(version2.parentVersionId).toBe(version1.id);
    });

    it('should retrieve specific model version', async () => {
      const newVersion = await service.createModelVersion(testModelId, '1.1.0', []);
      const retrievedVersion = await service.getModelVersion(testModelId, newVersion.id);

      expect(retrievedVersion).toBeDefined();
      expect(retrievedVersion!.id).toBe(newVersion.id);
      expect(retrievedVersion!.version).toBe('1.1.0');
    });

    it('should return null for non-existent version', async () => {
      const version = await service.getModelVersion(testModelId, 'non-existent-version-id');
      expect(version).toBeNull();
    });

    it('should throw error when creating version for non-existent model', async () => {
      await expect(service.createModelVersion('non-existent-id', '2.0.0', []))
        .rejects.toThrow('Model not found');
    });
  });

  describe('Model Search', () => {

    beforeEach(async () => {
      // Clear any existing models first for clean test environment
      service = new ModelRegistryService(false);
      
      // Create test models with different characteristics
      await service.registerModel({
        name: 'GPT Model',
        description: 'Language generation model',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'ai-team@example.com',
        tags: ['nlp', 'generation'],
        performanceMetrics: { accuracy: 0.95, inferenceTime: 100 }
      });

      await service.registerModel({
        name: 'BERT Classifier',
        description: 'Text classification model',
        modelType: 'classification',
        framework: 'tensorflow',
        version: '2.0.0',
        owner: 'ml-team@example.com',
        tags: ['nlp', 'classification'],
        performanceMetrics: { accuracy: 0.88, inferenceTime: 50 }
      });

      await service.registerModel({
        name: 'Vision Transformer',
        description: 'Image classification model',
        modelType: 'vision_model',
        framework: 'pytorch',
        version: '1.5.0',
        owner: 'cv-team@example.com',
        tags: ['vision', 'transformer'],
        performanceMetrics: { accuracy: 0.92, inferenceTime: 200 }
      });
    });

    it('should search models by text query', async () => {
      const result = await service.searchModels({
        query: 'GPT',
        page: 1,
        limit: 10
      });

      expect(result.models).toHaveLength(1);
      expect(result.models[0].name).toBe('GPT Model');
      expect(result.total).toBe(1);
    });

    it('should filter models by type', async () => {
      const result = await service.searchModels({
        modelType: 'language_model',
        page: 1,
        limit: 10
      });

      expect(result.models).toHaveLength(1);
      expect(result.models[0].modelType).toBe('language_model');
    });

    it('should filter models by framework', async () => {
      const result = await service.searchModels({
        framework: 'pytorch',
        page: 1,
        limit: 10
      });

      expect(result.models).toHaveLength(2);
      result.models.forEach(model => {
        expect(model.framework).toBe('pytorch');
      });
    });

    it('should filter models by owner', async () => {
      const result = await service.searchModels({
        owner: 'ai-team@example.com',
        page: 1,
        limit: 10
      });

      expect(result.models).toHaveLength(1);
      expect(result.models[0].owner).toBe('ai-team@example.com');
    });

    it('should filter models by tags', async () => {
      const result = await service.searchModels({
        tags: ['nlp'],
        page: 1,
        limit: 10
      });

      expect(result.models).toHaveLength(2);
      result.models.forEach(model => {
        expect(model.tags).toContain('nlp');
      });
    });

    it('should filter models by minimum accuracy', async () => {
      const result = await service.searchModels({
        minAccuracy: 0.9,
        page: 1,
        limit: 10
      });

      expect(result.models).toHaveLength(2); // GPT (0.95) and Vision (0.92)
      result.models.forEach(model => {
        expect(model.performanceMetrics!.accuracy!).toBeGreaterThanOrEqual(0.9);
      });
    });

    it('should filter models by maximum inference time', async () => {
      const result = await service.searchModels({
        maxInferenceTime: 100,
        page: 1,
        limit: 10
      });

      expect(result.models).toHaveLength(2); // GPT (100ms) and BERT (50ms)
      result.models.forEach(model => {
        expect(model.performanceMetrics!.inferenceTime!).toBeLessThanOrEqual(100);
      });
    });

    it('should sort models by name', async () => {
      const result = await service.searchModels({
        sortBy: 'name',
        sortOrder: 'asc',
        page: 1,
        limit: 10
      });

      expect(result.models[0].name).toBe('BERT Classifier');
      expect(result.models[1].name).toBe('GPT Model');
    });

    it('should sort models by accuracy descending', async () => {
      const result = await service.searchModels({
        sortBy: 'accuracy',
        sortOrder: 'desc',
        page: 1,
        limit: 10
      });

      const accuracies = result.models.map(m => m.performanceMetrics?.accuracy || 0);
      expect(accuracies[0]).toBeGreaterThanOrEqual(accuracies[1]);
    });

    it('should handle pagination', async () => {
      const page1 = await service.searchModels({ page: 1, limit: 2 });
      const page2 = await service.searchModels({ page: 2, limit: 2 });

      expect(page1.models).toHaveLength(2);
      expect(page1.page).toBe(1);
      expect(page1.totalPages).toBe(2); // 3 models total, 2 per page
      
      expect(page2.models).toHaveLength(1);
      expect(page2.page).toBe(2);

      // Ensure no overlap between pages
      const page1Ids = page1.models.map(m => m.id);
      const page2Ids = page2.models.map(m => m.id);
      expect(page1Ids).not.toEqual(expect.arrayContaining(page2Ids));
    });

    it('should combine multiple filters', async () => {
      const result = await service.searchModels({
        modelType: 'classification',
        framework: 'tensorflow',
        tags: ['nlp'],
        minAccuracy: 0.85,
        page: 1,
        limit: 10
      });

      expect(result.models).toHaveLength(1);
      const model = result.models[0];
      expect(model.modelType).toBe('classification');
      expect(model.framework).toBe('tensorflow');
      expect(model.tags).toContain('nlp');
      expect(model.performanceMetrics!.accuracy!).toBeGreaterThanOrEqual(0.85);
    });
  });

  describe('Model Comparison', () => {
    let model1Id: string;
    let model2Id: string;

    beforeEach(async () => {
      const model1 = await service.registerModel({
        name: 'Model A',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'test@example.com',
        performanceMetrics: {
          accuracy: 0.95,
          precision: 0.93,
          inferenceTime: 100

      });

      const model2 = await service.registerModel({
        name: 'Model B',
        modelType: 'language_model',
        framework: 'tensorflow',
        version: '1.0.0',
        owner: 'test@example.com',
        performanceMetrics: {
          accuracy: 0.88,
          precision: 0.90,
          inferenceTime: 50

      });

      model1Id = model1.id;
      model2Id = model2.id;
    });

    it('should compare models and return metrics', async () => {
      const comparison = await service.compareModels({
        modelIds: [model1Id, model2Id],
        metrics: ['accuracy', 'precision', 'inferenceTime']
      });

      expect(comparison.models).toHaveLength(2);
      expect(comparison.models[0].metrics.accuracy).toBe(0.95);
      expect(comparison.models[0].metrics.precision).toBe(0.93);
      expect(comparison.models[1].metrics.accuracy).toBe(0.88);
      expect(comparison.models[1].metrics.precision).toBe(0.90);
    });

    it('should identify best performing model for each metric', async () => {
      const comparison = await service.compareModels({
        modelIds: [model1Id, model2Id],
        metrics: ['accuracy', 'precision', 'inferenceTime']
      });

      expect(comparison.bestPerforming.accuracy).toBe(model1Id); // Model A has higher accuracy
      expect(comparison.bestPerforming.precision).toBe(model1Id); // Model A has higher precision
      expect(comparison.bestPerforming.inferenceTime).toBe(model2Id); // Model B has better (lower) inference time
    });

    it('should generate recommendations', async () => {
      const comparison = await service.compareModels({
        modelIds: [model1Id, model2Id],
        metrics: ['accuracy', 'inferenceTime']
      });

      expect(comparison.recommendations).toHaveLength(1);
      expect(comparison.recommendations[0]).toContain('Consider using the model with');
    });

    it('should throw error for non-existent models', async () => {
      await expect(service.compareModels({
        modelIds: [model1Id, 'non-existent-id'],
        metrics: ['accuracy']
      })).rejects.toThrow('One or more models not found');
    });
  });

  describe('Model Lineage', () => {
    let parentModelId: string;
    let childModelId: string;

    beforeEach(async () => {
      const parentModel = await service.registerModel({
        name: 'Parent Model',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'test@example.com'
      });

      const childModel = await service.registerModel({
        name: 'Child Model',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'test@example.com'
      });

      parentModelId = parentModel.id;
      childModelId = childModel.id;
    });

    it('should retrieve model lineage', async () => {
      const lineage = await service.getModelLineage(parentModelId);

      expect(lineage).toBeDefined();
      expect(lineage!.modelId).toBe(parentModelId);
      expect(lineage!.parentModels).toEqual([]);
      expect(lineage!.childModels).toEqual([]);
      expect(lineage!.trainingDatasets).toEqual([]);
    });

    it('should update model lineage with parent relationships', async () => {
      const updatedLineage = await service.updateModelLineage(childModelId, {
        parentModels: [{
          id: parentModelId,
          name: 'Parent Model',
          version: '1.0.0',
          relationship: 'fine_tuned_from'
]
      });

      expect(updatedLineage.parentModels).toHaveLength(1);
      expect(updatedLineage.parentModels[0].id).toBe(parentModelId);
      expect(updatedLineage.parentModels[0].relationship).toBe('fine_tuned_from');
    });

    it('should update model lineage with training datasets', async () => {
      // Generate a proper UUID
      const datasetId = '550e8400-e29b-41d4-a716-446655440000';
      const updatedLineage = await service.updateModelLineage(parentModelId, {
        trainingDatasets: [{
          id: datasetId,
          name: 'Training Dataset v1',
          version: '1.0.0',
          size: 10000
]
      });

      expect(updatedLineage.trainingDatasets).toHaveLength(1);
      expect(updatedLineage.trainingDatasets[0].id).toBe(datasetId);
    });

    it('should return null for non-existent model lineage', async () => {
      const lineage = await service.getModelLineage('non-existent-id');
      expect(lineage).toBeNull();
    });

    it('should throw error when updating lineage for non-existent model', async () => {
      await expect(service.updateModelLineage('non-existent-id', {}))
        .rejects.toThrow('Model not found');
    });
  });

  describe('Model Deletion', () => {
    let testModelId: string;

    beforeEach(async () => {
      const model = await service.registerModel({
        name: 'Model to Delete',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'test@example.com'
      });
      testModelId = model.id;
    });

    it('should delete model and all associated data', async () => {
      // Create some versions first
      await service.createModelVersion(testModelId, '1.1.0', []);
      
      // Verify data exists before deletion
      expect(await service.getModel(testModelId)).not.toBeNull();
      expect(await service.getModelVersions(testModelId)).toHaveLength(2);
      expect(await service.getModelLineage(testModelId)).not.toBeNull();

      // Delete the model
      await service.deleteModel(testModelId);

      // Verify all data is removed
      expect(await service.getModel(testModelId)).toBeNull();
      await expect(service.getModelVersions(testModelId)).rejects.toThrow('Model not found');
      expect(await service.getModelLineage(testModelId)).toBeNull();
    });

    it('should throw error when deleting non-existent model', async () => {
      await expect(service.deleteModel('non-existent-id')).rejects.toThrow('Model not found');
    });
  });

  describe('Registry Statistics', () => {
    beforeEach(async () => {
      // Clear service for clean statistics
      service = new ModelRegistryService(false);
      
      // Create diverse set of models for statistics
      await service.registerModel({
        name: 'Language Model 1',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'team1@example.com',
        tags: ['nlp', 'transformer'],
        performanceMetrics: { accuracy: 0.95, inferenceTime: 100 }
      });

      await service.registerModel({
        name: 'Language Model 2',
        modelType: 'language_model',
        framework: 'tensorflow',
        version: '1.0.0',
        owner: 'team2@example.com',
        tags: ['nlp', 'bert'],
        performanceMetrics: { accuracy: 0.88, inferenceTime: 50 }
      });

      await service.registerModel({
        name: 'Vision Model',
        modelType: 'vision_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'team1@example.com',
        tags: ['computer-vision', 'cnn'],
        performanceMetrics: { accuracy: 0.92, inferenceTime: 200 }
      });
    });

    it('should generate comprehensive registry statistics', async () => {
      const stats = await service.getRegistryStatistics();

      expect(stats.totalModels).toBe(3);
      expect(stats.modelsByType['language_model']).toBe(2);
      expect(stats.modelsByType['vision_model']).toBe(1);
      expect(stats.modelsByFramework['pytorch']).toBe(2);
      expect(stats.modelsByFramework['tensorflow']).toBe(1);
      expect(stats.averageAccuracy).toBeCloseTo(0.917); // (0.95 + 0.88 + 0.92) / 3
      expect(stats.averageInferenceTime).toBeCloseTo(116.67); // (100 + 50 + 200) / 3
      expect(stats.popularTags).toHaveLength(5);
      expect(stats.recentActivity).toHaveLength(3);
    });

    it('should return popular tags in descending order', async () => {
      const stats = await service.getRegistryStatistics();
      
      expect(stats.popularTags[0].tag).toBe('nlp'); // Appears in 2 models
      expect(stats.popularTags[0].count).toBe(2);
    });
  });

  describe('Service Health', () => {
    it('should return healthy status with details', async () => {
      const health = await service.getHealthStatus();

      expect(health.status).toBe('healthy');
      expect(health.details).toBeDefined();
      expect(health.details!.totalModels).toBeGreaterThanOrEqual(0);
      expect(health.details!.totalVersions).toBeGreaterThanOrEqual(0);
      expect(health.details!.lastActivity).toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty search results', async () => {
      const result = await service.searchModels({
        query: 'nonexistent-model-xyz',
        page: 1,
        limit: 10
      });

      expect(result.models).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should handle search with page beyond results', async () => {
      const result = await service.searchModels({
        page: 999,
        limit: 10
      });

      expect(result.models).toHaveLength(0);
      expect(result.page).toBe(999);
    });

    it('should handle comparison with single model', async () => {
      const model = await service.registerModel({
        name: 'Single Model',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'test@example.com',
        performanceMetrics: { accuracy: 0.90 }
      });

      const comparison = await service.compareModels({
        modelIds: [model.id],
        metrics: ['accuracy']
      });

      expect(comparison.models).toHaveLength(1);
      expect(comparison.bestPerforming.accuracy).toBe(model.id);
      expect(comparison.recommendations).toContain('All models show similar performance characteristics');
    });

    it('should handle models without performance metrics in comparison', async () => {
      const model1 = await service.registerModel({
        name: 'Model Without Metrics',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'test@example.com'
      });

      const model2 = await service.registerModel({
        name: 'Model With Metrics',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'test@example.com',
        performanceMetrics: { accuracy: 0.90 }
      });

      const comparison = await service.compareModels({
        modelIds: [model1.id, model2.id],
        metrics: ['accuracy']
      });

      expect(comparison.models).toHaveLength(2);
      expect(comparison.models[0].metrics.accuracy).toBeUndefined();
      expect(comparison.models[1].metrics.accuracy).toBe(0.90);
      expect(comparison.bestPerforming.accuracy).toBe(model2.id);
    });

    it('should validate model metadata schema on updates', async () => {
      const model = await service.registerModel({
        name: 'Schema Test Model',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'test@example.com'
      });

      // This should work - valid status
      await expect(service.updateModel(model.id, { status: 'ready' })).resolves.toBeDefined();

      // This should fail - invalid performance metrics
      await expect(service.updateModel(model.id, { 
        performanceMetrics: { accuracy: 1.5 } // Invalid: accuracy > 1
      })).rejects.toThrow('Model update failed');
    });

    it('should handle concurrent version creation attempts', async () => {
      const model = await service.registerModel({
        name: 'Concurrent Test Model',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'test@example.com'
      });

      // Create the same version twice - second should fail
      const version1Promise = service.createModelVersion(model.id, '1.1.0', []);
      
      await expect(version1Promise).resolves.toBeDefined();
      await expect(service.createModelVersion(model.id, '1.1.0', [])).rejects.toThrow('Version 1.1.0 already exists');
    });
  });

  describe('Search Index Management', () => {
    it('should update search index when model is registered', async () => {
      await service.registerModel({
        name: 'Searchable Test Model',
        description: 'Model for search testing',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'search-test@example.com',
        tags: ['search', 'test']
      });

      // Search by name
      const nameResult = await service.searchModels({ query: 'Searchable', page: 1, limit: 10 });
      expect(nameResult.models).toHaveLength(1);

      // Search by description
      const descResult = await service.searchModels({ query: 'search testing', page: 1, limit: 10 });
      expect(descResult.models).toHaveLength(1);

      // Search by tag
      const tagResult = await service.searchModels({ query: 'search', page: 1, limit: 10 });
      expect(tagResult.models).toHaveLength(1);
    });

    it('should update search index when model is updated', async () => {
      const model = await service.registerModel({
        name: 'Original Name',
        modelType: 'language_model',
        framework: 'pytorch',
        version: '1.0.0',
        owner: 'test@example.com'
      });

      // Update model name
      await service.updateModel(model.id, { name: 'Updated Name' });

      // Search should find updated name
      const result = await service.searchModels({ query: 'Updated', page: 1, limit: 10 });
      expect(result.models).toHaveLength(1);
      expect(result.models[0].name).toBe('Updated Name');
    });
  });
});