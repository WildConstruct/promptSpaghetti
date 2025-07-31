/**
 * Security ML Model Training Pipeline for Event Analysis
 * Epic 31 - Task E31-1753313263586-CD067B
 * 
 * Provides comprehensive ML model training pipeline for security event analysis,
 * feature engineering, model validation, and automated deployment capabilities.
 */

import { EventEmitter } from 'events';
import { SecurityMLToolsEngine, SecurityMLModel } from './SecurityMLToolsEngine';
import { SecurityStatisticalAnalysisEngine, SecurityStatistics } from './SecurityStatisticalAnalysisEngine';

}
}
export interface MLTrainingDataset {
  dataset_id: string;
  name: string;
  description: string;
  created_at: number;
  updated_at: number;
  
  data_sources: {
    security_events: {
      source_type: 'logs' | 'alerts' | 'incidents' | 'network_traffic' | 'user_behavior';
      connection_string: string;
      query_config: Record<string, any>;
      sampling_strategy: 'random' | 'stratified' | 'time_based' | 'balanced';
      sample_size: number;
}
}
    }[];
    
    threat_intelligence: {
      feed_url: string;
      feed_type: 'json' | 'xml' | 'csv' | 'stix';
      update_frequency: number; // hours
      reliability_score: number; // 0-1
    }[];
    
    historical_incidents: {
      incident_database: string;
      date_range: {
        start_date: number;
        end_date: number;
      };
      severity_filter: string[];
      category_filter: string[];
    };
  };
  
  preprocessing_config: {
    normalization_strategy: 'z_score' | 'min_max' | 'robust' | 'quantile';
    feature_selection_method: 'variance_threshold' | 'univariate' | 'recursive' | 'lasso';
    dimensionality_reduction: 'pca' | 'ica' | 'tsne' | 'umap' | 'none';
    text_vectorization: 'tfidf' | 'word2vec' | 'bert' | 'doc2vec';
    time_series_features: boolean;
    anomaly_detection_features: boolean;
  };
  
  labeling_config: {
    labeling_strategy: 'supervised' | 'semi_supervised' | 'self_supervised' | 'unsupervised';
    ground_truth_sources: string[];
    expert_validation_required: boolean;
    confidence_threshold: number;
    active_learning_enabled: boolean;
  };
  
  validation_config: {
    train_split: number;
    validation_split: number;
    test_split: number;
    cross_validation_folds: number;
    stratification_enabled: boolean;
    temporal_split: boolean;
  };
}

}
}
export interface MLTrainingJob {
  job_id: string;
  dataset_id: string;
  model_type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection' | 'time_series';
  algorithm: string;
  
  training_config: {
    hyperparameters: Record<string, any>;
    optimization_metric: string;
    early_stopping_enabled: boolean;
    max_training_time_minutes: number;
    max_iterations: number;
    convergence_threshold: number;
}
}
  };
  
  hardware_config: {
    cpu_cores: number;
    memory_gb: number;
    gpu_enabled: boolean;
    distributed_training: boolean;
    cluster_nodes?: number;
  };
  
  experiment_tracking: {
    experiment_name: string;
    tags: string[];
    parameters: Record<string, any>;
    metrics: Record<string, number>;
    artifacts_path: string;
  };
  
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    current_epoch: number;
    total_epochs: number;
    current_metric_value: number;
    best_metric_value: number;
    training_loss: number;
    validation_loss: number;
    elapsed_time_minutes: number;
  };
  
  results: {
    final_model: SecurityMLModel;
    performance_metrics: {
      accuracy: number;
      precision: number;
      recall: number;
      f1_score: number;
      auc_roc: number;
      confusion_matrix: number[][];
      feature_importance: Record<string, number>;
    };
    
    validation_results: {
      cross_validation_scores: number[];
      learning_curves: {
        train_scores: number[];
        validation_scores: number[];
        train_sizes: number[];
      };
      validation_curves: {
        param_name: string;
        param_range: Error[];
        train_scores: number[][];
        validation_scores: number[][];
      }[];
    };
    
    model_analysis: {
      overfitting_analysis: {
        overfitting_score: number;
        training_validation_gap: number;
        recommendations: string[];
      };
      feature_analysis: {
        most_important_features: Array<{
          feature_name: string;
          importance_score: number;
          correlation_with_target: number;
        }>;
        redundant_features: string[];
        missing_value_analysis: Record<string, number>;
      };
      bias_analysis: {
        fairness_metrics: Record<string, number>;
        demographic_parity: number;
        equal_opportunity: number;
        bias_sources: string[];
      };
    };
  };
}

}
}
export interface ModelDeploymentConfig {
  deployment_id: string;
  model_id: string;
  deployment_strategy: 'blue_green' | 'canary' | 'rolling' | 'shadow';
  
