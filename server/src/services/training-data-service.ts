/**
 * Epic 26.5 - Training Data Management Service
 * Service for managing training datasets, labeling workflows, quality assessment, and data augmentation
 * 
 * Provides comprehensive training data lifecycle management including dataset creation,
 * import/export, labeling task orchestration, quality assessment, versioning, and augmentation
 */

import { z } from 'zod';

// Training data types and schemas
const DatasetSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['classification', 'regression', 'text_generation', 'question_answering', 'sentiment_analysis', 'named_entity_recognition']),
  format: z.enum(['json', 'csv', 'jsonl', 'parquet', 'tfrecord']),
  size: z.number().int(),
  labels: z.array(z.string()),
  status: z.enum(['creating', 'ready', 'processing', 'error']),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.string(),
  qualityMetrics: z.object({
    completenessScore: z.number(),
    consistencyScore: z.number(),
    biasScore: z.number(),
    duplicationRate: z.number()
  }).optional()
});

const LabelingTaskSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  datasetId: z.string().uuid(),
  taskType: z.enum(['classification', 'entity_extraction', 'text_annotation', 'image_annotation', 'quality_review']),
  instructions: z.string(),
  labelSchema: z.object({
    labels: z.array(z.object({
      name: z.string(),
      description: z.string().optional(),
      color: z.string().optional(),
      hotkey: z.string().optional()
    })),
    annotationType: z.enum(['single_label', 'multi_label', 'span_annotation', 'hierarchical'])
  }),
  status: z.enum(['created', 'in_progress', 'completed', 'paused', 'cancelled']),
  progress: z.object({
    totalSamples: z.number().int(),
    completedSamples: z.number().int(),
    consensusAchieved: z.number().int(),
    qualityScore: z.number().optional()
  }),
  createdAt: z.string(),
  assignmentStrategy: z.enum(['round_robin', 'random', 'skill_based', 'consensus'])
});

const ImportJobSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  estimatedCompletionTime: z.string().optional(),
  errorMessage: z.string().optional(),
  result: z.record(z.unknown()).optional()
});

const AugmentationJobSchema = z.object({
  id: z.string().uuid(),
  datasetId: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  originalSize: z.number().int(),
  targetSize: z.number().int(),
  techniques: z.array(z.string()),
  progress: z.number().min(0).max(100),
  qualityScore: z.number().optional()
});

const QualityAssessmentSchema = z.object({
  id: z.string().uuid(),
  datasetId: z.string().uuid(),
  type: z.enum(['completeness', 'consistency', 'accuracy', 'bias_detection', 'duplication_check']),
  results: z.record(z.unknown()),
  score: z.number().min(0).max(100),
  recommendations: z.array(z.string()),
  reportUrl: z.string().optional(),
  completedAt: z.string()
});

const DatasetVersionSchema = z.object({
  id: z.string().uuid(),
  datasetId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  size: z.number().int(),
  changes: z.array(z.object({
    type: z.enum(['added', 'modified', 'deleted', 'relabeled']),
    count: z.number().int(),
    description: z.string().optional()
  })),
  createdAt: z.string(),
  parentVersionId: z.string().uuid().optional(),
  isCurrent: z.boolean()
});

const ExportJobSchema = z.object({
  id: z.string().uuid(),
  datasetId: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  format: z.string(),
  estimatedSize: z.string(),
  downloadUrl: z.string().optional(),
  progress: z.number().min(0).max(100)
});

// Type definitions
type Dataset = z.infer<typeof DatasetSchema>;
type LabelingTask = z.infer<typeof LabelingTaskSchema>;
type ImportJob = z.infer<typeof ImportJobSchema>;
type AugmentationJob = z.infer<typeof AugmentationJobSchema>;
type QualityAssessment = z.infer<typeof QualityAssessmentSchema>;
type DatasetVersion = z.infer<typeof DatasetVersionSchema>;
type ExportJob = z.infer<typeof ExportJobSchema>;

interface DatasetCreateRequest {
  name: string;
  description?: string;
  type: Dataset['type'];
  format: Dataset['format'];
  metadata?: Record<string, unknown>;
  labels?: string[];
  source?: 'upload' | 'api' | 'synthetic' | 'augmented';
}

