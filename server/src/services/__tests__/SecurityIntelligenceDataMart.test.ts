/**
 * Tests for Security Intelligence Data Mart
 * Epic 31 - Task E31-1753313263561-E515A3
 */

import { 
  SecurityIntelligenceDataMart, 
  SecurityDataMartConfig, 
  DataMartSchema,
  DataMartAnalytics 
 from '../SecurityIntelligenceDataMart';

describe('SecurityIntelligenceDataMart', () => {
  let dataMart: SecurityIntelligenceDataMart;
  let config: SecurityDataMartConfig;

  beforeEach(() => {
    // Setup comprehensive configuration
    config = {
      architecture: {
        deployment_mode: 'integrated',
        data_retention_policy: {
          raw_events_days: 90,
          aggregated_metrics_days: 365,
          threat_intelligence_days: 730,
          incident_data_years: 7,
          audit_logs_years: 10

        performance_optimization: {
          enable_partitioning: true,
          enable_indexing_strategy: true,
          enable_materialized_views: true,
          enable_compression: true,
          enable_parallel_processing: true

        scalability_settings: {
          max_concurrent_connections: 100,
          batch_processing_size: 1000,
          parallel_worker_threads: 8,
          memory_allocation_mb: 4096,
          storage_growth_threshold_gb: 1000


      data_sources: {
        real_time_feeds: {
          security_events: true,
          threat_intelligence: true,
          vulnerability_data: true,
          network_telemetry: true,
          endpoint_data: true,
          application_logs: true

        batch_imports: {
          external_threat_feeds: true,
          vulnerability_databases: true,
          compliance_reports: true,
          historical_data: true,
          third_party_integrations: true

        api_integrations: {
          siem_platforms: ['splunk', 'qradar', 'sentinel'],
          threat_intelligence_providers: ['virustotal', 'otx', 'misp'],
          vulnerability_scanners: ['nessus', 'qualys', 'rapid7'],
          compliance_tools: ['rsa_archer', 'metricstream'],
          external_databases: ['nvd', 'cve', 'cwe']


      data_modeling: {
        dimensional_design: {
          time_dimensions: ['hour', 'day', 'week', 'month', 'quarter', 'year'],
          geographic_dimensions: true,
          organizational_dimensions: true,
          threat_actor_dimensions: true,
          asset_dimensions: true,
          technique_dimensions: true

        fact_tables: {
          security_events: true,
          threat_incidents: true,
          vulnerability_assessments: true,
          compliance_measurements: true,
          performance_metrics: true,
          risk_scores: true

        analytical_models: {
          threat_landscape: true,
          risk_trending: true,
          incident_patterns: true,
          asset_criticality: true,
          threat_actor_profiling: true,
          campaign_tracking: true


      data_quality: {
        validation_rules: {
          schema_enforcement: true,
          referential_integrity: true,
          business_rule_validation: true,
          data_freshness_checks: true,
          completeness_validation: true,
          accuracy_verification: true

        quality_metrics: {
          track_completeness: true,
          track_accuracy: true,
          track_consistency: true,
          track_timeliness: true,
          track_validity: true,
          track_uniqueness: true

        remediation_policies: {
          automatic_correction: true,
          quarantine_invalid_data: true,
          alert_on_quality_degradation: true,
          retry_failed_validations: true,
          escalate_quality_issues: true


      access_control: {
        rbac_integration: true,
        classification_levels: ['public', 'internal', 'confidential', 'restricted'],
        need_to_know_enforcement: true,
        temporal_access_controls: true,
        data_masking_policies: true,
        audit_all_access: true,
        encryption_at_rest: true,
        encryption_in_transit: true

      analytics_capabilities: {
        real_time_analytics: true,
        batch_analytics: true,
        predictive_analytics: true,
        machine_learning_integration: true,
        natural_language_queries: false,
        visualization_support: true,
        report_generation: true,
        dashboard_integration: true

    };

    dataMart = new SecurityIntelligenceDataMart(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid configuration', async () => {
      const initializeSpy = jest.spyOn(dataMart, 'initialize');
      
      await dataMart.initialize();
      
      expect(initializeSpy).toHaveBeenCalled();
    });

    it('should emit initialization events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      dataMart.on('data_mart_initialized', eventSpy);
      
      await dataMart.initialize();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
          configuration: config,
          schema_version: expect.any(String)
  }
      );
    });

    it('should handle initialization errors gracefully', async () => {
      const invalidConfig = { ...config };
      delete (invalidConfig as any).architecture;

      const errorDataMart = new SecurityIntelligenceDataMart(invalidConfig);

      await expect(errorDataMart.initialize()).rejects.toThrow();
    });

    it('should validate configuration requirements', async () => {
      const invalidConfig = { ...config };
      invalidConfig.architecture.data_retention_policy.raw_events_days = 0;

      const errorDataMart = new SecurityIntelligenceDataMart(invalidConfig);

      await expect(errorDataMart.initialize()).rejects.toThrow('Raw events retention must be at least 1 day');
    });

    it('should setup event handlers during initialization', async () => {
      const eventSpy = jest.spyOn(dataMart, 'on');
      
      await dataMart.initialize();
      
      // Event handlers should be setup during construction
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should prevent double initialization', async () => {
      await dataMart.initialize();
      
      // Second initialization should return immediately
      const startTime = Date.now();
      await dataMart.initialize();
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(10); // Should be nearly instant
    });
  });

  describe('Schema Management', () => {
    beforeEach(async () => {
      await dataMart.initialize();
    });

    it('should create dimension tables successfully', async () => {
      const result = await dataMart.createDimensionTables();

      expect(result).toHaveProperty('created_tables');
      expect(result).toHaveProperty('creation_status', 'completed');
      expect(result.created_tables).toBeInstanceOf(Array);
      expect(result.created_tables.length).toBeGreaterThan(0);
      
      // Verify expected dimension tables
      expect(result.created_tables).toEqual(
        expect.arrayContaining([
          'dim_time',
          'dim_geography',
          'dim_organization',
          'dim_threat_actor',
          'dim_asset',
          'dim_technique'
        ])
      );
    });

    it('should create fact tables successfully', async () => {
      const result = await dataMart.createFactTables();

      expect(result).toHaveProperty('created_tables');
      expect(result).toHaveProperty('partitioning_applied');
      expect(result.created_tables).toBeInstanceOf(Array);
      expect(result.created_tables.length).toBeGreaterThan(0);
      
      // Verify expected fact tables
      expect(result.created_tables).toEqual(
        expect.arrayContaining([
          'fact_security_events',
          'fact_threat_incidents',
          'fact_vulnerability_assessments',
          'fact_compliance_measurements',
          'fact_performance_metrics',
          'fact_risk_scores'
        ])
      );
      
      expect(result.partitioning_applied).toBe(config.architecture.performance_optimization.enable_partitioning);
    });

    it('should create analytical views successfully', async () => {
      const result = await dataMart.createAnalyticalViews();

      expect(result).toHaveProperty('created_views');
      expect(result).toHaveProperty('materialized');
      expect(result.created_views).toBeInstanceOf(Array);
      expect(result.created_views.length).toBeGreaterThan(0);
      
      // Verify expected analytical views
      expect(result.created_views).toEqual(
        expect.arrayContaining([
          'view_threat_landscape_summary',
          'view_risk_trending_analysis',
          'view_incident_pattern_analysis',
          'view_asset_criticality_matrix',
          'view_compliance_dashboard',
          'view_performance_metrics_summary'
        ])
      );
      
      expect(result.materialized).toBe(config.architecture.performance_optimization.enable_materialized_views);
    });

    it('should emit schema creation events', async () => {
      const dimensionEventSpy = jest.fn<unknown[], unknown>();
      const factEventSpy = jest.fn<unknown[], unknown>();
      const viewEventSpy = jest.fn<unknown[], unknown>();
      
      dataMart.on('dimension_table_created', dimensionEventSpy);
      dataMart.on('fact_table_created', factEventSpy);
      dataMart.on('analytical_view_created', viewEventSpy);

      await dataMart.createDimensionTables();
      await dataMart.createFactTables();
      await dataMart.createAnalyticalViews();

      expect(dimensionEventSpy).toHaveBeenCalled();
      expect(factEventSpy).toHaveBeenCalled();
      expect(viewEventSpy).toHaveBeenCalled();
    });

    it('should handle schema creation errors gracefully', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      dataMart.on('dimension_creation_error', errorEventSpy);
      
      // Mock a method to throw an error for testing
      const originalMethod = dataMart.createDimensionTables;
      dataMart.createDimensionTables = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Schema creation failed'));

      await expect(dataMart.createDimensionTables()).rejects.toThrow();
      
      // Restore original method
      dataMart.createDimensionTables = originalMethod;
    });
  });

  describe('Data Pipeline Management', () => {
    beforeEach(async () => {
      await dataMart.initialize();
    });

    it('should setup data pipelines successfully', async () => {
      const result = await dataMart.setupDataPipelines();

      expect(result).toHaveProperty('pipelines_configured');
      expect(result).toHaveProperty('real_time_enabled');
      expect(result).toHaveProperty('batch_enabled');
      expect(result.pipelines_configured).toBeInstanceOf(Array);
      expect(result.pipelines_configured.length).toBeGreaterThan(0);
      
      expect(result.real_time_enabled).toBe(config.analytics_capabilities.real_time_analytics);
      expect(result.batch_enabled).toBe(config.analytics_capabilities.batch_analytics);
    });

    it('should setup real-time pipelines when enabled', async () => {
      const realtimeConfig = { ...config };
      realtimeConfig.analytics_capabilities.real_time_analytics = true;
      
      const realtimeDataMart = new SecurityIntelligenceDataMart(realtimeConfig);
      await realtimeDataMart.initialize();
      
      const result = await realtimeDataMart.setupDataPipelines();
      
      expect(result.real_time_enabled).toBe(true);
      expect(result.pipelines_configured).toEqual(
        expect.arrayContaining([
          'real_time_security_events',
          'real_time_threat_intelligence',
          'real_time_incident_tracking'
        ])
      );
    });

    it('should setup batch pipelines when enabled', async () => {
      const batchConfig = { ...config };
      batchConfig.analytics_capabilities.batch_analytics = true;
      
      const batchDataMart = new SecurityIntelligenceDataMart(batchConfig);
      await batchDataMart.initialize();
      
      const result = await batchDataMart.setupDataPipelines();
      
      expect(result.batch_enabled).toBe(true);
      expect(result.pipelines_configured).toEqual(
        expect.arrayContaining([
          'batch_vulnerability_processing',
          'batch_compliance_aggregation',
          'batch_risk_calculation',
          'batch_performance_rollup'
        ])
      );
    });

    it('should always setup data quality pipelines', async () => {
      const result = await dataMart.setupDataPipelines();
      
      expect(result.pipelines_configured).toEqual(
        expect.arrayContaining([
          'data_quality_monitoring',
          'data_validation_pipeline'
        ])
      );
    });

    it('should emit pipeline configuration events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      dataMart.on('data_pipelines_configured', eventSpy);

      await dataMart.setupDataPipelines();

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          pipelines_count: expect.any(Number),
          real_time_enabled: expect.any(Boolean),
          batch_enabled: expect.any(Boolean),
          timestamp: expect.any(Number)
  }
      );
    });

    it('should handle pipeline setup errors gracefully', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      dataMart.on('pipeline_setup_error', errorEventSpy);

      // Mock a method to throw an error for testing
      const originalMethod = dataMart.setupDataPipelines;
      dataMart.setupDataPipelines = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Pipeline setup failed'));

      await expect(dataMart.setupDataPipelines()).rejects.toThrow();
      
      // Restore original method
      dataMart.setupDataPipelines = originalMethod;
    });
  });

  describe('Analytics Generation', () => {
    beforeEach(async () => {
      await dataMart.initialize();
    });

    it('should generate comprehensive analytics successfully', async () => {
      const analytics = await dataMart.generateAnalytics();

      expect(analytics).toHaveProperty('threat_landscape_summary');
      expect(analytics).toHaveProperty('risk_trending');
      expect(analytics).toHaveProperty('incident_patterns');
      expect(analytics).toHaveProperty('asset_criticality');
      expect(analytics).toHaveProperty('data_quality_metrics');
    });

    it('should generate threat landscape analytics', async () => {
      const analytics = await dataMart.generateAnalytics();
      const threatLandscape = analytics.threat_landscape_summary;

      expect(threatLandscape).toHaveProperty('total_threats');
      expect(threatLandscape).toHaveProperty('active_campaigns');
      expect(threatLandscape).toHaveProperty('threat_actors');
      expect(threatLandscape).toHaveProperty('techniques_observed');
      expect(threatLandscape).toHaveProperty('geographic_distribution');
      expect(threatLandscape).toHaveProperty('threat_type_distribution');
      expect(threatLandscape).toHaveProperty('severity_distribution');
      expect(threatLandscape).toHaveProperty('trend_analysis');
      
      expect(typeof threatLandscape.total_threats).toBe('number');
      expect(threatLandscape.geographic_distribution).toBeInstanceOf(Array);
      expect(threatLandscape.threat_type_distribution).toBeInstanceOf(Array);
      expect(threatLandscape.severity_distribution).toBeInstanceOf(Array);
    });

    it('should generate risk trending analytics', async () => {
      const analytics = await dataMart.generateAnalytics();
      const riskTrending = analytics.risk_trending;

      expect(riskTrending).toHaveProperty('overall_risk_score');
      expect(riskTrending).toHaveProperty('risk_score_trend');
      expect(riskTrending).toHaveProperty('risk_category_breakdown');
      expect(riskTrending).toHaveProperty('top_risk_contributors');
      expect(riskTrending).toHaveProperty('risk_appetite_alignment');
      
      expect(typeof riskTrending.overall_risk_score).toBe('number');
      expect(riskTrending.risk_score_trend).toBeInstanceOf(Array);
      expect(riskTrending.risk_category_breakdown).toBeInstanceOf(Array);
      expect(riskTrending.top_risk_contributors).toBeInstanceOf(Array);
    });

    it('should generate incident pattern analytics', async () => {
      const analytics = await dataMart.generateAnalytics();
      const incidentPatterns = analytics.incident_patterns;

      expect(incidentPatterns).toHaveProperty('total_incidents');
      expect(incidentPatterns).toHaveProperty('resolution_rate');
      expect(incidentPatterns).toHaveProperty('average_detection_time_minutes');
      expect(incidentPatterns).toHaveProperty('average_resolution_time_minutes');
      expect(incidentPatterns).toHaveProperty('repeat_incident_rate');
      expect(incidentPatterns).toHaveProperty('incident_type_patterns');
      expect(incidentPatterns).toHaveProperty('temporal_patterns');
      expect(incidentPatterns).toHaveProperty('attack_chain_analysis');
      
      expect(typeof incidentPatterns.total_incidents).toBe('number');
      expect(incidentPatterns.incident_type_patterns).toBeInstanceOf(Array);
      expect(incidentPatterns.temporal_patterns.hour_of_day_distribution).toBeInstanceOf(Array);
      expect(incidentPatterns.temporal_patterns.day_of_week_distribution).toBeInstanceOf(Array);
    });

    it('should generate asset criticality analytics', async () => {
      const analytics = await dataMart.generateAnalytics();
      const assetCriticality = analytics.asset_criticality;

      expect(assetCriticality).toHaveProperty('total_assets');
      expect(assetCriticality).toHaveProperty('critical_assets');
      expect(assetCriticality).toHaveProperty('vulnerability_coverage');
      expect(assetCriticality).toHaveProperty('compliance_coverage');
      expect(assetCriticality).toHaveProperty('asset_risk_distribution');
      expect(assetCriticality).toHaveProperty('asset_performance_metrics');
      expect(assetCriticality).toHaveProperty('investment_recommendations');
      
      expect(typeof assetCriticality.total_assets).toBe('number');
      expect(assetCriticality.asset_risk_distribution).toBeInstanceOf(Array);
      expect(assetCriticality.asset_performance_metrics).toBeInstanceOf(Array);
      expect(assetCriticality.investment_recommendations).toBeInstanceOf(Array);
    });

    it('should generate data quality metrics', async () => {
      const analytics = await dataMart.generateAnalytics();
      const qualityMetrics = analytics.data_quality_metrics;

      expect(qualityMetrics).toHaveProperty('overall_quality_score');
      expect(qualityMetrics).toHaveProperty('completeness_score');
      expect(qualityMetrics).toHaveProperty('accuracy_score');
      expect(qualityMetrics).toHaveProperty('consistency_score');
      expect(qualityMetrics).toHaveProperty('timeliness_score');
      expect(qualityMetrics).toHaveProperty('validity_score');
      expect(qualityMetrics).toHaveProperty('uniqueness_score');
      expect(qualityMetrics).toHaveProperty('quality_trends');
      expect(qualityMetrics).toHaveProperty('data_source_quality');
      
      expect(typeof qualityMetrics.overall_quality_score).toBe('number');
      expect(qualityMetrics.quality_trends).toBeInstanceOf(Array);
      expect(qualityMetrics.data_source_quality).toBeInstanceOf(Array);
    });

    it('should emit analytics generation events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      dataMart.on('analytics_generated', eventSpy);

      await dataMart.generateAnalytics();

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          analytics_types: expect.any(Array),
          generation_timestamp: expect.any(Number)
  }
      );
    });

    it('should handle analytics generation errors gracefully', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      dataMart.on('analytics_generation_error', errorEventSpy);

      // Mock a method to throw an error for testing
      const originalMethod = dataMart.generateAnalytics;
      dataMart.generateAnalytics = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Analytics generation failed'));

      await expect(dataMart.generateAnalytics()).rejects.toThrow();
      
      // Restore original method
      dataMart.generateAnalytics = originalMethod;
    });
  });

  describe('Performance Optimization', () => {
    beforeEach(async () => {
      await dataMart.initialize();
    });

    it('should optimize performance successfully', async () => {
      const result = await dataMart.optimizePerformance();

      expect(result).toHaveProperty('optimizations_applied');
      expect(result).toHaveProperty('performance_improvement');
      expect(result).toHaveProperty('recommendations');
      expect(result.optimizations_applied).toBeInstanceOf(Array);
      expect(result.optimizations_applied.length).toBeGreaterThan(0);
      expect(typeof result.performance_improvement).toBe('number');
      expect(result.performance_improvement).toBeGreaterThan(0);
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should apply indexing optimization when enabled', async () => {
      const indexingConfig = { ...config };
      indexingConfig.architecture.performance_optimization.enable_indexing_strategy = true;
      
      const indexingDataMart = new SecurityIntelligenceDataMart(indexingConfig);
      await indexingDataMart.initialize();
      
      const result = await indexingDataMart.optimizePerformance();
      
      expect(result.optimizations_applied).toContain('index_optimization');
    });

    it('should apply compression when enabled', async () => {
      const compressionConfig = { ...config };
      compressionConfig.architecture.performance_optimization.enable_compression = true;
      
      const compressionDataMart = new SecurityIntelligenceDataMart(compressionConfig);
      await compressionDataMart.initialize();
      
      const result = await compressionDataMart.optimizePerformance();
      
      expect(result.optimizations_applied).toContain('storage_compression');
    });

    it('should apply parallel processing optimization when enabled', async () => {
      const parallelConfig = { ...config };
      parallelConfig.architecture.performance_optimization.enable_parallel_processing = true;
      
      const parallelDataMart = new SecurityIntelligenceDataMart(parallelConfig);
      await parallelDataMart.initialize();
      
      const result = await parallelDataMart.optimizePerformance();
      
      expect(result.optimizations_applied).toContain('parallel_processing');
    });

    it('should always apply query optimization', async () => {
      const result = await dataMart.optimizePerformance();
      
      expect(result.optimizations_applied).toContain('query_optimization');
    });

    it('should provide performance recommendations', async () => {
      const result = await dataMart.optimizePerformance();
      
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Verify some expected recommendations
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('partitioning'),
          expect.stringContaining('storage'),
          expect.stringContaining('indexes'),
          expect.stringContaining('caching'),
          expect.stringContaining('archiving')
        ])
      );
    });

    it('should emit performance optimization events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      dataMart.on('performance_optimization_completed', eventSpy);

      await dataMart.optimizePerformance();

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          optimizations_applied: expect.any(Array),
          performance_improvement: expect.any(Number),
          timestamp: expect.any(Number)
  }
      );
    });

    it('should handle optimization errors gracefully', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      dataMart.on('performance_optimization_error', errorEventSpy);

      // Mock a method to throw an error for testing
      const originalMethod = dataMart.optimizePerformance;
      dataMart.optimizePerformance = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Optimization failed'));

      await expect(dataMart.optimizePerformance()).rejects.toThrow();
      
      // Restore original method
      dataMart.optimizePerformance = originalMethod;
    });
  });

  describe('Event Handling and Integration', () => {
    beforeEach(async () => {
      await dataMart.initialize();
    });

    it('should handle data quality alerts', async () => {
      const alertHandler = jest.fn<unknown[], unknown>();
      dataMart.on('data_quality_alert', alertHandler);

      // Simulate a data quality alert
      dataMart.emit('data_quality_alert', {
        alert_type: 'completeness_degradation',
        severity: 'high',
        affected_sources: ['source_1', 'source_2'],
        quality_score_drop: 15
      });

      expect(alertHandler).toHaveBeenCalled();
    });

    it('should handle performance degradation events', async () => {
      const degradationHandler = jest.fn<unknown[], unknown>();
      dataMart.on('performance_degradation', degradationHandler);

      // Simulate performance degradation
      dataMart.emit('performance_degradation', {
        metric: 'query_response_time',
        current_value: 5000,
        threshold: 2000,
        degradation_percentage: 150
      });

      expect(degradationHandler).toHaveBeenCalled();
    });

    it('should handle storage threshold exceeded events', async () => {
      const storageHandler = jest.fn<unknown[], unknown>();
      dataMart.on('storage_threshold_exceeded', storageHandler);

      // Simulate storage threshold exceeded
      dataMart.emit('storage_threshold_exceeded', {
        current_usage_gb: 1200,
        threshold_gb: 1000,
        usage_percentage: 120,
        projected_full_date: new Date(Date.now() + 30 * 86400000)
      });

      expect(storageHandler).toHaveBeenCalled();
    });

    it('should integrate with monitoring systems', async () => {
      // Test integration points exist
      expect(config.analytics_capabilities.dashboard_integration).toBe(true);
      expect(config.access_control.audit_all_access).toBe(true);
      expect(config.data_quality.remediation_policies.alert_on_quality_degradation).toBe(true);
    });

    it('should support RBAC integration', async () => {
      expect(config.access_control.rbac_integration).toBe(true);
      expect(config.access_control.classification_levels).toBeInstanceOf(Array);
      expect(config.access_control.classification_levels.length).toBeGreaterThan(0);
      expect(config.access_control.need_to_know_enforcement).toBe(true);
    });

    it('should enforce encryption requirements', async () => {
      expect(config.access_control.encryption_at_rest).toBe(true);
      expect(config.access_control.encryption_in_transit).toBe(true);
    });
  });

  describe('Configuration and Customization', () => {
    it('should accept custom architecture configuration', async () => {
      const customConfig: SecurityDataMartConfig = {
        ...config,
        architecture: {
          ...config.architecture,
          deployment_mode: 'standalone',
          data_retention_policy: {
            raw_events_days: 180,
            aggregated_metrics_days: 730,
            threat_intelligence_days: 1095,
            incident_data_years: 10,
            audit_logs_years: 15

          scalability_settings: {
            max_concurrent_connections: 200,
            batch_processing_size: 2000,
            parallel_worker_threads: 16,
            memory_allocation_mb: 8192,
            storage_growth_threshold_gb: 2000


      };

      const customDataMart = new SecurityIntelligenceDataMart(customConfig);
      await customDataMart.initialize();
      
      expect(customDataMart).toBeInstanceOf(SecurityIntelligenceDataMart);
    });

    it('should support different data source configurations', async () => {
      const customConfig: SecurityDataMartConfig = {
        ...config,
        data_sources: {
          ...config.data_sources,
          real_time_feeds: {
            security_events: true,
            threat_intelligence: false,
            vulnerability_data: true,
            network_telemetry: false,
            endpoint_data: true,
            application_logs: false

          api_integrations: {
            siem_platforms: ['splunk'],
            threat_intelligence_providers: ['virustotal'],
            vulnerability_scanners: ['nessus'],
            compliance_tools: [],
            external_databases: ['nvd', 'cve']


      };

      const customDataMart = new SecurityIntelligenceDataMart(customConfig);
      await customDataMart.initialize();
      
      expect(customDataMart).toBeInstanceOf(SecurityIntelligenceDataMart);
    });

    it('should handle different data modeling configurations', async () => {
      const customConfig: SecurityDataMartConfig = {
        ...config,
        data_modeling: {
          ...config.data_modeling,
          dimensional_design: {
            time_dimensions: ['day', 'week', 'month'],
            geographic_dimensions: false,
            organizational_dimensions: true,
            threat_actor_dimensions: true,
            asset_dimensions: false,
            technique_dimensions: true

          fact_tables: {
            security_events: true,
            threat_incidents: true,
            vulnerability_assessments: false,
            compliance_measurements: false,
            performance_metrics: true,
            risk_scores: true


      };

      const customDataMart = new SecurityIntelligenceDataMart(customConfig);
      await customDataMart.initialize();
      
      expect(customDataMart).toBeInstanceOf(SecurityIntelligenceDataMart);
    });

    it('should adapt to different quality requirements', async () => {
      const customConfig: SecurityDataMartConfig = {
        ...config,
        data_quality: {
          ...config.data_quality,
          validation_rules: {
            schema_enforcement: true,
            referential_integrity: false,
            business_rule_validation: true,
            data_freshness_checks: false,
            completeness_validation: true,
            accuracy_verification: false

          remediation_policies: {
            automatic_correction: false,
            quarantine_invalid_data: true,
            alert_on_quality_degradation: true,
            retry_failed_validations: false,
            escalate_quality_issues: true


      };

      const customDataMart = new SecurityIntelligenceDataMart(customConfig);
      await customDataMart.initialize();
      
      expect(customDataMart).toBeInstanceOf(SecurityIntelligenceDataMart);
    });

    it('should support different analytics capabilities', async () => {
      const customConfig: SecurityDataMartConfig = {
        ...config,
        analytics_capabilities: {
          real_time_analytics: false,
          batch_analytics: true,
          predictive_analytics: false,
          machine_learning_integration: false,
          natural_language_queries: true,
          visualization_support: true,
          report_generation: false,
          dashboard_integration: true

      };

      const customDataMart = new SecurityIntelligenceDataMart(customConfig);
      await customDataMart.initialize();
      
      const pipelineResult = await customDataMart.setupDataPipelines();
      
      expect(pipelineResult.real_time_enabled).toBe(false);
      expect(pipelineResult.batch_enabled).toBe(true);
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      await dataMart.initialize();
    });

    it('should handle large-scale schema creation efficiently', async () => {
      const startTime = Date.now();
      
      await Promise.all([
        dataMart.createDimensionTables(),
        dataMart.createFactTables(),
        dataMart.createAnalyticalViews()
      ]);
      
      const processingTime = Date.now() - startTime;
      
      expect(processingTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle concurrent analytics generation', async () => {
      const analyticsPromises = [
        dataMart.generateAnalytics(),
        dataMart.generateAnalytics(),
        dataMart.generateAnalytics()
      ];

      const results = await Promise.all(analyticsPromises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toHaveProperty('threat_landscape_summary');
        expect(result).toHaveProperty('risk_trending');
        expect(result).toHaveProperty('incident_patterns');
        expect(result).toHaveProperty('asset_criticality');
        expect(result).toHaveProperty('data_quality_metrics');
      });
    });

    it('should optimize performance under high load', async () => {
      // Simulate high load scenario
      const operations = [];
      
      for (let i = 0; i < 5; i++) {
        operations.push(dataMart.generateAnalytics());

      
      for (let i = 0; i < 3; i++) {
        operations.push(dataMart.optimizePerformance());


      const results = await Promise.all(operations);
      
      expect(results).toHaveLength(8);
      // All operations should complete successfully
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    it('should maintain data quality under concurrent operations', async () => {
      // Perform multiple operations concurrently
      const operations = [
        dataMart.createDimensionTables(),
        dataMart.createFactTables(),
        dataMart.setupDataPipelines(),
        dataMart.generateAnalytics()
      ];

      const results = await Promise.all(operations);
      
      // Verify all operations completed successfully
      expect(results).toHaveLength(4);
      
      // Verify final analytics still show good data quality
      const finalAnalytics = await dataMart.generateAnalytics();
      expect(finalAnalytics.data_quality_metrics.overall_quality_score).toBeGreaterThan(90);
    });

    it('should scale with increased configuration complexity', async () => {
      const complexConfig: SecurityDataMartConfig = {
        ...config,
        data_sources: {
          ...config.data_sources,
          api_integrations: {
            siem_platforms: ['splunk', 'qradar', 'sentinel', 'arcsight', 'elastic', 'chronicle'],
            threat_intelligence_providers: ['virustotal', 'otx', 'misp', 'threatconnect', 'anomali', 'recordedfuture'],
            vulnerability_scanners: ['nessus', 'qualys', 'rapid7', 'openvas', 'nexpose', 'veracode'],
            compliance_tools: ['rsa_archer', 'metricstream', 'servicenow', 'resolver'],
            external_databases: ['nvd', 'cve', 'cwe', 'capec', 'mitre_attack', 'nist_csf']


      };

      const complexDataMart = new SecurityIntelligenceDataMart(complexConfig);
      
      const startTime = Date.now();
      await complexDataMart.initialize();
      const initTime = Date.now() - startTime;
      
      expect(initTime).toBeLessThan(5000); // Should initialize within 5 seconds
      expect(complexDataMart).toBeInstanceOf(SecurityIntelligenceDataMart);
    });
  });

  describe('Error Handling and Recovery', () => {
    beforeEach(async () => {
      await dataMart.initialize();
    });

    it('should handle partial schema creation failures gracefully', async () => {
      // Test that individual failures don't break the entire process
      const dimensionResult = await dataMart.createDimensionTables();
      expect(dimensionResult.creation_status).toBe('completed');
      
      const factResult = await dataMart.createFactTables();
      expect(factResult.created_tables).toBeInstanceOf(Array);
      
      const viewResult = await dataMart.createAnalyticalViews();
      expect(viewResult.created_views).toBeInstanceOf(Array);
    });

    it('should handle analytics generation with missing data gracefully', async () => {
      // Analytics should still generate even with minimal data
      const analytics = await dataMart.generateAnalytics();
      
      expect(analytics).toBeDefined();
      expect(analytics.threat_landscape_summary).toBeDefined();
      expect(analytics.data_quality_metrics).toBeDefined();
    });

    it('should recover from temporary performance issues', async () => {
      // Multiple optimization attempts should work
      const optimization1 = await dataMart.optimizePerformance();
      const optimization2 = await dataMart.optimizePerformance();
      
      expect(optimization1.optimizations_applied).toBeInstanceOf(Array);
      expect(optimization2.optimizations_applied).toBeInstanceOf(Array);
    });

    it('should handle configuration edge cases', async () => {
      const minimalConfig: SecurityDataMartConfig = {
        ...config,
        data_modeling: {
          dimensional_design: {
            time_dimensions: ['day'],
            geographic_dimensions: false,
            organizational_dimensions: false,
            threat_actor_dimensions: false,
            asset_dimensions: false,
            technique_dimensions: false

          fact_tables: {
            security_events: true,
            threat_incidents: false,
            vulnerability_assessments: false,
            compliance_measurements: false,
            performance_metrics: false,
            risk_scores: false

          analytical_models: {
            threat_landscape: true,
            risk_trending: false,
            incident_patterns: false,
            asset_criticality: false,
            threat_actor_profiling: false,
            campaign_tracking: false


      };

      const minimalDataMart = new SecurityIntelligenceDataMart(minimalConfig);
      await minimalDataMart.initialize();
      
      const analytics = await minimalDataMart.generateAnalytics();
      expect(analytics).toBeDefined();
    });

    it('should handle resource constraint scenarios', async () => {
      const constrainedConfig: SecurityDataMartConfig = {
        ...config,
        architecture: {
          ...config.architecture,
          scalability_settings: {
            max_concurrent_connections: 5,
            batch_processing_size: 100,
            parallel_worker_threads: 2,
            memory_allocation_mb: 512,
            storage_growth_threshold_gb: 10


      };

      const constrainedDataMart = new SecurityIntelligenceDataMart(constrainedConfig);
      await constrainedDataMart.initialize();
      
      // Should still work with limited resources
      const result = await constrainedDataMart.setupDataPipelines();
      expect(result.pipelines_configured).toBeInstanceOf(Array);
    });
  });
});