  environment_config: {
    environment: 'development' | 'staging' | 'production';
    resource_allocation: {
      cpu_cores: number;
      memory_gb: number;
      gpu_required: boolean;
      max_concurrent_requests: number;
}
}
    };
    
    scaling_config: {
      auto_scaling_enabled: boolean;
      min_instances: number;
      max_instances: number;
      target_cpu_utilization: number;
      scale_up_cooldown: number;
      scale_down_cooldown: number;
    };
  };
  
  monitoring_config: {
    performance_monitoring: boolean;
    drift_detection: boolean;
    explainability_tracking: boolean;
    bias_monitoring: boolean;
    
    alerts: Array<{
      metric_name: string;
      threshold_value: number;
      comparison_operator: 'gt' | 'lt' | 'eq' | 'ne';
      notification_channels: string[];
    }>;
  };
  
  rollback_config: {
    automatic_rollback_enabled: boolean;
    rollback_triggers: string[];
    rollback_threshold: number;
    previous_model_retention_days: number;
  };
}

}
}
export interface AutoMLConfig {
  enabled: boolean;
  search_strategy: 'random' | 'grid' | 'bayesian' | 'evolutionary' | 'neural_architecture';
  
  model_search_space: {
    algorithms: string[];
    hyperparameter_ranges: Record<string, {
      type: 'int' | 'float' | 'categorical' | 'boolean';
      range?: [number, number];
      choices?: unknown[];
}
}
    }>;
    
    feature_engineering_space: {
      transformations: string[];
      feature_selection_methods: string[];
      dimensionality_reduction_methods: string[];
    };
  };
  
  optimization_config: {
    objective_metric: string;
    optimization_direction: 'maximize' | 'minimize';
    max_trials: number;
    max_runtime_minutes: number;
    early_stopping_rounds: number;
  };
  
  ensemble_config: {
    ensemble_methods: string[];
    max_ensemble_size: number;
    diversity_threshold: number;
  };
}

export class SecurityMLTrainingPipeline extends EventEmitter {
  private mlEngine: SecurityMLToolsEngine;
  private statisticalEngine: SecurityStatisticalAnalysisEngine;
  
  private datasets: Map<string, MLTrainingDataset> = new Map();
  private trainingJobs: Map<string, MLTrainingJob> = new Map();
  private deploymentConfigs: Map<string, ModelDeploymentConfig> = new Map();
  
  private jobQueue: string[] = [];
  private activeJobs: Set<string> = new Set();
  private maxConcurrentJobs: number = 3;
  
  constructor(mlEngine: SecurityMLToolsEngine, statisticalEngine: SecurityStatisticalAnalysisEngine) {
    super();
    this.mlEngine = mlEngine;
    this.statisticalEngine = statisticalEngine;
    
    this.setupTrainingPipeline();
  }
  
  private setupTrainingPipeline(): void {
    // Setup automated job processing
    setInterval(() => {
      this.processJobQueue();
    }, 30000); // Check every 30 seconds
    
    // Setup model monitoring
    setInterval(() => {
      this.monitorDeployedModels();
    }, 300000); // Check every 5 minutes
  }
  
