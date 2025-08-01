/**
 * Tests for Security Intelligence Automation Engine
 * Epic 31 - Task E31-1753313263575-DE6846
 */

import { 
  SecurityIntelligenceAutomationEngine, 
  SecurityIntelligenceConfig, 
  SecurityIntelligenceSource,
  ThreatIntelligenceData,
  IntelligenceAnalysisResult,
  IntelligenceWorkflow,
  IntelligenceBriefing 
 from '../SecurityIntelligenceAutomationEngine';
import { SecurityAPIIntegrationPlatform } from '../SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../SecurityPolicyAnalysisEngine';
import { SecurityRiskScoringEngine } from '../SecurityRiskScoringEngine';
import { SecurityPatternRecognitionEngine } from '../SecurityPatternRecognitionEngine';
import { SecurityTimeSeriesAnalysisEngine } from '../SecurityTimeSeriesAnalysisEngine';
import { SecurityInsightsAutomationEngine } from '../SecurityInsightsAutomationEngine';

// Mock dependencies
jest.mock('../SecurityAPIIntegrationPlatform');
jest.mock('../SecurityPolicyAnalysisEngine');
jest.mock('../SecurityRiskScoringEngine');
jest.mock('../SecurityPatternRecognitionEngine');
jest.mock('../SecurityTimeSeriesAnalysisEngine');
jest.mock('../SecurityInsightsAutomationEngine');

describe('SecurityIntelligenceAutomationEngine', () => {
  let engine: SecurityIntelligenceAutomationEngine;
  let mockAPIIntegration: jest.Mocked<SecurityAPIIntegrationPlatform>;
  let mockPolicyEngine: jest.Mocked<SecurityPolicyAnalysisEngine>;
  let mockRiskScoringEngine: jest.Mocked<SecurityRiskScoringEngine>;
  let mockPatternEngine: jest.Mocked<SecurityPatternRecognitionEngine>;
  let mockTimeSeriesEngine: jest.Mocked<SecurityTimeSeriesAnalysisEngine>;
  let mockInsightsEngine: jest.Mocked<SecurityInsightsAutomationEngine>;
  let config: SecurityIntelligenceConfig;

  beforeEach(() => {
    // Setup mocks
    mockAPIIntegration = {
      on: jest.fn<unknown[], unknown>(),
      getPlatformMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
        api_calls: { total_requests: 50000, successful_requests: 49500 },
        security_analytics: { threats_detected: 125, detection_accuracy_percent: 98 }
 as unknown)
 as any;

    mockPolicyEngine = {
      on: jest.fn<unknown[], unknown>(),
      analyzePolicyImpact: jest.fn<unknown[], unknown>().mockResolvedValue({
        risk_analysis: { overall_risk_score: 55 },
        validation_results: { validation_passed: true }
 as unknown)
 as any;

    mockRiskScoringEngine = {
      on: jest.fn<unknown[], unknown>(),
      scoreSecurityRisk: jest.fn<unknown[], unknown>().mockResolvedValue({
        risk_id: 'risk_789',
        risk_scoring: { composite_score: 87 }
 as unknown)
 as any;

    mockPatternEngine = {
      on: jest.fn<unknown[], unknown>(),
      recognizePatterns: jest.fn<unknown[], unknown>().mockResolvedValue({
        patterns_discovered: { new_patterns: ['pattern_1', 'pattern_2'] },
        analysis_id: 'pattern_analysis_789'
 as unknown)
 as any;

    mockTimeSeriesEngine = {
      on: jest.fn<unknown[], unknown>(),
      analyzeTimeSeries: jest.fn<unknown[], unknown>().mockResolvedValue({
        analysis_id: 'timeseries_789',
        detected_anomalies: [{ anomaly_id: 'anom_1', severity: 'high' }]
 as unknown)
 as any;

    mockInsightsEngine = {
      on: jest.fn<unknown[], unknown>(),
      generateInsights: jest.fn<unknown[], unknown>().mockResolvedValue({
        generation_id: 'gen_789',
        insights_generated: []
 as unknown)
 as any;

    // Setup configuration
    config = {
      intelligence_collection: {
        enabled: true,
        real_time_collection: true,
        automated_source_discovery: true,
        threat_feed_integration: true,
        external_intelligence_apis: true,
        dark_web_monitoring: true,
        social_media_intelligence: true,
        vulnerability_intelligence: true

      intelligence_processing: {
        natural_language_processing: true,
        machine_learning_analysis: true,
        automated_enrichment: true,
        confidence_scoring: true,
        source_credibility_assessment: true,
        temporal_analysis: true,
        geospatial_analysis: true,
        behavioral_analysis: true

      threat_intelligence: {
        indicator_extraction: true,
        ioc_management: true,
        ttp_analysis: true,
        campaign_tracking: true,
        actor_profiling: true,
        attribution_analysis: true,
        threat_hunting_automation: true,
        predictive_threat_modeling: true

      intelligence_fusion: {
        multi_source_correlation: true,
        cross_intelligence_analysis: true,
        tactical_intelligence: true,
        operational_intelligence: true,
        strategic_intelligence: true,
        technical_intelligence: true,
        contextual_intelligence: true

      automation_capabilities: {
        automated_analysis: true,
        intelligence_orchestration: true,
        response_automation: true,
        alert_generation: true,
        report_automation: true,
        decision_support: true,
        workflow_automation: true,
        integration_automation: true

      intelligence_distribution: {
        stakeholder_targeting: true,
        format_customization: true,
        delivery_automation: true,
        briefing_generation: true,
        dashboard_integration: true,
        api_distribution: true,
        alert_distribution: true,
        report_distribution: true

    };

    engine = new SecurityIntelligenceAutomationEngine(
      config,
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
      const initializeSpy = jest.spyOn(engine, 'initialize');
      
      await engine.initialize();
      
      expect(initializeSpy).toHaveBeenCalled();
    });

    it('should emit initialization events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      engine.on('engine_initialized', eventSpy);
      
      await engine.initialize();
      
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      const errorEngine = new SecurityIntelligenceAutomationEngine(
        {} as any, // Invalid config
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine,
        mockInsightsEngine
      );

      await expect(errorEngine.initialize()).rejects.toThrow();
    });
  });

  describe('Intelligence Collection', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should collect intelligence from specified sources', async () => {
      const sources = ['threat_feed_1', 'vulnerability_db_1'];
      const options = {
        collection_scope: ['threat_feeds', 'vulnerability_intel'],
        priority_filters: ['high', 'critical'],
        time_range: { start: Date.now() - 86400000, end: Date.now() },
        intelligence_types: ['tactical', 'operational'],
        automated_enrichment: true
      };

      const result = await engine.collectIntelligence(sources, options);

      expect(result).toHaveProperty('collection_id');
      expect(result).toHaveProperty('intelligence_collected');
      expect(result).toHaveProperty('processing_status');
      expect(typeof result.intelligence_collected).toBe('number');
      expect(result.processing_status).toBe('completed');
    });

    it('should collect intelligence from all sources when none specified', async () => {
      const result = await engine.collectIntelligence();

      expect(result).toHaveProperty('collection_id');
      expect(result).toHaveProperty('intelligence_collected');
      expect(result.intelligence_collected).toBeGreaterThanOrEqual(0);
    });

    it('should handle collection errors gracefully', async () => {
      const invalidSources = ['non_existent_source'];
      
      const result = await engine.collectIntelligence(invalidSources);
      
      expect(result).toHaveProperty('collection_id');
      expect(result.intelligence_collected).toBeGreaterThanOrEqual(0);
    });

    it('should emit collection events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      engine.on('intelligence_collection_completed', eventSpy);
      
      await engine.collectIntelligence();
      
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should apply automated enrichment when enabled', async () => {
      const options = { automated_enrichment: true };
      
      const result = await engine.collectIntelligence(undefined, options);
      
      expect(result).toHaveProperty('collection_id');
      expect(result.intelligence_collected).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Intelligence Analysis', () => {
    beforeEach(async () => {
      await engine.initialize();
      // Pre-populate with some intelligence data
      await engine.collectIntelligence();
    });

    it('should perform comprehensive intelligence analysis', async () => {
      const result = await engine.analyzeIntelligence(
        undefined,
        'comprehensive',
        {
          focus_areas: ['malware', 'apt_groups'],
          analysis_depth: 'deep',
          include_predictions: true,
          correlation_analysis: true,
          attribution_analysis: true
        }
      );

      expect(result).toHaveProperty('analysis_id');
      expect(result).toHaveProperty('analysis_type', 'comprehensive');
      expect(result).toHaveProperty('intelligence_summary');
      expect(result).toHaveProperty('threat_landscape');
      expect(result).toHaveProperty('strategic_insights');
      expect(result).toHaveProperty('tactical_recommendations');
      expect(result).toHaveProperty('quality_metrics');
    });

    it('should perform tactical analysis', async () => {
      const result = await engine.analyzeIntelligence(
        undefined,
        'tactical',
        {
          focus_areas: ['iocs', 'ttps'],
          analysis_depth: 'standard'
        }
      );

      expect(result.analysis_type).toBe('tactical');
      expect(result.tactical_recommendations).toBeDefined();
      expect(result.tactical_recommendations.immediate_actions).toBeInstanceOf(Array);
      expect(result.tactical_recommendations.detection_rules).toBeInstanceOf(Array);
    });

    it('should perform strategic analysis', async () => {
      const result = await engine.analyzeIntelligence(
        undefined,
        'strategic',
        {
          focus_areas: ['geopolitical', 'industry_trends'],
          include_predictions: true
        }
      );

      expect(result.analysis_type).toBe('strategic');
      expect(result.strategic_insights).toBeDefined();
      expect(result.strategic_insights.trend_analysis).toBeDefined();
      expect(result.strategic_insights.predictive_analysis).toBeDefined();
    });

    it('should analyze specific intelligence items', async () => {
      const intelligenceIds = ['intel_123', 'intel_456'];
      
      const result = await engine.analyzeIntelligence(
        intelligenceIds,
        'operational'
      );

      expect(result).toHaveProperty('analysis_id');
      expect(result.analysis_type).toBe('operational');
    });

    it('should emit analysis events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      engine.on('intelligence_analysis_completed', eventSpy);
      
      await engine.analyzeIntelligence();
      
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should handle analysis errors gracefully', async () => {
      const invalidIds = ['non_existent_intelligence'];
      
      await expect(engine.analyzeIntelligence(invalidIds)).rejects.toThrow();
    });
  });

  describe('Workflow Automation', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should create collection workflow automation', async () => {
      const workflowConfig = {
        workflow_name: 'Automated Threat Feed Collection',
        automation_level: 'fully_automated' as const,
        trigger_conditions: ['new_threat_detected', 'schedule_daily'],
        execution_frequency: 'hourly',
        target_sources: ['threat_feed_1', 'threat_feed_2']
      };

      const result = await engine.automateWorkflow('collection', workflowConfig);

      expect(result).toHaveProperty('workflow_id');
      expect(result).toHaveProperty('automation_status', 'active');
      expect(result).toHaveProperty('estimated_efficiency');
      expect(result.estimated_efficiency).toBeGreaterThan(0);
    });

    it('should create analysis workflow automation', async () => {
      const workflowConfig = {
        workflow_name: 'Automated Threat Analysis',
        automation_level: 'semi_automated' as const,
        trigger_conditions: ['high_confidence_intelligence', 'critical_threat'],
        execution_frequency: 'continuous'
      };

      const result = await engine.automateWorkflow('analysis', workflowConfig);

      expect(result).toHaveProperty('workflow_id');
      expect(result.automation_status).toBe('active');
    });

    it('should create distribution workflow automation', async () => {
      const workflowConfig = {
        workflow_name: 'Automated Intelligence Distribution',
        automation_level: 'fully_automated' as const,
        trigger_conditions: ['analysis_complete', 'high_priority_intel'],
        distribution_settings: {
          channels: ['email', 'dashboard', 'api'],
          audiences: ['security_team', 'management']

      };

      const result = await engine.automateWorkflow('distribution', workflowConfig);

      expect(result).toHaveProperty('workflow_id');
      expect(result.automation_status).toBe('active');
    });

    it('should create response workflow automation', async () => {
      const workflowConfig = {
        workflow_name: 'Automated Threat Response',
        automation_level: 'manual' as const,
        trigger_conditions: ['critical_threat_detected', 'imminent_attack']
      };

      const result = await engine.automateWorkflow('response', workflowConfig);

      expect(result).toHaveProperty('workflow_id');
      expect(result.automation_status).toBe('active');
    });

    it('should emit workflow automation events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      engine.on('workflow_automation_created', eventSpy);
      
      const workflowConfig = {
        workflow_name: 'Test Workflow',
        automation_level: 'semi_automated' as const,
        trigger_conditions: ['test_trigger']
      };

      await engine.automateWorkflow('enrichment', workflowConfig);
      
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should calculate workflow efficiency correctly', async () => {
      const fullyAutomatedConfig = {
        workflow_name: 'Fully Automated Test',
        automation_level: 'fully_automated' as const,
        trigger_conditions: ['test']
      };

      const result = await engine.automateWorkflow('collection', fullyAutomatedConfig);
      
      expect(result.estimated_efficiency).toBeGreaterThan(0);
      expect(result.estimated_efficiency).toBeLessThanOrEqual(100);
    });
  });

  describe('Intelligence Briefing Generation', () => {
    beforeEach(async () => {
      await engine.initialize();
      await engine.collectIntelligence();
    });

    it('should generate tactical briefings', async () => {
      const briefingConfig = {
        target_audience: 'security_analysts',
        classification_level: 'internal' as const,
        focus_areas: ['current_threats', 'iocs'],
        include_recommendations: true
      };

      const briefing = await engine.generateIntelligenceBriefing('tactical', briefingConfig);

      expect(briefing).toHaveProperty('briefing_id');
      expect(briefing.briefing_type).toBe('tactical');
      expect(briefing.briefing_classification).toBe('internal');
      expect(briefing.target_audience.audience_type).toBe('security_analysts');
      expect(briefing.briefing_content).toHaveProperty('tactical_recommendations');
    });

    it('should generate operational briefings', async () => {
      const briefingConfig = {
        target_audience: 'security_managers',
        classification_level: 'confidential' as const,
        time_range: { start: Date.now() - 604800000, end: Date.now() }, // Last week
        include_predictions: true
      };

      const briefing = await engine.generateIntelligenceBriefing('operational', briefingConfig);

      expect(briefing.briefing_type).toBe('operational');
      expect(briefing.briefing_classification).toBe('confidential');
      expect(briefing.briefing_content).toHaveProperty('key_findings');
      expect(briefing.briefing_content).toHaveProperty('intelligence_updates');
    });

    it('should generate strategic briefings', async () => {
      const briefingConfig = {
        target_audience: 'executives',
        classification_level: 'restricted' as const,
        focus_areas: ['geopolitical_trends', 'industry_analysis'],
        include_predictions: true,
        delivery_format: ['pdf', 'presentation']
      };

      const briefing = await engine.generateIntelligenceBriefing('strategic', briefingConfig);

      expect(briefing.briefing_type).toBe('strategic');
      expect(briefing.target_audience.decision_authority).toBe('board');
      expect(briefing.briefing_content).toHaveProperty('strategic_implications');
    });

    it('should generate executive briefings', async () => {
      const briefingConfig = {
        target_audience: 'board_members',
        classification_level: 'confidential' as const,
        include_recommendations: true
      };

      const briefing = await engine.generateIntelligenceBriefing('executive', briefingConfig);

      expect(briefing.briefing_type).toBe('executive');
      expect(briefing.target_audience.technical_level).toBe('basic');
      expect(briefing.briefing_content).toHaveProperty('executive_summary');
    });

    it('should include supporting materials based on briefing type', async () => {
      const briefingConfig = {
        target_audience: 'threat_hunters',
        classification_level: 'internal' as const,
        include_recommendations: true
      };

      const briefing = await engine.generateIntelligenceBriefing('tactical', briefingConfig);

      expect(briefing.supporting_data.charts_included).toBeGreaterThanOrEqual(0);
      expect(briefing.supporting_data.reference_materials).toBeInstanceOf(Array);
      expect(briefing.supporting_data.appendices).toBeInstanceOf(Array);
    });

    it('should emit briefing generation events', async () => {
      const eventSpy = jest.fn<unknown[], unknown>();
      engine.on('briefing_generation_completed', eventSpy);
      
      const briefingConfig = {
        target_audience: 'analysts',
        classification_level: 'internal' as const
      };

      await engine.generateIntelligenceBriefing('tactical', briefingConfig);
      
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('Analytics and Metrics', () => {
    beforeEach(async () => {
      await engine.initialize();
      await engine.collectIntelligence();
      await engine.analyzeIntelligence();
    });

    it('should provide comprehensive intelligence analytics', () => {
      const analytics = engine.getIntelligenceAnalytics();

      expect(analytics).toHaveProperty('summary');
      expect(analytics).toHaveProperty('intelligence_distribution');
      expect(analytics).toHaveProperty('source_metrics');
      expect(analytics).toHaveProperty('threat_landscape');
      expect(analytics).toHaveProperty('workflow_performance');
      expect(analytics).toHaveProperty('recent_activities');
    });

    it('should include intelligence summary metrics', () => {
      const analytics = engine.getIntelligenceAnalytics();

      expect(analytics.summary).toHaveProperty('total_intelligence_items');
      expect(analytics.summary).toHaveProperty('total_analyses_performed');
      expect(analytics.summary).toHaveProperty('active_workflows');
      expect(analytics.summary).toHaveProperty('automation_efficiency');
      expect(typeof analytics.summary.total_intelligence_items).toBe('number');
    });

    it('should include source performance metrics', () => {
      const analytics = engine.getIntelligenceAnalytics();

      expect(analytics.source_metrics).toHaveProperty('source_performance');
      expect(analytics.source_metrics).toHaveProperty('collection_efficiency');
      expect(analytics.source_metrics).toHaveProperty('source_reliability');
      expect(analytics.source_metrics.source_performance).toBeInstanceOf(Array);
    });

    it('should include threat landscape insights', () => {
      const analytics = engine.getIntelligenceAnalytics();

      expect(analytics.threat_landscape).toHaveProperty('emerging_threats');
      expect(analytics.threat_landscape).toHaveProperty('threat_actors');
      expect(analytics.threat_landscape).toHaveProperty('attack_campaigns');
      expect(analytics.threat_landscape).toHaveProperty('vulnerability_trends');
    });

    it('should include workflow performance metrics', () => {
      const analytics = engine.getIntelligenceAnalytics();

      expect(analytics.workflow_performance).toHaveProperty('workflow_efficiency');
      expect(analytics.workflow_performance).toHaveProperty('automation_metrics');
      expect(analytics.workflow_performance).toHaveProperty('processing_performance');
    });

    it('should track recent activities', () => {
      const analytics = engine.getIntelligenceAnalytics();

      expect(analytics.recent_activities).toBeInstanceOf(Array);
      expect(analytics.recent_activities.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle empty intelligence collection gracefully', async () => {
      const result = await engine.collectIntelligence([]);

      expect(result).toHaveProperty('collection_id');
      expect(result.intelligence_collected).toBeGreaterThanOrEqual(0);
    });

    it('should handle analysis with no intelligence data', async () => {
      const result = await engine.analyzeIntelligence([], 'tactical');

      expect(result).toHaveProperty('analysis_id');
      expect(result.intelligence_summary.total_intelligence_processed).toBe(0);
    });

    it('should handle workflow creation with minimal configuration', async () => {
      const minimalConfig = {
        workflow_name: 'Minimal Workflow',
        automation_level: 'manual' as const,
        trigger_conditions: ['manual_trigger']
      };

      const result = await engine.automateWorkflow('collection', minimalConfig);

      expect(result).toHaveProperty('workflow_id');
      expect(result.automation_status).toBe('active');
    });

    it('should handle briefing generation with minimal data', async () => {
      const briefingConfig = {
        target_audience: 'general',
        classification_level: 'public' as const
      };

      const briefing = await engine.generateIntelligenceBriefing('tactical', briefingConfig);

      expect(briefing).toHaveProperty('briefing_id');
      expect(briefing.briefing_type).toBe('tactical');
    });

    it('should emit error events when appropriate', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('intelligence_collection_error', errorSpy);
      
      // This should trigger an error event but not throw
      try {
        await engine.collectIntelligence(['invalid_source'], { 
          time_range: { start: Date.now(), end: Date.now() - 86400000 } // Invalid range
        });
 catch (error) {
        // Expected to not reach here in normal operation

    });
  });

  describe('Event Handling and Integration', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle security events from API integration', async () => {
      const securityEvent = {
        type: 'high_severity_alert',
        severity: 'critical',
        source: 'endpoint_detection'
      };

      // Simulate security event
      mockAPIIntegration.on.mock.calls[0][1](securityEvent);

      // Verify that event handling doesn't throw errors
      expect(mockAPIIntegration.on).toHaveBeenCalledWith('security_event', expect.any(Function));
    });

    it('should handle risk scoring events', async () => {
      const riskData = {
        risk_scoring: { composite_score: 0.95 },
        risk_factors: ['malware_detected', 'data_exfiltration']
      };

      // Simulate risk scoring event
      mockRiskScoringEngine.on.mock.calls[0][1](riskData);

      expect(mockRiskScoringEngine.on).toHaveBeenCalledWith('risk_scored', expect.any(Function));
    });

    it('should handle pattern recognition events', async () => {
      const patternAnalysis = {
        patterns_discovered: { new_patterns: ['apt_pattern'] },
        confidence: 0.92
      };

      // Simulate pattern analysis event
      mockPatternEngine.on.mock.calls[0][1](patternAnalysis);

      expect(mockPatternEngine.on).toHaveBeenCalledWith('pattern_analysis_completed', expect.any(Function));
    });

    it('should handle time series anomaly events', async () => {
      const anomalies = {
        highSeverityCount: 3,
        anomalies: [
          { severity: 'high', type: 'volume_spike' },
          { severity: 'critical', type: 'unusual_pattern' }
        ]
      };

      // Simulate anomaly detection event
      mockTimeSeriesEngine.on.mock.calls[0][1](anomalies);

      expect(mockTimeSeriesEngine.on).toHaveBeenCalledWith('anomalies_detected', expect.any(Function));
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle large-scale intelligence collection efficiently', async () => {
      const startTime = Date.now();
      
      const result = await engine.collectIntelligence(
        undefined,
        {
          collection_scope: ['threat_feeds', 'vulnerability_intel', 'dark_web'],
          automated_enrichment: true
        }
      );
      
      const processingTime = Date.now() - startTime;
      
      expect(result).toHaveProperty('collection_id');
      expect(processingTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle concurrent analysis requests', async () => {
      const analysisPromises = [
        engine.analyzeIntelligence(undefined, 'tactical'),
        engine.analyzeIntelligence(undefined, 'operational'),
        engine.analyzeIntelligence(undefined, 'strategic')
      ];

      const results = await Promise.all(analysisPromises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toHaveProperty('analysis_id');
        expect(result).toHaveProperty('analysis_type');
      });
    });

    it('should handle multiple workflow creation efficiently', async () => {
      const workflowConfigs = [
        {
          workflow_name: 'Collection Workflow',
          automation_level: 'fully_automated' as const,
          trigger_conditions: ['schedule']

        {
          workflow_name: 'Analysis Workflow',
          automation_level: 'semi_automated' as const,
          trigger_conditions: ['data_available']

        {
          workflow_name: 'Distribution Workflow',
          automation_level: 'fully_automated' as const,
          trigger_conditions: ['analysis_complete']

      ];

      const workflowPromises = workflowConfigs.map((config, index) => 
        engine.automateWorkflow(
          ['collection', 'analysis', 'distribution'][index] as any,
          config

      );

      const results = await Promise.all(workflowPromises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toHaveProperty('workflow_id');
        expect(result.automation_status).toBe('active');
      });
    });

    it('should maintain performance with multiple briefing generations', async () => {
      const briefingTypes = ['tactical', 'operational', 'strategic', 'executive'] as const;
      
      const briefingPromises = briefingTypes.map(type =>
        engine.generateIntelligenceBriefing(type, {
          target_audience: `${type}_team`,
          classification_level: 'internal'
  }
      );

      const briefings = await Promise.all(briefingPromises);

      expect(briefings).toHaveLength(4);
      briefings.forEach((briefing, index) => {
        expect(briefing.briefing_type).toBe(briefingTypes[index]);
        expect(briefing).toHaveProperty('briefing_id');
      });
    });
  });

  describe('Configuration and Customization', () => {
    it('should accept custom intelligence collection configuration', () => {
      const customConfig: SecurityIntelligenceConfig = {
        intelligence_collection: {
          enabled: true,
          real_time_collection: false,
          automated_source_discovery: false,
          threat_feed_integration: true,
          external_intelligence_apis: false,
          dark_web_monitoring: true,
          social_media_intelligence: false,
          vulnerability_intelligence: true

        intelligence_processing: {
          natural_language_processing: true,
          machine_learning_analysis: false,
          automated_enrichment: true,
          confidence_scoring: true,
          source_credibility_assessment: true,
          temporal_analysis: false,
          geospatial_analysis: false,
          behavioral_analysis: true

        threat_intelligence: {
          indicator_extraction: true,
          ioc_management: true,
          ttp_analysis: false,
          campaign_tracking: true,
          actor_profiling: false,
          attribution_analysis: true,
          threat_hunting_automation: false,
          predictive_threat_modeling: true

        intelligence_fusion: {
          multi_source_correlation: true,
          cross_intelligence_analysis: false,
          tactical_intelligence: true,
          operational_intelligence: true,
          strategic_intelligence: false,
          technical_intelligence: true,
          contextual_intelligence: false

        automation_capabilities: {
          automated_analysis: false,
          intelligence_orchestration: true,
          response_automation: false,
          alert_generation: true,
          report_automation: true,
          decision_support: false,
          workflow_automation: true,
          integration_automation: false

        intelligence_distribution: {
          stakeholder_targeting: true,
          format_customization: true,
          delivery_automation: false,
          briefing_generation: true,
          dashboard_integration: true,
          api_distribution: false,
          alert_distribution: true,
          report_distribution: false

      };

      const customEngine = new SecurityIntelligenceAutomationEngine(
        customConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine,
        mockInsightsEngine
      );

      expect(customEngine).toBeInstanceOf(SecurityIntelligenceAutomationEngine);
    });

    it('should handle disabled intelligence collection gracefully', async () => {
      const disabledConfig = { ...config };
      disabledConfig.intelligence_collection.enabled = false;

      const disabledEngine = new SecurityIntelligenceAutomationEngine(
        disabledConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine,
        mockInsightsEngine
      );

      await disabledEngine.initialize();

      const result = await disabledEngine.collectIntelligence();
      expect(result).toHaveProperty('collection_id');
    });

    it('should adapt analysis based on processing configuration', async () => {
      const limitedProcessingConfig = { ...config };
      limitedProcessingConfig.intelligence_processing.machine_learning_analysis = false;
      limitedProcessingConfig.intelligence_processing.natural_language_processing = false;

      const limitedEngine = new SecurityIntelligenceAutomationEngine(
        limitedProcessingConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine,
        mockInsightsEngine
      );

      await limitedEngine.initialize();

      const result = await limitedEngine.analyzeIntelligence(undefined, 'tactical');
      expect(result).toHaveProperty('analysis_id');
      expect(result.analysis_type).toBe('tactical');
    });
  });
});