interface DatasetImportRequest {
  name: string;
  source_url?: string;
  source_type: 'file_upload' | 'url' | 's3' | 'gcs' | 'database';
  format: Dataset['format'];
  validation_rules?: Array<{
    field: string;
    rule_type: 'required' | 'type' | 'range' | 'regex' | 'custom';
    parameters?: Record<string, unknown>;
  }>;
  auto_labeling?: boolean;
}

interface LabelingTaskRequest {
  dataset_id: string;
  task_name: string;
  task_type: LabelingTask['taskType'];
  instructions: string;
  label_schema: LabelingTask['labelSchema'];
  assignment_strategy?: LabelingTask['assignmentStrategy'];
  quality_requirements?: {
    consensus_threshold?: number;
    minimum_annotators?: number;
    expert_review_percentage?: number;
  };
}

interface DataAugmentationRequest {
  dataset_id: string;
  augmentation_techniques: string[];
  augmentation_factor: number;
  preserve_labels: boolean;
  quality_threshold: number;
}

interface QualityAssessmentRequest {
  dataset_id: string;
  assessment_type: QualityAssessment['type'];
  parameters?: Record<string, unknown>;
  generate_report: boolean;
}

interface DatasetVersionRequest {
  dataset_id: string;
  version_name: string;
  description?: string;
  changes?: Array<{
    type: 'added' | 'modified' | 'deleted' | 'relabeled';
    count: number;
    description?: string;
  }>;
  parent_version_id?: string;
}

interface ExportRequest {
  format: string;
  includeMetadata: boolean;
  versionId?: string;
  filter?: Record<string, unknown>;
}

interface DatasetListOptions {
  page: number;
  limit: number;
  filters?: {
    type?: string;
    status?: string;
    search?: string;
  };
}

interface DatasetStatistics {
  totalSamples: number;
  labelDistribution: Record<string, number>;
  qualityMetrics: {
    completeness: number;
    consistency: number;
    bias: number;
    duplication: number;
  };
  sizeMetrics: {
    totalSizeBytes: number;
    averageSampleSize: number;
    minSampleSize: number;
    maxSampleSize: number;
  };
  temporalMetrics: {
    creationRate: Record<string, number>;
    labelingRate: Record<string, number>;
  };
  generatedAt: string;
}

export class TrainingDataService {
  private datasets: Map<string, Dataset>;
  private labelingTasks: Map<string, LabelingTask>;
  private importJobs: Map<string, ImportJob>;
  private augmentationJobs: Map<string, AugmentationJob>;
  private exportJobs: Map<string, ExportJob>;
  private datasetVersions: Map<string, DatasetVersion[]>;

  constructor() {
    this.datasets = new Map();
    this.labelingTasks = new Map();
    this.importJobs = new Map();
    this.augmentationJobs = new Map();
    this.exportJobs = new Map();
    this.datasetVersions = new Map();
    this.initializeSampleData();
  }

