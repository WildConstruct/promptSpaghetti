/**
 * Epic 26.5 - Training Data Management API Routes
 * REST API endpoints for managing training datasets, labeling workflows, and data quality
 * 
 * Provides comprehensive training data management capabilities including dataset creation,
 * labeling workflows, quality assessment, versioning, and data augmentation features
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { TrainingDataService } from '../services/training-data-service';

// Request schemas for training data endpoints
const CreateDatasetSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(['classification', 'regression', 'text_generation', 'question_answering', 'sentiment_analysis', 'named_entity_recognition']),
  format: z.enum(['json', 'csv', 'jsonl', 'parquet', 'tfrecord']),
  metadata: z.record(z.unknown()).default({}),
  labels: z.array(z.string()).default([]),
  source: z.enum(['upload', 'api', 'synthetic', 'augmented']).default('upload')
});

const ImportDatasetSchema = z.object({
  name: z.string().min(1).max(200),
  source_url: z.string().url().optional(),
  source_type: z.enum(['file_upload', 'url', 's3', 'gcs', 'database']),
  format: z.enum(['json', 'csv', 'jsonl', 'parquet', 'tfrecord']),
  validation_rules: z.array(z.object({
    field: z.string(),
    rule_type: z.enum(['required', 'type', 'range', 'regex', 'custom']),
    parameters: z.record(z.unknown()).default({})
  })).default([]),
  auto_labeling: z.boolean().default(false)
});

const LabelingTaskSchema = z.object({
  dataset_id: z.string().uuid(),
  task_name: z.string().min(1).max(200),
  task_type: z.enum(['classification', 'entity_extraction', 'text_annotation', 'image_annotation', 'quality_review']),
  instructions: z.string(),
  label_schema: z.object({
    labels: z.array(z.object({
      name: z.string(),
      description: z.string().optional(),
      color: z.string().optional(),
      hotkey: z.string().optional()
    })),
    annotation_type: z.enum(['single_label', 'multi_label', 'span_annotation', 'hierarchical'])
  }),
  assignment_strategy: z.enum(['round_robin', 'random', 'skill_based', 'consensus']).default('round_robin'),
  quality_requirements: z.object({
    consensus_threshold: z.number().min(0).max(1).default(0.8),
    minimum_annotators: z.number().int().min(1).default(1),
    expert_review_percentage: z.number().min(0).max(100).default(10)
  }).default({})
});

const DataAugmentationSchema = z.object({
  dataset_id: z.string().uuid(),
  augmentation_techniques: z.array(z.enum([
    'synonym_replacement',
    'random_insertion',
    'random_swap', 
    'random_deletion',
    'paraphrasing',
    'back_translation',
    'noise_injection',
    'mixup',
    'cutout',
    'rotation',
    'scaling'
  ])),
  augmentation_factor: z.number().min(1).max(10).default(2),
  preserve_labels: z.boolean().default(true),
  quality_threshold: z.number().min(0).max(1).default(0.7)
});

const QualityAssessmentSchema = z.object({
  dataset_id: z.string().uuid(),
  assessment_type: z.enum(['completeness', 'consistency', 'accuracy', 'bias_detection', 'duplication_check']),
  parameters: z.record(z.unknown()).default({}),
  generate_report: z.boolean().default(true)
});

const DatasetVersionSchema = z.object({
  dataset_id: z.string().uuid(),
  version_name: z.string().min(1).max(100),
  description: z.string().optional(),
  changes: z.array(z.object({
    type: z.enum(['added', 'modified', 'deleted', 'relabeled']),
    count: z.number().int().min(0),
    description: z.string().optional()
  })).default([]),
  parent_version_id: z.string().uuid().optional()
});

// Response schemas
const DatasetSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.string(),
  format: z.string(),
  size: z.number().int(),
  labels: z.array(z.string()),
  status: z.enum(['creating', 'ready', 'processing', 'error']),
  created_at: z.string(),
  updated_at: z.string(),
  version: z.string(),
  quality_metrics: z.object({
    completeness_score: z.number(),
    consistency_score: z.number(),
    bias_score: z.number(),
    duplication_rate: z.number()
  }).optional()
});

export async function trainingDataRoutes(fastify: FastifyInstance) {
  const trainingDataService = new TrainingDataService();

  // Dataset creation endpoint
  fastify.post('/api/training-data/datasets', {
    schema: {
      body: CreateDatasetSchema,
      response: {
        201: DatasetSchema
      }
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof CreateDatasetSchema>
  }>, reply: FastifyReply) => {
    try {
      const datasetData = request.body;
      const dataset = await trainingDataService.createDataset(datasetData);
      
      reply.code(201);
      return dataset;
    } catch (error) {
      reply.code(400);
      return {
        error: 'Dataset creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Import dataset endpoint
  fastify.post('/api/training-data/datasets/import', {
    schema: {
      body: ImportDatasetSchema
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof ImportDatasetSchema>
  }>, reply: FastifyReply) => {
    try {
      const importData = request.body;
      const importJob = await trainingDataService.importDataset(importData);
      
      reply.code(202); // Accepted - processing asynchronously
      return {
        job_id: importJob.id,
        status: importJob.status,
        estimated_completion_time: importJob.estimatedCompletionTime,
        progress_url: `/api/training-data/import-jobs/${importJob.id}`
      };
    } catch (error) {
      reply.code(400);
      return {
        error: 'Dataset import failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Get dataset details endpoint
  fastify.get('/api/training-data/datasets/:id', async (request: FastifyRequest<{
    Params: { id: string }
  }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const dataset = await trainingDataService.getDataset(id);
      
      if (!dataset) {
        reply.code(404);
        return { error: 'Dataset not found' };
      }
      
      return dataset;
    } catch (error) {
      reply.code(500);
      return {
        error: 'Failed to retrieve dataset',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // List datasets endpoint
  fastify.get('/api/training-data/datasets', {
    schema: {
      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        type: z.enum(['classification', 'regression', 'text_generation', 'question_answering', 'sentiment_analysis', 'named_entity_recognition']).optional(),
        status: z.enum(['creating', 'ready', 'processing', 'error']).optional(),
        search: z.string().optional()
      })
    }
  }, async (request: FastifyRequest<{
    Querystring: { page: number; limit: number; type?: string; status?: string; search?: string }
  }>, reply: FastifyReply) => {
    try {
      const { page, limit, type, status, search } = request.query;
      const result = await trainingDataService.listDatasets({
        page,
        limit,
        filters: { type, status, search }
      });
      
      return {
        datasets: result.datasets,
        total: result.total,
        page,
        limit,
        total_pages: Math.ceil(result.total / limit)
      };
    } catch (error) {
      reply.code(500);
      return {
        error: 'Failed to list datasets',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Create labeling task endpoint
  fastify.post('/api/training-data/labeling-tasks', {
    schema: {
      body: LabelingTaskSchema
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof LabelingTaskSchema>
  }>, reply: FastifyReply) => {
    try {
      const taskData = request.body;
      const labelingTask = await trainingDataService.createLabelingTask(taskData);
      
      reply.code(201);
      return {
        id: labelingTask.id,
        name: labelingTask.name,
        status: labelingTask.status,
        created_at: labelingTask.createdAt,
        assignment_url: `/api/training-data/labeling-tasks/${labelingTask.id}/assignments`,
        progress: labelingTask.progress
      };
    } catch (error) {
      reply.code(400);
      return {
        error: 'Labeling task creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Get labeling task status endpoint
  fastify.get('/api/training-data/labeling-tasks/:id', async (request: FastifyRequest<{
    Params: { id: string }
  }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const task = await trainingDataService.getLabelingTask(id);
      
      if (!task) {
        reply.code(404);
        return { error: 'Labeling task not found' };
      }
      
      return task;
    } catch (error) {
      reply.code(500);
      return {
        error: 'Failed to retrieve labeling task',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Data augmentation endpoint
  fastify.post('/api/training-data/augmentation', {
    schema: {
      body: DataAugmentationSchema
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof DataAugmentationSchema>
  }>, reply: FastifyReply) => {
    try {
      const augmentationData = request.body;
      const augmentationJob = await trainingDataService.augmentData(augmentationData);
      
      reply.code(202); // Accepted - processing asynchronously
      return {
        job_id: augmentationJob.id,
        status: augmentationJob.status,
        original_size: augmentationJob.originalSize,
        target_size: augmentationJob.targetSize,
        techniques_applied: augmentationJob.techniques,
        progress_url: `/api/training-data/augmentation-jobs/${augmentationJob.id}`
      };
    } catch (error) {
      reply.code(400);
      return {
        error: 'Data augmentation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Quality assessment endpoint
  fastify.post('/api/training-data/quality-assessment', {
    schema: {
      body: QualityAssessmentSchema
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof QualityAssessmentSchema>
  }>, reply: FastifyReply) => {
    try {
      const assessmentData = request.body;
      const assessment = await trainingDataService.assessQuality(assessmentData);
      
      return {
        assessment_id: assessment.id,
        dataset_id: assessmentData.dataset_id,
        type: assessmentData.assessment_type,
        results: assessment.results,
        score: assessment.score,
        recommendations: assessment.recommendations,
        report_url: assessment.reportUrl,
        completed_at: assessment.completedAt
      };
    } catch (error) {
      reply.code(400);
      return {
        error: 'Quality assessment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Dataset versioning endpoint
  fastify.post('/api/training-data/datasets/:id/versions', {
    schema: {
      body: DatasetVersionSchema
    }
  }, async (request: FastifyRequest<{
    Params: { id: string };
    Body: z.infer<typeof DatasetVersionSchema>
  }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const versionData = { ...request.body, dataset_id: id };
      const version = await trainingDataService.createDatasetVersion(versionData);
      
      reply.code(201);
      return {
        version_id: version.id,
        version_name: version.name,
        dataset_id: id,
        created_at: version.createdAt,
        changes: version.changes,
        size: version.size,
        parent_version_id: version.parentVersionId
      };
    } catch (error) {
      reply.code(400);
      return {
        error: 'Dataset version creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Get dataset versions endpoint
  fastify.get('/api/training-data/datasets/:id/versions', async (request: FastifyRequest<{
    Params: { id: string }
  }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const versions = await trainingDataService.getDatasetVersions(id);
      
      return {
        dataset_id: id,
        versions: versions.map(version => ({
          version_id: version.id,
          version_name: version.name,
          created_at: version.createdAt,
          size: version.size,
          changes_summary: version.changes,
          is_current: version.isCurrent
        }))
      };
    } catch (error) {
      reply.code(500);
      return {
        error: 'Failed to retrieve dataset versions',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Export dataset endpoint
  fastify.post('/api/training-data/datasets/:id/export', {
    schema: {
      body: z.object({
        format: z.enum(['json', 'csv', 'jsonl', 'parquet', 'tfrecord']).default('json'),
        include_metadata: z.boolean().default(true),
        version_id: z.string().uuid().optional(),
        filter: z.object({
          labels: z.array(z.string()).optional(),
          quality_threshold: z.number().min(0).max(1).optional(),
          date_range: z.object({
            start: z.string().datetime().optional(),
            end: z.string().datetime().optional()
          }).optional()
        }).default({})
      })
    }
  }, async (request: FastifyRequest<{
    Params: { id: string };
    Body: { format: string; include_metadata: boolean; version_id?: string; filter: any }
  }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const { format, include_metadata, version_id, filter } = request.body;
      
      const exportJob = await trainingDataService.exportDataset(id, {
        format,
        includeMetadata: include_metadata,
        versionId: version_id,
        filter
      });
      
      reply.code(202); // Accepted - processing asynchronously
      return {
        export_job_id: exportJob.id,
        status: exportJob.status,
        format,
        estimated_size: exportJob.estimatedSize,
        download_url: exportJob.downloadUrl,
        progress_url: `/api/training-data/export-jobs/${exportJob.id}`
      };
    } catch (error) {
      reply.code(400);
      return {
        error: 'Dataset export failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Delete dataset endpoint
  fastify.delete('/api/training-data/datasets/:id', async (request: FastifyRequest<{
    Params: { id: string }
  }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      await trainingDataService.deleteDataset(id);
      
      reply.code(204);
      return;
    } catch (error) {
      reply.code(400);
      return {
        error: 'Dataset deletion failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Get job status endpoint (generic for import, augmentation, export jobs)
  fastify.get('/api/training-data/jobs/:jobId', async (request: FastifyRequest<{
    Params: { jobId: string }
  }>, reply: FastifyReply) => {
    try {
      const { jobId } = request.params;
      const job = await trainingDataService.getJobStatus(jobId);
      
      if (!job) {
        reply.code(404);
        return { error: 'Job not found' };
      }
      
      return {
        job_id: jobId,
        status: job.status,
        progress: job.progress,
        started_at: job.startedAt,
        completed_at: job.completedAt,
        error_message: job.errorMessage,
        result: job.result
      };
    } catch (error) {
      reply.code(500);
      return {
        error: 'Failed to retrieve job status',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Training data service health check endpoint
  fastify.get('/api/training-data/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const healthStatus = await trainingDataService.getHealthStatus();
      
      return {
        status: healthStatus.status,
        details: healthStatus.details,
        checked_at: new Date().toISOString()
      };
    } catch (error) {
      reply.code(503);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        checked_at: new Date().toISOString()
      };
    }
  });

  // Get dataset statistics endpoint
  fastify.get('/api/training-data/datasets/:id/statistics', async (request: FastifyRequest<{
    Params: { id: string }
  }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const statistics = await trainingDataService.getDatasetStatistics(id);
      
      return {
        dataset_id: id,
        total_samples: statistics.totalSamples,
        label_distribution: statistics.labelDistribution,
        quality_metrics: statistics.qualityMetrics,
        size_metrics: statistics.sizeMetrics,
        temporal_metrics: statistics.temporalMetrics,
        generated_at: statistics.generatedAt
      };
    } catch (error) {
      reply.code(500);
      return {
        error: 'Failed to generate dataset statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
}