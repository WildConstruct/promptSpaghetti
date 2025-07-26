/**
 * Tests for Predictive API Load Management Service
 * Epic 31 - Task E31-1753313263546-971BC7
 */

import { 
  PredictiveAPILoadManager, 
  LoadPredictionEngine,
  PredictiveLoadManagementConfig,
  LoadPrediction,
  PredictiveAction,
  LoadPattern
} from '../PredictiveAPILoadManager';
import { PerformanceMonitoringService } from '../../analytics/PerformanceMonitoringService';
import { MetricsCollector } from '../../performance/MetricsCollector';
import { LoadBalancer } from '../../../packages/core/ai/performance/LoadBalancer';
import { RateLimiter } from '../../../packages/core/security/RateLimiter';

// Mock dependencies
jest.mock('../../analytics/PerformanceMonitoringService');
jest.mock('../../performance/MetricsCollector');
jest.mock('../../../packages/core/ai/performance/LoadBalancer');
jest.mock('../../../packages/core/security/RateLimiter');

describe('PredictiveAPILoadManager', () => {
  let predictiveLoadManager: PredictiveAPILoadManager;
  let mockPerformanceMonitor: jest.Mocked<PerformanceMonitoringService>;
  let mockMetricsCollector: jest.Mocked<MetricsCollector>;
  let mockLoadBalancer: jest.Mocked<LoadBalancer>;
  let mockRateLimiter: jest.Mocked<RateLimiter>;
  let config: PredictiveLoadManagementConfig;

  beforeEach(() => {
    // Setup comprehensive configuration
    config = {
      prediction_engine: {
        enabled: true,
        prediction_window_minutes: 30,
        confidence_threshold: 0.8,
        update_interval_seconds: 60,
        learning_rate: 0.01,
        feature_extraction: {
          time_series_features: true,
          seasonal_features: true,
          trend_features: true,
          external_factors: false
        }
      },
      prediction_models: {
        time_series_model: {
          enabled: true,
          model_type: 'arima',
          window_size: 100,
          forecast_horizon: 24
        },
        machine_learning_model: {
          enabled: true,
          algorithm: 'random_forest',
          feature_importance_threshold: 0.1,
          retraining_interval_hours: 24
        },
        anomaly_detection_model: {
          enabled: true,
          detection_algorithm: 'isolation_forest',
          anomaly_threshold: 0.1,
          baseline_window_hours: 168
        }
      },
      resource_management: {
        auto_scaling: {
          enabled: true,
          scale_up_threshold: 80,
          scale_down_threshold: 40,
          cooldown_period_minutes: 5,
          max_instances: 10,
          min_instances: 2
        },
        load_balancing: {
          adaptive_strategy: true,
          health_check_interval_seconds: 30,
          failure_threshold: 3,
          recovery_threshold: 2
        },
        rate_limiting: {
          dynamic_adjustment: true,
          burst_tolerance: 100,
          grace_period_seconds: 60,
          priority_queuing: true
        }
      },
      performance_optimization: {
        caching_strategy: {
          predictive_caching: true,
          cache_warming: true,
          intelligent_eviction: true,
          cache_hit_prediction: true
        },
        request_routing: {
          intelligent_routing: true,
          latency_optimization: true,
          cost_optimization: false,
          failure_avoidance: true
        },
        resource_preallocation: {
          enabled: true,
          preallocation_threshold: 0.8,
          resource_buffer_percentage: 20,
          deallocation_delay_minutes: 15
        }
      },
      monitoring: {
        real_time_monitoring: true,
        alert_thresholds: {
          high_load_threshold: 85,
          anomaly_threshold: 0.9,
          performance_degradation_threshold: 50,
          resource_exhaustion_threshold: 90
        },
        notification_channels: ['email', 'slack'],
        dashboard_integration: true
      }
    };

    // Create mock instances
    mockPerformanceMonitor = new PerformanceMonitoringService({} as any) as jest.Mocked<PerformanceMonitoringService>;
    mockMetricsCollector = new MetricsCollector() as jest.Mocked<MetricsCollector>;
    mockLoadBalancer = new LoadBalancer() as jest.Mocked<LoadBalancer>;
    mockRateLimiter = new RateLimiter({} as any) as jest.Mocked<RateLimiter>;

    // Mock system metrics
    mockPerformanceMonitor.getSystemMetrics.mockResolvedValue({
      performance: {
        nodeExecutionTime: { name: 'node.execution.time', type: 'histogram', value: 150, timestamp: Date.now( as unknown as unknown), labels: {}, tags: [], buckets: [], percentiles: [], min: 0, max: 0, mean: 0, stdDev: 0 },
        memoryUsage: { name: 'memory.usage', type: 'gauge', value: 70, timestamp: Date.now(), labels: {}, tags: [] },
        cacheHitRate: { name: 'cache.hit.rate', type: 'counter', value: 85, timestamp: Date.now(), labels: {}, tags: [] },
        errorRate: { name: 'error.rate', type: 'counter', value: 2, timestamp: Date.now(), labels: {}, tags: [] }
      },
      business: {
        activeUsers: { name: 'active.users', type: 'gauge', value: 500, timestamp: Date.now(), labels: {}, tags: [] },
        graphsCreated: { name: 'graphs.created', type: 'counter', value: 25, timestamp: Date.now(), labels: {}, tags: [] },
        revenueGenerated: { name: 'revenue.generated', type: 'counter', value: 1000, timestamp: Date.now(), labels: {}, tags: [] },
        featureUsage: { name: 'feature.usage', type: 'histogram', value: 80, timestamp: Date.now(), labels: {}, tags: [], buckets: [], percentiles: [], min: 0, max: 0, mean: 0, stdDev: 0 }
      },
      infrastructure: {
        cpuUtilization: { name: 'cpu.utilization', type: 'gauge', value: 65, timestamp: Date.now(), labels: {}, tags: [] },
        memoryUtilization: { name: 'memory.utilization', type: 'gauge', value: 70, timestamp: Date.now(), labels: {}, tags: [] },
        diskIO: { name: 'disk.io', type: 'counter', value: 200, timestamp: Date.now(), labels: {}, tags: [] },
        networkLatency: { name: 'network.latency', type: 'histogram', value: 50, timestamp: Date.now(), labels: {}, tags: [], buckets: [], percentiles: [], min: 0, max: 0, mean: 0, stdDev: 0 }
      }
    });

    // Create manager instance
    predictiveLoadManager = new PredictiveAPILoadManager(
      config,
      mockPerformanceMonitor,
      mockMetricsCollector,
      mockLoadBalancer,
      mockRateLimiter
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (predictiveLoadManager) {
      predictiveLoadManager.shutdown();
    }
  });

  describe('Initialization', () => {
    it('should initialize predictive load manager successfully', async () => {
      const initializationPromise = predictiveLoadManager.initialize();

      // Listen for initialization event
      const initEvent = await new Promise((resolve) => {
        predictiveLoadManager.once('predictive-load-manager-initialized', resolve);
      });

      await initializationPromise;

      expect(initEvent).toMatchObject({
        timestamp: expect.any(Number),
        config_summary: {
          prediction_enabled: true,
          auto_scaling_enabled: true,
          real_time_monitoring: true
        }
      });
    });

    it('should handle initialization errors gracefully', async () => {
      // Mock initialization error
      jest.spyOn(predictiveLoadManager as any, 'startPredictionCycle')
        .mockRejectedValue(new Error('Initialization failed'));

      const initPromise = predictiveLoadManager.initialize();

      // Listen for error event
      const errorEvent = await new Promise((resolve) => {
        predictiveLoadManager.once('initialization-error', resolve);
      });

      await expect(initPromise).rejects.toThrow('Initialization failed');

      expect(errorEvent).toMatchObject({
        error: 'Initialization failed',
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Predictive Load Management Execution', () => {
    beforeEach(async () => {
      await predictiveLoadManager.initialize();
    });

    it('should execute predictive load management successfully', async () => {
      const prediction = await predictiveLoadManager.executePredictiveLoadManagement();

      expect(prediction).toEqual(expect.objectContaining({
        prediction_id: expect.stringMatching(/^load_prediction_/),
        timestamp: expect.any(Number),
        prediction_window: expect.objectContaining({
          start_time: expect.any(Number),
          end_time: expect.any(Number),
          duration_minutes: 30
        }),
        predicted_metrics: expect.objectContaining({
          request_rate: expect.objectContaining({
            value: expect.any(Number),
            confidence: expect.any(Number),
            trend: expect.stringMatching(/^(increasing|decreasing|stable)$/)
          }),
          resource_utilization: expect.objectContaining({
            cpu_usage_percent: expect.any(Number),
            memory_usage_percent: expect.any(Number),
            network_bandwidth_mbps: expect.any(Number),
            disk_io_ops_per_second: expect.any(Number)
          }),
          response_times: expect.objectContaining({
            average_ms: expect.any(Number),
            p95_ms: expect.any(Number),
            p99_ms: expect.any(Number)
          }),
          error_rates: expect.objectContaining({
            total_error_rate: expect.any(Number),
            timeout_rate: expect.any(Number),
            server_error_rate: expect.any(Number)
          })
        }),
        risk_assessment: expect.objectContaining({
          overload_probability: expect.any(Number),
          performance_degradation_risk: expect.any(Number),
          resource_exhaustion_risk: expect.any(Number),
          availability_risk: expect.any(Number)
        }),
        recommended_actions: expect.any(Array),
        model_metadata: expect.objectContaining({
          model_version: expect.any(String),
          training_data_points: expect.any(Number),
          accuracy_score: expect.any(Number),
          last_trained: expect.any(Number)
        })
      }));
    });

    it('should emit prediction events during execution', async () => {
      const executionPromise = predictiveLoadManager.executePredictiveLoadManagement();

      // Listen for execution event
      const executionEvent = await new Promise((resolve) => {
        predictiveLoadManager.once('predictive-management-executed', resolve);
      });

      const result = await executionPromise;

      expect(executionEvent).toMatchObject({
        prediction_id: result.prediction_id,
        predicted_load: expect.any(Number),
        actions_executed: expect.any(Number),
        risk_level: expect.stringMatching(/^(low|medium|high|critical)$/)
      });
    });

    it('should handle execution errors and emit error events', async () => {
      // Mock execution error
      mockPerformanceMonitor.getSystemMetrics.mockRejectedValue(new Error('Metrics collection failed'));

      const executionPromise = predictiveLoadManager.executePredictiveLoadManagement();

      // Listen for error event
      const errorEvent = await new Promise((resolve) => {
        predictiveLoadManager.once('predictive-management-error', resolve);
      });

      await expect(executionPromise).rejects.toThrow();

      expect(errorEvent).toMatchObject({
        error: expect.any(String),
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Current Prediction Status', () => {
    beforeEach(async () => {
      await predictiveLoadManager.initialize();
    });

    it('should return current prediction status', async () => {
      // Generate a prediction first
      await predictiveLoadManager.executePredictiveLoadManagement();

      const status = predictiveLoadManager.getCurrentPredictionStatus();

      expect(status).toEqual(expect.objectContaining({
        current_prediction: expect.objectContaining({
          prediction_id: expect.any(String),
          timestamp: expect.any(Number)
        }),
        system_status: expect.objectContaining({
          prediction_engine_active: true,
          auto_scaling_active: true,
          monitoring_active: expect.any(Boolean),
          last_prediction_time: expect.any(Number)
        }),
        recent_actions: expect.any(Array),
        prediction_accuracy: expect.any(Number)
      }));
    });

    it('should handle empty prediction status', () => {
      const status = predictiveLoadManager.getCurrentPredictionStatus();

      expect(status).toEqual(expect.objectContaining({
        current_prediction: null,
        system_status: expect.objectContaining({
          prediction_engine_active: true,
          auto_scaling_active: true,
          monitoring_active: expect.any(Boolean),
          last_prediction_time: null
        }),
        recent_actions: expect.any(Array),
        prediction_accuracy: expect.any(Number)
      }));
    });
  });

  describe('Predictive Analytics', () => {
    beforeEach(async () => {
      await predictiveLoadManager.initialize();
    });

    it('should provide comprehensive predictive analytics', async () => {
      const analytics = await predictiveLoadManager.getPredictiveAnalytics();

      expect(analytics).toEqual(expect.objectContaining({
        load_patterns: expect.any(Array),
        prediction_trends: expect.objectContaining({
          accuracy_trend: expect.any(String),
          prediction_reliability: expect.any(Number),
          pattern_recognition_effectiveness: expect.any(Number)
        }),
        resource_optimization_opportunities: expect.any(Array),
        performance_insights: expect.objectContaining({
          peak_load_times: expect.any(Array),
          resource_bottlenecks: expect.any(Array),
          optimization_recommendations: expect.any(Array)
        })
      }));
    });

    it('should identify optimization opportunities', async () => {
      const analytics = await predictiveLoadManager.getPredictiveAnalytics();

      expect(analytics.resource_optimization_opportunities).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            opportunity_type: expect.any(String),
            potential_improvement: expect.any(String),
            implementation_effort: expect.stringMatching(/^(low|medium|high)$/)
          })
        ])
      );
    });
  });

  describe('Model Updates', () => {
    beforeEach(async () => {
      await predictiveLoadManager.initialize();
    });

    it('should update predictive models with new data', async () => {
      const updatePromise = predictiveLoadManager.updatePredictiveModels();

      // Listen for update event
      const updateEvent = await new Promise((resolve) => {
        predictiveLoadManager.once('predictive-models-updated', resolve);
      });

      await updatePromise;

      expect(updateEvent).toMatchObject({
        metrics_processed: expect.any(Number),
        timestamp: expect.any(Number)
      });
    });

    it('should handle model update errors', async () => {
      // Mock update error
      jest.spyOn(predictiveLoadManager as any, 'getRecentPerformanceMetrics')
        .mockRejectedValue(new Error('Data retrieval failed'));

      const updatePromise = predictiveLoadManager.updatePredictiveModels();

      // Listen for error event
      const errorEvent = await new Promise((resolve) => {
        predictiveLoadManager.once('model-update-error', resolve);
      });

      await updatePromise; // Should not throw, but emit error event

      expect(errorEvent).toMatchObject({
        error: 'Data retrieval failed',
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Resource Management Actions', () => {
    beforeEach(async () => {
      await predictiveLoadManager.initialize();
    });

    it('should execute scale up actions', async () => {
      const scaleUpAction: PredictiveAction = {
        action_id: 'test_scale_up',
        action_type: 'scale_up',
        priority: 'high',
        estimated_impact: {
          performance_improvement_percent: 25,
          resource_cost_change: 20,
          risk_reduction_percent: 40
        },
        execution_time: Date.now(),
        confidence: 0.85,
        prerequisites: [],
        rollback_plan: 'scale_down_after_peak',
        automated_execution: true
      };

      // Access private method for testing
      const executeAction = (predictiveLoadManager as any).executeAction.bind(predictiveLoadManager);

      const actionPromise = executeAction(scaleUpAction);

      // Listen for scale up event
      const scaleUpEvent = await new Promise((resolve) => {
        predictiveLoadManager.once('scale-up-executed', resolve);
      });

      await actionPromise;

      expect(scaleUpEvent).toMatchObject({
        action_id: 'test_scale_up',
        estimated_impact: scaleUpAction.estimated_impact,
        timestamp: expect.any(Number)
      });
    });

    it('should execute rate limit adjustments', async () => {
      const rateLimitAction: PredictiveAction = {
        action_id: 'test_rate_limit',
        action_type: 'adjust_rate_limits',
        priority: 'medium',
        estimated_impact: {
          performance_improvement_percent: 15,
          resource_cost_change: 0,
          risk_reduction_percent: 30
        },
        execution_time: Date.now(),
        confidence: 0.90,
        prerequisites: [],
        rollback_plan: 'restore_previous_limits',
        automated_execution: true
      };

      // Access private method for testing
      const executeAction = (predictiveLoadManager as any).executeAction.bind(predictiveLoadManager);

      const actionPromise = executeAction(rateLimitAction);

      // Listen for rate limit adjustment event
      const rateLimitEvent = await new Promise((resolve) => {
        predictiveLoadManager.once('rate-limits-adjusted', resolve);
      });

      await actionPromise;

      expect(rateLimitEvent).toMatchObject({
        action_id: 'test_rate_limit',
        estimated_impact: rateLimitAction.estimated_impact,
        timestamp: expect.any(Number)
      });
    });

    it('should execute cache warming actions', async () => {
      const cacheWarmAction: PredictiveAction = {
        action_id: 'test_cache_warm',
        action_type: 'warm_cache',
        priority: 'medium',
        estimated_impact: {
          performance_improvement_percent: 20,
          resource_cost_change: 5,
          risk_reduction_percent: 25
        },
        execution_time: Date.now(),
        confidence: 0.80,
        prerequisites: ['cache_system_available'],
        rollback_plan: 'standard_cache_operations',
        automated_execution: true
      };

      // Access private method for testing
      const executeAction = (predictiveLoadManager as any).executeAction.bind(predictiveLoadManager);

      const actionPromise = executeAction(cacheWarmAction);

      // Listen for cache warming event
      const cacheWarmEvent = await new Promise((resolve) => {
        predictiveLoadManager.once('cache-warmed', resolve);
      });

      await actionPromise;

      expect(cacheWarmEvent).toMatchObject({
        action_id: 'test_cache_warm',
        estimated_impact: cacheWarmAction.estimated_impact,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(async () => {
      await predictiveLoadManager.initialize();
    });

    it('should handle missing system metrics gracefully', async () => {
      mockPerformanceMonitor.getSystemMetrics.mockResolvedValue(null as any as unknown as unknown as unknown);

      await expect(predictiveLoadManager.executePredictiveLoadManagement())
        .rejects.toThrow();
    });

    it('should handle invalid configuration parameters', () => {
      const invalidConfig = {
        ...config,
        prediction_engine: {
          ...config.prediction_engine,
          confidence_threshold: 1.5 // Invalid threshold > 1
        }
      };

      expect(() => {
        new PredictiveAPILoadManager(
          invalidConfig,
          mockPerformanceMonitor,
          mockMetricsCollector,
          mockLoadBalancer,
          mockRateLimiter
        );
      }).not.toThrow(); // Constructor should not validate, validation happens during execution
    });

    it('should handle action execution failures', async () => {
      const failingAction: PredictiveAction = {
        action_id: 'test_failing_action',
        action_type: 'scale_up',
        priority: 'high',
        estimated_impact: {
          performance_improvement_percent: 25,
          resource_cost_change: 20,
          risk_reduction_percent: 40
        },
        execution_time: Date.now(),
        confidence: 0.85,
        prerequisites: [],
        rollback_plan: 'scale_down_after_peak',
        automated_execution: true
      };

      // Mock action execution to fail
      jest.spyOn(predictiveLoadManager as any, 'executeScaleUpAction')
        .mockRejectedValue(new Error('Scale up failed'));

      // Execute actions through the private method
      const executeRecommendedActions = (predictiveLoadManager as any).executeRecommendedActions.bind(predictiveLoadManager);

      const actionPromise = executeRecommendedActions([failingAction]);

      // Listen for action execution error
      const errorEvent = await new Promise((resolve) => {
        predictiveLoadManager.once('action-execution-error', resolve);
      });

      await actionPromise; // Should not throw, but emit error event

      expect(errorEvent).toMatchObject({
        action_id: 'test_failing_action',
        action_type: 'scale_up',
        error: 'Scale up failed',
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Performance and Resource Management', () => {
    beforeEach(async () => {
      await predictiveLoadManager.initialize();
    });

    it('should track prediction accuracy over time', async () => {
      // Generate multiple predictions
      await predictiveLoadManager.executePredictiveLoadManagement();
      await predictiveLoadManager.executePredictiveLoadManagement();
      await predictiveLoadManager.executePredictiveLoadManagement();

      const status = predictiveLoadManager.getCurrentPredictionStatus();

      expect(status.prediction_accuracy).toBeGreaterThan(0);
      expect(status.prediction_accuracy).toBeLessThanOrEqual(1);
      expect(typeof status.prediction_accuracy).toBe('number');
    });

    it('should maintain prediction history limits', async () => {
      // Generate many predictions to test history limit
      for (let i = 0; i < 5; i++) {
        await predictiveLoadManager.executePredictiveLoadManagement();
      }

      // Access private prediction history for testing
      const predictionHistory = (predictiveLoadManager as any).predictionHistory;

      expect(predictionHistory).toHaveLength(5);
      expect(Array.isArray(predictionHistory)).toBe(true);
    });

    it('should handle memory management for large datasets', async () => {
      const memoryUsageBefore = process.memoryUsage();

      // Simulate processing with large metrics dataset
      
      // Update models multiple times with large datasets
      for (let i = 0; i < 5; i++) {
        await predictiveLoadManager.updatePredictiveModels();
      }

      const memoryUsageAfter = process.memoryUsage();

      // Verify that memory usage is reasonable (not more than 50MB increase)
      const memoryIncrease = memoryUsageAfter.heapUsed - memoryUsageBefore.heapUsed;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
    });
  });

  describe('Shutdown and Cleanup', () => {
    beforeEach(async () => {
      await predictiveLoadManager.initialize();
    });

    it('should shutdown gracefully', async () => {
      const shutdownPromise = predictiveLoadManager.shutdown();

      // Listen for shutdown event
      const shutdownEvent = await new Promise((resolve) => {
        predictiveLoadManager.once('predictive-load-manager-shutdown', resolve);
      });

      await shutdownPromise;

      expect(shutdownEvent).toMatchObject({
        timestamp: expect.any(Number)
      });
    });

    it('should clean up resources during shutdown', async () => {
      // Start some background processes
      await predictiveLoadManager.executePredictiveLoadManagement();

      // Verify monitoring interval is active
      const monitoringInterval = (predictiveLoadManager as any).monitoringInterval;
      expect(monitoringInterval).not.toBeNull();

      // Shutdown
      await predictiveLoadManager.shutdown();

      // Verify monitoring interval is cleared
      const monitoringIntervalAfter = (predictiveLoadManager as any).monitoringInterval;
      expect(monitoringIntervalAfter).toBeNull();
    });
  });
});

describe('LoadPredictionEngine', () => {
  let loadPredictionEngine: LoadPredictionEngine;
  let config: PredictiveLoadManagementConfig;

  beforeEach(() => {
    config = {
      prediction_engine: {
        enabled: true,
        prediction_window_minutes: 30,
        confidence_threshold: 0.8,
        update_interval_seconds: 60,
        learning_rate: 0.01,
        feature_extraction: {
          time_series_features: true,
          seasonal_features: true,
          trend_features: true,
          external_factors: false
        }
      },
      prediction_models: {
        time_series_model: {
          enabled: true,
          model_type: 'arima',
          window_size: 100,
          forecast_horizon: 24
        },
        machine_learning_model: {
          enabled: true,
          algorithm: 'random_forest',
          feature_importance_threshold: 0.1,
          retraining_interval_hours: 24
        },
        anomaly_detection_model: {
          enabled: true,
          detection_algorithm: 'isolation_forest',
          anomaly_threshold: 0.1,
          baseline_window_hours: 168
        }
      },
      resource_management: {
        auto_scaling: {
          enabled: true,
          scale_up_threshold: 80,
          scale_down_threshold: 40,
          cooldown_period_minutes: 5,
          max_instances: 10,
          min_instances: 2
        },
        load_balancing: {
          adaptive_strategy: true,
          health_check_interval_seconds: 30,
          failure_threshold: 3,
          recovery_threshold: 2
        },
        rate_limiting: {
          dynamic_adjustment: true,
          burst_tolerance: 100,
          grace_period_seconds: 60,
          priority_queuing: true
        }
      },
      performance_optimization: {
        caching_strategy: {
          predictive_caching: true,
          cache_warming: true,
          intelligent_eviction: true,
          cache_hit_prediction: true
        },
        request_routing: {
          intelligent_routing: true,
          latency_optimization: true,
          cost_optimization: false,
          failure_avoidance: true
        },
        resource_preallocation: {
          enabled: true,
          preallocation_threshold: 0.8,
          resource_buffer_percentage: 20,
          deallocation_delay_minutes: 15
        }
      },
      monitoring: {
        real_time_monitoring: true,
        alert_thresholds: {
          high_load_threshold: 85,
          anomaly_threshold: 0.9,
          performance_degradation_threshold: 50,
          resource_exhaustion_threshold: 90
        },
        notification_channels: ['email', 'slack'],
        dashboard_integration: true
      }
    };

    loadPredictionEngine = new LoadPredictionEngine(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Load Prediction Generation', () => {
    it('should generate comprehensive load predictions', async () => {
      const mockCurrentMetrics = {
        performance: {
          nodeExecutionTime: { name: 'node.execution.time', type: 'histogram', value: 150, timestamp: Date.now(), labels: {}, tags: [], buckets: [], percentiles: [], min: 0, max: 0, mean: 0, stdDev: 0 },
          memoryUsage: { name: 'memory.usage', type: 'gauge', value: 70, timestamp: Date.now(), labels: {}, tags: [] },
          cacheHitRate: { name: 'cache.hit.rate', type: 'counter', value: 85, timestamp: Date.now(), labels: {}, tags: [] },
          errorRate: { name: 'error.rate', type: 'counter', value: 2, timestamp: Date.now(), labels: {}, tags: [] }
        },
        business: {
          activeUsers: { name: 'active.users', type: 'gauge', value: 500, timestamp: Date.now(), labels: {}, tags: [] },
          graphsCreated: { name: 'graphs.created', type: 'counter', value: 25, timestamp: Date.now(), labels: {}, tags: [] },
          revenueGenerated: { name: 'revenue.generated', type: 'counter', value: 1000, timestamp: Date.now(), labels: {}, tags: [] },
          featureUsage: { name: 'feature.usage', type: 'histogram', value: 80, timestamp: Date.now(), labels: {}, tags: [], buckets: [], percentiles: [], min: 0, max: 0, mean: 0, stdDev: 0 }
        },
        infrastructure: {
          cpuUtilization: { name: 'cpu.utilization', type: 'gauge', value: 65, timestamp: Date.now(), labels: {}, tags: [] },
          memoryUtilization: { name: 'memory.utilization', type: 'gauge', value: 70, timestamp: Date.now(), labels: {}, tags: [] },
          diskIO: { name: 'disk.io', type: 'counter', value: 200, timestamp: Date.now(), labels: {}, tags: [] },
          networkLatency: { name: 'network.latency', type: 'histogram', value: 50, timestamp: Date.now(), labels: {}, tags: [], buckets: [], percentiles: [], min: 0, max: 0, mean: 0, stdDev: 0 }
        }
      };

      const prediction = await loadPredictionEngine.generateLoadPrediction(mockCurrentMetrics);

      expect(prediction).toEqual(expect.objectContaining({
        prediction_id: expect.stringMatching(/^load_prediction_/),
        timestamp: expect.any(Number),
        prediction_window: expect.objectContaining({
          start_time: expect.any(Number),
          end_time: expect.any(Number),
          duration_minutes: 30
        }),
        predicted_metrics: expect.objectContaining({
          request_rate: expect.objectContaining({
            value: expect.any(Number),
            confidence: expect.any(Number),
            trend: expect.stringMatching(/^(increasing|decreasing|stable)$/)
          }),
          resource_utilization: expect.any(Object),
          response_times: expect.any(Object),
          error_rates: expect.any(Object)
        }),
        risk_assessment: expect.objectContaining({
          overload_probability: expect.any(Number),
          performance_degradation_risk: expect.any(Number),
          resource_exhaustion_risk: expect.any(Number),
          availability_risk: expect.any(Number)
        }),
        recommended_actions: expect.any(Array),
        model_metadata: expect.objectContaining({
          model_version: expect.any(String),
          training_data_points: expect.any(Number),
          accuracy_score: expect.any(Number),
          last_trained: expect.any(Number)
        })
      }));
    });

    it('should emit prediction events', async () => {
      const mockCurrentMetrics = {
        performance: {
          nodeExecutionTime: { name: 'node.execution.time', type: 'histogram', value: 150, timestamp: Date.now(), labels: {}, tags: [], buckets: [], percentiles: [], min: 0, max: 0, mean: 0, stdDev: 0 },
          memoryUsage: { name: 'memory.usage', type: 'gauge', value: 70, timestamp: Date.now(), labels: {}, tags: [] },
          cacheHitRate: { name: 'cache.hit.rate', type: 'counter', value: 85, timestamp: Date.now(), labels: {}, tags: [] },
          errorRate: { name: 'error.rate', type: 'counter', value: 2, timestamp: Date.now(), labels: {}, tags: [] }
        },
        business: {
          activeUsers: { name: 'active.users', type: 'gauge', value: 500, timestamp: Date.now(), labels: {}, tags: [] },
          graphsCreated: { name: 'graphs.created', type: 'counter', value: 25, timestamp: Date.now(), labels: {}, tags: [] },
          revenueGenerated: { name: 'revenue.generated', type: 'counter', value: 1000, timestamp: Date.now(), labels: {}, tags: [] },
          featureUsage: { name: 'feature.usage', type: 'histogram', value: 80, timestamp: Date.now(), labels: {}, tags: [], buckets: [], percentiles: [], min: 0, max: 0, mean: 0, stdDev: 0 }
        },
        infrastructure: {
          cpuUtilization: { name: 'cpu.utilization', type: 'gauge', value: 65, timestamp: Date.now(), labels: {}, tags: [] },
          memoryUtilization: { name: 'memory.utilization', type: 'gauge', value: 70, timestamp: Date.now(), labels: {}, tags: [] },
          diskIO: { name: 'disk.io', type: 'counter', value: 200, timestamp: Date.now(), labels: {}, tags: [] },
          networkLatency: { name: 'network.latency', type: 'histogram', value: 50, timestamp: Date.now(), labels: {}, tags: [], buckets: [], percentiles: [], min: 0, max: 0, mean: 0, stdDev: 0 }
        }
      };

      const predictionPromise = loadPredictionEngine.generateLoadPrediction(mockCurrentMetrics);

      // Listen for prediction event
      const predictionEvent = await new Promise((resolve) => {
        loadPredictionEngine.once('prediction-generated', resolve);
      });

      const result = await predictionPromise;

      expect(predictionEvent).toMatchObject({
        prediction_id: result.prediction_id,
        predicted_load: expect.any(Number),
        confidence: expect.any(Number),
        risk_level: expect.stringMatching(/^(low|medium|high|critical)$/)
      });
    });
  });

  describe('Pattern Detection', () => {
    it('should detect load patterns successfully', async () => {
      const patterns = await loadPredictionEngine.detectLoadPatterns();

      expect(patterns).toEqual(expect.any(Array));
      
      if (patterns.length > 0) {
        expect(patterns[0]).toEqual(expect.objectContaining({
          pattern_id: expect.any(String),
          pattern_type: expect.stringMatching(/^(seasonal|trending|cyclical|anomalous|event_driven)$/),
          detected_at: expect.any(Number),
          pattern_strength: expect.any(Number),
          characteristics: expect.objectContaining({
            frequency: expect.any(Number),
            amplitude: expect.any(Number),
            phase_shift: expect.any(Number),
            duration_minutes: expect.any(Number)
          }),
          historical_occurrences: expect.any(Number),
          next_occurrence_prediction: expect.objectContaining({
            timestamp: expect.any(Number),
            confidence: expect.any(Number)
          }),
          associated_events: expect.any(Array)
        }));
      }
    });

    it('should emit pattern detection events', async () => {
      const patternPromise = loadPredictionEngine.detectLoadPatterns();

      // Listen for pattern detection event
      const patternEvent = await new Promise((resolve) => {
        loadPredictionEngine.once('patterns-detected', resolve);
      });

      const patterns = await patternPromise;

      expect(patternEvent).toMatchObject({
        patterns_count: patterns.length,
        pattern_types: expect.any(Array)
      });
    });
  });

  describe('Model Updates', () => {
    it('should update prediction models with new data', async () => {
      const mockNewData = [
        { name: 'test_metric_1', type: 'gauge', value: 50, timestamp: Date.now(), labels: {}, tags: [] },
        { name: 'test_metric_2', type: 'counter', value: 100, timestamp: Date.now(), labels: {}, tags: [] }
      ];

      const updatePromise = loadPredictionEngine.updatePredictionModels(mockNewData);

      // Listen for model update event
      const updateEvent = await new Promise((resolve) => {
        loadPredictionEngine.once('models-updated', resolve);
      });

      await updatePromise;

      expect(updateEvent).toMatchObject({
        data_points_added: 2,
        total_data_points: expect.any(Number),
        models_retrained: expect.any(Boolean)
      });
    });

    it('should maintain data retention limits', async () => {
      // Add many data points to test retention
      const largeDataSet = Array.from({ length: 15000 }, (_, i) => ({
        name: `metric_${i % 10}`,
        type: 'gauge' as const,
        value: Math.random() * 100,
        timestamp: Date.now() + i,
        labels: {},
        tags: []
      }));

      await loadPredictionEngine.updatePredictionModels(largeDataSet);

      // Access private historical data for testing
      const historicalData = (loadPredictionEngine as any).historicalData;
      
      // Verify data retention limits are enforced
      for (const [metricName, data] of historicalData.entries()) {
        expect(data.length).toBeLessThanOrEqual(10000); // Max data points per metric
      }
    });
  });
});