  /**
   * Create a new training dataset
   */
  async createDataset(request: DatasetCreateRequest): Promise<Dataset> {
    try {
      const dataset: Dataset = {
        id: this.generateUUID(),
        name: request.name,
        description: request.description,
        type: request.type,
        format: request.format,
        size: 0,
        labels: request.labels || [],
        status: 'creating',
        metadata: request.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      this.datasets.set(dataset.id, dataset);

      // Simulate dataset creation process
      setTimeout(() => {
        const updatedDataset = this.datasets.get(dataset.id);
        if (updatedDataset) {
          updatedDataset.status = 'ready';
          updatedDataset.size = Math.floor(Math.random() * 10000) + 1000;
          updatedDataset.qualityMetrics = {
            completenessScore: Math.random() * 20 + 80,
            consistencyScore: Math.random() * 15 + 85,
            biasScore: Math.random() * 30 + 70,
            duplicationRate: Math.random() * 5
          };
          this.datasets.set(dataset.id, updatedDataset);
        }
      }, 2000);

      return dataset;
    } catch (error) {
      throw new Error(`Dataset creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import dataset from external source
   */
  async importDataset(request: DatasetImportRequest): Promise<ImportJob> {
    try {
      const importJob: ImportJob = {
        id: this.generateUUID(),
        status: 'pending',
        progress: 0,
        startedAt: new Date().toISOString(),
        estimatedCompletionTime: new Date(Date.now() + 300000).toISOString() // 5 minutes
      };

      this.importJobs.set(importJob.id, importJob);

      // Simulate import process
      this.simulateImportJob(importJob.id, request);

      return importJob;
    } catch (error) {
      throw new Error(`Dataset import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get dataset by ID
   */
  async getDataset(id: string): Promise<Dataset | null> {
    return this.datasets.get(id) || null;
  }

  /**
   * List datasets with filtering and pagination
   */
  async listDatasets(options: DatasetListOptions): Promise<{
    datasets: Dataset[];
    total: number;
  }> {
    let datasets = Array.from(this.datasets.values());

    // Apply filters
    if (options.filters) {
      const { type, status, search } = options.filters;
      
      if (type) {
        datasets = datasets.filter(d => d.type === type);
      }
      
      if (status) {
        datasets = datasets.filter(d => d.status === status);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        datasets = datasets.filter(d => 
          d.name.toLowerCase().includes(searchLower) ||
          (d.description && d.description.toLowerCase().includes(searchLower))
        );
      }
    }

    const total = datasets.length;
    const startIndex = (options.page - 1) * options.limit;
    const paginatedDatasets = datasets.slice(startIndex, startIndex + options.limit);

    return {
      datasets: paginatedDatasets,
      total
    };
  }

  /**
   * Create labeling task
   */
  async createLabelingTask(request: LabelingTaskRequest): Promise<LabelingTask> {
    try {
      const dataset = await this.getDataset(request.dataset_id);
      if (!dataset) {
        throw new Error('Dataset not found');
      }

      const labelingTask: LabelingTask = {
        id: this.generateUUID(),
        name: request.task_name,
        datasetId: request.dataset_id,
        taskType: request.task_type,
        instructions: request.instructions,
        labelSchema: request.label_schema,
        status: 'created',
        progress: {
          totalSamples: dataset.size,
          completedSamples: 0,
          consensusAchieved: 0
        },
        createdAt: new Date().toISOString(),
        assignmentStrategy: request.assignment_strategy || 'round_robin'
      };

      this.labelingTasks.set(labelingTask.id, labelingTask);

      // Simulate labeling progress
      this.simulateLabelingProgress(labelingTask.id);

      return labelingTask;
    } catch (error) {
      throw new Error(`Labeling task creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get labeling task by ID
   */
  async getLabelingTask(id: string): Promise<LabelingTask | null> {
    return this.labelingTasks.get(id) || null;
  }

  /**
   * Augment dataset with various techniques
   */
  async augmentData(request: DataAugmentationRequest): Promise<AugmentationJob> {
    try {
      const dataset = await this.getDataset(request.dataset_id);
      if (!dataset) {
        throw new Error('Dataset not found');
      }

      const augmentationJob: AugmentationJob = {
        id: this.generateUUID(),
        datasetId: request.dataset_id,
        status: 'pending',
        originalSize: dataset.size,
        targetSize: Math.floor(dataset.size * request.augmentation_factor),
        techniques: request.augmentation_techniques,
        progress: 0
      };

      this.augmentationJobs.set(augmentationJob.id, augmentationJob);

      // Simulate augmentation process
      this.simulateAugmentationJob(augmentationJob.id);

      return augmentationJob;
    } catch (error) {
      throw new Error(`Data augmentation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Assess dataset quality
   */
  async assessQuality(request: QualityAssessmentRequest): Promise<QualityAssessment> {
    try {
      const dataset = await this.getDataset(request.dataset_id);
      if (!dataset) {
        throw new Error('Dataset not found');
      }

      // Simulate quality assessment based on type
      const assessment = await this.performQualityAssessment(request);
      return assessment;
    } catch (error) {
      throw new Error(`Quality assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create dataset version
   */
  async createDatasetVersion(request: DatasetVersionRequest): Promise<DatasetVersion> {
    try {
      const dataset = await this.getDataset(request.dataset_id);
      if (!dataset) {
        throw new Error('Dataset not found');
      }

      const version: DatasetVersion = {
        id: this.generateUUID(),
        datasetId: request.dataset_id,
        name: request.version_name,
        description: request.description,
        size: dataset.size,
        changes: request.changes || [],
        createdAt: new Date().toISOString(),
        parentVersionId: request.parent_version_id,
        isCurrent: true
      };

      // Update previous versions to not be current
      const existingVersions = this.datasetVersions.get(request.dataset_id) || [];
      existingVersions.forEach(v => v.isCurrent = false);
      existingVersions.push(version);
      this.datasetVersions.set(request.dataset_id, existingVersions);

      return version;
    } catch (error) {
      throw new Error(`Dataset version creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get dataset versions
   */
  async getDatasetVersions(datasetId: string): Promise<DatasetVersion[]> {
    return this.datasetVersions.get(datasetId) || [];
  }

  /**
   * Export dataset
   */
  async exportDataset(datasetId: string, options: ExportRequest): Promise<ExportJob> {
    try {
      const dataset = await this.getDataset(datasetId);
      if (!dataset) {
        throw new Error('Dataset not found');
      }

      const exportJob: ExportJob = {
        id: this.generateUUID(),
        datasetId,
        status: 'pending',
        format: options.format,
        estimatedSize: this.estimateExportSize(dataset, options),
        progress: 0
      };

      this.exportJobs.set(exportJob.id, exportJob);

      // Simulate export process
      this.simulateExportJob(exportJob.id);

      return exportJob;
    } catch (error) {
      throw new Error(`Dataset export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete dataset
   */
  async deleteDataset(id: string): Promise<void> {
    const dataset = await this.getDataset(id);
    if (!dataset) {
      throw new Error('Dataset not found');
    }

    // Remove dataset and related data
    this.datasets.delete(id);
    this.datasetVersions.delete(id);

    // Remove related labeling tasks
    const relatedTasks = Array.from(this.labelingTasks.values())
      .filter(task => task.datasetId === id);
    relatedTasks.forEach(task => this.labelingTasks.delete(task.id));
  }

  /**
   * Get job status (generic for all job types)
   */
  async getJobStatus(jobId: string): Promise<ImportJob | AugmentationJob | ExportJob | null> {
    return this.importJobs.get(jobId) || 
           this.augmentationJobs.get(jobId) || 
           this.exportJobs.get(jobId) || 
           null;
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{ status: string; details?: Record<string, unknown> }> {
    try {
      return {
        status: 'healthy',
        details: {
          totalDatasets: this.datasets.size,
          activeLabelingTasks: Array.from(this.labelingTasks.values())
            .filter(task => task.status === 'in_progress').length,
          runningJobs: Array.from(this.importJobs.values())
            .filter(job => job.status === 'processing').length +
                      Array.from(this.augmentationJobs.values())
            .filter(job => job.status === 'processing').length +
                      Array.from(this.exportJobs.values())
            .filter(job => job.status === 'processing').length
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

  /**
   * Get dataset statistics
   */
  async getDatasetStatistics(datasetId: string): Promise<DatasetStatistics> {
    const dataset = await this.getDataset(datasetId);
    if (!dataset) {
      throw new Error('Dataset not found');
    }

    // Generate mock statistics
    const statistics: DatasetStatistics = {
      totalSamples: dataset.size,
      labelDistribution: this.generateLabelDistribution(dataset.labels),
      qualityMetrics: {
        completeness: dataset.qualityMetrics?.completenessScore || 85,
        consistency: dataset.qualityMetrics?.consistencyScore || 90,
        bias: dataset.qualityMetrics?.biasScore || 75,
        duplication: dataset.qualityMetrics?.duplicationRate || 3
      },
      sizeMetrics: {
        totalSizeBytes: dataset.size * 1024, // Approximate
        averageSampleSize: 1024,
        minSampleSize: 256,
        maxSampleSize: 4096
      },
      temporalMetrics: {
        creationRate: this.generateTemporalMetrics('creation'),
        labelingRate: this.generateTemporalMetrics('labeling')
      },
      generatedAt: new Date().toISOString()
    };

    return statistics;
  }

  // Private helper methods

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private async simulateImportJob(jobId: string, request: DatasetImportRequest): Promise<void> {
    const job = this.importJobs.get(jobId);
    if (!job) return;

    // Simulate progressive import
    const intervals = [10, 30, 60, 85, 100];
    let currentInterval = 0;

    const updateProgress = () => {
      if (currentInterval < intervals.length) {
        job.progress = intervals[currentInterval];
        job.status = 'processing';
        currentInterval++;
        
        if (currentInterval < intervals.length) {
          setTimeout(updateProgress, 1000);
        } else {
          // Complete the import
          job.status = 'completed';
          job.completedAt = new Date().toISOString();
          job.result = {
            datasetId: this.generateUUID(),
            samplesImported: Math.floor(Math.random() * 5000) + 1000,
            validationPassed: true
          };

          // Create the actual dataset
          this.createDataset({
            name: request.name,
            type: 'text_generation', // Default for import
            format: request.format,
            source: 'api'
          });
        }
        
        this.importJobs.set(jobId, job);
      }
    };

    updateProgress();
  }

  private simulateLabelingProgress(taskId: string): void {
    const updateProgress = () => {
      const task = this.labelingTasks.get(taskId);
      if (!task || task.status === 'completed') return;

      if (task.progress.completedSamples < task.progress.totalSamples) {
        task.status = 'in_progress';
        task.progress.completedSamples += Math.floor(Math.random() * 50) + 10;
        task.progress.consensusAchieved += Math.floor(Math.random() * 30) + 5;
        
        if (task.progress.completedSamples >= task.progress.totalSamples) {
          task.status = 'completed';
          task.progress.qualityScore = Math.random() * 20 + 80;
        }
        
        this.labelingTasks.set(taskId, task);
        setTimeout(updateProgress, 2000);
      }
    };

    setTimeout(updateProgress, 1000);
  }

  private simulateAugmentationJob(jobId: string): void {
    const job = this.augmentationJobs.get(jobId);
    if (!job) return;

    const intervals = [0, 25, 50, 75, 100];
    let currentInterval = 0;

    const updateProgress = () => {
      if (currentInterval < intervals.length) {
        job.progress = intervals[currentInterval];
        job.status = 'processing';
        currentInterval++;
        
        if (currentInterval >= intervals.length) {
          job.status = 'completed';
          job.qualityScore = Math.random() * 20 + 75;
        }
        
        this.augmentationJobs.set(jobId, job);
        
        if (currentInterval < intervals.length) {
          setTimeout(updateProgress, 1500);
        }
      }
    };

    updateProgress();
  }

  private simulateExportJob(jobId: string): void {
    const job = this.exportJobs.get(jobId);
    if (!job) return;

    const intervals = [0, 40, 80, 100];
    let currentInterval = 0;

    const updateProgress = () => {
      if (currentInterval < intervals.length) {
        job.progress = intervals[currentInterval];
        job.status = 'processing';
        currentInterval++;
        
        if (currentInterval >= intervals.length) {
          job.status = 'completed';
          job.downloadUrl = `https://api.example.com/downloads/${jobId}.${job.format}`;
        }
        
        this.exportJobs.set(jobId, job);
        
        if (currentInterval < intervals.length) {
          setTimeout(updateProgress, 2000);
        }
      }
    };

    updateProgress();
  }

  private async performQualityAssessment(request: QualityAssessmentRequest): Promise<QualityAssessment> {
    const assessmentResults: Record<string, unknown> = {};
    const recommendations: string[] = [];
    let score = 85; // Base score

    switch (request.assessment_type) {
      case 'completeness':
        assessmentResults.missingFields = Math.floor(Math.random() * 5);
        assessmentResults.emptyValues = Math.floor(Math.random() * 10);
        if (assessmentResults.missingFields > 0) {
          recommendations.push('Fill in missing required fields');
          score -= assessmentResults.missingFields * 5;
        }
        break;

      case 'consistency':
        assessmentResults.inconsistentLabels = Math.floor(Math.random() * 3);
        assessmentResults.formatInconsistencies = Math.floor(Math.random() * 2);
        if (assessmentResults.inconsistentLabels > 0) {
          recommendations.push('Review and standardize label consistency');
          score -= assessmentResults.inconsistentLabels * 8;
        }
        break;

      case 'bias_detection':
        assessmentResults.genderBias = Math.random() * 0.3;
        assessmentResults.racialBias = Math.random() * 0.2;
        assessmentResults.ageBias = Math.random() * 0.25;
        if (assessmentResults.genderBias > 0.15) {
          recommendations.push('Address potential gender bias in dataset');
          score -= 15;
        }
        break;

      case 'duplication_check':
        assessmentResults.exactDuplicates = Math.floor(Math.random() * 20);
        assessmentResults.nearDuplicates = Math.floor(Math.random() * 50);
        if (assessmentResults.exactDuplicates > 0) {
          recommendations.push('Remove exact duplicate entries');
          score -= assessmentResults.exactDuplicates;
        }
        break;
    }

    return {
      id: this.generateUUID(),
      datasetId: request.dataset_id,
      type: request.assessment_type,
      results: assessmentResults,
      score: Math.max(0, Math.min(100, score)),
      recommendations,
      reportUrl: request.generate_report ? `https://api.example.com/reports/quality-${this.generateUUID()}.pdf` : undefined,
      completedAt: new Date().toISOString()
    };
  }

  private estimateExportSize(dataset: Dataset, options: ExportRequest): string {
    const baseSize = dataset.size * 1024; // Approximate bytes per sample
    const formatMultiplier = options.format === 'json' ? 1.5 : 
                           options.format === 'csv' ? 0.8 : 
                           options.format === 'parquet' ? 0.6 : 1.0;
    
    const estimatedBytes = baseSize * formatMultiplier;
    
    if (estimatedBytes < 1024 * 1024) {
      return `${Math.round(estimatedBytes / 1024)}KB`;
    } else if (estimatedBytes < 1024 * 1024 * 1024) {
      return `${Math.round(estimatedBytes / (1024 * 1024))}MB`;
    } else {
      return `${Math.round(estimatedBytes / (1024 * 1024 * 1024))}GB`;
    }
  }

  private generateLabelDistribution(labels: string[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    if (labels.length === 0) {
      return { 'unlabeled': 100 };
    }
    
    labels.forEach(label => {
      distribution[label] = Math.floor(Math.random() * 30) + 10;
    });
    
    return distribution;
  }

  private generateTemporalMetrics(type: 'creation' | 'labeling'): Record<string, number> {
    const metrics: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      metrics[dateKey] = Math.floor(Math.random() * 100) + 10;
    }
    
    return metrics;
  }

  private initializeSampleData(): void {
    // Create sample datasets for demonstration
    const sampleDatasets: Dataset[] = [
      {
        id: this.generateUUID(),
        name: 'Customer Reviews Dataset',
        description: 'Product reviews for sentiment analysis',
        type: 'sentiment_analysis',
        format: 'json',
        size: 15000,
        labels: ['positive', 'negative', 'neutral'],
        status: 'ready',
        metadata: { source: 'e-commerce', language: 'en' },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        version: '2.1.0',
        qualityMetrics: {
          completenessScore: 92,
          consistencyScore: 88,
          biasScore: 78,
          duplicationRate: 2.1
        }
      },
      {
        id: this.generateUUID(),
        name: 'Medical NER Dataset',
        description: 'Named entity recognition for medical texts',
        type: 'named_entity_recognition',
        format: 'jsonl',
        size: 8500,
        labels: ['DISEASE', 'DRUG', 'SYMPTOM', 'PROCEDURE'],
        status: 'ready',
        metadata: { domain: 'healthcare', hipaa_compliant: true },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.5.2',
        qualityMetrics: {
          completenessScore: 95,
          consistencyScore: 91,
          biasScore: 85,
          duplicationRate: 1.3
        }
      }
    ];

    sampleDatasets.forEach(dataset => {
      this.datasets.set(dataset.id, dataset);
    });
  }
}