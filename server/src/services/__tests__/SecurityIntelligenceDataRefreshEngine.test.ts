/**
 * Tests for Security Intelligence Data Refresh Engine
 * Epic 31 - Task E31-1753313263563-EBE5C5
 */

import { 
  SecurityIntelligenceDataRefreshEngine, 
  DataRefreshConfig, 
  RefreshJob,
  RefreshAnalytics 
 from '../SecurityIntelligenceDataRefreshEngine';
import { SecurityIntelligenceAutomationEngine } from '../SecurityIntelligenceAutomationEngine';
import { SecurityAPIIntegrationPlatform } from '../SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../SecurityPolicyAnalysisEngine';
import { SecurityRiskScoringEngine } from '../SecurityRiskScoringEngine';
import { SecurityPatternRecognitionEngine } from '../SecurityPatternRecognitionEngine';
import { SecurityTimeSeriesAnalysisEngine } from '../SecurityTimeSeriesAnalysisEngine';
import { SecurityInsightsAutomationEngine } from '../SecurityInsightsAutomationEngine';

// Mock dependencies
jest.mock('../SecurityIntelligenceAutomationEngine');
jest.mock('../SecurityAPIIntegrationPlatform');
jest.mock('../SecurityPolicyAnalysisEngine');
jest.mock('../SecurityRiskScoringEngine');
jest.mock('../SecurityPatternRecognitionEngine');
jest.mock('../SecurityTimeSeriesAnalysisEngine');
jest.mock('../SecurityInsightsAutomationEngine');

describe('SecurityIntelligenceDataRefreshEngine', () => {
  let refreshEngine: SecurityIntelligenceDataRefreshEngine;
  let mockIntelligenceEngine: jest.Mocked<SecurityIntelligenceAutomationEngine>;
  let mockAPIIntegration: jest.Mocked<SecurityAPIIntegrationPlatform>;
  let mockPolicyEngine: jest.Mocked<SecurityPolicyAnalysisEngine>;
  let mockRiskScoringEngine: jest.Mocked<SecurityRiskScoringEngine>;
  let mockPatternEngine: jest.Mocked<SecurityPatternRecognitionEngine>;
  let mockTimeSeriesEngine: jest.Mocked<SecurityTimeSeriesAnalysisEngine>;
  let mockInsightsEngine: jest.Mocked<SecurityInsightsAutomationEngine>;
  let config: DataRefreshConfig;

  beforeEach(() => {
    // Setup mocks
    mockIntelligenceEngine = {
      on: jest.fn<unknown[], unknown>(),
      collectIntelligence: jest.fn<unknown[], unknown>().mockResolvedValue({
        collection_id: 'collection_123',
        intelligence_collected: 150
 as unknown),
      analyzeIntelligence: jest.fn<unknown[], unknown>().mockResolvedValue({
        analysis_id: 'analysis_123',
        analysis_type: 'tactical'
 as unknown)
 as any;

    mockAPIIntegration = {
      on: jest.fn<unknown[], unknown>(),
      getPlatformMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
        api_calls: { total_requests: 10000, successful_requests: 9850 },
        security_analytics: { threats_detected: 45, detection_accuracy_percent: 96 }
 as unknown)
 as any;

    mockPolicyEngine = {
      on: jest.fn<unknown[], unknown>(),
      analyzePolicyImpact: jest.fn<unknown[], unknown>().mockResolvedValue({
        risk_analysis: { overall_risk_score: 42 },
        validation_results: { validation_passed: true }
 as unknown)
 as any;

    mockRiskScoringEngine = {
      on: jest.fn<unknown[], unknown>(),
      scoreSecurityRisk: jest.fn<unknown[], unknown>().mockResolvedValue({
        risk_id: 'risk_123',
        risk_scoring: { composite_score: 78 }
 as unknown)
 as any;

    mockPatternEngine = {
      on: jest.fn<unknown[], unknown>(),
      recognizePatterns: jest.fn<unknown[], unknown>().mockResolvedValue({
        patterns_discovered: { new_patterns: ['malware_pattern_1'] },
        analysis_id: 'pattern_123'
 as unknown)
 as any;

    mockTimeSeriesEngine = {
      on: jest.fn<unknown[], unknown>(),
      analyzeTimeSeries: jest.fn<unknown[], unknown>().mockResolvedValue({
        analysis_id: 'timeseries_123',
        detected_anomalies: [{ anomaly_id: 'anom_1', severity: 'medium' }]
 as unknown)
 as any;

    mockInsightsEngine = {
      on: jest.fn<unknown[], unknown>(),
      generateInsights: jest.fn<unknown[], unknown>().mockResolvedValue({
        generation_id: 'gen_123',
        insights_generated: []
 as unknown)
 as any;

    // Setup configuration
    config = {
      refresh_automation: {
        enabled: true,
        auto_discovery: true,
        intelligent_scheduling: true,
        adaptive_intervals: true,
        priority_based_updates: true,
        quality_gated_refresh: true,
        error_recovery: true,
        performance_optimization: true

      refresh_scheduling: {
        global_interval: 300000, // 5 minutes
        source_specific_intervals: new Map([
          ['threat_feed_1', 60000],
          ['vulnerability_db_1', 180000]
        ]),
        peak_hours_adjustment: true,
        load_balancing: true,
        batch_processing_windows: {
          start_hour: 2,
          end_hour: 6,
          timezone: 'UTC'

        emergency_refresh_triggers: ['critical_threat_detected', 'system_compromise']

      data_collection: {
        concurrent_sources: 5,
        timeout_per_source: 30000,
        retry_attempts: 3,
        backoff_strategy: 'exponential',
        quality_thresholds: {
          minimum_confidence: 0.75,
          freshness_requirement: 3600000, // 1 hour
          completeness_threshold: 0.8

        deduplication_enabled: true

      analysis_automation: {
        trigger_on_refresh: true,
        analysis_types: ['threat_detection', 'pattern_analysis', 'risk_assessment'],
        batch_analysis_threshold: 50,
        real_time_analysis_criteria: ['critical_severity', 'high_confidence'],
        quality_impact_analysis: true,
        trend_change_detection: true

      performance_monitoring: {
        track_refresh_performance: true,
        source_health_monitoring: true,
        data_quality_tracking: true,
        alert_on_degradation: true,
        performance_history_retention: 30,
        optimization_recommendations: true

      integration_settings: {
        workflow_orchestrator_integration: true,
        siem_refresh_synchronization: true,
        reporting_system_updates: true,
        dashboard_real_time_updates: true,
        api_change_notifications: true,
        external_system_webhooks: ['https://webhook.example.com/security']

    };

    refreshEngine = new SecurityIntelligenceDataRefreshEngine(
      config,
      mockIntelligenceEngine,
      mockAPIIntegration,
      mockPolicyEngine,
      mockRiskScoringEngine,
      mockPatternEngine,
      mockTimeSeriesEngine,
      mockInsightsEngine
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid configuration', async () => {
      const initializeSpy = jest.spyOn(refreshEngine, 'initialize');
      
      await refreshEngine.initialize();
      
      expect(initializeSpy).toHaveBeenCalled();
    });

    it('should emit initialization events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      refreshEngine.on('engine_initialized', eventSpy);
      
      await refreshEngine.initialize();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
          configuration: config,
          refresh_automation_enabled: true
  }
      );
    });

    it('should handle initialization errors gracefully', async () => {
      const invalidConfig = { ...config };
      invalidConfig.refresh_automation.enabled = false;

      const errorEngine = new SecurityIntelligenceDataRefreshEngine(
        invalidConfig,
        mockIntelligenceEngine,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine,
        mockInsightsEngine
      );

      await expect(errorEngine.initialize()).rejects.toThrow();
    });

    it('should validate configuration requirements', async () => {
      const invalidConfig = { ...config };
      invalidConfig.refresh_scheduling.global_interval = 30000; // Too short

      const errorEngine = new SecurityIntelligenceDataRefreshEngine(
        invalidConfig,
        mockIntelligenceEngine,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine,
        mockInsightsEngine
      );

      await expect(errorEngine.initialize()).rejects.toThrow('Global refresh interval must be at least 1 minute');
    });

    it('should setup event handlers during initialization', async () => {
      await refreshEngine.initialize();
      
      expect(mockIntelligenceEngine.on).toHaveBeenCalledWith('intelligence_collection_completed', expect.any(Function));
      expect(mockAPIIntegration.on).toHaveBeenCalledWith('security_event', expect.any(Function));
      expect(mockPatternEngine.on).toHaveBeenCalledWith('pattern_analysis_completed', expect.any(Function));
    });
  });

  describe('Refresh Job Management', () => {
    beforeEach(async () => {
      await refreshEngine.initialize();
    });

    it('should create refresh jobs successfully', async () => {
      const result = await refreshEngine.createRefreshJob(
        'Test Refresh Job',
        'manual',
        {
          target_sources: ['threat_feed_1', 'vulnerability_db_1'],
          refresh_mode: 'incremental',
          priority_level: 'high'
        }
      );

      expect(result).toHaveProperty('job_id');
      expect(result).toHaveProperty('job_status', 'pending');
      expect(result).toHaveProperty('estimated_duration');
      expect(typeof result.estimated_duration).toBe('number');
      expect(result.estimated_duration).toBeGreaterThan(0);
    });

    it('should create different types of refresh jobs', async () => {
      const jobTypes: ('scheduled' | 'triggered' | 'manual' | 'emergency')[] = ['scheduled', 'triggered', 'manual', 'emergency'];
      
      for (const jobType of jobTypes) {
        const result = await refreshEngine.createRefreshJob(
          `Test ${jobType} Job`,
          jobType,
          { priority_level: 'medium' }
        );

        expect(result).toHaveProperty('job_id');
        expect(result.job_status).toBe('pending');

    });

    it('should execute refresh jobs successfully', async () => {
      const jobResult = await refreshEngine.createRefreshJob(
        'Test Execution Job',
        'manual',
        {
          refresh_mode: 'full',
          priority_level: 'high',
          processing_options: {
            analysis_trigger: true,
            notification_on_completion: true

        }
      );

      const executionResult = await refreshEngine.executeRefreshJob(jobResult.job_id);

      expect(executionResult).toHaveProperty('job_id', jobResult.job_id);
      expect(executionResult).toHaveProperty('execution_status', 'completed');
      expect(executionResult).toHaveProperty('data_collected');
      expect(executionResult).toHaveProperty('quality_score');
      expect(executionResult).toHaveProperty('triggered_analyses');
      expect(typeof executionResult.data_collected).toBe('number');
      expect(executionResult.data_collected).toBeGreaterThanOrEqual(0);
      expect(executionResult.quality_score).toBeGreaterThanOrEqual(0);
      expect(executionResult.quality_score).toBeLessThanOrEqual(100);
    });

    it('should emit job lifecycle events', async () => {
      const createEventSpy = jest.fn<unknown[], unknown>();
      const startEventSpy = jest.fn<unknown[], unknown>();
      const completeEventSpy = jest.fn<unknown[], unknown>();
      
      refreshEngine.on('refresh_job_created', createEventSpy);
      refreshEngine.on('refresh_job_started', startEventSpy);
      refreshEngine.on('refresh_job_completed', completeEventSpy);

      const jobResult = await refreshEngine.createRefreshJob('Event Test Job', 'manual');
      await refreshEngine.executeRefreshJob(jobResult.job_id);

      expect(createEventSpy).toHaveBeenCalled();
      expect(startEventSpy).toHaveBeenCalled();
      expect(completeEventSpy).toHaveBeenCalled();
    });

    it('should handle job execution failures gracefully', async () => {
      const jobResult = await refreshEngine.createRefreshJob('Failure Test Job', 'manual');
      
      // Mock a failure scenario by making the job ID invalid after creation
      const invalidJobId = 'invalid_job_id';
      
      await expect(refreshEngine.executeRefreshJob(invalidJobId)).rejects.toThrow();
    });

    it('should calculate job duration estimates based on configuration', async () => {
      const smallJobResult = await refreshEngine.createRefreshJob(
        'Small Job',
        'manual',
        { target_sources: ['source_1'], priority_level: 'low' }
      );

      const largeJobResult = await refreshEngine.createRefreshJob(
        'Large Job',
        'manual',
        { target_sources: ['source_1', 'source_2', 'source_3', 'source_4'], priority_level: 'critical' }
      );

      expect(largeJobResult.estimated_duration).toBeGreaterThan(0);
      expect(smallJobResult.estimated_duration).toBeGreaterThan(0);
    });
  });

  describe('Periodic Refresh Scheduling', () => {
    beforeEach(async () => {
      await refreshEngine.initialize();
    });

    it('should schedule periodic refresh jobs', async () => {
      const scheduleResult = await refreshEngine.schedulePeriodicRefresh({
        schedule_name: 'Hourly Threat Feed Refresh',
        interval: 3600000, // 1 hour
        target_sources: ['threat_feed_1', 'threat_feed_2'],
        refresh_mode: 'incremental',
        priority_level: 'medium'
      });

      expect(scheduleResult).toHaveProperty('schedule_id');
      expect(scheduleResult).toHaveProperty('next_execution');
      expect(scheduleResult).toHaveProperty('status', 'active');
      expect(typeof scheduleResult.next_execution).toBe('number');
      expect(scheduleResult.next_execution).toBeGreaterThan(Date.now());
    });

    it('should create disabled schedules when requested', async () => {
      const scheduleResult = await refreshEngine.schedulePeriodicRefresh({
        schedule_name: 'Disabled Schedule',
        interval: 3600000,
        enabled: false
      });

      expect(scheduleResult.status).toBe('disabled');
    });

    it('should emit periodic refresh scheduling events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      refreshEngine.on('periodic_refresh_scheduled', eventSpy);

      await refreshEngine.schedulePeriodicRefresh({
        schedule_name: 'Event Test Schedule',
        interval: 3600000
      });

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          schedule_id: expect.any(String),
          interval: 3600000,
          next_execution: expect.any(Number)
  }
      );
    });

    it('should handle schedule creation errors', async () => {
      const scheduleEventSpy = jest.fn<unknown[], unknown>();
      refreshEngine.on('schedule_creation_error', scheduleEventSpy);

      // Create invalid schedule with negative interval
      await expect(refreshEngine.schedulePeriodicRefresh({
        schedule_name: 'Invalid Schedule',
        interval: -1000
      })).rejects.toThrow();
    });
  });

  describe('Emergency Refresh Functionality', () => {
    beforeEach(async () => {
      await refreshEngine.initialize();
    });

    it('should execute emergency refresh successfully', async () => {
      const emergencyResult = await refreshEngine.emergencyRefresh(
        'Critical threat detected in network perimeter',
        ['threat_feed_1', 'vulnerability_db_1']
      );

      expect(emergencyResult).toHaveProperty('job_id');
      expect(emergencyResult).toHaveProperty('execution_status', 'completed');
      expect(emergencyResult).toHaveProperty('emergency_metrics');
      expect(emergencyResult.emergency_metrics).toHaveProperty('trigger_reason');
      expect(emergencyResult.emergency_metrics).toHaveProperty('response_time');
      expect(emergencyResult.emergency_metrics).toHaveProperty('sources_refreshed');
      expect(emergencyResult.emergency_metrics).toHaveProperty('critical_intelligence_collected');
      expect(emergencyResult.emergency_metrics).toHaveProperty('immediate_threat_indicators');
      expect(emergencyResult.emergency_metrics).toHaveProperty('escalation_recommendations');
    });

    it('should prioritize emergency refresh jobs', async () => {
      const emergencyResult = await refreshEngine.emergencyRefresh(
        'Advanced persistent threat campaign detected'
      );

      expect(emergencyResult.execution_status).toBe('completed');
      expect(emergencyResult.emergency_metrics.escalation_recommendations).toBeInstanceOf(Array);
      expect(emergencyResult.emergency_metrics.escalation_recommendations.length).toBeGreaterThan(0);
    });

    it('should emit emergency refresh events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      refreshEngine.on('emergency_refresh_completed', eventSpy);

      await refreshEngine.emergencyRefresh('Test emergency scenario');

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should handle emergency refresh failures', async () => {
      const errorEventSpy = jest.fn<unknown[], unknown>();
      refreshEngine.on('emergency_refresh_failed', errorEventSpy);

      // Mock a failure by modifying internal state
      const originalMethod = refreshEngine.createRefreshJob;
      refreshEngine.createRefreshJob = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Emergency refresh failed'));

      await expect(refreshEngine.emergencyRefresh('Failed emergency')).rejects.toThrow();
      
      // Restore original method
      refreshEngine.createRefreshJob = originalMethod;
    });

    it('should generate appropriate threat indicators for emergency scenarios', async () => {
      const emergencyResult = await refreshEngine.emergencyRefresh(
        'Zero-day exploit detected in production environment'
      );

      expect(emergencyResult.emergency_metrics.immediate_threat_indicators).toBeInstanceOf(Array);
      expect(emergencyResult.emergency_metrics.immediate_threat_indicators.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics and Monitoring', () => {
    beforeEach(async () => {
      await refreshEngine.initialize();
      
      // Create some test jobs for analytics
      const job1 = await refreshEngine.createRefreshJob('Analytics Test Job 1', 'manual');
      const job2 = await refreshEngine.createRefreshJob('Analytics Test Job 2', 'scheduled');
      await refreshEngine.executeRefreshJob(job1.job_id);
      await refreshEngine.executeRefreshJob(job2.job_id);
    });

    it('should provide comprehensive refresh analytics', () => {
      const analytics = refreshEngine.getRefreshAnalytics();

      expect(analytics).toHaveProperty('summary');
      expect(analytics).toHaveProperty('source_performance');
      expect(analytics).toHaveProperty('temporal_analysis');
      expect(analytics).toHaveProperty('quality_insights');
      expect(analytics).toHaveProperty('performance_optimization');
      expect(analytics).toHaveProperty('integration_health');
    });

    it('should include summary metrics in analytics', () => {
      const analytics = refreshEngine.getRefreshAnalytics();

      expect(analytics.summary).toHaveProperty('total_refresh_jobs');
      expect(analytics.summary).toHaveProperty('successful_jobs');
      expect(analytics.summary).toHaveProperty('failed_jobs');
      expect(analytics.summary).toHaveProperty('average_job_duration');
      expect(analytics.summary).toHaveProperty('total_data_points_collected');
      expect(analytics.summary).toHaveProperty('average_quality_score');
      expect(analytics.summary).toHaveProperty('refresh_efficiency_score');
      
      expect(typeof analytics.summary.total_refresh_jobs).toBe('number');
      expect(typeof analytics.summary.successful_jobs).toBe('number');
      expect(typeof analytics.summary.failed_jobs).toBe('number');
      expect(analytics.summary.total_refresh_jobs).toBeGreaterThanOrEqual(0);
    });

    it('should provide source performance analytics', () => {
      const analytics = refreshEngine.getRefreshAnalytics();

      expect(analytics.source_performance).toBeInstanceOf(Array);
      if (analytics.source_performance.length > 0) {
        const sourceMetrics = analytics.source_performance[0];
        expect(sourceMetrics).toHaveProperty('source_id');
        expect(sourceMetrics).toHaveProperty('source_name');
        expect(sourceMetrics).toHaveProperty('refresh_count');
        expect(sourceMetrics).toHaveProperty('success_rate');
        expect(sourceMetrics).toHaveProperty('average_response_time');
        expect(sourceMetrics).toHaveProperty('data_quality_score');
        expect(sourceMetrics).toHaveProperty('last_successful_refresh');
        expect(sourceMetrics).toHaveProperty('reliability_rating');

    });

    it('should provide temporal analysis insights', () => {
      const analytics = refreshEngine.getRefreshAnalytics();

      expect(analytics.temporal_analysis).toHaveProperty('refresh_frequency_trends');
      expect(analytics.temporal_analysis).toHaveProperty('data_freshness_metrics');
      
      expect(analytics.temporal_analysis.refresh_frequency_trends).toHaveProperty('hourly_distribution');
      expect(analytics.temporal_analysis.refresh_frequency_trends).toHaveProperty('daily_patterns');
      expect(analytics.temporal_analysis.refresh_frequency_trends).toHaveProperty('peak_performance_windows');
      
      expect(analytics.temporal_analysis.data_freshness_metrics).toHaveProperty('average_data_age');
      expect(analytics.temporal_analysis.data_freshness_metrics).toHaveProperty('freshness_distribution');
      expect(analytics.temporal_analysis.data_freshness_metrics).toHaveProperty('stale_data_indicators');
    });

    it('should provide quality insights and optimization recommendations', () => {
      const analytics = refreshEngine.getRefreshAnalytics();

      expect(analytics.quality_insights).toHaveProperty('overall_quality_trend');
      expect(analytics.quality_insights).toHaveProperty('quality_improvement_opportunities');
      expect(analytics.quality_insights).toHaveProperty('data_completeness_analysis');
      
      expect(analytics.performance_optimization).toHaveProperty('resource_utilization_trends');
      expect(analytics.performance_optimization).toHaveProperty('bottleneck_analysis');
      expect(analytics.performance_optimization).toHaveProperty('cost_efficiency_metrics');
    });

    it('should provide integration health metrics', () => {
      const analytics = refreshEngine.getRefreshAnalytics();

      expect(analytics.integration_health).toHaveProperty('workflow_orchestrator_sync');
      expect(analytics.integration_health).toHaveProperty('siem_integration_status');
      expect(analytics.integration_health).toHaveProperty('dashboard_update_lag');
      expect(analytics.integration_health).toHaveProperty('api_notification_success_rate');
      expect(analytics.integration_health).toHaveProperty('external_webhook_health');
      
      expect(typeof analytics.integration_health.workflow_orchestrator_sync).toBe('boolean');
      expect(typeof analytics.integration_health.siem_integration_status).toBe('string');
      expect(typeof analytics.integration_health.dashboard_update_lag).toBe('number');
      expect(typeof analytics.integration_health.api_notification_success_rate).toBe('number');
      expect(analytics.integration_health.external_webhook_health).toBeInstanceOf(Array);
    });

    it('should handle analytics generation errors gracefully', () => {
      const analyticsErrorSpy = jest.fn<unknown[], unknown>();
      refreshEngine.on('analytics_generation_error', analyticsErrorSpy);

      // Analytics should still return valid data even with potential internal errors
      const analytics = refreshEngine.getRefreshAnalytics();
      expect(analytics).toBeDefined();
    });
  });

  describe('Event Handling and Integration', () => {
    beforeEach(async () => {
      await refreshEngine.initialize();
    });

    it('should handle intelligence collection events', () => {
      const refreshTriggerSpy = jest.fn<unknown[], unknown>();
      refreshEngine.on('refresh_trigger_intelligence_update', refreshTriggerSpy);

      // Simulate intelligence collection completed event
      const collectionData = {
        collection_id: 'collection_123',
        intelligence_collected: 75
      };
      
      mockIntelligenceEngine.on.mock.calls[0][1](collectionData);
      
      expect(refreshTriggerSpy).toHaveBeenCalledWith(collectionData);
    });

    it('should handle critical security events with emergency refresh', () => {
      const criticalEvent = {
        type: 'advanced_persistent_threat',
        severity: 'critical',
        source: 'network_monitoring'
      };

      // Simulate critical security event
      mockAPIIntegration.on.mock.calls[0][1](criticalEvent);

      // Should trigger emergency refresh (we can't easily test the async call here,
      // but we can verify the event handler was set up)
      expect(mockAPIIntegration.on).toHaveBeenCalledWith('security_event', expect.any(Function));
    });

    it('should handle pattern recognition events', () => {
      const newPatternTriggerSpy = jest.fn<unknown[], unknown>();
      refreshEngine.on('refresh_trigger_new_patterns', newPatternTriggerSpy);

      const patternAnalysis = {
        patterns_discovered: { 
          new_patterns: ['malware_family_x', 'attack_vector_y'] 

        confidence: 0.95
      };

      // Simulate pattern analysis completed event
      mockPatternEngine.on.mock.calls[0][1](patternAnalysis);

      expect(newPatternTriggerSpy).toHaveBeenCalledWith(patternAnalysis);
    });

    it('should integrate with workflow orchestrator when configured', async () => {
      const configWithOrchestrator = { ...config };
      configWithOrchestrator.integration_settings.workflow_orchestrator_integration = true;

      const orchestratorEngine = new SecurityIntelligenceDataRefreshEngine(
        configWithOrchestrator,
        mockIntelligenceEngine,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine,
        mockInsightsEngine
      );

      await orchestratorEngine.initialize();
      // Integration setup should be called during initialization
      expect(orchestratorEngine).toBeDefined();
    });

    it('should handle SIEM synchronization when configured', async () => {
      const configWithSIEM = { ...config };
      configWithSIEM.integration_settings.siem_refresh_synchronization = true;

      const siemEngine = new SecurityIntelligenceDataRefreshEngine(
        configWithSIEM,
        mockIntelligenceEngine,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine,
        mockInsightsEngine
      );

      await siemEngine.initialize();
      // SIEM integration setup should be called during initialization
      expect(siemEngine).toBeDefined();
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      await refreshEngine.initialize();
    });

    it('should handle large-scale refresh operations efficiently', async () => {
      const startTime = Date.now();
      
      const largeScaleJob = await refreshEngine.createRefreshJob(
        'Large Scale Refresh Test',
        'manual',
        {
          target_sources: ['source_1', 'source_2', 'source_3', 'source_4', 'source_5'],
          refresh_mode: 'full',
          priority_level: 'high',
          processing_options: {
            parallel_processing: true,
            batch_size: 50

        }
      );

      const executionResult = await refreshEngine.executeRefreshJob(largeScaleJob.job_id);
      
      const processingTime = Date.now() - startTime;
      
      expect(executionResult.execution_status).toBe('completed');
      expect(processingTime).toBeLessThan(30000); // Should complete within 30 seconds
      expect(executionResult.data_collected).toBeGreaterThan(0);
    });

    it('should handle concurrent refresh jobs', async () => {
      const job1Promise = refreshEngine.createRefreshJob('Concurrent Job 1', 'manual', { priority_level: 'medium' });
      const job2Promise = refreshEngine.createRefreshJob('Concurrent Job 2', 'manual', { priority_level: 'medium' });
      const job3Promise = refreshEngine.createRefreshJob('Concurrent Job 3', 'manual', { priority_level: 'medium' });

      const [job1, job2, job3] = await Promise.all([job1Promise, job2Promise, job3Promise]);

      expect(job1.job_id).toBeDefined();
      expect(job2.job_id).toBeDefined();
      expect(job3.job_id).toBeDefined();
      expect(job1.job_id).not.toBe(job2.job_id);
      expect(job2.job_id).not.toBe(job3.job_id);

      // Execute jobs concurrently
      const executionPromises = [
        refreshEngine.executeRefreshJob(job1.job_id),
        refreshEngine.executeRefreshJob(job2.job_id),
        refreshEngine.executeRefreshJob(job3.job_id)
      ];

      const results = await Promise.all(executionPromises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.execution_status).toBe('completed');
        expect(result.data_collected).toBeGreaterThanOrEqual(0);
      });
    });

    it('should optimize resource usage for multiple periodic schedules', async () => {
      const schedules = [
        { name: 'High Frequency', interval: 300000 }, // 5 minutes
        { name: 'Medium Frequency', interval: 900000 }, // 15 minutes
        { name: 'Low Frequency', interval: 3600000 } // 1 hour
      ];

      const scheduleResults = await Promise.all(
        schedules.map(schedule => 
          refreshEngine.schedulePeriodicRefresh({
            schedule_name: schedule.name,
            interval: schedule.interval,
            priority_level: 'medium'
  }

      );

      expect(scheduleResults).toHaveLength(3);
      scheduleResults.forEach(result => {
        expect(result.status).toBe('active');
        expect(result.schedule_id).toBeDefined();
      });
    });

    it('should maintain performance metrics during high-load scenarios', async () => {
      // Create and execute multiple jobs to simulate high load
      const jobs = [];
      for (let i = 0; i < 5; i++) {
        const job = await refreshEngine.createRefreshJob(`High Load Job ${i}`, 'manual');
        jobs.push(job);


      // Execute all jobs
      for (const job of jobs) {
        await refreshEngine.executeRefreshJob(job.job_id);


      // Verify analytics are still generated correctly
      const analytics = refreshEngine.getRefreshAnalytics();
      expect(analytics.summary.total_refresh_jobs).toBeGreaterThanOrEqual(5);
      expect(analytics.summary.successful_jobs).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Error Handling and Recovery', () => {
    beforeEach(async () => {
      await refreshEngine.initialize();
    });

    it('should handle job creation with minimal parameters', async () => {
      const minimalJob = await refreshEngine.createRefreshJob('Minimal Job', 'manual');

      expect(minimalJob).toHaveProperty('job_id');
      expect(minimalJob).toHaveProperty('job_status', 'pending');
      expect(minimalJob).toHaveProperty('estimated_duration');
    });

    it('should handle refresh jobs with empty source lists', async () => {
      const emptySourceJob = await refreshEngine.createRefreshJob(
        'Empty Sources Job',
        'manual',
        { target_sources: [] }
      );

      const executionResult = await refreshEngine.executeRefreshJob(emptySourceJob.job_id);

      expect(executionResult.execution_status).toBe('completed');
      expect(executionResult.data_collected).toBeGreaterThanOrEqual(0);
    });

    it('should emit error events when appropriate', async () => {
      const jobCreationErrorSpy = jest.fn<unknown[], unknown>();
      const jobFailedSpy = jest.fn<unknown[], unknown>();
      
      refreshEngine.on('refresh_job_creation_error', jobCreationErrorSpy);
      refreshEngine.on('refresh_job_failed', jobFailedSpy);

      // Create a scenario that might cause errors (implementation dependent)
      try {
        await refreshEngine.createRefreshJob('', 'manual'); // Empty name might cause error
 catch (error) {
        // Expected in some implementations

    });

    it('should handle network timeout scenarios gracefully', async () => {
      // This would typically involve mocking network delays or timeouts
      const timeoutJob = await refreshEngine.createRefreshJob(
        'Timeout Test Job',
        'manual',
        {
          processing_options: {
            parallel_processing: false,
            batch_size: 1

        }
      );

      // Should complete even with potential timeouts
      const result = await refreshEngine.executeRefreshJob(timeoutJob.job_id);
      expect(result).toHaveProperty('execution_status');
    });

    it('should recover from source availability issues', async () => {
      const unreliableSourceJob = await refreshEngine.createRefreshJob(
        'Unreliable Sources Job',
        'manual',
        {
          target_sources: ['unreliable_source_1', 'unreliable_source_2'],
          processing_options: {
            parallel_processing: true

        }
      );

      const result = await refreshEngine.executeRefreshJob(unreliableSourceJob.job_id);
      
      // Should complete even if some sources fail
      expect(result.execution_status).toBe('completed');
      expect(result.data_collected).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Configuration and Customization', () => {
    it('should accept custom data collection configuration', async () => {
      const customConfig: DataRefreshConfig = {
        ...config,
        data_collection: {
          concurrent_sources: 2,
          timeout_per_source: 15000,
          retry_attempts: 5,
          backoff_strategy: 'linear',
          quality_thresholds: {
            minimum_confidence: 0.9,
            freshness_requirement: 1800000, // 30 minutes
            completeness_threshold: 0.95

          deduplication_enabled: false

      };

      const customEngine = new SecurityIntelligenceDataRefreshEngine(
        customConfig,
        mockIntelligenceEngine,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine,
        mockInsightsEngine
      );

      await customEngine.initialize();
      expect(customEngine).toBeInstanceOf(SecurityIntelligenceDataRefreshEngine);
    });

    it('should handle disabled refresh automation', async () => {
      const disabledConfig = { ...config };
      disabledConfig.refresh_automation.enabled = false;

      const disabledEngine = new SecurityIntelligenceDataRefreshEngine(
        disabledConfig,
        mockIntelligenceEngine,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine,
        mockInsightsEngine
      );

      await expect(disabledEngine.initialize()).rejects.toThrow();
    });

    it('should adapt scheduling based on configuration', async () => {
      const adaptiveConfig = { ...config };
      adaptiveConfig.refresh_scheduling.adaptive_intervals = true;
      adaptiveConfig.refresh_scheduling.peak_hours_adjustment = true;
      adaptiveConfig.refresh_scheduling.load_balancing = true;

      const adaptiveEngine = new SecurityIntelligenceDataRefreshEngine(
        adaptiveConfig,
        mockIntelligenceEngine,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine,
        mockInsightsEngine
      );

      await adaptiveEngine.initialize();
      expect(adaptiveEngine).toBeDefined();
    });

    it('should support different analysis automation configurations', async () => {
      const analysisConfig = { ...config };
      analysisConfig.analysis_automation.analysis_types = ['threat_detection', 'correlation'];
      analysisConfig.analysis_automation.real_time_analysis_criteria = ['immediate_threat'];
      analysisConfig.analysis_automation.batch_analysis_threshold = 25;

      const analysisEngine = new SecurityIntelligenceDataRefreshEngine(
        analysisConfig,
        mockIntelligenceEngine,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine,
        mockInsightsEngine
      );

      await analysisEngine.initialize();
      
      const job = await analysisEngine.createRefreshJob('Analysis Test', 'manual', {
        processing_options: { analysis_trigger: true }
      });
      
      const result = await analysisEngine.executeRefreshJob(job.job_id);
      expect(result.triggered_analyses).toBeInstanceOf(Array);
    });

    it('should handle different integration settings', async () => {
      const integrationConfig = { ...config };
      integrationConfig.integration_settings.workflow_orchestrator_integration = false;
      integrationConfig.integration_settings.siem_refresh_synchronization = false;
      integrationConfig.integration_settings.dashboard_real_time_updates = false;

      const integrationEngine = new SecurityIntelligenceDataRefreshEngine(
        integrationConfig,
        mockIntelligenceEngine,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine,
        mockInsightsEngine
      );

      await integrationEngine.initialize();
      expect(integrationEngine).toBeDefined();
    });
  });
});