/**
 * Model Evaluation Trigger Service - Epic 26.3
 * 
 * Triggers CI evaluation workflows when new models are uploaded to the registry.
 * Integrates with GitHub Actions to automatically evaluate model performance,
 * quality metrics, and compliance when models are registered or updated.
 * 
 * Task: T-1752989144419-71 - Add CI task triggering evaluation on new model upload
 */

import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { AuditService } from '../auth/services/AuditService';

const exec = promisify(execCallback);

export interface ModelEvaluationTriggerRequest {
  modelId: string;
  modelName: string;
  version: string;
  modelType: string;
  framework: string;
  owner: string;
  artifactPath?: string;
  configPath?: string;
  triggeredBy: 'model_upload' | 'model_update' | 'manual_trigger';
  evaluationSuite?: 'standard' | 'comprehensive' | 'security' | 'performance';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ModelEvaluationJob {
  id: string;
  modelId: string;
  version: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  evaluationSuite: string;
  triggeredAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  results?: ModelEvaluationResults;
  error?: string;
  githubRunId?: string;
  githubRunUrl?: string;
  priority: string;
}

export interface ModelEvaluationResults {
  overall: {
    score: number;
    status: 'passed' | 'failed' | 'warning';
    summary: string;
  };
  performance: {
    accuracy?: number;
    latency?: number;
    throughput?: number;
    memoryUsage?: number;
    score: number;
  };
  security: {
    vulnerabilities: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    passed: boolean;
    score: number;
  };
  compliance: {
    checks: Array<{
      name: string;
      status: 'passed' | 'failed' | 'skipped';
      description: string;
    }>;
    overallStatus: 'compliant' | 'non_compliant' | 'partial';
    score: number;
  };
  qualityMetrics: {
    bias: number;
    fairness: number;
    robustness: number;
    score: number;
  };
  recommendations: string[];
  artifacts: {
    reportPath?: string;
    metricsPath?: string;
    logsPath?: string;
  };
}

export interface ModelEvaluationConfig {
  enabled: boolean;
  defaultEvaluationSuite: 'standard' | 'comprehensive' | 'security' | 'performance';
  autoTriggerOnUpload: boolean;
  autoTriggerOnUpdate: boolean;
  githubToken: string;
  repositoryOwner: string;
  repositoryName: string;
  workflowFileName: string;
  defaultBranch: string;
  maxConcurrentEvaluations: number;
  evaluationTimeout: number; // seconds
  retryAttempts: number;
  notificationWebhook?: string;
  evaluationEnvironments: {
    development: boolean;
    staging: boolean;
    production: boolean;
  };
  qualityGates: {
    minAccuracy: number;
    maxLatency: number;
    maxVulnerabilities: number;
    requiredCompliance: string[];
  };
}

export class ModelEvaluationTriggerService {
  private jobs: Map<string, ModelEvaluationJob>;
  private config: ModelEvaluationConfig;
  private auditService?: AuditService;

  constructor(config: ModelEvaluationConfig, auditService?: AuditService) {
    this.jobs = new Map();
    this.config = config;
    this.auditService = auditService;
  }

  /**
   * Trigger model evaluation workflow
   */
  async triggerEvaluation(request: ModelEvaluationTriggerRequest): Promise<ModelEvaluationJob> {

    try {
      // Check if service is enabled
      if (!this.config.enabled) {
        throw new Error('Model evaluation triggering is disabled');
      }

      // Check for existing running evaluation for this model
      const existingJob = this.findRunningEvaluation(request.modelId, request.version);
      if (existingJob) {
        throw new Error(`Evaluation already running for model ${request.modelId} version ${request.version}`);
      }

      // Check concurrent evaluation limits
      const runningJobs = Array.from(this.jobs.values()).filter(
        job => job.status === 'running' || job.status === 'queued'
      );
      
      if (runningJobs.length >= this.config.maxConcurrentEvaluations) {
        throw new Error(`Maximum concurrent evaluations (${this.config.maxConcurrentEvaluations}) reached`);
      }

      // Create evaluation job
      const job: ModelEvaluationJob = {
        id: this.generateJobId(),
        modelId: request.modelId,
        version: request.version,
        status: 'queued',
        evaluationSuite: request.evaluationSuite || this.config.defaultEvaluationSuite,
        triggeredAt: new Date(),
        priority: request.priority || 'medium'
      };

      this.jobs.set(job.id, job);

      // Trigger GitHub Actions workflow
      const githubResult = await this.triggerGitHubWorkflow(request, job);
      
      // Update job with GitHub details
      job.githubRunId = githubResult.runId;
      job.githubRunUrl = githubResult.runUrl;
      job.status = 'running';
      job.startedAt = new Date();

      // Log audit event
      await this.auditService?.logEvent({
        eventType: 'MODEL_EVALUATION_TRIGGERED',
        details: {
          jobId: job.id,
          modelId: request.modelId,
          version: request.version,
          evaluationSuite: job.evaluationSuite,
          triggeredBy: request.triggeredBy,
          githubRunId: job.githubRunId,
          priority: job.priority
        },
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['AI_GOVERNANCE'],
          requirements: ['model_evaluation', 'automated_testing'],
          evidenceLevel: 'STANDARD'
        }
      });

      return job;

    } catch (error) {
      // Log error event
      await this.auditService?.logEvent({
        eventType: 'MODEL_EVALUATION_TRIGGER_FAILED',
        details: {
          modelId: request.modelId,
          version: request.version,
          error: error.message,
          triggeredBy: request.triggeredBy
        },
        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['AI_GOVERNANCE'],
          requirements: ['error_handling'],
          evidenceLevel: 'ENHANCED'
        }
      });

