/**
 * Comprehensive Test Suite for Audit Management System
 * 
 * Tests all core functionality of the audit management tools including
 * event creation, querying, analytics, compliance reporting, and anomaly detection.
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  AuditManagementSystem,
  AuditEventType,
  AuditSeverity,
  ComplianceFramework,
  AuditStatus,
  createAuditEvent,
  queryAuditEvents,
  generateAuditAnalytics
} from '../AuditManagementSystem';
describe('AuditManagementSystem', () => {
  let auditSystem: AuditManagementSystem;
  beforeEach(() => {
  auditSystem = new AuditManagementSystem();
});
  describe('Event Creation', () => {
  it('should create a basic audit event', () => {
  const eventData = {
  event_type: AuditEventType.USER_ACTION,
  severity: AuditSeverity.MEDIUM,
  status: AuditStatus.ACTIVE,
  title: 'User Login Attempt',
  description: 'User attempted to log in to the system',
  category: 'authentication',
  system_component: 'auth-service',
  risk_score: 3.5,
  risk_factors: ['normal_activity'],
  compliance_frameworks: [ComplianceFramework.GDPR],
  regulatory_impact: false,
  sensitive_data_involved: false,
  tags: ['login', 'user'],
  alert_triggered: false,
  notification_sent: false,
  escalation_level: 2,
};
      const event = auditSystem.createAuditEvent(eventData);
      expect(event).toBeDefined();
      expect(event.id).toBeDefined();
      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.chain_hash).toBeDefined();
      expect(event.title).toBe('User Login Attempt');
      expect(event.event_type).toBe(AuditEventType.USER_ACTION);
      expect(event.severity).toBe(AuditSeverity.MEDIUM);
    });
    it('should create a high-risk security incident event', () => {
  const eventData = {
  event_type: AuditEventType.SECURITY_INCIDENT,
  severity: AuditSeverity.CRITICAL,
  status: AuditStatus.ACTIVE,
  title: 'Potential Data Breach Detected',
  description: 'Unusual data access patterns detected for multiple user accounts',
  category: 'security',
  subcategory: 'data_breach',
  user_id: 'system',
  ip_address: '192.168.1.100',
  system_component: 'data-access-service',
  risk_score: 9.2,
  risk_factors: ['unusual_access_pattern', 'multiple_accounts', 'large_data_volume'],
  compliance_frameworks: [ComplianceFramework.GDPR, ComplianceFramework.CCPA],
  regulatory_impact: true,
  sensitive_data_involved: true,
  data_types: ['personal_information', 'financial_data'],
  data_volume: 50000,
  tags: ['security', 'breach', 'critical'],
  alert_triggered: true,
  notification_sent: false,
  escalation_level: 5,
};
      const event = auditSystem.createAuditEvent(eventData);
      expect(event.severity).toBe(AuditSeverity.CRITICAL);
      expect(event.risk_score).toBe(9.2);
      expect(event.alert_triggered).toBe(true);
      expect(event.escalation_level).toBe(5);
      expect(event.compliance_frameworks).toContain(ComplianceFramework.GDPR);
      expect(event.compliance_frameworks).toContain(ComplianceFramework.CCPA);
    });
    it('should create compliance-related audit event', () => {
  const eventData = {
  event_type: AuditEventType.COMPLIANCE_CHECK,
  severity: AuditSeverity.HIGH,
  status: AuditStatus.ACTIVE,
  title: 'GDPR Data Subject Request',
  description: 'Data subject requested access to personal data under GDPR Article 15',
  category: 'compliance',
  subcategory: 'data_subject_rights',
  user_id: 'user-123',
  ip_address: '10.0.0.50',
  system_component: 'privacy-service',
  risk_score: 2.0,
  risk_factors: ['legitimate_request'],
  compliance_frameworks: [ComplianceFramework.GDPR],
  regulatory_impact: true,
  sensitive_data_involved: true,
  tags: ['gdpr', 'data_subject_request', 'article_15'],
  alert_triggered: false,
  notification_sent: false,
  escalation_level: 1,
};
      const event = auditSystem.createAuditEvent(eventData);
      expect(event.event_type).toBe(AuditEventType.COMPLIANCE_CHECK);
      expect(event.regulatory_impact).toBe(true);
      expect(event.compliance_frameworks).toContain(ComplianceFramework.GDPR);
    });
  });
  describe('Event Querying', () => {
  beforeEach(() => {
  // Create sample events for querying tests
  const sampleEvents = [;
  {
  event_type: AuditEventType.USER_ACTION,
  severity: AuditSeverity.LOW,
  status: AuditStatus.RESOLVED,
  title: 'User Login Success',
  description: 'User successfully logged in',
  category: 'authentication',
  user_id: 'user-1',
  system_component: 'auth-service',
  risk_score: 1.0,
  risk_factors: ['normal_activity'],
  compliance_frameworks: [ComplianceFramework.GDPR],
  regulatory_impact: false,
  sensitive_data_involved: false,
  tags: ['login', 'success'],
  alert_triggered: false,
  notification_sent: false,
  escalation_level: 1,
}
        {
  event_type: AuditEventType.SECURITY_INCIDENT,
  severity: AuditSeverity.CRITICAL,
  status: AuditStatus.INVESTIGATING,
  title: 'Multiple Failed Login Attempts',
  description: 'Multiple failed login attempts from same IP',
  category: 'security',
  ip_address: '192.168.1.200',
  system_component: 'auth-service',
  risk_score: 8.5,
  risk_factors: ['brute_force', 'multiple_failures'],
  compliance_frameworks: [ComplianceFramework.SOX],
  regulatory_impact: false,
  sensitive_data_involved: false,
  tags: ['security', 'brute_force'],
  alert_triggered: true,
  notification_sent: false,
  escalation_level: 4];
  sampleEvents.forEach(eventData => auditSystem.createAuditEvent(eventData));
});
    it('should query all events with default parameters', async () => {
  const result = await auditSystem.queryAuditEvents({)
  page: 1,
  limit: 50,
  sort_field: 'timestamp',
  sort_order: 'desc',
});
      expect(result.events).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.analytics).toBeDefined();
    });
    it('should filter events by severity', async () => {
  const result = await auditSystem.queryAuditEvents({)
  page: 1,
  limit: 50,
  severities: [AuditSeverity.CRITICAL],
  sort_field: 'timestamp',
  sort_order: 'desc',
});
      expect(result.events).toHaveLength(1);
      expect(result.events[0].severity).toBe(AuditSeverity.CRITICAL);
    });
    it('should filter events by event type', async () => {
  const result = await auditSystem.queryAuditEvents({)
  page: 1,
  limit: 50,
  event_types: [AuditEventType.USER_ACTION],
  sort_field: 'timestamp',
  sort_order: 'desc',
});
      expect(result.events).toHaveLength(1);
      expect(result.events[0].event_type).toBe(AuditEventType.USER_ACTION);
    });
    it('should filter events by risk score range', async () => {
  const result = await auditSystem.queryAuditEvents({)
  page: 1,
  limit: 50,
  min_risk_score: 5,
  max_risk_score: 10,
  sort_field: 'timestamp',
  sort_order: 'desc',
});
      expect(result.events).toHaveLength(1);
      expect(result.events[0].risk_score).toBeGreaterThanOrEqual(5);
    });
    it('should search events by text', async () => {
  const result = await auditSystem.queryAuditEvents({)
  page: 1,
  limit: 50,
  search_text: 'failed login',
  sort_field: 'timestamp',
  sort_order: 'desc',
});
      expect(result.events).toHaveLength(1);
      expect(result.events[0].title.toLowerCase()).toContain('failed');
    });
    it('should filter by compliance framework', async () => {
  const result = await auditSystem.queryAuditEvents({)
  page: 1,
  limit: 50,
  compliance_frameworks: [ComplianceFramework.GDPR],
  sort_field: 'timestamp',
  sort_order: 'desc',
});
      expect(result.events).toHaveLength(1);
      expect(result.events[0].compliance_frameworks).toContain(ComplianceFramework.GDPR);
    });
    it('should handle pagination correctly', async () => {
  const page1 = await auditSystem.queryAuditEvents({)
  page: 1,
  limit: 1,
  sort_field: 'timestamp',
  sort_order: 'desc',
});
      const page2 = await auditSystem.queryAuditEvents({)
  page: 2,
  limit: 1,
  sort_field: 'timestamp',
  sort_order: 'desc',
});
      expect(page1.events).toHaveLength(1);
      expect(page2.events).toHaveLength(1);
      expect(page1.events[0].id).not.toBe(page2.events[0].id);
      expect(page1.totalPages).toBe(2);
    });
  });
  describe('Analytics Generation', () => {
  beforeEach(() => {
  // Create sample events with various characteristics
  const sampleEvents = [;
  {
  event_type: AuditEventType.USER_ACTION,
  severity: AuditSeverity.LOW,
  status: AuditStatus.RESOLVED,
  title: 'User Login',
  description: 'User login event',
  category: 'authentication',
  user_id: 'user-1',
  system_component: 'auth-service',
  risk_score: 1.0,
  risk_factors: ['normal'],
  compliance_frameworks: [ComplianceFramework.GDPR],
  regulatory_impact: false,
  sensitive_data_involved: false,
  tags: ['login'],
  alert_triggered: false,
  notification_sent: false,
  escalation_level: 1,
}
        {
  event_type: AuditEventType.SECURITY_INCIDENT,
  severity: AuditSeverity.HIGH,
  status: AuditStatus.ACTIVE,
  title: 'Security Alert',
  description: 'Security incident detected',
  category: 'security',
  user_id: 'user-2',
  system_component: 'security-service',
  risk_score: 7.5,
  risk_factors: ['suspicious'],
  compliance_frameworks: [ComplianceFramework.SOX],
  regulatory_impact: true,
  sensitive_data_involved: true,
  tags: ['security'],
  alert_triggered: true,
  notification_sent: false,
  escalation_level: 3,
}
        {
  event_type: AuditEventType.DATA_ACCESS,
  severity: AuditSeverity.MEDIUM,
  status: AuditStatus.RESOLVED,
  title: 'Data Export',
  description: 'Large data export operation',
  category: 'data',
  user_id: 'user-1',
  system_component: 'data-service',
  risk_score: 4.0,
  risk_factors: ['large_volume'],
  compliance_frameworks: [ComplianceFramework.GDPR, ComplianceFramework.CCPA],
  regulatory_impact: false,
  sensitive_data_involved: true,
  tags: ['export'],
  alert_triggered: false,
  notification_sent: false,
  escalation_level: 2];
  sampleEvents.forEach(eventData => auditSystem.createAuditEvent(eventData));
});
    it('should generate basic analytics', () => {
  const analytics = auditSystem.generateAuditAnalytics({)
  timeframe: 'day',
  metrics: ['event_count', 'severity_distribution', 'risk_score_average'],
});
      expect(analytics.total_events).toBe(3);
      expect(analytics.metrics.severity_distribution).toBeDefined();
      expect(analytics.metrics.risk_score_average).toBeDefined();
      expect(analytics.metrics.risk_score_average.average).toBeGreaterThan(0);
    });
    it('should generate unique users metrics', () => {
  const analytics = auditSystem.generateAuditAnalytics({)
  timeframe: 'day',
  metrics: ['unique_users'],
});
      expect(analytics.metrics.unique_users.total).toBe(2); // user-1 and user-2
      expect(analytics.metrics.unique_users.active_users).toContain('user-1');
      expect(analytics.metrics.unique_users.active_users).toContain('user-2');
    });
    it('should generate compliance violations report', () => {
  const analytics = auditSystem.generateAuditAnalytics({)
  timeframe: 'day',
  metrics: ['compliance_violations'],
});
      expect(analytics.metrics.compliance_violations).toBeDefined();
      expect(Array.isArray(analytics.metrics.compliance_violations)).toBe(true);
    });
    it('should generate system component activity metrics', () => {
  const analytics = auditSystem.generateAuditAnalytics({)
  timeframe: 'day',
  metrics: ['system_component_activity'],
});
      expect(analytics.metrics.system_component_activity).toBeDefined();
      expect(analytics.metrics.system_component_activity['auth-service']).toBe(1);
      expect(analytics.metrics.system_component_activity['security-service']).toBe(1);
      expect(analytics.metrics.system_component_activity['data-service']).toBe(1);
    });
  });
  describe('Compliance Reporting', () => {
  beforeEach(() => {
  // Create GDPR-related events
  const gdprEvents = [;
  {
  event_type: AuditEventType.COMPLIANCE_CHECK,
  severity: AuditSeverity.MEDIUM,
  status: AuditStatus.RESOLVED,
  title: 'Data Subject Request',
  description: 'GDPR Article 15 data access request',
  category: 'compliance',
  system_component: 'privacy-service',
  risk_score: 2.0,
  risk_factors: ['data_access_request'],
  compliance_frameworks: [ComplianceFramework.GDPR],
  regulatory_impact: true,
  sensitive_data_involved: true,
  tags: ['gdpr', 'article_15'],
  alert_triggered: false,
  notification_sent: false,
  escalation_level: 1,
}
        {
  event_type: AuditEventType.SECURITY_INCIDENT,
  severity: AuditSeverity.CRITICAL,
  status: AuditStatus.INVESTIGATING,
  title: 'Potential GDPR Breach',
  description: 'Unauthorized access to personal data',
  category: 'security',
  system_component: 'data-service',
  risk_score: 9.0,
  risk_factors: ['unauthorized_access', 'personal_data'],
  compliance_frameworks: [ComplianceFramework.GDPR],
  regulatory_impact: true,
  sensitive_data_involved: true,
  tags: ['gdpr', 'breach'],
  alert_triggered: true,
  notification_sent: false,
  escalation_level: 5];
  gdprEvents.forEach(eventData => auditSystem.createAuditEvent(eventData));
});
    it('should generate GDPR compliance report', () => {
  const report = auditSystem.generateComplianceReport(;);
  ComplianceFramework.GDPR,
  {
  start: new Date(Date.now() - 24 * 60 * 60 * 1000),
  end: new Date());
  expect(report.framework).toBe(ComplianceFramework.GDPR);
  expect(report.summary.total_events).toBe(2);
  expect(report.summary.critical_events).toBe(1);
  expect(report.risk_analysis).toBeDefined();
  expect(report.compliance_specific).toBeDefined();
  expect(report.recommendations).toBeDefined();
  expect(Array.isArray(report.recommendations)).toBe(true);
});
    it('should generate SOX compliance report', () => {
  // Create SOX-related event
  auditSystem.createAuditEvent({)
  event_type: AuditEventType.CONFIGURATION_CHANGE,
  severity: AuditSeverity.HIGH,
  status: AuditStatus.ACTIVE,
  title: 'Financial System Configuration Change',
  description: 'Critical configuration change in financial reporting system',
  category: 'financial',
  system_component: 'financial-service',
  risk_score: 6.5,
  risk_factors: ['configuration_change', 'financial_system'],
  compliance_frameworks: [ComplianceFramework.SOX],
  regulatory_impact: true,
  sensitive_data_involved: false,
  tags: ['sox', 'configuration'],
  alert_triggered: true,
  notification_sent: false,
  escalation_level: 3,
});
      const report = auditSystem.generateComplianceReport(;);
        ComplianceFramework.SOX,
        {
  start: new Date(Date.now() - 24 * 60 * 60 * 1000),
  end: new Date());
  expect(report.framework).toBe(ComplianceFramework.SOX);
  expect(report.summary.total_events).toBe(1);
  expect(report.compliance_specific.change_management_events).toBe(1);
});
  });
  describe('Anomaly Detection', () => {
    beforeEach(() => {
      // Create events that should trigger anomaly detection
      // Create multiple failed login events (should trigger brute force detection)
      for (let i = 0; i < 12; i++) {
        auditSystem.createAuditEvent({)
  event_type: AuditEventType.AUTHENTICATION,
          severity: AuditSeverity.MEDIUM,
          status: AuditStatus.ACTIVE,
          title: `Failed Login Attempt ${i + 1}`}
},
  description: 'User failed to authenticate',
          category: 'authentication',
          system_component: 'auth-service',
          risk_score: 4.0,
          risk_factors: ['failed_authentication'],
          compliance_frameworks: [ComplianceFramework.SOX],
          regulatory_impact: false,
          sensitive_data_involved: false,
          tags: ['authentication', 'failure'],
          metadata: { success: false },
          alert_triggered: false,
          notification_sent: false,
          escalation_level: 2;
  });
      // Create high-volume data access events
      for (let i = 0; i < 6; i++) {
        auditSystem.createAuditEvent({)
  event_type: AuditEventType.DATA_ACCESS,
          severity: AuditSeverity.MEDIUM,
          status: AuditStatus.ACTIVE,
          title: `High Volume Data Access ${i + 1}`}
},
  description: 'Large volume data access detected',
          category: 'data_access',
          system_component: 'data-service',
          risk_score: 5.0,
          risk_factors: ['high_volume'],
          compliance_frameworks: [ComplianceFramework.GDPR],
          regulatory_impact: false,
          sensitive_data_involved: true,
          data_volume: 1500,
          tags: ['data_access', 'high_volume'],
          alert_triggered: false,
          notification_sent: false,
          escalation_level: 2;
  });
      // Create privilege escalation events
      for (let i = 0; i < 4; i++) {
        auditSystem.createAuditEvent({)
  event_type: AuditEventType.AUTHORIZATION,
          severity: AuditSeverity.HIGH,
          status: AuditStatus.ACTIVE,
          title: `Privilege Escalation Attempt ${i + 1}`}
},
  description: 'Potential privilege escalation detected',
          category: 'authorization',
          system_component: 'auth-service',
          risk_score: 7.5,
          risk_factors: ['privilege_escalation', 'unauthorized_access'],
          compliance_frameworks: [ComplianceFramework.SOX],
          regulatory_impact: true,
          sensitive_data_involved: false,
          tags: ['privilege', 'escalation'],
          alert_triggered: false,
          notification_sent: false,
          escalation_level: 4;
  });
    });
    it('should detect suspicious login activity', () => {
      const patterns = auditSystem.detectAnomalousPatterns(3600000); // 1 hour;
      const loginPattern = patterns.find(p => p.type === 'suspicious_login_activity');
      expect(loginPattern).toBeDefined();
      expect(loginPattern?.severity).toBe('high');
      expect(loginPattern?.events.length).toBe(12);
    });
    it('should detect unusual data access volume', () => {
      const patterns = auditSystem.detectAnomalousPatterns(3600000); // 1 hour;
      const dataAccessPattern = patterns.find(p => p.type === 'unusual_data_access_volume');
      expect(dataAccessPattern).toBeDefined();
      expect(dataAccessPattern?.severity).toBe('medium');
      expect(dataAccessPattern?.events.length).toBe(6);
    });
    it('should detect potential privilege escalation', () => {
      const patterns = auditSystem.detectAnomalousPatterns(3600000); // 1 hour;
      const privilegePattern = patterns.find(p => p.type === 'potential_privilege_escalation');
      expect(privilegePattern).toBeDefined();
      expect(privilegePattern?.severity).toBe('critical');
      expect(privilegePattern?.events.length).toBe(4);
    });
    it('should return empty array when no patterns detected', () => {
      const cleanSystem = new AuditManagementSystem();
      const patterns = cleanSystem.detectAnomalousPatterns(3600000);
      expect(patterns).toHaveLength(0);
    });
  });
  describe('Audit Retention Management', () => {
    beforeEach(() => {
      // Mock the current date to control time-based tests
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-07-22'));
    });
    afterEach(() => {
      jest.useRealTimers();
    });
    it('should manage retention policies correctly', () => {
  // Create events with different ages
  const oldEvent = auditSystem.createAuditEvent({)
  event_type: AuditEventType.USER_ACTION,
  severity: AuditSeverity.LOW,
  status: AuditStatus.RESOLVED,
  title: 'Old Event',
  description: 'This is an old event',
  category: 'test',
  system_component: 'test-service',
  risk_score: 1.0,
  risk_factors: ['test'],
  compliance_frameworks: [ComplianceFramework.GDPR],
  regulatory_impact: false,
  sensitive_data_involved: false,
  tags: ['test'],
  alert_triggered: false,
  notification_sent: false,
  escalation_level: 1,
});
      // Simulate event being old by manipulating its timestamp
      oldEvent.timestamp = new Date('2024-01-01'); // Very old event
      const policies = {
  defaultRetentionDays: 365,
  complianceRetentionDays: {,
  [ComplianceFramework.GDPR]: 2555 // 7 years for GDPR,
},
  archivalStorage: 's3://audit-archive',
        legalHoldOverride: false;
  };
      // This would normally call a method that processes retention
      expect(() => auditSystem.manageAuditRetention(policies)).not.toThrow();
    });
  });
  describe('Error Handling', () => {
  it('should handle invalid event data gracefully', () => {
  expect(() => {
  auditSystem.createAuditEvent({)
  // Missing required fields
  event_type: undefined as any,
  severity: AuditSeverity.LOW,
  status: AuditStatus.ACTIVE,
  title: '',
  description: '',
  category: '',
  system_component: '',
  risk_score: -1, // Invalid risk score,
  risk_factors: [],
  compliance_frameworks: [],
  regulatory_impact: false,
  sensitive_data_involved: false,
  tags: [],
  alert_triggered: false,
  notification_sent: false,
  escalation_level: 0,
});
      }).toThrow();
    });
    it('should handle query with invalid parameters', async () => {
  const result = await auditSystem.queryAuditEvents({)
  page: -1, // Invalid page number,
  limit: 0, // Invalid limit,
  sort_field: 'invalid_field',
  sort_order: 'desc',
});
      // The system should handle this gracefully and return empty results
      expect(result.events).toBeDefined();
      expect(Array.isArray(result.events)).toBe(true);
    });
  });
  describe('Integration Tests', () => {
  it('should integrate with global audit management instance', () => {
  const event = createAuditEvent({)
  event_type: AuditEventType.SYSTEM_EVENT,
  severity: AuditSeverity.LOW,
  status: AuditStatus.ACTIVE,
  title: 'System Test Event',
  description: 'Test event for global instance',
  category: 'test',
  system_component: 'test-service',
  risk_score: 1.0,
  risk_factors: ['test'],
  compliance_frameworks: [ComplianceFramework.ISO27001],
  regulatory_impact: false,
  sensitive_data_involved: false,
  tags: ['integration_test'],
  alert_triggered: false,
  notification_sent: false,
  escalation_level: 1,
});
      expect(event).toBeDefined();
      expect(event.title).toBe('System Test Event');
    });
    it('should work with query utility function', async () => {
  // Create an event first
  createAuditEvent({)
  event_type: AuditEventType.USER_ACTION,
  severity: AuditSeverity.MEDIUM,
  status: AuditStatus.ACTIVE,
  title: 'Query Test Event',
  description: 'Test event for query utility',
  category: 'test',
  system_component: 'test-service',
  risk_score: 3.0,
  risk_factors: ['test'],
  compliance_frameworks: [ComplianceFramework.GDPR],
  regulatory_impact: false,
  sensitive_data_involved: false,
  tags: ['query_test'],
  alert_triggered: false,
  notification_sent: false,
  escalation_level: 2,
});
      const result = await queryAuditEvents({)
  page: 1,
  limit: 50,
  search_text: 'Query Test',
  sort_field: 'timestamp',
  sort_order: 'desc',
});
      expect(result.events.length).toBeGreaterThan(0);
      expect(result.events[0].title).toBe('Query Test Event');
    });
    it('should work with analytics utility function', () => {
  // Create some events for analytics
  createAuditEvent({)
  event_type: AuditEventType.DATA_ACCESS,
  severity: AuditSeverity.HIGH,
  status: AuditStatus.ACTIVE,
  title: 'Analytics Test Event',
  description: 'Test event for analytics utility',
  category: 'test',
  system_component: 'test-service',
  risk_score: 6.5,
  risk_factors: ['test', 'analytics'],
  compliance_frameworks: [ComplianceFramework.CCPA],
  regulatory_impact: true,
  sensitive_data_involved: true,
  tags: ['analytics_test'],
  alert_triggered: false,
  notification_sent: false,
  escalation_level: 3,
});
      const analytics = generateAuditAnalytics({)
  timeframe: 'day',
  metrics: ['event_count', 'severity_distribution', 'risk_score_average'],
});
      expect(analytics).toBeDefined();
      expect(analytics.total_events).toBeGreaterThan(0);
      expect(analytics.metrics).toBeDefined();
    });
  });
});

// Additional utility tests
describe('Audit Management Utilities', () => {
  describe('createAuditEvent', () => {
  it('should create audit event using utility function', () => {
  const event = createAuditEvent({)
  event_type: AuditEventType.CONFIGURATION_CHANGE,
  severity: AuditSeverity.MEDIUM,
  status: AuditStatus.ACTIVE,
  title: 'Config Change',
  description: 'System configuration updated',
  category: 'configuration',
  system_component: 'config-service',
  risk_score: 4.0,
  risk_factors: ['configuration_change'],
  compliance_frameworks: [ComplianceFramework.SOX],
  regulatory_impact: false,
  sensitive_data_involved: false,
  tags: ['config'],
  alert_triggered: false,
  notification_sent: false,
  escalation_level: 2,
});
      expect(event).toBeDefined();
      expect(event.event_type).toBe(AuditEventType.CONFIGURATION_CHANGE);
    });
  });
  describe('queryAuditEvents', () => {
  it('should query events using utility function', async () => {
  const result = await queryAuditEvents({)
  page: 1,
  limit: 10,
  sort_field: 'timestamp',
  sort_order: 'desc',
});
      expect(result).toBeDefined();
      expect(result.events).toBeDefined();
      expect(Array.isArray(result.events)).toBe(true);
    });
  });
  describe('generateAuditAnalytics', () => {
  it('should generate analytics using utility function', () => {
  const analytics = generateAuditAnalytics({)
  timeframe: 'week',
  metrics: ['event_count'],
});
      expect(analytics).toBeDefined();
      expect(analytics.timeframe).toBe('week');
    });
  });
});