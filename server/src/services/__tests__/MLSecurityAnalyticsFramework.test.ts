/**
 * MLSecurityAnalyticsFramework Test Suite
 * Epic 31.4.2.1 - Design ML security analytics framework
 * 
 * Comprehensive test coverage for machine learning security analytics framework
 * including model management, training, inference, and Epic integration.
 */

import { 
  MLSecurityAnalyticsFramework,
  MLSecurityAnalyticsConfig,
  MLModel,
  MLModelType,
  MLAlgorithm,
  ModelStatus,
  TrainingJob,
  TrainingJobStatus,
  InferenceRequest,
  InferenceResult,
  MLSecurityAnalyticsMetrics
} from '../MLSecurityAnalyticsFramework';
import { 
  SecurityIntelligenceDataPipeline,
  SecurityEvent,
  SecurityEventType,
  SecurityEventSeverity
} from '../SecurityIntelligenceDataPipeline';
import { AnalyticsCollector } from '../../analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../../database/analytics-dao';
import { PerformanceMonitoringService } from '../../analytics/PerformanceMonitoringService';
import { DiagnosticService } from '../../admin/DiagnosticService';
import { HealthCheckFramework } from '../../admin/HealthCheckFramework';

// Mock dependencies
jest.mock('../SecurityIntelligenceDataPipeline');
jest.mock('../../analytics/AnalyticsCollector');
jest.mock('../../database/analytics-dao');
jest.mock('../../analytics/PerformanceMonitoringService');
jest.mock('../../admin/DiagnosticService');
jest.mock('../../admin/HealthCheckFramework');