      throw new Error(`Failed to trigger model evaluation: ${error.message}`);
    }
  }

  /**
   * Trigger GitHub Actions workflow via GitHub CLI or API
   */
  private async triggerGitHubWorkflow(
    request: ModelEvaluationTriggerRequest, 
    job: ModelEvaluationJob
  ): Promise<{ runId: string; runUrl: string }> {

    try {
      const workflowInputs = {
        modelId: request.modelId,
        modelName: request.modelName,
        version: request.version,
        modelType: request.modelType,
        framework: request.framework,
        owner: request.owner,
        evaluationSuite: job.evaluationSuite,
        priority: job.priority,
        jobId: job.id,
        artifactPath: request.artifactPath || '',
        configPath: request.configPath || ''
      };

      // Build GitHub CLI command
      const inputsFlag = Object.entries(workflowInputs)
        .map(([key, value]) => `-f ${key}=${value}`)
        .join(' ');

      const command = [
        'gh workflow run',
        this.config.workflowFileName,
        inputsFlag,
        `--repo ${this.config.repositoryOwner}/${this.config.repositoryName}`,
        `--ref ${this.config.defaultBranch}`
      ].join(' ');

      // Execute GitHub CLI command
      const { stdout, stderr } = await exec(command, {
        env: {
          ...process.env,
          GITHUB_TOKEN: this.config.githubToken
        }
      });

      if (stderr && !stderr.includes('successfully queued')) {
        throw new Error(`GitHub CLI error: ${stderr}`);
      }

      // Extract run ID from output (GitHub CLI doesn't return structured output)
      // In a real implementation, you might use GitHub API directly for better control
      const runId = this.extractRunIdFromOutput(stdout) || this.generateRunId();
      const runUrl = `https://github.com/${this.config.repositoryOwner}/${this.config.repositoryName}/actions/runs/${runId}`;

      return { runId, runUrl };

    } catch (error) {
      throw new Error(`Failed to trigger GitHub workflow: ${error.message}`);
    }
  }

  /**
   * Get evaluation job status
   */
  async getEvaluationJob(jobId: string): Promise<ModelEvaluationJob | null> {

    return this.jobs.get(jobId) || null;
  }

  /**
   * Get all evaluation jobs for a model
   */
  async getModelEvaluationJobs(modelId: string): Promise<ModelEvaluationJob[]> {

    return Array.from(this.jobs.values()).filter(job => job.modelId === modelId);
  }

  /**
   * Update evaluation job status (called by webhook from CI)
   */
  async updateEvaluationStatus(
    jobId: string, 
    status: ModelEvaluationJob['status'], 
    results?: ModelEvaluationResults,
    error?: string
  ): Promise<void> {

    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Evaluation job ${jobId} not found`);
    }

    job.status = status;
    job.results = results;
    job.error = error;

    if (status === 'completed' || status === 'failed') {
      job.completedAt = new Date();
    }

    // Log status update
    await this.auditService?.logEvent({
      eventType: 'MODEL_EVALUATION_STATUS_UPDATED',
      details: {
        jobId,
        modelId: job.modelId,
        version: job.version,
        status,
        duration: job.completedAt && job.startedAt 
          ? job.completedAt.getTime() - job.startedAt.getTime() 
          : undefined,
        hasResults: !!results,
        error
      },
      riskLevel: status === 'failed' ? 'HIGH' : 'LOW',
      compliance: {
        frameworks: ['AI_GOVERNANCE'],
        requirements: ['evaluation_tracking'],
        evidenceLevel: 'STANDARD'
      }
    });
  }

  /**
   * Cancel evaluation job
   */
  async cancelEvaluation(jobId: string): Promise<void> {

    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Evaluation job ${jobId} not found`);
    }

    if (job.status === 'completed' || job.status === 'failed') {
      throw new Error(`Cannot cancel ${job.status} evaluation`);
    }

    job.status = 'cancelled';
    job.completedAt = new Date();

    // TODO: Cancel GitHub workflow run if possible
    // This would require GitHub API integration

    await this.auditService?.logEvent({
      eventType: 'MODEL_EVALUATION_CANCELLED',
      details: {
        jobId,
        modelId: job.modelId,
        version: job.version,
        originalStatus: job.status
      },
      riskLevel: 'MEDIUM',
      compliance: {
        frameworks: ['AI_GOVERNANCE'],
        requirements: ['evaluation_control'],
        evidenceLevel: 'STANDARD'
      }
    });
  }

  /**
   * Get evaluation statistics
   */
  async getEvaluationStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byEvaluationSuite: Record<string, number>;
    byPriority: Record<string, number>;
    averageDuration: number;
    successRate: number;
    recentJobs: ModelEvaluationJob[];
  }> {
    const jobs = Array.from(this.jobs.values());
    const completedJobs = jobs.filter(job => job.completedAt);
    
    const statistics = {
      total: jobs.length,
      byStatus: this.groupBy(jobs, 'status'),
      byEvaluationSuite: this.groupBy(jobs, 'evaluationSuite'),
      byPriority: this.groupBy(jobs, 'priority'),
      averageDuration: completedJobs.length > 0 
        ? completedJobs.reduce((sum, job) => {
          const duration = job.completedAt!.getTime() - (job.startedAt?.getTime() || job.triggeredAt.getTime());
          return sum + duration;
        }, 0) / completedJobs.length
        : 0,
      successRate: completedJobs.length > 0 
        ? jobs.filter(job => job.status === 'completed').length / completedJobs.length 
        : 0,
      recentJobs: jobs
        .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
        .slice(0, 10)
    };

    return statistics;
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{ 
    status: string; 
    details: Record<string, any> 
  }> {
    try {
      const runningJobs = Array.from(this.jobs.values()).filter(
        job => job.status === 'running' || job.status === 'queued'
      );

      return {
        status: 'healthy',
        details: {
          enabled: this.config.enabled,
          runningJobs: runningJobs.length,
          maxConcurrentEvaluations: this.config.maxConcurrentEvaluations,
          totalJobs: this.jobs.size,
          githubIntegration: !!this.config.githubToken,
          lastActivity: runningJobs.length > 0 
            ? Math.max(...runningJobs.map(job => job.triggeredAt.getTime()))
            : 'none'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          enabled: this.config.enabled
        }
      };
    }
  }

  // Private helper methods

  private findRunningEvaluation(modelId: string, version: string): ModelEvaluationJob | undefined {
    return Array.from(this.jobs.values()).find(
      job => job.modelId === modelId && 
             job.version === version && 
             (job.status === 'running' || job.status === 'queued')
    );
  }

  private generateJobId(): string {
    return `eval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRunId(): string {
    return Date.now().toString();
  }

  private extractRunIdFromOutput(output: string): string | null {
    // GitHub CLI output parsing - this is a simplified version
    // In practice, you might want to use GitHub API for more reliable results
    const match = output.match(/run\s+(\d+)/i);
    return match ? match[1] : null;
  }

  private groupBy(items: unknown[], key: string): Record<string, number> {
    const result: Record<string, number> = {};
    items.forEach(item => {
      const value = String(item[key]);
      result[value] = (result[value] || 0) + 1;
    });
    return result;
  }
}

// Default configuration for development
export const defaultModelEvaluationConfig: ModelEvaluationConfig = {
  enabled: true,
  defaultEvaluationSuite: 'standard',
  autoTriggerOnUpload: true,
  autoTriggerOnUpdate: true,
  githubToken: process.env.GITHUB_TOKEN || '',
  repositoryOwner: process.env.GITHUB_OWNER || '',
  repositoryName: process.env.GITHUB_REPO || '',
  workflowFileName: 'model-evaluation.yml',
  defaultBranch: 'main',
  maxConcurrentEvaluations: 5,
  evaluationTimeout: 3600,
  retryAttempts: 3,
  evaluationEnvironments: {
    development: true,
    staging: true,
    production: false
  },
  qualityGates: {
    minAccuracy: 0.8,
    maxLatency: 1000,
    maxVulnerabilities: 0,
    requiredCompliance: ['AI_GOVERNANCE']
  }
};

export default ModelEvaluationTriggerService;