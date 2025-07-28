/**
 * Tests for Security Risk Scoring Engine
 * Epic 31 - Task E31-1753313263600-C908F1
 */

import { 
  SecurityRiskScoringEngine, 
  SecurityRiskScoringConfig, 
  SecurityRisk,
  RiskScoringReport 
} from '../SecurityRiskScoringEngine';
import { SecurityAPIIntegrationPlatform } from '../SecurityAPIIntegrationPlatform';
import { SecurityPolicyAnalysisEngine } from '../SecurityPolicyAnalysisEngine';

// Mock dependencies
jest.mock('../SecurityAPIIntegrationPlatform');
jest.mock('../SecurityPolicyAnalysisEngine');

describe('SecurityRiskScoringEngine', () => {
  let engine: SecurityRiskScoringEngine;
  let mockAPIIntegration: jest.Mocked<SecurityAPIIntegrationPlatform>;
  let mockPolicyEngine: jest.Mocked<SecurityPolicyAnalysisEngine>;
  let config: SecurityRiskScoringConfig;
  let sampleRiskData: Partial<SecurityRisk>;

  beforeEach(() => {
    // Setup mocks
    mockAPIIntegration = {
      on: jest.fn<unknown[], unknown>(),
      getPlatformMetrics: jest.fn<unknown[], unknown>().mockResolvedValue({
        api_calls: { total_requests: 20000, successful_requests: 19500 },
        security_analytics: { threats_detected: 45, detection_accuracy_percent: 98 }
      } as unknown)
    } as any;

    mockPolicyEngine = {
      on: jest.fn<unknown[], unknown>(),
      analyzePolicyImpact: jest.fn<unknown[], unknown>().mockResolvedValue({
        risk_analysis: { overall_risk_score: 25 },
        validation_results: { validation_passed: true }
      } as unknown)
    } as any;

    // Setup configuration
    config = {
      scoring_algorithms: {
        cvss_scoring_enabled: true,
        custom_scoring_enabled: true,
        machine_learning_scoring: true,
        temporal_scoring_enabled: true,
        environmental_scoring_enabled: true,
        composite_scoring_enabled: true
  }
      threat_prioritization: {
        priority_matrix_enabled: true,
        business_impact_weighting: true,
        asset_criticality_weighting: true,
        threat_intelligence_integration: true,
        dynamic_prioritization: true,
        contextual_prioritization: true
  }
      risk_factors: {
        vulnerability_severity: true,
        asset_criticality: true,
        threat_landscape: true,
        exploitability: true,
        business_impact: true,
        remediation_complexity: true,
        exposure_metrics: true
  }
      scoring_models: {
        quantitative_models_enabled: true,
        qualitative_models_enabled: true,
        hybrid_models_enabled: true,
        industry_benchmarking: true,
        peer_comparison: true,
        historical_analysis: true
  }
      automation_settings: {
        real_time_scoring: true,
        automated_prioritization: true,
        alert_threshold_management: true,
        escalation_automation: true,
        dashboard_integration: true,
        reporting_automation: true
  }
      integration_settings: {
        threat_intelligence_feeds: true,
        vulnerability_scanners: true,
        asset_management_systems: true,
        incident_response_platforms: true,
        compliance_frameworks: true,
        business_systems: true
      }
    };

    // Setup sample risk data
    sampleRiskData = {
      risk_name: 'Critical SQL Injection Vulnerability',
      description: 'SQL injection vulnerability in user authentication system',
      risk_type: 'vulnerability',
      risk_identification: {
        identified_at: Date.now(),
        identified_by: 'security_scanner',
        identification_method: 'automated',
        source_systems: ['vulnerability_scanner', 'penetration_test'],
        confidence_level: 0.95
  }
      vulnerability_details: {
        cve_id: 'CVE-2024-12345',
        cvss_base_score: 9.8,
        cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
        severity_level: 'critical',
        cwe_id: 'CWE-89',
        affected_components: ['authentication_service', 'user_database'],
        exploit_availability: {
          exploit_exists: true,
          exploit_maturity: 'functional',
          public_exploits_available: true,
          weaponization_level: 'high'
  }
        patch_information: {
          patch_available: true,
          patch_complexity: 'medium',
          estimated_patch_time_hours: 24,
          testing_requirements: 'full_regression'
        }
  }
      asset_context: {
        affected_assets: [
          {
            asset_id: 'auth_service_prod',
            asset_name: 'Production Authentication Service',
            asset_type: 'application',
            criticality_level: 'critical',
            business_function: 'user_authentication',
            data_classification: 'confidential',
            network_exposure: 'internet_facing',
            compliance_requirements: ['PCI_DSS', 'SOX', 'GDPR']
          }
        ],
        business_impact_potential: {
          revenue_impact_estimate: 5000000,
          customer_impact_severity: 'high',
          operational_disruption_level: 'severe',
          reputation_damage_level: 'high',
          regulatory_impact: 'significant'
        }
  }
      threat_landscape: {
        active_campaigns: [
          {
            campaign_name: 'SQL Injection Campaign 2024',
            threat_actor: 'APT-SQL-2024',
            targeting_probability: 0.85,
            attack_sophistication: 'medium'
          }
        ],
        geographic_threat_level: 'high',
        industry_targeting_level: 'elevated',
        seasonal_factors: ['tax_season', 'holiday_shopping']
      }
    };

    engine = new SecurityRiskScoringEngine(config, mockAPIIntegration, mockPolicyEngine);
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
      jest.spyOn(engine as any, 'loadThreatIntelligenceFeeds').mockRejectedValue(new Error('Feed loading failed'));

      await expect(engine.initialize()).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'initialization'
      });
    });

    it('should load machine learning models during initialization', async () => {
      await engine.initialize();

      const models = (engine as any).mlModels;
      expect(models).toBeDefined();
      expect(models.risk_prediction_model).toBeDefined();
      expect(models.threat_classification_model).toBeDefined();
    });
  });

  describe('Risk Scoring', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should score security risk successfully', async () => {
      const riskScoredSpy = jest.fn<unknown[], unknown>();
      engine.on('risk_scored', riskScoredSpy);

      const scoredRisk = await engine.scoreSecurityRisk(sampleRiskData);

      expect(scoredRisk).toBeDefined();
      expect(scoredRisk.risk_id).toBeDefined();
      expect(scoredRisk.risk_name).toBe(sampleRiskData.risk_name);
      expect(scoredRisk.risk_scoring.composite_score).toBeGreaterThan(0);
      expect(scoredRisk.risk_scoring.composite_score).toBeLessThanOrEqual(100);

      expect(riskScoredSpy).toHaveBeenCalledWith({
        riskId: scoredRisk.risk_id,
        riskName: scoredRisk.risk_name,
        compositeScore: scoredRisk.risk_scoring.composite_score,
        priorityLevel: scoredRisk.prioritization.priority_level
      });
    });

    it('should calculate CVSS score correctly', async () => {
      const scoredRisk = await engine.scoreSecurityRisk(sampleRiskData);

      expect(scoredRisk.risk_scoring.score_breakdown.vulnerability_score).toBeDefined();
      expect(scoredRisk.vulnerability_details?.cvss_base_score).toBe(9.8);
      expect(scoredRisk.risk_scoring.score_breakdown.vulnerability_score).toBeGreaterThanOrEqual(90);
    });

    it('should apply temporal scoring adjustments', async () => {
      const riskWithTemporal = {
        ...sampleRiskData,
        vulnerability_details: {
          ...sampleRiskData.vulnerability_details!,
          exploit_availability: {
            exploit_exists: true,
            exploit_maturity: 'proof_of_concept',
            public_exploits_available: false,
            weaponization_level: 'low'
          }
        }
      };

      const scoredRisk = await engine.scoreSecurityRisk(riskWithTemporal);

      expect(scoredRisk.risk_scoring.score_breakdown.temporal_adjustments).toBeDefined();
      expect(scoredRisk.risk_scoring.composite_score).toBeLessThan(100);
    });

    it('should integrate threat intelligence data', async () => {
      const scoredRisk = await engine.scoreSecurityRisk(sampleRiskData);

      expect(scoredRisk.threat_context.threat_intelligence).toBeDefined();
      expect(scoredRisk.threat_context.threat_intelligence.ioc_matches).toBeDefined();
      expect(scoredRisk.threat_context.threat_intelligence.campaign_associations).toBeDefined();
    });

    it('should calculate asset impact correctly', async () => {
      const scoredRisk = await engine.scoreSecurityRisk(sampleRiskData);

      expect(scoredRisk.asset_impact.impact_assessment).toBeDefined();
      expect(scoredRisk.asset_impact.impact_assessment.business_criticality_score).toBeGreaterThan(0);
      expect(scoredRisk.asset_impact.impact_assessment.data_sensitivity_score).toBeGreaterThan(0);
      expect(scoredRisk.asset_impact.impact_assessment.compliance_impact_score).toBeGreaterThan(0);
    });

    it('should handle missing vulnerability details', async () => {
      const riskWithoutVuln = {
        ...sampleRiskData,
        risk_type: 'operational' as const,
        vulnerability_details: undefined
      };

      const scoredRisk = await engine.scoreSecurityRisk(riskWithoutVuln);

      expect(scoredRisk).toBeDefined();
      expect(scoredRisk.risk_scoring.composite_score).toBeGreaterThan(0);
      expect(scoredRisk.vulnerability_details).toBeUndefined();
    });

    it('should apply machine learning predictions', async () => {
      const scoredRisk = await engine.scoreSecurityRisk(sampleRiskData);

      expect(scoredRisk.risk_scoring.score_breakdown.ml_risk_prediction).toBeDefined();
      expect(scoredRisk.risk_scoring.score_breakdown.ml_risk_prediction).toBeGreaterThan(0);
      expect(scoredRisk.risk_scoring.score_breakdown.ml_risk_prediction).toBeLessThanOrEqual(100);
    });
  });

  describe('Risk Prioritization', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should prioritize risks correctly', async () => {
      const risk1 = await engine.scoreSecurityRisk(sampleRiskData);
      const risk2 = await engine.scoreSecurityRisk({
        ...sampleRiskData,
        risk_name: 'Medium Risk Vulnerability',
        vulnerability_details: {
          ...sampleRiskData.vulnerability_details!,
          cvss_base_score: 6.5,
          severity_level: 'medium'
        }
      });

      const prioritizedRisks = await engine.prioritizeRisks([risk1.risk_id, risk2.risk_id]);

      expect(prioritizedRisks).toHaveLength(2);
      expect(prioritizedRisks[0].risk_id).toBe(risk1.risk_id); // Higher risk should be first
      expect(prioritizedRisks[0].prioritization.priority_level).toBe('critical');
      expect(prioritizedRisks[1].prioritization.priority_level).toBe('high');
    });

    it('should apply business context to prioritization', async () => {
      const businessContext = {
        current_threat_level: 'high' as const,
        business_priorities: ['customer_data_protection', 'service_availability'],
        resource_constraints: ['limited_security_team', 'maintenance_window_restrictions'],
        compliance_deadlines: [
          {
            regulation: 'PCI_DSS',
            deadline: Date.now() + 86400000 * 30,
            penalty_risk: 'high'
          }
        ]
      };

      const risk = await engine.scoreSecurityRisk(sampleRiskData);
      const prioritizedRisks = await engine.prioritizeRisks([risk.risk_id], businessContext);

      expect(prioritizedRisks[0].prioritization.business_justification).toBeDefined();
      expect(prioritizedRisks[0].prioritization.recommended_timeline).toBeDefined();
    });

    it('should handle dynamic prioritization adjustments', async () => {
      const risk = await engine.scoreSecurityRisk(sampleRiskData);
      
      // Simulate threat intelligence update
      const threatUpdate = {
        threat_level_change: 'elevated',
        new_intelligence: ['Active exploitation detected', 'Targeted campaign identified'],
        confidence_level: 0.9
      };

      await engine.updateRiskWithThreatIntelligence(risk.risk_id, threatUpdate);
      const updatedRisk = await engine.getRiskById(risk.risk_id);

      expect(updatedRisk.prioritization.priority_level).toBe('critical');
      expect(updatedRisk.risk_scoring.composite_score).toBeGreaterThan(risk.risk_scoring.composite_score);
    });
  });

  describe('Reporting and Analytics', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should generate comprehensive risk scoring report', async () => {
      // Create multiple risks for reporting
      await engine.scoreSecurityRisk(sampleRiskData);
      await engine.scoreSecurityRisk({
        ...sampleRiskData,
        risk_name: 'Network Security Risk',
        risk_type: 'threat'
      });

      const report = await engine.generateRiskScoringReport({
        report_type: 'comprehensive',
        time_range: {
          start_date: Date.now() - 86400000 * 7,
          end_date: Date.now()
  }
        include_trends: true,
        include_recommendations: true
      });

      expect(report).toBeDefined();
      expect(report.report_id).toBeDefined();
      expect(report.executive_summary).toBeDefined();
      expect(report.risk_summary.total_risks_assessed).toBeGreaterThanOrEqual(2);
      expect(report.scoring_analytics.average_composite_score).toBeGreaterThan(0);
      expect(report.prioritization_insights.critical_risks_count).toBeGreaterThanOrEqual(0);
    });

    it('should provide risk distribution analytics', async () => {
      await engine.scoreSecurityRisk(sampleRiskData);
      
      const analytics = engine.getRiskScoringAnalytics();

      expect(analytics.summary.total_risks_scored).toBeGreaterThanOrEqual(1);
      expect(analytics.risk_distribution.by_severity.critical).toBeGreaterThanOrEqual(0);
      expect(analytics.risk_distribution.by_type.vulnerability).toBeGreaterThanOrEqual(0);
      expect(analytics.scoring_performance.average_scoring_time_ms).toBeGreaterThan(0);
    });

    it('should track scoring accuracy metrics', async () => {
      await engine.scoreSecurityRisk(sampleRiskData);
      
      const analytics = engine.getRiskScoringAnalytics();

      expect(analytics.model_performance.cvss_accuracy).toBeGreaterThan(0);
      expect(analytics.model_performance.ml_prediction_accuracy).toBeGreaterThan(0);
      expect(analytics.model_performance.false_positive_rate).toBeLessThan(1);
    });
  });

  describe('Integration and Updates', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should update risk scores based on new intelligence', async () => {
      const risk = await engine.scoreSecurityRisk(sampleRiskData);
      const originalScore = risk.risk_scoring.composite_score;

      
      await engine.updateRiskScore(risk.risk_id, {
        update_reason: 'Threat intelligence update',
        new_intelligence
      });

      const updatedRisk = await engine.getRiskById(risk.risk_id);
      expect(updatedRisk.risk_scoring.composite_score).toBeGreaterThan(originalScore);
    });

    it('should handle vulnerability scanner integration', async () => {
      const scannerData = {
        scanner_id: 'nessus_enterprise',
        scan_results: [
          {
            vulnerability_id: 'SCAN-12345',
            cvss_score: 8.8,
            affected_hosts: ['10.0.1.100', '10.0.1.101'],
            first_detected: Date.now() - 86400000
          }
        ]
      };

      const processedRisks = await engine.processScannerResults(scannerData);

      expect(processedRisks).toHaveLength(1);
      expect(processedRisks[0].risk_identification.source_systems).toContain('nessus_enterprise');
      expect(processedRisks[0].vulnerability_details?.cvss_base_score).toBe(8.8);
    });

    it('should integrate with asset management systems', async () => {
      const assetData = {
        asset_updates: [
          {
            asset_id: 'auth_service_prod',
            criticality_change: 'elevated',
            business_impact_change: 'increased',
            compliance_requirements_added: ['SOC2']
          }
        ]
      };

      await engine.updateAssetContext(assetData);
      
      // Score a risk for the updated asset
      const risk = await engine.scoreSecurityRisk(sampleRiskData);

      expect(risk.asset_impact.impact_assessment.business_criticality_score).toBeGreaterThan(80);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should handle invalid risk data', async () => {
      const invalidRiskData = {
        risk_name: '', // Invalid empty name
        description: 'Test risk'
        // Missing required fields
      };

      await expect(engine.scoreSecurityRisk(invalidRiskData)).rejects.toThrow();
    });

    it('should handle scoring errors gracefully', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('scoring_error', errorSpy);

      // Mock CVSS calculation to fail
      jest.spyOn(engine as any, 'calculateCVSSScore').mockRejectedValue(new Error('CVSS calculation failed'));

      await expect(engine.scoreSecurityRisk(sampleRiskData)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        riskData: expect.any(Object),
        error: expect.any(Error)
      });
    });

    it('should handle prioritization errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('prioritization_error', errorSpy);

      const nonExistentRiskIds = ['non_existent_1', 'non_existent_2'];

      await expect(engine.prioritizeRisks(nonExistentRiskIds)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        riskIds: nonExistentRiskIds,
        error: expect.any(Error)
      });
    });

    it('should handle threat intelligence update errors', async () => {
      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('intelligence_update_error', errorSpy);

      const nonExistentRiskId = 'non_existent_risk';
      const threatUpdate = {
        threat_level_change: 'elevated',
        new_intelligence: ['Test update'],
        confidence_level: 0.8
      };

      await expect(engine.updateRiskWithThreatIntelligence(nonExistentRiskId, threatUpdate)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        riskId: nonExistentRiskId,
        error: expect.any(Error)
      });
    });
  });

  describe('Performance and Optimization', () => {
    beforeEach(async () => {
      await engine.initialize();
    });

    it('should cache scoring results for performance', async () => {
      const risk1 = await engine.scoreSecurityRisk(sampleRiskData);
      const startTime = Date.now();
      const risk2 = await engine.scoreSecurityRisk(sampleRiskData); // Should use cache
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast due to caching
      expect(risk2.risk_scoring.composite_score).toBe(risk1.risk_scoring.composite_score);
    });

    it('should handle high-volume risk scoring', async () => {
      const risks = [];
      const startTime = Date.now();

      // Score multiple risks in parallel
      const promises = Array.from({ length: 10 }, (_, i) =>
        engine.scoreSecurityRisk({
          ...sampleRiskData,
          risk_name: `Risk ${i + 1}`
  }
      );

      const scoredRisks = await Promise.all(promises);
      const endTime = Date.now();

      expect(scoredRisks).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should optimize ML model predictions', async () => {
      const risk = await engine.scoreSecurityRisk(sampleRiskData);

      const modelPerformance = (engine as any).getModelPerformanceMetrics();
      expect(modelPerformance.prediction_time_ms).toBeLessThan(1000);
      expect(modelPerformance.accuracy_score).toBeGreaterThan(0.8);
    });
  });

  describe('Configuration Validation', () => {
    it('should respect scoring algorithm settings', async () => {
      const disabledMLConfig: SecurityRiskScoringConfig = {
        ...config,
        scoring_algorithms: {
          ...config.scoring_algorithms,
          machine_learning_scoring: false
        }
      };

      const engineWithoutML = new SecurityRiskScoringEngine(
        disabledMLConfig,
        mockAPIIntegration,
        mockPolicyEngine
      );
      await engineWithoutML.initialize();

      const risk = await engineWithoutML.scoreSecurityRisk(sampleRiskData);

      expect(risk.risk_scoring.score_breakdown.ml_risk_prediction).toBeUndefined();

      await engineWithoutML.shutdown();
    });

    it('should handle different threat prioritization configurations', async () => {
      const simplePrioritizationConfig: SecurityRiskScoringConfig = {
        ...config,
        threat_prioritization: {
          ...config.threat_prioritization,
          dynamic_prioritization: false,
          contextual_prioritization: false
        }
      };

      const engineWithSimplePrioritization = new SecurityRiskScoringEngine(
        simplePrioritizationConfig,
        mockAPIIntegration,
        mockPolicyEngine
      );
      await engineWithSimplePrioritization.initialize();

      const risk = await engineWithSimplePrioritization.scoreSecurityRisk(sampleRiskData);

      expect(risk.prioritization.priority_level).toBeDefined();
      expect(risk.prioritization.business_justification).toBeDefined();

      await engineWithSimplePrioritization.shutdown();
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await engine.initialize();
      
      // Score some risks
      await engine.scoreSecurityRisk(sampleRiskData);

      const shutdownSpy = jest.fn<unknown[], unknown>();
      engine.on('shutdown', shutdownSpy);

      await engine.shutdown();

      expect(shutdownSpy).toHaveBeenCalledWith({
        timestamp: expect.any(Number)
      });
    });

    it('should save risk data during shutdown', async () => {
      await engine.initialize();
      
      const risk = await engine.scoreSecurityRisk(sampleRiskData);

      await engine.shutdown();

      // Risk should be persisted
      const analytics = engine.getRiskScoringAnalytics();
      expect(analytics.summary.total_risks_scored).toBeGreaterThanOrEqual(1);
    });

    it('should handle shutdown errors gracefully', async () => {
      await engine.initialize();

      const errorSpy = jest.fn<unknown[], unknown>();
      engine.on('error', errorSpy);

      // Mock component shutdown to fail
      jest.spyOn(engine as any, 'threatIntelligenceManager').mockValue({
        shutdown: jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Component shutdown failed'))
      });

      await expect(engine.shutdown()).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
        context: 'shutdown'
      });
    });
  });
});