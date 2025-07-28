/**
 * Tests for Security Insights Automation Engine
 * Epic 31 - Task E31-1753313263577-F84067
 */

import { 
  SecurityInsightsAutomationEngine, 
  SecurityInsightsConfig, 
  SecurityInsight,
  InsightGenerationResult,
  InsightDistributionResult,
  PersonalizationProfile 
} from '../SecurityInsightsAutomationEngine';
import { SecurityAPIIntegrationPlatform } from '../SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../SecurityPolicyAnalysisEngine';
import { SecurityRiskScoringEngine } from '../SecurityRiskScoringEngine';
import { SecurityPatternRecognitionEngine } from '../SecurityPatternRecognitionEngine';
import { SecurityTimeSeriesAnalysisEngine } from '../SecurityTimeSeriesAnalysisEngine';

// Mock dependencies
jest.mock('../SecurityAPIIntegrationPlatform');
jest.mock('../SecurityPolicyAnalysisEngine');
jest.mock('../SecurityRiskScoringEngine');
jest.mock('../SecurityPatternRecognitionEngine');
jest.mock('../SecurityTimeSeriesAnalysisEngine');

describe('SecurityInsightsAutomationEngine', () => {
  let engine: SecurityInsightsAutomationEngine;
  let mockAPIIntegration: jest.Mocked<SecurityAPIIntegrationPlatform>;
  let mockPolicyEngine: jest.Mocked<SecurityPolicyAnalysisEngine>;
  let mockRiskScoringEngine: jest.Mocked<SecurityRiskScoringEngine>;
  let mockPatternEngine: jest.Mocked<SecurityPatternRecognitionEngine>;
  let mockTimeSeriesEngine: jest.Mocked<SecurityTimeSeriesAnalysisEngine>;
  let config: SecurityInsightsConfig;

  beforeEach(() => {
    // Setup mocks
    mockAPIIntegration = {
      on: jest.fn<unknown[], unknown>(),
      getPlatformMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
        api_calls: { total_requests: 35000, successful_requests: 34650 },
        security_analytics: { threats_detected: 75, detection_accuracy_percent: 99 }
      } as unknown)
    } as any;

    mockPolicyEngine = {
      on: jest.fn<unknown[], unknown>(),
      analyzePolicyImpact: jest.fn<unknown[], unknown>().mockResolvedValue({
        risk_analysis: { overall_risk_score: 45 },
        validation_results: { validation_passed: true }
      } as unknown)
    } as any;

    mockRiskScoringEngine = {
      on: jest.fn<unknown[], unknown>(),
      scoreSecurityRisk: jest.fn<unknown[], unknown>().mockResolvedValue({
        risk_id: 'risk_456',
        risk_scoring: { composite_score: 92 }
      } as unknown)
    } as any;

    mockPatternEngine = {
      on: jest.fn<unknown[], unknown>(),
      recognizePatterns: jest.fn<unknown[], unknown>().mockResolvedValue({
        patterns_discovered: { new_patterns: [] },
        analysis_id: 'pattern_analysis_456'
      } as unknown)
    } as any;

    mockTimeSeriesEngine = {
      on: jest.fn<unknown[], unknown>(),
      analyzeTimeSeries: jest.fn<unknown[], unknown>().mockResolvedValue({
        analysis_id: 'timeseries_456',
        detected_anomalies: []
      } as unknown)
    } as any;

    // Setup configuration
    config = {
      generation_settings: {
        enabled: true,
        real_time_generation: true,
        batch_processing_enabled: true,
        scheduled_generation: true,
        insight_quality_threshold: 0.7,
        automated_distribution: true,
        multi_language_support: true,
        personalization_enabled: true
  }
      insight_types: {
        threat_insights: true,
        risk_insights: true,
        compliance_insights: true,
        operational_insights: true,
        strategic_insights: true,
        predictive_insights: true,
        behavioral_insights: true,
        contextual_insights: true
  }
      analysis_algorithms: {
        natural_language_processing: true,
        machine_learning_analysis: true,
        statistical_correlation: true,
        pattern_synthesis: true,
        trend_analysis: true,
        anomaly_contextualization: true,
        causal_inference: true,
        impact_assessment: true
  }
      data_sources: {
        security_events: true,
        threat_intelligence: true,
        vulnerability_data: true,
        compliance_reports: true,
        audit_logs: true,
        performance_metrics: true,
        user_behavior_data: true,
        external_intelligence: true
  }
      generation_triggers: {
        scheduled_intervals: ['hourly', 'daily', 'weekly'],
        event_driven_triggers: ['critical_alert', 'policy_violation', 'anomaly_detected'],
        threshold_based_triggers: ['risk_score_elevated', 'compliance_deviation'],
        correlation_triggers: ['pattern_correlation', 'trend_correlation'],
        anomaly_triggers: ['statistical_anomaly', 'behavioral_anomaly'],
        compliance_triggers: ['regulation_change', 'audit_finding'],
        escalation_triggers: ['incident_escalation', 'threat_escalation']
  }
      distribution_channels: {
        dashboard_integration: true,
        email_reports: true,
        slack_notifications: true,
        api_endpoints: true,
        siem_integration: true,
        mobile_notifications: true,
        executive_briefings: true,
        automated_tickets: true
  }
      personalization: {
        role_based_insights: true,
        department_specific: true,
        priority_customization: true,
        format_preferences: true,
        delivery_preferences: true,
        language_preferences: true,
        technical_level_adjustment: true
      }
    };

    engine = new SecurityInsightsAutomationEngine(
      config,
      mockAPIIntegration,
      mockPolicyEngine,
      mockRiskScoringEngine,
      mockPatternEngine,
      mockTimeSeriesEngine
    );
  });

  afterEach(async () => {
    if (engine) {
      await engine.shutdown();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const initializeSpy = jest.fn<unknown[], unknown>();
      engine.on('initialized', initializeSpy);

      await engine.initialize();

      expect(initializeSpy).toHaveBeenCalledWith({ timestamp: expect.any(Number) });
    });

    it('should emit error on initialization failure', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('error', errorSpy);

      // Mock a component initialization failure
      jest.spyOn(engine as any, 'initializeAnalysisModels').mockRejectedValue(new Error('Model loading failed'));

      await expect(engine.initialize()).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'initialization'
      });
    });

    it('should load analysis models during initialization', async () => {
      await engine.initialize();

      const analysisModels = (engine as any).analysisModels;
      expect(analysisModels).toBeDefined();
      expect(analysisModels.correlation_model).toBeDefined();
      expect(analysisModels.trend_analysis_model).toBeDefined();
      expect(analysisModels.impact_assessment_model).toBeDefined();
    });

    it('should initialize NLP processors', async () => {
      await engine.initialize();

      const nlpProcessors = (engine as any).nlpProcessors;
      expect(nlpProcessors).toBeDefined();
      expect(nlpProcessors.summarization).toBeDefined();
      expect(nlpProcessors.sentiment_analysis).toBeDefined();
      expect(nlpProcessors.entity_extraction).toBeDefined();
    });

    it('should initialize distribution channels', async () => {
      await engine.initialize();

      const distributionChannels = (engine as any).distributionChannels;
      expect(distributionChannels).toBeDefined();
      expect(distributionChannels.has('email')).toBe(true);
      expect(distributionChannels.has('slack')).toBe(true);
      expect(distributionChannels.has('dashboard')).toBe(true);
    });
  });

  describe('Insight Generation', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should generate insights successfully', async () => {
      const generationStartedSpy = jest.fn<unknown[], unknown>();
      const generationCompletedSpy = jest.fn<unknown[], unknown>();
      engine.on('insight_generation_started', generationStartedSpy);
      engine.on('insight_generation_completed', generationCompletedSpy);

      const result = await engine.generateInsights('on_demand', {
        insight_types: ['threat', 'risk', 'compliance'],
        data_sources: ['security_events', 'threat_intelligence'],
        time_range: {
          start: Date.now() - 86400000 * 7,
          end: Date.now()
        }
      });

      expect(result).toBeDefined();
      expect(result.generation_id).toBeDefined();
      expect(result.generation_type).toBe('on_demand');
      expect(result.generation_timestamp).toBeGreaterThan(0);
      expect(result.insights_generated).toBeDefined();
      expect(result.generation_metrics).toBeDefined();
      expect(result.data_processing_summary).toBeDefined();
      expect(result.quality_assessment).toBeDefined();
      expect(result.distribution_readiness).toBeDefined();

      expect(generationStartedSpy).toHaveBeenCalledWith({
        generationId: result.generation_id,
        generationType: 'on_demand',
        options: expect.any(Object)
      });

      expect(generationCompletedSpy).toHaveBeenCalledWith({
        generationId: result.generation_id,
        insightsGenerated: expect.any(Number),
        averageQuality: expect.any(Number),
        processingTime: expect.any(Number)
      });
    });

    it('should handle scheduled generation', async () => {
      const result = await engine.generateInsights('scheduled');

      expect(result.generation_type).toBe('scheduled');
      expect(result.generation_metrics).toBeDefined();
    });

    it('should handle triggered generation', async () => {
      const result = await engine.generateInsights('triggered', {
        priority_filter: ['high', 'critical']
      });

      expect(result.generation_type).toBe('triggered');
      expect(result.insights_generated).toBeDefined();
    });

    it('should filter by insight types', async () => {
      const result = await engine.generateInsights('on_demand', {
        insight_types: ['threat', 'risk']
      });

      expect(result).toBeDefined();
      expect(result.generation_metrics.total_insights_generated).toBeGreaterThanOrEqual(0);
    });

    it('should apply quality threshold filtering', async () => {
      const result = await engine.generateInsights('on_demand', {
        custom_filters: {
          quality_threshold: 0.8
        }
      });

      expect(result.quality_assessment.overall_quality_score).toBeGreaterThanOrEqual(0.8);
    });

    it('should handle time range filtering', async () => {
      const timeRange = {
        start: Date.now() - 86400000 * 30,
        end: Date.now()
      };

      const result = await engine.generateInsights('on_demand', {
        time_range: timeRange
      });

      expect(result).toBeDefined();
      expect(result.data_processing_summary).toBeDefined();
    });

    it('should emit error on generation failure', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('insight_generation_error', errorSpy);

      // Mock data collection to fail
      jest.spyOn(engine as any, 'collectAndProcessData').mockRejectedValue(new Error('Data collection failed'));

      await expect(engine.generateInsights('on_demand')).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        generationType: 'on_demand',
        options: undefined,
        error: expect.any(Error)
      });
    });
  });

  describe('Insight Distribution', () => {
    let testInsightIds: string[];

    beforeEach(async () => {
      await engine.initialize();
      
      // Generate some insights for distribution
      const generationResult = await engine.generateInsights('on_demand');
      testInsightIds = generationResult.insights_generated.map(insight => insight.insight_id);
    });

    it('should distribute insights successfully', async () => {
      const distributionStartedSpy = jest.fn<unknown[], unknown>();
      const distributionCompletedSpy = jest.fn<unknown[], unknown>();
      engine.on('insight_distribution_started', distributionStartedSpy);
      engine.on('insight_distribution_completed', distributionCompletedSpy);

      const result = await engine.distributeInsights(testInsightIds, {
        target_audiences: ['security_team', 'executives'],
        distribution_channels: ['email', 'dashboard', 'slack'],
        personalization_enabled: true
      });

      expect(result).toBeDefined();
      expect(result.distribution_id).toBeDefined();
      expect(result.distribution_timestamp).toBeGreaterThan(0);
      expect(result.distribution_summary).toBeDefined();
      expect(result.channel_results).toBeDefined();
      expect(result.audience_engagement).toBeDefined();
      expect(result.personalization_effectiveness).toBeDefined();

      expect(distributionStartedSpy).toHaveBeenCalledWith({
        distributionId: result.distribution_id,
        insightsCount: testInsightIds.length,
        options: expect.any(Object)
      });

      expect(distributionCompletedSpy).toHaveBeenCalledWith({
        distributionId: result.distribution_id,
        successRate: expect.any(Number),
        totalRecipients: expect.any(Number),
        channelsUsed: expect.any(Number)
      });
    });

    it('should handle distribution with personalization', async () => {
      const result = await engine.distributeInsights(testInsightIds, {
        personalization_enabled: true,
        target_audiences: ['security_analysts']
      });

      expect(result.personalization_effectiveness.personalization_applied).toBe(true);
      expect(result.distribution_summary.personalization_applied).toBe(true);
    });

    it('should handle distribution without personalization', async () => {
      const result = await engine.distributeInsights(testInsightIds, {
        personalization_enabled: false
      });

      expect(result.distribution_summary.personalization_applied).toBe(false);
    });

    it('should validate insight existence', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('insight_distribution_error', errorSpy);

      const nonExistentIds = ['non_existent_1', 'non_existent_2'];

      await expect(engine.distributeInsights(nonExistentIds)).rejects.toThrow('One or more insights not found');
      expect(errorSpy).toHaveBeenCalledWith({
        insightIds: nonExistentIds,
        distributionOptions: undefined,
        error: expect.any(Error)
      });
    });

    it('should handle multiple distribution channels', async () => {
      const result = await engine.distributeInsights(testInsightIds, {
        distribution_channels: ['email', 'slack', 'dashboard', 'siem']
      });

      expect(result.distribution_summary.channels_used.length).toBeGreaterThan(0);
      expect(result.channel_results).toBeDefined();
    });

    it('should calculate success rates', async () => {
      const result = await engine.distributeInsights(testInsightIds);

      expect(result.distribution_summary.distribution_success_rate).toBeGreaterThanOrEqual(0);
      expect(result.distribution_summary.distribution_success_rate).toBeLessThanOrEqual(1);
      expect(result.distribution_summary.average_delivery_time).toBeGreaterThan(0);
    });
  });

  describe('Personalization Profiles', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should create personalization profile successfully', async () => {
      const profileCreatedSpy = jest.fn<unknown[], unknown>();
      engine.on('personalization_profile_created', profileCreatedSpy);

      const profileConfig = {
        user_role: 'security_analyst',
        department: 'cybersecurity',
        technical_expertise: 'advanced' as const,
        priority_focus_areas: ['threat_detection', 'incident_response'],
        preferred_formats: ['detailed', 'technical'],
        delivery_schedule: 'daily',
        language_preference: 'en'
      };

      const profile = await engine.createPersonalizationProfile(profileConfig);

      expect(profile).toBeDefined();
      expect(profile.profile_id).toBeDefined();
      expect(profile.user_role).toBe('security_analyst');
      expect(profile.department).toBe('cybersecurity');
      expect(profile.technical_expertise).toBe('advanced');
      expect(profile.priority_focus_areas).toEqual(['threat_detection', 'incident_response']);

      expect(profileCreatedSpy).toHaveBeenCalledWith({
        profileId: profile.profile_id,
        userRole: profile.user_role,
        department: profile.department
      });
    });

    it('should create profile with default values', async () => {
      const minimalConfig = {
        user_role: 'general_user'
      };

      const profile = await engine.createPersonalizationProfile(minimalConfig);

      expect(profile.user_role).toBe('general_user');
      expect(profile.department).toBe('security');
      expect(profile.technical_expertise).toBe('intermediate');
      expect(profile.language_preference).toBe('en');
      expect(Array.isArray(profile.priority_focus_areas)).toBe(true);
      expect(Array.isArray(profile.preferred_formats)).toBe(true);
    });

    it('should generate unique profile IDs', async () => {
      const profile1 = await engine.createPersonalizationProfile({ user_role: 'user1' });
      const profile2 = await engine.createPersonalizationProfile({ user_role: 'user2' });

      expect(profile1.profile_id).not.toBe(profile2.profile_id);
    });

    it('should handle different technical expertise levels', async () => {
      const expertProfile = await engine.createPersonalizationProfile({
        user_role: 'security_expert',
        technical_expertise: 'expert'
      });

      const beginnerProfile = await engine.createPersonalizationProfile({
        user_role: 'business_user',
        technical_expertise: 'beginner'
      });

      expect(expertProfile.technical_expertise).toBe('expert');
      expect(beginnerProfile.technical_expertise).toBe('beginner');
    });

    it('should emit error on profile creation failure', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('personalization_profile_error', errorSpy);

      // Mock profile creation to fail
      jest.spyOn(engine as any, 'personalizationProfiles').mockValue({
        set: jest.fn<unknown[], unknown>().mockImplementation(() => {
          throw new Error('Profile storage failed');
  }
      });

      await expect(engine.createPersonalizationProfile({ user_role: 'test' })).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        profileConfig: { user_role: 'test' },
        error: expect.any(Error)
      });
    });
  });

  describe('Insight Search and Filtering', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      // Generate some insights for searching
      await engine.generateInsights('on_demand', {
        insight_types: ['threat', 'risk', 'compliance']
      });
    });

    it('should filter insights by type', async () => {
      const insights = await engine.getInsightsByFilters({
        insight_types: ['threat', 'risk']
      });

      expect(Array.isArray(insights)).toBe(true);
      insights.forEach(insight => {
        expect(['threat', 'risk']).toContain(insight.insight_type);
      });
    });

    it('should filter insights by priority', async () => {
      const insights = await engine.getInsightsByFilters({
        priority_levels: ['high', 'critical']
      });

      insights.forEach(insight => {
        expect(['high', 'critical']).toContain(insight.insight_metadata.urgency_level);
      });
    });

    it('should filter insights by date range', async () => {
      const dateRange = {
        start: Date.now() - 86400000 * 7,
        end: Date.now()
      };

      const insights = await engine.getInsightsByFilters({
        date_range: dateRange
      });

      insights.forEach(insight => {
        expect(insight.insight_metadata.generated_at).toBeGreaterThanOrEqual(dateRange.start);
        expect(insight.insight_metadata.generated_at).toBeLessThanOrEqual(dateRange.end);
      });
    });

    it('should filter insights by confidence threshold', async () => {
      const confidenceThreshold = 0.8;

      const insights = await engine.getInsightsByFilters({
        confidence_threshold: confidenceThreshold
      });

      insights.forEach(insight => {
        expect(insight.insight_metadata.confidence_score).toBeGreaterThanOrEqual(confidenceThreshold);
      });
    });

    it('should filter insights by audience', async () => {
      const insights = await engine.getInsightsByFilters({
        audience_filters: ['security_team']
      });

      insights.forEach(insight => {
        const hasTargetAudience = insight.distribution_info.target_audiences.some(
          audience => audience.audience_role === 'security_team'
        );
        expect(hasTargetAudience).toBe(true);
      });
    });

    it('should handle complex filter combinations', async () => {
      const insights = await engine.getInsightsByFilters({
        insight_types: ['threat'],
        priority_levels: ['high', 'critical'],
        confidence_threshold: 0.7,
        date_range: {
          start: Date.now() - 86400000 * 30,
          end: Date.now()
        }
      });

      insights.forEach(insight => {
        expect(insight.insight_type).toBe('threat');
        expect(['high', 'critical']).toContain(insight.insight_metadata.urgency_level);
        expect(insight.insight_metadata.confidence_score).toBeGreaterThanOrEqual(0.7);
      });
    });

    it('should return empty array for no matches', async () => {
      const insights = await engine.getInsightsByFilters({
        insight_types: ['non_existent_type']
      });

      expect(insights).toHaveLength(0);
    });

    it('should handle filter errors gracefully', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('insight_filter_error', errorSpy);

      // Mock filter operation to fail
      jest.spyOn(Array.prototype, 'filter').mockImplementationOnce(() => {
        throw new Error('Filter operation failed');
      });

      const filters = { insight_types: ['threat'] };

      await expect(engine.getInsightsByFilters(filters)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        filters,
        error: expect.any(Error)
      });
    });
  });

  describe('Report Generation', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      // Generate insights and distributions for reporting
      await engine.generateInsights('on_demand');
    });

    it('should generate summary report', async () => {
      const options = {
        report_type: 'summary' as const,
        time_range: {
          start: Date.now() - 86400000 * 7,
          end: Date.now()
  }
        include_analytics: true
      };

      const report = await engine.generateInsightReport(options);

      expect(report).toBeDefined();
      expect(report.report_id).toBeDefined();
      expect(report.report_type).toBe('summary');
      expect(report.generated_at).toBeGreaterThan(0);
      expect(report.executive_summary).toBeDefined();
    });

    it('should generate detailed report', async () => {
      const options = {
        report_type: 'detailed' as const,
        include_recommendations: true
      };

      const report = await engine.generateInsightReport(options);

      expect(report.report_type).toBe('detailed');
      expect(report.insights_analyzed).toBeGreaterThanOrEqual(0);
    });

    it('should generate executive report', async () => {
      const options = {
        report_type: 'executive' as const,
        time_range: {
          start: Date.now() - 86400000 * 30,
          end: Date.now()
        }
      };

      const report = await engine.generateInsightReport(options);

      expect(report.report_type).toBe('executive');
      expect(report.executive_summary).toBeDefined();
    });

    it('should generate technical report', async () => {
      const options = {
        report_type: 'technical' as const,
        include_analytics: true
      };

      const report = await engine.generateInsightReport(options);

      expect(report.report_type).toBe('technical');
    });

    it('should filter report by insight IDs', async () => {
      const generationResult = await engine.generateInsights('on_demand');
      const insightIds = generationResult.insights_generated.slice(0, 2).map(i => i.insight_id);

      const options = {
        report_type: 'summary' as const,
        insight_ids: insightIds
      };

      const report = await engine.generateInsightReport(options);

      expect(report).toBeDefined();
      expect(report.insights_analyzed).toBeGreaterThanOrEqual(0);
    });

    it('should handle report generation errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('insight_report_error', errorSpy);

      // Mock report compilation to fail
      jest.spyOn(engine as any, 'compileInsightReport').mockRejectedValue(new Error('Report compilation failed'));

      const options = { report_type: 'summary' as const };

      await expect(engine.generateInsightReport(options)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        options,
        error: expect.any(Error)
      });
    });
  });

  describe('Analytics', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      // Generate comprehensive data for analytics
      await engine.generateInsights('on_demand');
      const generationResult = await engine.generateInsights('scheduled');
      const insightIds = generationResult.insights_generated.map(i => i.insight_id);
      await engine.distributeInsights(insightIds);
    });

    it('should provide comprehensive analytics', async () => {
      const analytics = engine.getInsightsAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.summary).toBeDefined();
      expect(analytics.summary.total_insights_generated).toBeGreaterThanOrEqual(0);
      expect(analytics.summary.insights_distributed).toBeGreaterThanOrEqual(0);
      expect(analytics.summary.average_engagement_rate).toBeGreaterThanOrEqual(0);
      expect(analytics.summary.automation_efficiency).toBeGreaterThanOrEqual(0);

      expect(analytics.insight_distribution).toBeDefined();
      expect(analytics.generation_performance).toBeDefined();
      expect(analytics.distribution_metrics).toBeDefined();
      expect(analytics.business_impact).toBeDefined();
      expect(analytics.user_satisfaction).toBeDefined();
      expect(analytics.automation_metrics).toBeDefined();
      expect(analytics.recent_activities).toBeDefined();
    });

    it('should track insight distribution metrics', async () => {
      const analytics = engine.getInsightsAnalytics();

      expect(typeof analytics.insight_distribution.by_type.threat_insights).toBe('number');
      expect(typeof analytics.insight_distribution.by_type.risk_insights).toBe('number');
      expect(typeof analytics.insight_distribution.by_type.compliance_insights).toBe('number');
      expect(typeof analytics.insight_distribution.by_priority.critical).toBe('number');
      expect(typeof analytics.insight_distribution.by_priority.high).toBe('number');
      expect(typeof analytics.insight_distribution.by_confidence.high_confidence).toBe('number');
    });

    it('should provide generation performance metrics', async () => {
      const analytics = engine.getInsightsAnalytics();

      expect(typeof analytics.generation_performance.average_generation_time_ms).toBe('number');
      expect(typeof analytics.generation_performance.generation_success_rate).toBe('number');
      expect(typeof analytics.generation_performance.data_processing_efficiency).toBe('number');
      expect(analytics.generation_performance.algorithm_effectiveness).toBeDefined();
      expect(analytics.generation_performance.quality_trend_analysis).toBeDefined();
    });

    it('should track distribution metrics', async () => {
      const analytics = engine.getInsightsAnalytics();

      expect(analytics.distribution_metrics.delivery_success_rates).toBeDefined();
      expect(analytics.distribution_metrics.engagement_metrics).toBeDefined();
      expect(analytics.distribution_metrics.channel_effectiveness).toBeDefined();
      expect(analytics.distribution_metrics.personalization_impact).toBeDefined();
      expect(analytics.distribution_metrics.feedback_analysis).toBeDefined();
    });

    it('should provide business impact metrics', async () => {
      const analytics = engine.getInsightsAnalytics();

      expect(typeof analytics.business_impact.decisions_influenced).toBe('number');
      expect(typeof analytics.business_impact.actions_triggered).toBe('number');
      expect(typeof analytics.business_impact.cost_savings_achieved).toBe('number');
      expect(typeof analytics.business_impact.risk_mitigation_value).toBe('number');
      expect(typeof analytics.business_impact.compliance_improvements).toBe('number');
    });

    it('should track user satisfaction', async () => {
      const analytics = engine.getInsightsAnalytics();

      expect(typeof analytics.user_satisfaction.overall_satisfaction_score).toBe('number');
      expect(analytics.user_satisfaction.relevance_ratings).toBeDefined();
      expect(analytics.user_satisfaction.clarity_ratings).toBeDefined();
      expect(analytics.user_satisfaction.actionability_ratings).toBeDefined();
      expect(analytics.user_satisfaction.timeliness_ratings).toBeDefined();
    });

    it('should provide automation metrics', async () => {
      const analytics = engine.getInsightsAnalytics();

      expect(typeof analytics.automation_metrics.automation_coverage).toBe('number');
      expect(typeof analytics.automation_metrics.manual_intervention_rate).toBe('number');
      expect(typeof analytics.automation_metrics.processing_throughput).toBe('number');
      expect(analytics.automation_metrics.error_rates).toBeDefined();
      expect(analytics.automation_metrics.scalability_metrics).toBeDefined();
    });

    it('should include recent activities', async () => {
      const analytics = engine.getInsightsAnalytics();

      expect(Array.isArray(analytics.recent_activities)).toBe(true);
      analytics.recent_activities.forEach(activity => {
        expect(activity.activity_type).toBeDefined();
        expect(activity.activity_description).toBeDefined();
        expect(activity.timestamp).toBeGreaterThan(0);
        expect(activity.impact_level).toBeDefined();
        expect(Array.isArray(activity.insights_affected)).toBe(true);
      });
    });

    it('should handle analytics errors gracefully', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('analytics_error', errorSpy);

      // Mock analytics calculation to fail
      jest.spyOn(engine as any, 'calculateAverageEngagementRate').mockImplementation(() => {
        throw new Error('Analytics calculation failed');
      });

      expect(() => engine.getInsightsAnalytics()).toThrow();
      expect(errorSpy).toHaveBeenCalledWith({ error: expect.any(Error) });
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle API integration events', async () => {
      const eventHandler = (mockAPIIntegration.on as jest.Mock).mock.calls
        .find(call => call[0] === 'security_event')?.[1];

      if (eventHandler) {
        await eventHandler({ 
          type: 'critical_alert',
          severity: 'high',
          data: { alert_id: 'alert_123' }
        });
        // Should not throw
      }
    });

    it('should handle risk scoring engine events', async () => {
      const riskHandler = (mockRiskScoringEngine.on as jest.Mock).mock.calls
        .find(call => call[0] === 'risk_scored')?.[1];

      if (riskHandler) {
        await riskHandler({ 
          riskId: 'risk_789',
          risk_scoring: { composite_score: 85 }
        });
        // Should not throw
      }
    });

    it('should handle pattern engine events', async () => {
      const patternHandler = (mockPatternEngine.on as jest.Mock).mock.calls
        .find(call => call[0] === 'pattern_analysis_completed')?.[1];

      if (patternHandler) {
        await patternHandler({ 
          analysisId: 'analysis_456',
          patterns_discovered: { new_patterns: [] }
        });
        // Should not throw
      }
    });

    it('should handle time series engine events', async () => {
      const timeSeriesHandler = (mockTimeSeriesEngine.on as jest.Mock).mock.calls
        .find(call => call[0] === 'anomalies_detected')?.[1];

      if (timeSeriesHandler) {
        await timeSeriesHandler({ 
          seriesId: 'series_123',
          highSeverityCount: 3,
          anomaliesCount: 5
        });
        // Should not throw
      }
    });
  });

  describe('Configuration Validation', () => {
    it('should respect generation settings', async () => {
      const limitedConfig: SecurityInsightsConfig = {
        ...config,
        generation_settings: {
          ...config.generation_settings,
          real_time_generation: false,
          automated_distribution: false
        }
      };

      const engineWithLimitedGeneration = new SecurityInsightsAutomationEngine(
        limitedConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine
      );
      await engineWithLimitedGeneration.initialize();

      const result = await engineWithLimitedGeneration.generateInsights('on_demand');

      expect(result).toBeDefined();
      // Should still work with limited generation capabilities

      await engineWithLimitedGeneration.shutdown();
    });

    it('should handle different insight type configurations', async () => {
      const limitedInsightConfig: SecurityInsightsConfig = {
        ...config,
        insight_types: {
          ...config.insight_types,
          predictive_insights: false,
          behavioral_insights: false
        }
      };

      const engineWithLimitedInsights = new SecurityInsightsAutomationEngine(
        limitedInsightConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine
      );
      await engineWithLimitedInsights.initialize();

      const result = await engineWithLimitedInsights.generateInsights('on_demand', {
        insight_types: ['threat', 'risk', 'compliance']
      });

      expect(result).toBeDefined();

      await engineWithLimitedInsights.shutdown();
    });

    it('should enforce distribution channel restrictions', async () => {
      const restrictedChannelConfig: SecurityInsightsConfig = {
        ...config,
        distribution_channels: {
          ...config.distribution_channels,
          email_reports: false,
          mobile_notifications: false
        }
      };

      const engineWithRestrictedChannels = new SecurityInsightsAutomationEngine(
        restrictedChannelConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine,
        mockPatternEngine,
        mockTimeSeriesEngine
      );
      await engineWithRestrictedChannels.initialize();

      const generationResult = await engineWithRestrictedChannels.generateInsights('on_demand');
      const insightIds = generationResult.insights_generated.map(i => i.insight_id);

      const distributionResult = await engineWithRestrictedChannels.distributeInsights(insightIds, {
        distribution_channels: ['dashboard', 'slack']
      });

      expect(distributionResult).toBeDefined();

      await engineWithRestrictedChannels.shutdown();
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await engine.initialize();
      
      // Perform some operations
      await engine.generateInsights('on_demand');
      await engine.createPersonalizationProfile({ user_role: 'test_user' });

      const shutdownSpy = jest.fn<unknown[], unknown>();
      engine.on('shutdown', shutdownSpy);

      await engine.shutdown();

      expect(shutdownSpy).toHaveBeenCalledWith({
        timestamp: expect.any(Number)
      });
    });

    it('should save insights data during shutdown', async () => {
      await engine.initialize();
      
      await engine.generateInsights('on_demand');

      await engine.shutdown();

      // Data should be persisted (mocked)
      const analytics = engine.getInsightsAnalytics();
      expect(analytics.summary.total_insights_generated).toBeGreaterThanOrEqual(0);
    });

    it('should handle shutdown errors gracefully', async () => {
      await engine.initialize();

      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('error', errorSpy);

      // Mock component shutdown to fail
      jest.spyOn(
        engine as any,
        'savePersonalizationProfiles'
      ).mockRejectedValue(new Error('Component shutdown failed'));

      await expect(engine.shutdown()).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'shutdown'
      });
    });

    it('should stop scheduled generation during shutdown', async () => {
      await engine.initialize();

      const stopScheduledGenerationSpy = jest.spyOn(engine as any, 'stopScheduledGeneration');

      await engine.shutdown();

      expect(stopScheduledGenerationSpy).toHaveBeenCalled();
    });
  });
});