describe('MLSecurityAnalyticsFramework', () => {
  let mlFramework: MLSecurityAnalyticsFramework;
  let mockDataPipeline: jest.Mocked<SecurityIntelligenceDataPipeline>;
  let mockAnalyticsCollector: jest.Mocked<AnalyticsCollector>;
  let mockAnalyticsDAO: jest.Mocked<AnalyticsDAO>;
  let mockPerformanceMonitoringService: jest.Mocked<PerformanceMonitoringService>;
  let mockDiagnosticService: jest.Mocked<DiagnosticService>;
  let mockHealthCheckFramework: jest.Mocked<HealthCheckFramework>;
  let testConfig: MLSecurityAnalyticsConfig;

  beforeEach(() => {
    // Setup mocks
    mockDataPipeline = new SecurityIntelligenceDataPipeline(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<SecurityIntelligenceDataPipeline>;
    mockAnalyticsCollector = new AnalyticsCollector({} as any) as jest.Mocked<AnalyticsCollector>;
    mockAnalyticsDAO = new AnalyticsDAO('') as jest.Mocked<AnalyticsDAO>;
    mockPerformanceMonitoringService = new PerformanceMonitoringService(
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<PerformanceMonitoringService>;
    mockDiagnosticService = new DiagnosticService() as jest.Mocked<DiagnosticService>;
    mockHealthCheckFramework = new HealthCheckFramework() as jest.Mocked<HealthCheckFramework>;

    // Mock data pipeline
    mockDataPipeline.on = jest.fn<unknown[], unknown>();
    mockDataPipeline.emit = jest.fn<unknown[], unknown>();

    // Mock analytics collector
    mockAnalyticsCollector.track = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Mock analytics DAO
    mockAnalyticsDAO.insertEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Mock performance monitoring service
    mockPerformanceMonitoringService.recordMetric = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Mock diagnostic service
    mockDiagnosticService.registerDiagnostic = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Mock health check framework
    mockHealthCheckFramework.registerHealthCheck = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);

    // Test configuration
    testConfig = {
      ml_framework: {
        enabled: true,
        model_training_enabled: true,
        real_time_inference: true,
        batch_inference: true,
        model_auto_retrain: true,
        feature_store_enabled: true,
        model_versioning: true,
        a_b_testing: true
  }
      threat_detection: {
        enabled: true,
        anomaly_detection: true,
        behavioral_analysis: true,
        threat_prediction: true,
        attack_pattern_recognition: true,
        malware_classification: true,
        network_intrusion_detection: true,
        user_risk_scoring: true
  }
      model_management: {
        max_models: 100,
        model_retention_days: 90,
        training_schedule: '0 2 * * *',
        validation_split: 0.2,
        test_split: 0.1,
        cross_validation_folds: 5,
        early_stopping: true,
        hyperparameter_tuning: true
  }
      feature_engineering: {
        enabled: true,
        auto_feature_generation: true,
        feature_selection: true,
        dimensionality_reduction: true,
        time_series_features: true,
        graph_features: true,
        nlp_features: true,
        statistical_features: true
  }
      performance_monitoring: {
        enabled: true,
        model_drift_detection: true,
        accuracy_monitoring: true,
        latency_monitoring: true,
        resource_monitoring: true,
        fairness_monitoring: true,
        explainability_tracking: true
  }
      epic_integration: {
        epic1_analytics_enabled: true,
        epic17_admin_enabled: true,
        model_deployment_pipeline: true,
        performance_tracking: true,
        unified_monitoring: true
      }
    };

    mlFramework = new MLSecurityAnalyticsFramework(
      testConfig,
      mockDataPipeline,
      mockAnalyticsCollector,
      mockAnalyticsDAO,
      mockPerformanceMonitoringService,
      mockDiagnosticService,
      mockHealthCheckFramework
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize ML framework with correct configuration', async () => {
      await mlFramework.initialize();

      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
        'ml_framework_initialized',
        expect.objectContaining({
          timestamp: expect.any(Number),
          config: expect.any(Object)
  }
      );

      expect(mockHealthCheckFramework.registerHealthCheck).toHaveBeenCalledWith(
        'ml_security_analytics_framework',
        expect.any(Function)
      );
    });

    test('should register diagnostic collection', async () => {
      await mlFramework.initialize();

      expect(mockDiagnosticService.registerDiagnostic).toHaveBeenCalledWith(
        'ml_security_analytics_framework',
        expect.any(Function)
      );
    });

    test('should setup event listeners for data pipeline', async () => {
      await mlFramework.initialize();

      expect(mockDataPipeline.on).toHaveBeenCalledWith('security_event', expect.any(Function));
      expect(mockDataPipeline.on).toHaveBeenCalledWith('threat_detected', expect.any(Function));
    });
  });

  describe('Model Management', () => {
    beforeEach(async () => {
      await mlFramework.initialize();
    });

    test('should create ML model successfully', async () => {
      const modelData = {
        name: 'Threat Detection Model',
        description: 'ML model for detecting security threats',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.RANDOM_FOREST,
        version: '1.0.0',
        created_by: 'security_analyst',
        features: [
          {
            name: 'request_frequency',
            type: 'numeric',
            importance: 0.8,
            description: 'API request frequency'
          }
        ],
        hyperparameters: {
          n_estimators: 100,
          max_depth: 10
  }
        deployment_config: {
          environment: 'production',
          replicas: 3,
          cpu_limit: '2',
          memory_limit: '4Gi',
          auto_scaling: true
  }
        metadata: {
          data_source: 'security_events',
          training_date: Date.now(),
          accuracy: 0.95,
          precision: 0.92,
          recall: 0.88,
          f1_score: 0.90
        }
      };

      const modelId = await mlFramework.createModel(modelData);

      expect(typeof modelId).toBe('string');
      expect(modelId.length).toBeGreaterThan(0);
      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
        'ml_model_created',
        expect.objectContaining({
          model_id: modelId,
          model_name: modelData.name,
          model_type: modelData.type,
          algorithm: modelData.algorithm
  }
      );
    });

    test('should retrieve model by ID', async () => {
      const modelData = {
        name: 'Test Model',
        description: 'Test ML model',
        type: MLModelType.REGRESSION,
        algorithm: MLAlgorithm.LINEAR_REGRESSION,
        version: '1.0.0',
        created_by: 'test_user',
        features: [],
        hyperparameters: {},
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '1',
          memory_limit: '2Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'test_data',
          training_date: Date.now(),
          accuracy: 0.85,
          precision: 0.80,
          recall: 0.82,
          f1_score: 0.81
        }
      };

      const modelId = await mlFramework.createModel(modelData);
      const retrievedModel = await mlFramework.getModel(modelId);

      expect(retrievedModel).toBeDefined();
      expect(retrievedModel.id).toBe(modelId);
      expect(retrievedModel.name).toBe(modelData.name);
      expect(retrievedModel.type).toBe(modelData.type);
    });

    test('should list all models', async () => {
      const modelData1 = {
        name: 'Model 1',
        description: 'First test model',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.LOGISTIC_REGRESSION,
        version: '1.0.0',
        created_by: 'test_user',
        features: [],
        hyperparameters: {},
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '1',
          memory_limit: '2Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'test_data',
          training_date: Date.now(),
          accuracy: 0.85,
          precision: 0.80,
          recall: 0.82,
          f1_score: 0.81
        }
      };

      const modelData2 = {
        name: 'Model 2',
        description: 'Second test model',
        type: MLModelType.MULTI_CLASS_CLASSIFICATION,
        algorithm: MLAlgorithm.DECISION_TREE,
        version: '1.0.0',
        created_by: 'test_user',
        features: [],
        hyperparameters: {},
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '1',
          memory_limit: '2Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'test_data',
          training_date: Date.now(),
          accuracy: 0.85,
          precision: 0.80,
          recall: 0.82,
          f1_score: 0.81
        }
      };

      await mlFramework.createModel(modelData1);
      await mlFramework.createModel(modelData2);

      const models = await mlFramework.getAllModels();
      expect(models.length).toBeGreaterThanOrEqual(2);
    });

    test('should update model status', async () => {
      const modelData = {
        name: 'Status Test Model',
        description: 'Model for testing status updates',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.SVM,
        version: '1.0.0',
        created_by: 'test_user',
        features: [],
        hyperparameters: {},
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '1',
          memory_limit: '2Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'test_data',
          training_date: Date.now(),
          accuracy: 0.85,
          precision: 0.80,
          recall: 0.82,
          f1_score: 0.81
        }
      };

      const modelId = await mlFramework.createModel(modelData);
      await mlFramework.updateModelStatus(modelId, ModelStatus.TRAINING);

      const updatedModel = await mlFramework.getModel(modelId);
      expect(updatedModel.status).toBe(ModelStatus.TRAINING);
    });

    test('should delete model', async () => {
      const modelData = {
        name: 'Delete Test Model',
        description: 'Model for testing deletion',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.NAIVE_BAYES,
        version: '1.0.0',
        created_by: 'test_user',
        features: [],
        hyperparameters: {},
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '1',
          memory_limit: '2Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'test_data',
          training_date: Date.now(),
          accuracy: 0.85,
          precision: 0.80,
          recall: 0.82,
          f1_score: 0.81
        }
      };

      const modelId = await mlFramework.createModel(modelData);
      await mlFramework.deleteModel(modelId);

      await expect(mlFramework.getModel(modelId)).rejects.toThrow('Model not found');
    });
  });

  describe('Model Training', () => {
    let modelId: string;

    beforeEach(async () => {
      await mlFramework.initialize();

      const modelData = {
        name: 'Training Test Model',
        description: 'Model for testing training functionality',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.RANDOM_FOREST,
        version: '1.0.0',
        created_by: 'test_user',
        features: [
          {
            name: 'threat_score',
            type: 'numeric',
            importance: 0.9,
            description: 'Threat severity score'
          }
        ],
        hyperparameters: {
          n_estimators: 100,
          max_depth: 10
  }
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '2',
          memory_limit: '4Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'security_events',
          training_date: Date.now(),
          accuracy: 0.85,
          precision: 0.80,
          recall: 0.82,
          f1_score: 0.81
        }
      };

      modelId = await mlFramework.createModel(modelData);
    });

    test('should start model training successfully', async () => {
      const trainingConfig = {
        data_source: 'security_events',
        training_split: 0.8,
        validation_split: 0.1,
        test_split: 0.1,
        max_epochs: 100,
        batch_size: 32,
        learning_rate: 0.001,
        early_stopping: true,
        patience: 10
      };

      const jobId = await mlFramework.startModelTraining(modelId, trainingConfig);

      expect(typeof jobId).toBe('string');
      expect(jobId.length).toBeGreaterThan(0);
      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
        'ml_training_started',
        expect.objectContaining({
          model_id: modelId,
          job_id: jobId,
          config: trainingConfig
  }
      );
    });

    test('should get training job status', async () => {
      const jobId = await mlFramework.startModelTraining(modelId);
      const job = await mlFramework.getTrainingJob(jobId);

      expect(job).toBeDefined();
      expect(job.id).toBe(jobId);
      expect(job.model_id).toBe(modelId);
      expect(job.status).toBe(TrainingJobStatus.RUNNING);
    });

    test('should cancel training job', async () => {
      const jobId = await mlFramework.startModelTraining(modelId);
      await mlFramework.cancelTraining(jobId);

      const job = await mlFramework.getTrainingJob(jobId);
      expect(job.status).toBe(TrainingJobStatus.CANCELLED);
    });

    test('should list training jobs for model', async () => {
      const jobId1 = await mlFramework.startModelTraining(modelId);
      const jobId2 = await mlFramework.startModelTraining(modelId);

      const jobs = await mlFramework.getModelTrainingJobs(modelId);
      expect(jobs.length).toBeGreaterThanOrEqual(2);
      expect(jobs.some(job => job.id === jobId1)).toBe(true);
      expect(jobs.some(job => job.id === jobId2)).toBe(true);
    });
  });

  describe('Model Inference', () => {
    let modelId: string;

    beforeEach(async () => {
      await mlFramework.initialize();

      const modelData = {
        name: 'Inference Test Model',
        description: 'Model for testing inference functionality',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.RANDOM_FOREST,
        version: '1.0.0',
        created_by: 'test_user',
        features: [
          {
            name: 'request_count',
            type: 'numeric',
            importance: 0.8,
            description: 'Number of requests'
          }
        ],
        hyperparameters: {
          n_estimators: 100
  }
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '2',
          memory_limit: '4Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'security_events',
          training_date: Date.now(),
          accuracy: 0.95,
          precision: 0.92,
          recall: 0.88,
          f1_score: 0.90
        }
      };

      modelId = await mlFramework.createModel(modelData);
      await mlFramework.updateModelStatus(modelId, ModelStatus.DEPLOYED);
    });

    test('should perform real-time inference successfully', async () => {
      const request: InferenceRequest = {
        model_id: modelId,
        input_data: {
          request_count: 150,
          source_ip: '192.168.1.100',
          event_type: 'api_access'
  }
        request_id: 'test_request_1',
        timestamp: Date.now()
      };

      const result = await mlFramework.performInference(request);

      expect(result).toBeDefined();
      expect(result.request_id).toBe(request.request_id);
      expect(result.model_id).toBe(modelId);
      expect(result.prediction).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    test('should perform batch inference', async () => {
      const requests: InferenceRequest[] = [
        {
          model_id: modelId,
          input_data: { request_count: 100 },
          request_id: 'batch_1',
          timestamp: Date.now()
  }
        {
          model_id: modelId,
          input_data: { request_count: 200 },
          request_id: 'batch_2',
          timestamp: Date.now()
        }
      ];

      const results = await mlFramework.performBatchInference(requests);

      expect(results).toHaveLength(2);
      expect(results[0].request_id).toBe('batch_1');
      expect(results[1].request_id).toBe('batch_2');
    });

    test('should handle inference errors gracefully', async () => {
      const request: InferenceRequest = {
        model_id: 'non_existent_model',
        input_data: { request_count: 100 },
        request_id: 'error_test',
        timestamp: Date.now()
      };

      await expect(mlFramework.performInference(request)).rejects.toThrow('Model not found');
    });
  });

  describe('Feature Engineering', () => {
    beforeEach(async () => {
      await mlFramework.initialize();
    });

    test('should extract features from security event', async () => {
      const securityEvent: SecurityEvent = {
        id: 'test_event_1',
        event_type: SecurityEventType.API_ABUSE,
        severity: SecurityEventSeverity.HIGH,
        source_ip: '192.168.1.100',
        target_resource: '/api/sensitive',
        timestamp: Date.now(),
        user_id: 'user123',
        request_count: 150,
        data_size: 1024,
        metadata: {
          user_agent: 'Mozilla/5.0',
          country: 'US'
        }
      };

      const features = await mlFramework.extractFeatures(securityEvent);

      expect(features).toBeDefined();
      expect(features.event_id).toBe(securityEvent.id);
      expect(features.features).toBeDefined();
      expect(Object.keys(features.features).length).toBeGreaterThan(0);
    });

    test('should generate time series features', async () => {
      const events: SecurityEvent[] = [
        {
          id: 'event_1',
          event_type: SecurityEventType.LOGIN_FAILURE,
          severity: SecurityEventSeverity.MEDIUM,
          source_ip: '192.168.1.100',
          timestamp: Date.now() - 60000,
          user_id: 'user123',
          metadata: {}
  }
        {
          id: 'event_2',
          event_type: SecurityEventType.LOGIN_FAILURE,
          severity: SecurityEventSeverity.MEDIUM,
          source_ip: '192.168.1.100',
          timestamp: Date.now() - 30000,
          user_id: 'user123',
          metadata: {}
  }
        {
          id: 'event_3',
          event_type: SecurityEventType.LOGIN_SUCCESS,
          severity: SecurityEventSeverity.LOW,
          source_ip: '192.168.1.100',
          timestamp: Date.now(),
          user_id: 'user123',
          metadata: {}
        }
      ];

      const timeSeriesFeatures = await mlFramework.generateTimeSeriesFeatures(events, '1h');

      expect(timeSeriesFeatures).toBeDefined();
      expect(timeSeriesFeatures.window_size).toBe('1h');
      expect(timeSeriesFeatures.features).toBeDefined();
    });

    test('should perform feature selection', async () => {
      const features = {
        feature1: 0.9,
        feature2: 0.1,
        feature3: 0.8,
        feature4: 0.2,
        feature5: 0.7
      };

      const selectedFeatures = await mlFramework.selectFeatures(features, 3);

      expect(selectedFeatures).toHaveLength(3);
      expect(selectedFeatures).toContain('feature1');
      expect(selectedFeatures).toContain('feature3');
      expect(selectedFeatures).toContain('feature5');
    });
  });

  describe('Model Evaluation', () => {
    let modelId: string;

    beforeEach(async () => {
      await mlFramework.initialize();

      const modelData = {
        name: 'Evaluation Test Model',
        description: 'Model for testing evaluation functionality',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.RANDOM_FOREST,
        version: '1.0.0',
        created_by: 'test_user',
        features: [],
        hyperparameters: {},
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '2',
          memory_limit: '4Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'security_events',
          training_date: Date.now(),
          accuracy: 0.95,
          precision: 0.92,
          recall: 0.88,
          f1_score: 0.90
        }
      };

      modelId = await mlFramework.createModel(modelData);
    });

    test('should evaluate model performance', async () => {
      const testData = [
        { input: { feature1: 0.8 }, expected: true },
        { input: { feature1: 0.2 }, expected: false },
        { input: { feature1: 0.9 }, expected: true },
        { input: { feature1: 0.1 }, expected: false }
      ];

      const evaluation = await mlFramework.evaluateModel(modelId, testData);

      expect(evaluation).toBeDefined();
      expect(evaluation.model_id).toBe(modelId);
      expect(evaluation.accuracy).toBeGreaterThanOrEqual(0);
      expect(evaluation.accuracy).toBeLessThanOrEqual(1);
      expect(evaluation.precision).toBeGreaterThanOrEqual(0);
      expect(evaluation.recall).toBeGreaterThanOrEqual(0);
      expect(evaluation.f1_score).toBeGreaterThanOrEqual(0);
    });

    test('should detect model drift', async () => {
      const currentData = [
        { feature1: 0.8, feature2: 0.6 },
        { feature1: 0.2, feature2: 0.4 },
        { feature1: 0.9, feature2: 0.7 }
      ];

      const referenceData = [
        { feature1: 0.7, feature2: 0.5 },
        { feature1: 0.3, feature2: 0.3 },
        { feature1: 0.8, feature2: 0.6 }
      ];

      const driftAnalysis = await mlFramework.detectModelDrift(modelId, currentData, referenceData);

      expect(driftAnalysis).toBeDefined();
      expect(driftAnalysis.model_id).toBe(modelId);
      expect(driftAnalysis.drift_detected).toBeDefined();
      expect(driftAnalysis.drift_score).toBeGreaterThanOrEqual(0);
      expect(driftAnalysis.drift_score).toBeLessThanOrEqual(1);
    });
  });

  describe('Model Deployment', () => {
    let modelId: string;

    beforeEach(async () => {
      await mlFramework.initialize();

      const modelData = {
        name: 'Deployment Test Model',
        description: 'Model for testing deployment functionality',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.RANDOM_FOREST,
        version: '1.0.0',
        created_by: 'test_user',
        features: [],
        hyperparameters: {},
        deployment_config: {
          environment: 'production',
          replicas: 3,
          cpu_limit: '2',
          memory_limit: '4Gi',
          auto_scaling: true
  }
        metadata: {
          data_source: 'security_events',
          training_date: Date.now(),
          accuracy: 0.95,
          precision: 0.92,
          recall: 0.88,
          f1_score: 0.90
        }
      };

      modelId = await mlFramework.createModel(modelData);
    });

    test('should deploy model successfully', async () => {
      await mlFramework.deployModel(modelId);

      const model = await mlFramework.getModel(modelId);
      expect(model.status).toBe(ModelStatus.DEPLOYED);

      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
        'ml_model_deployed',
        expect.objectContaining({
          model_id: modelId,
          deployment_config: expect.any(Object)
  }
      );
    });

    test('should undeploy model', async () => {
      await mlFramework.deployModel(modelId);
      await mlFramework.undeployModel(modelId);

      const model = await mlFramework.getModel(modelId);
      expect(model.status).toBe(ModelStatus.READY);
    });

    test('should get deployment status', async () => {
      await mlFramework.deployModel(modelId);
      const status = await mlFramework.getDeploymentStatus(modelId);

      expect(status).toBeDefined();
      expect(status.model_id).toBe(modelId);
      expect(status.status).toBe('deployed');
      expect(status.replicas).toBeGreaterThan(0);
    });
  });

  describe('Analytics and Metrics', () => {
    beforeEach(async () => {
      await mlFramework.initialize();
    });

    test('should collect ML metrics', async () => {
      const metrics = await mlFramework.getMLMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.total_models).toBeGreaterThanOrEqual(0);
      expect(metrics.active_models).toBeGreaterThanOrEqual(0);
      expect(metrics.training_jobs_active).toBeGreaterThanOrEqual(0);
      expect(metrics.inference_requests_last_hour).toBeGreaterThanOrEqual(0);
      expect(metrics.average_inference_latency_ms).toBeGreaterThanOrEqual(0);
    });

    test('should track model performance over time', async () => {
      const modelData = {
        name: 'Performance Tracking Model',
        description: 'Model for testing performance tracking',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.RANDOM_FOREST,
        version: '1.0.0',
        created_by: 'test_user',
        features: [],
        hyperparameters: {},
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '2',
          memory_limit: '4Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'security_events',
          training_date: Date.now(),
          accuracy: 0.95,
          precision: 0.92,
          recall: 0.88,
          f1_score: 0.90
        }
      };

      const modelId = await mlFramework.createModel(modelData);
      const performanceHistory = await mlFramework.getModelPerformanceHistory(modelId, '24h');

      expect(performanceHistory).toBeDefined();
      expect(performanceHistory.model_id).toBe(modelId);
      expect(performanceHistory.time_range).toBe('24h');
      expect(Array.isArray(performanceHistory.metrics)).toBe(true);
    });
  });

  describe('Epic Integration', () => {
    beforeEach(async () => {
      await mlFramework.initialize();
    });

    test('should integrate with Epic 1 analytics', async () => {
      const modelData = {
        name: 'Epic Integration Model',
        description: 'Model for testing Epic integration',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.RANDOM_FOREST,
        version: '1.0.0',
        created_by: 'test_user',
        features: [],
        hyperparameters: {},
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '2',
          memory_limit: '4Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'security_events',
          training_date: Date.now(),
          accuracy: 0.95,
          precision: 0.92,
          recall: 0.88,
          f1_score: 0.90
        }
      };

      const modelId = await mlFramework.createModel(modelData);

      // Verify Epic 1 analytics tracking
      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
        'ml_model_created',
        expect.objectContaining({
          model_id: modelId,
          epic1_integration: true
  }
      );

      expect(mockAnalyticsDAO.insertEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'ml_model_lifecycle',
          action: 'model_created'
  }
      );
    });

    test('should register health checks with Epic 17', async () => {
      expect(mockHealthCheckFramework.registerHealthCheck).toHaveBeenCalledWith(
        'ml_security_analytics_framework',
        expect.any(Function)
      );
    });

    test('should register diagnostics with Epic 17', async () => {
      expect(mockDiagnosticService.registerDiagnostic).toHaveBeenCalledWith(
        'ml_security_analytics_framework',
        expect.any(Function)
      );
    });

    test('should track performance metrics with Epic 1', async () => {
      const request: InferenceRequest = {
        model_id: 'test_model',
        input_data: { feature1: 0.8 },
        request_id: 'perf_test',
        timestamp: Date.now()
      };

      // Mock model exists and is deployed
      const modelData = {
        name: 'Performance Test Model',
        description: 'Model for performance testing',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.RANDOM_FOREST,
        version: '1.0.0',
        created_by: 'test_user',
        features: [],
        hyperparameters: {},
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '2',
          memory_limit: '4Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'security_events',
          training_date: Date.now(),
          accuracy: 0.95,
          precision: 0.92,
          recall: 0.88,
          f1_score: 0.90
        }
      };

      const modelId = await mlFramework.createModel(modelData);
      await mlFramework.updateModelStatus(modelId, ModelStatus.DEPLOYED);

      request.model_id = modelId;
      await mlFramework.performInference(request);

      expect(mockPerformanceMonitoringService.recordMetric).toHaveBeenCalledWith(
        'ml_inference_latency',
        expect.any(Number),
        expect.objectContaining({
          model_id: modelId,
          request_id: request.request_id
  }
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await mlFramework.initialize();
    });

    test('should handle invalid model creation gracefully', async () => {
      const invalidModelData = {
        name: '',  // Invalid: empty name
        description: 'Invalid model test',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.RANDOM_FOREST,
        version: '1.0.0',
        created_by: 'test_user',
        features: [],
        hyperparameters: {},
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '2',
          memory_limit: '4Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'security_events',
          training_date: Date.now(),
          accuracy: 0.95,
          precision: 0.92,
          recall: 0.88,
          f1_score: 0.90
        }
      };

      await expect(mlFramework.createModel(invalidModelData)).rejects.toThrow();
    });

    test('should handle training job errors', async () => {
      const modelData = {
        name: 'Error Test Model',
        description: 'Model for testing error handling',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.RANDOM_FOREST,
        version: '1.0.0',
        created_by: 'test_user',
        features: [],
        hyperparameters: {},
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '2',
          memory_limit: '4Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'security_events',
          training_date: Date.now(),
          accuracy: 0.95,
          precision: 0.92,
          recall: 0.88,
          f1_score: 0.90
        }
      };

      const modelId = await mlFramework.createModel(modelData);
      
      const invalidTrainingConfig = {
        data_source: '',  // Invalid: empty data source
        training_split: 1.5,  // Invalid: > 1.0
        validation_split: 0.1,
        test_split: 0.1
      };

      await expect(mlFramework.startModelTraining(modelId, invalidTrainingConfig)).rejects.toThrow();
    });

    test('should handle inference on non-existent model', async () => {
      const request: InferenceRequest = {
        model_id: 'non_existent_model_id',
        input_data: { feature1: 0.8 },
        request_id: 'error_test',
        timestamp: Date.now()
      };

      await expect(mlFramework.performInference(request)).rejects.toThrow('Model not found');
    });
  });

  describe('Configuration Validation', () => {
    test('should validate ML framework configuration', () => {
      expect(testConfig.ml_framework.enabled).toBe(true);
      expect(testConfig.threat_detection.enabled).toBe(true);
      expect(testConfig.epic_integration.epic1_analytics_enabled).toBe(true);
      expect(testConfig.epic_integration.epic17_admin_enabled).toBe(true);
    });

    test('should handle disabled ML framework', async () => {
      const disabledConfig = {
        ...testConfig,
        ml_framework: {
          ...testConfig.ml_framework,
          enabled: false
        }
      };

      const disabledFramework = new MLSecurityAnalyticsFramework(
        disabledConfig,
        mockDataPipeline,
        mockAnalyticsCollector,
        mockAnalyticsDAO,
        mockPerformanceMonitoringService,
        mockDiagnosticService,
        mockHealthCheckFramework
      );

      await disabledFramework.initialize();

      const modelData = {
        name: 'Disabled Framework Test',
        description: 'Test model for disabled framework',
        type: MLModelType.BINARY_CLASSIFICATION,
        algorithm: MLAlgorithm.RANDOM_FOREST,
        version: '1.0.0',
        created_by: 'test_user',
        features: [],
        hyperparameters: {},
        deployment_config: {
          environment: 'test',
          replicas: 1,
          cpu_limit: '2',
          memory_limit: '4Gi',
          auto_scaling: false
  }
        metadata: {
          data_source: 'security_events',
          training_date: Date.now(),
          accuracy: 0.95,
          precision: 0.92,
          recall: 0.88,
          f1_score: 0.90
        }
      };

      await expect(disabledFramework.createModel(modelData)).rejects.toThrow('ML framework is disabled');
    });
  });
});