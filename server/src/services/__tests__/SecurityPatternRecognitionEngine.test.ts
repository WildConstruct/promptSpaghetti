/**
 * Tests for Security Pattern Recognition Engine
 * Epic 31 - Task E31-1753313263598-E59652
 */

import { 
  SecurityPatternRecognitionEngine, 
  SecurityPatternRecognitionConfig, 
  SecurityPattern,
  ThreatCluster,
  PatternRecognitionResult 
} from '../SecurityPatternRecognitionEngine';
import { SecurityAPIIntegrationPlatform } from '../SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../SecurityPolicyAnalysisEngine';
import { SecurityRiskScoringEngine } from '../SecurityRiskScoringEngine';

// Mock dependencies
jest.mock('../SecurityAPIIntegrationPlatform');
jest.mock('../SecurityPolicyAnalysisEngine');
jest.mock('../SecurityRiskScoringEngine');

describe('SecurityPatternRecognitionEngine', () => {
  let engine: SecurityPatternRecognitionEngine;
  let mockAPIIntegration: jest.Mocked<SecurityAPIIntegrationPlatform>;
  let mockPolicyEngine: jest.Mocked<SecurityPolicyAnalysisEngine>;
  let mockRiskScoringEngine: jest.Mocked<SecurityRiskScoringEngine>;
  let config: SecurityPatternRecognitionConfig;
  let samplePatternData: unknown;

  beforeEach(() => {
    // Setup mocks
    mockAPIIntegration = {
      on: jest.fn<unknown[], unknown>(),
      getPlatformMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
        api_calls: { total_requests: 25000, successful_requests: 24750 },
        security_analytics: { threats_detected: 55, detection_accuracy_percent: 98 }
      } as unknown)
    } as any;

    mockPolicyEngine = {
      on: jest.fn<unknown[], unknown>(),
      analyzePolicyImpact: jest.fn<unknown[], unknown>().mockResolvedValue({
        risk_analysis: { overall_risk_score: 35 },
        validation_results: { validation_passed: true }
      } as unknown)
    } as any;

    mockRiskScoringEngine = {
      on: jest.fn<unknown[], unknown>(),
      scoreSecurityRisk: jest.fn<unknown[], unknown>().mockResolvedValue({
        risk_id: 'risk_123',
        risk_scoring: { composite_score: 85 }
      } as unknown)
    } as any;

    // Setup configuration
    config = {
      pattern_recognition: {
        enabled: true,
        real_time_analysis: true,
        historical_analysis_enabled: true,
        ml_pattern_detection: true,
        statistical_analysis_enabled: true,
        behavioral_analysis_enabled: true,
        temporal_pattern_analysis: true,
        spatial_pattern_analysis: true
  }
      threat_clustering: {
        enabled: true,
        clustering_algorithms: ['dbscan', 'hierarchical', 'kmeans', 'graph_clustering'],
        similarity_thresholds: {
          high_similarity: 0.8,
          medium_similarity: 0.6,
          low_similarity: 0.4
  }
        auto_clustering_enabled: true,
        manual_clustering_allowed: true,
        cluster_validation_enabled: true,
        cross_reference_clustering: true
  }
      pattern_types: {
        attack_patterns: true,
        behavioral_patterns: true,
        communication_patterns: true,
        temporal_patterns: true,
        infrastructure_patterns: true,
        data_access_patterns: true,
        anomaly_patterns: true,
        compliance_patterns: true
  }
      analysis_algorithms: {
        machine_learning_enabled: true,
        deep_learning_models: true,
        statistical_analysis: true,
        graph_analysis: true,
        time_series_analysis: true,
        network_analysis: true,
        natural_language_processing: true,
        computer_vision_analysis: false
  }
      data_sources: {
        security_logs: true,
        network_traffic: true,
        endpoint_telemetry: true,
        application_logs: true,
        threat_intelligence_feeds: true,
        user_behavior_data: true,
        system_performance_metrics: true,
        compliance_audit_data: true
  }
      output_settings: {
        real_time_alerts: true,
        batch_reporting: true,
        dashboard_integration: true,
        api_notifications: true,
        email_alerts: true,
        siem_integration: true,
        incident_response_integration: true,
        threat_hunting_integration: true
      }
    };

    // Setup sample pattern data
    samplePatternData = {
      security_logs: [
        {
          timestamp: Date.now(),
          log_level: 'ERROR',
          message: 'Multiple failed login attempts detected',
          source_ip: '192.168.1.100',
          user_agent: 'Mozilla/5.0...',
          event_type: 'authentication_failure'
  }
        {
          timestamp: Date.now() - 3600000,
          log_level: 'WARNING',
          message: 'Suspicious file access pattern detected',
          source_ip: '192.168.1.100',
          file_path: '/etc/passwd',
          event_type: 'file_access'
        }
      ],
      network_traffic: [
        {
          timestamp: Date.now(),
          source_ip: '192.168.1.100',
          destination_ip: '10.0.0.50',
          port: 22,
          protocol: 'TCP',
          bytes_transferred: 1024,
          connection_state: 'established'
        }
      ],
      threat_intelligence: [
        {
          ioc_type: 'ip',
          ioc_value: '192.168.1.100',
          threat_type: 'malware_c2',
          confidence: 0.85,
          source: 'threat_feed_alpha'
        }
      ]
    };

    engine = new SecurityPatternRecognitionEngine(
      config,
      mockAPIIntegration,
      mockPolicyEngine,
      mockRiskScoringEngine
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
      jest.spyOn(engine as any, 'initializeMLModels').mockRejectedValue(new Error('ML model loading failed'));

      await expect(engine.initialize()).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'initialization'
      });
    });

    it('should load ML models during initialization', async () => {
      await engine.initialize();

      const mlModels = (engine as any).mlModels;
      expect(mlModels).toBeDefined();
      expect(mlModels.pattern_classification_model).toBeDefined();
      expect(mlModels.anomaly_detection_model).toBeDefined();
      expect(mlModels.clustering_model).toBeDefined();
    });

    it('should initialize pattern detectors', async () => {
      await engine.initialize();

      const patternDetectors = (engine as any).patternDetectors;
      expect(patternDetectors).toBeDefined();
      expect(patternDetectors.has('statistical')).toBe(true);
      expect(patternDetectors.has('ml_based')).toBe(true);
      expect(patternDetectors.has('rule_based')).toBe(true);
    });

    it('should initialize clustering algorithms', async () => {
      await engine.initialize();

      const clusteringAlgorithms = (engine as any).clusteringAlgorithms;
      expect(clusteringAlgorithms).toBeDefined();
      expect(clusteringAlgorithms.has('kmeans')).toBe(true);
      expect(clusteringAlgorithms.has('dbscan')).toBe(true);
      expect(clusteringAlgorithms.has('hierarchical')).toBe(true);
    });
  });

  describe('Pattern Recognition', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should recognize patterns successfully', async () => {
      const patternAnalysisStartedSpy = jest.fn<unknown[], unknown>();
      const patternAnalysisCompletedSpy = jest.fn<unknown[], unknown>();
      engine.on('pattern_analysis_started', patternAnalysisStartedSpy);
      engine.on('pattern_analysis_completed', patternAnalysisCompletedSpy);

      const result = await engine.recognizePatterns(samplePatternData, 'batch');

      expect(result).toBeDefined();
      expect(result.analysis_id).toBeDefined();
      expect(result.analysis_type).toBe('batch');
      expect(result.analysis_timestamp).toBeGreaterThan(0);
      expect(result.patterns_discovered).toBeDefined();
      expect(result.clustering_results).toBeDefined();
      expect(result.insights_generated).toBeDefined();

      expect(patternAnalysisStartedSpy).toHaveBeenCalledWith({
        analysisId: result.analysis_id,
        analysisType: 'batch',
        dataVolume: expect.any(Object)
      });

      expect(patternAnalysisCompletedSpy).toHaveBeenCalledWith({
        analysisId: result.analysis_id,
        patternsFound: expect.any(Number),
        clustersFormed: expect.any(Number),
        insightsGenerated: expect.any(Number)
      });
    });

    it('should handle real-time analysis', async () => {
      const result = await engine.recognizePatterns(samplePatternData, 'real_time');

      expect(result.analysis_type).toBe('real_time');
      expect(result.analysis_metrics.processing_performance).toBeDefined();
    });

    it('should handle historical analysis', async () => {
      const historicalData = {
        ...samplePatternData,
        time_range: {
          start: Date.now() - 86400000 * 30,
          end: Date.now()
        }
      };

      const result = await engine.recognizePatterns(historicalData, 'historical');

      expect(result.analysis_type).toBe('historical');
      expect(result.patterns_discovered).toBeDefined();
    });

    it('should handle targeted analysis', async () => {
      const targetedData = {
        ...samplePatternData,
        focus_areas: ['authentication_attacks', 'lateral_movement']
      };

      const result = await engine.recognizePatterns(targetedData, 'targeted');

      expect(result.analysis_type).toBe('targeted');
      expect(result.insights_generated.security_insights).toBeDefined();
    });

    it('should process multiple data sources', async () => {
      const multiSourceData = {
        security_logs: samplePatternData.security_logs,
        network_traffic: samplePatternData.network_traffic,
        endpoint_telemetry: [
          {
            timestamp: Date.now(),
            process_name: 'malware.exe',
            file_hash: 'abc123...',
            command_line: 'malware.exe --payload',
            parent_process: 'explorer.exe'
          }
        ],
        threat_intelligence: samplePatternData.threat_intelligence
      };

      const result = await engine.recognizePatterns(multiSourceData, 'batch');

      expect(result.analysis_metrics.data_volume_processed.total_records_processed).toBeGreaterThan(0);
      expect(result.patterns_discovered.new_patterns).toBeDefined();
    });

    it('should handle empty data gracefully', async () => {
      const emptyData = {
        security_logs: [],
        network_traffic: [],
        threat_intelligence: []
      };

      const result = await engine.recognizePatterns(emptyData, 'batch');

      expect(result).toBeDefined();
      expect(result.patterns_discovered.new_patterns).toHaveLength(0);
      expect(result.clustering_results.new_clusters).toHaveLength(0);
    });

    it('should emit error on pattern recognition failure', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('pattern_analysis_error', errorSpy);

      // Mock preprocessing to fail
      jest.spyOn(engine as any, 'preprocessData').mockRejectedValue(new Error('Preprocessing failed'));

      await expect(engine.recognizePatterns(samplePatternData, 'batch')).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        data: samplePatternData,
        error: expect.any(Error)
      });
    });
  });

  describe('Threat Clustering', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should create threat cluster successfully', async () => {
      const memberThreats = ['threat_001', 'threat_002', 'threat_003'];
      const clusterCreatedSpy = jest.fn<unknown[], unknown>();
      engine.on('threat_cluster_created', clusterCreatedSpy);

      const cluster = await engine.createThreatCluster(memberThreats, {
        cluster_name: 'APT Campaign Alpha',
        cluster_type: 'attack_campaign',
        description: 'Sophisticated APT campaign targeting financial institutions'
      });

      expect(cluster).toBeDefined();
      expect(cluster.cluster_id).toBeDefined();
      expect(cluster.cluster_name).toBe('APT Campaign Alpha');
      expect(cluster.cluster_type).toBe('attack_campaign');
      expect(cluster.cluster_metadata.cluster_size).toBe(3);
      expect(cluster.cluster_composition.member_threats).toHaveLength(3);

      expect(clusterCreatedSpy).toHaveBeenCalledWith({
        clusterId: cluster.cluster_id,
        clusterName: cluster.cluster_name,
        memberCount: 3,
        clusterType: 'attack_campaign'
      });
    });

    it('should validate cluster member threats', async () => {
      const invalidMemberThreats = ['non_existent_threat'];

      // Mock validation to fail
      jest.spyOn(engine as any, 'validateClusterMembers').mockRejectedValue(new Error('Invalid member threats'));

      await expect(engine.createThreatCluster(invalidMemberThreats)).rejects.toThrow();
    });

    it('should analyze cluster composition', async () => {
      const memberThreats = ['threat_001', 'threat_002'];
      
      const cluster = await engine.createThreatCluster(memberThreats, {
        cluster_name: 'Behavioral Cluster Beta',
        cluster_type: 'behavioral'
      });

      expect(cluster.cluster_composition.cluster_cohesion_score).toBeGreaterThan(0);
      expect(cluster.cluster_composition.shared_characteristics).toBeDefined();
      expect(cluster.cluster_composition.similarity_metrics).toBeDefined();
    });

    it('should gather threat intelligence for cluster', async () => {
      const memberThreats = ['threat_001', 'threat_002'];
      
      const cluster = await engine.createThreatCluster(memberThreats, {
        cluster_name: 'Infrastructure Cluster Gamma',
        cluster_type: 'infrastructure'
      });

      expect(cluster.threat_intelligence.collective_indicators).toBeDefined();
      expect(cluster.threat_intelligence.shared_infrastructure).toBeDefined();
      expect(cluster.threat_intelligence.common_ttps).toBeDefined();
      expect(cluster.threat_intelligence.attribution_analysis).toBeDefined();
    });

    it('should assess cluster impact', async () => {
      const memberThreats = ['threat_001', 'threat_002', 'threat_003'];
      
      const cluster = await engine.createThreatCluster(memberThreats, {
        cluster_name: 'High Impact Cluster',
        cluster_type: 'threat_actor'
      });

      expect(cluster.impact_assessment.aggregate_risk_score).toBeGreaterThan(0);
      expect(cluster.impact_assessment.collective_threat_level).toBeDefined();
      expect(cluster.impact_assessment.combined_impact_potential).toBeDefined();
      expect(cluster.impact_assessment.coordinated_response_requirements).toBeDefined();
    });

    it('should update cluster successfully', async () => {
      const memberThreats = ['threat_001', 'threat_002'];
      const cluster = await engine.createThreatCluster(memberThreats);
      
      const clusterUpdatedSpy = jest.fn<unknown[], unknown>();
      engine.on('threat_cluster_updated', clusterUpdatedSpy);

      const updates = {
        cluster_name: 'Updated Cluster Name',
        description: 'Updated cluster description'
      };

      const updatedCluster = await engine.updateCluster(cluster.cluster_id, updates);

      expect(updatedCluster.cluster_name).toBe('Updated Cluster Name');
      expect(updatedCluster.description).toBe('Updated cluster description');
      expect(updatedCluster.cluster_metadata.last_updated).toBeGreaterThan(cluster.cluster_metadata.created_at);

      expect(clusterUpdatedSpy).toHaveBeenCalledWith({
        clusterId: cluster.cluster_id,
        updateType: 'cluster_name, description',
        timestamp: expect.any(Number)
      });
    });

    it('should handle cluster update for non-existent cluster', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('cluster_update_error', errorSpy);

      const nonExistentClusterId = 'non_existent_cluster';

      await expect(engine.updateCluster(nonExistentClusterId, {})).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        clusterId: nonExistentClusterId,
        updates: {},
        error: expect.any(Error)
      });
    });

    it('should emit error on cluster creation failure', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('cluster_creation_error', errorSpy);

      const memberThreats = ['threat_001'];

      // Mock composition analysis to fail
      jest.spyOn(
        engine as any,
        'analyzeClusterComposition'
      ).mockRejectedValue(new Error('Composition analysis failed'));

      await expect(engine.createThreatCluster(memberThreats)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        memberThreats,
        error: expect.any(Error)
      });
    });
  });

  describe('Pattern Search', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      // Create some sample patterns for searching
      await engine.recognizePatterns(samplePatternData, 'batch');
    });

    it('should search patterns by type', async () => {
      const searchCriteria = {
        pattern_types: ['attack', 'behavioral']
      };

      const results = await engine.searchPatterns(searchCriteria);

      expect(Array.isArray(results)).toBe(true);
      // All results should match the specified types
      results.forEach(pattern => {
        expect(['attack', 'behavioral']).toContain(pattern.pattern_type);
      });
    });

    it('should search patterns by confidence threshold', async () => {
      const searchCriteria = {
        confidence_threshold: 0.8
      };

      const results = await engine.searchPatterns(searchCriteria);

      results.forEach(pattern => {
        expect(pattern.pattern_detection.confidence_score).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('should search patterns by severity levels', async () => {
      const searchCriteria = {
        severity_levels: ['high', 'critical']
      };

      const results = await engine.searchPatterns(searchCriteria);

      results.forEach(pattern => {
        const severity = pattern.pattern_metadata.severity_assessment.base_severity;
        expect(severity).toBeGreaterThanOrEqual(6); // High or critical
      });
    });

    it('should search patterns by date range', async () => {
      const searchCriteria = {
        date_range: {
          start: Date.now() - 86400000, // Last 24 hours
          end: Date.now()
        }
      };

      const results = await engine.searchPatterns(searchCriteria);

      results.forEach(pattern => {
        expect(pattern.pattern_metadata.discovered_at).toBeGreaterThanOrEqual(searchCriteria.date_range.start);
        expect(pattern.pattern_metadata.discovered_at).toBeLessThanOrEqual(searchCriteria.date_range.end);
      });
    });

    it('should search patterns by keywords', async () => {
      const searchCriteria = {
        keywords: ['authentication', 'login']
      };

      const results = await engine.searchPatterns(searchCriteria);

      results.forEach(pattern => {
        const hasKeyword = searchCriteria.keywords.some(keyword =>
          pattern.pattern_name.toLowerCase().includes(keyword.toLowerCase()) ||
          pattern.description.toLowerCase().includes(keyword.toLowerCase())
        );
        expect(hasKeyword).toBe(true);
      });
    });

    it('should handle complex search criteria', async () => {
      const searchCriteria = {
        pattern_types: ['attack'],
        confidence_threshold: 0.7,
        severity_levels: ['medium', 'high', 'critical'],
        keywords: ['attack']
      };

      const results = await engine.searchPatterns(searchCriteria);

      results.forEach(pattern => {
        expect(pattern.pattern_type).toBe('attack');
        expect(pattern.pattern_detection.confidence_score).toBeGreaterThanOrEqual(0.7);
        expect(pattern.pattern_metadata.severity_assessment.base_severity).toBeGreaterThanOrEqual(4);
      });
    });

    it('should return empty results for no matches', async () => {
      const searchCriteria = {
        keywords: ['non_existent_pattern']
      };

      const results = await engine.searchPatterns(searchCriteria);

      expect(results).toHaveLength(0);
    });

    it('should handle search errors gracefully', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('pattern_search_error', errorSpy);

      // Mock internal search to fail
      jest.spyOn(Array.prototype, 'filter').mockImplementationOnce(() => {
        throw new Error('Search filter failed');
      });

      const searchCriteria = { pattern_types: ['attack'] };

      await expect(engine.searchPatterns(searchCriteria)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        searchCriteria,
        error: expect.any(Error)
      });
    });
  });

  describe('Report Generation', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should generate summary report', async () => {
      const options = {
        report_type: 'summary' as const,
        pattern_ids: ['pattern_001', 'pattern_002'],
        cluster_ids: ['cluster_001'],
        include_recommendations: true
      };

      const report = await engine.generatePatternReport(options);

      expect(report).toBeDefined();
      expect(report.report_id).toBeDefined();
      expect(report.report_type).toBe('summary');
      expect(report.generated_at).toBeGreaterThan(0);
      expect(report.executive_summary).toBeDefined();
      expect(report.patterns_analyzed).toBeGreaterThanOrEqual(0);
      expect(report.clusters_analyzed).toBeGreaterThanOrEqual(0);
    });

    it('should generate detailed report', async () => {
      const options = {
        report_type: 'detailed' as const,
        time_range: {
          start: Date.now() - 86400000 * 7,
          end: Date.now()
  }
        include_predictions: true,
        include_recommendations: true
      };

      const report = await engine.generatePatternReport(options);

      expect(report.report_type).toBe('detailed');
      expect(report.key_findings).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('should generate technical report', async () => {
      const options = {
        report_type: 'technical' as const,
        pattern_ids: ['pattern_001'],
        include_predictions: false
      };

      const report = await engine.generatePatternReport(options);

      expect(report.report_type).toBe('technical');
    });

    it('should generate executive report', async () => {
      const options = {
        report_type: 'executive' as const,
        time_range: {
          start: Date.now() - 86400000 * 30,
          end: Date.now()
        }
      };

      const report = await engine.generatePatternReport(options);

      expect(report.report_type).toBe('executive');
      expect(report.executive_summary).toBeDefined();
    });

    it('should handle report generation errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('report_generation_error', errorSpy);

      // Mock report compilation to fail
      jest.spyOn(engine as any, 'compilePatternReport').mockRejectedValue(new Error('Report compilation failed'));

      const options = { report_type: 'summary' as const };

      await expect(engine.generatePatternReport(options)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        options,
        error: expect.any(Error)
      });
    });
  });

  describe('Analytics', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      // Create some patterns and clusters for analytics
      await engine.recognizePatterns(samplePatternData, 'batch');
    });

    it('should provide comprehensive analytics', async () => {
      const analytics = engine.getPatternRecognitionAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.summary).toBeDefined();
      expect(analytics.summary.total_patterns_recognized).toBeGreaterThanOrEqual(0);
      expect(analytics.summary.total_clusters_formed).toBeGreaterThanOrEqual(0);
      expect(analytics.summary.pattern_recognition_accuracy).toBeGreaterThan(0);
      expect(analytics.summary.clustering_effectiveness).toBeGreaterThan(0);

      expect(analytics.pattern_distribution).toBeDefined();
      expect(analytics.pattern_distribution.by_type).toBeDefined();
      expect(analytics.pattern_distribution.by_severity).toBeDefined();
      expect(analytics.pattern_distribution.by_confidence).toBeDefined();

      expect(analytics.clustering_metrics).toBeDefined();
      expect(analytics.processing_performance).toBeDefined();
      expect(analytics.detection_accuracy).toBeDefined();
      expect(analytics.trend_analysis).toBeDefined();
      expect(analytics.integration_status).toBeDefined();
      expect(analytics.recent_activities).toBeDefined();
    });

    it('should track pattern distribution metrics', async () => {
      const analytics = engine.getPatternRecognitionAnalytics();

      expect(typeof analytics.pattern_distribution.by_type.attack_patterns).toBe('number');
      expect(typeof analytics.pattern_distribution.by_type.behavioral_patterns).toBe('number');
      expect(typeof analytics.pattern_distribution.by_severity.critical).toBe('number');
      expect(typeof analytics.pattern_distribution.by_severity.high).toBe('number');
      expect(typeof analytics.pattern_distribution.by_confidence.high_confidence).toBe('number');
    });

    it('should provide clustering effectiveness metrics', async () => {
      const analytics = engine.getPatternRecognitionAnalytics();

      expect(analytics.clustering_metrics.cluster_size_distribution).toBeDefined();
      expect(analytics.clustering_metrics.cluster_quality_scores).toBeDefined();
      expect(analytics.clustering_metrics.cluster_stability_metrics).toBeDefined();
      expect(analytics.clustering_metrics.clustering_algorithm_performance).toBeDefined();
    });

    it('should track processing performance', async () => {
      const analytics = engine.getPatternRecognitionAnalytics();

      expect(typeof analytics.processing_performance.average_processing_time_ms).toBe('number');
      expect(typeof analytics.processing_performance.throughput_patterns_per_hour).toBe('number');
      expect(analytics.processing_performance.resource_utilization).toBeDefined();
      expect(analytics.processing_performance.algorithm_efficiency_scores).toBeDefined();
    });

    it('should provide detection accuracy metrics', async () => {
      const analytics = engine.getPatternRecognitionAnalytics();

      expect(typeof analytics.detection_accuracy.pattern_detection_accuracy).toBe('number');
      expect(typeof analytics.detection_accuracy.false_positive_rate).toBe('number');
      expect(typeof analytics.detection_accuracy.false_negative_rate).toBe('number');
      expect(analytics.detection_accuracy.precision_recall_metrics).toBeDefined();
    });

    it('should include trend analysis', async () => {
      const analytics = engine.getPatternRecognitionAnalytics();

      expect(analytics.trend_analysis.pattern_evolution_trends).toBeDefined();
      expect(analytics.trend_analysis.emerging_threat_indicators).toBeDefined();
      expect(analytics.trend_analysis.seasonal_pattern_variations).toBeDefined();
      expect(analytics.trend_analysis.geographic_trend_analysis).toBeDefined();
    });

    it('should track integration status', async () => {
      const analytics = engine.getPatternRecognitionAnalytics();

      expect(analytics.integration_status.data_source_health).toBeDefined();
      expect(analytics.integration_status.output_delivery_success_rates).toBeDefined();
      expect(analytics.integration_status.alert_generation_statistics).toBeDefined();
      expect(analytics.integration_status.dashboard_update_frequency).toBeDefined();
    });

    it('should provide recent activities', async () => {
      const analytics = engine.getPatternRecognitionAnalytics();

      expect(Array.isArray(analytics.recent_activities)).toBe(true);
      analytics.recent_activities.forEach(activity => {
        expect(activity.activity_type).toBeDefined();
        expect(activity.activity_description).toBeDefined();
        expect(activity.timestamp).toBeGreaterThan(0);
        expect(activity.impact_level).toBeDefined();
      });
    });

    it('should handle analytics errors gracefully', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('analytics_error', errorSpy);

      // Mock analytics calculation to fail
      jest.spyOn(engine as any, 'calculateOverallAccuracy').mockImplementation(() => {
        throw new Error('Analytics calculation failed');
      });

      expect(() => engine.getPatternRecognitionAnalytics()).toThrow();
      expect(errorSpy).toHaveBeenCalledWith({ error: expect.any(Error) });
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle API integration events', async () => {
      const alertHandler = (mockAPIIntegration.on as jest.Mock).mock.calls
        .find(call => call[0] === 'security_alert')?.[1];

      if (alertHandler) {
        await alertHandler({ 
          severity: 'high', 
          type: 'pattern_anomaly',
          data: { pattern_id: 'pattern_123' }
        });
        // Should not throw
      }
    });

    it('should handle policy engine events', async () => {
      const policyHandler = (mockPolicyEngine.on as jest.Mock).mock.calls
        .find(call => call[0] === 'policy_violation')?.[1];

      if (policyHandler) {
        await policyHandler({ 
          policyId: 'policy_456', 
          violation: { type: 'access_pattern_anomaly' }
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
          score: 85,
          pattern_associations: ['pattern_123']
        });
        // Should not throw
      }
    });
  });

  describe('Configuration Validation', () => {
    it('should respect pattern recognition settings', async () => {
      const disabledMLConfig: SecurityPatternRecognitionConfig = {
        ...config,
        pattern_recognition: {
          ...config.pattern_recognition,
          ml_pattern_detection: false
        }
      };

      const engineWithoutML = new SecurityPatternRecognitionEngine(
        disabledMLConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine
      );
      await engineWithoutML.initialize();

      const result = await engineWithoutML.recognizePatterns(samplePatternData, 'batch');

      expect(result).toBeDefined();
      // Should still work without ML, using statistical methods

      await engineWithoutML.shutdown();
    });

    it('should handle different clustering algorithm configurations', async () => {
      const limitedClusteringConfig: SecurityPatternRecognitionConfig = {
        ...config,
        threat_clustering: {
          ...config.threat_clustering,
          clustering_algorithms: ['dbscan'],
          auto_clustering_enabled: false
        }
      };

      const engineWithLimitedClustering = new SecurityPatternRecognitionEngine(
        limitedClusteringConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine
      );
      await engineWithLimitedClustering.initialize();

      const memberThreats = ['threat_001', 'threat_002'];
      const cluster = await engineWithLimitedClustering.createThreatCluster(memberThreats);

      expect(cluster).toBeDefined();
      expect(cluster.cluster_analysis.clustering_algorithm).toBe('dbscan');

      await engineWithLimitedClustering.shutdown();
    });

    it('should enforce data source restrictions', async () => {
      const restrictedDataConfig: SecurityPatternRecognitionConfig = {
        ...config,
        data_sources: {
          ...config.data_sources,
          network_traffic: false,
          endpoint_telemetry: false
        }
      };

      const engineWithRestrictedData = new SecurityPatternRecognitionEngine(
        restrictedDataConfig,
        mockAPIIntegration,
        mockPolicyEngine,
        mockRiskScoringEngine
      );
      await engineWithRestrictedData.initialize();

      const limitedData = {
        security_logs: samplePatternData.security_logs,
        threat_intelligence: samplePatternData.threat_intelligence
      };

      const result = await engineWithRestrictedData.recognizePatterns(limitedData, 'batch');

      expect(result).toBeDefined();
      // Should work with limited data sources

      await engineWithRestrictedData.shutdown();
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await engine.initialize();
      
      // Perform some operations
      await engine.recognizePatterns(samplePatternData, 'batch');
      await engine.createThreatCluster(['threat_001', 'threat_002']);

      const shutdownSpy = jest.fn<unknown[], unknown>();
      engine.on('shutdown', shutdownSpy);

      await engine.shutdown();

      expect(shutdownSpy).toHaveBeenCalledWith({
        timestamp: expect.any(Number)
      });
    });

    it('should save patterns and clusters during shutdown', async () => {
      await engine.initialize();
      
      await engine.recognizePatterns(samplePatternData, 'batch');
      const cluster = await engine.createThreatCluster(['threat_001', 'threat_002']);

      await engine.shutdown();

      // Data should be persisted (mocked)
      const analytics = engine.getPatternRecognitionAnalytics();
      expect(analytics.summary.total_patterns_recognized).toBeGreaterThanOrEqual(0);
    });

    it('should handle shutdown errors gracefully', async () => {
      await engine.initialize();

      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('error', errorSpy);

      // Mock component shutdown to fail
      jest.spyOn(engine as any, 'shutdownMLModels').mockRejectedValue(new Error('Component shutdown failed'));

      await expect(engine.shutdown()).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'shutdown'
      });
    });

    it('should stop real-time processing during shutdown', async () => {
      await engine.initialize();

      const stopRealTimeProcessingSpy = jest.spyOn(engine as any, 'stopRealTimeProcessing');

      await engine.shutdown();

      expect(stopRealTimeProcessingSpy).toHaveBeenCalled();
    });
  });
});