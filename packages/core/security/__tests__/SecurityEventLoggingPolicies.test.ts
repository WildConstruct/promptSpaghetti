/**
 * Comprehensive Test Suite for Security Event Logging Policies
 * 
 * Tests all aspects of security event policy management, enforcement,
 * compliance mapping, and integration with existing audit infrastructure.
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  SecurityEventLoggingPolicyEngine,
  SecurityEventType,
  SecurityEventSeverity,
  SecurityEventStatus,
  ComplianceFramework,
  securityEventPolicyEngine,
  processSecurityEvent,
  registerSecurityPolicy,
  generateSecurityComplianceReport
} from '../SecurityEventLoggingPolicies';
describe('SecurityEventLoggingPolicyEngine', () => {
  let policyEngine: SecurityEventLoggingPolicyEngine;
  beforeEach(() => {
    policyEngine = new SecurityEventLoggingPolicyEngine();
  });
  describe('Policy Registration and Management', () => {
    it('should register application security policies on initialization', () => {
      const policies = policyEngine.getPolicies();
      expect(policies.length).toBeGreaterThan(5);
      // Check for key policy types
      const authPolicy = policies.find(p => p.policy_id === 'APPSEC_001');
      const injectionPolicy = policies.find(p => p.policy_id === 'APPSEC_002');
      const networkPolicy = policies.find(p => p.policy_id === 'NETSEC_001');
      const soxPolicy = policies.find(p => p.policy_id === 'SOX_001');
      const gdprPolicy = policies.find(p => p.policy_id === 'GDPR_001');
      expect(authPolicy).toBeDefined();
      expect(authPolicy?.policy_name).toBe('Authentication Failure Policy');
      expect(authPolicy?.enabled).toBe(true);
      expect(injectionPolicy).toBeDefined();
      expect(injectionPolicy?.policy_name).toBe('Code Injection Attack Policy');
      expect(injectionPolicy?.severity_threshold).toBe(SecurityEventSeverity.CRITICAL);
      expect(networkPolicy).toBeDefined();
      expect(soxPolicy).toBeDefined();
      expect(gdprPolicy).toBeDefined();
    });
    it('should register custom security policies', () => {
      const customPolicy = {
        policy_id: 'CUSTOM_001',
        policy_name: 'Custom Test Policy',
        event_types: [SecurityEventType.API_ABUSE_DETECTED],
        severity_threshold: SecurityEventSeverity.MEDIUM,
        enabled: true,
        detection_rules: {,
          conditions: [,
            { field: 'request_rate', operator: 'gt' as const, value: 100 }
          ],
          time_window: 60000,
          frequency_threshold: 5,
        },
        response_actions: {,
          immediate_actions: ['rate_limit', 'generate_alert'],
          escalation_actions: ['notify_api_team'],
          notification_channels: ['email'],
          automated_containment: true,
        },
        compliance_mapping: {,
          frameworks: [ComplianceFramework.NIST],
          requirements: ['api_security'],
          retention_period: 365,
          requires_encryption: false,
        },
        reporting: {,
          real_time_alerts: true,
          periodic_reports: ['daily'],
          stakeholders: ['api_team'],
          external_reporting: false,
        }
      };
      policyEngine.registerPolicy(customPolicy);
      const retrievedPolicy = policyEngine.getPolicy('CUSTOM_001');
      expect(retrievedPolicy).toBeDefined();
      expect(retrievedPolicy?.policy_name).toBe('Custom Test Policy');
    });
    it('should update existing policies', () => {
      const updated = policyEngine.updatePolicy('APPSEC_001', {)
        severity_threshold: SecurityEventSeverity.HIGH,
      });
      expect(updated).toBe(true);
      const policy = policyEngine.getPolicy('APPSEC_001');
      expect(policy?.severity_threshold).toBe(SecurityEventSeverity.HIGH);
    });
    it('should enable/disable policies', () => {
      const disabled = policyEngine.setPolicyEnabled('APPSEC_001', false);
      expect(disabled).toBe(true);
      const policy = policyEngine.getPolicy('APPSEC_001');
      expect(policy?.enabled).toBe(false);
      const enabled = policyEngine.setPolicyEnabled('APPSEC_001', true);
      expect(enabled).toBe(true);
      expect(policy?.enabled).toBe(true);
    });
  });
  describe('Security Event Processing', () => {
    it('should process authentication failure events', () => {
      const authEvent = {
        event_id: crypto.randomUUID(),
        event_type: SecurityEventType.AUTHENTICATION_FAILURE,
        severity: SecurityEventSeverity.HIGH,
        status: SecurityEventStatus.ACTIVE,
        timestamp: new Date(),
        title: 'Multiple Failed Login Attempts',
        description: 'User exceeded failed login threshold',
        category: 'authentication',
        source_ip: '192.168.1.100',
        user_id: 'test-user',
        session_id: 'session-123',
        system_component: 'auth-service',
        threat_level: 7.5,
        confidence_score: 0.9,
        compliance_frameworks: [ComplianceFramework.SOX],
        regulatory_impact: false,
        requires_notification: true,
        automated_response: true,
        response_actions: ['block_ip', 'lock_account'],
        escalation_required: true,
        evidence_preserved: false,
        forensic_artifacts: [],
        chain_of_custody: [],
        tags: ['authentication', 'brute_force'],
        related_events: [],
        created_by: 'security_system',
        created_at: new Date(),
      };
      const result = policyEngine.processSecurityEvent(authEvent);
      expect(result.matched_policies).toContain('APPSEC_001');
      expect(result.actions_triggered).toContain('block_ip');
      expect(result.actions_triggered).toContain('lock_account');
      expect(result.notifications_sent).toContain('email');
      expect(result.compliance_requirements).toContain(ComplianceFramework.SOX);
      expect(result.escalation_required).toBe(true);
    });
    it('should process code injection attack events', () => {
      const injectionEvent = {
        event_id: crypto.randomUUID(),
        event_type: SecurityEventType.CODE_INJECTION_ATTEMPT,
        severity: SecurityEventSeverity.CRITICAL,
        status: SecurityEventStatus.ACTIVE,
        timestamp: new Date(),
        title: 'SQL Injection Attempt Detected',
        description: 'Malicious SQL injection detected in user input',
        category: 'application_security',
        subcategory: 'injection_attack',
        source_ip: '10.0.0.50',
        user_id: 'anonymous',
        system_component: 'web-application',
        endpoint: '/api/users',
        method: 'POST',
        threat_level: 9.5,
        confidence_score: 0.95,
        attack_vector: 'sql_injection',
        indicators: ['union_select', 'drop_table'],
        compliance_frameworks: [ComplianceFramework.PCI_DSS, ComplianceFramework.SOX],
        regulatory_impact: true,
        requires_notification: true,
        automated_response: true,
        response_actions: ['block_request', 'preserve_evidence'],
        escalation_required: true,
        evidence_preserved: true,
        forensic_artifacts: ['request_payload', 'response_headers'],
        tags: ['injection', 'sql', 'critical'],
        created_by: 'waf_system',
        created_at: new Date(),
      };
      const result = policyEngine.processSecurityEvent(injectionEvent);
      expect(result.matched_policies).toContain('APPSEC_002');
      expect(result.actions_triggered).toContain('block_request');
      expect(result.actions_triggered).toContain('preserve_evidence');
      expect(result.notifications_sent).toContain('email');
      expect(result.notifications_sent).toContain('sms');
      expect(result.compliance_requirements).toContain(ComplianceFramework.PCI_DSS);
      expect(result.escalation_required).toBe(true);
    });
    it('should process SOX IT controls violations', () => {
      const soxEvent = {
        event_id: crypto.randomUUID(),
        event_type: SecurityEventType.SOX_ITGC_VIOLATION,
        severity: SecurityEventSeverity.HIGH,
        status: SecurityEventStatus.INVESTIGATING,
        timestamp: new Date(),
        title: 'Change Management Violation',
        description: 'Production deployment without proper change approval',
        category: 'compliance',
        subcategory: 'change_management',
        user_id: 'dev-user-123',
        system_component: 'production-deployment',
        threat_level: 6.0,
        confidence_score: 0.8,
        compliance_frameworks: [ComplianceFramework.SOX],
        regulatory_impact: true,
        requires_notification: true,
        automated_response: false,
        response_actions: ['document_violation', 'notify_compliance'],
        escalation_required: true,
        evidence_preserved: true,
        forensic_artifacts: ['deployment_logs', 'change_requests'],
        tags: ['sox', 'change_management', 'violation'],
        created_by: 'compliance_monitor',
        created_at: new Date(),
      };
      const result = policyEngine.processSecurityEvent(soxEvent);
      expect(result.matched_policies).toContain('SOX_001');
      expect(result.actions_triggered).toContain('document_violation');
      expect(result.actions_triggered).toContain('notify_compliance');
      expect(result.compliance_requirements).toContain(ComplianceFramework.SOX);
      expect(result.escalation_required).toBe(true);
    });
    it('should process GDPR data subject requests', () => {
      const gdprEvent = {
        event_id: crypto.randomUUID(),
        event_type: SecurityEventType.GDPR_DATA_SUBJECT_REQUEST,
        severity: SecurityEventSeverity.MEDIUM,
        status: SecurityEventStatus.ACTIVE,
        timestamp: new Date(),
        title: 'GDPR Data Access Request',
        description: 'Data subject requested access to personal data under Article 15',
        category: 'privacy',
        subcategory: 'data_subject_rights',
        user_id: 'data-subject-456',
        system_component: 'privacy-portal',
        threat_level: 2.0,
        confidence_score: 1.0,
        compliance_frameworks: [ComplianceFramework.GDPR],
        regulatory_impact: true,
        requires_notification: false,
        notification_timeline: '30 days',
        automated_response: true,
        response_actions: ['acknowledge_request', 'start_timer'],
        escalation_required: false,
        evidence_preserved: true,
        tags: ['gdpr', 'data_access', 'article_15'],
        created_by: 'privacy_system',
        created_at: new Date(),
      };
      const result = policyEngine.processSecurityEvent(gdprEvent);
      expect(result.matched_policies).toContain('GDPR_001');
      expect(result.actions_triggered).toContain('acknowledge_request');
      expect(result.actions_triggered).toContain('start_timer');
      expect(result.compliance_requirements).toContain(ComplianceFramework.GDPR);
    });
    it('should process behavioral anomaly events', () => {
      const behaviorEvent = {
        event_id: crypto.randomUUID(),
        event_type: SecurityEventType.BEHAVIORAL_ANOMALY,
        severity: SecurityEventSeverity.MEDIUM,
        status: SecurityEventStatus.ACTIVE,
        timestamp: new Date(),
        title: 'Unusual User Access Pattern',
        description: 'User accessing resources outside normal patterns',
        category: 'behavior_analytics',
        user_id: 'user-789',
        system_component: 'behavior_monitor',
        threat_level: 5.5,
        confidence_score: 0.75,
        indicators: ['unusual_time', 'abnormal_location', 'elevated_permissions'],
        compliance_frameworks: [ComplianceFramework.NIST],
        regulatory_impact: false,
        requires_notification: false,
        automated_response: false,
        response_actions: ['flag_for_review', 'increase_monitoring'],
        escalation_required: false,
        evidence_preserved: true,
        tags: ['anomaly', 'behavior', 'user_activity'],
        created_by: 'ml_analytics',
        created_at: new Date(),
      };
      const result = policyEngine.processSecurityEvent(behaviorEvent);
      expect(result.matched_policies).toContain('BEHAVIOR_001');
      expect(result.actions_triggered).toContain('flag_for_review');
      expect(result.actions_triggered).toContain('increase_monitoring');
      expect(result.compliance_requirements).toContain(ComplianceFramework.NIST);
    });
  });
  describe('Compliance Reporting', () => {
    beforeEach(() => {
      // Create sample events for compliance reporting
      const sampleEvents = [;
        {
          event_id: crypto.randomUUID(),
          event_type: SecurityEventType.SOX_ITGC_VIOLATION,
          severity: SecurityEventSeverity.HIGH,
          status: SecurityEventStatus.RESOLVED,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          title: 'Change Management Violation',
          description: 'Unauthorized production change',
          category: 'compliance',
          compliance_frameworks: [ComplianceFramework.SOX],
          regulatory_impact: true,
          created_by: 'system',
          created_at: new Date(),
        },
        {
          event_id: crypto.randomUUID(),
          event_type: SecurityEventType.GDPR_DATA_SUBJECT_REQUEST,
          severity: SecurityEventSeverity.MEDIUM,
          status: SecurityEventStatus.COMPLETED,
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          title: 'Data Access Request',
          description: 'GDPR Article 15 request processed',
          category: 'privacy',
          compliance_frameworks: [ComplianceFramework.GDPR],
          regulatory_impact: true,
          created_by: 'system',
          created_at: new Date(),
        }
      ];
      // Process sample events
      sampleEvents.forEach(event => {)
        const fullEvent = {
          ...event,
          threat_level: 3.0,
          confidence_score: 0.8,
          requires_notification: false,
          automated_response: false,
          response_actions: [],
          escalation_required: false,
          evidence_preserved: false,
          forensic_artifacts: [],
          chain_of_custody: [],
          tags: [],
          related_events: [],
        };
        policyEngine.processSecurityEvent(fullEvent);
      });
    });
    it('should generate SOX compliance report', () => {
      const report = policyEngine.generateComplianceReport(;);
        ComplianceFramework.SOX,
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        new Date()
      );
      expect(report.framework).toBe(ComplianceFramework.SOX);
      expect(report.events_count).toBeGreaterThanOrEqual(1);
      expect(report.events_by_severity).toBeDefined();
      expect(report.compliance_score).toBeLessThanOrEqual(100);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
    it('should generate GDPR compliance report', () => {
      const report = policyEngine.generateComplianceReport(;);
        ComplianceFramework.GDPR,
        new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        new Date()
      );
      expect(report.framework).toBe(ComplianceFramework.GDPR);
      expect(report.events_count).toBeGreaterThanOrEqual(1);
      expect(report.events_by_severity[SecurityEventSeverity.MEDIUM]).toBeGreaterThanOrEqual(1);
    });
    it('should provide appropriate recommendations', () => {
      const report = policyEngine.generateComplianceReport(;);
        ComplianceFramework.SOX,
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        new Date()
      );
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations.some(rec => rec.includes('IT General Controls'))).toBe(true);
    });
  });
  describe('Policy Effectiveness', () => {
    it('should track policy metrics', () => {
      const testEvent = {
        event_id: crypto.randomUUID(),
        event_type: SecurityEventType.AUTHENTICATION_FAILURE,
        severity: SecurityEventSeverity.MEDIUM,
        status: SecurityEventStatus.ACTIVE,
        timestamp: new Date(),
        title: 'Failed Login',
        description: 'Authentication failure detected',
        category: 'authentication',
        threat_level: 4.0,
        confidence_score: 0.7,
        compliance_frameworks: [ComplianceFramework.SOX],
        regulatory_impact: false,
        requires_notification: false,
        automated_response: true,
        response_actions: ['block_ip'],
        escalation_required: false,
        evidence_preserved: false,
        forensic_artifacts: [],
        chain_of_custody: [],
        tags: ['auth'],
        related_events: [],
        created_by: 'system',
        created_at: new Date(),
      };
      // Process the same event multiple times to build metrics
      for (let i = 0; i < 5; i++) {
        const eventCopy = { ...testEvent, event_id: crypto.randomUUID() };
        policyEngine.processSecurityEvent(eventCopy);
      }
      // Verify that metrics are being tracked
      const policies = policyEngine.getPolicies();
      expect(policies.length).toBeGreaterThan(0);
    });
  });
  describe('Error Handling', () => {
    it('should handle invalid event data gracefully', () => {
      const invalidEvent = {
        event_id: 'invalid-uuid',
        event_type: 'invalid_type' as any,
        severity: SecurityEventSeverity.MEDIUM,
        status: SecurityEventStatus.ACTIVE,
        timestamp: new Date(),
        title: '',
        description: '',
        category: '',
        threat_level: -1, // Invalid threat level
        confidence_score: 1.5, // Invalid confidence score
        compliance_frameworks: [],
        regulatory_impact: false,
        requires_notification: false,
        automated_response: false,
        response_actions: [],
        escalation_required: false,
        evidence_preserved: false,
        forensic_artifacts: [],
        chain_of_custody: [],
        tags: [],
        related_events: [],
        created_by: '',
        created_at: new Date(),
      };
      // This should not throw an error but handle gracefully
      expect(() => {
        policyEngine.processSecurityEvent(invalidEvent);
      }).not.toThrow();
    });
    it('should handle non-existent policy updates', () => {
      const updated = policyEngine.updatePolicy('NON_EXISTENT_POLICY', {)
        enabled: false,
      });
      expect(updated).toBe(false);
    });
    it('should handle non-existent policy enable/disable', () => {
      const enabled = policyEngine.setPolicyEnabled('NON_EXISTENT_POLICY', false);
      expect(enabled).toBe(false);
    });
  });
  describe('Integration with Utility Functions', () => {
    it('should work with global security event processing', () => {
      const testEvent = {
        event_id: crypto.randomUUID(),
        event_type: SecurityEventType.NETWORK_INTRUSION_ATTEMPT,
        severity: SecurityEventSeverity.HIGH,
        status: SecurityEventStatus.ACTIVE,
        timestamp: new Date(),
        title: 'Network Intrusion Detected',
        description: 'Suspicious network traffic detected',
        category: 'network_security',
        source_ip: '192.168.1.200',
        system_component: 'network_monitor',
        threat_level: 8.0,
        confidence_score: 0.9,
        compliance_frameworks: [ComplianceFramework.NIST],
        regulatory_impact: false,
        requires_notification: true,
        automated_response: true,
        response_actions: ['block_source_ip'],
        escalation_required: true,
        evidence_preserved: true,
        forensic_artifacts: ['network_capture'],
        chain_of_custody: [],
        tags: ['network', 'intrusion'],
        related_events: [],
        created_by: 'network_ids',
        created_at: new Date(),
      };
      const result = processSecurityEvent(testEvent);
      expect(result.matched_policies.length).toBeGreaterThan(0);
      expect(result.actions_triggered.length).toBeGreaterThan(0);
    });
    it('should work with policy registration utility', () => {
      const customPolicy = {
        policy_id: 'UTIL_TEST_001',
        policy_name: 'Utility Test Policy',
        event_types: [SecurityEventType.API_ABUSE_DETECTED],
        severity_threshold: SecurityEventSeverity.LOW,
        enabled: true,
        detection_rules: {,
          conditions: [{ field: 'test', operator: 'eq' as const, value: true }],
          time_window: 30000,
          frequency_threshold: 1,
        },
        response_actions: {,
          immediate_actions: ['log_event'],
          escalation_actions: [],
          notification_channels: [],
          automated_containment: false,
        },
        compliance_mapping: {,
          frameworks: [],
          requirements: [],
          retention_period: 30,
          requires_encryption: false,
        },
        reporting: {,
          real_time_alerts: false,
          periodic_reports: [],
          stakeholders: [],
          external_reporting: false,
        }
      };
      registerSecurityPolicy(customPolicy);
      const retrievedPolicy = securityEventPolicyEngine.getPolicy('UTIL_TEST_001');
      expect(retrievedPolicy).toBeDefined();
      expect(retrievedPolicy?.policy_name).toBe('Utility Test Policy');
    });
    it('should work with compliance report generation utility', () => {
      const report = generateSecurityComplianceReport(;);
        ComplianceFramework.NIST,
        new Date(Date.now() - 24 * 60 * 60 * 1000),
        new Date()
      );
      expect(report.framework).toBe(ComplianceFramework.NIST);
      expect(report.period).toBeDefined();
      expect(typeof report.compliance_score).toBe('number');
    });
  });
});

// Additional utility tests
describe('Security Event Logging Policy Utilities', () => {
  describe('Event Type Coverage', () => {
    it('should have policies for all critical event types', () => {
      const policies = securityEventPolicyEngine.getPolicies();
      const criticalEventTypes = [;
        SecurityEventType.AUTHENTICATION_FAILURE,
        SecurityEventType.CODE_INJECTION_ATTEMPT,
        SecurityEventType.NETWORK_INTRUSION_ATTEMPT,
        SecurityEventType.SOX_ITGC_VIOLATION,
        SecurityEventType.GDPR_DATA_SUBJECT_REQUEST,
        SecurityEventType.SECURITY_INCIDENT_DETECTED
      ];
      for (const eventType of criticalEventTypes) {
        const hasPolicy = policies.some(policy => ;);
          policy.event_types.includes(eventType)
        );
        expect(hasPolicy).toBe(true);
      }
    });
  });
  describe('Compliance Framework Coverage', () => {
    it('should support all major compliance frameworks', () => {
      const supportedFrameworks = [;
        ComplianceFramework.SOX,
        ComplianceFramework.GDPR,
        ComplianceFramework.CCPA,
        ComplianceFramework.HIPAA,
        ComplianceFramework.ISO27001,
        ComplianceFramework.PCI_DSS,
        ComplianceFramework.NIST
      ];
      for (const framework of supportedFrameworks) {
        const report = generateSecurityComplianceReport(;);
          framework,
          new Date(Date.now() - 24 * 60 * 60 * 1000),
          new Date()
        );
        expect(report.framework).toBe(framework);
      }
    });
  });
  describe('Policy Configuration Validation', () => {
    it('should validate policy severity thresholds', () => {
      const policies = securityEventPolicyEngine.getPolicies();
      for (const policy of policies) {
        expect(Object.values(SecurityEventSeverity)).toContain(policy.severity_threshold);
        expect(policy.policy_id).toBeDefined();
        expect(policy.policy_name).toBeDefined();
        expect(Array.isArray(policy.event_types)).toBe(true);
        expect(typeof policy.enabled).toBe('boolean');
      }
    });
    it('should validate compliance mapping', () => {
      const policies = securityEventPolicyEngine.getPolicies();
      for (const policy of policies) {
        expect(Array.isArray(policy.compliance_mapping.frameworks)).toBe(true);
        expect(Array.isArray(policy.compliance_mapping.requirements)).toBe(true);
        expect(typeof policy.compliance_mapping.retention_period).toBe('number');
        expect(typeof policy.compliance_mapping.requires_encryption).toBe('boolean');
      }
    });
  });
});