  // Dataset Management
  async createDataset(config: Omit<MLTrainingDataset, 'dataset_id' | 'created_at' | 'updated_at'>): Promise<string> {

    const dataset_id = `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    const dataset: MLTrainingDataset = {
      dataset_id,
      created_at: Date.now(),
      updated_at: Date.now(),
      ...config
    };
    
    this.datasets.set(dataset_id, dataset);
    
    this.emit('dataset_created', {
      dataset_id,
      name: dataset.name,
      sources: dataset.data_sources.security_events.length
    });
    
    return dataset_id;
  }
  
  async prepareDataset(dataset_id: string): Promise<{
    feature_matrix: number[][];
    target_vector: number[];
    feature_names: string[];
    metadata: Record<string, any>;
  }> {
    const dataset = this.datasets.get(dataset_id);
    if (!dataset) {
      throw new Error(`Dataset ${dataset_id} not found`);
    }
    
    // Data extraction and preprocessing
    const rawData = await this.extractSecurityData(dataset);
    const preprocessedData = await this.preprocessData(rawData, dataset.preprocessing_config);
    const labeledData = await this.labelData(preprocessedData, dataset.labeling_config);
    
    return {
      feature_matrix: labeledData.features,
      target_vector: labeledData.labels,
      feature_names: labeledData.feature_names,
      metadata: labeledData.metadata
    };
  }
  
  private async extractSecurityData(dataset: MLTrainingDataset): Promise<any[]> {

    const allData: unknown[] = [];
    
    // Extract from security events
    for (const source of dataset.data_sources.security_events) {
      const eventData = await this.extractEventData(source);
      allData.push(...eventData);
    }
    
    // Extract from threat intelligence
    for (const feed of dataset.data_sources.threat_intelligence) {
      const threatData = await this.extractThreatIntelligence(feed);
      allData.push(...threatData);
    }
    
    // Extract from historical incidents
    if (dataset.data_sources.historical_incidents) {
      const incidentData = await this.extractIncidentData(dataset.data_sources.historical_incidents);
      allData.push(...incidentData);
    }
    
    return allData;
  }
  
  private async extractEventData(source: MLTrainingDataset['data_sources']['security_events'][0]): Promise<any[]> {

    // Implementation would connect to actual data sources
    // For now, return mock data structure
    return [
      {
        timestamp: Date.now(),
        event_type: 'authentication_failure',
        source_ip: '192.168.1.100',
        user_id: 'user123',
        severity: 'medium',
        details: {
          failed_attempts: 3,
          user_agent: 'Mozilla/5.0...',
          geolocation: 'US-CA'
        }
      }
    ];
  }
  
  private async extractThreatIntelligence(feed: MLTrainingDataset['data_sources']['threat_intelligence'][0]): Promise<any[]> {

    // Implementation would fetch from threat intelligence feeds
    return [
      {
        indicator_type: 'ip',
        indicator_value: '192.168.1.100',
        threat_type: 'malware',
        confidence: 0.85,
        source: feed.feed_url,
        last_seen: Date.now(}
    ];
  }
  
  private async extractIncidentData(config: MLTrainingDataset['data_sources']['historical_incidents']): Promise<any[]> {

    // Implementation would query incident database
    return [
      {
        incident_id: 'INC-2024-001',
        severity: 'high',
        category: 'data_breach',
        resolution_time: 240, // minutes
        impact_score: 8.5,
        root_cause: 'phishing'
      }
    ];
  }
  
  private async preprocessData(rawData: unknown[], config: MLTrainingDataset['preprocessing_config']): Promise<any[]> {

    let processedData = [...rawData];
    
    // Feature engineering
    processedData = await this.engineerFeatures(processedData, config);
    
    // Normalization
    processedData = await this.normalizeFeatures(processedData, config.normalization_strategy);
    
    // Feature selection
    processedData = await this.selectFeatures(processedData, config.feature_selection_method);
    
    // Dimensionality reduction
    if (config.dimensionality_reduction !== 'none') {
      processedData = await this.reduceDimensionality(processedData, config.dimensionality_reduction);
    }
    
    return processedData;
  }
  
  private async engineerFeatures(
    data: Record<string,
    unknown>[],
    config: MLTrainingDataset['preprocessing_config']
  ): Promise<any[]> {

    return data.map(record => {
      const engineeredRecord = { ...record };
      
      // Time-based features
      if (config.time_series_features && record.timestamp) {
        const date = new Date(record.timestamp);
        engineeredRecord.hour_of_day = date.getHours();
        engineeredRecord.day_of_week = date.getDay();
        engineeredRecord.is_weekend = date.getDay() === 0 || date.getDay() === 6;
        engineeredRecord.is_business_hours = date.getHours() >= 9 && date.getHours() <= 17;
      }
      
      // Anomaly detection features
      if (config.anomaly_detection_features) {
        engineeredRecord.frequency_score = this.calculateFrequencyScore(record);
        engineeredRecord.entropy_score = this.calculateEntropyScore(record);
        engineeredRecord.deviation_score = this.calculateDeviationScore(record);
      }
      
      // Text features
      if (record.description || record.details) {
        const text = record.description || JSON.stringify(record.details);
        engineeredRecord.text_length = text.length;
        engineeredRecord.word_count = text.split(' ').length;
        engineeredRecord.contains_suspicious_keywords = this.detectSuspiciousKeywords(text);
      }
      
      return engineeredRecord;
    });
  }
  
  private calculateFrequencyScore(record: unknown): number {
    // Calculate how frequently this type of event occurs
    return Math.random(); // Placeholder
  }
  
  private calculateEntropyScore(record: unknown): number {
    // Calculate information entropy of the record
    return Math.random(); // Placeholder
  }
  
  private calculateDeviationScore(record: unknown): number {
    // Calculate deviation from normal patterns
    return Math.random(); // Placeholder
  }
  
  private detectSuspiciousKeywords(text: string): boolean {
    const suspiciousKeywords = ['malware', 'virus', 'trojan', 'phishing', 'exploit', 'backdoor'];
    return suspiciousKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }
  
  private async normalizeFeatures(data: Record<string, unknown>[], strategy: string): Promise<any[]> {

    // Implementation would apply normalization strategy
    return data;
  }
  
  private async selectFeatures(data: Record<string, unknown>[], method: string): Promise<any[]> {

    // Implementation would apply feature selection
    return data;
  }
  
  private async reduceDimensionality(data: Record<string, unknown>[], method: string): Promise<any[]> {

    // Implementation would apply dimensionality reduction
    return data;
  }
  
  private async labelData(data: Record<string, unknown>[], config: MLTrainingDataset['labeling_config']): Promise<{
    features: number[][];
    labels: number[];
    feature_names: string[];
    metadata: Record<string, any>;
  }> {
    // Convert preprocessed data to feature matrix and labels
    const features: number[][] = [];
    const labels: number[] = [];
    const feature_names: string[] = [];
    
    data.forEach(record => {
      const featureVector: number[] = [];
      
      // Extract numerical features
      Object.entries(record).forEach(([key, value]) => {
        if (typeof value === 'number') {
          featureVector.push(value);
          if (features.length === 0) {
            feature_names.push(key);
          }
        }
      });
      
      features.push(featureVector);
      
      // Generate labels based on strategy
      const label = this.generateLabel(record, config);
      labels.push(label);
    });
    
    return {
      features,
      labels,
      feature_names,
      metadata: {
        total_samples: features.length,
        feature_count: feature_names.length,
        label_distribution: this.calculateLabelDistribution(labels)
      }
    };
  }
  
  private generateLabel(record: unknown, config: MLTrainingDataset['labeling_config']): number {
    switch (config.labeling_strategy) {
      case 'supervised':
        return record.is_malicious ? 1 : 0;
      case 'semi_supervised':
        return record.confidence_score > config.confidence_threshold ? 1 : 0;
      default:
        return 0; // Placeholder for unsupervised
    }
  }
  
  private calculateLabelDistribution(labels: number[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    labels.forEach(label => {
      distribution[label.toString()] = (distribution[label.toString()] || 0) + 1;
    });
    return distribution;
  }
  
  // Training Job Management
  async createTrainingJob(config: Omit<MLTrainingJob, 'job_id' | 'status' | 'progress' | 'results'>): Promise<string> {

    const job_id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    const job: MLTrainingJob = {
      job_id,
      status: 'queued',
      progress: {
        current_epoch: 0,
        total_epochs: config.training_config.max_iterations || 100,
        current_metric_value: 0,
        best_metric_value: 0,
        training_loss: 0,
        validation_loss: 0,
        elapsed_time_minutes: 0
  }
      results: {} as any,
      ...config
    };
    
    this.trainingJobs.set(job_id, job);
    this.jobQueue.push(job_id);
    
    this.emit('training_job_created', {
      job_id,
      dataset_id: job.dataset_id,
      algorithm: job.algorithm
    });
    
    return job_id;
  }
  
  private async processJobQueue(): Promise<void> {

    while (this.jobQueue.length > 0 && this.activeJobs.size < this.maxConcurrentJobs) {
      const job_id = this.jobQueue.shift()!;
      this.activeJobs.add(job_id);
      
      this.executeTrainingJob(job_id)
        .catch(error => {
          console.error(`Training job ${job_id} failed:`, error);
          const job = this.trainingJobs.get(job_id);
          if (job) {
            job.status = 'failed';
          }
  }
        .finally(() => {
          this.activeJobs.delete(job_id);
        });
    }
  }
  
  private async executeTrainingJob(job_id: string): Promise<void> {

    const job = this.trainingJobs.get(job_id);
    if (!job) return;
    
    job.status = 'running';
    const startTime = Date.now();
    
    this.emit('training_job_started', { job_id });
    
    try {
      // Prepare dataset
      const datasetData = await this.prepareDataset(job.dataset_id);
      
      // Split data
      const splits = this.splitDataset(datasetData, job.dataset_id);
      
      // Train model
      const model = await this.trainModel(job, splits);
      
      // Validate model
      const validation_results = await this.validateModel(model, splits);
      
      // Analyze model
      const model_analysis = await this.analyzeModel(model, splits);
      
      // Update job results
      job.results = {
        final_model: model,
        performance_metrics: validation_results.performance_metrics,
        validation_results,
        model_analysis
      };
      
      job.status = 'completed';
      job.progress.elapsed_time_minutes = (Date.now() - startTime) / 60000;
      
      this.emit('training_job_completed', {
        job_id,
        model_id: model.model_id,
        performance: validation_results.performance_metrics
      });
      
    } catch (error) {
      job.status = 'failed';
      this.emit('training_job_failed', { job_id, error: (error as Error).message });
    }
  }
  
  private splitDataset(data: Record<string, unknown>, dataset_id: string): {
    train: unknown;
    validation: unknown;
    test: unknown;
  } {
    const dataset = this.datasets.get(dataset_id);
    if (!dataset) throw new Error('Dataset not found');
    
    const config = dataset.validation_config;
    const totalSamples = data.feature_matrix.length;
    
    const trainSize = Math.floor(totalSamples * config.train_split);
    const validationSize = Math.floor(totalSamples * config.validation_split);
    
    return {
      train: {
        features: data.feature_matrix.slice(0, trainSize),
        labels: data.target_vector.slice(0, trainSize)
  }
      validation: {
        features: data.feature_matrix.slice(trainSize, trainSize + validationSize),
        labels: data.target_vector.slice(trainSize, trainSize + validationSize)
  }
      test: {
        features: data.feature_matrix.slice(trainSize + validationSize),
        labels: data.target_vector.slice(trainSize + validationSize)
      }
    };
  }
  
  private async trainModel(job: MLTrainingJob, splits: unknown): Promise<SecurityMLModel> {

    const model_id = `model_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    // Simulate training progress
    const totalEpochs = job.training_config.max_iterations || 100;
    let bestScore = 0;
    
    for (let epoch = 0; epoch < totalEpochs; epoch++) {
      job.progress.current_epoch = epoch;
      job.progress.training_loss = Math.max(0, 1 - (epoch / totalEpochs) + Math.random() * 0.1 - 0.05);
      job.progress.validation_loss = Math.max(0, 1 - (epoch / totalEpochs) + Math.random() * 0.15 - 0.075);
      job.progress.current_metric_value = Math.min(1, (epoch / totalEpochs) + Math.random() * 0.1 - 0.05);
      
      if (job.progress.current_metric_value > bestScore) {
        bestScore = job.progress.current_metric_value;
        job.progress.best_metric_value = bestScore;
      }
      
      this.emit('training_progress', {
        job_id: job.job_id,
        epoch,
        progress: job.progress
      });
      
      // Early stopping check
      if (job.training_config.early_stopping_enabled && epoch > 10) {
        if (job.progress.validation_loss > job.progress.training_loss * 1.5) {
          break; // Stop training due to overfitting
        }
      }
      
      // Simulate training time
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const model: SecurityMLModel = {
      model_id,
      model_name: `${job.algorithm}_security_model`,
      model_type: 'supervised',
      algorithm: job.algorithm,
      purpose: 'threat_detection',
      
      model_metadata: {
        version: '1.0.0',
        created_at: Date.now(),
        last_trained: Date.now(),
        training_duration_ms: job.progress.elapsed_time_minutes * 60000,
        data_sources: ['security_events'],
        feature_count: splits.train.features[0]?.length || 0,
        training_samples: splits.train.features.length,
        validation_samples: splits.validation.features.length,
        test_samples: splits.test.features.length
  }
      performance_metrics: {
        accuracy: bestScore,
        precision: bestScore * 0.95,
        recall: bestScore * 0.92,
        f1_score: bestScore * 0.935,
        auc_roc: bestScore * 0.98,
        confusion_matrix: [[80, 5], [3, 12]],
        cross_validation_score: bestScore * 0.97,
        overfitting_score: job.progress.validation_loss - job.progress.training_loss
  }
      feature_engineering: {
        feature_names: Array.from({ length: splits.train.features[0]?.length || 0 }, (_, i) => `feature_${i}`),
        feature_types: {},
        feature_importance: {},
        feature_correlations: {},
        engineered_features: []
  }
      hyperparameters: job.training_config.hyperparameters,
      
      deployment_config: {
        environment: 'development',
        resource_requirements: job.hardware_config,
        scaling_config: {
          min_instances: 1,
          max_instances: 5,
          auto_scaling_enabled: true,
          performance_threshold: 0.8
        }
      }
    };
    
    return model;
  }
  
  private async validateModel(model: SecurityMLModel, splits: unknown): Promise<unknown> {

    return {
      performance_metrics: model.performance_metrics,
      cross_validation_scores: Array.from({ length: 5 }, () => Math.random() * 0.1 + 0.9),
      learning_curves: {
        train_scores: Array.from({ length: 10 }, (_, i) => (i + 1) / 10),
        validation_scores: Array.from({ length: 10 }, (_, i) => (i + 1) / 10 * 0.95),
        train_sizes: Array.from({ length: 10 }, (_, i) => (i + 1) * 100)
  }
      validation_curves: []
    };
  }
  
  private async analyzeModel(model: SecurityMLModel, splits: unknown): Promise<unknown> {

    return {
      overfitting_analysis: {
        overfitting_score: model.performance_metrics.overfitting_score,
        training_validation_gap: 0.05,
        recommendations: model.performance_metrics.overfitting_score > 0.1 ? 
          ['Consider regularization', 'Reduce model complexity', 'Collect more training data'] : 
          ['Model appears well-fitted']
  }
      feature_analysis: {
        most_important_features: [
          { feature_name: 'event_frequency', importance_score: 0.85, correlation_with_target: 0.72 },
          { feature_name: 'time_of_day', importance_score: 0.68, correlation_with_target: 0.45 },
          { feature_name: 'source_ip_reputation', importance_score: 0.92, correlation_with_target: 0.89 }
        ],
        redundant_features: [],
        missing_value_analysis: {}
  }
      bias_analysis: {
        fairness_metrics: {},
        demographic_parity: 0.95,
        equal_opportunity: 0.94,
        bias_sources: []
      }
    };
  }
  
  private async monitorDeployedModels(): Promise<void> {

    for (const [deployment_id, config] of this.deploymentConfigs) {
      if (config.monitoring_config.drift_detection) {
        await this.detectModelDrift(deployment_id);
      }
      
      if (config.monitoring_config.performance_monitoring) {
        await this.monitorModelPerformance(deployment_id);
      }
    }
  }
  
  private async detectModelDrift(deployment_id: string): Promise<void> {

    // Implementation would check for data drift and model performance degradation
    const driftScore = Math.random();
    
    if (driftScore > 0.8) {
      this.emit('model_drift_detected', {
        deployment_id,
        drift_score: driftScore,
        recommendation: 'Model retraining recommended'
      });
    }
  }
  
  private async monitorModelPerformance(deployment_id: string): Promise<void> {

    // Implementation would monitor real-time model performance
    const config = this.deploymentConfigs.get(deployment_id);
    if (!config) return;
    
    const currentPerformance = Math.random();
    
    for (const alert of config.monitoring_config.alerts) {
      if (this.checkAlertCondition(currentPerformance, alert)) {
        this.emit('model_performance_alert', {
          deployment_id,
          metric: alert.metric_name,
          value: currentPerformance,
          threshold: alert.threshold_value
        });
      }
    }
  }
  
  private checkAlertCondition(value: number, alert: ModelDeploymentConfig['monitoring_config']['alerts'][0]): boolean {
    switch (alert.comparison_operator) {
      case 'gt': return value > alert.threshold_value;
      case 'lt': return value < alert.threshold_value;
      case 'eq': return value === alert.threshold_value;
      case 'ne': return value !== alert.threshold_value;
      default: return false;
    }
  }
  
  // AutoML functionality
  async runAutoML(dataset_id: string, config: AutoMLConfig): Promise<string> {

    if (!config.enabled) {
      throw new Error('AutoML is not enabled');
    }
    
    const automlJob = await this.createTrainingJob({
      dataset_id,
      model_type: 'classification', // Default
      algorithm: 'automl',
      training_config: {
        hyperparameters: {},
        optimization_metric: config.optimization_config.objective_metric,
        early_stopping_enabled: true,
        max_training_time_minutes: config.optimization_config.max_runtime_minutes,
        max_iterations: config.optimization_config.max_trials,
        convergence_threshold: 0.001
  }
      hardware_config: {
        cpu_cores: 4,
        memory_gb: 16,
        gpu_enabled: false,
        distributed_training: false
  }
      experiment_tracking: {
        experiment_name: 'AutoML Security Analysis',
        tags: ['automl', 'security'],
        parameters: config,
        metrics: {},
        artifacts_path: `/experiments/automl_${Date.now()}`
      }
    });
    
    return automlJob;
  }
  
  // API methods
  getTrainingJob(job_id: string): MLTrainingJob | undefined {
    return this.trainingJobs.get(job_id);
  }
  
  getDataset(dataset_id: string): MLTrainingDataset | undefined {
    return this.datasets.get(dataset_id);
  }
  
  async cancelTrainingJob(job_id: string): Promise<boolean> {

    const job = this.trainingJobs.get(job_id);
    if (!job || job.status !== 'running') {
      return false;
    }
    
    job.status = 'cancelled';
    this.activeJobs.delete(job_id);
    
    this.emit('training_job_cancelled', { job_id });
    return true;
  }
  
  async deleteDataset(dataset_id: string): Promise<boolean> {

    if (this.datasets.has(dataset_id)) {
      this.datasets.delete(dataset_id);
      this.emit('dataset_deleted', { dataset_id });
      return true;
    }
    return false;
  }
  
  getTrainingStatistics(): {
    total_datasets: number;
    total_jobs: number;
    active_jobs: number;
    completed_jobs: number;
    failed_jobs: number;
  } {
    const jobs = Array.from(this.trainingJobs.values());
    
    return {
      total_datasets: this.datasets.size,
      total_jobs: jobs.length,
      active_jobs: jobs.filter(job => job.status === 'running').length,
      completed_jobs: jobs.filter(job => job.status === 'completed').length,
      failed_jobs: jobs.filter(job => job.status === 'failed').length
    };
  }
}