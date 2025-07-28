/**
 * Tests for Conversion Analytics Infrastructure - Story 30.2 Task 4
 */
import {
  ConversionAnalyticsInfrastructure,
  ConversionProcessingPipeline,
  ConversionMetricsCalculator,
  ConversionMetricQuery,
  ConversionMetricType,
  ConversionMetricResult,
  ProcessingConfig,
  MetricCalculationConfig,
  DataWarehouseConfig,
  AnalyticsAPIConfig,
  createConversionAnalyticsInfrastructure
} from '../ConversionAnalyticsInfrastructure';
import { FlexibleConversionEvent } from '../ConversionDataModel';
import { EnhancedConversionEvent } from '../ConversionFunnelArchitecture';

// Mock Epic 1 Analytics Infrastructure
const mockEpic1Analytics = {
  processEvent: jest.fn().mockResolvedValue(undefined),
  getMetrics: jest.fn().mockResolvedValue([]),
  createDataWarehouseQuery: jest.fn().mockResolvedValue([]),
};
describe('ConversionAnalyticsInfrastructure', () => {
  let infrastructure: ConversionAnalyticsInfrastructure;
  let mockEvent: FlexibleConversionEvent;
  let config: {
    dataWarehouse: DataWarehouseConfig;
    api: AnalyticsAPIConfig;
    processing: ProcessingConfig;
  };
  beforeEach(() => {
    config = {
      dataWarehouse: {,
        connectionString: 'test://localhost',
        schemaName: 'conversion_analytics',
        tablePrefix: 'conv_',
        partitioning: {,
          strategy: 'time',
          field: 'timestamp',
          interval: 'day',
        },
        retention: {,
          rawEvents: 90,
          aggregatedMetrics: 365,
          archivedData: 2555,
        },
        indexing: {,
          timeIndex: true,
          userIndex: true,
          funnelIndex: true,
          customIndices: ['user_id', 'funnel_id']
        }
      },
      api: {,
        caching: {,
          enabled: true,
          ttl: 300,
          maxSize: 1000,
          strategy: 'lru',
        },
        rateLimiting: {,
          enabled: true,
          requestsPerMinute: 100,
          burstLimit: 20,
        },
        optimization: {,
          queryTimeout: 30000,
          maxConcurrentQueries: 10,
          enableQueryPlanning: true,
          precomputeMetrics: ['conversion_rate', 'user_count']
        }
      },
      processing: {,
        validation: {,
          strict: true,
          requiredFields: ['id', 'userId', 'timestamp', 'type'],
          customRules: [],
        },
        enrichment: {,
          enableUserEnrichment: true,
          enableTemplateEnrichment: true,
          enableLocationEnrichment: false,
        },
        transformation: {,
          normalizeTimestamps: true,
          calculateDerivedFields: true,
          applyPrivacyFilters: true,
        },
        aggregation: {,
          enableRealTimeAggregation: true,
          aggregationWindows: ['1h', '1d', '1w'],
          customAggregations: [],
        },
        storage: {,
          primaryStorage: 'postgresql',
          archiveStorage: 's3',
          retentionPeriod: 2555,
        },
        batchSize: 100,
        continueOnError: true,
        forwardToEpic1: true,
      }
    };
    infrastructure = createConversionAnalyticsInfrastructure(mockEpic1Analytics, config);
    mockEvent = {
      id: 'test-event-001',
      userId: 'user-123',
      sessionId: 'session-456',
      timestamp: Date.now(),
      type: 'template_purchased',
      category: 'revenue',
      value: 25.00,
      properties: {,
        templateId: 'tpl-001',
        funnelId: 'marketplace-discovery',
        stepId: 'template-purchase',
        stepOrder: 4,
      },
      metadata: {,
        userAgent: 'test-agent',
        referrer: 'https://example.com',
      },
      deviceFingerprint: 'test-fingerprint',
      crossDeviceUserId: undefined,
      attributionData: {,
        touchpoints: [],
        primaryAttribution: {,
          name: 'first_touch',
          weight: 1.0,
          touchpoint: {,
            id: 'tp-001',
            timestamp: Date.now(),
            channel: 'direct',
            source: 'direct',
            medium: 'none',
            position: 1,
            influence: 1.0,
          },
          attribution_value: 0,
        },
        assistedAttribution: [],
      },
      privacyConsent: {,
        tracking: true,
        analytics: true,
        personalization: true,
        crossDevice: false,
      },
      realTimeProcessing: {,
        streamId: 'stream-123',
        batchId: 'batch-456',
        processed: false,
        latency: 0,
      },
      flexibleProperties: {,
        templateId: {,
          value: 'tpl-001',
          type: 'string',
          metadata: {,
            source: 'event',
            confidence: 1.0,
            lastUpdated: Date.now(),
            validationStatus: 'valid',
          }
        }
      },
      schemaVersion: '1.0.0',
      validation: {,
        isValid: true,
        score: 95,
        errors: [],
        warnings: [],
        appliedRules: ['required_fields'],
      },
      funnelContext: {,
        funnelId: 'marketplace-discovery',
        stepId: 'template-purchase',
        stepOrder: 4,
        timeInFunnel: 300000,
        previousSteps: ['entry_point', 'engagement'],
        isBacktracking: false,
      },
      userContext: {,
        segmentIds: ['premium_user'],
        cohortIds: ['cohort-2024-01'],
        lifetimeValue: 150.00,
        riskScore: 0.2,
        engagementScore: 0.8,
        profileCompleteness: 0.9,
        lastActivity: Date.now() - 86400000
      },
      templateContext: {,
        templateId: 'tpl-001',
        templateType: 'character-development',
        creatorId: 'creator-123',
        category: 'character-development',
        price: 25.00,
        rating: 4.5,
        popularity: 1500,
        tags: ['character', 'development']
      },
      sessionContext: {,
        isNewSession: false,
        sessionDuration: 1800000,
        pageViewCount: 12,
        previousConversions: 2,
        referrerCategory: 'search',
        deviceFingerprint: 'test-fingerprint',
      }
    } as FlexibleConversionEvent;
  });
  describe('Infrastructure Creation', () => {
    it('should create infrastructure with proper configuration', () => {
      expect(infrastructure).toBeDefined();
      expect(infrastructure).toBeInstanceOf(ConversionAnalyticsInfrastructure);
    });
    it('should initialize with Epic 1 analytics integration', () => {
      expect(mockEpic1Analytics).toBeDefined();
    });
  });
  describe('Event Processing', () => {
    it('should process single conversion event successfully', async () => {
      const results = await infrastructure.processConversionEvent(mockEvent);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      // Check that all processing stages completed
      const stageNames = results.map(r => r.stage);
      expect(stageNames).toContain('validation');
      expect(stageNames).toContain('enrichment');
      expect(stageNames).toContain('transformation');
      expect(stageNames).toContain('aggregation');
      expect(stageNames).toContain('storage');
    });
    it('should handle processing errors gracefully', async () => {
      const invalidEvent = {
        ...mockEvent,
        id: undefined, // Missing required field
        userId: undefined, // Missing required field
        timestamp: undefined,
      };
      const results = await infrastructure.processConversionEvent(invalidEvent);
      expect(results).toBeDefined();
      // With continueOnError = true, processing should continue despite validation errors
      expect(results.length).toBeGreaterThan(0);
      const validationResult = results.find(r => r.stage === 'validation');
      expect(validationResult).toBeDefined();
      expect(validationResult!.success).toBe(false);
    });
    it('should process batch of events efficiently', async () => {
      const events = Array.from({ length: 10 }, (_, i) => ({)
        ...mockEvent,
        id: `batch-event-${i}`,}
        userId: `user-${i}`}
      }));
      const result = await infrastructure.processBatch(events);
      expect(result).toBeDefined();
      expect(result.totalEvents).toBe(10);
      expect(result.processedCount).toBeGreaterThan(0);
      expect(Array.isArray(result.stageResults)).toBe(true);
    });
    it('should forward events to Epic 1 analytics when configured', async () => {
      // Clear any previous calls
      mockEpic1Analytics.processEvent.mockClear();
      await infrastructure.processConversionEvent(mockEvent);
      expect(mockEpic1Analytics.processEvent).toHaveBeenCalledTimes(1);
      expect(mockEpic1Analytics.processEvent).toHaveBeenCalledWith()
        expect.objectContaining({)
          id: mockEvent.id,
          type: mockEvent.type,
          userId: mockEvent.userId,
          sessionId: mockEvent.sessionId,
          properties: expect.objectContaining({),
            conversionData: expect.objectContaining({),
              funnelId: mockEvent.funnelContext.funnelId,
              stepId: mockEvent.funnelContext.stepId,
              value: mockEvent.value,
            })
          })
        })
      );
    });
  });
  describe('Metrics Querying', () => {
    it('should query conversion metrics with basic parameters', async () => {
      const query: ConversionMetricQuery = {
        funnelId: 'marketplace-discovery',
        startDate: Date.now() - 86400000, // 24 hours ago
        endDate: Date.now(),
        metrics: ['conversion_rate', 'user_count'],
        aggregation: {,
          interval: 'hour',
        }
      };
      const results = await infrastructure.queryMetrics(query);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
    it('should query metrics with filtering and grouping', async () => {
      const query: ConversionMetricQuery = {
        startDate: Date.now() - 604800000, // 7 days ago
        endDate: Date.now(),
        metrics: ['conversion_rate', 'revenue'],
        groupBy: ['funnel_step', 'user_segment'],
        filters: [,
          {
            field: 'userContext.segmentIds',
            operator: 'contains',
            value: 'premium_user',
          }
        ],
        aggregation: {,
          interval: 'day',
          fillGaps: true,
        }
      };
      const results = await infrastructure.queryMetrics(query);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
    it('should handle complex metric queries with multiple dimensions', async () => {
      const query: ConversionMetricQuery = {
        startDate: Date.now() - 2592000000, // 30 days ago
        endDate: Date.now(),
        metrics: ['conversion_rate', 'drop_off_rate', 'average_time_to_convert', 'revenue'],
        groupBy: ['funnel_step', 'user_segment', 'channel'],
        filters: [,
          {
            field: 'value',
            operator: 'greater_than',
            value: 0,
          },
          {
            field: 'funnelContext.funnelId',
            operator: 'equals',
            value: 'marketplace-discovery',
          }
        ],
        aggregation: {,
          interval: 'week',
          timeZone: 'UTC',
          fillGaps: true,
        },
        useCache: true,
        maxResults: 1000,
      };
      const results = await infrastructure.queryMetrics(query);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });
  describe('Real-time Metrics', () => {
    it('should get real-time metrics for a funnel', async () => {
      const funnelId = 'marketplace-discovery';
      const timeWindow = 3600000; // 1 hour;
      const realTimeMetrics = await infrastructure.getRealTimeMetrics(funnelId, timeWindow);
      expect(realTimeMetrics).toBeDefined();
      expect(realTimeMetrics.funnelId).toBe(funnelId);
      expect(realTimeMetrics.timestamp).toBeDefined();
      expect(realTimeMetrics.metrics).toBeDefined();
      expect(typeof realTimeMetrics.metrics.activeUsers).toBe('number');
      expect(typeof realTimeMetrics.metrics.conversionsLastHour).toBe('number');
      expect(typeof realTimeMetrics.metrics.conversionRate).toBe('number');
    });
    it('should handle real-time metrics with default time window', async () => {
      const funnelId = 'user-onboarding';
      const realTimeMetrics = await infrastructure.getRealTimeMetrics(funnelId);
      expect(realTimeMetrics).toBeDefined();
      expect(realTimeMetrics.funnelId).toBe(funnelId);
      expect(realTimeMetrics.metrics).toBeDefined();
    });
  });
  describe('Data Export', () => {
    it('should handle data export requests', async () => {
      const exportRequest = {
        format: 'json' as const,
        query: {,
          startDate: Date.now() - 86400000,
          endDate: Date.now(),
          metrics: ['conversion_rate', 'user_count'],
          aggregation: {,
            interval: 'hour' as const
          }
        },
        compression: 'gzip' as const,
        destination: 'download' as const
      };
      const result = await infrastructure.exportData(exportRequest);
      expect(result).toBeDefined();
      expect(result.exportId).toBeDefined();
      expect(['pending', 'completed', 'failed']).toContain(result.status);
    });
    it('should support different export formats', async () => {
      const formats = ['csv', 'json', 'parquet'] as const;
      for (const format of formats) {
        const exportRequest = {
          format,
          query: {,
            startDate: Date.now() - 86400000,
            endDate: Date.now(),
            metrics: ['user_count'],
            aggregation: {,
              interval: 'day' as const
            }
          }
        };
        const result = await infrastructure.exportData(exportRequest);
        expect(result).toBeDefined();
        expect(result.exportId).toBeDefined();
      }
    });
  });
  describe('Health Monitoring', () => {
    it('should provide infrastructure health status', async () => {
      const health = await infrastructure.getHealthStatus();
      expect(health).toBeDefined();
      expect(health.processing).toBeDefined();
      expect(health.metrics).toBeDefined();
      expect(health.dataWarehouse).toBeDefined();
      expect(health.api).toBeDefined();
      // Check component health structure
      Object.values(health).forEach(componentHealth => {)
        expect(typeof componentHealth.healthy).toBe('boolean');
        expect(typeof componentHealth.uptime).toBe('number');
        expect(componentHealth.metrics).toBeDefined();
        expect(typeof componentHealth.metrics.errorRate).toBe('number');
        expect(typeof componentHealth.metrics.averageLatency).toBe('number');
      });
    });
    it('should report healthy status for properly configured infrastructure', async () => {
      const health = await infrastructure.getHealthStatus();
      expect(health.processing.healthy).toBe(true);
      expect(health.metrics.healthy).toBe(true);
      expect(health.dataWarehouse.healthy).toBe(true);
      expect(health.api.healthy).toBe(true);
    });
  });
  describe('Integration with Epic 1', () => {
    beforeEach(() => {
      mockEpic1Analytics.processEvent.mockClear();
    });
    it('should handle Epic 1 forwarding failures gracefully', async () => {
      mockEpic1Analytics.processEvent.mockRejectedValueOnce(new Error('Epic 1 service unavailable'));
      // Should not throw error even if Epic 1 forwarding fails
      const results = await infrastructure.processConversionEvent(mockEvent);
      expect(results).toBeDefined();
      expect(results.every(r => r.stage !== 'epic1_forwarding_error')).toBe(true);
    });
  });
});
describe('ConversionMetricsCalculator', () => {
  let calculator: ConversionMetricsCalculator;
  let calculationConfig: MetricCalculationConfig;
  beforeEach(() => {
    calculationConfig = {
      enableCaching: true,
      cacheTimeout: 300000,
      parallelCalculations: true,
      customMetrics: {}
    };
    calculator = new ConversionMetricsCalculator(calculationConfig);
  });
  describe('Basic Functionality', () => {
    it('should create calculator with configuration', () => {
      expect(calculator).toBeDefined();
      expect(calculator).toBeInstanceOf(ConversionMetricsCalculator);
    });
    it('should provide health status', async () => {
      const health = await calculator.getHealthStatus();
      expect(health).toBeDefined();
      expect(typeof health.healthy).toBe('boolean');
      expect(typeof health.uptime).toBe('number');
      expect(health.metrics).toBeDefined();
      expect(typeof health.metrics.errorRate).toBe('number');
      expect(typeof health.metrics.averageLatency).toBe('number');
    });
  });
});
describe('ConversionProcessingPipeline', () => {
  let pipeline: ConversionProcessingPipeline;
  let processingConfig: ProcessingConfig;
  beforeEach(() => {
    processingConfig = {
      validation: {,
        strict: true,
        requiredFields: ['id', 'userId', 'timestamp', 'type'],
        customRules: [],
      },
      enrichment: {,
        enableUserEnrichment: true,
        enableTemplateEnrichment: true,
        enableLocationEnrichment: false,
      },
      transformation: {,
        normalizeTimestamps: true,
        calculateDerivedFields: true,
        applyPrivacyFilters: true,
      },
      aggregation: {,
        enableRealTimeAggregation: true,
        aggregationWindows: ['1h', '1d'],
        customAggregations: [],
      },
      storage: {,
        primaryStorage: 'postgresql',
        archiveStorage: 's3',
        retentionPeriod: 90,
      },
      batchSize: 50,
      continueOnError: true,
      forwardToEpic1: true,
    };
    pipeline = new ConversionProcessingPipeline(mockEpic1Analytics, processingConfig);
  });
  describe('Basic Functionality', () => {
    it('should create pipeline with configuration', () => {
      expect(pipeline).toBeDefined();
      expect(pipeline).toBeInstanceOf(ConversionProcessingPipeline);
    });
    it('should report pipeline health status', async () => {
      const health = await pipeline.getHealthStatus();
      expect(health).toBeDefined();
      expect(typeof health.healthy).toBe('boolean');
      expect(typeof health.uptime).toBe('number');
      expect(health.metrics).toBeDefined();
      expect(typeof health.metrics.errorRate).toBe('number');
      expect(typeof health.metrics.averageLatency).toBe('number');
    });
  });
});
describe('Configuration Validation', () => {
  it('should handle different configuration scenarios', () => {
    const minimalConfig = {
      dataWarehouse: {,
        connectionString: 'minimal://config',
        schemaName: 'test',
        tablePrefix: 'test_',
        partitioning: { strategy: 'time' as const, field: 'timestamp' },
        retention: { rawEvents: 30, aggregatedMetrics: 90, archivedData: 365 },
        indexing: { timeIndex: true, userIndex: true, funnelIndex: true, customIndices: [] }
      },
      api: {,
        caching: { enabled: false, ttl: 0, maxSize: 0, strategy: 'lru' as const },
        rateLimiting: { enabled: false, requestsPerMinute: 0, burstLimit: 0 },
        optimization: { queryTimeout: 30000, maxConcurrentQueries: 1, enableQueryPlanning: false, precomputeMetrics: [] }
      },
      processing: {,
        validation: { strict: false, requiredFields: [], customRules: [] },
        enrichment: { enableUserEnrichment: false, enableTemplateEnrichment: false, enableLocationEnrichment: false },
        transformation: { normalizeTimestamps: false, calculateDerivedFields: false, applyPrivacyFilters: false },
        aggregation: { enableRealTimeAggregation: false, aggregationWindows: [], customAggregations: [] },
        storage: { primaryStorage: 'memory', archiveStorage: 'none', retentionPeriod: 1 },
        batchSize: 1,
        continueOnError: false,
        forwardToEpic1: false,
      }
    };
    const minimalInfrastructure = createConversionAnalyticsInfrastructure(mockEpic1Analytics, minimalConfig);
    expect(minimalInfrastructure).toBeDefined();
    expect(minimalInfrastructure).toBeInstanceOf(ConversionAnalyticsInfrastructure);
  });
});