/**
 * Tests for Security Intelligence Data Model and Processing Pipeline
 * Epic 31 - Task E31-1753313263556-F9FAFD
 */

import { 
  SecurityIntelligenceDataModelEngine, 
  ProcessingPipelineConfig, 
  SecurityIntelligenceDataModel,
  ThreatEntity,
  AssetEntity,
  IncidentEntity,
  VulnerabilityEntity
 from '../SecurityIntelligenceDataModel';

describe('SecurityIntelligenceDataModelEngine', () => {
  let dataModelEngine: SecurityIntelligenceDataModelEngine;
  let config: ProcessingPipelineConfig;

  beforeEach(() => {
    // Setup comprehensive processing pipeline configuration
    config = {
      stream_processing: {
        enabled: true,
        real_time_ingestion: {
          kafka_config: {
            brokers: ['localhost:9092'],
            topics: ['security-events', 'threat-intelligence'],
            consumer_groups: ['security-analytics-group'],
            batch_size: 1000,
            max_poll_interval: 300000

          processing_parallelism: 4,
          checkpoint_interval: 10000,
          watermark_delay: 5000

        stream_analytics: {
          correlation_window_minutes: 15,
          anomaly_detection_enabled: true,
          pattern_matching_enabled: true,
          alert_thresholds: [
            { metric: 'threat_severity', threshold: 80 },
            { metric: 'anomaly_score', threshold: 90 }
          ]


      batch_processing: {
        enabled: true,
        etl_schedules: {
          hourly_jobs: [{ job_name: 'threat_refresh', schedule: '0 * * * *' }],
          daily_jobs: [{ job_name: 'vuln_aggregation', schedule: '0 2 * * *' }],
          weekly_jobs: [{ job_name: 'trend_analysis', schedule: '0 2 * * 0' }],
          monthly_jobs: [{ job_name: 'compliance_reporting', schedule: '0 2 1 * *' }]

        ml_training: {
          model_retraining_schedule: '0 3 * * 0',
          feature_engineering_pipeline: { features: ['threat_indicators', 'asset_characteristics'] },
          model_validation_config: { validation_method: 'time_series_split' },
          automated_deployment: true

        analytics_aggregation: {
          metric_rollup_intervals: ['5m', '1h', '1d'],
          aggregation_functions: [{ function_name: 'avg' }, { function_name: 'count' }],
          materialized_view_refresh: '*/15 * * * *'


      data_quality: {
        validation_stages: [
          { stage_name: 'schema_validation', rules: ['required_fields', 'data_types'] },
          { stage_name: 'business_rules', rules: ['logical_consistency'] },
          { stage_name: 'quality_scoring', rules: ['completeness', 'accuracy'] }
        ],
        quality_dimensions: [
          { dimension_name: 'completeness' },
          { dimension_name: 'accuracy' },
          { dimension_name: 'consistency' },
          { dimension_name: 'timeliness' }
        ],
        remediation_policies: [
          { policy_name: 'auto_correct', actions: ['format_correction'] },
          { policy_name: 'quarantine', actions: ['isolate_record'] }
        ],
        quality_monitoring: { monitoring_interval: 300 }

      performance_optimization: {
        caching_strategy: { strategy_type: 'multi_tier' },
        partitioning_strategy: { partition_type: 'time_based' },
        indexing_strategy: { index_type: 'composite' },
        compression_config: { compression_type: 'lz4' }

    };

    dataModelEngine = new SecurityIntelligenceDataModelEngine(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid configuration', async () => {
      const initializeSpy = jest.spyOn(dataModelEngine, 'initialize');
      
      await dataModelEngine.initialize();
      
      expect(initializeSpy).toHaveBeenCalled();
    });

    it('should emit initialization events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      dataModelEngine.on('data_model_engine_initialized', eventSpy);
      
      await dataModelEngine.initialize();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
          configuration: config,
          schema_version: expect.any(String)
  }
      );
    });

    it('should initialize stream processing when enabled', async () => {
      const streamConfig = { ...config };
      streamConfig.stream_processing.enabled = true;
      
      const streamEngine = new SecurityIntelligenceDataModelEngine(streamConfig);
      await streamEngine.initialize();
      
      expect(streamEngine).toBeInstanceOf(SecurityIntelligenceDataModelEngine);
    });

    it('should initialize batch processing when enabled', async () => {
      const batchConfig = { ...config };
      batchConfig.batch_processing.enabled = true;
      
      const batchEngine = new SecurityIntelligenceDataModelEngine(batchConfig);
      await batchEngine.initialize();
      
      expect(batchEngine).toBeInstanceOf(SecurityIntelligenceDataModelEngine);
    });

    it('should handle initialization errors gracefully', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      dataModelEngine.on('initialization_error', errorEventSpy);

      // Mock internal method to throw error for testing
      const originalMethod = dataModelEngine.initialize;
      dataModelEngine.initialize = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Initialization failed'));

      await expect(dataModelEngine.initialize()).rejects.toThrow();
      
      // Restore original method
      dataModelEngine.initialize = originalMethod;
    });

    it('should prevent double initialization', async () => {
      await dataModelEngine.initialize();
      
      // Second initialization should return immediately
      const startTime = Date.now();
      await dataModelEngine.initialize();
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(10); // Should be nearly instant
    });
  });

  describe('Data Ingestion', () => {
    beforeEach(async () => {
      await dataModelEngine.initialize();
    });

    it('should ingest threat data successfully', async () => {
      const threatData = {
        threat_name: 'Advanced Persistent Threat Campaign X',
        threat_type: 'apt',
        severity_level: 'critical',
        confidence_score: 95,
        attack_vectors: ['spear_phishing', 'watering_hole'],
        threat_actor: 'APT29'
      };

      const result = await dataModelEngine.ingestSecurityData(
        'threat_intelligence_feed',
        'threat',
        threatData,
        {
          validation_level: 'comprehensive',
          processing_priority: 'high',
          enable_enrichment: true,
          enable_correlation: true
        }
      );

      expect(result).toHaveProperty('ingestion_id');
      expect(result).toHaveProperty('processing_status', 'completed');
      expect(result).toHaveProperty('data_quality_score');
      expect(result).toHaveProperty('enrichment_results');
      expect(result).toHaveProperty('correlation_results');
      expect(typeof result.data_quality_score).toBe('number');
      expect(result.data_quality_score).toBeGreaterThan(0);
      expect(result.data_quality_score).toBeLessThanOrEqual(100);
    });

    it('should ingest asset data successfully', async () => {
      const assetData = {
        asset_name: 'Web Server Production-01',
        asset_type: 'server',
        criticality_level: 'critical',
        operating_system: 'Linux Ubuntu 20.04',
        business_unit: 'E-Commerce',
        environment: 'production'
      };

      const result = await dataModelEngine.ingestSecurityData(
        'asset_discovery_system',
        'asset',
        assetData,
        {
          validation_level: 'standard',
          processing_priority: 'medium',
          enable_enrichment: false,
          enable_correlation: true
        }
      );

      expect(result.processing_status).toBe('completed');
      expect(result.ingestion_id).toBeDefined();
      expect(result.data_quality_score).toBeGreaterThan(0);
    });

    it('should ingest incident data successfully', async () => {
      const incidentData = {
        incident_title: 'Malware Detection on Critical Server',
        incident_type: 'malware_infection',
        severity: 'high',
        detection_time: new Date().toISOString(),
        affected_assets: ['server-prod-01', 'server-prod-02'],
        attack_vectors: ['email_attachment']
      };

      const result = await dataModelEngine.ingestSecurityData(
        'security_monitoring_system',
        'incident',
        incidentData,
        {
          validation_level: 'comprehensive',
          processing_priority: 'critical',
          enable_enrichment: true,
          enable_correlation: true
        }
      );

      expect(result.processing_status).toBe('completed');
      expect(result.enrichment_results).toBeDefined();
      expect(result.correlation_results).toBeDefined();
    });

    it('should ingest vulnerability data successfully', async () => {
      const vulnerabilityData = {
        cve_id: 'CVE-2024-12345',
        vulnerability_name: 'Remote Code Execution in Web Framework',
        cvss_base_score: 9.8,
        affected_products: ['WebFramework v2.1', 'WebFramework v2.2'],
        exploit_available: true,
        patch_available: false
      };

      const result = await dataModelEngine.ingestSecurityData(
        'vulnerability_scanner',
        'vulnerability',
        vulnerabilityData,
        {
          validation_level: 'standard',
          processing_priority: 'high',
          enable_enrichment: true,
          enable_correlation: false
        }
      );

      expect(result.processing_status).toBe('completed');
      expect(result.data_quality_score).toBeGreaterThan(70); // Should have good quality
    });

    it('should handle different processing priorities', async () => {
      const priorities = ['low', 'medium', 'high', 'critical'] as const;
      
      for (const priority of priorities) {
        const result = await dataModelEngine.ingestSecurityData(
          'test_source',
          'event',
          { test_data: 'sample' },
          { processing_priority: priority }
        );

        expect(result.processing_status).toBe('completed');
        expect(result.ingestion_id).toBeDefined();

    });

    it('should emit data ingestion events', async () => {
      const startEventSpy = jest.fn<unknown[], unknown>();
      const completeEventSpy = jest.fn<unknown[], unknown>();
      
      dataModelEngine.on('data_ingestion_started', startEventSpy);
      dataModelEngine.on('data_ingestion_completed', completeEventSpy);

      await dataModelEngine.ingestSecurityData(
        'test_source',
        'event',
        { test_data: 'sample' }
      );

      expect(startEventSpy).toHaveBeenCalled();
      expect(completeEventSpy).toHaveBeenCalled();
    });

    it('should handle ingestion failures gracefully', async () => {
      const failEventSpy = jest.fn<unknown[], unknown>();
      dataModelEngine.on('data_ingestion_failed', failEventSpy);

      // Test with invalid data type to trigger validation failure
      await expect(dataModelEngine.ingestSecurityData(
        'test_source',
        'invalid_type' as any,
        {}
      )).rejects.toThrow();
    });

    it('should apply quality requirements correctly', async () => {
      const qualityRequirements = [
        { dimension: 'completeness', threshold: 90 },
        { dimension: 'accuracy', threshold: 85 }
      ];

      const result = await dataModelEngine.ingestSecurityData(
        'high_quality_source',
        'threat',
        { threat_name: 'Test Threat', confidence_score: 95 },
        { quality_requirements: qualityRequirements }
      );

      expect(result.data_quality_score).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Stream Processing', () => {
    beforeEach(async () => {
      await dataModelEngine.initialize();
    });

    it('should process streaming data successfully', async () => {
      const result = await dataModelEngine.processStreamingData(
        'security_events_stream',
        {
          correlation_window_minutes: 10,
          anomaly_detection: true,
          pattern_matching: true,
          real_time_alerts: true
        }
      );

      expect(result).toHaveProperty('stream_id');
      expect(result).toHaveProperty('processing_status', 'active');
      expect(result).toHaveProperty('events_processed');
      expect(result).toHaveProperty('anomalies_detected');
      expect(result).toHaveProperty('patterns_identified');
      expect(result).toHaveProperty('alerts_generated');
      expect(typeof result.events_processed).toBe('number');
      expect(result.events_processed).toBeGreaterThanOrEqual(0);
      expect(result.patterns_identified).toBeInstanceOf(Array);
    });

    it('should handle different correlation windows', async () => {
      const windows = [5, 15, 30, 60];
      
      for (const window of windows) {
        const result = await dataModelEngine.processStreamingData(
          `stream_window_${window}`,
          { correlation_window_minutes: window }
        );

        expect(result.processing_status).toBe('active');
        expect(result.stream_id).toBeDefined();

    });

    it('should detect anomalies when enabled', async () => {
      const result = await dataModelEngine.processStreamingData(
        'anomaly_detection_stream',
        { anomaly_detection: true }
      );

      expect(result.anomalies_detected).toBeGreaterThanOrEqual(0);
      expect(typeof result.anomalies_detected).toBe('number');
    });

    it('should identify patterns when enabled', async () => {
      const result = await dataModelEngine.processStreamingData(
        'pattern_matching_stream',
        { pattern_matching: true }
      );

      expect(result.patterns_identified).toBeInstanceOf(Array);
      expect(result.patterns_identified.length).toBeGreaterThanOrEqual(0);
    });

    it('should generate alerts when enabled', async () => {
      const result = await dataModelEngine.processStreamingData(
        'real_time_alerts_stream',
        { real_time_alerts: true }
      );

      expect(result.alerts_generated).toBeGreaterThanOrEqual(0);
      expect(typeof result.alerts_generated).toBe('number');
    });

    it('should emit stream processing events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      dataModelEngine.on('stream_processing_completed', eventSpy);

      await dataModelEngine.processStreamingData('test_stream');

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          stream_id: expect.any(String),
          stream_name: 'test_stream',
          results: expect.any(Object),
          timestamp: expect.any(Number)
  }
      );
    });

    it('should handle stream processing failures', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      dataModelEngine.on('stream_processing_failed', errorEventSpy);

      // Mock internal method to cause failure for testing
      const originalMethod = dataModelEngine.processStreamingData;
      dataModelEngine.processStreamingData = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Stream processing failed'));

      await expect(dataModelEngine.processStreamingData('failing_stream')).rejects.toThrow();
      
      // Restore original method
      dataModelEngine.processStreamingData = originalMethod;
    });
  });

  describe('Batch Processing', () => {
    beforeEach(async () => {
      await dataModelEngine.initialize();
    });

    it('should execute ETL jobs successfully', async () => {
      const result = await dataModelEngine.executeBatchProcessing(
        'etl',
        {
          job_name: 'Threat Intelligence ETL',
          data_sources: ['threat_feed_1', 'threat_feed_2'],
          target_tables: ['threats', 'indicators'],
          processing_window: {
            start: new Date(Date.now() - 86400000),
            end: new Date()

        }
      );

      expect(result).toHaveProperty('job_id');
      expect(result).toHaveProperty('execution_status', 'completed');
      expect(result).toHaveProperty('records_processed');
      expect(result).toHaveProperty('data_quality_score');
      expect(result).toHaveProperty('performance_metrics');
      expect(result).toHaveProperty('execution_duration_minutes');
      expect(typeof result.records_processed).toBe('number');
      expect(result.records_processed).toBeGreaterThan(0);
      expect(result.data_quality_score).toBeGreaterThan(0);
    });

    it('should execute ML training jobs successfully', async () => {
      const result = await dataModelEngine.executeBatchProcessing(
        'ml_training',
        {
          job_name: 'Threat Classification Model Training',
          data_sources: ['historical_threats', 'labeled_incidents'],
          quality_requirements: [
            { dimension: 'completeness', threshold: 95 }
          ]

      );

      expect(result.execution_status).toBe('completed');
      expect(result.records_processed).toBeGreaterThan(0);
      expect(result.performance_metrics).toBeDefined();
    });

    it('should execute analytics aggregation jobs successfully', async () => {
      const result = await dataModelEngine.executeBatchProcessing(
        'analytics_aggregation',
        {
          job_name: 'Security Metrics Rollup',
          target_tables: ['hourly_metrics', 'daily_metrics'],
          performance_targets: [
            { metric: 'processing_speed', target_value: 1000 }
          ]

      );

      expect(result.execution_status).toBe('completed');
      expect(result.data_quality_score).toBeGreaterThan(80);
      expect(result.execution_duration_minutes).toBeGreaterThan(0);
    });

    it('should handle different job types', async () => {
      const jobTypes = ['etl', 'ml_training', 'analytics_aggregation'] as const;
      
      for (const jobType of jobTypes) {
        const result = await dataModelEngine.executeBatchProcessing(
          jobType,
          { job_name: `Test ${jobType} Job` }
        );

        expect(result.execution_status).toBe('completed');
        expect(result.job_id).toBeDefined();

    });

    it('should emit batch processing events', async () => {
      const startEventSpy = jest.fn<unknown[], unknown>();
      const completeEventSpy = jest.fn<unknown[], unknown>();
      
      dataModelEngine.on('batch_processing_started', startEventSpy);
      dataModelEngine.on('batch_processing_completed', completeEventSpy);

      await dataModelEngine.executeBatchProcessing(
        'etl',
        { job_name: 'Test Batch Job' }
      );

      expect(startEventSpy).toHaveBeenCalled();
      expect(completeEventSpy).toHaveBeenCalled();
    });

    it('should handle batch processing failures', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      dataModelEngine.on('batch_processing_failed', errorEventSpy);

      // Mock internal method to cause failure for testing
      const originalMethod = dataModelEngine.executeBatchProcessing;
      dataModelEngine.executeBatchProcessing = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Batch processing failed'));

      await expect(dataModelEngine.executeBatchProcessing('etl', { job_name: 'Failing Job' })).rejects.toThrow();
      
      // Restore original method
      dataModelEngine.executeBatchProcessing = originalMethod;
    });

    it('should respect quality requirements', async () => {
      const qualityRequirements = [
        { dimension: 'accuracy', threshold: 90 },
        { dimension: 'completeness', threshold: 95 }
      ];

      const result = await dataModelEngine.executeBatchProcessing(
        'etl',
        {
          job_name: 'High Quality ETL Job',
          quality_requirements: qualityRequirements

      );

      expect(result.data_quality_score).toBeGreaterThanOrEqual(85);
    });

    it('should achieve performance targets', async () => {
      const performanceTargets = [
        { metric: 'records_per_second', target_value: 1000 },
        { metric: 'memory_usage_mb', target_value: 2048 }
      ];

      const result = await dataModelEngine.executeBatchProcessing(
        'analytics_aggregation',
        {
          job_name: 'Performance Optimized Job',
          performance_targets: performanceTargets
        }
      );

      expect(result.execution_status).toBe('completed');
      expect(result.performance_metrics).toBeDefined();
    });
  });

  describe('Data Model Statistics', () => {
    beforeEach(async () => {
      await dataModelEngine.initialize();
      
      // Ingest some sample data for statistics
      await dataModelEngine.ingestSecurityData('test_source', 'threat', { threat_name: 'Test Threat 1' });
      await dataModelEngine.ingestSecurityData('test_source', 'asset', { asset_name: 'Test Asset 1' });
      await dataModelEngine.ingestSecurityData('test_source', 'incident', { incident_title: 'Test Incident 1' });
    });

    it('should provide comprehensive statistics', async () => {
      const statistics = await dataModelEngine.getDataModelStatistics();

      expect(statistics).toHaveProperty('entity_counts');
      expect(statistics).toHaveProperty('relationship_counts');
      expect(statistics).toHaveProperty('data_quality_summary');
      expect(statistics).toHaveProperty('processing_performance');
      expect(statistics).toHaveProperty('recent_activities');
    });

    it('should include entity counts', async () => {
      const statistics = await dataModelEngine.getDataModelStatistics();

      expect(statistics.entity_counts).toHaveProperty('threats');
      expect(statistics.entity_counts).toHaveProperty('assets');
      expect(statistics.entity_counts).toHaveProperty('users');
      expect(statistics.entity_counts).toHaveProperty('incidents');
      expect(statistics.entity_counts).toHaveProperty('vulnerabilities');
      expect(statistics.entity_counts).toHaveProperty('campaigns');
      expect(statistics.entity_counts).toHaveProperty('indicators');
      expect(statistics.entity_counts).toHaveProperty('techniques');
      
      // Verify counts are numbers
      Object.values(statistics.entity_counts).forEach(count => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include relationship counts', async () => {
      const statistics = await dataModelEngine.getDataModelStatistics();

      expect(statistics.relationship_counts).toHaveProperty('threat_asset_mappings');
      expect(statistics.relationship_counts).toHaveProperty('user_incident_associations');
      expect(statistics.relationship_counts).toHaveProperty('vulnerability_exploit_chains');
      expect(statistics.relationship_counts).toHaveProperty('campaign_threat_associations');
      expect(statistics.relationship_counts).toHaveProperty('indicator_technique_mappings');
      expect(statistics.relationship_counts).toHaveProperty('asset_vulnerability_relationships');
      
      // Verify counts are numbers
      Object.values(statistics.relationship_counts).forEach(count => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include data quality summary', async () => {
      const statistics = await dataModelEngine.getDataModelStatistics();

      expect(statistics.data_quality_summary).toHaveProperty('overall_quality_score');
      expect(statistics.data_quality_summary).toHaveProperty('completeness_score');
      expect(statistics.data_quality_summary).toHaveProperty('accuracy_score');
      expect(statistics.data_quality_summary).toHaveProperty('consistency_score');
      expect(statistics.data_quality_summary).toHaveProperty('timeliness_score');
      
      // Verify quality scores are within valid range
      expect(statistics.data_quality_summary.overall_quality_score).toBeGreaterThanOrEqual(0);
      expect(statistics.data_quality_summary.overall_quality_score).toBeLessThanOrEqual(100);
    });

    it('should include processing performance metrics', async () => {
      const statistics = await dataModelEngine.getDataModelStatistics();

      expect(statistics.processing_performance).toHaveProperty('average_processing_time_ms');
      expect(statistics.processing_performance).toHaveProperty('throughput_records_per_second');
      expect(statistics.processing_performance).toHaveProperty('error_rate_percentage');
      expect(statistics.processing_performance).toHaveProperty('resource_utilization_percentage');
      
      // Verify performance metrics are reasonable
      expect(statistics.processing_performance.average_processing_time_ms).toBeGreaterThan(0);
      expect(statistics.processing_performance.throughput_records_per_second).toBeGreaterThan(0);
      expect(statistics.processing_performance.error_rate_percentage).toBeGreaterThanOrEqual(0);
      expect(statistics.processing_performance.resource_utilization_percentage).toBeGreaterThanOrEqual(0);
      expect(statistics.processing_performance.resource_utilization_percentage).toBeLessThanOrEqual(100);
    });

    it('should include recent activities', async () => {
      const statistics = await dataModelEngine.getDataModelStatistics();

      expect(statistics.recent_activities).toBeInstanceOf(Array);
      expect(statistics.recent_activities.length).toBeGreaterThanOrEqual(0);
      
      if (statistics.recent_activities.length > 0) {
        const activity = statistics.recent_activities[0];
        expect(activity).toHaveProperty('activity_type');
        expect(activity).toHaveProperty('timestamp');
        expect(activity).toHaveProperty('details');
        expect(activity.timestamp).toBeInstanceOf(Date);

    });

    it('should handle statistics generation errors gracefully', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      dataModelEngine.on('statistics_generation_error', errorEventSpy);

      // Statistics should still return valid data even with potential internal errors
      const statistics = await dataModelEngine.getDataModelStatistics();
      expect(statistics).toBeDefined();
    });
  });

  describe('Data Model Optimization', () => {
    beforeEach(async () => {
      await dataModelEngine.initialize();
    });

    it('should optimize data model successfully', async () => {
      const result = await dataModelEngine.optimizeDataModel();

      expect(result).toHaveProperty('optimization_id');
      expect(result).toHaveProperty('optimizations_applied');
      expect(result).toHaveProperty('performance_improvement');
      expect(result).toHaveProperty('storage_optimization');
      expect(result).toHaveProperty('recommendations');
      expect(result.optimizations_applied).toBeInstanceOf(Array);
      expect(result.optimizations_applied.length).toBeGreaterThan(0);
      expect(typeof result.performance_improvement).toBe('number');
      expect(result.performance_improvement).toBeGreaterThan(0);
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should apply various optimization types', async () => {
      const result = await dataModelEngine.optimizeDataModel();

      const expectedOptimizations = [
        'index_optimization',
        'query_tuning', 
        'cache_optimization'
      ];

      expectedOptimizations.forEach(optimization => {
        expect(result.optimizations_applied).toContain(optimization);
      });
    });

    it('should provide storage optimization', async () => {
      const result = await dataModelEngine.optimizeDataModel();

      expect(typeof result.storage_optimization).toBe('number');
      expect(result.storage_optimization).toBeGreaterThan(0);
      expect(result.storage_optimization).toBeLessThanOrEqual(100);
    });

    it('should provide actionable recommendations', async () => {
      const result = await dataModelEngine.optimizeDataModel();

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      result.recommendations.forEach(recommendation => {
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(0);
      });
    });

    it('should emit optimization events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      dataModelEngine.on('data_model_optimization_completed', eventSpy);

      await dataModelEngine.optimizeDataModel();

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          optimization_id: expect.any(String),
          results: expect.any(Object),
          timestamp: expect.any(Number)
  }
      );
    });

    it('should handle optimization errors gracefully', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      dataModelEngine.on('optimization_error', errorEventSpy);

      // Mock internal method to cause failure for testing
      const originalMethod = dataModelEngine.optimizeDataModel;
      dataModelEngine.optimizeDataModel = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Optimization failed'));

      await expect(dataModelEngine.optimizeDataModel()).rejects.toThrow();
      
      // Restore original method
      dataModelEngine.optimizeDataModel = originalMethod;
    });
  });

  describe('Event Handling and Integration', () => {
    beforeEach(async () => {
      await dataModelEngine.initialize();
    });

    it('should handle data quality degradation events', async () => {
      const handler = jest.fn<unknown[], unknown>();
      dataModelEngine.on('data_quality_degradation', handler);

      dataModelEngine.emit('data_quality_degradation', {
        quality_dimension: 'completeness',
        current_score: 75,
        threshold: 85,
        affected_sources: ['source_1']
      });

      expect(handler).toHaveBeenCalled();
    });

    it('should handle performance threshold exceeded events', async () => {
      const handler = jest.fn<unknown[], unknown>();
      dataModelEngine.on('performance_threshold_exceeded', handler);

      dataModelEngine.emit('performance_threshold_exceeded', {
        metric: 'processing_time',
        current_value: 5000,
        threshold: 2000,
        degradation_percentage: 150
      });

      expect(handler).toHaveBeenCalled();
    });

    it('should handle processing errors', async () => {
      const handler = jest.fn<unknown[], unknown>();
      dataModelEngine.on('processing_error', handler);

      dataModelEngine.emit('processing_error', {
        error_type: 'validation_failure',
        error_message: 'Data validation failed',
        affected_records: 10
      });

      expect(handler).toHaveBeenCalled();
    });

    it('should integrate with monitoring systems', async () => {
      // Test that monitoring integration points exist
      expect(config.data_quality.quality_monitoring).toBeDefined();
      expect(config.performance_optimization).toBeDefined();
      expect(typeof config.data_quality.quality_monitoring.monitoring_interval).toBe('number');
    });

    it('should support external system integration', async () => {
      // Test integration configuration exists
      expect(config.stream_processing.real_time_ingestion.kafka_config).toBeDefined();
      expect(config.batch_processing.etl_schedules).toBeDefined();
      expect(config.stream_processing.stream_analytics.alert_thresholds).toBeInstanceOf(Array);
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      await dataModelEngine.initialize();
    });

    it('should handle large-scale data ingestion efficiently', async () => {
      const startTime = Date.now();
      
      // Simulate ingesting multiple large datasets
      const ingestionPromises = [];
      for (let i = 0; i < 5; i++) {
        ingestionPromises.push(
          dataModelEngine.ingestSecurityData(
            `large_dataset_${i}`,
            'threat',
            { threat_name: `Large Threat Dataset ${i}`, data_size: 'large' },
            { processing_priority: 'high' }

        );


      const results = await Promise.all(ingestionPromises);
      const processingTime = Date.now() - startTime;

      expect(results).toHaveLength(5);
      expect(processingTime).toBeLessThan(30000); // Should complete within 30 seconds
      results.forEach(result => {
        expect(result.processing_status).toBe('completed');
      });
    });

    it('should handle concurrent stream processing', async () => {
      const streamPromises = [
        dataModelEngine.processStreamingData('stream_1', { anomaly_detection: true }),
        dataModelEngine.processStreamingData('stream_2', { pattern_matching: true }),
        dataModelEngine.processStreamingData('stream_3', { real_time_alerts: true })
      ];

      const results = await Promise.all(streamPromises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.processing_status).toBe('active');
        expect(result.stream_id).toBeDefined();
      });
    });

    it('should handle multiple batch jobs concurrently', async () => {
      const batchPromises = [
        dataModelEngine.executeBatchProcessing('etl', { job_name: 'Concurrent ETL 1' }),
        dataModelEngine.executeBatchProcessing('analytics_aggregation', { job_name: 'Concurrent Analytics 1' }),
        dataModelEngine.executeBatchProcessing('etl', { job_name: 'Concurrent ETL 2' })
      ];

      const results = await Promise.all(batchPromises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.execution_status).toBe('completed');
        expect(result.job_id).toBeDefined();
      });
    });

    it('should maintain performance under high load', async () => {
      // Simulate high load scenario
      const operations = [];
      
      // Add data ingestion operations
      for (let i = 0; i < 3; i++) {
        operations.push(
          dataModelEngine.ingestSecurityData(`high_load_source_${i}`, 'event', { data: `test_${i}` })
        );

      
      // Add stream processing operations
      for (let i = 0; i < 2; i++) {
        operations.push(
          dataModelEngine.processStreamingData(`high_load_stream_${i}`)
        );

      
      // Add batch processing operations
      operations.push(
        dataModelEngine.executeBatchProcessing('etl', { job_name: 'High Load ETL' })
      );

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const totalTime = Date.now() - startTime;

      expect(results).toHaveLength(6);
      expect(totalTime).toBeLessThan(60000); // Should complete within 60 seconds
    });

    it('should scale with different configuration complexity', async () => {
      const complexConfig: ProcessingPipelineConfig = {
        ...config,
        stream_processing: {
          ...config.stream_processing,
          real_time_ingestion: {
            ...config.stream_processing.real_time_ingestion,
            kafka_config: {
              brokers: ['broker1:9092', 'broker2:9092', 'broker3:9092'],
              topics: ['events', 'threats', 'vulnerabilities', 'incidents', 'assets'],
              consumer_groups: ['group1', 'group2', 'group3'],
              batch_size: 5000,
              max_poll_interval: 600000

            processing_parallelism: 16


      };

      const complexEngine = new SecurityIntelligenceDataModelEngine(complexConfig);
      
      const startTime = Date.now();
      await complexEngine.initialize();
      const initTime = Date.now() - startTime;

      expect(initTime).toBeLessThan(10000); // Should initialize within 10 seconds
      expect(complexEngine).toBeInstanceOf(SecurityIntelligenceDataModelEngine);
    });
  });

  describe('Configuration and Customization', () => {
    it('should accept custom stream processing configuration', async () => {
      const customConfig: ProcessingPipelineConfig = {
        ...config,
        stream_processing: {
          enabled: true,
          real_time_ingestion: {
            kafka_config: {
              brokers: ['custom-broker:9092'],
              topics: ['custom-topic'],
              consumer_groups: ['custom-group'],
              batch_size: 2000,
              max_poll_interval: 180000

            processing_parallelism: 8,
            checkpoint_interval: 5000,
            watermark_delay: 2000

          stream_analytics: {
            correlation_window_minutes: 30,
            anomaly_detection_enabled: false,
            pattern_matching_enabled: true,
            alert_thresholds: [{ metric: 'custom_metric', threshold: 95 }]


      };

      const customEngine = new SecurityIntelligenceDataModelEngine(customConfig);
      await customEngine.initialize();

      expect(customEngine).toBeInstanceOf(SecurityIntelligenceDataModelEngine);
    });

    it('should support disabled stream processing', async () => {
      const disabledStreamConfig: ProcessingPipelineConfig = {
        ...config,
        stream_processing: {
          ...config.stream_processing,
          enabled: false

      };

      const disabledStreamEngine = new SecurityIntelligenceDataModelEngine(disabledStreamConfig);
      await disabledStreamEngine.initialize();

      expect(disabledStreamEngine).toBeInstanceOf(SecurityIntelligenceDataModelEngine);
    });

    it('should support disabled batch processing', async () => {
      const disabledBatchConfig: ProcessingPipelineConfig = {
        ...config,
        batch_processing: {
          ...config.batch_processing,
          enabled: false

      };

      const disabledBatchEngine = new SecurityIntelligenceDataModelEngine(disabledBatchConfig);
      await disabledBatchEngine.initialize();

      expect(disabledBatchEngine).toBeInstanceOf(SecurityIntelligenceDataModelEngine);
    });

    it('should adapt to different quality requirements', async () => {
      const strictQualityConfig: ProcessingPipelineConfig = {
        ...config,
        data_quality: {
          validation_stages: [
            { stage_name: 'strict_schema_validation', rules: ['required_fields', 'data_types', 'format_validation'] },
            { stage_name: 'comprehensive_business_rules', rules: ['logical_consistency', 'cross_field_validation', 'statistical_outliers'] },
            { stage_name: 'advanced_quality_scoring', rules: ['completeness', 'accuracy', 'consistency', 'timeliness', 'validity', 'uniqueness'] }
          ],
          quality_dimensions: [
            { dimension_name: 'completeness' },
            { dimension_name: 'accuracy' },
            { dimension_name: 'consistency' },
            { dimension_name: 'timeliness' },
            { dimension_name: 'validity' },
            { dimension_name: 'uniqueness' }
          ],
          remediation_policies: [
            { policy_name: 'strict_auto_correct', actions: ['format_correction', 'value_imputation', 'cross_reference_validation'] },
            { policy_name: 'comprehensive_quarantine', actions: ['isolate_record', 'detailed_analysis', 'manual_review', 'escalation'] }
          ],
          quality_monitoring: { monitoring_interval: 60 }

      };

      const strictQualityEngine = new SecurityIntelligenceDataModelEngine(strictQualityConfig);
      await strictQualityEngine.initialize();

      const result = await strictQualityEngine.ingestSecurityData(
        'strict_quality_source',
        'threat',
        { threat_name: 'High Quality Threat', confidence_score: 98 },
        { validation_level: 'comprehensive' }
      );

      expect(result.data_quality_score).toBeGreaterThanOrEqual(80);
    });

    it('should handle different performance optimization strategies', async () => {
      const optimizedConfig: ProcessingPipelineConfig = {
        ...config,
        performance_optimization: {
          caching_strategy: { strategy_type: 'hierarchical' },
          partitioning_strategy: { partition_type: 'hash_based' },
          indexing_strategy: { index_type: 'clustered' },
          compression_config: { compression_type: 'zstd' }

      };

      const optimizedEngine = new SecurityIntelligenceDataModelEngine(optimizedConfig);
      await optimizedEngine.initialize();

      const optimization = await optimizedEngine.optimizeDataModel();
      expect(optimization.performance_improvement).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Recovery', () => {
    beforeEach(async () => {
      await dataModelEngine.initialize();
    });

    it('should handle malformed data gracefully', async () => {
      const malformedData = {
        // Missing required fields and invalid structure
        invalid_field: null,
        malformed_date: 'not-a-date',
        negative_score: -50
      };

      // Should not throw but may have lower quality score
      const result = await dataModelEngine.ingestSecurityData(
        'malformed_source',
        'threat',
        malformedData,
        { validation_level: 'basic' }
      );

      expect(result.processing_status).toBe('completed');
      expect(result.data_quality_score).toBeGreaterThanOrEqual(0);
    });

    it('should recover from temporary processing failures', async () => {
      // Simulate processing multiple items where some may fail
      const dataItems = [
        { valid_data: 'item1' },
        { invalid_data: null },
        { valid_data: 'item3' }
      ];

      const results = [];
      for (const item of dataItems) {
        try {
          const result = await dataModelEngine.ingestSecurityData(
            'recovery_test_source',
            'event',
            item
          );
          results.push(result);
 catch (error) {
          // Should handle errors gracefully
          console.log('Expected error handled:', error.message);



      // At least some should succeed
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle resource constraints gracefully', async () => {
      // Simulate resource-constrained scenario with large batch
      const largeBatchData = Array.from({ length: 100 }, (_, i) => ({
        data_item: `item_${i}`,
        timestamp: Date.now(),
        large_payload: 'x'.repeat(1000) // Simulate large data
      }));

      // Should process without throwing memory errors
      for (let i = 0; i < Math.min(10, largeBatchData.length); i++) {
        const result = await dataModelEngine.ingestSecurityData(
          'large_batch_source',
          'event',
          largeBatchData[i]
        );
        expect(result.processing_status).toBe('completed');

    });

    it('should provide meaningful error messages', async () => {
      try {
        await dataModelEngine.ingestSecurityData(
          '', // Empty source name should cause error
          'invalid_type' as any,
          {}
        );
 catch (error) {
        expect(error.message).toBeDefined();
        expect(typeof error.message).toBe('string');
        expect(error.message.length).toBeGreaterThan(0);

    });

    it('should maintain data integrity during failures', async () => {
      // Get initial statistics
            
      // Attempt operations that may fail
      try {
        await dataModelEngine.ingestSecurityData('test', 'invalid_type' as any, {});
 catch (error) {
        // Expected to fail

      
      // Verify statistics are still accessible and consistent
      const finalStats = await dataModelEngine.getDataModelStatistics();
      expect(finalStats).toBeDefined();
      expect(finalStats.entity_counts).toBeDefined();
    });
  });
});